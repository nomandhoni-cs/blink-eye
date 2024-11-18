import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface TriggerContextType {
  trigger: number; // Use a number for incremental changes
  triggerUpdate: () => void; // Function to trigger updates
}

// Create the context
const TriggerContext = createContext<TriggerContextType | undefined>(undefined);

// Provider component
export const TriggerProvider = ({ children }: { children: ReactNode }) => {
  const [trigger, setTrigger] = useState<number>(0);

  // Function to update the trigger
  const triggerUpdate = () => {
    setTrigger((prev) => prev + 1); // Increment to ensure a change
  };

  return (
    <TriggerContext.Provider value={{ trigger, triggerUpdate }}>
      {children}
    </TriggerContext.Provider>
  );
};

// Custom hook for consuming the context
export const useTrigger = () => {
  const context = useContext(TriggerContext);
  if (!context) {
    throw new Error("useTrigger must be used within a TriggerProvider");
  }
  return context;
};
