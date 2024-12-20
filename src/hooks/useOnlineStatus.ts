import { useState, useEffect } from "react";
import useDecryptedDate from "./useDecryptedDate";
import { message } from "@tauri-apps/plugin-dialog";

export function useOnlineStatus(): {
  isTrialOn: boolean;
  remainingDays: number;
} {
  const { decryptedDate } = useDecryptedDate();
  const [isTrialOn, setIsTrialOn] = useState<boolean>(true);
  const [remainingDays, setRemainingDays] = useState<number>(7);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (decryptedDate) {
        const installedDate = new Date(decryptedDate); // Trial start date
        const currentDate = new Date(); // Current system date

        // Convert both dates to UTC to avoid timezone issues
        const installedDateUTC = Date.UTC(
          installedDate.getUTCFullYear(),
          installedDate.getUTCMonth(),
          installedDate.getUTCDate()
        );
        const currentDateUTC = Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate()
        );

        // Detect if the current date is earlier than the installation date
        if (currentDateUTC < installedDateUTC) {
          setIsTrialOn(false);
          setRemainingDays(0);
          // Shows message
          await message(
            "System clock manipulation detected: Current date is before installation date.",
            { title: "Blink Eye", kind: "error" }
          );
          return;
        }

        // Calculate the difference in days
        const diffTime = currentDateUTC - installedDateUTC;
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Convert ms to days

        // Remaining days for the trial
        const remaining = Math.max(0, 7 - diffDays); // Assuming a 7-day trial

        setIsTrialOn(remaining > 0);
        setRemainingDays(remaining);
      }
    };

    checkTrialStatus();
  }, [decryptedDate]);

  return { isTrialOn, remainingDays };
}
