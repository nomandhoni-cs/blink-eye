import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Dashboard from "./components/window/Dashboard";
import "./index.css";
import Reminder from "./components/window/Reminder";

function App() {
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<Dashboard />} />
        <Route path="/reminder" element={<Reminder />} />
      </Routes>
    </Router>
  );
}

export default App;
