import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

/**
 * Rust emits `todo-updated` after a popup completes a task. Refreshing on that
 * event keeps the dashboard, list and break overlay honest without waiting for
 * the user to refocus the main window.
 */
export function useTodoRefreshEvent(refresh: () => void | Promise<void>): void {
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("todo-updated", () => {
      void refresh();
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Web preview has no Tauri event bridge; focus refresh still works.
      });
    return () => unlisten?.();
  }, [refresh]);
}
