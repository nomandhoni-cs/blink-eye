# Reminder window architecture

Break reminders are **not** part of the main React app router. Rust spawns standalone Vite entry windows at break time.

---

## Components

| Piece | Location | Role |
|-------|----------|------|
| Scheduler | `src-tauri/src/reminder_scheduler.rs` | Interval ticks, monotonic session deadline, window ownership, previews and accounting |
| Wayland presenter | `src-tauri/src/wayland_reminder.rs` | Main-thread GDK output identity, GTK fullscreen, focus-driven keyboard grab and output recovery |
| Pre-break alert | `alert.html` → `src/alert.tsx` | "Break soon" popup ~15s before |
| Background entries | `reminder-*.html` → `src/reminder-*.tsx` | One bundle per theme; background paints first |
| Overlay | `src/components/reminder/ReminderOverlay.tsx` | Mirrored timer/message/Skip; primary-only todos/audio |
| Deferred mount | `src/components/reminder/DeferredReminderOverlay.tsx` | Lazy-loads overlay after background paints |
| Style registry | `src/backgrounds/registry.ts` | Maps style key → HTML entry filename |

There is **no** TypeScript scheduler (`ReminderHandler` was removed). Do not mount a TS scheduler in `main.tsx` — reminders would fire twice.

---

## Window flow

```
reminder_scheduler.rs (tokio loop)
  │
  ├── ShowBeforeAlert → alert.html
  │
  └── ShowReminder → spawn_reminder_windows()
        │
        ├── Selected primary monitor
        │     reminder-aurora.html?config={json}
        │     → background + DeferredReminderOverlay
        │
        └── Monitor 1+ (when multi-monitor enabled, premium)
              reminder-aurora.html?config={json}
              → background + synchronized timer/message
```

Multi-monitor requires `isMultiMonitorEnabled` and premium access. All selected
outputs show the same backend timer, message and guarded dismissal controls.
Only the primary (or first enumerated) output shows todos or
requests completion audio. Rust grants audio once even across control promotion.
Rust owns labels `reminder_actual_<generation>_<index>` and
`reminder_preview_<generation>_<index>` without a ten-window limit.
Renderer code cannot create or destroy these windows through Tauri capabilities.

Rust claims one terminal transition per generation and destroys the presentation
before statistics I/O. Strict Skip, early completion and stale/non-owning callers
are rejected. Actual windows ignore ordinary close; backend destruction bypasses
that guard. A separate monotonic deadline continues if WebKit freezes or the
screen-on scheduling tick stops. Aborted/incomplete presentation earns no credit.

---

## URL parameters

| Param | Values | Effect |
|-------|--------|--------|
| `config` | URL-encoded JSON | `sessionId`, `kind`, settings snapshot and premium flag |

Style is **not** passed via `?style=` anymore. Each theme has its own HTML entry (e.g. `reminder-aurora.html`). Rust picks the entry from `BACKGROUND_STYLE_TO_ENTRY` using `reminderBackgroundStyle` in the database.

---

## Config keys (appconfig.db)

| Key | Purpose |
|-----|---------|
| `blinkEyeReminderInterval` | Minutes between breaks |
| `blinkEyeReminderDuration` | Break length (seconds) |
| `blinkEyeReminderScreenText` | On-screen message |
| `reminderBackgroundStyle` | Theme key (premium) |
| `isMultiMonitorEnabled` | Background, timer, message and guarded dismissal on all selected displays (premium) |
| `usingStrictMode` | Disable skip during actual break |
| `useCircleProgressTimerStyle` | Circle vs linear timer |

After saving reminder settings (including monitor selection, strict mode or theme):

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
<DeferredReminderOverlay isPremium={isPremium} />
```

---

## Preview paths

| Source | How preview opens |
|--------|-------------------|
| Reminder Settings | `invoke("preview_reminder")` uses saved settings |
| Reminder Themes | `invoke("preview_reminder", { style })` requests a premium-checked theme |

Previews use the same native presenter and output policy, show a Preview label,
and are always dismissible without changing statistics or the actual interval.
An actual break preempts a preview; the backend rejects preview during a break.
The overlay subscribes to `reminder-status`, then calls `get_reminder_status`.
Every output displays that same remaining time/message. `controlWindowLabel`
identifies the primary todo/audio owner, and `claim_reminder_audio` protects one sound.
Renderers send explicit Skip/dismiss requests, never timer completion.
Every owned output may request Skip; the backend claims one winner and rejects
concurrent/stale duplicates without additional accounting.

On native Wayland, output signals reconcile coverage without extending the
deadline. Removing the control output promotes a surviving output; all-monitor
mode adds new outputs for the remaining time. Lost outputs or failed additions
abort when full selected coverage cannot be maintained. See
[Linux behavior and limits](../docs/linux-wayland-reminders.md).

---

## Adding a new style

See `docs/adding-reminder-background.md`.
