# Blink Eye on Mobile (Expo React Native) — Feasibility Analysis

> Question: Can the desktop Blink Eye (Tauri, cross-platform) be rebuilt for
> Android + iOS with Expo React Native, keeping the "every 20 minutes, full-screen
> popup the user can't escape" behaviour? What system APIs are needed, and can it
> be published on Google Play / the App Store?
>
> **Short answer: Yes, you can build and publish a mobile Blink Eye — but not a
> 1:1 port. The inescapable full-screen overlay over other apps is impossible on
> iOS and only partially possible (opt-in, escapable, policy-scrutinised) on
> Android. You must redesign the reminder delivery around notifications.**

---

## 1. What you have today (desktop)

| Layer | Implementation |
|---|---|
| App shell | Tauri 2 + React 19 + Vite, Rust backend (`src-tauri/`) |
| Scheduler | `reminder_scheduler.rs` — 1-second tick loop, reads settings from SQLite every 30s, defaults: 20 min interval, 20s break, 15s pre-alert |
| Overlay | Spawns a borderless/fullscreen `WebviewWindow` per monitor, raised above other apps (macOS window level 24+, "all Spaces" collection behaviour), with a skip button unless Strict Mode is on |
| Tray | Tray icon + menu showing live countdown (`setupTray.ts`, `lib.rs`) |
| Persistence | SQLite (`appconfig.db`, `UserScreenTime.db`) via `tauri-plugin-sql` + `sqlx`; settings keys like `blinkEyeReminderInterval`, `usingStrictMode` |
| Extras | Autostart plugin, global shortcut, screen-time tracker (`idle` crate), multi-monitor toggle, workday schedule, Pomodoro, task reminders, 27 WebGL reminder scenes (`reminder-*.html`), premium licensing (Rust `crypto.rs` + `ring`), GitHub-release updater |

The desktop model works because a desktop OS lets a window sit **always-on-top
and fullscreen above other apps**, and a tray process can keep running
indefinitely. Neither assumption holds on mobile.

---

## 2. The hard truth: "a popup they can't escape"

Mobile operating systems are explicitly designed to prevent one app from
hijacking another app's screen. This is a security boundary, not a missing API.

### iOS — you cannot take over the screen, but you *can* take away the app

- iOS has **no "draw over other apps" API at all**. Apps can only interact with
  the currently running app; there is no equivalent of Android's
  `SYSTEM_ALERT_WINDOW`, no always-on-top window, no overlay over other apps.
- There is no way to block the Home gesture, App Switcher, Control Center, or
  force-quit. The user can always leave your app in under a second.
- **But Apple's Screen Time API (FamilyControls + ManagedSettings +
  DeviceActivity) lets you physically prevent chosen apps from launching.** The
  OS raises a *shield* in place of the app, enforced at system level, surviving
  force-quit and reboot, and only your code can lift it. This is exactly how
  Opal, one sec and AppBlock work. See
  [`mobile-blocking-playbook.md`](./mobile-blocking-playbook.md) for the full
  mechanism, code, and the ~1-week Family Controls entitlement approval.
  - The shield is capped at a title, subtitle, icon and **two buttons**, and it
    **cannot open your app** — tapping a button fires a local notification which
    the user taps to open you. That notification handoff is the break gate.
- The other Apple-sanctioned mechanisms:
  - **Local notifications** (`UNUserNotificationCenter`) — banner + sound +
    vibration, dismissible/swipeable by design.
  - **Time Sensitive notifications** (`.timeSensitive`) — pierce Focus/DND with
    an entitlement, unlike Critical Alerts.
  - **Critical Alerts** — bypasses silent switch / DND, requires special Apple
    approval (health/safety only), and is routinely denied for
    productivity/reminder apps.
  - **In-app full-screen break screen** — only while *your* app is open.
  - **Live Activities / Dynamic Island** — a small persistent glanceable timer,
    not a takeover.
- Any attempt to use private APIs or download code that changes behaviour after
  review violates Guideline 2.5.2 and gets rejected.

**Verdict (iOS): you cannot build an overlay that sits on top of other apps. You
*can* build an unskippable block that stops the user opening the apps that hurt
their eyes, and that clearing the block requires completing your break. That is
the strongest, and the review-safe, design.**

