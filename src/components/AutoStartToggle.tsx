// AutoStartToggle.tsx
import { useState, useEffect } from "react";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { Checkbox } from "./ui/checkbox";

const AutoStartToggle = () => {
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);

  useEffect(() => {
    const checkAutoStartStatus = async () => {
      try {
        const status = await isEnabled();
        setIsAutoStartEnabled(status);
      } catch (error) {
        console.error("Failed to get autostart status:", error);
      }
    };
    checkAutoStartStatus();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
      } else {
        await disable();
      }
      setIsAutoStartEnabled(checked);
    } catch (error) {
      console.error("Failed to update autostart status:", error);
    }
  };

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="autostart"
        checked={isAutoStartEnabled}
        onCheckedChange={handleCheckboxChange}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="autostart"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Run Blink Eye on startup.
        </label>
        <p className="text-sm text-muted-foreground">
          Turn this on for best usage.
        </p>
      </div>
    </div>
  );
};

export default AutoStartToggle;
