import React from "react";
import DefaultBackground from "../backgrounds/DefaultBackground";

const PlainBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <DefaultBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default PlainBGWrapper;
