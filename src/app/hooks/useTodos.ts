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
      setTodos((prevTodos) => {
        const now = new Date();

        const updated = prevTodos.flatMap((todo) => {
          if (todo.completed) return [todo];

          const scheduledDate = todo.scheduledFor
            ? new Date(todo.scheduledFor)
            : null;

          // Check expiration based on either scheduledFor or createdAt
          let hasExpired = false;

          // Handle scheduled start time
          if (scheduledDate) {
            hasExpired = now >= scheduledDate;
          } else if (todo.durationMinutes != null && !todo.expired) {
            const timePassed = now.getTime() - todo.createdAt;
            const durationMs = todo.durationMinutes * 60 * 1000;
            hasExpired = timePassed >= durationMs;
          }

          // Handle expiration
          if (hasExpired && !todo.expired) {
            if (!notifiedSet.current.has(todo.id)) {
              notifiedSet.current.add(todo.id);
              showExpirationNotification(todo.title);
            }

            // Generate a new instance if it's a recurring todo
            if (todo.repeat) {
              const nextTodo = generateNextRecurringTodo(todo);
              return [{ ...todo, expired: true, notified: true }, nextTodo];
            }

            return [{ ...todo, expired: true, notified: true }];
          }

          return [todo];
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function generateNextRecurringTodo(todo: Todo): Todo {
    const base = todo.scheduledFor
      ? new Date(todo.scheduledFor)
      : new Date(todo.createdAt);
    const next = new Date(base);

    const { frequency, dayOfWeek, dayOfMonth, time } = todo.repeat ?? {};

    if (frequency === "daily") {
      next.setDate(base.getDate() + 1);
    } else if (frequency === "weekly" && dayOfWeek != null) {
      const currentDay = base.getDay();
      const offset = (dayOfWeek + 7 - currentDay) % 7 || 7;
      next.setDate(base.getDate() + offset);
    } else if (frequency === "monthly" && dayOfMonth != null) {
      next.setMonth(base.getMonth() + 1);
      const daysInNextMonth = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0
      ).getDate();
      next.setDate(Math.min(dayOfMonth, daysInNextMonth));
    }

    // Apply time if available (e.g., "10:00")
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      next.setHours(hours, minutes, 0, 0);
    }

    return {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: next.getTime(), // time of generation
      expired: false,
      completed: false,
      notified: false,
      scheduledFor: next.toISOString(),
    };
  }

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
    setTodos((prev) => {
      const completedTodo = prev.find((t) => t.id === id);
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: true } : t
      );

      if (completedTodo?.repeat) {
        const nextTodo = cloneNextTodoInstance(completedTodo);
        if (nextTodo) return [...updated, nextTodo];
      }

      return updated;
    });
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

function getNextScheduledDate(todo: Todo): string | null {
  if (!todo.repeat || !todo.scheduledFor) return null;

  const current = new Date(todo.scheduledFor);

  switch (todo.repeat.frequency) {
    case "daily":
      current.setDate(current.getDate() + 1);
      break;
    case "weekly":
      current.setDate(current.getDate() + 7);
      break;
    case "monthly":
      current.setMonth(current.getMonth() + 1);
      break;
    default:
      return null;
  }
  return current.toISOString();
}

function cloneNextTodoInstance(todo: Todo): Todo | null {
  const nextDate = getNextScheduledDate(todo);
  if (!nextDate) return null;

  return {
    ...todo,
    id: crypto.randomUUID(),
    scheduledFor: nextDate,
    completed: false,
    expired: false,
    createdAt: Date.now(),
    notified: false,
  };
}
