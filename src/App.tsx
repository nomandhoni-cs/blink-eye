import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import "./index.css";
import { useAutoStart } from "./hooks/useAutoStart";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import TimeCountProvider from "./contexts/TimeCountContext";
import UserOnboarding from "./blink-eye-onboarding";
import Database from "@tauri-apps/plugin-sql";
import DebugPremiumPanel from "./components/DebugPremiumPanel";



const ScreenSavers = lazy(() => import("./components/window/ScreenSavers"));
const ScreenSaverWindow = lazy(
  () => import("./components/window/ScreenSaverWindow"),
);
const Support = lazy(() => import("./components/window/Support"));
const Layout = lazy(() => import("./components/window/Layout"));
const ReminderPreviewWindow = lazy(
  () => import("./components/window/ReminderPreviewWindow"),
);
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

function App() {
  const { isInitialized, error, retry } = useAutoStart();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const db = await Database.load("sqlite:appconfig.db");
        const result = await db.select(
          "SELECT value FROM config WHERE key = 'isUserOnboarded'",
        );

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          "value" in result[0]
        ) {
          // Convert the string value to boolean
          setHasCompletedOnboarding(result[0].value === "true");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      checkOnboardingStatus();
    }
  }, [isInitialized]);

  if (error) {
    return <ErrorDisplay message={error} onRetry={retry} />;
  }

  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasCompletedOnboarding) {
    return <UserOnboarding />;
  }

  return (
    <TimeCountProvider>
      <Router>
        <Routes>
          {/* Standalone routes */}
          <Route path="/support_reminder" element={<Support />} />
          <Route path="/screenSaverWindow" element={<ScreenSaverWindow />} />
          <Route
            path="/reminderpreviewwindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReminderPreviewWindow />
              </Suspense>
            }
          />

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
      {/*<DebugPremiumPanel />*/}
    </TimeCountProvider>
  );
}

export default App;
