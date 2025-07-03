// src/pages/PremiumAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import AnalyticsIntegrationService from "../services/AnalyticsIntegrationService";
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
  Activity,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Compass,
  Infinity,
  Layers,
  Network,
  Telescope,
} from "lucide-react";

// Import tab components
import UnifiedDashboardTab from "../components/analytics/tabs/UnifiedDashboardTab";
import JourneyTimelineTab from "../components/analytics/tabs/JourneyTimelineTab";
import EmotionalIntelligenceTab from "../components/analytics/tabs/EmotionalIntelligenceTab";
import GoalAchievementTab from "../components/analytics/tabs/GoalAchievementTab";
import WellnessHolisticTab from "../components/analytics/tabs/WellnessHolisticTab";
import ReflectionarianInsightsTab from "../components/analytics/tabs/ReflectionarianInsightsTab";
import PredictiveAnalyticsTab from "../components/analytics/tabs/PredictiveAnalyticsTab";
import PatternRecognitionTab from "../components/analytics/tabs/PatternRecognitionTab";
import GrowthVelocityTab from "../components/analytics/tabs/GrowthVelocityTab";
import PersonalizedRecommendationsTab from "../components/analytics/tabs/PersonalizedRecommendationsTab";

const PremiumAnalytics = () => {
  const { user } = useAuth();
  const { tier } = useMembership();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("unified-dashboard");
  const [dateRange, setDateRange] = useState("3months");
  const [insights, setInsights] = useState([]);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [tabsRef, setTabsRef] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const analyticsService = new AnalyticsIntegrationService();

  // Dark purple theme colors
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    purple: "#8B5CF6",
    pink: "#EC4899",
    cyan: "#06B6D4",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#F472B6",
    indigo: "#6366F1",
    gradient: "from-purple-900 via-purple-800 to-indigo-900",
  };

  // Premium Analytics tabs - 10 comprehensive tabs
  const premiumTabs = [
    {
      id: "unified-dashboard",
      label: "Unified Dashboard",
      icon: Layers,
      description: "Your complete self-discovery overview",
    },
    {
      id: "journey-timeline",
      label: "Journey Timeline",
      icon: Compass,
      description: "Visual timeline of your personal growth",
    },
    {
      id: "emotional-intelligence",
      label: "Emotional Intelligence",
      icon: Heart,
      description: "Deep emotional patterns and insights",
    },
    {
      id: "goal-achievement",
      label: "Goal Achievement",
      icon: Target,
      description: "Goal progress and success patterns",
    },
    {
      id: "wellness-holistic",
      label: "Holistic Wellness",
      icon: Activity,
      description: "Complete wellness picture",
    },
    {
      id: "reflectionarian-insights",
      label: "Reflectionarian Insights",
      icon: MessageCircle,
      description: "AI companion conversation patterns",
    },
    {
      id: "predictive-analytics",
      label: "Predictive Analytics",
      icon: Telescope,
      description: "Future trends and predictions",
    },
    {
      id: "pattern-recognition",
      label: "Pattern Recognition",
      icon: Network,
      description: "Cross-feature pattern analysis",
    },
    {
      id: "growth-velocity",
      label: "Growth Velocity",
      icon: TrendingUp,
      description: "Personal development speed and direction",
    },
    {
      id: "personalized-recommendations",
      label: "AI Recommendations",
      icon: Sparkles,
      description: "Personalized action insights",
    },
  ];

  // Load analytics data when component mounts or date range changes
  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  // Tab scroll handling
  useEffect(() => {
    const handleTabScroll = () => {
      if (!tabsRef) return;
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    if (tabsRef) {
      tabsRef.addEventListener("scroll", handleTabScroll);
      handleTabScroll();
      return () => tabsRef.removeEventListener("scroll", handleTabScroll);
    }
  }, [tabsRef]);

  const scrollTabs = (direction) => {
    if (!tabsRef) return;
    const scrollAmount = 200;
    tabsRef.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load comprehensive analytics data from all features
      const data = await analyticsService.getComprehensiveAnalytics(
        user.id,
        dateRange
      );

      setAnalyticsData(data);

      // Generate AI insights
      const insights = await analyticsService.generatePremiumInsights(
        user.id,
        data
      );
      setInsights(insights);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeInsight = async (insightId) => {
    try {
      await supabase.from("ai_insights_acknowledged").insert({
        user_id: user.id,
        insight_id: insightId,
        acknowledged_at: new Date().toISOString(),
      });

      setInsights(
        insights.map((i) =>
          i.id === insightId ? { ...i, acknowledged: true } : i
        )
      );
    } catch (error) {
      console.error("Error acknowledging insight:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading your premium analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                Premium Analytics
              </h1>
              <p className="text-purple-300">
                Your complete self-discovery intelligence dashboard
              </p>
            </div>

            {/* Privacy Badge */}
            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-300 hover:bg-white/20 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Privacy First</span>
              <Info className="w-3 h-3" />
            </button>
          </div>

          {/* Privacy Info Panel */}
          {showPrivacyInfo && (
            <div className="mb-6 backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">
                    Your Privacy is Protected
                  </p>
                  <p>
                    All analytics are generated from metadata and AI analysis.
                    Your actual journal content remains end-to-end encrypted and
                    is only decrypted locally on your device. This data is
                    visible only to you and never shared.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date Range & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-purple-300">
                Analysis Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1week">Last Week</option>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              AI Analysis Active
            </div>
          </div>
        </div>

        {analyticsData?.overview?.totalEntries === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Premium Tab Navigation */}
            <div className="mb-8 relative">
              {/* Left Arrow */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollTabs("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 backdrop-blur-xl bg-purple-600/80 text-white rounded-full shadow-lg hover:bg-purple-500 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Tab Container */}
              <div
                ref={setTabsRef}
                className="overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-3 min-w-max px-10">
                  {premiumTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative px-6 py-4 rounded-xl transition-all duration-300 min-w-[180px] ${
                          isActive
                            ? "backdrop-blur-xl bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-2 border-purple-400 shadow-xl shadow-purple-500/30"
                            : "backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-purple-400/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent
                            className={`w-6 h-6 ${
                              isActive ? "text-purple-300" : "text-purple-400"
                            }`}
                          />
                          <span
                            className={`font-medium text-sm ${
                              isActive ? "text-purple-100" : "text-purple-300"
                            }`}
                          >
                            {tab.label}
                          </span>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow */}
              {showRightArrow && (
                <button
                  onClick={() => scrollTabs("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 backdrop-blur-xl bg-purple-600/80 text-white rounded-full shadow-lg hover:bg-purple-500 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {activeTab === "unified-dashboard" && (
                <UnifiedDashboardTab
                  data={analyticsData}
                  colors={colors}
                  insights={insights}
                  onAcknowledgeInsight={handleAcknowledgeInsight}
                />
              )}
              {activeTab === "journey-timeline" && (
                <JourneyTimelineTab
                  data={analyticsData}
                  colors={colors}
                  userId={user.id}
                />
              )}
              {activeTab === "emotional-intelligence" && (
                <EmotionalIntelligenceTab
                  data={analyticsData}
                  colors={colors}
                />
              )}
              {activeTab === "goal-achievement" && (
                <GoalAchievementTab data={analyticsData} colors={colors} />
              )}
              {activeTab === "wellness-holistic" && (
                <WellnessHolisticTab data={analyticsData} colors={colors} />
              )}
              {activeTab === "reflectionarian-insights" && (
                <ReflectionarianInsightsTab
                  data={analyticsData}
                  colors={colors}
                  userId={user.id}
                />
              )}
              {activeTab === "predictive-analytics" && (
                <PredictiveAnalyticsTab data={analyticsData} colors={colors} />
              )}
              {activeTab === "pattern-recognition" && (
                <PatternRecognitionTab data={analyticsData} colors={colors} />
              )}
              {activeTab === "growth-velocity" && (
                <GrowthVelocityTab data={analyticsData} colors={colors} />
              )}
              {activeTab === "personalized-recommendations" && (
                <PersonalizedRecommendationsTab
                  data={analyticsData}
                  colors={colors}
                  insights={insights}
                  userId={user.id}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-12">
    <div className="text-center max-w-md mx-auto">
      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-6" />
      <h3 className="text-2xl font-semibold text-purple-100 mb-3">
        Start Your Premium Analytics Journey
      </h3>
      <p className="text-purple-300 mb-8">
        Create journal entries, set goals, track wellness, and engage with your
        Reflectionarian to unlock deep insights about your personal growth
        journey.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10">
          <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-200">AI-Powered Insights</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-200">Cross-Feature Analysis</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-200">Predictive Analytics</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10">
          <Heart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-200">Holistic Wellness</p>
        </div>
      </div>
    </div>
  </div>
);

export default PremiumAnalytics;
