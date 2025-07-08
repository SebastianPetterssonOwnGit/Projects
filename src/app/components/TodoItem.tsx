"use client";

import React, { useState, useEffect } from "react";
import { Todo } from "../types/todo";

import { getTagColor } from "../utils/getTagColor";

type Props = {
  todo: Todo;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onToggleTimed: (id: string, newDuration: number | null) => void; // <-- new
};

export default function TodoItem({
  todo,
  onDelete,
  onComplete,
  onToggleTimed,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(
    todo.durationMinutes !== null
      ? todo.durationMinutes * 60 * 1000 - (Date.now() - todo.createdAt)
      : 0
  );

  const isUrgent =
    todo.durationMinutes !== null && !todo.expired && timeLeft <= 5 * 60 * 1000;

  const isExpired =
    !todo.completed && todo.durationMinutes !== null && timeLeft <= 0;

  useEffect(() => {
    if (todo.completed || todo.durationMinutes === null) return;
    const interval = setInterval(() => {
      const remaining =
        todo.durationMinutes! * 60 * 1000 - (Date.now() - todo.createdAt);
      setTimeLeft(Math.max(remaining, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [todo]);

  const percentLeft =
    todo.durationMinutes !== null
      ? (timeLeft / (todo.durationMinutes * 60 * 1000)) * 100
      : 0;

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const barColor =
    percentLeft > 50
      ? "bg-green-400"
      : percentLeft > 20
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div
      className={`p-4 border rounded shadow-sm space-y-2 transition-colors ${
        isExpired
          ? "bg-red-100 border-red-400 text-red-700"
          : isUrgent
          ? "bg-yellow-50 border-yellow-400"
          : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className={todo.completed ? "line-through text-gray-400" : ""}>
          {todo.title}
        </h3>
        <span
          className={`text-sm ${
            isExpired ? "text-red-500 font-semibold" : "text-gray-500"
          }`}
        >
          {todo.completed
            ? "✅ Done"
            : todo.durationMinutes === null
            ? "⏳ Timeless"
            : isExpired
            ? "🔕 Reminder passed"
            : `🔔 In ${formatTime(timeLeft)}`}
        </span>
      </div>

      {todo.tags && todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs text-gray-600">
          {todo.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 px-2 py-0.5 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {!todo.completed && todo.durationMinutes !== null && (
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className={`h-full ${barColor} rounded transition-all duration-1000`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm mt-2">
        {!todo.completed && (
          <button
            className="text-green-600 hover:underline"
            onClick={() => onComplete(todo.id)}
          >
            ✅ Complete
          </button>
        )}

        <button
          className="text-blue-500 hover:underline"
          onClick={() =>
            onToggleTimed(
              todo.id,
              todo.durationMinutes === null ? 5 : null // default back to 10 min
            )
          }
        >
          {todo.durationMinutes === null
            ? "⏱ Set reminder 5 min"
            : "⏳ Make timeless"}
        </button>

        <button
          className="text-red-500 hover:underline"
          onClick={() => onDelete(todo.id)}
        >
          🗑 Delete
        </button>
      </div>
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {todo.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(
                tag
              )} text-gray-800`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
