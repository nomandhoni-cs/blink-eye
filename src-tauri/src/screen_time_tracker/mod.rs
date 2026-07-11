// src-tauri/src/screen_time_tracker/mod.rs
use chrono::Local;
use sqlx::{Pool, Sqlite, SqlitePool};
use std::sync::{Arc, Mutex};
use std::time::{Duration as StdDuration, Instant};
use tauri::async_runtime::spawn;
use tokio::time::{interval, Duration, MissedTickBehavior};

// How often we check if the screen is on and update the database.
// Every 60 seconds balances accuracy with low CPU usage.
const TRACKING_INTERVAL_SECS: u64 = 60;

// If the gap between the last recorded timestamp and the current tick exceeds
// this threshold, we treat it as a new session (e.g., after sleep/suspend).
// Set to tracking interval (60s) + 30s buffer to tolerate minor delays.
const MAX_CONTIGUOUS_GAP_MS: i64 = (TRACKING_INTERVAL_SECS as i64 * 1000) + 30_000;

// Avoid spawning external processes every scheduler tick (1s).
// Native checks are cheap; process-based fallbacks are expensive and can flash
// console windows on Windows if not hidden.
const SCREEN_ON_CACHE_TTL: StdDuration = StdDuration::from_secs(5);

/// Tracks how long the user's screen has been on by periodically checking
/// display power state and recording session data to SQLite.
///
/// ## Data Model
///
/// Each row in `time_data` represents a contiguous "screen on" session:
///
/// ```text
/// | id | date       | first_timestamp  | second_timestamp |
/// |----|------------|------------------|------------------|
/// | 1  | 2026-07-07 | 1720339200000    | 1720339260000    |
/// ```
///
/// - `first_timestamp`: When the session started (ms since epoch, local time)
/// - `second_timestamp`: When the session was last updated (extended)
///
/// On each tick, if the screen is still on:
///   - If the gap from `second_timestamp` is small → extend the session
///     (update `second_timestamp` to now)
///   - If the gap is too large (sleep/suspend) or clock went backwards →
///     start a new session (insert a new row)
///
/// The frontend sums `(second_timestamp - first_timestamp)` for all rows
/// on a given date to compute total screen-on time.
pub struct ScreenTimeTracker {
    db_pool: Arc<Pool<Sqlite>>,
}

/// Decision logic for whether to extend the current session or start a new one.
#[derive(Debug, Eq, PartialEq)]
enum TimeDataUpdate {
    /// The screen was on continuously — update `second_timestamp` to now.
    ExtendCurrentSession,
    /// A gap was detected (sleep, suspend, or clock change) — insert a new row.
    StartNewSession,
}

struct ScreenOnCache {
    value: bool,
    checked_at: Instant,
}

