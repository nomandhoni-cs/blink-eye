import React, { useEffect, useState } from "react";
import useDecryptedDate from "../hooks/useDecryptedDate";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { CheckCircle2Icon } from "lucide-react";

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
    <div className="w-full flex justify-center">
      <div className="w-full border border-gray-300 rounded-md p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg text-center text-white">
        {daysRemaining !== null ? (
          <>
            <h2 className="font-bold text-2xl mb-2">
              {daysRemaining > 0
                ? `Only ${daysRemaining} day${
                    daysRemaining > 1 ? "s" : ""
                  } left in your trial!`
                : "Your trial period has expired."}
            </h2>
            <p className="text-lg mb-4">
              {daysRemaining > 0
                ? "Want the full experience? Support the developer and unlock all features with a license!"
                : "Your trial has ended. Help support this open-source project by purchasing a license to continue enjoying all features!"}
            </p>
            <Button asChild>
              <Link to="https://blinkeye.vercel.app/pricing" target="_blank">
                <CheckCircle2Icon />

                {daysRemaining > 0
                  ? "Get a License"
                  : "Get a License to Support this project"}
              </Link>
            </Button>
          </>
        ) : (
          <p className="text-white">
            Trial info loading… probably lost in a wormhole 🌌🕳️. Hang tight!
            🚀✨ Maybe A Refresh will fix it!
          </p>
        )}
      </div>
    </div>
  );
};

export default TrialRemaining;
