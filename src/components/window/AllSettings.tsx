import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAccentColor } from "../../contexts/AccentColorContext";
import { usePremiumNudge } from "../../hooks/usePremiumNudge";
import { useLanguage } from "../../i18n/useLanguage";
import { LanguageSelect } from "../LanguageSelect";
import {
  IoRocket,
  IoBarChart,
  IoSave,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoDiamond,
  IoLanguage,
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
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { accentHex } = useAccentColor();
  const { fireTrigger } = usePremiumNudge();
  const [timeLimit, setTimeLimit] = useState<number>(8);
  const [savedTimeLimit, setSavedTimeLimit] = useState<number>(8);
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [trialLine, setTrialLine] = useState<string | null>(null);

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

        const runOnStartUp = await invoke<string | null>("get_config_string", {
          key: "isRunOnStartUpEnabledByDefault",
        });

        if (!runOnStartUp || runOnStartUp === "false") {
          await enable();
          await invoke("update_reminder_setting", {
            key: "isRunOnStartUpEnabledByDefault",
            value: "true",
          });
          toast.success(t("settings.autoStartEnabled"), {
            duration: 2000,
            position: "bottom-right",
          });
          setIsAutoStartEnabled(true);
        } else {
          const status = await isEnabled();
          setIsAutoStartEnabled(status);
        }

        try {
          const [license, trial] = await Promise.all([
            invoke<{ status: string | null }>("get_license_info"),
            invoke<{ is_active: boolean; days_remaining: number }>(
              "get_trial_info",
            ),
          ]);
          if (license.status === "active") {
            setTrialLine(t("settings.trialActive"));
          } else if (trial.is_active) {
            setTrialLine(
              t("settings.trialDaysLeft", {
                count: trial.days_remaining,
                day: trial.days_remaining === 1 ? t("common.day") : t("common.days"),
              }),
            );
          } else {
            setTrialLine(t("settings.trialEnded"));
          }
        } catch {
          // Trial/license readout is best-effort; the row stays hidden.
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error(t("settings.couldNotLoadSettings"), {
          duration: 2000,
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [t]);

  const isTimeLimitDirty = timeLimit !== savedTimeLimit;

  const handleAutoStartChange = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
        toast.success(t("settings.enabledAutostart"), {
          duration: 2000,
          position: "bottom-right",
        });
      } else {
        await disable();
        toast.success(t("settings.disabledAutostart"), {
          duration: 2000,
          position: "bottom-right",
        });
      }
      setIsAutoStartEnabled(checked);
    } catch (error) {
      console.error("Failed to update autostart status:", error);
    }
  };

  const handleSaveLimit = async () => {
    if (isNaN(timeLimit) || timeLimit < 1 || timeLimit > 24) {
      toast.error(t("settings.invalidLimit"), {
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
      toast.success(t("settings.limitSaved"), {
        duration: 2000,
        position: "bottom-right",
      });
      // Post-activity hint for the premium nudge (Rust decides).
      fireTrigger("settings_saved");
    } catch (error) {
      console.error("Failed to save limit:", error);
      toast.error(t("settings.couldNotSaveLimit"), {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const date = new Date().toISOString().slice(0, 10);
      const destination = await save({
        defaultPath: `blink-eye-backup-${date}.zip`,
        filters: [{ name: t("common.appName"), extensions: ["zip"] }],
      });

      if (!destination) return;

      const result = await invoke<{ path: string; file_count: number }>(
        "export_user_data",
        { destinationPath: destination },
      );

      toast.success(t("settings.exportedFiles", { count: result.file_count }), {
        duration: 2500,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error(t("settings.couldNotExport"), {
        duration: 2500,
        position: "bottom-right",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      const source = await open({
        multiple: false,
        filters: [{ name: t("common.appName"), extensions: ["zip"] }],
      });

      if (!source || Array.isArray(source)) return;

      const result = await invoke<{ file_count: number; backup_dir: string }>(
        "import_user_data",
        { sourcePath: source },
      );

      await invoke("refresh_reminder_scheduler_settings");

      toast.success(
        t("settings.importedFiles", { count: result.file_count }),
        { duration: 3000, position: "bottom-right" },
      );

      await relaunch();
    } catch (error) {
      console.error("Failed to import data:", error);
      toast.error(t("settings.couldNotImport"), {
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-5 p-2">
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoLanguage className="size-4" />
            </SettingIconBadge>
          }
          label={t("settings.language")}
          description={t("settings.languageDescription")}
        >
          <LanguageSelect
            value={language}
            onValueChange={(value) => void setLanguage(value)}
            disabled={isLoading}
            aria-label={t("settings.language")}
          />
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoRocket className="size-4" />
            </SettingIconBadge>
          }
          label={t("settings.runOnStartup")}
          description={t("settings.runOnStartupDesc")}
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
              <IoBarChart className="size-4" />
            </SettingIconBadge>
          }
          label={t("settings.dailyLimit")}
          description={t("settings.dailyLimitDesc")}
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
                  {hours}{" "}
                  {hours === 1 ? t("common.hour") : t("common.hours")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </div>

      {trialLine !== null && (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          <SettingRow
            icon={
              <SettingIconBadge color={accentHex}>
                <IoDiamond className="size-4" />
              </SettingIconBadge>
            }
            label={t("settings.premiumTrial")}
            description={trialLine}
          >
            <Button variant="outline" asChild className="gap-2">
              <Link to="/activatelicense">{t("settings.viewPremium")}</Link>
            </Button>
          </SettingRow>
        </div>
      )}

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoDownloadOutline className="size-4" />
            </SettingIconBadge>
          }
          label={t("settings.exportData")}
          description={t("settings.exportDataDesc")}
        >
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading || isExporting || isImporting}
            className="gap-2"
          >
            <IoDownloadOutline className="size-4" />
            {isExporting ? t("settings.exporting") : t("settings.export")}
          </Button>
        </SettingRow>

        <SettingRow
          icon={
            <SettingIconBadge color={accentHex}>
              <IoCloudUploadOutline className="size-4" />
            </SettingIconBadge>
          }
          label={t("settings.importData")}
          description={t("settings.importDataDesc")}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isLoading || isExporting || isImporting}
                className="gap-2"
              >
                <IoCloudUploadOutline className="size-4" />
                {isImporting ? t("settings.importing") : t("settings.import")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("settings.replaceTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("settings.replaceDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleImportData}>
                  {t("settings.importAndRelaunch")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            {t("settings.saveLimit")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllSettings;
