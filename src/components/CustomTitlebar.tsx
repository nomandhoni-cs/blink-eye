// src/components/CustomTitlebar.tsx
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Minus, Square, Copy, X } from "lucide-react";
import { cn } from "../lib/utils";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./ThemeToggle";
import logo from "../assets/new-icon.svg";

// ── Platform ─────────────────────────────────────────────────────
const currentPlatform = platform();
const isMac = currentPlatform === "macos";
const TITLEBAR_H = 38;

// ── Route titles ─────────────────────────────────────────────────
const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/todoList": "Todo List",
  "/usageTime": "Usage Time",
  "/reminderthemes": "Reminder Themes",
  "/workday": "Workday Setup",
  "/screenSavers": "Screen Savers",
  "/allSettings": "Settings",
  "/activatelicense": "Activate License",
  "/about": "About",
  "/soon": "Coming Soon",
};

// ── Pixel-perfect traffic light SVG symbols ──────────────────────
// Custom SVGs — crisp at any size, no react-icons overhead.

function CloseSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" />
      <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" />
    </svg>
  );
}

function MinimizeSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <line x1="1" y1="4" x2="7" y2="4" />
    </svg>
  );
}

function ExpandSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 8 8"
      fill="currentColor"
      stroke="none"
    >
      {/* Top-right triangle */}
      <polygon points="8,0 8,4.5 3.5,0" />
      {/* Bottom-left triangle */}
      <polygon points="0,8 0,3.5 4.5,8" />
    </svg>
  );
}

function ContractSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 8 8"
      fill="currentColor"
      stroke="none"
    >
      {/* Centre-left triangle */}
      <polygon points="0,4.5 0,0 4.5,4.5" />
      {/* Centre-right triangle */}
      <polygon points="8,3.5 8,8 3.5,3.5" />
    </svg>
  );
}

// ── macOS Traffic Lights ─────────────────────────────────────────

function MacTrafficLights() {
  const appWindow = getCurrentWindow();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const syncFullscreen = useCallback(async () => {
    try {
      setIsFullscreen(await appWindow.isFullscreen());
    } catch {
      // Permission not available — ignore
    }
  }, [appWindow]);

  useEffect(() => {
    syncFullscreen();
    const unlisten = appWindow.onResized(syncFullscreen);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow, syncFullscreen]);

  const DOT = cn(
    "flex size-[13px] items-center justify-center rounded-full",
    "shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]",
    "transition-colors",
  );

  const SYMBOL =
    "size-[7px] text-[rgba(75,25,0,0.8)] opacity-0 group-hover/dots:opacity-100 transition-opacity";

  return (
    <div className="group/dots flex items-center gap-[7px] pl-[13px] pr-3 h-full shrink-0">
      {/* Close — red */}
      <button
        onClick={() => appWindow.close()}
        aria-label="Close"
        className={cn(DOT, "bg-[#FF5F57] active:bg-[#E04840]")}
      >
        <CloseSymbol className={SYMBOL} />
      </button>

      {/* Minimize — yellow */}
      <button
        onClick={() => appWindow.minimize()}
        aria-label="Minimize"
        className={cn(DOT, "bg-[#FEBC2E] active:bg-[#DEA123]")}
      >
        <MinimizeSymbol className={SYMBOL} />
      </button>

      {/* Fullscreen — green */}
      <button
        onClick={async () => {
          try {
            const full = await appWindow.isFullscreen();
            await appWindow.setFullscreen(!full);
            // Re-sync after a short delay for the animation
            setTimeout(syncFullscreen, 300);
          } catch (e) {
            console.error("Fullscreen toggle failed:", e);
          }
        }}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        className={cn(DOT, "bg-[#28C840] active:bg-[#1AAB29]")}
      >
        {isFullscreen ? (
          <ContractSymbol className={SYMBOL} />
        ) : (
          <ExpandSymbol className={SYMBOL} />
        )}
      </button>
    </div>
  );
}

// ── Windows / Linux Caption Buttons ──────────────────────────────

function WinCaptionButtons() {
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  const sync = useCallback(async () => {
    setIsMaximized(await appWindow.isMaximized());
  }, [appWindow]);

  useEffect(() => {
    sync();
    const unlisten = appWindow.onResized(sync);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow, sync]);

  const BTN =
    "inline-flex items-center justify-center w-[46px] h-full text-foreground/70 transition-colors";

  return (
    <>
      <span className="w-px h-3.5 bg-border/60 mx-1.5" aria-hidden />

      <button
        onClick={() => appWindow.minimize()}
        aria-label="Minimize"
        className={cn(BTN, "hover:bg-foreground/8 active:bg-foreground/12")}
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>

      <button
        onClick={() => appWindow.toggleMaximize()}
        aria-label={isMaximized ? "Restore Down" : "Maximize"}
        className={cn(BTN, "hover:bg-foreground/8 active:bg-foreground/12")}
      >
        {isMaximized ? (
          <Copy size={12} strokeWidth={1.5} />
        ) : (
          <Square size={12} strokeWidth={1.5} />
        )}
      </button>

      <button
        onClick={() => appWindow.close()}
        aria-label="Close"
        className={cn(
          BTN,
          "hover:bg-[#c42b1c] hover:text-white",
          "active:bg-[#9a2116] active:text-white",
        )}
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </>
  );
}

// ── Main Titlebar ────────────────────────────────────────────────

export function CustomTitlebar() {
  const appWindow = getCurrentWindow();
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || "Blink Eye";

  useEffect(() => {
    const init = async () => {
      await appWindow.setDecorations(false);
      await appWindow.show();
    };
    init();
  }, [appWindow]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--titlebar-h",
      `${TITLEBAR_H}px`,
    );
    return () => {
      document.documentElement.style.removeProperty("--titlebar-h");
    };
  }, []);

  return (
    <header
      data-tauri-drag-region
      style={{ height: TITLEBAR_H }}
      className="fixed inset-x-0 top-0 z-50 flex items-center select-none bg-background border-b border-border/50"
    >
      {isMac && <MacTrafficLights />}

      <div
        className={cn(
          "flex items-center h-full gap-1 shrink-0",
          !isMac && "pl-1.5",
        )}
      >
        <SidebarTrigger className="size-7 rounded-md" />

        <span className="w-px h-3.5 bg-border/60" aria-hidden />

        <div
          data-tauri-drag-region
          className="flex items-center gap-2 pl-1.5 pr-2"
        >
          <img
            src={logo}
            alt=""
            draggable={false}
            className="size-4 pointer-events-none"
          />
          <span
            data-tauri-drag-region
            className="text-sm font-medium tracking-wide text-muted-foreground/80 font-heading"
          >
            blinkeye
          </span>
        </div>
      </div>

      <div
        data-tauri-drag-region
        className="flex-1 h-full flex items-center justify-center"
      >
        <span
          data-tauri-drag-region
          className="text-[13px] font-medium text-foreground/60 font-heading"
        >
          {currentTitle}
        </span>
      </div>

      <div className={cn("flex items-center h-full shrink-0", isMac && "pr-3")}>
        <ModeToggle />
        {!isMac && <WinCaptionButtons />}
      </div>
    </header>
  );
}
