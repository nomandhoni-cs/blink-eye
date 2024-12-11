import React, { lazy, useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import toast, { Toaster } from "react-hot-toast";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { useTimeCountContext } from "../contexts/TimeCountContext";
import { Progress } from "./ui/progress";
import CurrentTime from "./CurrentTime";
import ScreenOnTime from "./ScreenOnTime";
import { Button } from "./ui/button";
import { CloudDownload, SkipForward } from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
// In the component where you're using React.lazy
const TodayTodoTasks = lazy(() =>
  import("./TodayTodoTasks").then((module) => ({
    default: module.TodayTodoTasks,
  }))
);

const appWindow = getCurrentWebviewWindow();

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

  useEffect(() => {
    const fetchReminderScreenInfo = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText"
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
        "SELECT value FROM config WHERE key = 'isUpdateAvailable';"
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
        "SELECT value FROM config WHERE key = 'usingStrictMode';"
      );

      if (strictModeResult.length > 0) {
        setIsUsingStrictMode(strictModeResult[0].value === "true");
      }
      const useCircleProgressTimerStyleResult: ConfigRow[] = await db.select(
        "SELECT value FROM config WHERE key = 'useCircleProgressTimerStyle';"
      );

      if (useCircleProgressTimerStyleResult.length > 0) {
        setIsUsingCircleProgressTimerStyle(
          useCircleProgressTimerStyleResult[0].value === "true"
        );
      }
      // Delay setting isLoading to false to show "Ready?" for longer
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Adjust this value to change how long "Ready?" is shown
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
      appWindow.close();
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
          <div className="text-[12rem] font-heading tracking-wide">Ready?</div>
        ) : !isUsiningCircleProgressTimerStyle ? (
          <div className="flex flex-col items-center">
            <div className="absolute top-[40%] transform -translate-y-1/2 flex flex-col items-center">
              <div className="text-[240px] font-semibold">{timeLeft}s</div>
              <div className="w-96 -mt-10">
                <Progress value={progressPercentage} />
              </div>
            </div>
            <div className="absolute top-[70%] transform -translate-y-1/2 flex flex-col items-center space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <CurrentTime />
                <div className="w-1 h-8 opacity-20 bg-black dark:bg-white" />
                <ScreenOnTime timeCount={timeCount} />
              </div>
              <div className="text-5xl font-semibold text-center px-4 pb-4">
                {reminderText || "Look 20 feet far away to protect your eyes."}
              </div>
              <div className="flex space-x-4">
                {!isUsingStrictMode && (
                  <Button
                    onClick={() => appWindow.close()}
                    className="bg-[#FE4C55] rounded-full hover:bg-[#e9464e] text-base px-6 space-x-2 flex items-center transform transition-transform hover:scale-105"
                  >
                    <span className="text-base">Skip this Time</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
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
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 110 110" /* Increased the viewBox to add padding */
              >
                {/* Background Circle */}
                <circle
                  className="text-gray-300 dark:text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="50" /* Adjusted the radius to fit within the new viewBox */
                  cx="55" /* Centered circle to align with the new viewBox */
                  cy="55"
                />
                {/* Progress Circle */}
                <circle
                  className="text-primary dark:text-primary-dark"
                  strokeWidth="8"
                  strokeDasharray={
                    314.16
                  } /* Updated to match the adjusted radius */
                  strokeDashoffset={314.16 * ((100 - progressPercentage) / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="55"
                  cy="55"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[160px] font-semibold text-center">
                  {timeLeft}
                </span>
              </div>
            </div>

            <div className="text-6xl font-semibold text-center mb-6 max-w-7xl">
              {reminderText || "Look 20 feet away to protect your eyes"}
            </div>

            <div className="flex justify-center items-center space-x-4 mb-8">
              <CurrentTime />
              <div className="w-1 h-8 opacity-20 bg-black dark:bg-white" />
              <ScreenOnTime timeCount={timeCount} />
            </div>

            {!isUsingStrictMode && (
              <Button
                onClick={() => appWindow.close()}
                variant="outline"
                className="bg-transparent hover:bg-[#FE4C55] border-[#FE4C55] hover:border-transparent transition-colors"
              >
                <SkipForward className="w-4 h-4 mr-2" />
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
