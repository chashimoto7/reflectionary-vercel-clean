// src/pages/GoalsRouter.jsx - Routes to correct goals tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the goals components
// These will be your existing components, renamed
import StandardGoals from "./StandardGoals"; // Current "GoalsPage" renamed
import AdvancedGoals from "./AdvancedGoals"; // New component to create
import PremiumGoals from "./PremiumGoals"; // Current "AdvancedGoals" renamed

// Upgrade prompt component for users without access
const GoalsUpgrade = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Goal Tracking Available with Standard Membership
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your journaling into actionable progress with comprehensive
          goal tracking. Set personal goals, track milestones, and see how your
          daily reflections connect to your bigger aspirations.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Upgrade to Standard - $20/month
          </button>
          <p className="text-sm text-gray-500">
            Or continue with Basic features for analytics and women's health
          </p>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🎯 Standard Goals
            </h3>
            <p className="text-sm text-gray-600">
              Set and track personal goals with basic progress monitoring
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              ⭐ Advanced Goals
            </h3>
            <p className="text-sm text-gray-600">
              Smart goal suggestions, milestone tracking, and journal
              integration (Advanced tier)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🏆 Premium Goals
            </h3>
            <p className="text-sm text-gray-600">
              AI-powered goal coaching and comprehensive achievement analytics
              (Premium tier)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              📊 Progress Insights
            </h3>
            <p className="text-sm text-gray-600">
              Connect your daily journaling to long-term goal achievement
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GoalsRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("🎯 GoalsRouter Debug:", { tier });

  // Route to appropriate goals experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Goals");
      return <PremiumGoals />;

    case "advanced":
      console.log("⭐ Routing to Advanced Goals");
      return <AdvancedGoals />;

    case "standard":
      console.log("🎯 Routing to Standard Goals");
      return <StandardGoals />;

    case "basic":
    case "free":
    default:
      console.log("🚫 Basic/Free tier - showing upgrade prompt for Goals");
      return <GoalsUpgrade />;
  }
};

export default GoalsRouter;
