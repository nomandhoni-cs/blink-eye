import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ShootingMeteor from "./components/backgrounds/ShootingMeteor";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderShootingMeteor: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden">
        <ShootingMeteor number={40} />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderShootingMeteor />
  </React.StrictMode>,
);
