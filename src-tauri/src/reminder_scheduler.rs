use chrono::{Datelike, Local, NaiveTime};
use ring::{aead, pbkdf2};
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Pool, Sqlite,
};
use std::{collections::HashMap, num::NonZeroU32, path::PathBuf, str::FromStr, sync::Arc};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::{
    sync::{mpsc, Mutex},
    time::{interval, Duration, MissedTickBehavior},
};

use crate::screen_time_tracker::ScreenTimeTracker;

/// Update sent from the scheduler to the tray menu loop.
#[derive(Debug, Clone)]
pub struct TrayUpdate {
    /// Seconds remaining until the next break.
    pub remaining_secs: u64,
    /// Whether the user is currently on a break.
    pub is_on_break: bool,
}

/// How often the scheduler tick loop runs, in seconds.
const SCHEDULER_TICK_SECS: u64 = 1;
/// How often settings are re-read from the database, in seconds.
const CONFIG_REFRESH_SECS: u64 = 30;
/// Seconds before a break when a pre-alert notification is shown.
const BEFORE_ALERT_SECONDS: u64 = 15;
/// Default interval between breaks, in minutes.
const DEFAULT_INTERVAL_MINS: u64 = 20;
/// Default break duration, in seconds.
const DEFAULT_DURATION_SECS: u64 = 20;
/// Default reminder message shown on the overlay screen.
const DEFAULT_REMINDER_TEXT: &str = "Pause! Look into the distance, and best if you walk a bit.";
/// Default background style for the reminder overlay.
const DEFAULT_BACKGROUND_STYLE: &str = "default";

/// Configuration passed to the reminder overlay webview as query params.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReminderWindowConfig {
    /// Background style (theme) for the overlay.
    pub background_style: String,
    /// Reminder message text displayed on screen.
    pub reminder_text: String,
    /// Whether the user has premium access.
    pub is_premium: bool,
    /// Whether strict mode is enabled (blocks skipping).
    pub is_strict_mode: bool,
    /// Whether to use circle progress timer instead of bar.
    pub use_circle_timer: bool,
    /// Break duration in seconds.
    pub duration_secs: u64,
    /// Today's total screen time, hours part.
    pub screen_time_hours: i64,
    /// Today's total screen time, minutes part.
    pub screen_time_minutes: i64,
    /// Whether an app update is available.
    pub is_update_available: bool,
}

/// All scheduler settings loaded from the database at runtime.
#[derive(Debug, Clone)]
struct ReminderSettings {
    /// Interval between breaks in seconds.
    interval_secs: u64,
    /// Duration of each break in seconds.
    duration_secs: u64,
    /// Background theme style for the overlay.
    background_style: String,
    /// Reminder message text displayed on screen.
    reminder_text: String,
    /// Whether to spawn reminder windows on all monitors (premium only).
    is_multi_monitor_enabled: bool,
    /// Whether strict mode is enabled (blocks skipping).
    is_strict_mode: bool,
    /// Whether to use circle progress timer instead of bar.
    use_circle_timer: bool,
    /// Whether an app update is available.
    is_update_available: bool,
    /// Whether workday-based scheduling is enabled (premium only).
    is_workday_enabled: bool,
    /// Workday hours configuration per weekday.
    workday: WorkdayConfig,
    /// Whether the user has premium access.
    is_premium: bool,
}

impl Default for ReminderSettings {
    fn default() -> Self {
        Self {
            interval_secs: DEFAULT_INTERVAL_MINS * 60,
            duration_secs: DEFAULT_DURATION_SECS,
            background_style: DEFAULT_BACKGROUND_STYLE.to_string(),
            reminder_text: DEFAULT_REMINDER_TEXT.to_string(),
            is_multi_monitor_enabled: false,
            is_strict_mode: false,
            use_circle_timer: true,
            is_update_available: false,
            is_workday_enabled: false,
            workday: default_workday_config(),
            is_premium: false,
        }
    }
}

/// Mutable state tracked by the reminder scheduler.
#[derive(Debug, Clone)]
struct SchedulerState {
    /// Seconds elapsed since the last break ended.
    seconds_since_last_break: u64,
    /// Whether the user is currently on a break.
    is_on_break: bool,
    /// Active settings snapshot.
    settings: ReminderSettings,
}

impl Default for SchedulerState {
    fn default() -> Self {
        Self {
            seconds_since_last_break: 0,
            is_on_break: false,
            settings: ReminderSettings::default(),
        }
    }
}

/// Workday start and end times for a single day.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct WorkdayHours {
    /// Start time in "HH:MM" format.
    start: String,
    /// End time in "HH:MM" format.
    end: String,
}

/// Workday hours mapped by day name (e.g. "Monday"). `None` means no work on that day.
type WorkdayConfig = HashMap<String, Option<WorkdayHours>>;

