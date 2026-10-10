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

export async function readPremiumSnapshot(read: PremiumReads): Promise<PremiumSnapshot> {
  const [trial, license] = await Promise.allSettled([read.trial(), read.license()]);
  const trialInfo = trial.status === "fulfilled" ? trial.value : null;
  const isPaidUser = license.status === "fulfilled" && license.value.is_paid;
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
  let latest = Promise.resolve(initialPremiumSnapshot);
  return {
    refresh(): Promise<PremiumSnapshot> {
      const request = ++generation;
      latest = readPremiumSnapshot(read).then((snapshot) => {
        if (!active) return initialPremiumSnapshot;
        if (request !== generation) return latest;
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

export function getEffectiveMonitorMode(saved: boolean, premium: boolean): "all" | "primary" {
  return saved && premium ? "all" : "primary";
}

/** Calendar construction respects local timezone and daylight-saving changes. */
export function millisecondsUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}
