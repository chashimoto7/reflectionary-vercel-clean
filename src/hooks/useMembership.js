// src/hooks/useMembership.js - Corrected to match your existing schema
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

      case "analytics":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("analytics"))
        );

      // NEW: Advanced analytics access
      case "advanced_analytics":
        return (
          tier === "premium" || // Premium gets it included
          (tier === "standard" && features.includes("advanced_analytics")) // Standard can buy add-on
        );

      // NEW: Advanced goals access
      case "advanced_goals":
        return (
          tier === "premium" || // Premium gets it included
          (tier === "standard" && features.includes("advanced_goals")) // Standard can buy add-on
        );

      case "goals":
        return (
          tier === "standard" ||
          (tier === "standard" && features.includes("goals"))
        );

      case "follow_up_prompts":
        return ["basic", "standard", "premium"].includes(tier);

      case "cycle_tracking":
        return ["basic", "standard"].includes(tier); // Free for all paid members

      case "voice_features":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("voice_features"))
        );

      case "crisis_detection":
        return true; // Always available for safety

      case "reflectionarian":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("reflectionarian"))
        );

      default:
        console.warn(`🚨 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

    // Specific messages for advanced analytics
    if (feature === "advanced_analytics") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Premium for advanced analytics, or Standard + Advanced Analytics add-on.";
      }
      if (tier === "standard") {
        return "Add Advanced Analytics to your Standard plan for $8/month, or upgrade to Premium for full access.";
      }
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
