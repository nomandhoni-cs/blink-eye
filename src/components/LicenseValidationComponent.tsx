import { useEffect, useState } from "react";
import Database from "@tauri-apps/plugin-sql";
import toast from "react-hot-toast";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { useLicenseKey } from "../hooks/useLicenseKey";

const LicenseValidationComponent: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Track loading status
  const { licenseData, refreshLicenseData } = useLicenseKey();

  // Function to check if a date is today
  const isNotToday = (dateString: string): boolean => {
    const today = new Date();
    const inputDate = new Date(dateString);
    return (
      inputDate.getFullYear() !== today.getFullYear() ||
      inputDate.getMonth() !== today.getMonth() ||
      inputDate.getDate() !== today.getDate()
    );
  };

  useEffect(() => {
    const validateLicense = async () => {
      console.log("Running License Validator");
      await refreshLicenseData(); // Ensure data is refreshed
      setIsDataLoaded(true); // Mark data as loaded
    };
    validateLicense();
  }, []);

  useEffect(() => {
    console.log(isNotToday("2024-11-27"), "is not Today");
    if (
      isDataLoaded &&
      licenseData &&
      isNotToday(licenseData.last_validated) // Add the new condition
    ) {
      console.log(licenseData);
      setLicenseKey(licenseData.license_key);
      handleLicenseValidation(
        licenseData.last_validated,
        licenseData.status,
        licenseData.license_key
      );
    }
  }, [isDataLoaded]); // Re-run when data loads

  // Function to handle license validation and activation status
  const handleLicenseValidation = async (
    lastValidated: string,
    status: string,
    licenseKey: string
  ) => {
    if (!licenseKey) {
      toast.error("Missing license key for validation.");
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // Today's date (YYYY-MM-DD)

    // Validate license from the external API
    try {
      const response = await tauriFetch(
        "https://blinkeye.vercel.app/api/validatelicense",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ license_key: licenseKey }),
        }
      );

      const data = await response.json();
      console.log(data);
      console.log(data.valid);
      // Proceed only if store_id matches and data is valid
      if (
        (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) &&
        data.valid
      ) {
        console.log("Executig first loop");
        // If the license is valid and last validated is different from today
        if (lastValidated !== today) {
          await updateLicenseStatus(data.license_key.status);
          await updateLastValidatedDate(today);
        } else if (status !== data.license_key.status) {
          // Update the status if it has changed
          await updateLicenseStatus(data.license_key.status);
        }
      } else if (
        (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) &&
        !data.valid
      ) {
        // If the license is invalid but store_id matches, update status
        if (lastValidated !== today) {
          // If the response is not ok, check the number of days since last validation
          const diffInDays = getDateDiffInDays(lastValidated, today);

          if (diffInDays > 7) {
            // If more than 7 days, update status to what was received in the response
            await updateLicenseStatus(data.license_key.status);
          } else {
            // If less than 7 days, update status
            return;
          }
          return;
        } else if (status !== data.license_key.status) {
          // Update the status if it has changed
          await updateLicenseStatus(data.license_key.status);
        }
      } else {
        console.log(
          "Store ID does not match required values. Validation skipped."
        );
      }

      if (!response.ok) {
        // If the response is not ok, check the number of days since last validation
        const diffInDays = getDateDiffInDays(lastValidated, today);
        if (diffInDays > 7) {
          // If more than 7 days, update status to what was received in the response
          await updateLicenseStatus("disabled");
        }
        return;
      }
    } catch (error) {
      toast.error("Failed to validate license. Please try again.");
    }
  };

  // Function to update the license status in the database
  const updateLicenseStatus = async (status: string) => {
    const db = await Database.load("sqlite:blink_eye_license.db"); // Use the same db connection
    if (db) {
      await db.execute(
        `
        UPDATE licenses
        SET status = $1
        WHERE license_key = $2`,
        [status, licenseKey] // Update the status in the database
      );
      toast.success(`License status updated to ${status}`);
    }
  };

  // Function to update the last validated date in the database
  const updateLastValidatedDate = async (today: string) => {
    const db = await Database.load("sqlite:blink_eye_license.db"); // Use the same db connection
    if (db) {
      await db.execute(
        `
        UPDATE licenses
        SET last_validated = $1
        WHERE license_key = $2`,
        [today, licenseKey] // Update the last validated date in the database
      );
      toast.success("License last validated date updated");
    }
  };

  // Function to calculate date difference in days
  const getDateDiffInDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 3600 * 24)); // Convert milliseconds to days
  };

  return null; // Empty component that runs the validation logic in the background
};

export default LicenseValidationComponent;
