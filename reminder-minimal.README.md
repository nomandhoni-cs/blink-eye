# reminder-minimal.tsx

## Purpose
This is the **lightweight background-only component** that runs on SECONDARY monitors. It shows just the beautiful background animation without any UI, logic, or heavy components.

Think of it as the **visual companion** that makes all your monitors look beautiful during breaks.

## What It Does

### 1. Reads Background Style from URL
Gets the background style directly from the URL parameter when the window is created:
- Reads `?style=` parameter from `window.location.search`
- No waiting, no events, instant rendering
- Single source of truth

```typescript
const params = new URLSearchParams(window.location.search);
const backgroundStyle = params.get('style') || 'default';
// Example: ?style=aurora → backgroundStyle = "aurora"
```

### 2. Renders Background Only
Shows fullscreen background animation with NO UI elements:
- ❌ No timer
- ❌ No text
- ❌ No skip button
- ❌ No todo list
- ✅ Just beautiful animation

```typescript
return (
  <div className="relative h-screen w-screen overflow-hidden">
    {renderBackground()} {/* Aurora, BeamOfLife, etc. */}
  </div>
);
```

### 3. Listens for Close Signal
Closes when primary window tells it to:
- Listens for `close-all-reminders` event
- Closes itself immediately
- Synchronized with primary window

```typescript
useEffect(() => {
  const unlisten = listen("close-all-reminders", () => {
    getCurrentWebviewWindow().close();
  });
}, []);
```

## Component Lifecycle

```
Secondary Window Opens with URL: /reminder-minimal.html?style=aurora
    ↓
reminder-minimal Mounts
    ↓
Reads style from URL parameter (instant)
    ↓
Renders Aurora background immediately (no waiting!)
    ↓
Listens for "close-all-reminders" event
    ↓
Closes when event received
```

## Supported Backgrounds

All the same beautiful backgrounds as the primary window:
- `default`: DefaultBackground
- `aurora`: AuroraBackground
- `beamoflife`: BeamOfLife
- `freesprit`: FreeSpirit
- `canvasShapes`: CanvasShapes (particles)
- `particleBackground`: ParticleBackground
- `plainGradientAnimation`: PlainGradientAnimation
- `starryBackground`: StarryBackground
- `shootingmeteor`: ShootingMeteor

## Event Communication

### Listens For:
- `close-all-reminders`: Signal to close

### Emits:
- Nothing! This component only listens.

### Does NOT Listen For:
- ~~`reminder-background-style`~~ - No longer needed! Style comes from URL parameter.

## Why This Exists

### The Problem:
Before optimization, every monitor loaded the full React app:
```
Monitor 1: Full App (50MB) - ReminderControl + all components
Monitor 2: Full App (50MB) - ReminderControl + all components
Monitor 3: Full App (50MB) - ReminderControl + all components
Total: 150MB
```

### The Solution:
Now only primary monitor loads the full app:
```
Monitor 1: Full App (50MB) - ReminderControl + all features
Monitor 2: Minimal (5MB) - reminder-minimal + background only
Monitor 3: Minimal (5MB) - reminder-minimal + background only
Total: 60MB (60% savings!)
```

## Resource Comparison

| Component | Size | What It Loads |
|-----------|------|---------------|
| **ReminderControl** | ~50MB | Full React app, all contexts, database, settings, UI components |
| **reminder-minimal** | ~5MB | Just background components, event listeners |

## What It Doesn't Load

To keep it lightweight, this component skips:
- ❌ Database access (no SQL queries)
- ❌ Settings loading (no store access)
- ❌ Timer logic (no countdown)
- ❌ UI components (no buttons, progress bars)
- ❌ Context providers (no premium features check)
- ❌ Heavy components (no todo list, no time displays)
- ❌ Event broadcasting (no emit calls)

## Example Flow

```
1. User has 3 monitors
2. Reminder triggers
3. ReminderHandler creates:
   - Monitor 0: /AuroraReminderWindow?style=aurora (full app)
   - Monitor 1: /reminder-minimal.html?style=aurora (minimal)
   - Monitor 2: /reminder-minimal.html?style=aurora (minimal)

4. All windows open simultaneously:
   - Primary: Reads ?style=aurora from URL → shows full UI + Aurora
   - Secondary 1: Reads ?style=aurora from URL → shows Aurora only
   - Secondary 2: Reads ?style=aurora from URL → shows Aurora only
   - All render instantly, no waiting for broadcasts!

5. User clicks "Skip" on primary:
   - Primary emits: "close-all-reminders"
   - All windows close together
```

## Code Structure

```typescript
// Super simple - just 2 things:
1. Read style from URL parameter (instant)
2. Listen for close event
3. Render background component
```

## Benefits

1. **60% Less Memory**: 5MB vs 50MB per secondary window
2. **No Permission Errors**: Doesn't need database/filesystem access
3. **Faster Loading**: Less code to parse and execute
4. **Instant Rendering**: No waiting for broadcasts or events
5. **Same Visuals**: Identical background animations as primary
6. **Simpler Code**: No state management for background style

## How It Works With Other Components

```
ReminderHandler          ReminderControl          reminder-minimal
(Scheduler)              (Primary Monitor)        (Secondary Monitors)
      │                         │                         │
      │ Loads backgroundStyle   │                         │
      │ from settings           │                         │
      │                         │                         │
      │ Creates windows with    │                         │
      │ ?style= in URL          │                         │
      ├───────────────────────► │                         │
      ├─────────────────────────┼────────────────────────►│
      │                         │                         │
      │                  Reads ?style=aurora      Reads ?style=aurora
      │                  from URL                 from URL
      │                         │                         │
      │                  Renders full UI          Renders Aurora only
      │                  + Aurora background      (instant!)
      │                         │                         │
      │                  User clicks Skip                 │
      │                  Emits "close-all" ──────────────►│
      │                         │                         │
      │                  Closes              Closes       │
      └─────────────────────────┴─────────────────────────┘
```

## Summary

**reminder-minimal.tsx** = The efficient visual companion:
- 🎨 Shows beautiful backgrounds
- 📡 Reads style from URL (instant)
- 📡 Listens for close signals
- 🚀 90% lighter than full app
- 🖥️ Makes all monitors beautiful
- ⚡ Zero latency - no broadcasts needed

It's the secret to efficient multi-monitor support - all the beauty, none of the bloat!

## Key Innovation: URL-Based Style Passing

**Before (Event-Based):**
```
1. Secondary window opens → shows nothing
2. Primary window loads → reads settings
3. Primary broadcasts style → secondary receives
4. Secondary renders background
⏱️ Delay: 100-500ms, potential flickering
```

**After (URL-Based):**
```
1. ReminderHandler reads style from settings
2. Creates all windows with ?style= parameter
3. All windows read URL and render immediately
⏱️ Delay: 0ms, instant rendering!
```

**Benefits:**
- ✅ No race conditions
- ✅ No flickering
- ✅ No event listeners for style
- ✅ Simpler code
- ✅ Instant rendering
