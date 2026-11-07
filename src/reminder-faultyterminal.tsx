import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import FaultyTerminal from "./components/backgrounds/react-bits/FaultyTerminal";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const FaultyTerminalScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <FaultyTerminal
          scale={1.05} gridMul={[2, 1]} digitSize={1.15} timeScale={0.72}
          scanlineIntensity={0.34} glitchAmount={0.18} flickerAmount={0.12}
          noiseAmp={0.9} chromaticAberration={0.0015} dither={0.22}
          curvature={0.12} tint={isDark ? "#62ff9b" : "#08774a"}
          mouseReact mouseStrength={0.52} pageLoadAnimation brightness={isDark ? 0.72 : 1.16}
          glyphs="characters" glow={0.42} persistence={0.32} scramble={0.14}
          mouseGlow={0.4} vignette={0.32} clickEffect="glitch"
          lightMode={!isDark}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: isDark ? "#06100a" : "#eff8f2" }}
        />
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderFaultyTerminal: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FaultyTerminalScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderFaultyTerminal;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderFaultyTerminal />
  </React.StrictMode>,
);
