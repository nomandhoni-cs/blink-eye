import React, { useEffect, useState } from "react";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { exit, relaunch } from "@tauri-apps/plugin-process";

const TrayIconComponent: React.FC = () => {
  const [isTrayIconCreated, setIsTrayIconCreated] = useState(false);

  useEffect(() => {
    const initializeTray = async () => {
      if (isTrayIconCreated === false) {
        const menu = await Menu.new({
          items: [
            {
              id: "dashboard",
              text: "Dashboard",
              action: () => {
                console.log("Dashboard pressed");
                const webview = new WebviewWindow("DashboardWindow", {
                  url: "/home",
                  title: "Take A Break Reminder - Blink Eye",
                  width: 400,
                  height: 600,
                });
                webview.once("tauri://created", () => {
                  console.log("Webview created");
                });
                webview.once("tauri://error", (e) => {
                  console.error("Error creating webview:", e);
                });
              },
            },
            {
              id: "relaunch",
              text: "Relaunch",
              action: () => {
                relaunch();
              },
            },
            {
              id: "quit",
              text: "Quit",
              action: async () => {
                await exit(0);
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
