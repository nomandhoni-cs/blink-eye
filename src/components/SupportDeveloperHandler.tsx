import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { currentMonitor } from "@tauri-apps/api/window";
const SupportDeveloperHandler = () => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const [lastReminded, setLastReminded] = useState("");
  // Type definition for a single reminder object

  useEffect(() => {
    // Defines and immediately calls an async function to fetch data.
    const getLastReminded = async () => {
      try {
        const appBasicDB = await Database.load("sqlite:appconfig.db");
        // Awaits the database query result.
        const result = await appBasicDB.select(
          "SELECT value FROM config WHERE key = ?",
          ["lastRemindDay"]
        );

        // Checks if the result is valid and has at least one row.
        if (Array.isArray(result) && result.length > 0 && result[0].value) {
          // Sets the state with the value from the database.
          setLastReminded(result[0].value);
        } else {
          console.log("No 'lastRemindDay' value found in the database.");
        }
      } catch (error) {
        console.error("Failed to load or query database:", error);
      }
    };

    getLastReminded();
  }, []); // Empty dependency array ensures this runs only once on mount.

  const openSupporReminder = async () => {
    const monitor = await currentMonitor();
    const windowWidth = 600;
    const windowHeight = 300;
    const x = monitor
      ? Math.round((monitor.size.width - windowWidth) / 2) + monitor.position.x
      : 0;
    const y = monitor
      ? monitor.position.y + 80 // 20px from top
      : 0;
    const webview = new WebviewWindow("support_reminder", {
      url: `/support_reminder`,
      title: "Support Developer - Blink Eye",
      transparent: true,
      shadow: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focus: true,
      height: windowHeight,
      width: windowWidth,
      decorations: false,
      resizable: false,
      x,
      y,
    });
    webview.once("tauri://created", () => {
      console.log("Test window created");
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating test window:", e);
    });
  };

  return null;
};

export default SupportDeveloperHandler;
