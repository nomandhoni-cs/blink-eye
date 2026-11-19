import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Clock } from "lucide-react";
import { Switch } from "../ui/switch";
import Database from "@tauri-apps/plugin-sql";
import { useTrigger } from "../../contexts/TriggerReRender";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";

type Schedule = { start: string; end: string } | null;
type Workday = { [day: string]: Schedule };

const Workday = () => {
  const { t } = useTranslation();
  const { triggerUpdate } = useTrigger();
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  const [workday, setWorkday] = useState<Workday | null>(null);
  const [isWorkdayEnabled, setIsWorkdayEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const db = await Database.load("sqlite:appconfig.db");

      // Define a type for the query result
      type ConfigResult = { value: string };

      // Fetch the workday setup
      const workdayData = (await db.select(
        "SELECT value FROM config WHERE key = ?",
        ["blinkEyeWorkday"]
      )) as ConfigResult[]; // Specify the expected structure

      if (workdayData.length > 0 && workdayData[0].value) {
        try {
          const parsedWorkday = JSON.parse(workdayData[0].value) as Workday;
          setWorkday(parsedWorkday);
        } catch (error) {
          console.error("Failed to parse workday data:", error);
        }
      }

      // Fetch the isWorkdayEnabled status
      const isEnabledData = (await db.select(
        "SELECT value FROM config WHERE key = ?",
        ["isWorkdayEnabled"]
      )) as ConfigResult[]; // Specify the expected structure

      if (isEnabledData.length > 0 && isEnabledData[0].value) {
        setIsWorkdayEnabled(isEnabledData[0].value === "true");
      }
    };

    fetchConfig();
  }, []);

  const handleTimeChange = (
    day: string,
    type: "start" | "end",
    value: string
  ) => {
    if (!workday) return;
    setWorkday((prev) => ({
      ...prev,
      [day]: {
        ...prev![day],
        [type]: value,
      } as Schedule,
    }));
  };

  const toggleWorkingDay = (day: string) => {
    if (!workday) return;
    setWorkday((prev) => ({
      ...prev,
      [day]: prev![day] ? null : { start: "09:00", end: "17:00" },
    }));
  };

  const handleSave = async () => {
    if (!canAccessPremiumFeatures) {
      toast.error(t("workday.needLicenseSave"), {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    const db = await Database.load("sqlite:appconfig.db");
    if (workday) {
      await db.execute(
        "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
        ["blinkEyeWorkday", JSON.stringify(workday)]
      );
    }
    triggerUpdate();
    toast.success(t("workday.saved"), {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleWorkdayToggle = async () => {
    if (!canAccessPremiumFeatures) {
      setIsWorkdayEnabled(false); // Ensure toggle is turned off
      toast.error(t("workday.needLicenseEnable"), {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    const newValue = !isWorkdayEnabled;
    setIsWorkdayEnabled(newValue);

    const db = await Database.load("sqlite:appconfig.db");
    await db.execute(
      "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
      ["isWorkdayEnabled", newValue.toString()]
    );

    triggerUpdate();
    toast.success(
      newValue ? t("workday.enabledWorkday") : t("workday.disabledWorkday"),
      { duration: 2000, position: "bottom-right" }
    );
  };

  if (!workday) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-heading tracking-wide">
              {t("workday.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("workday.description")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="workday-toggle" className="text-sm">
              {t("workday.enableWorkday")}
            </Label>
            <Switch
              id="workday-toggle"
              checked={isWorkdayEnabled && canAccessPremiumFeatures}
              onCheckedChange={handleWorkdayToggle}
            />
          </div>
        </div>
      </div>
      <Separator />
      {isWorkdayEnabled && (
        <div className="space-y-6">
          {Object.entries(workday).map(([day, schedule]) => (
            <div key={day} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {t(`workday.days.${day}`)}
                </h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${day}-toggle`} className="text-sm">
                    {t("workday.workingDay")}
                  </Label>
                  <Switch
                    id={`${day}-toggle`}
                    checked={!!schedule}
                    onCheckedChange={() => toggleWorkingDay(day)}
                  />
                </div>
              </div>
              {schedule ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`${day}-start`}
                      className="text-sm font-medium"
                    >
                      {t("workday.startTime")}
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="time"
                        id={`${day}-start`}
                        className="pl-9"
                        value={schedule.start}
                        onChange={(e) =>
                          handleTimeChange(day, "start", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`${day}-end`}
                      className="text-sm font-medium"
                    >
                      {t("workday.endTime")}
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="time"
                        id={`${day}-end`}
                        className="pl-9"
                        value={schedule.end}
                        onChange={(e) =>
                          handleTimeChange(day, "end", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {t("workday.nonWorkingDay")}
                </p>
              )}
              <Separator />
            </div>
          ))}
        </div>
      )}
      <Button onClick={handleSave} className="w-full">
        {t("workday.save")}
      </Button>
    </div>
  );
};

export default Workday;
