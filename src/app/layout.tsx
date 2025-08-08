import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { BoardProvider } from "@contexts/BoardContext";
import { ThemeProvider } from "@contexts/ThemeContext";
import { AuthWrapper } from "@components/AuthWrapper";
import { Header } from "@components/layout/Header";
import { ErrorBoundary } from "@components/ErrorBoundary";
import { GlobalKeyboardShortcuts } from "@components/GlobalKeyboardShortcuts";

export const metadata: Metadata = {
  title: "BoardHub - Trello-style Board Manager",
  description: "A lightweight Trello-style tool where teams create boards, lists, and cards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
        <a href="#main-content" className="skip-link focus:outline-none focus:ring-2 focus:ring-blue-500">
          Skip to main content
        </a>
        <ErrorBoundary>
          <ThemeProvider>
            <BoardProvider>
              <AuthWrapper>
                <Header />
                <main id="main-content" className="min-h-screen">
                  {children}
                </main>
                <GlobalKeyboardShortcuts />
              </AuthWrapper>
            </BoardProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
