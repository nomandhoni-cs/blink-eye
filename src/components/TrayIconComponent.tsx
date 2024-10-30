import React, { useEffect } from "react";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";

const TrayIconComponent: React.FC = () => {
  useEffect(() => {
    const initializeTray = async () => {
      function onTrayMenuClick(itemId: string) {
        // itemId === 'quit'
        console.log("Tray menu item clicked: ", itemId);
      }

      const menu = await Menu.new({
        items: [
          {
            id: "quit",
            text: "Quit",
            action: onTrayMenuClick,
          },
        ],
      });

      const options = {
        icon: await defaultWindowIcon(),
        menu,
        menuOnLeftClick: true,
      };

      await TrayIcon.new(options);
    };

    initializeTray();
  }, []);

  return null;
};

export default TrayIconComponent;
