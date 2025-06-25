// src/pages/WomensHealthRouter.jsx - Routes to correct women's health tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the women's health components
import BasicWomensHealth from "../components/BasicWomensHealth";
// These will be your existing components, renamed
import StandardWomensHealth from "./StandardWomensHealth"; // Current "WomensHealth" renamed
import AdvancedWomensHealth from "./AdvancedWomensHealth"; // New component to create
import PremiumWomensHealth from "./PremiumWomensHealth"; // Current "AdvancedWomensHealth" renamed

// Upgrade prompt component for users without access
const WomensHealthUpgrade = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-pink-600"
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
          Women's Health Tracking Available with Basic Membership
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Track your menstrual cycle, symptoms, and health patterns with our
          comprehensive women's health tools. Get detailed insights and
          personalized recommendations with Basic membership.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
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

const WomensHealthRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your women's health dashboard...
          </p>
        </div>
      </div>
    );
  }

  console.log("🌸 WomensHealthRouter Debug:", { tier });

  // Route to appropriate women's health experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Women's Health");
      return <PremiumWomensHealth />;

    case "advanced":
      console.log("⭐ Routing to Advanced Women's Health");
      return <AdvancedWomensHealth />;

    case "standard":
      console.log("📚 Routing to Standard Women's Health");
      return <StandardWomensHealth />;

    case "basic":
      console.log("🌸 Routing to Basic Women's Health");
      return <BasicWomensHealth />;

    case "free":
    default:
      console.log("🚫 Free tier - showing upgrade prompt for Women's Health");
      return <WomensHealthUpgrade />;
  }
};

export default WomensHealthRouter;
