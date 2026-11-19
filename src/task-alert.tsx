import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, ListTodo, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "./assets/newIcon.png";
import { initI18n } from "./i18n";
import "./index.css";

type TaskAlertPayload = {
  taskId: number;
  title: string;
  /** i18n key — the popup follows the app's selected language. */
  messageKey: string;
  kind: "due" | "nudge" | "preview";
  dueAt?: string | null;
};

const VISIBLE_MS = 18_000;

function readPayload(): TaskAlertPayload {
  try {
    const raw = new URLSearchParams(window.location.search).get("payload");
    const parsed = raw ? (JSON.parse(raw) as TaskAlertPayload) : null;
    if (parsed && typeof parsed.title === "string" && typeof parsed.messageKey === "string") {
      return parsed;
    }
  } catch (error) {
    console.error("[task alert] Could not read payload:", error);
  }
  return {
    taskId: -1,
    title: "A task you want to finish",
    messageKey: "taskAlert.dueMessage",
    kind: "preview",
  };
}

/**
 * Spring settings follow the feel of YusufCeng1z/ding: a short overshoot on
 * entry and a progress bar whose width is driven by a spring, so an action
 * part-way through the countdown keeps its momentum instead of snapping.
 */
const SPRING = { type: "spring" as const, stiffness: 460, damping: 27, mass: 0.75 };

const TaskAlert: React.FC = () => {
  const { t } = useTranslation();
  const payload = useMemo(() => readPayload(), []);
  const windowRef = useRef(getCurrentWebviewWindow());
  const reduceMotion = useReducedMotion();
  const [finalState, setFinalState] = useState<"done" | null>(null);
  const progress = useMotionValue(100);
  const smoothProgress = useSpring(progress, {
    stiffness: 110,
    damping: 24,
    mass: 0.6,
  });
  const progressWidth = useTransform(smoothProgress, (value) => `${Math.max(0, value)}%`);

  useEffect(() => {
    let closed = false;
    const start = performance.now();
    const close = () => {
      if (closed) return;
      closed = true;
      void windowRef.current.close();
    };
    const tick = () => {
      const remaining = Math.max(0, 1 - (performance.now() - start) / VISIBLE_MS);
      progress.set(remaining * 100);
      if (remaining <= 0) close();
    };
    const interval = window.setInterval(tick, 100);
    return () => {
      closed = true;
      window.clearInterval(interval);
    };
  }, [progress, windowRef]);

  const close = () => void windowRef.current.close();

  const markDone = async () => {
    if (payload.taskId < 0) {
      close();
      return;
    }
    setFinalState("done");
    progress.set(0);
    await new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : 420));
    try {
      await invoke("complete_task_from_alert", { taskId: payload.taskId });
    } catch (error) {
      console.error("[task alert] Could not complete task:", error);
      close();
    }
  };

  const openList = async () => {
    try {
      await invoke("open_todo_from_alert");
    } catch (error) {
      console.error("[task alert] Could not open the todo list:", error);
      close();
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const eyebrowKey =
    payload.kind === "due"
      ? "taskAlert.dueEyebrow"
      : payload.kind === "nudge"
        ? "taskAlert.nudgeEyebrow"
        : "taskAlert.previewEyebrow";

  return (
    <div className="flex h-screen w-full items-center justify-center p-2">
      <motion.div
        role="status"
        aria-live="polite"
        aria-label="Blink Eye task reminder"
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -30, scale: 0.82, rotateX: -12 }
        }
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/75 px-3.5 py-3 text-white shadow-2xl backdrop-blur-3xl"
      >
        <div className="flex items-center gap-3">
          <motion.div
            layout
            transition={reduceMotion ? { duration: 0 } : SPRING}
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              finalState === "done" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {finalState === "done" ? (
                <motion.span
                  key="done"
                  initial={reduceMotion ? { opacity: 0 } : { scale: 0.2, rotate: -35 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  <Check className="size-5" strokeWidth={2.6} />
                </motion.span>
              ) : (
                <motion.img
                  key="logo"
                  src={logo}
                  alt=""
                  className="size-7 rounded-md object-contain"
                  initial={reduceMotion ? { opacity: 0 } : { scale: 0.4, y: 8 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div layout className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {finalState === "done"
                ? t("taskAlert.doneEyebrow")
                : t(eyebrowKey)}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={finalState ?? "task"}
                layout
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
                className="min-w-0"
              >
                <p className="truncate font-heading text-[15px] font-semibold leading-tight text-white">
                  {payload.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-white/55">
                  {finalState === "done"
                    ? t("taskAlert.doneMessage")
                    : t(payload.messageKey)}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {finalState !== "done" && (
            <motion.div layout className="flex shrink-0 items-center gap-1.5">
              {payload.taskId >= 0 && (
                <button
                  type="button"
                  onClick={() => void markDone()}
                  className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t("taskAlert.markDone")}
                </button>
              )}
              <button
                type="button"
                onClick={() => void openList()}
                className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="inline-flex items-center gap-1">
                  <ListTodo className="size-3" aria-hidden="true" />
                  {t("taskAlert.openList")}
                </span>
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={t("taskAlert.dismiss")}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-white/60"
          style={reduceMotion ? { width: "100%", opacity: 0.35 } : { width: progressWidth }}
        />
      </motion.div>
    </div>
  );
};

initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById("task-alert-root")!).render(
    <React.StrictMode>
      <TaskAlert />
    </React.StrictMode>,
  );
});
