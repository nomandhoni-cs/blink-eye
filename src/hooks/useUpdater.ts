import { useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const useUpdater = () => {
  useEffect(() => {
    const updateApp = async () => {
      const update = await check();
      if (update) {
        console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`);
        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength ?? 0;
              console.log(`started downloading ${contentLength} bytes`);
              break;
            case "Progress":
              downloaded += event.data.chunkLength ?? 0;
              console.log(`downloaded ${downloaded} from ${contentLength}`);
              break;
            case "Finished":
              console.log("download finished");
              break;
          }
        });

        console.log("update installed");
        await relaunch();
      }
    };

    updateApp();
  }, []);
};

export default useUpdater;
