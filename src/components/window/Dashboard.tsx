import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
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
    const webview = new WebviewWindow("ReminderWindow", {
      url: "/reminder",
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-red-400">
            {currentDate.toLocaleString("en-US", { weekday: "long" })}
          </h1>
          <p className="text-xl text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-muted stroke-[8px] fill-none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              className={`stroke-[8px] fill-none transition-all duration-500 ease-in-out ${
                isOverLimit ? "stroke-red-500" : "stroke-green-500"
              }`}
              strokeDasharray={`${(percentage * 439.6) / 100} 439.6`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold">{`${timeCount.hours}h ${timeCount.minutes}m`}</span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
