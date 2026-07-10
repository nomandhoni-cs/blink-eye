import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import {
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { format } from "date-fns";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  dashboardBlockClassName,
  DashboardIconBadge,
} from "./dashboard/dashboardBlock";
import { useAccentColor } from "../contexts/AccentColorContext";

type Task = {
  id: number;
  title: string;
  details?: string;
  deadline?: string;
  reminder_time?: string;
  status: string;
  created_at: string;
};

const DashboardPendingTasks = ({ className }: { className?: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const dbFileName = "UserLocalTodoList.db";
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const { accentHex } = useAccentColor();

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const dbExists = await exists(dbFileName, {
        baseDir: BaseDirectory.AppData,
      });

      if (!dbExists) return setLoading(false);

      const db = await Database.load(`sqlite:${dbFileName}`);
      const activeTasks = await db.select<Task[]>(
        "SELECT * FROM todos WHERE status = 'pending' ORDER BY created_at DESC LIMIT 8"
      );

      setTasks(activeTasks);
      setLoading(false);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!canAccessPremiumFeatures) return;

    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      await db.execute("UPDATE todos SET status = 'done' WHERE id = ?", [
        task.id,
      ]);
      setTasks(tasks.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!canAccessPremiumFeatures) return;

    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      await db.execute("DELETE FROM todos WHERE id = ?", [taskId]);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!canAccessPremiumFeatures) {
    return (
      <Card
        className={cn(
          "flex h-full flex-col gap-3 py-4 shadow-none ring-0",
          dashboardBlockClassName,
          className,
        )}
      >
        <CardHeader className="rounded-t-xl px-4 py-0">
          <CardTitle className="flex items-center gap-2">
            <DashboardIconBadge color={accentHex}>
              <ClipboardList className="size-4" />
            </DashboardIconBadge>
            <span>Pending Tasks</span>
          </CardTitle>
          <CardDescription>Upgrade to manage your tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Button asChild style={{ backgroundColor: accentHex }}>
            <Link
              to="https://blinkeye.app/pricing"
              target="_blank"
              className="text-center hover:opacity-90"
            >
              Unlock Task Management
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          <span>Pending Tasks</span>
          {tasks.length > 0 && (
            <span className="ml-auto text-sm text-muted-foreground">
              {tasks.length} pending
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: accentHex }}
            />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="font-medium">All tasks completed!</p>
            <p className="text-sm text-muted-foreground">
              Good job taking care of your tasks
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full min-h-0">
            <div
              className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2"
              style={{ "--task-accent": accentHex } as React.CSSProperties}
            >
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3 transition-colors hover:bg-muted/60 group"
                >
                  <Checkbox
                    className="h-5 w-5 rounded-full border-2 border-[var(--task-accent)] data-[state=checked]:bg-[var(--task-accent)] data-[state=checked]:text-white"
                    onClick={() => toggleTaskStatus(task)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {(task.deadline || task.reminder_time) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {task.deadline && (
                          <span className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {format(new Date(task.deadline), "MMM dd")}
                          </span>
                        )}
                        {task.reminder_time && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.reminder_time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardPendingTasks;
