import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Store } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import toast, { Toaster } from "react-hot-toast";

const store = new Store(".settings.dat");

function Dashboard() {
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);

  // Check the initial state when the component mounts
  useEffect(() => {
    const checkAutoStartStatus = async () => {
      const status = await isEnabled();
      setIsAutoStartEnabled(status);
    };
    checkAutoStartStatus();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    if (checked) {
      await enable();
    } else {
      await disable();
    }
    setIsAutoStartEnabled(checked);
  };

  const openReminderWindow = () => {
    console.log("Clicked");
    const webview = new WebviewWindow("ReminderWindow", {
      url: "/reminder",
      fullscreen: true,
      alwaysOnTop: true,
      title: "Take A Break Reminder - Blink Eye",
    });
    webview.once("tauri://created", () => {
      console.log("Webview created");
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating webview:", e);
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval"
      );
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
      if (typeof storedInterval === "number") {
        setInterval(storedInterval);
      }
      if (typeof storedDuration === "number") {
        setDuration(storedDuration);
      }
    };
    fetchSettings();
  }, []);

  // Creating Reminder Window
  useEffect(() => {
    let timer: number | null = null;

    const startTimer = () => {
      timer = window.setInterval(() => {
        openReminderWindow();
      }, interval * 60 * 1000);
    };

    startTimer();

    return () => {
      if (timer !== null) window.clearInterval(timer);
    };
  }, [interval]);

  const handleSave = async () => {
    await store.set("blinkEyeReminderInterval", interval);
    await store.set("blinkEyeReminderDuration", duration);
    await store.save();
    toast.success("Successfully Saved the settings!", {
      duration: 2000,
      position: "bottom-right",
    });
    console.log("Saved settings:", { interval, duration });
  };

  return (
    <div className="container p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="space-y-6 max-w-sm">
        <div className="space-y-2">
          <Label htmlFor="interval-time">Reminder Interval</Label>
          <Input
            type="number"
            id="interval-time"
            placeholder="Enter the Reminder interval"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-duration">Reminder Duration</Label>
          <Input
            type="number"
            id="reminder-duration"
            placeholder="Enter the Reminder duration (sec)"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-2">
          <div className="items-top flex space-x-2">
            <Checkbox
              id="autostart"
              checked={isAutoStartEnabled}
              onCheckedChange={handleCheckboxChange}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="autostart"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Run Blink Eye on startup.
              </label>
              <p className="text-sm text-muted-foreground">
                Turn this on for best usage.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
      <Button onClick={openReminderWindow} className="mt-4">
        Open Reminder Window
      </Button>
      <Toaster />
    </div>
  );
}

export default Dashboard;
