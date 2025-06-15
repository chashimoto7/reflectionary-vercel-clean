// src/pages/GoalsRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import GoalsPage from "./Goals";
import AdvancedGoals from "./AdvancedGoals";

const GoalsRouter = () => {
  const { hasAccess, loading, tier } = useMembership();

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

  // Debug logging
  console.log("🎯 GoalsRouter Debug:", {
    tier,
    hasGoalsAccess: hasAccess("goals"),
    hasAdvancedGoalsAccess: hasAccess("advanced_goals"),
  });

  // Routing Logic:
  // 1. Check if user has access to Advanced Goals (Premium or Standard+ with advanced_goals add-on)
  // 2. If not, check if they have basic Goals access (Standard with goals add-on)
  // 3. If neither, they see the upgrade message in the basic Goals page

  if (hasAccess("advanced_goals")) {
    console.log("🚀 Routing to Advanced Goals (Premium/Standard+ user)");
    return <AdvancedGoals />;
  } else if (hasAccess("goals")) {
    console.log(
      "📊 Routing to Standard Goals (Standard user with goals add-on)"
    );
    return <GoalsPage />;
  } else {
    console.log(
      "🎯 Routing to Basic Goals (Free/Basic user - will see upgrade message)"
    );
    return <GoalsPage />;
  }
};

export default GoalsRouter;
