import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const [membershipData, setMembershipData] = useState({
    tier: null, // Start with null - will be determined from database
    features: [],
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadMembership();
    } else {
      // No user = free tier (correct for production)
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

      // Query specifically for subscription_tier since that's what your DB uses
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      console.log("📋 Raw user profile data:", userData);
      console.log("📋 User profile error:", userError);

      if (userError) {
        if (userError.code === "PGRST116") {
          // No profile found - this is a new user, default to free
          console.log("🆕 No user profile found - new user defaults to free");
          setMembershipData({
            tier: "free",
            features: [],
            loading: false,
          });
        } else {
          // Database error - log it but default to free for safety
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

      // Validate that we got a real tier value
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
      // On unexpected errors, default to free for safety
      setMembershipData({
        tier: "free",
        features: [],
        loading: false,
      });
    }
  }

  function hasAccess(feature) {
    const { tier, features } = membershipData;

    // If still loading, deny access for safety
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

      case "goals":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("goals"))
        );

      case "reflectionarian":
        return (
          tier === "premium" ||
          (tier === "standard" && features.includes("reflectionarian"))
        );

      default:
        return false; // Unknown features default to no access
    }
  }

  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

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
  };
}
