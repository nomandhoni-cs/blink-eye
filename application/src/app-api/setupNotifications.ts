import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  type Options as NotificationOptions,
} from "@tauri-apps/plugin-notification";

export const setupNotifications = async () => {
  // Do you have permission to send a notification?
  let permissionGranted = await isPermissionGranted();

  // If not we need to request it
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }

  return {
    permissionGranted,
    send: async function notify(
      options: NotificationOptions = {
        title: "Tauri",
        body: "This is a default notification!",
      }
    ) {
      // we could consider settings from the user that dictates where
      // and if to send a notification
      // e.g. check `settings.notificationsEnabled`

      // we could also use a framework library or custom code to
      // render this notification in the DOM, and use a signal such
      // as the `await window.isFocused()` to determine where to send
      // e.g.
      // import { getCurrent } from "@tauri-apps/api/window";
      // const window = getCurrent();
      // const focused = await window.isFocused()

      if (permissionGranted) {
        return sendNotification(options);
      }
    },
  };
};

export type NotificationAPI = ReturnType<typeof setupNotifications>;
