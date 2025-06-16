// This file manages what features users can access based on their membership level

// Define all possible features in your app
export const FEATURES = {
  BASIC_JOURNALING: "basic_journaling",
  CUSTOM_PROMPTS: "custom_prompts",
  FOLLOW_UP_PROMPTS: "follow_up_prompts",
  FULL_HISTORY_SEARCH: "full_history_search",
  ANALYTICS: "analytics",
  GOAL_TRACKING: "goal_tracking",
  REFLECTIONARIAN: "reflectionarian",
  AUDIO_PLAYBACK: "audio_playback",
  DATA_EXPORT: "data_export",
  ADVANCED_HISTORY: "advanced_history",
};

// Define what each membership level can access
export const MEMBERSHIP_FEATURES = {
  free: [
    FEATURES.BASIC_JOURNALING, // Only basic journaling with limited prompts
  ],

  basic: [
    FEATURES.BASIC_JOURNALING,
    FEATURES.CUSTOM_PROMPTS,
    FEATURES.FOLLOW_UP_PROMPTS,
  ],

  standard: [
    FEATURES.BASIC_JOURNALING,
    FEATURES.CUSTOM_PROMPTS,
    FEATURES.FOLLOW_UP_PROMPTS,
    FEATURES.FULL_HISTORY_SEARCH,
    FEATURES.DATA_EXPORT,
  ],

  premium: [
    // Premium gets everything
    FEATURES.ADVANCED_HISTORY,
  ],
};

// The main function that checks if a user can access a feature
export const hasFeatureAccess = (userMembership, feature) => {
  // Only default to free if userMembership is truly undefined/null
  const membership =
    userMembership !== undefined && userMembership !== null
      ? userMembership
      : "free";

  // Check if the user's membership level includes this feature
  const allowedFeatures =
    MEMBERSHIP_FEATURES[membership] || MEMBERSHIP_FEATURES.free;
  return allowedFeatures.includes(feature);
};

// Helper function to get all features a user has access to
export const getUserFeatures = (userMembership) => {
  const membership =
    userMembership !== undefined && userMembership !== null
      ? userMembership
      : "free";
  return MEMBERSHIP_FEATURES[membership] || MEMBERSHIP_FEATURES.free;
};

// Function to get a user-friendly name for features (for upgrade messages)
export const getFeatureName = (feature) => {
  const featureNames = {
    [FEATURES.BASIC_JOURNALING]: "Basic Journaling",
    [FEATURES.CUSTOM_PROMPTS]: "Custom Prompts",
    [FEATURES.FOLLOW_UP_PROMPTS]: "Follow-up Questions",
    [FEATURES.FULL_HISTORY_SEARCH]: "Advanced Search",
    [FEATURES.ANALYTICS]: "Analytics & Insights",
    [FEATURES.GOAL_TRACKING]: "Goal Tracking",
    [FEATURES.REFLECTIONARIAN]: "The Reflectionarian",
    [FEATURES.AUDIO_PLAYBOOK]: "Audio Playback",
    [FEATURES.DATA_EXPORT]: "Data Export",
  };

  return featureNames[feature] || feature;
};

export const FEATURE_FLAGS = {
  ANALYTICS_DASHBOARD: {
    free: false,
    basic: false,
    standard: false,
    premium: true,
  },
};

// Enhanced functions for prompt eligibility
export const checkPromptEligibility = async (
  userMembership,
  promptUsageService,
  userId
) => {
  // Paid users get unlimited prompts
  if (hasFeatureAccess(userMembership, FEATURES.CUSTOM_PROMPTS)) {
    return {
      canUsePrompt: true,
      reason: "unlimited",
      promptsRemaining: "unlimited",
    };
  }

  // Free users need to check their usage limits
  try {
    const eligibility = await promptUsageService.getPromptEligibility(userId);

    if (eligibility.canUseWeeklyPrompt) {
      return {
        canUsePrompt: true,
        reason: "weekly_available",
        promptsRemaining: 1,
        additionalInfo: eligibility,
      };
    }

    return {
      canUsePrompt: false,
      reason: "limits_exceeded",
      promptsRemaining: 0,
      additionalInfo: eligibility,
    };
  } catch (error) {
    console.error("Error checking prompt eligibility:", error);
    return {
      canUsePrompt: false,
      reason: "error",
      promptsRemaining: 0,
    };
  }
};

export const getPromptAvailabilityMessage = (eligibilityResult) => {
  const { canUsePrompt, reason, additionalInfo } = eligibilityResult;

  if (canUsePrompt) {
    if (reason === "unlimited") {
      return "Generate as many prompts as you like with your membership!";
    }
    if (reason === "weekly_available") {
      return "You have your weekly free prompt available.";
    }
  } else {
    if (additionalInfo) {
      const { entriesNeededForBonus } = additionalInfo;
      if (entriesNeededForBonus > 0) {
        return `You've used your weekly prompt. Write ${entriesNeededForBonus} more journal ${
          entriesNeededForBonus === 1 ? "entry" : "entries"
        } this week to earn a bonus prompt!`;
      }
    }
    return "You've used your weekly prompt. Upgrade for unlimited access or wait until next week.";
  }

  return "";
};
