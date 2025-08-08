"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@components/ui/Button";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import { useBoardContext } from "@contexts/BoardContext";

export function Header() {
  const { state, dispatch } = useBoardContext();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch({ type: "SET_USER", payload: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800" role="banner">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <Link
                href="/"
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                aria-label="BoardHub - Go to dashboard"
              >
                BoardHub
              </Link>
            </h1>
          </div>

          <nav className="flex items-center space-x-4" role="navigation" aria-label="User navigation">
            {state.user && (
              <span className="text-sm text-gray-600 dark:text-gray-300" aria-label={`Currently logged in as ${state.user.name}`}>
                Welcome, {state.user.name}
              </span>
            )}

            <ThemeToggle />

            {state.user && (
              <Button variant="secondary" size="sm" onClick={handleLogout} aria-label="Sign out of your account">
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
