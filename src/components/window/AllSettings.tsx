import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { invoke } from "@tauri-apps/api/core";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";
import { useAccentColor } from "../../contexts/AccentColorContext";
import {
  IoRocket,
  IoEllipseOutline,
  IoBarChart,
  IoSave,
} from "react-icons/io5";

const USAGE_LIMIT_OPTIONS = Array.from({ length: 24 }, (_, i) => i + 1);

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

const AllSettings = () => {
  const { accentHex } = useAccentColor();
  const [timeLimit, setTimeLimit] = useState<number>(8);
  const [savedTimeLimit, setSavedTimeLimit] = useState<number>(8);
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);
  const [isCircleTimerEnabled, setIsCircleTimerEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedLimit = await invoke<string | null>("get_config_string", {
          key: "usageTimeLimit",
        });
        if (savedLimit) {
          const limit = Number(savedLimit);
          setTimeLimit(limit);
          setSavedTimeLimit(limit);
        }

        const circleTimer = await invoke<boolean>("get_config_bool", {
          key: "useCircleProgressTimerStyle",
          defaultValue: true,
        });
        setIsCircleTimerEnabled(circleTimer);

        const runOnStartUp = await invoke<string | null>("get_config_string", {
          key: "isRunOnStartUpEnabledByDefault",
        });

        if (!runOnStartUp || runOnStartUp === "false") {
          await enable();
          await invoke("update_reminder_setting", {
            key: "isRunOnStartUpEnabledByDefault",
            value: "true",
          });
          toast.success("AutoStart Enabled by Default", {
            duration: 2000,
            position: "bottom-right",
          });
          setIsAutoStartEnabled(true);
        } else {
          const status = await isEnabled();
          setIsAutoStartEnabled(status);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings. Please try again later.", {
          duration: 2000,
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const isTimeLimitDirty = timeLimit !== savedTimeLimit;

  const handleAutoStartChange = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
        toast.success("Enabled Autostart", {
          duration: 2000,
          position: "bottom-right",
        });
      } else {
        await disable();
        toast.success("Disabled Autostart", {
          duration: 2000,
          position: "bottom-right",
        });
      }
      setIsAutoStartEnabled(checked);
    } catch (error) {
      console.error("Failed to update autostart status:", error);
    }
  };

  const handleCircleTimerChange = async (checked: boolean) => {
    try {
      await invoke("update_reminder_setting", {
        key: "useCircleProgressTimerStyle",
        value: String(checked),
      });
      setIsCircleTimerEnabled(checked);
    } catch (error) {
      console.error("Failed to update circle timer style:", error);
    }
  };

  const handleSaveLimit = async () => {
    if (isNaN(timeLimit) || timeLimit < 1 || timeLimit > 24) {
      toast.error("Invalid limit. Please enter a number between 1 and 24.", {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    try {
      await invoke("update_reminder_setting", {
        key: "usageTimeLimit",
        value: String(timeLimit),
      });
      setSavedTimeLimit(timeLimit);
      toast.success("Screen usage limit saved successfully!", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Failed to save limit:", error);
      toast.error("Failed to save limit. Please try again later.", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="space-y-5 p-2">
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoRocket className="size-4" />
            </SettingIconBadge>
          }
          label="Run on startup"
          description="Start Blink Eye when your computer boots"
        >
          <Switch
            id="autostart"
            checked={isAutoStartEnabled}
            onCheckedChange={handleAutoStartChange}
            disabled={isLoading}
          />
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoEllipseOutline className="size-4" />
            </SettingIconBadge>
          }
          label="Circle progress timer"
          description="Use a circular timer instead of a linear bar"
        >
          <Switch
            id="useCircleProgressTimerStyle"
            checked={isCircleTimerEnabled}
            onCheckedChange={handleCircleTimerChange}
            disabled={isLoading}
          />
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoBarChart className="size-4" />
            </SettingIconBadge>
          }
          label="Daily screen usage limit"
          description="Shown on the usage time graph"
          controlClassName="flex w-full justify-end sm:min-w-[180px] sm:max-w-[200px]"
        >
          <Select
            value={String(timeLimit)}
            onValueChange={(val) => setTimeLimit(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger
              id="screenUsageLimit"
              className="w-full rounded-3xl bg-background/50"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USAGE_LIMIT_OPTIONS.map((hours) => (
                <SelectItem key={hours} value={String(hours)}>
                  {hours} {hours === 1 ? "hour" : "hours"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </div>

      {isTimeLimitDirty && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveLimit}
            disabled={isLoading}
            className="gap-2 text-white hover:opacity-90"
            style={{ backgroundColor: accentHex }}
          >
            <IoSave className="size-4" />
            Save limit
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllSettings;
