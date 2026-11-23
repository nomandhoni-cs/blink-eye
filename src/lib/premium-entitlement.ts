/** Existing local Rust command results; no license credentials are retained. */
export interface TrialInfo {
  readonly install_date: string | null;
  readonly days_remaining: number;
  readonly is_active: boolean;
  readonly clock_manipulated: boolean;
}

export interface PremiumSnapshot {
  readonly trialInfo: TrialInfo | null;
  readonly trialError: boolean;
  readonly licenseError: boolean;
  readonly isPaidUser: boolean;
  readonly isTrialOn: boolean;
  readonly canAccessPremiumFeatures: boolean;
}

interface PremiumReads {
  readonly trial: () => Promise<TrialInfo>;
  readonly license: () => Promise<{ readonly is_paid: boolean }>;
}

export const initialPremiumSnapshot: PremiumSnapshot = {
  trialInfo: null,
  trialError: false,
  licenseError: false,
  isPaidUser: false,
  isTrialOn: false,
  canAccessPremiumFeatures: false,
};

/** A failed read keeps the previous confirmed result instead of revoking access mid-session. */
export async function readPremiumSnapshot(
  read: PremiumReads,
  previous: PremiumSnapshot | null = null,
): Promise<PremiumSnapshot> {
  const [trial, license] = await Promise.allSettled([read.trial(), read.license()]);
  if (trial.status === "rejected") {
    console.error("[PremiumFeatures] Failed to read trial status:", trial.reason);
  }
  if (license.status === "rejected") {
    console.error("[PremiumFeatures] Failed to read license status:", license.reason);
  }
  const trialInfo = trial.status === "fulfilled" ? trial.value : (previous?.trialInfo ?? null);
  const isPaidUser =
    license.status === "fulfilled" ? license.value.is_paid : (previous?.isPaidUser ?? false);
  const isTrialOn = trialInfo?.is_active ?? false;
  return {
    trialInfo,
    trialError: trial.status === "rejected",
    licenseError: license.status === "rejected",
    isPaidUser,
    isTrialOn,
    canAccessPremiumFeatures: isPaidUser || isTrialOn,
  };
}

/** Superseded callers also await the newest result, including an enable action. */
export function createPremiumRefresh(
  read: PremiumReads,
  publish: (snapshot: PremiumSnapshot) => void,
) {
  let generation = 0;
  let active = true;
  let confirmed: PremiumSnapshot | null = null;
  let latest: Promise<PremiumSnapshot>;
  return {
    refresh(): Promise<PremiumSnapshot> {
      const request = ++generation;
      latest = readPremiumSnapshot(read, confirmed).then((snapshot) => {
        if (!active) return initialPremiumSnapshot;
        if (request !== generation) return latest;
        confirmed = snapshot;
        publish(snapshot);
        return snapshot;
      });
      return latest;
    },
    cancel() {
      active = false;
    },
  };
}

/** Unchanged background refreshes keep the same object, so consumers do not re-render. */
export function isSamePremiumSnapshot(a: PremiumSnapshot, b: PremiumSnapshot): boolean {
  return (
    a.trialError === b.trialError &&
    a.licenseError === b.licenseError &&
    a.isPaidUser === b.isPaidUser &&
    a.isTrialOn === b.isTrialOn &&
    a.canAccessPremiumFeatures === b.canAccessPremiumFeatures &&
    a.trialInfo?.install_date === b.trialInfo?.install_date &&
    a.trialInfo?.days_remaining === b.trialInfo?.days_remaining &&
    a.trialInfo?.is_active === b.trialInfo?.is_active &&
    a.trialInfo?.clock_manipulated === b.trialInfo?.clock_manipulated
  );
}

export function getEffectiveMonitorMode(saved: boolean, premium: boolean): "all" | "primary" {
  return saved && premium ? "all" : "primary";
}

/** Calendar construction respects local timezone and daylight-saving changes. */
export function millisecondsUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}
