import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
const Settings = () => {
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");

  const openReminderWindow = () => {
    console.log("Clicked");
    const webview = new WebviewWindow("ReminderWindow", {
      url: "/reminder",
      fullscreen: true,
      alwaysOnTop: true,
      title: "Take A Break Reminder - Blink Eye",
      skipTaskbar: true,
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
      const store = await load("store.json", { autoSave: false });
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval"
      );
      // const isPomodoroTimerEnabled = await store.get<boolean>(
      //   "PomodoroStyleBreak"
      // );
      // console.log(isPomodoroTimerEnabled, "is pomodoro timer enabled");
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText"
      );
      if (typeof storedReminderText === "string") {
        setReminderText(storedReminderText);
      }
      if (typeof storedInterval === "number") {
        setInterval(storedInterval);
        // if (isPomodoroTimerEnabled) {
        //   setInterval(25);
        // } else {
        // }
      }
      if (typeof storedDuration === "number") {
        setDuration(storedDuration);
        // if (isPomodoroTimerEnabled) {
        //   setDuration(300);
        // } else {
        // }
      }
    };
    fetchSettings();
  }, []);

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
    const store = await load("store.json", { autoSave: false });
    const storee = await load("userScreenOnTime.json", { autoSave: false });
    await store.set("blinkEyeReminderInterval", interval);
    await store.set("blinkEyeReminderDuration", duration);
    await store.set("blinkEyeReminderScreenText", reminderText);

    await store.save();
    toast.success("Successfully Saved the settings!", {
      duration: 2000,
      position: "bottom-right",
    });
    const timeData = await storee.get("timeData");
    console.log("Saved settings:", { interval, duration }, timeData);
  };

  return (
    <>
      <div className="space-y-6 py-2">
        <div className="space-y-2">
          <Label htmlFor="interval-time">
            Break Every {interval} (Minutes)
          </Label>
          <Input
            type="number"
            id="interval-time"
            placeholder="Enter the Reminder interval"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-duration">Break Duration in Seconds</Label>
          <Input
            type="number"
            id="reminder-duration"
            placeholder="Enter the Reminder duration (sec)"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-duration">Break Screen Text</Label>
          <Input
            type="text"
            id="reminder_screen_text"
            placeholder="Look 20 feet far away to protect your eyes."
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
        <Button onClick={openReminderWindow} className="ml-4">
          Open Reminder Window
        </Button>
      </div>
    </>
  );
};

export default Settings;
