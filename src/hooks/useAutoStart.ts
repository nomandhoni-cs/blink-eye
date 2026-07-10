import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";

export function useAutoStart() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = async () => {
    try {
      const runOnStartUp = await invoke<string | null>("get_config_string", { key: "isRunOnStartUpEnabledByDefault" });
      const isAutoStartEnabled = await isEnabled();
      console.log(runOnStartUp);
      if (runOnStartUp === null && isAutoStartEnabled === false) {
        await enable();
        await invoke("update_reminder_setting", { key: "isRunOnStartUpEnabledByDefault", value: "true" });
        toast.success("AutoStart Enabled by Default", {
          duration: 2000,
          position: "bottom-right",
        });
      }

      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error("Failed to initialize autostart:", err);
      setError("Failed to initialize application. Please try again.");
      toast.error("AutoStart setup failed. Check console for details.", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    isInitialized,
    error,
    retry: initialize,
  };
}
