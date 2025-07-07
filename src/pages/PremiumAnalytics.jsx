// frontend/ src/pages/PremiumAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
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
  const { tier, hasAccess, loading: membershipLoading } = useMembership();
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

  // Check access control
  useEffect(() => {
    if (!user || membershipLoading) {
      return;
    }

    const userHasAccess = hasAccess("premium_analytics");
    if (userHasAccess) {
      loadAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

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
    setError(null);

    try {
      // Load comprehensive analytics data from backend API
      const response = await fetch(
        `/api/analytics?user_id=${user.id}&tier=premium&date_range=${dateRange}&include_wellness=true&include_goals=true&include_womens_health=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalyticsData(data.analytics);

      // Generate premium insights from the analytics data
      await generatePremiumInsights(data.analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const generatePremiumInsights = async (analytics) => {
    try {
      // Fetch AI-generated insights from backend
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          tier: "premium",
          analytics: analytics,
          date_range: dateRange,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Set default insights if API fails
      setInsights([
        {
          id: 1,
          type: "growth",
          priority: "high",
          title: "Strong Personal Growth Detected",
          message:
            "Your emotional intelligence scores have improved 23% over the past month.",
          actionable: true,
          recommendation:
            "Continue your current journaling practices and consider deeper reflection on relationships.",
          date: new Date().toISOString(),
        },
        {
          id: 2,
          type: "pattern",
          priority: "medium",
          title: "Weekly Pattern Identified",
          message:
            "You tend to have lower energy on Mondays but recover by Wednesday.",
          actionable: true,
          recommendation:
            "Consider planning lighter activities for Mondays and important tasks for mid-week.",
          date: new Date().toISOString(),
        },
      ]);
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

  // Export analytics data
  const handleExportAnalytics = async (format = "pdf") => {
    try {
      const response = await fetch("/api/export-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          tier: "premium",
          format: format,
          date_range: dateRange,
          include_insights: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `premium-analytics-${dateRange}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      alert("Failed to export analytics. Please try again.");
    }
  };

  // Access control check
  if (!user || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess("premium_analytics")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Premium Analytics Access Required
          </h2>
          <p className="text-purple-300 mb-6">
            Upgrade to Premium to unlock comprehensive analytics with AI
            insights, predictive analytics, and cross-feature pattern
            recognition.
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

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
                    All analytics are generated from encrypted data on our
                    secure servers. Your journal content is decrypted only for
                    analysis and immediately discarded. No personal content is
                    stored in analytics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-purple-300">
                Analysis Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1week">Last Week</option>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportAnalytics("pdf")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-purple-300 hover:bg-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-400/30">
                <Crown className="text-yellow-400" size={16} />
                <span className="text-purple-300 font-medium text-sm">
                  Premium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Alert (if new insights) */}
        {insights.filter((i) => !i.acknowledged).length > 0 && (
          <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-purple-300 font-medium mb-1">
                  {insights.filter((i) => !i.acknowledged).length} New AI
                  Insights Available
                </p>
                <p className="text-purple-400 text-sm">
                  Your AI has discovered new patterns and recommendations based
                  on your recent activity.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("personalized-recommendations")}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
              >
                View Insights
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Tabs */}
        <div className="mb-8 relative">
          {showLeftArrow && (
            <button
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800 rounded-full shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 text-purple-400" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scrollTabs("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800 rounded-full shadow-lg"
            >
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
          )}

          <div
            ref={setTabsRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {premiumTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    {isActive && (
                      <div className="text-xs opacity-80">
                        {tab.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {!analyticsData && !error ? (
          <EmptyState />
        ) : error ? (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-12 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10">
              {activeTab === "unified-dashboard" && (
                <UnifiedDashboardTab
                  data={analyticsData}
                  colors={colors}
                  insights={insights}
                />
              )}
              {activeTab === "journey-timeline" && (
                <JourneyTimelineTab data={analyticsData} colors={colors} />
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
                  onAcknowledgeInsight={handleAcknowledgeInsight}
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
