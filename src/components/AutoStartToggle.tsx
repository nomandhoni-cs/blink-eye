// AutoStartToggle.tsx
import { useState, useEffect } from "react";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import toast from "react-hot-toast";

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
        toast.success("Enabled Autostart", {
          duration: 2000,
          position: "bottom-right",
        });
      } else {
        await disable();
        toast.success("Disabled Autostart", {
          duration: 2000,
          position: "bottom-right",
        });
      }
      setIsAutoStartEnabled(checked);
    } catch (error) {
      console.error("Failed to update autostart status:", error);
    }
  };

  return (
    <div className="">
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label
            htmlFor="autostart"
            className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Run on Startup
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically start this app when your computer boots up
          </p>
        </div>
        <Switch
          id="autostart"
          checked={isAutoStartEnabled}
          onCheckedChange={handleCheckboxChange}
        />
      </div>
    </div>
  );
};

export default AutoStartToggle;
