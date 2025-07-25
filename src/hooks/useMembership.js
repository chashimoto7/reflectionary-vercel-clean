// frontend/src/hooks/useMembership.js - Fixed version
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const [membershipData, setMembershipData] = useState({
    tier: "free", // Default to free instead of null
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadMembership();
    } else {
      setMembershipData({
        tier: "free",
        loading: false,
      });
    }
  }, [user]);

  async function loadMembership() {
    if (!user) return;

    try {
      console.log("🔍 Loading membership for user:", user.id);

      // Query by user_id column (not id column) since that's where the Supabase user ID is stored
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("user_id", user.id)
        .single();

      console.log("📋 Raw user profile data:", userData);

      if (userError) {
        if (userError.code === "PGRST116") {
          console.log("🆕 No user profile found - new user defaults to free");
        } else {
          console.error("❌ Database error loading membership:", userError);
        }

        setMembershipData({
          tier: "free",
          loading: false,
        });
        return;
      }

      // Successfully got user data - extract the tier
      const tier = userData?.subscription_tier || "free";
      console.log("🎯 Raw subscription_tier from database:", tier);

      console.log("✅ Membership loaded successfully:", { tier });

      setMembershipData({
        tier,
        loading: false,
      });
    } catch (error) {
      console.error("❌ Unexpected error loading membership:", error);
      setMembershipData({
        tier: "free",
        loading: false,
      });
    }
  }

  // Simplified access checking - just check the tier
  function hasAccess(feature) {
    const { tier } = membershipData;

    if (membershipData.loading) {
      console.log("🔐 Access denied: still loading membership data");
      return false;
    }

    console.log("🔐 Checking access:", { feature, tier });

    switch (feature) {
      // Basic features (Free tier)
      case "basic_journaling":
        return true; // Everyone gets basic journaling

      case "basic_history":
        return true; // Everyone gets basic history

      // Basic tier features
      case "basic_analytics":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      case "basic_womens_health":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      // Standard tier features
      case "standard_journaling":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_history":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_analytics":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_goals":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_wellness":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_womens_health":
        return ["standard", "advanced", "premium"].includes(tier);

      case "standard_reflectionarian":
        return ["standard", "advanced", "premium"].includes(tier);

      // Advanced tier features
      case "advanced_journaling":
        return ["advanced", "premium"].includes(tier);

      case "advanced_history":
        return ["advanced", "premium"].includes(tier);

      case "advanced_analytics":
        return ["advanced", "premium"].includes(tier);

      case "advanced_goals":
        return ["advanced", "premium"].includes(tier);

      case "advanced_wellness":
        return ["advanced", "premium"].includes(tier);

      case "advanced_womens_health":
        return ["advanced", "premium"].includes(tier);

      case "advanced_reflectionarian":
        return ["advanced", "premium"].includes(tier);

      // Premium tier features
      case "premium_journaling":
        return tier === "premium";

      case "premium_history":
        return tier === "premium";

      case "premium_analytics":
        return tier === "premium";

      case "premium_goals":
        return tier === "premium";

      case "premium_wellness":
        return tier === "premium";

      case "premium_womens_health":
        return tier === "premium";

      case "premium_reflectionarian":
        return tier === "premium";

      // Legacy support for existing feature checks
      case "crisis_detection":
        return true; // Always available for safety

      // Backward compatibility for existing code
      case "journaling":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      case "history":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      case "analytics":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      case "goals":
        return ["standard", "advanced", "premium"].includes(tier);

      case "wellness":
        return ["standard", "advanced", "premium"].includes(tier);

      case "womens_health":
        return ["basic", "standard", "advanced", "premium"].includes(tier);

      case "reflectionarian":
        return ["standard", "advanced", "premium"].includes(tier);

      default:
        console.warn(`🚨 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  // Simplified upgrade messages
  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

    // Basic upgrade messages based on current tier
    switch (tier) {
      case "free":
        return "Upgrade to Basic ($8/month) for analytics and women's health tracking, or higher tiers for more features!";

      case "basic":
        return "Upgrade to Standard ($18/month) for full journaling features, goals, and AI assistance!";

      case "standard":
        return "Upgrade to Advanced ($28/month) for advanced features and enhanced AI capabilities!";

      case "advanced":
        return "Upgrade to Premium ($38/month) for the ultimate journaling experience with all premium features!";

      default:
        return "Upgrade your membership to access this feature!";
    }
  }

  // Helper function to get tier display name
  function getTierDisplayName(tier = membershipData.tier) {
    const displayNames = {
      free: "Free",
      basic: "Basic",
      standard: "Standard",
      advanced: "Advanced",
      premium: "Premium",
    };
    return displayNames[tier] || "Unknown";
  }

  // Helper function to check if user can access a specific tier's features
  function canAccessTier(targetTier) {
    const { tier } = membershipData;
    const tierOrder = ["free", "basic", "standard", "advanced", "premium"];
    const userTierIndex = tierOrder.indexOf(tier);
    const targetTierIndex = tierOrder.indexOf(targetTier);

    return userTierIndex >= targetTierIndex;
  }

  return {
    ...membershipData,
    hasAccess,
    getUpgradeMessage,
    getTierDisplayName,
    canAccessTier,
    refresh: loadMembership,
    // Aliases for compatibility
    tier: membershipData.tier,
    loading: membershipData.loading,
  };
}
