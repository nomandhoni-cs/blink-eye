# ReminderControl.tsx

## Purpose
This component is the **UI and logic** that runs INSIDE each reminder window. It's what the user actually sees and interacts with during a break.

Think of it as the **break screen interface** that appears on all monitors.

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

### 5. Listens for Close Events
Each window listens for the "close-all-reminders" event:
- When ANY window emits this event, ALL windows close
- This is how clicking "Skip" on one monitor closes all monitors

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
1. Emits `close-all-reminders` event (broadcasts to all windows)
2. Loops through `reminder_monitor_0` to `reminder_monitor_9`
3. Closes each window it finds

```typescript
const closeAllReminderWindows = async () => {
  // Broadcast: "Everyone close!"
  await emit("close-all-reminders");
  
  // Also manually close (backup)
  for (let i = 0; i < 10; i++) {
    const window = await WebviewWindow.getByLabel(`reminder_monitor_${i}`);
    if (window) await window.close();
  }
};
```

**Why both emit AND manual close?**
- `emit()`: Fast, instant broadcast to all windows
- Manual loop: Backup in case event doesn't reach a window

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

### Listens For:
- `close-all-reminders`: Signal to close this window

### Emits:
- `close-all-reminders`: Signal to close all windows

## Example Scenarios

### Scenario 1: User Completes Break
```
1. Window opens, shows "Ready?"
2. Countdown starts: 20 → 19 → 18...
3. At 1 second: 🔊 Plays "done.mp3"
4. At 0 seconds: Emits "close-all-reminders"
5. All windows close simultaneously
```

### Scenario 2: User Skips Break
```
1. Window opens on 3 monitors
2. User clicks "Skip" on Monitor 2
3. Monitor 2 emits "close-all-reminders"
4. Monitor 1 hears event → closes
5. Monitor 2 closes itself
6. Monitor 3 hears event → closes
7. All windows gone in <100ms
```


### Scenario 3: Strict Mode (No Skip Button)
```
1. Window opens
2. No "Skip" button visible
3. User MUST wait for timer to complete
4. Forces user to take full break
```

## Multi-Monitor Synchronization

This is the **magic** of the event system:

```
Monitor 1              Monitor 2              Monitor 3
┌─────────┐           ┌─────────┐           ┌─────────┐
│  20s    │           │  20s    │           │  20s    │
│ [Skip]  │           │ [Skip]  │◄─Click    │ [Skip]  │
└─────────┘           └─────────┘           └─────────┘
     ↓                     ↓                      ↓
     │                     │                      │
     │    emit("close-all-reminders")            │
     │◄────────────────────┼──────────────────────┤
     │                     │                      │
     ↓                     ↓                      ↓
  Closes                Closes                 Closes
```

**Without events**, you'd need:
```typescript
// Monitor 2 would need to know about Monitor 1 and 3
const window1 = WebviewWindow.getByLabel("reminder_monitor_0");
const window3 = WebviewWindow.getByLabel("reminder_monitor_2");
window1.close();
window3.close();
// What if there are 4 monitors? 5? You'd need to check each!
```

**With events**:
```typescript
// Monitor 2 just broadcasts
emit("close-all-reminders");
// Everyone listening closes themselves automatically!
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

**ReminderControl.tsx** = The face of the reminder:
- 🎨 Shows the break screen UI
- ⏱️ Manages countdown timer
- 🔊 Plays completion sound
- 🖱️ Handles skip button
- 📡 Broadcasts close events
- 👂 Listens for close events

It's what the user sees and interacts with during their break!

## How It Works With ReminderHandler

```
ReminderHandler.tsx          ReminderControl.tsx
(The Scheduler)              (The UI)
       │                            │
       │ Creates windows            │
       ├───────────────────────────►│
       │                            │
       │                     Displays timer
       │                     Shows UI
       │                     Counts down
       │                            │
       │                     User clicks Skip
       │                            │
       │◄───────────────────────────┤
       │    emit("close-all")       │
       │                            │
       │    All windows close       │
       └────────────────────────────┘
```

**ReminderHandler** = When and where to show
**ReminderControl** = What to show and how to interact
