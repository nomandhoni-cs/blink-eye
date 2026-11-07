import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import AcidSquares from "./components/backgrounds/react-bits/AcidSquares";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const AcidSquaresScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <AcidSquares
          color={isDark ? "#120f17" : "#f5f3ff"}
          accentColor={isDark ? "#ff4fb8" : "#d42d9b"}
          secondaryColor={isDark ? "#3b6bff" : "#3359c8"}
          tileSize={1.05} gap={0.12} roundness={0.28} softness={0.5}
          bulge={0.34} rotation={35} gloss={0.72} waves={1.1} speed={0.55}
          pulse={1} brightness={1.15} lighting="split" tilt={0.7}
          mouseInteraction mouseStrength={0.72} pulseOnClick
          detail="high" lightMode={!isDark}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderAcidSquares: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AcidSquaresScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderAcidSquares;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderAcidSquares />
  </React.StrictMode>,
);
