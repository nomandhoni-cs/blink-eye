import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import * as path from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { Progress } from "../ui/progress";
import CurrentTime from "../CurrentTime";
import ScreenOnTime from "../ScreenOnTime";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import toast, { Toaster } from "react-hot-toast";
// Dynamic imports for code-splitting
// const PolygonAnimation = React.lazy(
//   () => import("../backgrounds/PolygonAnimation")
// );
const ParticleBackground = React.lazy(
  () => import("../backgrounds/ParticleBackground")
);
const CanvasShapes = React.lazy(
  () => import("../backgrounds/ParticleAnimation")
);
const DefaultBackground = React.lazy(
  () => import("../backgrounds/DefaultBackground")
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
const AuroraBackground = React.lazy(() =>
  import("../backgrounds/Aurora").then((mod) => ({
    default: mod.AuroraBackground,
  }))
);
const BeamOfLife = React.lazy(() =>
  import("../backgrounds/BeamOfLife").then((mod) => ({
    default: mod.BeamOfLife,
  }))
);
const FreeSpirit = React.lazy(() =>
  import("../backgrounds/FreeSpirit").then((mod) => ({
    default: mod.FreeSpirit,
  }))
);

const appWindow = getCurrentWebviewWindow();

const ReminderPreviewWindow: React.FC = () => {
  const { timeCount } = useTimeCountContext();
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [reminderDuration, setReminderDuration] = useState<number>(20);
  const [reminderText, setStoredReminderText] = useState<string>("");
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  useEffect(() => {
    const fetchReminderScreenInfo = async () => {
      const reminderStyleData = await load("ReminderThemePreviewStyle.json");
      const savedStyle = await reminderStyleData.get<string>("backgroundStyle");
      if (savedStyle) setBackgroundStyle(savedStyle);

      const store = await load("store.json", { autoSave: false });
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText"
      );
      if (
        typeof storedReminderText === "string" &&
        storedReminderText.length > 0
      ) {
        setStoredReminderText(storedReminderText);
      }
      if (typeof storedDuration === "number") {
        setReminderDuration(storedDuration);
        setTimeLeft(storedDuration);
      }
    };
    if (!canAccessPremiumFeatures) {
      toast.error(
        "Unlock this feature with a license key and help the developer grow.",
        {
          duration: 5000,
          position: "bottom-right",
        }
      );
    }
    fetchReminderScreenInfo();
  }, []);

  const handlePlayAudio = async () => {
    try {
      const resourceDirDataPath = await path.resourceDir();
      const filePath = await path.join(resourceDirDataPath, "done.mp3");
      let reminderEndSound = new Audio(convertFileSrc(filePath));
      reminderEndSound.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  useEffect(() => {
    if (timeLeft <= 1) {
      handlePlayAudio();
    }
    if (timeLeft <= 0) {
      appWindow.close();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Render the selected background component based on backgroundType
  const renderBackground = () => {
    switch (backgroundStyle) {
      case "default":
        return <DefaultBackground />;
      case "aurora":
        return <AuroraBackground />;
      case "beamoflife":
        return <BeamOfLife />;
      case "freesprit":
        return <FreeSpirit />;
      // case "polygonAnimation":
      //   return <PolygonAnimation />;
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
        return <DefaultBackground />;
    }
  };
  const progressPercentage = (timeLeft / reminderDuration) * 100;
  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {backgroundStyle && renderBackground()}
      {/* Centered timer display */}
      <div className="absolute top-[40%] transform -translate-y-1/2 flex flex-col items-center">
        <div className="text-[240px] font-semibold">{timeLeft}s</div>
        <div className="w-96 -mt-10">
          <Progress value={progressPercentage} />
        </div>
      </div>
      {/* Positioned at 50% to 70% height */}
      <div className="absolute top-[70%] transform -translate-y-1/2 flex flex-col items-center space-y-4">
        <div className="flex justify-center items-center space-x-6">
          <CurrentTime />
          <ScreenOnTime timeCount={timeCount} />
        </div>
        <div className="text-5xl font-semibold text-center px-4 pb-4">
          {reminderText || "Look 20 feet far away to protect your eyes."}
        </div>
        <Button
          onClick={() => appWindow.close()}
          className="bg-[#FE4C55] rounded-full hover:bg-[#e9464e] text-base px-6 space-x-2 flex items-center"
        >
          <span className="text-base">Skip this Time</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
          </svg>
        </Button>
      </div>
      <Toaster />
    </div>
  );
};

export default ReminderPreviewWindow;
