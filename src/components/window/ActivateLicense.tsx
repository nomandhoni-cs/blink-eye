import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import toast from "react-hot-toast";

const ActivateLicense = () => {
  const [activationKey, setActivationKey] = useState("");
  const [validationKey, setValidationKey] = useState("");
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey.trim()) {
      toast.error("Please enter a license key");
      return;
    }

    setLoading((prev) => ({ ...prev, activation: true }));
    try {
      const activateLicense = async (url: string) => {
        const response = await tauriFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            license_key: activationKey,
            instance_name: "Blink_Eye_Tauri_Test",
          }),
        });

        const data = await response.json(); // Parse JSON once and store it
        console.log(data);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return data;
      };

      try {
        const data = await activateLicense(
          "https://lemonsquizzy.netlify.app/.netlify/functions/activateLicense"
        );
        console.log(data);
        toast.success("License activated successfully!");
        setActivationKey("");
      } catch (error) {
        console.log("Trying fallback endpoint...");
        const data = await activateLicense(
          "https://blinkeye.vercel.app/api/activateLicense"
        );
        console.log(data);
        toast.success("License activated successfully!");
        setActivationKey("");
      }
    } catch (error) {
      console.error("Error activating license:", error);
      toast.error("Failed to activate license. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, activation: false }));
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationKey.trim()) {
      toast.error("Please enter a license key");
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
            license_key: validationKey,
          }),
        }
      );

      const data = await response.json(); // Parse JSON once and store it
      console.log(data);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      toast.success("License validated successfully!");
      setValidationKey("");
    } catch (error) {
      console.error("Error validating license:", error);
      toast.error("Failed to validate license. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, validation: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Activation Section */}
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

      {/* Validation Section */}
      <form onSubmit={handleValidate} className="space-y-4">
        <h3 className="text-lg font-semibold">
          Validate your Blink Eye license
        </h3>
        <div className="space-y-2">
          <Label htmlFor="validationKey">Enter your license key</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              id="validationKey"
              value={validationKey}
              onChange={(e) => setValidationKey(e.target.value)}
              placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
              disabled={loading.validation}
            />
            <Button type="submit" disabled={loading.validation}>
              {loading.validation ? "Validating..." : "Validate"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActivateLicense;
