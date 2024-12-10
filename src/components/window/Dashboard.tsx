import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getVersion } from "@tauri-apps/api/app";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTrigger } from "../../contexts/TriggerReRender";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const Dashboard = () => {
  const { triggerUpdate } = useTrigger();
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");
  const [usageTimeLimit, setUsageTimeLimit] = useState<number>(8);
  const { timeCount } = useTimeCountContext();
  const [appVersion, setAppVersion] = useState<string>("");

  // Calculate total hours for the progress circle
  const totalHours = timeCount.hours + timeCount.minutes / 60;
  const percentage = (totalHours / 24) * 100;
  const isOverLimit = totalHours > usageTimeLimit;

  // Get current date
  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

  // Function to open the reminder window
  const openReminderWindow = () => {
    console.log("Opening reminder window...");
    const webview = new WebviewWindow("AuroraReminderWindow", {
      url: "/AuroraReminderWindow",
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

  // Load settings from the store when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval"
      );
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText"
      );
      const usageTimeLimit = await store.get<number>("usageTimeLimit");
      if (usageTimeLimit) setUsageTimeLimit(usageTimeLimit);

      if (storedInterval) setInterval(storedInterval);
      if (storedDuration) setDuration(storedDuration);
      if (storedReminderText) setReminderText(storedReminderText);
      const getAppVersion = await getVersion();
      if (getAppVersion) setAppVersion(getAppVersion);
    };

    fetchSettings();
  }, []);

  // Save settings to the store when the save button is clicked
  const handleSave = async () => {
    // Input validation
    if (interval <= 0) {
      toast.error("Interval must be greater than 0 minutes.");
      return;
    }
    if (duration <= 0) {
      toast.error("Duration must be greater than 0 seconds.");
      return;
    }

    const store = await load("store.json", { autoSave: false });
    await store.set("blinkEyeReminderDuration", duration);
    await store.set("blinkEyeReminderInterval", interval);
    await store.set("blinkEyeReminderScreenText", reminderText);
    await store.save();

    triggerUpdate(); // Notify other components to refresh data

    toast.success("Successfully saved the settings!", {
      duration: 2000,
      position: "bottom-right",
    });

    console.log("Saved settings:", { interval, duration, reminderText });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center space-x-8">
        <div>
          <h1 className="text-4xl font-normal text-[#FE4C55]">
            {currentDate.toLocaleString("en-US", { weekday: "long" })}
          </h1>
          <p className="text-xl text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="86"
              className="stroke-muted stroke-[20px] fill-none"
              strokeLinecap="round"
            />
            <circle
              cx="96"
              cy="96"
              r="86"
              className={`stroke-[20px] fill-none transition-all duration-500 ease-in-out ${
                isOverLimit ? "stroke-[#FE4C55]" : "stroke-green-500"
              }`}
              strokeDasharray={`${(percentage * 540.4) / 100} 540.4`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{`${timeCount.hours}h ${timeCount.minutes}m`}</span>
            <span className="text-sm text-muted-foreground mt-1">
              Usage Time
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Primary Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interval-time">Break Time (Minutes)</Label>
              <Input
                type="number"
                id="interval-time"
                placeholder="Enter the reminder interval"
                value={interval}
                onChange={(e) =>
                  setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-duration">
                Break Duration (Seconds)
              </Label>
              <Input
                type="number"
                id="reminder-duration"
                placeholder="Enter the reminder duration"
                value={duration}
                onChange={(e) =>
                  setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="bg-background"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-text">Reminder Screen Text</Label>
            <Input
              type="text"
              id="reminder-text"
              placeholder="Look 20 feet away to protect your eyes."
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex justify-between w-full">
            <div className="flex space-x-4">
              <Button
                onClick={handleSave}
                className="bg-white text-black hover:bg-gray-200"
              >
                Save Settings
              </Button>
              <Button onClick={openReminderWindow} variant="secondary">
                Open Reminder Window
              </Button>
            </div>

            <div className="flex items-center ml-auto">
              <div className="flex h-8 w-8 items-center justify-center space-x-1">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 fill-current text-black dark:text-white mr-1"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </div>
              <span className="ml-1 text-lg text-muted-foreground">
                v{appVersion}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
