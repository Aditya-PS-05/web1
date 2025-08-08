"use client";

import React, { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { ListColumn } from "@components/board/ListColumn";
import { CreateListButton } from "@components/board/CreateListButton";
import { ShareButton } from "@components/board/ShareButton";
import { useBoardContext } from "@contexts/BoardContext";
import { Button } from "@components/ui/Button";
import type { List, Card } from "@contexts/BoardContext";

interface BoardViewProps {
  boardId: string;
}

export function BoardView({ boardId }: BoardViewProps) {
  const { state, dispatch } = useBoardContext();
  const [, setDraggedCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(`/api/boards/${boardId}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CURRENT_BOARD", payload: data.board });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Board not found" });
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load board" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;

    // Find the dragged card
    if (state.currentBoard) {
      for (const list of state.currentBoard.lists) {
        const card = list.cards.find((c) => c._id === cardId);
        if (card) {
          setDraggedCard(card);
          break;
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !state.currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging over a different list
    const activeList = state.currentBoard.lists.find((list) => list.cards.some((card) => card._id === activeId));
    const overList = state.currentBoard.lists.find((list) => list._id === overId || list.cards.some((card) => card._id === overId));

    if (!activeList || !overList || activeList._id === overList._id) return;

    // Move card between lists
    const draggedCard = activeList.cards.find((card) => card._id === activeId);
    if (!draggedCard) return;

    // Update the local state optimistically
    const newLists = state.currentBoard.lists.map((list) => {
      if (list._id === activeList._id) {
        return {
          ...list,
          cards: list.cards.filter((card) => card._id !== activeId),
        };
      } else if (list._id === overList._id) {
        const overCardIndex = list.cards.findIndex((card) => card._id === overId);
        const insertIndex = overCardIndex >= 0 ? overCardIndex : list.cards.length;
        const newCards = [...list.cards];
        newCards.splice(insertIndex, 0, { ...draggedCard, listId: overList._id });
        return {
          ...list,
          cards: newCards,
        };
      }
      return list;
    });

    dispatch({
      type: "SET_CURRENT_BOARD",
      payload: {
        ...state.currentBoard,
        lists: newLists,
      },
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setDraggedCard(null);

    if (!over || !state.currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Check if we're dragging a list (list IDs are in the lists array)
    const isListDrag = state.currentBoard.lists.some((list) => list._id === activeId);

    if (isListDrag) {
      // Handle list reordering
      const lists = [...state.currentBoard.lists];
      const activeIndex = lists.findIndex((list) => list._id === activeId);
      const overIndex = lists.findIndex((list) => list._id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Move the list to new position
        const [movedList] = lists.splice(activeIndex, 1);
        lists.splice(overIndex, 0, movedList);

        // Update local state immediately
        dispatch({
          type: "SET_CURRENT_BOARD",
          payload: {
            ...state.currentBoard,
            lists: lists,
          },
        });

        // Send API request to persist the change
        try {
          const listIds = lists.map((list) => list._id);
          console.log("Reordering lists:", listIds);

          const response = await fetch(`/api/boards/${boardId}/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listIds }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Reorder API failed:", errorData);
            throw new Error(errorData.message || "Failed to reorder lists");
          }

          const result = await response.json();
          console.log("Reorder successful:", result);
        } catch (error) {
          console.error("Failed to reorder lists:", error);
          // Revert on error
          fetchBoard();
        }
      }
    } else {
      // Handle card movement between lists
      const activeList = state.currentBoard.lists.find((list) => list.cards.some((card) => card._id === activeId));
      const overList = state.currentBoard.lists.find((list) => list._id === overId || list.cards.some((card) => card._id === overId));

      if (!activeList || !overList) return;

      const draggedCard = activeList.cards.find((card) => card._id === activeId);
      if (!draggedCard) return;

      // If moving within the same list, handle card reordering
      if (activeList._id === overList._id) {
        const cards = [...activeList.cards];
        const activeIndex = cards.findIndex((card) => card._id === activeId);
        const overIndex = cards.findIndex((card) => card._id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const [movedCard] = cards.splice(activeIndex, 1);
          cards.splice(overIndex, 0, movedCard);

          const newLists = state.currentBoard.lists.map((list) => {
            if (list._id === activeList._id) {
              return { ...list, cards };
            }
            return list;
          });

          dispatch({
            type: "SET_CURRENT_BOARD",
            payload: {
              ...state.currentBoard,
              lists: newLists,
            },
          });
        }
      } else {
        // Moving card between lists - this was already handled in handleDragOver
        // Just need to persist the change
        try {
          await fetch(`/api/cards/${activeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listId: overList._id,
              title: draggedCard.title,
              description: draggedCard.description,
            }),
          });
        } catch (error) {
          console.error("Failed to move card:", error);
          // Revert on error
          fetchBoard();
        }
      }
    }
  };

  const createList = async (title: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "ADD_LIST", payload: data.list });
      }
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (state.error || !state.currentBoard) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{state.error || "Board not found"}</h2>
          <Button onClick={() => (window.location.href = "/")}>Back to Boards</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-blue-50 dark:bg-black">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" id="board-title">
              {state.currentBoard.title}
            </h1>
            {state.currentBoard.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1" id="board-description">
                {state.currentBoard.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <CreateListButton onCreateList={createList} />
            <ShareButton boardId={boardId} />
            <Button variant="secondary" onClick={() => (window.location.href = "/")} aria-label="Navigate back to boards list">
              Back to Boards
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6" role="main" aria-labelledby="board-title" aria-describedby="board-description">
            <SortableContext items={state.currentBoard.lists.map((list) => list._id)} strategy={horizontalListSortingStrategy}>
              {state.currentBoard.lists.map((list: List) => (
                <ListColumn key={list._id} list={list} />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
