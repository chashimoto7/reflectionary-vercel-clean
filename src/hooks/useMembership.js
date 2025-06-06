// src/hooks/useMembership.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const [membershipData, setMembershipData] = useState({
    tier: "free", // This is just the initial state - gets updated from database
    features: [],
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadMembership();
    } else {
      // Reset to free when no user
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

      // Get user's subscription tier from user_profiles
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      console.log("📋 User profile data:", userData);
      console.log("❌ User profile error:", userError);

      if (userError) {
        console.error("Error loading membership:", userError);
        setMembershipData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Also check the user_subscriptions table for additional verification
      const { data: subscriptionData, error: subError } = await supabase
        .from("user_subscriptions")
        .select(
          `
          status,
          plan_id,
          subscription_plans(name, features)
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      console.log("📋 Subscription data:", subscriptionData);

      // Get any additional features for standard tier
      const { data: featureData } = await supabase
        .from("user_feature_subscriptions")
        .select("feature_name")
        .eq("user_id", user.id)
        .eq("active", true);

      const features = featureData?.map((f) => f.feature_name) || [];

      // Use subscription_tier from profile, fallback to subscription plan name
      const tier =
        userData?.subscription_tier ||
        subscriptionData?.subscription_plans?.name ||
        "free";

      console.log("✅ Final membership data:", { tier, features });

      setMembershipData({
        tier,
        features,
        loading: false,
      });
    } catch (error) {
      console.error("Membership loading error:", error);
      setMembershipData((prev) => ({ ...prev, loading: false }));
    }
  }

  function hasAccess(feature) {
    const { tier, features } = membershipData;

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
        return false;
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
