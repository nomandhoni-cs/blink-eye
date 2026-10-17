import React, { lazy, useEffect, useState } from "react";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import toast, { Toaster } from "react-hot-toast";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { Progress } from "../ui/progress";
import CurrentTime from "../CurrentTime";
import ScreenOnTime from "../ScreenOnTime";
import { Button } from "../ui/button";
import { ChevronsRight, CloudDownload } from "lucide-react";
import { CountdownNumerals } from "./CountdownNumerals";
import { EdgeDialTimer } from "./EdgeDialTimer";
import { VerticalBarTimer } from "./VerticalBarTimer";
import {
  formatClock,
  isTimerStyle,
  loadTimerStyle,
  type TimerStyle,
} from "./timerStyle";

const TodayTodoTasks = lazy(() =>
  import("../TodayTodoTasks").then((module) => ({
    default: module.TodayTodoTasks,
  })),
);

type WindowConfig = {
  reminderText?: string;
  isStrictMode?: boolean;
  timerStyle?: string;
  durationSecs?: number;
  screenTimeHours?: number;
  screenTimeMinutes?: number;
  isUpdateAvailable?: boolean;
};

function parseWindowConfig(): WindowConfig {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("config");
    if (!raw) return {};
    return JSON.parse(raw) as WindowConfig;
  } catch {
    return {};
  }
}

/**
 * Break overlay on the primary monitor (timer, skip, todos).
 * Scheduling lives in Rust (`skip_reminder`, etc.).
 */
