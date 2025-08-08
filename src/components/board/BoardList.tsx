"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/Button";
import { useBoardContext } from "@contexts/BoardContext";
import type { Board } from "@contexts/BoardContext";

export function BoardList() {
  const { state, dispatch } = useBoardContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch("/api/boards");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_BOARDS", payload: data.boards });
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load boards" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBoardTitle.trim(),
          description: newBoardDescription.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "ADD_BOARD", payload: data.board });
        setNewBoardTitle("");
        setNewBoardDescription("");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setLoading(false);
    }
  };

  const openBoard = (board: Board) => {
    window.location.href = `/boards/${board._id}`;
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Boards</h1>
        <Button onClick={() => setShowCreateForm(true)}>Create New Board</Button>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={createBoard}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Board Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter board title"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter board description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Board"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {state.boards.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No boards yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first board to get started with organizing your tasks.</p>
          <Button onClick={() => setShowCreateForm(true)}>Create Your First Board</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.boards.map((board) => (
            <div
              key={board._id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openBoard(board)}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{board.title}</h3>
                {board.description && <p className="text-gray-600 dark:text-gray-400 text-sm">{board.description}</p>}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">{board.lists?.length || 0} lists</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
