import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { invoke } from "@tauri-apps/api/core";
import { entryForStyle } from "../../backgrounds/registry";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTrigger } from "../../contexts/TriggerReRender";
import {
  IoTimer,
  IoHourglass,
  IoChatbubble,
  IoSave,
  IoEye,
  IoLockClosed,
  IoAlarm,
} from "react-icons/io5";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { useAccentColor } from "../../contexts/AccentColorContext";

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 45, 60, 90, 120];
const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120, 300];
const SNOOZE_LIMIT_OPTIONS = [0, 1, 2, 3, 5, 10, 15, 20];

type ReminderSettingsState = {
  interval: number;
  duration: number;
  reminderText: string;
  snoozesPerSession: number;
  snoozesPerDay: number;
};

function formatSnoozeLimit(value: number) {
  return value === 0 ? "Unlimited" : String(value);
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

const ReminderSettings = () => {
  const { triggerUpdate } = useTrigger();
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const { accentHex } = useAccentColor();
  const [interval, setInterval] = useState<number>(20);
  const [duration, setDuration] = useState<number>(20);
  const [reminderText, setReminderText] = useState<string>("");
  const [backgroundStyle, setBackgroundStyle] = useState<string>("");
  const [saved, setSaved] = useState<ReminderSettingsState>({
    interval: 20,
    duration: 20,
    reminderText: "",
    snoozesPerSession: 3,
    snoozesPerDay: 10,
  });
  const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);
  const [snoozesPerSession, setSnoozesPerSession] = useState(3);
  const [snoozesPerDay, setSnoozesPerDay] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings: {
          intervalMins: number | null;
          durationSecs: number | null;
          reminderText: string | null;
          backgroundStyle: string | null;
        } = await invoke("get_reminder_settings");

        const loaded: ReminderSettingsState = {
          interval: settings.intervalMins ?? 20,
          duration: settings.durationSecs ?? 20,
          reminderText: settings.reminderText ?? "",
          snoozesPerSession: 3,
          snoozesPerDay: 10,
        };

        const [sessionLimit, dayLimit] = await Promise.all([
          invoke<string | null>("get_config_string", {
            key: "snoozesAllowedPerSession",
          }),
          invoke<string | null>("get_config_string", {
            key: "snoozesAllowedPerDay",
          }),
        ]);

        if (sessionLimit !== null && sessionLimit !== "") {
          loaded.snoozesPerSession = Number(sessionLimit);
        }
        if (dayLimit !== null && dayLimit !== "") {
          loaded.snoozesPerDay = Number(dayLimit);
        }

        if (settings.backgroundStyle) setBackgroundStyle(settings.backgroundStyle);
        setInterval(loaded.interval);
        setDuration(loaded.duration);
        setReminderText(loaded.reminderText);
        setSnoozesPerSession(loaded.snoozesPerSession);
        setSnoozesPerDay(loaded.snoozesPerDay);
        setSaved(loaded);

        const strictMode = await invoke<boolean>("get_config_bool", {
          key: "usingStrictMode",
          defaultValue: false,
        });
        setIsStrictModeEnabled(strictMode);
      } catch (error) {
        console.error("Failed to load reminder settings:", error);
        toast.error("Couldn't load settings. Try again.", {
          duration: 2000,
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const isDirty =
    interval !== saved.interval ||
    duration !== saved.duration ||
    reminderText !== saved.reminderText ||
    snoozesPerSession !== saved.snoozesPerSession ||
    snoozesPerDay !== saved.snoozesPerDay;

  const handleSave = async () => {
    if (interval <= 0 || duration <= 0) {
      toast.error("Set interval and duration above 0.", {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    const intervalChanged = interval !== saved.interval;
    const durationChanged = duration !== saved.duration;
    const textChanged = reminderText !== saved.reminderText;
    const sessionLimitChanged = snoozesPerSession !== saved.snoozesPerSession;
    const dayLimitChanged = snoozesPerDay !== saved.snoozesPerDay;

    if (
      !intervalChanged &&
      !durationChanged &&
      !textChanged &&
      !sessionLimitChanged &&
      !dayLimitChanged
    ) {
      return;
    }

    setIsSaving(true);
    try {
      if (intervalChanged) {
        await invoke("update_reminder_setting", {
          key: "blinkEyeReminderInterval",
          value: String(interval),
        });
      }
      if (durationChanged) {
        await invoke("update_reminder_setting", {
          key: "blinkEyeReminderDuration",
          value: String(duration),
        });
      }
      if (textChanged) {
        await invoke("update_reminder_setting", {
          key: "blinkEyeReminderScreenText",
          value: reminderText,
        });
      }
      if (sessionLimitChanged) {
        await invoke("update_reminder_setting", {
          key: "snoozesAllowedPerSession",
          value: String(snoozesPerSession),
        });
      }
      if (dayLimitChanged) {
        await invoke("update_reminder_setting", {
          key: "snoozesAllowedPerDay",
          value: String(snoozesPerDay),
        });
      }

      if (
        intervalChanged ||
        durationChanged ||
        textChanged ||
        sessionLimitChanged ||
        dayLimitChanged
      ) {
        await invoke("refresh_reminder_scheduler_settings");
      }

      setSaved({
        interval,
        duration,
        reminderText,
        snoozesPerSession,
        snoozesPerDay,
      });
      triggerUpdate();

      toast.success("Saved reminder settings", {
        duration: 1500,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Failed to save reminder settings:", error);
      toast.error("Couldn't save settings. Try again.", {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStrictModeChange = async (checked: boolean) => {
    try {
      await invoke("update_reminder_setting", {
        key: "usingStrictMode",
        value: String(checked),
      });
      setIsStrictModeEnabled(checked);
    } catch (error) {
      console.error("Failed to update strict mode:", error);
      toast.error("Couldn't save strict mode. Try again.", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  const openReminderWindow = () => {
    const isPremium = canAccessPremiumFeatures;
    const requestedStyle = isPremium ? backgroundStyle : "default";
    const entry = entryForStyle(requestedStyle);
    const webview = new WebviewWindow("reminder_monitor_0", {
      url: `/${entry}?config=${encodeURIComponent(JSON.stringify({ isPremium }))}`,
      title: "Take A Break Reminder - Blink Eye",
      fullscreen: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    });

    webview.once("tauri://error", (e) => {
      console.error("Error creating reminder window:", e);
    });
  };

  return (
    <div className="relative space-y-5 p-2 pb-24">
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoTimer className="size-4" />
            </SettingIconBadge>
          }
          label="Break frequency"
          description="How often you get a break reminder"
        >
          <Select
            value={String(interval)}
            onValueChange={(val) => setInterval(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full rounded-3xl bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoHourglass className="size-4" />
            </SettingIconBadge>
          }
          label="Break duration"
          description="How long each break screen stays open"
        >
          <Select
            value={String(duration)}
            onValueChange={(val) => setDuration(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full rounded-3xl bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoChatbubble className="size-4" />
            </SettingIconBadge>
          }
          label="Reminder message"
          description="Text shown on your break screen"
          controlClassName="flex w-full justify-end sm:min-w-[320px] sm:max-w-lg"
        >
          <Input
            type="text"
            placeholder="Pause! Look into the distance, and walk if you can."
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
            disabled={isLoading}
            className="bg-background/50 text-base"
          />
        </SettingRow>
      </div>

      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <IoTimer className="size-3" />
            Every {interval} min
          </Badge>
          <span className="text-xs text-muted-foreground">→</span>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <IoHourglass className="size-3" />
            {duration}s break
          </Badge>
        </div>

        <Button
          onClick={openReminderWindow}
          variant="secondary"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <IoEye className="mr-2 size-4" />
          Preview break
        </Button>
      </div>

      <div className="space-y-2">
        <div className="px-1">
          <h2 className="text-sm font-medium">Skip limits</h2>
          <p className="text-xs text-muted-foreground">
            Control how often you can skip a break and whether skipping is
            allowed.
          </p>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoAlarm className="size-4" />
              </SettingIconBadge>
            }
            label="Snoozes per session"
            description="Skip clicks allowed until you restart the app (0 = unlimited)"
          >
            <Select
              value={String(snoozesPerSession)}
              onValueChange={(val) => setSnoozesPerSession(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full rounded-3xl bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNOOZE_LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {formatSnoozeLimit(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoAlarm className="size-4" />
              </SettingIconBadge>
            }
            label="Snoozes per day"
            description="Skip clicks allowed per calendar day (0 = unlimited)"
          >
            <Select
              value={String(snoozesPerDay)}
              onValueChange={(val) => setSnoozesPerDay(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full rounded-3xl bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNOOZE_LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {formatSnoozeLimit(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoLockClosed className="size-4" />
              </SettingIconBadge>
            }
            label="Strict mode"
            description="Removes the Skip this time button during breaks"
          >
            <Switch
              id="usingStrictMode"
              checked={isStrictModeEnabled}
              onCheckedChange={handleStrictModeChange}
              disabled={isLoading}
            />
          </SettingRow>
        </div>
      </div>

      {(isDirty || isSaving) && (
        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving || !isDirty}
          className="fixed bottom-8 right-8 z-50 h-11 rounded-full px-6 text-sm text-white shadow-lg hover:opacity-90"
          style={{ backgroundColor: accentHex }}
        >
          <IoSave className="mr-2 size-4" />
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      )}
    </div>
  );
};

export default ReminderSettings;
