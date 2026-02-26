# Better Multi-Monitor Approaches

## Current Approach Issues

### Problem:
Each reminder window loads the ENTIRE React app:
```
Monitor 1: Full App (ReminderHandler, EncryptionComponent, ConfigDataLoader, etc.)
Monitor 2: Full App (ReminderHandler, EncryptionComponent, ConfigDataLoader, etc.)
Monitor 3: Full App (ReminderHandler, EncryptionComponent, ConfigDataLoader, etc.)
```

This means:
- 3x memory usage
- 3x component initialization
- 3x database queries
- 3x permission checks
- Only 1 window actually needs the full app!

## Option 1: Minimal HTML Windows ⭐ (BEST)

### Concept:
- Primary monitor: Full React app with all logic
- Secondary monitors: Minimal HTML with just the visual UI

### Implementation:

#### 1. Create `reminder-minimal.html`
```html
<!DOCTYPE html>
<html>
<head>
  <title>Break Reminder</title>
  <link rel="stylesheet" href="/src/index.css">
</head>
<body>
  <div id="minimal-root"></div>
  <script type="module" src="/src/reminder-minimal.tsx"></script>
</body>
</html>
```

#### 2. Create `reminder-minimal.tsx`
```typescript
// Minimal component - ONLY UI, no logic
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const MinimalReminder = () => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [reminderText, setReminderText] = useState("");
  
  // Listen for updates from primary window
  useEffect(() => {
    const unlistenTime = listen("reminder-time-update", (event) => {
      setTimeLeft(event.payload.timeLeft);
    });
    
    const unlistenText = listen("reminder-text-update", (event) => {
      setReminderText(event.payload.text);
    });
    
    const unlistenClose = listen("close-all-reminders", () => {
      getCurrentWebviewWindow().close();
    });
    
    return () => {
      unlistenTime.then(fn => fn());
      unlistenText.then(fn => fn());
      unlistenClose.then(fn => fn());
    };
  }, []);
  
  return (
    <div className="reminder-screen">
      <h1>{timeLeft}s</h1>
      <p>{reminderText}</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("minimal-root")!).render(
  <MinimalReminder />
);
```

#### 3. Update ReminderHandler.tsx
```typescript
const openReminderWindow = async (reminderWindow: string) => {
  const monitors = await availableMonitors();
  
  for (let index = 0; index < monitors.length; index++) {
    const monitor = monitors[index];
    
    // Primary monitor gets full app
    if (index === 0) {
      new WebviewWindow("reminder_monitor_0", {
        url: `/${reminderWindow}`, // Full React app
        fullscreen: true,
        // ... other options
      });
    } else {
      // Secondary monitors get minimal HTML
      new WebviewWindow(`reminder_monitor_${index}`, {
        url: `/reminder-minimal.html`, // Lightweight!
        fullscreen: true,
        // ... other options
      });
    }
  }
};
```

#### 4. Primary window broadcasts updates
```typescript
// In ReminderControl.tsx (primary window)
useEffect(() => {
  // Broadcast time updates to secondary windows
  emit("reminder-time-update", { timeLeft });
}, [timeLeft]);

useEffect(() => {
  // Broadcast text to secondary windows
  emit("reminder-text-update", { text: reminderText });
}, [reminderText]);
```

