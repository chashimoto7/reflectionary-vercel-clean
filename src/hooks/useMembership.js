// src/hooks/useMembership.js - Updated with Advanced History access
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const [membershipData, setMembershipData] = useState({
    tier: null,
    features: [],
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadMembership();
    } else {
      setMembershipData({
        tier: "free",
        features: [],
        loading: false,
      });
    }
  }, [user]);

  async function loadMembership() {
    if (!user) return;

    try {
      console.log("🔍 Loading membership for user:", user.id);
      console.log("🔎 Looking for user profile with user_id:", user.id);

      // Query by user_id column (not id column) since that's where the Supabase user ID is stored
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("user_id", user.id)
        .single();

      console.log("📋 Raw user profile data:", userData);
      console.log("📋 User profile error:", userError);

      if (userError) {
        if (userError.code === "PGRST116") {
          console.log("🆕 No user profile found - new user defaults to free");
          setMembershipData({
            tier: "free",
            features: [],
            loading: false,
          });
        } else {
          console.error("❌ Database error loading membership:", userError);
          setMembershipData({
            tier: "free",
            features: [],
            loading: false,
          });
        }
        return;
      }

      // Successfully got user data - extract the tier
      const tier = userData?.subscription_tier;
      console.log("🎯 Raw subscription_tier from database:", tier);

      if (!tier) {
        console.warn(
          "⚠️ subscription_tier is null/undefined in database, defaulting to free"
        );
        setMembershipData({
          tier: "free",
          features: [],
          loading: false,
        });
        return;
      }

      // Get additional features for standard+ users
      const { data: featureData } = await supabase
        .from("user_feature_subscriptions")
        .select("feature_name")
        .eq("user_id", user.id)
        .eq("active", true);

      const features = featureData?.map((f) => f.feature_name) || [];

      console.log("✅ Membership loaded successfully:", { tier, features });

      setMembershipData({
        tier,
        features,
        loading: false,
      });
    } catch (error) {
      console.error("❌ Unexpected error loading membership:", error);
      setMembershipData({
        tier: "free",
        features: [],
        loading: false,
      });
    }
  }

  function hasAccess(feature) {
    const { tier, features } = membershipData;

    if (membershipData.loading) {
      console.log("🔐 Access denied: still loading membership data");
      return false;
    }

    console.log("🔐 Checking access:", { feature, tier, features });

    switch (feature) {
      case "journaling":
        return ["basic", "standard", "premium"].includes(tier);

      case "history":
        return ["basic", "standard", "premium"].includes(tier);

      // NEW: Advanced History access (Premium only)
      case "advanced_history":
        return (
          tier === "premium" || // Premium gets it included
          (tier === "standard" && features.includes("advanced_history")) // Standard can buy add-on
        );

      case "analytics":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("analytics"))
        );

      // Advanced analytics access
      case "advanced_analytics":
        return (
          tier === "premium" || // Premium gets it included
          (tier === "standard" && features.includes("advanced_analytics")) // Standard can buy add-on
        );

      case "goals":
        return (
          tier === "premium" || // Premium gets everything
          (tier === "standard" && features.includes("goals")) // Standard can buy goals add-on
        );

      case "advanced_goals":
        return (
          tier === "premium" || // Premium gets advanced version
          (tier === "standard" && features.includes("advanced_goals")) // Standard+ can upgrade to advanced
        );

      case "wellness":
        return ["basic", "standard", "premium"].includes(tier); // All paid tiers get basic wellness

      case "advanced_wellness":
        return (
          tier === "premium" || // Premium gets it included
          (tier === "standard" && features.includes("advanced_wellness")) // Standard can buy add-on
        );

      case "follow_up_prompts":
        return ["basic", "standard", "premium"].includes(tier);

      case "womens_health":
        // Free for all paid members (Basic, Standard, Premium)
        return tier !== "free";

      case "advanced_womens_health":
        // Premium only OR Standard+ with add-on
        return (
          tier === "premium" ||
          (tier === "standard_plus" &&
            features.includes("advanced_womens_health"))
        );

      case "voice_features":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("voice_features"))
        );

      case "crisis_detection":
        return true; // Always available for safety

      case "reflectionarian":
        // Standard+ with Basic Reflectionarian
        return (
          tier === "premium" || // Premium gets everything
          (tier === "standard_plus" && features.includes("reflectionarian"))
        );

      case "advanced_reflectionarian":
        // Premium only OR Standard+ with Advanced Reflectionarian add-on
        return (
          tier === "premium" || // Premium gets Advanced automatically
          (tier === "standard_plus" &&
            features.includes("advanced_reflectionarian")) // Standard+ can buy Advanced add-on
        );

      case "pro_reflectionarian":
        // Premium only - Pro Reflectionarian is Premium exclusive
        return tier === "premium";

      default:
        console.warn(`🚨 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

    // Specific messages for advanced history
    if (feature === "advanced_history") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Premium for Advanced Journal History with search, analytics, and organization features.";
      }
      if (tier === "standard") {
        return "Add Advanced History to your Standard plan, or upgrade to Premium for full access.";
      }
    }

    // Specific messages for advanced analytics
    if (feature === "advanced_analytics") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Premium for advanced analytics, or Standard + Advanced Analytics add-on.";
      }
      if (tier === "standard") {
        return "Add Advanced Analytics to your Standard plan for $8/month, or upgrade to Premium for full access.";
      }
    }

    if (feature === "reflectionarian") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to add Basic Reflectionarian, or Premium for the full AI companion experience.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ and add Basic Reflectionarian, or Premium for Advanced and Pro features.";
      }
    }

    if (feature === "advanced_reflectionarian") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Premium for Advanced Reflectionarian with full journal access and session summaries.";
      }
      if (tier === "standard" || tier === "standard_plus") {
        return "Upgrade to Premium for Advanced Reflectionarian, or add as a Standard+ add-on for $5/month.";
      }
    }

    if (feature === "pro_reflectionarian") {
      return "Upgrade to Premium for Pro Reflectionarian with therapy-style sessions and growth timeline reviews.";
    }

    // Default messages by tier
    if (tier === "free") {
      return "Upgrade to Basic for full journaling features, or Premium for everything!";
    }

    if (tier === "basic") {
      return "Upgrade to Standard to add features individually, or Premium for everything!";
    }

    if (tier === "standard") {
      return `Add ${feature} to your Standard membership or upgrade to Premium!`;
    }

    return "Upgrade your membership to access this feature!";
  }

  return {
    ...membershipData,
    hasAccess,
    getUpgradeMessage,
    refresh: loadMembership,
    // Aliases for compatibility with the new components
    tier: membershipData.tier,
    loading: membershipData.loading,
  };
}
