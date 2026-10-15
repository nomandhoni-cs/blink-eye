use chrono::{Local, NaiveDate};
use serde::Serialize;
use sqlx::{Pool, Sqlite};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::crypto::{get_license_info, get_trial_info};

// =============================================================================
// Premium purchase nudge
// =============================================================================
//
// Decides whether the premium-purchase nudge window may open, persists nudge
// state in `appconfig.db`, and spawns the standalone `premium_nudge` window.
// The app is tray-first (main window usually hidden), so evaluation and
// spawning live here in Rust — the scheduler's post-break hook and the thin
// frontend client both funnel into `maybe_show_premium_nudge`.
//
// Anti-annoyance contract (see `premium-purchase-nudge` spec):
// - Paid (`is_paid`) users never see it.
// - First nudge only from install day 4 (trial `days_remaining <= 3`).
// - Max 1 show per session, min 72h between shows, max 3 per 30 days,
//   max 10 lifetime, 7-day snooze, global kill-switch. There is deliberately
//   no permanent opt-out: a quiet nudge every now and then is the price of
//   a free app, and snooze is always one click away.
// - Never evaluated at launch/autostart — only post-activity triggers.

/// Config keys in the `config` table of `appconfig.db` (created lazily;
/// absent keys mean "never shown, not opted out, feature on").
const KEY_ENABLED: &str = "premiumNudgeEnabled";
const KEY_LAST_SHOWN: &str = "premiumNudgeLastShownAt";
const KEY_SHOW_DATES: &str = "premiumNudgeShowDates";
const KEY_SNOOZED_UNTIL: &str = "premiumNudgeSnoozedUntil";
/// Onboarding flag owned by the main window; the nudge waits until it's "true".
const KEY_ONBOARDED: &str = "isUserOnboarded";

/// Minimum install age (days) before the first nudge may show.
const GRACE_DAYS: i64 = 4;
/// Trial days remaining at or below which the `trial_ending` variant applies.
const TRIAL_ENDING_THRESHOLD: i64 = 3;
/// Minimum full days between two nudge shows.
const COOLDOWN_DAYS: i64 = 3;
/// Maximum shows in the trailing 30 days.
const MONTHLY_CAP: usize = 3;
/// Maximum shows over the install lifetime.
const LIFETIME_CAP: usize = 10;
/// Days a "Remind me later" snooze lasts.
const SNOOZE_DAYS: i64 = 7;
/// Grace delay after break windows close before the nudge may spawn.
const POST_BREAK_DELAY_SECS: u64 = 5;
/// Nudge window inner size (logical px).
const NUDGE_WIDTH: f64 = 420.0;
const NUDGE_HEIGHT: f64 = 600.0;
/// Single conflict re-check delay (total ~60s after break close).
const RECHECK_DELAY_SECS: u64 = 55;

/// In-memory per-session guard: at most one nudge show per app session.
static SESSION_SHOWN: AtomicBool = AtomicBool::new(false);

/// Nudge eligibility + display state returned to the frontend.
///
/// # Returns
/// `PremiumNudgeState` with eligibility, suppression reason, variant, and counters.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PremiumNudgeState {
    pub eligible: bool,
    pub reason: String,
    pub variant: Option<String>,
    pub last_shown: Option<String>,
    pub show_count_30d: u32,
    pub show_count_lifetime: u32,
    pub snoozed_until: Option<String>,
}

/// Result of a `maybe_show_premium_nudge` trigger.
///
/// # Returns
/// `accepted` is true when the trigger passed evaluation and a (delayed)
/// spawn was scheduled; `reason` explains accepts and drops alike.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NudgeTriggerResult {
    pub accepted: bool,
    pub reason: String,
}

