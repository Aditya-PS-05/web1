"use client";

import { SignupForm } from "@components/auth/SignupForm";

export default function SignupPage() {
  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard on success
        window.location.href = "/";
        return { success: true };
      } else {
        return { success: false, error: data.message || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const handleToggleMode = () => {
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignupForm onSignup={handleSignup} onToggleMode={handleToggleMode} />
      </div>
    </div>
  );
}
