"use client";

import { useState, useEffect, useRef } from "react";
import { Todo } from "../types/todo";

const LOCAL_KEY = "my-todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false); // Prevent early overwrite
  const notifiedSet = useRef(new Set<string>());

  // 🔁 Load from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todosWithTags = (parsed as Todo[]).map((todo) => ({
          ...todo,
          tags: Array.isArray(todo.tags) ? todo.tags : [],
        }));
        setTodos(todosWithTags);
      } catch (err) {
        console.error("Failed to parse todos from localStorage", err);
      }
    }
    setLoaded(true);
  }, []);

  // 💾 Save to localStorage whenever todos change (after load)
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(todos));
    }
  }, [todos, loaded]);

  // 🔔 Ask for notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ⏱️ Timer to mark expired todos
  useEffect(() => {
    const interval = setInterval(() => {
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.completed || todo.expired || todo.durationMinutes === null)
            return todo;

          const timePassed = Date.now() - todo.createdAt;
          const durationMs = todo.durationMinutes * 60 * 1000;
          const hasExpired = timePassed >= durationMs;

          if (hasExpired) {
            if (!notifiedSet.current.has(todo.id)) {
              notifiedSet.current.add(todo.id);
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

  // ✅ Helper: Notification
  function showExpirationNotification(title: string) {
    if (Notification.permission === "granted") {
      new Notification("⏰ Todo Expired", {
        body: `Your todo "${title}" has expired.`,
      });
    }
  }

  // ✅ Actions
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

  const handleToggleTimed = (id: string, newDuration: number | null) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              durationMinutes: newDuration,
              createdAt: Date.now(),
              expired: false,
              notified: false,
            }
          : t
      )
    );
  };

  return {
    todos,
    addTodo,
    removeTodo,
    markComplete,
    handleClearExpired,
    handleToggleTimed,
  };
}
