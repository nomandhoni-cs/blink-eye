import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTrigger } from "../../contexts/TriggerReRender";

const Settings = () => {
  const { triggerUpdate } = useTrigger();
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");

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
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="interval-time">Break Every {interval} (Minutes)</Label>
        <Input
          type="number"
          id="interval-time"
          placeholder="Enter the reminder interval"
          value={interval}
          onChange={
            (e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1)) // Enforce minimum value
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminder-duration">Break Duration (Seconds)</Label>
        <Input
          type="number"
          id="reminder-duration"
          placeholder="Enter the reminder duration"
          value={duration}
          onChange={
            (e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1)) // Enforce minimum value
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminder-text">Reminder Screen Text</Label>
        <Input
          type="text"
          id="reminder-text"
          placeholder="Look 20 feet away to protect your eyes."
          value={reminderText}
          onChange={(e) => setReminderText(e.target.value)} // Trim extra spaces
        />
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleSave}>Save Settings</Button>
        <Button onClick={openReminderWindow} variant="secondary">
          Open Reminder Window
        </Button>
      </div>
    </div>
  );
};

export default Settings;
