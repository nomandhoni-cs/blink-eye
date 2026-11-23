# How to Actually Stop the User — The Complete Mobile Blocking Playbook

**Companion to:** [`mobile-expo-feasibility.md`](./mobile-expo-feasibility.md)
**Question answered:** *"How do I design a mobile app that blocks the user from scrolling and reminds them to take a break? What are all the ways? And how does Opal do it?"*

---

## 0. The most important reframe

"Block the user" is three different products with three different APIs. Pick the one you mean before writing code:

| Goal | What it means | Hardest platform | Best mechanism |
| --- | --- | --- | --- |
| **Remind** | A notification arrives. User can ignore it. | None | Local notifications |
| **Interrupt** | Something takes over the screen and holds it for N seconds. | iOS | iOS: Screen Time shield. Android: accessibility overlay |
| **Block** | The app refuses to open / scrolling is physically stopped for a period. | iOS | iOS: Screen Time shield (this is the *only* real way) |

Blink Eye's desktop behaviour is "Interrupt." Opal's behaviour is "Block." You can ship both on the same foundation, because **the iOS mechanism that interrupts is the same one that blocks.** That's the good news in this document.

The bad news, stated once and never repeated: **no app on either platform can stop the user from using their phone.** There is no API to disable the device, force an app to the foreground over another app, kill another app, or intercept a scroll gesture inside Instagram. Every product in this category, Opal included, is built on **the OS refusing to launch a blocked app** — not on the app seizing the screen. Understanding that distinction is the whole game.

---

## 1. What actually blocks an app on iOS

Apple ships a "Screen Time API" that is really three frameworks plus two extension points. It is the *only* sanctioned way to block another app, and it is what Opal, one sec, AppBlock, ScreenZen and Jomo all use.

| Framework | One job | What you get | What it can't do |
| --- | --- | --- | --- |
| **FamilyControls** | Permission + the system app picker | `AuthorizationCenter.requestAuthorization(for: .individual)`, `FamilyActivityPicker` returning **opaque tokens** | Reveal which apps the user picked. You never see bundle IDs or names. |
| **ManagedSettings** | Apply the block | `ManagedSettingsStore().shield.applications / .applicationCategories / .webDomains`, `ApplicationSettings.denyAppRemoval` | Outlive the user revoking your authorisation |
| **DeviceActivity** | Anything time-related | `DeviceActivityCenter`, `DeviceActivitySchedule`, `DeviceActivityEvent(threshold:)`, `eventDidReachThreshold` | Run continuously — iOS wakes the extension on events only, then suspends it |
| **ManagedSettingsUI** | Style the block screen | `ShieldConfigurationDataSource` → title, subtitle, icon, background, **max 2 buttons** | Show a countdown, open your app, run custom UI |

### The mechanics you need to know

1. **The entitlement.** `com.apple.developer.family-controls` must be requested from Apple per bundle ID — and because you need extensions, that's **4 app IDs**: main app + `DeviceActivityMonitor` + `ShieldAction` + `ShieldConfiguration`. Budget about a week. While waiting, Xcode's **"Family Controls (Development)"** capability works fully on device but cannot go to TestFlight/App Store.
2. **App Group is the source of truth.** Every extension and the main app share one `ManagedSettingsStore(named: .init("group.com.you.blocker"))` plus `UserDefaults(suiteName:)`. Whoever applies the shield, everyone sees it.
3. **Blocks survive force-quit, reboot and app deletion.** This is the key advantage over notifications: the shield lives in the OS, not in your process. Only your code — or revoking authorisation in Settings — clears it.
4. **The shield can't open your app.** Ever. `ShieldActionDelegate` can't launch a URL. The standard workaround, used by every blocker including Opal: the shield's primary button fires a **local notification**, and tapping it opens your app. Ask for notification permission at the same moment Screen Time is granted, or the button looks dead.
5. **Minimum time granularity is 15 minutes.** DeviceActivity schedules below ~15 minutes are rejected/unreliable; schedules beyond ~44 minutes get dropped, so real blockers **chain** 15/30/44-minute schedules and re-arm each other.
6. **Usage thresholds are how you get "after 20 minutes."** This is the API that means exactly what Blink Eye needs:

