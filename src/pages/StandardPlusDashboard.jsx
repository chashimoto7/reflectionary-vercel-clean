// src/pages/StandardPlusDashboard.jsx
import React, { useState } from "react";
import { useMembership } from "../hooks/useMembership";
import StandardPlusFeatureSelector from "../components/StandardPlusFeatureSelector";
import {
  Crown,
  Plus,
  ArrowUpRight,
  Settings,
  BookOpen,
  BarChart3,
  Target,
  Heart,
  Flower2,
  PenTool,
  Sparkles,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StandardPlusDashboard = () => {
  const {
    tier,
    selectedFeatures,
    canPickMoreFeatures,
    getAvailableFeaturePicks,
    getTierDisplayName,
    loading,
  } = useMembership();

  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const navigate = useNavigate();

  // Feature definitions (same as in selector)
  const featureDefinitions = {
    advanced_journaling: {
      name: "Advanced Journaling",
      icon: PenTool,
      description: "Folders, pinning, voice input & advanced organization",
      route: "/journal",
    },
    advanced_history: {
      name: "Advanced History",
      icon: BookOpen,
      description: "Calendar view, advanced search & audio playback",
      route: "/history",
    },
    advanced_analytics: {
      name: "Advanced Analytics",
      icon: BarChart3,
      description: "Deep insights, patterns & growth tracking",
      route: "/analytics",
    },
    advanced_goals: {
      name: "Advanced Goals",
      icon: Target,
      description: "Progress patterns, insights & goal correlation",
      route: "/goals",
    },
    advanced_wellness: {
      name: "Advanced Wellness",
      icon: Heart,
      description: "Comprehensive health tracking & correlations",
      route: "/wellness",
    },
    advanced_womens_health: {
      name: "Advanced Women's Health",
      icon: Flower2,
      description: "Cycle tracking, hormonal insights & specialized analytics",
      route: "/womens-health",
    },
  };

  const handleFeatureAdded = (featureId) => {
    // Refresh the component or show success message
    console.log(`Feature ${featureId} added successfully!`);
  };

  // Redirect if not Standard+ user
  if (tier !== "standard_plus") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Standard+ Required
          </h2>
          <p className="text-gray-600 mb-6">
            This feature management dashboard is only available for Standard+
            members.
          </p>
          <button
            onClick={() => navigate("/membership")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            View Membership Options
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your features...</p>
        </div>
      </div>
    );
  }

  const maxFeatures = 2;
  const currentCount = selectedFeatures.length;
  const remainingSelections = maxFeatures - currentCount;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Standard+ Features
            </h1>
            <p className="text-gray-600">
              Manage your advanced feature selections •{" "}
              {getTierDisplayName(tier)} Plan
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Feature Selection Progress
              </h3>
              <p className="text-gray-600">
                {currentCount} of {maxFeatures} advanced features selected
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {currentCount}/{maxFeatures}
              </div>
              <div className="text-sm text-gray-500">features</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentCount / maxFeatures) * 100}%` }}
            />
          </div>

          {remainingSelections > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                You have {remainingSelections} selection
                {remainingSelections !== 1 ? "s" : ""} remaining
              </p>
              <button
                onClick={() => setShowFeatureSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Features
              </button>
            </div>
          )}

          {remainingSelections === 0 && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-green-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">All features selected!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Features */}
      {selectedFeatures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Advanced Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {selectedFeatures.map((featureId) => {
              const feature = featureDefinitions[featureId];
              if (!feature) return null;

              const IconComponent = feature.icon;

              return (
                <div
                  key={featureId}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      <button
                        onClick={() => navigate(feature.route)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition"
                      >
                        Access Feature
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Features (if any remaining) */}
      {remainingSelections > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getAvailableFeaturePicks().map((featureId) => {
              const feature = featureDefinitions[featureId];
              if (!feature) return null;

              const IconComponent = feature.icon;

              return (
                <div
                  key={featureId}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-center">
                    <div className="p-3 bg-gray-200 rounded-lg w-fit mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {feature.description}
                    </p>
                    <button
                      onClick={() => setShowFeatureSelector(true)}
                      className="w-full px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                    >
                      Select This Feature
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Option */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              Want All Advanced Features?
            </h3>
            <p className="text-purple-100 mb-4">
              Upgrade to Premium and get access to all 6 advanced features, plus
              Advanced Reflectionarian and voice capabilities.
            </p>
            <ul className="text-purple-100 text-sm space-y-1 mb-4">
              <li>• All 6 advanced features included</li>
              <li>• Advanced Reflectionarian AI companion</li>
              <li>• Voice input and output</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">$27</div>
            <div className="text-purple-200 text-sm mb-4">per month</div>
            <button
              onClick={() => navigate("/membership")}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Need to Change Your Selections?
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Feature selections are permanent to ensure fair usage, but our
              support team can help with special circumstances.
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Feature Selector Modal */}
      <StandardPlusFeatureSelector
        isOpen={showFeatureSelector}
        onClose={() => setShowFeatureSelector(false)}
        onFeatureAdded={handleFeatureAdded}
      />
    </div>
  );
};

export default StandardPlusDashboard;
