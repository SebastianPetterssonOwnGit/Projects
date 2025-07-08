import React from "react";
import { Todo } from "../types/todo";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onClearExpired: () => void;
  onToggleTimed: (id: string, newDuration: number | null) => void;
  selectedTag: string | null;
};

export default function TodoList({
  todos,
  onDelete,
  onComplete,
  onClearExpired,
  onToggleTimed,
  selectedTag,
}: Props) {
  const filteredTodos = selectedTag
    ? todos.filter((t) => t.tags?.includes(selectedTag))
    : todos;

  const active = filteredTodos
    .filter((t) => !t.completed && !t.expired) // t = todo
    .sort((a, b) => {
      if (a.durationMinutes === null) return 1;
      if (b.durationMinutes === null) return -1;

      const aTimeLeft =
        a.createdAt + a.durationMinutes * 60 * 1000 - Date.now();
      const bTimeLeft =
        b.createdAt + b.durationMinutes * 60 * 1000 - Date.now();
      return aTimeLeft - bTimeLeft;
    });

  const expired = todos.filter((ts) => ts.expired && !ts.completed); // ts = todos

  return (
    <div className="px-6 py-4 space-y-6">
      {active.length === 0 ? (
        <p className="text-gray-400">No active todos.</p>
      ) : (
        <div className="space-y-4 text-gray-500">
          {active.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
              onComplete={onComplete}
              onToggleTimed={onToggleTimed}
            />
          ))}
        </div>
      )}

      {expired.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-red-600 font-semibold">Expired</h4>
            <button
              onClick={onClearExpired}
              className="text-sm text-red-500 hover:underline"
            >
              Clear Notice
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
