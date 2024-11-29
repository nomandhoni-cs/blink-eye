import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState } from "react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import toast from "react-hot-toast";
import Database from "@tauri-apps/plugin-sql";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { generatePhrase } from "../../lib/namegenerator";
import { CheckCircle2, Loader2Icon } from "lucide-react";
import { useLicenseKey } from "../../hooks/useLicenseKey";
const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

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

async function storeLicenseData(data: any) {
  const db = await initializeDatabase();

  try {
    // Always insert or replace the row, ensuring only one row exists in the table
    await db.execute(
      `
      INSERT OR REPLACE INTO licenses (
        id,                  -- Primary key with a fixed value to enforce single row
        license_key,
        status,
        activation_limit,
        activation_usage,
        created_at,
        expires_at,
        test_mode,
        instance_name,
        store_id,
        order_id,
        order_item_id,
        variant_name,
        product_name,
        customer_name,
        customer_email,
        last_validated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1, // Setting ID to 1 for the only row in the table
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

    console.log("License data saved or updated successfully");
  } catch (error) {
    console.error("Error storing license data:", error);
    throw new Error("Failed to store license data");
  }
}

const ActivateLicense = () => {
  const [activationKey, setActivationKey] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });
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
        "https://blinkeye.vercel.app/api/activatelicense",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_key: activationKey,
            instance_name: userName ? userName : instanceName,
            handshake_password: handshakePassword,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(`Error: ${data.message || "Unknown error"}`);
      }
      // Check if store_id matches the required values
      if (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) {
        // Store the license data
        await storeLicenseData(data);
        console.log("License data stored successfully");

        // Update the licenseKey state
        refreshLicenseData();

        toast.success("License activated successfully!", {
          duration: 2000,
          position: "bottom-right",
        });
        setActivationKey(""); // Clear input field
        setUserName(""); // Clear input field
        // Reload the page to reflect the changes
        //! TODO: Find a better way to reload the page without refreshing the entire app
        // use this after 1 second delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log(
          "Store ID does not match required values. License data not stored."
        );
      }
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Failed to activate license. Please try again.", {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setLoading((prev) => ({ ...prev, activation: false }));
    }
  };
  const { licenseData, refreshLicenseData } = useLicenseKey();
  // Helper function to mask the license key
  const maskLicenseKey = (licenseKey: string): string => {
    if (!licenseKey) return "No license found"; // Handle empty or undefined keys
    // Split the license key into segments
    const segments = licenseKey.split("-");
    // Mask the middle segments
    return segments
      .map((segment, index) => (index >= 1 && index <= 3 ? "XXXX" : segment))
      .join("-");
  };

  // Function to handle copy to clipboard
  const handleCopy = async (licenseKey: string) => {
    if (licenseKey) {
      try {
        await navigator.clipboard.writeText(licenseKey);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy license key to clipboard", {
          duration: 2000,
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-6 py-8">
      {/* License Status Section */}
      <div className="p-6 border rounded-lg shadow-sm flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p
                  className="font-semibold animate-pulse"
                  onClick={() => handleCopy(licenseData?.license_key || "")}
                >
                  {licenseData?.license_key
                    ? maskLicenseKey(licenseData.license_key)
                    : "No license found"}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          {licenseData?.status === "active" ? (
            <div className="flex items-center space-x-2 border border-green-600 rounded-lg px-3 py-2 bg-green-500">
              <CheckCircle2 />
              <span className="text-sm font-semibold">
                {licenseData?.status.toUpperCase()}
              </span>
            </div>
          ) : licenseData?.status === "disabled" || "inactive" ? (
            <p className="text-red-600 font-semibold">
              {licenseData?.status.toUpperCase()}
            </p>
          ) : (
            <p className="text-gray-500">Checking license status...</p>
          )}
        </div>
      </div>
      <form
        className="flex items-center justify-between w-full p-6 border rounded-lg shadow-sm space-x-4"
        onSubmit={handleActivate}
      >
        {/* Input Section */}
        <div className="flex flex-col w-full space-y-2 border-r-2 border-gray-400 pr-4">
          <div>
            <Label htmlFor="activationKey" className="font-medium">
              Enter Your License Key
            </Label>
            <Input
              type="text"
              id="activationKey"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
              placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
              disabled={loading.activation}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="userName" className="font-medium">
              Enter Your Name (Optional)
            </Label>
            <Input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              disabled={loading.activation}
              className="w-full mt-1"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading.activation}
          className="w-full sm:w-auto font-semibold px-6 py-2 rounded-md"
        >
          {loading.activation && (
            <Loader2Icon className="motion-safe:animate-spin" />
          )}
          {loading.activation ? "Activating..." : "Activate"}
        </Button>
      </form>
    </div>
  );
};

export default ActivateLicense;
