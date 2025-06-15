// src/pages/GoalsRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import GoalsPage from "./Goals";
// import AdvancedGoals from "./AdvancedGoals";  // TODO: Create this file later

const GoalsRouter = () => {
  const { hasAccess, loading } = useMembership();

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

  // TODO: When you create AdvancedGoals, uncomment this logic
  // // Automatically route to advanced or basic goals based on subscription
  // if (hasAccess("goal_tracking")) {
  //   console.log("🚀 Routing to Advanced Goals (Premium user)");
  //   return <AdvancedGoals />;
  // } else {
  //   console.log("🎯 Routing to Basic Goals (Free/Basic/Standard user)");
  //   return <GoalsPage />;
  // }

  // For now, always use the basic goals page
  console.log("🎯 Routing to Goals page");
  return <GoalsPage />;
};

export default GoalsRouter;
