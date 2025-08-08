"use client";

import React from "react";
import { KeyboardShortcuts, useKeyboardShortcuts } from "./ui/KeyboardShortcuts";

export function GlobalKeyboardShortcuts() {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  return <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />;
}
