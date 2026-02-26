import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { load } from "@tauri-apps/plugin-store";
import { useTrigger } from "../contexts/TriggerReRender";
import { currentMonitor, availableMonitors } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event";
import { getBooleanConfig, getJsonConfig } from "../utils/configUtils";

// Define the type for workday configuration
type Workday = { [day: string]: { start: string; end: string } } | null;

const ReminderHandler = () => {
  const { trigger } = useTrigger(); // Use the trigger value from the context
  const [interval, setInterval] = useState<number>(20);
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const [workday, setWorkday] = useState<Workday>(null);
  const [isWorkdayEnabled, setIsWorkdayEnabled] = useState<boolean>(false);
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  // Function to open reminder windows on all monitors
  const openReminderWindow = async (reminderWindow: string) => {
    try {
      // Check if multi-monitor is enabled
      const isMultiMonitorEnabled = await getBooleanConfig("isMultiMonitorEnabled");
      // Multi-monitor requires premium access
      const canUseMultiMonitor = isMultiMonitorEnabled && canAccessPremiumFeatures;

      const monitors = await availableMonitors();

      // Determine how many monitors to use
      // Only use multiple monitors if user has premium AND multi-monitor is enabled
      const monitorsToUse = canUseMultiMonitor ? monitors : [monitors[0]];


      // Create a reminder window for each monitor
      for (let index = 0; index < monitorsToUse.length; index++) {
        const monitor = monitorsToUse[index];
        const uniqueLabel = `reminder_monitor_${index}`;
        const isPrimaryMonitor = index === 0;

        console.log(`Creating window on monitor ${index}:`, {
          name: monitor.name,
          size: monitor.size,
          position: monitor.position,
          isPrimary: isPrimaryMonitor,
        });

        const windowUrl = isPrimaryMonitor
          ? `/${reminderWindow}?style=${backgroundStyle}`
          : `/reminder-minimal.html?style=${backgroundStyle}`;

        console.log(`[ReminderHandler] Creating ${isPrimaryMonitor ? 'PRIMARY' : 'SECONDARY'} window with URL:`, windowUrl);
        console.log(`[ReminderHandler] Background style being passed:`, backgroundStyle);

        const webview = new WebviewWindow(uniqueLabel, {
          // Both primary and secondary get style via URL parameter for consistency
          url: windowUrl,
          fullscreen: true,
          alwaysOnTop: true,
          title: "Take A Break Reminder - Blink Eye",
          skipTaskbar: true,
          x: monitor.position.x,
          y: monitor.position.y,
          width: monitor.size.width,
          height: monitor.size.height,
        });

        webview.once("tauri://created", () => {
          console.log(`Reminder window created on monitor ${index} (${isPrimaryMonitor ? 'primary' : 'secondary'})`);
        });

        webview.once("tauri://error", (e) => {
          console.error(`Error creating reminder window on monitor ${index}:`, e);
        });
      }

      // Emit event to notify all windows were created
      await emit("reminder-windows-opened", { count: monitorsToUse.length });

    } catch (error) {
      console.error("Error getting monitors:", error);
      // Fallback to single window if monitor detection fails
      const webview = new WebviewWindow("reminder_monitor_0", {
        url: `/${reminderWindow}?style=${backgroundStyle}`,
        fullscreen: true,
        alwaysOnTop: true,
        title: "Take A Break Reminder - Blink Eye",
        skipTaskbar: true,
      });

      webview.once("tauri://created", () => {
        console.log("Fallback reminder window created");
      });

      webview.once("tauri://error", (e) => {
        console.error("Error creating fallback reminder window:", e);
      });
    }
  }

  // Fetch settings when `trigger` changes
  useEffect(() => {
    const fetchSettings = async () => {
      console.log("Fetching settings due to trigger:", trigger);
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
      const parsedWorkday = await getJsonConfig<Workday>("blinkEyeWorkday");
      if (parsedWorkday) {
        setWorkday(parsedWorkday);
      }

      // Fetch whether workday is enabled
      const isEnabled = await getBooleanConfig("isWorkdayEnabled");
      setIsWorkdayEnabled(isEnabled);
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

      const x = monitor
        ? Math.round((monitor.size.width - windowWidth) / 2) + monitor.position.x
        : 0;
      const y = monitor
        ? monitor.position.y + 80 // 80px from top
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
        console.log("Before alert window created");
      });

      webview.once("tauri://error", (e) => {
        console.error("Error creating before alert window:", e);
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
