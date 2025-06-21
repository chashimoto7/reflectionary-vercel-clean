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

      // Get user profile with subscription info
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select(
          "subscription_tier, subscription_status, subscription_expires_at"
        )
        .eq("user_id", user.id)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          console.log("👤 No user profile found, creating one...");
          const { error: insertError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: user.id,
              email: user.email,
              subscription_tier: "free",
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
          }

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
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "history":
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "analytics":
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "goals":
        return ["standard", "standard_plus", "premium", "pro"].includes(tier);

      case "wellness":
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      case "womens_health":
        // Free for all paid members (Basic, Standard, Standard+, Premium, Pro)
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      // ADVANCED FEATURES
      case "advanced_history":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" && features.includes("advanced_history")) // Standard+ can pick it
        );

      case "advanced_analytics":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" && features.includes("advanced_analytics")) // Standard+ can pick it
        );

      case "advanced_goals":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" && features.includes("advanced_goals")) // Standard+ can pick it
        );

      case "advanced_wellness":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" && features.includes("advanced_wellness")) // Standard+ can pick it
        );

      case "advanced_womens_health":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" &&
            features.includes("advanced_womens_health")) // Standard+ can pick it
        );

      case "advanced_journaling":
        return (
          tier === "premium" ||
          tier === "pro" || // Premium/Pro gets it included
          (tier === "standard_plus" && features.includes("advanced_journaling")) // Standard+ can pick it
        );

      // REFLECTIONARIAN FEATURES
      case "reflectionarian":
        // Basic Reflectionarian: Standard+ and above
        return ["standard_plus", "premium", "pro"].includes(tier);

      case "advanced_reflectionarian":
        // Advanced Reflectionarian: Premium and Pro
        return ["premium", "pro"].includes(tier);

      case "pro_reflectionarian":
        // Pro Reflectionarian: Pro only
        return tier === "pro";

      // VOICE FEATURES
      case "voice_features":
        return ["premium", "pro"].includes(tier);

      // SPECIAL FEATURES
      case "crisis_detection":
        return true; // Always available for safety

      case "follow_up_prompts":
        return [
          "basic",
          "standard",
          "standard_plus",
          "premium",
          "pro",
        ].includes(tier);

      default:
        console.warn(`🚨 Unknown feature requested: ${feature}`);
        return false;
    }
  }

  function getUpgradeMessage(feature) {
    const { tier } = membershipData;

    // Specific messages for advanced features
    if (feature === "advanced_history") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced History, or Premium for full access to all advanced features.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced History as one of your 2 advanced features, or Premium for everything.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced History as one of your 2 advanced feature picks, or upgrade to Premium for all features.";
      }
    }

    if (feature === "advanced_analytics") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Analytics, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Analytics as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Analytics as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_goals") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Goals, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Goals as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Goals as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_wellness") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Wellness, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Wellness as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Wellness as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_womens_health") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Women's Health, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Women's Health as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Women's Health as one of your 2 advanced feature picks.";
      }
    }

    if (feature === "advanced_journaling") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ to pick Advanced Journaling, or Premium for full access.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ to pick Advanced Journaling as one of your 2 advanced features.";
      }
      if (tier === "standard_plus") {
        return "Add Advanced Journaling as one of your 2 advanced feature picks.";
      }
    }

    // Reflectionarian upgrade messages
    if (feature === "reflectionarian") {
      if (tier === "free" || tier === "basic") {
        return "Upgrade to Standard+ for Basic Reflectionarian, or Premium for Advanced AI features.";
      }
      if (tier === "standard") {
        return "Upgrade to Standard+ for Basic Reflectionarian, or Premium for Advanced features.";
      }
    }

    if (feature === "advanced_reflectionarian") {
      if (tier === "free" || tier === "basic" || tier === "standard") {
        return "Upgrade to Premium for Advanced Reflectionarian with full journal access and session summaries.";
      }
      if (tier === "standard_plus") {
        return "Upgrade to Premium for Advanced Reflectionarian with enhanced AI capabilities.";
      }
    }

    if (feature === "pro_reflectionarian") {
      return "Upgrade to Pro for Pro Reflectionarian with therapy-style sessions and growth timeline reviews.";
    }

    // Voice features
    if (feature === "voice_features") {
      if (
        tier === "free" ||
        tier === "basic" ||
        tier === "standard" ||
        tier === "standard_plus"
      ) {
        return "Upgrade to Premium for voice input/output features.";
      }
    }

    // Default messages by tier
    if (tier === "free") {
      return "Upgrade to Basic for full journaling features, Standard+ for advanced options, or Premium for everything!";
    }

    if (tier === "basic") {
      return "Upgrade to Standard+ to pick advanced features, or Premium for everything!";
    }

    if (tier === "standard") {
      return "Upgrade to Standard+ to pick 2 advanced features, or Premium for everything!";
    }

    if (tier === "standard_plus") {
      return "Upgrade to Premium for all advanced features, or Pro for the ultimate experience!";
    }

    if (tier === "premium") {
      return "Upgrade to Pro for the ultimate Reflectionary experience with therapy-style sessions!";
    }

    return "Upgrade your membership to access this feature!";
  }

  function getTierDisplayName(tierName) {
    const displayNames = {
      free: "Free",
      basic: "Basic",
      standard: "Standard",
      standard_plus: "Standard+",
      premium: "Premium",
      pro: "Pro",
    };
    return displayNames[tierName] || tierName;
  }

  function getTierFeatureCount(tierName) {
    const featureCounts = {
      free: "Limited access",
      basic: "Core features",
      standard: "Full standard features",
      standard_plus: "Pick 2 advanced features",
      premium: "All advanced features",
      pro: "Everything + Pro features",
    };
    return featureCounts[tierName] || "Unknown";
  }

  function canPickMoreFeatures() {
    const { tier, features } = membershipData;
    if (tier !== "standard_plus") return false;
    return features.length < 2;
  }

  function getAvailableFeaturePicks() {
    const { features } = membershipData;
    const allAdvancedFeatures = [
      "advanced_journaling",
      "advanced_history",
      "advanced_analytics",
      "advanced_goals",
      "advanced_wellness",
      "advanced_womens_health",
    ];

    return allAdvancedFeatures.filter((feature) => !features.includes(feature));
  }

  return {
    ...membershipData,
    hasAccess,
    getUpgradeMessage,
    getTierDisplayName,
    getTierFeatureCount,
    canPickMoreFeatures,
    getAvailableFeaturePicks,
    refresh: loadMembership,
    // Aliases for compatibility with existing components
    tier: membershipData.tier,
    loading: membershipData.loading,
  };
}
