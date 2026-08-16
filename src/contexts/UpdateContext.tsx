// UpdateContext.tsx
//
// Single source of truth for app updates. Replaces the two overlapping
// systems (sidebar UpdateChecker + useAutoUpdater dialog) that each fired
// their own `check()` at startup.
//
// Behavior:
// - One automatic check on mount (shared promise, so StrictMode remounts
//   and Layout remounts never trigger a second network request), then a
//   periodic re-check every 6 hours while the app stays open.
// - The "Update available" dialog opens only if the user hasn't already
//   dismissed that exact version (`lastDismissedUpdateVersion` in appconfig.db).
// - All appconfig.db access goes through Rust commands (AGENTS.md):
//   `update_reminder_setting` (generic upsert) and `get_config_string`.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";

const DISMISSED_VERSION_KEY = "lastDismissedUpdateVersion";

/** Re-check for updates every 6 hours while the app stays open. */
const AUTO_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

interface AutoCheckResult {
  update: Update | null;
  shouldPrompt: boolean;
}

// Shared across mounts: the auto-check runs once per app session.
let autoCheckPromise: Promise<AutoCheckResult> | null = null;

async function persistUpdateFlag(value: boolean) {
  try {
    await invoke("update_reminder_setting", {
      key: "isUpdateAvailable",
      value: String(value),
    });
  } catch (error) {
    console.error("[UpdateContext] failed to persist isUpdateAvailable:", error);
  }
}

function getAutoCheckResult(): Promise<AutoCheckResult> {
  if (!autoCheckPromise) {
    autoCheckPromise = (async (): Promise<AutoCheckResult> => {
      const update = await check();
      if (update) {
        await persistUpdateFlag(true);
        const dismissed = await invoke<string | null>("get_config_string", {
          key: DISMISSED_VERSION_KEY,
        });
        return { update, shouldPrompt: dismissed !== update.version };
      }
      await persistUpdateFlag(false);
      return { update: null, shouldPrompt: false };
    })().catch((error) => {
      console.error("[UpdateContext] automatic update check failed:", error);
      // Allow a retry on the next mount (e.g. app started offline).
      autoCheckPromise = null;
      return { update: null, shouldPrompt: false };
    });
  }
  return autoCheckPromise;
}

interface UpdateContextType {
  /** Current installed app version, e.g. "2.8.1". */
  version: string;
  /** Version reported by the update server, empty when none. */
  latestVersion: string;
  updateAvailable: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  /** Download progress 0-100 while installing an update. */
  downloadProgress: number;
  /** Whether the "Update available" dialog is open. */
  dialogOpen: boolean;
  /** Manual check (sidebar button). Toasts unless `silent`. */
  checkForUpdates: (silent?: boolean) => Promise<void>;
  /** Download + install the update, then relaunch. */
  downloadAndInstall: () => Promise<void>;
  /** Close the dialog and don't ask again for this version. */
  dismissUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider = ({ children }: { children: ReactNode }) => {
  const [version, setVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Runs the automatic check: once on mount (deduped by the shared
  // promise), then every 6 hours while the app is open. Silent — no
  // toasts; the dialog opens only for a version the user hasn't dismissed.
  const runAutoCheck = useCallback(async () => {
    const { update, shouldPrompt } = await getAutoCheckResult();
    if (update) {
      setUpdateAvailable(true);
      setLatestVersion(update.version);
      if (shouldPrompt) setDialogOpen(true);
    } else {
      setUpdateAvailable(false);
      setLatestVersion("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getVersion().then((v) => {
      if (!cancelled) setVersion(v);
    });

    void runAutoCheck();
    const interval = setInterval(() => void runAutoCheck(), AUTO_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runAutoCheck]);

  const checkForUpdates = useCallback(async (silent = false) => {
    setIsChecking(true);
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(true);
        setLatestVersion(update.version);
        await persistUpdateFlag(true);
        const dismissed = await invoke<string | null>("get_config_string", {
          key: DISMISSED_VERSION_KEY,
        });
        if (!silent) {
          toast.success(`Update available: v${update.version}`, {
            duration: 5000,
          });
        }
        if (dismissed !== update.version) setDialogOpen(true);
      } else {
        setUpdateAvailable(false);
        setLatestVersion("");
        await persistUpdateFlag(false);
        if (!silent) {
          toast.success("No updates found. You're on the latest version.");
        }
      }
    } catch (error) {
      console.error("[UpdateContext] update check failed:", error);
      if (!silent) toast.error("Update check failed. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const update = await check();
      if (!update) {
        toast("No update available to install.");
        return;
      }
      toast.loading(`Downloading v${update.version}...`, { id: "download" });

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            setDownloadProgress(0);
            break;
          case "Progress":
            downloaded += event.data.chunkLength ?? 0;
            if (contentLength > 0) {
              setDownloadProgress(
                Math.round((downloaded / contentLength) * 100),
              );
            }
            break;
          case "Finished":
            setDownloadProgress(100);
            break;
        }
      });

      toast.success("Update installed. Restarting app…", { id: "download" });
      setTimeout(async () => {
        await relaunch();
      }, 1000);
    } catch (error) {
      console.error("[UpdateContext] update install failed:", error);
      toast.error("Update install failed. Please try again.", {
        id: "download",
      });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const dismissUpdate = useCallback(async () => {
    setDialogOpen(false);
    if (!latestVersion) return;
    try {
      await invoke("update_reminder_setting", {
        key: DISMISSED_VERSION_KEY,
        value: latestVersion,
      });
    } catch (error) {
      console.error(
        "[UpdateContext] failed to persist dismissed version:",
        error,
      );
    }
  }, [latestVersion]);

  return (
    <UpdateContext.Provider
      value={{
        version,
        latestVersion,
        updateAvailable,
        isChecking,
        isDownloading,
        downloadProgress,
        dialogOpen,
        checkForUpdates,
        downloadAndInstall,
        dismissUpdate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error("useUpdate must be used within an UpdateProvider");
  }
  return context;
};
