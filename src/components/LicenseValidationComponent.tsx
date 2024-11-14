import { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import toast from "react-hot-toast";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

async function initializeDatabase() {
  const dbFileExists = await exists("blink_eye_license.db", {
    baseDir: BaseDirectory.AppData,
  });

  const db = await Database.load("sqlite:blink_eye_license.db");

  // If the db file does not exist, create it and the licenses table
  if (!dbFileExists) {
    try {
      // Create the table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY,
          license_key TEXT UNIQUE,
          status TEXT,
          activation_limit INTEGER,
          activation_usage INTEGER,
          created_at TEXT,
          expires_at TEXT,
          test_mode BOOLEAN,
          instance_name TEXT,
          store_id INTEGER,
          order_id INTEGER,
          order_item_id INTEGER,
          variant_name TEXT,
          product_name TEXT,
          customer_name TEXT,
          customer_email TEXT,
          last_validated DATE
        );
      `);

      console.log("Database and table created successfully.");
    } catch (error) {
      console.error("Error creating table:", error);
    }
  } else {
    console.log("Database file already exists.");
  }

  return db;
}

async function getStoredLicenseKey() {
  const db = await initializeDatabase();
  const result = (await db.select(`
    SELECT license_key, status, last_validated
    FROM licenses
    LIMIT 1
  `)) as { license_key: string; status: string; last_validated: string }[];

  return result.length > 0
    ? {
        license_key: result[0].license_key,
        status: result[0].status,
        last_validated: result[0].last_validated,
      }
    : null;
}

const LicenseValidationComponent: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState<string>("");

  useEffect(() => {
    const validateLicense = async () => {
      const storedLicenseKey = await getStoredLicenseKey();
      if (storedLicenseKey) {
        setLicenseKey(storedLicenseKey.license_key);
        await handleLicenseValidation(
          storedLicenseKey.last_validated,
          storedLicenseKey.status,
          storedLicenseKey.license_key
        );
      }
    };
    validateLicense();
  }, []);

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
        "https://lemonsquizzy.netlify.app/.netlify/functions/validateLicense",
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

      if (data.valid) {
        // If the license is valid and last validated is different from today
        if (lastValidated !== today) {
          await updateLicenseStatus(data.license_key.status);
          await updateLastValidatedDate(today);
        } else if (status !== data.license_key.status) {
          // Update the status if it has changed
          await updateLicenseStatus(data.license_key.status);
        }
      }
      if (data.valid === false) {
        // If the license is invalid, update status
        if (lastValidated !== today) {
          await updateLicenseStatus(data.license_key.status);
        } else if (status !== data.license_key.status) {
          // Update the status if it has changed
          await updateLicenseStatus(data.license_key.status);
        }
      }
      if (!response.ok) {
        // If the response is not ok, check the number of days since last validation
        const diffInDays = getDateDiffInDays(lastValidated, today);
        if (diffInDays > 7) {
          // If more than 7 days, update status to what was received in the response
          await updateLicenseStatus(data.license_key.status);
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
