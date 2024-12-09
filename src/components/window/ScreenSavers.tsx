import { Flame } from "lucide-react";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { load } from "@tauri-apps/plugin-store";
import HowToCloseScreenSaver from "../HowToCloseScreenSaver";
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
    <div className="space-y-2 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div
            key={style.value}
            className={`cursor-pointer transition-all duration-300 ease-in-out border-2 border-card-border rounded-lg shadow-sm overflow-hidden ${
              backgroundStyle === style.value
                ? "ring-2 ring-primary"
                : "hover:ring-2 hover:ring-primary/50"
            }`}
            onClick={() => handleSaveScreenSaver(style.value)}
          >
            <div className="p-2 h-full flex flex-col justify-between bg-card text-card-foreground">
              <div className="flex flex-col items-center justify-between mb-4 space-y-4">
                <span className="font-medium">{style.label}</span>
                {style.value !== "default" && (
                  <div className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-semibold">Premium</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-4">
        <HowToCloseScreenSaver />
        <Button onClick={() => handleOpenScreenSaver()}>
          Open Screen Saver
        </Button>
      </div>
    </div>
  );
};

export default ScreenSavers;
