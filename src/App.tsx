import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import "./App.css";
import { useAutoStart } from "./hooks/useAutoStart";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import TimeCountProvider from "./contexts/TimeCountContext";
import UserOnboarding from "./blink-eye-onboarding";

const ReminderControl = lazy(() => import("./components/ReminderControl"));
const BeamOfLifeBGWrapper = lazy(
  () => import("./components/ReminderWindows/BeamOfLifeBGWrapper")
);
const AuroraBGWrapper = lazy(
  () => import("./components/ReminderWindows/AuroraBGWrapper")
);
const PlainBGWrapper = lazy(
  () => import("./components/ReminderWindows/PlainBGWrapper")
);
const FreeSpiritBGWrapper = lazy(
  () => import("./components/ReminderWindows/FreeSpiritBGWrapper")
);
const CanvasShapesBGWrapper = lazy(
  () => import("./components/ReminderWindows/CanvasShapesBGWrapper")
);
const ParticleBackgroundBGWrapper = lazy(
  () => import("./components/ReminderWindows/ParticleBackgroundBGWrapper")
);
const PlainGradientAnimationBGWrapper = lazy(
  () => import("./components/ReminderWindows/PlainGradientAnimationBGWrapper")
);
const StarryBackgroundBGWrapper = lazy(
  () => import("./components/ReminderWindows/StarryBackgroundBGWrapper")
);
const ShootingMeteorBGWrapper = lazy(
  () => import("./components/ReminderWindows/ShootingMeteorBGWrapper")
);

const ScreenSavers = lazy(() => import("./components/window/ScreenSavers"));
const ScreenSaverWindow = lazy(
  () => import("./components/window/ScreenSaverWindow")
);
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
const TodoPage = lazy(() => import("./components/window/TodoPage"));

// Define routes that use a background wrapper around ReminderControl
const reminderWindowRoutes = [
  { path: "/PlainReminderWindow", Wrapper: PlainBGWrapper },
  { path: "/AuroraReminderWindow", Wrapper: AuroraBGWrapper },
  { path: "/BeamOfLifeReminderWindow", Wrapper: BeamOfLifeBGWrapper },
  { path: "/FreeSpiritReminderWindow", Wrapper: FreeSpiritBGWrapper },
  { path: "/CanvasShapesReminderWindow", Wrapper: CanvasShapesBGWrapper },
  {
    path: "/ParticleBackgroundReminderWindow",
    Wrapper: ParticleBackgroundBGWrapper,
  },
  {
    path: "/PlainGradientAnimationReminderWindow",
    Wrapper: PlainGradientAnimationBGWrapper,
  },
  {
    path: "/StarryBackgroundReminderWindow",
    Wrapper: StarryBackgroundBGWrapper,
  },
  { path: "/ShootingMeteorReminderWindow", Wrapper: ShootingMeteorBGWrapper },
];

// Define main application routes
const layoutRoutes = [
  { index: true, element: Dashboard },
  { path: "reminderthemes", element: ReminderStyles },
  { path: "usagetime", element: UsageTime },
  { path: "todoList", element: TodoPage },
  { path: "workday", element: Workday },
  { path: "activatelicense", element: ActivateLicense },
  { path: "allSettings", element: AllSettings },
  { path: "screenSavers", element: ScreenSavers },
  { path: "about", element: AboutPage },
  { path: "soon", element: Soon },
];

function App() {
  const { isInitialized, error, retry } = useAutoStart();
  const hasCompletedOnboarding =
    localStorage.getItem("hasCompletedOnboarding") !== "true";

  if (error) {
    return <ErrorDisplay message={error} onRetry={retry} />;
  }

  if (!isInitialized) {
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
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/screenSaverWindow" element={<ScreenSaverWindow />} />
          <Route
            path="/reminderpreviewwindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReminderPreviewWindow />
              </Suspense>
            }
          />

          {/* Reminder window routes using background wrappers */}
          {reminderWindowRoutes.map(({ path, Wrapper }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Wrapper>
                    <ReminderControl />
                  </Wrapper>
                </Suspense>
              }
            />
          ))}

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
    </TimeCountProvider>
  );
}

export default App;
