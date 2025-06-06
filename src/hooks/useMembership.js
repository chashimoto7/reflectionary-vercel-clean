// src/hooks/useMembership.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const [membershipData, setMembershipData] = useState({
    tier: "free",
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
      // Get user's membership tier
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("membership_tier")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error loading membership:", userError);
        setMembershipData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Get any additional features for standard tier
      const { data: featureData } = await supabase
        .from("user_feature_subscriptions")
        .select("feature_name")
        .eq("user_id", user.id)
        .eq("active", true);

      const features = featureData?.map((f) => f.feature_name) || [];

      setMembershipData({
        tier: userData?.membership_tier || "free",
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
