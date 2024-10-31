import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/window/Dashboard";
import Home from "./components/window/Home";
import Reminder from "./components/window/Reminder";
import useTimeCount from "./hooks/useTimeCount";

function App() {
  const timeCount = useTimeCount();
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<Dashboard />} />
        <Route path="/reminder" element={<Reminder timeCount={timeCount} />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
