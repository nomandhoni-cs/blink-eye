import { useState, useEffect } from "react";
import useDecryptedDate from "./useDecryptedDate";

export function useOnlineStatus(): { isTrialOn: boolean } {
  const { decryptedDate } = useDecryptedDate();
  const [isTrialOn, setIsTrialOn] = useState<boolean>(true);

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
      const remaining = 7 - diffDays; // Assuming a 7-day trial period

      setIsTrialOn(remaining > 0);
    }
  }, [decryptedDate]);

  return { isTrialOn };
}
