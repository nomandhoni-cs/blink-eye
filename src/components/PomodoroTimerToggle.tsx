import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { Switch } from "./ui/switch";
import { useTrigger } from "../contexts/TriggerReRender";

const PomodoroTimerToggle = () => {
  const { triggerUpdate } = useTrigger();
  const [isPomodoroTimerEnabled, setIsPomodoroTimerEnabled] = useState(false);
  const [previousDuration, setPreviousDuration] = useState<number | null>(null);
  const [previousInterval, setPreviousInterval] = useState<number | null>(null);

  useEffect(() => {
    // Load the initial value from the store when the component mounts
    const loadPomodoroSetting = async () => {
      const store = await load("store.json", { autoSave: true });
      const isPomodoroTimer = await store.get<boolean>("PomodoroStyleBreak");
      const duration = await store.get<number>("blinkEyeReminderDuration");
      const interval = await store.get<number>("blinkEyeReminderInterval");
      const prevDuration = await store.get<number>(
        "previousblinkEyeReminderDuration"
      );
      const prevInterval = await store.get<number>(
        "previousblinkEyeReminderInterval"
      );

      setIsPomodoroTimerEnabled(isPomodoroTimer || false);

      // Save the previous duration and interval if they exist
      setPreviousDuration(prevDuration || duration || 20); // Default 20
      setPreviousInterval(prevInterval || interval || 20); // Default 20
    };

    loadPomodoroSetting();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    setIsPomodoroTimerEnabled(checked);

    const store = await load("store.json", { autoSave: true });

    if (checked) {
      // Set to Pomodoro values when enabled
      await store.set("PomodoroStyleBreak", true);
      await store.set("blinkEyeReminderDuration", 300); // 5 minutes break
      await store.set("blinkEyeReminderInterval", 25); // 25 minutes work

      // Store the current values as previous
      await store.set(
        "previousblinkEyeReminderDuration",
        previousDuration || 20
      );
      await store.set(
        "previousblinkEyeReminderInterval",
        previousInterval || 20
      );
    } else {
      // Restore previous values when disabled
      await store.set("PomodoroStyleBreak", false);
      await store.set("blinkEyeReminderDuration", previousDuration || 20);
      await store.set("blinkEyeReminderInterval", previousInterval || 20);
    }

    await store.save();
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
