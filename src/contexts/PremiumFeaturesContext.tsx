// PremiumFeaturesContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  createPremiumRefresh,
  initialPremiumSnapshot,
  isSamePremiumSnapshot,
  millisecondsUntilNextDay,
  type PremiumSnapshot,
  type TrialInfo,
} from "../lib/premium-entitlement";

interface PremiumFeaturesContextType extends PremiumSnapshot {
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly refreshPremiumFeatures: () => Promise<PremiumSnapshot>;
}

const PremiumFeaturesContext = createContext<
  PremiumFeaturesContextType | undefined
>(undefined);

export const PremiumFeaturesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState(initialPremiumSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const clientRef = useRef<ReturnType<typeof createPremiumRefresh> | null>(null);

  const refreshPremiumFeatures = useCallback(() => {
    if (!clientRef.current) return Promise.resolve(initialPremiumSnapshot);
    setIsRefreshing(true);
    return clientRef.current.refresh();
  }, []);

  useEffect(() => {
    const client = createPremiumRefresh(
      {
        trial: () => invoke<TrialInfo>("get_trial_info"),
        license: () => invoke<{ is_paid: boolean }>("get_license_info"),
      },
      (next) => {
        setSnapshot((current) => (isSamePremiumSnapshot(current, next) ? current : next));
        setIsLoading(false);
        setIsRefreshing(false);
      },
    );
    clientRef.current = client;
    // Background checks keep showing the last known state; only explicit
    // refreshes (Retry, enabling a premium option) report isRefreshing.
    // Focus and visibilitychange fire together, so an in-flight check is reused.
    let backgroundPending = false;
    const refresh = () => {
      if (backgroundPending) return;
      backgroundPending = true;
      void client.refresh().finally(() => {
        backgroundPending = false;
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    let midnight: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      midnight = setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, millisecondsUntilNextDay(new Date()));
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    scheduleMidnight();
    refresh();
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(midnight);
      client.cancel();
      clientRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({ ...snapshot, isLoading, isRefreshing, refreshPremiumFeatures }),
    [snapshot, isLoading, isRefreshing, refreshPremiumFeatures],
  );

  return (
    <PremiumFeaturesContext.Provider value={value}>
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
