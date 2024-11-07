import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

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
  const styles = [
    { value: "default", label: "Default" },
    { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
    { value: "polygonAnimation", label: "Polygon Animation" },
    { value: "canvasShapes", label: "Canvas Shapes" },
    { value: "particleBackground", label: "Particle Background" },
  ];

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
  return (
    <div className="p-8 space-y-4">
      <h3 className="text-xl font-bold">Background Style</h3>
      <div className="grid grid-cols-4 gap-4 ">
        {styles.map((style) => (
          <div
            key={style.value}
            onClick={() => handleSaveTheme(style.value)}
            className={`cursor-pointer border-2 rounded-md p-4 text-center ${
              backgroundStyle === style.value
                ? "border-blue-500"
                : "border-gray-300"
            }`}
          >
            Try {style.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderStyles;
