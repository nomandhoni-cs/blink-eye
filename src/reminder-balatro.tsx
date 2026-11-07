import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Balatro from "./components/backgrounds/react-bits/Balatro";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderBalatro: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden bg-[#100d24]">
        <Balatro
          color1="#ff3c8c"
          color2="#17c9ff"
          color3="#130e2a"
          contrast={3.3}
          lighting={0.72}
          swirl={0.38}
          speed={0.52}
          rotationSpeed={0.045}
          scale={1.08}
          detail={6}
          pixelSize={1.4}
          crt={0.08}
          mouseInteraction
          mouseStrength={0.65}
          clickSwirl
          maxDevicePixelRatio={1.5}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

export default ReminderBalatro;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderBalatro />
  </React.StrictMode>,
);
