import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { currentMonitor } from "@tauri-apps/api/window";

type DatabaseInstance = Awaited<ReturnType<typeof Database.load>>;
type DateSetter = React.Dispatch<React.SetStateAction<string>>;

const SupportDeveloperHandler = () => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const [lastReminded, setLastReminded] = useState("");
  const [nextReminderDate, setNextReminderDay] = useState("");

  useEffect(() => {
    const fetchOrInitializeDate = async (
      db: DatabaseInstance,
      key: string,
      setterFunction: DateSetter
    ): Promise<void> => {
      const result = await db.select<{ value: string }[]>(
        "SELECT value FROM config WHERE key = ?",
        [key]
      );

      if (Array.isArray(result) && result.length > 0 && result[0].value) {
        setterFunction(result[0].value);
      } else {
        const currentDate = new Date().toISOString().split("T")[0];
        await db.execute(
          "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
          [key, currentDate]
        );
        setterFunction(currentDate);
      }
    };

    const initializeAllDates = async (): Promise<void> => {
      try {
        const db = await Database.load("sqlite:appconfig.db");
        await fetchOrInitializeDate(db, "lastRemindDay", setLastReminded);
        await fetchOrInitializeDate(db, "nextReminderDay", setNextReminderDay);

        if (!canAccessPremiumFeatures) {
          const today = new Date().toISOString().split("T")[0];

          const daysDiff = Math.floor(
            (new Date(nextReminderDate).getTime() -
              new Date(lastReminded).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysDiff > 7) {
            // Edge case: more than 7 days between reminders
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];

            await db.execute(
              "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
              ["nextReminderDay", tomorrowStr]
            );

            setNextReminderDay(tomorrowStr);
            openSupporReminder();
          } else if (today === nextReminderDate) {
            // Schedule a reminder within a random time window
            const minMs = 60 * 60 * 1000; // 60 mins
            const maxMs = 3 * 60 * 60 * 1000; // 3 hours
            const randomDelay = Math.floor(
              Math.random() * (maxMs - minMs) + minMs
            );

            console.log(
              `Scheduling support reminder in ${
                randomDelay / 1000 / 60
              } minutes`
            );
            setTimeout(() => {
              openSupporReminder();
            }, randomDelay);
          }
        }
      } catch (error) {
        console.error("Failed to initialize date values from database:", error);
      }
    };

    initializeAllDates();
  }, [canAccessPremiumFeatures]);

  const openSupporReminder = async () => {
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
  };

  return null;
};

export default SupportDeveloperHandler;
