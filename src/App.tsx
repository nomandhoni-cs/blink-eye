import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/window/Dashboard";
import Reminder from "./components/window/Reminder";
import useTimeCount from "./hooks/useTimeCount";
import Layout from "./components/window/Layout";
import UsageTime from "./components/window/UsageTime";
import ReminderStyles from "./components/ReminderStyles";
import ActivateLicense from "./components/window/ActivateLicense";
import AboutPage from "./components/window/AboutPage";
import PrivateRoute from "./components/window/PrivateRoutet";

function App() {
  const timeStamps = useTimeCount();

  // Calculate total hours and minutes
  // TODO: Use Context API to store timeStamps and calculate total time
  let totalSeconds = 0;

  timeStamps.forEach((timestamp) => {
    // Check to prevent negative time difference
    const timeDifferenceInSeconds =
      Math.max(timestamp.secondTimestamp - timestamp.firstTimestamp, 0) / 1000; // Convert ms to seconds and prevent negative values

    totalSeconds += timeDifferenceInSeconds;
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const timeCount = { hours, minutes };

  const userHaveLicenseKey = false;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index path="/" element={<Dashboard />} />
          <Route
            element={<PrivateRoute userHaveLicenseKey={userHaveLicenseKey} />}
          >
            <Route path="usagetime" element={<UsageTime />} />
            <Route path="reminderthemes" element={<ReminderStyles />} />
          </Route>
          <Route path="activatelicense" element={<ActivateLicense />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
        <Route path="/reminder" element={<Reminder timeCount={timeCount} />} />
      </Routes>
    </Router>
  );
}

export default App;
