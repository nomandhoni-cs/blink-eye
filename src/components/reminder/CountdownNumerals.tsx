import { cn } from "../../lib/utils";

/**
 * Countdown digits in SF Pro (condensed, tabular) on macOS, like the iPhone
 * timer. Each digit that changes rolls down and out while the new one drops
 * in, similar to SwiftUI's numeric text transition.
 *
 * `previous` is the value shown one second earlier; slots are matched from
 * the right so `10` → `9` still lines up.
 */
export function CountdownNumerals({
  value,
  previous,
  className,
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
      className={cn("countdown-numerals inline-flex whitespace-pre", className)}
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
              className={cn("inline-block", changed && "countdown-digit-in")}
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}
