# Adding a Reminder Background Style

Each break background is its own **Vite entry** (separate HTML + TSX bundle). That keeps the break window small and lets the animation paint immediately before the overlay loads.

This guide walks through adding a new style end to end. Example style key: `sunset` → files `reminder-sunset.html` / `src/reminder-sunset.tsx`.

---

## Architecture (quick)

```text
User picks style in Reminder Themes
        ↓
Saved to appconfig.db → reminderBackgroundStyle
        ↓
Rust scheduler (reminder_scheduler.rs) reads style on break
        ↓
Opens reminder-sunset.html?config={...}  (primary)
     or reminder-sunset.html?minimal=true&config={...}  (secondary monitors)
        ↓
Background paints first → DeferredReminderOverlay loads later (primary only)
```

**Style key** (e.g. `sunset`) is the stable ID stored in the database.  
**Entry file** (e.g. `reminder-sunset.html`) is what Vite builds and Rust opens.

---

## Checklist

| # | File / location | Required |
|---|-----------------|----------|
| 1 | `src/components/backgrounds/YourBackground.tsx` | Yes |
| 2 | `reminder-{slug}.html` (repo root) | Yes |
| 3 | `src/reminder-{slug}.tsx` | Yes |
| 4 | `src/backgrounds/registry.ts` | Yes |
| 5 | `vite.config.ts` → `build.rollupOptions.input` | Yes |
| 6 | `src-tauri/src/reminder_scheduler.rs` → `BACKGROUND_STYLE_TO_ENTRY` | Yes |
| 7 | `src/components/ReminderStyles.tsx` | Yes (theme picker UI) |
| 8 | `src/assets/thumbnails/{styleKey}.png` | Yes (picker thumbnail) |
| 9 | — | Theme preview uses `entryForStyle()` in Reminder Themes / Settings |

Steps 1–8 are enough for real breaks fired by the Rust scheduler.

---

## Step 1 — Background component

Create the visual in `src/components/backgrounds/`.

```tsx
// src/components/backgrounds/SunsetBackground.tsx
const SunsetBackground = () => {
  return (
    <canvas
      className="fixed inset-0 -z-10"
      aria-hidden="true"
      // ... your animation
    />
  );
};

export default SunsetBackground;
```

**Rules:**
- Use `fixed inset-0` (or full viewport) so it covers the break screen.
- Keep heavy logic inside this file so it stays out of the main app bundle.
- Do not import `ReminderOverlay` here — the entry TSX handles that.

Copy an existing background (e.g. `Aurora.tsx`, `DefaultBackground.tsx`) as a starting point.

---

## Step 2 — HTML entry (repo root)

Duplicate `reminder-aurora.html` → `reminder-sunset.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Take A Break Reminder - Blink Eye</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/reminder-sunset.tsx"></script>
  </body>
</html>
```

Only change the script `src` path.

---

## Step 3 — TSX entry

Duplicate `src/reminder-aurora.tsx` → `src/reminder-sunset.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import SunsetBackground from "./components/backgrounds/SunsetBackground";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderSunset: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden">
        <SunsetBackground />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderSunset />
  </React.StrictMode>,
);
```

**Do not** import `ReminderOverlay` directly. `DeferredReminderOverlay` lazy-loads it after the background paints.

---

## Step 4 — Frontend registry

Edit `src/backgrounds/registry.ts`:

1. Add the style key to the `BackgroundStyle` union.
2. Append a row to `BACKGROUND_REGISTRY`.

```ts
export type BackgroundStyle =
  | "default"
  // ...existing
  | "sunset";

export const BACKGROUND_REGISTRY: BackgroundEntry[] = [
  // ...existing
  { style: "sunset", entry: "reminder-sunset.html", label: "Sunset" },
];
```

`entryForStyle()` and `normalizeStyle()` pick up new rows automatically.

---

## Step 5 — Vite build input

Edit `vite.config.ts` → `build.rollupOptions.input`:

```ts
"reminder-sunset": "reminder-sunset.html",
```

Without this, production builds will not include the new HTML bundle.

---

## Step 6 — Rust scheduler map

Edit `src-tauri/src/reminder_scheduler.rs` → `BACKGROUND_STYLE_TO_ENTRY`.

Add a row **with the same style key and HTML filename** as `registry.ts`:

```rust
const BACKGROUND_STYLE_TO_ENTRY: &[(&str, &str)] = &[
    // ...existing
    ("sunset", "reminder-sunset.html"),
];
```

Rust uses this when spawning break windows. If the key is missing, it falls back to `reminder-default.html`.

No new Tauri command is required. The scheduler already reads `reminderBackgroundStyle` from `appconfig.db`.

---

## Step 7 — Theme picker UI

Edit `src/components/ReminderStyles.tsx`:

1. Add to the `styles` array:

```ts
{ value: "sunset", label: "Sunset" },
```

2. Import a thumbnail and add to `thumbMap`:

```ts
import sunsetThumb from "../assets/thumbnails/sunset.png";

const thumbMap: Record<string, string> = {
  // ...existing
  sunset: sunsetThumb,
};
```

Saving a theme calls:

```ts
await invoke("update_reminder_setting", {
  key: "reminderBackgroundStyle",
  value: selectedStyle,
});
```

Premium users persist the real style; free users get preview-only via `reminderBackgroundStylePreview`.

---

## Step 8 — Thumbnail asset

Add `src/assets/thumbnails/sunset.png` (used in the Reminder Themes grid).

Recommended: show light and dark appearance in one image, matching existing thumbnails.

---

## Optional — Preview routes

Theme preview uses the same per-entry bundles as scheduled breaks via `entryForStyle()` in `ReminderStyles.tsx` and `ReminderSettings.tsx`.

For new work, prefer **Reminder Settings → Preview break** or selecting a theme in **Reminder Themes**.

---

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Style key (DB) | camelCase, stable forever | `particleBackground`, `sunset` |
| HTML file | `reminder-{short-slug}.html` | `reminder-sunset.html` |
| TSX entry | `src/reminder-{short-slug}.tsx` | `src/reminder-sunset.tsx` |
| Vite input key | same as slug | `"reminder-sunset"` |

Once users save a style key to the database, **do not rename it** without a migration. Add a new key instead.

---

## Verify

1. **Dev:** `bun run tauri dev`
2. **Reminder Themes:** new card appears; select and save (premium).
3. **Preview:** open preview from Reminder Themes or Reminder Settings — background loads instantly, overlay appears shortly after.
4. **Real break:** wait for scheduler or call `show_reminder_now` from debug — correct background on primary; secondary monitors show background only (`minimal=true`).
5. **Production build:** `bun run tauri build` — confirm `reminder-sunset.html` is in the dist output.

---

## Common mistakes

| Mistake | Symptom |
|---------|---------|
| Registry updated but not Rust map (or vice versa) | Break opens default background |
| Missing `vite.config.ts` input | Works in dev, missing in release build |
| Style key typo between TS and Rust | Silent fallback to default |
| Importing `ReminderOverlay` in entry TSX | Slower first paint; blocks background chunk |
| Forgetting `ReminderStyles.tsx` | Style works when set in DB but not pickable in UI |

---

## Related docs

- `src/README.reminder-entry.md` — reminder window architecture
- `docs/tauri-commands-api.md` — `get_reminder_settings`, `update_reminder_setting`, `refresh_reminder_scheduler_settings`
- `AGENTS.md` — config must go through Rust commands, not direct SQLite from TS
