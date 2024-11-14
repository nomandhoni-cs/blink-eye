import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Flame } from "lucide-react";

const ReminderStyles = () => {
  const [backgroundStyle, setBackgroundStyle] =
    useState<string>("particleBackground");

  // Load the stored background style on component mount
  useEffect(() => {
    const fetchBackgroundStyle = async () => {
      const store = await load("ReminderThemeStyle.json", { autoSave: true });
      const savedStyle = await store.get<string>("backgroundStyle");
      if (savedStyle) {
        setBackgroundStyle(savedStyle);
      }
    };
    fetchBackgroundStyle();
  }, []);

  // Save the selected style automatically
  const handleSaveTheme = async (selectedStyle: string) => {
    const store = await load("ReminderThemeStyle.json", { autoSave: true });
    await store.set("backgroundStyle", selectedStyle);
    await store.save();
    setBackgroundStyle(selectedStyle);
    openReminderWindow();
    console.log("Background style saved:", selectedStyle);
  };

  // Define the background style options

  const openReminderWindow = () => {
    console.log("Clicked");
    const webview = new WebviewWindow("ReminderWindow", {
      url: "/reminder",
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
  const styles = [
    { value: "default", label: "Default" },
    { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
    { value: "polygonAnimation", label: "Polygon Animation" },
    { value: "canvasShapes", label: "Bouncy Balls" },
    { value: "particleBackground", label: "Infinite wave Background" },
    { value: "starryBackground", label: "Starry Background" },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Background Style</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div
            key={style.value}
            onClick={() => handleSaveTheme(style.value)}
            className={`cursor-pointer border h-32 rounded-lg shadow-sm p-4 text-center flex flex-col space-y-4 items-center transition-colors duration-300 ease-in-out ${
              backgroundStyle === style.value
                ? "border-green-500"
                : "border-gray-300"
            } backdrop-blur-lg bg-white/30 shadow-md`}
          >
            {/* Flame icon and Try text */}
            {style.value !== "default" && (
              <div className="flex items-center justify-center space-x-2">
                <Flame className="text-red-500 text-xl" />
                <span className="font-semibold text-lg">Try</span>
              </div>
            )}

            {/* Label */}
            <div className="text-base">{style.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderStyles;
