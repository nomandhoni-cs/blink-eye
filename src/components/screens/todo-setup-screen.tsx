import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { BellRing, Check, Clock, ListTodo, Plus, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { TimePicker } from "../ui/TimePicker";
import {
  createTask,
  LEAD_MINUTE_OPTIONS,
  toLocalDate,
  toLocalDateTime,
} from "../../lib/todo-store";

interface TodoSetupScreenProps {
  firstTask: string;
  setFirstTask: (value: string) => void;
  taskAdded: boolean;
  remindersEnabled: boolean;
  setRemindersEnabled: (value: boolean) => void;
  firstTaskTime: string;
  setFirstTaskTime: (value: string) => void;
  firstTaskLeadMinutes: number;
  setFirstTaskLeadMinutes: (value: number) => void;
  /** Called after a task is saved so onboarding won't add it a second time. */
  onTaskAdded: () => void;
  requiredError: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 360, damping: 26, mass: 0.8 };

export default function TodoSetupScreen({
  firstTask,
  setFirstTask,
  taskAdded,
  remindersEnabled,
  setRemindersEnabled,
  firstTaskTime,
  setFirstTaskTime,
  firstTaskLeadMinutes,
  setFirstTaskLeadMinutes,
  onTaskAdded,
  requiredError,
}: TodoSetupScreenProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFirstTask = async () => {
    if (!firstTask.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await createTask({
        title: firstTask,
        deadline: toLocalDate(new Date()),
        reminderTime: firstTaskTime || null,
        dueAt: toLocalDateTime(new Date(), firstTaskTime),
        reminderLeadMinutes: firstTaskLeadMinutes,
      });
      onTaskAdded();
    } catch (cause) {
      console.error("[onboarding] Could not add first task:", cause);
      setError(t("todo.couldNotSave"));
    } finally {
      setSaving(false);
    }
  };

  const shownError = requiredError ? t("onboarding.todoRequired") : error;

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-5 px-2 py-4 text-center">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ListTodo className="size-6 text-primary" aria-hidden="true" />
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("onboarding.todoSetupTitle")}
          </h1>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles className="size-3" aria-hidden="true" />
            {t("onboarding.todoSetupFree")}
          </Badge>
        </div>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          {t("onboarding.todoSetupSubtitle")}
        </p>
      </div>

      <div className="w-full max-w-md space-y-2 text-left">
        <Label htmlFor="onboarding-first-task" className="sr-only">
          {t("todo.addTaskPlaceholder")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="onboarding-first-task"
            value={firstTask}
            onChange={(event) => {
              setFirstTask(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addFirstTask();
              }
            }}
            placeholder={t("onboarding.todoSetupPlaceholder")}
            aria-describedby={shownError ? "onboarding-task-error" : undefined}
            aria-invalid={shownError !== null}
            className="h-11"
          />
          <Button
            type="button"
            onClick={() => void addFirstTask()}
            disabled={!firstTask.trim() || saving}
            className="h-11 shrink-0"
          >
            {taskAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
            {taskAdded ? t("todo.addedToast") : t("todo.addTask")}
          </Button>
        </div>

        {remindersEnabled && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-foreground/[0.02] p-2">
            <Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <TimePicker value={firstTaskTime} onChange={setFirstTaskTime} />
            <select
              aria-label={t("todo.remindBefore")}
              value={firstTaskLeadMinutes}
              onChange={(event) => setFirstTaskLeadMinutes(Number(event.target.value))}
              className="h-9 rounded-md border bg-background px-2 text-xs"
            >
              {LEAD_MINUTE_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0
                    ? t("todo.remindAtTime")
                    : t("todo.minutesBefore", { minutes })}
                </option>
              ))}
            </select>
          </div>
        )}
        {remindersEnabled && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t("onboarding.todoSetupTimeHint")}
          </p>
        )}

        {shownError ? (
          <p id="onboarding-task-error" role="alert" className="text-xs text-destructive">
            {shownError}
          </p>
        ) : taskAdded ? (
          <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">
            {t("onboarding.todoSetupAdded")}
          </p>
        ) : null}
      </div>

      {/* A quiet preview of the pop-up described by the opt-in below. */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-foreground/[0.06] p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BellRing className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {firstTaskLeadMinutes > 0
                ? t("taskAlert.beforeEyebrow")
                : t("taskAlert.dueEyebrow")}
            </p>
            <p className="truncate text-sm font-medium">
              {firstTaskLeadMinutes > 0
                ? t("taskAlert.beforeMessage", {
                    title: firstTask.trim() || t("todo.addTaskPlaceholder"),
                    minutes: firstTaskLeadMinutes,
                  })
                : t("taskAlert.dueMessage")}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border p-4 text-left">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <Label htmlFor="onboarding-task-reminders" className="text-sm font-semibold">
              {t("onboarding.todoSetupRemindersTitle")}
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("onboarding.todoSetupRemindersDesc")}
            </p>
          </div>
        </div>
        <Switch
          id="onboarding-task-reminders"
          checked={remindersEnabled}
          onCheckedChange={setRemindersEnabled}
          aria-label={t("onboarding.todoSetupRemindersTitle")}
        />
      </div>
    </div>
  );
}
