"use client";

import React, { useState, useEffect } from "react";
import { LoginForm } from "@components/auth/LoginForm";
import { SignupForm } from "@components/auth/SignupForm";
import { useBoardContext } from "@contexts/BoardContext";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useBoardContext();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_USER", payload: data.user });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_USER", payload: data.user });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_USER", payload: data.user });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {isLogin ? (
          <LoginForm onLogin={handleLogin} onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSignup={handleSignup} onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
