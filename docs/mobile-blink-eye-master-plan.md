# Blink Eye Mobile — Master Plan

> **One document. Everything known, connected.**
> Desktop → Expo React Native (Android + iOS): feasibility, the blocking design,
> how Opal does it, approvals, architecture, sequencing.
>
> **Companions (deeper detail, not repeated here):**
> - [`mobile-expo-feasibility.md`](./mobile-expo-feasibility.md) — package-by-package port map, permissions, publishing mechanics
> - [`mobile-blocking-playbook.md`](./mobile-blocking-playbook.md) — code-level blocking mechanisms, approval-risk evidence
>
> *Status: analysis complete, no code written. Branch `arena/d8f44194-blink-eye`.*

---

## 0. The one-paragraph answer

You can build and ship Blink Eye on both stores. You cannot port the desktop
overlay 1:1 — on iOS there is no draw-over-other-apps API at all, and on Android
there is one but the user grants it and can revoke it. **But you do not need an
overlay.** Apple's Screen Time API lets you physically stop the apps that strain
the user's eyes from opening, enforced by the OS, surviving force-quit and
reboot, and liftable only by your code. That is a *stronger* product than a
skippable popup, it is how Opal works, and it is demonstrably approvable. The
real obstacle is not review — it is an Apple entitlement queue measured in weeks.

---

## 1. Knowledge graph

### 1.1 The core dependency chain

Everything below flows from one fact. Read it top-down.

```
                    ┌─────────────────────────────────────┐
                    │  DESKTOP MODEL DOESN'T TRANSFER     │
                    │  always-on-top window + tray daemon │
                    │  = no mobile equivalent             │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  iOS has NO overlay API             │
                    │  Android has one, user-granted      │
                    └──────────────────┬──────────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                                                 │
   ┌──────────▼───────────┐                        ┌────────────▼─────────────┐
   │ iOS: block the APP,  │                        │ Android: overlay the     │
   │ not the SCREEN       │                        │ SCREEN (a11y + overlay)  │
   │ Screen Time API      │                        │ opt-in, revocable        │
   └──────────┬───────────┘                        └────────────┬─────────────┘
              │                                                 │
   ┌──────────▼───────────┐                        ┌────────────▼─────────────┐
   │ Needs Family Controls│                        │ Needs Accessibility       │
   │ (Distribution)       │                        │ declaration + approval    │
   │ entitlement ×4       │                        │ + disclosure + video      │
   └──────────┬───────────┘                        └────────────┬─────────────┘
              │                                                 │
   ┌──────────▼───────────┐                        ┌────────────▼─────────────┐
   │ ⚠ 2–6 WEEK QUEUE     │                        │ ⚠ 2–3 REVIEW CYCLES      │
   │ no SLA, no tracking  │                        │ 4–7 days each            │
   └──────────┬───────────┘                        └────────────┬─────────────┘
              │                                                 │
              └────────────────────┬────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  SHIP: notification-first    │
                    │  MVP (Tier 1) — no gates     │
                    │  Then add blocking engines   │
                    └──────────────────────────────┘
```

### 1.2 Mechanism → gate → fallback

Every capability Blink Eye wants, and what it costs to have it.

| Capability | iOS mechanism | iOS gate | Android mechanism | Android gate | If unavailable |
| --- | --- | --- | --- | --- | --- |
| 20-min break reminder | `expo-notifications` local | Notifications permission | Same + channel | `POST_NOTIFICATIONS` (13+) | — |
| Precise timing | `UNTimeIntervalNotificationTrigger` (60s min) | none | `SCHEDULE_EXACT_ALARM` or `USE_EXACT_ALARM` | User grant / Play declaration | Drift ±minutes in Doze |
| Pre-alert 15s before | Second scheduled notif | none | Second scheduled notif | none | — |
| DND-piercing nudge | `.timeSensitive` | Time Sensitive entitlement (easy) | Channel bypasses DND | none | Notification muted |
| **Block distracting apps** | Screen Time shield | **Family Controls ×4, 2–6 weeks** | AccessibilityService + overlay | **Declaration + video, 2–3 cycles** | Notification + in-app break only |
| Full-screen break UI | In-app after notification tap | none | In-app, or overlay over other apps | Overlay permission | In-app only |
| Strict mode (no skip) | Shield, no secondary button + `denyAppRemoval` | same as shield | Key-event filtering swallows Back/Home | same as a11y | Soft "are you sure" |
| Detect which apps are used | DeviceActivity (opaque tokens only) | same as shield | `UsageStatsManager` | `PACKAGE_USAGE_STATS` | Self-reported |
| Show usage numbers to user | Apple's SwiftUI report view only | same as shield | Own SQLite from UsageStats | none | Break history only |
| Persistent countdown | Live Activity / Dynamic Island | ActivityKit | Ongoing notification | none | Widget |
| Home-screen widget | WidgetKit | none | App Widget | none | — |
| Mission dismissal | In-app (camera/motion/sensors) | Camera/Motion usage strings | Same | Camera/Motion | Simple hold-to-confirm |
| Block uninstall | `denyAppRemoval` | same as shield | Block Settings via a11y | Extra review risk | Skip |
| Ambient sounds / scenes | `expo-audio` | none | `expo-audio` | none | — |
| Premium | StoreKit via RevenueCat | IAP | Play Billing via RevenueCat | Play Billing | — |
| OTA updates | `expo-updates` (JS only) | none | Same | none | Store review each time |

