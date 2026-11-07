import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Dither from "./components/backgrounds/react-bits/Dither";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const DitherScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <Dither
          waveSpeed={0.055} waveFrequency={3.2} waveAmplitude={0.38}
          waveColor={isDark ? [0.22, 0.78, 1] : [0.2, 0.25, 0.72]}
          backgroundColor={isDark ? [0.018, 0.024, 0.075] : [0.94, 0.95, 1]}
          colorNum={5} pixelSize={2} enableMouseInteraction
          mouseRadius={1.15} ditherMode="bayer" scale={1.05}
          contrast={isDark ? 1.14 : 0.92} brightness={isDark ? 0.12 : 0.18}
          mouseEffect="ripple" mouseStrength={0.7} trail={0.45} clickRipple
          dpr={1.25}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderDither: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DitherScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderDither;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderDither />
  </React.StrictMode>,
);