impl ScreenTimeTracker {
    /// Create a new tracker and ensure the `time_data` table exists.
    pub async fn new(db_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let db_pool = SqlitePool::connect(db_path).await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS time_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                first_timestamp INTEGER NOT NULL,
                second_timestamp INTEGER NOT NULL
            )
            "#,
        )
        .execute(&db_pool)
        .await?;

        println!("[DB] Database loaded and table ensured.");

        Ok(Self {
            db_pool: Arc::new(db_pool),
        })
    }

    /// Current date as `YYYY-MM-DD` in local timezone.
    fn get_current_date() -> String {
        Local::now().format("%Y-%m-%d").to_string()
    }

    /// Current time as milliseconds since Unix epoch (local timezone).
    fn get_current_local_timestamp() -> i64 {
        Local::now().timestamp_millis()
    }

    /// Decide whether to extend the existing session or start a new one.
    ///
    /// A new session is started when:
    /// 1. The current timestamp is earlier than either stored timestamp
    ///    (clock went backwards — e.g., NTP sync or manual change)
    /// 2. The gap since `second_timestamp` exceeds `MAX_CONTIGUOUS_GAP_MS`
    ///    (screen was likely off — sleep, suspend, or locked for a while)
    fn classify_time_data_update(
        timestamp: i64,
        first_timestamp: i64,
        second_timestamp: i64,
    ) -> TimeDataUpdate {
        // Clock moved backwards — unreliable, start fresh
        if timestamp < first_timestamp || timestamp < second_timestamp {
            return TimeDataUpdate::StartNewSession;
        }

        // Gap too large — screen was probably off during this period
        if timestamp - second_timestamp > MAX_CONTIGUOUS_GAP_MS {
            return TimeDataUpdate::StartNewSession;
        }

        TimeDataUpdate::ExtendCurrentSession
    }

    /// Check if the display is currently powered on (platform-specific).
    ///
    /// Result is cached briefly so the 1s reminder tick does not spawn
    /// external processes (PowerShell/xset/dbus-send) every second.
    pub(crate) fn is_screen_on() -> bool {
        static CACHE: Mutex<Option<ScreenOnCache>> = Mutex::new(None);

        if let Ok(cache) = CACHE.lock() {
            if let Some(entry) = cache.as_ref() {
                if entry.checked_at.elapsed() < SCREEN_ON_CACHE_TTL {
                    return entry.value;
                }
            }
        }

        let value = platform::is_screen_on();

        if let Ok(mut cache) = CACHE.lock() {
            *cache = Some(ScreenOnCache {
                value,
                checked_at: Instant::now(),
            });
        }

        value
    }

    /// Insert a new session row for the given date.
    ///
    /// Both `first_timestamp` and `second_timestamp` are set to now,
    /// since this marks the start of a new tracking session.
    async fn initialize_new_date(&self, date: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Self::get_current_local_timestamp();

        sqlx::query(
            "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
        )
        .bind(date)
        .bind(timestamp)
        .bind(timestamp)
        .execute(self.db_pool.as_ref())
        .await?;

        println!(
            "[initializeNewDate] Inserted new row for date {} with timestamp {}",
            date, timestamp
        );

        Ok(())
    }

    /// Update the most recent session row for the given date.
    ///
    /// Fetches the latest row, classifies the update, then either:
    /// - Extends the session by updating `second_timestamp`
    /// - Starts a new session by inserting a new row
    async fn update_last_time_data(&self, date: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Self::get_current_local_timestamp();

        let result = sqlx::query_as::<_, (i64, i64, i64)>(
            "SELECT id, first_timestamp, second_timestamp FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1",
        )
        .bind(date)
        .fetch_optional(self.db_pool.as_ref())
        .await?;

        if let Some((id, first_timestamp, second_timestamp)) = result {
            match Self::classify_time_data_update(timestamp, first_timestamp, second_timestamp) {
                TimeDataUpdate::ExtendCurrentSession => {
                    sqlx::query("UPDATE time_data SET second_timestamp = ? WHERE id = ?")
                        .bind(timestamp)
                        .bind(id)
                        .execute(self.db_pool.as_ref())
                        .await?;

                    println!(
                        "[updateLastTimeData] Updated record id {} with timestamp {}",
                        id, timestamp
                    );
                }
                TimeDataUpdate::StartNewSession => {
                    println!(
                        "[updateLastTimeData] Session gap or clock change detected. Inserting new row."
                    );
                    self.initialize_new_date(date).await?;
                }
            }
        } else {
            // No records exist for today yet — create the first one
            println!("[updateLastTimeData] No record found for date. Inserting new row.");
            self.initialize_new_date(date).await?;
        }

        Ok(())
    }

    /// Spawn the background tracking loop on Tauri's async runtime.
    ///
    /// The loop runs forever, ticking every `TRACKING_INTERVAL_SECS`:
    /// 1. Skip if screen is off
    /// 2. If date rolled over (midnight), initialize a new date row
    /// 3. Otherwise, extend or start a new session for today
    pub fn start_tracking(self) {
        spawn(async move {
            let current_date = Self::get_current_date();

            // Create the first row if screen is already on at startup
            if Self::is_screen_on() {
                if let Err(e) = self.initialize_new_date(&current_date).await {
                    eprintln!("[ScreenTimeTracker] Error initializing date: {}", e);
                }
            } else {
                println!("[ScreenTimeTracker] Display is off. Waiting to start tracking.");
            }

            let mut last_date = current_date;
            let mut interval = interval(Duration::from_secs(TRACKING_INTERVAL_SECS));
            // If a tick is missed (e.g., system suspend), delay the next one
            // instead of firing multiple catch-ups at once.
            interval.set_missed_tick_behavior(MissedTickBehavior::Delay);

            loop {
                interval.tick().await;

                // Don't record time when the screen is off
                if !Self::is_screen_on() {
                    println!("[Interval] Display is off. Skipping screen time update.");
                    continue;
                }

                let current_date = Self::get_current_date();

                // Date changed (midnight crossed) — start tracking the new day
                if current_date != last_date {
                    println!(
                        "[Interval] Date changed from {} to {}",
                        last_date, current_date
                    );
                    if let Err(e) = self.initialize_new_date(&current_date).await {
                        eprintln!("[ScreenTimeTracker] Error initializing new date: {}", e);
                    }
                    last_date = current_date.clone();
                    continue;
                }

                // Normal tick — extend or start a new session
                if let Err(e) = self.update_last_time_data(&current_date).await {
                    eprintln!("[ScreenTimeTracker] Error updating time data: {}", e);
                }
            }
        });
    }
}

