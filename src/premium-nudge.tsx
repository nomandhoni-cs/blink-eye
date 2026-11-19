import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import PremiumNudgeWindow from "./components/window/PremiumNudgeWindow";

import { initI18n } from "./i18n";
const PremiumNudgeApp: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PremiumNudgeWindow />
    </ThemeProvider>
  );
};

initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PremiumNudgeApp />
  </React.StrictMode>,
  );
});
