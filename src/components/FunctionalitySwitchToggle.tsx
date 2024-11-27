import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import Database from "@tauri-apps/plugin-sql";

interface ConfigRow {
  value: string;
}
interface TogglePropsType {
  functionalityButton: string;
  title: string;
  description: string;
}

const FunctionalitySwitchToggle = (props: TogglePropsType) => {
  const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);
  const { functionalityButton, title, description } = props;

  useEffect(() => {
    const initializeStrictMode = async () => {
      try {
        // Load initial configuration store
        const db = await Database.load("sqlite:appconfig.db");

        // Retrieve the 'usingStrictMode' value from the config table
        const result: ConfigRow[] = await db.select(
          `SELECT value FROM config WHERE key = '${functionalityButton}';`
        );

        if (result.length > 0) {
          setIsStrictModeEnabled(result[0].value === "true");
        }
      } catch (error) {
        console.error("Failed to initialize strict mode:", error);
      }
    };
    initializeStrictMode();
  }, []);

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      const db = await Database.load("sqlite:appconfig.db");

      // Use an `INSERT OR REPLACE` or `UPDATE` query
      await db.execute(
        `
        INSERT INTO config (key, value) VALUES ('${functionalityButton}', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
        [checked ? "true" : "false"]
      );

      setIsStrictModeEnabled(checked);
    } catch (error) {
      console.error("Failed to update strict mode status:", error);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label
          htmlFor={`${functionalityButton}`}
          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {title}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={`${functionalityButton}`}
        checked={isStrictModeEnabled}
        onCheckedChange={handleCheckboxChange}
      />
    </div>
  );
};

export default FunctionalitySwitchToggle;
