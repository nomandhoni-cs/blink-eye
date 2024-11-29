import React, { useState } from "react";
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
import { LoadingSpinner } from "./components/LoadingSpinner";

if (!import.meta.env.DEV) {
  document.oncontextmenu = (event) => {
    event.preventDefault();
  };
}

const Root: React.FC = () => {
  const [isEncryptionComplete, setEncryptionComplete] = useState(false);

  return (
    <>
      {!isEncryptionComplete ? (
        <LoadingSpinner />
      ) : (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <PremiumFeaturesProvider>
            <DefaultStartMinimize />
            <ConfigDataLoader />
            <LicenseValidationComponent />
            <TriggerProvider>
              <ReminderHandler />
              <App />
            </TriggerProvider>
          </PremiumFeaturesProvider>
        </ThemeProvider>
      )}
      <EncryptionComponent
        onSetupComplete={() => setEncryptionComplete(true)}
      />
    </>
  );
};

export default Root;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Root />
);