/// Pure eligibility inputs (DB-free so the matrix is unit-testable).
#[derive(Debug, Clone)]
pub struct NudgeInputs {
    pub kill_switch_on: bool,
    pub is_paid: bool,
    pub license_status: Option<String>,
    pub clock_manipulated: bool,
    pub onboarded: bool,
    pub has_install_date: bool,
    pub trial_active: bool,
    pub days_remaining: i64,
    pub snoozed_until: Option<NaiveDate>,
    pub session_shown: bool,
    pub last_shown: Option<NaiveDate>,
    pub show_dates: Vec<NaiveDate>,
    pub today: NaiveDate,
}

/// Pure eligibility decision.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NudgeDecision {
    pub eligible: bool,
    pub reason: &'static str,
    pub variant: Option<&'static str>,
}

/// Evaluate the eligibility matrix. First matching rule wins.
pub fn evaluate(inputs: &NudgeInputs) -> NudgeDecision {
    // With a 7-day trial, `days_remaining <= TRIAL_ENDING_THRESHOLD` implies
    // install age >= GRACE_DAYS, so the threshold check below doubles as the
    // grace floor (expired trials are older still).
    debug_assert_eq!(GRACE_DAYS, 7 - TRIAL_ENDING_THRESHOLD);
    if !inputs.kill_switch_on {
        return NudgeDecision { eligible: false, reason: "disabled", variant: None };
    }
    if inputs.is_paid {
        return NudgeDecision { eligible: false, reason: "paid_user", variant: None };
    }
    if inputs.clock_manipulated {
        return NudgeDecision { eligible: false, reason: "clock_skew", variant: None };
    }
    if !inputs.onboarded {
        return NudgeDecision { eligible: false, reason: "onboarding", variant: None };
    }
    if !inputs.has_install_date {
        return NudgeDecision { eligible: false, reason: "unknown_date", variant: None };
    }
    if inputs.trial_active && inputs.days_remaining > TRIAL_ENDING_THRESHOLD {
        return NudgeDecision { eligible: false, reason: "trial_too_early", variant: None };
    }
    if inputs.snoozed_until.map(|d| d > inputs.today).unwrap_or(false) {
        return NudgeDecision { eligible: false, reason: "snoozed", variant: None };
    }
    if inputs.session_shown {
        return NudgeDecision { eligible: false, reason: "session_cap", variant: None };
    }
    if let Some(last) = inputs.last_shown {
        if last <= inputs.today && (inputs.today - last).num_days() < COOLDOWN_DAYS {
            return NudgeDecision { eligible: false, reason: "cooldown", variant: None };
        }
    }
    if count_last_30_days(&inputs.show_dates, inputs.today) >= MONTHLY_CAP {
        return NudgeDecision { eligible: false, reason: "monthly_cap", variant: None };
    }
    if inputs.show_dates.len() >= LIFETIME_CAP {
        return NudgeDecision { eligible: false, reason: "lifetime_cap", variant: None };
    }

    NudgeDecision { eligible: true, reason: "eligible", variant: Some(variant_for(inputs)) }
}

/// Copy variant for a user, independent of caps (also used by the dev preview).
fn variant_for(inputs: &NudgeInputs) -> &'static str {
    if inputs.trial_active {
        "trial_ending"
    } else if inputs
        .license_status
        .as_deref()
        .map(|s| !s.is_empty())
        .unwrap_or(false)
    {
        "winback"
    } else {
        "expired"
    }
}

/// Count show dates within the trailing 30 days (inclusive, never future).
fn count_last_30_days(dates: &[NaiveDate], today: NaiveDate) -> usize {
    dates
        .iter()
        .filter(|d| **d <= today && (today - **d).num_days() <= 30)
        .count()
}

/// Whether any open window conflicts with the nudge (pure, testable).
pub fn labels_conflict<'a>(mut labels: impl Iterator<Item = &'a str>) -> bool {
    labels.any(|label| {
        label.starts_with("reminder_monitor_")
            || label == "before_alert"
            || label == "premium_nudge"
            // The support popup is its own ask — never stack two asks.
            || label == "support_reminder"
    })
}

