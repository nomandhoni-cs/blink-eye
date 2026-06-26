# ReminderControl.tsx

## Purpose
This component is the **UI and logic** that runs INSIDE the PRIMARY reminder window. It's what the user sees and interacts with during a break on their main monitor.

Think of it as the **break screen interface** that appears on the primary monitor with full features.

**Note:** Secondary monitors show only the background animation via `reminder-minimal.tsx` (not this component).

## What It Does

### 1. Displays the Break Timer
Shows a countdown timer with smooth animations:
- Large animated numbers counting down (e.g., 20 seconds → 19 → 18...)
- Progress bar showing time remaining
- Two visual styles: Linear progress or circular progress

```typescript
// User has 20 seconds left
<AnimatedCounter value={20} fontSize="240px" />
// Shows: "20s" with smooth rolling animation
```

### 2. Shows Break Information
Displays helpful info during the break:
- Current time
- Screen-on time (how long computer has been used today)
- Custom reminder text (or default message)

```typescript
<CurrentTime />           // "2:30 PM"
<ScreenOnTime />          // "4h 23m"
<div>{reminderText}</div> // "Look into the distance..."
```


### 3. Handles User Interactions
Provides a "Skip this Time" button (if not in strict mode):
- Clicking it closes ALL reminder windows on ALL monitors
- Uses event broadcasting to synchronize closing

```typescript
<Button onClick={closeAllReminderWindows}>
  Skip this Time
</Button>
```

### 4. Manages the Countdown
Automatically counts down and closes windows when time expires:
- Decrements timer every second
- Plays sound when 1 second left (premium feature)
- Closes all windows when timer reaches 0

```typescript
useEffect(() => {
  if (timeLeft <= 1) {
    handlePlayAudio(); // Play "done" sound
  }
  if (timeLeft <= 0) {
    closeAllReminderWindows(); // Close all windows
  }
  
  const timer = setInterval(() => {
    setTimeLeft(prev => prev - 1); // Count down
  }, 1000);
}, [timeLeft]);
```

### 4. Manages the Countdown
Automatically counts down and closes windows when time expires:
- Decrements timer every second
- Plays sound when 1 second left (premium feature)
- Closes all windows when timer reaches 0

```typescript
useEffect(() => {
  if (timeLeft <= 1) {
    handlePlayAudio(); // Play "done" sound
  }
  if (timeLeft <= 0) {
    closeAllReminderWindows(); // Close all windows
  }
  
  const timer = setInterval(() => {
    setTimeLeft(prev => prev - 1); // Count down
  }, 1000);
}, [timeLeft]);
```

### 5. Listens for Close Events
Each window listens for the "close-all-reminders" event:
- When ANY window emits this event, ALL windows close
- This is how clicking "Skip" on primary closes all monitors

```typescript
useEffect(() => {
  const unlisten = listen("close-all-reminders", () => {
    getCurrentWebviewWindow().close(); // Close myself
  });
}, []);
```


## Key Functions

### `closeAllReminderWindows()`
**Purpose**: Close ALL reminder windows across ALL monitors

**How it works**:
1. Gets reference to current (primary) window
2. Loops through `reminder_monitor_0` to `reminder_monitor_9`
3. Directly closes each window except itself using `WebviewWindow.getByLabel()`
4. Uses `Promise.allSettled()` to close all secondary windows in parallel
5. Closes itself last

```typescript
const closeAllReminderWindows = async () => {
  const currentWin = getCurrentWebviewWindow();
  
  // Close all OTHER windows first (in parallel)
  const closePromises = [];
  for (let i = 0; i < 10; i++) {
    const win = await WebviewWindow.getByLabel(`reminder_monitor_${i}`);
    if (win && win.label !== currentWin.label) {
      closePromises.push(win.close());
    }
  }
  
  await Promise.allSettled(closePromises);
  await currentWin.close(); // Close self last
};
```

**Why direct window management?**
- **No event system dependency**: More reliable than cross-webview events
- **Primary window authority**: Single source of truth for closing
- **No race conditions**: Sequential close (others first, self last)
- **Works across all contexts**: Direct process-level window management

### `handlePlayAudio()`
**Purpose**: Play completion sound when break is almost done

**What it does**:
1. Loads "done.mp3" from resources
2. Plays it when 1 second remains
3. Only for premium users

