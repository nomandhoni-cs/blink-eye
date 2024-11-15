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

function App() {
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
