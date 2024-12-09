import React, { createContext, useContext, ReactNode } from "react";
import useTimeCount from "../hooks/useTimeCount";

interface TimeCountContextType {
  timeCount: { hours: number; minutes: number };
}

const TimeCountContext = createContext<TimeCountContextType | undefined>(
  undefined
);

export const TimeCountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const timeStamps = useTimeCount();

  // Calculate total hours and minutes
  let totalSeconds = 0;

  timeStamps.forEach((timestamp) => {
    const timeDifferenceInSeconds =
      Math.max(timestamp.secondTimestamp - timestamp.firstTimestamp, 0) / 1000; // Convert ms to seconds and prevent negative values

    totalSeconds += timeDifferenceInSeconds;
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const timeCount = { hours, minutes };

  return (
    <TimeCountContext.Provider value={{ timeCount }}>
      {children}
    </TimeCountContext.Provider>
  );
};

export const useTimeCountContext = (): TimeCountContextType => {
  const context = useContext(TimeCountContext);
  if (!context) {
    throw new Error(
      "useTimeCountContext must be used within a TimeCountProvider"
    );
  }
  return context;
};
