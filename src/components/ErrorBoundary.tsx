"use client";

import React from "react";
import { Button } from "@components/ui/Button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to logging service
      this.logError(error, errorInfo);
    }
  }

  logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Simple error logging - in production, send to service like Sentry
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error("Error logged:", errorLog);

    // Store in localStorage as fallback
    try {
      const existingLogs = JSON.parse(localStorage.getItem("error-logs") || "[]");
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem("error-logs", JSON.stringify(recentLogs));
    } catch (e) {
      console.error("Failed to store error log:", e);
    }
  };

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Something went wrong</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>
              {this.state.error && process.env.NODE_ENV === "development" && (
                <details className="mt-4 text-left bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <summary className="cursor-pointer text-red-800 dark:text-red-200 font-medium">Error Details (Development)</summary>
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto">{this.state.error.stack}</pre>
                </details>
              )}
            </div>
            <div className="space-y-4">
              <Button onClick={this.resetError} className="w-full">
                Try Again
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const logError = React.useCallback((error: Error, errorInfo?: unknown) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo);

    if (process.env.NODE_ENV === "production") {
      // Log to external service
      const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        additionalInfo: errorInfo,
      };

      console.error("Error logged:", errorLog);

      try {
        const existingLogs = JSON.parse(localStorage.getItem("error-logs") || "[]");
        existingLogs.push(errorLog);
        const recentLogs = existingLogs.slice(-10);
        localStorage.setItem("error-logs", JSON.stringify(recentLogs));
      } catch (e) {
        console.error("Failed to store error log:", e);
      }
    }

    setError(error);
  }, []);

  return { error, logError, resetError };
}
