// frontend/ src/pages/ReflectionarianRouter.jsx - Premium-only Reflectionarian access
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import Reflectionarian component - Now Premium-only
import PremiumReflectionarian from "./PremiumReflectionarian";

// Upgrade prompt component for users without access
const ReflectionarianUpgrade = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Meet Your AI Reflectionarian with Premium Membership
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Unlock your personal AI companion for deep psychological insights,
          therapy-style conversations, and comprehensive growth analysis.
          Transform your journaling into profound self-discovery.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Upgrade to Premium - $25/month
          </button>
          <p className="text-sm text-gray-500">
            Or continue with Growth features for journaling and Knowledge Garden
          </p>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🤖 AI Conversations
            </h3>
            <p className="text-sm text-gray-600">
              Deep, therapy-style conversations with advanced psychological understanding
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🧠 Pattern Recognition
            </h3>
            <p className="text-sm text-gray-600">
              Identify emotional patterns, triggers, and breakthrough moments
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              📊 Growth Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Comprehensive timeline reviews and personal development insights
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🎯 Personalized Coaching
            </h3>
            <p className="text-sm text-gray-600">
              Tailored reflection prompts and guidance for continuous growth
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReflectionarianRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Reflectionarian...</p>
        </div>
      </div>
    );
  }

  console.log("🤖 ReflectionarianRouter Debug:", { tier });

  // Reflectionarian is now Premium-only
  // Personal tier users are auto-upgraded to Growth, so normalize tier
  const normalizedTier = ["personal", "basic", "standard", "advanced"].includes(tier) ? "growth" : tier;
  
  switch (normalizedTier) {
    case "premium":
      console.log(
        "🚀 Routing to Premium Reflectionarian (therapy-style sessions)"
      );
      return <PremiumReflectionarian />;

    case "growth":
    case "free":
    default:
      console.log(
        "🚫 Non-Premium tier - showing upgrade prompt for Reflectionarian"
      );
      return <ReflectionarianUpgrade />;
  }
};

export default ReflectionarianRouter;
