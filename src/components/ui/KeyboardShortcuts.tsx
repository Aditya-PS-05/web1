"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ["?"], description: "Show keyboard shortcuts", category: "Navigation" },
    { keys: ["Esc"], description: "Close modal/form or cancel editing", category: "Navigation" },
    { keys: ["h"], description: "Go to home/boards", category: "Navigation" },

    // Board Management
    { keys: ["n"], description: "Create new board", category: "Board Management" },
    { keys: ["l"], description: "Create new list", category: "Board Management" },
    { keys: ["c"], description: "Create new card", category: "Board Management" },

    // Card Actions
    { keys: ["Enter"], description: "Edit selected card", category: "Card Actions" },
    { keys: ["Delete"], description: "Delete selected card", category: "Card Actions" },
    { keys: ["Tab"], description: "Switch between Write and Preview in editor", category: "Card Actions" },

    // General
    { keys: ["Ctrl/Cmd", "S"], description: "Save changes", category: "General" },
    { keys: ["Ctrl/Cmd", "Z"], description: "Undo last action", category: "General" },
    { keys: ["Ctrl/Cmd", "Enter"], description: "Submit form", category: "General" },

    // Theme
    { keys: ["t"], description: "Toggle theme (light/dark/system)", category: "Theme" },
  ];

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  const renderKey = (key: string) => (
    <kbd
      key={key}
      className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
    >
      {key}
    </kbd>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border dark:border-gray-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Speed up your workflow with these handy shortcuts</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{category}</h3>
                <div className="space-y-3">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 mr-4">{shortcut.description}</span>
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>}
                              {renderKey(key)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                ?
              </kbd>{" "}
              anytime to open this help
            </p>
            <Button onClick={onClose}>Got it</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage keyboard shortcuts globally
export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      switch (event.key) {
        case "?":
          event.preventDefault();
          setShowShortcuts(true);
          break;
        case "Escape":
          if (showShortcuts) {
            event.preventDefault();
            setShowShortcuts(false);
          }
          break;
        case "h":
          if (!showShortcuts && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            window.location.href = "/";
          }
          break;
        case "t":
          if (!showShortcuts && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // Find and click theme toggle button
            const themeToggle = document.querySelector('button[title*="Switch to"]') as HTMLButtonElement;
            if (themeToggle) {
              themeToggle.click();
            }
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  return {
    showShortcuts,
    setShowShortcuts,
  };
}
