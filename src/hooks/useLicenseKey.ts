import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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

export function useLicenseKey(): UseLicenseKeyReturn {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLicenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const info: {
        license_key: string | null;
        status: string | null;
        last_validated: string | null;
      } = await invoke("get_license_info");

      if (info.license_key && info.status) {
        setLicenseData({
          license_key: info.license_key,
          status: info.status,
          last_validated: info.last_validated ?? "",
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
