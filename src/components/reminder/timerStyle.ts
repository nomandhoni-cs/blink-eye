import { useEffect, useRef, useSyncExternalStore } from "react";
import { invoke } from "@tauri-apps/api/core";

/** Countdown styles drawn by the break overlay. Mirrors `TIMER_STYLES` in `reminder_scheduler.rs`. */
export type TimerStyle = "circle" | "bar" | "dial" | "vertical";

export const TIMER_STYLES: TimerStyle[] = ["circle", "bar", "dial", "vertical"];

export function isTimerStyle(value: unknown): value is TimerStyle {
  return TIMER_STYLES.includes(value as TimerStyle);
}

/**
 * Saved timer style. Installs from before timer styles only have the legacy
 * circle switch, so fall back to it.
 */
export async function loadTimerStyle(): Promise<TimerStyle> {
  const saved = await invoke<string | null>("get_config_string", {
    key: "reminderTimerStyle",
  });
  if (isTimerStyle(saved)) return saved;

  const useCircle = await invoke<boolean>("get_config_bool", {
    key: "useCircleProgressTimerStyle",
    defaultValue: true,
  });
  return useCircle ? "circle" : "bar";
}

/** Saves the timer style and reloads the Rust scheduler so the next break uses it. */
export async function saveTimerStyle(style: TimerStyle): Promise<void> {
  await invoke("update_reminder_setting", {
    key: "reminderTimerStyle",
    value: style,
  });
  // Keep the legacy switch in step for older builds reading it.
  await invoke("update_reminder_setting", {
    key: "useCircleProgressTimerStyle",
    value: String(style === "circle"),
  });
  await invoke("refresh_reminder_scheduler_settings");
}

/** `75` → `"1:15"`, like Apple's timers. */
export function formatClock(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

const getWidth = () => window.innerWidth;
const getHeight = () => window.innerHeight;

/** Live window size, for timers drawn in screen pixels. */
export function useViewportSize() {
  const width = useSyncExternalStore(subscribeToResize, getWidth);
  const height = useSyncExternalStore(subscribeToResize, getHeight);
  return { width, height };
}

/**
 * Calls `onFrame` with the break's elapsed fraction (0 → 1) on every animation
 * frame, gliding through the current second so progress never jumps.
 *
 * The glide is capped at the next whole second, so the visuals never run
 * ahead of the digits even when the countdown tick arrives late.
 */
export function useCountdownFrames(
  timeLeft: number,
  duration: number,
  running: boolean,
  onFrame: (elapsedFraction: number) => void,
  redrawKey?: unknown,
) {
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    const base = duration > 0 ? Math.min(1, (duration - timeLeft) / duration) : 1;
    const step = duration > 0 ? 1 / duration : 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!running || reduceMotion || timeLeft <= 0) {
      onFrameRef.current(Math.max(0, base));
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / 1000);
      onFrameRef.current(Math.min(1, Math.max(0, base + step * t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timeLeft, duration, running, redrawKey]);
}
