import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { XIcon } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import logo from "./assets/newIcon.png";
import { Button } from "./components/ui/button";
import { handlePlayAudio } from "./lib/audioPlayer";
import AllSetText from "./components/AllSetText";
import "./App.css";

const Alert = () => {
  const [timeLeft, setTimeLeft] = useState(13);

  const [showAllSet, setShowAllSet] = useState(true);
  const window = getCurrentWebviewWindow();

  useEffect(() => {
    handlePlayAudio("before_alert.mp3");

    // Show AllSet text for 2.5 seconds, then switch to controls
    const timer = setTimeout(() => {
      setShowAllSet(false);

      // Start countdown
      const countdownTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = async () => {
    await window.close();
  };

  return (
    <div className="h-screen w-full flex items-center justify-between bg-black/90 rounded-3xl px-4 backdrop-blur-3xl border border-white/20 shadow-lg shadow-[rgba(31,38,135,0.37)] animate-in slide-in-from-top duration-300">
      {!showAllSet && <img src={logo} className="h-12 w-12" alt="Blink Eye" />}
      <h2 className="font-heading text-white text-6xl mx-auto">
        {showAllSet ? (
          <div className="p-10">
            <AllSetText />
          </div>
        ) : timeLeft > 0 ? (
          `00:${String(timeLeft).padStart(2, "0")}`
        ) : (
          "00:00"
        )}
      </h2>
      {!showAllSet && (
        <Button onClick={handleClose} className="rounded-lg h-10 w-10">
          <XIcon className="w-6 h-6 hover:rotate-90" />
        </Button>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("alert-root")!).render(
  <React.StrictMode>
    <Alert />
  </React.StrictMode>
);
