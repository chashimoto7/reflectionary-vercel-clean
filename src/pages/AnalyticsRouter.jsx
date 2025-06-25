// src/pages/AnalyticsRouter.jsx - Routes to correct analytics tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the analytics components
import BasicAnalytics from "../components/BasicAnalytics";
// These will be your existing components, renamed
import StandardAnalytics from "./StandardAnalytics"; // Current "Analytics" renamed
import AdvancedAnalytics from "./AdvancedAnalytics"; // New component to create
import PremiumAnalytics from "./PremiumAnalytics"; // Current "AdvancedAnalytics" renamed

// Upgrade prompt component for users without access
const AnalyticsUpgrade = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Analytics Available with Basic Membership
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Unlock detailed insights about your journaling patterns, word counts,
          themes, and progress tracking. Start your analytics journey with Basic
          membership for just $8/month.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Upgrade to Basic - $8/month
          </button>
          <p className="text-sm text-gray-500">
            Or continue journaling with your free account
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("📊 AnalyticsRouter Debug:", { tier });

  // Route to appropriate analytics experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Analytics");
      return <PremiumAnalytics />;

    case "advanced":
      console.log("⭐ Routing to Advanced Analytics");
      return <AdvancedAnalytics />;

    case "standard":
      console.log("📚 Routing to Standard Analytics");
      return <StandardAnalytics />;

    case "basic":
      console.log("📈 Routing to Basic Analytics");
      return <BasicAnalytics />;

    case "free":
    default:
      console.log("🚫 Free tier - showing upgrade prompt for Analytics");
      return <AnalyticsUpgrade />;
  }
};

export default AnalyticsRouter;
