import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/window/Dashboard";
import Reminder from "./components/window/Reminder";
import Layout from "./components/window/Layout";
import UsageTime from "./components/window/UsageTime";
import ReminderStyles from "./components/ReminderStyles";
import ActivateLicense from "./components/window/ActivateLicense";
import AboutPage from "./components/window/AboutPage";
import { TimeCountProvider } from "./contexts/TimeCountContext";
import AllSettings from "./components/window/AllSettings";
import Soon from "./components/window/Soon";
import ReminderPreviewWindow from "./components/window/ReminderPreviewWindow";
import { useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";

function App() {
  useEffect(() => {
    const initializeAutoStart = async () => {
      try {
        const store = await load("initialSetupConfig.json", {
          autoSave: true, // Enable auto-saving to simplify updates
        });

        // Check if AutoStart should be enabled
        const runOnStartUp = await store.get<boolean>(
          "isRunOnStartUpEnabledByDefault"
        );

        if (runOnStartUp === undefined) {
          // If setting does not exist, enable autostart and save the new state
          await enable();
          await store.set("isRunOnStartUpEnabledByDefault", true);
          toast.success("AutoStart Enabled by Default", {
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          // Confirm that the autostart plugin is enabled if setting is true
          const isAutoStartEnabled = await isEnabled();
          if (runOnStartUp && !isAutoStartEnabled) {
            await enable();
            toast.success("AutoStart Enabled by Default", {
              duration: 2000,
              position: "bottom-right",
            });
          }
        }
      } catch (error) {
        console.error("Failed to initialize autostart:", error);
        toast.error("AutoStart setup failed. Check console for details.", {
          duration: 2000,
          position: "bottom-right",
        });
      }
    };
    initializeAutoStart();
  }, []);

  return (
    <TimeCountProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index path="/" element={<Dashboard />} />
            <Route path="usagetime" element={<UsageTime />} />
            <Route path="reminderthemes" element={<ReminderStyles />} />
            <Route path="activatelicense" element={<ActivateLicense />} />
            <Route path="allSettings" element={<AllSettings />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="soon" element={<Soon />} />
          </Route>
          <Route path="/reminder" element={<Reminder />} />
          <Route
            path="/reminderpreviewwindow"
            element={<ReminderPreviewWindow />}
          />
        </Routes>
      </Router>
    </TimeCountProvider>
  );
}

export default App;
