"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@components/ui/Button";

interface Card {
  _id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
}

interface List {
  _id: string;
  title: string;
  position: number;
  cards: Card[];
}

interface SharedBoard {
  _id: string;
  title: string;
  description?: string;
  isShared: boolean;
  isReadOnly: boolean;
  lists: List[];
  createdAt: string;
  updatedAt: string;
}

interface SharedBoardPageProps {
  params: { slug: string };
}

export default function SharedBoardPage({ params }: SharedBoardPageProps) {
  const [board, setBoard] = useState<SharedBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedBoard();
  }, [params.slug]);

  const fetchSharedBoard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${params.slug}`);

      if (response.ok) {
        const data = await response.json();
        setBoard(data.board);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Board not found");
      }
    } catch (err) {
      console.error("Failed to fetch shared board:", err);
      setError("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-black">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error === "Shared board not found or not public" ? "Board Not Found" : "Access Denied"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error === "Shared board not found or not public"
              ? "This board doesn't exist or is no longer shared publicly."
              : "Sorry, we couldn't load this shared board."}
          </p>
          <Button onClick={() => (window.location.href = "/")}>Go to BoardHub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                  BoardHub
                </Link>
              </h1>
              <span className="ml-4 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Shared Board</span>
            </div>
            <Button onClick={() => (window.location.href = "/")}>Create Your Own Board</Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{board.title}</h2>
          {board.description && <p className="text-gray-600 dark:text-gray-400">{board.description}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This is a read-only view of a shared board</p>
        </div>

        {/* Lists */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {board.lists.map((list) => (
            <div key={list._id} className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-80 max-w-80 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{list.title}</h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {list.cards.map((card) => (
                  <div key={card._id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{card.title}</h4>
                    {card.description && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{card.description}</p>}
                  </div>
                ))}

                {list.cards.length === 0 && <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">No cards in this list</div>}
              </div>
            </div>
          ))}

          {board.lists.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Empty Board</h3>
                <p className="text-gray-600 dark:text-gray-400">This shared board doesn't have any lists yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Want to create your own boards and collaborate with your team?</p>
            <Button size="lg" onClick={() => (window.location.href = "/")}>
              Get Started with BoardHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
