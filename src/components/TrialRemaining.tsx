import React, { useEffect, useState } from "react";
import useDecryptedDate from "../hooks/useDecryptedDate";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

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
      <div className="w-full max-w-3xl border border-gray-300 rounded-md p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg text-center text-white">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>

                {daysRemaining > 0
                  ? "Get a License"
                  : "Get a License to Support this project"}
              </Link>
            </Button>
          </>
        ) : (
          <p className="text-white">Loading trial information...</p>
        )}
      </div>
    </div>
  );
};

export default TrialRemaining;
