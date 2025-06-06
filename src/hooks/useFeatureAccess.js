import { useState } from "react";

// Updated feature access based on your Vision Board requirements
const FEATURE_ACCESS = {
  free: ["basic_journaling"], // Only basic journaling with limited prompts
  basic: ["basic_journaling", "follow_up_prompts"], // Full journaling functionality
  standard: ["basic_journaling", "follow_up_prompts", "full_history"], // Standard + history
  premium: [
    "basic_journaling",
    "follow_up_prompts",
    "full_history",
    "analytics",
    "goals",
    "reflectionarian",
  ], // Everything
};

const FEATURE_NAMES = {
  basic_journaling: "Basic Journaling",
  follow_up_prompts: "Follow-up Questions",
  full_history: "Advanced Search",
  analytics: "Analytics & Insights",
  goals: "Goal Tracking",
  reflectionarian: "The Reflectionarian",
};

// Custom hook that manages feature access checking and upgrade prompts
export const useFeatureAccess = (userMembership = "free") => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState(null);

  // Function to check if user can access a feature, and show upgrade prompt if not
  const checkFeatureAccess = (feature, callback) => {
    const membership = userMembership || "free";
    const allowedFeatures = FEATURE_ACCESS[membership] || FEATURE_ACCESS.free;
    const hasAccess = allowedFeatures.includes(feature);

    console.log("🔍 Feature access check:", {
      feature,
      membership,
      allowedFeatures,
      hasAccess,
    });

    if (hasAccess) {
      // User has access, execute the callback function immediately
      if (callback && typeof callback === "function") {
        callback();
      }
      return true;
    } else {
      // User doesn't have access, show upgrade prompt
      setRequestedFeature(feature);
      setShowUpgradePrompt(true);
      return false;
    }
  };

  // Function to check access without triggering prompts (for UI display)
  const hasAccess = (feature) => {
    const membership = userMembership || "free";
    const allowedFeatures = FEATURE_ACCESS[membership] || FEATURE_ACCESS.free;
    return allowedFeatures.includes(feature);
  };

  // Function to handle upgrade button click
  const handleUpgrade = () => {
    setShowUpgradePrompt(false);
    setRequestedFeature(null);
    // Navigate to membership page - you'll implement this based on your routing
    // For now, we'll just close the modal
    window.location.href = "/membership";
  };

  // Function to close upgrade prompt
  const closeUpgradePrompt = () => {
    setShowUpgradePrompt(false);
    setRequestedFeature(null);
  };

  // Get user-friendly feature name
  const getFeatureName = (feature) => {
    return FEATURE_NAMES[feature] || feature;
  };

  // Get upgrade message based on current tier and requested feature
  const getUpgradeMessage = () => {
    if (!requestedFeature) return "";

    const featureName = getFeatureName(requestedFeature);
    const membership = userMembership || "free";

    switch (membership) {
      case "free":
        return `Upgrade to Basic or higher to access ${featureName}. Basic members get full journaling features including follow-up questions!`;
      case "basic":
        return `Upgrade to Standard to access ${featureName} and advanced history features, or Premium for everything!`;
      case "standard":
        return `Upgrade to Premium to access ${featureName} and all other premium features!`;
      default:
        return `Upgrade your membership to access ${featureName}!`;
    }
  };

  return {
    checkFeatureAccess,
    hasAccess,
    showUpgradePrompt,
    requestedFeature,
    handleUpgrade,
    closeUpgradePrompt,
    getFeatureName,
    getUpgradeMessage,
  };
};
