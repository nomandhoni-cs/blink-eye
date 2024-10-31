import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

const appWindow = getCurrentWindow();
const AutoStart = () => {
  useEffect(() => {
    async function checkStartupState() {
      try {
        const result = await invoke<string>("check_minimized_argument");
        console.log(`App startup state: ${result}`);

        // Switch statement for different startup states
        switch (result) {
          case "minimized":
            await appWindow.minimize();
            appWindow.onCloseRequested(async () => {
              await appWindow.setSkipTaskbar(true);
              await appWindow.minimize(); // Keep minimized
            });
            break;
          case "fullScreen":
            appWindow.onCloseRequested(async () => {
              await appWindow.setSkipTaskbar(true);
              await appWindow.minimize(); // Minimize on close request
            });
            break;
          default:
            console.warn(`Unknown startup state: ${result}`);
            break;
        }
      } catch (error) {
        console.error("Error checking startup state:", error);
      }
    }
    checkStartupState();
  }, []);

  return <></>;
};

export default AutoStart;