/// Check live windows for conflicts with the nudge.
fn has_conflicting_window(app_handle: &AppHandle) -> bool {
    labels_conflict(app_handle.webview_windows().keys().map(String::as_str))
}

/// Read the current nudge eligibility without recording anything.
///
/// Combines live trial/license state with persisted caps, snooze, and
/// opt-out. Never shows UI; safe to call from any context.
///
/// # Returns
/// `PremiumNudgeState` — `eligible` plus the suppression `reason`
/// (`eligible`, `disabled`, `paid_user`, `clock_skew`, `onboarding`,
/// `unknown_date`, `trial_too_early`, `snoozed`, `session_cap`, `cooldown`,
/// `monthly_cap`, `lifetime_cap`, `trial_unavailable`,
/// `license_unavailable`) and the `variant` when eligible
/// (`trial_ending`, `expired`, `winback`).
#[tauri::command]
pub async fn get_premium_nudge_state(app_handle: AppHandle) -> Result<PremiumNudgeState, String> {
    let inputs = load_inputs(&app_handle).await?;
    let decision = evaluate(&inputs);
    Ok(PremiumNudgeState {
        eligible: decision.eligible,
        reason: decision.reason.to_string(),
        variant: decision.variant.map(str::to_string),
        last_shown: inputs.last_shown.map(|d| d.to_string()),
        show_count_30d: count_last_30_days(&inputs.show_dates, inputs.today) as u32,
        show_count_lifetime: inputs.show_dates.len() as u32,
        snoozed_until: inputs.snoozed_until.map(|d| d.to_string()),
    })
}

/// Gather live trial/license state and persisted nudge state.
async fn load_inputs(app_handle: &AppHandle) -> Result<NudgeInputs, String> {
    let pool = crate::crypto::open_app_config_db(app_handle).await?;
    let trial = get_trial_info(app_handle.clone())
        .await
        .map_err(|_| "trial_unavailable".to_string())?;
    let license = get_license_info(app_handle.clone())
        .await
        .map_err(|_| "license_unavailable".to_string())?;

    let snoozed_until = read_key(&pool, KEY_SNOOZED_UNTIL)
        .await
        .and_then(|s| NaiveDate::parse_from_str(&s, "%Y-%m-%d").ok());
    let last_shown = read_key(&pool, KEY_LAST_SHOWN)
        .await
        .and_then(|s| NaiveDate::parse_from_str(&s, "%Y-%m-%d").ok());

    Ok(NudgeInputs {
        kill_switch_on: read_key(&pool, KEY_ENABLED).await.map(|v| v != "false").unwrap_or(true),
        is_paid: license.is_paid,
        license_status: license.status,
        clock_manipulated: trial.clock_manipulated,
        onboarded: read_key(&pool, KEY_ONBOARDED).await.as_deref() == Some("true"),
        has_install_date: trial.install_date.is_some(),
        trial_active: trial.is_active,
        days_remaining: trial.days_remaining,
        snoozed_until,
        session_shown: SESSION_SHOWN.load(Ordering::SeqCst),
        last_shown,
        show_dates: read_show_dates(&pool).await,
        today: Local::now().date_naive(),
    })
}

