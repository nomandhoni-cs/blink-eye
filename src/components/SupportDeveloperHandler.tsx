import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";
import Database from "@tauri-apps/plugin-sql";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";

type DatabaseInstance = Awaited<ReturnType<typeof Database.load>>;

/**
 * A utility function to open the reminder window.
 * Moved outside the component because it doesn't depend on any props or state,
 * preventing it from being recreated on every render.
 */
const openSupportReminder = async () => {
  try {
    const monitor = await currentMonitor();
    const windowWidth = 600;
    const windowHeight = 260;

    // Calculate position to center the window at the top of the screen
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
  // --- PROBLEM 1 FIXED: All Hooks are now called unconditionally at the top level ---
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  // State to ensure the initialization logic runs only once.
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // --- PROBLEM 2 FIXED: Handle the loading state ---
    // Wait until the premium status is determined (not null or undefined).
    console.log(
      "canAccessPremiumFeatures is null or undefined fr",
      canAccessPremiumFeatures
    );
    if (
      canAccessPremiumFeatures === null ||
      canAccessPremiumFeatures === undefined
    ) {
      console.log(
        "canAccessPremiumFeatures is null or undefined",
        canAccessPremiumFeatures
      );
      return; // Still loading, do nothing yet.
    }

    console.log(
      "canAccessPremiumFeatures is null or undefined 80",
      canAccessPremiumFeatures
    );
    // --- PROBLEM 3 FIXED: Correctly implement the conditional logic ---
    // If the user is a premium user OR if we've already run this logic, stop.
    if (canAccessPremiumFeatures || isInitialized) {
      console.log(
        "canAccessPremiumFeatures is null or undefined 87",
        canAccessPremiumFeatures
      );
      return;
    }
    console.log(
      "canAccessPremiumFeatures is null or undefined 93",
      canAccessPremiumFeatures
    );

    // If we reach here, it means the user is NOT premium and we haven't run the logic yet.

    const fetchOrInitializeDate = async (
      db: DatabaseInstance,
      key: string
    ): Promise<string> => {
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

    const initializeReminderLogic = async (): Promise<void> => {
      try {
        const db = await Database.load("sqlite:appconfig.db");
        // Fetch dates and update state
        const fetchedLastReminded = await fetchOrInitializeDate(
          db,
          "lastRemindDay"
        );
        const fetchedNextReminder = await fetchOrInitializeDate(
          db,
          "nextReminderDay"
        );

        const today = new Date().toISOString().split("T")[0];
        const daysDiff = Math.floor(
          (new Date(fetchedNextReminder).getTime() -
            new Date(fetchedLastReminded).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // This logic now runs with fresh data directly from the DB.
        if (daysDiff > 7) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          await db.execute(
            "UPDATE config SET value = ? WHERE key = 'nextReminderDay'",
            [tomorrowStr]
          );
          openSupportReminder();
        } else if (today === fetchedNextReminder) {
          const minMs = 2 * 60 * 1000; // 2 mins
          const maxMs = 5 * 60 * 1000; // 5 hours
          const randomDelay = Math.floor(
            Math.random() * (maxMs - minMs) + minMs
          );

          console.log(
            `Scheduling support reminder in ${randomDelay / 1000 / 60} minutes`
          );
          setTimeout(() => {
            openSupportReminder();
          }, randomDelay);
        }
      } catch (error) {
        console.error("Failed to initialize date values from database:", error);
      } finally {
        // --- PROBLEM 4 FIXED: Prevent re-running the effect logic ---
        // Mark as initialized to ensure this block only runs once per session.
        setIsInitialized(true);
      }
    };

    initializeReminderLogic();

    // The dependency array ensures this effect re-evaluates only when these values change.
    // The isInitialized flag prevents the logic from running more than once.
  }, [canAccessPremiumFeatures, isInitialized]);

  // This is a "headless" component; it renders nothing and only manages side effects.
  return null;
};

export default SupportDeveloperHandler;
