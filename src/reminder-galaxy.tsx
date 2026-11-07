import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Galaxy from "./components/backgrounds/react-bits/Galaxy";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const GalaxyScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <Galaxy
          focal={[0.5, 0.5]} rotation={[1, 0]} starSpeed={0.52} density={1.08}
          hueShift={isDark ? 185 : 225} speed={0.8} mouseInteraction
          glowIntensity={0.38} saturation={isDark ? 0.65 : 0.85}
          mouseRepulsion repulsionStrength={2.4} twinkleIntensity={0.45}
          rotationSpeed={0.12} transparent={false} lightMode={!isDark}
          starColors={isDark ? ["#82efff", "#c696ff", "#fff0a0"] : ["#2268b8", "#7140c5", "#cd7a38"]}
          starSize={1.15} flareIntensity={0.85} layers={4} clickWarp intro
          backgroundColor={isDark ? "#050818" : "#f0f3ff"}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh"}}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderGalaxy: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GalaxyScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderGalaxy;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderGalaxy />
  </React.StrictMode>,
);
