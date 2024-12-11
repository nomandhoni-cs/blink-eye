import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDown,
  Text,
  Trash2,
} from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";
import { Textarea } from "../ui/textarea";
import { Link } from "react-router-dom";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { ScrollArea } from "../ui/scroll-area";

type Task = {
  id: number;
  title: string;
  details?: string;
  deadline?: string;
  status: string;
  created_at: string;
};

const TodoPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [newTaskDetails, setNewTaskDetails] = useState<string>("");
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const dbFileName = "UserLocalTodoList.db";
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const dbExists = await exists(dbFileName, {
        baseDir: BaseDirectory.AppData,
      });
      const db = await Database.load(`sqlite:${dbFileName}`);

      if (!dbExists) {
        await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          details TEXT,
          deadline TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        );
      `);
      }

      await fetchTasks();
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      const activeTasks = await db.select<Task[]>(
        "SELECT * FROM todos WHERE status = 'pending' ORDER BY created_at DESC"
      );
      const completed = await db.select<Task[]>(
        "SELECT * FROM todos WHERE status = 'done' ORDER BY created_at DESC"
      );
      console.log(activeTasks);
      setTasks(activeTasks);
      setCompletedTasks(completed);
      console.log(completed);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      const currentDate = new Date().toLocaleDateString();
      const deadlineString = newTaskDeadline
        ? newTaskDeadline.toLocaleDateString()
        : null;

      await db.execute(
        "INSERT INTO todos (title, details, deadline, status, created_at) VALUES (?, ?, ?, 'pending', ?)",
        [newTask, newTaskDetails || "", deadlineString, currentDate]
      );

      await fetchTasks();

      // Reset input fields
      setNewTask("");
      setNewTaskDetails("");
      setNewTaskDeadline(undefined);
      setShowDetailsInput(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      const newStatus = task.status === "pending" ? "done" : "pending"; // Toggle between 'pending' and 'done'
      await db.execute("UPDATE todos SET status = ? WHERE id = ?", [
        newStatus,
        task.id,
      ]);
      await fetchTasks(); // Re-fetch tasks after updating the status
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      await db.execute("DELETE FROM todos WHERE id = ?", [taskId]);
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      await db.execute(
        "UPDATE todos SET title = ?, details = ?, deadline = ? WHERE id = ?",
        [
          updatedTask.title,
          updatedTask.details || null,
          updatedTask.deadline || null,
          updatedTask.id,
        ]
      );
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="max-w-full space-y-2 relative">
      {/* Add Task Section */}
      <div className="space-y-2 max-w-lg mx-auto">
        <div className="flex space-x-2">
          <Input
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
        </div>
        {showDetailsInput && (
          <Textarea
            placeholder="Add details"
            value={newTaskDetails}
            onChange={(e) => setNewTaskDetails(e.target.value)}
            className="mt-2"
          />
        )}
        {newTask && (
          <>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsInput(!showDetailsInput)}
              >
                <Text className="h-4 w-4 ml-2" />
                Add details
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 ml-2" />
                    {newTaskDeadline ? (
                      format(newTaskDeadline, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTaskDeadline}
                    onSelect={setNewTaskDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={addTask} className="h-full">
                Add Task
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Active Tasks Section */}
      {!showCompletedTasks && (
        <ScrollArea className="space-y-2 max-w-lg h-[450px] mx-auto">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-2 p-2 bg-gray-500/10 hover:bg-gray-500/20 rounded-md group"
              >
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleTaskStatus(task)}
                  className="border-gray-300 rounded-full p-3"
                />
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setEditingTask(task)}
                >
                  {editingTask?.id === task.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingTask.title}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            title: e.target.value,
                          })
                        }
                        onBlur={() => updateTask(editingTask)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && updateTask(editingTask)
                        }
                        autoFocus
                      />
                      {editingTask.details !== undefined && (
                        <Textarea
                          value={editingTask.details || ""}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              details: e.target.value,
                            })
                          }
                          onBlur={() => updateTask(editingTask)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && updateTask(editingTask)
                          }
                          placeholder="Optional details"
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">{task.title}</p>
                      {task.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {task.details}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(new Date(task.deadline), "PPP")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="max-w-lg mx-auto">
          {showCompletedTasks && (
            <ScrollArea className="space-y-2 max-w-lg h-[450px] mx-auto">
              <div className="space-y-2 mt-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2 p-2 bg-gray-500/20 hover:bg-gray-500/40 rounded-md group"
                  >
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={() => toggleTaskStatus(task)}
                      className="border-gray-300 rounded-full h-6 w-6 "
                    />
                    <div className="flex-1">
                      <p className="text-sm line-through ">{task.title}</p>
                      {task.details && (
                        <p className="text-xs text-gray-400 line-through">
                          {task.details}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-gray-400 line-through flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(new Date(task.deadline), "PPP")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <Button
            variant="ghost"
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            className="w-full flex items-center justify-center"
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            {showCompletedTasks ? "Hide" : "Show"} Completed Tasks (
            {completedTasks.length})
          </Button>
        </div>
      )}
      {!canAccessPremiumFeatures && (
        <div className="absolute -top-4 left-0 w-full h-full bg-black bg-opacity-60 backdrop-blur-3xl flex flex-col space-y-8 justify-center items-center rounded-lg">
          <h3 className="text-center text-white font-bold text-3xl">
            Your support will help the developer to make this project better &
            add more features.
          </h3>
          <Button asChild>
            <Link
              to="https://blinkeye.vercel.app/pricing"
              target="_blank"
              className="flex items-center justify-center px-6 py-3 bg-[#FE4C55] text-black text-lg rounded-lg hover:bg-[#e4434b] focus:outline-none"
            >
              <CheckCircle2Icon className="mr-2" />
              Get a License to Support this project, And Unlock All Features.
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodoPage;
