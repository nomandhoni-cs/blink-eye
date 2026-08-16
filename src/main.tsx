import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccentColorProvider } from "@/contexts/AccentColorContext";
import DefaultStartMinimize from "@/components/DefaultStartMinimize";
import LicenseValidationComponent from "@/components/LicenseValidationComponent";
import { PremiumFeaturesProvider } from "@/contexts/PremiumFeaturesContext";
import ConfigDataLoader from "@/components/ConfigDataLoader";
import { TriggerProvider } from "./contexts/TriggerReRender";
import { TooltipProvider } from "@/components/ui/tooltip";

if (!import.meta.env.DEV) {
  document.oncontextmenu = (event) => {
    event.preventDefault();
  };
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigDataLoader />
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AccentColorProvider>
        <PremiumFeaturesProvider>
          <DefaultStartMinimize />
          <LicenseValidationComponent />
          <TriggerProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </TriggerProvider>
        </PremiumFeaturesProvider>
      </AccentColorProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
