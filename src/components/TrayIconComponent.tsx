import React, { useEffect, useState } from "react";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";

const TrayIconComponent: React.FC = () => {
  const [isTrayIconCreated, setIsTrayIconCreated] = useState(false);

  useEffect(() => {
    const initializeTray = async () => {
      if (!isTrayIconCreated) {
        const menu = await Menu.new({
          items: [
            {
              id: "dashboard",
              text: "Dashboard",
              action: () => {
                console.log("Dashboard pressed");
              },
            },
            {
              id: "quit",
              text: "Quit",
              action: () => {
                console.log("quit pressed");
              },
            },
          ],
        });

        const options = {
          icon: await defaultWindowIcon(),
          menu,
          menuOnLeftClick: true,
          tooltip: "Blink Eye",
        };
        await TrayIcon.new(options);
        setIsTrayIconCreated(true);
      }
    };

    initializeTray();
  }, [isTrayIconCreated]);

  return null;
};

export default TrayIconComponent;