/// Record a nudge lifecycle event.
///
/// Accepted `event` values: `shown`, `dismissed`, `snoozed` (sets a 7-day
/// snooze), `converted_intent`. There is no permanent opt-out by design.
///
/// # Parameters
/// - `event` — Lifecycle event to record.
///
/// # Returns
/// `()` on success, or error string on failure (including unknown events).
#[tauri::command]
pub async fn record_premium_nudge_event(app_handle: AppHandle, event: String) -> Result<(), String> {
    let pool = crate::crypto::open_app_config_db(&app_handle).await?;
    let today = Local::now().date_naive();
    match event.as_str() {
        "shown" => {
            SESSION_SHOWN.store(true, Ordering::SeqCst);
            write_key(&pool, KEY_LAST_SHOWN, &today.to_string()).await?;
            let mut dates = read_show_dates(&pool).await;
            if !dates.contains(&today) {
                dates.push(today);
            }
            dates.sort();
            if dates.len() > 60 {
                dates = dates.split_off(dates.len() - 60);
            }
            let serialized = serde_json::to_string(
                &dates.iter().map(|d| d.to_string()).collect::<Vec<_>>(),
            )
            .map_err(|e| e.to_string())?;
            write_key(&pool, KEY_SHOW_DATES, &serialized).await?;
        }
        "dismissed" | "converted_intent" => {
            SESSION_SHOWN.store(true, Ordering::SeqCst);
        }
        "snoozed" => {
            SESSION_SHOWN.store(true, Ordering::SeqCst);
            let until = today + chrono::Duration::days(SNOOZE_DAYS);
            write_key(&pool, KEY_SNOOZED_UNTIL, &until.to_string()).await?;
        }
        other => return Err(format!("Unknown nudge event: {other}")),
    }
    Ok(())
}

/// Evaluate a post-activity trigger and schedule the nudge window.
///
/// Never blocks: evaluation that passes schedules a delayed spawn task
/// (~5s grace after break close, one 60s conflict re-check). Safe to call
/// from tray context where no main window exists.
///
/// # Parameters
/// - `trigger` — One of `break_completed`, `break_dismissed`,
///   `stats_viewed`, `settings_saved`, `support_closed`.
///
/// # Returns
/// `NudgeTriggerResult` — `accepted` plus `reason`.
#[tauri::command]
pub async fn maybe_show_premium_nudge(
    app_handle: AppHandle,
    _trigger: String,
) -> Result<NudgeTriggerResult, String> {
    let state = get_premium_nudge_state(app_handle.clone()).await?;
    if !state.eligible {
        return Ok(NudgeTriggerResult { accepted: false, reason: state.reason });
    }
    let recheck = has_conflicting_window(&app_handle);
    let handle = app_handle.clone();
    tauri::async_runtime::spawn(async move {
        delayed_spawn(handle, recheck).await;
    });
    Ok(NudgeTriggerResult {
        accepted: true,
        reason: if recheck { "recheck_scheduled".to_string() } else { "scheduled".to_string() },
    })
}

/// Scheduler post-break entry point: same delayed routine as the command.
///
/// Called (via spawn) from `skip_reminder` after break windows close with
/// `break_completed` or `break_dismissed`. `trigger` is accepted for future
/// logging; evaluation is trigger-independent by design.
pub async fn handle_post_break_trigger(app_handle: AppHandle, _trigger: String) {
    delayed_spawn(app_handle, true).await;
}

/// Sleep past the post-break grace delay, re-evaluate fully (license may
/// have changed meanwhile), then spawn or run one conflict re-check.
async fn delayed_spawn(app_handle: AppHandle, allow_recheck: bool) {
    tokio::time::sleep(std::time::Duration::from_secs(POST_BREAK_DELAY_SECS)).await;
    if spawn_if_clear(&app_handle).await {
        return;
    }
    if allow_recheck {
        tokio::time::sleep(std::time::Duration::from_secs(RECHECK_DELAY_SECS)).await;
        spawn_if_clear(&app_handle).await;
    }
}

/// Re-evaluate and spawn the window when fully clear. Returns true on spawn.
/// Drops the impression (recording nothing) when ineligible or conflicted.
async fn spawn_if_clear(app_handle: &AppHandle) -> bool {
    let state = match get_premium_nudge_state(app_handle.clone()).await {
        Ok(state) => state,
        Err(e) => {
            eprintln!("[PremiumNudge] State check failed: {e}");
            return false;
        }
    };
    let Some(variant) = state.variant.filter(|_| state.eligible) else {
        return false;
    };
    if has_conflicting_window(app_handle) {
        return false;
    }
    // Claim the session slot atomically: two triggers waking together (e.g.
    // a break and a settings save) must not both pass and double-spawn.
    if SESSION_SHOWN
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return false;
    }
    if let Err(e) = spawn_nudge_window(app_handle, &variant) {
        eprintln!("[PremiumNudge] Failed to spawn window: {e}");
        SESSION_SHOWN.store(false, Ordering::SeqCst);
        return false;
    }
    if let Err(e) = record_premium_nudge_event(app_handle.clone(), "shown".to_string()).await {
        eprintln!("[PremiumNudge] Failed to record show: {e}");
    }
    true
}