// =============================================================================
// Platform-specific screen power detection
// =============================================================================
//
// Each platform has its own `is_screen_on()` implementation with multiple
// fallback strategies. The pattern is: try the most reliable / cheapest method
// first, fall back to alternatives, and default to `true` (assume screen is on)
// if nothing works — better to over-count than miss active time.
//
// macOS:  CoreGraphics + ioreg
// Windows: kernel32 GetDevicePowerState + WMI (hidden PowerShell)
// Linux:  backlight sysfs + X11 DPMS + Wayland D-Bus

#[cfg(target_os = "macos")]
mod platform {
    use std::process::Command;

    type CGDirectDisplayID = u32;
    type CGError = i32;
    type BooleanT = i32;

    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        fn CGDisplayIsAsleep(display: CGDirectDisplayID) -> BooleanT;
        fn CGGetActiveDisplayList(
            max_displays: u32,
            active_displays: *mut CGDirectDisplayID,
            display_count: *mut u32,
        ) -> CGError;
    }

    /// Check if any connected display is powered on.
    ///
    /// Strategy:
    /// 1. CoreGraphics `CGDisplayIsAsleep` API (no process spawn)
    /// 2. Fall back to `ioreg` for `DevicePowerState`
    /// 3. Default to `true` if both fail
    pub fn is_screen_on() -> bool {
        if let Some(is_on) = core_graphics_display_state() {
            return is_on;
        }

        if let Some(is_on) = ioreg_display_power_state() {
            return is_on;
        }

        true
    }

    /// Use CoreGraphics to check if any active display is not asleep.
    ///
    /// `CGDisplayIsAsleep` returns 0 when the display is awake.
    /// We check all connected displays — if ANY is awake, screen is on.
    fn core_graphics_display_state() -> Option<bool> {
        // First call: get the number of active displays
        let mut display_count = 0;
        let count_result =
            unsafe { CGGetActiveDisplayList(0, std::ptr::null_mut(), &mut display_count) };

        if count_result != 0 {
            return None;
        }

        if display_count == 0 {
            return Some(false);
        }

        // Second call: get the actual display IDs
        let mut displays = vec![0; display_count as usize];
        let list_result = unsafe {
            CGGetActiveDisplayList(display_count, displays.as_mut_ptr(), &mut display_count)
        };

        if list_result != 0 {
            return None;
        }

        // `CGDisplayIsAsleep` returns 0 when display is awake
        Some(
            displays
                .into_iter()
                .take(display_count as usize)
                .any(|display| unsafe { CGDisplayIsAsleep(display) == 0 }),
        )
    }

    /// Parse `DevicePowerState` from `ioreg` output.
    ///
    /// Runs: `ioreg -n IODisplayWrangler -r -d 1`
    /// Power state >= 3 means the display is active.
    fn ioreg_display_power_state() -> Option<bool> {
        let output = Command::new("ioreg")
            .args(["-n", "IODisplayWrangler", "-r", "-d", "1"])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_device_power_state(&stdout).map(|state| state >= 3)
    }

    /// Extract the numeric value after `"DevicePowerState"=` from ioreg output.
    ///
    /// Example input: `    "DevicePowerState"=4`
    /// Returns: `Some(4)`
    pub(super) fn parse_device_power_state(output: &str) -> Option<u32> {
        let key_index = output.find("DevicePowerState")?;
        let output_after_key = &output[key_index..];
        let value_index = output_after_key.find('=')?;
        let digits: String = output_after_key[value_index + 1..]
            .chars()
            .skip_while(|character| character.is_whitespace())
            .take_while(|character| character.is_ascii_digit())
            .collect();

        digits.parse().ok()
    }
}

