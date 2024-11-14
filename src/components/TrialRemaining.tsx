import React, { useEffect, useState } from "react";
import useDecryptedDate from "../hooks/useDecryptedDate";

const TrialRemaining: React.FC = () => {
  const { decryptedDate } = useDecryptedDate(); // Get the decrypted date
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (decryptedDate) {
      // Convert the decrypted date and current date to Date objects
      const startDate = new Date(decryptedDate); // Decrypted date (when the trial started)
      const currentDate = new Date(); // Current date

      // Calculate the difference in days
      const diffTime = currentDate.getTime() - startDate.getTime(); // Get the difference in milliseconds
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Convert milliseconds to days

      // Calculate the remaining days, assuming the trial lasts 7 days
      const remaining = 7 - diffDays;

      // Set remaining days
      setDaysRemaining(remaining);
    }
  }, [decryptedDate]);

  return (
    <div className="border border-gray-300 rounded-md p-4 mt-2">
      {daysRemaining !== null ? (
        <p className="font-semibold text-lg">
          {daysRemaining > 0
            ? `Trial ${daysRemaining} day${
                daysRemaining > 1 ? "s" : ""
              } remaining`
            : "Trial period has expired."}
        </p>
      ) : (
        <p>Loading trial information...</p>
      )}
    </div>
  );
};

export default TrialRemaining;
