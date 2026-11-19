//! Free task reminders — evaluation, de-duplication and window spawning.
//!
//! Blink Eye is tray-first: the main window is usually hidden, so checking
//! reminders in React is not reliable. Like `premium_nudge.rs` and
//! `reminder_scheduler.rs`, the authoritative logic lives here; the frontend
//! only writes tasks/settings and renders the popup. No license check exists
//! on this path — to-dos and their reminders are free for everyone.

use chrono::{Duration as ChronoDuration, Local, NaiveDate, NaiveDateTime, Timelike};
use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{FromRow, Pool, Sqlite};
use std::path::PathBuf;
use std::str::FromStr;
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::time::{interval, Duration, MissedTickBehavior};

const TICK_SECS: u64 = 30;
const DUE_GRACE_MINUTES: i64 = 15;
const NUDGE_WINDOW_START_MINUTE: u64 = 9 * 60;
const NUDGE_WINDOW_LENGTH_MINUTES: u64 = 9 * 60; // 09:00–17:59
const NUDGE_WINDOW_END_MINUTE: u64 = 18 * 60;

const KEY_ENABLED: &str = "todoTaskRemindersEnabled";
const KEY_QUIET_START: &str = "todoQuietStartHour";
const KEY_QUIET_END: &str = "todoQuietEndHour";
const KEY_ONBOARDED: &str = "isUserOnboarded";
const DEFAULT_QUIET_START: i64 = 22;
const DEFAULT_QUIET_END: i64 = 8;

const ALERT_LABEL: &str = "task_alert";
const ALERT_WIDTH: f64 = 430.0;
const ALERT_HEIGHT: f64 = 104.0;
const ALERT_TOP_OFFSET: f64 = 88.0;

/// Payload passed to `task-alert.html` through its URL query. `messageKey` is
/// translated by the popup, so reminders follow the app's selected language.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskAlertPayload {
    pub task_id: i64,
    pub title: String,
    pub message_key: String,
    pub kind: String,
    pub due_at: Option<String>,
}

#[derive(Debug, Clone, FromRow)]
struct TaskRow {
    id: i64,
    title: String,
    deadline: Option<String>,
    due_at: Option<String>,
}

/// Owns the local todo databases and the periodic check loop.
#[derive(Clone)]
pub struct TaskReminderScheduler {
    app_data_dir: PathBuf,
}

impl TaskReminderScheduler {
    pub fn new(app_data_dir: PathBuf) -> Self {
        Self { app_data_dir }
    }

