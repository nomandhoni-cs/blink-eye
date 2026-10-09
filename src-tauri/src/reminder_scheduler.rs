use chrono::{Datelike, Local, NaiveTime};
use ring::{aead, pbkdf2};
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Pool, Sqlite,
};
use std::{
    collections::HashMap,
    num::NonZeroU32,
    path::{Path, PathBuf},
    str::FromStr,
    sync::{Arc, Mutex as StateMutex, MutexGuard},
};
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::{
    sync::{mpsc, oneshot, Mutex},
    time::{interval, sleep_until, Duration, Instant, MissedTickBehavior},
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

const MULTI_MONITOR_KEY: &str = "isMultiMonitorEnabled";
const MULTI_MONITOR_MIGRATION_KEY: &str = "multiMonitorPreferenceMigrationVersion";
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
    pub session_id: u64,
    pub kind: ReminderKind,
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
#[derive(Debug)]
struct SchedulerState {
    /// Seconds elapsed since the last break ended.
    seconds_since_last_break: u64,
    generation: u64,
    shutting_down: bool,
    session: Option<ReminderSession>,
    /// Active settings snapshot.
    settings: ReminderSettings,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ReminderKind {
    Actual,
    Preview,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FinishReason {
    Expired,
    Skip,
    DismissPreview,
    Abort,
}

/// The terminal decision is independent of the renderer and the screen-on tick.
#[derive(Debug)]
struct ReminderSession {
    id: u64,
    kind: ReminderKind,
    deadline: Instant,
    strict: bool,
    labels: Vec<String>,
    control_window: Option<String>,
    audio_claimed: bool,
    active: bool,
    config: ReminderWindowConfig,
    cancel: Option<oneshot::Sender<()>>,
}

impl ReminderSession {
    fn claim_audio(&mut self, caller: &str, now: Instant) -> bool {
        if !self.active
            || !self.config.is_premium
            || self.audio_claimed
            || self.control_window.as_deref() != Some(caller)
            || now >= self.deadline
            || self.deadline - now > Duration::from_secs(1)
        {
            return false;
        }
        self.audio_claimed = true;
        true
    }

    fn accounting(&self, reason: FinishReason) -> Option<bool> {
        if self.kind != ReminderKind::Actual || !self.active {
            return None;
        }
        match reason {
            FinishReason::Expired => Some(true),
            FinishReason::Skip => Some(false),
            FinishReason::DismissPreview | FinishReason::Abort => None,
        }
    }

    fn authorize_finish(
        &self,
        id: u64,
        caller: Option<&str>,
        reason: FinishReason,
        now: Instant,
    ) -> Result<(), String> {
        if self.id != id || caller.is_some_and(|label| !self.labels.iter().any(|l| l == label)) {
            return Err("Reminder session is no longer owned by this window.".into());
        }
        match reason {
            FinishReason::Abort => Ok(()),
            FinishReason::DismissPreview if self.kind == ReminderKind::Preview => Ok(()),
            FinishReason::DismissPreview => Err("Only previews can be dismissed.".into()),
            FinishReason::Skip if self.kind != ReminderKind::Actual || self.strict => {
                Err("Skipping is disabled for this reminder.".into())
            }
            FinishReason::Skip if !self.active || now >= self.deadline => {
                Err("Reminder is not accepting skips.".into())
            }
            FinishReason::Skip => Ok(()),
            FinishReason::Expired if now < self.deadline => {
                Err("The reminder has not expired.".into())
            }
            FinishReason::Expired => Ok(()),
        }
    }
}

impl SchedulerState {
    fn is_on_break(&self) -> bool {
        self.session
            .as_ref()
            .is_some_and(|s| s.kind == ReminderKind::Actual)
    }

    fn claim_finish(
        &mut self,
        id: u64,
        caller: Option<&str>,
        reason: FinishReason,
        now: Instant,
    ) -> Result<ReminderSession, String> {
        let session = self.session.as_ref().ok_or("No active reminder.")?;
        session.authorize_finish(id, caller, reason, now)?;
        let session = self.session.take().ok_or("No active reminder.")?;
        if session.kind == ReminderKind::Actual {
            self.seconds_since_last_break = 0;
        }
        Ok(session)
    }
}

impl Default for SchedulerState {
    fn default() -> Self {
        Self {
            seconds_since_last_break: 0,
            generation: 0,
            shutting_down: false,
            session: None,
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
    state: StateMutex<SchedulerState>,
    /// Serializes preparations, but never blocks a deadline or cleanup.
    preparing: Mutex<()>,
    /// Serializes the existing read/modify/write statistics operations.
    accounting: Mutex<()>,
    /// Keep quota check and accounting ordered across concurrent Skip requests.
    skipping: Mutex<()>,
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
            state: StateMutex::new(SchedulerState::default()),
            preparing: Mutex::new(()),
            accounting: Mutex::new(()),
            skipping: Mutex::new(()),
            tray_tx,
            last_tray_update: Arc::new(Mutex::new(TrayUpdate {
                remaining_secs: 0,
                is_on_break: false,
            })),
            session_snooze_count: Arc::new(Mutex::new(0)),
        })
    }

    fn state(&self) -> Result<MutexGuard<'_, SchedulerState>, String> {
        self.state.lock().map_err(|error| error.to_string())
    }

    /// Cancels the current generation without accounting before native app teardown.
    pub(crate) fn shutdown(&self) {
        match self.state() {
            Ok(mut state) => {
                state.shutting_down = true;
                state.session.take();
            }
            Err(error) => eprintln!("[Reminder] Shutdown state failed: {error}"),
        }
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

    /// Prepares canonical config and imports the released UI preference before settings or IPC are used.
    pub(crate) async fn prepare_settings(&self, legacy_path: &Path) -> Result<(), String> {
        let pool = self.open_sqlite_pool("appconfig.db", true).await?;
        ensure_app_config_defaults(&pool).await?;
        if let Err(error) = migrate_multi_monitor_preference(
            &pool,
            &self.app_data_dir.join("appconfig.db"),
            legacy_path,
        )
        .await
        {
            eprintln!("[ReminderScheduler] Multi-monitor migration deferred: {error}");
        }
        pool.close().await;
        self.refresh_settings().await
    }

    /// Spawns the tick loop after awaited startup settings preparation.
    pub fn start(self: Arc<Self>, app_handle: AppHandle) {
        tauri::async_runtime::spawn(async move {
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
        let mut state = self.state()?;
        state.settings = settings;
        Ok(())
    }

    /// Claims one terminal transition, destroys owned windows, then persists statistics.
    pub(crate) async fn finish_session(
        &self,
        app_handle: &AppHandle,
        id: u64,
        caller: Option<&str>,
        reason: FinishReason,
    ) -> Result<(), String> {
        let session = self
            .state()?
            .claim_finish(id, caller, reason, Instant::now())?;
        let accounting = session.accounting(reason);
        drop(session.cancel);
        let result = cleanup_before_accounting(
            destroy_session_windows(app_handle, id, session.labels),
            async {
                let update = {
                    let state = self.state()?;
                    TrayUpdate {
                        remaining_secs: state
                            .settings
                            .interval_secs
                            .saturating_sub(state.seconds_since_last_break),
                        is_on_break: state.is_on_break(),
                    }
                };
                self.send_tray_update(update).await;
                let Some(completed) = accounting else {
                    return Ok(());
                };
                // The quota check is separately serialized, but expiry never waits on it.
                let _accounting = self.accounting.lock().await;
                if completed {
                    crate::snooze_tracker::record_break_completed(app_handle).await
                } else {
                    crate::snooze_tracker::record_snooze(app_handle, self).await
                }
            },
        )
        .await;
        eprintln!(
            "[Reminder] session={id} end={reason:?} success={}",
            result.is_ok()
        );
        result
    }

    /// Force-refreshes settings and immediately starts a break (used for debug/testing).
    pub async fn show_now(self: &Arc<Self>, app_handle: &AppHandle) -> Result<(), String> {
        self.refresh_settings().await?;
        self.start_session(app_handle, ReminderKind::Actual, None)
            .await
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
    async fn tick(self: &Arc<Self>, app_handle: &AppHandle) -> Result<(), String> {
        if !ScreenTimeTracker::is_screen_on() {
            return Ok(());
        }

        let should_refresh = {
            let state = self.state()?;
            !state.is_on_break() && state.seconds_since_last_break % CONFIG_REFRESH_SECS == 0
        };

        if should_refresh {
            self.refresh_settings().await?;
        }

        // Decide the action for this tick. The state lock is released before
        // any window spawning or tray I/O happens.
        let (action, update) = {
            let mut state = self.state()?;

            if state.is_on_break() {
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
                ReminderAction::StartBreak
            } else if should_show_alert {
                ReminderAction::ShowBeforeAlert
            } else {
                ReminderAction::None
            };

            (
                action,
                TrayUpdate {
                    remaining_secs: remaining,
                    is_on_break: false,
                },
            )
        };
        self.send_tray_update(update).await;

        match action {
            ReminderAction::None => Ok(()),
            ReminderAction::ShowBeforeAlert => {
                spawn_before_alert(app_handle);
                Ok(())
            }
            ReminderAction::StartBreak => {
                self.start_session(app_handle, ReminderKind::Actual, None)
                    .await
            }
        }
    }

    /// Closes any pre-alert, builds window config with current state and screen time, then spawns reminder overlay windows.
    async fn start_session(
        self: &Arc<Self>,
        app_handle: &AppHandle,
        kind: ReminderKind,
        style: Option<String>,
    ) -> Result<(), String> {
        let _preparing = self.preparing.lock().await;
        let previous = {
            let state = self.state()?;
            if state.is_on_break() {
                return Err(
                    "A break is already in progress. Wait until it finishes to preview.".into(),
                );
            }
            state.session.as_ref().map(|session| session.id)
        };
        if let Some(id) = previous {
            self.finish_session(app_handle, id, None, FinishReason::Abort)
                .await?;
        }
        if kind == ReminderKind::Actual {
            close_before_alert(app_handle);
        }
        let settings = self.state()?.settings.clone();
        if style.as_ref().is_some_and(|value| {
            !BACKGROUND_STYLE_TO_ENTRY
                .iter()
                .any(|(key, _)| key == value)
        }) {
            return Err("Unknown reminder theme.".into());
        }
        let (screen_time_hours, screen_time_minutes) =
            self.today_screen_time().await.unwrap_or((0, 0));
        let id = {
            let mut state = self.state()?;
            if state.shutting_down {
                return Err("The application is shutting down.".into());
            }
            state.generation = state
                .generation
                .checked_add(1)
                .ok_or("Reminder generation exhausted.")?;
            state.generation
        };
        let config = ReminderWindowConfig {
            session_id: id,
            kind,
            background_style: if settings.is_premium {
                style.unwrap_or(settings.background_style)
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

        let deadline = Instant::now() + Duration::from_secs(config.duration_secs);
        let (cancel, cancelled) = oneshot::channel();
        self.state()?.session = Some(ReminderSession {
            id,
            kind,
            deadline,
            strict: config.is_strict_mode,
            labels: Vec::new(),
            control_window: None,
            audio_claimed: false,
            active: false,
            config: config.clone(),
            cancel: Some(cancel),
        });
        self.start_deadline(app_handle.clone(), id, deadline, cancelled);
        let result = spawn_reminder_windows(
            app_handle,
            &config,
            settings.is_multi_monitor_enabled && settings.is_premium,
        )
        .await;
        if let Err(error) = result {
            if let Err(cleanup) = self
                .finish_session(app_handle, id, None, FinishReason::Abort)
                .await
            {
                eprintln!("[Reminder] Presentation rollback: {cleanup}");
            }
            return Err(error);
        }
        {
            let mut state = self.state()?;
            let session = state
                .session
                .as_mut()
                .filter(|session| session.id == id)
                .ok_or("Reminder expired while preparing.")?;
            if session.labels.is_empty() {
                return Err("No reminder outputs were created.".into());
            }
            session.active = true;
        }
        self.send_tray_update(TrayUpdate {
            remaining_secs: 0,
            is_on_break: kind == ReminderKind::Actual,
        })
        .await;
        Ok(())
    }

    fn start_deadline(
        self: &Arc<Self>,
        app: AppHandle,
        id: u64,
        deadline: Instant,
        cancelled: oneshot::Receiver<()>,
    ) {
        let scheduler = self.clone();
        tauri::async_runtime::spawn(async move {
            if wait_for_expiry(deadline, cancelled, || {
                if let Ok(status) = scheduler.status(id, None) {
                    if let Err(error) = app.emit("reminder-status", status) {
                        eprintln!("[Reminder] Status delivery failed: {error}");
                    }
                }
            })
            .await
            {
                if let Err(error) = scheduler
                    .finish_session(&app, id, None, FinishReason::Expired)
                    .await
                {
                    eprintln!("[Reminder] Expiry: {error}");
                }
            }
        });
    }

    pub(crate) fn register_window(
        &self,
        id: u64,
        label: &str,
        controls: bool,
    ) -> Result<(), String> {
        let mut state = self.state()?;
        let session = state
            .session
            .as_mut()
            .filter(|session| session.id == id)
            .ok_or("Reminder session ended during presentation.")?;
        session.labels.push(label.into());
        if controls {
            session.control_window = Some(label.into());
        }
        Ok(())
    }

    pub(crate) fn remove_window(&self, id: u64, label: &str) -> Result<(), String> {
        if let Some(session) = self
            .state()?
            .session
            .as_mut()
            .filter(|session| session.id == id)
        {
            session.labels.retain(|owned| owned != label);
            if session.control_window.as_deref() == Some(label) {
                session.control_window = None;
            }
        }
        Ok(())
    }

    pub(crate) fn promote_controls(&self, id: u64, label: &str) -> Result<(), String> {
        let mut state = self.state()?;
        let session = state
            .session
            .as_mut()
            .filter(|session| session.id == id)
            .ok_or("Reminder session ended during control promotion.")?;
        if !session.labels.iter().any(|owned| owned == label) {
            return Err("Control output is not owned by the session.".into());
        }
        session.control_window = Some(label.into());
        Ok(())
    }

    pub(crate) fn owns_window(&self, id: u64, label: &str) -> bool {
        self.state().is_ok_and(|state| {
            state.session.as_ref().is_some_and(|session| {
                session.id == id && session.labels.iter().any(|owned| owned == label)
            })
        })
    }

    pub(crate) fn invalidate_presentation(&self, id: u64) {
        match self.state() {
            Ok(mut state) => {
                if let Some(session) = state.session.as_mut().filter(|session| session.id == id) {
                    session.active = false;
                }
            }
            Err(error) => eprintln!("[Reminder] Presentation invalidation failed: {error}"),
        }
    }

    fn status(&self, id: u64, caller: Option<&str>) -> Result<ReminderStatus, String> {
        let state = self.state()?;
        let session = state
            .session
            .as_ref()
            .filter(|session| session.id == id)
            .ok_or("No matching reminder session.")?;
        if caller.is_some_and(|label| !session.labels.iter().any(|owned| owned == label)) {
            return Err("This window does not own the reminder session.".into());
        }
        Ok(ReminderStatus {
            config: session.config.clone(),
            control_window_label: session.control_window.clone(),
            remaining_ms: u64::try_from(
                session
                    .deadline
                    .saturating_duration_since(Instant::now())
                    .as_millis(),
            )
            .map_err(|error| error.to_string())?,
        })
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
            read_config_bool(&app_pool, MULTI_MONITOR_KEY, false).await;
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
        let Ok(pool) = self
            .open_sqlite_pool("basicapplicationdata.db", false)
            .await
        else {
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
        let pool = self
            .open_sqlite_pool("basicapplicationdata.db", false)
            .await
            .ok()?;
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

async fn wait_for_expiry(
    deadline: Instant,
    mut cancelled: oneshot::Receiver<()>,
    update: impl Fn(),
) -> bool {
    let mut updates = interval(Duration::from_millis(250));
    updates.set_missed_tick_behavior(MissedTickBehavior::Skip);
    loop {
        tokio::select! {
            biased;
            _ = &mut cancelled => return false,
            _ = sleep_until(deadline) => return true,
            _ = updates.tick() => update(),
        }
    }
}

async fn cleanup_before_accounting(
    cleanup: impl std::future::Future<Output = Result<(), String>>,
    accounting: impl std::future::Future<Output = Result<(), String>>,
) -> Result<(), String> {
    cleanup.await?;
    accounting.await
}

async fn destroy_session_windows(
    app: &AppHandle,
    _id: u64,
    labels: Vec<String>,
) -> Result<(), String> {
    let (done, completed) = oneshot::channel();
    let handle = app.clone();
    app.run_on_main_thread(move || {
        #[cfg(target_os = "linux")]
        crate::wayland_reminder::close(_id);
        let mut errors = Vec::new();
        for label in labels {
            if let Some(window) = handle.get_webview_window(&label) {
                if let Err(error) = window.destroy() {
                    errors.push(error.to_string());
                }
            }
        }
        let result = if errors.is_empty() {
            Ok(())
        } else {
            Err(errors.join("; "))
        };
        if done.send(result).is_err() {
            eprintln!("[Reminder] Cleanup receiver dropped.");
        }
    })
    .map_err(|error| error.to_string())?;
    completed.await.map_err(|error| error.to_string())?
}

pub(crate) fn install_window_guards(
    window: &tauri::WebviewWindow,
    id: u64,
    kind: ReminderKind,
) -> Result<(), String> {
    let app = window.app_handle().clone();
    let label = window.label().to_string();
    window.on_window_event(move |event| {
        let scheduler = app.state::<Arc<ReminderScheduler>>().inner().clone();
        let reason = match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                if kind != ReminderKind::Preview {
                    return;
                }
                FinishReason::DismissPreview
            }
            tauri::WindowEvent::Destroyed => FinishReason::Abort,
            _ => return,
        };
        if !scheduler.owns_window(id, &label) {
            return;
        }
        if reason == FinishReason::Abort {
            scheduler.invalidate_presentation(id);
        }
        let app = app.clone();
        let label = label.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(error) = scheduler
                .finish_session(&app, id, Some(&label), reason)
                .await
            {
                eprintln!("[Reminder] Window terminal event: {error}");
            }
        });
    });
    #[cfg(target_os = "linux")]
    {
        let handle = window.clone();
        window
            .with_webview(move |webview| {
                use gtk::prelude::*;
                let view = webview.inner();
                let app = handle.app_handle().clone();
                let label = handle.label().to_string();
                // Public WebKit signal, available since 2.20. GTK stays on this thread.
                let signal = view.connect_local("web-process-terminated", false, move |_| {
                    let scheduler = app.state::<Arc<ReminderScheduler>>().inner().clone();
                    if scheduler.owns_window(id, &label) {
                        scheduler.invalidate_presentation(id);
                        let app = app.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(error) = scheduler
                                .finish_session(&app, id, None, FinishReason::Abort)
                                .await
                            {
                                eprintln!("[Reminder] Renderer failure cleanup: {error}");
                            }
                        });
                        eprintln!("[Reminder] Renderer terminated; aborting session.");
                    }
                    None
                });
                match handle.gtk_window() {
                    Ok(native) => {
                        let signal = std::cell::Cell::new(Some(signal));
                        native.connect_destroy(move |_| {
                            if let Some(signal) = signal.take() {
                                view.disconnect(signal);
                            }
                        });
                    }
                    Err(error) => {
                        view.disconnect(signal);
                        eprintln!("[Reminder] Renderer observer teardown: {error}");
                    }
                }
            })
            .map_err(|error| error.to_string())?;
    }
    Ok(())
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
                position.x as f64 / scale + ((size.width as f64 / scale - 320.0) / 2.0).max(0.0),
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
async fn spawn_reminder_windows(
    app: &AppHandle,
    config: &ReminderWindowConfig,
    use_all_monitors: bool,
) -> Result<(), String> {
    let (done, completed) = oneshot::channel();
    let app_handle = app.clone();
    let config = config.clone();
    app.run_on_main_thread(move || {
        #[cfg(target_os = "linux")]
        let result = if crate::wayland_reminder::is_wayland() {
            crate::wayland_reminder::open(&app_handle, &config, use_all_monitors)
        } else {
            eprintln!(
                "[Reminder] Native Wayland inhibition unavailable; using standard fullscreen."
            );
            spawn_standard_windows(&app_handle, &config, use_all_monitors)
        };
        #[cfg(not(target_os = "linux"))]
        let result = spawn_standard_windows(&app_handle, &config, use_all_monitors);
        if done.send(result).is_err() {
            eprintln!("[Reminder] Presentation receiver dropped.");
        }
    })
    .map_err(|error| error.to_string())?;
    completed.await.map_err(|error| error.to_string())?
}

fn spawn_standard_windows(
    app_handle: &AppHandle,
    config: &ReminderWindowConfig,
    use_all_monitors: bool,
) -> Result<(), String> {
    let mut monitors = app_handle
        .available_monitors()
        .map_err(|error| error.to_string())?;

    // Put the primary monitor first so index zero is the initial todo/audio owner.
    // Every selected output receives the timer, message, and guarded dismissal.
    if let Ok(Some(primary)) = app_handle.primary_monitor() {
        if let Some(index) = monitors.iter().position(|monitor| {
            monitor.name() == primary.name()
                && monitor.position() == primary.position()
                && monitor.size() == primary.size()
        }) {
            monitors.swap(0, index);
        }
    }

    let monitors_to_use = if use_all_monitors {
        monitors
    } else {
        monitors.into_iter().take(1).collect()
    };
    if monitors_to_use.is_empty() {
        return Err("No connected reminder output.".into());
    }

    for (index, monitor) in monitors_to_use.iter().enumerate() {
        let label = reminder_label(config, index);
        let is_primary = index == 0;
        let url = reminder_url(config, &config.background_style)?;

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
                .visible(false)
                .focused(is_primary)
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

        let window = builder.build().map_err(|error| error.to_string())?;
        if let Err(error) =
            install_window_guards(&window, config.session_id, config.kind).and_then(|()| {
                app_handle
                    .state::<Arc<ReminderScheduler>>()
                    .register_window(config.session_id, &label, is_primary)
            })
        {
            if let Err(cleanup) = window.destroy() {
                eprintln!("[Reminder] Registration rollback: {cleanup}");
            }
            return Err(error);
        }
        #[cfg(target_os = "macos")]
        raise_window_above_menu_bar(&window, &label);
        window.show().map_err(|error| error.to_string())?;
    }

    eprintln!(
        "[Reminder] backend=native-standard outputs={}",
        monitors_to_use.len()
    );
    Ok(())
}

pub(crate) fn reminder_label(config: &ReminderWindowConfig, index: usize) -> String {
    let kind = match config.kind {
        ReminderKind::Actual => "actual",
        ReminderKind::Preview => "preview",
    };
    format!("reminder_{kind}_{}_{index}", config.session_id)
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

/// Builds the shared reminder entry URL; status supplies the single control owner.
///
/// The entry filename is selected from `BACKGROUND_STYLE_TO_ENTRY` (kept in sync
/// with `src/backgrounds/registry.ts`). Adding a new background is a single row
/// in both maps — no Rust control flow changes.
///
/// # Parameters
/// - `config` — Reminder window config to serialize into the URL.
/// - `style` — Internal background style key (already gated for premium upstream).
pub(crate) fn reminder_url(config: &ReminderWindowConfig, style: &str) -> Result<String, String> {
    let entry = BACKGROUND_STYLE_TO_ENTRY
        .iter()
        .find(|(k, _)| *k == style)
        .map(|(_, v)| *v)
        .unwrap_or("reminder-default.html");

    let json = serde_json::to_string(config).map_err(|error| error.to_string())?;
    let config_param = url_encode(&json);

    Ok(format!("{entry}?config={config_param}"))
}

/// Mapping of background style key → Vite entry filename. Must mirror
/// `ENTRY_NAME` in `src/backgrounds/registry.ts`.
const BACKGROUND_STYLE_TO_ENTRY: &[(&str, &str)] = &[
    ("default", "reminder-default.html"),
    ("aurora", "reminder-aurora.html"),
    ("freesprit", "reminder-freesprit.html"),
    ("beamoflife", "reminder-beamoflife.html"),
    ("particleBackground", "reminder-particles.html"),
    ("starryBackground", "reminder-starry.html"),
    ("shootingmeteor", "reminder-meteor.html"),
    ("plainGradientAnimation", "reminder-gradient.html"),
    ("canvasShapes", "reminder-canvas.html"),
];

/// The writer lock precedes the marker read, so a concurrent explicit save wins.
async fn migrate_multi_monitor_preference(
    pool: &Pool<Sqlite>,
    canonical_path: &Path,
    legacy_path: &Path,
) -> Result<(), String> {
    let mut transaction = pool
        .begin_with("BEGIN IMMEDIATE")
        .await
        .map_err(|_| "Could not begin canonical config migration")?;
    migrate_multi_monitor_transaction(&mut transaction, canonical_path, legacy_path).await?;
    transaction
        .commit()
        .await
        .map_err(|_| "Could not commit canonical config migration".into())
}

async fn migrate_multi_monitor_transaction(
    connection: &mut sqlx::SqliteConnection,
    canonical_path: &Path,
    legacy_path: &Path,
) -> Result<(), String> {
    let marker: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(MULTI_MONITOR_MIGRATION_KEY)
        .fetch_optional(&mut *connection)
        .await
        .map_err(|_| "Could not read canonical migration marker")?;
    if marker.is_some_and(|(value,)| value == "1") {
        return Ok(());
    }

    let value = if canonical_path == legacy_path
        || !legacy_path
            .try_exists()
            .map_err(|_| "Could not inspect legacy config")?
        || std::fs::canonicalize(canonical_path)
            .map_err(|_| "Could not resolve canonical config")?
            == std::fs::canonicalize(legacy_path).map_err(|_| "Could not resolve legacy config")?
    {
        None
    } else {
        let legacy = SqlitePoolOptions::new()
            .max_connections(1)
            .connect_with(
                SqliteConnectOptions::new()
                    .filename(legacy_path)
                    .read_only(true),
            )
            .await
            .map_err(|_| "Could not open legacy config read-only")?;
        let row: Result<Option<(String,)>, _> =
            sqlx::query_as("SELECT value FROM config WHERE key = ?")
                .bind(MULTI_MONITOR_KEY)
                .fetch_optional(&legacy)
                .await;
        legacy.close().await;
        match row.map_err(|_| "Could not read legacy monitor preference")? {
            Some((value,)) => Some(
                value
                    .parse::<bool>()
                    .map_err(|_| "Invalid legacy monitor preference")?,
            ),
            None => None,
        }
    };
    write_multi_monitor_choice(connection, value).await
}

/// Saves a canonical user choice and seals legacy import in the same transaction.
pub(crate) async fn save_multi_monitor_preference(
    pool: &Pool<Sqlite>,
    value: bool,
) -> Result<(), String> {
    let mut transaction = pool
        .begin_with("BEGIN IMMEDIATE")
        .await
        .map_err(|error| error.to_string())?;
    write_multi_monitor_choice(&mut transaction, Some(value)).await?;
    transaction
        .commit()
        .await
        .map_err(|error| error.to_string())
}

async fn write_multi_monitor_choice(
    connection: &mut sqlx::SqliteConnection,
    value: Option<bool>,
) -> Result<(), String> {
    if let Some(value) = value {
        sqlx::query(
            "INSERT INTO config (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        )
        .bind(MULTI_MONITOR_KEY)
        .bind(if value { "true" } else { "false" })
        .execute(&mut *connection)
        .await
        .map_err(|_| "Could not write canonical monitor preference")?;
    }
    sqlx::query(
        "INSERT INTO config (key, value) VALUES (?, '1')
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(MULTI_MONITOR_MIGRATION_KEY)
    .execute(connection)
    .await
    .map_err(|_| "Could not write canonical migration marker")?;
    Ok(())
}

/// Creates the `config` table in `appconfig.db` and inserts default values if missing.
async fn ensure_app_config_defaults(pool: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)")
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;

    let default_workday =
        serde_json::to_string(&default_workday_config()).map_err(|error| error.to_string())?;
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
        (
            "blinkEyeReminderScreenText",
            "Pause! Look into the distance, and best if you walk a bit.",
        ),
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

/// Skip an owned session, or acknowledge expiry; rejects strict, early and stale requests.
#[tauri::command]
pub async fn skip_reminder(
    app_handle: AppHandle,
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    session_id: u64,
    snoozed: bool,
) -> Result<(), String> {
    let _skipping = scheduler.skipping.lock().await;
    let reason = if snoozed {
        FinishReason::Skip
    } else {
        FinishReason::Expired
    };
    {
        let state = scheduler.state()?;
        let session = state.session.as_ref().ok_or("No active reminder.")?;
        session.authorize_finish(session_id, Some(window.label()), reason, Instant::now())?;
    }
    if snoozed {
        let stats =
            crate::snooze_tracker::get_break_stats(app_handle.clone(), scheduler.clone()).await?;
        if !stats.can_snooze {
            return Err("Snooze limit reached for this session or today.".into());
        }
    }
    scheduler
        .finish_session(&app_handle, session_id, Some(window.label()), reason)
        .await
}

/// Show a stat-neutral, dismissible preview using saved settings and an optional premium theme.
#[tauri::command]
pub async fn preview_reminder(
    app_handle: AppHandle,
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    style: Option<String>,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("Open previews from the dashboard.".into());
    }
    scheduler.refresh_settings().await?;
    scheduler
        .start_session(&app_handle, ReminderKind::Preview, style)
        .await
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReminderStatus {
    #[serde(flatten)]
    config: ReminderWindowConfig,
    control_window_label: Option<String>,
    remaining_ms: u64,
}

/// Read the monotonic remaining duration and settings of this window's owned session.
#[tauri::command]
pub fn get_reminder_status(
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    session_id: u64,
) -> Result<ReminderStatus, String> {
    scheduler.status(session_id, Some(window.label()))
}

/// Claim the one completion sound for the current primary window in the final second.
#[tauri::command]
pub fn claim_reminder_audio(
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    session_id: u64,
) -> Result<bool, String> {
    let mut state = scheduler.state()?;
    let session = state
        .session
        .as_mut()
        .filter(|session| session.id == session_id)
        .ok_or("No matching reminder session.")?;
    Ok(session.claim_audio(window.label(), Instant::now()))
}

/// Dismiss an owned preview without accounting or changing the actual-break interval.
#[tauri::command]
pub async fn dismiss_reminder_preview(
    app_handle: AppHandle,
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
    session_id: u64,
) -> Result<(), String> {
    scheduler
        .finish_session(
            &app_handle,
            session_id,
            Some(window.label()),
            FinishReason::DismissPreview,
        )
        .await
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

/// Start an actual break from the dashboard, respecting saved output and premium settings.
#[tauri::command]
pub async fn show_reminder_now(
    app_handle: AppHandle,
    window: tauri::WebviewWindow,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("Start breaks from the dashboard.".into());
    }
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
    let state = scheduler.state()?;
    let elapsed = state.seconds_since_last_break;
    let interval = state.settings.interval_secs;

    let remaining = if state.is_on_break() {
        0
    } else if elapsed >= interval {
        0
    } else {
        interval - elapsed
    };

    Ok(NextReminderInfo {
        next_reminder_in_secs: remaining,
        interval_secs: interval,
        is_on_break: state.is_on_break(),
        is_inside_workday: is_inside_workday_window(&state.settings),
        duration_secs: state.settings.duration_secs,
    })
}

#[cfg(test)]
mod tests {
    use super::{is_inside_workday_window, ReminderSettings, WorkdayHours};
    use std::collections::HashMap;

    struct ConfigProfile(std::path::PathBuf);

    impl ConfigProfile {
        fn new() -> Self {
            static NEXT: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
            let root = std::env::temp_dir().join(format!(
                "blink-eye-migration-{}-{}",
                std::process::id(),
                NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
            ));
            std::fs::create_dir_all(root.join("config")).unwrap();
            std::fs::create_dir_all(root.join("data")).unwrap();
            Self(root)
        }

        fn scheduler(&self) -> std::sync::Arc<super::ReminderScheduler> {
            let (tx, _rx) = tokio::sync::mpsc::channel(1);
            super::ReminderScheduler::new(self.0.join("data"), tx)
        }

        fn legacy_path(&self) -> std::path::PathBuf {
            self.0.join("config/appconfig.db")
        }

        fn canonical_path(&self) -> std::path::PathBuf {
            self.0.join("data/appconfig.db")
        }

        async fn canonical(&self, value: &str) -> sqlx::Pool<sqlx::Sqlite> {
            let pool = self
                .scheduler()
                .open_sqlite_pool("appconfig.db", true)
                .await
                .unwrap();
            super::ensure_app_config_defaults(&pool).await.unwrap();
            sqlx::query("UPDATE config SET value = ? WHERE key = 'isMultiMonitorEnabled'")
                .bind(value)
                .execute(&pool)
                .await
                .unwrap();
            pool
        }

        async fn migrate(&self, pool: &sqlx::Pool<sqlx::Sqlite>) -> Result<(), String> {
            super::migrate_multi_monitor_preference(
                pool,
                &self.canonical_path(),
                &self.legacy_path(),
            )
            .await
        }

        async fn legacy(&self, value: &str) -> sqlx::Pool<sqlx::Sqlite> {
            let pool = super::SqlitePoolOptions::new()
                .max_connections(2)
                .connect_with(
                    super::SqliteConnectOptions::new()
                        .filename(self.legacy_path())
                        .create_if_missing(true),
                )
                .await
                .unwrap();
            super::ensure_app_config_defaults(&pool).await.unwrap();
            sqlx::query("UPDATE config SET value = ? WHERE key = 'isMultiMonitorEnabled'")
                .bind(value)
                .execute(&pool)
                .await
                .unwrap();
            pool
        }
    }

    impl Drop for ConfigProfile {
        fn drop(&mut self) {
            std::fs::remove_dir_all(&self.0).unwrap();
        }
    }

    #[tokio::test]
    async fn multi_monitor_migration_preserves_released_ui_choice_at_startup() {
        // Given separate old SQL-plugin and canonical stores with conflicting values.
        let profile = ConfigProfile::new();
        let legacy = profile.legacy("true").await;
        let scheduler = profile.scheduler();
        let canonical = scheduler
            .open_sqlite_pool("appconfig.db", true)
            .await
            .unwrap();
        super::ensure_app_config_defaults(&canonical).await.unwrap();

        // When the existing startup settings path loads the profile.
        scheduler
            .prepare_settings(&profile.legacy_path())
            .await
            .unwrap();

        // Then the released UI's saved choice must be the scheduler's choice.
        let observed = scheduler.state().unwrap().settings.is_multi_monitor_enabled;
        assert_eq!(
            observed, true,
            "released UI=true, canonical default=false; startup must retain the UI choice"
        );
        canonical.close().await;
        legacy.close().await;
    }

    async fn monitor_choice(pool: &sqlx::Pool<sqlx::Sqlite>) -> (String, Option<String>) {
        let (value,): (String,) =
            sqlx::query_as("SELECT value FROM config WHERE key = 'isMultiMonitorEnabled'")
                .fetch_one(pool)
                .await
                .unwrap();
        let marker: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
            .bind(super::MULTI_MONITOR_MIGRATION_KEY)
            .fetch_optional(pool)
            .await
            .unwrap();
        (value, marker.map(|(value,)| value))
    }

    #[tokio::test]
    async fn multi_monitor_migration_imports_both_booleans_without_touching_other_data() {
        for (old, current) in [("true", "false"), ("false", "true")] {
            // Given conflicting choices and unrelated canonical and legacy records.
            let profile = ConfigProfile::new();
            let legacy = profile.legacy(old).await;
            let canonical = profile.canonical(current).await;
            for pool in [&legacy, &canonical] {
                sqlx::raw_sql(
                    "INSERT INTO config VALUES ('unrelated-setting', 'unchanged');
                     CREATE TABLE unrelated_data (license TEXT, trial TEXT, todo TEXT);
                     INSERT INTO unrelated_data VALUES ('license', 'trial', 'todo');",
                )
                .execute(pool)
                .await
                .unwrap();
            }
            let before: Vec<(String, Option<String>)> =
                sqlx::query_as("SELECT key, value FROM config ORDER BY key")
                    .fetch_all(&canonical)
                    .await
                    .unwrap();
            legacy.close().await;
            let legacy_bytes = std::fs::read(profile.legacy_path()).unwrap();
            let mut permissions = std::fs::metadata(profile.legacy_path())
                .unwrap()
                .permissions();
            permissions.set_readonly(true);
            std::fs::set_permissions(profile.legacy_path(), permissions).unwrap();

            // When importing from a read-only legacy database and restarting.
            profile.migrate(&canonical).await.unwrap();
            canonical.close().await;
            let canonical = profile
                .scheduler()
                .open_sqlite_pool("appconfig.db", false)
                .await
                .unwrap();
            profile.migrate(&canonical).await.unwrap();

            // Then only the canonical preference and marker change.
            assert_eq!(
                monitor_choice(&canonical).await,
                (old.into(), Some("1".into()))
            );
            let after: Vec<(String, Option<String>)> =
                sqlx::query_as("SELECT key, value FROM config ORDER BY key")
                    .fetch_all(&canonical)
                    .await
                    .unwrap();
            assert_eq!(
                before
                    .into_iter()
                    .filter(|(key, _)| key != super::MULTI_MONITOR_KEY)
                    .collect::<Vec<_>>(),
                after
                    .into_iter()
                    .filter(|(key, _)| {
                        key != super::MULTI_MONITOR_KEY && key != super::MULTI_MONITOR_MIGRATION_KEY
                    })
                    .collect::<Vec<_>>()
            );
            let unrelated: (String, String, String) =
                sqlx::query_as("SELECT license, trial, todo FROM unrelated_data")
                    .fetch_one(&canonical)
                    .await
                    .unwrap();
            assert_eq!(unrelated, ("license".into(), "trial".into(), "todo".into()));
            assert_eq!(std::fs::read(profile.legacy_path()).unwrap(), legacy_bytes);
            let scheduler = profile.scheduler();
            scheduler.refresh_settings().await.unwrap();
            assert_eq!(
                scheduler.state().unwrap().settings.is_multi_monitor_enabled,
                old == "true"
            );
            canonical.close().await;
        }
    }

    #[tokio::test]
    async fn multi_monitor_migration_preserves_canonical_when_source_is_absent_or_same() {
        for source in ["missing", "missing-key", "same"] {
            // Given a canonical choice and no distinct old preference.
            let profile = ConfigProfile::new();
            let canonical = profile.canonical("true").await;
            if source == "missing-key" {
                let legacy = profile.legacy("false").await;
                sqlx::query("DELETE FROM config WHERE key = 'isMultiMonitorEnabled'")
                    .execute(&legacy)
                    .await
                    .unwrap();
                legacy.close().await;
            }
            let legacy_path = if source == "same" {
                profile.canonical_path()
            } else {
                profile.legacy_path()
            };

            // When startup attempts migration.
            super::migrate_multi_monitor_preference(
                &canonical,
                &profile.canonical_path(),
                &legacy_path,
            )
            .await
            .unwrap();

            // Then completion preserves the canonical choice without creating a source.
            assert_eq!(
                monitor_choice(&canonical).await,
                ("true".into(), Some("1".into()))
            );
            if source == "missing" {
                assert!(!profile.legacy_path().exists());
            }
            canonical.close().await;
        }
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn multi_monitor_migration_preserves_canonical_when_source_aliases_same_file() {
        // Given distinct resolver paths that name the same database.
        let profile = ConfigProfile::new();
        let canonical = profile.canonical("true").await;
        std::os::unix::fs::symlink(profile.canonical_path(), profile.legacy_path()).unwrap();

        // When startup compares the actual files.
        profile.migrate(&canonical).await.unwrap();

        // Then the canonical value is preserved and import is complete.
        assert_eq!(
            monitor_choice(&canonical).await,
            ("true".into(), Some("1".into()))
        );
        canonical.close().await;
    }

    #[tokio::test]
    async fn multi_monitor_migration_leaves_invalid_or_unreadable_source_unmarked() {
        for source in [
            "TRUE",
            "1",
            "",
            " true ",
            "null",
            "corrupt",
            "no-table",
            "directory",
        ] {
            // Given malformed values or a database that cannot supply the preference.
            let profile = ConfigProfile::new();
            let canonical = profile.canonical("true").await;
            match source {
                "corrupt" => {
                    std::fs::write(profile.legacy_path(), b"not a SQLite database").unwrap()
                }
                "directory" => std::fs::create_dir(profile.legacy_path()).unwrap(),
                _ => {
                    let legacy = profile.legacy(source).await;
                    if source == "null" {
                        sqlx::query(
                            "UPDATE config SET value = NULL WHERE key = 'isMultiMonitorEnabled'",
                        )
                        .execute(&legacy)
                        .await
                        .unwrap();
                    } else if source == "no-table" {
                        sqlx::query("DROP TABLE config")
                            .execute(&legacy)
                            .await
                            .unwrap();
                    }
                    legacy.close().await;
                }
            }

            // When import fails and startup continues with canonical settings.
            assert!(profile.migrate(&canonical).await.is_err(), "{source}");
            let scheduler = profile.scheduler();
            scheduler
                .prepare_settings(&profile.legacy_path())
                .await
                .unwrap();

            // Then the old file is retained and explicit recovery seals the new choice.
            assert_eq!(
                monitor_choice(&canonical).await,
                ("true".into(), None),
                "{source}"
            );
            assert!(scheduler.state().unwrap().settings.is_multi_monitor_enabled);
            assert!(profile.legacy_path().exists());
            super::save_multi_monitor_preference(&canonical, false)
                .await
                .unwrap();
            profile.migrate(&canonical).await.unwrap();
            assert_eq!(
                monitor_choice(&canonical).await,
                ("false".into(), Some("1".into()))
            );
            scheduler.refresh_settings().await.unwrap();
            assert!(!scheduler.state().unwrap().settings.is_multi_monitor_enabled);
            canonical.close().await;
        }
    }

    #[tokio::test]
    async fn multi_monitor_migration_never_overwrites_completed_or_explicit_choices() {
        for save_first in [false, true] {
            // Given an unmarked profile with an old true selection.
            let profile = ConfigProfile::new();
            let legacy = profile.legacy("true").await;
            let canonical = profile.canonical("false").await;

            // When a user saves before import, or after a successful import.
            if !save_first {
                profile.migrate(&canonical).await.unwrap();
            }
            super::save_multi_monitor_preference(&canonical, false)
                .await
                .unwrap();
            sqlx::query("UPDATE config SET value = 'invalid' WHERE key = 'isMultiMonitorEnabled'")
                .execute(&legacy)
                .await
                .unwrap();
            legacy.close().await;
            profile.migrate(&canonical).await.unwrap();

            // Then future startup skips even an invalid legacy source.
            assert_eq!(
                monitor_choice(&canonical).await,
                ("false".into(), Some("1".into()))
            );
            canonical.close().await;
        }
    }

    #[tokio::test]
    async fn multi_monitor_migration_rolls_back_value_and_marker_on_write_or_commit_failure() {
        for failure in ["write", "commit"] {
            // Given a real SQLite failure after writing the preference.
            let profile = ConfigProfile::new();
            let legacy = profile.legacy("true").await;
            let canonical = profile.canonical("false").await;
            let sql = if failure == "write" {
                "CREATE TRIGGER reject_marker BEFORE INSERT ON config
                 WHEN NEW.key = 'multiMonitorPreferenceMigrationVersion'
                 BEGIN SELECT RAISE(ABORT, 'test marker failure'); END;"
            } else {
                "CREATE TABLE accepted_versions (version TEXT PRIMARY KEY);
                 CREATE TABLE migration_audit (
                   version TEXT REFERENCES accepted_versions(version) DEFERRABLE INITIALLY DEFERRED
                 );
                 CREATE TRIGGER reject_marker AFTER INSERT ON config
                 WHEN NEW.key = 'multiMonitorPreferenceMigrationVersion'
                 BEGIN INSERT INTO migration_audit VALUES (NEW.value); END;"
            };
            sqlx::raw_sql(sql).execute(&canonical).await.unwrap();

            // When migration and explicit save encounter the failing statement or commit.
            assert!(profile.migrate(&canonical).await.is_err(), "{failure}");
            assert_eq!(
                monitor_choice(&canonical).await,
                ("false".into(), None),
                "{failure}"
            );
            assert!(super::save_multi_monitor_preference(&canonical, true)
                .await
                .is_err());

            // Then neither operation exposes a split value/marker, and recovery can retry.
            assert_eq!(
                monitor_choice(&canonical).await,
                ("false".into(), None),
                "{failure}"
            );
            sqlx::query("DROP TRIGGER reject_marker")
                .execute(&canonical)
                .await
                .unwrap();
            profile.migrate(&canonical).await.unwrap();
            assert_eq!(
                monitor_choice(&canonical).await,
                ("true".into(), Some("1".into()))
            );
            canonical.close().await;
            legacy.close().await;
        }
    }

    #[tokio::test]
    async fn multi_monitor_migration_serializes_both_startup_and_save_orderings() {
        for migration_first in [true, false] {
            // Given two independent canonical pools and a held SQLite writer transaction.
            let profile = ConfigProfile::new();
            let legacy = profile.legacy("true").await;
            let canonical = profile.canonical("false").await;
            let other = profile
                .scheduler()
                .open_sqlite_pool("appconfig.db", true)
                .await
                .unwrap();
            let mut writer = canonical.begin_with("BEGIN IMMEDIATE").await.unwrap();
            if migration_first {
                super::migrate_multi_monitor_transaction(
                    &mut writer,
                    &profile.canonical_path(),
                    &profile.legacy_path(),
                )
                .await
                .unwrap();
            } else {
                super::write_multi_monitor_choice(&mut writer, Some(false))
                    .await
                    .unwrap();
            }
            let (started, ready) = tokio::sync::oneshot::channel();
            let canonical_path = profile.canonical_path();
            let legacy_path = profile.legacy_path();
            let contender_pool = other.clone();
            let mut contenders = tokio::task::JoinSet::new();
            contenders.spawn(async move {
                started.send(()).unwrap();
                if migration_first {
                    super::save_multi_monitor_preference(&contender_pool, false).await
                } else {
                    super::migrate_multi_monitor_preference(
                        &contender_pool,
                        &canonical_path,
                        &legacy_path,
                    )
                    .await
                }
            });

            // When the second writer starts while the first has not committed.
            tokio::time::timeout(super::Duration::from_secs(5), ready)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(monitor_choice(&other).await, ("false".into(), None));
            writer.commit().await.unwrap();
            tokio::time::timeout(super::Duration::from_secs(5), contenders.join_next())
                .await
                .unwrap()
                .unwrap()
                .unwrap()
                .unwrap();

            // Then migration-before-save and save-before-migration both retain the explicit choice.
            assert_eq!(
                monitor_choice(&other).await,
                ("false".into(), Some("1".into()))
            );
            assert_eq!(
                monitor_choice(&canonical).await,
                monitor_choice(&other).await
            );
            other.close().await;
            canonical.close().await;
            legacy.close().await;
        }
    }

    fn actual_session() -> super::ReminderSession {
        super::ReminderSession {
            id: 7,
            kind: super::ReminderKind::Actual,
            deadline: super::Instant::now() + super::Duration::from_secs(20),
            strict: false,
            labels: vec!["reminder_actual_7_0".into()],
            control_window: Some("reminder_actual_7_0".into()),
            audio_claimed: false,
            active: true,
            config: super::ReminderWindowConfig {
                session_id: 7,
                kind: super::ReminderKind::Actual,
                background_style: "default".into(),
                reminder_text: "Rest".into(),
                is_premium: false,
                is_strict_mode: false,
                use_circle_timer: true,
                duration_secs: 20,
                screen_time_hours: 0,
                screen_time_minutes: 0,
                is_update_available: false,
            },
            cancel: None,
        }
    }

    #[test]
    fn strict_session_rejects_skip() {
        let session = super::ReminderSession {
            strict: true,
            ..actual_session()
        };
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::Skip,
                session.deadline - super::Duration::from_secs(1)
            )
            .is_err());
    }

    #[test]
    fn early_renderer_completion_is_rejected() {
        let session = actual_session();
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::Expired,
                session.deadline - super::Duration::from_secs(1)
            )
            .is_err());
    }

    #[test]
    fn stale_generation_cannot_finish_current_session() {
        let session = actual_session();
        let now = session.deadline - super::Duration::from_secs(1);
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::Skip,
                now
            )
            .is_ok());
        assert!(session
            .authorize_finish(
                6,
                Some("reminder_actual_7_0"),
                super::FinishReason::Skip,
                now
            )
            .is_err());
    }

    #[test]
    fn main_window_cannot_finish_actual_session() {
        let session = actual_session();
        let now = session.deadline - super::Duration::from_secs(1);
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::Skip,
                now
            )
            .is_ok());
        assert!(session
            .authorize_finish(7, Some("main"), super::FinishReason::Skip, now)
            .is_err());
    }

    #[test]
    fn strict_preview_is_always_dismissible() {
        let session = super::ReminderSession {
            strict: true,
            kind: super::ReminderKind::Preview,
            ..actual_session()
        };
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::DismissPreview,
                session.deadline - super::Duration::from_secs(10)
            )
            .is_ok());
    }

    #[test]
    fn duplicate_terminal_transition_is_rejected() {
        let session = actual_session();
        let deadline = session.deadline;
        let mut state = super::SchedulerState {
            session: Some(session),
            ..Default::default()
        };
        let first = state
            .claim_finish(7, None, super::FinishReason::Expired, deadline)
            .unwrap();
        assert!(state
            .claim_finish(7, None, super::FinishReason::Expired, deadline)
            .is_err());
        assert_eq!(first.kind, super::ReminderKind::Actual);
    }

    #[test]
    fn preview_does_not_reset_break_interval() {
        let session = super::ReminderSession {
            kind: super::ReminderKind::Preview,
            ..actual_session()
        };
        let now = session.deadline;
        let mut state = super::SchedulerState {
            seconds_since_last_break: 53,
            session: Some(session),
            ..Default::default()
        };
        state
            .claim_finish(7, None, super::FinishReason::DismissPreview, now)
            .unwrap();
        assert_eq!(state.seconds_since_last_break, 53);
    }

    #[test]
    fn stale_terminal_transition_leaves_current_session_owned() {
        let session = actual_session();
        let deadline = session.deadline;
        let mut state = super::SchedulerState {
            session: Some(session),
            ..Default::default()
        };
        assert!(state
            .claim_finish(6, None, super::FinishReason::Expired, deadline)
            .is_err());
        assert_eq!(state.session.unwrap().id, 7);
    }

    #[test]
    fn failed_or_preparing_presentation_never_earns_completion_credit() {
        let session = super::ReminderSession {
            active: false,
            ..actual_session()
        };
        assert_eq!(session.accounting(super::FinishReason::Expired), None);
        assert_eq!(
            actual_session().accounting(super::FinishReason::Abort),
            None
        );
    }

    #[test]
    fn preview_never_records_completion_or_snooze() {
        let session = super::ReminderSession {
            kind: super::ReminderKind::Preview,
            ..actual_session()
        };
        assert_eq!(session.accounting(super::FinishReason::Expired), None);
        assert_eq!(
            session.accounting(super::FinishReason::DismissPreview),
            None
        );
    }

    #[test]
    fn sound_is_claimed_once_even_after_control_promotion() {
        let mut session = actual_session();
        session.config.is_premium = true;
        let now = session.deadline - super::Duration::from_millis(800);
        assert!(session.claim_audio("reminder_actual_7_0", now));
        session.control_window = Some("reminder_actual_7_1".into());
        assert!(!session.claim_audio("reminder_actual_7_1", now));
    }

    #[test]
    fn secondary_or_early_audio_claim_does_not_consume_primary_sound() {
        let mut session = actual_session();
        session.config.is_premium = true;
        let now = session.deadline - super::Duration::from_millis(800);
        assert!(!session.claim_audio("reminder_actual_7_1", now));
        assert!(!session.claim_audio("reminder_actual_7_0", now - super::Duration::from_secs(1)));
        assert!(session.claim_audio("reminder_actual_7_0", now));
    }

    #[test]
    fn any_owned_output_can_skip_the_shared_session() {
        let mut session = actual_session();
        session.labels.push("reminder_actual_7_1".into());
        let now = session.deadline - super::Duration::from_secs(2);
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_1"),
                super::FinishReason::Skip,
                now
            )
            .is_ok());
        session.control_window = Some("reminder_actual_7_1".into());
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_1"),
                super::FinishReason::Skip,
                now
            )
            .is_ok());
    }

    #[test]
    fn output_removal_promotes_controls_without_resetting_the_deadline() {
        let (tray, _updates) = tokio::sync::mpsc::channel(1);
        let scheduler = super::ReminderScheduler::new(std::path::PathBuf::new(), tray);
        let mut session = actual_session();
        session.labels.push("reminder_actual_7_1".into());
        let deadline = session.deadline;
        scheduler.state().unwrap().session = Some(session);
        scheduler.remove_window(7, "reminder_actual_7_0").unwrap();
        scheduler
            .promote_controls(7, "reminder_actual_7_1")
            .unwrap();
        let state = scheduler.state().unwrap();
        let session = state.session.as_ref().unwrap();
        assert_eq!(session.deadline, deadline);
        assert_eq!(
            session.control_window.as_deref(),
            Some("reminder_actual_7_1")
        );
        assert_eq!(session.labels, vec!["reminder_actual_7_1"]);
    }

    #[test]
    fn simultaneous_owned_output_skips_have_one_terminal_winner() {
        let mut session = actual_session();
        session.labels.push("reminder_actual_7_1".into());
        let now = session.deadline - super::Duration::from_secs(5);
        let mut state = super::SchedulerState {
            session: Some(session),
            ..Default::default()
        };
        let winner = state
            .claim_finish(
                7,
                Some("reminder_actual_7_1"),
                super::FinishReason::Skip,
                now,
            )
            .unwrap();
        assert!(state
            .claim_finish(
                7,
                Some("reminder_actual_7_0"),
                super::FinishReason::Skip,
                now
            )
            .is_err());
        assert_eq!(winner.accounting(super::FinishReason::Skip), Some(false));
    }

    #[test]
    fn strict_mode_rejects_skip_from_a_secondary_too() {
        let mut session = super::ReminderSession {
            strict: true,
            ..actual_session()
        };
        session.labels.push("reminder_actual_7_1".into());
        let now = session.deadline - super::Duration::from_secs(5);
        assert!(session
            .authorize_finish(
                7,
                Some("reminder_actual_7_1"),
                super::FinishReason::Skip,
                now
            )
            .is_err());
    }

    #[test]
    fn shutdown_cancels_the_generation_without_accounting() {
        let (tray, _updates) = tokio::sync::mpsc::channel(1);
        let scheduler = super::ReminderScheduler::new(std::path::PathBuf::new(), tray);
        let (cancel, mut cancelled) = tokio::sync::oneshot::channel();
        let session = super::ReminderSession {
            cancel: Some(cancel),
            ..actual_session()
        };
        scheduler.state().unwrap().session = Some(session);
        scheduler.shutdown();
        let state = scheduler.state().unwrap();
        assert!(state.shutting_down);
        assert!(state.session.is_none());
        assert_eq!(
            cancelled.try_recv(),
            Err(tokio::sync::oneshot::error::TryRecvError::Closed)
        );
    }

    #[test]
    fn stale_output_callback_cannot_register_into_new_generation() {
        let (tray, _updates) = tokio::sync::mpsc::channel(1);
        let scheduler = super::ReminderScheduler::new(std::path::PathBuf::new(), tray);
        scheduler.state().unwrap().session = Some(actual_session());
        assert!(scheduler
            .register_window(6, "reminder_actual_6_1", true)
            .is_err());
        scheduler.remove_window(6, "reminder_actual_7_0").unwrap();
        assert!(scheduler.owns_window(7, "reminder_actual_7_0"));
    }

    #[tokio::test(start_paused = true)]
    async fn deadline_expires_without_renderer_or_scheduler_ticks() {
        let deadline = super::Instant::now() + super::Duration::from_secs(20);
        let (_cancel, cancelled) = tokio::sync::oneshot::channel();
        let (started, ready) = tokio::sync::oneshot::channel();
        let task = tokio::spawn(async move {
            started.send(()).unwrap();
            super::wait_for_expiry(deadline, cancelled, || {}).await
        });
        ready.await.unwrap();
        tokio::time::advance(super::Duration::from_secs(20)).await;
        assert!(task.await.unwrap());
    }

    #[tokio::test(start_paused = true)]
    async fn cancelled_generation_does_not_fire_later() {
        let deadline = super::Instant::now() + super::Duration::from_secs(20);
        let (cancel, cancelled) = tokio::sync::oneshot::channel();
        let task = tokio::spawn(super::wait_for_expiry(deadline, cancelled, || {}));
        drop(cancel);
        assert!(!task.await.unwrap());
    }

    #[tokio::test]
    async fn persistence_failure_happens_after_cleanup() {
        let cleaned = std::cell::Cell::new(false);
        let result = super::cleanup_before_accounting(
            async {
                cleaned.set(true);
                Ok(())
            },
            async {
                assert!(cleaned.get());
                Err("database unavailable".into())
            },
        )
        .await;
        assert_eq!(result, Err("database unavailable".into()));
        assert!(cleaned.get());
    }

    #[tokio::test]
    async fn cleanup_failure_cannot_credit_a_break() {
        let credited = std::cell::Cell::new(false);
        let result =
            super::cleanup_before_accounting(async { Err("presentation failed".into()) }, async {
                credited.set(true);
                Ok(())
            })
            .await;
        assert!(result.is_err());
        assert!(!credited.get());
    }

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
