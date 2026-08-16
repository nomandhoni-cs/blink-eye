import {
  FaCheckCircle,
  FaSyncAlt,
  FaRocket,
  FaCloudDownloadAlt,
} from "react-icons/fa";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { useUpdate } from "../contexts/UpdateContext";

export function UpdateChecker() {
  const {
    version,
    latestVersion,
    updateAvailable,
    isChecking,
    isDownloading,
    downloadProgress,
    checkForUpdates,
    downloadAndInstall,
  } = useUpdate();

  // ← Know if sidebar is collapsed
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // ── Collapsed state: show icon-only buttons with tooltips ──
  if (isCollapsed) {
    return (
      <SidebarMenu>
        {/* Version pill */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={`Version ${version} — click to check for updates`}
            onClick={() => checkForUpdates(false)}
            disabled={isChecking}
            className="flex items-center justify-center"
          >
            <FaSyncAlt
              className={`text-[13px] text-muted-foreground/70 ${
                isChecking ? "animate-spin" : ""
              }`}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Update available button */}
        {updateAvailable && (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={
                isDownloading
                  ? `Downloading… ${downloadProgress}%`
                  : `Install update v${latestVersion}`
              }
              onClick={downloadAndInstall}
              disabled={isDownloading}
              className="flex items-center justify-center"
            >
              {isDownloading ? (
                <FaCloudDownloadAlt className="text-[13px] text-amber-500 animate-pulse" />
              ) : (
                <FaRocket className="text-[13px] text-amber-500" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    );
  }

  // ── Expanded state: full UI ──
  return (
    <div className="px-2 pt-2 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
        <span className="font-heading font-medium flex items-center gap-1">
          <FaCheckCircle className="text-[11px]" />
          <span className="text-muted-foreground/90">v{version}</span>
        </span>

        <button
          onClick={() => checkForUpdates(false)}
          disabled={isChecking}
          className="font-heading font-medium hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1"
          aria-label="Check for updates"
        >
          <FaSyncAlt
            className={`text-[11px] ${isChecking ? "animate-spin" : ""}`}
          />
          {isChecking ? "Checking…" : "Check for updates"}
        </button>
      </div>

      {updateAvailable && (
        <button
          onClick={downloadAndInstall}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-1.5 text-[10px] font-heading font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors disabled:opacity-50"
          aria-label={`Install update version ${latestVersion}`}
        >
          {isDownloading ? (
            <>
              <FaCloudDownloadAlt className="text-[11px]" />
              {downloadProgress > 0
                ? `Downloading… ${downloadProgress}%`
                : "Preparing update…"}
            </>
          ) : (
            <>
              <FaRocket className="text-[11px]" />
              {`Install update (v${latestVersion})`}
            </>
          )}
        </button>
      )}
    </div>
  );
}
