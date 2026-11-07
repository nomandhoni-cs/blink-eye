import React from "react";
import { WebGLSceneFallback } from "./components/backgrounds/react-bits/WebGLSceneFallback";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Ballpit from "./components/backgrounds/react-bits/Ballpit";
import { useReminderDarkMode } from "./components/backgrounds/react-bits/useReminderDarkMode";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const BallpitScene: React.FC<{ isPremium: boolean; minimal: boolean }> = ({ isPremium, minimal }) => {
  const isDark = useReminderDarkMode();
  const [rendererError, setRendererError] = React.useState<string | null>(null);
  const handleRendererError = React.useCallback((reason: string) => setRendererError(reason), []);
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: isDark ? "#080a1b" : "#f5f6ff" }}>
        <Ballpit
          count={150} colors={isDark ? [0xff3d9a, 0x39dfff, 0xffd24a, 0x8d72ff] : [0xc9287b, 0x188bbd, 0xe59b25, 0x654bcc]}
          material="gloss" minSize={0.55} maxSize={1.05} gravity={0.32}
          friction={0.994} wallBounce={0.94} bounce={0.88} depth={2.4}
          drift={0.48} followCursor grab clickEffect="burst"
          lightColor={isDark ? "#fff0cb" : "#ffffff"} lightIntensity={1.25}
          exposure={isDark ? 1.05 : 0.92} shadows={0.5} dpr={1}
          onRendererError={handleRendererError}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
      {rendererError && <WebGLSceneFallback scene="ballpit" isDark={isDark} />}
      {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
    </div>
  );
};

const ReminderBallpit: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BallpitScene isPremium={isPremium} minimal={minimal} />
    </ThemeProvider>
  );
};

export default ReminderBallpit;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderBallpit />
  </React.StrictMode>,
);
