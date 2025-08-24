// frontend/ src/pages/SettingsRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";

// Import all the settings components
import BasicSettings from "./settings/BasicSettings";
import GrowthSettings from "./settings/GrowthSettings";
import PremiumSettings from "./settings/PremiumSettings";

const SettingsRouter = () => {
  const { tier, loading } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  console.log("⚙️ SettingsRouter Debug:", { tier });

  // Route to appropriate settings experience based on tier
  switch (tier) {
    case "premium":
      console.log("🚀 Routing to Premium Settings");
      return <PremiumSettings />;

    case "growth":
      console.log("⭐ Routing to Growth Settings");
      return <GrowthSettings />;

    case "personal":
    default:
      console.log("🌱 Routing to Personal Settings");
      return <BasicSettings />;
  }
};

export default SettingsRouter;
