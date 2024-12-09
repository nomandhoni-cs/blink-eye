import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";

export function useAutoStart() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = async () => {
    try {
      const doesAutoStartExist = await exists("initialSetupConfig.json", {
        baseDir: BaseDirectory.AppData,
      });
      if (doesAutoStartExist === false) {
        const store = await load("initialSetupConfig.json", {
          autoSave: true,
        });
        const runOnStartUp = await store.get<boolean>(
          "isRunOnStartUpEnabledByDefault"
        );
        const isAutoStartEnabled = await isEnabled();
        console.log(runOnStartUp);
        if (runOnStartUp === undefined && isAutoStartEnabled === false) {
          await enable();
          await store.set("isRunOnStartUpEnabledByDefault", true);
          toast.success("AutoStart Enabled by Default", {
            duration: 2000,
            position: "bottom-right",
          });
        }
        // else {
        //   if (runOnStartUp && !isAutoStartEnabled) {
        //     await enable();
        //     toast.success("AutoStart Enabled by Default", {
        //       duration: 2000,
        //       position: "bottom-right",
        //     });
        //   }
        // }
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
