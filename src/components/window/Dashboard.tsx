import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import { useAccentColor } from "../../contexts/AccentColorContext";
import DashboardPendingTasks from "../DashboardPendingTasks";
import { IoFlame, IoCheckmarkCircle, IoAlarm } from "react-icons/io5";

type BreakStats = {
  breakStreak: number;
  bestBreakStreak: number;
  snoozesToday: number;
  snoozesSession: number;
  snoozesAllowedPerDay: number;
  snoozesAllowedPerSession: number;
  totalBreaksCompleted: number;
};

function formatLimit(used: number, limit: number) {
  if (limit === 0) return `${used} used · unlimited`;
  return `${used} / ${limit}`;
}

const Dashboard = () => {
  const usageTimeLimit = 8;
  const { timeCount } = useTimeCountContext();
  const { accentHex } = useAccentColor();
  const [stats, setStats] = useState<BreakStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await invoke<BreakStats>("get_break_stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to load break stats:", error);
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const totalHours = timeCount.hours + timeCount.minutes / 60;
  const percentage = (totalHours / 24) * 100;
  const isOverLimit = totalHours > usageTimeLimit;

  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

  return (
    <div className="p-2 space-y-4 flex flex-col h-full relative">
      <div className="flex justify-between items-center space-x-8 mt-6 mb-6">
        <div>
          <h1 className="text-5xl font-heading font-semibold tracking-wider text-foreground">
            {currentDate.toLocaleString("en-US", { weekday: "long" })}
          </h1>
          <p className="text-xl text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="86"
              className="stroke-muted stroke-[20px] fill-none"
              strokeLinecap="round"
            />
            <circle
              cx="96"
              cy="96"
              r="86"
              className={`stroke-[20px] fill-none transition-all duration-500 ease-in-out ${
                isOverLimit ? "stroke-destructive" : "stroke-primary"
              }`}
              strokeDasharray={`${(percentage * 540.4) / 100} 540.4`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-heading tracking-wide">{`${timeCount.hours}h ${timeCount.minutes}m`}</span>
            <span className="text-sm text-muted-foreground">Usage Time</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <IoFlame className="size-4" style={{ color: accentHex }} />
              Break streak
            </div>
            <p className="text-3xl font-heading font-semibold">
              {stats.breakStreak}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Best: {stats.bestBreakStreak} · {stats.totalBreaksCompleted} breaks
              taken
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <IoCheckmarkCircle className="size-4" style={{ color: accentHex }} />
              Full breaks
            </div>
            <p className="text-3xl font-heading font-semibold">
              {stats.totalBreaksCompleted}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Finished without skipping
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <IoAlarm className="size-4" style={{ color: accentHex }} />
              Snoozes
            </div>
            <p className="text-lg font-medium leading-tight">
              Today: {formatLimit(stats.snoozesToday, stats.snoozesAllowedPerDay)}
            </p>
            <p className="mt-1 text-lg font-medium leading-tight">
              Session:{" "}
              {formatLimit(stats.snoozesSession, stats.snoozesAllowedPerSession)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 pb-4">
        <DashboardPendingTasks />
      </div>
    </div>
  );
};

export default Dashboard;
