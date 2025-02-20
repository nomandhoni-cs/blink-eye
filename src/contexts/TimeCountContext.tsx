import React, { createContext, useContext, ReactNode } from "react";
import useTimeCount from "../hooks/useTimeCount";

interface TimeCount {
  hours: number;
  minutes: number;
}

interface TimeCountContextType {
  timeCount: TimeCount;
}

const TimeCountContext = createContext<TimeCountContextType | undefined>(
  undefined
);

export const TimeCountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { timeCount } = useTimeCount();

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

export default TimeCountProvider;