/// Core scheduler that manages the reminder timer loop, break lifecycle, and tray updates.
#[derive(Debug)]
pub struct ReminderScheduler {
    /// App data directory for database and config file paths.
    app_data_dir: PathBuf,
    /// Shared mutable scheduler state.
    state: Arc<Mutex<SchedulerState>>,
    /// Channel sender for pushing tray countdown updates.
    tray_tx: mpsc::Sender<TrayUpdate>,
    /// Last tray update sent, used for deduplication.
    last_tray_update: Arc<Mutex<TrayUpdate>>,
    /// Snoozes used since this app session started.
    session_snooze_count: Arc<Mutex<u32>>,
}

impl ReminderScheduler {
    /// Creates a new ReminderScheduler wrapped in `Arc` with default state and tray channel.
    pub fn new(app_data_dir: PathBuf, tray_tx: mpsc::Sender<TrayUpdate>) -> Arc<Self> {
        Arc::new(Self {
            app_data_dir,
            state: Arc::new(Mutex::new(SchedulerState::default())),
            tray_tx,
            last_tray_update: Arc::new(Mutex::new(TrayUpdate {
                remaining_secs: 0,
                is_on_break: false,
            })),
            session_snooze_count: Arc::new(Mutex::new(0)),
        })
    }

    /// Snoozes used in the current app session.
    pub async fn session_snooze_count(&self) -> u32 {
        *self.session_snooze_count.lock().await
    }

    /// Increments the in-memory session snooze counter.
    pub async fn increment_session_snooze_count(&self) {
        let mut count = self.session_snooze_count.lock().await;
        *count += 1;
    }

