// components/TodayTodoTasks.tsx
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "./ui/badge";
import { CalendarCheck2, Check, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import {
  fetchTasks,
  parseDeadline,
  setTaskStatus,
  type Task,
} from "../lib/todo-store";
import { useTodoRefreshEvent } from "../hooks/useTodoRefreshEvent";

type Props = { className?: string };

const SPRING = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.7 };

/** Free for everyone: today's work stays visible during every break. */
export const TodayTodoTasks: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [tasksForToday, setTasksForToday] = useState<Task[]>([]);

  const fetchTasksForToday = useCallback(async () => {
    try {
      const allPending = (await fetchTasks()).filter((task) => task.status !== "done");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTasks = allPending
        .filter((task) => {
          const deadline = parseDeadline(task.deadline);
          // Undated tasks are the inbox; dated tasks are today or overdue.
          return !deadline || deadline.getTime() <= today.getTime();
        })
        .slice(0, 3);
      setTasksForToday(todayTasks);
    } catch (error) {
      console.error("Error fetching tasks for today:", error);
    }
  }, []);

  useEffect(() => {
    void fetchTasksForToday();
  }, [fetchTasksForToday]);

  useTodoRefreshEvent(fetchTasksForToday);

  const complete = async (task: Task) => {
    try {
      await setTaskStatus(task.id, "done");
      await fetchTasksForToday();
      toast.success(t("todo.completeToast"));
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (tasksForToday.length === 0) return null;

  return (
    <div className={cn("absolute bottom-4 right-4 z-10", className)}>
      <div className="w-full max-w-xs rounded-lg border border-border/20 bg-background/20 p-3 shadow-sm backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="size-5 text-foreground/70" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground/80">
              {t("common.todayTasks")}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasksForToday.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {tasksForToday.map((task) => (
              <motion.div
                key={task.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, x: 16, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, height: 0 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
                className="flex items-center rounded-md bg-background/30 p-2 backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => void complete(task)}
                  aria-label={t("todo.markDone", { title: task.title })}
                  className="group mr-2 flex size-6 shrink-0 items-center justify-center rounded-full border border-foreground/30 transition-colors hover:border-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Check className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
                </button>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground/80">
                  {task.title}
                </span>
                {task.reminder_time && (
                  <span className="ml-1 inline-flex shrink-0 items-center text-[10px] text-foreground/50">
                    <Clock className="mr-0.5 size-3" aria-hidden="true" />
                    {task.reminder_time}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
