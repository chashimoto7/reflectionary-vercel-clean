// frontend/ src/pages/JournalingRouter.jsx - Routes to correct journaling tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the journaling components
import PersonalJournaling from "./PersonalJournaling";
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
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Journaling");
      return <PremiumJournaling />;

    case "growth":
      console.log("⭐ Routing to Growth Journaling");
      return <GrowthJournaling />;

    case "personal":
    default:
      console.log(
        "🌱 Routing to Personal Journaling"
      );
      return <PersonalJournaling />;
  }
};

export default JournalingRouter;
