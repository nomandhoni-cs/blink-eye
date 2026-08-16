import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ParticleBackground from "./components/backgrounds/ParticleBackground";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderParticleBackground: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden">
        <ParticleBackground />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderParticleBackground />
  </React.StrictMode>,
);
