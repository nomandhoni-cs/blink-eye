import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import {
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  fetchTasks,
  formatTaskDate,
  setTaskStatus,
  deleteTask,
  type Task,
} from "../lib/todo-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import {
  dashboardBlockClassName,
  DashboardIconBadge,
} from "./dashboard/dashboardBlock";
import { useAccentColor } from "../contexts/AccentColorContext";
import { useTodoRefreshEvent } from "../hooks/useTodoRefreshEvent";

/** The dashboard is now a real, free entry point to the same todo list. */
const DashboardPendingTasks = ({ className }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { accentHex } = useAccentColor();

  const load = useCallback(async () => {
    try {
      const all = await fetchTasks();
      setTasks(all.filter((task) => task.status !== "done").slice(0, 8));
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [load]);

  useTodoRefreshEvent(load);

  const toggleTaskStatus = async (task: Task) => {
    try {
      await setTaskStatus(task.id, "done");
      await load();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const removeTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      await load();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 py-4 shadow-none ring-0",
        dashboardBlockClassName,
        className,
      )}
    >
      <CardHeader className="shrink-0 rounded-t-xl px-4 py-0">
        <CardTitle className="flex items-center gap-2 font-heading">
          <DashboardIconBadge color={accentHex}>
            <ClipboardList className="size-4" />
          </DashboardIconBadge>
          <span>{t("common.pendingTasks")}</span>
          {tasks.length > 0 && (
            <span className="ml-auto text-sm text-muted-foreground">
              {t("common.pendingCount", { count: tasks.length })}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: accentHex }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500" aria-hidden="true" />
            <p className="font-medium">{t("common.allTasksCompleted")}</p>
            <p className="text-sm text-muted-foreground">
              {t("common.allTasksCompletedHint")}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full min-h-0">
            <div
              className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2"
              style={{ "--task-accent": accentHex } as CSSProperties}
            >
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3 transition-colors hover:bg-muted/60"
                >
                  <Checkbox
                    className="h-5 w-5 rounded-full border-2 border-[var(--task-accent)] data-[state=checked]:bg-[var(--task-accent)] data-[state=checked]:text-white"
                    onClick={() => toggleTaskStatus(task)}
                    aria-label={t("todo.markDone", { title: task.title })}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    {(task.deadline || task.reminder_time) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {task.deadline && (
                          <span className="flex items-center">
                            <CalendarIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                            {formatTaskDate(task.deadline, i18n.language)}
                          </span>
                        )}
                        {task.reminder_time && (
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                            {task.reminder_time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100"
                    aria-label={t("todo.deleteTask", { title: task.title })}
                    onClick={() => void removeTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="shrink-0 border-t px-3 pt-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/todoList">
              <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
              {t("nav.todoList")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPendingTasks;
