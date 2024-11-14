import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import toast from "react-hot-toast";
import Database from "@tauri-apps/plugin-sql";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";

async function initializeDatabase() {
  const dbFileExists = await exists("blink_eye_license.db", {
    baseDir: BaseDirectory.AppData,
  });

  const db = await Database.load("sqlite:blink_eye_license.db");

  if (!dbFileExists) {
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

  return result.length > 0 ? result[0].license_key : null;
}

async function storeLicenseData(data: any) {
  const db = await initializeDatabase();
  await db.execute(
    `
    INSERT INTO licenses (
      license_key, status, activation_limit, activation_usage, created_at,
      expires_at, test_mode, instance_name, store_id, order_id,
      order_item_id, variant_name, product_name, customer_name,
      customer_email, last_validated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(license_key) DO UPDATE SET
      status = excluded.status,
      activation_limit = excluded.activation_limit,
      activation_usage = excluded.activation_usage,
      last_validated = excluded.last_validated
    `,
    [
      data.license_key.key,
      data.license_key.status,
      data.license_key.activation_limit,
      data.license_key.activation_usage,
      data.license_key.created_at,
      data.license_key.expires_at,
      data.license_key.test_mode,
      data.instance?.name || null,
      data.meta.store_id,
      data.meta.order_id,
      data.meta.order_item_id,
      data.meta.variant_name,
      data.meta.product_name,
      data.meta.customer_name,
      data.meta.customer_email,
      new Date().toISOString().split("T")[0],
    ]
  );
}
async function isLicenseValid(): Promise<boolean> {
  const db = await initializeDatabase();
  const result = (await db.select(`
    SELECT license_key, status, last_validated
    FROM licenses
    LIMIT 1
  `)) as { license_key: string; status: string; last_validated: string }[];

  if (result.length === 0) return false;

  const today = new Date().toISOString().split("T")[0];
  const lastValidated = result[0].last_validated;
  return lastValidated === today && result[0].status === "active";
}
const ActivateLicense = () => {
  const [activationKey, setActivationKey] = useState("");
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<"valid" | "invalid" | "">(
    ""
  );

  useEffect(() => {
    // Fetch license key from the database on component mount
    const fetchLicenseKey = async () => {
      const key = await getStoredLicenseKey();
      setLicenseKey(key);

      // Check if the license is valid
      isLicenseValid().then((isValid) => {
        setLicenseStatus(isValid ? "valid" : "invalid");
      });
    };
    fetchLicenseKey();
  }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activationKey.trim()) {
      toast.error("Please enter a license key");
      return;
    }

    setLoading((prev) => ({ ...prev, activation: true }));

    try {
      const response = await tauriFetch(
        "https://lemonsquizzy.netlify.app/.netlify/functions/activateLicense",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_key: activationKey,
            instance_name: "Blink_Eye_Tauri_Test",
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(`Error: ${data.message || "Unknown error"}`);
      }

      // Store the license data
      await storeLicenseData(data);
      console.log("License data stored successfully");

      // Update the licenseKey state
      setLicenseKey(data.license_key.key);

      toast.success("License activated successfully!");
      setActivationKey(""); // Clear input field
    } catch (error) {
      console.error("Activation error:", error);
      toast.error(
        error.message || "Failed to activate license. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, activation: false }));
    }
  };

  const handleValidate = async () => {
    if (!licenseKey) {
      toast.error("No license key found in the database");
      return;
    }

    setLoading((prev) => ({ ...prev, validation: true }));
    try {
      const response = await tauriFetch(
        "https://lemonsquizzy.netlify.app/.netlify/functions/validateLicense",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            license_key: licenseKey,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      await storeLicenseData(data);
      toast.success("License validated successfully!");
    } catch (error) {
      toast.error("Failed to validate license. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, validation: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        {licenseStatus === "valid" ? (
          <p className="text-green-600">
            Your license is active and valid for today.
          </p>
        ) : licenseStatus === "invalid" ? (
          <p className="text-red-600">
            Your license is invalid or needs revalidation.
          </p>
        ) : (
          <p>Checking license status...</p>
        )}
      </div>
      <form onSubmit={handleActivate} className="space-y-4">
        <h3 className="text-lg font-semibold">
          Activate your Blink Eye license
        </h3>
        <div className="space-y-2">
          <Label htmlFor="activationKey">Enter your license key</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              id="activationKey"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
              placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
              disabled={loading.activation}
            />
            <Button type="submit" disabled={loading.activation}>
              {loading.activation ? "Activating..." : "Activate"}
            </Button>
          </div>
        </div>
      </form>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Validate your license</h3>
        <p>License key in database: {licenseKey || "No license found"}</p>
        <Button onClick={handleValidate} disabled={loading.validation}>
          {loading.validation ? "Validating..." : "Validate"}
        </Button>
      </div>
    </div>
  );
};

export default ActivateLicense;
