"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";
import TagFilter from "./components/TagFilter";

export default function Home() {
  const {
    todos,
    addTodo,
    removeTodo,
    markComplete,
    handleClearExpired,
    handleToggleTimed,
  } = useTodos();
  const [showForm, setShowForm] = useState(false);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(todos.flatMap((todo) => todo.tags ?? []))
  ).sort();

  return (
    <main className="min-h-screen bg-gray-100">
      <Header onAddClick={() => setShowForm(true)} />
      {showForm && (
        <TodoForm onSubmit={addTodo} onClose={() => setShowForm(false)} />
      )}
      <TagFilter
        allTags={allTags}
        selectedTag={selectedTag}
        onSelect={setSelectedTag}
      />
      <TodoList
        todos={todos}
        onDelete={removeTodo}
        onComplete={markComplete}
        onClearExpired={handleClearExpired}
        onToggleTimed={handleToggleTimed}
        selectedTag={selectedTag}
      />
    </main>
  );
}