    /// Spawns the scheduler's tick loop as an async task. Loads initial settings then ticks every `SCHEDULER_TICK_SECS`.
    pub fn start(self: Arc<Self>, app_handle: AppHandle) {
        tauri::async_runtime::spawn(async move {
            if let Err(error) = self.refresh_settings().await {
                eprintln!("[ReminderScheduler] Initial settings load failed: {error}");
            }

            let mut ticker = interval(Duration::from_secs(SCHEDULER_TICK_SECS));
            ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);

            loop {
                ticker.tick().await;

                if let Err(error) = self.tick(&app_handle).await {
                    eprintln!("[ReminderScheduler] Tick failed: {error}");
                }
            }
        });
    }

    /// Reloads settings from the database and replaces the current settings snapshot.
    pub async fn refresh_settings(&self) -> Result<(), String> {
        let settings = self.load_settings().await?;
        let mut state = self.state.lock().await;
        state.settings = settings;
        Ok(())
    }

    /// Closes all reminder windows, resets break state, and sends tray update with remaining interval.
    pub async fn finish_break(&self, app_handle: &AppHandle) {
        close_all_reminder_windows(app_handle);

        let interval = {
            let mut state = self.state.lock().await;
            state.seconds_since_last_break = 0;
            state.is_on_break = false;
            state.settings.interval_secs
        };

        self.send_tray_update(TrayUpdate {
            remaining_secs: interval,
            is_on_break: false,
        }).await;
    }

    /// Force-refreshes settings and immediately starts a break (used for debug/testing).
    pub async fn show_now(&self, app_handle: &AppHandle) -> Result<(), String> {
        self.refresh_settings().await?;

        // Mark the break as active so the tick loop doesn't keep counting
        // down and re-spawn the reminder windows mid-break.
        {
            let mut state = self.state.lock().await;
            state.is_on_break = true;
        }

        if let Err(error) = self.start_break(app_handle).await {
            // Roll back so the scheduler doesn't get stuck on a break
            // that never showed any window.
            let mut state = self.state.lock().await;
            state.is_on_break = false;
            return Err(error);
        }

        Ok(())
    }

    /// Send a tray update only if the state actually changed.
    async fn send_tray_update(&self, update: TrayUpdate) {
        let mut last = self.last_tray_update.lock().await;
        if update.is_on_break != last.is_on_break
            || update.remaining_secs / 30 != last.remaining_secs / 30
        {
            *last = update.clone();
            let _ = self.tray_tx.try_send(update);
        }
    }

    /// Runs one tick: refreshes settings periodically, advances the counter, sends tray updates, and triggers breaks or alerts.
    async fn tick(&self, app_handle: &AppHandle) -> Result<(), String> {
        if !ScreenTimeTracker::is_screen_on() {
            return Ok(());
        }

        let should_refresh = {
            let state = self.state.lock().await;
            !state.is_on_break && state.seconds_since_last_break % CONFIG_REFRESH_SECS == 0
        };

        if should_refresh {
            self.refresh_settings().await?;
        }

        // Decide the action for this tick. The state lock is released before
        // any window spawning or tray I/O happens.
        let action = {
            let mut state = self.state.lock().await;

            if state.is_on_break {
                // Safety net: if the reminder windows are gone but the break
                // was never finished (e.g. overlay crashed), reset the state
                // so the scheduler doesn't stay stuck on "Break in progress".
                let windows_open = app_handle
                    .webview_windows()
                    .keys()
                    .any(|label| label.starts_with("reminder_monitor_"));
                if !windows_open {
                    let interval = state.settings.interval_secs;
                    state.seconds_since_last_break = 0;
                    state.is_on_break = false;
                    drop(state);
                    self.send_tray_update(TrayUpdate {
                        remaining_secs: interval,
                        is_on_break: false,
                    })
                    .await;
                } else {
                    drop(state);
                    self.send_tray_update(TrayUpdate {
                        remaining_secs: 0,
                        is_on_break: true,
                    })
                    .await;
                }
                return Ok(());
            }

            if !is_inside_workday_window(&state.settings) {
                return Ok(());
            }

            state.seconds_since_last_break = state.seconds_since_last_break.saturating_add(1);

            let frequency = state.settings.interval_secs.max(SCHEDULER_TICK_SECS);
            let remaining = frequency.saturating_sub(state.seconds_since_last_break);

            let should_show_alert = frequency > BEFORE_ALERT_SECONDS
                && state.seconds_since_last_break == frequency - BEFORE_ALERT_SECONDS;
            let should_start_break = state.seconds_since_last_break >= frequency;

            let action = if should_start_break {
                state.is_on_break = true;
                ReminderAction::StartBreak
            } else if should_show_alert {
                ReminderAction::ShowBeforeAlert
            } else {
                ReminderAction::None
            };

            drop(state);

            self.send_tray_update(TrayUpdate {
                remaining_secs: remaining,
                is_on_break: false,
            })
            .await;

            action
        };

        match action {
            ReminderAction::None => Ok(()),
            ReminderAction::ShowBeforeAlert => {
                spawn_before_alert(app_handle);
                Ok(())
            }
            ReminderAction::StartBreak => self.start_break(app_handle).await,
        }
    }

    /// Closes any pre-alert, builds window config with current state and screen time, then spawns reminder overlay windows.
    async fn start_break(&self, app_handle: &AppHandle) -> Result<(), String> {
        close_before_alert(app_handle);
        close_all_reminder_windows(app_handle);

        let (settings, screen_time_hours, screen_time_minutes) = {
            let state = self.state.lock().await;
            let settings = state.settings.clone();
            drop(state);

            let (hours, minutes) = self.today_screen_time().await.unwrap_or((0, 0));
            (settings, hours, minutes)
        };

        let config = ReminderWindowConfig {
            background_style: if settings.is_premium {
                settings.background_style
            } else {
                DEFAULT_BACKGROUND_STYLE.to_string()
            },
            reminder_text: settings.reminder_text,
            is_premium: settings.is_premium,
            is_strict_mode: settings.is_strict_mode,
            use_circle_timer: settings.use_circle_timer,
            duration_secs: settings.duration_secs.max(1),
            screen_time_hours,
            screen_time_minutes,
            is_update_available: settings.is_update_available,
        };

        spawn_reminder_windows(
            app_handle,
            &config,
            settings.is_multi_monitor_enabled && settings.is_premium,
        )
    }

    /// Reads all configuration from `appconfig.db` and theme JSON into a `ReminderSettings` struct.
    async fn load_settings(&self) -> Result<ReminderSettings, String> {
        let mut settings = ReminderSettings::default();

        let app_pool = self.open_sqlite_pool("appconfig.db", true).await?;
        ensure_app_config_defaults(&app_pool).await?;

        // Read interval, duration, text from appconfig.db
        if let Some(val) = read_config_string(&app_pool, "blinkEyeReminderInterval").await {
            if let Ok(interval) = val.parse::<u64>() {
                settings.interval_secs = interval.max(1) * 60;
            }
        }

        if let Some(val) = read_config_string(&app_pool, "blinkEyeReminderDuration").await {
            if let Ok(duration) = val.parse::<u64>() {
                settings.duration_secs = duration.max(1);
            }
        }

        if let Some(text) = read_config_string(&app_pool, "blinkEyeReminderScreenText").await {
            if !text.trim().is_empty() {
                settings.reminder_text = text;
            }
        }

        // Background style from appconfig.db
        if let Some(style) = read_config_string(&app_pool, "reminderBackgroundStyle").await {
            if !style.trim().is_empty() {
                settings.background_style = style;
            }
        }

        settings.is_multi_monitor_enabled =
            read_config_bool(&app_pool, "isMultiMonitorEnabled", false).await;
        settings.is_strict_mode = read_config_bool(&app_pool, "usingStrictMode", false).await;
        settings.use_circle_timer =
            read_config_bool(&app_pool, "useCircleProgressTimerStyle", true).await;
        settings.is_update_available =
            read_config_bool(&app_pool, "isUpdateAvailable", false).await;
        settings.is_workday_enabled = read_config_bool(&app_pool, "isWorkdayEnabled", false).await;

        if let Some(workday) = read_config_json::<WorkdayConfig>(&app_pool, "blinkEyeWorkday").await
        {
            settings.workday = workday;
        }

        settings.is_premium = self.has_premium_access().await;

        Ok(settings)
    }

    /// Queries `UserScreenTime.db` for today's total screen time, returning `(hours, minutes)`.
    async fn today_screen_time(&self) -> Result<(i64, i64), String> {
        let pool = self.open_sqlite_pool("UserScreenTime.db", true).await?;
        let today = Local::now().format("%Y-%m-%d").to_string();
        let rows = sqlx::query_as::<_, (i64, i64)>(
            "SELECT first_timestamp, second_timestamp FROM time_data WHERE date = ?",
        )
        .bind(today)
        .fetch_all(&pool)
        .await
        .unwrap_or_default();

        let total_ms = rows
            .into_iter()
            .filter_map(|(start, end)| (end >= start).then_some(end - start))
            .sum::<i64>();
        let total_minutes = total_ms / 1000 / 60;

        Ok((total_minutes / 60, total_minutes % 60))
    }

    /// Returns true if the user has either a paid license or an active trial.
    async fn has_premium_access(&self) -> bool {
        self.is_paid_user().await || self.is_trial_active().await
    }

    /// Checks `blink_eye_license.db` for a valid active license.
    async fn is_paid_user(&self) -> bool {
        let Ok(pool) = self.open_sqlite_pool("blink_eye_license.db", true).await else {
            return false;
        };

        if ensure_license_table(&pool).await.is_err() {
            return false;
        }

        let Ok(Some((encrypted_status,))) =
            sqlx::query_as::<_, (String,)>("SELECT status FROM licenses LIMIT 1")
                .fetch_optional(&pool)
                .await
        else {
            return false;
        };

        self.decrypt_app_data(&encrypted_status)
            .await
            .is_some_and(|status| status == "active")
    }

    /// Checks if a 7-day trial is still active based on the install date stored in `basicapplicationdata.db`.
    async fn is_trial_active(&self) -> bool {
        let Ok(pool) = self.open_sqlite_pool("basicapplicationdata.db", false).await else {
            return false;
        };

        let Ok(Some((encrypted_date,))) =
            sqlx::query_as::<_, (String,)>("SELECT data FROM user_data WHERE id = 1")
                .fetch_optional(&pool)
                .await
        else {
            return false;
        };

        let Some(installed_date) = self.decrypt_app_data(&encrypted_date).await else {
            return false;
        };

        let Ok(installed_date) = chrono::NaiveDate::parse_from_str(&installed_date, "%Y-%m-%d")
        else {
            return false;
        };

        let today = Local::now().date_naive();
        today >= installed_date && (today - installed_date).num_days() < 7
    }

    /// Decrypts WebCrypto AES-GCM encrypted text using the app's encryption password.
    async fn decrypt_app_data(&self, encrypted_text: &str) -> Option<String> {
        let password = self.encryption_password().await?;
        decrypt_webcrypto_aes_gcm(encrypted_text, &password)
    }

    /// Retrieves the encryption password (`unique_nano_id`) from `basicapplicationdata.db`.
    async fn encryption_password(&self) -> Option<String> {
        let pool = self.open_sqlite_pool("basicapplicationdata.db", false).await.ok()?;
        let (password,) =
            sqlx::query_as::<_, (String,)>("SELECT unique_nano_id FROM user_data WHERE id = 1")
                .fetch_optional(&pool)
                .await
                .ok()??;

        Some(password)
    }

    /// Opens a SQLite connection pool for a database file in the app data directory.
    ///
    /// # Parameters
    /// - `file_name` — Database file name (e.g. "appconfig.db").
    /// - `create_if_missing` — Whether to create the file if it doesn't exist.
    async fn open_sqlite_pool(
        &self,
        file_name: &str,
        create_if_missing: bool,
    ) -> Result<Pool<Sqlite>, String> {
        let db_path = self.app_data_dir.join(file_name);
        let connection_url = format!("sqlite://{}", db_path.display());
        let options = SqliteConnectOptions::from_str(&connection_url)
            .map_err(|error| error.to_string())?
            .create_if_missing(create_if_missing);

        SqlitePoolOptions::new()
            .max_connections(2)
            .connect_with(options)
            .await
            .map_err(|error| error.to_string())
    }
}

