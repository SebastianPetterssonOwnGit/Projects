"use client";

import { useState, useEffect } from "react";
import { Todo } from "../types/todo";

const LOCAL_KEY = "my-todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodos((prev) =>
        prev.map((todo) => {
          const timePassed = Date.now() - todo.createdAt;
          const durationMs = todo.durationMinutes * 60 * 1000;
          if (!todo.completed && !todo.expired && timePassed >= durationMs) {
            if (!todo.notified) {
              showExpirationNotification(todo.title);
            }
            return { ...todo, expired: true, notified: true };
          }
          return todo;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTodo = (todo: Todo) => {
    setTodos((prev) => [...prev, todo]);
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const markComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  };

  const handleClearExpired = () => {
    setTodos((prev) => prev.filter((todo) => !todo.expired));
  };

  function showExpirationNotification(title: string) {
    if (Notification.permission === "granted") {
      new Notification("⏰ Todo Expired", {
        body: `Your todo "${title}" has expired.`,
      });
    }
  }

  return { todos, addTodo, removeTodo, markComplete, handleClearExpired };
}
