import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import { useAccentColor } from "../../contexts/AccentColorContext";
import DashboardPendingTasks from "../DashboardPendingTasks";
import DashboardWeeklyReport from "../dashboard/DashboardWeeklyReport";
import { DashboardStatCard } from "../dashboard/DashboardStatCard";
import {
  dashboardBlockClassName,
  DashboardIconBadge,
} from "../dashboard/dashboardBlock";
import {
  IoFlame,
  IoCheckmarkCircle,
  IoAlarm,
  IoTimer,
  IoTime,
} from "react-icons/io5";

type BreakStats = {
  breakStreak: number;
  bestBreakStreak: number;
  snoozesToday: number;
  snoozesSession: number;
  snoozesAllowedPerDay: number;
  snoozesAllowedPerSession: number;
  totalBreaksCompleted: number;
};

type NextReminderInfo = {
  nextReminderInSecs: number;
  isOnBreak: boolean;
};

function formatLimit(used: number, limit: number) {
  if (limit === 0) return `${used} · unlimited`;
  return `${used} / ${limit}`;
}

function formatCountdown(info: NextReminderInfo | null) {
  if (!info) return "—";
  if (info.isOnBreak) return "On break";
  if (info.nextReminderInSecs <= 0) return "Soon";

  const mins = Math.floor(info.nextReminderInSecs / 60);
  const secs = info.nextReminderInSecs % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

const Dashboard = () => {
  const usageTimeLimit = 8;
  const { timeCount } = useTimeCountContext();
  const { accentHex } = useAccentColor();
  const [stats, setStats] = useState<BreakStats | null>(null);
  const [nextReminder, setNextReminder] = useState<NextReminderInfo | null>(
    null,
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await invoke<BreakStats>("get_break_stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to load break stats:", error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCountdown = async () => {
      try {
        const data = await invoke<NextReminderInfo>("get_next_reminder_info");
        setNextReminder(data);
      } catch (error) {
        console.error("Failed to load next reminder info:", error);
      }
    };

    loadCountdown();
    const interval = setInterval(loadCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHours = timeCount.hours + timeCount.minutes / 60;
  const percentage = Math.min((totalHours / 24) * 100, 100);
  const isOverLimit = totalHours > usageTimeLimit;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col gap-4 p-2">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <section className="grid min-h-0 flex-[14] basis-0 grid-cols-1 gap-3 lg:grid-cols-3">
          <div
            className={cn(
              "flex h-full min-h-0 flex-col justify-between gap-6 px-4 py-5",
              dashboardBlockClassName,
            )}
          >
            <div>
              <h1 className="text-3xl font-heading font-semibold tracking-wide text-foreground sm:text-4xl">
                {currentDate.toLocaleString("en-US", { weekday: "long" })}
              </h1>
              <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                {formattedDate}
              </p>
            </div>

            <div className="mt-auto">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <DashboardIconBadge color={accentHex}>
                  <IoTimer className="size-4" />
                </DashboardIconBadge>
                Next break
              </div>
              <div className="text-4xl font-heading font-semibold tracking-tight sm:text-5xl">
                {formatCountdown(nextReminder)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextReminder?.isOnBreak
                  ? "Finish your current break"
                  : "Countdown until your next reminder"}
              </p>
            </div>
          </div>
          <div className="flex h-full min-h-0 lg:col-span-2">
            <DashboardPendingTasks className="h-full w-full" />
          </div>
        </section>

        <section className="grid min-h-0 flex-[15] basis-0 grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex h-full min-h-0 lg:col-span-2">
            <DashboardWeeklyReport className="h-full w-full" />
          </div>
          <div
            className={cn(
              "flex h-full min-h-0 items-center justify-center px-4 py-4",
              dashboardBlockClassName,
            )}
          >
            <div className="relative h-40 w-40 sm:h-44 sm:w-44">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="fill-none stroke-muted stroke-[8px]"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`fill-none stroke-[8px] transition-all duration-500 ${
                    isOverLimit ? "stroke-destructive" : "stroke-primary"
                  }`}
                  strokeDasharray={`${(percentage * 264) / 100} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <IoTime className="mb-1 size-4 text-muted-foreground" />
                <span className="text-2xl font-heading font-semibold sm:text-3xl">{`${timeCount.hours}h ${timeCount.minutes}m`}</span>
                <span className="text-xs text-muted-foreground">Screen time</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className={cn("shrink-0 overflow-hidden", dashboardBlockClassName)}>
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats ? (
            <div className="px-4 py-5">
              <DashboardStatCard
                className="h-full border-0 bg-transparent p-0 shadow-none"
                icon={
                  <DashboardIconBadge color={accentHex}>
                    <IoAlarm className="size-4" />
                  </DashboardIconBadge>
                }
                label="Snoozes today"
                value={formatLimit(
                  stats.snoozesToday,
                  stats.snoozesAllowedPerDay,
                )}
                detail={`Session ${formatLimit(stats.snoozesSession, stats.snoozesAllowedPerSession)}`}
              />
            </div>
          ) : null}

          {stats ? (
            <>
              <div className="px-4 py-5">
                <DashboardStatCard
                  className="h-full border-0 bg-transparent p-0 shadow-none"
                  icon={
                    <DashboardIconBadge color={accentHex}>
                      <IoFlame className="size-4" />
                    </DashboardIconBadge>
                  }
                  label="Break streak"
                  value={stats.breakStreak}
                  detail={`Best ${stats.bestBreakStreak} in a row`}
                />
              </div>
              <div className="px-4 py-5">
                <DashboardStatCard
                  className="h-full border-0 bg-transparent p-0 shadow-none"
                  icon={
                    <DashboardIconBadge color={accentHex}>
                      <IoCheckmarkCircle className="size-4" />
                    </DashboardIconBadge>
                  }
                  label="Full breaks"
                  value={stats.totalBreaksCompleted}
                  detail="Completed without skipping"
                />
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
