## Context

Blink Eye is a Tauri v2 + React 19 desktop app (Windows/macOS/Linux). Trial state comes from `get_trial_info` in `src-tauri/src/crypto.rs` (7-day trial computed from encrypted install date in `blink_eye_license.db`, with `is_active`, `days_remaining`, `clock_manipulated`). License state comes from `get_license_info` (`status === "active"` = paid, surfaced via `useLicenseKey` + `PremiumFeaturesContext.canAccessPremiumFeatures`). There is currently no conversion prompt.

Config convention (AGENTS.md): all frontend config reads/writes go through Rust commands against `appconfig.db` (`get_config_string` / `update_reminder_setting` / `get_reminder_settings`), never `store.json` or raw `Database.load("sqlite:appconfig.db")` from TS. The app is tray-first: it normally lives hidden/minimized with only the tray icon visible (`lib.rs` tray menu), and the main window's React tree is often not running visibly. The Rust reminder scheduler (`reminder_scheduler.rs`) ticks every second and already spawns dedicated windows itself — the `before_alert` pill and fullscreen `reminder_monitor_N` overlays via `WebviewWindowBuilder` — so a standalone nudge window follows the established pattern. The main window hosts Dashboard, UsageTime, ReminderSettings, AllSettings, Support, and the `activatelicense` route. Update dialogs (`UpdateContext`/`BlinkEyeUpdater`) already pop on launch — the nudge must not stack on top of them.

Stakeholders: free/trial users (must not feel spammed), paid users (must never see it), maintainer (wants conversion without bad reviews).

## Goals / Non-Goals

**Goals:**
- Convert trial-ending, trial-expired, and long-term free users with a gentle, post-activity nudge.
- Guarantee "never at startup/autostart/boot" and strict frequency caps so the prompt feels helpful, not naggy.
- Cover every license/trial edge case explicitly (paid, trial early/late, expired, missing date, clock skew, unknown status, opted-out, snoozed).
- Persist state in `appconfig.db` via documented Rust commands; keep evaluation testable from the frontend.

**Non-Goals:**
- Changing trial length (stays 7 days), license validation, pricing, checkout, or paywall contents.
- Server-side targeting, analytics pings, A/B framework, or push notifications — all state stays local for privacy.
- Auto-opening external URLs; the nudge deep-links in-app to `activatelicense` only.
- Redesigning the fullscreen break reminder or onboarding flows.

## Decisions

### 1. Rust-evaluated and Rust-spawned nudge, thin frontend client
- **What:** Eligibility and cap math live in Rust (`maybe_show_premium_nudge(trigger)` reads `get_trial_info`/`get_license_info` plus nudge state from `appconfig.db` and spawns the `premium_nudge` window when eligible). The scheduler calls it from its post-break hook, so it fires even when the main window is hidden in the tray. The frontend keeps a thin `usePremiumNudge` client that forwards secondary in-app trigger hints (stats viewed, settings saved, support closed) to the same command and wires the nudge window's own buttons to `close_premium_nudge(event)`.
- **Why:** The main-window React tree is usually not visible (tray-first app) — a main-window hook would never fire for exactly the users we most need to reach (people who never open the app). Rust already owns trial/license/date logic and already spawns windows, so it is the natural owner.
- **Alternative considered:** Pure frontend hook evaluated in the main window — rejected (dead code path for tray users; misses the primary conversion audience).

### 2. Explicit eligibility matrix with grace period (first nudge ≥ day 4)
- **What:** Paid `active` → never. `clock_manipulated` or missing `install_date` → never. Trial `days_remaining > 3` (days 0–3) → never (let value land). Trial `days_remaining 1–3` → "trial ending" variant. Trial expired (`is_active=false`, `days_remaining=0`) or free with no license → "expired/free" variant after grace (install age ≥ 4 days). Unknown/non-`active` license statuses (`expired`, `inactive`, `cancelled`) → treated as expired (win-back copy). Permanent opt-out or `snooze_until > today` → never.
- **Why:** "After a few days" + "based on premium/trial state" from the request; early-trial suppression avoids punishing brand-new users, and the day-4 floor gives 3 full days of pure value.
- **Alternative considered:** Single "expired only" rule — rejected (misses the highest-converting late-trial window).

### 3. Post-activity triggers only; hard ban on launch paths
- **What:** Primary triggers `break_completed`/`break_dismissed` are observed by the scheduler itself (tray-safe: no main window needed). Secondary triggers `stats_viewed` (UsageTime opened ≥ ~5s), `settings_saved`, `support_closed` are forwarded from the main window when it happens to be open — but surfacing is always the dedicated window, never in-dashboard UI. Banned: app launch, autostart, login/boot, onboarding (`isUserOnboarded !== "true"`), update dialog visible, any break/`before_alert`/nudge window visible (with a ~5s delay after break windows close before spawning), second trigger within the same session after one show/dismiss.
- **Why:** Directly implements "show when certain activities are done, never when the user starts their device". Post-break is a natural breathing pause with positive sentiment, and it is the one activity guaranteed to happen for tray users.
- **Alternative considered:** Time-based background popup — rejected (exactly the interrupt pattern the request forbids).