    /// Starts the single owner of task reminders. No React scheduler is used.
    pub fn start(self, app_handle: AppHandle) {
        tauri::async_runtime::spawn(async move {
            let mut ticker = interval(Duration::from_secs(TICK_SECS));
            ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);
            loop {
                ticker.tick().await;
                if let Err(error) = self.check(&app_handle).await {
                    eprintln!("[TaskReminders] Tick failed: {error}");
                }
            }
        });
    }

    async fn open_todo_db(&self) -> Result<Pool<Sqlite>, String> {
        let db_path = self.app_data_dir.join("UserLocalTodoList.db");
        let url = format!("sqlite://{}", db_path.display());
        let options = SqliteConnectOptions::from_str(&url)
            .map_err(|error| error.to_string())?
            .create_if_missing(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(2)
            .connect_with(options)
            .await
            .map_err(|error| error.to_string())?;

        // The frontend normally owns this schema; doing it here too means a
        // reminder can never fail just because the Todo page was never opened.
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS todos (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               title TEXT NOT NULL,
               details TEXT,
               deadline TEXT,
               reminder_time TEXT,
               status TEXT NOT NULL DEFAULT 'pending',
               created_at TEXT NOT NULL,
               due_at TEXT
             )",
        )
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?;
        for statement in [
            "ALTER TABLE todos ADD COLUMN reminder_time TEXT",
            "ALTER TABLE todos ADD COLUMN due_at TEXT",
        ] {
            let _ = sqlx::query(statement).execute(&pool).await;
        }
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS task_reminder_events (
               task_id INTEGER NOT NULL,
               kind TEXT NOT NULL,
               day TEXT NOT NULL,
               action_key TEXT NOT NULL DEFAULT '',
               created_at TEXT NOT NULL,
               PRIMARY KEY (task_id, kind, day)
             )",
        )
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?;
        let _ = sqlx::query(
            "ALTER TABLE task_reminder_events ADD COLUMN action_key TEXT NOT NULL DEFAULT ''",
        )
        .execute(&pool)
        .await;

        Ok(pool)
    }

    async fn check(&self, app_handle: &AppHandle) -> Result<(), String> {
        let now = Local::now();
        let day = now.format("%Y-%m-%d").to_string();
        let config = crate::crypto::open_app_config_db(app_handle).await?;
        let _ = sqlx::query("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)")
            .execute(&config)
            .await;

        let enabled = read_config(&config, KEY_ENABLED)
            .await?
            .unwrap_or_else(|| "true".to_string())
            != "false";
        let onboarded = read_config(&config, KEY_ONBOARDED).await?.as_deref() == Some("true");
        if !enabled || !onboarded {
            return Ok(());
        }

        let quiet_start = read_config(&config, KEY_QUIET_START)
            .await?
            .and_then(|value| value.parse::<i64>().ok())
            .unwrap_or(DEFAULT_QUIET_START);
        let quiet_end = read_config(&config, KEY_QUIET_END)
            .await?
            .and_then(|value| value.parse::<i64>().ok())
            .unwrap_or(DEFAULT_QUIET_END);
        let quiet_start = normalize_hour(quiet_start, DEFAULT_QUIET_START);
        let quiet_end = normalize_hour(quiet_end, DEFAULT_QUIET_END);
        if is_quiet_hour(now.hour() as i64, quiet_start, quiet_end) || has_conflicting_window(app_handle) {
            return Ok(());
        }

        let pool = self.open_todo_db().await?;
        let tasks: Vec<TaskRow> =
            sqlx::query_as("SELECT id, title, deadline, due_at FROM todos WHERE status = 'pending'")
                .fetch_all(&pool)
                .await
                .map_err(|error| error.to_string())?;
        if tasks.is_empty() {
            return Ok(());
        }

        // A task with an exact time gets one popup at due time. The grace
        // window lets a sleeping/background app catch it without nagging
        // about stale work hours later.
        let now_naive = now.naive_local();
        let mut due_candidates: Vec<(TaskRow, String)> = tasks
            .iter()
            .filter_map(|task| {
                let value = task.due_at.as_ref()?;
                let due = NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M").ok()?;
                let elapsed = now_naive.signed_duration_since(due);
                if elapsed >= ChronoDuration::zero()
                    && elapsed <= ChronoDuration::minutes(DUE_GRACE_MINUTES)
                {
                    Some((task.clone(), value.clone()))
                } else {
                    None
                }
            })
            .collect();
        due_candidates.sort_by(|a, b| a.1.cmp(&b.1));

        if let Some((task, due_key)) = due_candidates.into_iter().next() {
            return self
                .fire(
                    app_handle,
                    &pool,
                    &day,
                    &task,
                    "due",
                    &due_key,
                    "taskAlert.dueMessage",
                )
                .await;
        }

        // One gentle nudge per day, at a seeded time inside the working window.
        let minute_of_day = now.hour() as u64 * 60 + now.minute() as u64;
        if minute_of_day < nudge_minute_for_day(&day) || minute_of_day >= NUDGE_WINDOW_END_MINUTE {
            return Ok(());
        }

        let yesterday = (now.date_naive() - ChronoDuration::days(1))
            .format("%Y-%m-%d")
            .to_string();
        let previous: Option<(i64,)> = sqlx::query_as(
            "SELECT task_id FROM task_reminder_events
             WHERE kind = 'nudge' AND day = ? ORDER BY created_at DESC LIMIT 1",
        )
        .bind(&yesterday)
        .fetch_optional(&pool)
        .await
        .map_err(|error| error.to_string())?;

        let today_date = now.date_naive();
        let candidates: Vec<&TaskRow> = tasks
            .iter()
            .filter(|task| {
                parse_deadline_day(task.deadline.as_deref().unwrap_or(""))
                    .map(|date| date <= today_date)
                    .unwrap_or(true) // undated tasks are the inbox
            })
            .collect();
        let fallback: Vec<&TaskRow> = tasks.iter().collect();
        let pool_ref = if candidates.is_empty() {
            &fallback
        } else {
            &candidates
        };
        let message_key = nudge_message_key(&day);
        if let Some(task) = choose_nudge(pool_ref, &day, previous.map(|row| row.0)) {
            self.fire(app_handle, &pool, &day, task, "nudge", "", message_key)
                .await
        } else {
            Ok(())
        }
    }

    /// Insert the de-dup record first, then recheck the task and spawn. A
    /// failed or suppressed popup releases the record so the next tick retries.
    async fn fire(
        &self,
        app_handle: &AppHandle,
        pool: &Pool<Sqlite>,
        day: &str,
        task: &TaskRow,
        kind: &str,
        action_key: &str,
        message_key: &str,
    ) -> Result<(), String> {
        if has_conflicting_window(app_handle) {
            return Ok(());
        }
        let inserted = sqlx::query(
            "INSERT OR IGNORE INTO task_reminder_events
               (task_id, kind, day, action_key, created_at) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(task.id)
        .bind(kind)
        .bind(day)
        .bind(action_key)
        .bind(Local::now().to_rfc3339())
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?
        .rows_affected()
            > 0;
        if !inserted {
            return Ok(());
        }

        // Recheck completion after the insert: a task may have been finished
        // in another window while this tick was running.
        let current: Option<(String,)> = sqlx::query_as(
            "SELECT title FROM todos WHERE id = ? AND status = 'pending'",
        )
        .bind(task.id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;
        let Some((title,)) = current else {
            let _ = clear_event(pool, task.id, kind, day).await;
            return Ok(());
        };

        let payload = TaskAlertPayload {
            task_id: task.id,
            title,
            message_key: message_key.to_string(),
            kind: kind.to_string(),
            due_at: if kind == "due" {
                Some(action_key.to_string())
            } else {
                None
            },
        };
        if let Err(error) = spawn_task_alert(app_handle, &payload) {
            let _ = clear_event(pool, task.id, kind, day).await;
            return Err(error);
        }
        Ok(())
    }
}

async fn clear_event(
    pool: &Pool<Sqlite>,
    task_id: i64,
    kind: &str,
    day: &str,
) -> Result<(), String> {
    sqlx::query("DELETE FROM task_reminder_events WHERE task_id = ? AND kind = ? AND day = ?")
        .bind(task_id)
        .bind(kind)
        .bind(day)
        .execute(pool)
        .await
        .map(|_| ())
        .map_err(|error| error.to_string())
}

async fn read_config(pool: &Pool<Sqlite>, key: &str) -> Result<Option<String>, String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;
    Ok(row.map(|(value,)| value))
}

