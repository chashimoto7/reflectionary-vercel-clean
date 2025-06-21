// src/components/StandardPlusFeatureSelector.jsx
import React, { useState, useEffect } from "react";
import { useMembership } from "../hooks/useMembership";
import {
  BookOpen,
  BarChart3,
  Target,
  Heart,
  Flower2,
  PenTool,
  Check,
  Star,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";

const StandardPlusFeatureSelector = ({ isOpen, onClose, onFeatureAdded }) => {
  const {
    tier,
    selectedFeatures,
    canPickMoreFeatures,
    getAvailableFeaturePicks,
    addSelectedFeature,
    loading,
  } = useMembership();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedForAddition, setSelectedForAddition] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Feature definitions with descriptions and benefits
  const featureDefinitions = {
    advanced_journaling: {
      name: "Advanced Journaling",
      icon: PenTool,
      shortDesc: "Folders, pinning, voice input & advanced organization",
      benefits: [
        "Create custom folders to organize entries by theme",
        "Pin important entries to continue conversations later",
        "Star entries for quick access and review",
        "Voice-to-text journaling for hands-free writing",
        "Advanced entry flagging and categorization",
      ],
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    advanced_history: {
      name: "Advanced History",
      icon: BookOpen,
      shortDesc: "Calendar view, advanced search & audio playback",
      benefits: [
        "Calendar view with mood and theme indicators",
        "Search by folder, mood, topic, and date ranges",
        "Audio playback of your journal entries",
        "Advanced filtering and sorting options",
        "Entry timeline and pattern visualization",
      ],
      color: "bg-green-500",
      lightColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    advanced_analytics: {
      name: "Advanced Analytics",
      icon: BarChart3,
      shortDesc: "Deep insights, patterns & growth tracking",
      benefits: [
        "Mood correlation analysis and trends",
        "Writing pattern recognition and insights",
        "Personal growth metrics and timelines",
        "Goal achievement correlation analysis",
        "Reflectionarian conversation analytics",
      ],
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    advanced_goals: {
      name: "Advanced Goals",
      icon: Target,
      shortDesc: "Progress patterns, insights & goal correlation",
      benefits: [
        "Goal completion patterns and trend analysis",
        "Mood correlation with goal progress",
        "Goal plateau detection with suggestions",
        "Multi-goal comparison and priority insights",
        "Journal entry mentions and goal timeline",
      ],
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    advanced_wellness: {
      name: "Advanced Wellness",
      icon: Heart,
      shortDesc: "Comprehensive health tracking & correlations",
      benefits: [
        "Advanced wellness metrics and correlations",
        "Health pattern recognition across multiple factors",
        "Wellness goal integration and tracking",
        "Mood-health correlation insights",
        "Comprehensive wellness dashboard",
      ],
      color: "bg-red-500",
      lightColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    advanced_womens_health: {
      name: "Advanced Women's Health",
      icon: Flower2,
      shortDesc: "Cycle tracking, hormonal insights & specialized analytics",
      benefits: [
        "Menstrual cycle tracking and predictions",
        "Hormonal pattern correlation with mood and energy",
        "Fertility awareness and insights",
        "Specialized women's health analytics",
        "Personalized health recommendations",
      ],
      color: "bg-pink-500",
      lightColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
  };

  const availableFeatures = getAvailableFeaturePicks();
  const maxFeatures = 2;
  const currentCount = selectedFeatures.length;

  const handleFeatureSelect = (featureId) => {
    setSelectedForAddition(featureId);
    setShowConfirmation(true);
  };

  const confirmFeatureAddition = async () => {
    if (!selectedForAddition) return;

    try {
      setIsSelecting(true);
      await addSelectedFeature(selectedForAddition);

      // Call callback if provided
      if (onFeatureAdded) {
        onFeatureAdded(selectedForAddition);
      }

      setShowConfirmation(false);
      setSelectedForAddition(null);

      // Close modal if they've selected both features
      if (currentCount + 1 >= maxFeatures) {
        setTimeout(() => {
          onClose && onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      alert("Failed to add feature. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  const cancelSelection = () => {
    setShowConfirmation(false);
    setSelectedForAddition(null);
  };

  // Don't show for non-Standard+ users
  if (tier !== "standard_plus") {
    return null;
  }

  // Don't show if already selected max features
  if (!canPickMoreFeatures()) {
    return null;
  }

  if (!isOpen) return null;

  const FeatureCard = ({ featureId, feature, isSelected }) => {
    const IconComponent = feature.icon;

    return (
      <div
        className={`
          relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${
            isSelected
              ? `${feature.borderColor} ${feature.lightColor} ring-2 ring-purple-500 ring-opacity-50`
              : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
          }
        `}
        onClick={() => handleFeatureSelect(featureId)}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg ${feature.color}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {feature.name}
            </h3>
            <p className="text-sm text-gray-600">{feature.shortDesc}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Key Benefits:
          </h4>
          <ul className="space-y-1">
            {feature.benefits.slice(0, 3).map((benefit, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
            {feature.benefits.length > 3 && (
              <li className="text-sm text-purple-600 font-medium">
                +{feature.benefits.length - 3} more benefits
              </li>
            )}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Click to select</span>
            <ArrowRight className="w-4 h-4 text-purple-500" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Choose Your Advanced Features
                </h2>
                <p className="text-gray-600">
                  Standard+ Plan • Select {maxFeatures - currentCount} more
                  feature{maxFeatures - currentCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <span className="sr-only">Close</span>✕
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {currentCount}/{maxFeatures} features selected
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentCount / maxFeatures) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Currently selected features */}
          {selectedFeatures.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Selected Features
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedFeatures.map((featureId) => {
                  const feature = featureDefinitions[featureId];
                  if (!feature) return null;

                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={featureId}
                      className={`p-4 rounded-lg border ${feature.borderColor} ${feature.lightColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${feature.color}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {feature.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {feature.shortDesc}
                          </p>
                        </div>
                        <Check className="w-5 h-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available features to select */}
          {availableFeatures.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Available Advanced Features
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {availableFeatures.map((featureId) => (
                  <FeatureCard
                    key={featureId}
                    featureId={featureId}
                    feature={featureDefinitions[featureId]}
                    isSelected={selectedForAddition === featureId}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Set! 🎉
              </h3>
              <p className="text-gray-600">
                You've selected all your Standard+ advanced features. Enjoy
                exploring!
              </p>
            </div>
          )}

          {/* Info section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">Good to know:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>
                    • You can change your selections by contacting support
                  </li>
                  <li>
                    • Upgrade to Premium anytime for all advanced features
                  </li>
                  <li>• Your selections are saved automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedForAddition && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {React.createElement(
                  featureDefinitions[selectedForAddition].icon,
                  {
                    className: "w-8 h-8 text-purple-600",
                  }
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add {featureDefinitions[selectedForAddition].name}?
              </h3>

              <p className="text-gray-600 mb-6">
                This will be one of your {maxFeatures} Standard+ advanced
                features.
                {currentCount + 1 >= maxFeatures
                  ? " You'll have selected all your features!"
                  : ` You'll have ${maxFeatures - currentCount - 1} selection${
                      maxFeatures - currentCount - 1 !== 1 ? "s" : ""
                    } remaining.`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelSelection}
                  disabled={isSelecting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFeatureAddition}
                  disabled={isSelecting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {isSelecting ? "Adding..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardPlusFeatureSelector;
