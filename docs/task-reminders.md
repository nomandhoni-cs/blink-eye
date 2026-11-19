# Free to-dos and task reminders

Design handoff for the `app-retention` and `app-polish` review. The goal is
repeat use at the task's natural cadence — not time spent in the app.

## 1. User job and cadence

- **User:** someone working at the computer who writes down a small task and
  wants to finish it before the day is over.
- **Core task:** capture a task, see it during the next break, and mark it done.
- **Qualifying completion:** a saved task is completed (in the list, break
  overlay or popup) within the day it is due.
- **Natural return window:** due time for tasks with a time; once a workday for
  tasks without one. No reason to check the app when nothing is due.
- **Primary outcome to measure:** completed tasks / tasks that became due in
  the last 24h. Guardrails: opt-out rate, notifications sent per user per day,
  tasks deleted without being completed.

## 2. Flow

```
Onboarding step 6 "Your to-dos" (free badge, required first task, opt-in)
        │  saves task + taskRemindersEnabled in appconfig.db
        ▼
Todo list  ──► Dashboard pending tasks card ──► Break overlay (free for all)
        │             │                              │
        │             └── "Todo List" CTA ───────────┤ complete from break
        ▼                                            ▼
Task reminder popup (top-center, spring) ── "Done" / "Open list" / dismiss
```

- Onboarding step 6 cannot advance until a real task has been saved (by the
  "Add task" button or by pressing "Next" with text in the field). The reminder
  opt-in remains the user's choice.
- The first task is real data, not a demo placeholder. New task forms default
  to a 10-minute lead time; choosing "At the time" stores `0`.
- The Todo List page, the dashboard card, and the break overlay all use the same
  `UserLocalTodoList.db` via `src/lib/todo-store.ts`.
- No license check remains on any todo surface. The sidebar flame badge is
  suppressed for `/todoList`; other premium features are unchanged.

## 3. When a reminder is allowed

The 30-second tick loop, eligibility rules and de-duplication live in
`src-tauri/src/task_reminders.rs` (started from `lib.rs`). This follows the
repo's tray-first pattern — the main window is usually hidden, so a React timer
would be throttled and would not be the source of truth. React only persists
tasks/settings, renders the popup and listens for `todo-updated`.

| Rule | Behavior |
|------|----------|
| Opt-out | `todoTaskRemindersEnabled = "false"` stops all task pop-ups; switch lives in the Todo List and in onboarding. |
| Due time / lead time | One popup when `due_at - reminder_lead_minutes` passes (choices: at the time, 5, 10, 30 or 60 minutes before), with a 15-minute grace window so a sleeping/background app can catch it. The dedupe key includes the lead time, so changing it schedules a new occurrence. |
| Daily nudge | At most one per local day, at a seeded random minute between 09:00 and 17:59, about one still-pending task (due tasks preferred; the previous day's task is rotated out). |
| Quiet hours | Default 22:00–08:00, configurable in the Todo List; no pop-up inside the window. |
| Breaks | No task pop-up while a break overlay, the pre-break alert, or the screensaver is open. |
| De-duplication | `task_reminder_events(task_id, kind, day, action_key)` is the authoritative "already shown" record. Scheduled popups use `kind = due:<due_at\|<lead>`, so changing the lead time schedules a distinct occurrence; a due-time fallback is skipped if the pre-reminder already fired. Rust inserts with `INSERT OR IGNORE`, rechecks completion, and deletes the row if spawning fails so the next tick retries. |
| Stale content | The engine only considers `status = 'pending'`; "Done" writes to the DB, closes the popup, and emits `todo-updated` so every open todo view refreshes. |

The random part is deliberately bounded: varied copy and a different task/time
each day, but never a slot machine, unlimited interruptions, or a reward loop.

## 4. Popup and animation

The existing pre-break alert (`alert.html` → `src/alert.tsx`) is a **320×80
transparent window at the top center of the primary monitor**: dark 70% pill,
thin white border, "All set!" text for ~2.5s, then a 13-second `00:NN`
countdown and a close button. The new task popup reuses that placement and
material at 430×104, with the icon, task title, message, "Done", "Open list"
and dismiss, plus an 18-second auto-dismiss.

Spring motion (stiffness ~400–460, damping ~27–28, mass ~0.7–0.8) is used for:

- the pill's drop-in, morph to the "done" state and icon pop,
- the progress line, whose width is a Framer Motion spring (inspired by the
  momentum-preserving solvers in `YusufCeng1z/ding`),
- list completion and checkbox rows,
- every reminder pop-up: the pre-break alert, the task reminder and the premium
  nudge's staggered recap content.

`prefers-reduced-motion` disables the springs and uses plain opacity changes.
Essential information (title, message, buttons) is never carried by animation
alone.

## 5. Translations

The Rust scheduler stores i18n **keys**, never rendered strings. The popup
resolves them after `initI18n()` loads the persisted language. All 38 shipped
locales carry complete onboarding, Todo List and task-alert catalogs —
including rotating example tasks and `{{minutes}}` / `{{title}}` for "coming
up" messages — so no English fallback or raw key is shown.

## 6. States to verify

| State | Expected |
|-------|----------|
| Empty list | Explanation and a reachable quick-add field. |
| First task | Required to leave onboarding; shows in dashboard, break overlay and list. |
| Lead time | One popup at the chosen offset before `due_at`, with translated "coming up" copy; changing the offset allows a fresh popup. |
| Filter with zero matches | Empty state plus a way to add/switch filter; counts stay truthful. |
| Edit/delete | Edits persist; delete offers Undo for 6 seconds; nothing is silently discarded. |
| Due reminder | One popup; button completes the task; "Open list" routes to `/todoList` and focuses the main window. |
| Daily nudge | One per day, never during quiet hours or a break; never targets a completed task. |
| Reminders off | No popups, settings switch reflects it immediately. |
| Long/RTL text | Title truncates with `min-w-0`; buttons stay reachable; layout follows document direction. |
| Reduced motion | No springs; popup still understandable and actionable. |

## 7. Before release

1. `npm run build`, `npm run test:todo` (47 date/lead-time/translation tests)
   and `npx tsc --noEmit -p tsconfig.app.json`.
2. `cargo test && cargo build` on a machine with the Rust toolchain — the
   sandbox for this change had no `cargo`, so the Rust scheduler and popup
   commands need a compile check on CI. The Rust module has unit tests for
   quiet hours, seeded scheduling, legacy dates, nudge rotation and lead-time
   clamping/dedupe.
3. Manual QA in Tauri dev: preview pop-up from the Todo List, create a task due
   in eleven minutes with a 10-minute lead time, complete from the pop-up,
   open the list from the pop-up, change the lead time, disable reminders,
   cross a quiet-hours boundary, and try to leave onboarding without a task.
