// src/pages/JournalingRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import StandardJournaling from "./StandardJournaling";
import AdvancedJournaling from "./AdvancedJournaling";

const JournalingRouter = () => {
  const { hasAccess, tier, loading } = useMembership();

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

  // Premium users get the advanced journaling experience
  if (tier === "premium") {
    console.log("🚀 Routing to Advanced Journaling (Premium user)");
    return <AdvancedJournaling />;
  } else {
    console.log("📝 Routing to Standard Journaling (Free/Standard user)");
    return <StandardJournaling />;
  }
};

export default JournalingRouter;