/// Open (or focus, if already open) the single-instance nudge window.
///
/// The variant decided here travels in the URL: by the time the window
/// mounts, the `shown` record has already tripped the session cap and
/// cooldown, so the window must not re-derive it from eligibility.
fn spawn_nudge_window(app_handle: &AppHandle, variant: &str) -> Result<(), String> {
    if let Some(existing) = app_handle.get_webview_window("premium_nudge") {
        let _ = existing.unminimize();
        let _ = existing.show();
        let _ = existing.set_focus();
        return Ok(());
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
                position.x as f64 / scale
                    + ((size.width as f64 / scale - NUDGE_WIDTH) / 2.0).max(0.0),
                position.y as f64 / scale
                    + ((size.height as f64 / scale - NUDGE_HEIGHT) / 2.0).max(0.0),
            )
        })
        .unwrap_or((0.0, 0.0));

    let builder = WebviewWindowBuilder::new(
        app_handle,
        "premium_nudge",
        WebviewUrl::App(format!("premium-nudge.html?variant={variant}").into()),
    )
    .title("Blink Eye Premium")
    .inner_size(NUDGE_WIDTH, NUDGE_HEIGHT)
    .position(x, y)
    .decorations(true)
    .resizable(false)
    .always_on_top(true)
    .skip_taskbar(false)
    .focused(true);

    // Full-bleed content under the traffic lights, like the main window.
    #[cfg(target_os = "macos")]
    let builder = builder
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true);

    builder.build().map(|_| ()).map_err(|e| e.to_string())
}

/// Record a nudge-window button event and close the nudge window.
///
/// Accepts the same `event` values as `record_premium_nudge_event`
/// (`dismissed`, `snoozed`, `converted_intent`).
///
/// # Parameters
/// - `event` — Button event to record before closing.
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn close_premium_nudge(app_handle: AppHandle, event: String) -> Result<(), String> {
    record_premium_nudge_event(app_handle.clone(), event).await?;
    if let Some(window) = app_handle.get_webview_window("premium_nudge") {
        let _ = window.close();
    }
    Ok(())
}

/// Close an open nudge window without recording anything.
///
/// Called by the scheduler when a break starts: the break always wins, and
/// the impression was already counted when the nudge spawned.
pub fn close_for_break(app_handle: &AppHandle) {
    if let Some(window) = app_handle.get_webview_window("premium_nudge") {
        let _ = window.close();
    }
}

/// Close the nudge and open the main window at the license activation page.
///
/// Used by the nudge's "View premium" action. Emits `open-activate-license`
/// for the main window to navigate to `activatelicense`.
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub async fn open_activate_license(app_handle: AppHandle) -> Result<(), String> {
    record_premium_nudge_event(app_handle.clone(), "converted_intent".to_string()).await?;
    if let Some(window) = app_handle.get_webview_window("premium_nudge") {
        let _ = window.close();
    }
    if let Some(main) = app_handle.get_webview_window("main") {
        let _ = main.unminimize();
        let _ = main.show();
        let _ = main.set_skip_taskbar(false);
        let _ = main.set_focus();
    }
    app_handle
        .emit("open-activate-license", ())
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Open the nudge window immediately, bypassing eligibility and caps.
///
/// DEV-ONLY: debug builds spawn the window so the copy and layout can be
/// previewed without waiting out the trial grace period and cooldowns.
/// Release builds always reject — there is no way to bypass the
/// anti-annoyance guards in production. Records nothing (no cap pollution,
/// no session-guard trip) so a preview never affects real scheduling.
///
/// # Returns
/// `()` after spawning in debug builds, or an error string in release.
#[tauri::command]
pub async fn debug_preview_nudge_window(app_handle: AppHandle) -> Result<(), String> {
    #[cfg(not(debug_assertions))]
    {
        let _ = &app_handle;
        return Err("debug_preview_nudge_window is only available in debug builds".to_string());
    }
    #[cfg(debug_assertions)]
    {
        let inputs = load_inputs(&app_handle).await?;
        spawn_nudge_window(&app_handle, variant_for(&inputs))?;
        Ok(())
    }
}

/// Read a raw config value (absent key → None).
async fn read_key(pool: &Pool<Sqlite>, key: &str) -> Option<String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .ok()?;
    row.map(|(value,)| value)
}

