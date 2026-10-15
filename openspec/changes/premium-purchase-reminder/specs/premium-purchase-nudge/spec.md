## ADDED Requirements

### Requirement: Nudge eligibility follows license and trial state
The system SHALL show the premium-purchase nudge only to users who are not paid, based on live `get_trial_info` + `get_license_info` results combined with stored nudge preferences.

#### Scenario: Paid user never sees the nudge
- **WHEN** `get_license_info.status` is `"active"` (regardless of trial values, triggers, or caps)
- **THEN** the system suppresses the nudge and records no impression

#### Scenario: Early-trial user is left alone
- **WHEN** trial `is_active` is true and `days_remaining` is greater than 3 (install days 0–3)
- **THEN** the system suppresses the nudge with reason `trial_too_early`

#### Scenario: Late-trial user gets the trial-ending variant
- **WHEN** trial `is_active` is true, `days_remaining` is between 1 and 3 inclusive, install age is ≥ 4 days, and no other suppression applies
- **THEN** the system is eligible to show the `trial_ending` variant (subject to triggers and caps)

#### Scenario: Expired trial or free user gets the conversion variant
- **WHEN** trial `is_active` is false with `days_remaining = 0` (or trial never started but install age ≥ 4 days) and license status is not `"active"`
- **THEN** the system is eligible to show the `expired` variant (subject to triggers and caps)

#### Scenario: Non-active license statuses are treated as expired
- **WHEN** license status is `expired`, `inactive`, `cancelled`, or any other non-`active` value
- **THEN** the system treats the user as unpaid and applies the expired-trial eligibility path with the `winback` variant

#### Scenario: Uncomputable or untrustworthy dates suppress the nudge
- **WHEN** `install_date` is null/unparseable OR `clock_manipulated` is true
- **THEN** the system suppresses the nudge with reason `unknown_date` or `clock_skew` and records no impression

### Requirement: Nudge fires only on post-activity triggers, never at startup
The system SHALL evaluate the nudge only after defined user-activity completions and SHALL never evaluate or show it during launch, autostart, boot, login, or onboarding. Evaluation SHALL NOT require the main window to be visible.

#### Scenario: Post-break completion is the primary trigger
- **WHEN** the user completes or dismisses a fullscreen eye-break reminder (observed by the Rust scheduler, even with the main window hidden in the tray) and all suppression checks pass
- **THEN** the system may open the nudge window within 60 seconds after the break windows fully close (plus a ~5s grace delay)

#### Scenario: Secondary activity triggers
- **WHEN** the user views UsageTime stats (≥ 5s dwell), saves settings (ReminderSettings/AllSettings/break config), or closes the Support dialog, and all suppression checks pass
- **THEN** the system may open the nudge window regardless of which main-window route is currently browsed

#### Scenario: Tray-hidden users are still reached
- **WHEN** the main window is hidden, minimized, or never opened in the session but a break completes and the user is eligible
- **THEN** the system still evaluates the trigger and may open the nudge window

#### Scenario: Launch paths are hard-banned
- **WHEN** the app cold-starts, autostarts at login/boot, the OS session begins, or `isUserOnboarded` is not `"true"`
- **THEN** the system SHALL NOT evaluate eligibility nor show, preload, or count the nudge

### Requirement: Anti-annoyance frequency caps and cooldowns
The system SHALL enforce session, short-term, monthly, and lifetime caps plus post-action cooldowns before any show.

#### Scenario: One show per session maximum
- **WHEN** a nudge has already been shown or dismissed in the current app session
- **THEN** further triggers in that session are suppressed with reason `session_cap`

#### Scenario: Minimum interval between shows
- **WHEN** fewer than 72 hours have elapsed since `last_shown_at`
- **THEN** the system suppresses the nudge with reason `cooldown`

#### Scenario: Monthly and lifetime ceilings
- **WHEN** the user has already seen 3+ nudges in the trailing 30 days OR 10+ lifetime shows
- **THEN** the system suppresses the nudge with reason `monthly_cap` or `lifetime_cap`

#### Scenario: Snooze is honored
- **WHEN** `snoozed_until` is in the future (set by "Remind me later" = today + 7 days)
- **THEN** the system suppresses the nudge with reason `snoozed` until that date passes (there is no permanent opt-out by design)

### Requirement: Nudge UI is a standalone window with clear actions
The system SHALL present the nudge as a dedicated standalone `premium_nudge` window (small centered card, single-instance — never dashboard-embedded UI, never a fullscreen takeover, never an OS notification) with actions to view premium or snooze. There SHALL be no permanent-dismiss control.

#### Scenario: Nudge opens as its own window over the desktop
- **WHEN** a trigger passes eligibility, caps, and conflict checks
- **THEN** the system opens (or focuses, if already open) the `premium_nudge` window centered on the primary monitor, even when the main window is hidden in the tray

#### Scenario: User views premium
- **WHEN** the user clicks "View premium" (or equivalent) in the nudge window
- **THEN** the system records a `converted_intent` event, closes the nudge window, and shows/focuses the main window navigated to the `activatelicense` route

#### Scenario: User snoozes
- **WHEN** the user clicks "Remind me later"
- **THEN** the system sets `snoozed_until` to today + 7 days, records a `snoozed` event, and closes the nudge

#### Scenario: Plain dismiss applies cooldown
- **WHEN** the user dismisses via the X button
- **THEN** the system records a `dismissed` event, updates `last_shown_at`, and applies the standard 72h cooldown

### Requirement: Conflicting UI always wins over the nudge
The system SHALL suppress (without counting an impression) whenever showing the nudge would interrupt or stack over another experience.

#### Scenario: Suppression on conflicting surfaces
- **WHEN** a fullscreen break reminder, `before_alert` window, an already-open nudge window, onboarding flow, update dialog, or clock-manipulation warning is visible (evaluated at spawn-time, with one 60s re-check)
- **THEN** the system drops the impression, records no `shown` event, and does not advance any cap counters

### Requirement: Nudge state persists locally and is inspectable
The system SHALL persist `last_shown_at`, `show_count_30d`, `show_count_lifetime`, and `snoozed_until` in `appconfig.db` via dedicated Rust commands, with a global kill-switch.

#### Scenario: State round-trips through Rust commands
- **WHEN** the frontend or scheduler calls `get_premium_nudge_state` and `record_premium_nudge_event`
- **THEN** the commands read/write `appconfig.db`, return `{ eligible, reason, variant, lastShown, showCount, snoozedUntil }`, and never use `store.json` or raw frontend SQL

#### Scenario: Window lifecycle goes through dedicated commands
- **WHEN** the scheduler post-break hook fires or a secondary trigger hint arrives
- **THEN** `maybe_show_premium_nudge(trigger)` evaluates eligibility and spawns (or focuses) the window; the nudge window's buttons invoke `close_premium_nudge(event)` and the View-premium path shows the main window at `activatelicense`

#### Scenario: Kill-switch disables everything
- **WHEN** the `premiumNudgeEnabled` config key is `"false"`
- **THEN** the system suppresses the nudge on every trigger with reason `disabled`, regardless of eligibility or caps