/// Action determined by the tick logic: do nothing, show pre-alert, or start a break.
enum ReminderAction {
    /// No action needed this tick.
    None,
    /// Show the "break soon" notification overlay.
    ShowBeforeAlert,
    /// Start the break: spawn fullscreen reminder windows.
    StartBreak,
}

/// Closes all open reminder windows (labels starting with "reminder_monitor_").
pub fn close_all_reminder_windows(app_handle: &AppHandle) {
    for (label, window) in app_handle.webview_windows() {
        if label.starts_with("reminder_monitor_") {
            let _ = window.close();
        }
    }
}

/// Closes the "before_alert" pre-break notification window if open.
fn close_before_alert(app_handle: &AppHandle) {
    if let Some(window) = app_handle.get_webview_window("before_alert") {
        let _ = window.close();
    }
}

/// Spawns the "break soon" pre-alert window centered on the primary monitor.
///
/// Monitor geometry is in physical pixels; window position expects logical
/// points, so values are divided by the scale factor. The window is
/// transparent so only the rounded pill card from `alert.html` is visible.
fn spawn_before_alert(app_handle: &AppHandle) {
    close_before_alert(app_handle);

    let (x, y) = app_handle
        .primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| {
            let scale = monitor.scale_factor();
            let position = monitor.position();
            let size = monitor.size();
            (
                position.x as f64 / scale
                    + ((size.width as f64 / scale - 320.0) / 2.0).max(0.0),
                position.y as f64 / scale + 80.0,
            )
        })
        .unwrap_or((0.0, 0.0));

    let result = WebviewWindowBuilder::new(
        app_handle,
        "before_alert",
        WebviewUrl::App("alert.html".into()),
    )
    .title("Break soon - Blink Eye")
    .inner_size(320.0, 80.0)
    .position(x, y)
    .decorations(false)
    .resizable(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .focused(false)
    .shadow(false)
    .transparent(true)
    .build();

    if let Err(error) = result {
        eprintln!("[ReminderScheduler] Failed to spawn before alert: {error}");
    }
}

