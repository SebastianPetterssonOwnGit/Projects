"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TagFilter from "./components/TagFilter";
import { useTodos } from "./hooks/useTodos";
import { useTags } from "./hooks/useTags";

export default function Home() {
  const {
    todos,
    addTodo,
    removeTodo,
    markComplete,
    handleClearExpired,
    handleToggleTimed,
  } = useTodos();

  const { selectedTags, toggleTag, setSelectedTags } = useTags();
  const [showForm, setShowForm] = useState(false);

  const activeTodos = todos.filter((todo) => !todo.completed);
  const allTags = Array.from(
    new Set(
      activeTodos.flatMap((todo) => (Array.isArray(todo.tags) ? todo.tags : []))
    )
  )
    .filter(Boolean)
    .sort();

  const filteredTodos =
    selectedTags.length === 0
      ? todos
      : todos.filter((todo) =>
          selectedTags.some((tag) => todo.tags.includes(tag))
        );

  return (
    <main className="min-h-screen bg-gray-100">
      <Header onAddClick={() => setShowForm(true)} />
      {showForm && (
        <TodoForm onSubmit={addTodo} onClose={() => setShowForm(false)} />
      )}
      <TagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={() => setSelectedTags([])}
      />
      <TodoList
        todos={filteredTodos}
        onDelete={removeTodo}
        onComplete={markComplete}
        onClearExpired={handleClearExpired}
        onToggleTimed={handleToggleTimed}
      />
    </main>
  );
}