### Benefits:
- ✅ 90% less memory per secondary window
- ✅ No permission issues (minimal windows don't need DB/FS access)
- ✅ Faster window creation
- ✅ Single source of truth (primary window)
- ✅ Synchronized UI automatically

### Drawbacks:
- ⚠️ Slightly more complex setup
- ⚠️ Need to maintain two UI files


## Option 2: Shared State with IPC ⭐⭐

### Concept:
Use Tauri's IPC (Inter-Process Communication) to share state between windows without duplicating logic.

### Implementation:

#### 1. Create Tauri Command (Rust backend)
```rust
// src-tauri/src/main.rs
use tauri::Manager;
use std::sync::Mutex;

struct ReminderState {
    time_left: i32,
    reminder_text: String,
}

#[tauri::command]
fn get_reminder_state(state: tauri::State<Mutex<ReminderState>>) -> (i32, String) {
    let state = state.lock().unwrap();
    (state.time_left, state.reminder_text.clone())
}

#[tauri::command]
fn update_reminder_state(
    time_left: i32,
    reminder_text: String,
    state: tauri::State<Mutex<ReminderState>>,
    app: tauri::AppHandle,
) {
    let mut state = state.lock().unwrap();
    state.time_left = time_left;
    state.reminder_text = reminder_text;
    
    // Broadcast to all windows
    app.emit_all("reminder-state-changed", &state).unwrap();
}
```

#### 2. All windows query shared state
```typescript
// In any window
import { invoke } from "@tauri-apps/api/core";

const [timeLeft, reminderText] = await invoke("get_reminder_state");
```

### Benefits:
- ✅ Single source of truth in Rust
- ✅ Type-safe state management
- ✅ Very fast (native code)
- ✅ No duplication

### Drawbacks:
- ⚠️ Requires Rust knowledge
- ⚠️ More complex architecture
- ⚠️ Overkill for simple use case

## Option 3: Canvas/WebGL Rendering 🚀

### Concept:
Use a single canvas element that mirrors across monitors (advanced).

### Implementation:
```typescript
// Capture primary window as image
const canvas = document.querySelector('canvas');
const imageData = canvas.toDataURL();

// Send to secondary windows
emit("render-frame", { imageData });

// Secondary windows just display the image
<img src={imageData} />
```

### Benefits:
- ✅ Perfect synchronization
- ✅ Minimal secondary window code

### Drawbacks:
- ⚠️ Complex implementation
- ⚠️ High bandwidth (sending images)
- ⚠️ Not suitable for interactive UI

## Option 4: Single Window with Multiple Webviews

### Concept:
Create one window, multiple webviews (Tauri v2 feature).

### Implementation:
```typescript
import { Window } from "@tauri-apps/api/window";
import { Webview } from "@tauri-apps/api/webview";

const monitors = await availableMonitors();

// Create one window
const mainWindow = new Window("reminder");

// Add webview for each monitor
monitors.forEach((monitor, index) => {
  new Webview(mainWindow, `webview_${index}`, {
    url: "/reminder",
    x: monitor.position.x,
    y: monitor.position.y,
    width: monitor.size.width,
    height: monitor.size.height,
  });
});
```

### Benefits:
- ✅ Single process
- ✅ Shared memory
- ✅ Native Tauri feature

### Drawbacks:
- ⚠️ Complex window management
- ⚠️ May not work well with fullscreen
- ⚠️ Less tested approach


## Recommendation: Option 1 (Minimal HTML Windows)

### Why This is Best:

1. **Simplicity**: Easy to understand and maintain
2. **Performance**: 90% reduction in resource usage
3. **Reliability**: No complex IPC or Rust code needed
4. **Flexibility**: Can still customize secondary window UI
5. **Proven Pattern**: Used by many multi-window apps

### Implementation Steps:

#### Step 1: Create minimal reminder component
```typescript
// src/reminder-minimal.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css"; // Reuse existing styles

interface ReminderState {
  timeLeft: number;
  reminderText: string;
  currentTime: string;
  screenTime: string;
}

const MinimalReminder = () => {
  const [state, setState] = useState<ReminderState>({
    timeLeft: 20,
    reminderText: "Take a break...",
    currentTime: "",
    screenTime: "",
  });

  useEffect(() => {
    // Listen for state updates from primary window
    const unlisten = listen<ReminderState>("reminder-state", (event) => {
      setState(event.payload);
    });

    // Listen for close signal
    const unlistenClose = listen("close-all-reminders", () => {
      getCurrentWebviewWindow().close();
    });

    return () => {
      unlisten.then((fn) => fn());
      unlistenClose.then((fn) => fn());
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="text-[240px] font-heading">{state.timeLeft}s</div>
      <div className="text-5xl font-heading text-center px-4">
        {state.reminderText}
      </div>
      <div className="flex space-x-4 mt-8">
        <span>{state.currentTime}</span>
        <span>|</span>
        <span>{state.screenTime}</span>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MinimalReminder />
  </React.StrictMode>
);
```

#### Step 2: Create minimal HTML file
```html
<!-- reminder-minimal.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Break Reminder</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/reminder-minimal.tsx"></script>
</body>
</html>
```

#### Step 3: Update ReminderHandler
```typescript
const openReminderWindow = async (reminderWindow: string) => {
  const monitors = await availableMonitors();
  
  for (let index = 0; index < monitors.length; index++) {
    const monitor = monitors[index];
    const isPrimary = index === 0;
    
    new WebviewWindow(`reminder_monitor_${index}`, {
      url: isPrimary ? `/${reminderWindow}` : `/reminder-minimal.html`,
      fullscreen: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      x: monitor.position.x,
      y: monitor.position.y,
      width: monitor.size.width,
      height: monitor.size.height,
    });
  }
};
```

#### Step 4: Broadcast from primary window
```typescript
// In ReminderControl.tsx
useEffect(() => {
  // Broadcast state to all secondary windows
  emit("reminder-state", {
    timeLeft,
    reminderText,
    currentTime: new Date().toLocaleTimeString(),
    screenTime: timeCount,
  });
}, [timeLeft, reminderText, timeCount]);
```

### Resource Comparison:

```
Current Approach (3 monitors):
┌─────────────────────────────────────┐
│ Monitor 1: Full App (~50MB RAM)    │
│ Monitor 2: Full App (~50MB RAM)    │
│ Monitor 3: Full App (~50MB RAM)    │
│ Total: ~150MB RAM                   │
└─────────────────────────────────────┘

Minimal HTML Approach (3 monitors):
┌─────────────────────────────────────┐
│ Monitor 1: Full App (~50MB RAM)    │
│ Monitor 2: Minimal (~5MB RAM)      │
│ Monitor 3: Minimal (~5MB RAM)      │
│ Total: ~60MB RAM (60% savings!)    │
└─────────────────────────────────────┘
```

### When to Use Each Approach:

| Approach | Use When | Complexity | Performance |
|----------|----------|------------|-------------|
| **Current** | Quick prototype, simple needs | Low | Medium |
| **Minimal HTML** | Production app, 2+ monitors | Medium | High ⭐ |
| **Shared State IPC** | Complex state, many windows | High | Very High |
| **Canvas Rendering** | Identical visuals, no interaction | Very High | Medium |
| **Multiple Webviews** | Experimental, cutting edge | Very High | High |

## Conclusion

Your current approach is **good enough** for most cases, but if you want to optimize:

1. **For production**: Implement Option 1 (Minimal HTML)
2. **For learning**: Current approach is fine
3. **For scale**: Consider Option 2 (IPC) if you have 5+ monitors

The event-based communication you're using is solid - the main optimization would be reducing what runs in secondary windows!