fn normalize_hour(value: i64, fallback: i64) -> i64 {
    if (0..=23).contains(&value) {
        value
    } else {
        fallback
    }
}

fn is_quiet_hour(hour: i64, start: i64, end: i64) -> bool {
    if start == end {
        return false;
    }
    if start > end {
        hour >= start || hour < end
    } else {
        hour >= start && hour < end
    }
}

/// Stable FNV-1a hash: the same day always produces the same nudge time/task.
fn hash_string(value: &str) -> u64 {
    let mut hash = 0xcbf29ce484222325u64;
    for byte in value.bytes() {
        hash ^= byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

fn nudge_minute_for_day(day: &str) -> u64 {
    NUDGE_WINDOW_START_MINUTE
        + (hash_string(&format!("blink-eye-nudge:{day}")) % NUDGE_WINDOW_LENGTH_MINUTES)
}

fn nudge_message_key(day: &str) -> &'static str {
    const KEYS: [&str; 3] = [
        "taskAlert.nudgeMessageA",
        "taskAlert.nudgeMessageB",
        "taskAlert.nudgeMessageC",
    ];
    KEYS[(hash_string(&format!("message:{day}")) as usize) % KEYS.len()]
}

/// Parse both the new ISO day and the locale strings written by older builds.
fn parse_deadline_day(value: &str) -> Option<NaiveDate> {
    let trimmed = value.trim();
    for format in [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%b %d, %Y",
        "%d %b %Y",
        "%m/%d/%y",
        "%d/%m/%y",
    ] {
        if let Ok(date) = NaiveDate::parse_from_str(trimmed, format) {
            return Some(date);
        }
    }
    None
}

fn choose_nudge<'a>(
    tasks: &[&'a TaskRow],
    day: &str,
    previous_task_id: Option<i64>,
) -> Option<&'a TaskRow> {
    if tasks.is_empty() {
        return None;
    }
    let rotated: Vec<&'a TaskRow> = if tasks.len() > 1 && previous_task_id.is_some() {
        tasks
            .iter()
            .copied()
            .filter(|task| Some(task.id) != previous_task_id)
            .collect()
    } else {
        Vec::new()
    };
    let pool: &[&'a TaskRow] = if rotated.is_empty() { tasks } else { &rotated };
    let index = (hash_string(&format!("{day}:{}", pool.len())) as usize) % pool.len();
    Some(pool[index])
}

