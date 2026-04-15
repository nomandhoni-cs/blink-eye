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
import { Loader2Icon } from "lucide-react";
import { useLicenseKey } from "../../hooks/useLicenseKey";
import { encryptData } from "../../lib/cryptoUtils";
import {
  RiKeyLine,
  RiFileCopyLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiShoppingBag3Line,
  RiBankCardLine,
  RiShieldCheckLine,
  RiErrorWarningLine,
  RiLoaderLine,
  RiUserLine,
  RiSparkling2Line,
} from "react-icons/ri";

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
          activation_limit TEXT,
          activation_usage TEXT,
          created_at TEXT,
          expires_at TEXT,
          test_mode TEXT,
          instance_name TEXT,
          store_id TEXT,
          order_id TEXT,
          order_item_id TEXT,
          variant_name TEXT,
          product_name TEXT,
          customer_name TEXT,
          customer_email TEXT,
          last_validated TEXT
        );
      `);
  }

  return db;
}

export async function storeLicenseData(data: any) {
  const db = await initializeDatabase();

  try {
    await db.execute(
      `
      INSERT OR REPLACE INTO licenses (
        id,
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
        1,
        JSON.stringify(await encryptData(data.license_key.key)),
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
          await encryptData(new Date().toISOString().split("T")[0]),
        ),
      ],
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
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });

  const { licenseData, refreshLicenseData } = useLicenseKey();

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
        "https://api.blinkeye.app/activate-license",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_key: activationKey,
            instance_name: userName ? userName : instanceName,
            handshake_password: handshakePassword,
          }),
        },
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(`Error: ${data.message || "Unknown error"}`);
      }

      if (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) {
        await storeLicenseData(data);
        console.log("License data stored successfully");
        refreshLicenseData();
        toast.success("License activated successfully!", {
          duration: 2000,
          position: "bottom-right",
        });
        setActivationKey("");
        setUserName("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log(
          "Store ID does not match required values. License data not stored.",
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

  const maskLicenseKey = (licenseKey: string): string => {
    if (!licenseKey) return "No license found";
    const segments = licenseKey.split("-");
    return segments
      .map((segment, index) => (index >= 1 && index <= 3 ? "XXXX" : segment))
      .join("-");
  };

  const handleCopy = async (licenseKey: string) => {
    if (licenseKey) {
      try {
        await navigator.clipboard.writeText(licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("License key copied!", {
          duration: 2000,
          position: "bottom-right",
        });
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy license key to clipboard", {
          duration: 2000,
          position: "bottom-right",
        });
      }
    }
  };

  const isLicenseActive = licenseData?.status === "active";
  const isLicenseInactive =
    licenseData?.status === "disabled" || licenseData?.status === "inactive";

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <RiSparkling2Line className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-none">
            License & Billing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activate and manage your Blink Eye license
          </p>
        </div>
      </div>

      {/* Top Row: Status + Activate side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* License Status Card — spans 2 cols */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <RiShieldCheckLine className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              License Status
            </span>
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              {isLicenseActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <RiShieldCheckLine className="w-3 h-3" />
                  ACTIVE
                </span>
              ) : isLicenseInactive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                  <RiErrorWarningLine className="w-3 h-3" />
                  {licenseData?.status?.toUpperCase()}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
                  <RiLoaderLine className="w-3 h-3 animate-spin" />
                  CHECKING
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* License Key */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">License Key</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCopy(licenseData?.license_key || "")}
                      disabled={!licenseData?.license_key}
                      className="group flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-mono text-xs font-medium truncate">
                        {licenseData?.license_key
                          ? maskLicenseKey(licenseData.license_key)
                          : "No license found"}
                      </span>
                      {licenseData?.license_key && (
                        <span className="flex-shrink-0">
                          {copied ? (
                            <RiCheckLine className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <RiFileCopyLine className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {copied ? "Copied!" : "Click to copy full key"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Activate License Card — spans 3 cols */}
        <div className="lg:col-span-3 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <RiKeyLine className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Activate License
            </span>
          </div>

          <form onSubmit={handleActivate} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* License Key Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="activationKey"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <RiKeyLine className="w-3 h-3 text-muted-foreground" />
                  License Key
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="activationKey"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  disabled={loading.activation}
                  className="font-mono text-xs h-9"
                />
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="userName"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <RiUserLine className="w-3 h-3 text-muted-foreground" />
                  Your Name
                  <span className="text-muted-foreground text-xs font-normal ml-0.5">
                    (optional)
                  </span>
                </Label>
                <Input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading.activation}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading.activation}
              className="w-full h-9 text-sm font-semibold gap-2"
            >
              {loading.activation ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <RiKeyLine className="w-3.5 h-3.5" />
                  Activate License
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Billing & Recovery Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiBankCardLine className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Billing & License Recovery
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Lost your license key? Retrieve it below.
          </span>
        </div>

        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* My Orders */}
          <a
            href="https://app.lemonsqueezy.com/my-orders"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 px-4 py-3.5 rounded-lg border bg-background hover:bg-muted/40 hover:border-foreground/20 transition-all duration-150"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <RiShoppingBag3Line className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold leading-none">My Orders</p>
                <RiExternalLinkLine className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                View purchases & retrieve lost license keys
              </p>
            </div>
          </a>

          {/* Billing Portal */}
          <a
            href="https://blinkeye.lemonsqueezy.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 px-4 py-3.5 rounded-lg border bg-background hover:bg-muted/40 hover:border-foreground/20 transition-all duration-150"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <RiBankCardLine className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold leading-none">
                  Billing Portal
                </p>
                <RiExternalLinkLine className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                Manage subscriptions, invoices & payments
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ActivateLicense;
