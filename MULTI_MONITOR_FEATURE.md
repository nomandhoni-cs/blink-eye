# Multi-Monitor Support Feature

## Overview
The reminder windows now appear on all connected monitors simultaneously, preventing users from continuing work on secondary displays during break time. The "before alert" notification remains on the primary monitor only.

## Implementation Approach

Instead of creating separate window types for each monitor, we use a **unified window labeling system** (`reminder_monitor_0`, `reminder_monitor_1`, etc.) and **Tauri events** for cross-window communication.

## Changes Made

### 1. ReminderHandler.tsx
- Added `availableMonitors` import and `emit` from Tauri events
- Modified `openReminderWindow()` to create windows with generic labels (`reminder_monitor_N`)
- Each monitor gets a window with the same URL but positioned on different monitors
- Emits `reminder-windows-opened` event after creating all windows
- Added fallback logic to single monitor if detection fails

### 2. ReminderControl.tsx
- Added `emit` and `listen` imports for Tauri events
- Created `closeAllReminderWindows()` function that:
  - Emits `close-all-reminders` event to notify all windows
  - Iterates through `reminder_monitor_0` to `reminder_monitor_9` and closes them
- Added event listener that closes the current window when `close-all-reminders` is received
- This ensures clicking "Skip" on ANY monitor closes ALL windows

### 3. src-tauri/capabilities/default.json
- Added `reminder_monitor_0` through `reminder_monitor_9` to the windows array
- Much cleaner than adding variants for each window type (10 entries vs 80+)

## How It Works

1. **Window Creation**: When a reminder triggers, `availableMonitors()` detects all monitors and creates a window on each with labels `reminder_monitor_0`, `reminder_monitor_1`, etc.

2. **Cross-Window Communication**: Uses Tauri's event system:
   - When user clicks "Skip" or timer expires, emits `close-all-reminders` event
   - All reminder windows listen for this event and close themselves
   - This ensures synchronized closing across all monitors

3. **Permissions**: Only 10 window labels needed in capabilities (supports up to 10 monitors)

## Benefits

- **Simpler**: Only 10 window labels vs 80+ for the previous approach
- **Synchronized**: All windows close together when skip is clicked on any monitor
- **Maintainable**: Adding new reminder styles doesn't require capability updates
- **Efficient**: Uses Tauri events for instant cross-window communication

## Testing
1. Connect multiple monitors
2. Wait for reminder or trigger manually
3. Verify fullscreen windows appear on all monitors
4. Click "Skip this Time" on ANY monitor - all windows should close
5. Let timer expire - all windows should close together