/// Spawns fullscreen reminder overlay windows on one or all monitors.
///
/// Monitor geometry from Tauri is in **physical pixels**, while window
/// positioning/sizing expects **logical points**, so all values are divided
/// by the monitor's scale factor.
///
/// On macOS, native fullscreen is avoided: a window spawned from a tray app
/// is not key, so the fullscreen transition can silently fail and leave the
/// window sized to the screen's visible frame (below the menu bar). A
/// borderless always-on-top window covering the exact display bounds is
/// edge-to-edge instantly, with no Space animation. It is then raised to
/// `NSScreenSaverWindowLevel` (see `raise_window_above_menu_bar`) because the
/// floating level alone stays below the menu bar.
///
/// # Parameters
/// - `app_handle` — Tauri app handle for creating webview windows.
/// - `config` — Reminder window configuration (text, style, duration, etc.).
/// - `use_all_monitors` — Whether to spawn on all monitors (true) or just primary (false).
fn spawn_reminder_windows(
    app_handle: &AppHandle,
    config: &ReminderWindowConfig,
    use_all_monitors: bool,
) -> Result<(), String> {
    let mut monitors = app_handle
        .available_monitors()
        .map_err(|error| error.to_string())?;

    // Put the primary monitor first so `reminder_monitor_0` (the one that
    // gets the interactive overlay) always lands on the primary display.
    if let Ok(Some(primary)) = app_handle.primary_monitor() {
        if let Some(index) = monitors
            .iter()
            .position(|monitor| monitor.position() == primary.position())
        {
            monitors.swap(0, index);
        }
    }

    let monitors_to_use = if use_all_monitors {
        monitors
    } else {
        monitors.into_iter().take(1).collect()
    };

    for (index, monitor) in monitors_to_use.iter().enumerate() {
        let label = format!("reminder_monitor_{index}");
        let is_primary = index == 0;
        let url = reminder_url(config, &config.background_style, is_primary)?;

        let scale = monitor.scale_factor();
        let position = monitor.position();
        let size = monitor.size();
        let x = position.x as f64 / scale;
        let y = position.y as f64 / scale;
        let width = size.width as f64 / scale;
        let height = size.height as f64 / scale;

        let mut builder =
            WebviewWindowBuilder::new(app_handle, &label, WebviewUrl::App(url.into()))
                .title("Take A Break Reminder - Blink Eye")
                .always_on_top(true)
                .skip_taskbar(true)
                .position(x, y)
                .inner_size(width, height);

        #[cfg(target_os = "macos")]
        {
            // Fake fullscreen: borderless window covering the exact display
            // bounds. Covers menu bar and Dock without a Space transition.
            builder = builder.decorations(false).shadow(false);
        }
        #[cfg(not(target_os = "macos"))]
        {
            builder = builder.fullscreen(true);
        }

        match builder.build() {
            Ok(window) => {
                // `always_on_top` only reaches the floating level (3), which
                // sits below the macOS menu bar (level 24). Raise the overlay
                // to screen-saver level so the break truly cannot be bypassed.
                #[cfg(target_os = "macos")]
                raise_window_above_menu_bar(&window, &label);
            }
            Err(error) => {
                eprintln!("[ReminderScheduler] Failed to spawn {label}: {error}");
            }
        }
    }

    Ok(())
}

