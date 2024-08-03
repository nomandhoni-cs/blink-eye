import { Menu } from "@tauri-apps/api/menu";
import { createContext } from "react";
import { NotificationAPI } from "./app-api/setupNotifications";

export const SystemTrayContext = createContext<{
  tray: null | Menu;
  notifications: Awaited<NotificationAPI>;
}>({
  tray: null,
  notifications: {
    send: async () => console.log("notifications not initialized"),
    permissionGranted: false,
  },
});
