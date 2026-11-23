# Reminder window architecture

Break reminders are **not** part of the main React app router. Rust spawns standalone Vite entry windows at break time.

---

## Components

| Piece | Location | Role |
|-------|----------|------|
| Scheduler | `src-tauri/src/reminder_scheduler.rs` | 1s tick loop, reads `appconfig.db`, spawns windows, tray countdown |
| Pre-break alert | `alert.html` → `src/alert.tsx` | "Break soon" popup ~15s before |
| Task reminder | `task-alert.html` → `src/task-alert.tsx` | Small top-center "Did you finish this task?" popup |
| Background entries | `reminder-*.html` → `src/reminder-*.tsx` | One bundle per theme; background paints first |
| Overlay | `src/components/reminder/ReminderOverlay.tsx` | Timer, skip, todos (primary monitor only) |
| Deferred mount | `src/components/reminder/DeferredReminderOverlay.tsx` | Lazy-loads overlay after background paints |
| Style registry | `src/backgrounds/registry.ts` | Maps style key → HTML entry filename |

There is **no** TypeScript scheduler for *breaks* (`ReminderHandler` was removed). Do not mount a break scheduler in `main.tsx` — breaks would fire twice.

**Task** reminders are separate and do not use the break scheduler. Following
the tray-first pattern of `premium_nudge.rs`, all evaluation, de-duplication and
spawning live in `src-tauri/src/task_reminders.rs`; the 30s tick loop is started
from `lib.rs`. React only writes tasks/settings, translates the i18n keys in
`task-alert.html`, and refreshes on the `todo-updated` event. See
`docs/task-reminders.md` for the full flow and the user-control rules.

---

## Window flow

```
reminder_scheduler.rs (tokio loop)
  │
  ├── ShowBeforeAlert → alert.html
  │
  └── ShowReminder → spawn_reminder_windows()
        │
        ├── Monitor 0 (primary)
        │     reminder-aurora.html?config={json}
        │     → background + DeferredReminderOverlay
        │
        └── Monitor 1+ (when multi-monitor enabled, premium)
              reminder-aurora.html?minimal=true&config={json}
              → background only (no overlay)
```

Multi-monitor: backgrounds on every display; controls on primary only. Dismissing on primary closes all `reminder_monitor_*` windows.

## Background selection

`reminderBackgroundStyle` is resolved by the Rust scheduler before each break:

| Saved value | Premium | What spawns |
|-------------|---------|-------------|
| `default` | any | `reminder-default.html` (blank screen) |
| `shuffle` | yes | a random animated entry, different from the previous break |
| `shuffle` | no | `reminder-default.html` — free/expired users always get the blank screen |
| a scene key | yes | that scene's entry |
| a scene key | no | `reminder-default.html` |

`shuffle` has no entry of its own, so frontend previews resolve it with
`resolvePreviewStyle()` / `pickShuffleStyle()` in `src/backgrounds/registry.ts`.

---

## URL parameters

| Param | Values | Effect |
|-------|--------|--------|
| `config` | URL-encoded JSON | `reminderText`, `durationSecs`, `isPremium`, `isStrictMode`, `timerStyle`, screen time, etc. |
| `minimal` | `true` | Skip overlay; background only (secondary monitors) |

Style is **not** passed via `?style=` anymore. Each theme has its own HTML entry (e.g. `reminder-aurora.html`). Rust picks the entry from `BACKGROUND_STYLE_TO_ENTRY` using `reminderBackgroundStyle` in the database.

---

## Config keys (appconfig.db)

| Key | Purpose |
|-----|---------|
| `blinkEyeReminderInterval` | Minutes between breaks |
| `blinkEyeReminderDuration` | Break length (seconds) |
| `blinkEyeReminderScreenText` | On-screen message |
| `reminderBackgroundStyle` | Theme key (premium) |
| `isMultiMonitorEnabled` | Background on all displays (premium) |
| `isStrictModeEnabled` | Disable skip during break |
| `reminderTimerStyle` | Countdown style: `circle`, `bar`, `dial`, `vertical` (falls back to `useCircleProgressTimerStyle`) |

After saving interval, duration, or text from the frontend:

```ts
await invoke("update_reminder_setting", { key, value });
await invoke("refresh_reminder_scheduler_settings");
```

---

## Vite entries

Registered in `vite.config.ts` → `build.rollupOptions.input`. Each entry is a small bundle: one background component + shared overlay chunk.

Example entry (`src/reminder-aurora.tsx`):

```tsx
<AuroraBackground />
{!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
```

---

## Preview paths

| Source | How preview opens |
|--------|-------------------|
| Reminder Settings | `entryForStyle()` → `/reminder-{style}.html?config=...` (matches real breaks) |
| Reminder Themes | `entryForStyle()` → per-style entry bundle (same as real breaks) |

---

## Adding a new style

See `docs/adding-reminder-background.md`.
