// PremiumFeaturesContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useLicenseKey } from "../hooks/useLicenseKey";

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
  const { isTrialOn } = useOnlineStatus();
  const { licenseData } = useLicenseKey();
  const [canAccessPremiumFeatures, setCanAccessPremiumFeatures] =
    useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

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
