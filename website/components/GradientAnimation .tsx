"use client";
import React from "react";

const GradientAnimation = () => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 310 350"
        className="blob fixed inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <path d="M156.4,339.5c31.8-2.5,59.4-26.8,80.2-48.5c28.3-29.5,40.5-47,56.1-85.1c14-34.3,20.7-75.6,2.3-111  c-18.1-34.8-55.7-58-90.4-72.3c-11.7-4.8-24.1-8.8-36.8-11.5l-0.9-0.9l-0.6,0.6c-27.7-5.8-56.6-6-82.4,3c-38.8,13.6-64,48.8-66.8,90.3c-3,43.9,17.8,88.3,33.7,128.8c5.3,13.5,10.4,27.1,14.9,40.9C77.5,309.9,111,343,156.4,339.5z" />
      </svg>
      <style jsx>{`
        .blob {
          position: absolute;
          top: 50;
          left: 50;
          fill: #fe4c55;
          width: 50vmax;
          z-index: -1;
          animation: move 20s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        @keyframes move {
          0% {
            transform: scale(1) translate(10px, -30px);
          }
          25% {
            transform: scale(0.8, 1) translate(80vw, 30vh) rotate(90deg);
          }
          50% {
            transform: scale(1.1) translate(40vw, 50vh) rotate(180deg);
          }
          75% {
            transform: scale(0.9) translate(0vw, 40vh) rotate(270deg);
          }
          100% {
            transform: scale(1) translate(10px, -30px);
          }
        }
      `}</style>
    </>
  );
};

export default GradientAnimation;
