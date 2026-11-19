// src/components/screens/break-config-screen.tsx
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RiTimerFill, RiAlarmFill, RiMessage2Fill } from "react-icons/ri";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface BreakConfigScreenProps {
  breakInterval: number;
  setBreakInterval: (value: number) => void;
  breakDuration: number;
  setBreakDuration: (value: number) => void;
  reminderText: string;
  setReminderText: (value: string) => void;
}

const INTERVAL_OPTIONS = [20, 30, 40];
const DURATION_OPTIONS = [20, 30, 40];

export default function BreakConfigScreen({
  breakInterval,
  setBreakInterval,
  breakDuration,
  setBreakDuration,
  reminderText,
  setReminderText,
}: BreakConfigScreenProps) {
  const { t } = useTranslation();
  const customIntervalRef = useRef<HTMLInputElement>(null);
  const customDurationRef = useRef<HTMLInputElement>(null);

  const isCustomInterval = !INTERVAL_OPTIONS.includes(breakInterval);
  const isCustomDuration = !DURATION_OPTIONS.includes(breakDuration);

  useEffect(() => {
    if (isCustomInterval && customIntervalRef.current) {
      customIntervalRef.current.value = breakInterval.toString();
    }
  }, [breakInterval, isCustomInterval]);

  useEffect(() => {
    if (isCustomDuration && customDurationRef.current) {
      customDurationRef.current.value = breakDuration.toString();
    }
  }, [breakDuration, isCustomDuration]);

  const handleCustomInterval = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setBreakInterval(n);
  };

  const handleCustomDuration = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setBreakDuration(n);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-2">
      <div className="w-full max-w-2xl space-y-4">
        {/* Page Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-heading">
            {t("onboarding.configureBreaksTitle")}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("onboarding.rule202020", {
              minutes: 20,
              distance: 20,
              seconds: 20,
            })}
          </p>
        </div>

        {/* Interval + Duration side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Break Interval */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-primary">
                  <RiTimerFill className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold font-heading leading-none">
                    {t("onboarding.breakInterval")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("onboarding.breakIntervalDesc")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {INTERVAL_OPTIONS.map((min) => {
                  const selected = breakInterval === min && !isCustomInterval;
                  return (
                    <Button
                      key={min}
                      variant={selected ? "default" : "outline"}
                      size="default"
                      className="h-auto py-2 px-3"
                      onClick={() => {
                        setBreakInterval(min);
                        if (customIntervalRef.current)
                          customIntervalRef.current.value = "";
                      }}
                    >
                      <span className="text-base font-bold">{min}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("common.min")}
                      </span>
                    </Button>
                  );
                })}

                {/* Custom input */}
                <div className="relative">
                  <Input
                    ref={customIntervalRef}
                    type="number"
                    min={1}
                    placeholder={t("onboarding.custom")}
                    defaultValue={isCustomInterval ? breakInterval : ""}
                    onChange={(e) => handleCustomInterval(e.target.value)}
                    className="h-9 text-center text-base font-bold rounded-full"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    {t("common.min")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                {t("onboarding.remindEvery", { minutes: breakInterval })}
              </p>
            </CardContent>
          </Card>

          {/* Break Duration */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-primary">
                  <RiAlarmFill className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold font-heading leading-none">
                    {t("onboarding.breakDuration")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("onboarding.breakDurationDesc")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((sec) => {
                  const selected = breakDuration === sec && !isCustomDuration;
                  return (
                    <Button
                      key={sec}
                      variant={selected ? "default" : "outline"}
                      size="default"
                      className="h-auto py-2 px-3"
                      onClick={() => {
                        setBreakDuration(sec);
                        if (customDurationRef.current)
                          customDurationRef.current.value = "";
                      }}
                    >
                      <span className="text-base font-bold">{sec}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("common.sec")}
                      </span>
                    </Button>
                  );
                })}

                {/* Custom input */}
                <div className="relative">
                  <Input
                    ref={customDurationRef}
                    type="number"
                    min={1}
                    placeholder={t("onboarding.custom")}
                    defaultValue={isCustomDuration ? breakDuration : ""}
                    onChange={(e) => handleCustomDuration(e.target.value)}
                    className="h-9 text-center text-base font-bold rounded-full"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    {t("common.sec")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                {t("onboarding.eachBreakLasts", { seconds: breakDuration })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reminder Message */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <RiMessage2Fill className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold font-heading leading-none">
                  {t("onboarding.reminderMessage")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("onboarding.reminderMessageDesc")}
                </p>
              </div>
            </div>
            <Input
              placeholder={t("onboarding.reminderMessagePlaceholder")}
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="w-full text-sm text-center"
            />
            <p className="text-[11px] text-center text-muted-foreground">
              {t("onboarding.reminderMessageNote")}
            </p>
          </CardContent>
        </Card>

        {/* Summary bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1.5">
            <RiTimerFill className="w-3 h-3" />
            {t("onboarding.everyMinutes", { minutes: breakInterval })}
          </Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge variant="secondary" className="gap-1.5">
            <RiAlarmFill className="w-3 h-3" />
            {t("onboarding.secondsBreak", { seconds: breakDuration })}
          </Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge variant="outline" className="gap-1.5 max-w-[180px]">
            <RiMessage2Fill className="w-3 h-3" />
            <span className="truncate">
              {reminderText || t("common.noMessageSet")}
            </span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