fn has_conflicting_window(app_handle: &AppHandle) -> bool {
    app_handle.get_webview_window("before_alert").is_some()
        || app_handle.get_webview_window("screenSaverWindow").is_some()
        || app_handle
            .webview_windows()
            .keys()
            .any(|label| label.starts_with("reminder_monitor_"))
}

/// Percent-encode a value for a `tauri://localhost` query parameter.
fn percent_encode(value: &str) -> String {
    let mut encoded = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char)
            }
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }
    encoded
}

/// Spawn one transparent pill at the top center of the primary monitor,
/// replacing an older task popup instead of stacking windows.
fn spawn_task_alert(app_handle: &AppHandle, payload: &TaskAlertPayload) -> Result<(), String> {
    if has_conflicting_window(app_handle) {
        return Ok(());
    }
    if let Some(previous) = app_handle.get_webview_window(ALERT_LABEL) {
        let _ = previous.close();
    }

    let (x, y) = app_handle
        .primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| {
            let scale = monitor.scale_factor();
            let position = monitor.position();
            let size = monitor.size();
            (
                position.x as f64 / scale + ((size.width as f64 / scale - ALERT_WIDTH) / 2.0).max(0.0),
                position.y as f64 / scale + ALERT_TOP_OFFSET,
            )
        })
        .unwrap_or((0.0, 0.0));

    let json = serde_json::to_string(payload).map_err(|error| error.to_string())?;
    let url = format!("task-alert.html?payload={}", percent_encode(&json));

    WebviewWindowBuilder::new(app_handle, ALERT_LABEL, WebviewUrl::App(url.into()))
        .title("Task reminder - Blink Eye")
        .inner_size(ALERT_WIDTH, ALERT_HEIGHT)
        .position(x, y)
        .decorations(false)
        .resizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .shadow(false)
        .transparent(true)
        .build()
        .map(|_| ())
        .map_err(|error| format!("Failed to spawn task alert: {error}"))
}

/// Show the real task popup with a caller-supplied payload (used by Preview).
///
/// # Parameters
/// - `payload` — task id, title, i18n message key, kind and optional due time
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub fn show_task_reminder(app_handle: AppHandle, payload: TaskAlertPayload) -> Result<(), String> {
    spawn_task_alert(&app_handle, &payload)
}

/// Show a sample popup so users can see the reminder style before it is due.
///
/// # Parameters
/// None
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub fn preview_task_reminder(app_handle: AppHandle) -> Result<(), String> {
    spawn_task_alert(
        &app_handle,
        &TaskAlertPayload {
            task_id: -1,
            title: "A task you want to finish".to_string(),
            message_key: "taskAlert.nudgeMessageA".to_string(),
            kind: "preview".to_string(),
            due_at: None,
        },
    )
}

