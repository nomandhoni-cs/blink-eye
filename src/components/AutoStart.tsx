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
        if (result === "minimized") {
          appWindow.minimize();
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
