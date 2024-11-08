import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import AutoStartToggle from "../AutoStartToggle";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
// import { join, resourceDir } from "@tauri-apps/api/path";
// import { convertFileSrc } from "@tauri-apps/api/core";

const Settings = () => {
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioUrlTwo, setAudioUrlTwo] = useState<string>("");

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
      }
      if (typeof storedDuration === "number") {
        setDuration(storedDuration);
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
  // const handlePlayAudio = async () => {
  //   try {
  //     const resourceDirPath = await resourceDir();
  //     console.log(resourceDirPath);
  //     const filePath = await join(resourceDirPath, "assets/done.mp3");
  //     const audioUrl = convertFileSrc(filePath);
  //     const audioElement = new Audio(audioUrl);
  //     await audioElement.play();
  //   } catch (error) {
  //     console.error("Error playing audio:", error);
  //   }
  // };
  const handlePlayAudio = async () => {
    // const doesAudioExist = await exists("done.mp3", {
    //   baseDir: BaseDirectory.Resource,
    // });
    const contents = await readFile("done.mp3", {
      baseDir: BaseDirectory.Resource,
    });
    const home = await path.resolveResource("done.mp3");
    console.log(home);
    const audioUrl = convertFileSrc(home);
    const audioElement = new Audio(audioUrl);
    await audioElement.play();
    console.log(home);
    setAudioUrl(audioUrl);
    setAudioUrlTwo(home);
    // const home = await path.resourceDir();
    // console.log(home, "Home Directory");
    // const audioElement = new Audio(contents);
    // await audioElement.play();
    console.log(contents, "Audio File Contents");
    // console.log(doesAudioExist, "Checking in Resource");
  };
  return (
    <>
      <div className="space-y-6 py-2">
        <div className="space-y-2">
          <p>{audioUrl + " ConverSrc"}</p>
          <p>{audioUrlTwo + " HOme path"}</p>
          <Button onClick={handlePlayAudio}>Play Audio</Button>
          <Label htmlFor="interval-time">
            Break after every {interval} Minutes
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
        <div className="space-y-2">
          <AutoStartToggle />
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
      <Button onClick={openReminderWindow} className="mt-4">
        Open Reminder Window
      </Button>
    </>
  );
};

export default Settings;
