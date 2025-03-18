import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { XIcon } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import logo from "./assets/icon.png";
import { Button } from "./components/ui/button";
import { handlePlayAudio } from "./lib/audioPlayer";
// import { usePremiumFeatures } from "./contexts/PremiumFeaturesContext";

const Alert = () => {
  //   const { canAccessPremiumFeatures } = usePremiumFeatures();
  const [timeLeft, setTimeLeft] = useState(15);
  const [message, setMessage] = useState("All Set?");
  const [showControls, setShowControls] = useState(false);
  const window = getCurrentWebviewWindow();

  useEffect(() => {
    handlePlayAudio("before_alert.mp3");
    // if (canAccessPremiumFeatures) {
    // }
    // First message for 1 second
    const timer1 = setTimeout(() => {
      setMessage("Prepare!");

      // Second message for 1 second
      const timer2 = setTimeout(() => {
        setMessage("");
        setShowControls(true);
        setTimeLeft(13);

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
      }, 1000);

      return () => clearTimeout(timer2);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  const handleClose = async () => {
    await window.close();
  };

  return (
    <div className="h-screen w-full flex items-center justify-between bg-gray-900 rounded-full px-4 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-90 border-4 border-gray-100 animate-in slide-in-from-top duration-300">
      {showControls && <img src={logo} className="w-10" alt="Blink Eye" />}
      <h2 className="font-heading text-white text-6xl mt-2 mx-auto">
        {message ||
          (timeLeft > 0 ? `00:${String(timeLeft).padStart(2, "0")}` : "00:00")}
      </h2>
      {showControls && (
        <Button
          onClick={handleClose}
          variant="outline"
          size="icon"
          className="rounded-full h-10"
        >
          <XIcon className="" />
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
