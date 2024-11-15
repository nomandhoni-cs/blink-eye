import { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import toast from "react-hot-toast";

interface LicenseData {
  license_key: string;
  status: string;
  last_validated: string;
}

interface UseLicenseKeyReturn {
  licenseData: LicenseData | null;
  loading: boolean;
  error: Error | null;
  refreshLicenseData: () => Promise<void>;
}

async function initializeDatabase() {
  const dbFileExists = await exists("blink_eye_license.db", {
    baseDir: BaseDirectory.AppData,
  });
  const db = await Database.load("sqlite:blink_eye_license.db");

  if (!dbFileExists) {
    try {
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
      throw error;
    }
  } else {
    console.log("Database file already exists.");
  }
  return db;
}

export function useLicenseKey(): UseLicenseKeyReturn {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLicenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await initializeDatabase();
      const result = (await db.select(`
        SELECT license_key, status, last_validated
        FROM licenses
        LIMIT 1
      `)) as LicenseData[];

      if (result.length > 0) {
        setLicenseData({
          license_key: result[0].license_key,
          status: result[0].status,
          last_validated: result[0].last_validated,
        });
      } else {
        setLicenseData(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch license data")
      );
      toast.error("Failed to fetch license data");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchLicenseData();
  }, []);

  return {
    licenseData,
    loading,
    error,
    refreshLicenseData: fetchLicenseData,
  };
}
