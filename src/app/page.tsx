"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TagFilter from "./components/TagFilter";
import { useTodos } from "./hooks/useTodos";
import { useTags } from "./hooks/";

export default function Home() {
  const {
    todos,
    addTodo,
    removeTodo,
    markComplete,
    handleClearExpired,
    handleToggleTimed,
  } = useTodos();

  const { selectedTags, toggleTag } = useTags();
  const [showForm, setShowForm] = useState(false);

  const allTags = Array.from(
    new Set(todos.flatMap((todo) => todo.tags))
  ).sort();

  const filteredTodos =
    selectedTags.length === 0
      ? todos
      : todos.filter((todo) =>
          selectedTags.every((tag) => todo.tags.includes(tag))
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
      />
      <TodoList
        todos={todos}
        onDelete={removeTodo}
        onComplete={markComplete}
        onClearExpired={handleClearExpired}
        onToggleTimed={handleToggleTimed}
      />
    </main>
  );
}
