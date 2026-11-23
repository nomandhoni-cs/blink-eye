import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import toast from "react-hot-toast";
import { generatePhrase } from "../../lib/namegenerator";
import { Loader2Icon } from "lucide-react";
import { useLicenseKey } from "../../hooks/useLicenseKey";
import { useAccentColor } from "../../contexts/AccentColorContext";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import {
  IoShieldCheckmark,
  IoKey,
  IoPerson,
  IoBagHandle,
  IoCard,
  IoCopy,
  IoCheckmark,
  IoOpenOutline,
  IoWarning,
} from "react-icons/io5";

const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

export async function storeLicenseData(data: any) {
  try {
    await invoke("store_license_data", { data });
    console.log("License data saved or updated successfully");
  } catch (error) {
    console.error("Error storing license data:", error);
    throw new Error("Failed to store license data");
  }
}

function SettingIconBadge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
  controlClassName,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
  controlClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon}
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div
        className={
          controlClassName ??
          "flex w-full shrink-0 justify-end sm:w-auto sm:min-w-[180px]"
        }
      >
        {children}
      </div>
    </div>
  );
}

const ActivateLicense = () => {
  const { t } = useTranslation();
  const { accentHex } = useAccentColor();
  const [activationKey, setActivationKey] = useState("");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState({
    activation: false,
    validation: false,
  });

  const {
    licenseData,
    loading: licenseLoading,
    error: licenseError,
    refreshLicenseData,
  } = useLicenseKey();
  const { refreshPremiumFeatures, isRefreshing } = usePremiumFeatures();

  const handleActivate = async (e: React.FormEvent) => {
    const instanceName = generatePhrase();
    e.preventDefault();

    if (!activationKey.trim()) {
      toast.error(t("license.enterKey"));
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
        await refreshPremiumFeatures();
        console.log("License data stored successfully");
        refreshLicenseData();
        toast.success(t("license.activated"), {
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
      toast.error(t("license.failed"), {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setLoading((prev) => ({ ...prev, activation: false }));
    }
  };

  const maskLicenseKey = (licenseKey: string): string => {
    if (!licenseKey) return t("license.noLicenseFound");
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
        toast.success(t("license.copied"), {
          duration: 2000,
          position: "bottom-right",
        });
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error(t("license.copyFailed"), {
          duration: 2000,
          position: "bottom-right",
        });
      }
    }
  };

  const isLicenseActive = licenseData?.status === "active";
  const isLicenseInactive =
    licenseData?.status === "disabled" ||
    licenseData?.status === "inactive" ||
    licenseData?.status === "expired";

  return (
    <div className="space-y-5 p-2">
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoShieldCheckmark className="size-4" />
            </SettingIconBadge>
          }
          label={t("license.status")}
          description={t("license.statusDesc")}
        >
          <div role="status" className="flex flex-wrap items-center justify-end gap-2">
          {licenseLoading ? (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Loader2Icon className="size-3 animate-spin" />
              {t("license.checking")}
            </span>
          ) : licenseError ? (
            <>
              <span className="text-xs text-muted-foreground">
                {t("license.unableToCheck")}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isRefreshing}
                onClick={() =>
                  void Promise.all([refreshLicenseData(), refreshPremiumFeatures()])
                }
              >
                {t("common.retry")}
              </Button>
            </>
          ) : isLicenseActive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
              <IoShieldCheckmark className="size-3" />
              {t("license.active")}
            </span>
          ) : isLicenseInactive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500">
              <IoWarning className="size-3" />
              {licenseData?.status === "expired"
                ? t("license.expired")
                : licenseData?.status === "disabled"
                  ? t("license.disabled")
                  : t("license.inactive")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {licenseData ? t("license.inactive") : t("license.noLicense")}
            </span>
          )}
          </div>
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoKey className="size-4" />
            </SettingIconBadge>
          }
          label={t("license.licenseKey")}
          description={t("license.licenseKeyDesc")}
          controlClassName="flex w-full justify-end sm:min-w-[280px] sm:max-w-md"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleCopy(licenseData?.license_key || "")}
                  disabled={!licenseData?.license_key}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2 transition-all duration-150 hover:border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate font-mono text-xs font-medium">
                    {licenseData?.license_key
                      ? maskLicenseKey(licenseData.license_key)
                      : t("license.noLicenseFound")}
                  </span>
                  {licenseData?.license_key && (
                    <span className="shrink-0">
                      {copied ? (
                        <IoCheckmark className="size-3.5 text-emerald-500" />
                      ) : (
                        <IoCopy className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                      )}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {copied ? t("common.copied") : t("license.clickToCopy")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SettingRow>
      </div>

      <form onSubmit={handleActivate} className="space-y-4">
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoKey className="size-4" />
              </SettingIconBadge>
            }
            label={t("license.activateTitle")}
            description={t("license.activateDesc")}
            controlClassName="flex w-full justify-end sm:min-w-[280px] sm:max-w-md"
          >
            <Input
              type="text"
              id="activationKey"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
              placeholder={t("license.keyPlaceholder")}
              disabled={loading.activation}
              className="bg-background/50 font-mono text-base"
            />
          </SettingRow>

          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoPerson className="size-4" />
              </SettingIconBadge>
            }
            label={t("license.yourName")}
            description={t("license.yourNameDesc")}
            controlClassName="flex w-full justify-end sm:min-w-[280px] sm:max-w-md"
          >
            <Input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("license.namePlaceholder")}
              disabled={loading.activation}
              className="bg-background/50 text-base"
            />
          </SettingRow>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading.activation}
            className="gap-2 text-white hover:opacity-90"
            style={{ backgroundColor: accentHex }}
          >
            {loading.activation ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {t("license.activating")}
              </>
            ) : (
              <>
                <IoKey className="size-4" />
                {t("license.activateTitle")}
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoBagHandle className="size-4" />
            </SettingIconBadge>
          }
          label={t("license.myOrders")}
          description={t("license.myOrdersDesc")}
        >
          <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
            <a
              href="https://app.lemonsqueezy.com/my-orders"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("license.open")}
              <IoOpenOutline className="ml-2 size-4" />
            </a>
          </Button>
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoCard className="size-4" />
            </SettingIconBadge>
          }
          label={t("license.billingPortal")}
          description={t("license.billingPortalDesc")}
        >
          <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
            <a
              href="https://blinkeye.lemonsqueezy.com/billing"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("license.open")}
              <IoOpenOutline className="ml-2 size-4" />
            </a>
          </Button>
        </SettingRow>
      </div>
    </div>
  );
};

export default ActivateLicense;
