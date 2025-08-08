"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CardItem } from "@components/board/CardItem";
import { CreateCardButton } from "@components/board/CreateCardButton";
import { Button } from "@components/ui/Button";
import { useBoardContext } from "@contexts/BoardContext";
import type { List } from "@contexts/BoardContext";

interface ListColumnProps {
  list: List;
}

export function ListColumn({ list }: ListColumnProps) {
  const { dispatch } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const saveTitle = async () => {
    if (title.trim() && title !== list.title) {
      try {
        const response = await fetch(`/api/lists/${list._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: "UPDATE_LIST", payload: data.list });
        }
      } catch (error) {
        console.error("Failed to update list:", error);
      }
    }
    setIsEditing(false);
  };

  const deleteList = async () => {
    if (confirm("Are you sure you want to delete this list and all its cards?")) {
      try {
        const response = await fetch(`/api/lists/${list._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          dispatch({ type: "DELETE_LIST", payload: list._id });
        }
      } catch (error) {
        console.error("Failed to delete list:", error);
      }
    }
  };

  const createCard = async (cardTitle: string, description?: string) => {
    try {
      const response = await fetch(`/api/lists/${list._id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cardTitle, description }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "ADD_CARD", payload: data.card });
      }
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-gray-100 dark:bg-gray-900 rounded-lg p-4 w-80 flex-shrink-0 ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setTitle(list.title);
                setIsEditing(false);
              }
            }}
            className="font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-900 dark:text-white cursor-pointer flex-1"
            onClick={() => setIsEditing(true)}
            {...attributes}
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            {list.title}
          </h3>
        )}

        <Button variant="danger" size="sm" onClick={deleteList} className="ml-2 opacity-50 hover:opacity-100">
          ×
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <SortableContext items={list.cards.map((card) => card._id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem key={card._id} card={card} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-4">
        <CreateCardButton onCreateCard={createCard} />
      </div>
    </div>
  );
}
