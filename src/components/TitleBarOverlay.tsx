// src/components/TitleBarOverlay.tsx
import { ModeToggle } from "./ThemeToggle";
import { cn } from "../lib/utils";
import logo from "../assets/new-icon.svg";
import { platform } from "@tauri-apps/plugin-os";

// ── Platform ─────────────────────────────────────────────────────
const isMac = platform() === "macos";
const OVERLAY_H = 32;

// macOS traffic lights occupy ~78px at the default position.
// Pad the left of the overlay so our content doesn't sit under them.
const MAC_LEFT_PAD = "pl-[80px]";

// ── Component ────────────────────────────────────────────────────
//
// On macOS with `titleBarStyle: "Overlay"`, the native titlebar is
// transparent and the webview extends into it. This overlay renders
// at top:0 and sits INSIDE the titlebar area, drawing useful controls
// alongside the OS-rendered traffic lights.
//
// On Windows/Linux with native decorations, the OS draws its own
// opaque titlebar at top:0. This overlay sits just below it at top:32
// and visually integrates as a continuation of the titlebar.
//
// All non-interactive areas use `data-tauri-drag-region` so the window
// remains draggable from the titlebar.

export function TitleBarOverlay() {
  return (
    <div
      data-tauri-drag-region
      className={cn(
        "fixed left-0 right-0 z-50 flex items-center h-[32px] select-none",
        // macOS Overlay: extend into the transparent titlebar area.
        // Win/Linux: sit just below the OS-rendered native titlebar.
        isMac ? "top-0" : "top-[32px]",
        // "bg-background/60 backdrop-blur-md border-b border-border/40",
      )}
    >
      {/* Left padding to clear macOS traffic lights / mirror that offset on Win/Linux */}
      <div
        data-tauri-drag-region
        className={cn("h-full", isMac ? MAC_LEFT_PAD : "pl-[80px]")}
      />

      {/* Spacer pushes the centered brand toward the middle */}
      <div data-tauri-drag-region className="flex-1 h-full" />

      {/* Centered: app brand — logo + name. Drag region keeps the bar draggable. */}
      <div className="flex items-center gap-2 h-full shrink-0">
        <img
          src={logo}
          alt=""
          draggable={false}
          className="size-4 shrink-0 pointer-events-none"
        />
        <span className="text-[13px] font-light tracking-wide font-heading text-foreground/85 pointer-events-none">
          blinkeye
        </span>
      </div>

      {/* Spacer pushes the right controls to the far edge */}
      <div data-tauri-drag-region className="flex-1 h-full" />

      {/* Right: theme toggle (room for more quick actions beside it) */}
      <div
        data-tauri-drag-region
        className="flex items-center h-full shrink-0 pr-2"
      >
        <ModeToggle />
      </div>
    </div>
  );
}

export const TITLEBAR_OVERLAY_H = OVERLAY_H;
