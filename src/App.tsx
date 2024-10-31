import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/window/Dashboard";
import Home from "./components/window/Home";
import Reminder from "./components/window/Reminder";

function App() {
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<Dashboard />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
