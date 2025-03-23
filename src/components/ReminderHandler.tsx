import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { load } from "@tauri-apps/plugin-store";
import { useTrigger } from "../contexts/TriggerReRender";
import { currentMonitor } from "@tauri-apps/api/window";

// Define the type for workday configuration
type Workday = { [day: string]: { start: string; end: string } } | null;

const ReminderHandler = () => {
  const { trigger } = useTrigger(); // Use the trigger value from the context
  const [interval, setInterval] = useState<number>(20);
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const [workday, setWorkday] = useState<Workday>(null);
  const [isWorkdayEnabled, setIsWorkdayEnabled] = useState<boolean>(false);
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  // Function to open the reminder window
  const openReminderWindow = (reminderWindow: string) => {
    console.log("Opening reminder window...");
    const webview = new WebviewWindow(reminderWindow, {
      url: `/${reminderWindow}`,
      fullscreen: true,
      alwaysOnTop: true,
      title: "Take A Break Reminder - Blink Eye",
      skipTaskbar: true,
    });

    webview.once("tauri://created", () => {
      console.log("Reminder window created");
    });

    webview.once("tauri://error", (e) => {
      console.error("Error creating reminder window:", e);
    });
  };

  // Fetch settings when `trigger` changes
  useEffect(() => {
    const fetchSettings = async () => {
      console.log("Fetching settings due to trigger:", trigger);
      const db = await Database.load("sqlite:appconfig.db");
      const store = await load("store.json", { autoSave: false });
      const reminderStyleData = await load("ReminderThemeStyle.json");
      const savedStyle = await reminderStyleData.get<string>("backgroundStyle");
      if (savedStyle) setBackgroundStyle(savedStyle);

      // Load the reminder interval from storage
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval"
      );
      if (storedInterval) setInterval(storedInterval);

      // Fetch workday setup from the database
      type ConfigResult = { value: string };
      const workdayData = (await db.select(
        "SELECT value FROM config WHERE key = ?",
        ["blinkEyeWorkday"]
      )) as ConfigResult[];
      if (workdayData.length > 0 && workdayData[0].value) {
        try {
          const parsedWorkday = JSON.parse(workdayData[0].value) as Workday;
          setWorkday(parsedWorkday);
        } catch (error) {
          console.error("Failed to parse workday data:", error);
        }
      }

      // Fetch whether workday is enabled
      const isEnabledData = (await db.select(
        "SELECT value FROM config WHERE key = ?",
        ["isWorkdayEnabled"]
      )) as ConfigResult[];

      if (isEnabledData.length > 0 && isEnabledData[0].value) {
        setIsWorkdayEnabled(isEnabledData[0].value === "true");
      }
      console.log(workdayData, "workdayData");
      console.log(storedInterval, "storedInterval");
      console.log(isWorkdayEnabled, "isWorkdayEnabled");
    };

    fetchSettings();
  }, [trigger]); // Refetch settings when the trigger updates

  // Handle interval-based reminder logic
  useEffect(() => {
    console.log("Initializing reminder logic");
    let timer: number | null = null;
    let demoTimer: number | null = null;

    const showDemoReminder = async () => {
      const monitor = await currentMonitor();
      const windowWidth = 320;
      const windowHeight = 80;

      // // Calculate position for bottom center
      // const x = monitor
      //   ? Math.round((monitor.size.width - windowWidth) / 2) +
      //     monitor.position.x
      //   : 0;
      // const y = monitor
      //   ? monitor.size.height - windowHeight - 20 + monitor.position.y // 20px from bottom
      //   : 0;
      const x = monitor
        ? Math.round((monitor.size.width - windowWidth) / 2) +
          monitor.position.x
        : 0;
      const y = monitor
        ? monitor.position.y + 80 // 20px from top
        : 0;
      const webview = new WebviewWindow("before_alert", {
        url: `/alert.html`,
        title: "Test Window - Blink Eye",
        transparent: true,
        shadow: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        focus: false,
        height: windowHeight,
        width: windowWidth,
        decorations: false,
        resizable: false,
        x,
        y,
      });
      webview.once("tauri://created", () => {
        console.log("Test window created");
      });
      webview.once("tauri://error", (e) => {
        console.error("Error creating test window:", e);
      });
    };

    const startReminder = () => {
      console.log("Starting reminder timer with interval:", interval);
      timer = window.setInterval(() => {
        // Schedule demo 15 seconds before main reminder
        demoTimer = window.setTimeout(() => {
          showDemoReminder();
        }, interval * 60 * 1000 - 15000);

        if (!canAccessPremiumFeatures) {
          openReminderWindow("PlainReminderWindow");
          return;
        }

        switch (backgroundStyle) {
          case "aurora":
            openReminderWindow("AuroraReminderWindow");
            break;
          case "beamoflife":
            openReminderWindow("BeamOfLifeReminderWindow");
            break;
          case "freesprit":
            openReminderWindow("FreeSpiritReminderWindow");
            break;
          case "canvasShapes":
            openReminderWindow("CanvasShapesReminderWindow");
            break;
          case "particleBackground":
            openReminderWindow("ParticleBackgroundReminderWindow");
            break;
          case "plainGradientAnimation":
            openReminderWindow("PlainGradientAnimationReminderWindow");
            break;
          case "starryBackground":
            openReminderWindow("StarryBackgroundReminderWindow");
            break;
          case "shootingmeteor":
            openReminderWindow("ShootingMeteorReminderWindow");
            break;
          default:
            openReminderWindow("AuroraReminderWindow");
        }
      }, interval * 60 * 1000); // The interval value will be non-null
    };

    const checkWorkdayAndStartTimer = () => {
      const now = new Date();
      const day = now.toLocaleString("en-US", { weekday: "long" });
      const todayWorkday = workday?.[day];

      if (canAccessPremiumFeatures && isWorkdayEnabled) {
        if (todayWorkday) {
          const [startHour, startMinute] = todayWorkday.start
            .split(":")
            .map(Number);
          const [endHour, endMinute] = todayWorkday.end.split(":").map(Number);

          const startTime = new Date();
          startTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date();
          endTime.setHours(endHour, endMinute, 0, 0);

          console.log("Start time:", startTime);
          console.log("End time:", endTime);
          console.log("Now:", now);

          if (now >= startTime && now <= endTime) {
            console.log("Within workday window. Starting reminder.");
            startReminder();
          } else {
            console.log("Outside workday window. Reminder not started.");
          }
        } else {
          console.log("No workday setup for today. Reminder skipped.");
        }
      } else {
        console.log("Non-premium user or workday disabled. Starting reminder.");
        startReminder();
      }
    };

    // Start reminder logic if necessary
    if (workday || !canAccessPremiumFeatures) {
      checkWorkdayAndStartTimer();
    }

    return () => {
      if (timer !== null) window.clearInterval(timer);
      if (demoTimer !== null) window.clearTimeout(demoTimer);
    };
  }, [workday, isWorkdayEnabled, canAccessPremiumFeatures, interval]);

  return null;
};

export default ReminderHandler;
