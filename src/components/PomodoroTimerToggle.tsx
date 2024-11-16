import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { Switch } from "./ui/switch";

const PomodoroTimerToggle = () => {
  const [isPomodoroTimerEnabled, setIsPomodoroTimerEnabled] = useState(false);

  useEffect(() => {
    // Load the initial value from the store when the component mounts
    const loadPomodoroSetting = async () => {
      const store = await load("store.json", { autoSave: true });
      const isPomodoroTimer = await store.get<boolean>("PomodoroStyleBreak");
      setIsPomodoroTimerEnabled(isPomodoroTimer || false);
    };

    loadPomodoroSetting();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    // Update the state and store with the new value
    setIsPomodoroTimerEnabled(checked);

    const store = await load("store.json", { autoSave: true });
    await store.set("PomodoroStyleBreak", checked);
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