```typescript
const handlePlayAudio = async () => {
  const filePath = await path.join(resourceDir, "done.mp3");
  let sound = new Audio(convertFileSrc(filePath));
  sound.play(); // 🔊 Ding!
};
```

## Component Lifecycle

```
Reminder Window Opens
    ↓
ReminderControl Mounts
    ↓
Shows "Ready?" for 0.5 seconds
    ↓
Fetches Settings:
  - Reminder duration (20 seconds)
  - Custom text
  - Strict mode setting
  - Timer style (linear/circular)
    ↓
Starts Countdown (20 → 19 → 18...)
    ↓
    ├─→ At 1 second: Plays sound (if premium)
    └─→ At 0 seconds: Closes all windows
```


## Visual Modes

### 1. Linear Progress Style (Default)
```
┌─────────────────────────────────────┐
│                                     │
│              20s                    │
│         ▓▓▓▓▓▓▓▓░░░░                │
│                                     │
│  🕐 2:30 PM  |  📊 4h 23m           │
│                                     │
│  "Look into the distance..."        │
│                                     │
│      [Skip this Time]               │
└─────────────────────────────────────┘
```

### 2. Circular Progress Style
```
┌─────────────────────────────────────┐
│                                     │
│           ╭───────╮                 │
│          │   20   │                 │
│           ╰───────╯                 │
│                                     │
│  "Look into the distance..."        │
│                                     │
│  🕐 2:30 PM  |  📊 4h 23m           │
│                                     │
│      [Skip this time]               │
└─────────────────────────────────────┘
```

## Settings It Reads

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `blinkEyeReminderDuration` | number | 20 | Seconds for break |
| `blinkEyeReminderScreenText` | string | "" | Custom message |
| `usingStrictMode` | boolean | false | Hide skip button |
| `useCircleProgressTimerStyle` | boolean | false | Use circular timer |
| `isUpdateAvailable` | boolean | false | Show update toast |

## Event Communication

### Emits:
- **None** - Uses direct window management instead of events

### Listens For:
- **None** - Primary window directly closes all windows

### Architecture:
- Primary window uses `WebviewWindow.getByLabel()` to directly close secondary windows
- No cross-webview event system needed
- More reliable than event-based approach

## Example Scenarios

### Scenario 1: User Completes Break
```
1. Window opens, shows "Ready?"
2. Countdown starts: 20 → 19 → 18...
3. At 1 second: 🔊 Plays "done.mp3"
4. At 0 seconds: Primary window directly closes all secondary windows
5. Primary window closes itself last
```
```

### Scenario 2: User Skips Break (Multi-Monitor)
```
1. Windows open on 3 monitors:
   - Monitor 1 (primary): Full app with skip button
   - Monitor 2-3 (secondary): Just Aurora background
2. User clicks "Skip" on Monitor 1 (primary)
3. Primary directly closes Monitor 2 and 3 using WebviewWindow.getByLabel()
4. Primary closes itself last
5. All windows gone in <100ms
```


### Scenario 3: Strict Mode (No Skip Button)
```
1. Window opens
2. No "Skip" button visible
3. User MUST wait for timer to complete
4. Forces user to take full break
```

## Multi-Monitor Architecture

This is the **magic** of direct window management:

```
Primary Monitor (Monitor 0)          Secondary Monitors (1, 2, 3...)
┌─────────────────────────┐         ┌──────────────────────┐
│  ReminderControl.tsx    │         │ reminder-minimal.tsx │
│  (Full App ~50MB)       │         │ (Minimal ~5MB)       │
│                         │         │                      │
│  • Timer: 20s           │         │  • Aurora BG Only    │
│  • Skip Button          │         │  • No UI             │
│  • Todo List            │         │  • No Logic          │
│  • All Features         │         │  • Passive window    │
│                         │         │                      │
│  Gets style from URL:   │         │  Gets style from URL:│
│  ?style=aurora          │         │  ?style=aurora       │
│                         │         │                      │
│  Direct Management:     │────────►│  Gets closed by:     │
│  - getByLabel()         │         │  - Primary window    │
│  - win.close()          │         │  - Direct API call   │
└─────────────────────────┘         └──────────────────────┘
         ↓                                    ↓
    User clicks Skip                    Waits passively
         ↓                                    ↓
    Loops through monitors              Gets closed directly
         ↓                                    ↓
    Closes each secondary               No event needed
         ↓                                    ↓
    Closes itself last                  All synced!
