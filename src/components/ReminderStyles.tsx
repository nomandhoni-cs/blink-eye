import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Flame, Loader2 } from "lucide-react";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { Button } from "./ui/button";

const styles = [
  { value: "default", label: "Default" },
  { value: "aurora", label: "Aurora" },
  { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
  { value: "polygonAnimation", label: "Polygon Animation" },
  { value: "canvasShapes", label: "Bouncy Balls" },
  { value: "particleBackground", label: "Infinite Wave Background" },
  { value: "starryBackground", label: "Starry Background" },
  { value: "shootingmeteor", label: "Shooting Meteor" },
];

export default function ReminderStyles() {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
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
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Background Style</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div
            key={style.value}
            className={`cursor-pointer transition-all duration-300 ease-in-out border-2 border-card-border rounded-lg shadow-sm overflow-hidden ${
              backgroundStyle === style.value
                ? "ring-2 ring-primary"
                : "hover:ring-2 hover:ring-primary/50"
            }`}
            onClick={() => handleSaveTheme(style.value)}
          >
            <div className="p-4 h-full flex flex-col justify-between bg-card text-card-foreground">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">{style.label}</span>
                {style.value !== "default" && (
                  <div className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-semibold">Premium</span>
                  </div>
                )}
              </div>
              <div
                className={`w-full h-20 rounded-md animate-pulse ${
                  style.value === backgroundStyle
                    ? "bg-primary/20"
                    : "bg-secondary"
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
