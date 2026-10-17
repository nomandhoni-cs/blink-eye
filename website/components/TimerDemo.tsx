"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsRight, Maximize, RefreshCw } from "lucide-react";
import GradientBackground from "./GradientBackground";

const BREAK_SECONDS = 20;
/** Tick opacity for time still to go vs. time already spent. */
const REMAINING_OPACITY = 0.92;
const ELAPSED_OPACITY = 0.2;

type Tick = { x1: number; y1: number; x2: number; y2: number };

/**
 * Same dial as the app's break screen: ticks laid evenly along a rounded
 * rectangle inset from the edge, clockwise from 12 o'clock, each pointing
 * at the center like a watch face.
 */
function layoutDial(width: number, height: number) {
  const vmin = Math.min(width, height);
  const inset = vmin * 0.035;
  const strokeWidth = Math.max(2, vmin * 0.0055);
  // Round caps add half a stroke at each end; keep the visible length steady.
  const length = vmin * 0.028 - strokeWidth;
  const spacing = vmin * 0.034;

  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const w = x1 - x0;
  const h = y1 - y0;
  const r = Math.min(vmin * 0.075, w / 2, h / 2);
  const cx = width / 2;
  const cy = height / 2;
  const quarterArc = (Math.PI * r) / 2;

  const segments: (
    | { kind: "line"; len: number; from: [number, number]; dir: [number, number] }
    | { kind: "arc"; len: number; center: [number, number]; start: number }
  )[] = [
    { kind: "line", len: w / 2 - r, from: [cx, y0], dir: [1, 0] },
    { kind: "arc", len: quarterArc, center: [x1 - r, y0 + r], start: -Math.PI / 2 },
    { kind: "line", len: h - 2 * r, from: [x1, y0 + r], dir: [0, 1] },
    { kind: "arc", len: quarterArc, center: [x1 - r, y1 - r], start: 0 },
    { kind: "line", len: w - 2 * r, from: [x1 - r, y1], dir: [-1, 0] },
    { kind: "arc", len: quarterArc, center: [x0 + r, y1 - r], start: Math.PI / 2 },
    { kind: "line", len: h - 2 * r, from: [x0, y1 - r], dir: [0, -1] },
    { kind: "arc", len: quarterArc, center: [x0 + r, y0 + r], start: Math.PI },
    { kind: "line", len: w / 2 - r, from: [x0 + r, y0], dir: [1, 0] },
  ];
  const perimeter = segments.reduce((sum, seg) => sum + seg.len, 0);

  const pointAt = (distance: number): [number, number] => {
    let s = distance;
    for (const seg of segments) {
      if (s <= seg.len || seg === segments[segments.length - 1]) {
        if (seg.kind === "line") {
          return [seg.from[0] + seg.dir[0] * s, seg.from[1] + seg.dir[1] * s];
        }
        const angle = seg.start + s / r;
        return [seg.center[0] + r * Math.cos(angle), seg.center[1] + r * Math.sin(angle)];
      }
      s -= seg.len;
    }
    return [cx, y0];
  };

  // A multiple of four puts ticks exactly at 12, 3, 6 and 9 o'clock.
  const count = Math.max(8, Math.round(perimeter / spacing / 4) * 4);
  const ticks: Tick[] = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = pointAt((i * perimeter) / count);
    const dx = cx - x;
    const dy = cy - y;
    const d = Math.hypot(dx, dy) || 1;
    ticks.push({ x1: x, y1: y, x2: x + (dx / d) * length, y2: y + (dy / d) * length });
  }

  return { ticks, strokeWidth };
}

/** Dims ticks clockwise from 12 o'clock as `elapsed` goes 0 → 1. */
function paintTicks(ticks: (SVGLineElement | null)[], elapsed: number) {
  const swept = elapsed * ticks.length;
  ticks.forEach((el, i) => {
    if (!el) return;
    const t = Math.min(1, Math.max(0, swept - i));
    const opacity = (
      REMAINING_OPACITY +
      (ELAPSED_OPACITY - REMAINING_OPACITY) * t
    ).toFixed(3);
    if (el.getAttribute("opacity") !== opacity) {
      el.setAttribute("opacity", opacity);
    }
  });
}