### 1.3 The escaping ladder — how hard each level is to ignore

```
LEVEL  HARDNESS  MECHANISM                                  BUILT BY
  7     ████████  Kiosk / Guided Access / device owner        (not consumer)
  6     ███████   Mission-gated dismissal                    ★ your differentiator
  5     ██████    Shield + no skip + denyAppRemoval          ★ the product
  4     █████     Shield (iOS) / fullscreen overlay (Android) ★ the product
  3     ████      Live Activity / ongoing notification
  2     ███       Time-Sensitive / DND-piercing
  1     ██        High-importance notification + sound
  0     █         Plain notification
```

Target: **4–5 as the product, 6 as the differentiator.** Never market 7.

### 1.4 Mobile blocker competitive map

```
                        HIGH STRICTNESS
                              │
          Lock Me Out ●       │       ● Jomo (blocks Settings!)
                              │       ● Opal (Deep Focus, Pro)
                              │       ● AppBlock (Strict Mode)
        Mindful Guard ●       │       ● Brick (hardware + software)
                              │
   ───────────────────────────┼───────────────────────────
   ANDROID-STRONG             │                    iOS-STRONG
   (a11y required)            │            (Screen Time API)
                              │
        StayFree ●            │       ● ScreenZen
        Forest ●              │       ● one sec  ← LOW friction, high research
                              │       ● Blink Eye ★ (proposed)
                        LOW STRICTNESS
```

Blink Eye's opening is the **empty quadrant edge**: high strictness, but with a
*positive* mission (rest your eyes) instead of a punishment framing. Nobody else
owns "the block is eye therapy."

### 1.5 Desktop → mobile component migration

| Desktop (`src-tauri`) | Mobile replacement | Fidelity |
| --- | --- | --- |
| `reminder_scheduler.rs` (1s tick, 30s config refresh) | JS scheduler + rolling 24h notification window | ~80% |
| `WebviewWindow` fullscreen always-on-top overlay | iOS shield + in-app break · Android a11y overlay | ~60% |
| Tray icon + live countdown | Live Activity / Dynamic Island / widget | ~70% |
| `appconfig.db` / `UserScreenTime.db` (SQLite) | `expo-sqlite` (schema ports nearly unchanged) | ~95% |
| `alert.tsx` (countdown + skip) | Break screen (Reanimated/Skia, keep-awake) | ~85% |
| `reminder-*.html` ×27 WebGL scenes | 6 lightweight scenes (Skia/Lottie/gradients) | ~25% |
| Strict Mode | Shield no-skip + missions | ~90% |
| Pre-alert 15s | `eventWillReachThresholdWarning` / 2nd notif | ~90% |
| Workday schedule | DeviceActivity schedules / alarm windows | ~85% |
| Pomodoro, task reminders | Pure JS port | ~100% |
| `ScreenTimeTracker` (other apps) | iOS: report view only · Android: UsageStats | ~40% / ~80% |
| Autostart | Android boot receiver · iOS none | 50% |
| Global shortcut | Nothing | 0% |
| Multi-monitor | N/A | — |
| `crypto.rs` premium licensing | RevenueCat | 100% |
| GitHub-release auto-updater | `expo-updates` (JS) + store review | ~70% |
| i18n (`i18next`) | Unchanged | 100% |

---

## 2. How Opal does it (and what to copy)

Opal is two products wearing one name. This is the single most useful fact:

| | iOS | Android |
| --- | --- | --- |
| Launched | ~2020 | mid-2025 |
| Blocking engine | **Apple Screen Time API** since 2022 (local VPN before) | **AccessibilityService** (Android 14+), "lighter" |
| Block applied by | `ManagedSettingsStore.shield.*` | a11y overlay / `GLOBAL_ACTION_HOME` |
| Survives force-quit | **Yes** — shield lives in OS | Partially — boot receiver |
| Ratings | 86k+ | ~8.2k |
| Can't-escape mode | Deep Focus (no cancel) | Hard Mode (Pro) |
| Escape hatch | Settings → Screen Time revoke | Settings → Accessibility off |

