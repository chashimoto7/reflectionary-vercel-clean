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

      // Personal tier features (formerly Basic)
      case "personal_analytics":
      case "basic_analytics":
        return ["personal", "growth", "premium"].includes(tier);

      case "personal_womens_health":
      case "basic_womens_health":
        return ["personal", "growth", "premium"].includes(tier);

      case "personal_journaling":
      case "basic_journaling":
        return ["personal", "growth", "premium"].includes(tier);

      case "personal_history":
      case "basic_history":
        return ["personal", "growth", "premium"].includes(tier);

      // Growth tier features (formerly Advanced)
      case "growth_journaling":
      case "advanced_journaling":
        return ["growth", "premium"].includes(tier);

      case "growth_history":
      case "advanced_history":
        return ["growth", "premium"].includes(tier);

      case "growth_analytics":
      case "advanced_analytics":
        return ["growth", "premium"].includes(tier);

      case "growth_goals":
      case "advanced_goals":
        return ["growth", "premium"].includes(tier);

      case "growth_wellness":
      case "advanced_wellness":
        return ["growth", "premium"].includes(tier);

      case "growth_womens_health":
      case "advanced_womens_health":
        return ["growth", "premium"].includes(tier);

      case "growth_reflectionarian":
      case "advanced_reflectionarian":
        return ["growth", "premium"].includes(tier);

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
        return ["personal", "growth", "premium"].includes(tier);

      case "history":
        return ["personal", "growth", "premium"].includes(tier);

      case "analytics":
        return ["personal", "growth", "premium"].includes(tier);

      case "goals":
        return ["growth", "premium"].includes(tier);

      case "wellness":
        return ["growth", "premium"].includes(tier);

      case "womens_health":
        return ["personal", "growth", "premium"].includes(tier);

      case "reflectionarian":
        return ["growth", "premium"].includes(tier);

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
        return "Upgrade to Personal ($8/month) for analytics and women's health tracking, or higher tiers for more features!";

      case "personal":
        return "Upgrade to Growth ($28/month) for full journaling features, goals, and AI assistance!";

      case "growth":
        return "Upgrade to Premium ($38/month) for the ultimate journaling experience with all premium features!";

      default:
        return "Upgrade your membership to access this feature!";
    }
  }

  // Helper function to get tier display name
  function getTierDisplayName(tier = membershipData.tier) {
    const displayNames = {
      free: "Free",
      personal: "Personal",
      growth: "Growth",
      premium: "Premium",
      // Legacy support
      basic: "Personal",
      standard: "Growth",
      advanced: "Growth",
    };
    return displayNames[tier] || "Unknown";
  }

  // Helper function to check if user can access a specific tier's features
  function canAccessTier(targetTier) {
    const { tier } = membershipData;
    const tierOrder = ["free", "personal", "growth", "premium"];
    // Legacy mapping
    const normalizedTier = tier === "basic" ? "personal" : 
                          (tier === "standard" || tier === "advanced") ? "growth" : tier;
    const normalizedTargetTier = targetTier === "basic" ? "personal" : 
                                (targetTier === "standard" || targetTier === "advanced") ? "growth" : targetTier;
    const userTierIndex = tierOrder.indexOf(normalizedTier);
    const targetTierIndex = tierOrder.indexOf(normalizedTargetTier);

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