```swift
// Fires when the selected apps have been used for 20 min inside the interval
let event = DeviceActivityEvent(
    applications: selection.applicationTokens,
    categories: selection.categoryTokens,
    webDomains: selection.webDomainTokens,
    threshold: DateComponents(minute: 20),
    includesPastActivity: true
)
try DeviceActivityCenter().startMonitoring(activityName, during: schedule, events: [eventName: event])
```

```swift
class BreakActivityMonitor: DeviceActivityMonitor {
    let store = ManagedSettingsStore(named: .init("group.com.blinkeye.app"))

    // 20 minutes of use reached -> raise the shield on everything
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        let sel = BlockingManager.shared.loadSelection()
        store.shield.applications = sel.applicationTokens
        store.shield.applicationCategories = .specific(sel.categoryTokens)
        store.shield.webDomains = sel.webDomainTokens
        postBreakNotification() // shield cannot open the app, so hand off
    }

    // optional: "15 seconds before" analogue
    override func eventWillReachThresholdWarning(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        postPreAlertNotification()
    }
}
```

7. **Block all three surfaces or it's a fake block.** `shield.applications` + `shield.applicationCategories` + `shield.webDomains`. Miss web domains and the user opens Instagram in Safari. Miss categories and whole shelves slip through.
8. **`ApplicationSettings.denyAppRemoval = true`** makes the app undeletable while a block is active. This is Opal's "Uninstall protection."
9. **The user can always escape** by Settings → Screen Time → revoking your authorisation, or by turning the phone off. Accept it; design the friction, not the prison.

### What iOS structurally cannot do (stop looking for it)

- Draw an overlay on top of another app (no `SYSTEM_ALERT_WINDOW` equivalent)
- Bring your app to the foreground from the background
- Close or background another app
- Detect a scroll gesture inside another app
- Read *which* apps are used or for how long as usable data — DeviceActivity can only render an Apple-hosted **SwiftUI report view**, not hand you numbers
- Use Critical Alerts unless you're medical/security/public-safety (eye breaks are not; alarm apps are refused)

### The rest of the iOS toolbox, in descending strength

| # | Mechanism | Strength | Permission / risk | Verdict for Blink Eye |
| --- | --- | --- | --- | --- |
| 1 | **Screen Time shield** (FamilyControls + ManagedSettings + DeviceActivity) | ★★★★★ OS-enforced, survives force-quit | Entitlement approval; not for kids without Family Sharing | **Build this.** The only real interruption. |
| 2 | **Focus mode integration** + Shortcuts automations | ★★★ User-driven | None | Cheap win: expose "Blink Eye Break" as a Focus filter, and a Shortcuts action "start break" |
| 3 | **Time Sensitive notifications** (`.timeSensitive`, `interruptionLevel`) | ★★★ Breaks Focus/DND | Own entitlement (`com.apple.developer.usernotifications.time-sensitive`) | **Build this** for the 20-min nudge |
| 4 | **Live Activity / Dynamic Island** persistent break timer | ★★ Visible everywhere | ActivityKit | Nice Tier 2: "next break in 4:32" |
| 5 | **Background audio keep-alive** (silent loop, Alarmy trick) | ★★ Keeps process alive | Guideline 2.5.4; reviewers reject audio modes used for anything but audio | **Don't.** Rejection bait for a break app. |
| 6 | **Guided Access / Screen pinning** | ★★★★★ but user-enabled | User must enable per session | Only for a "deep work kiosk" mode, opt-in |
| 7 | **Local VPN / NEDNSProxy** to kill domains | ★★★ web only | Network Extension entitlement + separate review | Unnecessary if you use `shield.webDomains` |
| — | Critical Alerts | — | Denied for wellness apps | No |

---

## 2. What actually blocks an app on Android

Android is the opposite: no single blessed API, a pile of blunt instruments, all user-granted and revocable.

