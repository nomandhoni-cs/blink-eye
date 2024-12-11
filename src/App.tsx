import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { TimeCountProvider } from "./contexts/TimeCountContext";
import "./App.css";
import { useAutoStart } from "./hooks/useAutoStart";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
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

// Lazy load route components
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
          <Route path="/screenSaverWindow" element={<ScreenSaverWindow />} />
          <Route
            path="/reminderpreviewwindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReminderPreviewWindow />
              </Suspense>
            }
          />
          <Route
            path="/PlainReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <PlainBGWrapper>
                  <ReminderControl />
                </PlainBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/AuroraReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AuroraBGWrapper>
                  <ReminderControl />
                </AuroraBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/BeamOfLifeReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <BeamOfLifeBGWrapper>
                  <ReminderControl />
                </BeamOfLifeBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/FreeSpiritReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FreeSpiritBGWrapper>
                  <ReminderControl />
                </FreeSpiritBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/CanvasShapesReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CanvasShapesBGWrapper>
                  <ReminderControl />
                </CanvasShapesBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/ParticleBackgroundReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ParticleBackgroundBGWrapper>
                  <ReminderControl />
                </ParticleBackgroundBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/PlainGradientAnimationReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <PlainGradientAnimationBGWrapper>
                  <ReminderControl />
                </PlainGradientAnimationBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/StarryBackgroundReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <StarryBackgroundBGWrapper>
                  <ReminderControl />
                </StarryBackgroundBGWrapper>
              </Suspense>
            }
          />
          <Route
            path="/ShootingMeteorReminderWindow"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ShootingMeteorBGWrapper>
                  <ReminderControl />
                </ShootingMeteorBGWrapper>
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
              path="todoList"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TodoPage />
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
              path="screenSavers"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ScreenSavers />
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
