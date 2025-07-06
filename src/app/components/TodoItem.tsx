'use client'

import React, {useState, useEffect} from "react";
import { Todo } from "../types/todo";

type Props = {
    todo: Todo;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
};


export default function TodoItem({ todo, onDelete, onComplete }: Props) {
    const [timeLeft, setTimeLeft] = useState<number>(
        todo.durationMinutes * 60 * 1000 - (Date.now() - todo.createdAt)
    );

    const isExpired = !todo.completed && timeLeft <= 0;

    useEffect(() => {
    if(todo.completed) return;
    const interval = setInterval(() => {
        const remaining = todo.durationMinutes * 60 * 1000 - (Date.now() - todo.createdAt);
        setTimeLeft(Math.max(remaining, 0));
    }, 1000);

    return () => clearInterval(interval);
}, [todo]);

const percentLeft =
  (timeLeft / (todo.durationMinutes * 60 * 1000)) * 100;

const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

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
        : "bg-white"
    }`}>
        <div className="flex justify-between">
            <h3 className={todo.completed ? "line-through text-gray-400" : ""}>
            {todo.title}
            </h3>
            <span className={`text-sm ${isExpired ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                {todo.completed
                ? "✅ Done"
                :   isExpired
                ? "⏰ Expired"
                : `⏱ ${formatTime(timeLeft)}`}
            </span>
        </div>
        {!todo.completed && (
            <div className="w-full h-2 bg-gray-200 rounded">
            <div className={`h-full ${barColor} rounded transition-all duration-1000`} style={{ width: `${percentLeft}%` }} />
            </div>
        )}
        <div className="flex gap-3 text-sm mt-1">
            {!todo.completed && (
            <button
                className="text-green-600 hover:underline"
                onClick={() => onComplete(todo.id)}
            >
                ✅ Complete
            </button>
            )}
            <button
            className="text-red-500 hover:underline"
            onClick={() => onDelete(todo.id)}
            >
            🗑 Delete
            </button>
        </div>
    </div>
    );
}