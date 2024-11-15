// AutoStartToggle.tsx
import { useState, useEffect } from "react";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import toast from "react-hot-toast";
import { load } from "@tauri-apps/plugin-store";

const AutoStartToggle = () => {
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);

  useEffect(() => {
    const initializeAutoStart = async () => {
      try {
        // Load initial configuration store
        const store = await load("initialSetupConfig.json", {
          autoSave: false,
        });
        const runOnStartUp = await store.get<boolean>(
          "isRunOnStartUpEnabledByDefault"
        );

        // If setting does not exist in store, enable autostart by default
        if (runOnStartUp === null || runOnStartUp === undefined || false) {
          await enable();
          await store.set("isRunOnStartUpEnabledByDefault", true);
          toast.success("AutoStart Enabled by Default", {
            duration: 2000,
            position: "bottom-right",
          });
          setIsAutoStartEnabled(true);
        } else {
          // Otherwise, check actual autostart status
          const status = await isEnabled();
          setIsAutoStartEnabled(status);
        }
      } catch (error) {
        console.error("Failed to initialize autostart:", error);
      }
    };
    initializeAutoStart();
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
  );
};

export default AutoStartToggle;
