// src/pages/HistoryRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import HistoryPage from "./history";
import AdvancedHistory from "./AdvancedHistory";

const HistoryRouter = () => {
  const { hasAccess, loading } = useMembership();

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

  // Automatically route to advanced or basic history based on subscription
  if (hasAccess("advanced_history")) {
    console.log("🚀 Routing to Advanced History (Premium user)");
    return <AdvancedHistory />;
  } else {
    console.log("📚 Routing to Basic History (Free/Basic/Standard user)");
    return <HistoryPage />;
  }
};

export default HistoryRouter;
