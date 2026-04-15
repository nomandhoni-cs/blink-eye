// src/components/screens/break-config-screen.tsx
import { useRef, useEffect } from "react";
import { RiTimerFill, RiAlarmFill, RiMessage2Fill } from "react-icons/ri";
import { Input } from "../ui/input";

interface BreakConfigScreenProps {
  breakInterval: number;
  setBreakInterval: (value: number) => void;
  breakDuration: number;
  setBreakDuration: (value: number) => void;
  reminderText: string;
  setReminderText: (value: string) => void;
}

const INTERVAL_OPTIONS = [20, 30, 40];
const DURATION_OPTIONS = [20, 30, 40];

export default function BreakConfigScreen({
  breakInterval,
  setBreakInterval,
  breakDuration,
  setBreakDuration,
  reminderText,
  setReminderText,
}: BreakConfigScreenProps) {
  const customIntervalRef = useRef<HTMLInputElement>(null);
  const customDurationRef = useRef<HTMLInputElement>(null);

  const isCustomInterval = !INTERVAL_OPTIONS.includes(breakInterval);
  const isCustomDuration = !DURATION_OPTIONS.includes(breakDuration);

  useEffect(() => {
    if (isCustomInterval && customIntervalRef.current) {
      customIntervalRef.current.value = breakInterval.toString();
    }
  }, [breakInterval, isCustomInterval]);

  useEffect(() => {
    if (isCustomDuration && customDurationRef.current) {
      customDurationRef.current.value = breakDuration.toString();
    }
  }, [breakDuration, isCustomDuration]);

  const handleCustomInterval = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setBreakInterval(n);
  };

  const handleCustomDuration = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setBreakDuration(n);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-2">
      <div className="w-full max-w-2xl space-y-4">
        {/* ── Page Header ── */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-heading">
            Configure Your Breaks
          </h2>
          <p className="text-xs text-foreground/50 leading-relaxed">
            The 20-20-20 rule: every{" "}
            <span className="text-primary font-semibold">20 minutes</span>, look
            at something{" "}
            <span className="text-primary font-semibold">20 feet away</span> for{" "}
            <span className="text-primary font-semibold">20 seconds</span>.
          </p>
        </div>

        {/* ── Interval + Duration side by side ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── Break Interval ── */}
          <Section
            icon={<RiTimerFill className="w-4 h-4 text-primary" />}
            title="Break Interval"
            subtitle="How often to remind you?"
          >
            <div className="grid grid-cols-2 gap-2">
              {INTERVAL_OPTIONS.map((min) => {
                const selected = breakInterval === min && !isCustomInterval;
                return (
                  <OptionPill
                    key={min}
                    selected={selected}
                    onClick={() => {
                      setBreakInterval(min);
                      if (customIntervalRef.current)
                        customIntervalRef.current.value = "";
                    }}
                  >
                    <span className="text-lg font-bold">{min}</span>
                    <span className="text-[10px] text-foreground/50">min</span>
                  </OptionPill>
                );
              })}

              {/* Custom pill */}
              <OptionPill
                selected={isCustomInterval}
                onClick={() => customIntervalRef.current?.focus()}
                isInput
              >
                <input
                  ref={customIntervalRef}
                  type="number"
                  min={1}
                  placeholder="Own"
                  defaultValue={isCustomInterval ? breakInterval : ""}
                  onChange={(e) => handleCustomInterval(e.target.value)}
                  className="w-full text-center bg-transparent text-base font-bold placeholder:text-foreground/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-foreground/50">min</span>
              </OptionPill>
            </div>

            {/* live preview */}
            <p className="text-[11px] text-center text-foreground/40 mt-1">
              Remind every{" "}
              <span className="text-primary font-semibold">
                {breakInterval} min
              </span>
            </p>
          </Section>

          {/* ── Break Duration ── */}
          <Section
            icon={<RiAlarmFill className="w-4 h-4 text-primary" />}
            title="Break Duration"
            subtitle="How long each break lasts?"
          >
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((sec) => {
                const selected = breakDuration === sec && !isCustomDuration;
                return (
                  <OptionPill
                    key={sec}
                    selected={selected}
                    onClick={() => {
                      setBreakDuration(sec);
                      if (customDurationRef.current)
                        customDurationRef.current.value = "";
                    }}
                  >
                    <span className="text-lg font-bold">{sec}</span>
                    <span className="text-[10px] text-foreground/50">sec</span>
                  </OptionPill>
                );
              })}

              {/* Custom pill */}
              <OptionPill
                selected={isCustomDuration}
                onClick={() => customDurationRef.current?.focus()}
                isInput
              >
                <input
                  ref={customDurationRef}
                  type="number"
                  min={1}
                  placeholder="Own"
                  defaultValue={isCustomDuration ? breakDuration : ""}
                  onChange={(e) => handleCustomDuration(e.target.value)}
                  className="w-full text-center bg-transparent text-base font-bold placeholder:text-foreground/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-foreground/50">sec</span>
              </OptionPill>
            </div>

            {/* live preview */}
            <p className="text-[11px] text-center text-foreground/40 mt-1">
              Each break lasts{" "}
              <span className="text-primary font-semibold">
                {breakDuration} sec
              </span>
            </p>
          </Section>
        </div>

        {/* ── Reminder Message — full width ── */}
        <Section
          icon={<RiMessage2Fill className="w-4 h-4 text-primary" />}
          title="Reminder Message"
          subtitle="What should Blink Eye say during your break?"
        >
          <Input
            placeholder="Pause! Look into the distance, and best if you walk a bit."
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
            className="w-full text-sm text-center bg-foreground/5 border-foreground/10 placeholder:text-foreground/30 focus:border-primary/50 focus:ring-primary/20"
          />
          <p className="text-[11px] text-center text-foreground/40 mt-1">
            This message appears on screen during every break overlay.
          </p>
        </Section>

        {/* ── Summary bar ── */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
            <RiTimerFill className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Every {breakInterval} min
            </span>
          </div>
          <div className="text-foreground/30 text-xs">→</div>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
            <RiAlarmFill className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {breakDuration} sec break
            </span>
          </div>
          <div className="text-foreground/30 text-xs">→</div>
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-1.5">
            <RiMessage2Fill className="w-3 h-3 text-foreground/50" />
            <span className="text-xs text-foreground/50 max-w-[160px] truncate">
              {reminderText || "No message set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable Section wrapper ──────────────────────────────────────────────────
function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-5">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/15">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold font-heading leading-none">{title}</p>
          <p className="text-[11px] text-foreground/45 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Selectable option pill ────────────────────────────────────────────────────
function OptionPill({
  selected,
  onClick,
  children,
  isInput = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isInput?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center rounded-xl py-3 px-2 border transition-all duration-150",
        isInput ? "cursor-text" : "cursor-pointer",
        selected
          ? "bg-primary/15 border-primary/50 shadow-sm shadow-primary/10 text-primary"
          : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
