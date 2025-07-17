import { useEffect, useRef, useState } from "react";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";
import Database from "@tauri-apps/plugin-sql";

const openSupportReminder = async () => {
  try {
    const monitor = await currentMonitor();
    const windowWidth = 600;
    const windowHeight = 260;

    const x = monitor
      ? Math.round((monitor.size.width - windowWidth) / 2) + monitor.position.x
      : 0;
    const y = monitor ? monitor.position.y + 80 : 0;

    const webview = new WebviewWindow("support_reminder", {
      url: "/support_reminder",
      title: "Support Developer - Blink Eye",
      transparent: true,
      shadow: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focus: true,
      height: windowHeight,
      width: windowWidth,
      decorations: false,
      resizable: false,
      x,
      y,
    });

    webview.once("tauri://created", () => {
      console.log("Support reminder window created.");
    });

    webview.once("tauri://error", (e) => {
      console.error("Error creating support reminder window:", e);
    });
  } catch (error) {
    console.error("Failed to open support reminder window:", error);
  }
};

const SupportDeveloperHandler = () => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const [isInitialized, setIsInitialized] = useState(false);
  const abortRef = useRef({ aborted: false });

  useEffect(() => {
    if (
      canAccessPremiumFeatures === null ||
      canAccessPremiumFeatures === undefined
    ) {
      return;
    }

    if (canAccessPremiumFeatures === true) {
      // Cancel any scheduled or running logic if user becomes premium
      abortRef.current.aborted = true;
      return;
    }

    if (isInitialized) return;

    const fetchOrInitializeDate = async (
      db: Awaited<ReturnType<typeof Database.load>>,
      key: string
    ): Promise<string> => {
      const result = await db.select<{ value: string }[]>(
        "SELECT value FROM config WHERE key = ?",
        [key]
      );

      if (abortRef.current.aborted) return "";

      if (Array.isArray(result) && result.length > 0 && result[0].value) {
        return result[0].value;
      } else {
        const currentDate = new Date().toISOString().split("T")[0];
        await db.execute(
          "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
          [key, currentDate]
        );
        return currentDate;
      }
    };

    const initializeReminderLogic = async () => {
      try {
        const db = await Database.load("sqlite:appconfig.db");

        const lastRemind = await fetchOrInitializeDate(db, "lastRemindDay");
        const nextRemind = await fetchOrInitializeDate(db, "nextReminderDay");

        if (abortRef.current.aborted) return;

        const today = new Date().toISOString().split("T")[0];
        const daysDiff = Math.floor(
          (new Date(nextRemind).getTime() - new Date(lastRemind).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 7) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          await db.execute(
            "UPDATE config SET value = ? WHERE key = 'nextReminderDay'",
            [tomorrowStr]
          );

          if (!abortRef.current.aborted) {
            openSupportReminder();
          }
        } else if (today === nextRemind) {
          const minMs = 0.6 * 60 * 1000;
          const maxMs = 1 * 60 * 1000;
          const randomDelay = Math.floor(
            Math.random() * (maxMs - minMs) + minMs
          );

          console.log(`Scheduling reminder in ${randomDelay / 1000} sec`);

          setTimeout(() => {
            if (!abortRef.current.aborted) {
              openSupportReminder();
            }
          }, randomDelay);
        }
      } catch (err) {
        console.error("Reminder logic failed", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeReminderLogic();
  }, [canAccessPremiumFeatures, isInitialized]);

  return null;
};

export default SupportDeveloperHandler;
