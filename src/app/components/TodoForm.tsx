"use client";

import React, { useState, useEffect, useRef } from "react";
import { Todo } from "../types/todo";
import { v4 as uuidv4 } from "uuid";

type Props = {
  onSubmit: (todo: Todo) => void;
  onClose: () => void;
};

export default function TodoForm({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);
  const [noTimeLimit, setNoTimeLimit] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const PRESET_TAGS = ["Home", "Work", "Personal", "Urgent", "Shopping"];

  const titleInputRef = useRef<HTMLInputElement>(null);

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const addPresetTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTagsInput(newTags.join(", "));
    }
    setSelectedPreset(""); // reset dropdown
  };

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: uuidv4(),
      title: title.trim(),
      createdAt: Date.now(),
      durationMinutes: noTimeLimit ? null : duration,
      completed: false,
      expired: false,
      notified: false,
      tags,
    };
    onSubmit(newTodo);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl text-gray-700 font-semibold mb-4">New Todo</h2>

        <input
          ref={titleInputRef}
          className="border text-gray-700 p-2 w-full mb-4 rounded"
          placeholder="Todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Preset tag dropdown */}
        <select
          value={""}
          onChange={(e) => {
            const selected = e.target.value;
            const currentTags = tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);

            if (selected && !currentTags.includes(selected)) {
              const newTags = [...currentTags, selected];
              setTagsInput(newTags.join(", "));
            }
          }}
          className="border text-gray-700 p-2 w-full mb-2 rounded bg-white"
        >
          <option value="">Add preset tag...</option>
          {["Home", "Work", "Personal", "Urgent", "Shopping"].map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        {/* Custom tag input */}
        <input
          className="border text-gray-500 p-2 w-full mb-4 rounded"
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex items-center mb-4">
          <input
            id="noTimeLimit"
            type="checkbox"
            className="mr-2"
            checked={noTimeLimit}
            onChange={() => setNoTimeLimit((prev) => !prev)}
          />
          <label htmlFor="noTimeLimit" className="text-gray-700">
            No time limit
          </label>
        </div>

        {!noTimeLimit && (
          <>
            <label className="block mb-2 text-gray-700">
              Reminder in (minutes):
            </label>
            <select
              className="border text-gray-700 p-2 w-full mb-4 rounded"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {[1, 2, 5, 10, 15, 30, 60].map((min) => (
                <option key={min} value={min}>
                  {min} min
                </option>
              ))}
            </select>
          </>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={`px-4 py-2 rounded text-white ${
              title.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
