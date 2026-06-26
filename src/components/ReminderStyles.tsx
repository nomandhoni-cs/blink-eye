import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Flame, Check } from "lucide-react";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { useTrigger } from "../contexts/TriggerReRender";
import { cn } from "../lib/utils";

// Thumbnails — diagonal split showing light (top-left) and dark (bottom-right)
import defaultThumb from "../assets/thumbnails/default.png";
import auroraThumb from "../assets/thumbnails/aurora.png";
import freespritThumb from "../assets/thumbnails/freesprit.png";
import particleThumb from "../assets/thumbnails/particleBackground.png";
import starryThumb from "../assets/thumbnails/starryBackground.png";
import beamThumb from "../assets/thumbnails/beamoflife.png";
import meteorThumb from "../assets/thumbnails/shootingmeteor.png";
import gradientThumb from "../assets/thumbnails/plainGradientAnimation.png";
import canvasThumb from "../assets/thumbnails/canvasShapes.png";

const thumbMap: Record<string, string> = {
  default: defaultThumb,
  aurora: auroraThumb,
  freesprit: freespritThumb,
  particleBackground: particleThumb,
  starryBackground: starryThumb,
  beamoflife: beamThumb,
  shootingmeteor: meteorThumb,
  plainGradientAnimation: gradientThumb,
  canvasShapes: canvasThumb,
};

const styles = [
  { value: "default", label: "Default" },
  { value: "aurora", label: "Aurora" },
  { value: "freesprit", label: "Free Sprit" },
  { value: "particleBackground", label: "Infinite Wave Background" },
  { value: "starryBackground", label: "Starry Background" },
  { value: "beamoflife", label: "Beam of Life" },
  { value: "shootingmeteor", label: "Shooting Meteor" },
  { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
  // { value: "polygonAnimation", label: "Polygon Animation" },
  { value: "canvasShapes", label: "Bouncy Balls" },
];

export default function ReminderStyles() {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const { triggerUpdate } = useTrigger();
  const [backgroundStyle, setBackgroundStyle] =
    useState<string>("particleBackground");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackgroundStyle = async () => {
      try {
        const store = await load("ReminderThemeStyle.json", { autoSave: true });
        const savedStyle = await store.get<string>("backgroundStyle");
        if (savedStyle) {
          setBackgroundStyle(savedStyle);
        }
      } catch (err) {
        console.error("Error fetching background style:", err);
        setError("Failed to load saved theme. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackgroundStyle();
  }, []);

  const handleSaveTheme = async (selectedStyle: string) => {
    try {
      setIsLoading(true);
      if (canAccessPremiumFeatures) {
        const store = await load("ReminderThemeStyle.json", {
          autoSave: false,
        });
        await store.set("backgroundStyle", selectedStyle);
        await store.save();
        triggerUpdate();
      }
      const themePreviewStore = await load("ReminderThemePreviewStyle.json", {
        autoSave: false,
      });
      await themePreviewStore.set("backgroundStyle", selectedStyle);
      await themePreviewStore.save();
      setBackgroundStyle(selectedStyle);
      openReminderWindow();
      console.log("Background style saved:", selectedStyle);
    } catch (err) {
      console.error("Error saving theme:", err);
      setError("Failed to save theme. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openReminderWindow = () => {
    const webview = new WebviewWindow("ReminderPreviewWindow", {
      url: "/reminderpreviewwindow",
      fullscreen: true,
      alwaysOnTop: true,
      title: "Take A Break Reminder - Blink Eye",
      skipTaskbar: true,
    });
    webview.once("tauri://created", () => {
      console.log("Webview created");
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating webview:", e);
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-heading tracking-tight">Background Style</h3>
        <p className="text-sm text-muted-foreground">
          Select a visual theme to be displayed during break reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {styles.map((style) => {
          const isActive = backgroundStyle === style.value;
          return (
            <div
              key={style.value}
              role="button"
              tabIndex={0}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground transition-all duration-300 ease-out outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border shadow-sm hover:border-primary/50 hover:shadow-md"
              )}
              onClick={() => handleSaveTheme(style.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSaveTheme(style.value);
                }
              }}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={thumbMap[style.value]}
                  alt={`${style.label} preview`}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Premium Badge */}
                {style.value !== "default" && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-amber-500/30 bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 shadow-sm backdrop-blur-md dark:text-amber-400">
                    <Flame className="h-3 w-3" />
                    Premium
                  </div>
                )}

                {/* Active Checkmark Badge */}
                {isActive && (
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="truncate text-sm font-medium tracking-tight">
                  {style.label}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
