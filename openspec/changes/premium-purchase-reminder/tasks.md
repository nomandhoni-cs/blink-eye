## 1. Backend — nudge state, window spawn, scheduler hook

- [x] 1.1 Add `get_premium_nudge_state` + `record_premium_nudge_event` commands (new `premium_nudge.rs` or in `crypto.rs`, reusing the `appconfig.db` pool helpers) implementing the eligibility matrix, variant selection (`trial_ending`/`expired`/`winback`), caps (72h cooldown, 3/30d, 10 lifetime), snooze (+7d), no permanent opt-out, with `///` doc comments.
- [x] 1.2 Add `maybe_show_premium_nudge(trigger)` (evaluate + spawn-or-focus single-instance `premium_nudge` window per the window spec, ~5s after break close), `close_premium_nudge(event)`, a show-main-window-at-`activatelicense` path, and a DEV-only `debug_preview_nudge_window` (release builds reject it); hook the scheduler post-break close path to call it; per-session guard (max 1 show/session) lives here.
- [x] 1.3 Register all commands in `src-tauri/src/lib.rs` invoke handler and add unit tests for date math (trial boundaries, grace floor day 4, expired, missing date, clock skew, cooldown/cap edges) plus spawn-gating tests (conflicting window visible, session cap, kill-switch, single-instance).
- [x] 1.4 Document all new commands in `docs/tauri-commands-api.md` (TS signatures, params, return shape, TOC + command count per AGENTS.md).

## 2. Frontend — nudge window route and trigger hints

- [x] 2.1 Create the `/premium_nudge` route + window component (small card, three variant copies, View premium / Remind me later / X-close wiring to `close_premium_nudge`, no permanent-dismiss control); View premium closes the nudge and shows/focuses the main window at `activatelicense`.
- [x] 2.2 Create thin `usePremiumNudge` client that forwards secondary trigger hints (`stats_viewed` with ≥5s dwell, `settings_saved`, `support_closed`) to `maybe_show_premium_nudge`; verify no trigger fires on launch/autostart/onboarding paths and nothing renders the nudge inside dashboard routes.
- [x] 2.3 Add 60s conflict re-check semantics (drop without counting caps when a conflicting surface appears) and surface trial days remaining where premium is mentioned (AllSettings trial row). No opt-out anywhere by design.

## 3. Debug tooling

- [x] 3.1 Extend `DebugPremiumPanel` with nudge-state inspector (eligible/reason/variant/counters) and event simulator including a DEV-only "Preview nudge window" instant preview (release builds reject it) plus real-path trigger buttons; auto-show the panel in dev builds only.

## 4. Verification

- [x] 4.1 Cover every spec scenario: paid never, early-trial suppressed, late-trial `trial_ending`, expired `expired`, non-active license `winback`, null/skew dates suppressed, launch ban, tray-hidden break still triggers, all caps, snooze, conflict drop (incl. `before_alert` + existing nudge window), single-instance focus, kill-switch.
- [ ] 4.2 Manual tray QA: hide main window to tray → complete/dismiss a break → expect the standalone nudge window (not dashboard UI); click View premium → main window opens at `activatelicense`. (Deferred: needs a running app + real break cycle — use `show_reminder_now` + the DebugPremiumPanel simulator.)
- [x] 4.3 Run `tsc`, `eslint`, Rust `cargo test`/`cargo clippy`, and `openspec validate "premium-purchase-reminder"`; fix all findings.
