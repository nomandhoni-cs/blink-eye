import { Routes, Route, BrowserRouter as Router, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import "./index.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import TimeCountProvider from "./contexts/TimeCountContext";
import UserOnboarding from "./blink-eye-onboarding";
import DebugPremiumPanel from "./components/DebugPremiumPanel";



const ScreenSavers = lazy(() => import("./components/window/ScreenSavers"));
const ScreenSaverWindow = lazy(
  () => import("./components/window/ScreenSaverWindow"),
);
const Support = lazy(() => import("./components/window/Support"));
const Layout = lazy(() => import("./components/window/Layout"));
const Workday = lazy(() => import("./components/window/Workday"));
const Dashboard = lazy(() => import("./components/window/Dashboard"));
const ReminderSettings = lazy(() => import("./components/window/ReminderSettings"));
const UsageTime = lazy(() => import("./components/window/UsageTime"));
const ReminderStyles = lazy(() => import("./components/ReminderStyles"));
const ActivateLicense = lazy(
  () => import("./components/window/ActivateLicense"),
);
const AllSettings = lazy(() => import("./components/window/AllSettings"));
const ThemePickerPage = lazy(() => import("./components/window/ThemePickerPage"));
const AboutPage = lazy(() => import("./components/window/AboutPage"));
const Soon = lazy(() => import("./components/window/Soon"));
const TodoPage = lazy(() => import("./components/window/TodoPage"));
const MultiMonitor = lazy(() => import("./components/window/MultiMonitor"));

// Define main application routes
const layoutRoutes = [
  { index: true, element: Dashboard },
  { path: "reminderSettings", element: ReminderSettings },
  { path: "reminderthemes", element: ReminderStyles },
  { path: "usagetime", element: UsageTime },
  { path: "todoList", element: TodoPage },
  { path: "multimonitor", element: MultiMonitor },
  { path: "workday", element: Workday },
  { path: "activatelicense", element: ActivateLicense },
  { path: "allSettings", element: AllSettings },
  { path: "themePicker", element: ThemePickerPage },
  { path: "screenSavers", element: ScreenSavers },
  { path: "about", element: AboutPage },
  { path: "soon", element: Soon },
];

// Listens for the premium nudge window's "View premium" action (Rust emits
// `open-activate-license`) and routes the main window to license activation.
function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("open-activate-license", () => {
      navigate("/activatelicense");
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((err) => {
        console.error("Failed to listen for deep links:", err);
      });
    return () => {
      unlisten?.();
    };
  }, [navigate]);

  return null;
}

function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await invoke<string | null>("get_config_string", {
          key: "isUserOnboarded",
        });
        setHasCompletedOnboarding(value === "true");
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        setError("Failed to load app configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasCompletedOnboarding) {
    return <UserOnboarding />;
  }

  return (
    <TimeCountProvider>
      <Router>
        <DeepLinkHandler />
        <Routes>
          {/* Standalone routes */}
          <Route path="/support_reminder" element={<Support />} />
          <Route path="/screenSaverWindow" element={<ScreenSaverWindow />} />

          {/* Main application routes with Layout */}
          <Route element={<Layout />}>
            {layoutRoutes.map(({ index, path, element: Element }) => (
              <Route
                key={path || "index"}
                index={index}
                path={path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Element />
                  </Suspense>
                }
              />
            ))}
          </Route>
        </Routes>
      </Router>
      {/* Debug tooling (nudge inspector + preview) — dev builds only. */}
      {import.meta.env.DEV && <DebugPremiumPanel />}
    </TimeCountProvider>
  );
}

export default App;
