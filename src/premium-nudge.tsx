import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import PremiumNudgeWindow from "./components/window/PremiumNudgeWindow";

const PremiumNudgeApp: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PremiumNudgeWindow />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PremiumNudgeApp />
  </React.StrictMode>,
);
