import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Clock } from "lucide-react";
import { Switch } from "../ui/switch";

type Schedule = { start: string; end: string } | null;
// Define the type for a single day's schedule
type DaySchedule = {
  start: string;
  end: string;
} | null;

// Define the type for the workday object
type Workday = {
  [day: string]: DaySchedule;
};
const defaultWorkday: Record<string, Schedule> = {
  Monday: { start: "09:00", end: "17:00" },
  Tuesday: { start: "09:00", end: "17:00" },
  Wednesday: { start: "09:00", end: "17:00" },
  Thursday: { start: "09:00", end: "17:00" },
  Friday: { start: "09:00", end: "17:00" },
  Saturday: null,
  Sunday: null,
};

export default function Workday() {
  const [workday, setWorkday] =
    useState<Record<string, Schedule>>(defaultWorkday);

  useEffect(() => {
    const fetchWorkday = async () => {
      const store = await load("store.json", { autoSave: false });
      const savedWorkday = await store.get<Workday>("blinkEyeWorkday");

      // Ensure the saved workday matches the expected type
      if (savedWorkday && typeof savedWorkday === "object") {
        setWorkday(savedWorkday);
      }
    };

    fetchWorkday();
  }, []);

  const handleTimeChange = (
    day: string,
    type: "start" | "end",
    value: string
  ) => {
    setWorkday((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      } as DaySchedule, // Ensure proper typing here
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setWorkday((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { start: "09:00", end: "17:00" },
    }));
  };

  const handleSave = async () => {
    const store = await load("store.json", { autoSave: false });
    await store.set("blinkEyeWorkday", workday);
    await store.save();
    toast.success("Workday settings saved!");
  };

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Workday Setup</h2>
        <p className="text-muted-foreground">
          Configure your work hours for each day of the week. Toggle to set
          working or non-working days.
        </p>
      </div>
      <Separator />
      <div className="space-y-6">
        {Object.entries(workday).map(([day, schedule]) => (
          <div key={day} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{day}</h3>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`${day}-toggle`} className="text-sm">
                  Working Day
                </Label>
                <Switch
                  id={`${day}-toggle`}
                  checked={!!schedule}
                  onCheckedChange={() => toggleWorkingDay(day)}
                />
              </div>
            </div>
            {schedule ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor={`${day}-start`}
                    className="text-sm font-medium"
                  >
                    Start Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="time"
                      id={`${day}-start`}
                      className="pl-9"
                      value={schedule.start}
                      onChange={(e) =>
                        handleTimeChange(day, "start", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${day}-end`} className="text-sm font-medium">
                    End Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="time"
                      id={`${day}-end`}
                      className="pl-9"
                      value={schedule.end}
                      onChange={(e) =>
                        handleTimeChange(day, "end", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Non-working day</p>
            )}
            <Separator />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="w-full">
        Save Workday Settings
      </Button>
    </div>
  );
}
