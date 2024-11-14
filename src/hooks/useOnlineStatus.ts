// useOnlineStatus.ts
import { useSyncExternalStore } from "react";

export function useOnlineStatus(): boolean {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  return isOnline;
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function subscribe(callback: () => void): () => void {
  // Add event listeners to detect online/offline events
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  // Return a cleanup function to remove event listeners
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}
