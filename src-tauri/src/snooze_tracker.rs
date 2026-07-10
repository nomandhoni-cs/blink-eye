use chrono::Local;
use serde::Serialize;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Pool, Sqlite,
};
use std::{path::PathBuf, str::FromStr, sync::Arc};
use tauri::{AppHandle, Manager};

use crate::reminder_scheduler::ReminderScheduler;

const DEFAULT_SNOOZES_PER_SESSION: u32 = 3;
const DEFAULT_SNOOZES_PER_DAY: u32 = 10;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BreakStats {
    pub break_streak: u32,
    pub best_break_streak: u32,
    pub snoozes_today: u32,
    pub snoozes_session: u32,
    pub snoozes_allowed_per_session: u32,
    pub snoozes_allowed_per_day: u32,
    pub can_snooze: bool,
    pub total_breaks_completed: u32,
    pub total_snoozes: u32,
}

pub fn default_config_entries() -> [(&'static str, &'static str); 8] {
    [
        ("snoozesAllowedPerSession", "3"),
        ("snoozesAllowedPerDay", "10"),
        ("snoozeCountDay", "0"),
        ("snoozeCountDayDate", ""),
        ("breakStreakCount", "0"),
        ("bestBreakStreakCount", "0"),
        ("totalBreaksCompleted", "0"),
        ("totalSnoozes", "0"),
    ]
}

struct SnoozeLimits {
    session: u32,
    day: u32,
}

/// Returns break/snooze stats for the dashboard and overlay.
#[tauri::command]
pub async fn get_break_stats(
    app_handle: AppHandle,
    scheduler: tauri::State<'_, Arc<ReminderScheduler>>,
) -> Result<BreakStats, String> {
    let pool = open_app_config_pool(&app_handle).await?;
    ensure_snooze_defaults(&pool).await?;
    reset_daily_counter_if_needed(&pool).await?;

    let session_count = scheduler.session_snooze_count().await;
    let limits = read_limits(&pool).await?;
    let snoozes_today = read_u32_config(&pool, "snoozeCountDay").await?;

    Ok(BreakStats {
        break_streak: read_u32_config(&pool, "breakStreakCount").await?,
        best_break_streak: read_u32_config(&pool, "bestBreakStreakCount").await?,
        snoozes_today,
        snoozes_session: session_count,
        snoozes_allowed_per_session: limits.session,
        snoozes_allowed_per_day: limits.day,
        can_snooze: can_snooze(session_count, snoozes_today, &limits),
        total_breaks_completed: read_u32_config(&pool, "totalBreaksCompleted").await?,
        total_snoozes: read_u32_config(&pool, "totalSnoozes").await?,
    })
}

/// Records a user snooze (skip) and enforces session/day limits.
pub async fn record_snooze(
    app_handle: &AppHandle,
    scheduler: &ReminderScheduler,
) -> Result<(), String> {
    let pool = open_app_config_pool(app_handle).await?;
    ensure_snooze_defaults(&pool).await?;
    reset_daily_counter_if_needed(&pool).await?;

    let session_count = scheduler.session_snooze_count().await;
    let snoozes_today = read_u32_config(&pool, "snoozeCountDay").await?;
    let limits = read_limits(&pool).await?;

    if !can_snooze(session_count, snoozes_today, &limits) {
        return Err("Snooze limit reached for this session or today.".to_string());
    }

    scheduler.increment_session_snooze_count().await;

    write_config(&pool, "snoozeCountDay", &(snoozes_today + 1).to_string()).await?;
    write_config(
        &pool,
        "snoozeCountDayDate",
        &Local::now().date_naive().to_string(),
    )
    .await?;

    let total_snoozes = read_u32_config(&pool, "totalSnoozes").await? + 1;
    write_config(&pool, "totalSnoozes", &total_snoozes.to_string()).await?;
    write_config(&pool, "breakStreakCount", "0").await?;

    Ok(())
}

