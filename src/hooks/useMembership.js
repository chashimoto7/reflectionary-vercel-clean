// hooks/useMembership.js
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";

export function useMembership() {
  const user = useUser();
  const [membershipData, setMembershipData] = useState({
    tier: "free",
    features: [],
    loading: true,
    usageLimits: null,
    selectedFeatures: [], // For Standard+ users
  });

  useEffect(() => {
    if (user) {
      loadMembership();
    } else {
      setMembershipData({
        tier: "free",
        features: [],
        loading: false,
        usageLimits: null,
        selectedFeatures: [],
      });
    }
  }, [user]);

  async function loadMembership() {
    try {
      console.log("🔄 Loading membership for user:", user.id);

      // Get user subscription data from the updated table structure
      const { data: userData, error } = await supabase
        .from("user_subscriptions")
        .select(
          `
          plan_id,
          status,
          selected_features,
          current_period_start,
          current_period_end,
          cancel_at_period_end
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("current_period_start", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error loading subscription:", error);
        // Default to free on error
        setMembershipData({
          tier: "free",
          features: [],
          loading: false,
          usageLimits: null,
          selectedFeatures: [],
        });
        return;
      }

      // Default to free if no active subscription
      const planId = userData?.plan_id || "free";
      const selectedFeatures = userData?.selected_features || [];

      // Extract tier from plan_id (remove _monthly/_annual suffix)
      const tier =
        planId === "free" ? "free" : planId.replace(/_monthly|_annual$/, "");

      console.log("🎯 Raw subscription data:", {
        planId,
        tier,
        selectedFeatures,
      });

      // Get usage limits for Free/Basic tiers
      let usageLimits = null;
      if (tier === "free" || tier === "basic") {
        const { data: usageData, error: usageError } = await supabase.rpc(
          "get_current_month_usage",
          { user_uuid: user.id }
        );

        if (!usageError && usageData && usageData.length > 0) {
          usageLimits = usageData[0];
        }
      }

      // Build feature array based on tier and selected features
      const features = buildFeatureArray(tier, selectedFeatures);

      console.log("✅ Membership loaded successfully:", {
        tier,
        features,
        selectedFeatures,
        usageLimits,
      });

      setMembershipData({
        tier,
        features,
        selectedFeatures,
        usageLimits,
        loading: false,
      });
    } catch (error) {
      console.error("❌ Unexpected error loading membership:", error);
      setMembershipData({
        tier: "free",
        features: [],
        selectedFeatures: [],
        usageLimits: null,
        loading: false,
      });
    }
  }

  // Build feature array based on tier and selected advanced features
  function buildFeatureArray(tier, selectedFeatures = []) {
    const baseFeatures = {
      free: [
        "crisis_detection",
        "basic_journaling_restricted", // 8 entries/month, 2 prompts/month, 2 follow-ups/month
        "basic_history_restricted", // 1 month history
      ],
      basic: [
        "crisis_detection",
        "basic_journaling_limited", // Unlimited entries, 6 prompts/month, 6 follow-ups/month
        "basic_history_limited", // 1 month history
      ],
      standard: [
        "crisis_detection",
        "standard_journaling", // Unlimited everything
        "standard_history", // Full history with search/download
        "standard_goals",
        "standard_analytics",
      ],
      standard_plus: [
        "crisis_detection",
        "standard_journaling",
        "standard_history",
        "standard_goals",
        "standard_analytics",
        "basic_reflectionarian", // Basic AI companion
      ],
      premium: [
        "crisis_detection",
        "advanced_journaling", // Folders, pinning, flagging, voice
        "advanced_history", // Advanced search, calendar, audio playback
        "advanced_goals",
        "advanced_analytics",
        "advanced_wellness",
        "advanced_womens_health",
        "advanced_reflectionarian", // Advanced AI with full journal access
        "voice_features",
      ],
      pro: [
        "crisis_detection",
        "advanced_journaling",
        "advanced_history",
        "advanced_goals",
        "advanced_analytics",
        "advanced_wellness",
        "advanced_womens_health",
        "pro_reflectionarian", // Therapy-style sessions, growth timeline
        "voice_features",
        "priority_support",
      ],
    };

    let features = [...(baseFeatures[tier] || baseFeatures.free)];

    // For Standard+ users, add their selected advanced features
    if (tier === "standard_plus") {
      features = [...features, ...selectedFeatures];
    }

    return features;
  }

  // Access control function - matches revised pricing structure
  function hasAccess(feature) {
    const { tier, features, loading } = membershipData;

    if (loading) {
      console.log("🔐 Access denied: still loading membership data");
      return false;
    }

    console.log("🔐 Checking access:", { feature, tier, features });

    // Map feature requests to actual feature flags
    switch (feature) {
      // BASIC JOURNALING ACCESS
      case "journaling":
      case "basic_journaling":
        return (
          features.includes("basic_journaling_restricted") ||
          features.includes("basic_journaling_limited") ||
          features.includes("standard_journaling") ||
          features.includes("advanced_journaling")
        );

      // ADVANCED JOURNALING (folders, pinning, etc.)
      case "advanced_journaling":
        return features.includes("advanced_journaling");

      // HISTORY ACCESS
      case "history":
      case "basic_history":
        return (
          features.includes("basic_history_restricted") ||
          features.includes("basic_history_limited") ||
          features.includes("standard_history") ||
          features.includes("advanced_history")
        );

      case "advanced_history":
        return features.includes("advanced_history");

      // GOALS ACCESS
      case "goals":
      case "standard_goals":
        return features.includes("standard_goals");

      case "advanced_goals":
        return features.includes("advanced_goals");

      // ANALYTICS ACCESS
      case "analytics":
      case "standard_analytics":
        return features.includes("standard_analytics");

      case "advanced_analytics":
        return features.includes("advanced_analytics");

      // WELLNESS ACCESS
      case "wellness":
      case "basic_wellness":
        // Note: Basic wellness was not in your revised pricing doc
        // Assuming it's available for Basic+ tiers
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "advanced_wellness":
        return features.includes("advanced_wellness");

      // WOMEN'S HEALTH ACCESS
      case "womens_health":
      case "basic_womens_health":
        // Available for all paid members
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "advanced_womens_health":
        return features.includes("advanced_womens_health");

      // REFLECTIONARIAN ACCESS
      case "reflectionarian":
      case "basic_reflectionarian":
        return (
          features.includes("basic_reflectionarian") ||
          features.includes("advanced_reflectionarian") ||
          features.includes("pro_reflectionarian")
        );

      case "advanced_reflectionarian":
        return (
          features.includes("advanced_reflectionarian") ||
          features.includes("pro_reflectionarian")
        );

      case "pro_reflectionarian":
        return features.includes("pro_reflectionarian");

      // VOICE FEATURES
      case "voice_features":
        return features.includes("voice_features");

      // SUPPORT
      case "priority_support":
        return features.includes("priority_support");

      default:
        console.warn(`🔐 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  // Check if user has hit usage limits (for Free/Basic tiers)
  function hasUsageRemaining(usageType) {
    const { tier, usageLimits } = membershipData;

    // Unlimited for Standard+ tiers
    if (!["free", "basic"].includes(tier)) {
      return { hasRemaining: true, unlimited: true };
    }

    if (!usageLimits) {
      return { hasRemaining: false, error: "Usage data not available" };
    }

    switch (usageType) {
      case "journal_entries":
        if (tier === "free") {
          return {
            hasRemaining: usageLimits.entries_count < usageLimits.entries_limit,
            current: usageLimits.entries_count,
            limit: usageLimits.entries_limit,
          };
        }
        // Basic tier has unlimited entries
        return { hasRemaining: true, unlimited: true };

      case "prompts":
        const promptLimit = tier === "free" ? 2 : 6; // Basic gets 6 prompts/month
        return {
          hasRemaining: usageLimits.prompts_count < promptLimit,
          current: usageLimits.prompts_count,
          limit: promptLimit,
        };

      case "follow_ups":
        const followUpLimit = tier === "free" ? 2 : 6; // Basic gets 6 follow-ups/month
        return {
          hasRemaining: usageLimits.follow_ups_count < followUpLimit,
          current: usageLimits.follow_ups_count,
          limit: followUpLimit,
        };

      default:
        return { hasRemaining: false, error: "Unknown usage type" };
    }
  }

  // Get upgrade message based on requested feature and current tier
  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

    // Feature-specific upgrade messages
    if (feature === "advanced_history") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced History, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced History as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced History as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_analytics") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Analytics, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Analytics as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Analytics as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_goals") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Goals, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Goals as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Goals as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_wellness") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Wellness, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Wellness as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Wellness as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_womens_health") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Women's Health, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Women's Health as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Women's Health as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_journaling") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Journaling, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Journaling as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Journaling as one of your 2 advanced feature picks.";
      }
    }

    // Reflectionarian upgrade messages
    if (feature === "reflectionarian" || feature === "basic_reflectionarian") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ for Basic Reflectionarian, or Premium for Advanced AI features.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ for Basic Reflectionarian, or Premium for Advanced features.";
      }
    }

    if (feature === "advanced_reflectionarian") {
      if (tier === "free" || tier === "basic" || tier === "standard") {
        return "Upgrade to Premium for Advanced Reflectionarian with full journal access and session summaries.";
      }
      if (tier === "standard_plus") {
        return "Upgrade to Premium for Advanced Reflectionarian with enhanced AI capabilities.";
      }
    }

    if (feature === "pro_reflectionarian") {
      return "Upgrade to Pro for Pro Reflectionarian with therapy-style sessions and growth timeline reviews.";
    }

    // Voice features
    if (feature === "voice_features") {
      if (["free", "basic", "standard", "standard_plus"].includes(tier)) {
        return "Upgrade to Premium for voice input/output features.";
      }
    }

    // Default messages by tier
    if (tier === "free") {
      return "Upgrade to Basic for full journaling features, Standard+ for advanced options, or Premium for everything!";
    }

    if (tier === "basic") {
      return "Upgrade to Standard+ to pick advanced features, or Premium for everything!";
    }

    if (tier === "standard") {
      return "Upgrade to Standard+ to pick 2 advanced features, or Premium for everything!";
    }

    if (tier === "standard_plus") {
      return "Upgrade to Premium for all advanced features, or Pro for the ultimate experience!";
    }

    if (tier === "premium") {
      return "Upgrade to Pro for the ultimate Reflectionary experience with therapy-style sessions!";
    }

    return "Upgrade your membership to access this feature!";
  }

  function getTierDisplayName(tierName) {
    const displayNames = {
      free: "Free",
      basic: "Basic",
      standard: "Standard",
      standard_plus: "Standard+",
      premium: "Premium",
      pro: "Pro",
    };
    return displayNames[tierName] || tierName;
  }

  function getTierFeatureCount(tierName) {
    const featureCounts = {
      free: "Limited access",
      basic: "Core features",
      standard: "Full standard features",
      standard_plus: "Pick 2 advanced features",
      premium: "All advanced features",
      pro: "Everything + Pro features",
    };
    return featureCounts[tierName] || "Unknown";
  }

  function canPickMoreFeatures() {
    const { tier, selectedFeatures } = membershipData;
    if (tier !== "standard_plus") return false;
    return selectedFeatures.length < 2;
  }

  function getAvailableFeaturePicks() {
    const { selectedFeatures } = membershipData;
    const allAdvancedFeatures = [
      "advanced_journaling",
      "advanced_history",
      "advanced_analytics",
      "advanced_goals",
      "advanced_wellness",
      "advanced_womens_health",
    ];

    return allAdvancedFeatures.filter(
      (feature) => !selectedFeatures.includes(feature)
    );
  }

  // Function to add a selected feature for Standard+ users
  async function addSelectedFeature(feature) {
    const { tier, selectedFeatures } = membershipData;

    if (tier !== "standard_plus") {
      throw new Error("Only Standard+ users can select additional features");
    }

    if (selectedFeatures.length >= 2) {
      throw new Error("Standard+ users can only select 2 advanced features");
    }

    if (selectedFeatures.includes(feature)) {
      throw new Error("Feature already selected");
    }

    const newSelectedFeatures = [...selectedFeatures, feature];

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          selected_features: newSelectedFeatures,
          features_selected_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      // Refresh membership data
      await loadMembership();

      return { success: true };
    } catch (error) {
      console.error("Error adding selected feature:", error);
      throw error;
    }
  }

  return {
    ...membershipData,
    hasAccess,
    hasUsageRemaining,
    getUpgradeMessage,
    getTierDisplayName,
    getTierFeatureCount,
    canPickMoreFeatures,
    getAvailableFeaturePicks,
    addSelectedFeature,
    refresh: loadMembership,
    // Aliases for compatibility with existing components
    tier: membershipData.tier,
    loading: membershipData.loading,
  };
}
