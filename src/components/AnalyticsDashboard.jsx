import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import AnalyticsIntegrationService from "../services/AnalyticsIntegrationService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Target,
  Clock,
  Users,
  BookOpen,
  Zap,
  Lightbulb,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("3months");
  const [cycleTracking, setCycleTracking] = useState(false);
  const [error, setError] = useState(null);

  // Initialize the analytics integration service
  const analyticsService = new AnalyticsIntegrationService();

  // Load analytics data when component mounts or date range changes
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load analytics data using the real service
      const dashboardData = await analyticsService.getAnalyticsForDashboard(
        user.id,
        dateRange
      );

      // Load user insights
      const userInsights = await analyticsService.getUserInsights(user.id, 5);

      // Check if user has cycle tracking enabled
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("cycle_tracking_enabled")
        .eq("user_id", user.id)
        .single();

      setCycleTracking(userProfile?.cycle_tracking_enabled || false);
      setAnalyticsData(dashboardData);
      setInsights(userInsights);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setError("Failed to load analytics data. Please try again.");

      // Set empty data structure so UI doesn't break
      setAnalyticsData(analyticsService.getEmptyDashboardData());
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle insight acknowledgment
  const handleInsightAcknowledgment = async (insightId) => {
    try {
      await analyticsService.acknowledgeInsight(user.id, insightId);
      // Remove the acknowledged insight from the list
      setInsights(insights.filter((insight) => insight.id !== insightId));
    } catch (error) {
      console.error("Error acknowledging insight:", error);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "sentiment", label: "Sentiment", icon: Heart },
    { id: "mood", label: "Mood & Energy", icon: Zap },
    { id: "themes", label: "Themes", icon: BookOpen },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "cognitive", label: "Cognitive", icon: Brain },
    { id: "wellness", label: "Wellness", icon: Heart },
    { id: "insights", label: "Insights", icon: Lightbulb },
  ];

  const colors = [
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#84CC16", // Lime
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your journaling patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Analytics
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Insights from your journaling journey - powered by AI analysis
        </p>

        {/* Date Range Selector */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium text-gray-700">
            Time Period:
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
      </div>

      {/* Quick Insights Banner */}
      {insights.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">
                Latest Insights
              </h3>
              <div className="space-y-2">
                {insights.slice(0, 2).map((insight) => (
                  <div
                    key={insight.id}
                    className="flex items-start justify-between bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {insight.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {insight.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleInsightAcknowledgment(insight.id)}
                      className="ml-3 text-xs text-purple-600 hover:text-purple-800"
                    >
                      Got it
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === "overview" && (
          <OverviewTab data={analyticsData?.overview} />
        )}
        {activeTab === "sentiment" && (
          <SentimentTab data={analyticsData?.sentiment} colors={colors} />
        )}
        {activeTab === "mood" && (
          <MoodEnergyTab
            data={{ mood: analyticsData?.mood, energy: analyticsData?.energy }}
            colors={colors}
            cycleTracking={cycleTracking}
          />
        )}
        {activeTab === "themes" && (
          <ThemesTab data={analyticsData?.themes} colors={colors} />
        )}
        {activeTab === "behavioral" && (
          <BehavioralTab data={analyticsData?.behavioral} colors={colors} />
        )}
        {activeTab === "cognitive" && (
          <CognitiveTab data={analyticsData?.cognitive} colors={colors} />
        )}
        {activeTab === "wellness" && (
          <WellnessTab data={analyticsData?.wellness} colors={colors} />
        )}
        {activeTab === "insights" && (
          <InsightsTab
            insights={insights}
            onAcknowledge={handleInsightAcknowledgment}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component - Shows key metrics and trends
const OverviewTab = ({ data }) => {
  if (!data) return <div className="p-6">Loading overview data...</div>;

  const hasData = data.totalEntries > 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

      {!hasData ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Start Your Analytics Journey
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Create a few journal entries to begin seeing insights about your
            emotional patterns, growth trends, and personal development journey.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Total Entries</h3>
              <p className="text-3xl font-bold">{data.totalEntries}</p>
              <p className="text-purple-100 text-sm mt-1">
                Journal entries analyzed
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Average Mood</h3>
              <p className="text-3xl font-bold">{data.averageMood}/10</p>
              <p className="text-blue-100 text-sm mt-1">
                Emotional wellbeing score
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Average Energy</h3>
              <p className="text-3xl font-bold">{data.averageEnergy}/10</p>
              <p className="text-green-100 text-sm mt-1">
                Vitality and motivation
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
              <p className="text-3xl font-bold">{data.journalingStreak} days</p>
              <p className="text-orange-100 text-sm mt-1">
                Consecutive journaling
              </p>
            </div>
          </div>

          {/* Top Themes Section */}
          {data.mostCommonThemes.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Most Common Themes
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                The topics and emotions that appear most frequently in your
                journal entries
              </p>
              <div className="space-y-3">
                {data.mostCommonThemes.map((theme, index) => (
                  <div
                    key={theme.theme}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700 capitalize font-medium">
                      {theme.theme}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (theme.count / data.mostCommonThemes[0].count) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {theme.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Sentiment Tab Component - Shows emotional tone analysis
const SentimentTab = ({ data, colors }) => {
  if (!data || !data.daily || data.daily.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sentiment Analysis
        </h2>
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No sentiment data available yet. Keep journaling to see your
            emotional patterns!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sentiment Analysis
      </h2>
      <p className="text-gray-600 mb-8">
        Understanding the emotional tone of your journal entries over time helps
        identify patterns in your mental state and emotional wellbeing.
      </p>

      {/* Daily Sentiment Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Daily Sentiment Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${(parseFloat(value) * 100).toFixed(1)}%`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="positive"
                stroke={colors[0]}
                strokeWidth={2}
                name="Positive"
              />
              <Line
                type="monotone"
                dataKey="negative"
                stroke={colors[4]}
                strokeWidth={2}
                name="Negative"
              />
              <Line
                type="monotone"
                dataKey="neutral"
                stroke={colors[1]}
                strokeWidth={2}
                name="Neutral"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Distribution */}
      {data.emotions && data.emotions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Emotion Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.emotions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ emotion, percent }) =>
                    `${emotion} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.emotions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Mood & Energy Tab Component - Shows mood and energy patterns
const MoodEnergyTab = ({ data, colors, cycleTracking }) => {
  if (!data || (!data.mood?.daily && !data.energy?.daily)) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Mood & Energy Patterns
        </h2>
        <div className="text-center py-12">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No mood or energy data available yet. Keep journaling to track your
            patterns!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Mood & Energy Patterns
      </h2>
      <p className="text-gray-600 mb-8">
        Track your emotional states and energy levels to identify patterns that
        can help optimize your daily routines and self-care practices.
      </p>

      {/* Mood and Energy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Chart */}
        {data.mood?.daily && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Daily Mood Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.mood.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value) => [`${value}/10`, "Mood Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke={colors[0]}
                    fill={colors[0]}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Energy Chart */}
        {data.energy?.daily && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Daily Energy Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.energy.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value) => [`${value}/10`, "Energy Level"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke={colors[2]}
                    fill={colors[2]}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Pattern Analysis */}
      {(data.mood?.weeklyPattern || data.energy?.weeklyPattern) && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Weekly Patterns
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.mood?.patterns && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Mood Insights
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    Best mood day:{" "}
                    <span className="font-medium">
                      {data.mood.patterns.bestMoodDay}
                    </span>
                  </li>
                  <li>
                    Lowest mood day:{" "}
                    <span className="font-medium">
                      {data.mood.patterns.lowestMoodDay}
                    </span>
                  </li>
                  <li>
                    Stability score:{" "}
                    <span className="font-medium">
                      {data.mood.patterns.stabilityScore}/10
                    </span>
                  </li>
                </ul>
              </div>
            )}
            {data.energy?.patterns && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Energy Insights
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    Best energy day:{" "}
                    <span className="font-medium">
                      {data.energy.patterns.bestEnergyDay}
                    </span>
                  </li>
                  <li>
                    Lowest energy day:{" "}
                    <span className="font-medium">
                      {data.energy.patterns.lowestEnergyDay}
                    </span>
                  </li>
                  <li>
                    Consistency:{" "}
                    <span className="font-medium">
                      {(data.energy.patterns.energyConsistency * 100).toFixed(
                        0
                      )}
                      %
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycle Tracking Section */}
      {cycleTracking && (
        <div className="bg-pink-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Cycle Correlations
          </h3>
          <p className="text-gray-600 mb-4">
            Understanding how your natural hormonal cycles affect your mood and
            energy can provide valuable insights into your patterns.
          </p>
          <div className="text-center text-gray-500 py-8">
            Cycle correlation visualizations will be displayed here based on
            your tracking data.
          </div>
        </div>
      )}
    </div>
  );
};

// Insights Tab Component - Shows AI-generated insights
const InsightsTab = ({ insights, onAcknowledge }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Personal Insights
        </h2>
        <div className="text-center py-12">
          <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Insights Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Keep journaling regularly! Our AI will start generating personalized
            insights about your patterns and growth after you have at least 5
            journal entries.
          </p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (category) => {
    switch (category) {
      case "mood":
        return Heart;
      case "energy":
        return Zap;
      case "cognitive":
        return Brain;
      case "trend":
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (category) => {
    switch (category) {
      case "mood":
        return "bg-pink-50 border-pink-200 text-pink-800";
      case "energy":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "cognitive":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "trend":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Personal Insights
      </h2>
      <p className="text-gray-600 mb-8">
        AI-powered insights about your journaling patterns, emotional trends,
        and personal growth indicators.
      </p>

      <div className="space-y-6">
        {insights.map((insight) => {
          const IconComponent = getInsightIcon(insight.insight_category);
          const colorClass = getInsightColor(insight.insight_category);

          return (
            <div
              key={insight.id}
              className={`border rounded-lg p-6 ${colorClass}`}
            >
              <div className="flex items-start gap-4">
                <IconComponent className="h-6 w-6 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {insight.title}
                  </h3>
                  <p className="mb-4">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-75">
                      Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                      • Category: {insight.insight_category}
                    </div>
                    <button
                      onClick={() => onAcknowledge(insight.id)}
                      className="text-sm px-3 py-1 bg-white bg-opacity-50 rounded-md hover:bg-opacity-75 transition-colors"
                    >
                      Mark as Read
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Placeholder components for other tabs (these will be enhanced in future iterations)
const ThemesTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Themes & Topics</h2>
    {data?.topThemes && data.topThemes.length > 0 ? (
      <div>
        <p className="text-gray-600 mb-6">
          The most frequent themes and topics that appear in your journal
          entries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.topThemes.map((theme, index) => (
            <div key={theme.theme} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 capitalize">
                  {theme.theme}
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {theme.count}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${(theme.count / data.topThemes[0].count) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No theme data available yet. Keep journaling to see your topic
          patterns!
        </p>
      </div>
    )}
  </div>
);

const BehavioralTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Behavioral Insights
    </h2>
    {data?.activityPatterns && data.activityPatterns.length > 0 ? (
      <div>
        <p className="text-gray-600 mb-6">
          Analysis of activities, habits, and behavioral patterns mentioned in
          your journal entries.
        </p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Mentioned Activities
          </h3>
          <div className="space-y-3">
            {data.activityPatterns.slice(0, 10).map((activity, index) => (
              <div
                key={activity.activity}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 capitalize">
                  {activity.activity}
                </span>
                <span className="text-sm text-gray-500">
                  {activity.count} mentions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No behavioral data available yet. Keep journaling to see your activity
          patterns!
        </p>
      </div>
    )}
  </div>
);

const CognitiveTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Cognitive Patterns
    </h2>
    {data?.thinkingPatterns && data.thinkingPatterns.length > 0 ? (
      <div>
        <p className="text-gray-600 mb-6">
          Analysis of thinking patterns, problem-solving approaches, and
          cognitive tendencies in your journal entries.
        </p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thinking Patterns
          </h3>
          <div className="space-y-3">
            {data.thinkingPatterns.map((pattern, index) => (
              <div
                key={pattern.pattern}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 capitalize">
                  {pattern.pattern.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-sm text-gray-500">
                  {pattern.count} occurrences
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No cognitive pattern data available yet. Keep journaling to see your
          thinking patterns!
        </p>
      </div>
    )}
  </div>
);

const WellnessTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Wellness Metrics</h2>
    {data ? (
      <div className="space-y-6">
        <p className="text-gray-600">
          Insights about your self-care patterns, stress levels, and overall
          wellness indicators.
        </p>

        {/* Stress Level Overview */}
        {data.averageStressLevel > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stress Level Overview
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-orange-600">
                {data.averageStressLevel}/10
              </span>
              <span className="text-gray-600">Average stress level</span>
            </div>
          </div>
        )}

        {/* Self-Care Patterns */}
        {data.selfCarePatterns &&
          Object.keys(data.selfCarePatterns).length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Self-Care Activities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.selfCarePatterns).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 capitalize">
                        {category} activities
                      </span>
                      <span className="text-purple-600 font-semibold">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Sleep Patterns */}
        {data.sleepPatterns && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sleep Quality
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-600">
                {(data.sleepPatterns.quality * 100).toFixed(0)}%
              </span>
              <span className="text-gray-600">Positive sleep mentions</span>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No wellness data available yet. Keep journaling to track your wellness
          patterns!
        </p>
      </div>
    )}
  </div>
);

export default AnalyticsDashboard;