#[cfg(windows)]
mod platform {
    use std::{ffi::c_void, os::windows::process::CommandExt, process::Command};

    type Bool = i32;
    type Dword = u32;
    type Handle = *mut c_void;

    const FILE_SHARE_READ: Dword = 0x0000_0001;
    const FILE_SHARE_WRITE: Dword = 0x0000_0002;
    const OPEN_EXISTING: Dword = 3;
    const INVALID_HANDLE_VALUE: Handle = -1isize as Handle;
    /// Prevents a console window from flashing when spawning PowerShell.
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    #[link(name = "kernel32")]
    extern "system" {
        fn CloseHandle(hObject: Handle) -> Bool;
        fn CreateFileW(
            lpFileName: *const u16,
            dwDesiredAccess: Dword,
            dwShareMode: Dword,
            lpSecurityAttributes: *mut c_void,
            dwCreationDisposition: Dword,
            dwFlagsAndAttributes: Dword,
            hTemplateFile: Handle,
        ) -> Handle;
        fn GetDevicePowerState(hDevice: Handle, pfOn: *mut Bool) -> Bool;
    }

    /// Check if any connected display is powered on.
    ///
    /// Strategy:
    /// 1. Prefer `GetDevicePowerState` (native, no process spawn, no flash)
    /// 2. Fall back to WMI via hidden PowerShell
    /// 3. Default to `true` if both fail
    pub fn is_screen_on() -> bool {
        if let Some(is_on) = device_power_state() {
            return is_on;
        }

        if let Some(is_on) = wmi_monitor_active_state() {
            return is_on;
        }

        true
    }

    /// Use PowerShell/WMI to check if any monitor reports as active.
    ///
    /// Runs with `CREATE_NO_WINDOW` so no terminal window appears.
    fn wmi_monitor_active_state() -> Option<bool> {
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-WindowStyle",
                "Hidden",
                "-Command",
                "(Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams).Active",
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_powershell_booleans(&stdout)
    }

    /// Parse multi-line PowerShell output of "True"/"False" values.
    ///
    /// Returns:
    /// - `Some(true)` if ANY line is "True" (at least one monitor active)
    /// - `Some(false)` if ALL lines are "False" (no monitors active)
    /// - `None` if no recognizable output
    pub(super) fn parse_powershell_booleans(output: &str) -> Option<bool> {
        let mut observed_state = false;

        for line in output.lines() {
            let value = line.trim();

            if value.eq_ignore_ascii_case("true") {
                return Some(true);
            }

            if value.eq_ignore_ascii_case("false") {
                observed_state = true;
            }
        }

        observed_state.then_some(false)
    }

