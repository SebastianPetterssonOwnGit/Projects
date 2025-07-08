import { useState } from "react";

export function useTags() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(
      (prev) =>
        prev.includes(tag)
          ? prev.filter((t) => t !== tag) // remove if selected
          : [...prev, tag] // add if not selected
    );
  };

  return { selectedTags, toggleTag, setSelectedTags };
}
