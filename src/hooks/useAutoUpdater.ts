import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export const useUpdater = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const updateApp = async () => {
      const update = await check();
      if (update) {
        console.log(`Update available: ${update.version}`);
        setIsUpdateAvailable(true); // Trigger alert dialog
      }
    };

    updateApp();
  }, []);

  const handleUpdate = async () => {
    const update = await check();
    if (update) {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            console.log(`Started downloading ${contentLength} bytes`);
            break;
          case "Progress":
            downloaded += event.data.chunkLength ?? 0;
            console.log(`Downloaded ${downloaded} of ${contentLength}`);
            break;
          case "Finished":
            console.log("Download finished");
            break;
        }
      });

      console.log("Update installed");
      await relaunch();
    }
  };

  return { isUpdateAvailable, handleUpdate, setIsUpdateAvailable };
};
