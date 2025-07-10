"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import type { TodoItem } from "../../types/onboarding";

interface TodoListScreenProps {
  todos: TodoItem[];
  setTodos: (todos: TodoItem[]) => void;
}

export default function TodoListScreen({
  todos,
  setTodos,
}: TodoListScreenProps) {
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTodos([...todos, todo]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Setup Your Task List
        </h2>
        <p className="text-sm text-gray-600">
          Add tasks to stay organized during your work sessions
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {/* Add Todo Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addTodo} disabled={!newTodo.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Todo List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>No tasks yet. Add your first task above!</p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className={`transition-all ${
                  todo.completed ? "bg-gray-50" : ""
                }`}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-1 ${
                      todo.completed ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <span
                    className={`flex-1 ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            <p>
              {todos.filter((t) => t.completed).length} of {todos.length} tasks
              completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