| # | Mechanism | Strength | Permission | Verdict |
| --- | --- | --- | --- | --- |
| 1 | **AccessibilityService** (`TYPE_VIEW_SCROLLED`, `TYPE_WINDOW_STATE_CHANGED`) + overlay | ★★★★★ can block, overlay, count scrolls | Accessibility + **Play declaration form + approval** | **This is what Opal uses on Android 14+.** The only way to stop scrolling *inside* an app. |
| 2 | **`SYSTEM_ALERT_WINDOW` overlay + foreground service** | ★★★★ draws over anything | "Display over other apps" special access | Easier than a11y, but **can't detect** when to fire; pair with #3 |
| 3 | **`UsageStatsManager` / `queryEvents`** | ★★ detection only | `PACKAGE_USAGE_STATS` special access | FirstPage's approach: detect foreground app, no accessibility. Weaker timing, policy-lighter |
| 4 | **Exact alarms + full-screen intent notification** | ★★★ interrupts hard | `SCHEDULE_EXACT_ALARM` (user), `USE_FULL_SCREEN_INTENT` (**Android 14+ Play restricts to calling/alarm apps**) | Don't rely on full-screen intent. Exact alarm alone is fine for the 20-min tick |
| 5 | **`performGlobalAction(GLOBAL_ACTION_HOME)`** | ★★★ kicks user out of the app | Accessibility | Brutal but effective; use only in Strict Mode |
| 6 | **Key event filtering** (`canRequestFilterKeyEvents`) | ★★★ swallows Back/Home gestures | Accessibility | Makes the overlay genuinely unskippable |
| 7 | **Local `VpnService` DNS filter** | ★★★ web only | VpnService policy declaration | Alternative to overlay for web |
| 8 | **Device Admin / device owner, kiosk** | ★★★★★ | Enterprise/DPC, or deprecated admin | Not for Play consumer apps |
| 9 | **Accessibility to block the uninstall screen** | ★★★★ uninstall protection | Accessibility + review risk | What "Lock Me Out" does. Risky. |

### The three Android traps

1. **Play's accessibility policy.** A blocker is *not* an accessibility tool — you may **not** set `isAccessibilityTool=true`. You must: complete the Permissions Declaration Form in Play Console, receive approval, show an **in-app prominent disclosure** (what data, why, what's read), get **affirmative consent before** the system dialog, and submit a **screen-recorded video** of the disclosure flow. Do this at first submission; a missing/mismatched declaration is a suspension, not a rejection.
2. **Android 17 Advanced Protection Mode** revokes AccessibilityService from any app not declared as an accessibility tool. Architect a fallback (UsageStats + overlay) or your app silently dies for security-conscious users.
3. **Android 13+ blocks enabling accessibility for sideloaded APKs.** Fine for Play-installed builds; annoying for internal testers — test via Play internal testing, not raw APKs.

### The "20 minutes of scrolling" recipe on Android

There is no API that says "the user scrolled 20 minutes." You assemble it:

```
AccessibilityService.onAccessibilityEvent()
  ├─ TYPE_VIEW_SCROLLED        → scrollCount++ (debounce ~400ms; one fling emits several)
  │                              getScrollDeltaY() on API 28+ tells you how far
  ├─ TYPE_WINDOW_STATE_CHANGED → entered/left target package → start/stop a monotonic clock
  └─ TYPE_TOUCH_INTERACTION_START → still an active human
        ↓ when elapsed in target package ≥ 20 min (or scrollCount ≥ N)
OverlayManager.show()  →  WindowManager.addView(type = TYPE_ACCESSIBILITY_OVERLAY)
        ↓
Full-screen overlay, FLAG_NOT_TOUCH_MODAL off, focusable, 20s look-away countdown,
key filtering swallows Back/Home; on completion → remove view, reset clock
```

`TYPE_ACCESSIBILITY_OVERLAY` needs **no extra permission** — it comes with the accessibility service. That's why "accessibility service + overlay" is the standard combo for every Android doomscroll app (ScrollBlocker, ScrollPause, Opal).

---

## 3. How Opal does it, precisely

Opal is a two-product company wearing one name. This is the single most useful fact for you:

| | iOS | Android |
| --- | --- | --- |
| Launched | ~2020 | mid-2025 |
| Blocking engine | **Apple Screen Time API** (FamilyControls + ManagedSettings + DeviceActivity) since 2022 — it used a local VPN before that | **AccessibilityService** on Android 14+, plus usage stats; "lighter" than iOS |
| Detect which apps to block | System `FamilyActivityPicker`, opaque tokens | Package list, chosen by the user |
| Apply the block | `ManagedSettingsStore().shield.*` — OS-level shield over app icon/launch | Overlay drawn by the a11y service, or `GLOBAL_ACTION_HOME` |
| Survive force-quit | **Yes** — shield is in the OS | Partially — service auto-restarts, boot receiver |
| Block ratings | 86,000+ | ~8,250 — they are iPhone-first because the iOS foundation is simply better |
| The "can't escape" mode | **Deep Focus**: no cancel button | **Hard Mode** (Pro) |
| Escape hatch | Settings → Screen Time → revoke; delete app (blocked by `denyAppRemoval`) | Settings → Accessibility → off |
| Products on top | Blocklists/allowlists, sessions, time limits, **Mindful Block screens** (a quote/pun every time you open a blocked app), Waiting Room with *increasing* delay, Focus Score, streaks, reports, Shortcuts + Focus integration | Same product surface, weaker plumbing |

