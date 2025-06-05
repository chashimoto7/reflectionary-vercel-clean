import { useState } from "react";
import { hasFeatureAccess } from "../utils/featureFlags";

// Custom hook that manages feature access checking and upgrade prompts
export const useFeatureAccess = (userMembership) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState(null);

  // Function to check if user can access a feature, and show upgrade prompt if not
  const checkFeatureAccess = (feature, callback) => {
    const hasAccess = hasFeatureAccess(userMembership, feature);

    if (hasAccess) {
      // User has access, execute the callback function
      if (callback) callback();
      return true;
    } else {
      // User doesn't have access, show upgrade prompt
      setRequestedFeature(feature);
      setShowUpgradePrompt(true);
      return false;
    }
  };

  // Function to handle upgrade button click
  const handleUpgrade = () => {
    setShowUpgradePrompt(false);
    // Navigate to membership page - you'll implement this based on your routing
    // For now, we'll just close the modal
    window.location.href = "/membership";
  };

  // Function to close upgrade prompt
  const closeUpgradePrompt = () => {
    setShowUpgradePrompt(false);
    setRequestedFeature(null);
  };

  return {
    checkFeatureAccess,
    showUpgradePrompt,
    requestedFeature,
    handleUpgrade,
    closeUpgradePrompt,
    hasAccess: (feature) => hasFeatureAccess(userMembership, feature),
  };
};
