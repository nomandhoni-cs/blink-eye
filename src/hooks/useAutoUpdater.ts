import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import Database from "@tauri-apps/plugin-sql";

export const useUpdater = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const updateApp = async () => {
      try {
        // Check for updates
        const update = await check();
        if (update) {
          console.log(`Update available: ${update.version}`);
          setIsUpdateAvailable(true);

          const db = await Database.load("sqlite:appconfig.db");
          // Update the value in the database
          await db.execute(
            `UPDATE config SET value = ? WHERE key = 'isUpdateAvailable';`,
            ["true"]
          );
        }
      } catch (error) {
        console.error("Error during update check:", error);
      }
    };

    updateApp();
  }, []);

  const handleUpdate = async () => {
    try {
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

        // Update the database value after installation
        const db = await Database.load("sqlite:appconfig.db");
        await db.execute(
          `UPDATE config SET value = ? WHERE key = 'isUpdateAvailable';`,
          ["false"]
        );

        console.log("Update installed");
        await relaunch();
      }
    } catch (error) {
      console.error("Error during update installation:", error);
    }
  };

  return { isUpdateAvailable, handleUpdate, setIsUpdateAvailable };
};
