import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Beams from "./components/backgrounds/react-bits/Beams";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderReactBeams: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden bg-[#100d2c]">
        <Beams
          color="#ffc7f3"
          beamWidth={176}
          rotation={24}
          speed={0.72}
          waveLength={248}
          depth={1.45}
          sharpness={0.72}
          twist={0.24}
          fillLight={0.54}
          glow={1.05}
          brightness={2.1}
          variation={0.55}
          grain={0.16}
          quality={0.72}
          mouseInteraction
          mouseStrength={0.62}
          fade={0.08}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

export default ReminderReactBeams;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderReactBeams />
  </React.StrictMode>,
);
