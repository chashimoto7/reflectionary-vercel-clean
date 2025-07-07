// frontend/ src/pages/PremiumWellness.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import tab components
import WellnessDashboardTab from "../components/wellness/tabs/WellnessDashboardTab";
import WellnessTrackingTab from "../components/wellness/tabs/WellnessTrackingTab";
import WellnessPatternsTab from "../components/wellness/tabs/WellnessPatternsTab";
import WellnessInsightsTab from "../components/wellness/tabs/WellnessInsightsTab";
import WellnessForecastTab from "../components/wellness/tabs/WellnessForecastTab";
import WellnessExperimentsTab from "../components/wellness/tabs/WellnessExperimentsTab";

const PremiumWellness = () => {
  const { user } = useAuth();
  const { tier } = useMembership();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
      label: "Wellness Dashboard",
      icon: BarChart3,
      component: WellnessDashboardTab,
    },
    {
      id: "tracking",
      label: "Track Wellness",
      icon: Activity,
      component: WellnessTrackingTab,
    },
    {
      id: "patterns",
      label: "My Patterns",
      icon: TrendingUp,
      component: WellnessPatternsTab,
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: Brain,
      component: WellnessInsightsTab,
    },
    {
      id: "forecast",
      label: "Wellness Forecast",
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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle tab scroll visibility
  const handleTabScroll = (e) => {
    const container = e.target;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scrollTabs = (direction) => {
    const container = document.getElementById("tab-container");
    const scrollAmount = 200;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

        {/* Tab Navigation with Arrows */}
        <div className="mb-8">
          <div className="relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scrollTabs("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-purple-800/80 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:bg-purple-700/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scrollTabs("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-purple-800/80 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:bg-purple-700/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Tab Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
              <div
                id="tab-container"
                className="flex gap-2 overflow-x-auto scrollbar-hide"
                onScroll={handleTabScroll}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
                        whitespace-nowrap transition-all flex-shrink-0
                        ${
                          isActive
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-purple-200 hover:text-white hover:bg-white/10"
                        }
                      `}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
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
    </div>
  );
};

export default PremiumWellness;
