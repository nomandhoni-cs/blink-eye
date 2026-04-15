import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useTrigger } from "../../contexts/TriggerReRender";
import { Card, CardContent } from "../ui/card";
import {
  ClockIcon,
  SaveIcon,
  TextIcon,
  WallpaperIcon,
  Hourglass,
} from "lucide-react";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import DashboardPendingTasks from "../DashboardPendingTasks";

// Pre-defined options for smooth UX selection
const FREQUENCY_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120];
const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120, 300];

// ==========================================
// SCROLLABLE SELECTOR COMPONENT
// ==========================================
const ScrollableSelector = ({
  options,
  value,
  onChange,
  unit,
}: {
  options: number[];
  value: number;
  onChange: (val: number) => void;
  unit: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Merge the current value into options if it's custom, and sort them numerically
  const displayOptions = Array.from(new Set([...options, value]))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  // Convert vertical mouse wheel to horizontal scrolling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeftPos(scrollRef.current!.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => {
    setIsDragging(false);
    // Reset drag state slightly after to allow click events to process
    setTimeout(() => setHasDragged(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setHasDragged(true); // User is actually dragging, not just clicking
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current!.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`flex gap-2 overflow-x-auto py-2 px-1 select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
      >
        {displayOptions.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={(e) => {
                if (hasDragged) {
                  e.stopPropagation();
                  return;
                }
                onChange(opt);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                isSelected
                  ? "bg-[#FE4C55] text-white shadow-md shadow-[#FE4C55]/20 ring-2 ring-[#FE4C55]/50 ring-offset-1 ring-offset-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
              }`}
            >
              {opt} {unit}
            </button>
          );
        })}
      </div>
      {/* Subtle fade effect on the right edge to indicate scrollability */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
const Dashboard = () => {
  const { triggerUpdate } = useTrigger();
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");
  const [usageTimeLimit, setUsageTimeLimit] = useState<number>(8);
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const { timeCount } = useTimeCountContext();

  // Calculate total hours for the progress circle
  const totalHours = timeCount.hours + timeCount.minutes / 60;
  const percentage = (totalHours / 24) * 100;
  const isOverLimit = totalHours > usageTimeLimit;

  // Get current date
  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

  // Function to open the reminder window
  const openReminderWindow = (reminderWindow: string) => {
    console.log("Opening reminder window...");
    const webview = new WebviewWindow(reminderWindow, {
      url: `/${reminderWindow}`,
      title: "Take A Break Reminder - Blink Eye",
      fullscreen: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    });

    webview.once("tauri://created", () => {
      console.log("Reminder window created");
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating reminder window:", e);
    });
  };

  const handleOpenReminderWindow = () => {
    console.log("Opening reminder window for", backgroundStyle);
    switch (backgroundStyle) {
      case "aurora":
        openReminderWindow("AuroraReminderWindow");
        break;
      case "beamoflife":
        openReminderWindow("BeamOfLifeReminderWindow");
        break;
      case "freesprit":
        openReminderWindow("FreeSpiritReminderWindow");
        break;
      case "canvasShapes":
        openReminderWindow("CanvasShapesReminderWindow");
        break;
      case "particleBackground":
        openReminderWindow("ParticleBackgroundReminderWindow");
        break;
      case "plainGradientAnimation":
        openReminderWindow("PlainGradientAnimationReminderWindow");
        break;
      case "starryBackground":
        openReminderWindow("StarryBackgroundReminderWindow");
        break;
      case "shootingmeteor":
        openReminderWindow("ShootingMeteorReminderWindow");
        break;
      default:
        openReminderWindow("AuroraReminderWindow");
    }
  };

  // Load settings from the store when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval",
      );
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration",
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText",
      );
      const reminderStyleData = await load("ReminderThemeStyle.json");
      const savedStyle = await reminderStyleData.get<string>("backgroundStyle");
      if (savedStyle) setBackgroundStyle(savedStyle);
      const usageTimeLimit = await store.get<number>("usageTimeLimit");
      if (usageTimeLimit) setUsageTimeLimit(usageTimeLimit);

      if (storedInterval) setInterval(storedInterval);
      if (storedDuration) setDuration(storedDuration);
      if (storedReminderText) setReminderText(storedReminderText);
    };

    fetchSettings();
  }, []);

  // Save settings to the store when the save button is clicked
  const handleSave = async () => {
    if (interval <= 0) {
      toast.error("Interval must be greater than 0 minutes.");
      return;
    }
    if (duration <= 0) {
      toast.error("Duration must be greater than 0 seconds.");
      return;
    }

    const store = await load("store.json", { autoSave: false });
    await store.set("blinkEyeReminderDuration", duration);
    await store.set("blinkEyeReminderInterval", interval);
    await store.set("blinkEyeReminderScreenText", reminderText);
    await store.save();

    triggerUpdate();

    toast.success("Successfully saved the settings!", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <div className="p-2 space-y-3 flex flex-col h-full relative">
      {/* Header & Progress */}
      <div className="flex justify-between items-center space-x-8 mt-6 mb-6">
        <div>
          <h1 className="text-5xl font-heading font-semibold tracking-wider text-[#FE4C55]">
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
                isOverLimit ? "stroke-[#FE4C55]" : "stroke-green-500"
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

      {/* Settings Section */}
      <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-3xl border-white/10 shadow-xl overflow-hidden flex-shrink-0">
        <CardContent className="p-6 space-y-8">
          {/* Scrollable Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <ClockIcon className="h-4 w-4 text-[#FE4C55]" />
                Break Frequency
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                How often you want to be reminded
              </p>
              <ScrollableSelector
                options={FREQUENCY_OPTIONS}
                value={interval}
                onChange={setInterval}
                unit="min"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Hourglass className="h-4 w-4 text-[#FE4C55]" />
                Break Duration
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                How long the break screen should last
              </p>
              <ScrollableSelector
                options={DURATION_OPTIONS}
                value={duration}
                onChange={setDuration}
                unit="sec"
              />
            </div>
          </div>

          {/* Reminder Message */}
          <div className="space-y-3 pt-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <TextIcon className="h-4 w-4 text-[#FE4C55]" />
              Reminder Message
            </Label>
            <Input
              type="text"
              placeholder="Pause! Look into the distance, and best if you walk a bit."
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="bg-background/50 h-12 text-base focus-visible:ring-[#FE4C55]/50 border-white/10"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex w-full sm:w-auto gap-3">
              <Button onClick={handleSave} className="flex-1 sm:flex-none">
                <SaveIcon className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button
                onClick={handleOpenReminderWindow}
                variant="secondary"
                className="flex-1 sm:flex-none bg-secondary/50 hover:bg-secondary"
              >
                <WallpaperIcon className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            <a
              href="http://github.com/nomandhoni-cs/blink-eye"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity mt-2 sm:mt-0"
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-current text-foreground"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Adjusted the spacing so tasks render properly below */}
      <div className="flex-1 pb-4">
        <DashboardPendingTasks />
      </div>
    </div>
  );
};

export default Dashboard;
