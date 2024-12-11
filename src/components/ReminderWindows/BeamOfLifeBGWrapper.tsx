import React from "react";
import { BeamOfLife } from "../backgrounds/BeamOfLife";

const BeamOfLifeBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <BeamOfLife />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default BeamOfLifeBGWrapper;