**Three Opal ideas worth copying outright:**

1. **The shield is the nag, not a wall.** Opal's shield shows a sentence. Opening the app requires a deliberate extra action. The friction *is* the product — research on one sec shows a 6-second pause cuts opens by ~57%. For eye care this is perfect: the shield can literally say *"Look 20 feet away for 20 seconds."*
2. **Waiting Room with increasing resistance.** Every bypass attempt costs more time than the last. Adapt to: skip cost doubles, capped.
3. **Harden the background.** Opal's 4.16 release notes are literally "hardening background blocking so every Rule applies on time, every time." Expect 30–40% of your engineering time to be spent on "the block didn't fire," not on screens.

**And the honest caveats from Opal's own reviews:** on Android the block can be switched off in Settings; on iOS the user can revoke Screen Time access; neither platform is tamper-proof in 2026. Opal's answer isn't stronger APIs, it's **design friction + streaks + a Focus Score** so the user doesn't *want* to escape.

---

## 4. The full escalation ladder

Ranked by how hard it is to ignore. Build bottom-up; never promise the top.

| Level | Mechanism | iOS | Android | Bypass cost to user |
| --- | --- | --- | --- | --- |
| 0 | Banner notification | ✅ | ✅ | Swipe away |
| 1 | High-importance notification with sound, own channel | ✅ | ✅ | Mute channel |
| 2 | Time-Sensitive / DND-piercing | ✅ | ✅ (channel bypass DND) | Change Focus |
| 3 | Live Activity / ongoing notification with countdown | ✅ | ✅ | Ignore |
| 4 | **Shield over the app** (iOS) / **fullscreen overlay** (Android) | ✅ | ✅ | Tap a button / press Home |
| 5 | Shield + `denyAppRemoval` + strict mode (no skip button) | ✅ | ✅ | Revoke permission in Settings |
| 6 | Mission-gated dismissal (hold phone still 20s, walk 10 steps, blink count) | ✅ in-app | ✅ in-app | Force-quit, wait it out |
| 7 | Kiosk/Guided Access, device owner | ✅ user-enabled | ✅ enterprise | Reboot |

**Level 4–5 is where Blink Eye belongs.** Level 6 (missions) is what makes it feel different from Opal. Level 7 is not a consumer feature.

---

## 5. Designing Blink Eye around this

### The core loop (same product, two engines)

```
20 min of continuous use detected
        ↓
Level 2 notification (10s pre-alert, like the desktop app)
        ↓
Break moment:
   iOS      → all selected apps get a Break Shield
              │ user taps "Take my break"
              ├→ local notification → opens Blink Eye
              └→ 20s Look-Away screen → 20s done → shields cleared
   Android  → fullscreen accessibility overlay on top of whatever is open
              └→ 20s Look-Away countdown → overlay dismisses itself
        ↓
Stats: breaks taken / skipped / longest streak
```

The iOS loop is the important insight: **the break completes inside your app and your app is what removes the shield.** That makes the break a real gate without any overlay API. If they never open the app, the phone stays locked down — which is exactly the behaviour you want, and it's achieved with zero policy risk.

### Feature set that maps cleanly

