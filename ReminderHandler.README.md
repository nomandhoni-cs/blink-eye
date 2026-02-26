# ReminderHandler.tsx

## Purpose
This component is the **scheduler and orchestrator** for break reminders. It runs in the background of your main app and decides WHEN to show reminder windows and WHERE to show them (which monitors).

Think of it as the **alarm clock** of your app.

## What It Does

### 1. Loads User Settings
When the component mounts or settings change, it fetches:
- **Reminder interval**: How often to show reminders (e.g., every 20 minutes)
- **Background style**: Which visual theme to use (Aurora, BeamOfLife, etc.)
- **Workday schedule**: What hours the user wants reminders (premium feature)
- **Workday enabled**: Whether to respect the workday schedule

```typescript
// Example: User wants reminders every 20 minutes
const storedInterval = await store.get<number>("blinkEyeReminderInterval");
setInterval(storedInterval); // Sets to 20
```

### 2. Manages the Reminder Timer
Sets up a repeating timer that:
- Waits for the configured interval (e.g., 20 minutes)
- Shows a "before alert" notification 15 seconds before the main reminder
- Opens the main reminder window(s)

```typescript
timer = window.setInterval(() => {
  // Schedule "before alert" 15 seconds early
  demoTimer = window.setTimeout(() => {
    showDemoReminder(); // Shows countdown notification
  }, interval * 60 * 1000 - 15000);

  // Then show the main reminder
  openReminderWindow("AuroraReminderWindow");
}, interval * 60 * 1000); // Every 20 minutes
```

### 3. Respects Workday Hours (Premium Feature)
If the user has premium and workday is enabled:
- Checks if today is a workday
- Checks if current time is within work hours
- Only starts reminders if both conditions are met

```typescript
// Example: User set workday Monday 9:00 AM - 5:00 PM
const todayWorkday = workday?.["Monday"]; // { start: "09:00", end: "17:00" }
const now = new Date(); // Current time: 2:30 PM

if (now >= startTime && now <= endTime) {
  startReminder(); // ✅ Within work hours, start reminders
} else {
  // ❌ Outside work hours, no reminders
}
```

### 4. Opens Reminder Windows on ALL Monitors
This is the **multi-monitor magic**:

```typescript
const openReminderWindow = async (reminderWindow: string) => {
  // Get all connected monitors
  const monitors = await availableMonitors();
  // Example: User has 3 monitors
  // monitors = [
  //   { position: {x: 0, y: 0}, size: {width: 1920, height: 1080} },
  //   { position: {x: 1920, y: 0}, size: {width: 1920, height: 1080} },
  //   { position: {x: 3840, y: 0}, size: {width: 2560, height: 1440} }
  // ]

  // Create a fullscreen window on EACH monitor
  for (let index = 0; index < monitors.length; index++) {
    const monitor = monitors[index];
    
    new WebviewWindow(`reminder_monitor_${index}`, {
      url: `/AuroraReminderWindow`, // Same URL for all
      fullscreen: true,
      alwaysOnTop: true,
      x: monitor.position.x,      // Position on this monitor
      y: monitor.position.y,
      width: monitor.size.width,   // Fill entire monitor
      height: monitor.size.height,
    });
  }
  
  // Result: 3 fullscreen windows, one on each monitor!
};
```

### 5. Shows "Before Alert" Notification
15 seconds before the main reminder, shows a small countdown notification:
- Only on the PRIMARY monitor (not all monitors)
- Small window at the top center
- Shows countdown: "00:13", "00:12", etc.

```typescript
const showDemoReminder = async () => {
  const monitor = await currentMonitor(); // Get primary monitor
  
  new WebviewWindow("before_alert", {
    url: `/alert.html`,
    width: 320,
    height: 80,
    x: monitor.position.x + (monitor.size.width - 320) / 2, // Center horizontally
    y: monitor.position.y + 80, // 80px from top
    transparent: true,
    alwaysOnTop: true,
  });
};
```

## Component Lifecycle

