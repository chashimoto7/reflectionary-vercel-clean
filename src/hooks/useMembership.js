// src/hooks/useMembership.js
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

      // Query by user_id column (not id column) since that's where the Supabase user ID is stored
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("user_id", user.id) // Changed from 'id' to 'user_id'
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
