// src/hooks/useMembership.js - Debug Version
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export const useMembership = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMembershipData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMembershipData = async () => {
    try {
      console.log("🔍 Fetching membership for user:", user.id);

      // Debug: Check what's in the user_subscriptions table
      const { data: allSubs, error: allError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id);

      console.log("📊 All subscriptions for user:", allSubs);
      console.log("❌ Query error (if any):", allError);

      // Try to get active subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      console.log("✅ Active subscription data:", data);
      console.log("❌ Active subscription error:", error);

      if (error && error.code !== "PGRST116") {
        console.error("💥 Error fetching subscription:", error);
        setTier("free");
      } else if (data) {
        console.log("🎯 Found active subscription:", {
          plan_tier: data.plan_tier,
          status: data.status,
          add_ons: data.add_ons,
        });
        setSubscription(data);
        setTier(data.plan_tier || "free");
      } else {
        console.log("🚫 No active subscription found, defaulting to free");
        setTier("free");
      }
    } catch (error) {
      console.error("💥 Membership fetch error:", error);
      setTier("free");
    } finally {
      setLoading(false);
    }
  };

  // Feature access matrix based on tier and add-ons
  const getFeatureAccess = () => {
    const baseFeatures = {
      free: {
        journaling: false,
        history: false,
        analytics: false,
        advanced_analytics: false,
        goals: false,
        follow_up_prompts: false,
        voice_features: false,
        crisis_detection: true,
        cycle_tracking: false,
      },
      basic: {
        journaling: true,
        history: true,
        analytics: true,
        advanced_analytics: false,
        goals: true,
        follow_up_prompts: true,
        voice_features: false,
        crisis_detection: true,
        cycle_tracking: true,
      },
      standard: {
        journaling: true,
        history: true,
        analytics: true,
        advanced_analytics: false, // Requires add-on or premium
        goals: true,
        follow_up_prompts: true,
        voice_features: false,
        crisis_detection: true,
        cycle_tracking: true,
      },
      premium: {
        journaling: true,
        history: true,
        analytics: true,
        advanced_analytics: true, // Included in premium
        goals: true,
        follow_up_prompts: true,
        voice_features: true,
        crisis_detection: true,
        cycle_tracking: true,
      },
    };

    let features = baseFeatures[tier] || baseFeatures.free;
    console.log("🎯 Base features for tier", tier, ":", features);

    // Check for add-ons
    if (subscription?.add_ons && Array.isArray(subscription.add_ons)) {
      console.log("🔧 Checking add-ons:", subscription.add_ons);
      if (subscription.add_ons.includes("advanced_analytics")) {
        features.advanced_analytics = true;
        console.log("✅ Advanced analytics unlocked via add-on");
      }
      if (subscription.add_ons.includes("voice_features")) {
        features.voice_features = true;
        console.log("✅ Voice features unlocked via add-on");
      }
    }

    console.log("🏁 Final features:", features);
    return features;
  };

  const hasAccess = (feature) => {
    const features = getFeatureAccess();
    const access = features[feature] || false;
    console.log(`🔑 Access check for "${feature}": ${access} (tier: ${tier})`);
    return access;
  };

  const getUpgradeMessage = (feature) => {
    const messages = {
      journaling:
        "Upgrade to Basic or higher for unlimited journaling entries.",
      history: "Upgrade to Basic or higher for full journal history access.",
      analytics: "Upgrade to Basic or higher to unlock analytics insights.",
      advanced_analytics:
        tier === "standard"
          ? "Add Advanced Analytics to your Standard plan for $8/month, or upgrade to Premium for full access."
          : "Upgrade to Premium for advanced analytics, or add to Standard plan.",
      goals: "Upgrade to Basic or higher to set and track personal goals.",
      follow_up_prompts:
        "Upgrade to Basic or higher for AI follow-up questions.",
      voice_features:
        "Upgrade to Premium for voice journaling and audio playback.",
      cycle_tracking:
        "Upgrade to any paid plan for free cycle tracking support.",
    };
    return messages[feature] || "Upgrade your plan to access this feature.";
  };

  // Add some debug info to the return
  console.log("📋 useMembership returning:", {
    tier,
    loading,
    hasAccess: hasAccess("advanced_analytics"),
  });

  return {
    tier,
    subscription,
    loading,
    hasAccess,
    getUpgradeMessage,
    refetch: fetchMembershipData,
  };
};
