import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Clock, Text, Trash2 } from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { TimePicker } from "../ui/TimePicker"; // Import the new component

type Task = {
  id: number;
  title: string;
  details?: string;
  deadline?: string;
  reminder_time?: string;
  status: string;
  created_at: string;
};

const ToDoOnboarding: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [newTaskDetails, setNewTaskDetails] = useState<string>("");
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>();
  const [newTaskTime, setNewTaskTime] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const dbFileName = "UserLocalTodoList.db";

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
          reminder_time TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        );
      `);
      } else {
        try {
          await db.execute("ALTER TABLE todos ADD COLUMN reminder_time TEXT;");
        } catch (error) {
          console.log(
            "Could not add reminder_time column, it might already exist."
          );
        }
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
      setTasks(activeTasks);
      setCompletedTasks(completed);
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
        "INSERT INTO todos (title, details, deadline, reminder_time, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
        [
          newTask,
          newTaskDetails || null,
          deadlineString,
          newTaskTime || null,
          currentDate,
        ]
      );

      await fetchTasks();

      // Reset input fields
      setNewTask("");
      setNewTaskDetails("");
      setNewTaskDeadline(undefined);
      setNewTaskTime("");
      setShowDetailsInput(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      const newStatus = task.status === "pending" ? "done" : "pending";
      await db.execute("UPDATE todos SET status = ? WHERE id = ?", [
        newStatus,
        task.id,
      ]);
      await fetchTasks();
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
    if (!updatedTask) return;
    try {
      const db = await Database.load(`sqlite:${dbFileName}`);
      await db.execute(
        "UPDATE todos SET title = ?, details = ?, deadline = ?, reminder_time = ? WHERE id = ?",
        [
          updatedTask.title,
          updatedTask.details || null,
          updatedTask.deadline || null,
          updatedTask.reminder_time || null,
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
      <h3 className="text-2xl text-center font-heading tracking-wide">
        TODO List
      </h3>
      <>
        {/* Add Task Section */}
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a new task or Reminder"
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
              <div className="flex justify-end items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsInput(!showDetailsInput)}
                >
                  <Text className="h-4 w-4 mr-1" />
                  Details
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {newTaskDeadline ? (
                        format(newTaskDeadline, "PPP")
                      ) : (
                        <span>Deadline</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDeadline}
                      onSelect={(date) => {
                        setNewTaskDeadline(date);
                        if (!date) {
                          setNewTaskTime(""); // Clear time if date is cleared
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <TimePicker
                  value={newTaskTime}
                  onChange={setNewTaskTime}
                  onOpen={() => {
                    if (!newTaskDeadline) {
                      setNewTaskDeadline(new Date()); // Default to today
                    }
                  }}
                />

                <Button onClick={addTask} size="sm" className="h-9">
                  Add Task
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Active Tasks Section */}
        {!showCompletedTasks && (
          <ScrollArea className="space-y-2 max-w-lg h-[350px] mx-auto">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-2 p-2 bg-gray-500/10 hover:bg-gray-500/20 rounded-md group"
                >
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => toggleTaskStatus(task)}
                    className="border-gray-300 rounded-full p-3 mt-1"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      editingTask?.id !== task.id && setEditingTask(task)
                    }
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
                          autoFocus
                        />
                        <Textarea
                          value={editingTask.details || ""}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              details: e.target.value,
                            })
                          }
                          placeholder="Optional details"
                        />
                        <div className="flex items-center space-x-2 pt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                size="sm"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingTask.deadline ? (
                                  format(new Date(editingTask.deadline), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={
                                  editingTask.deadline
                                    ? new Date(editingTask.deadline)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setEditingTask({
                                    ...editingTask,
                                    deadline: date
                                      ? date.toLocaleDateString()
                                      : "",
                                    reminder_time: date
                                      ? editingTask.reminder_time
                                      : "", // Clear time if date is cleared
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <TimePicker
                            value={editingTask.reminder_time || ""}
                            onChange={(time) =>
                              setEditingTask({
                                ...editingTask,
                                reminder_time: time,
                              })
                            }
                            onOpen={() => {
                              if (!editingTask.deadline) {
                                setEditingTask({
                                  ...editingTask,
                                  deadline: new Date().toLocaleDateString(),
                                });
                              }
                            }}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateTask(editingTask)}
                          >
                            Save Changes
                          </Button>
                        </div>
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
                          <div className="text-xs text-gray-500 flex items-center flex-wrap mt-1">
                            <span className="flex items-center mr-3">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {format(new Date(task.deadline), "PPP")}
                            </span>
                            {task.reminder_time && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.reminder_time}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {editingTask?.id !== task.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
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
                          <div className="text-xs text-gray-400 line-through flex items-center flex-wrap">
                            <span className="flex items-center mr-3">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {format(new Date(task.deadline), "PPP")}
                            </span>
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
      </>
    </div>
  );
};

export default ToDoOnboarding;
