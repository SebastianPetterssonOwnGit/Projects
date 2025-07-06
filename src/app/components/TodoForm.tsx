"use client";

import React, { useState } from "react";
import { Todo } from "../types/todo";
import { v4 as uuidv4 } from "uuid";

type Props = {
  onSubmit: (todo: Todo) => void;
  onClose: () => void;
};

export default function TodoFrom({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      createdAt: Date.now(),
      durationMinutes: duration,
      completed: false,
      expired: false,
      notified: false,
    };
    onSubmit(newTodo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl text-gray-500 font-semibold mb-4">New Todo</h2>
        <input
          className="border text-gray-500 p-2 w-full mb-4 rounded"
          placeholder="Todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block mb-2 text-gray-500">Duration (minutes):</label>
        <select
          className="border text-gray-500 p-2 w-full mb-4 rounded"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 10, 15, 30, 60].map((min) => (
            <option key={min} value={min}>
              {min} minutes
            </option>
          ))}
        </select>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
