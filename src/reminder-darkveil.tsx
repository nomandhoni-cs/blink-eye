import React from "react";
import { WebGLSceneFallback } from "./components/backgrounds/react-bits/WebGLSceneFallback";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import DarkVeil from "./components/backgrounds/react-bits/DarkVeil";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const DarkVeilScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  const [rendererError, setRendererError] = React.useState<string | null>(null);
  const handleRendererError = React.useCallback((reason: string) => setRendererError(reason), []);
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <DarkVeil
          color={isDark ? "#8a42ff" : "#4d78ef"} speed={0.42} scale={1.15}
          rotation={-12} flow={1.1} warp={0.18} variation={0.3}
          brightness={isDark ? 1.05 : 1.25} sheen={0.48} glow={0.72}
          grain={0.035} quality={0.55} dpr={1} mouseInteraction mouseStrength={0.65}
          lightMode={!isDark} fade={0.12} onRendererError={handleRendererError}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: isDark ? "#080918" : "#eef2ff" }}
        />
      {rendererError && <WebGLSceneFallback scene="darkVeil" isDark={isDark} />}
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderDarkVeil: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DarkVeilScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderDarkVeil;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderDarkVeil />
  </React.StrictMode>,
);