```

**Key Benefits:**
- Primary = Full experience (50MB) + window authority
- Secondary = Visual only (5MB each) + passive
- Direct management = No event system needed
- Total = 60MB for 3 monitors (vs 150MB before)

**Direct window management approach:**
```typescript
// Primary window has full authority
const currentWin = getCurrentWebviewWindow();

// Close all other windows directly
for (let i = 0; i < 10; i++) {
  const win = await WebviewWindow.getByLabel(`reminder_monitor_${i}`);
  if (win && win.label !== currentWin.label) {
    await win.close(); // Direct close - no events
  }
}

// Close self last
await currentWin.close();
```

**Background Style Passing**:
```typescript
// OLD WAY (Event-based):
// 1. Primary loads → broadcasts style → secondary receives → renders
// ❌ Delay, potential flickering

// NEW WAY (URL-based):
// 1. ReminderHandler creates windows with ?style=aurora
// 2. All windows read URL and render immediately
// ✅ Instant, no flickering!
```

## Components Used

### UI Components
- `AnimatedCounter`: Rolling number animation
- `Progress`: Linear progress bar
- `Button`: Skip button
- `CurrentTime`: Shows current time
- `ScreenOnTime`: Shows screen usage
- `TodayTodoTasks`: Shows todo list (premium)

### Animations
- `Digit`: Single digit with vertical scroll animation
- Smooth transitions using CSS transforms
- SwiftUI-style cubic-bezier easing

## Premium Features

Only available if `canAccessPremiumFeatures` is true:
- ✅ Completion sound (done.mp3)
- ✅ Todo list display
- ✅ Custom reminder text

## Summary

**ReminderControl.tsx** = The face of the reminder (PRIMARY MONITOR ONLY):
- 🎨 Shows the break screen UI
- ⏱️ Manages countdown timer
- 🔊 Plays completion sound
- 🖱️ Handles skip button
- 📡 Gets background style from URL parameter
- 📡 Broadcasts close events to all windows
- 👂 Listens for close events

It's what the user sees and interacts with during their break on the primary monitor!

**Secondary monitors** use `reminder-minimal.tsx` which just shows the background animation.

## How It Works With ReminderHandler

```
ReminderHandler.tsx          ReminderControl.tsx (Primary)    reminder-minimal.tsx (Secondary)
(The Scheduler)              (The Full UI)                    (Just Background)
       │                            │                                  │
       │ Loads backgroundStyle      │                                  │
       │ from settings              │                                  │
       │                            │                                  │
       │ Creates windows with       │                                  │
       │ ?style= in URL             │                                  │
       ├───────────────────────────►│                                  │
       ├────────────────────────────┼─────────────────────────────────►│
       │                            │                                  │
       │                     Reads ?style=aurora              Reads ?style=aurora
       │                     from URL                         from URL
       │                            │                                  │
       │                     Displays timer                   Renders background
       │                     Shows UI                         (Aurora, instant!)
       │                     Counts down                               │
       │                            │                                  │
       │                     User clicks Skip                          │
       │                     Emits "close-all" ───────────────────────►│
       │                            │                                  │
       │                     Closes itself                    Closes itself
       └────────────────────────────┴──────────────────────────────────┘
```

**ReminderHandler** = When and where to show, passes style via URL
**ReminderControl** = What to show and how to interact (primary only), reads style from URL
**reminder-minimal** = Beautiful background animation (secondary only), reads style from URL

## Resource Comparison

```
Before Optimization (All Full Apps):
┌──────────────────────────────────┐
│ Monitor 1: ReminderControl 50MB  │
│ Monitor 2: ReminderControl 50MB  │
│ Monitor 3: ReminderControl 50MB  │
│ Total: 150MB                     │
└──────────────────────────────────┘

After Optimization (Smart Distribution):
┌──────────────────────────────────┐
│ Monitor 1: ReminderControl 50MB  │
│ Monitor 2: reminder-minimal 5MB  │
│ Monitor 3: reminder-minimal 5MB  │
│ Total: 60MB (60% savings!)       │
└──────────────────────────────────┘
```