/// Close the popup, reveal the dashboard and route it to the todo list.
///
/// # Parameters
/// None
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub fn open_todo_from_alert(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window(ALERT_LABEL) {
        let _ = window.close();
    }
    if let Some(main) = app_handle.get_webview_window("main") {
        let _ = main.show();
        let _ = main.unminimize();
        let _ = main.set_focus();
    }
    app_handle
        .emit_to("main", "open-todo-list", ())
        .map_err(|error| error.to_string())
}

/// Mark a task done from the popup, then tell every todo surface to refresh.
///
/// # Parameters
/// - `task_id` — id of the task to complete
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn complete_task_from_alert(
    app_handle: AppHandle,
    task_id: i64,
) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to get app data dir: {error}"))?;
    let db_path = app_data_dir.join("UserLocalTodoList.db");
    let url = format!("sqlite://{}", db_path.display());
    let options = SqliteConnectOptions::from_str(&url)
        .map_err(|error| error.to_string())?
        .create_if_missing(true);
    let pool: Pool<Sqlite> = SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(options)
        .await
        .map_err(|error| error.to_string())?;

    let result = sqlx::query("UPDATE todos SET status = 'done' WHERE id = ?")
        .bind(task_id)
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?;
    if result.rows_affected() == 0 {
        return Err("That task is no longer available".to_string());
    }

    if let Some(window) = app_handle.get_webview_window(ALERT_LABEL) {
        let _ = window.close();
    }
    if let Err(error) = app_handle.emit("todo-updated", ()) {
        eprintln!("[TaskReminders] Failed to notify todo views: {error}");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{
        choose_nudge, is_quiet_hour, nudge_message_key, nudge_minute_for_day, parse_deadline_day,
        percent_encode, TaskRow,
    };

    fn row(id: i64, deadline: &str) -> TaskRow {
        TaskRow {
            id,
            title: format!("Task {id}"),
            deadline: Some(deadline.to_string()),
            due_at: None,
        }
    }

    #[test]
    fn query_values_are_safe_for_unicode_titles() {
        assert_eq!(percent_encode("a b&c"), "a%20b%26c");
        assert_eq!(percent_encode("task-1_2.~"), "task-1_2.~");
        assert!(!percent_encode("বাংলা").contains(' '));
    }

    #[test]
    fn quiet_hours_wrap_midnight() {
        assert!(is_quiet_hour(23, 22, 8));
        assert!(is_quiet_hour(3, 22, 8));
        assert!(!is_quiet_hour(9, 22, 8));
        assert!(!is_quiet_hour(12, 22, 22));
    }

    #[test]
    fn nudge_schedule_is_seeded_and_stable() {
        let minute = nudge_minute_for_day("2026-11-19");
        assert_eq!(minute, nudge_minute_for_day("2026-11-19"));
        assert!((9 * 60..18 * 60).contains(&minute));
        assert!([
            "taskAlert.nudgeMessageA",
            "taskAlert.nudgeMessageB",
            "taskAlert.nudgeMessageC",
        ]
        .contains(&nudge_message_key("2026-11-19")));
    }

    #[test]
    fn legacy_deadline_formats_still_parse() {
        assert!(parse_deadline_day("2026-11-19").is_some());
        assert!(parse_deadline_day("11/19/2026").is_some());
        assert!(parse_deadline_day("not a date").is_none());
    }

    #[test]
    fn nudge_rotates_away_from_yesterday() {
        let first = row(1, "2026-11-19");
        let second = row(2, "2026-11-18");
        let tasks = [&first, &second];
        let chosen = choose_nudge(&tasks, "2026-11-19", Some(2)).unwrap();
        assert_eq!(chosen.id, 1);
        assert_eq!(choose_nudge(&[], "2026-11-19", None).map(|task| task.id), None);
    }
}