    /// Use kernel32 `GetDevicePowerState` to check display power.
    ///
    /// Opens handles for `\\.\DISPLAY1` through `\\.\DISPLAY16` and queries
    /// each one's power state. Returns `true` if any display is on.
    fn device_power_state() -> Option<bool> {
        let mut queried_display_power = false;

        for display_index in 1..=16 {
            let display_name = format!("\\\\.\\DISPLAY{}", display_index);
            let wide_display_name: Vec<u16> = display_name
                .encode_utf16()
                .chain(std::iter::once(0))
                .collect();

            let handle = unsafe {
                CreateFileW(
                    wide_display_name.as_ptr(),
                    0,
                    FILE_SHARE_READ | FILE_SHARE_WRITE,
                    std::ptr::null_mut(),
                    OPEN_EXISTING,
                    0,
                    std::ptr::null_mut(),
                )
            };

            if handle == INVALID_HANDLE_VALUE {
                continue;
            }

            let mut is_on: Bool = 0;
            let power_state_available = unsafe { GetDevicePowerState(handle, &mut is_on) != 0 };
            unsafe {
                CloseHandle(handle);
            }

            if !power_state_available {
                continue;
            }

            queried_display_power = true;
            if is_on != 0 {
                return Some(true);
            }
        }

        queried_display_power.then_some(false)
    }
}

#[cfg(target_os = "linux")]
mod platform {
    use std::{env, fs, process::Command};

    /// Check if any connected display is powered on.
    ///
    /// Strategy (cheapest / least visible first):
    /// 1. Backlight: `/sys/class/backlight/*/bl_power` (no process spawn)
    /// 2. X11: `xset q` for DPMS monitor state
    /// 3. Wayland: D-Bus query to GNOME/freedesktop ScreenSaver
    /// 4. Default to `true` if all fail
    pub fn is_screen_on() -> bool {
        if let Some(is_on) = backlight_power_state() {
            return is_on;
        }

        if let Some(is_on) = x11_dpms_state() {
            return is_on;
        }

        if let Some(is_on) = wayland_screensaver_state() {
            return is_on;
        }

        true
    }

    /// Check X11 Display Power Management Signaling (DPMS) state.
    ///
    /// Runs `xset q` and parses the "Monitor is On/Off/Suspend/Standby" output.
    /// Only runs if we're actually in an X11 session.
    fn x11_dpms_state() -> Option<bool> {
        let session_type = env::var("XDG_SESSION_TYPE").unwrap_or_default();
        let has_display = env::var_os("DISPLAY").is_some();

        if session_type != "x11" && !has_display {
            return None;
        }

        let output = Command::new("xset").arg("q").output().ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);

        if stdout.contains("Monitor is On") {
            return Some(true);
        }

        if stdout.contains("Monitor is Off")
            || stdout.contains("Monitor is in Suspend")
            || stdout.contains("Monitor is in Standby")
        {
            return Some(false);
        }

