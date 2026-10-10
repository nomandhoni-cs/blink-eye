import { describe, expect, test } from "bun:test";
import {
  createPremiumRefresh,
  getEffectiveMonitorMode,
  millisecondsUntilNextDay,
  readPremiumSnapshot,
  type TrialInfo,
} from "../src/lib/premium-entitlement";

const activeTrial: TrialInfo = {
  install_date: "2026-10-03",
  days_remaining: 1,
  is_active: true,
  clock_manipulated: false,
};
const expiredTrial: TrialInfo = { ...activeTrial, days_remaining: 0, is_active: false };
const readFailure = () => Promise.reject(new Error("Synthetic local read failure"));

describe("local premium entitlement", () => {
  test("preserves paid access when the trial has expired", async () => {
    // Given an expired trial and an active paid license.
    const reads = { trial: async () => expiredTrial, license: async () => ({ is_paid: true }) };
    // When the local status is read.
    const status = await readPremiumSnapshot(reads);
    // Then paid access remains available.
    expect(status.isPaidUser).toBe(true);
    expect(status.canAccessPremiumFeatures).toBe(true);
    expect(status.isTrialOn).toBe(false);
  });

  test("disables premium when the trial expires without a paid license", async () => {
    const reads = { trial: async () => expiredTrial, license: async () => ({ is_paid: false }) };
    const status = await readPremiumSnapshot(reads);
    expect(status.canAccessPremiumFeatures).toBe(false);
    expect(status.trialInfo).toEqual(expiredTrial);
    expect(status.trialError).toBe(false);
  });

  test("preserves known paid access when the trial read fails", async () => {
    const reads = { trial: readFailure, license: async () => ({ is_paid: true }) };
    const status = await readPremiumSnapshot(reads);
    expect(status.canAccessPremiumFeatures).toBe(true);
    expect(status.isPaidUser).toBe(true);
    expect(status.trialError).toBe(true);
    expect(status.trialInfo).toBeNull();
  });

  test("preserves a known active trial when the license read fails", async () => {
    const reads = { trial: async () => activeTrial, license: readFailure };
    const status = await readPremiumSnapshot(reads);
    expect(status.canAccessPremiumFeatures).toBe(true);
    expect(status.licenseError).toBe(true);
    expect(status.isPaidUser).toBe(false);
  });

  test("keeps failed status reads distinct from confirmed expiry", async () => {
    const reads = { trial: readFailure, license: readFailure };
    const status = await readPremiumSnapshot(reads);
    expect(status.canAccessPremiumFeatures).toBe(false);
    expect(status.trialInfo).toBeNull();
    expect(status.trialError).toBe(true);
    expect(status.licenseError).toBe(true);
  });

  test("preserves missing install data as missing rather than expired", async () => {
    const missing = { ...expiredTrial, install_date: null };
    const status = await readPremiumSnapshot({ trial: async () => missing, license: async () => ({ is_paid: false }) });
    expect(status.trialInfo?.install_date).toBeNull();
    expect(status.trialError).toBe(false);
    expect(status.canAccessPremiumFeatures).toBe(false);
  });

  test("retains the backend clock-anomaly result without granting trial access", async () => {
    const anomaly = { ...expiredTrial, clock_manipulated: true };
    const status = await readPremiumSnapshot({ trial: async () => anomaly, license: async () => ({ is_paid: false }) });
    expect(status.trialInfo?.clock_manipulated).toBe(true);
    expect(status.canAccessPremiumFeatures).toBe(false);
  });

  test("refreshes an expired trial instead of retaining the previous active result", async () => {
    let trial = activeTrial;
    const observed: boolean[] = [];
    const client = createPremiumRefresh(
      { trial: async () => trial, license: async () => ({ is_paid: false }) },
      (status) => observed.push(status.canAccessPremiumFeatures),
    );
    await client.refresh();
    trial = expiredTrial;
    const status = await client.refresh();
    expect(status.canAccessPremiumFeatures).toBe(false);
    expect(observed).toEqual([true, false]);
  });

  test("makes older refresh callers receive the newest accepted result", async () => {
    const old = Promise.withResolvers<TrialInfo>();
    const current = Promise.withResolvers<TrialInfo>();
    let reads = 0;
    const observed: boolean[] = [];
    const client = createPremiumRefresh(
      { trial: () => (++reads === 1 ? old.promise : current.promise), license: async () => ({ is_paid: false }) },
      (status) => observed.push(status.canAccessPremiumFeatures),
    );
    const olderAction = client.refresh();
    const newerAction = client.refresh();
    current.resolve(expiredTrial);
    await newerAction;
    // An older active response arrives after expiry was already accepted.
    old.resolve(activeTrial);
    const result = await olderAction;
    expect(result.canAccessPremiumFeatures).toBe(false);
    expect(observed).toEqual([false]);
  });

  test("does not publish or authorize a late read after cleanup", async () => {
    const pending = Promise.withResolvers<TrialInfo>();
    const observed: boolean[] = [];
    const client = createPremiumRefresh(
      { trial: () => pending.promise, license: async () => ({ is_paid: true }) },
      (status) => observed.push(status.canAccessPremiumFeatures),
    );
    const request = client.refresh();
    client.cancel();
    pending.resolve(activeTrial);
    const result = await request;
    expect(result.canAccessPremiumFeatures).toBe(false);
    expect(observed).toEqual([]);
  });
});

describe("effective monitor mode", () => {
  test("uses primary mode after expiry despite the saved all-monitor preference", () => {
    const mode = getEffectiveMonitorMode(true, false);
    expect(mode).toBe("primary");
  });

  test("restores all-monitor eligibility when the saved preference and access are available", () => {
    expect(getEffectiveMonitorMode(true, true)).toBe("all");
  });

  test("respects an explicit primary preference when premium access returns", () => {
    expect(getEffectiveMonitorMode(false, true)).toBe("primary");
  });
});

describe("local calendar refresh", () => {
  test("schedules the next midnight rather than twenty-four hours after the current time", () => {
    const now = new Date(2026, 9, 9, 23, 59, 0);
    expect(millisecondsUntilNextDay(now)).toBe(60_000);
  });

  test("schedules the local day boundary across daylight-saving changes", () => {
    const previous = process.env.TZ;
    process.env.TZ = "Europe/Paris";
    try {
      const spring = new Date(2026, 2, 29, 0, 0, 0);
      const autumn = new Date(2026, 9, 25, 0, 0, 0);
      expect(millisecondsUntilNextDay(spring)).toBe(23 * 60 * 60 * 1000);
      expect(millisecondsUntilNextDay(autumn)).toBe(25 * 60 * 60 * 1000);
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
});
