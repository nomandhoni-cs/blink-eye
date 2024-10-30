import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AutoStart from "./components/AutoStart";
import TrayIconComponent from "./components/TrayIconComponent";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TrayIconComponent />
    <AutoStart />
    <App />
  </React.StrictMode>
);
