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

    // Normalize legacy tiers for backwards compatibility
    const normalizedTier = tier === "personal" ? "growth" : tier;

    switch (feature) {
      // Basic features (Free tier)
      case "basic_journaling":
        return true; // Everyone gets basic journaling

      case "basic_history":
        return true; // Everyone gets basic history

      // Growth tier features ($15/month) - Journaling + Knowledge Garden
      case "growth_journaling":
      case "advanced_journaling":
      case "journaling":
        return ["growth", "premium"].includes(normalizedTier);

      case "growth_history":
      case "advanced_history":
      case "history":
        return ["growth", "premium"].includes(normalizedTier);

      case "knowledge_garden":
        return ["growth", "premium"].includes(normalizedTier);

      // Premium tier features ($25/month) - Everything Growth has + Reflectionarian
      case "premium_journaling":
        return tier === "premium";

      case "premium_history":
        return tier === "premium";

      case "premium_reflectionarian":
      case "reflectionarian":
        return tier === "premium";

      // REMOVED FEATURES - No longer accessible to any tier
      case "analytics":
      case "growth_analytics":
      case "advanced_analytics":
      case "premium_analytics":
      case "personal_analytics":
      case "basic_analytics":
        return false; // Analytics removed

      case "goals":
      case "growth_goals":
      case "advanced_goals":
      case "premium_goals":
        return false; // Goals removed

      case "wellness":
      case "growth_wellness":
      case "advanced_wellness":
      case "premium_wellness":
        return false; // Wellness removed

      case "womens_health":
      case "growth_womens_health":
      case "advanced_womens_health":
      case "premium_womens_health":
      case "personal_womens_health":
      case "basic_womens_health":
        return false; // Women's Health removed

      // Legacy support for existing feature checks
      case "crisis_detection":
        return true; // Always available for safety

      // Legacy tier mapping (auto-upgrade Personal to Growth)
      case "personal_journaling":
      case "personal_history":
        return ["growth", "premium"].includes(normalizedTier);

      case "growth_reflectionarian":
      case "advanced_reflectionarian":
        return tier === "premium"; // Moved to Premium only

      default:
        console.warn(`🚨 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  // Simplified upgrade messages
  function getUpgradeMessage(feature) {
    const { tier } = membershipData;
    const normalizedTier = tier === "personal" ? "growth" : tier;

    // Basic upgrade messages based on current tier
    switch (normalizedTier) {
      case "free":
        return "Upgrade to Growth ($15/month) for journaling and Knowledge Garden features!";

      case "growth":
        return "Upgrade to Premium ($25/month) for full access including Reflectionarian AI coaching!";

      default:
        return "Upgrade your membership to access this feature!";
    }
  }

  // Helper function to get tier display name
  function getTierDisplayName(tier = membershipData.tier) {
    const displayNames = {
      free: "Free",
      growth: "Growth",
      premium: "Premium",
      // Legacy support - Personal users are auto-upgraded to Growth
      personal: "Growth",
      basic: "Growth",
      standard: "Growth",
      advanced: "Growth",
    };
    return displayNames[tier] || "Unknown";
  }

  // Helper function to check if user can access a specific tier's features
  function canAccessTier(targetTier) {
    const { tier } = membershipData;
    const tierOrder = ["free", "growth", "premium"];
    // Legacy mapping - Personal users are treated as Growth
    const normalizedTier = ["personal", "basic", "standard", "advanced"].includes(tier) ? "growth" : tier;
    const normalizedTargetTier = ["personal", "basic", "standard", "advanced"].includes(targetTier) ? "growth" : targetTier;
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
