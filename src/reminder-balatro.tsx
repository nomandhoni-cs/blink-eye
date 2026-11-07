import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Balatro from "./components/backgrounds/react-bits/Balatro";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const BalatroScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({
  isPremium,
  minimal,
}) => {
  const isDark = useReminderDarkMode();
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: isDark ? "#100d24" : "#f3f4ff" }}
    >
      <Balatro
        color1={isDark ? "#ff3c8c" : "#d72670"}
        color2={isDark ? "#17c9ff" : "#326ad8"}
        color3={isDark ? "#130e2a" : "#f3f4ff"}
        contrast={isDark ? 3.3 : 2.35}
        lighting={0.72}
        swirl={0.38}
        speed={0.52}
        rotationSpeed={0.045}
        scale={1.08}
        detail={6}
        pixelSize={1.4}
        crt={0.08}
        mouseInteraction
        mouseStrength={0.65}
        clickSwirl
        maxDevicePixelRatio={1.5}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
      />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderBalatro: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BalatroScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderBalatro;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderBalatro />
  </React.StrictMode>,
);
