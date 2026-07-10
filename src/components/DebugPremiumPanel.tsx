import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DebugInfo {
  // Trial (from Rust)
  installDate: string | null;
  trialDaysLeft: number | null;
  trialActive: boolean | null;
  clockManipulated: boolean | null;
  trialError: string | null;

  // License (from Rust)
  licenseKey: string | null;
  licenseStatus: string | null;
  isPaid: boolean | null;
  licenseError: string | null;

  // Raw data for debugging
  rawLicenseKey: string | null;
  rawLicenseStatus: string | null;
  rawPassword: string | null;

  // Premium (derived)
  isPremium: boolean | null;

  // Reminder settings (from Rust)
  intervalMins: number | null;
  durationSecs: number | null;
  reminderText: string | null;
  backgroundStyle: string | null;

  // Config (from Rust)
  isMultiMonitor: boolean | null;
  isStrictMode: boolean | null;
  isWorkdayEnabled: boolean | null;
}

/// Debug panel that verifies Rust crypto, premium, and install date logic.
/// ALL data comes from Rust Tauri commands — no frontend DB reads.
const DebugPremiumPanel: React.FC = () => {
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gather = async () => {
      const data: DebugInfo = {
        installDate: null,
        trialDaysLeft: null,
        trialActive: null,
        clockManipulated: null,
        trialError: null,
        licenseKey: null,
        licenseStatus: null,
        isPaid: null,
        licenseError: null,
        rawLicenseKey: null,
        rawLicenseStatus: null,
        rawPassword: null,
        isPremium: null,
        intervalMins: null,
        durationSecs: null,
        reminderText: null,
        backgroundStyle: null,
        isMultiMonitor: null,
        isStrictMode: null,
        isWorkdayEnabled: null,
      };

      // 1. Trial info from Rust
      try {
        const trial = await invoke<{
          install_date: string | null;
          days_remaining: number;
          is_active: boolean;
          clock_manipulated: boolean;
        }>("get_trial_info");
        data.installDate = trial.install_date;
        data.trialDaysLeft = trial.days_remaining;
        data.trialActive = trial.is_active;
        data.clockManipulated = trial.clock_manipulated;
      } catch (e) {
        data.trialError = String(e);
      }

      // 2. License info from Rust
      try {
        const license = await invoke<{
          license_key: string | null;
          status: string | null;
          is_paid: boolean;
        }>("get_license_info");
        data.licenseKey = license.license_key;
        data.licenseStatus = license.status;
        data.isPaid = license.is_paid;
      } catch (e) {
        data.licenseError = String(e);
      }

      // 3. Combined premium
      data.isPremium = data.isPaid || data.trialActive;

      // 4. Reminder settings from Rust
      try {
        const settings = await invoke<{
          interval_mins: number | null;
          duration_secs: number | null;
          reminder_text: string | null;
          background_style: string | null;
        }>("get_reminder_settings");
        data.intervalMins = settings.interval_mins;
        data.durationSecs = settings.duration_secs;
        data.reminderText = settings.reminder_text;
        data.backgroundStyle = settings.background_style;
      } catch (e) {
        console.error("Failed to get reminder settings:", e);
      }

      // 5. Config booleans from Rust
      try {
        data.isMultiMonitor = await invoke<boolean>("get_config_bool", {
          key: "isMultiMonitorEnabled",
          defaultValue: false,
        });
        data.isStrictMode = await invoke<boolean>("get_config_bool", {
          key: "usingStrictMode",
          defaultValue: false,
        });
        data.isWorkdayEnabled = await invoke<boolean>("get_config_bool", {
          key: "isWorkdayEnabled",
          defaultValue: false,
        });
      } catch (e) {
        console.error("Failed to get config:", e);
      }

      setInfo(data);
      setLoading(false);
    };

    gather();
  }, []);

  if (loading) return <div className="p-4 text-sm">Loading debug info...</div>;
  if (!info) return null;

  const Row = ({
    label,
    value,
    warn,
  }: {
    label: string;
    value: string | number | boolean | null;
    warn?: boolean;
  }) => (
    <div
      className={`flex justify-between py-1 border-b border-white/10 ${warn ? "text-yellow-400" : ""}`}
    >
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-right">{String(value ?? "—")}</span>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-black/90 text-white text-sm rounded-xl border border-white/20 p-4 z-50 font-sans">
      <h3 className="font-heading text-lg mb-3 font-semibold">
        Debug: All from Rust
      </h3>

      {info.clockManipulated && (
        <div className="bg-red-500/20 text-red-400 rounded-lg p-2 mb-3 text-xs">
          CLOCK MANIPULATION DETECTED
        </div>
      )}
      {info.trialError && (
        <div className="bg-red-500/20 text-red-400 rounded-lg p-2 mb-3 text-xs">
          Trial: {info.trialError}
        </div>
      )}
      {info.licenseError && (
        <div className="bg-red-500/20 text-red-400 rounded-lg p-2 mb-3 text-xs">
          License: {info.licenseError}
        </div>
      )}

      <div className="mb-3">
        <h4 className="text-xs uppercase text-gray-500 mb-1">
          Trial (Rust get_trial_info)
        </h4>
        <Row label="Install date" value={info.installDate} />
        <Row
          label="Days remaining"
          value={info.trialDaysLeft}
          warn={info.trialActive === true}
        />
        <Row label="Trial active" value={info.trialActive} />
        <Row label="Clock manipulated" value={info.clockManipulated} />
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase text-gray-500 mb-1">
          License (Rust get_license_info)
        </h4>
        <Row
          label="Status"
          value={info.licenseStatus}
          warn={info.isPaid === true}
        />
        <Row label="License key" value={info.licenseKey} />
        <Row label="Is paid" value={info.isPaid} />
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase text-gray-500 mb-1">
          Premium (derived)
        </h4>
        <Row label="Is premium" value={info.isPremium} warn={info.isPremium === true} />
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase text-gray-500 mb-1">
          Reminder (Rust get_reminder_settings)
        </h4>
        <Row label="Interval (mins)" value={info.intervalMins} />
        <Row label="Duration (secs)" value={info.durationSecs} />
        <Row label="Background style" value={info.backgroundStyle} />
        <Row label="Reminder text" value={info.reminderText} />
      </div>

      <div className="mb-1">
        <h4 className="text-xs uppercase text-gray-500 mb-1">
          Config (Rust get_config_bool)
        </h4>
        <Row label="Multi-monitor" value={info.isMultiMonitor} />
        <Row label="Strict mode" value={info.isStrictMode} />
        <Row label="Workday enabled" value={info.isWorkdayEnabled} />
      </div>
    </div>
  );
};

export default DebugPremiumPanel;
