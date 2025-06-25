// src/pages/HistoryRouter.jsx - Routes to correct history tier
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the history components
import BasicHistory from "./BasicHistory";
import StandardHistory from "./StandardHistory";
import AdvancedHistory from "./AdvancedHistory";
import PremiumHistory from "./PremiumHistory";

const HistoryRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal history...</p>
        </div>
      </div>
    );
  }

  console.log("📖 HistoryRouter Debug:", { tier });

  // Route to appropriate history experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium History");
      return <PremiumHistory />;

    case "advanced":
      console.log("⭐ Routing to Advanced History");
      return <AdvancedHistory />;

    case "standard":
      console.log("📚 Routing to Standard History");
      return <StandardHistory />;

    case "basic":
      console.log("🌱 Routing to Basic History (same as Free for history)");
      return <BasicHistory />;

    case "free":
    default:
      console.log("🆓 Routing to Basic History (Free tier)");
      return <BasicHistory />;
  }
};

export default HistoryRouter;
