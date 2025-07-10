"use client";

import { Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LicenseScreenProps {
  licenseKey: string;
  setLicenseKey: (value: string) => void;
}

export default function LicenseScreen({
  licenseKey,
  setLicenseKey,
}: LicenseScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center space-y-2">
        <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">License Activation</h2>
        <p className="text-gray-600">
          Enter your license key to activate Blink Eye
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Input
            placeholder="Enter your license key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="text-center text-lg py-6"
          />
        </div>

        <div className="text-center space-y-4">
          <Button className="w-full py-6 text-lg" disabled={!licenseKey.trim()}>
            Activate License
          </Button>

          <div className="text-sm text-gray-500 space-y-1">
            <p>{"Don't have a license key?"}</p>
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              Get your free trial
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg text-center max-w-md">
        <p className="text-sm text-gray-600">
          🔒 Your license key is encrypted and stored securely
        </p>
      </div>
    </div>
  );
}
