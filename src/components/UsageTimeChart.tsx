import { useEffect, useMemo, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import Database from "@tauri-apps/plugin-sql";
import {
  Bar,
  BarChart,
  XAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, isAfter, isSameMonth, isSameYear } from "date-fns";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "./ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type TimeEntry = {
  firstTimestamp: number;
  secondTimestamp: number;
};

type TimeData = {
  [date: string]: TimeEntry[];
};

type DatabaseRow = {
  date: string;
  first_timestamp: number;
  second_timestamp: number;
};

type TimeRange =
  | "today"
  | "7days"
  | "30days"
  | "monthly"
  | "365days"
  | "allTime";

const timeRanges: { [key in TimeRange]: string } = {
  today: "Today",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  monthly: "Monthly",
  "365days": "Last 365 Days",
  allTime: "All Time",
};

// Month selector component
const MonthYearSelector: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates: string[];
}> = ({ selectedDate, onDateChange, availableDates }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique months/years from available dates
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    availableDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      monthsSet.add(format(date, "yyyy-MM"));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [availableDates]);

  const handleMonthChange = (direction: "prev" | "next") => {
    const currentMonth = format(selectedDate, "yyyy-MM");
    const currentIndex = availableMonths.indexOf(currentMonth);

    if (direction === "prev" && currentIndex < availableMonths.length - 1) {
      const [year, month] = availableMonths[currentIndex + 1].split("-");
      onDateChange(new Date(parseInt(year), parseInt(month) - 1));
    } else if (direction === "next" && currentIndex > 0) {
      const [year, month] = availableMonths[currentIndex - 1].split("-");
      onDateChange(new Date(parseInt(year), parseInt(month) - 1));
    }
  };

  const canGoPrev =
    availableMonths.indexOf(format(selectedDate, "yyyy-MM")) <
    availableMonths.length - 1;
  const canGoNext =
    availableMonths.indexOf(format(selectedDate, "yyyy-MM")) > 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleMonthChange("prev")}
        disabled={!canGoPrev}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {format(selectedDate, "MMMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {availableMonths.map((monthStr) => {
                const [year, month] = monthStr.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const isSelected = format(selectedDate, "yyyy-MM") === monthStr;

                return (
                  <Button
                    key={monthStr}
                    variant={isSelected ? "default" : "ghost"}
                    className="h-9 px-3"
                    onClick={() => {
                      onDateChange(date);
                      setIsOpen(false);
                    }}
                  >
                    {format(date, "MMM yyyy")}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleMonthChange("next")}
        disabled={!canGoNext}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function UsageTimeChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7days");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [usageTimeLimit, setUsageTimeLimit] = useState<number>(8);

  const chartConfig: ChartConfig = {
    timeWithin: {
      label: "Within 8 Hours",
      color: "#22c55e",
    },
    timeExceeds: {
      label: "Exceeds 8 Hours",
      color: "#FE4C55",
    },
  };

  useEffect(() => {
    const fetchDateData = async () => {
      try {
        const db = await Database.load("sqlite:UserScreenTime.db");
        const results = await db.select(
          "SELECT date, first_timestamp, second_timestamp FROM time_data"
        );
        const typedResults = results as DatabaseRow[];
        const groupedData: TimeData = {};
        typedResults.forEach((row: any) => {
          const date = row.date;
          if (!groupedData[date]) {
            groupedData[date] = [];
          }
          groupedData[date].push({
            firstTimestamp: row.first_timestamp,
            secondTimestamp: row.second_timestamp,
          });
        });
        setTimeData(groupedData);

        const usageTimeLimitStore = await load("store.json", {
          autoSave: false,
        });
        const usageLimit = await usageTimeLimitStore.get<number>(
          "usageTimeLimit"
        );
        if (usageLimit) setUsageTimeLimit(usageLimit);
      } catch (error) {
        console.error("Failed to load time data:", error);
      }
    };

    fetchDateData();
  }, []);

  const processedData = useMemo(() => {
    if (!timeData) return [];

    const today = new Date();
    const localToday = format(today, "yyyy-MM-dd");

    const filterDate = (date: string) => {
      const dateObj = new Date(date);

      switch (selectedRange) {
        case "today":
          return date === localToday;
        case "7days":
          return isAfter(dateObj, subDays(today, 7));
        case "30days":
          return isAfter(dateObj, subDays(today, 30));
        case "365days":
          return isAfter(dateObj, subDays(today, 365));
        case "allTime":
          return true;
        case "monthly":
          return (
            isSameMonth(dateObj, selectedMonth) &&
            isSameYear(dateObj, selectedMonth)
          );
        default:
          return false;
      }
    };

    return Object.entries(timeData)
      .filter(([date]) => filterDate(date))
      .map(([date, timestamps]) => {
        const totalTime = timestamps.reduce(
          (sum, { firstTimestamp, secondTimestamp }) =>
            sum + (secondTimestamp - firstTimestamp),
          0
        );
        return { date, totalTime };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeData, selectedRange, selectedMonth]);

  const totalTime = useMemo(() => {
    if (!processedData.length) return "0h 0m";
    const totalMilliseconds = processedData.reduce(
      (sum, { totalTime }) => sum + totalTime,
      0
    );
    const hours = Math.floor(totalMilliseconds / (60 * 60 * 1000));
    const minutes = Math.floor(
      (totalMilliseconds % (60 * 60 * 1000)) / (60 * 1000)
    );
    return `${hours}h ${minutes}m`;
  }, [processedData]);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  if (!timeData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No time data available. Please check the data being passed to the
          component.
        </AlertDescription>
      </Alert>
    );
  }

  const availableDates = Object.keys(timeData);

  return (
    <Card className="w-full max-w-7xl my-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="font-heading tracking-wider">
            Device Usage Time
          </CardTitle>
          <CardDescription>
            {selectedRange === "monthly"
              ? `${format(selectedMonth, "MMMM yyyy")} - Total: ${totalTime}`
              : `Total time: ${totalTime}`}
          </CardDescription>
        </div>
        <div className="mr-14">
          {selectedRange === "monthly" && (
            <div className="ml-auto">
              <MonthYearSelector
                selectedDate={selectedMonth}
                onDateChange={setSelectedMonth}
                availableDates={availableDates}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center">
            <span className="text-sm mr-2">Within {usageTimeLimit} Hours</span>
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">Exceeds {usageTimeLimit} Hours</span>
            <div className="w-3 h-3 rounded-full bg-[#FE4C55]"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-2">
            {Object.entries(timeRanges).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedRange === key ? "default" : "outline"}
                onClick={() => setSelectedRange(key as TimeRange)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {processedData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="min-h-[300px] w-full mx-auto"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "MMM dd")}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded p-2 shadow-md">
                          <p className="font-semibold">
                            {format(new Date(data.date), "MMMM dd, yyyy")}
                          </p>
                          <p>{`Screen On Time: ${formatTime(
                            data.totalTime
                          )}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="totalTime"
                  name="Screen On Time"
                  radius={[8, 8, 0, 0]}
                >
                  {processedData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={
                        entry.totalTime > usageTimeLimit * 60 * 60 * 1000
                          ? chartConfig.timeExceeds.color
                          : chartConfig.timeWithin.color
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              No Data for{" "}
              {selectedRange === "monthly"
                ? format(selectedMonth, "MMMM yyyy")
                : timeRanges[selectedRange]}
            </AlertTitle>
            <AlertDescription>
              No activity recorded for the selected time range. Please ensure
              the app is tracking your activity.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
