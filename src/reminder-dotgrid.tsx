import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import DotGrid from "./components/backgrounds/react-bits/DotGrid";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const DotGridScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <DotGrid
          dotSize={5} gap={19} baseColor={isDark ? "#302944" : "#d4d4e4"}
          activeColor={isDark ? "#66efff" : "#613ac7"} proximity={145}
          strength={1.05} bounce={0.72} tension={0.42} returnDuration={0.8}
          shockRadius={310} shockStrength={4.5} swell={0.84} stretch={0.6}
          glow={0.7} shape="circle" mouseInteraction clickShock
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderDotGrid: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DotGridScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderDotGrid;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderDotGrid />
  </React.StrictMode>,
);
