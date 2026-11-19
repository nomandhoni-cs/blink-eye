import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { XIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Ticker } from "@tombcato/smart-ticker";
import "@tombcato/smart-ticker/style.css";
import logo from "./assets/newIcon.png";
import { Button } from "./components/ui/button";
import AllSetText from "./components/AllSetText";
import "./index.css";

import { initI18n } from "./i18n";
const Alert = () => {
  const [timeLeft, setTimeLeft] = useState(13);
  const [showAllSet, setShowAllSet] = useState(true);
  const reduceMotion = useReducedMotion();
  const window = getCurrentWebviewWindow();

  // Same spring feel as the task reminder: a short, physical overshoot rather
  // than a linear CSS slide (inspired by YusufCeng1z/ding).
  const spring = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 430, damping: 28, mass: 0.75 } as const);

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
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.86 }}
      animate={{ opacity: 0.9, y: 0, scale: 1 }}
      transition={spring}
      className="h-screen w-full opacity-90 flex items-center justify-between bg-black/70 rounded-2xl px-4 backdrop-blur-3xl border border-white/10"
    >
      {!showAllSet && (
        <motion.img
          src={logo}
          className="h-12 w-12"
          alt="Blink Eye"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring}
        />
      )}

      <div className="font-heading text-white text-6xl mx-auto flex items-center justify-center">
        {showAllSet ? (
          <div className="p-10">
            <AllSetText />
          </div>
        ) : timeLeft > 0 ? (
          <motion.div
            className="flex items-center justify-center tabular-nums"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
          >
            {/* Comments must be inside the HTML/JSX elements! */}
            <span className="mr-1">00:</span>
            <Ticker
              value={String(timeLeft).padStart(2, "0")}
              duration={500}
              easing="easeInOut"
              characterLists={["0123456789"]}
              charWidth={0.8}
              className="!font-heading tabular-nums"
            />
          </motion.div>
        ) : (
          <div className="flex items-center tabular-nums">
            <span className="mr-1">00:</span>
            <span>00</span>
          </div>
        )}
      </div>

      {!showAllSet && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring}
        >
          <Button onClick={handleClose} className="rounded-lg h-10 w-10">
            <motion.span
              whileHover={reduceMotion ? undefined : { rotate: 90 }}
              transition={spring}
              className="flex"
            >
              <XIcon className="w-6 h-6" />
            </motion.span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById("alert-root")!).render(
  <React.StrictMode>
    <Alert />
  </React.StrictMode>,
  );
});
