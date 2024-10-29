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
        <Route path="/home" element={<Home />} />
        <Route path="/reminder" element={<Reminder />} />
      </Routes>
    </Router>
  );
}

export default App;
