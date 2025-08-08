"use client";

import React, { useState, useEffect } from "react";
import { marked } from "marked";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = "Description", className = "" }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (activeTab === "preview") {
      // Configure marked for safe HTML
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      const htmlContent = marked(value || "Nothing to preview...", { async: false }) as string;
      setPreviewContent(htmlContent);
    }
  }, [value, activeTab]);

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
      {/* Tab Headers */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 text-sm font-medium rounded-tl-lg transition-colors ${
            activeTab === "write"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-blue-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-blue-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Preview
        </button>
        <div className="flex-1"></div>
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">Supports Markdown</div>
      </div>

      {/* Content Area */}
      <div className="min-h-[120px]">
        {activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${placeholder} (supports **markdown**)...`}
            className="w-full p-4 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
            style={{ minHeight: "120px" }}
          />
        ) : (
          <div className="p-4 min-h-[120px] bg-white dark:bg-gray-800 rounded-b-lg">
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        )}
      </div>

      {/* Markdown Help */}
      {activeTab === "write" && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>**bold**</span>
            <span>*italic*</span>
            <span>`code`</span>
            <span>- list</span>
            <span>## heading</span>
            <span>[link](url)</span>
          </div>
        </div>
      )}
    </div>
  );
}
