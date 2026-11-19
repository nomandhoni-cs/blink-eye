import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  ListTodo,
  Pencil,
  Plus,
  Sparkles,
  Text,
  Trash2,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { TimePicker } from "../ui/TimePicker";
import {
  createTask,
  DEFAULT_QUIET_END_HOUR,
  DEFAULT_QUIET_START_HOUR,
  deleteTask,
  fetchTasks,
  formatTaskDate,
  getTodoSetting,
  QUIET_END_KEY,
  QUIET_START_KEY,
  isTauriRuntime,
  LEAD_MINUTE_OPTIONS,
  parseDeadline,
  parseLocalDateTime,
  setTaskStatus,
  setTodoSetting,
  TASK_REMINDERS_ENABLED_KEY,
  toLocalDate,
  toLocalDateTime,
  updateTask,
  type Task,
} from "../../lib/todo-store";
import { useTodoRefreshEvent } from "../../hooks/useTodoRefreshEvent";

type Filter = "today" | "upcoming" | "all" | "done";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.8 };

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

function taskMoment(task: Task): number {
  const due = parseLocalDateTime(task.due_at) ?? parseDeadline(task.deadline);
  return due ? due.getTime() : Number.MAX_SAFE_INTEGER;
}

function isTodayOrOverdue(task: Task): boolean {
  const deadline = parseDeadline(task.deadline);
  return !deadline || deadline.getTime() <= startOfToday();
}

const TodoPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("today");

  const [newTask, setNewTask] = useState("");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>();
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskLeadMinutes, setNewTaskLeadMinutes] = useState(10);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [adding, setAdding] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState(DEFAULT_QUIET_START_HOUR);
  const [quietEnd, setQuietEnd] = useState(DEFAULT_QUIET_END_HOUR);

  const load = useCallback(async () => {
    try {
      const [allTasks, enabled, start, end] = await Promise.all([
        fetchTasks(),
        getTodoSetting(TASK_REMINDERS_ENABLED_KEY, "true"),
        getTodoSetting(QUIET_START_KEY, String(DEFAULT_QUIET_START_HOUR)),
        getTodoSetting(QUIET_END_KEY, String(DEFAULT_QUIET_END_HOUR)),
      ]);
      setTasks(allTasks);
      setRemindersEnabled(enabled !== "false");
      const parsedStart = Number(start);
      const parsedEnd = Number(end);
      if (Number.isInteger(parsedStart) && parsedStart >= 0 && parsedStart <= 23) {
        setQuietStart(parsedStart);
      }
      if (Number.isInteger(parsedEnd) && parsedEnd >= 0 && parsedEnd <= 23) {
        setQuietEnd(parsedEnd);
      }
      setLoadError(null);
    } catch (error) {
      console.error("[todos] Could not load tasks:", error);
      setLoadError(t("todo.couldNotLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  useTodoRefreshEvent(load);

  const formatDate = (value: Date | string | undefined | null) =>
    formatTaskDate(value, i18n.language);

  const pending = useMemo(
    () => tasks.filter((task) => task.status !== "done").sort((a, b) => taskMoment(a) - taskMoment(b)),
    [tasks],
  );
  const completed = useMemo(
    () => tasks.filter((task) => task.status === "done").sort((a, b) => b.id - a.id),
    [tasks],
  );
  const visibleTasks = useMemo(() => {
    switch (filter) {
      case "today":
        return pending.filter(isTodayOrOverdue);
      case "upcoming":
        return pending.filter((task) => {
          const deadline = parseDeadline(task.deadline);
          return deadline !== null && deadline.getTime() > startOfToday();
        });
      case "done":
        return completed;
      default:
        return pending;
    }
  }, [filter, pending, completed]);

  const addTask = async () => {
    if (!newTask.trim() || adding) return;
    setAdding(true);
    try {
      await createTask({
        title: newTask,
        details: newTaskDetails,
        deadline: newTaskDeadline ? toLocalDate(newTaskDeadline) : null,
        reminderTime: newTaskTime || null,
        dueAt: toLocalDateTime(newTaskDeadline, newTaskTime),
        reminderLeadMinutes: newTaskLeadMinutes,
      });
      setNewTask("");
      setNewTaskDetails("");
      setNewTaskDeadline(undefined);
      setNewTaskTime("");
      setNewTaskLeadMinutes(10);
      setShowDetailsInput(false);
      await load();
      toast.success(t("todo.addedToast"));
    } catch (error) {
      console.error("[todos] Could not add task:", error);
      toast.error(t("todo.couldNotSave"));
    } finally {
      setAdding(false);
    }
  };

  const completeTask = async (task: Task) => {
    try {
      await setTaskStatus(task.id, "done");
      setEditingTask(null);
      await load();
      toast.success(t("todo.completeToast"));
    } catch (error) {
      console.error("[todos] Could not complete task:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const restoreTask = async (task: Task) => {
    try {
      await createTask({
        title: task.title,
        details: task.details,
        deadline: task.deadline,
        reminderTime: task.reminder_time,
        dueAt: task.due_at,
        reminderLeadMinutes: task.reminder_lead_minutes ?? 0,
      });
      await load();
      toast.success(t("todo.restoredToast"));
    } catch (error) {
      console.error("[todos] Could not restore task:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const removeTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      await load();
      // react-hot-toast v2 has no built-in action prop; a custom toast keeps
      // the undo path visible instead of silently discarding the task.
      toast.custom(
        (item) => (
          <div className="pointer-events-auto flex items-center gap-4 rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
            <span>{t("todo.deletedToast")}</span>
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => {
                toast.dismiss(item.id);
                void restoreTask(task);
              }}
            >
              {t("todo.undo")}
            </button>
          </div>
        ),
        { duration: 6000 },
      );
    } catch (error) {
      console.error("[todos] Could not delete task:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const saveEdit = async () => {
    if (!editingTask?.title.trim()) return;
    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        details: editingTask.details,
        deadline: editingTask.deadline || null,
        reminder_time: editingTask.reminder_time || null,
        due_at: toLocalDateTime(editingTask.deadline ?? null, editingTask.reminder_time ?? null),
        reminder_lead_minutes: editingTask.reminder_lead_minutes ?? 0,
      });
      setEditingTask(null);
      await load();
    } catch (error) {
      console.error("[todos] Could not update task:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const changeSetting = async (key: string, value: string) => {
    try {
      await setTodoSetting(key, value);
    } catch (error) {
      console.error(`[todos] Could not save ${key}:`, error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const previewReminder = async () => {
    if (!isTauriRuntime()) {
      toast("Open the Tauri app to preview the native pop-up.");
      return;
    }
    try {
      await invoke("preview_task_reminder");
    } catch (error) {
      console.error("[todos] Could not preview reminder:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const restoreAsPending = async (task: Task) => {
    try {
      await setTaskStatus(task.id, "pending");
      await load();
    } catch (error) {
      console.error("[todos] Could not reopen task:", error);
      toast.error(t("todo.couldNotSave"));
    }
  };

  const filters: { value: Filter; label: string; count: number }[] = [
    {
      value: "today",
      label: t("todo.today"),
      count: pending.filter(isTodayOrOverdue).length,
    },
    {
      value: "upcoming",
      label: t("todo.upcoming"),
      count: pending.length - pending.filter(isTodayOrOverdue).length,
    },
    { value: "all", label: t("todo.all"), count: pending.length },
    { value: "done", label: t("todo.done"), count: completed.length },
  ];

  const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));

  const leadSelect = (value: number, onChange: (minutes: number) => void) => (
    <select
      aria-label={t("todo.remindBefore")}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-9 rounded-md border bg-background px-2 text-xs"
    >
      {LEAD_MINUTE_OPTIONS.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes === 0 ? t("todo.remindAtTime") : t("todo.minutesBefore", { minutes })}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl tracking-wide">
            <ListTodo className="size-6 text-primary" aria-hidden="true" />
            {t("todo.title")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{t("todo.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void previewReminder()}>
          <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
          {t("todo.previewReminder")}
        </Button>
      </header>

      {/* Honest progress: only tasks that are actually saved are counted. */}
      <div className="rounded-xl border bg-card/60 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
            {t("todo.progress", { done: completed.length, total: tasks.length })}
          </span>
          <span>{t("todo.remindersAlwaysFree")}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: tasks.length ? `${(completed.length / tasks.length) * 100}%` : "0%" }}
            transition={reduceMotion ? { duration: 0 } : SPRING}
          />
        </div>
      </div>

      {/* One reachable start action; details/date/time are progressive. */}
      <section className="space-y-2 rounded-xl border bg-card/40 p-3" aria-label={t("todo.addTask")}>
        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addTask();
              }
            }}
            placeholder={t("todo.addTaskPlaceholder")}
            aria-label={t("todo.addTaskPlaceholder")}
            className="h-10"
          />
          <Button onClick={() => void addTask()} disabled={!newTask.trim() || adding} className="h-10">
            <Plus className="mr-1 size-4" aria-hidden="true" />
            {t("todo.addTask")}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("todo.quickAddHint")}</p>
        {newTask && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={showDetailsInput}
              onClick={() => setShowDetailsInput((value) => !value)}
            >
              <Text className="mr-1 size-3.5" aria-hidden="true" />
              {t("todo.details")}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-1 size-3.5" aria-hidden="true" />
                  {newTaskDeadline ? formatDate(newTaskDeadline) : t("todo.deadline")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={newTaskDeadline}
                  onSelect={(date) => {
                    setNewTaskDeadline(date);
                    if (!date) setNewTaskTime("");
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <TimePicker
              value={newTaskTime}
              onChange={setNewTaskTime}
              onOpen={() => {
                if (!newTaskDeadline) setNewTaskDeadline(new Date());
              }}
            />
            {leadSelect(newTaskLeadMinutes, setNewTaskLeadMinutes)}
          </div>
        )}
        {showDetailsInput && (
          <Textarea
            value={newTaskDetails}
            onChange={(event) => setNewTaskDetails(event.target.value)}
            placeholder={t("todo.addDetails")}
            aria-label={t("todo.addDetails")}
            className="mt-1"
          />
        )}
      </section>

      {/* Filters keep their counts even when one becomes empty. */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("todo.filterLabel")}>
        {filters.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            aria-pressed={filter === item.value}
            onClick={() => {
              setFilter(item.value);
              setEditingTask(null);
            }}
            className="h-8 rounded-full px-3"
          >
            {item.label}
            <span className="ml-1.5 text-[10px] opacity-70">{item.count}</span>
          </Button>
        ))}
      </div>

      {loadError && (
        <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      <ScrollArea className="max-h-[46vh]">
        <div className="space-y-2 pr-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed p-8 text-center">
              <ListTodo className="mb-1 size-7 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">
                {filter === "today"
                  ? t("todo.noTasksTitle")
                  : filter === "upcoming"
                    ? t("todo.noUpcomingTitle")
                    : t("todo.noDoneTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {filter === "today"
                  ? t("todo.noTasksHint")
                  : filter === "upcoming"
                    ? t("todo.noUpcomingHint")
                    : t("todo.noDoneHint")}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {visibleTasks.map((task) => {
                const isDone = task.status === "done";
                const editing = editingTask?.id === task.id;
                return (
                  <motion.div
                    key={task.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, height: 0 }}
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                    className="group flex items-start gap-3 rounded-xl border bg-background/40 p-3"
                  >
                    <Checkbox
                      checked={isDone}
                      onCheckedChange={() => (isDone ? void restoreAsPending(task) : void completeTask(task))}
                      aria-label={`${isDone ? t("todo.done") : t("todo.addTask")}: ${task.title}`}
                      className="mt-0.5 size-5 rounded-full border-2 border-primary data-[state=checked]:bg-primary"
                    />

                    {editing ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <Input
                          value={editingTask.title}
                          onChange={(event) =>
                            setEditingTask({ ...editingTask, title: event.target.value })
                          }
                          aria-label={t("todo.addTaskPlaceholder")}
                          autoFocus
                        />
                        <Textarea
                          value={editingTask.details ?? ""}
                          onChange={(event) =>
                            setEditingTask({ ...editingTask, details: event.target.value })
                          }
                          placeholder={t("todo.optionalDetails")}
                          aria-label={t("todo.optionalDetails")}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CalendarIcon className="mr-1 size-3.5" aria-hidden="true" />
                                {editingTask.deadline
                                  ? formatDate(editingTask.deadline)
                                  : t("todo.pickDate")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={parseDeadline(editingTask.deadline) ?? undefined}
                                onSelect={(date) =>
                                  setEditingTask({
                                    ...editingTask,
                                    deadline: date ? toLocalDate(date) : "",
                                    reminder_time: date ? editingTask.reminder_time : "",
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <TimePicker
                            value={editingTask.reminder_time ?? ""}
                            onChange={(time) =>
                              setEditingTask({ ...editingTask, reminder_time: time })
                            }
                            onOpen={() => {
                              if (!editingTask.deadline) {
                                setEditingTask({
                                  ...editingTask,
                                  deadline: toLocalDate(new Date()),
                                });
                              }
                            }}
                          />
                          {leadSelect(
                            editingTask.reminder_lead_minutes ?? 0,
                            (minutes) =>
                              setEditingTask({
                                ...editingTask,
                                reminder_lead_minutes: minutes,
                              }),
                          )}
                          <Button size="sm" onClick={() => void saveEdit()}>
                            {t("common.saveChanges")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTask(null)}>
                            {t("common.cancel")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isDone ? "line-through opacity-60" : ""}`}>
                          {task.title}
                        </p>
                        {task.details && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {task.details}
                          </p>
                        )}
                        {(task.deadline || task.reminder_time) && (
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            {task.deadline && (
                              <span className="inline-flex items-center">
                                <CalendarIcon className="mr-1 size-3" aria-hidden="true" />
                                {formatDate(task.deadline)}
                              </span>
                            )}
                            {task.reminder_time && (
                              <span className="inline-flex items-center">
                                <Clock className="mr-1 size-3" aria-hidden="true" />
                                {t("todo.dueTime", { time: task.reminder_time })}
                                {task.reminder_lead_minutes
                                  ? ` · ${t("todo.minutesBefore", { minutes: task.reminder_lead_minutes })}`
                                  : ""}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!editing && (
                      <div className="flex shrink-0 gap-0.5 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {!isDone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={t("todo.editTask", { title: task.title })}
                            onClick={() => setEditingTask({ ...task })}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          aria-label={t("todo.deleteTask", { title: task.title })}
                          onClick={() => void removeTask(task)}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Real settings: the switch and quiet hours are persisted immediately. */}
      <section className="rounded-xl border bg-card/40 p-4" aria-label={t("todo.taskRemindersTitle")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <Label htmlFor="todo-reminders" className="text-sm font-semibold">
                {t("todo.taskRemindersTitle")}
              </Label>
              <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                {t("todo.taskRemindersDesc")}
              </p>
            </div>
          </div>
          <Switch
            id="todo-reminders"
            checked={remindersEnabled}
            onCheckedChange={(value) => {
              setRemindersEnabled(value);
              void changeSetting(TASK_REMINDERS_ENABLED_KEY, String(value));
            }}
            aria-label={t("todo.taskRemindersTitle")}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{t("todo.quietHours")}</span>
          <select
            aria-label={t("todo.quietHours") + " start"}
            value={String(quietStart).padStart(2, "0")}
            onChange={(event) => {
              const value = Number(event.target.value);
              setQuietStart(value);
              void changeSetting(QUIET_START_KEY, String(value));
            }}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}:00
              </option>
            ))}
          </select>
          <span>–</span>
          <select
            aria-label={t("todo.quietHours") + " end"}
            value={String(quietEnd).padStart(2, "0")}
            onChange={(event) => {
              const value = Number(event.target.value);
              setQuietEnd(value);
              void changeSetting(QUIET_END_KEY, String(value));
            }}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}:00
              </option>
            ))}
          </select>
          <span>{t("todo.quietHoursDesc", { start: `${quietStart}:00`, end: `${quietEnd}:00` })}</span>
        </div>
      </section>
    </div>
  );
};

export default TodoPage;