```
App Starts
    ↓
ReminderHandler Mounts
    ↓
Fetches Settings (interval, style, workday)
    ↓
Checks Workday Schedule (if premium)
    ↓
Starts Timer (e.g., every 20 minutes)
    ↓
    ├─→ 19 min 45 sec: Shows "before alert" notification
    └─→ 20 min: Opens reminder windows on ALL monitors
    ↓
Timer Repeats...
```

## Key Functions

### `openReminderWindow(reminderWindow: string)`
**Purpose**: Create fullscreen reminder windows on all monitors

**Parameters**:
- `reminderWindow`: The URL path (e.g., "AuroraReminderWindow", "PlainReminderWindow")

**What it does**:
1. Detects all monitors using `availableMonitors()`
2. Creates a window on each monitor with label `reminder_monitor_0`, `reminder_monitor_1`, etc.
3. Positions each window to fill its respective monitor
4. Emits `reminder-windows-opened` event

**Example**:
```typescript
openReminderWindow("AuroraReminderWindow");
// Creates:
// - reminder_monitor_0 on Monitor 1 (1920x1080 at 0,0)
// - reminder_monitor_1 on Monitor 2 (1920x1080 at 1920,0)
// - reminder_monitor_2 on Monitor 3 (2560x1440 at 3840,0)
```

### `showDemoReminder()`
**Purpose**: Show countdown notification before main reminder

**What it does**:
1. Gets the primary monitor
2. Creates small notification window at top center
3. Shows countdown timer (13 seconds)

### `startReminder()`
**Purpose**: Start the repeating reminder timer

**What it does**:
1. Sets up interval timer (e.g., every 20 minutes)
2. Schedules "before alert" 15 seconds before reminder
3. Opens appropriate reminder window based on user's style preference

### `checkWorkdayAndStartTimer()`
**Purpose**: Decide whether to start reminders based on workday settings

**What it does**:
1. Gets current day and time
2. Checks if today is a workday
3. Checks if current time is within work hours
4. Starts reminders only if conditions are met

## Dependencies

### Context/Hooks Used
- `useTrigger()`: Listens for settings changes to reload configuration
- `usePremiumFeatures()`: Checks if user has premium features (workday scheduling)

### External APIs
- `@tauri-apps/api/window`: For monitor detection
- `@tauri-apps/api/webviewWindow`: For creating windows
- `@tauri-apps/plugin-sql`: For reading workday config from database
- `@tauri-apps/plugin-store`: For reading reminder settings
- `@tauri-apps/api/event`: For emitting events

## Settings It Reads

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `blinkEyeReminderInterval` | number | 20 | Minutes between reminders |
| `backgroundStyle` | string | "aurora" | Visual theme for reminder |
| `blinkEyeWorkday` | JSON | null | Workday schedule per day |
| `isWorkdayEnabled` | boolean | false | Whether to use workday schedule |

## Example Flow

```
User sets: 20-minute interval, Aurora style, Workday Mon-Fri 9-5

1. Component loads settings:
   - interval = 20
   - backgroundStyle = "aurora"
   - workday = { Monday: {start: "09:00", end: "17:00"}, ... }
   - isWorkdayEnabled = true

2. Checks current time: Monday 2:30 PM
   - ✅ Is Monday (workday)
   - ✅ 2:30 PM is between 9:00 AM - 5:00 PM
   - Starts timer

3. Timer runs:
   - 19 min 45 sec: Shows "before alert" (countdown notification)
   - 20 min: Opens Aurora reminder on all 3 monitors

4. User sees fullscreen Aurora animation on all monitors
   - Can't work on any screen
   - Must take a break!
```

## Why It Returns `null`

```typescript
return null;
```

This component doesn't render any UI itself - it's a **background worker**. It just:
- Manages timers
- Opens windows when needed
- Listens for setting changes

All the visual stuff happens in the windows it creates!

## Summary

**ReminderHandler.tsx** = The brain that decides:
- ⏰ WHEN to show reminders (timing)
- 🖥️ WHERE to show them (which monitors)
- 🎨 WHAT to show (which style)
- 📅 WHETHER to show them (workday logic)

It's the invisible orchestrator that makes the whole reminder system work!