/// Raises a window above the macOS menu bar and pins it to every Space.
///
/// `always_on_top` maps to `NSFloatingWindowLevel` (3), which stays below the
/// menu bar (`NSMainMenuWindowLevel` + 1 = 24). Setting the level to
/// `NSScreenSaverWindowLevel` (1000) covers the menu bar and Dock, and the
/// collection behavior keeps the overlay visible on all Spaces and on top of
/// other apps' fullscreen windows.
///
/// The AppKit calls are dispatched to the main thread: the scheduler runs on
/// a tokio worker, and macOS (Tahoe and later) traps with `EXC_BREAKPOINT`
/// if window properties are mutated off the main thread.
#[cfg(target_os = "macos")]
fn raise_window_above_menu_bar(window: &tauri::WebviewWindow, label: &str) {
    let dispatcher = window.clone();
    let closure_window = window.clone();
    let closure_label = label.to_string();

    let result = dispatcher.run_on_main_thread(move || {
        use objc2::rc::Retained;
        use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

        let Ok(handle) = closure_window.ns_window() else {
            eprintln!(
                "[ReminderScheduler] No NSWindow handle for {closure_label}; window level not raised"
            );
            return;
        };

        // SAFETY: the handle is a valid NSWindow retained by Tauri for the
        // lifetime of the cloned window handle, and this closure runs on the
        // main thread where AppKit requires window changes.
        unsafe {
            let Some(ns_window) = Retained::<NSWindow>::retain(handle.cast()) else {
                eprintln!("[ReminderScheduler] Null NSWindow handle for {closure_label}");
                return;
            };
            ns_window.setLevel(objc2_app_kit::NSScreenSaverWindowLevel);
            ns_window.setCollectionBehavior(
                NSWindowCollectionBehavior::CanJoinAllSpaces
                    | NSWindowCollectionBehavior::FullScreenAuxiliary
                    | NSWindowCollectionBehavior::Stationary,
            );
        }
    });

    if let Err(error) = result {
        eprintln!("[ReminderScheduler] Failed to raise {label} above menu bar: {error}");
    }
}

/// Builds the reminder webview URL for the given background style and monitor role.
///
/// The entry filename is selected from `BACKGROUND_STYLE_TO_ENTRY` (kept in sync
/// with `src/backgrounds/registry.ts`). Adding a new background is a single row
/// in both maps — no Rust control flow changes.
///
/// # Parameters
/// - `config` — Reminder window config to serialize into the URL.
/// - `style` — Internal background style key (already gated for premium upstream).
/// - `is_primary` — True for the primary monitor; the URL adds `&minimal=true` for
///   secondaries so they skip the overlay (timer/skip button).
fn reminder_url(
    config: &ReminderWindowConfig,
    style: &str,
    is_primary: bool,
) -> Result<String, String> {
    let entry = BACKGROUND_STYLE_TO_ENTRY
        .iter()
        .find(|(k, _)| *k == style)
        .map(|(_, v)| *v)
        .unwrap_or("reminder-default.html");

    let json = serde_json::to_string(config).map_err(|error| error.to_string())?;
    let config_param = url_encode(&json);

    let url = if is_primary {
        format!("{entry}?config={config_param}")
    } else {
        format!("{entry}?minimal=true&config={config_param}")
    };

    Ok(url)
}

/// Mapping of background style key → Vite entry filename. Must mirror
/// `ENTRY_NAME` in `src/backgrounds/registry.ts`.
const BACKGROUND_STYLE_TO_ENTRY: &[(&str, &str)] = &[
    ("default",                "reminder-default.html"),
    ("aurora",                 "reminder-aurora.html"),
    ("freesprit",              "reminder-freesprit.html"),
    ("beamoflife",             "reminder-beamoflife.html"),
    ("particleBackground",     "reminder-particles.html"),
    ("starryBackground",       "reminder-starry.html"),
    ("shootingmeteor",         "reminder-meteor.html"),
    ("plainGradientAnimation", "reminder-gradient.html"),
    ("canvasShapes",           "reminder-canvas.html"),
];

