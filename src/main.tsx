import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import DefaultStartMinimize from "./components/DefaultStartMinimize";
import EncryptionComponent from "./components/EncryptionComponent";
import LicenseValidationComponent from "./components/LicenseValidationComponent";
import { PremiumFeaturesProvider } from "./contexts/PremiumFeaturesContext";
import ConfigDataLoader from "./components/ConfigDataLoader";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PremiumFeaturesProvider>
        <DefaultStartMinimize />
        <EncryptionComponent />
        <LicenseValidationComponent />
        <ConfigDataLoader />
        <App />
      </PremiumFeaturesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
