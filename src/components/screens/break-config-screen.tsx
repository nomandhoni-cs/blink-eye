import { useRef, useEffect } from "react";
import { Clock, Timer } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

interface BreakConfigScreenProps {
  breakInterval: number;
  setBreakInterval: (value: number) => void;
  breakDuration: number;
  setBreakDuration: (value: number) => void;
  reminderText: string;
  setReminderText: (value: string) => void;
}

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

  // Reusable classes for cards to keep the code DRY
  const cardBaseClasses =
    "cursor-pointer transition-all backdrop-blur-md border rounded-xl shadow-lg";
  const cardDefaultClasses =
    "bg-gray-500/5 dark:bg-white/10 border-gray-500/10 dark:border-white/20 hover:bg-gray-500/10 dark:hover:bg-white/20";
  const cardSelectedClasses =
    "bg-green-500/20 dark:bg-green-500/30 border-green-500/50 dark:border-green-400/80";

  // Handle custom interval input
  const handleCustomIntervalChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setBreakInterval(numValue);
    } else if (value === "") {
      // Keep the input empty but don't update breakInterval
      customIntervalRef.current!.value = "";
    }
  };

  // Handle custom duration input
  const handleCustomDurationChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setBreakDuration(numValue);
    } else if (value === "") {
      // Keep the input empty but don't update breakDuration
      customDurationRef.current!.value = "";
    }
  };

  // Check if current values match predefined options
  const isCustomInterval = ![20, 30, 40].includes(breakInterval);
  const isCustomDuration = ![20, 30, 40].includes(breakDuration);

  // Update custom input fields when breakInterval/breakDuration change
  useEffect(() => {
    if (isCustomInterval && customIntervalRef.current) {
      customIntervalRef.current.value = breakInterval.toString();
    }
    if (isCustomDuration && customDurationRef.current) {
      customDurationRef.current.value = breakDuration.toString();
    }
  }, [breakInterval, breakDuration, isCustomInterval, isCustomDuration]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-2xl p-6 space-y-8 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl backdrop-blur-xl">
        {/* Break Interval Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading text-gray-800 dark:text-white/90">
            Break Interval
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[20, 30, 40].map((minutes) => (
              <Card
                key={minutes}
                className={`${cardBaseClasses} ${
                  breakInterval === minutes && !isCustomInterval
                    ? cardSelectedClasses
                    : cardDefaultClasses
                }`}
                onClick={() => setBreakInterval(minutes)}
              >
                <CardContent className="flex items-center justify-center gap-2 p-3">
                  <Clock
                    className={`w-5 h-5 ${
                      breakInterval === minutes && !isCustomInterval
                        ? "text-green-600 dark:text-green-300"
                        : "text-gray-500 dark:text-white/70"
                    }`}
                  />
                  <span className="font-bold text-gray-900 dark:text-white/90">
                    {minutes}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/70">
                    min
                  </span>
                </CardContent>
              </Card>
            ))}
            <Card
              className={`${cardBaseClasses} cursor-text ${
                isCustomInterval ? cardSelectedClasses : cardDefaultClasses
              }`}
              onClick={() => customIntervalRef.current?.focus()}
            >
              <CardContent className="flex items-center justify-center gap-2 p-3">
                <Input
                  ref={customIntervalRef}
                  placeholder="Custom"
                  defaultValue={isCustomInterval ? breakInterval : ""}
                  onChange={(e) => handleCustomIntervalChange(e.target.value)}
                  className="w-full h-full p-0 text-lg font-bold text-center text-gray-900 bg-transparent border-0 rounded-none dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 dark:placeholder:text-white/50"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Break Duration Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading text-gray-800 dark:text-white/90">
            Break Duration
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[20, 30, 40].map((seconds) => (
              <Card
                key={seconds}
                className={`${cardBaseClasses} ${
                  breakDuration === seconds && !isCustomDuration
                    ? cardSelectedClasses
                    : cardDefaultClasses
                }`}
                onClick={() => setBreakDuration(seconds)}
              >
                <CardContent className="flex items-center justify-center gap-2 p-3">
                  <Timer
                    className={`w-5 h-5 ${
                      breakDuration === seconds && !isCustomDuration
                        ? "text-green-600 dark:text-green-300"
                        : "text-gray-500 dark:text-white/70"
                    }`}
                  />
                  <span className="font-bold text-gray-900 dark:text-white/90">
                    {seconds}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/70">
                    sec
                  </span>
                </CardContent>
              </Card>
            ))}
            <Card
              className={`${cardBaseClasses} cursor-text ${
                isCustomDuration ? cardSelectedClasses : cardDefaultClasses
              }`}
              onClick={() => customDurationRef.current?.focus()}
            >
              <CardContent className="flex items-center justify-center gap-2 p-3">
                <Input
                  ref={customDurationRef}
                  placeholder="Custom"
                  defaultValue={isCustomDuration ? breakDuration : ""}
                  onChange={(e) => handleCustomDurationChange(e.target.value)}
                  className="w-full h-full p-0 text-lg font-bold text-center text-gray-900 bg-transparent border-0 rounded-none dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 dark:placeholder:text-white/50"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reminder Text Configuration */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading text-gray-800 dark:text-white/90">
            Reminder Message
          </h3>
          <div className="max-w-full">
            <Input
              placeholder="Time for a break! Look away and rest your eyes."
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="w-full px-4 py-2 text-sm transition-all border rounded-lg shadow-lg text-gray-900 dark:text-white bg-gray-500/5 dark:bg-white/10 border-gray-500/10 dark:border-white/20 placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-green-500/70 dark:focus:border-green-400/80 focus:ring-green-500/30"
            />
            <p className="mt-2 text-xs text-center text-gray-500 dark:text-white/60">
              This message will be displayed during break reminders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
