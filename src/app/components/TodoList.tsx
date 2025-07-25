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
  const now = new Date();

  const getTimeUntilDue = (todo: Todo) => {
    if (todo.scheduledFor) {
      return new Date(todo.scheduledFor).getTime() - now.getTime();
    } else if (todo.durationMinutes != null && !todo.completed) {
      return todo.createdAt + todo.durationMinutes * 60_000 - now.getTime();
    }
    return Infinity;
  };

  const sortedTodos = [...todos]
    .filter((t) => !t.completed && !t.expired)
    .sort((a, b) => getTimeUntilDue(a) - getTimeUntilDue(b));

  // Split todos
  const immediateTodos: Todo[] = [];
  const futureScheduledTodos: Todo[] = [];

  sortedTodos.forEach((t) => {
    if (t.scheduledFor) {
      const scheduledDate = new Date(t.scheduledFor);
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      if (scheduledDate <= endOfToday) {
        immediateTodos.push(t);
      } else {
        futureScheduledTodos.push(t);
      }
    } else {
      immediateTodos.push(t); // Timed todos (duration) or timeless
    }
  });

  // Then apply your tag-based grouping to `immediateTodos`
  const tagGroups: { [tag: string]: Todo[] } = {};
  const untagged: Todo[] = [];

  immediateTodos.forEach((todo) => {
    if (todo.tags.length === 0) {
      untagged.push(todo);
    } else {
      todo.tags.forEach((tag) => {
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(todo);
      });
    }
  });

  // Group future scheduled todos by date
  const groupedByDate = futureScheduledTodos.reduce((groups, todo) => {
    const dateKey = new Date(todo.scheduledFor!).toLocaleDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(todo);
    return groups;
  }, {} as Record<string, Todo[]>);

  // Expired and completed handling remains the same
  const expired = todos.filter((t) => t.expired && !t.completed);

  return (
    <div className="px-6 py-4 space-y-6">
      {/* 🏷️ Tag-based Todos */}
      {Object.keys(tagGroups).length > 0 && (
        <div className="space-y-6">
          {Object.entries(tagGroups).map(([tag, group]) => (
            <div key={tag}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getTagColor(tag)}`} />#
                {tag}
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
        </div>
      )}

      {/* 🗂 Uncategorized Todos */}
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

      {/* 🔕 Expired Todos */}
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

      {/* 📅 Scheduled Calendar Todos */}
      {Object.keys(groupedByDate).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-6">
          <h2 className="text-blue-700 font-semibold text-lg mb-2 flex items-center gap-2">
            📅 Scheduled Todos
          </h2>
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
                📆 {date}
              </h3>
              <div className="space-y-2">
                {items.map((todo) => (
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
        </div>
      )}
    </div>
  );
}
