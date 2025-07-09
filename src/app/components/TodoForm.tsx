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
  const [showPresetEditor, setShowPresetEditor] = useState(false);

  const [presetTags, setPresetTags] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("presetTags");
      return stored
        ? JSON.parse(stored)
        : ["Home", "Work", "Health", "Errands", "Study"];
    }
    return ["Home", "Work", "Health", "Errands", "Study"];
  });
  const [newPresetInput, setNewPresetInput] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("presetTags", JSON.stringify(presetTags));
    }
  }, [presetTags]);

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

        <select
          className="border text-gray-700 p-2 w-full mb-4 rounded"
          onChange={(e) => {
            const newTag = e.target.value;
            if (newTag && !tagsInput.includes(newTag)) {
              setTagsInput((prev) => (prev ? `${prev}, ${newTag}` : newTag));
            }
            e.target.value = "";
          }}
        >
          <option value="">+ Add from preset</option>
          {presetTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <input
          className="border text-gray-500 p-2 w-full mb-4 rounded"
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <button
          onClick={() => setShowPresetEditor((prev) => !prev)}
          className="mb-4 text-sm text-blue-500 hover:underline"
        >
          {showPresetEditor ? "Hide preset tags" : "Edit preset tags"}
        </button>

        {showPresetEditor && (
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">
              Preset Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presetTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-gray-500 text-sm px-3 py-1 rounded-full"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() =>
                      setPresetTags((prev) => prev.filter((t) => t !== tag))
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label={`Remove ${tag}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPresetInput}
                onChange={(e) => setNewPresetInput(e.target.value)}
                placeholder="Add new preset"
                className="border rounded p-2 text-black flex-grow text-sm"
              />
              <button
                onClick={() => {
                  const trimmed = newPresetInput.trim();
                  if (trimmed && !presetTags.includes(trimmed)) {
                    setPresetTags([...presetTags, trimmed]);
                  }
                  setNewPresetInput("");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

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