/// Records a break completed without snoozing (timer finished).
pub async fn record_break_completed(app_handle: &AppHandle) -> Result<(), String> {
    let pool = open_app_config_pool(app_handle).await?;
    ensure_snooze_defaults(&pool).await?;

    let streak = read_u32_config(&pool, "breakStreakCount").await? + 1;
    let best = read_u32_config(&pool, "bestBreakStreakCount").await?.max(streak);
    let total_breaks = read_u32_config(&pool, "totalBreaksCompleted").await? + 1;

    write_config(&pool, "breakStreakCount", &streak.to_string()).await?;
    write_config(&pool, "bestBreakStreakCount", &best.to_string()).await?;
    write_config(&pool, "totalBreaksCompleted", &total_breaks.to_string()).await?;

    Ok(())
}

/// `0` limit means unlimited snoozes for that window.
fn can_snooze(session_count: u32, day_count: u32, limits: &SnoozeLimits) -> bool {
    let session_ok = limits.session == 0 || session_count < limits.session;
    let day_ok = limits.day == 0 || day_count < limits.day;
    session_ok && day_ok
}

async fn read_limits(pool: &Pool<Sqlite>) -> Result<SnoozeLimits, String> {
    Ok(SnoozeLimits {
        session: read_limit_config(pool, "snoozesAllowedPerSession", DEFAULT_SNOOZES_PER_SESSION)
            .await?,
        day: read_limit_config(pool, "snoozesAllowedPerDay", DEFAULT_SNOOZES_PER_DAY).await?,
    })
}

async fn read_limit_config(pool: &Pool<Sqlite>, key: &str, default: u32) -> Result<u32, String> {
    let raw = read_string_config(pool, key).await?;
    if raw.is_empty() {
        return Ok(default);
    }
    raw.parse::<u32>()
        .map_err(|_| format!("Invalid config value for {key}"))
}

async fn reset_daily_counter_if_needed(pool: &Pool<Sqlite>) -> Result<(), String> {
    let today = Local::now().date_naive().to_string();
    let stored_date = read_string_config(pool, "snoozeCountDayDate").await?;
    if stored_date != today {
        write_config(pool, "snoozeCountDay", "0").await?;
        write_config(pool, "snoozeCountDayDate", &today).await?;
    }
    Ok(())
}

pub async fn ensure_snooze_defaults(pool: &Pool<Sqlite>) -> Result<(), String> {
    for (key, value) in default_config_entries() {
        sqlx::query("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)")
            .bind(key)
            .bind(value)
            .execute(pool)
            .await
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

async fn open_app_config_pool(app_handle: &AppHandle) -> Result<Pool<Sqlite>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    open_pool(&app_data_dir).await
}

async fn open_pool(app_data_dir: &PathBuf) -> Result<Pool<Sqlite>, String> {
    std::fs::create_dir_all(app_data_dir).map_err(|error| error.to_string())?;
    let db_path = app_data_dir.join("appconfig.db");
    let connection_url = format!("sqlite://{}", db_path.display());
    let options = SqliteConnectOptions::from_str(&connection_url)
        .map_err(|error| error.to_string())?
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(options)
        .await
        .map_err(|error| error.to_string())?;

    sqlx::query("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)")
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?;

    Ok(pool)
}

async fn read_u32_config(pool: &Pool<Sqlite>, key: &str) -> Result<u32, String> {
    let raw = read_string_config(pool, key).await?;
    if raw.is_empty() {
        return Ok(0);
    }
    raw.parse::<u32>()
        .map_err(|_| format!("Invalid config value for {key}"))
}

async fn read_string_config(pool: &Pool<Sqlite>, key: &str) -> Result<String, String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;

    Ok(row.map(|(value,)| value).unwrap_or_default())
}

async fn write_config(pool: &Pool<Sqlite>, key: &str, value: &str) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await
    .map_err(|error| error.to_string())?;
    Ok(())
}