### 4. Dedicated Rust commands over generic string keys
- **What:** Add `get_premium_nudge_state` → `{ eligible, reason, variant, lastShown, showCount, snoozedUntil }` and `record_premium_nudge_event(event: shown|dismissed|snoozed|converted)` in a small `premium_nudge.rs`, reusing the existing `appconfig.db` pool helpers, plus `maybe_show_premium_nudge`, `close_premium_nudge`, show-main-at-`activatelicense`, and a DEV-only `debug_preview_nudge_window` (release builds reject it) for instant window previews. Frontend never touches these keys directly.
- **Why:** Typed contract, single place for cap math (dates, counts), auditable, AGENTS.md-compliant. Generic `update_reminder_setting` key-sprawl (`premiumNudgeLastShownAt`, …) would scatter date logic across TS call sites.
- **Alternative considered:** Pure-TS `localStorage`/store.json — rejected (violates AGENTS.md, lost on reinstall semantics differ from `appconfig.db`, included in no backup set).

### 5. Dedicated `premium_nudge` window, not dashboard UI and not fullscreen
- **What:** A standalone Tauri window (label `premium_nudge`, route `/premium_nudge`, ~420×540 centered on the primary monitor, `decorations(true)`, `resizable(false)`, `always_on_top(true)` at floating level only — deliberately NOT raised to screensaver level like break overlays, `skip_taskbar(false)` so it is discoverable, `focused(true)` once on open, single-instance: if the label already exists, focus it instead of spawning a duplicate), following the `spawn_before_alert` builder pattern. Content is a small card with the variant copy and two actions: `View premium` → `close_premium_nudge(converted_intent)` + unminimize/focus main window navigated to `activatelicense`, `Remind me later` → 7-day snooze; window X closes as plain `dismissed` (72h cooldown). No permanent opt-out by design. Never fullscreen, never at launch, never auto-opens a browser.
- **Why:** The app lives in the tray — dashboard UI would never be seen by the target audience, and the maintainer expects a real popup window to convert. A small centered window after the break (not a second fullscreen takeover) balances visibility with trust.
- **Alternative considered:** Dashboard-anchored dialog/card — rejected (invisible to tray users who never open the app). System notification via `plugin-notification` — rejected (OS-level spam risk, no variant copy control, fires even when app closed).

### 6. Conservative default caps (tunable via config, kill-switch included)
- **What:** Defaults: max 1 show/session, min 72h between shows, max 3 shows/30 days, lifetime max ~10, `snooze=7d`, plus `premiumNudgeEnabled` kill-switch (default on) readable via `get_config_string`.
- **Why:** "Don't bother the user too much" needs numbers; these are deliberately low and all overridable without code changes.
- **Alternative considered:** Uncapped "every session" — rejected (review poison).

## Risks / Trade-offs

- [Risk] Date math vs. manual clock changes → Mitigation: reuse `clock_manipulated` signal; on skew, suppress nudge entirely (warning dialog already owns that moment).
- [Risk] Nudge stacks over update dialog / onboarding / break window → Mitigation: suppression checklist evaluated at spawn-time (not trigger-time), including `before_alert` and an existing `premium_nudge` window, with a 60s re-check window; if conflicted, drop the impression without counting it against caps.
- [Risk] Focus-stealing popup annoys users mid-work → Mitigation: spawn only after break windows fully close plus ~5s delay, small floating-level window (never screensaver level), single-instance, max 1/session, plain X close = mere cooldown.
- [Risk] Time-travel testing is painful (7-day trial) → Mitigation: `DebugPremiumPanel` gains a nudge-state inspector + event simulator (including a "spawn nudge window now" button); Rust date logic unit-tested with injected dates.
- [Risk] Users perceive any paywall as betrayal in a GPL app → Mitigation: copy stresses "support development, unlock themes/multi-monitor", snooze one click away with strict caps so it never nags, paid users provably never trigger evaluation (early-return before any window code).
- [Risk] Two sources of truth (JS client + Rust command) drift → Mitigation: Rust owns evaluation, persistence, cap math, and spawning; the thin TS client only forwards trigger hints and button events; `get_premium_nudge_state` returns `reason` string so every suppression is loggable/explainable.

## Migration Plan

- Additive only: new `config` keys in `appconfig.db` created lazily on first `record_premium_nudge_event`; absent keys = "never shown, not opted out". New `/premium_nudge` route + `premium_nudge` window label; no backfill, no schema migration.
- Rollout: ship dormant behind `premiumNudgeEnabled` (default on); rollback = set key to `"false"` via existing `update_reminder_setting` or remove the scheduler post-break hook call — no data cleanup needed.
- Docs: Rust doc comments on both commands + entries in `docs/tauri-commands-api.md` (TOC + count updated per AGENTS.md).

## Open Questions

- Exact grace floor (3 vs. 4 days) and caps (72h / 3-per-30d) — defaults proposed above; confirm with maintainer before implementation.
- Final variant copy (trial-ending vs. expired vs. win-back) — needs maintainer wording; structure supports three strings.
- Should `stats_viewed` require a dwell time (e.g., 5s on UsageTime) or fire on route enter? Propose dwell to avoid accidental triggers.