**Copy these, not its promises:**
1. **Shield is a nag, not a wall.** One sentence of friction. one sec's research: a 6-second pause cuts app opens ~57%.
2. **Waiting Room with escalating resistance.** Each bypass costs more than the last.
3. **Harden the background forever.** Opal 4.16's notes: *"hardening background blocking so every Rule applies on time, every time."* Budget ~35% of engineering here.

**Its honest limits — and yours:** on Android the block is switchable off in Settings; on iOS the user can revoke Screen Time access. No consumer blocker in 2026 is tamper-proof. Opal's real moat is friction design + streaks + Focus Score, so the user doesn't *want* to escape.

---

## 3. The Blink Eye mobile design

### 3.1 The core loop

```
        20 min of continuous use detected
                (iOS: DeviceActivityEvent threshold:20min)
                (Android: a11y elapsed-in-app clock)
                          │
                          ▼
        15s pre-alert notification  (desktop parity)
                          │
                          ▼
        ┌───────────────── BREAK MOMENT ─────────────────┐
        │                                                │
        │  iOS                          Android          │
        │  shields raised on all        fullscreen a11y  │
        │  distracting apps             overlay on top   │
        │        │                           │           │
        │        ▼                           ▼           │
        │  shield button → local        20s countdown    │
        │  notification → opens app     overlay dismisses│
        │        │                      itself           │
        │        ▼                                       │
        │  20s Look-Away mission                         │
        │        │                                       │
        │        ▼                                       │
        │  shields cleared  ◄────────────────────────────┘
        └────────────────────────────────────────────────┘
                          │
                          ▼
        Stats: breaks taken / skipped / streak
```

**The key insight on iOS:** the shield cannot open your app (Apple blocks it).
The button fires a notification the user taps. Then the break completes *inside
your app*, and **your app is what removes the shield.** If they never open the
app, the phone stays locked — exactly the behaviour you want, achieved with zero
policy risk.

### 3.2 Feature tiers

| Tier | Contents | Gate | Gate risk |
| --- | --- | --- | --- |
| **1 — MVP** | Smart scheduler, high-importance notifications, in-app fullscreen break, 6 scenes, dashboard/stats, settings, onboarding + permission priming | None | **None** |
| **2 — Differentiators** | iOS Break Shield, Android Strict Mode overlay, widgets, Live Activities, guided eye exercises, ambient sounds, missions | Entitlement / a11y | Medium |
| **3 — Retention** | Streaks, report card, insights, rotating tips, Pomodoro, task reminders | None | None |
| **4 — Revenue** | RevenueCat freemium, lifetime premium carry-over for desktop users | Store billing | None |

**Do not build in v1:** other-app screen-time tracking as *logic* (iOS gives
opaque tokens, never numbers), accounts/cloud sync, inescapable-overlay promises
in copy, all 27 WebGL scenes.

### 3.3 The four missions (differentiator)

| Mission | Mechanic | Why it works | Review safety |
| --- | --- | --- | --- |
| **Look-Away Hold** ★ | Hold phone at arm's length, keep dot in circle 20s | The mission *is* the therapy | Safe |
| **Walk 10 Steps** ★ | Pedometer counts 10 steps | Real blood flow, real 20-20-20 | Safe (Motion permission) |
| Blink Count | Front camera landmarks count blinks | Directly therapeutic | Camera string needed |
| Breathe + Hold | 4-7-8 guided breathing | Calming, no sensors | Safe |

Ship **Look-Away Hold + Walk 10 Steps** first: the mission is eye therapy, not a
punishment, so it reads as medicine rather than gimmick to a reviewer.

### 3.4 Mission Guard (the Alarmy lesson, done right)

Alarmy chains follow-up alarms at +1/+3/+6/+10/+15 min so dismissal requires
completing the mission. Blink Eye equivalent: if the break isn't completed,
re-notify with escalating channels (normal → time-sensitive → sound), and in
Strict Mode keep the shield up until the mission finishes. **Escapable by design**
(force-quit, wait it out) — that's what makes it approvable.

---

## 4. Approvals — two gates on iOS, one on Android

### 4.1 Gate map

