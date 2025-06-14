// src/pages/AdvancedAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import AnalyticsIntegrationService from "../services/AnalyticsIntegrationService";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Heart,
  Zap,
  Users,
  Target,
  Brain,
  Sparkles,
  Moon,
  Shield,
  Crown,
  Info,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  Award,
} from "lucide-react";

// Import separate tab components
import IntelligenceOverviewTab from "../components/analytics/tabs/IntelligenceOverviewTab";
import SentimentEmotionsTab from "../components/analytics/tabs/SentimentEmotionsTab";
import CognitivePatternsTab from "../components/analytics/tabs/CognitivePatternsTab";
import GrowthResilienceTab from "../components/analytics/tabs/GrowthResilienceTab";
import CycleIntelligenceTab from "../components/analytics/tabs/CycleIntelligenceTab";
import BehavioralInsightsTab from "../components/analytics/tabs/BehavioralInsightsTab";
import WellnessCorrelationsTab from "../components/analytics/tabs/WellnessCorrelationsTab";
import AIInsightsFeedTab from "../components/analytics/tabs/AIInsightsFeedTab";
import DataExportTab from "../components/analytics/tabs/DataExportTab";

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("3months");
  const [insights, setInsights] = useState([]);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const analyticsService = new AnalyticsIntegrationService();

  // Advanced color palette for sophisticated visualizations
  const colors = {
    primary: "#8B5CF6", // Purple
    secondary: "#06B6D4", // Cyan
    accent: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    danger: "#EF4444", // Red
    pink: "#EC4899", // Pink
    indigo: "#6366F1", // Indigo
    lime: "#84CC16", // Lime
    gradient: [
      "#8B5CF6",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
    ],
  };

  const cycleColors = {
    Menstrual: "#EF4444", // Red
    Follicular: "#10B981", // Green
    Ovulatory: "#F59E0B", // Amber
    Luteal: "#8B5CF6", // Purple
  };

  useEffect(() => {
    // Don't do anything until user and membership data are loaded
    if (!user || membershipLoading) {
      return;
    }

    // Check access directly without using the function in dependencies
    const userHasAccess = hasAccess("advanced_analytics");

    if (userHasAccess) {
      loadAdvancedAnalytics();
      loadInsights();
    } else {
      // User doesn't have access - stop loading
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Loading advanced analytics data...");
      const data = await analyticsService.getAnalyticsForDashboard(
        user.id,
        dateRange
      );
      setAnalyticsData(data);
      console.log("✅ Advanced analytics loaded:", data);
    } catch (error) {
      console.error("❌ Error loading advanced analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const userInsights = await analyticsService.getUserInsights(user.id, 15);
      setInsights(userInsights);
    } catch (error) {
      console.error("Error loading insights:", error);
    }
  };

  const advancedTabs = [
    { id: "overview", label: "Intelligence Overview", icon: Sparkles },
    { id: "sentiment", label: "Sentiment & Emotions", icon: Heart },
    { id: "cognitive", label: "Cognitive Patterns", icon: Brain },
    { id: "growth", label: "Growth & Resilience", icon: TrendingUp },
    { id: "cycle-deep", label: "Cycle Intelligence", icon: Moon },
    { id: "behavioral", label: "Behavioral Insights", icon: Users },
    { id: "wellness", label: "Wellness Correlations", icon: Shield },
    { id: "insights-feed", label: "AI Insights", icon: Lightbulb },
    { id: "data-export", label: "Data & Export", icon: Download },
  ];

  const handleAcknowledgeInsight = async (insightId) => {
    await analyticsService.acknowledgeInsight(user.id, insightId);
    loadInsights(); // Refresh insights
  };

  if (membershipLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Advanced Analytics
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAdvancedAnalytics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Advanced Analytics
              </h1>
              <p className="text-gray-600">
                Deep insights powered by AI pattern recognition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-full">
              <Crown className="text-purple-600" size={16} />
              <span className="text-purple-700 font-medium text-sm">
                Premium Feature
              </span>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
            >
              <Shield size={16} />
              Privacy Info
            </button>
          </div>
        </div>

        {/* Privacy Information */}
        {showPrivacyInfo && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
            <div className="flex items-start gap-2">
              <Shield
                className="text-purple-600 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div className="text-sm">
                <p className="text-purple-800 font-medium mb-1">
                  🔒 Your Privacy is Protected
                </p>
                <p className="text-purple-700">
                  All analytics are generated from encrypted metadata only. Your
                  actual journal content remains end-to-end encrypted and is
                  only decrypted locally on your device. This data is visible
                  only to you and never shared.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date Range & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Analysis Period:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            AI Analysis Active
          </div>
        </div>
      </div>

      {analyticsData?.overview?.totalEntries === 0 ? (
        <EmptyAdvancedState />
      ) : (
        <>
          {/* Advanced Tab Navigation - Two Row Layout */}
          <div className="mb-8">
            <div className="bg-gray-50 p-3 rounded-lg">
              {/* First Row */}
              <div className="flex flex-wrap gap-2 mb-2">
                {advancedTabs.slice(0, 5).map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Second Row */}
              <div className="flex flex-wrap gap-2">
                {advancedTabs.slice(5).map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === "overview" && (
              <IntelligenceOverviewTab
                data={analyticsData}
                colors={colors}
                insights={insights}
                onAcknowledgeInsight={handleAcknowledgeInsight}
              />
            )}
            {activeTab === "sentiment" && (
              <SentimentEmotionsTab
                data={analyticsData.sentiment}
                colors={colors}
              />
            )}
            {activeTab === "cognitive" && (
              <CognitivePatternsTab
                data={analyticsData.cognitive}
                colors={colors}
              />
            )}
            {activeTab === "growth" && (
              <GrowthResilienceTab data={analyticsData} colors={colors} />
            )}
            {activeTab === "cycle-deep" && (
              <CycleIntelligenceTab data={analyticsData} colors={cycleColors} />
            )}
            {activeTab === "behavioral" && (
              <BehavioralInsightsTab
                data={analyticsData.behavioral}
                colors={colors}
              />
            )}
            {activeTab === "wellness" && (
              <WellnessCorrelationsTab
                data={analyticsData.wellness}
                colors={colors}
              />
            )}
            {activeTab === "insights-feed" && (
              <AIInsightsFeedTab
                insights={insights}
                onAcknowledgeInsight={handleAcknowledgeInsight}
                colors={colors}
              />
            )}
            {activeTab === "data-export" && (
              <DataExportTab userId={user.id} colors={colors} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Empty State Component
const EmptyAdvancedState = () => (
  <div className="text-center py-12">
    <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-2">
      Start Your Advanced Analytics Journey
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      Create journal entries with our AI analysis to unlock deep insights about
      your emotional patterns, cognitive growth, and behavioral trends.
    </p>
    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 max-w-lg mx-auto">
      <h4 className="font-semibold text-purple-900 mb-2">
        What You'll Discover:
      </h4>
      <ul className="text-purple-700 text-sm space-y-1 text-left">
        <li>
          • Advanced sentiment analysis and emotional intelligence tracking
        </li>
        <li>• Cognitive pattern recognition and thinking style analysis</li>
        <li>• Growth trajectory and resilience measurements</li>
        <li>• Enhanced cycle correlations with mood and energy</li>
        <li>• Behavioral insights and habit pattern detection</li>
        <li>• AI-generated personalized insights and recommendations</li>
      </ul>
    </div>
  </div>
);

export default AdvancedAnalytics;
