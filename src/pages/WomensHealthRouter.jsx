// src/pages/WomensHealthRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import WomensHealth from "./WomensHealth";
import AdvancedWomensHealth from "./AdvancedWomensHealth";

const WomensHealthRouter = () => {
  const { hasAccess, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your women's health dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Automatically route to advanced or basic women's health based on subscription
  if (hasAccess("advanced_womens_health")) {
    console.log(
      "🚀 Routing to Advanced Women's Health (Premium/Standard+ user)"
    );
    return <AdvancedWomensHealth />;
  } else {
    console.log(
      "🌸 Routing to Basic Women's Health (Free for all paid members)"
    );
    return <WomensHealth />;
  }
};

export default WomensHealthRouter;
