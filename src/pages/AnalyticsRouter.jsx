// src/pages/AnalyticsRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import Analytics from "./Analytics";
import AdvancedAnalytics from "./AdvancedAnalytics";

const AnalyticsRouter = () => {
  const { hasAccess, loading } = useMembership();

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

  // Automatically route to advanced or basic analytics based on subscription
  if (hasAccess("advanced_analytics")) {
    console.log("🚀 Routing to Advanced Analytics (Premium/Standard+ user)");
    return <AdvancedAnalytics />;
  } else {
    console.log("📊 Routing to Basic Analytics (Free/Basic user)");
    return <Analytics />;
  }
};

export default AnalyticsRouter;
