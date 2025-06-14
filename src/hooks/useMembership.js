// src/hooks/useMembership.js
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
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error);
        setTier("free");
      } else if (data) {
        setSubscription(data);
        setTier(data.plan_tier || "free");
      } else {
        setTier("free");
      }
    } catch (error) {
      console.error("Membership fetch error:", error);
      setTier("free");
    } finally {
      setLoading(false);
    }
  };

  // Feature access matrix based on tier and add-ons
  const getFeatureAccess = () => {
    const baseFeatures = {
      free: {
        journaling: false, // 5 entries/month limit (would need entry counting logic)
        history: false, // 30-day limit (would need date filtering logic)
        analytics: false,
        advanced_analytics: false,
        goals: false,
        follow_up_prompts: false,
        voice_features: false,
        crisis_detection: true, // Always available for safety
        cycle_tracking: false, // Free only for paid members
      },
      basic: {
        journaling: true, // Unlimited
        history: true, // Full access
        analytics: true, // Basic analytics
        advanced_analytics: false,
        goals: true,
        follow_up_prompts: true,
        voice_features: false,
        crisis_detection: true,
        cycle_tracking: true, // Free for all paid members
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

    // Check for add-ons (if user has standard + advanced analytics add-on)
    if (subscription?.add_ons && Array.isArray(subscription.add_ons)) {
      if (subscription.add_ons.includes("advanced_analytics")) {
        features.advanced_analytics = true;
      }
      if (subscription.add_ons.includes("voice_features")) {
        features.voice_features = true;
      }
    }

    return features;
  };

  const hasAccess = (feature) => {
    const features = getFeatureAccess();
    return features[feature] || false;
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

  return {
    tier,
    subscription,
    loading,
    hasAccess,
    getUpgradeMessage,
    refetch: fetchMembershipData,
  };
};