### Android — partially possible, but still escapable and policy-gated

Android does have the primitives, but each comes with a catch:

| Primitive | What it gives you | The catch |
|---|---|---|
| `SYSTEM_ALERT_WINDOW` ("Display over other apps") | A floating window drawn above other apps | Special-access permission the user must grant manually in Settings; Play requires a declaration that it's core functionality; **cannot draw over the lock screen**; user can revoke it any time; banking/games can refuse to run under an overlay |
| Full-screen intent notification (`USE_FULL_SCREEN_INTENT`) | Notification that wakes the screen and shows a full-screen UI | Since Android 14 this is restricted to calling/alarm apps; Play policy limits it to apps whose core purpose is alarms/calls — an eye-care reminder is a borderline case and may be rejected |
| Foreground service | Keeps your process alive with a persistent notification | Android 14+ requires declaring a foreground-service *type*; Play restricts which types are allowed and requires justification; the persistent notification itself is a visible "escape hatch" (user can swipe the app away / force-stop) |
| Exact alarms (`SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`) | Fires at the precise minute even in Doze | `USE_EXACT_ALARM` needs a Play Console declaration and only qualifies for alarm/timer/calendar apps; `SCHEDULE_EXACT_ALARM` is user-granted special access that can be revoked. Without either, reminders drift (measured up to ~60 min late in Doze on Android 14 in one Expo test) |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Exempts you from OEM battery killers (Xiaomi, OnePlus, etc.) | Play only allows this for a narrow set of use cases; many apps are rejected for requesting it |

Even with all of the above, the user can **always** press Home, open Recents,
force-stop the app, revoke permissions, or uninstall. "Can't escape" is not
achievable — the honest Android UX is "very hard to ignore, easy to leave."

**Verdict (Android): buildable as an opt-in "Strong Mode" overlay, but expect
Play review scrutiny, extra declarations, and lower conversion because of the
multi-step permission flow.**

---

## 3. System APIs you actually need (Expo)

You cannot do this in **Expo Go**. Background tasks, notifications, and native
permissions require a **development build** (`eas build`) and, for Android
overlay/foreground-service work, a **config plugin or a small custom native
module** (prebuild / bare workflow).

### Core Expo packages

| Need | Package | Notes |
|---|---|---|
| Scheduled local notifications | `expo-notifications` | The heart of the mobile version. Supports time-interval & calendar triggers, channels (Android), sounds, vibration. Does **not** directly expose Android foreground services |
| Background execution | `expo-background-task` + `expo-task-manager` | Replaces deprecated `expo-background-fetch`. Uses WorkManager (Android) / BGTaskScheduler (iOS) — the OS decides *when*, minimum interval is a suggestion, not a guarantee |
| Keep screen on during break | `expo-keep-awake` | For the in-app break screen |
| Sound / vibration | `expo-av` (or `expo-audio`), `expo-haptics` | Your `before_alert_sound.mp3` / `done.mp3` equivalents |
| Settings & stats storage | `expo-sqlite` or `expo-secure-store` + AsyncStorage | Replaces Tauri SQL + store JSON. SQLite is closest to your current schema |
| Navigation | `expo-router` | Dashboard / settings / break screen |
| Screen orientation / UI | `expo-screen-orientation`, `expo-system-ui` | Lock to portrait during break if desired |
| Widgets / Live Activities (optional) | `expo-widgets` / Live Activities APIs | Replaces the tray countdown — shows "next break in 12:34" on the home screen / Dynamic Island |
| Payments (premium) | RevenueCat or Play Billing + StoreKit | Replaces your Rust `crypto.rs` licensing; do not port the custom crypto |

### Native permissions / entitlements to declare

**Android (`app.json` / `AndroidManifest.xml`):**

```jsonc
"android": {
  "permissions": [
    "POST_NOTIFICATIONS",              // Android 13+ runtime permission
    "SCHEDULE_EXACT_ALARM",            // precise 20-min timing (user-granted)
    "RECEIVE_BOOT_COMPLETED",          // reschedule after reboot
    "VIBRATE",
    "WAKE_LOCK",
    "FOREGROUND_SERVICE",              // only if you use a foreground service
    "FOREGROUND_SERVICE_DATA_SYNC",    // Android 14+ type declaration
    "SYSTEM_ALERT_WINDOW"              // ONLY if you ship the overlay "Strong Mode"
  ]
}
```

