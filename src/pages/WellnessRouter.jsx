// frontend/ src/pages/WellnessRouter.jsx - Routes to correct wellness tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the wellness components
// These will be your existing components, renamed
import StandardWellness from "./StandardWellness"; // Current "BasicWellness" renamed
import AdvancedWellness from "./AdvancedWellness"; // New component to create
import PremiumWellness from "./PremiumWellness"; // Current "AdvancedWellness" renamed

// Upgrade prompt component for users without access
const WellnessUpgrade = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Wellness Tracking Available with Standard Membership
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Unlock comprehensive wellness tracking including mood monitoring,
          sleep patterns, exercise logs, nutrition insights, and holistic health
          analytics. Take control of your complete well-being.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
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
              🧘 Mood & Mental Health
            </h3>
            <p className="text-sm text-gray-600">
              Track daily mood, stress levels, and mental health patterns
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              💤 Sleep Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Monitor sleep quality, duration, and patterns
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🏃‍♀️ Exercise & Activity
            </h3>
            <p className="text-sm text-gray-600">
              Log workouts, track fitness goals, and monitor activity
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🥗 Nutrition Insights
            </h3>
            <p className="text-sm text-gray-600">
              Connect eating patterns with mood and energy levels
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const WellnessRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("🏃‍♂️ WellnessRouter Debug:", { tier });

  // Route to appropriate wellness experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Wellness");
      return <PremiumWellness />;

    case "advanced":
      console.log("⭐ Routing to Advanced Wellness");
      return <AdvancedWellness />;

    case "standard":
      console.log("📚 Routing to Standard Wellness");
      return <StandardWellness />;

    case "basic":
    case "free":
    default:
      console.log("🚫 Basic/Free tier - showing upgrade prompt for Wellness");
      return <WellnessUpgrade />;
  }
};

export default WellnessRouter;
