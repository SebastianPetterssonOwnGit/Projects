"use client";

import React from "react";

type Props = {
  allTags: string[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
};

export default function TagFilter({ allTags, selectedTag, onSelect }: Props) {
  return (
    <div className="flex gap-2 px-6 py-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-sm border ${
          selectedTag === null ? "bg-blue-500 text-white" : "text-gray-500"
        }`}
      >
        All
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`px-3 py-1 rounded-full text-sm border ${
            selectedTag === tag ? "bg-blue-500 text-white" : "text-gray-500"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
