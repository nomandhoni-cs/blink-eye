import { useEffect } from "react";
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

  useEffect(() => {
    const minMs = 0.6 * 60 * 1000;
    const maxMs = 1 * 60 * 1000;
    const randomDelay = Math.floor(Math.random() * (maxMs - minMs) + minMs);

    console.log(
      `Reminder logic will evaluate after ${randomDelay / 1000} seconds`
    );

    const timeout = setTimeout(async () => {
      // Get the latest value when the timer fires
      if (canAccessPremiumFeatures === true) {
        console.log("User is premium at time of check — exiting");
        return;
      }

      console.log(
        "User is NOT premium at time of check — running reminder logic"
      );

      try {
        const db = await Database.load("sqlite:appconfig.db");

        const fetchOrInitializeDate = async (key: string): Promise<string> => {
          const result = await db.select<{ value: string }[]>(
            "SELECT value FROM config WHERE key = ?",
            [key]
          );

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

        const lastRemind = await fetchOrInitializeDate("lastRemindDay");
        const nextRemind = await fetchOrInitializeDate("nextReminderDay");

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
          openSupportReminder();
        } else if (today === nextRemind) {
          openSupportReminder();
        }
      } catch (error) {
        console.error("Error running reminder logic:", error);
      }
    }, randomDelay);

    return () => clearTimeout(timeout);
  }, [canAccessPremiumFeatures]);

  return null;
};

export default SupportDeveloperHandler;
