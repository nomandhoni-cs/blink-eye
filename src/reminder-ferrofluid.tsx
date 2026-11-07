import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Ferrofluid from "./components/backgrounds/react-bits/Ferrofluid";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const FerrofluidScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <Ferrofluid
          colors={isDark ? ["#ff4bb7", "#45caff", "#8e57ff"] : ["#b82583", "#277bbb", "#7045c5"]}
          speed={0.48} scale={1.5} spikeHeight={0.82} sharpness={2.6}
          turbulence={1.05} fluidity={0.58} tilt={48} magnetism={1.1}
          flowDirection="down" brightness={isDark ? 1.08 : 0.9}
          mouseInteraction mouseStrength={0.7} mouseRadius={0.25}
          clickPulse intro lightMode={!isDark} transparent={false}
          color={isDark ? "#080a16" : "#f6f6ff"}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderFerrofluid: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FerrofluidScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderFerrofluid;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderFerrofluid />
  </React.StrictMode>,
);
