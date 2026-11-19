# Todo flow review against `app-polish` and `app-retention`

Scope: onboarding "Your to-dos" → Todo List → dashboard card → break overlay →
task reminder popup, on desktop Tauri (Windows/macOS/Linux). This is a static
code review plus builds/tests run in the sandbox; no real users, screen reader,
native window, or Rust toolchain were available here.

- **User job:** capture a small task and finish it in the same work cycle.
- **Qualifying completion:** a saved task is completed, not merely viewed.
- **Natural return:** the task's due time, or one workday for undated tasks.
- **Evidence labels:** *observed* = readable in this checkout or exercised by
  a test; *hypothesis* = credible risk with a named check; *not checked* = no
  evidence in this environment.

## Findings fixed in this pass

| Rank / skill check | Evidence | Trigger and user impact | Fix | Retest |
|---|---|---|---|---|
| P1 · retention "Itch" / implementation | **Observed** — first pass put the 30s decision loop in `src/hooks/useTaskReminders.ts` mounted in `Layout.tsx`, while `premium_nudge.rs` documents that tray-first evaluation belongs in Rust. | Main window is hidden in the tray most of the time; a throttled React timer can miss due times, so the promised cue is unreliable. | Moved evaluation, de-duplication and spawning into `TaskReminderScheduler` in `src-tauri/src/task_reminders.rs`, started from `lib.rs`. React is now a thin client. | `cargo test` on CI; manual QA with the main window hidden until a task is due. |
| P1 · polish "render the real state" / retention send-time checks | **Observed** — de-dup state was only in `localStorage`; the SQLite `task_reminder_events` table was written but never read. | Cleared browser storage, a second worker, or a failed history write could repeat the same popup. | SQLite `action_key` is authoritative; insert with `INSERT OR IGNORE`, recheck `status='pending'`, delete the record if spawn fails or the task was completed. | Two ticks after a popup: no duplicate. Simulate spawn failure: next tick retries once. |
| P1 · polish "success and next step" | **Observed** — `complete_task_from_alert` updated SQLite but did not notify open views. | Dashboard/list could keep showing a task already marked done until focus changed. | Rust emits `todo-updated`; `useTodoRefreshEvent` refreshes list, dashboard and break overlay. | Complete from popup while dashboard is visible; card updates without refocus. |
| P1 · retention quiet/exit rules | **Observed** — conflict check covered break and pre-break windows, not the screensaver. | A task popup could interrupt a screensaver session. | `has_conflicting_window` also skips `screenSaverWindow`; event record is released so it can fire later. | Start a screensaver during a due window; no popup until it closes. |
| P2 · polish "correctable errors" | **Observed** — Todo List read failure used the "couldn't save" string. | A failed load looked like a failed write; recovery advice was wrong. | Added `todo.couldNotLoad` and used it for read failures only. | Force DB read failure; message names loading, input stays intact. |
| P2 · polish "icon meaning and labels" | **Observed** — dashboard/break checkboxes used the success toast string as an action name; break overlay showed a faint check before hover. | Screen-reader users heard "Task completed" *before* completing; the check could read as an already-done state. | Added `todo.markDone` action label; check is hidden until hover/focus. | Screen-reader pass on both controls. |
| P2 · retention localization | **Observed** — Rust would have needed to send an English string, or the popup would show raw i18n keys. | Non-English users would see the wrong reminder copy. | Payload carries `messageKey`; popup resolves it with its own initialized i18n instance. | Switch language, trigger a nudge, confirm the copy. |

## What already meets the skills

- **Activation / Lazy Thumb:** one visible quick-add field, Enter to submit;
  optional details/date/time appear only after typing. Onboarding offers one
  real first task and a skip-able reminder switch.
- **Paved path:** dashboard and break overlay both lead back to the same list;
  the popup has one factual message and a direct `Open list` route, not a
  generic dashboard.
- **Slot Machine rules:** no odds, streaks, guilt copy or fake scarcity. Variety
  is limited to a seeded daily task pick and three fixed, plain messages.
- **Bottomless Pit:** empty, filtered-empty and caught-up states each have their
  own copy and an exit; popup auto-closes after 18s and a task session ends with
  a real completion.
- **Piggy Bank:** tasks, settings, reminder history and backups are local and
  durable; deleting a task offers a 6-second Undo.
- **Polish 01/10:** to-dos are stated free in onboarding and the list; no paywall
  or OS permission is presented. Reminders can be disabled at any time.
- **Polish 06/12:** progress bar reflects only saved tasks; `prefers-reduced-motion`
  keeps all information without springs; titles truncate with `min-w-0`.

## Open items (not shipped)

| Priority | Evidence | User impact | Recommendation / acceptance |
|---|---|---|---|
| P2 · hypothesis | **Not checked** — no approved product analytics; the primary outcome is defined in `docs/task-reminders.md` but not instrumented. | We cannot tell whether reminders help people finish tasks or just add interruptions. | Before an experiment, define `eligible_start`, `core_action_committed` (task done within due window), `reminder_sent`, `control_changed`; keep task titles out of events. Randomize only among users who enabled reminders. |
| P2 · hypothesis | **Observed** — onboarding reminder switch defaults on. | A default may override a deliberate "not now"; skill cautions about preselected optional choices. | Usability-test whether the switch reads as a real choice; if not, add an explicit `Not now` button beside it. Keep the setting reversible either way. |
| P2 · not checked | No Rust toolchain, screen reader, long/RTL locale, or real Tauri popup in this sandbox. | Compile or layout regressions could reach release. | CI: `cargo test && cargo build`; manual QA from `docs/task-reminders.md` §6 on all three platforms. |

## Recommendation

Ship the core free flow, but gate release on the Rust compile check and the
manual reminder QA. Do **not** add more prompts, badges or streaks until the
completion outcome is measurable and opt-out/complaint guardrails are in place.
