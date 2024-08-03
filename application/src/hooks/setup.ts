import React, { useEffect, useState } from "react";
import { setupGlobalShortcuts } from "../app-api/setupShortcuts";
import { setupTray } from "../app-api/setupTray";
import {
  NotificationAPI,
  setupNotifications,
} from "../app-api/setupNotifications";
import { Menu, MenuItem, type MenuItemOptions } from "@tauri-apps/api/menu";

export function useTauri(menuItems: MenuItemOptions[]) {
  const [tray, setTray] = useState<null | Menu>(null);
  const [notifications, setNotifications] = useState<Awaited<NotificationAPI>>({
    send: async () => console.log("notifications not initialized"),
    permissionGranted: false,
  });

  useEffect(() => {
    async function effectUsed() {
      const initialTray = await setupTray({ tooltip: "personal tray app" });
      setTray(initialTray);

      for (const menuItem of menuItems) {
        const item = await MenuItem.new(menuItem);
        initialTray.append(item);
      }

      await setupGlobalShortcuts();
    }
    effectUsed();
  }, []);

  useEffect(() => {
    async function effectUsed() {
      if (!notifications.permissionGranted) {
        const notify = await setupNotifications();
        setNotifications(notify);
      }
    }
    effectUsed();
  }, [notifications.permissionGranted]);

  return { tray, notifications };
}
