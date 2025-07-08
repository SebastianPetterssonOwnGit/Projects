"use client";

import React from "react";

type Props = {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

export default function TagFilter({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="px-6 py-4 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full border ${
              selected
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            #{tag}
          </button>
        );
      })}
      {selectedTags.length > 0 && (
        <button
          onClick={onClearTags}
          className="ml-2 px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200"
        >
          Clear Selected Tags
        </button>
      )}
    </div>
  );
}
