import React from "react";
import { WebGLSceneFallback } from "./components/backgrounds/react-bits/WebGLSceneFallback";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Iridescence from "./components/backgrounds/react-bits/Iridescence";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const IridescenceScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({
  isPremium,
  minimal,
}) => {
  const isDark = useReminderDarkMode();
  const [rendererError, setRendererError] = React.useState<string | null>(null);
  const handleRendererError = React.useCallback((reason: string) => setRendererError(reason), []);
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: isDark ? "#0d1027" : "#f4f5ff" }}
    >
      <Iridescence
        color={isDark ? [0.74, 0.68, 1] : [1, 0.94, 0.79]}
        hueShift={isDark ? 28 : -18}
        saturation={1.28}
        brightness={isDark ? 1.45 : 1.42}
        contrast={isDark ? 1.2 : 0.82}
        speed={0.72}
        scale={1.08}
        detail={9}
        warp={1.25}
        mouseReact
        amplitude={0.08}
        stir={0.58}
        sheen={0.55}
        clickSwirl
        grain={0.025}
        resolution={0.8}
        onRendererError={handleRendererError}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
      />
      {rendererError && <WebGLSceneFallback scene="iridescence" isDark={isDark} />}
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderIridescence: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <IridescenceScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderIridescence;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderIridescence />
  </React.StrictMode>,
);
