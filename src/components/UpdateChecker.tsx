import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import toast from "react-hot-toast";
import {
    FaCheckCircle,
    FaSyncAlt,
    FaRocket,
    FaCloudDownloadAlt,
} from "react-icons/fa";

interface UpdateCheckerProps {
    onUpdateAvailable?: (version: string) => void;
}

export function UpdateChecker({ onUpdateAvailable }: UpdateCheckerProps) {
    const [version, setVersion] = useState<string>("");
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string>("");

    useEffect(() => {
        getVersion().then(setVersion);
        // Auto-check for updates on mount (silent)
        checkForUpdates(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkForUpdates = async (silent = false) => {
        setIsCheckingUpdate(true);
        try {
            const update = await check();

            if (update) {
                setUpdateAvailable(true);
                setLatestVersion(update.version);
                onUpdateAvailable?.(update.version);

                if (!silent) {
                    toast.success(`Update available: v${update.version}`, {
                        duration: 5000,
                    });
                }
            } else {
                setUpdateAvailable(false);
                setLatestVersion("");

                if (!silent) {
                    toast.success("No updates found. You're on the latest version.");
                }
            }
        } catch (error) {
            console.error("Error checking for updates:", error);
            if (!silent) toast.error("Update check failed. Please try again.");
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    const downloadAndInstall = async () => {
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
                            setDownloadProgress(Math.round((downloaded / contentLength) * 100));
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
            console.error("Error downloading update:", error);
            toast.error("Update install failed. Please try again.", { id: "download" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="px-2 pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                <span className="font-heading font-medium flex items-center gap-1">
                    <FaCheckCircle className="text-[11px]" />
                    <span className="text-muted-foreground/90">v{version}</span>
                </span>

                <button
                    onClick={() => checkForUpdates(false)}
                    disabled={isCheckingUpdate}
                    className="font-heading font-medium hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1"
                    aria-label="Check for updates"
                >
                    <FaSyncAlt className={`text-[11px] ${isCheckingUpdate ? "animate-spin" : ""}`} />
                    {isCheckingUpdate ? "Checking…" : "Check for updates"}
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
                                ? `Downloading update… ${downloadProgress}%`
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