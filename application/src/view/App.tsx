import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "../view/App.css";
import Home from "./Home";
import { SystemTrayContext } from "../context";
import { useTauri } from "../hooks/setup";
import { type MenuItemOptions } from "@tauri-apps/api/menu";
import Dashboard from "@/components/window/Dashboard";
import Reminder from "@/components/window/Reminder";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import { Store } from "@tauri-apps/plugin-store";

const store = new Store(".settings.dat");

const openDashboard = async () => {
  const webview = new WebviewWindow("DashboardWindow", {
    url: "/dashboard",
    title: "Take A Break Reminder - Blink Eye",
  });
  webview.once("tauri://created", () => {
    console.log("Webview created");
  });
  webview.once("tauri://error", (e) => {
    console.error("Error creating webview:", e);
  });
};
const menuItems = [
  {
    id: "menuID",
    text: "Dashboard",
    action: async () => {
      await openDashboard();
    },
  },
] as MenuItemOptions[];

function App() {
  const tauriAPIs = useTauri(menuItems);
  const [interval, setInterval] = useState<number>(20);
  const openReminderWindow = () => {
    console.log("Clicked");
    const webview = new WebviewWindow("ReminderWindow", {
      url: "/reminder",
      fullscreen: true,
      alwaysOnTop: true,
      title: "Take A Break Reminder - Blink Eye",
    });
    webview.once("tauri://created", () => {
      console.log("Webview created");
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating webview:", e);
    });
  };

  // Creating Reminder Window
  useEffect(() => {
    let timer: number | null = null;

    const startTimer = () => {
      timer = window.setInterval(() => {
        openReminderWindow();
      }, interval * 60 * 1000);
    };

    startTimer();

    return () => {
      if (timer !== null) window.clearInterval(timer);
    };
  }, [interval]);

  useEffect(() => {
    const fetchSettings = async () => {
      const storedInterval = await store.get<number>(
        "blinkEyeReminderInterval"
      );
      if (typeof storedInterval === "number") {
        setInterval(storedInterval);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SystemTrayContext.Provider value={tauriAPIs}>
      <Router>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reminder" element={<Reminder />} />
        </Routes>
      </Router>
    </SystemTrayContext.Provider>
  );
}

export default App;
