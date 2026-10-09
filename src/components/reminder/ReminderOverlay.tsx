import React, { lazy, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import toast, { Toaster } from "react-hot-toast";
import { Ticker } from "@tombcato/smart-ticker";
import "@tombcato/smart-ticker/style.css";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { Progress } from "../ui/progress";
import CurrentTime from "../CurrentTime";
import ScreenOnTime from "../ScreenOnTime";
import { Button } from "../ui/button";
import { ChevronsRight, CloudDownload } from "lucide-react";

const TodayTodoTasks = lazy(() =>
  import("../TodayTodoTasks").then((module) => ({
    default: module.TodayTodoTasks,
  })),
);

type ReminderStatus = {
  readonly sessionId: number;
  readonly kind: "actual" | "preview";
  readonly controlWindowLabel: string | null;
  readonly reminderText: string;
  readonly isStrictMode: boolean;
  readonly useCircleTimer: boolean;
  readonly durationSecs: number;
  readonly remainingMs: number;
  readonly screenTimeHours: number;
  readonly screenTimeMinutes: number;
  readonly isUpdateAvailable: boolean;
};

function parseSessionId(): number | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("config");
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed === "object" && parsed !== null && "sessionId" in parsed
      && typeof parsed.sessionId === "number" && Number.isSafeInteger(parsed.sessionId)) {
      return parsed.sessionId;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Shared timer, message and dismissal on every output; primary-only todos/audio.
 * Scheduling lives in Rust (`skip_reminder`, etc.).
 */
const ReminderOverlay: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
  const [sessionId] = useState(parseSessionId);
  const [windowLabel] = useState(() => getCurrentWebviewWindow().label);
  const [status, setStatus] = useState<ReminderStatus | null>(null);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [canSnooze, setCanSnooze] = useState(false);
  const audioPlayed = useRef(false);
  const audioClaimPending = useRef(false);
  const mounted = useRef(false);
  const timeLeft = Math.ceil((status?.remainingMs ?? 0) / 1000);
  const reminderDuration = status?.durationSecs ?? 20;
  const reminderText = status?.reminderText ?? "";
  const isStrictMode = status?.isStrictMode ?? true;
  const useCircleTimer = status?.useCircleTimer ?? true;
  const isPreview = status?.kind === "preview";
  const isPrimary = status?.controlWindowLabel === windowLabel;
  const isLoading = status === null;
  const screenTime = { hours: status?.screenTimeHours ?? 0, minutes: status?.screenTimeMinutes ?? 0 };
  const circleSize = Math.min(384, viewport.height * 0.36, viewport.width * 0.65);
  const timerDigits = Math.max(2, String(timeLeft).length);
  const circleFontSize = Math.min(160, circleSize * 0.42, circleSize * 0.76 / (timerDigits * 0.8));
  const barSuffixFontSize = Math.min(48, viewport.height * 0.045);
  const barFontSize = Math.min(
    240,
    Math.max(64, viewport.height * 0.22),
    (viewport.width - 32 - 8 - barSuffixFontSize) / (timerDigits * 0.8),
  );
  const timerKey = `${viewport.width}-${viewport.height}-${timerDigits}`;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleSnooze = async () => {
    try {
      if (isPreview) {
        await invoke("dismiss_reminder_preview", { sessionId });
      } else {
        await invoke("skip_reminder", { sessionId, snoozed: true });
      }
    } catch (error) {
      toast.error(String(error), { duration: 2500, position: "bottom-right" });
    }
  };

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;
    const load = async () => {
      try {
        unlisten = await listen<ReminderStatus>("reminder-status", ({ payload }) => {
          if (!disposed && payload.sessionId === sessionId) setStatus(payload);
        });
        if (disposed) {
          unlisten();
          return;
        }
        const current = await invoke<ReminderStatus>("get_reminder_status", { sessionId });
        if (disposed) return;
        setStatus(current);
        if (current.isUpdateAvailable && current.controlWindowLabel === windowLabel) {
          toast.success("Update available!", {
            duration: 2000,
            position: "bottom-right",
            icon: <CloudDownload />,
          });
        }

      } catch (error) {
        if (!disposed) toast.error(String(error), { position: "bottom-right" });
      }
    };
    load();
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [sessionId, windowLabel]);

  useEffect(() => {
    if (isLoading || isPreview) return;
    let disposed = false;
    invoke<{ canSnooze: boolean }>("get_break_stats")
      .then((stats) => { if (!disposed) setCanSnooze(stats.canSnooze); })
      .catch((error: unknown) => {
        if (!disposed) toast.error(String(error), { position: "bottom-right" });
      });
    return () => { disposed = true; };
  }, [sessionId, isPreview, isLoading]);

  useEffect(() => {
    if (!isPreview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        invoke("dismiss_reminder_preview", { sessionId }).catch((error: unknown) =>
          toast.error(String(error), { position: "bottom-right" }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPreview, sessionId]);

  useEffect(() => {
    if (isLoading || timeLeft > 1 || !isPremium || !isPrimary
      || audioPlayed.current || audioClaimPending.current) return;
    audioClaimPending.current = true;
    const play = async () => {
      try {
        if (!await invoke<boolean>("claim_reminder_audio", { sessionId }) || !mounted.current) return;
        audioPlayed.current = true;
        const filePath = await path.join(await path.resourceDir(), "done.mp3");
        // The native asset protocol can misidentify headerless MP3 as text/html.
        const response = await fetch(convertFileSrc(filePath));
        if (!response.ok) throw new Error(`Reminder audio: ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (!mounted.current) return;
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        const audio = new Audio(url);
        const release = () => URL.revokeObjectURL(url);
        audio.addEventListener("ended", release, { once: true });
        audio.addEventListener("error", release, { once: true });
        try {
          await audio.play();
        } catch (error) {
          release();
          throw error;
        }
      } catch (error) {
        console.error("Error playing reminder audio:", error);
      } finally {
        audioClaimPending.current = false;
      }
    };
    play();
  }, [timeLeft, status?.remainingMs, isPremium, isPrimary, isLoading, sessionId]);

  const progressPercentage =
    reminderDuration > 0 ? (timeLeft / reminderDuration) * 100 : 0;
  const displayText =
    reminderText || "Pause! Look into the distance, and best if you walk a bit.";
  const paddedTime = String(timeLeft).padStart(2, "0");

  return (
    <div className="absolute inset-0 z-10">
      {isPreview && (
        <div className="absolute left-6 top-6 z-20 rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-foreground">
          Preview - Escape to close
        </div>
      )}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
        {isLoading ? (
          <div className="text-[12rem] font-heading font-semibold tracking-wide">
            Ready?
          </div>
        ) : !useCircleTimer ? (
          <div className="flex h-full w-full flex-col items-center">
            <div className="absolute top-[40%] flex -translate-y-1/2 transform flex-col items-center animate-in">
              <div className="flex items-end font-heading leading-none" style={{ fontSize: barFontSize }}>
                <Ticker
                  key={timerKey}
                  value={paddedTime}
                  duration={700}
                  easing="easeInOut"
                  characterLists={["0123456789"]}
                  charWidth={0.8}
                  className="!font-heading tabular-nums"
                />
                <span className="mb-[min(3vh,2rem)] ml-2 font-sans font-medium opacity-70" style={{ fontSize: barSuffixFontSize }}>
                  s
                </span>
              </div>
              <div className="mt-2 w-[min(24rem,75vw)]">
                <Progress value={progressPercentage} />
              </div>
            </div>

            <div className="absolute top-[70%] flex -translate-y-1/2 transform flex-col items-center space-y-4 animate-in">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-sans font-medium opacity-80" style={{ fontSize: Math.min(18, Math.max(12, viewport.height * 0.017)), lineHeight: 1.5 }}>
                <CurrentTime />
                <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                <ScreenOnTime timeCount={screenTime} />
              </div>
              <div className="max-w-screen-md break-words px-4 pb-4 text-center font-heading font-medium leading-none" style={{ fontSize: Math.min(48, Math.max(20, viewport.height * 0.045)) }}>
                {displayText}
              </div>
              <div className="flex space-x-4">
                {(isPreview || (!isStrictMode && canSnooze)) && (
                  <Button
                    onClick={handleSnooze}
                    className="flex transform items-center space-x-2 rounded-full bg-[#FE4C55] px-6 font-sans text-base transition-transform hover:scale-105 hover:bg-[#e9464e]"
                  >
                    <span className="text-base font-medium">{isPreview ? "Close preview" : "Skip this Time"}</span>
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
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <div className="relative mb-[min(3vh,2rem)] shrink-0" style={{ width: circleSize, height: circleSize }}>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" style={{ fontSize: circleFontSize }}>
                <Ticker
                  key={timerKey}
                  value={paddedTime}
                  duration={700}
                  easing="easeInOut"
                  characterLists={["0123456789"]}
                  charWidth={0.8}
                  className="!font-heading tabular-nums"
                />
              </div>
            </div>

            <div className="mb-[min(2.2vh,1.5rem)] w-full max-w-screen-2xl break-words text-center font-heading font-semibold leading-none" style={{ fontSize: Math.min(60, Math.max(20, viewport.height * 0.056)) }}>
              {displayText}
            </div>

            <div className="mb-[min(3vh,2rem)] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-sans font-medium opacity-70" style={{ fontSize: Math.min(20, Math.max(12, viewport.height * 0.022)), lineHeight: 1.4 }}>
              <CurrentTime />
              <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
              <ScreenOnTime timeCount={screenTime} />
            </div>

            {(isPreview || (!isStrictMode && canSnooze)) && (
              <Button
                onClick={handleSnooze}
                variant="outline"
                className="rounded-full border border-white/20 bg-white/5 font-sans font-medium opacity-90 shadow-lg backdrop-blur-2xl transition-all hover:scale-105 hover:bg-white/10"
              >
                <ChevronsRight className="mr-1 h-5 w-5" />
                {isPreview ? "Close preview" : "Skip this time"}
              </Button>
            )}
          </div>
        )}
      </div>

      {isPrimary && isPremium && !isLoading && <TodayTodoTasks />}
      <Toaster />
    </div>
  );
};

export default ReminderOverlay;
