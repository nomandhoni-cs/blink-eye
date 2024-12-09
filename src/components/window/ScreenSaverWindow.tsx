import React, { useEffect, useState } from "react";
import { AuroraBackground } from "../backgrounds/Aurora";
import { BeamOfLife } from "../backgrounds/BeamOfLife";
import { FreeSpirit } from "../backgrounds/FreeSpirit";
import { load } from "@tauri-apps/plugin-store";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import HowToCloseScreenSaver from "../HowToCloseScreenSaver";

// Escape button to exit fullscreen

// Dynamic imports for code-splitting
const PolygonAnimation = React.lazy(
  () => import("../backgrounds/PolygonAnimation")
);
const ParticleBackground = React.lazy(
  () => import("../backgrounds/ParticleBackground")
);
const CanvasShapes = React.lazy(
  () => import("../backgrounds/ParticleAnimation")
);

const StarryBackground = React.lazy(
  () => import("../backgrounds/StarryBackground")
);
const ShootingMeteor = React.lazy(
  () => import("../backgrounds/ShootingMeteor")
);
const PlainGradientAnimation = React.lazy(
  () => import("../backgrounds/PlainGradientAnimation")
);

const ScreenSaverWindow: React.FC = () => {
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const [showHowToClose, setShowHowToClose] = useState(true);
  // Load saved background style from storage
  useEffect(() => {
    const fetchReminderScreenInfo = async () => {
      const reminderStyleData = await load("ScreenSaverStyle.json");
      const savedStyle = await reminderStyleData.get<string>("backgroundStyle");
      if (savedStyle) setBackgroundStyle(savedStyle);
      else setBackgroundStyle("aurora");
    };
    fetchReminderScreenInfo();
  }, []);
  // Register Escape key shortcut to exit fullscreen
  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();
    const setupShortcut = async () => {
      try {
        await register("CommandOrControl+Space", () => {
          setTimeout(async () => {
            await unregister("CommandOrControl+Space"); // Unregister the shortcut immediately
            appWindow.close(); // Close the app window
          }, 0);
        });
      } catch (err) {
        console.error("Failed to register Escape key shortcut:", err);
      }
    };
    setupShortcut();

    return () => {
      // Optionally unregister the shortcut here if needed
    };
  }, []);

  const renderBackground = () => {
    switch (backgroundStyle) {
      case "default":
        return <FreeSpirit />;
      case "aurora":
        return <AuroraBackground />;
      case "beamoflife":
        return <BeamOfLife />;
      case "freesprit":
        return <FreeSpirit />;
      case "polygonAnimation":
        return <PolygonAnimation />;
      case "canvasShapes":
        return <CanvasShapes shape="circle" speed={8} numberOfItems={60} />;
      case "particleBackground":
        return <ParticleBackground />;
      case "plainGradientAnimation":
        return <PlainGradientAnimation />;
      case "starryBackground":
        return <StarryBackground />;
      case "shootingmeteor":
        return <ShootingMeteor number={40} />;
      default:
        return <AuroraBackground />;
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHowToClose(false);
    }, 10000); // 5000ms = 5 seconds

    // Clean up the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {renderBackground()}
      {showHowToClose && (
        <div className="absolute bottom-0 mb-8 w-full flex justify-center opacity-40">
          <HowToCloseScreenSaver />
        </div>
      )}
    </div>
  );
};

export default ScreenSaverWindow;
