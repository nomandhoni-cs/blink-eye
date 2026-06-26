import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Minus, Square, Copy, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { ModeToggle } from "./ThemeToggle";
import { cn } from "../lib/utils";
import logo from "../assets/new-icon.svg";

const isMac = platform() === "macos";
const OVERLAY_H = 32;

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/usageTime": "Usage Time",
  "/reminderthemes": "Reminder Themes",
  "/multimonitor": "Multi-Monitor",
  "/todoList": "Todo List",
  "/workday": "Workday Setup",
  "/screenSavers": "Screen Savers",
  "/allSettings": "Settings",
  "/activatelicense": "Activate License",
  "/about": "About",
};

// ── Windows / Linux Caption Buttons ──────────────────────────────

function WinCaptionButtons() {
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow]);

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

// ── Component ────────────────────────────────────────────────────

export function TitleBarOverlay() {
  const appWindow = getCurrentWindow();
  const { pathname } = useLocation();
  const currentTitle = routeTitles[pathname] ?? "Blink Eye";

  useEffect(() => {
    if (isMac) return;
    const init = async () => {
      await appWindow.setDecorations(false);
      await appWindow.show();
    };
    init();
  }, [appWindow]);

  return (
    <div
      data-tauri-drag-region
      className={cn(
        "fixed left-0 right-0 z-50 flex items-center h-[32px] select-none top-0",
        !isMac && "bg-background border-b border-border/50",
      )}
    >
      {/* Left padding to clear macOS traffic lights */}
      <div data-tauri-drag-region className="pl-[80px] h-full" />

      {/* Left half — brand right-aligned to center point */}
      <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-end gap-2.5 shrink-0">
        <img
          src={logo}
          alt=""
          draggable={false}
          className="size-4 shrink-0 pointer-events-none"
        />
        <span className="text-[13px] font-light tracking-wide font-heading text-foreground/85 pointer-events-none">
          blinkeye
        </span>
        <Separator orientation="vertical" className="self-center bg-border/80 mx-1" />
      </div>

      {/* Right half — title flows left from center */}
      <div data-tauri-drag-region className="flex-1 h-full flex items-center shrink-0">
        <span className="text-[12px] font-medium tracking-wide text-muted-foreground pointer-events-none ml-1.5">
          {currentTitle}
        </span>
      </div>

      {/* Right: theme toggle + Windows caption buttons */}
      <div
        className={cn(
          "flex items-center h-full shrink-0",
          isMac && "pr-2",
        )}
      >
        <ModeToggle />
        {!isMac && <WinCaptionButtons />}
      </div>
    </div>
  );
}

export const TITLEBAR_OVERLAY_H = OVERLAY_H;
