import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  BAR_OPACITY,
  DIAL_OPACITY,
  layoutBar,
  layoutDial,
} from "../reminder/timerLayout";
import { formatClock, type TimerStyle } from "../reminder/timerStyle";

interface TimerStyleScreenProps {
  timerStyle: TimerStyle;
  setTimerStyle: (style: TimerStyle) => void;
}

const OPTIONS: { value: TimerStyle; label: string; description: string }[] = [
  { value: "circle", label: "Circle", description: "A ring that winds down around the time" },
  { value: "bar", label: "Bar", description: "Big seconds over a slim progress bar" },
  { value: "dial", label: "Dial", description: "Ticks around the screen edge, like a watch face" },
  { value: "vertical", label: "Vertical", description: "A full-height bar that drains top to bottom" },
];

/** Previews draw on a 16:10 "screen", in the same units as the real break window. */
const W = 1600;
const H = 1000;
const LOOP_SECONDS = 20;
const DIAL = layoutDial(W, H);
const BAR = layoutBar(H, H);
/** Thumbnails are ~1/6 scale; thicken hairlines so they still read. */
const THUMB_STROKE = 1.8;
const THUMB_BAR_WIDTH = BAR.barWidth * THUMB_STROKE;

/** Elapsed fraction of a looping 20s break; frozen when motion is reduced. */
function useLoopingBreak() {
  const [elapsed, setElapsed] = useState(0.3);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      // ~30fps is plenty for thumbnails.
      if (now - last > 33) {
        last = now;
        setElapsed(((now - start) / 1000 / LOOP_SECONDS) % 1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return elapsed;
}

/** Faint placeholder lines standing in for the break message. */
function MessageLines({ x, y, anchor }: { x: number; y: number; anchor: "middle" | "start" }) {
  const widths = [560, 380];
  return (
    <g fill="currentColor" opacity={0.3}>
      {widths.map((w, i) => (
        <rect
          key={i}
          x={anchor === "middle" ? x - w / 2 : x}
          y={y + i * 64}
          width={w}
          height={34}
          rx={17}
        />
      ))}
    </g>
  );
}

function Digits({ x, y, size, anchor = "middle", children }: {
  x: number;
  y: number;
  size: number;
  anchor?: "middle" | "end";
  children: string;
}) {
  // `y` is the visual middle of the digits; SF/Outfit caps sit ~0.72em tall.
  return (
    <text
      x={x}
      y={y + size * 0.36}
      fontSize={size}
      textAnchor={anchor}
      fill="currentColor"
      className="countdown-numerals"
    >
      {children}
    </text>
  );
}

function Preview({ style, elapsed }: { style: TimerStyle; elapsed: number }) {
  const secondsLeft = Math.ceil(LOOP_SECONDS * (1 - elapsed));
  const seconds = String(secondsLeft).padStart(2, "0");
  const clock = formatClock(secondsLeft);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden="true">
      {style === "circle" && (
        <>
          <circle cx={800} cy={380} r={200} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={36} />
          <circle
            cx={800}
            cy={380}
            r={200}
            fill="none"
            stroke="currentColor"
            strokeWidth={36}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 200}
            strokeDashoffset={2 * Math.PI * 200 * elapsed}
            transform="rotate(-90 800 380)"
          />
          <Digits x={800} y={380} size={200}>{seconds}</Digits>
          <MessageLines x={800} y={680} anchor="middle" />
        </>
      )}

      {style === "bar" && (
        <>
          <Digits x={800} y={330} size={300}>{seconds}</Digits>
          <rect x={560} y={520} width={480} height={22} rx={11} fill="currentColor" opacity={0.12} />
          <rect x={560} y={520} width={480 * (1 - elapsed)} height={22} rx={11} className="fill-primary" />
          <MessageLines x={800} y={640} anchor="middle" />
        </>
      )}

      {style === "dial" && (
        <>
          {DIAL.ticks.map((tick, i) => {
            const t = Math.min(1, Math.max(0, elapsed * DIAL.ticks.length - i));
            return (
              <line
                key={i}
                {...tick}
                stroke="currentColor"
                strokeWidth={DIAL.strokeWidth * THUMB_STROKE}
                strokeLinecap="round"
                opacity={DIAL_OPACITY.remaining + (DIAL_OPACITY.elapsed - DIAL_OPACITY.remaining) * t}
              />
            );
          })}
          <Digits x={800} y={400} size={380}>{clock}</Digits>
          <MessageLines x={800} y={680} anchor="middle" />
        </>
      )}

      {style === "vertical" && (
        <g>
          <g transform={`translate(${800 - BAR.width / 2} ${(H - BAR.trackHeight) / 2})`}>
            {BAR.ticks.map((tick, i) => {
              const lit = tick.major ? BAR_OPACITY.major : BAR_OPACITY.minor;
              const t = Math.min(1, Math.max(0, elapsed * BAR.ticks.length - i));
              return (
                <g
                  key={i}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={(tick.major ? 4 : 3) * THUMB_STROKE}
                  opacity={lit + (BAR_OPACITY.elapsed - lit) * t}
                >
                  <line x1={tick.left[0]} x2={tick.left[1]} y1={tick.y} y2={tick.y} />
                  <line x1={tick.right[0]} x2={tick.right[1]} y1={tick.y} y2={tick.y} />
                </g>
              );
            })}
            <rect
              x={(BAR.width - THUMB_BAR_WIDTH) / 2}
              width={THUMB_BAR_WIDTH}
              height={BAR.trackHeight}
              rx={THUMB_BAR_WIDTH / 2}
              fill="currentColor"
              opacity={0.15}
            />
            <rect
              x={(BAR.width - THUMB_BAR_WIDTH) / 2}
              y={BAR.trackHeight * elapsed}
              width={THUMB_BAR_WIDTH}
              height={BAR.trackHeight * (1 - elapsed)}
              rx={THUMB_BAR_WIDTH / 2}
              fill="currentColor"
            />
          </g>
          <Digits x={660} y={500} size={300} anchor="end">{clock}</Digits>
          <MessageLines x={940} y={440} anchor="start" />
        </g>
      )}
    </svg>
  );
}

export default function TimerStyleScreen({
  timerStyle,
  setTimerStyle,
}: TimerStyleScreenProps) {
  const elapsed = useLoopingBreak();

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Choose Your Break Clock
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This is the countdown you'll see on every break. You can change it
          anytime in Reminder settings.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Timer style"
        className="grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4"
      >
        {OPTIONS.map((option) => {
          const selected = option.value === timerStyle;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTimerStyle(option.value)}
              className={cn(
                "group relative rounded-2xl border bg-card p-2 text-left outline-none transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary shadow-lg ring-2 ring-primary"
                  : "border-border",
              )}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-xl bg-zinc-950 text-white">
                <Preview style={option.value} elapsed={elapsed} />
              </div>
              <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-2.5">
                <div>
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