        None
    }

    /// Check Wayland screensaver state via D-Bus.
    ///
    /// Queries GNOME ScreenSaver and freedesktop ScreenSaver interfaces.
    /// `GetActive` returns `true` when the screensaver IS active (screen off).
    /// Only runs if we're NOT in an X11 session.
    fn wayland_screensaver_state() -> Option<bool> {
        let session_type = env::var("XDG_SESSION_TYPE").unwrap_or_default();

        if session_type == "x11" {
            return None;
        }

        // Try multiple D-Bus paths — different desktop environments use different ones
        let dbus_queries = [
            (
                "org.gnome.ScreenSaver",
                "/org/gnome/ScreenSaver",
                "org.gnome.ScreenSaver.GetActive",
            ),
            (
                "org.freedesktop.ScreenSaver",
                "/org/freedesktop/ScreenSaver",
                "org.freedesktop.ScreenSaver.GetActive",
            ),
            (
                "org.freedesktop.ScreenSaver",
                "/ScreenSaver",
                "org.freedesktop.ScreenSaver.GetActive",
            ),
        ];

        for (destination, path, method) in dbus_queries {
            let output = Command::new("dbus-send")
                .args([
                    "--session",
                    &format!("--dest={destination}"),
                    "--type=method_call",
                    "--print-reply",
                    path,
                    method,
                ])
                .output();

            let Ok(output) = output else {
                continue;
            };

            if !output.status.success() {
                continue;
            }

            let stdout = String::from_utf8_lossy(&output.stdout);

            // "boolean true" = screensaver active = screen OFF
            if stdout.contains("boolean true") {
                return Some(false);
            }

            // "boolean false" = screensaver inactive = screen ON
            if stdout.contains("boolean false") {
                return Some(true);
            }
        }

        None
    }

    /// Check backlight power state via sysfs.
    ///
    /// Reads `/sys/class/backlight/*/bl_power` where `0` = on, `1-4` = off/standby.
    /// Works on most Linux laptops with backlight control.
    fn backlight_power_state() -> Option<bool> {
        let entries = fs::read_dir("/sys/class/backlight").ok()?;
        let mut observed_backlight_state = false;

        for entry in entries.flatten() {
            let power_state_path = entry.path().join("bl_power");
            let Ok(power_state) = fs::read_to_string(power_state_path) else {
                continue;
            };

            let Ok(power_state) = power_state.trim().parse::<u32>() else {
                continue;
            };

            observed_backlight_state = true;

            // bl_power: 0 = on, anything else = off/suspend/standby
            if power_state == 0 {
                return Some(true);
            }
        }

        observed_backlight_state.then_some(false)
    }
}

// Fallback for unsupported platforms — always assume screen is on
#[cfg(not(any(target_os = "macos", windows, target_os = "linux")))]
mod platform {
    pub fn is_screen_on() -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::{ScreenTimeTracker, TimeDataUpdate, MAX_CONTIGUOUS_GAP_MS};

    #[test]
    fn extends_session_when_tick_is_within_gap_budget() {
        let second_timestamp = 1_000_000;
        // Exactly at the boundary — should still extend
        let timestamp = second_timestamp + MAX_CONTIGUOUS_GAP_MS;

        assert_eq!(
            ScreenTimeTracker::classify_time_data_update(timestamp, 900_000, second_timestamp),
            TimeDataUpdate::ExtendCurrentSession
        );
    }

    #[test]
    fn starts_new_session_after_sleep_or_suspension_gap() {
        let second_timestamp = 1_000_000;
        // One millisecond over the threshold — should start new session
        let timestamp = second_timestamp + MAX_CONTIGUOUS_GAP_MS + 1;

        assert_eq!(
            ScreenTimeTracker::classify_time_data_update(timestamp, 900_000, second_timestamp),
            TimeDataUpdate::StartNewSession
        );
    }

    #[test]
    fn starts_new_session_when_clock_moves_backwards() {
        // Current timestamp is before both stored timestamps — clock went back
        assert_eq!(
            ScreenTimeTracker::classify_time_data_update(1_000_000, 900_000, 1_100_000),
            TimeDataUpdate::StartNewSession
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn parses_macos_ioreg_device_power_state() {
        let output = r#"    "DevicePowerState"=4"#;

        assert_eq!(super::platform::parse_device_power_state(output), Some(4));
    }

    #[cfg(windows)]
    #[test]
    fn parses_windows_powershell_monitor_state() {
        assert_eq!(
            super::platform::parse_powershell_booleans("False\r\nTrue\r\n"),
            Some(true)
        );
        assert_eq!(
            super::platform::parse_powershell_booleans("False\r\nFalse\r\n"),
            Some(false)
        );
    }
}
