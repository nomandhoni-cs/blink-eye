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
// import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { generatePhrase } from "../../lib/namegenerator";
import { CheckCircle2, Loader2Icon } from "lucide-react";
import { useLicenseKey } from "../../hooks/useLicenseKey";
import { encryptData } from "../../lib/cryptoUtils";
const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

async function storeLicenseData(data: any) {
  const licenseDB = await Database.load("sqlite:blink_eye_license.db");

  try {
    console.log("Storing license data:", data);

    const encryptedKey = await encryptData(data.license_key.key);
    console.log("Encrypted Key:", encryptedKey);

    await licenseDB.execute(
      `
      INSERT OR REPLACE INTO licenses (
        id, license_key, status, activation_limit, activation_usage,
        created_at, expires_at, test_mode, instance_name,
        store_id, order_id, order_item_id, variant_name,
        product_name, customer_name, customer_email, last_validated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1,
        JSON.stringify(encryptedKey),
        JSON.stringify(await encryptData(data.license_key.status)),
        JSON.stringify(await encryptData(data.license_key.activation_limit)),
        JSON.stringify(await encryptData(data.license_key.activation_usage)),
        JSON.stringify(await encryptData(data.license_key.created_at)),
        JSON.stringify(await encryptData(data.license_key.expires_at)),
        JSON.stringify(await encryptData(data.license_key.test_mode)),
        JSON.stringify(await encryptData(data.instance?.name || null)),
        JSON.stringify(await encryptData(data.meta.store_id)),
        JSON.stringify(await encryptData(data.meta.order_id)),
        JSON.stringify(await encryptData(data.meta.order_item_id)),
        JSON.stringify(await encryptData(data.meta.variant_name)),
        JSON.stringify(await encryptData(data.meta.product_name)),
        JSON.stringify(await encryptData(data.meta.customer_name)),
        JSON.stringify(await encryptData(data.meta.customer_email)),
        JSON.stringify(
          await encryptData(new Date().toISOString().split("T")[0])
        ),
      ]
    );

    console.log("SQL execution completed successfully.");
  } catch (error) {
    alert(error);
    toast(`Response status: ${error}`, {
      duration: 3000,
      position: "bottom-right",
    });
    // console.error("Error storing license data:", error.message);
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
    e.preventDefault();
    const instanceName = generatePhrase();

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
            instance_name: userName || instanceName,
            handshake_password: handshakePassword,
          }),
        }
      );

      // Debugging response status
      toast(`Response status: ${response.status}`, {
        duration: 3000,
        position: "bottom-right",
      });

      const data = await response.json();

      // Debugging response data
      toast(`Response data: ${JSON.stringify(data)}`, {
        duration: 3000,
        position: "bottom-right",
      });

      if (!response.ok) {
        throw new Error(`Error: ${data.message || "Unknown error"}`);
      }

      if (!data.meta?.store_id) {
        throw new Error("Missing store ID in response");
      }

      // Debugging store ID
      toast(`Store ID: ${data.meta.store_id}`, {
        duration: 3000,
        position: "bottom-right",
      });

      if (data.meta.store_id === 134128 || data.meta.store_id === 132851) {
        await storeLicenseData(data);

        // Debugging license data storage
        toast("License data stored successfully", {
          duration: 3000,
          position: "bottom-right",
        });

        refreshLicenseData();

        toast.success("License activated successfully!", {
          duration: 2000,
          position: "bottom-right",
        });

        setActivationKey("");
        setUserName("");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Store ID does not match required values", {
          duration: 3000,
          position: "bottom-right",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        // TypeScript now knows 'error' is an Error object
        toast.error(`Activation error: ${error.message}`, {
          duration: 3000,
          position: "bottom-right",
        });
        console.error("Activation error details:", error.stack);
      } else {
        // Handle unexpected error types
        toast.error("An unexpected error occurred.", {
          duration: 3000,
          position: "bottom-right",
        });
        console.error("Unknown error:", error);
      }
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
