// frontend/ src/pages/JournalingRouter.jsx - Routes to correct journaling tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import journaling components - Personal tier removed, auto-upgraded to Growth
import GrowthJournaling from "./GrowthJournaling";
import PremiumJournaling from "./PremiumJournaling";

const JournalingRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journaling experience...</p>
        </div>
      </div>
    );
  }

  console.log("📝 JournalingRouter Debug:", { tier });

  // Route to appropriate journaling experience based on tier
  // Personal tier users are auto-upgraded to Growth
  const normalizedTier = ["personal", "basic", "standard", "advanced"].includes(tier) ? "growth" : tier;
  
  switch (normalizedTier) {
    case "premium":
      console.log("🚀 Routing to Premium Journaling");
      return <PremiumJournaling />;

    case "growth":
      console.log("⭐ Routing to Growth Journaling (includes auto-upgraded Personal users)");
      return <GrowthJournaling />;

    case "free":
    default:
      console.log("🌱 Free tier - no journaling access without upgrade");
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-12 text-center">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Journaling Available with Growth Membership
              </h1>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Start your personal growth journey with our advanced journaling platform.
                Get access to journaling and Knowledge Garden with Growth membership.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => (window.location.href = "/pricing")}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Upgrade to Growth - $15/month
                </button>
                <p className="text-sm text-gray-400">
                  🌱 Journaling + Knowledge Garden
                </p>
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default JournalingRouter;
