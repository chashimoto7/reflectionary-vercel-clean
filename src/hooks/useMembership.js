// src/hooks/useMembership.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useMembership() {
  const { user } = useAuth();
  const { authenticationStable } = useEncryption(); // Access the stability signal
  const [membershipData, setMembershipData] = useState({
    tier: "free",
    features: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setMembershipData({
        tier: "free",
        features: [],
        loading: false,
        error: null,
      });
      return;
    }

    // Wait for both user authentication and authentication stability
    if (user && authenticationStable) {
      fetchMembershipData();
    }
  }, [user, authenticationStable]);
}

const fetchMembershipData = async () => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] useMembership: Starting to fetch membership data for user:`,
    user?.id
  );

  try {
    setMembershipData((prev) => ({ ...prev, loading: true }));

    // Get user's base membership tier
    console.log(`[${timestamp}] useMembership: Querying user membership tier`);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("membership_tier, membership_expires_at")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error(
        `[${timestamp}] useMembership: Error fetching user data:`,
        userError
      );
      throw userError;
    }

    console.log(`[${timestamp}] useMembership: User data retrieved:`, userData);

    // Get user's individual feature subscriptions (for Standard tier)
    const { data: featureData, error: featureError } = await supabase
      .from("user_feature_subscriptions")
      .select("feature_name, active, expires_at")
      .eq("user_id", user.id)
      .eq("active", true);

    if (featureError) throw featureError;

    // Filter out expired features
    const activeFeatures =
      featureData?.filter((feature) => {
        if (!feature.expires_at) return true; // No expiry date means permanent
        return new Date(feature.expires_at) > new Date();
      }) || [];

    setMembershipData({
      tier: userData?.membership_tier || "free",
      features: activeFeatures.map((f) => f.feature_name),
      loading: false,
      error: null,
      expiresAt: userData?.membership_expires_at,
    });
  } catch (error) {
    console.error(
      `[${timestamp}] useMembership: Error in fetchMembershipData:`,
      error
    );
    setMembershipData((prev) => ({
      ...prev,
      loading: false,
      error: error.message,
    }));
  }
};

// Helper function to check if user has access to a specific feature
const hasFeatureAccess = (featureName) => {
  const { tier, features } = membershipData;

  // Premium users get everything
  if (tier === "premium") return true;

  // Check tier-specific access
  switch (featureName) {
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
};

// Helper function to get upgrade message for locked features
const getUpgradeMessage = (featureName) => {
  const { tier } = membershipData;

  if (tier === "free") {
    return "Upgrade to Basic membership to unlock full journaling features, or Premium for everything!";
  }

  if (tier === "basic") {
    return "Upgrade to Standard to add individual features, or Premium for everything!";
  }

  if (tier === "standard") {
    return `Add ${featureName} to your Standard membership or upgrade to Premium!`;
  }

  return "Upgrade your membership to access this feature!";
};

return {
  ...membershipData,
  hasFeatureAccess,
  getUpgradeMessage,
  refreshMembership: fetchMembershipData,
};
