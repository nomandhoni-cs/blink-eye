import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import DefaultStartMinimize from "./components/DefaultStartMinimize";
import EncryptionComponent from "./components/EncryptionComponent";
import LicenseValidationComponent from "./components/LicenseValidationComponent";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DefaultStartMinimize />
      <EncryptionComponent />
      <LicenseValidationComponent />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