```
┌───────────────────────────────────────────────────────────────┐
│ iOS                                                           │
│                                                               │
│  GATE 1 ── Family Controls (Distribution) entitlement         │
│            ×4 bundle IDs · Account Holder only                │
│            no SLA · no status · 2 days to 2+ months           │
│            ⇣ (dev builds work meanwhile via "Development")    │
│  GATE 2 ── App Review                                         │
│            real risk = 4.3 "simple timer", not 2.5            │
│            2.5.1 = automated entitlement check (stalls)       │
│            1–7 days, budget 2–3 cycles                        │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ Android                                                       │
│  GATE 1 ── Accessibility declaration + disclosure + video     │
│            must match binary · NO isAccessibilityTool         │
│            4–7 days per cycle, budget 2–3 cycles              │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Entitlement reality (evidence, not guesses)

| Outcome | Reported |
| --- | --- |
| Fastest | 2 days (main app), ~1 week |
| Typical | 2–3 weeks |
| Slow | 4.5 weeks · 6 weeks |
| Worst | 2+ months, no response |
| Declined → approved on re-application | ~2 weeks each way |

Non-negotiables: **4 requests, submitted day one**; **Account Holder only**;
Support cannot see your case; **transferring the app loses it**; after approval
also enable Family Controls in App Store Connect → Identifiers → Additional
Capabilities.

### 4.3 The 4.3 problem — and the answer

Apple names *"simple timer"* explicitly as a saturated category, and since
**June 2026** can remove already-live apps for it.

| Weak (likely 4.3) | Strong (approvable) |
| --- | --- |
| Splash → timer → settings | Shield that actually blocks apps |
| Looks like 50 other 20-20-20 apps | Distinct UI + real content (27 scenes) |
| "Reminds you to look away" | "Blocks doomscrolling until your eyes rest" |

Proof the category passes: Opal, one sec, Jomo, ScreenZen, Hardcore Focus, Brick,
AppBlock are all live. Jomo ships Strict Mode that blocks **editing, deleting and
the Settings app** — stricter than anything Blink Eye needs.

### 4.4 Copy rules (cheap insurance)

- ✅ "Blocks the apps that strain your eyes until you take your 20-second break."
- ❌ "You can't escape." / "Inescapable." / any absolute.
- ✅ "Eye strain, screen fatigue, dry eyes."
- ❌ "Treats," "prevents," "cures" anything.

### 4.5 Risk table

| Risk | Platform | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Entitlement delayed weeks | iOS | **High** | Submit 4 on day 1; ship notification MVP meanwhile |
| Entitlement declined | iOS | Low–med | Re-apply with detailed honest use case |
| 4.3 "simple timer" | iOS | **Medium** | Lead with shield + UI + content; state differentiation in notes |
| 2.5.1 automated stall | iOS | Medium | `codesign -d --entitlements` on all 4 executables |
| Medical-claims flag | iOS | Low | Copy rules above |
| a11y declaration rejected | Android | Medium | Narrow use, matching disclosure, video, no automation |
| Android 17 Advanced Protection revokes a11y | Android | Medium, growing | Ship UsageStats + overlay fallback |
| 12 testers / 14 days | Android | Medium | Organisation account, or start closed test day 1 |

---

## 5. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Expo app (expo-router)                                      │
│  Dashboard · Settings · Break screen · Stats · Missions      │
├──────────────────────────────────────────────────────────────┤
│  Scheduler (JS, pure logic — portable & testable)            │
│  rolling 24h notification window · workday · strict · snooze │
├─────────────────────┬─────────────────────┬──────────────────┤
│  expo-notifications │  expo-background-   │  expo-sqlite     │
│  channels, sounds,  │  task (reschedule,  │  settings,       │
│  time-sensitive     │  refresh stats)     │  breaks, stats   │
├─────────────────────┴─────────────────────┴──────────────────┤
│  PLATFORM ENGINES (native, behind one JS interface)          │
│                                                              │
│  iOS: FamilyControls + ManagedSettings + DeviceActivity      │
│       ├ main app          (auth, picker, store)              │
│       ├ DeviceActivityMonitor  (20-min threshold → shield)   │
│       ├ ShieldAction      (button → notification)            │
│       └ ShieldConfiguration (title/subtitle/icon/colors)     │
│       shared: App Group UserDefaults = single source of truth│
│                                                              │
│  Android: AccessibilityService + overlay + (optional) FGS    │
│       ├ TYPE_VIEW_SCROLLED / WINDOW_STATE_CHANGED            │
│       ├ TYPE_ACCESSIBILITY_OVERLAY (no extra permission)     │
│       └ BootReceiver + key-event filtering (strict)          │
└──────────────────────────────────────────────────────────────┘
```

