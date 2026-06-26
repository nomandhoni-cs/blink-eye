import { Flame, Check } from "lucide-react";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { load } from "@tauri-apps/plugin-store";
import HowToCloseScreenSaver from "../HowToCloseScreenSaver";
import { cn } from "../../lib/utils";

// Thumbnails — diagonal split showing light (top-left) and dark (bottom-right)
import auroraThumb from "../../assets/thumbnails/aurora.png";
import freespritThumb from "../../assets/thumbnails/freesprit.png";
import particleThumb from "../../assets/thumbnails/particleBackground.png";
import starryThumb from "../../assets/thumbnails/starryBackground.png";
import beamThumb from "../../assets/thumbnails/beamoflife.png";
import meteorThumb from "../../assets/thumbnails/shootingmeteor.png";
import gradientThumb from "../../assets/thumbnails/plainGradientAnimation.png";
import polygonThumb from "../../assets/thumbnails/polygonAnimation.png";
import canvasThumb from "../../assets/thumbnails/canvasShapes.png";

const thumbMap: Record<string, string> = {
  aurora: auroraThumb,
  freesprit: freespritThumb,
  particleBackground: particleThumb,
  starryBackground: starryThumb,
  beamoflife: beamThumb,
  shootingmeteor: meteorThumb,
  plainGradientAnimation: gradientThumb,
  polygonAnimation: polygonThumb,
  canvasShapes: canvasThumb,
};

const styles = [
  { value: "aurora", label: "Aurora" },
  { value: "freesprit", label: "Free Sprit" },
  { value: "particleBackground", label: "Infinite Wave Background" },
  { value: "starryBackground", label: "Starry Background" },
  { value: "beamoflife", label: "Beam of Life" },
  { value: "shootingmeteor", label: "Shooting Meteor" },
  { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
  { value: "polygonAnimation", label: "Polygon Animation" },
  { value: "canvasShapes", label: "Bouncy Balls" },
];

const openScreenSaverWindow = () => {
  const webview = new WebviewWindow("ReminderPreviewWindow", {
    url: "/screenSaverWindow",
    fullscreen: true,
    alwaysOnTop: true,
    title: "Take A Break Reminder - Blink Eye",
    skipTaskbar: false,
  });
  webview.once("tauri://created", () => {
    console.log("Webview created");
  });
  webview.once("tauri://error", (e) => {
    console.error("Error creating webview:", e);
  });
};

const ScreenSavers: React.FC = () => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const [backgroundStyle, setBackgroundStyle] = useState<string>("freesprit");

  useEffect(() => {
    const fetchBackgroundStyle = async () => {
      try {
        const store = await load("ScreenSaverStyle.json", {
          autoSave: true,
        });
        const savedStyle = await store.get<string>("backgroundStyle");
        if (savedStyle) {
          setBackgroundStyle(savedStyle);
        }
      } catch (err) {
        console.error("Error fetching background style:", err);
      }
    };
    fetchBackgroundStyle();
  }, []);

  const handleOpenScreenSaver = () => {
    if (!canAccessPremiumFeatures) {
      toast.error(
        "Unlock this feature with a license key and help the developer grow.",
        {
          duration: 2000,
          position: "bottom-right",
        }
      );
      return;
    } else {
      openScreenSaverWindow();
    }
  };

  const handleSaveScreenSaver = async (style: string) => {
    if (!canAccessPremiumFeatures) {
      toast.error(
        "Unlock this feature with a license key and help the developer grow.",
        {
          duration: 2000,
          position: "bottom-right",
        }
      );
      return;
    } else {
      try {
        const themePreviewStore = await load("ScreenSaverStyle.json", {
          autoSave: false,
        });
        await themePreviewStore.set("backgroundStyle", style);
        await themePreviewStore.save();
        setBackgroundStyle(style);
        console.log("Background style saved:", style);
      } catch (err) {
        console.error("Error saving theme:", err);
      }
    }
  };

  return (
    <div className="space-y-8 px-4 py-2">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-heading tracking-tight">Screen Savers</h3>
        <p className="text-sm text-muted-foreground">
          Choose a visual style for your screen saver breaks.
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
              onClick={() => handleSaveScreenSaver(style.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSaveScreenSaver(style.value);
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

      <div className="flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 sm:flex-row">
        <HowToCloseScreenSaver />
        <Button onClick={() => handleOpenScreenSaver()} size="lg" className="w-full sm:w-auto">
          Open Screen Saver
        </Button>
      </div>
    </div>
  );
};

export default ScreenSavers;
