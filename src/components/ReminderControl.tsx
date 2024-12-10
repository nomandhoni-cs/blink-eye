import React, { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import toast, { Toaster } from "react-hot-toast";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { useTimeCountContext } from "../contexts/TimeCountContext";
import AuroraBackgroundWrapper from "./ReminderWindows/AuroraBGWrapper";
import { Progress } from "./ui/progress";
import CurrentTime from "./CurrentTime";
import ScreenOnTime from "./ScreenOnTime";
import { Button } from "./ui/button";
import { CloudDownload } from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";

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

      setIsLoading(false);
    };

    fetchReminderScreenInfo();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsCountdownStarted(true);
      }, 1000);

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
    <AuroraBackgroundWrapper>
      <div className="flex flex-col items-center justify-center h-full w-full px-4">
        {isLoading ? (
          <div className="text-9xl font-semibold animate-fade-in">Ready?</div>
        ) : (
          <div
            className={`flex flex-col items-center ${
              isCountdownStarted ? "animate-fade-in" : "opacity-0"
            }`}
          >
            <div className="absolute top-[40%] transform -translate-y-1/2 flex flex-col items-center">
              <div className="text-[240px] font-semibold animate-count-down">
                {timeLeft}s
              </div>
              <div className="w-96 -mt-10">
                <Progress value={progressPercentage} />
              </div>
            </div>
            <div className="absolute top-[70%] transform -translate-y-1/2 flex flex-col items-center space-y-4">
              <div className="flex justify-center items-center space-x-6">
                <CurrentTime />
                <ScreenOnTime timeCount={timeCount} />
              </div>
              <div className="text-5xl font-semibold text-center px-4 pb-4 animate-fade-in-up">
                {reminderText || "Look 20 feet far away to protect your eyes."}
              </div>
              <div className="flex space-x-4">
                {!isUsingStrictMode && (
                  <Button
                    onClick={() => appWindow.close()}
                    className="bg-[#FE4C55] rounded-full hover:bg-[#e9464e] text-base px-6 space-x-2 flex items-center transform transition-transform hover:scale-105 animate-fade-in-up"
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
        )}
      </div>
      <Toaster />
    </AuroraBackgroundWrapper>
  );
};

export default ReminderControl;
