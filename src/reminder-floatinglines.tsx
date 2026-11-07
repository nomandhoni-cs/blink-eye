import React from "react";
import { WebGLSceneFallback } from "./components/backgrounds/react-bits/WebGLSceneFallback";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import FloatingLines from "./components/backgrounds/react-bits/FloatingLines";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const FloatingLinesScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  const [rendererError, setRendererError] = React.useState<string | null>(null);
  const handleRendererError = React.useCallback((reason: string) => setRendererError(reason), []);
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <FloatingLines
          linesGradient={isDark ? ["#ff3db7", "#7655ff", "#36dfff"] : ["#c52391", "#6249d6", "#168db7"]}
          lineCount={[8, 10, 12]} lineDistance={[6, 5, 4]} animationSpeed={0.78}
          amplitude={1.15} lineWidth={1.25} glow={1.2}
          brightness={isDark ? 1.15 : 0.92} depthOfField={0.62} edgeFade={0.16}
          interactive bendRadius={5.3} bendStrength={-0.48}
          parallax clickSwirl intro lightMode={!isDark}
          backgroundColor={isDark ? "#080a1b" : "#f6f7ff"} dpr={1}
          onRendererError={handleRendererError}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {rendererError && <WebGLSceneFallback scene="floatingLines" isDark={isDark} />}
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderFloatingLines: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FloatingLinesScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderFloatingLines;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderFloatingLines />
  </React.StrictMode>,
);
