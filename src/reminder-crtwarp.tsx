import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import CRTWarp from "./components/backgrounds/react-bits/CRTWarp";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const CRTWarpScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <CRTWarp
          color={isDark ? "#7fffd2" : "#245fc7"}
          backgroundColor={isDark ? "#06120f" : "#eef4ff"}
          speed={0.44} variation={0.35} waveAmplitude={0.22}
          waveFrequency={0.9} levels={4} columns={40} persistence={0.65}
          curvature={0.16} corners={0.24} scanlineStrength={0.42}
          scanlineFrequency={1.1} mask="aperture" maskStrength={0.22}
          bloom={0.24} rgbShift={0.3} noise={0.18} flicker={0.08}
          interference={0.15} vignette={0.35} brightness={isDark ? 0.92 : 1.08}
          mouseReact changeOnClick lightMode={!isDark} fps={50}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderCRTWarp: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CRTWarpScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderCRTWarp;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderCRTWarp />
  </React.StrictMode>,
);
