use chrono::Local;
use sqlx::{Pool, Sqlite, SqlitePool};
use std::sync::Arc;
use tauri::async_runtime::spawn;
use tokio::time::{interval, Duration, MissedTickBehavior};

const TRACKING_INTERVAL_SECS: u64 = 60;
const MAX_CONTIGUOUS_GAP_MS: i64 = (TRACKING_INTERVAL_SECS as i64 * 1000) + 30_000;

pub struct ScreenTimeTracker {
    db_pool: Arc<Pool<Sqlite>>,
}

#[derive(Debug, Eq, PartialEq)]
enum TimeDataUpdate {
    ExtendCurrentSession,
    StartNewSession,
}

impl ScreenTimeTracker {
    /// Initialize the screen time tracker with a database connection
    /// Uses sqlx directly for backend-only database access
    pub async fn new(db_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let db_pool = SqlitePool::connect(db_path).await?;

        // Create table if not exists
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

    /// Get current date in 'YYYY-MM-DD' format
    fn get_current_date() -> String {
        Local::now().format("%Y-%m-%d").to_string()
    }

    /// Get current timestamp adjusted for local time (in milliseconds)
    fn get_current_local_timestamp() -> i64 {
        Local::now().timestamp_millis()
    }

    fn classify_time_data_update(
        timestamp: i64,
        first_timestamp: i64,
        second_timestamp: i64,
    ) -> TimeDataUpdate {
        if timestamp < first_timestamp || timestamp < second_timestamp {
            return TimeDataUpdate::StartNewSession;
        }

        if timestamp - second_timestamp > MAX_CONTIGUOUS_GAP_MS {
            return TimeDataUpdate::StartNewSession;
        }

        TimeDataUpdate::ExtendCurrentSession
    }

    fn is_screen_on() -> bool {
        platform::is_screen_on()
    }

    /// Insert a new record for the given date
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

    /// Update the last record's `second_timestamp` for the given date
    async fn update_last_time_data(&self, date: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Self::get_current_local_timestamp();

        // Get the latest record for the day
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
            // No record found for date
            println!("[updateLastTimeData] No record found for date. Inserting new row.");
            self.initialize_new_date(date).await?;
        }

        Ok(())
    }

    /// Start the background tracking task
    pub fn start_tracking(self) {
        spawn(async move {
            // Initialize time data for current date
            let current_date = Self::get_current_date();
            if Self::is_screen_on() {
                if let Err(e) = self.initialize_new_date(&current_date).await {
                    eprintln!("[ScreenTimeTracker] Error initializing date: {}", e);
                }
            } else {
                println!("[ScreenTimeTracker] Display is off. Waiting to start tracking.");
            }

            let mut last_date = current_date;
            let mut interval = interval(Duration::from_secs(TRACKING_INTERVAL_SECS));
            interval.set_missed_tick_behavior(MissedTickBehavior::Delay);

            loop {
                interval.tick().await;

                if !Self::is_screen_on() {
                    println!("[Interval] Display is off. Skipping screen time update.");
                    continue;
                }

                let current_date = Self::get_current_date();

                // If the date has changed, initialize new date data
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

                // Update the latest record for the current date
                if let Err(e) = self.update_last_time_data(&current_date).await {
                    eprintln!("[ScreenTimeTracker] Error updating time data: {}", e);
                }
            }
        });
    }
}

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

    pub fn is_screen_on() -> bool {
        if let Some(is_on) = ioreg_display_power_state() {
            if !is_on {
                return false;
            }
        }

        if let Some(is_on) = core_graphics_display_state() {
            return is_on;
        }

        true
    }

    fn core_graphics_display_state() -> Option<bool> {
        let mut display_count = 0;
        let count_result =
            unsafe { CGGetActiveDisplayList(0, std::ptr::null_mut(), &mut display_count) };

        if count_result != 0 {
            return None;
        }

        if display_count == 0 {
            return Some(false);
        }

        let mut displays = vec![0; display_count as usize];
        let list_result = unsafe {
            CGGetActiveDisplayList(display_count, displays.as_mut_ptr(), &mut display_count)
        };

        if list_result != 0 {
            return None;
        }

        Some(
            displays
                .into_iter()
                .take(display_count as usize)
                .any(|display| unsafe { CGDisplayIsAsleep(display) == 0 }),
        )
    }

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
    use std::{ffi::c_void, process::Command};

    type Bool = i32;
    type Dword = u32;
    type Handle = *mut c_void;

    const FILE_SHARE_READ: Dword = 0x0000_0001;
    const FILE_SHARE_WRITE: Dword = 0x0000_0002;
    const OPEN_EXISTING: Dword = 3;
    const INVALID_HANDLE_VALUE: Handle = -1isize as Handle;

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

    pub fn is_screen_on() -> bool {
        if let Some(is_on) = wmi_monitor_active_state() {
            return is_on;
        }

        if let Some(is_on) = device_power_state() {
            return is_on;
        }

        true
    }

    fn wmi_monitor_active_state() -> Option<bool> {
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                "(Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams).Active",
            ])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_powershell_booleans(&stdout)
    }

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

    pub fn is_screen_on() -> bool {
        if let Some(is_on) = x11_dpms_state() {
            return is_on;
        }

        if let Some(is_on) = wayland_screensaver_state() {
            return is_on;
        }

        if let Some(is_on) = backlight_power_state() {
            return is_on;
        }

        true
    }

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

    fn wayland_screensaver_state() -> Option<bool> {
        let session_type = env::var("XDG_SESSION_TYPE").unwrap_or_default();

        if session_type == "x11" {
            return None;
        }

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

            if stdout.contains("boolean true") {
                return Some(false);
            }

            if stdout.contains("boolean false") {
                return Some(true);
            }
        }

        None
    }

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

            if power_state == 0 {
                return Some(true);
            }
        }

        observed_backlight_state.then_some(false)
    }
}

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
        let timestamp = second_timestamp + MAX_CONTIGUOUS_GAP_MS;

        assert_eq!(
            ScreenTimeTracker::classify_time_data_update(timestamp, 900_000, second_timestamp),
            TimeDataUpdate::ExtendCurrentSession
        );
    }

    #[test]
    fn starts_new_session_after_sleep_or_suspension_gap() {
        let second_timestamp = 1_000_000;
        let timestamp = second_timestamp + MAX_CONTIGUOUS_GAP_MS + 1;

        assert_eq!(
            ScreenTimeTracker::classify_time_data_update(timestamp, 900_000, second_timestamp),
            TimeDataUpdate::StartNewSession
        );
    }

    #[test]
    fn starts_new_session_when_clock_moves_backwards() {
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