/// Creates the `config` table in `appconfig.db` and inserts default values if missing.
async fn ensure_app_config_defaults(pool: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)")
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;

    let default_workday = serde_json::to_string(&default_workday_config())
        .map_err(|error| error.to_string())?;
    let defaults = [
        ("blinkEyeWorkday", default_workday.as_str()),
        ("isWorkdayEnabled", "false"),
        ("isUpdateAvailable", "false"),
        ("usingStrictMode", "false"),
        ("useCircleProgressTimerStyle", "true"),
        ("isUserOnboarded", "false"),
        ("isMultiMonitorEnabled", "false"),
        ("blinkEyeReminderInterval", "20"),
        ("blinkEyeReminderDuration", "20"),
        ("blinkEyeReminderScreenText", "Pause! Look into the distance, and best if you walk a bit."),
        ("reminderBackgroundStyle", "default"),
        ("reminderBackgroundStylePreview", "default"),
        ("screenSaverBackgroundStyle", "freesprit"),
        ("isRunOnStartUpEnabledByDefault", "true"),
        ("usageTimeLimit", "8"),
        ("screenOnTimeLimit", "8"),
        ("pomodoroStyleBreak", "false"),
        ("previousblinkEyeReminderDuration", "20"),
        ("previousblinkEyeReminderInterval", "20"),
    ];

    for (key, value) in defaults {
        sqlx::query("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)")
            .bind(key)
            .bind(value)
            .execute(pool)
            .await
            .map_err(|error| error.to_string())?;
    }

    crate::snooze_tracker::ensure_snooze_defaults(pool).await?;

    Ok(())
}

/// Creates the `licenses` table in `blink_eye_license.db` if it doesn't exist.
async fn ensure_license_table(pool: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY,
          license_key TEXT UNIQUE,
          status TEXT,
          activation_limit TEXT,
          activation_usage TEXT,
          created_at TEXT,
          expires_at TEXT,
          test_mode TEXT,
          instance_name TEXT,
          store_id TEXT,
          order_id TEXT,
          order_item_id TEXT,
          variant_name TEXT,
          product_name TEXT,
          customer_name TEXT,
          customer_email TEXT,
          last_validated TEXT
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|error| error.to_string())?;

    Ok(())
}

/// Reads a boolean config value from `appconfig.db`, returning default if missing or invalid.
async fn read_config_bool(pool: &Pool<Sqlite>, key: &str, default_value: bool) -> bool {
    read_config_string(pool, key)
        .await
        .map(|value| value == "true")
        .unwrap_or(default_value)
}

/// Reads and deserializes a JSON config value from `appconfig.db`.
async fn read_config_json<T>(pool: &Pool<Sqlite>, key: &str) -> Option<T>
where
    T: for<'de> Deserialize<'de>,
{
    let value = read_config_string(pool, key).await?;
    serde_json::from_str(&value).ok()
}

/// Reads a string config value from the `config` table in `appconfig.db`.
async fn read_config_string(pool: &Pool<Sqlite>, key: &str) -> Option<String> {
    let (value,) = sqlx::query_as::<_, (String,)>("SELECT value FROM config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .ok()??;

    Some(value)
}

/// Returns true if the current time falls within the configured workday hours for today.
fn is_inside_workday_window(settings: &ReminderSettings) -> bool {
    if !settings.is_premium || !settings.is_workday_enabled {
        return true;
    }

    let now = Local::now();
    let day = now.weekday().to_string();
    let day_name = match day.as_str() {
        "Mon" => "Monday",
        "Tue" => "Tuesday",
        "Wed" => "Wednesday",
        "Thu" => "Thursday",
        "Fri" => "Friday",
        "Sat" => "Saturday",
        "Sun" => "Sunday",
        _ => return true,
    };

    let Some(Some(hours)) = settings.workday.get(day_name) else {
        return false;
    };

    let Ok(start) = NaiveTime::parse_from_str(&hours.start, "%H:%M") else {
        return false;
    };
    let Ok(end) = NaiveTime::parse_from_str(&hours.end, "%H:%M") else {
        return false;
    };

    let current_time = now.time();

    if start <= end {
        current_time >= start && current_time <= end
    } else {
        current_time >= start || current_time <= end
    }
}

/// Returns the default 9-5 workday config for Mon-Fri, with weekends disabled.
fn default_workday_config() -> WorkdayConfig {
    HashMap::from([
        (
            "Monday".to_string(),
            Some(WorkdayHours {
                start: "09:00".to_string(),
                end: "17:00".to_string(),
            }),
        ),
        (
            "Tuesday".to_string(),
            Some(WorkdayHours {
                start: "09:00".to_string(),
                end: "17:00".to_string(),
            }),
        ),
        (
            "Wednesday".to_string(),
            Some(WorkdayHours {
                start: "09:00".to_string(),
                end: "17:00".to_string(),
            }),
        ),
        (
            "Thursday".to_string(),
            Some(WorkdayHours {
                start: "09:00".to_string(),
                end: "17:00".to_string(),
            }),
        ),
        (
            "Friday".to_string(),
            Some(WorkdayHours {
                start: "09:00".to_string(),
                end: "17:00".to_string(),
            }),
        ),
        ("Saturday".to_string(), None),
        ("Sunday".to_string(), None),
    ])
}

/// Encrypted payload structure matching WebCrypto AES-GCM output (iv + ciphertext).
#[derive(Deserialize)]
struct EncryptedPayload {
    /// Initialization vector (nonce) for AES-GCM.
    iv: Vec<u8>,
    /// Encrypted ciphertext data.
    data: Vec<u8>,
}

fn decrypt_webcrypto_aes_gcm(encrypted_text: &str, password: &str) -> Option<String> {
    let payload = serde_json::from_str::<EncryptedPayload>(encrypted_text).ok()?;
    let iterations = NonZeroU32::new(100_000)?;
    let mut key_bytes = [0_u8; 32];

    pbkdf2::derive(
        pbkdf2::PBKDF2_HMAC_SHA256,
        iterations,
        b"unique_salt",
        password.as_bytes(),
        &mut key_bytes,
    );

    let unbound_key = aead::UnboundKey::new(&aead::AES_256_GCM, &key_bytes).ok()?;
    let key = aead::LessSafeKey::new(unbound_key);
    let nonce = aead::Nonce::try_assume_unique_for_key(&payload.iv).ok()?;
    let mut encrypted = payload.data;
    let decrypted = key
        .open_in_place(nonce, aead::Aad::empty(), &mut encrypted)
        .ok()?;

    String::from_utf8(decrypted.to_vec()).ok()
}

fn url_encode(value: &str) -> String {
    let mut encoded = String::new();

    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }

    encoded
}

