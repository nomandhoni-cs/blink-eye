import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { TimeCountProvider } from "./contexts/TimeCountContext";
import "./App.css";
import { useAutoStart } from "./hooks/useAutoStart";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load route components
const Reminder = lazy(() => import("./components/window/Reminder"));
const Layout = lazy(() => import("./components/window/Layout"));
const ReminderPreviewWindow = lazy(
  () => import("./components/window/ReminderPreviewWindow")
);
const Workday = lazy(() => import("./components/window/Workday"));
const Dashboard = lazy(() => import("./components/window/Dashboard"));
const UsageTime = lazy(() => import("./components/window/UsageTime"));
const ReminderStyles = lazy(() => import("./components/ReminderStyles"));
const ActivateLicense = lazy(
  () => import("./components/window/ActivateLicense")
);
const AllSettings = lazy(() => import("./components/window/AllSettings"));
const AboutPage = lazy(() => import("./components/window/AboutPage"));
const Soon = lazy(() => import("./components/window/Soon"));

function App() {
  const { isInitialized, error, retry } = useAutoStart();

  if (error) {
    return <ErrorDisplay message={error} onRetry={retry} />;
  }

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <TimeCountProvider>
      <Router>
        <Routes>
          {/* Standalone routes - no loading state */}
          <Route path="/reminder" element={<Reminder />} />
          <Route
            path="/reminderpreviewwindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReminderPreviewWindow />
              </Suspense>
            }
          />
          {/* Main application routes with Layout and loading states */}
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="reminderthemes"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ReminderStyles />
                </Suspense>
              }
            />
            <Route
              path="usagetime"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <UsageTime />
                </Suspense>
              }
            />
            <Route
              path="workday"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Workday />
                </Suspense>
              }
            />
            <Route
              path="activatelicense"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ActivateLicense />
                </Suspense>
              }
            />
            <Route
              path="allSettings"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AllSettings />
                </Suspense>
              }
            />
            <Route
              path="about"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AboutPage />
                </Suspense>
              }
            />
            <Route
              path="soon"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Soon />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Router>
    </TimeCountProvider>
  );
}

export default App;
