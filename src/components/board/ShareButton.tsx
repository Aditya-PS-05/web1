"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/Button";

interface ShareInfo {
  isPublic: boolean;
  shareSlug?: string;
  shareUrl?: string;
}

interface ShareButtonProps {
  boardId: string;
}

export function ShareButton({ boardId }: ShareButtonProps) {
  const [shareInfo, setShareInfo] = useState<ShareInfo>({ isPublic: false });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchShareInfo();
  }, [boardId]);

  const fetchShareInfo = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShareInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch share info:", error);
    }
  };

  const toggleSharing = async (action: "enable" | "disable") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareInfo({
          isPublic: data.isPublic,
          shareSlug: data.shareSlug,
          shareUrl: data.shareUrl,
        });
      }
    } catch (error) {
      console.error("Failed to toggle sharing:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareInfo.shareUrl) {
      try {
        await navigator.clipboard.writeText(shareInfo.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  if (!showModal) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setShowModal(true)} className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        <span>Share</span>
        {shareInfo.isPublic && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Board is publicly shared"></span>}
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-md w-full border dark:border-gray-800">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Board</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Public sharing</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Anyone with the link can view this board</p>
              </div>
              <Button
                onClick={() => toggleSharing(shareInfo.isPublic ? "disable" : "enable")}
                disabled={loading}
                variant={shareInfo.isPublic ? "danger" : "primary"}
                size="sm"
              >
                {loading ? "..." : shareInfo.isPublic ? "Disable" : "Enable"}
              </Button>
            </div>

            {shareInfo.isPublic && shareInfo.shareUrl && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Share link</p>
                    <p className="text-sm text-gray-900 dark:text-white font-mono truncate">{shareInfo.shareUrl}</p>
                  </div>
                  <Button onClick={copyToClipboard} size="sm" variant="secondary" className="ml-3">
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {shareInfo.isPublic && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Shared boards are read-only. Viewers cannot edit, add, or delete content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
