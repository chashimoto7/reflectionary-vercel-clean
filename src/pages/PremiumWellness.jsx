// frontend/src/pages/PremiumWellness.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Moon,
  Brain,
  TrendingUp,
  BarChart3,
  Target,
  Crown,
  Zap,
  Calendar,
  Sparkles,
  Shield,
  Info,
  X,
} from "lucide-react";

// Import tab components
import WellnessDashboardTab from "../components/wellness/tabs/WellnessDashboardTab";
import WellnessTrackingTab from "../components/wellness/tabs/WellnessTrackingTab";
import WellnessPatternsTab from "../components/wellness/tabs/WellnessPatternsTab";
import WellnessInsightsTab from "../components/wellness/tabs/WellnessInsightsTab";
import WellnessForecastTab from "../components/wellness/tabs/WellnessForecastTab";
import WellnessExperimentsTab from "../components/wellness/tabs/WellnessExperimentsTab";

const PremiumWellness = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Color palette matching the premium theme
  const colors = {
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    accent: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#EC4899",
    gradient: "from-purple-900 via-purple-800 to-indigo-900",
  };

  // Tab configuration with components
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      component: WellnessDashboardTab,
    },
    {
      id: "tracking",
      label: "Track",
      icon: Activity,
      component: WellnessTrackingTab,
    },
    {
      id: "patterns",
      label: "Patterns",
      icon: TrendingUp,
      component: WellnessPatternsTab,
    },
    {
      id: "insights",
      label: "Insights",
      icon: Brain,
      component: WellnessInsightsTab,
    },
    {
      id: "forecast",
      label: "Forecast",
      icon: Calendar,
      component: WellnessForecastTab,
    },
    {
      id: "experiments",
      label: "Experiments",
      icon: Sparkles,
      component: WellnessExperimentsTab,
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your wellness insights...</p>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(
    (tab) => tab.id === activeTab
  )?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10 text-purple-300" />
                Premium Wellness
                <Crown className="w-8 h-8 text-yellow-400" />
              </h1>
              <p className="text-purple-200 text-lg">
                Your comprehensive wellness command center
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-purple-300 mb-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="capitalize">{tier} Member</span>
              </div>
              <p className="text-xs text-purple-400">
                Full access to all wellness features
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Info Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowPrivacyInfo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-700/50 hover:bg-purple-700/70 text-purple-200 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Privacy Info
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
                      transition-all
                      ${
                        isActive
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-purple-200 hover:text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {ActiveTabComponent && (
            <ActiveTabComponent colors={colors} user={user} tier={tier} />
          )}
        </div>
      </div>

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 rounded-xl p-6 max-w-md w-full border border-purple-600/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Privacy Information
              </h3>
              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-200 leading-relaxed">
              All analytics are generated from anonymized data. No personally
              identifying information is <strong>ever</strong> accessed or
              shared. Your information remains encrypted on our servers and is
              only accessible by you.
            </p>
            <button
              onClick={() => setShowPrivacyInfo(false)}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumWellness;
