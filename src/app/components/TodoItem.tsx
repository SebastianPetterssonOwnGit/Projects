"use client";

import React, { useState, useEffect } from "react";
import { Todo } from "../types/todo";
import { getTagColor } from "../utils/getTagColor";

type Props = {
  todo: Todo;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onToggleTimed: (id: string, newDuration: number | null) => void;
};

function formatDurationLong(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);

  return parts.join(" and ");
}

function formatScheduledLabel(dateString: string): string {
  const target = new Date(dateString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timePart = target.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMinutes <= 0) return "🔕 Scheduled passed";
  if (diffMinutes < 60)
    return `⏰ In ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  if (now.toDateString() === target.toDateString())
    return `⏰ Today at ${timePart}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (tomorrow.toDateString() === target.toDateString())
    return `⏰ Tomorrow at ${timePart}`;

  if (diffDays < 7) {
    const weekday = target.toLocaleDateString(undefined, { weekday: "long" });
    return `⏰ ${weekday} at ${timePart}`;
  }

  return `⏰ In ${formatDurationLong(diffMs)}`;
}

export default function TodoItem({
  todo,
  onDelete,
  onComplete,
  onToggleTimed,
}: Props) {
  const getTargetTime = () => {
    return todo.scheduledFor
      ? new Date(todo.scheduledFor).getTime()
      : todo.createdAt + (todo.durationMinutes ?? 0) * 60 * 1000;
  };

  const [timeLeft, setTimeLeft] = useState<number>(
    getTargetTime() - Date.now()
  );

  const isUrgent =
    todo.durationMinutes !== null &&
    !todo.expired &&
    !todo.scheduledFor &&
    timeLeft <= 5 * 60 * 1000;

  const isExpired =
    !todo.completed &&
    timeLeft <= 0 &&
    (todo.scheduledFor || todo.durationMinutes !== null);

  useEffect(() => {
    if (todo.completed || (todo.durationMinutes == null && !todo.scheduledFor))
      return;

    const interval = setInterval(() => {
      setTimeLeft(getTargetTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [todo]);

  const percentLeft =
    todo.durationMinutes !== null && !todo.scheduledFor
      ? (timeLeft / (todo.durationMinutes * 60 * 1000)) * 100
      : 0;

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  function formatDate(iso: string) {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  const barColor =
    percentLeft > 50
      ? "bg-green-400"
      : percentLeft > 20
      ? "bg-yellow-400"
      : "bg-red-500";

  const isScheduled =
    todo.scheduledFor && new Date(todo.scheduledFor) > new Date();

  return (
    <div
      className={`p-4 border rounded shadow-sm space-y-2 transition-colors ${
        isScheduled
          ? "bg-indigo-50 border-indigo-300 text-indigo-800"
          : isExpired
          ? "bg-red-100 border-red-400 text-red-700"
          : isUrgent
          ? "bg-yellow-50 border-yellow-400"
          : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className={todo.completed ? "line-through text-gray-500" : ""}>
          {todo.title}
        </h3>
        <span
          className={`text-sm ${
            isExpired ? "text-red-500 font-semibold" : "text-gray-500"
          }`}
        >
          {todo.completed
            ? "✅ Done"
            : todo.scheduledFor
            ? formatScheduledLabel(todo.scheduledFor)
            : todo.durationMinutes === null
            ? "⏳ Timeless"
            : isExpired
            ? "🔕 Reminder passed"
            : `🔔 In ${formatTime(timeLeft)}`}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        {todo.scheduledFor && (
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{formatDate(todo.scheduledFor)}</span>
          </div>
        )}

        {todo.repeat && (
          <div className="flex items-center gap-1">
            <span>🔁</span>
            <span>
              {todo.repeat.frequency === "daily" && "Daily"}
              {todo.repeat.frequency === "weekly" &&
                `Every ${
                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                    todo.repeat.dayOfWeek ?? 0
                  ]
                }`}
              {todo.repeat.frequency === "monthly" &&
                `Monthly on day ${todo.repeat.dayOfMonth}`}
              {todo.repeat.time && ` at ${todo.repeat.time}`}
            </span>
          </div>
        )}
      </div>

      {todo.tags?.length > 0 && (
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

      {!todo.completed &&
        todo.durationMinutes !== null &&
        !todo.scheduledFor && (
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
            onToggleTimed(todo.id, todo.durationMinutes === null ? 5 : null)
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