**iOS (`Info.plist` / entitlements):**

```jsonc
"ios": {
  "infoPlist": {
    "UIBackgroundModes": ["fetch", "processing"]  // declare ONLY what you use
  },
  "entitlements": {
    "aps-environment": "production"
  }
}
```

- iOS background modes are governed by **Guideline 2.5.4**: background services
  may only be used for their intended purpose (local notifications, task
  completion, etc.). Declare the minimum, and write reviewer notes explaining
  exactly how to trigger the feature — "reviewer unable to locate the feature"
  is a common rejection.
- Push (APNs) needs an Apple Developer account + APNs key; local notifications
  alone do **not** need a server. For a pure on-device reminder, skip the
  backend entirely — it's simpler and privacy-friendly.

### What has no mobile equivalent (do not port)

- Tray icon / menu-bar countdown → widget / Live Activity / persistent
  notification (Android only)
- Autostart → Android boot receiver; iOS has nothing (app must be opened at
  least once; iOS suspends background tasks for unused apps)
- Global shortcut → nothing
- Multi-monitor → irrelevant
- Screen-time tracking of other apps → no general API. Android `UsageStats`
  gives raw numbers with a special-access grant. iOS DeviceActivity can only
  render Apple's own report view — you never receive the numbers as data. Neither
  store rejects a *user-facing* focus/eye-care blocker, but you cannot feed that
  data into your own logic on iOS
- In-app updater (GitHub releases) → store review controls updates; Expo
  Updates can ship JS-only changes over-the-air

---

## 4. Feature-by-feature portability map

| Desktop feature | Mobile fate |
|---|---|
| 20-min timer / 20-sec break | ✅ Survives — via `expo-notifications` scheduling (see timing caveats below) |
| Full-screen overlay over other apps | ❌ iOS impossible · ⚠️ Android opt-in overlay only |
| Strict Mode (no skip) | ⚠️ Only inside your own break screen; user can still leave the app |
| Pre-alert (15s before) | ✅ Second notification / sound cue |
| Custom reminder text, interval, duration | ✅ Settings screen + SQLite |
| 27 animated WebGL scenes | ⚠️ Works in-app, but heavy for mobile GPU/battery — ship 4–6 lightweight scenes, keep the rest as static gradients |
| Sounds, mute | ✅ `expo-av` |
| Workday schedule | ✅ Pure logic, easy port |
| Pomodoro, task reminders | ✅ Easy port |
| Usage stats (daily/weekly/lifetime) | ⚠️ Only *your app's* usage + break history — not other apps' screen time |
| Premium / licensing | ✅ RevenueCat / store billing |
| i18n | ✅ `i18next` already in your stack |
| Tray, autostart, global shortcut, multi-monitor | ❌ No equivalent |

### Timing reality check

- **iOS**: `UNTimeIntervalNotificationTrigger` minimum repeat interval is
  **60 seconds**; 20 minutes is fine. But if the app is backgrounded, iOS may
  throttle/suspend background delivery for apps the user rarely opens. Local
  notifications scheduled in advance still fire — schedule the next N breaks
  ahead and reschedule on every app open.
