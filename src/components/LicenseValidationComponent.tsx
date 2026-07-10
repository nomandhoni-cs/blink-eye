import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { useLicenseKey } from "../hooks/useLicenseKey";
const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

const LicenseValidationComponent: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { licenseData, refreshLicenseData } = useLicenseKey();

  const isNotToday = (dateString: string): boolean => {
    const today = new Date();
    const inputDate = new Date(dateString);
    return (
      inputDate.getFullYear() !== today.getFullYear() ||
      inputDate.getMonth() !== today.getMonth() ||
      inputDate.getDate() !== today.getDate()
    );
  };

  const getDateDiffInDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 3600 * 24));
  };

  const handleLicenseValidation = async (
    lastValidated: string,
    licenseKey: string
  ) => {
    if (!licenseKey) {
      toast.error("Missing license key for validation.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await tauriFetch(
        "https://api.blinkeye.app/validate-license",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            license_key: licenseKey,
            handshake_password: handshakePassword,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (
        (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) &&
        data.valid
      ) {
        await invoke("update_license_fields", {
          fields: {
            status: data.license_key.status,
            last_validated: today,
          },
        });
      } else if (
        (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) &&
        !data.valid
      ) {
        const diffInDays = getDateDiffInDays(lastValidated, today);
        if (diffInDays > 7) {
          await invoke("update_license_fields", {
            fields: { status: data.license_key.status },
          });
        } else {
          return;
        }
        return;
      } else {
        console.log(
          "Store ID does not match required values. Validation skipped."
        );
        return;
      }

      if (!response.ok) {
        const diffInDays = getDateDiffInDays(lastValidated, today);
        if (diffInDays > 7) {
          await invoke("update_license_fields", {
            fields: { status: "disabled" },
          });
        }
        return;
      }
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    const validateLicense = async () => {
      await refreshLicenseData();
      setIsDataLoaded(true);
    };
    validateLicense();
  }, []);

  useEffect(() => {
    if (
      isDataLoaded &&
      licenseData &&
      isNotToday(licenseData.last_validated)
    ) {
      console.log(licenseData);
      handleLicenseValidation(
        licenseData.last_validated,
        licenseData.license_key
      );
    }
  }, [isDataLoaded]);

  return null;
};

export default LicenseValidationComponent;
