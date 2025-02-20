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
import { format, subDays, isAfter } from "date-fns";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "./ui/chart";

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

type TimeRange = "today" | "7days" | "30days" | "365days" | "allTime";

const timeRanges: { [key in TimeRange]: string } = {
  today: "Today",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "365days": "Last 365 Days",
  allTime: "All Time",
};

export default function UsageTimeChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7days");
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [usageTimeLimit, setUsageTimeLimit] = useState<number>(8);

  const chartConfig: ChartConfig = {
    timeWithin: {
      label: "Within 8 Hours",
      color: "#22c55e", // Color when time is within 8 hours
    },
    timeExceeds: {
      label: "Exceeds 8 Hours",
      color: "#FE4C55", // Color when time exceeds 8 hours
    },
  };

  useEffect(() => {
    const fetchDateData = async () => {
      try {
        // Load SQLite database
        const db = await Database.load("sqlite:testUserScreenTime.db");
        // Query all records from the table
        const results = await db.select(
          "SELECT date, first_timestamp, second_timestamp FROM time_data"
        );
        const typedResults = results as DatabaseRow[];
        // Group the results by date into a TimeData object
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

        // Load usage time limit from store.json if available
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
      switch (selectedRange) {
        case "today":
          return date === localToday;
        case "7days":
          return isAfter(new Date(date), subDays(today, 7));
        case "30days":
          return isAfter(new Date(date), subDays(today, 30));
        case "365days":
          return isAfter(new Date(date), subDays(today, 365));
        case "allTime":
          return true;
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
  }, [timeData, selectedRange]);

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

  return (
    <Card className="w-full max-w-7xl my-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="font-heading tracking-wider">
            Device Usage Time
          </CardTitle>
          <CardDescription>Total time: {totalTime}</CardDescription>
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
        <div className="space-x-2 mb-4">
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
            <AlertTitle>No Data for {timeRanges[selectedRange]}</AlertTitle>
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
