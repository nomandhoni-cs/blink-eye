// components/TodayTodoTasks.tsx
import React, { useState, useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";
import { Badge } from "./ui/badge";
import { CalendarCheck2, CheckCircle2 } from "lucide-react";

type Task = {
  id: number;
  title: string;
  details?: string;
  deadline?: string;
  status: string;
  created_at: string;
};

export const TodayTodoTasks: React.FC = () => {
  const [tasksForToday, setTasksForToday] = useState<Task[]>([]);

  const fetchTasksForToday = async () => {
    try {
      const db = await Database.load(`sqlite:UserLocalTodoList.db`);

      // Fetch all pending tasks
      const allPendingTasks = await db.select<Task[]>(`
        SELECT * 
        FROM todos 
        WHERE status = 'pending'
        ORDER BY deadline DESC;
      `);
      console.log(allPendingTasks);
      // Get today's date in the same format as stored
      const today = new Date().toLocaleDateString();

      // Filter tasks for today using JavaScript
      const todayTasks = allPendingTasks.filter((task) => {
        if (!task.deadline) {
          return true; // Include tasks without a deadline
        }

        // Compare the task's deadline with today's date
        const taskDeadline = new Date(task.deadline).toLocaleDateString();
        return taskDeadline === today; // Only include tasks with a deadline that matches today
      });

      setTasksForToday(todayTasks);
      return todayTasks;
    } catch (error) {
      console.error("Error fetching tasks for today:", error);
      return []; // Return an empty array in case of error
    }
  };

  useEffect(() => {
    fetchTasksForToday();
  }, []);

  if (tasksForToday.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div className="bg-background/20 backdrop-blur-sm border border-border/20 rounded-lg shadow-sm p-3 max-w-xs w-full">
        <div className="flex items-center justify-between mb-2 space-x-2">
          <div className="flex items-center space-x-2">
            <CalendarCheck2 className="h-5 w-5 text-foreground/70" />
            <h3 className="text-sm font-semibold text-foreground/80">
              Today's Tasks
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasksForToday.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {tasksForToday.map((task) => (
            <div
              key={task.id}
              className="flex items-center bg-background/30 backdrop-blur-sm rounded-md p-2"
            >
              <CheckCircle2 className="h-4 w-4 text-foreground/50 mr-2" />
              <span className="text-sm text-foreground/80">
                {task.title.length > 30
                  ? `${task.title.slice(0, 30)}...`
                  : task.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
