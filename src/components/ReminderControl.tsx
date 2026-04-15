import React, { lazy, useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import toast, { Toaster } from "react-hot-toast";
import { Ticker } from "@tombcato/smart-ticker";
import "@tombcato/smart-ticker/style.css";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { Progress } from "./ui/progress";
import CurrentTime from "./CurrentTime";
import ScreenOnTime from "./ScreenOnTime";
import { Button } from "./ui/button";
import { ChevronsRight, CloudDownload } from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { useTimeCountContext } from "../contexts/TimeCountContext";
import { emitTo, listen } from "@tauri-apps/api/event";

const TodayTodoTasks = lazy(() =>
  import("./TodayTodoTasks").then((module) => ({
    default: module.TodayTodoTasks,
  })),
);

interface ConfigRow {
  value: string;
}

const ReminderControl: React.FC = () => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const { timeCount } = useTimeCountContext();
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [reminderDuration, setReminderDuration] = useState<number>(20);
  const [reminderText, setStoredReminderText] = useState<string>("");
  const [isUsingStrictMode, setIsUsingStrictMode] = useState<boolean>(false);
  const [
    isUsiningCircleProgressTimerStyle,
    setIsUsingCircleProgressTimerStyle,
  ] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCountdownStarted, setIsCountdownStarted] = useState<boolean>(false);

  const closeAllReminderWindows = async () => {
    try {
      const currentWindow = getCurrentWebviewWindow();
      const currentLabel = currentWindow.label;

      // Close secondary windows first via emitTo (crosses webview boundaries)
      for (let i = 0; i < 10; i++) {
        const targetLabel = `reminder_monitor_${i}`;
        if (targetLabel === currentLabel) continue;
        try {
          await emitTo(targetLabel, "close-all-reminders", {});
          console.log(`Sent close event to ${targetLabel}`);
        } catch (err) {
          // Window doesn't exist at this index
          console.log(`Window ${targetLabel} not found`);
        }
      }

      // Small delay to ensure events are processed
      await new Promise(resolve => setTimeout(resolve, 50));

      // Close self last
      await currentWindow.close();
    } catch (error) {
      console.error("Error closing reminder windows:", error);
    }
  };

  useEffect(() => {
    const unlisten = listen("close-all-reminders", () => {
      const currentWindow = getCurrentWebviewWindow();
      currentWindow.close();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const fetchReminderScreenInfo = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration",
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText",
      );
      if (
        typeof storedReminderText === "string" &&
        storedReminderText.length > 0
      ) {
        setStoredReminderText(storedReminderText);
      }
      if (typeof storedDuration === "number") {
        setReminderDuration(storedDuration);
        setTimeLeft(storedDuration);
      }

      const db = await Database.load("sqlite:appconfig.db");

      const updateAvailableResult: ConfigRow[] = await db.select(
        "SELECT value FROM config WHERE key = 'isUpdateAvailable';",
      );

      if (
        updateAvailableResult.length > 0 &&
        updateAvailableResult[0].value === "true"
      ) {
        toast.success("Update available!", {
          duration: 2000,
          position: "bottom-right",
          icon: <CloudDownload />,
        });
      }

      const strictModeResult: ConfigRow[] = await db.select(
        "SELECT value FROM config WHERE key = 'usingStrictMode';",
      );

      if (strictModeResult.length > 0) {
        setIsUsingStrictMode(strictModeResult[0].value === "true");
      }
      const useCircleProgressTimerStyleResult: ConfigRow[] = await db.select(
        "SELECT value FROM config WHERE key = 'useCircleProgressTimerStyle';",
      );

      if (useCircleProgressTimerStyleResult.length > 0) {
        setIsUsingCircleProgressTimerStyle(
          useCircleProgressTimerStyleResult[0].value === "true",
        );
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    fetchReminderScreenInfo();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsCountdownStarted(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handlePlayAudio = async () => {
    try {
      const resourceDirDataPath = await path.resourceDir();
      const filePath = await path.join(resourceDirDataPath, "done.mp3");
      let reminderEndSound = new Audio(convertFileSrc(filePath));
      reminderEndSound.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  useEffect(() => {
    if (!isCountdownStarted) return;

    if (timeLeft <= 1 && canAccessPremiumFeatures) {
      handlePlayAudio();
    }
    if (timeLeft <= 0) {
      closeAllReminderWindows();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, canAccessPremiumFeatures, isCountdownStarted]);

  const progressPercentage = (timeLeft / reminderDuration) * 100;

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full w-full px-4 relative">
        {isLoading ? (
          <div className="text-[12rem] font-heading font-semibold tracking-wide">
            Ready?
          </div>
        ) : !isUsiningCircleProgressTimerStyle ? (
          <div className="flex flex-col items-center">
            <div className="absolute top-[40%] transform -translate-y-1/2 flex flex-col items-center animate-in">
              <div className="flex items-end font-heading text-[240px] leading-none">
                {/*
                  1. `charWidth={0.8}` tightly pulls the characters together (Default is 1). Adjust to 0.75 or 0.85 if needed.
                  2. `className="!font-heading tabular-nums"` cleanly forces the Outfit font and geometric alignment.
                */}
                <Ticker
                  value={String(timeLeft).padStart(2, "0")}
                  duration={700}
                  easing="easeInOut"
                  characterLists={["0123456789"]}
                  charWidth={0.8}
                  className="!font-heading tabular-nums"
                />
                <span className="font-sans text-5xl mb-8 ml-2 font-medium opacity-70">
                  s
                </span>
              </div>
              <div className="w-96 mt-2">
                <Progress value={progressPercentage} />
              </div>
            </div>

            <div className="absolute top-[70%] transform -translate-y-1/2 flex flex-col items-center space-y-4 animate-in">
              <div className="flex justify-center items-center space-x-4 font-sans text-lg font-medium opacity-80">
                <CurrentTime />
                <div className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                <ScreenOnTime timeCount={timeCount} />
              </div>
              <div className="text-5xl font-heading font-medium text-center px-4 pb-4">
                {reminderText ||
                  "Pause! Look into the distance, and best if you walk a bit."}
              </div>
              <div className="flex space-x-4">
                {!isUsingStrictMode && (
                  <Button
                    onClick={closeAllReminderWindows}
                    className="bg-[#FE4C55] font-sans rounded-full hover:bg-[#e9464e] text-base px-6 space-x-2 flex items-center transform transition-transform hover:scale-105"
                  >
                    <span className="text-base font-medium">
                      Skip this Time
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="relative w-96 h-96 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                <circle
                  className="stroke-black/10 dark:stroke-white/10 transition-colors"
                  strokeWidth="6"
                  fill="transparent"
                  r="50"
                  cx="55"
                  cy="55"
                />
                <circle
                  className="stroke-black dark:stroke-white transition-colors"
                  strokeWidth="6"
                  strokeDasharray={314.16}
                  strokeDashoffset={314.16 * ((100 - progressPercentage) / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  r="50"
                  cx="55"
                  cy="55"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[160px] leading-none">
                <Ticker
                  value={String(timeLeft).padStart(2, "0")}
                  duration={700}
                  easing="easeInOut"
                  characterLists={["0123456789"]}
                  charWidth={0.8}
                  className="!font-heading tabular-nums"
                />
              </div>
            </div>

            <div className="text-6xl font-heading font-semibold text-center mb-6 w-full max-w-screen-2xl">
              {reminderText ||
                "Pause! Look into the distance, and best if you walk a bit."}
            </div>

            <div className="flex justify-center items-center space-x-4 mb-8 font-sans text-xl opacity-70 font-medium">
              <CurrentTime />
              <div className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40" />
              <ScreenOnTime timeCount={timeCount} />
            </div>

            {!isUsingStrictMode && (
              <Button
                onClick={closeAllReminderWindows}
                variant="outline"
                className="bg-white/5 font-sans font-medium opacity-90 backdrop-blur-2xl rounded-full shadow-lg transition-all border border-white/20 hover:bg-white/10 hover:scale-105"
              >
                <ChevronsRight className="w-5 h-5 mr-1" />
                Skip this time
              </Button>
            )}
          </div>
        )}
      </div>
      {canAccessPremiumFeatures && !isLoading && <TodayTodoTasks />}
      <Toaster />
    </>
  );
};

export default ReminderControl;
