import { cn } from "../lib/utils";
import type { TimerStyle } from "./reminder/timerStyle";

const OPTIONS: { value: TimerStyle; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "bar", label: "Bar" },
  { value: "dial", label: "Dial" },
  { value: "vertical", label: "Vertical" },
];

/** Ticks around a 64×40 screen, pointing at its center. */
const DIAL_TICKS = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // Push each ray out to the 56×32 inner rectangle's edge.
  const t = Math.min(28 / Math.abs(dx || 1e-6), 16 / Math.abs(dy || 1e-6));
  const x = 32 + dx * t;
  const y = 20 + dy * t;
  return { x1: x, y1: y, x2: x - dx * 3, y2: y - dy * 3, dim: i < 9 };
});

function Thumbnail({ style }: { style: TimerStyle }) {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden="true">
      {style === "circle" && (
        <>
          <circle cx="32" cy="20" r="12" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
          <path d="M32 8 A12 12 0 1 1 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {style === "bar" && (
        <>
          <rect x="22" y="9" width="20" height="12" rx="2" fill="currentColor" opacity="0.85" />
          <rect x="16" y="27" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="16" y="27" width="20" height="3" rx="1.5" fill="currentColor" />
        </>
      )}
      {style === "dial" && (
        <>
          {DIAL_TICKS.map(({ dim, ...line }, i) => (
            <line
              key={i}
              {...line}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={dim ? 0.25 : 1}
            />
          ))}
          <rect x="24" y="14" width="16" height="12" rx="2" fill="currentColor" opacity="0.85" />
        </>
      )}
      {style === "vertical" && (
        <>
          <rect x="30.5" y="4" width="3" height="32" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="30.5" y="14" width="3" height="22" rx="1.5" fill="currentColor" />
          <rect x="12" y="14" width="13" height="12" rx="2" fill="currentColor" opacity="0.85" />
          <rect x="39" y="15" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.6" />
          <rect x="39" y="20" width="10" height="2.5" rx="1.25" fill="currentColor" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/** Visual picker for the break countdown style. */
export function TimerStylePicker({
  value,
  onChange,
  accentColor,
  disabled,
}: {
  value: TimerStyle;
  onChange: (style: TimerStyle) => void;
  accentColor: string;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Timer style" className="flex flex-wrap justify-end gap-2">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border bg-background/50 px-2.5 pb-1.5 pt-2 text-xs font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              selected
                ? "border-transparent text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
            style={
              selected
                ? { boxShadow: `0 0 0 2px ${accentColor}` }
                : undefined
            }
          >
            <Thumbnail style={option.value} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