/// Upsert a raw config value.
async fn write_key(pool: &Pool<Sqlite>, key: &str, value: &str) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO config (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Read show-date history (tolerates missing/corrupt values → empty).
async fn read_show_dates(pool: &Pool<Sqlite>) -> Vec<NaiveDate> {
    let mut dates: Vec<NaiveDate> = read_key(pool, KEY_SHOW_DATES)
        .await
        .and_then(|raw| serde_json::from_str::<Vec<String>>(&raw).ok())
        .unwrap_or_default()
        .iter()
        .filter_map(|s| NaiveDate::parse_from_str(s, "%Y-%m-%d").ok())
        .collect();
    dates.sort();
    dates
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base_inputs() -> NudgeInputs {
        let today = NaiveDate::from_ymd_opt(2026, 9, 3).unwrap();
        NudgeInputs {
            kill_switch_on: true,
            is_paid: false,
            license_status: None,
            clock_manipulated: false,
            onboarded: true,
            has_install_date: true,
            trial_active: false,
            days_remaining: 0,
            snoozed_until: None,
            session_shown: false,
            last_shown: None,
            show_dates: vec![],
            today,
        }
    }

    #[test]
    fn paid_user_never_eligible() {
        let mut inputs = base_inputs();
        inputs.is_paid = true;
        inputs.trial_active = true;
        inputs.days_remaining = 1;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "paid_user");
        assert_eq!(decision.variant, None);
    }

    #[test]
    fn early_trial_suppressed() {
        let mut inputs = base_inputs();
        inputs.trial_active = true;
        inputs.days_remaining = 5;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "trial_too_early");
    }

    #[test]
    fn late_trial_gets_trial_ending_variant() {
        for days in [1, 2, 3] {
            let mut inputs = base_inputs();
            inputs.trial_active = true;
            inputs.days_remaining = days;
            let decision = evaluate(&inputs);
            assert!(decision.eligible, "days_remaining={days}");
            assert_eq!(decision.variant, Some("trial_ending"));
        }
    }

    #[test]
    fn expired_trial_gets_expired_variant() {
        let inputs = base_inputs();
        let decision = evaluate(&inputs);
        assert!(decision.eligible);
        assert_eq!(decision.reason, "eligible");
        assert_eq!(decision.variant, Some("expired"));
    }

    #[test]
    fn non_active_license_gets_winback_variant() {
        for status in ["expired", "inactive", "cancelled", "past_due"] {
            let mut inputs = base_inputs();
            inputs.license_status = Some(status.to_string());
            let decision = evaluate(&inputs);
            assert!(decision.eligible, "status={status}");
            assert_eq!(decision.variant, Some("winback"), "status={status}");
        }
    }

    #[test]
    fn missing_install_date_suppresses() {
        let mut inputs = base_inputs();
        inputs.has_install_date = false;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "unknown_date");
    }

    #[test]
    fn unfinished_onboarding_suppresses() {
        let mut inputs = base_inputs();
        inputs.onboarded = false;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "onboarding");
    }

    #[test]
    fn variant_is_available_regardless_of_caps() {
        let mut inputs = base_inputs();
        inputs.session_shown = true;
        inputs.license_status = Some("expired".to_string());
        assert!(!evaluate(&inputs).eligible);
        assert_eq!(variant_for(&inputs), "winback");
    }

    #[test]
    fn clock_skew_suppresses() {
        let mut inputs = base_inputs();
        inputs.clock_manipulated = true;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "clock_skew");
    }

    #[test]
    fn kill_switch_disables_everything() {
        let mut inputs = base_inputs();
        inputs.kill_switch_on = false;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "disabled");
    }

    #[test]
    fn active_snooze_suppresses_but_expired_snooze_does_not() {
        let today = NaiveDate::from_ymd_opt(2026, 9, 3).unwrap();
        let mut inputs = base_inputs();
        inputs.snoozed_until = Some(today + chrono::Duration::days(2));
        assert_eq!(evaluate(&inputs).reason, "snoozed");

        inputs.snoozed_until = Some(today - chrono::Duration::days(1));
        assert!(evaluate(&inputs).eligible);
    }

    #[test]
    fn session_cap_allows_exactly_one_show() {
        let mut inputs = base_inputs();
        inputs.session_shown = true;
        let decision = evaluate(&inputs);
        assert!(!decision.eligible);
        assert_eq!(decision.reason, "session_cap");
    }

    #[test]
    fn cooldown_boundary_is_72_hours() {
        let today = NaiveDate::from_ymd_opt(2026, 9, 3).unwrap();
        let mut inputs = base_inputs();
        inputs.last_shown = Some(today - chrono::Duration::days(2));
        assert_eq!(evaluate(&inputs).reason, "cooldown");

        inputs.last_shown = Some(today - chrono::Duration::days(3));
        assert!(evaluate(&inputs).eligible);
    }

    #[test]
    fn monthly_cap_counts_trailing_30_days_only() {
        let today = NaiveDate::from_ymd_opt(2026, 9, 3).unwrap();
        let day = |n: i64| today - chrono::Duration::days(n);
        // 2 recent + 5 stale shows → eligible (stale ones don't count).
        let mut inputs = base_inputs();
        inputs.show_dates = vec![day(1), day(10), day(31), day(60), day(61), day(62), day(63)];
        inputs.last_shown = Some(day(10));
        assert!(evaluate(&inputs).eligible);

        // 3rd show inside the window → capped.
        inputs.show_dates.push(day(2));
        inputs.show_dates.sort();
        assert_eq!(evaluate(&inputs).reason, "monthly_cap");
    }

    #[test]
    fn lifetime_cap_is_ten() {
        let today = NaiveDate::from_ymd_opt(2026, 9, 3).unwrap();
        let mut inputs = base_inputs();
        inputs.show_dates = (100..109).map(|n| today - chrono::Duration::days(n)).collect();
        inputs.show_dates.sort();
        assert!(evaluate(&inputs).eligible);

        inputs.show_dates.push(today - chrono::Duration::days(110));
        inputs.show_dates.sort();
        assert_eq!(evaluate(&inputs).reason, "lifetime_cap");
    }

    #[test]
    fn grace_floor_is_day_four() {
        // Trial math: install age = 7 - days_remaining, so days_remaining <= 3
        // implies age >= 4. The threshold constant pins that relationship.
        assert_eq!(GRACE_DAYS, 7 - TRIAL_ENDING_THRESHOLD);
        assert_eq!(GRACE_DAYS, 4);
    }

    #[test]
    fn conflicting_labels_detected() {
        assert!(labels_conflict(["main", "reminder_monitor_0"].into_iter()));
        assert!(labels_conflict(["before_alert"].into_iter()));
        assert!(labels_conflict(["premium_nudge"].into_iter()));
        assert!(labels_conflict(["support_reminder"].into_iter()));
        assert!(!labels_conflict(["main"].into_iter()));
        assert!(!labels_conflict([].into_iter()));
    }
}
