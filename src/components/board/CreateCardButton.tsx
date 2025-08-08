"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/Button";

interface CreateCardButtonProps {
  onCreateCard: (title: string, description?: string) => Promise<void>;
}

export function CreateCardButton({ onCreateCard }: CreateCardButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreateCard(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create card:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600">
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <Button type="submit" size="sm" disabled={loading || !title.trim()}>
                {loading ? "Creating..." : "Add Card"}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
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
      className="w-full border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
    >
      + Add a card
    </Button>
  );
}
