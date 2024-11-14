import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import toast from "react-hot-toast";
import Database from "@tauri-apps/plugin-sql";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { generatePhrase } from "../../lib/namegenerator";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

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
        last_validated DATE,
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
  const [userName, setUserName] = useState("");
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
    const instanceName = generatePhrase();
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
            instance_name: userName ? userName : instanceName,
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
      setUserName(""); // Clear input field
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Failed to activate license. Please try again.");
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
  const { isOnline, isTrialOn } = useOnlineStatus();
  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <h1>Online Status Checker</h1>
      <h2>{isOnline ? "✅ Online" : "❌ Disconnected"}</h2>;
      <p>Trial Status: {isTrialOn ? "Trial Active" : "Trial Expired"}</p>
      {/* License Status Section */}
      <div className="p-6 border rounded-lg shadow-sm flex items-center justify-between ">
        <div>
          {licenseStatus === "valid" ? (
            <p className="text-green-600">
              Your license is active and valid for today.
            </p>
          ) : licenseStatus === "invalid" ? (
            <p className="text-red-600">
              Your license is invalid or needs revalidation.
            </p>
          ) : (
            <p className="text-gray-600">Checking license status...</p>
          )}
          <p>License key is: {licenseKey || "No license found"}</p>
        </div>
        <Button
          onClick={handleValidate}
          disabled={loading.validation}
          className="w-full sm:w-auto"
        >
          {loading.validation ? "Validating..." : "Validate"}
        </Button>
      </div>
      {/* License Activation Form */}
      <form
        onSubmit={handleActivate}
        className="space-y-6 p-6 border rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold">
          Activate your Blink Eye license
        </h3>

        {/* License Key Input */}
        <div className="space-y-2">
          <Label htmlFor="activationKey">Enter your license key</Label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <Input
              type="text"
              id="activationKey"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
              placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
              disabled={loading.activation}
              className="w-full sm:w-72"
            />
          </div>
        </div>

        {/* Optional User Name Input */}
        <div className="space-y-2">
          <Label htmlFor="userName">Enter your name (Optional)</Label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <Input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              required={false}
              disabled={loading.activation}
              className="w-full sm:w-72"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading.activation}
          className="w-full sm:w-auto"
        >
          {loading.activation ? "Activating..." : "Activate"}
        </Button>
      </form>
    </div>
  );
};

export default ActivateLicense;