- **Android**: inexact alarms drift badly in Doze. For "every 20 minutes,
  on the minute" you need exact alarms (see §2). Without them, plan for
  ± several minutes of drift and say so in your UI ("approximately every
  20 minutes").
- **Both**: schedule a rolling window (e.g. next 24h of notifications) and
  refresh it whenever the app is opened or a background task runs. Never rely
  on a single repeating trigger.

---

## 5. Recommended mobile architecture (closest to your concept, policy-safe)

```
┌─────────────────────────────────────────────────────────┐
│  Expo app (React Native + expo-router)                  │
│  Dashboard · Settings · Break screen · Stats            │
├─────────────────────────────────────────────────────────┤
│  Scheduler (JS)                                         │
│  - rolling 24h notification schedule                    │
│  - workday / strict-mode / snooze logic (ported)        │
├──────────────────────┬──────────────────────────────────┤
│  expo-notifications  │  expo-background-task            │
│  (local notifs,      │  (reschedule, refresh stats)     │
│   channels, sounds)  │                                  │
├──────────────────────┴──────────────────────────────────┤
│  Android-only "Strong Mode" (opt-in, config plugin):    │
│  exact alarm + full-screen intent / overlay activity    │
│  + foreground service with persistent notification      │
├─────────────────────────────────────────────────────────┤
│  Storage: expo-sqlite (settings, break history, stats)  │
└─────────────────────────────────────────────────────────┘
```

**UX flow (both platforms):**

1. Onboarding explains notifications + (Android) exact-alarm permission, with
   a "why" screen *before* the system prompt — conversion tanks if you prompt
   cold on launch.
2. Every 20 min: high-importance notification (sound + vibration + custom
   message) → tap opens the **full-screen break screen** (keep-awake, countdown,
   animated scene, skip button hidden in Strict Mode).
3. Android Strong Mode (optional toggle, off by default): additionally fires a
   full-screen intent / overlay so the break appears even over other apps.
   Disclose clearly: "This draws over other apps. You can turn it off in
   Settings → Apps → Blink Eye → Display over other apps."
4. Widget / Live Activity shows the countdown (your tray replacement).
5. Break completion logs to SQLite → stats screen (your `ScreenTimeTracker`
   replacement, scoped to Blink Eye only).

**What to tell users honestly:** "Mobile phones don't let any app trap you on
one screen — that's a security feature. Blink Eye Mobile uses loud, persistent
reminders and a full-screen break when you tap, so it's hard to ignore but
always escapable."

---

## 6. Publishing: Google Play & App Store

### Google Play (Android)

- **Cost**: one-time **US$25** developer registration, identity verification
  (government ID for personal accounts; D-U-N-S for organisations). No annual fee.
- **Build**: signed **Android App Bundle (.aab)** via EAS Build, targeting the
  current API level — **API 36 (Android 16)** for new apps/updates as of
  31 Aug 2026. 64-bit native libraries, 16 KB page-size alignment.
- **New personal accounts** (created after Nov 2023): must run a **closed test
  with ≥12 testers for ≥14 continuous days** before production access.
- **Required declarations** (Play Console → App content): privacy policy URL
  (also shown in-app), **Data Safety** form, health-apps declaration (every
  app, even with no health features), content rating (IARC questionnaire),
  target-audience & ads declarations.
- **Sensitive-permission declarations** — the ones that will bite you:
  - `USE_EXACT_ALARM` → only for alarm/timer/calendar apps, with a Play
    Console declaration; otherwise use `SCHEDULE_EXACT_ALARM`.
  - Foreground-service types → declare the type and justify it.
  - `SYSTEM_ALERT_WINDOW` → must be core functionality; expect questions.
  - `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` → narrow allowlist only.
- **Review**: typically hours to a few days; permission/Data Safety issues are
  the top rejection causes. You can appeal or fix and resubmit.
- **"Play Chart" / ranking**: publishing gets you listed; chart ranking is
  driven by downloads, retention, ratings, and ASO (title, screenshots,
  keywords). Eye-care/break-reminder is a crowded category — differentiate on
  the animated scenes, strict mode, and stats, and expect to earn visibility
  through ASO + reviews, not just shipping.

### Apple App Store (iOS)

- **Cost**: **US$99/year** Apple Developer Program.
- **Build**: EAS Build → App Store Connect upload; APNs key if using push.
- **Review guidelines to design around**:
  - **2.5.4** — background modes only for their intended purpose; explain in
    reviewer notes how to trigger every background feature.
  - **4.2 Minimum Functionality** — must do something a website can't (native
    notifications, widgets, offline mode all help).
  - **4.3 Spam** — simple timer apps are a saturated category; Apple requires a
    "meaningfully different or improved experience." Your animated scenes +
    stats + strict mode are your differentiation — say so in the review notes.
  - **5.1.1** — privacy policy linked in App Store Connect *and* in-app;
    request notification permission with a clear purpose.
