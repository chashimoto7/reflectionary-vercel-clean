import React from "react";
import { getFeatureName } from "../utils/featureFlags";

// This component appears when users try to access features above their membership level
const UpgradePrompt = ({ feature, onClose, onUpgrade }) => {
  const featureName = getFeatureName(feature);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Upgrade Required
        </h3>

        <p className="text-gray-600 mb-6">
          Your current membership level doesn't include access to {featureName}.
          Upgrade your membership to unlock this feature and enhance your
          journaling experience.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </button>

          <button
            onClick={onUpgrade}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
