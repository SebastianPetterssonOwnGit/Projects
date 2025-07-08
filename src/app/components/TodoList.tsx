import React from "react";
import { Todo } from "../types/todo";
import TodoItem from "./TodoItem";

import { getTagColor } from "../utils/getTagColor";

type Props = {
  todos: Todo[];
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onClearExpired: () => void;
  onToggleTimed: (id: string, newDuration: number | null) => void;
};

export default function TodoList({
  todos,
  onDelete,
  onComplete,
  onClearExpired,
  onToggleTimed,
}: Props) {
  const active = todos.filter((t) => !t.completed && !t.expired);
  const expired = todos.filter((t) => t.expired && !t.completed);

  // 🧠 Group todos by tags
  const tagGroups: { [tag: string]: Todo[] } = {};
  const untagged: Todo[] = [];

  active.forEach((todo) => {
    if (todo.tags.length === 0) {
      untagged.push(todo);
    } else {
      todo.tags.forEach((tag) => {
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(todo);
      });
    }
  });

  return (
    <div className="px-6 py-4 space-y-6">
      {Object.keys(tagGroups).length === 0 && untagged.length === 0 ? (
        <p className="text-gray-400">No active todos.</p>
      ) : (
        <div className="space-y-6 text-gray-500">
          {/* Tag groups */}
          {Object.entries(tagGroups).map(([tag, group]) => (
            <div key={tag}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${getTagColor(tag)}`}
                  title={`Tag color for ${tag}`}
                />
                #{tag}
              </h3>

              <div className="space-y-3">
                {group.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={onDelete}
                    onComplete={onComplete}
                    onToggleTimed={onToggleTimed}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Untagged todos */}
          {untagged.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Uncategorized
              </h3>
              <div className="space-y-3">
                {untagged.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={onDelete}
                    onComplete={onComplete}
                    onToggleTimed={onToggleTimed}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expired todos */}
      {expired.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-red-600 font-semibold">Expired</h4>
            <button
              onClick={onClearExpired}
              className="text-sm text-red-500 hover:underline"
            >
              Clear Expired
            </button>
          </div>
          <div className="space-y-3">
            {expired.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDelete={onDelete}
                onComplete={onComplete}
                onToggleTimed={onToggleTimed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