- **Review**: typically 1–7 days; first-submission rejection rate is roughly
  1 in 4 across the store. Budget 2–3 review cycles.
- **No private APIs, no downloaded code** that changes behaviour (2.5.2).

### Either store

- Test on **real devices** (iOS simulators can't receive remote notifications;
  OEM Android battery killers only show on real hardware).
- Prepare: icon (1024×1024), screenshots (phone + tablet), short/long
  description, privacy policy, support URL/email.
- Version-code discipline: every upload needs a higher version code.

---

## 7. Effort estimate & suggested roadmap

| Phase | Scope | Rough effort |
|---|---|---|
| 0. Spike (1 week) | Expo dev build + `expo-notifications` + one exact-alarm test on a real Android phone + one iOS local-notification test | Validate timing before building UI |
| 1. MVP (3–5 weeks) | Dashboard, settings, scheduler, in-app break screen, 4–6 scenes, sounds, stats, workday, i18n | Store-ready on both platforms without Strong Mode |
| 2. Android Strong Mode (2–3 weeks) | Config plugin / native module for overlay + foreground service + exact-alarm permission flow | Optional toggle; separate Play declaration |
| 3. Polish (2 weeks) | Widgets/Live Activities, premium via RevenueCat, ASO assets, closed test (12 testers / 14 days), App Store review cycles | — |

**Total: ~8–12 weeks for a store-ready MVP + Strong Mode.** Full desktop parity
(tray, autostart, global shortcuts, other-app screen-time tracking) is not
achievable on mobile at any effort — those are platform boundaries, not
engineering gaps.

### Recommendation

1. Ship the **notification-first** version on both platforms (Phase 1). It
   covers ~90% of the user value and passes review cleanly.
2. Add Android Strong Mode as an **opt-in** later, with its own Play
   declaration — don't gate the whole app on the riskiest permission.
3. Don't promise "can't escape" anywhere in copy. Promise "impossible to
   miss" instead — and make the break screen genuinely pleasant (your animated
   scenes are the differentiator).

---

## 8. Suggested mobile feature set

Principle: **translate, don't port.** Keep the 20-20-20 core, replace desktop-only
mechanisms (tray, autostart, overlay) with mobile-native ones (widgets, Live
Activities, guided breaks), and add features phones do better than desktops.

### Tier 1 — MVP core (ship this first)

| Feature | What it is | Expo / native API |
|---|---|---|
| Smart scheduler | Custom interval (default 20 min), duration (default 20s), workday hours, snooze, 15s pre-alert | `expo-notifications` rolling 24h schedule + `expo-background-task` |
| Notification-first reminder | High-importance notification: sound + vibration + custom message; tap → break screen | `expo-notifications` (Android channels), `expo-av`, `expo-haptics` |
| Fullscreen break screen (in-app) | Keep-awake countdown with your existing styles (circle/bar/dial/vertical), skip hidden in Strict Mode | `expo-keep-awake`, `expo-router` |
| Lightweight scene pack | 4–6 of your 27 scenes rebuilt lightweight (gradient + simple animation); rest as static themes | React Native animated / `expo-gl` sparingly — avoid heavy WebGL on mobile GPU |
| Dashboard | Next-break countdown, today breaks done, streak, quick pause/resume | Local state + `expo-sqlite` |
| Stats (own-app only) | Break history, adherence %, daily/weekly charts | `expo-sqlite` + chart lib (port your Recharts logic) |
| Settings | Interval, duration, text, theme, timer style, sound, strict mode, workday, language | `expo-sqlite`, existing `i18next` |
| Onboarding + permission priming | "Why" screen before system prompt; Android exact-alarm + battery-optimisation guidance | Custom UI + deep links to Settings |

### Tier 2 — Mobile-native differentiators (why install this vs. a generic timer)

These are your App Store Guideline 4.2/4.3 armour — native features a website
can't do, and the reason Apple won't call you a "spam timer app."

