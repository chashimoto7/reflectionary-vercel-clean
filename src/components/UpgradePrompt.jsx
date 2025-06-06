import React from "react";
import { Lock } from "lucide-react";

// This component appears when users try to access features above their membership level
const UpgradePrompt = ({ feature, onClose, onUpgrade, message }) => {
  const getFeatureName = (feature) => {
    const featureNames = {
      basic_journaling: "Basic Journaling",
      follow_up_prompts: "Follow-up Questions",
      full_history: "Advanced Search",
      analytics: "Analytics & Insights",
      goals: "Goal Tracking",
      reflectionarian: "The Reflectionarian",
    };
    return featureNames[feature] || feature;
  };

  const featureName = getFeatureName(feature);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Feature Locked
          </h3>
          <p className="text-gray-600 mb-6">
            {message ||
              `Your current membership level doesn't include access to ${featureName}. Upgrade your membership to unlock this feature and enhance your journaling experience.`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-medium"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
