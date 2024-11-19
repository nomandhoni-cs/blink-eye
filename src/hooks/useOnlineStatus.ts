import { useState, useEffect } from "react";
import useDecryptedDate from "./useDecryptedDate";

export function useOnlineStatus(): { isOnline: boolean; isTrialOn: boolean } {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { decryptedDate } = useDecryptedDate();
  const [isTrialOn, setIsTrialOn] = useState<boolean>(true);

  useEffect(() => {
    // Update online status based on network events
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen to online and offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Polling every 5 seconds as a fallback for Tauri
    const checkStatusInterval = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 5000);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(checkStatusInterval);
    };
  }, []);

  useEffect(() => {
    // Calculate trial expiration logic
    if (decryptedDate) {
      const startDate = new Date(decryptedDate); // When the trial started (decrypted date)
      const currentDate = new Date(); // Current date

      // Convert both dates to UTC to avoid time zone issues
      const startDateUTC = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate()
      );
      const currentDateUTC = Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate()
      );

      // Calculate the difference in daysW
      const diffTime = currentDateUTC - startDateUTC;
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Convert ms to days

      // Check if the trial period has expired
      const remaining = 1 - diffDays; // Assuming a 7-day trial period

      setIsTrialOn(remaining > 0);
    }
  }, [decryptedDate]);

  return { isOnline, isTrialOn };
}
