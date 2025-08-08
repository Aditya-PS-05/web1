"use client";

import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { marked } from "marked";
import { Button } from "@components/ui/Button";
import { MarkdownEditor } from "./MarkdownEditor";
import { useBoardContext } from "@contexts/BoardContext";
import type { Card } from "@contexts/BoardContext";

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const { dispatch } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [renderedDescription, setRenderedDescription] = useState("");

  // Render markdown when card description changes
  useEffect(() => {
    if (card.description) {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      const htmlContent = marked(card.description, { async: false }) as string;
      setRenderedDescription(htmlContent);
    } else {
      setRenderedDescription("");
    }
  }, [card.description]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const saveCard = async () => {
    if (title.trim() && (title !== card.title || description !== card.description)) {
      try {
        const response = await fetch(`/api/cards/${card._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: "UPDATE_CARD", payload: data.card });
        }
      } catch (error) {
        console.error("Failed to update card:", error);
      }
    }
    setIsEditing(false);
  };

  const deleteCard = async () => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        const response = await fetch(`/api/cards/${card._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          dispatch({ type: "DELETE_CARD", payload: card._id });
        }
      } catch (error) {
        console.error("Failed to delete card:", error);
      }
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 w-80">
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 pb-2"
            placeholder="Card title"
            autoFocus
          />
          <MarkdownEditor value={description} onChange={setDescription} placeholder="Card description" className="w-full" />
          <div className="flex items-center space-x-2 pt-2">
            <Button size="sm" onClick={saveCard}>
              Save
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTitle(card.title);
                setDescription(card.description || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab hover:shadow-md transition-shadow group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isDragging ? "opacity-50 cursor-grabbing" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Card: ${card.title}${card.description ? ` - ${card.description.substring(0, 100)}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        } else if (e.key === "Delete") {
          e.preventDefault();
          deleteCard();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0" onClick={() => setIsEditing(true)} role="presentation">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{card.title}</h4>
          {renderedDescription && (
            <div
              className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: renderedDescription }}
              aria-label="Card description"
            />
          )}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            deleteCard();
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-xs"
          aria-label={`Delete card: ${card.title}`}
          title={`Delete ${card.title}`}
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Delete card</span>
        </Button>
      </div>
    </div>
  );
}
