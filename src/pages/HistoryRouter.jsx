// src/pages/HistoryRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import HistoryPage from "./history";
// import AdvancedHistory from "./AdvancedHistory";  // TODO: Create this file later

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

  // TODO: When you create AdvancedHistory, uncomment this logic
  // // Automatically route to advanced or basic history based on subscription
  // if (hasAccess("full_history")) {
  //   console.log("🚀 Routing to Advanced History (Standard+ user)");
  //   return <AdvancedHistory />;
  // } else {
  //   console.log("📚 Routing to Basic History (Free/Basic user)");
  //   return <HistoryPage />;
  // }

  // For now, always use the basic history page
  console.log("📚 Routing to History page");
  return <HistoryPage />;
};

export default HistoryRouter;
