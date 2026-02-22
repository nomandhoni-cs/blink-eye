import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, Copy, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./ThemeToggle";
import logo from "../assets/new-icon.svg";

// Route title mapping
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

export function CustomTitlebar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();
  const location = useLocation();

  const currentTitle = routeTitles[location.pathname] || "Blink Eye";

  const syncMaximized = useCallback(async () => {
    setIsMaximized(await appWindow.isMaximized());
  }, [appWindow]);

  useEffect(() => {
    syncMaximized();
    const unlisten = appWindow.onResized(syncMaximized);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow, syncMaximized]);

  return (
    <header
      data-tauri-drag-region
      className="
                fixed top-0 inset-x-0 z-50 h-[38px]
                flex items-center select-none
                bg-background border-b border-border/50
            "
    >
      {/* ── Left: sidebar toggle + brand ─────────────────── */}
      <div className="flex items-center h-full pl-1.5 gap-1 shrink-0">
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

      {/* ── Centre: current route title ──────────────────────── */}
      <div
        data-tauri-drag-region
        className="flex-1 h-full flex items-center justify-center"
      >
        <span
          data-tauri-drag-region
          className="text-sm font-medium text-foreground/70 font-heading"
        >
          {currentTitle}
        </span>
      </div>

      {/* ── Right: actions + window controls ──────────────── */}
      <div className="flex items-center h-full shrink-0">
        <ModeToggle />

        <span className="w-px h-3.5 bg-border/60 mx-2" aria-hidden />

        {/* —— window chrome buttons (46 px = Win-11 spec) — */}
        <button
          onClick={() => appWindow.minimize()}
          aria-label="Minimize"
          className="
                        inline-flex items-center justify-center
                        w-[46px] h-full
                        text-foreground/70
                        hover:bg-foreground/8 active:bg-foreground/5
                        transition-colors
                    "
        >
          <Minus className="size-[14px]" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          aria-label={isMaximized ? "Restore Down" : "Maximize"}
          className="
                        inline-flex items-center justify-center
                        w-[46px] h-full
                        text-foreground/70
                        hover:bg-foreground/8 active:bg-foreground/5
                        transition-colors
                    "
        >
          {isMaximized ? (
            <Copy className="size-[12px]" strokeWidth={1.5} />
          ) : (
            <Square className="size-[12px]" strokeWidth={1.5} />
          )}
        </button>

        <button
          onClick={() => appWindow.close()}
          aria-label="Close"
          className="
                        inline-flex items-center justify-center
                        w-[46px] h-full
                        text-foreground/70
                        hover:bg-[#c42b1c] hover:text-white
                        active:bg-[#9a2116] active:text-white
                        transition-colors
                    "
        >
          <X className="size-[14px]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
