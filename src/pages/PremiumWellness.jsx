// src/pages/AdvancedWellness.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Activity,
  Heart,
  Moon,
  Dumbbell,
  TrendingUp,
  BarChart3,
  Target,
  Crown,
  Settings,
} from "lucide-react";

// Import tab components
import WellnessOverviewTab from "../components/wellness/tabs/WellnessOverviewTab";
import WellnessTrackingTab from "../components/wellness/tabs/WellnessTrackingTab";
import WellnessPatternsTab from "../components/wellness/tabs/WellnessPatternsTab";
import WellnessCorrelationsTab from "../components/wellness/tabs/WellnessCorrelationsTab";
import WellnessGoalsTab from "../components/wellness/tabs/WellnessGoalsTab";

const AdvancedWellness = () => {
  const { user } = useAuth();
  const { tier } = useMembership();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    {
      id: "overview",
      label: "Dashboard",
      icon: BarChart3,
      component: WellnessOverviewTab,
    },
    {
      id: "tracking",
      label: "Track Today",
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
      id: "correlations",
      label: "Correlations",
      icon: Heart,
      component: WellnessCorrelationsTab,
    },
    {
      id: "goals",
      label: "Goals Integration",
      icon: Target,
      component: WellnessGoalsTab,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wellness insights...</p>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(
    (tab) => tab.id === activeTab
  )?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-600" />
                Advanced Wellness
                <Crown className="w-6 h-6 text-yellow-500" />
              </h1>
              <p className="text-gray-600">
                Comprehensive wellness tracking with AI-powered insights and
                goal integration
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="capitalize">{tier} Member</span>
              </div>
              <p className="text-xs text-gray-400">
                Full access to advanced wellness features
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      isActive
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {ActiveTabComponent && <ActiveTabComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdvancedWellness;
