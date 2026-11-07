import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Antigravity from "./components/backgrounds/react-bits/Antigravity";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const AntigravityScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <Antigravity
          count={1150} colors={isDark ? ["#ff5c52", "#ffad42", "#ffd166", "#ff6fae"] : ["#c93c36", "#e27b24", "#c14a6e", "#a85b16"]}
          colorMode="conic" colorSpeed={0.07} autoAnimate
          particleSize={0.85} particleShape="capsule" ringRadius={7.2}
          magnetRadius={9} waveSpeed={0.45} waveAmplitude={1.05}
          interactive clickBurst lightMode={!isDark} ambient={isDark ? 0.28 : 0.68}
          maxDevicePixelRatio={1.5}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderAntigravity: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AntigravityScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderAntigravity;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderAntigravity />
  </React.StrictMode>,
);
