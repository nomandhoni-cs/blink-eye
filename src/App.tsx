import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/window/Dashboard";
import Reminder from "./components/window/Reminder";
import useTimeCount from "./hooks/useTimeCount";
import Layout from "./components/window/Layout";
import UsageTime from "./components/window/UsageTime";
import ReminderStyles from "./components/ReminderStyles";

function App() {
  const timeCount = useTimeCount();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index path="dashboard" element={<Dashboard />} />
          <Route path="usagetime" element={<UsageTime />} />
          <Route path="reminderthemes" element={<ReminderStyles />} />
        </Route>
        <Route path="/reminder" element={<Reminder timeCount={timeCount} />} />
      </Routes>
    </Router>
  );
}

export default App;
