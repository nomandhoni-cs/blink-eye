## Why

Blink Eye offers a 7-day trial (`get_trial_info`) plus a paid license (`get_license_info`, `PremiumFeaturesContext`), but there is currently no systematic prompt to convert free/trial/expired users to premium. Without a gentle, well-timed nudge, trial users expire silently and never learn what premium unlocks.

## What Changes

- Add an eligibility engine that decides whether a premium-purchase nudge may show, based on license status (`active` = never show), trial state (`is_active` / `days_remaining` / expired / missing install date / `clock_manipulated`), and stored nudge preferences.
- Trigger the nudge only on post-activity moments observed by the Rust scheduler — primarily after a fullscreen eye-break reminder completes/is dismissed (works even when the main window is hidden in the tray, which is the normal state), secondarily after viewing usage stats, saving settings, or closing Support — never at app launch, autostart, login, or device boot.
- Enforce anti-annoyance guards: minimum days since install before first nudge, daily/weekly frequency caps, per-session cap (max 1), cooldown after dismiss/snooze, and quiet hours respect. There is deliberately no permanent opt-out — snooze ("Remind me later") is always one click away.
- Add a dedicated `premium_nudge` Tauri window (small centered card window, single-instance — never an in-dashboard dialog and never a fullscreen takeover) with actions: View Premium / Remind me later. It opens over the desktop even when the main window is hidden in the tray; View Premium closes it and opens the main window at the existing `activatelicense` route.
- Persist nudge state (first-eligible date, last shown, snooze-until, dismiss flag, show count) in `appconfig.db` via new Rust commands; never in `store.json` for these settings.
- Suppress the nudge whenever a fullscreen reminder, onboarding flow, update dialog, or clock-manipulation warning is visible/active.

## Capabilities

### New Capabilities
- `premium-purchase-nudge`: eligibility, timing/post-activity triggers, frequency-cap and snooze/dismiss rules, UI surfacing and actions, persistence and observability for the premium purchase reminder.

### Modified Capabilities
- None — no existing `openspec/specs/` requirements change; this is a purely additive capability that reads (not alters) trial/license semantics.

## Impact

- Frontend: new `/premium_nudge` route + window component (variant copy + actions), thin `usePremiumNudge` client for secondary in-app triggers and the nudge window's own event wiring, `activatelicense` deep-link handling; dashboard screens only emit secondary trigger hints, never render the nudge inline.
- Backend (Tauri/Rust): `crypto.rs` (read-only use of `get_trial_info`/`get_license_info`), `appconfig.db` access + new commands (e.g., `get_premium_nudge_state`, `record_premium_nudge_event`, `maybe_show_premium_nudge`, `close_premium_nudge`, show-main-at-`activatelicense`), `premium_nudge` window spawning following the existing `spawn_before_alert` pattern, docs in `docs/tauri-commands-api.md` with Rust doc comments.
- Systems: reminder scheduler gains a post-break hook that evaluates the nudge after break windows close (plus a short delay); no change to trial length (7 days) or license validation logic.
