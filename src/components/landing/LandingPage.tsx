"use client";

import React from "react";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { Button } from "@components/ui/Button";

export function LandingPage() {
  const handleGetStarted = () => {
    // Navigate to signup or login page
    window.location.href = "/auth/signup";
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to transform your workflow?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using BoardHub to organize their work and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={handleGetStarted}
            >
              Start Your Free Trial
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Watch Demo
            </Button>
          </div>
          <p className="mt-6 text-blue-200 text-sm">No credit card required • Free forever for personal use • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}
