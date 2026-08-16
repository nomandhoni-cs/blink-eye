import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import DefaultBackground from "./components/backgrounds/DefaultBackground";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderDefaultBackground: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden">
        <DefaultBackground />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderDefaultBackground />
  </React.StrictMode>,
);
