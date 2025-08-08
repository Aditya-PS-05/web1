"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/Button";

interface CreateListButtonProps {
  onCreateList: (title: string) => Promise<void>;
}

export function CreateListButton({ onCreateList }: CreateListButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreateList(title.trim());
      setTitle("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white mb-3"
            autoFocus
          />
          <div className="flex items-center space-x-2">
            <Button type="submit" size="sm" disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Add List"}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsCreating(true)}
      variant="secondary"
      size="sm"
    >
      + Add another list
    </Button>
  );
}
