import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import { IoDownloadOutline, IoStatsChart } from "react-icons/io5";
import { useAccentColor } from "../../contexts/AccentColorContext";
import {
  dashboardBlockClassName,
  DashboardIconBadge,
} from "./dashboardBlock";
import toast from "react-hot-toast";

type DailyBreakReport = {
  date: string;
  label: string;
  completed: number;
  snoozed: number;
};

type WeeklyBreakReport = {
  days: DailyBreakReport[];
  totalCompleted: number;
  totalSnoozed: number;
};

export default function DashboardWeeklyReport({
  className,
}: {
  className?: string;
}) {
  const { accentHex } = useAccentColor();
  const [report, setReport] = useState<WeeklyBreakReport | null>(null);

  const chartConfig = useMemo(
    () =>
      ({
        completed: {
          label: "Full breaks",
          color: accentHex,
        },
        snoozed: {
          label: "Snoozes",
          color: "var(--chart-2)",
        },
      }) satisfies ChartConfig,
    [accentHex],
  );

  const load = useCallback(async () => {
    try {
      const data = await invoke<WeeklyBreakReport>("get_weekly_break_report");
      setReport(data);
    } catch (error) {
      console.error("Failed to load weekly break report:", error);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const chartData = useMemo(
    () =>
      report?.days.map((day) => ({
        label: day.label,
        completed: day.completed,
        snoozed: day.snoozed,
      })) ?? [],
    [report],
  );

  const hasActivity = chartData.some(
    (day) => day.completed > 0 || day.snoozed > 0,
  );

  const handleExport = async () => {
    if (!report) return;

    try {
      const path = await save({
        defaultPath: "blink-eye-weekly-breaks.csv",
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });
      if (!path) return;

      const lines = [
        "date,completed,snoozed",
        ...report.days.map(
          (day) => `${day.date},${day.completed},${day.snoozed}`,
        ),
      ];
      await writeTextFile(path, lines.join("\n"));

      toast.success("Weekly report exported.", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Failed to export weekly report:", error);
      toast.error("Couldn't export report.", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col p-4",
        dashboardBlockClassName,
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <DashboardIconBadge color={accentHex}>
              <IoStatsChart className="size-4" />
            </DashboardIconBadge>
            Weekly break report
          </div>
          {report ? (
            <p className="text-xs text-muted-foreground">
              {report.totalCompleted} full breaks · {report.totalSnoozed}{" "}
              snoozes (7 days)
            </p>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={handleExport}
          disabled={!report}
        >
          <IoDownloadOutline className="size-4" />
          Export
        </Button>
      </div>

      {chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="min-h-[180px] w-full flex-1"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -8, right: 4, top: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={28}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="snoozed"
              fill="var(--color-snoozed)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          {report && !hasActivity
            ? "No breaks recorded in the last 7 days."
            : "Loading weekly report…"}
        </div>
      )}
    </div>
  );
}