| Blink Eye concept | Mobile implementation |
| --- | --- |
| 20/20/20 timer | iOS `DeviceActivityEvent(threshold: 20min)` / Android a11y elapsed-in-app clock |
| Strict mode (can't skip) | iOS: shield with no secondary button + `denyAppRemoval`; Android: overlay with key filtering |
| Full-screen reminder | iOS: Break Shield + in-app break scene; Android: `TYPE_ACCESSIBILITY_OVERLAY` |
| Countdown styles (circle/bar/dial) | In-app + overlay only (shield can't show a countdown) |
| 27 background themes | Ship 6 lightweight scenes; reuse existing Lottie/WebGL assets |
| Pre-alert | `eventWillReachThresholdWarning` (iOS) / notification (Android) |
| Multi-monitor | Not applicable; replace with per-app block lists |
| Screen-time stats | iOS: Apple's report view (you can't read it); Android: your own usage stats |
| Snooze | Skip counter with escalating cooldown (Opal's Waiting Room) |
| Workday schedule | DeviceActivity schedules / alarm windows |

### How to implement it in Expo

`expo-app-blocker` (MIT, actively published) already wraps both engines and auto-generates the iOS extension targets with `@bacons/apple-targets`:

```bash
npx expo install expo-app-blocker expo-notifications expo-task-manager expo-background-task
```

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.blinkeye.app",
      "appleTeamId": "XXXXXXXXXX",
      "entitlements": {
        "com.apple.developer.family-controls": true,
        "com.apple.security.application-groups": ["group.com.blinkeye.app"],
        "com.apple.developer.usernotifications.time-sensitive": true
      }
    },
    "plugins": [["expo-app-blocker", {
      "ios": {
        "appGroup": "group.com.blinkeye.app",
        "shield": {
          "title": "Time to rest your eyes",
          "subtitle": "Look 20 feet away for 20 seconds.",
          "primaryButtonLabel": "Take my break",
          "secondaryButtonLabel": null,
          "backgroundColor": "#101820"
        }
      }
    }]]
  }
}
```

```ts
import { requestPermissions, setBlockConfiguration, presentFamilyActivityPicker } from 'expo-app-blocker';