/** `75` → `"1:15"`, like Apple's timers. */
function formatClock(totalSeconds: number) {
  const secs = Math.max(0, totalSeconds);
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

export default function TimerDemo() {
  const [timeLeft, setTimeLeft] = useState(BREAK_SECONDS);
  const [timeCount, setTimeCount] = useState(0);
  const [isBreakComplete, setIsBreakComplete] = useState(false);
  const [runId, setRunId] = useState(0);
  const [fullScreenProgress, setFullScreenProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const elapsedRef = useRef(0);
  const reminderText =
    "Pause! Look into the distance, and best if you walk a bit.";

  const dial = useMemo(
    () => (size.width > 0 ? layoutDial(size.width, size.height) : null),
    [size.width, size.height],
  );

  // Track the card's size so the dial hugs its edge at every breakpoint.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Repaint after the ticks are rebuilt (resize, fullscreen).
  useEffect(() => {
    tickRefs.current.length = dial?.ticks.length ?? 0;
    paintTicks(tickRefs.current, elapsedRef.current);
  }, [dial]);

  // The break: one animation-frame loop drives the sweep and the digits.
  useEffect(() => {
    if (isBreakComplete) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / (BREAK_SECONDS * 1000));
      elapsedRef.current = elapsed;
      paintTicks(tickRefs.current, elapsed);
      setTimeLeft(Math.ceil(BREAK_SECONDS * (1 - elapsed)));
      if (elapsed >= 1) {
        setIsBreakComplete(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [runId, isBreakComplete]);

  useEffect(() => {
    const screenTimeCounter = setInterval(() => {
      setTimeCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(screenTimeCounter);
  }, []);

  // Scroll-based animation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const visibleHeight =
        Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const sectionHeight = rect.height;

      let progress = visibleHeight / sectionHeight;
      progress = Math.max(0, Math.min(1, progress * 1.5));

      setFullScreenProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Full screen functionality
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(
        document.fullscreenElement !== null ||
          // @ts-ignore
          document.webkitFullscreenElement !== null ||
          // @ts-ignore
          document.mozFullScreenElement !== null ||
          // @ts-ignore
          document.msFullscreenElement !== null,
      );
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange,
      );
    };
  }, []);

  const closeWindow = () => {
    setTimeLeft(0);
    setIsBreakComplete(true);
    elapsedRef.current = 1;
    paintTicks(tickRefs.current, 1);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const resetTimer = () => {
    setTimeLeft(BREAK_SECONDS);
    setIsBreakComplete(false);
    elapsedRef.current = 0;
    paintTicks(tickRefs.current, 0);
    setRunId((id) => id + 1);
  };

  const containerStyle = {
    transform: `scale(${1 + fullScreenProgress * 0.03})`,
    transition: "transform 0.3s ease-out",
  };

  const clock = formatClock(timeLeft);
  const lastSecond =
    timeLeft < BREAK_SECONDS ? formatClock(timeLeft + 1) : undefined;

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-6xl mx-auto py-8 px-3 sm:px-4 md:py-16 flex justify-center items-center relative z-10"
    >
      <div className="w-full relative">
        {/*
          Responsive aspect ratios:
          - Mobile portrait: 9/14 (tall, phone-like)
          - Small tablet / landscape mobile: 3/4
          - Tablet landscape: 4/3
          - Desktop: 16/9
          Sized as a container so the dial and digits scale with the card.
        */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[9/14] sm:aspect-[3/4] md:aspect-[4/3] lg:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-background [container-type:size]"
          style={isFullScreen ? undefined : containerStyle}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <GradientBackground
              position="top"
              fromColor="#FF4C55"
              toColor="#9089fc"
            />
          </div>

          {/* Dial around the edge */}
          {dial && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 h-full w-full text-foreground"
              viewBox={`0 0 ${size.width} ${size.height}`}
            >
              {dial.ticks.map((tick, i) => (
                <line
                  key={i}
                  ref={(el) => {
                    tickRefs.current[i] = el;
                  }}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="currentColor"
                  strokeWidth={dial.strokeWidth}
                  strokeLinecap="round"
                  opacity={REMAINING_OPACITY}
                />
              ))}
            </svg>
          )}

          {/* Content, kept inside the dial */}
          <div className="relative z-10 flex h-full w-full items-center justify-center p-[11cqmin]">
            <div className="flex w-full max-w-3xl flex-col items-center justify-center">
              {isBreakComplete ? (
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading text-center px-2 animate-in fade-in zoom-in duration-500">
                  Congrats, You took the break!
                </div>
              ) : (
                <>
                  <CountdownNumerals
                    value={clock}
                    previous={lastSecond}
                    className="mb-[4cqmin] text-[30cqmin] leading-[0.8]"
                  />

                  {/* Reminder text */}
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-heading text-center mb-4 sm:mb-5 md:mb-6 px-2 sm:px-4 leading-snug max-w-xl lg:max-w-2xl text-balance">
                    {reminderText}
                  </div>

                  {/* Time info — stacks vertically on mobile */}
                  <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 mb-5 sm:mb-6 md:mb-8 space-y-1.5 sm:space-y-0 text-xs sm:text-sm md:text-base">
                    <CurrentTime />
                    <div className="hidden sm:block w-px h-5 bg-foreground/20 rounded-full" />
                    <ScreenOnTime timeCount={timeCount} />
                  </div>

                  {/* Skip button */}
                  <Button
                    onClick={closeWindow}
                    variant="outline"
                    className="opacity-90 backdrop-blur-2xl rounded-full shadow-xl transition-colors border-white/20 hover:bg-white/10 dark:hover:bg-white/20 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-5"
                  >
                    <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm md:text-base">
                      Skip this time
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Control buttons — bottom-right, inside the dial */}
          <div className="absolute bottom-[9cqmin] right-[9cqmin] z-20 flex space-x-2 md:space-x-3">
            <Button
              onClick={resetTimer}
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg border-white/20 hover:bg-white/10 backdrop-blur-md h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
              title="Reset timer"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              onClick={toggleFullScreen}
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg border-white/20 hover:bg-white/10 backdrop-blur-md h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
              title={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Bottom gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden rotate-180 pointer-events-none">
            <GradientBackground
              position="bottom"
              fromColor="#FF4C55"
              toColor="#9089fc"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Countdown digits in SF Pro (condensed) on Apple devices, Inter elsewhere.
 * Each digit that changes rolls down and out while the new one drops in.
 */
function CountdownNumerals({
  value,
  previous,
  className = "",
}: {
  value: string;
  previous?: string;
  className?: string;
}) {
  const offset = previous ? value.length - previous.length : 0;

  return (
    <span
      role="timer"
      aria-live="off"
      className={`countdown-numerals inline-flex whitespace-pre ${className}`}
    >
      {Array.from(value).map((char, i) => {
        const before = previous?.[i - offset];
        const changed = before !== undefined && before !== char;
        return (
          <span key={i} className="relative inline-block">
            {changed && (
              <span
                key={`out-${value}`}
                aria-hidden="true"
                className="countdown-digit-out absolute inset-0"
              >
                {before}
              </span>
            )}
            <span
              key={`in-${value}`}
              className={`inline-block ${changed ? "countdown-digit-in" : ""}`}
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-medium text-muted-foreground whitespace-nowrap">
      Current Time: <span className="text-foreground">{time}</span>
    </div>
  );
}

function ScreenOnTime({ timeCount }: { timeCount: number }) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="font-medium text-muted-foreground whitespace-nowrap">
      Screen on Time:{" "}
      <span className="text-foreground">{formatTime(timeCount)}</span>
    </div>
  );
}