const ReminderOverlay: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [reminderDuration, setReminderDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");
  const [isStrictMode, setIsStrictMode] = useState<boolean>(false);
  const [timerStyle, setTimerStyle] = useState<TimerStyle>("circle");
  const [screenTime, setScreenTime] = useState({ hours: 0, minutes: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countdownStarted, setCountdownStarted] = useState<boolean>(false);
  const [canSnooze, setCanSnooze] = useState(true);

  const finishBreak = async (snoozed: boolean) => {
    const currentWin = getCurrentWebviewWindow();

    try {
      await invoke("skip_reminder", { snoozed });
    } catch (error) {
      console.error("[ReminderOverlay] skip_reminder failed:", error);
      if (snoozed) {
        toast.error("Snooze limit reached for this session or today.", {
          duration: 2500,
          position: "bottom-right",
        });
      }
      return;
    }

    const closePromises: Promise<void>[] = [];
    for (let i = 0; i < 10; i++) {
      const windowLabel = `reminder_monitor_${i}`;
      closePromises.push(
        (async () => {
          try {
            const win = await WebviewWindow.getByLabel(windowLabel);
            if (win && win.label !== currentWin.label) {
              await win.close();
            }
          } catch {
            // window not present
          }
        })(),
      );
    }

    await Promise.allSettled(closePromises);

    try {
      await currentWin.close();
    } catch (error) {
      console.error("[ReminderOverlay] close failed:", error);
    }
  };

  const handleSnooze = () => finishBreak(true);
  const handleBreakComplete = () => finishBreak(false);

  useEffect(() => {
    const load = async () => {
      try {
        const urlConfig = parseWindowConfig();

        const settings = await invoke<{
          durationSecs: number | null;
          reminderText: string | null;
        }>("get_reminder_settings");

        const duration =
          urlConfig.durationSecs ?? settings.durationSecs ?? 20;
        setReminderDuration(duration);
        setTimeLeft(duration);

        const text =
          urlConfig.reminderText ??
          settings.reminderText ??
          "";
        setReminderText(text);

        const [strict, style] = await Promise.all([
          urlConfig.isStrictMode ??
            invoke<boolean>("get_config_bool", {
              key: "usingStrictMode",
              defaultValue: false,
            }),
          // Previews don't pass a style in the URL; read the saved one.
          urlConfig.timerStyle ?? loadTimerStyle(),
        ]);
        setIsStrictMode(strict);
        setTimerStyle(isTimerStyle(style) ? style : "circle");

        setScreenTime({
          hours: urlConfig.screenTimeHours ?? 0,
          minutes: urlConfig.screenTimeMinutes ?? 0,
        });

        const updateAvailable =
          urlConfig.isUpdateAvailable ??
          (await invoke<boolean>("get_config_bool", {
            key: "isUpdateAvailable",
            defaultValue: false,
          }));

        if (updateAvailable) {
          toast.success("Update available!", {
            duration: 2000,
            position: "bottom-right",
            icon: <CloudDownload />,
          });
        }

        const stats = await invoke<{ canSnooze: boolean }>("get_break_stats");
        setCanSnooze(stats.canSnooze);
      } catch (error) {
        console.error("[ReminderOverlay] failed to load settings:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setCountdownStarted(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handlePlayAudio = async () => {
    try {
      const resourceDirDataPath = await path.resourceDir();
      const filePath = await path.join(resourceDirDataPath, "done.mp3");
      const reminderEndSound = new Audio(convertFileSrc(filePath));
      reminderEndSound.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  useEffect(() => {
    if (!countdownStarted) return;

    if (timeLeft <= 1 && isPremium) {
      handlePlayAudio();
    }
    if (timeLeft <= 0) {
      handleBreakComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isPremium, countdownStarted]);

  const progressPercentage =
    reminderDuration > 0 ? (timeLeft / reminderDuration) * 100 : 0;
  const displayText =
    reminderText || "Pause! Look into the distance, and best if you walk a bit.";
  // The value one second ago, so changed digits can roll out.
  const lastSecond =
    countdownStarted && timeLeft < reminderDuration ? timeLeft + 1 : undefined;
  const paddedTime = String(timeLeft).padStart(2, "0");
  const paddedLastSecond =
    lastSecond === undefined ? undefined : String(lastSecond).padStart(2, "0");
  const clockTime = formatClock(timeLeft);
  const clockLastSecond =
    lastSecond === undefined ? undefined : formatClock(lastSecond);

  const glassSkipButton = !isStrictMode && canSnooze && (
    <Button
      onClick={handleSnooze}
      variant="outline"
      className="rounded-full border border-white/20 bg-white/5 font-sans font-medium opacity-90 shadow-lg backdrop-blur-2xl transition-all hover:scale-105 hover:bg-white/10"
    >
      <ChevronsRight className="mr-1 h-5 w-5" />
      Skip this time
    </Button>
  );

  const renderTimer = () => {
    switch (timerStyle) {
      case "bar":
        return (
          <div className="flex h-full w-full flex-col items-center">
            <div className="absolute top-[40%] flex -translate-y-1/2 transform flex-col items-center animate-in">
              <div className="flex items-end text-[240px] leading-none">
                <CountdownNumerals
                  value={paddedTime}
                  previous={paddedLastSecond}
                />
                <span className="mb-8 ml-2 font-sans text-5xl font-medium opacity-70">
                  s
                </span>
              </div>
              <div className="mt-2 w-96">
                <Progress value={progressPercentage} />
              </div>
            </div>

            <div className="absolute top-[70%] flex -translate-y-1/2 transform flex-col items-center space-y-4 animate-in">
              <div className="flex items-center justify-center space-x-4 font-sans text-lg font-medium opacity-80">
                <CurrentTime />
                <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                <ScreenOnTime timeCount={screenTime} />
              </div>
              <div className="max-w-screen-md px-4 pb-4 text-center text-5xl font-heading font-medium">
                {displayText}
              </div>
              <div className="flex space-x-4">
                {!isStrictMode && canSnooze && (
                  <Button
                    onClick={handleSnooze}
                    className="flex transform items-center space-x-2 rounded-full bg-[#FE4C55] px-6 font-sans text-base transition-transform hover:scale-105 hover:bg-[#e9464e]"
                  >
                    <span className="text-base font-medium">Skip this Time</span>
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
        );

      case "dial":
        return (
          <>
            <EdgeDialTimer
              timeLeft={timeLeft}
              duration={reminderDuration}
              running={countdownStarted}
            />
            <div className="relative flex max-w-[80vw] flex-col items-center text-center animate-in fade-in">
              <CountdownNumerals
                value={clockTime}
                previous={clockLastSecond}
                className="text-[min(38vh,30vw)] leading-[0.8]"
              />
              <p className="mt-[4vh] max-w-[60vw] text-balance font-heading text-[clamp(1.75rem,4.2vh,3.25rem)] font-semibold leading-tight tracking-tight">
                {displayText}
              </p>
              <div className="mt-[2.5vh] mb-[3.5vh] flex items-center justify-center space-x-4 font-sans text-lg font-medium opacity-60">
                <CurrentTime />
                <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                <ScreenOnTime timeCount={screenTime} />
              </div>
              {glassSkipButton}
            </div>
          </>
        );

      case "vertical":
        return (
          <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-[7vmin] animate-in fade-in">
            <div className="flex justify-end">
              <CountdownNumerals
                value={clockTime}
                previous={clockLastSecond}
                className="text-[min(34vh,19vw)] leading-[0.8]"
              />
            </div>
            <VerticalBarTimer
              timeLeft={timeLeft}
              duration={reminderDuration}
              running={countdownStarted}
            />
            <div className="flex max-w-[34vw] flex-col items-start">
              <p className="text-balance font-heading text-[clamp(1.75rem,4.2vh,3.25rem)] font-semibold leading-tight tracking-tight">
                {displayText}
              </p>
              <div className="mt-[2.5vh] mb-[3.5vh] flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-lg font-medium opacity-60">
                <CurrentTime />
                <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                <ScreenOnTime timeCount={screenTime} />
              </div>
              {glassSkipButton}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="relative mb-8 h-96 w-96">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
                <circle
                  className="stroke-black/10 transition-colors dark:stroke-white/10"
                  strokeWidth="6"
                  fill="transparent"
                  r="50"
                  cx="55"
                  cy="55"
                />
                <circle
                  className="stroke-black transition-colors dark:stroke-white"
                  strokeWidth="6"
                  strokeDasharray={314.16}
                  strokeDashoffset={
                    314.16 * ((100 - progressPercentage) / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  r="50"
                  cx="55"
                  cy="55"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[160px] leading-none">
                <CountdownNumerals
                  value={paddedTime}
                  previous={paddedLastSecond}
                />
              </div>
            </div>

            <div className="mb-6 w-full max-w-screen-2xl text-center text-6xl font-heading font-semibold">
              {displayText}
            </div>

            <div className="mb-8 flex items-center justify-center space-x-4 font-sans text-xl font-medium opacity-70">
              <CurrentTime />
              <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
              <ScreenOnTime timeCount={screenTime} />
            </div>

            {glassSkipButton}
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-10">
      <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
        {isLoading ? (
          <div className="text-[12rem] font-heading font-semibold tracking-wide">
            Ready?
          </div>
        ) : (
          renderTimer()
        )}
      </div>

      {isPremium && !isLoading && (
        <TodayTodoTasks
          className={
            timerStyle === "dial" ? "bottom-[8vmin] right-[8vmin]" : undefined
          }
        />
      )}
      <Toaster />
    </div>
  );
};

export default ReminderOverlay;
