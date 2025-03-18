import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { XIcon } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import logo from "./assets/icon.png";
import { Button } from "./components/ui/button";

const AnimatedEye = () => (
  <svg
    viewBox="0 0 200 200"
    width="100%"
    height="auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Box – simulating .box with a morphing border-radius */}
    <g id="outerBox">
      <path fill="#fe4c55">
        <animate
          attributeName="d"
          dur="15s"
          repeatCount="indefinite"
          values="
            M200,80 A60,120 0 0,1 140,200 A140,80 0 0,1 0,120 A140,120 0 0,1 140,0 A60,80 0 0,1 200,80 Z;
            M200,120 A140,80 0 0,1 60,200 A60,120 0 0,1 0,80 A60,80 0 0,1 60,0 A140,120 0 0,1 200,120 Z;
            M200,120 A60,80 0 0,1 140,200 A140,80 0 0,1 0,120 A100,120 0 0,1 100,0 A100,120 0 0,1 200,120 Z;
            M200,80 A60,120 0 0,1 140,200 A140,80 0 0,1 0,120 A140,120 0 0,1 140,0 A60,80 0 0,1 200,80 Z
          "
        />
      </path>
    </g>

    {/* Inner content: 5% padding (10 units) then an 80% (144×144) centered container */}
    <g id="eyeContainer" transform="translate(10,10)">
      <g transform="translate(18,18)">
        {" "}
        {/* (180-144)/2 = 18 */}
        {/* EyeLid – mimicking .eyeLid with non‑uniform border-radius and blink animation */}
        <g id="eyeLid">
          {/* This path is an approximation for a 144×144 box with border-radius: 
              50% 50% 49% 51% / 67% 68% 32% 33% */}
          <path
            fill="white"
            d="
            M0,72 
            C0,30 144,30 144,72 
            C144,114 144,122 144,122 
            C144,122 144,144 72,144 
            C0,144 0,122 0,72 Z
          "
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1 1; 1 1; 1.3 0.1; 1 1; 1 1; 1.3 0.1; 1 1; 1 1; 1.3 0.1; 1 1; 1 1"
              keyTimes="0;0.1;0.105;0.11;0.4;0.405;0.41;0.7;0.705;0.71;1"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>
        </g>
        {/* Eyes group – simulating .eyes container */}
        <g id="eyes">
          {/* Black Eye – simulating .eye with an animateTransform for subtle “eyeball” motion */}
          <circle id="eye" cx="72" cy="72" r="36" fill="#000">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="
                -3.6,3.6;
                -3.6,3.6;
                -3.6,1.44;
                -3.6,3.6;
                -3.6,3.6;
                7.2,0;
                7.2,1.44;
                7.2,1.44;
                -2.16,2.88;
                -3.6,3.6;
                -3.6,3.6
              "
              keyTimes="0;0.1;0.105;0.11;0.4;0.405;0.41;0.7;0.705;0.71;1"
              dur="15s"
              repeatCount="indefinite"
            />
          </circle>
          {/* White highlight – simulating .eye:after */}
          <circle cx="86.4" cy="64.8" r="14.4" fill="white" />
        </g>
      </g>
    </g>
  </svg>
);

const Alert = () => {
  const handleClose = async () => {
    const window = getCurrentWebviewWindow();
    await window.close();
  };

  return (
    <div className="h-screen w-full flex items-center justify-between bg-gray-900 rounded-full px-4  bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-90 border-4 border-gray-100 animate-in slide-in-from-top duration-300">
      <img src={logo} className="w-10" alt="Blink Eye" />
      <h2 className="font-heading text-white text-6xl mt-2">00:15</h2>
      <Button
        onClick={handleClose}
        variant="outline"
        size="icon"
        className="rounded-full h-10"
      >
        <XIcon className="" />
      </Button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("alert-root")!).render(
  <React.StrictMode>
    <Alert />
  </React.StrictMode>
);
