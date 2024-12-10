import React from "react";
import { FreeSpirit } from "../backgrounds/FreeSpirit";

const FreeSpiritBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <FreeSpirit />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default FreeSpiritBGWrapper;
