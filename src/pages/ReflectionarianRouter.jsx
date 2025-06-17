// src/pages/ReflectionarianRouter.jsx
import React from "react";
import { useMembership } from "../hooks/useMembership";
import BasicReflectionarian from "./BasicReflectionarian";
import AdvancedReflectionarian from "./AdvancedReflectionarian";
import ProReflectionarian from "./ProReflectionarian";
import { MessageCircle, Crown, Sparkles } from "lucide-react";

const ReflectionarianRouter = () => {
  const { hasAccess, tier, loading, getUpgradeMessage } = useMembership();

  // Show loading while membership is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your Reflectionarian companion...
          </p>
        </div>
      </div>
    );
  }

  // Check access and route accordingly
  if (hasAccess("reflectionarian")) {
    // Determine which tier to show based on membership
    if (tier === "premium") {
      // Premium users get Pro Reflectionarian
      console.log("🎖️ Routing to Pro Reflectionarian (Premium user)");
      return <ProReflectionarian />;
    } else if (tier === "standard" && hasAccess("advanced_reflectionarian")) {
      // Standard+ users with Advanced add-on get Advanced Reflectionarian
      console.log("⭐ Routing to Advanced Reflectionarian (Standard+ user)");
      return <AdvancedReflectionarian />;
    } else {
      // Standard and Standard+ without add-on get Basic Reflectionarian
      console.log("💫 Routing to Basic Reflectionarian (Standard user)");
      return <BasicReflectionarian />;
    }
  }

  // User doesn't have access - show upgrade message
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-purple-100">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Meet the Reflectionarian
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your AI companion for deeper self-reflection and personal growth.
            Have thoughtful conversations, get personalized insights, and
            explore your inner world with compassionate guidance.
          </p>

          {/* Features Preview */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                AI Journal Companion
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Recent Entry Awareness
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Follow-up Questions</span>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Subject-Specific Prompts
              </span>
            </div>
          </div>

          {/* Upgrade Message */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              {getUpgradeMessage("reflectionarian")}
            </p>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Upgrade to Access
          </button>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            Available with Standard membership and above
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReflectionarianRouter;
