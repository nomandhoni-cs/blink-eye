import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AutoStart from "./components/AutoStart";
import { ThemeProvider } from "./components/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AutoStart />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
