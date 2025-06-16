// src/pages/WellnessRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import BasicWellness from "./BasicWellness";
import AdvancedWellness from "./AdvancedWellness";

const WellnessRouter = () => {
  const { hasAccess, loading, tier } = useMembership();

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

  // Debug logging
  console.log("🏃‍♂️ WellnessRouter Debug:", {
    tier,
    hasWellnessAccess: hasAccess("wellness"),
    hasAdvancedWellnessAccess: hasAccess("advanced_wellness"),
  });

  // Routing Logic:
  // 1. Check if user has access to Advanced Wellness (Premium or Standard+ with wellness add-on)
  // 2. If not, check if they have basic Wellness access (Standard or Basic with wellness)
  // 3. If neither, they see the upgrade message in the basic Wellness page

  if (hasAccess("advanced_wellness")) {
    console.log("🚀 Routing to Advanced Wellness (Premium/Standard+ user)");
    return <AdvancedWellness />;
  } else if (hasAccess("wellness")) {
    console.log("📊 Routing to Basic Wellness (Standard/Basic user)");
    return <BasicWellness />;
  } else {
    console.log(
      "🏃‍♂️ Routing to Basic Wellness (Free user - will see upgrade message)"
    );
    return <BasicWellness />;
  }
};

export default WellnessRouter;
