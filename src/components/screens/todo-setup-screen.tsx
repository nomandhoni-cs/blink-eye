import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
const EXAMPLE_INTERVAL_MS = 2_800;

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
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exampleState, setExampleState] = useState({ language: i18n.language, index: 0 });

  // One translated list of small, realistic tasks. It rotates like a gentle
  // slider so the input never looks empty or intimidating.
  const exampleValue = t("onboarding.todoSetupExamples", { returnObjects: true });
  const examples = Array.isArray(exampleValue) ? (exampleValue as string[]) : [];
  const exampleIndex = exampleState.language === i18n.language ? exampleState.index : 0;

  useEffect(() => {
    if (examples.length < 2) return;
    const timer = window.setInterval(() => {
      setExampleState((current) => ({
        language: i18n.language,
        index: ((current.language === i18n.language ? current.index : 0) + 1) % examples.length,
      }));
    }, EXAMPLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [examples.length, i18n.language]);

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

      <div className="w-full max-w-xl space-y-2 text-left">
        {/* Row 1: one wide, calm input with a rotating example. */}
        <div className="relative w-full">
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
            placeholder=" "
            aria-label={t("todo.addTaskPlaceholder")}
            aria-describedby={shownError ? "onboarding-task-error" : undefined}
            aria-invalid={shownError !== null}
            className="h-12 w-full text-base"
          />
          {!firstTask && examples.length > 0 && (
            <div className="pointer-events-none absolute inset-y-0 left-3 right-3 flex items-center overflow-hidden text-sm text-muted-foreground/70">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${i18n.language}-${exampleIndex}`}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  className="truncate"
                >
                  {examples[exampleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Row 2: all controls, kept together and out of the input row. */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => void addFirstTask()}
            disabled={!firstTask.trim() || saving}
            className="h-10 shrink-0"
          >
            {taskAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
            {taskAdded ? t("todo.addedToast") : t("todo.addTask")}
          </Button>
          {remindersEnabled && (
            <>
              <div className="inline-flex h-10 items-center gap-1.5 rounded-md border bg-background px-2 text-xs text-muted-foreground">
                <Clock className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <TimePicker value={firstTaskTime} onChange={setFirstTaskTime} />
              </div>
              <select
                aria-label={t("todo.remindBefore")}
                value={firstTaskLeadMinutes}
                onChange={(event) => setFirstTaskLeadMinutes(Number(event.target.value))}
                className="h-10 rounded-md border bg-background px-2 text-xs"
              >
                {LEAD_MINUTE_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes === 0
                      ? t("todo.remindAtTime")
                      : t("todo.minutesBefore", { minutes })}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

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

      <div className="flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl border p-4 text-left">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <Label htmlFor="onboarding-task-reminders" className="text-sm font-semibold">
              {t("onboarding.todoSetupRemindersTitle")}
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("onboarding.todoSetupRemindersShort")}
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
