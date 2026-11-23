import { useMemo, useRef } from "react";
import { BAR_OPACITY, layoutBar } from "./timerLayout";
import { useCountdownFrames, useViewportSize } from "./timerStyle";

/**
 * Full-height bar that drains from the top down as the break runs, with a
 * ruler on each side whose marks dim as the level passes them.
 */
export function VerticalBarTimer({
  timeLeft,
  duration,
  running,
}: {
  timeLeft: number;
  duration: number;
  running: boolean;
}) {
  const { width: viewportWidth, height } = useViewportSize();
  const layout = useMemo(
    () => layoutBar(height, Math.min(viewportWidth, height)),
    [viewportWidth, height],
  );
  const fillRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(SVGGElement | null)[]>([]);

  useCountdownFrames(
    timeLeft,
    duration,
    running,
    (elapsed) => {
      const level = elapsed * layout.trackHeight;
      if (fillRef.current) {
        fillRef.current.style.transform = `translateY(${level}px)`;
      }
      // Each mark owns an equal slice of the break, so the first one starts
      // dimming right away and the last finishes as the bar empties.
      const swept = elapsed * layout.ticks.length;
      layout.ticks.forEach((tick, i) => {
        const el = tickRefs.current[i];
        if (!el) return;
        const lit = tick.major ? BAR_OPACITY.major : BAR_OPACITY.minor;
        const t = Math.min(1, Math.max(0, swept - i));
        const opacity = (lit + (BAR_OPACITY.elapsed - lit) * t).toFixed(3);
        if (el.getAttribute("opacity") !== opacity) {
          el.setAttribute("opacity", opacity);
        }
      });
    },
    layout,
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative shrink-0 text-black dark:text-white"
      style={{ width: layout.width, height: layout.trackHeight }}
    >
      <svg
        className="absolute inset-0 overflow-visible"
        width={layout.width}
        height={layout.trackHeight}
      >
        {layout.ticks.map((tick, i) => (
          <g
            key={i}
            ref={(el) => {
              tickRefs.current[i] = el;
            }}
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={tick.major ? 2.5 : 1.75}
            opacity={tick.major ? BAR_OPACITY.major : BAR_OPACITY.minor}
          >
            <line x1={tick.left[0]} x2={tick.left[1]} y1={tick.y} y2={tick.y} />
            <line x1={tick.right[0]} x2={tick.right[1]} y1={tick.y} y2={tick.y} />
          </g>
        ))}
      </svg>
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-full bg-black/15 dark:bg-white/15"
        style={{ width: layout.barWidth }}
      >
        <div
          ref={fillRef}
          className="absolute inset-0 rounded-full bg-black will-change-transform dark:bg-white"
        />
      </div>
    </div>
  );
}
