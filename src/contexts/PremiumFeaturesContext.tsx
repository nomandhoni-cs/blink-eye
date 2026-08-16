// PremiumFeaturesContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { useLicenseKey } from "../hooks/useLicenseKey";

interface TrialInfo {
  install_date: string | null;
  days_remaining: number;
  is_active: boolean;
  clock_manipulated: boolean;
}

interface PremiumFeaturesContextType {
  canAccessPremiumFeatures: boolean;
  isTrialOn: boolean;
  isPaidUser: boolean;
}

const PremiumFeaturesContext = createContext<
  PremiumFeaturesContextType | undefined
>(undefined);

export const PremiumFeaturesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { licenseData } = useLicenseKey();
  const [canAccessPremiumFeatures, setCanAccessPremiumFeatures] =
    useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isTrialOn, setIsTrialOn] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const info: TrialInfo = await invoke("get_trial_info");
        if (info.clock_manipulated) {
          await message(
            "System clock manipulation detected: Current date is before installation date.",
            { title: "Blink Eye", kind: "error" }
          );
        }
        setIsTrialOn(info.is_active);
      } catch (err) {
        console.error("[PremiumFeatures] Failed to get trial info:", err);
      }
    };
    checkTrial();
  }, []);

  useEffect(() => {
    const paidUser = licenseData?.status === "active";
    setIsPaidUser(paidUser);
    setCanAccessPremiumFeatures(paidUser || isTrialOn);
  }, [licenseData, isTrialOn]);

  return (
    <PremiumFeaturesContext.Provider
      value={{ canAccessPremiumFeatures, isTrialOn, isPaidUser }}
    >
      {children}
    </PremiumFeaturesContext.Provider>
  );
};

export const usePremiumFeatures = () => {
  const context = useContext(PremiumFeaturesContext);
  if (context === undefined) {
    throw new Error(
      "usePremiumFeatures must be used within a PremiumFeaturesProvider"
    );
  }
  return context;
};
