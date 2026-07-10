import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Switch } from "./ui/switch";
import { useTrigger } from "../contexts/TriggerReRender";

const PomodoroTimerToggle = () => {
  const { triggerUpdate } = useTrigger();
  const [isPomodoroTimerEnabled, setIsPomodoroTimerEnabled] = useState(false);
  const [previousDuration, setPreviousDuration] = useState<number | null>(null);
  const [previousInterval, setPreviousInterval] = useState<number | null>(null);

  useEffect(() => {
    const loadPomodoroSetting = async () => {
      const pomodoroFlag = await invoke<string | null>("get_config_string", { key: "pomodoroStyleBreak" });
      const prevDuration = await invoke<string | null>("get_config_string", { key: "previousblinkEyeReminderDuration" });
      const prevInterval = await invoke<string | null>("get_config_string", { key: "previousblinkEyeReminderInterval" });

      const settings: {
        intervalMins: number | null;
        durationSecs: number | null;
      } = await invoke("get_reminder_settings");

      setIsPomodoroTimerEnabled(pomodoroFlag === "true");
      setPreviousDuration(
        prevDuration ? Number(prevDuration) : settings.durationSecs || 20
      );
      setPreviousInterval(
        prevInterval ? Number(prevInterval) : settings.intervalMins || 20
      );
    };

    loadPomodoroSetting();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    setIsPomodoroTimerEnabled(checked);

    if (checked) {
      await invoke("update_reminder_setting", { key: "previousblinkEyeReminderDuration", value: String(previousDuration || 20) });
      await invoke("update_reminder_setting", { key: "previousblinkEyeReminderInterval", value: String(previousInterval || 20) });

      await invoke("update_reminder_setting", { key: "blinkEyeReminderDuration", value: "300" });
      await invoke("update_reminder_setting", { key: "blinkEyeReminderInterval", value: "25" });
    } else {
      await invoke("update_reminder_setting", { key: "blinkEyeReminderDuration", value: String(previousDuration || 20) });
      await invoke("update_reminder_setting", { key: "blinkEyeReminderInterval", value: String(previousInterval || 20) });
    }

    await invoke("update_reminder_setting", { key: "pomodoroStyleBreak", value: String(checked) });
    await invoke("refresh_reminder_scheduler_settings");
    triggerUpdate();
  };

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label
          htmlFor="pomodoroSwitch"
          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Use this as Pomodoro timer
        </Label>
        <p className="text-sm text-muted-foreground">
          This sets the break time to 5 minutes and the work time to 25 minutes.
        </p>
      </div>
      <Switch
        id="pomodoroSwitch"
        checked={isPomodoroTimerEnabled}
        onCheckedChange={handleCheckboxChange}
      />
    </div>
  );
};

export default PomodoroTimerToggle;