/// Skip or complete the current reminder.
///
/// Pass `snoozed: true` when the user clicks Skip (counts toward limits and
/// resets the break streak). Pass `false` when the timer finishes naturally.
///
/// # Parameters
/// - `snoozed` — Whether the user snoozed/skipped the break.
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn skip_reminder(
    app_handle: AppHandle,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    snoozed: Option<bool>,
) -> Result<(), String> {
    if snoozed.unwrap_or(false) {
        crate::snooze_tracker::record_snooze(&app_handle, &scheduler).await?;
    } else {
        crate::snooze_tracker::record_break_completed(&app_handle).await?;
    }

    scheduler.finish_break(&app_handle).await;
    Ok(())
}

/// Reload settings from `appconfig.db` without restarting.
///
/// Called after the Dashboard saves new interval/duration/text values.
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn refresh_reminder_scheduler_settings(
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
) -> Result<(), String> {
    scheduler.refresh_settings().await
}

/// Force-show a reminder window immediately (debug/testing).
///
/// Ignores the timer and workday check. Spawns windows on all monitors.
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn show_reminder_now(
    app_handle: AppHandle,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
) -> Result<(), String> {
    scheduler.show_now(&app_handle).await
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NextReminderInfo {
    /// Seconds remaining until the next break starts
    pub next_reminder_in_secs: u64,
    /// Total interval between breaks in seconds
    pub interval_secs: u64,
    /// Whether a break is currently active
    pub is_on_break: bool,
    /// Whether we're inside the configured workday hours
    pub is_inside_workday: bool,
    /// Break duration in seconds
    pub duration_secs: u64,
}

/// Get countdown info for the tray menu display.
///
/// Returns the time remaining until the next break, current interval,
/// break state, and whether we're inside workday hours.
///
/// # Returns
/// `NextReminderInfo` with countdown and state details.
#[tauri::command]
pub async fn get_next_reminder_info(
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
) -> Result<NextReminderInfo, String> {
    let state = scheduler.state.lock().await;
    let elapsed = state.seconds_since_last_break;
    let interval = state.settings.interval_secs;

    let remaining = if state.is_on_break {
        0
    } else if elapsed >= interval {
        0
    } else {
        interval - elapsed
    };

    Ok(NextReminderInfo {
        next_reminder_in_secs: remaining,
        interval_secs: interval,
        is_on_break: state.is_on_break,
        is_inside_workday: is_inside_workday_window(&state.settings),
        duration_secs: state.settings.duration_secs,
    })
}

#[cfg(test)]
mod tests {
    use super::{is_inside_workday_window, ReminderSettings, WorkdayHours};
    use std::collections::HashMap;

    #[test]
    fn workday_is_ignored_for_free_users() {
        let settings = ReminderSettings {
            is_premium: false,
            is_workday_enabled: true,
            workday: HashMap::new(),
            ..ReminderSettings::default()
        };

        assert!(is_inside_workday_window(&settings));
    }

    #[test]
    fn url_encoding_preserves_safe_characters() {
        assert_eq!(super::url_encode("a b&c"), "a%20b%26c");
    }

    #[test]
    fn encrypted_payload_shape_can_be_parsed() {
        let parsed: super::EncryptedPayload =
            serde_json::from_str(r#"{"iv":[1,2,3],"data":[4,5,6]}"#).unwrap();

        assert_eq!(parsed.iv, vec![1, 2, 3]);
        assert_eq!(parsed.data, vec![4, 5, 6]);
    }

    #[test]
    fn default_workday_has_weekdays() {
        let workday = super::default_workday_config();
        assert!(matches!(
            workday.get("Monday"),
            Some(Some(WorkdayHours { .. }))
        ));
        assert!(matches!(workday.get("Saturday"), Some(None)));
    }
}
