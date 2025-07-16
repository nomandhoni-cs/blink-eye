import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import DefaultStartMinimize from "./components/DefaultStartMinimize";
import EncryptionComponent from "./components/EncryptionComponent";
import LicenseValidationComponent from "./components/LicenseValidationComponent";
import { PremiumFeaturesProvider } from "./contexts/PremiumFeaturesContext";
import ConfigDataLoader from "./components/ConfigDataLoader";
import ReminderHandler from "./components/ReminderHandler";
import { TriggerProvider } from "./contexts/TriggerReRender";
import ScreenTimeTracker from "./components/ScreenTimeTracker";
import SupportDeveloperHandler from "./components/SupportDeveloperHandler";

if (!import.meta.env.DEV) {
  document.oncontextmenu = (event) => {
    event.preventDefault();
  };
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <EncryptionComponent />
    <ConfigDataLoader />
    <ScreenTimeTracker />
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PremiumFeaturesProvider>
        <DefaultStartMinimize />
        <LicenseValidationComponent />
        <TriggerProvider>
          <SupportDeveloperHandler />
          <ReminderHandler />
          <App />
        </TriggerProvider>
      </PremiumFeaturesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
