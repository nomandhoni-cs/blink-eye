import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { XIcon } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import logo from "./assets/newIcon.png";
import { Button } from "./components/ui/button";
import AllSetText from "./components/AllSetText";
import "./App.css";

// Enhanced Animated Counter Component
const AnimatedCounter: React.FC<{
  value: number;
  fontSize: string;
  className?: string;
}> = ({ value, fontSize, className = "" }) => {
  const digitHeight = parseInt(fontSize.replace("px", ""));
  const digits = String(value).padStart(2, "0").split("");

  return (
    <div
      className={`flex font-semibold ${className}`}
      style={{ fontSize, lineHeight: `${digitHeight}px` }}
    >
      {digits.map((d, index) => (
        <div key={index} className="w-[0.6em]">
          <Digit digit={parseInt(d)} height={digitHeight} />
        </div>
      ))}
    </div>
  );
};

// Digit Component with Enhanced Animation
const Digit: React.FC<{ digit: number; height: number }> = ({
  digit,
  height,
}) => {
  return (
    <div className="relative overflow-y-hidden" style={{ height }}>
      {/* Digit container with smooth transition */}
      <div
        className="absolute w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${digit * height}px)` }}
      >
        {/* Render digits 0-9 */}
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="w-full text-center flex items-center justify-center"
            style={{ height }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

const Alert = () => {
  const [timeLeft, setTimeLeft] = useState(13);
  const [showAllSet, setShowAllSet] = useState(true);
  const window = getCurrentWebviewWindow();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAllSet(false);

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
    <div className="h-screen w-full opacity-90 flex items-center justify-between bg-black/70 rounded-2xl px-4 backdrop-blur-3xl border border-white/10 animate-in slide-in-from-top duration-300">
      {!showAllSet && (
        <img
          src={logo}
          className="h-12 w-12 animate-in slide-in-from-top duration-300"
          alt="Blink Eye"
        />
      )}

      <div className="font-heading text-white text-6xl mx-auto flex items-center justify-center">
        {showAllSet ? (
          <div className="p-10">
            <AllSetText />
          </div>
        ) : timeLeft > 0 ? (
          <div className="flex items-center justify-center space-x-1 animate-in slide-in-from-top duration-300">
            <span className="">00</span>
            <span className="mb-3">:</span>
            <AnimatedCounter value={timeLeft} fontSize="60px" />
          </div>
        ) : (
          <div className="flex items-center">
            <span>00:</span>
            <span className="ml-1">00</span>
          </div>
        )}
      </div>

      {!showAllSet && (
        <Button
          onClick={handleClose}
          className="rounded-lg h-10 w-10 animate-in slide-in-from-top duration-300"
        >
          <XIcon className="w-6 h-6 hover:rotate-90 transition-transform" />
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
