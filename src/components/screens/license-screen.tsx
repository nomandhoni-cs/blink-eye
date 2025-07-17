import { Loader2Icon, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { storeLicenseData } from "../window/ActivateLicense";
import toast from "react-hot-toast";
import { generatePhrase } from "../../lib/namegenerator";
import { useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { Label } from "../ui/label";
const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

interface LicenseScreenProps {
  licenseKey: string;
  setLicenseKey: (value: string) => void;
  userName: string;
  setUserName: (value: string) => void;
}

export default function LicenseScreen({
  licenseKey,
  setLicenseKey,
  userName,
  setUserName,
}: LicenseScreenProps) {
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    const instanceName = generatePhrase();
    e.preventDefault();

    if (!licenseKey.trim()) {
      toast.error("Please enter a license key");
      return;
    }

    setLoading((prev) => ({ ...prev, activation: true }));

    try {
      const response = await fetch(
        "https://blinkeye.vercel.app/api/activatelicense",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_key: licenseKey,
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

        toast.success("License activated successfully!", {
          duration: 2000,
          position: "bottom-right",
        });
        setLicenseKey(""); // Clear input field
        setUserName(""); // Clear input field
        setIsActivated(true); // ✅ Mark as activated
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
  return (
    <div className="relative flex flex-col items-center justify-center h-full space-y-4 overflow-hidden">
      <div className="text-center space-y-2">
        <Shield className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-3xl font-bold  font-heading">License Activation</h2>
        <p className="text-foreground/80">
          If you have license key enter to activate Blink Eye here!{" "}
          <b className="font-heading text-foreground">Else click 'Complete'</b>
        </p>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {isActivated ? (
          <div className="w-full max-w-xl text-center space-y-4 p-6 border bg-background rounded-lg shadow-sm">
            <h3 className="text-2xl font-heading text-green-600">
              ✅ License Activated
            </h3>
            <p className="text-lg font-medium">Click Complete</p>
          </div>
        ) : (
          <form
            className="w-full p-6 border bg-background rounded-lg shadow-sm space-x-4"
            onSubmit={handleActivate}
          >
            {/* Input Section */}
            <div className=" w-full space-y-2">
              <div>
                <Label htmlFor="activationKey" className="font-medium">
                  Enter Your License Key
                </Label>
                <Input
                  type="text"
                  id="activationKey"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
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

              <Button
                type="submit"
                disabled={loading.activation}
                className="w-full font-semibold rounded-md"
              >
                {loading.activation && (
                  <Loader2Icon className="motion-safe:animate-spin" />
                )}
                {loading.activation ? "Activating..." : "Activate"}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500 space-y-1">
            <p>{"Don't have a license key?"}</p>
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              <a href="https://blinkeye.app/en/pricing" target="_blank">
                Get one license key to support the developer.
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
