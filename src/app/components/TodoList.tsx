import React from "react";
import { Todo } from "../types/todo";
import TodoItem from "./TodoItem";

type Props = {
    todos: Todo[];
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
    onClearExpired: () => void;
}

export default function TodoList({ todos, onDelete, onComplete, onClearExpired }: Props){
    const active = todos.filter((t) => !t.completed && !t.expired);
    const expired = todos.filter((t) => t.expired && !t.completed);

    return(
         <div className="px-6 py-4 space-y-6">
            {active.length === 0 ? (
            <p className="text-gray-400">No active todos.</p>
        ) : (
        <div className="space-y-4 text-gray-500">
          {active.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onDelete={onDelete} onComplete={onComplete} />
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
        Clear Expired
      </button>
    </div>
    <div className="space-y-3">
      {expired.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onDelete={onDelete} onComplete={onComplete} />
      ))}
    </div>
  </div>
      )}
    </div>
    );
}