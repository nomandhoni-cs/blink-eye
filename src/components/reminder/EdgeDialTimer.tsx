import { useMemo, useRef } from "react";
import { DIAL_OPACITY, layoutDial } from "./timerLayout";
import { useCountdownFrames, useViewportSize } from "./timerStyle";

/**
 * Full-screen dial: ticks around the display edge dim one by one, clockwise
 * from 12 o'clock, as the break runs down.
 */
export function EdgeDialTimer({
  timeLeft,
  duration,
  running,
}: {
  timeLeft: number;
  duration: number;
  running: boolean;
}) {
  const { width, height } = useViewportSize();
  const { ticks, strokeWidth } = useMemo(
    () => layoutDial(width, height),
    [width, height],
  );
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);

  useCountdownFrames(
    timeLeft,
    duration,
    running,
    (elapsed) => {
      const swept = elapsed * ticks.length;
      ticks.forEach((_, i) => {
        const el = tickRefs.current[i];
        if (!el) return;
        const t = Math.min(1, Math.max(0, swept - i));
        const opacity = (
          DIAL_OPACITY.remaining +
          (DIAL_OPACITY.elapsed - DIAL_OPACITY.remaining) * t
        ).toFixed(3);
        if (el.getAttribute("opacity") !== opacity) {
          el.setAttribute("opacity", opacity);
        }
      });
    },
    ticks,
  );

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-black dark:text-white"
      viewBox={`0 0 ${width} ${height}`}
    >
      {ticks.map((tick, i) => (
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
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={DIAL_OPACITY.remaining}
        />
      ))}
    </svg>
  );
}