| Feature | Why it matters | API |
|---|---|---|
| **Home + Lock Screen widgets** | Tray replacement: "Next break in 12:34" glanceable without opening the app | `expo-widgets` / WidgetKit + Glanceable |
| **Live Activity / Dynamic Island** (iOS) | Persistent countdown on lock screen / Dynamic Island during work session | Live Activities API |
| **Guided eye exercises** | Not just "look away" — 20-20-20 + blink exercise + palming + focus-shift, with voice/audio cues | `expo-av` audio guides |
| **Ambient break sounds** | Rain, forest, lo-fi, silence — choose per break; auto-mute during calls | `expo-av` |
| **Smart pause** | Auto-pause when phone is moving (driving), in a call, screen off, or Focus/DND active | Motion / audio-session / Focus APIs (best-effort) |
| **Haptic patterns** | Gentle tap at break start/end; stronger in Strict Mode | `expo-haptics` |
| **Shortcuts / Focus integration** (iOS) | "Start work session" Shortcut triggers Blink Eye; break can trigger Focus | App Intents / Shortcuts |
| **Offline-first, no account** | Privacy selling point: everything on-device, no login, no tracking | Local-only storage |

### Tier 3 — Engagement & retention

| Feature | Notes |
|---|---|
| Streaks + weekly report card | "5-day streak · 94% adherence" — your `snooze_tracker` data, gamified |
| Break insights | Best focus windows, most-skipped times — simple aggregates over SQLite history |
| Rotating messages / quotes | Custom text + curated eye-health tips, shuffle per break (you already have shuffle logic) |
| Pomodoro + task reminders | Direct port of desktop features — high value for students/office workers |
| Custom scenes & packs | Favourite scene, shuffle mode, downloadable premium packs |
| Share streak (optional, later) | Image share, no backend needed; social accounts only if you add a server |

### Tier 4 — Monetisation (freemium, no ads recommended)

| Feature | Notes |
|---|---|
| Free: core timer, 4–6 scenes, basic stats, 1 widget | Generous free tier drives ASO + reviews |
| Premium: full scene library, Strict Mode, advanced stats, custom sounds, widget themes, Pomodoro presets | RevenueCat (unifies Play Billing + StoreKit) — replaces your Rust licensing |
| Lifetime premium | One-time purchase for your existing desktop premium users (cross-platform entitlement via RevenueCat) |

### Android-only Strong Mode (opt-in, Phase 2)

Exact alarm + full-screen intent / `SYSTEM_ALERT_WINDOW` overlay + foreground
service with persistent notification. Off by default, clear disclosure, separate
Play declaration. Never gate the MVP on it.

> **See also:** [`mobile-blocking-playbook.md`](./mobile-blocking-playbook.md) — the
> full breakdown of every blocking mechanism on iOS and Android, how Opal does it,
> and the escalation ladder from notification to OS-level shield.

### What NOT to build (v1)

- Other-app screen-time tracking (restricted APIs; on iOS you can only render
  Apple's report view, never read the numbers — see the playbook)
- User accounts / cloud sync / backend push (local notifications suffice; add
  sync only after product-market fit)
- Inescapable-overlay promises in copy or onboarding
- All 27 WebGL scenes at once (battery/GPU cost; ship lightweight subset)

### Suggested build order

1. **MVP (Tier 1)** → store-ready on both platforms
2. **Tier 2 widgets + guided exercises + ambient sounds** → differentiation + review safety
3. **Tier 3 streaks/stats + Pomodoro** → retention
4. **Tier 4 premium + Android Strong Mode** → revenue + power users

---

## Sources

- Expo — What you need to know about notifications (app states, Doze, headless
  notifications): https://docs.expo.dev/push-notifications/what-you-need-to-know/
- Expo SDK 53 changelog — `expo-background-task` replaces
  `expo-background-fetch`: https://expo.dev/changelog/sdk-53
- Android Developers — Schedule alarms (`SCHEDULE_EXACT_ALARM` /
  `USE_EXACT_ALARM`): https://developer.android.com/develop/background-work/services/alarms
- Google Play — publishing requirements 2026 (US$25, API 36, 12 testers /
  14 days, Data Safety): https://evertry.co/blog/publishing-an-app-on-google-play-store/
- Apple — App Store Review Guidelines (2.5.4 background modes):
  https://developer.apple.com/app-store/review/guidelines/
- iOS overlay impossibility (no draw-over-other-apps API):
  https://thewebtribune.com/what-does-draw-over-other-apps-mean/
