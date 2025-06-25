// src/pages/JournalingRouter.jsx - Routes to correct journaling tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the journaling components
import BasicJournaling from "../components/BasicJournaling";
// These will be your existing components, renamed
import StandardJournaling from "./StandardJournaling"; // Current "JournalingPage" renamed
import AdvancedJournaling from "./AdvancedJournaling"; // New component to create
import PremiumJournaling from "./PremiumJournaling"; // Current "AdvancedJournalingPage" renamed

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
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Journaling");
      return <PremiumJournaling />;

    case "advanced":
      console.log("⭐ Routing to Advanced Journaling");
      return <AdvancedJournaling />;

    case "standard":
      console.log("📚 Routing to Standard Journaling");
      return <StandardJournaling />;

    case "basic":
      console.log(
        "🌱 Routing to Basic Journaling (same as Free for journaling)"
      );
      return <BasicJournaling />;

    case "free":
    default:
      console.log("🆓 Routing to Basic Journaling (Free tier)");
      return <BasicJournaling />;
  }
};

export default JournalingRouter;
