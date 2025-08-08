"use client";

import React from "react";
import { Button } from "@components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Page not found</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        </div>
        <div className="space-y-4">
          <Button onClick={() => (window.location.href = "/")} className="w-full">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
