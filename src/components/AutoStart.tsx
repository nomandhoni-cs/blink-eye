import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getAllWindows } from "@tauri-apps/api/window";
import { useEffect } from "react";
const windows = await getAllWindows();
const appWindow = windows.find((win) => win.label === "main");

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
            appWindow.onCloseRequested(async (event) => {
              event.preventDefault(); // Prevent the window from closing
              await appWindow.setSkipTaskbar(true);
              await appWindow.minimize(); // Keep minimized
            });
            break;
          case "fullScreen":
            appWindow.onCloseRequested(async (event) => {
              event.preventDefault(); // Prevent the window from closing
              await appWindow.setSkipTaskbar(true);
              await appWindow.minimize(); // Minimize on close request
            });
            break;
          default:
            appWindow.onCloseRequested(async (event) => {
              event.preventDefault(); // Prevent the window from closing
              await appWindow.setSkipTaskbar(true);
              await appWindow.minimize(); // Minimize on close request
            });
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