**Implementation path:** start with `expo-app-blocker` (MIT, wraps both engines,
auto-generates iOS extension targets via `@bacons/apple-targets`). Drop to a
small Swift/Kotlin Expo module where it runs out: chained schedules, threshold
events, custom shield UI, `denyAppRemoval`, key filtering.

**Non-negotiables learned the hard way:**
- Requires a **development build** — not Expo Go.
- All 4 App IDs + App Group must exist in the portal *before* the first build.
- Block **all three** shield surfaces (`applications`, `applicationCategories`,
  `webDomains`) or Instagram opens in Safari.
- DeviceActivity schedules: **15-min floor, ~44-min ceiling → chain and re-arm.**
- Re-check Screen Time auth on every foreground (status lags).
- Android: debounce `TYPE_VIEW_SCROLLED` ~400ms — one fling emits several events.

---

## 6. Sequencing (the part that protects you)

```
WEEK 0   ── BEFORE ANY CODE ──────────────────────────────────────
         □ Submit 4 Family Controls (Distribution) requests
         □ Apple Developer Program enrolment ($99/yr, Account Holder)
         □ Google Play account ($25; org account avoids 12-tester rule)
         □ Write privacy policy + support URL
         □ Entitlement requests run in background for 2–6 weeks
                          │
WEEK 1   ── SPIKE ────────────────────────────────────────────────
         □ EAS dev build on real devices
         □ Notification timing test (iOS throttling, Android Doze)
         □ ONE exact-alarm test → validates the whole timing design
                          │
WEEKS 2–6 ── MVP, Tier 1 (zero gates) ────────────────────────────
         □ Dashboard, settings, scheduler, break screen
         □ 6 scenes, sounds, stats, workday, i18n
         □ Missions: Look-Away Hold + 10 Steps
         □ → SHIPPABLE on both stores today if entitlement is slow
                          │
WEEKS 6–9 ── BLOCKING ENGINES (Tier 2) ───────────────────────────
         □ iOS Break Shield (once entitlement lands)
         □ Android a11y overlay + Strict Mode + declaration video
         □ Fallback path: UsageStats + overlay
                          │
WEEKS 9–12 ── POLISH + REVENUE ───────────────────────────────────
         □ Widgets, Live Activities, RevenueCat
         □ ASO assets, closed test, review cycles
```

**Total: ~12 weeks.** Notification-first MVP is live by week 6 regardless of
Apple. That sequencing is the most important line in this document: **the
entitlement queue must never be on the critical path.**

---

## 7. Decision log

| # | Decision | Rationale |
| --- | --- | --- |
| 1 | Ship notification-first MVP first | Zero gates, 90% of value, de-risks the queue |
| 2 | iOS: block apps, never claim overlay | Only sanctioned mechanism; strongest possible |
| 3 | Android: a11y overlay, opt-in, never default | Only way to stop scrolls *inside* an app |
| 4 | Never set `isAccessibilityTool=true` | Instant Play denial; blockers aren't a11y tools |
| 5 | Missions = the differentiator, not the base | Survives 4.3; mission is the therapy |
| 6 | 6 scenes, not 27 | Mobile GPU/battery; rest become static |
| 7 | Local-only, no backend in v1 | Privacy + simplicity; push needs infra |
| 8 | RevenueCat, not ported `crypto.rs` | Store-mandated billing |
| 9 | No silent-audio keepalive, no Critical Alerts | Documented rejections for wellness apps |
| 10 | UsageStats fallback for Android 17 | Advanced Protection revokes a11y |

---

## 8. Open questions

1. **Personal or organisation Play account?** Decides whether 12 testers / 14 days applies.
2. **Does the free tier block, or only remind?** Blocking is the draw; gating it behind Pro may hurt retention more than it earns.
3. **Mission set for v1** — Look-Away Hold + 10 Steps confirmed?
4. **Desktop premium carry-over** — entitlement format, and whether `crypto.rs` licences can map to RevenueCat.
5. **Do you want the four entitlement requests drafted?** Highest-leverage action available today.

---

## 9. Sources

Consolidated in the two companion documents:
- [`mobile-expo-feasibility.md` §Sources](./mobile-expo-feasibility.md) — Expo/Play/App Store mechanics
- [`mobile-blocking-playbook.md` §Sources](./mobile-blocking-playbook.md) — Screen Time API, accessibility, entitlement timelines, 4.3 evidence

Primary anchors: Apple Screen Time API (FamilyControls / ManagedSettings /
DeviceActivity / ManagedSettingsUI), Apple Developer Forums (Family Controls
threads 725036, 744094, 809208), Google Play AccessibilityService policy §10964491,
`expo-app-blocker`, Opal FAQ + App Store release notes, Alarmy/one sec/Jomo
mechanics.