const { allGranted } = await requestPermissions();          // Screen Time authorisation
const items = await presentFamilyActivityPicker();          // user picks doomscroll apps
await setBlockConfiguration({ blockedItems: items, isActive: true });
```

Caveats that will cost you a day each if you don't know them: requires a **development build** (not Expo Go); the four App IDs + App Group must exist in the Apple Developer portal before the first build or you get cryptic provisioning errors; entitlement takes ~1 week per bundle ID; permission status can lag after the user changes it in Settings — re-check on foreground. Where the wrapper runs out (custom shield UI, chained schedules, threshold events, `denyAppRemoval`), write a small Expo module in Swift/Kotlin rather than fighting the JS layer.

### Packaging it so it passes review

- **Never write "you can't escape."** Say *"Blink Eye blocks the apps that strain your eyes until you take your 20-second break."* Accurate, and it's the true feature.
- iOS review notes must explain: *"Uses Family Controls with individual authorisation for self-imposed eye-strain breaks. Break sessions are user-initiated and self-limiting."*
- Android: complete the accessibility declaration form, record the disclosure video, keep `isAccessibilityTool` unset, and make the disclosure text match your actual code.
- Don't ship the Alarmy silent-audio trick, Critical Alerts, or full-screen-intent alarms. All three have caused documented rejections for similar apps.

---

## 6. Recommendation

1. **Ship the notification-first break app** (Tier 1 in the feasibility doc) — this is the real product, reviewable in a week.
2. **Build the iOS Break Shield next.** It is the same foundation as blocking, needs one entitlement and one approval, and it is the only way to interrupt on iOS. Budget a week for Apple approval, and use the Development entitlement meanwhile.
3. **Build Android Strict Mode (accessibility + overlay) third**, behind a prominent disclosure and an explicit opt-in, with a UsageStats+overlay fallback for Android 17 Advanced Protection users.
4. **Add missions last** (Look-Away Hold, Walk 10 Steps) — this is your differentiation from Opal, and the mission *is* the eye therapy.
5. Copy Opal's friction design (escalating skip cost, streaks, reports), not its promises. Its Android block is switchable off in Settings too.

Bottom line: **one sentence.** On iOS you cannot take over the screen — you take away the app. On Android you can genuinely take over the screen, but the user granted that power and can revoke it. Opal won with the first, not the second.

---

## 7. Will it get approved? (iOS + Android review risk)

Short answer: **yes, this category is demonstrably approvable — but iOS has two gates, not one, and the first one is not a review at all.** Plan the entitlement timeline first; everything else is ordinary review work.

### Gate 1 (iOS, before review): Family Controls (Distribution) entitlement

This is the real bottleneck, and it has **no SLA and no published criteria**. Real developer reports from the Apple forums, 2023–2026:

| Outcome | Reported times |
| --- | --- |
| Fastest | 2 days (main app), ~1 week |
| Typical | 2–3 weeks |
| Slow | 4.5 weeks, 6 weeks |
| Worst reported | 2+ months, no response, no status |
| Declined, then approved on re-application with more detail | ~2 weeks each way |

Hard facts to plan around:

- **One request per bundle ID.** That's 4 for Bloka-style apps (main + `DeviceActivityMonitor` + `ShieldAction` + `ShieldConfiguration`). Multiple developers report the main app approved in 2 days and then 10+ days stuck on the extensions. **Submit all four on day one.**
- **Only the Account Holder can submit** — an Admin cannot. It arrives by email to the Account Holder.
- **No status tracking.** Support cannot see progress; they tell you there are no SLAs. One team reported asking weekly for two months.
- **An app transfer loses the entitlement** — you re-apply and queue again.
- After approval you must **also** enable Family Controls under App Store Connect → Identifiers → Additional Capabilities, or the build still fails provisioning.
- Development builds work the whole time via **Family Controls (Development)**; only TestFlight/App Store need Distribution.

**Practical plan:** submit the four requests as the very first action of the project, and build the notification-first MVP (Tier 1) while waiting. If Distribution is refused, you have a shippable product anyway.

### Gate 2 (iOS): App Review — the real risk here is Guideline 4.3, not 2.5

The saturated-category clause names *"simple timer"* apps explicitly, and as of **June 2026 it also lets Apple remove apps already live** if they're not updated, improved or attracting customers. An eye-break 20-20-20 timer is, on its face, squarely in that zone.

What actually separates an approval from a 4.3 rejection in this category:

| Weak (likely 4.3) | Strong (approvable) |
| --- | --- |
| Splash → timer → notification settings | Break Shield that actually blocks the apps |
| Looks like the 50 other 20-20-20 apps | Distinct visual identity, real content (27 scenes = content) |
| "Reminds you to look away" | "Blocks doomscrolling until your eyes rest" — a mechanism, not a nudge |

Live proof the category passes: **Opal, one sec, Jomo, ScreenZen, Hardcore Focus, Brick, AppBlock** are all on the store using these exact APIs. Jomo even ships "Strict Mode" that blocks *editing, deleting, and the Settings app* during a session — stricter than anything Blink Eye needs. The gate is "is this meaningfully different," not "is this allowed."

Also expect automated **Guideline 2.5.1** messages when you use the Screen Time API without the entitlement attached to every target — those are machine checks, not human rejections, and they stall review until fixed. Retail pack: a wellness claim may additionally draw a medical-claims note; keep the copy to "eye strain and screen fatigue," never "treats" or "prevents" anything.

### Google Play: the accessibility declaration is a real gate, but passable

- **Permissions Declaration Form for AccessibilityService** — required, reviewed, and it must match your binary. A blocker is **not** an accessibility tool: do **not** set `isAccessibilityTool=true`. You need the prominent in-app disclosure, affirmative consent *before* the system dialog, and a **screen-recorded video** of that flow.
- **Automation is the banned use case.** "Autonomous action" (clickbots, self-driving UI) is prohibited. Blink Eye only *observes* scroll/window events and *draws an overlay* — that is the same declared use as Opal, one sec, ScreenZen and AppBlock. State it exactly that way and never let a feature auto-click or auto-navigate on the user's behalf.
- **Rejection loops happen.** Play reviews for sensitive permissions commonly take **4–7 days** and sometimes repeat; budget 2–3 submission cycles, and do not book a launch date on review day. Some apps get extended review of up to 7+ days.
- **Data safety form must match the binary.** A library silently adding a permission (e.g. `ACTIVITY_RECOGNITION`) has caused health-declaration mismatches and upload errors for other teams — audit the merged manifest.
- **Foreground services need a declared `foregroundServiceType`** (Android 14+), and Android 13+ blocks enabling accessibility for sideloaded APKs — so test through Play internal testing, not raw APKs.

### Risk table

| Risk | Platform | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Family Controls Distribution delayed weeks | iOS | **High** | Submit all 4 on day 1; build in development entitlement; ship notification MVP meanwhile |
| Family Controls Distribution declined | iOS | Low–medium | Re-apply with a detailed, honest use-case description; forums show approval on second attempt |
| Guideline 4.3 "simple timer" | iOS | **Medium** | Lead with the Break Shield, differentiated UI and real content; name the differentiation in review notes |
| Guideline 2.5.1 automated stall | iOS | Medium | Entitlement on all 4 targets; verify with `codesign -d --entitlements` on every executable in the IPA |
| Medical-claims flag (eye health) | iOS | Low | "Eye strain / screen fatigue," never "treats" or "prevents" |
| Accessibility declaration rejected | Android | Medium | Narrow declared use, matching disclosure, video of the flow, no automation |
| Android 17 Advanced Protection revokes a11y | Android | Medium (growing) | Ship the UsageStats + overlay fallback path |
| 12 testers / 14 days (new personal Play account) | Android | Medium | Use an organisation account, or start the closed test on day 1 |

**Bottom line:** the blocking design is not what puts you at risk — the entitlement queue and the "is this just another timer?" judgment are. Both are manageable if you start the entitlement paperwork before writing code and make the shield, not the countdown, the headline feature.

---

## Sources

- How app blockers actually work on iPhone (FamilyControls / ManagedSettings / DeviceActivity, opaque tokens): https://lagerland-apps.github.io/journal/what-an-iphone-app-can-actually-block/
- Family Controls (Distribution) real-world wait times, per-bundle-ID requests, declined-then-approved, transfer losing entitlement: https://developer.apple.com/forums/thread/725036 and https://developer.apple.com/forums/thread/744094 and https://developer.apple.com/forums/tags/family-controls
- Main app approved but Shield extension stuck 2+ weeks (entitlement is per target): https://developer.apple.com/forums/thread/809208
- Screen Time API apps hitting automated Guideline 2.5.1 entitlement checks at review: https://developer.apple.com/forums/tags/screen-time
- Guideline 4.3(b) saturation, "simple timer" named category, and the June 2026 revision allowing removal of live apps: https://www.kindacode.com/article/why-does-apple-reject-your-ios-apps-for-spam-guideline-4-3 and https://support-url-generator.com/blog/apple-4-3b-spam-crackdown-2026
- Current iOS blockers built on the Screen Time API, incl. Jomo Strict Mode blocking Settings: https://www.hardcorefocus.com/blog/best-app-blockers-iphone-2026/
- Play review timelines (4–7 days, rejection loops) and permission-declaration requirements: https://www.forasoft.com/blog/article/how-to-get-you-app-approved-on-google-play-and-app-store
- Declaration/binary mismatch causing upload errors (merged-manifest permissions): https://sahha.ai/blog/health-connect-play-store-rejection/
- Building an iOS blocker with the Screen Time API in Expo — entitlement, App Group, shield-can't-open-app: https://dev.to/yarmolenkod/building-an-ios-app-blocker-with-the-screen-time-api-familycontrols-in-expo-what-the-docs-dont-2emi
- Apple's Screen Time API in practice — three independent blockers, 15/30/44-minute chaining: https://habitdoom.com/blog/apple-screen-time-api-guide
- DeviceActivity usage thresholds (`eventDidReachThreshold`, `warningTime`): https://crunchybagel.com/monitoring-app-usage-using-the-screen-time-api/
- Debugging `eventDidReachThreshold` / store not bound to App Group: https://www.weblineglobal.com/blog/fix-deviceactivitymonitorextension/
- Shield buttons, temporary unlock, 15-minute floor: https://www.reddit.com/r/swift/comments/1dtavj2/screen_time_api/
- `expo-app-blocker` (Expo module, both platforms, entitlement setup): https://github.com/eylonshm/expo-app-blocker
- Opal FAQ — "we use Apple's Screen Time API, no other way on iPhone": https://opalapp.com/help/what-is-opal
- Opal on Android uses AccessibilityService (Android 14+): https://doomsaver.com/blog/best-apps-to-stop-doomscrolling.html
- Opal Android is a rebuild, not a port; every Android blocker is switchable off: https://habitdoom.com/blog/opal-alternative-android
- Opal 4.16/4.17 release notes — background hardening, uninstall protection, Waiting Room resistance: https://apps.apple.com/us/app/opal-screen-time-control/id1497465230
- Play — AccessibilityService declaration, disclosure, `isAccessibilityTool` rules: https://support.google.com/googleplay/android-developer/answer/10964491
- Android 17 Advanced Protection Mode revoking accessibility from non-tool apps: https://android.gadgethacks.com/news/android-17-beta-2-blocks-popular-automation-apps/
- `TYPE_VIEW_SCROLLED` detection limits and debouncing: https://github.com/bluezoid/Digital-wellbeing-scroll-journey
- Accessibility overlay + key filtering + boot receiver reference implementation: https://github.com/harshalsalunke/ScrollBlocker
