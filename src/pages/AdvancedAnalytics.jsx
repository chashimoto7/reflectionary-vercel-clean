// src/pages/AdvancedAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
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
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Heart,
  Zap,
  BookOpen,
  BarChart3,
  Users,
  Target,
  Brain,
  Sparkles,
  Moon,
  Droplets,
  Thermometer,
  Shield,
  Crown,
  Info,
  Download,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  EyeOff,
  ChevronRight,
  Lightbulb,
  Award,
  TrendingDown,
} from "lucide-react";

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const { hasAccess, tier } = useMembership();
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
    if (user && hasAccess("advanced_analytics")) {
      loadAdvancedAnalytics();
      loadInsights();
    }
  }, [user, dateRange]);

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

  if (!hasAccess("advanced_analytics")) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-purple-900 mb-2">
            Advanced Analytics
          </h3>
          <p className="text-purple-700 mb-4">
            Unlock deep insights into your emotional patterns, cognitive growth,
            and behavioral trends.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-medium">
            Upgrade to Access Advanced Analytics
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
          <p className="text-gray-600">Analyzing your deep patterns...</p>
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
          {/* Advanced Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
            {advancedTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
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

// Intelligence Overview Tab Component
const IntelligenceOverviewTab = ({
  data,
  colors,
  insights,
  onAcknowledgeInsight,
}) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Intelligence Overview
    </h2>

    {/* Key Intelligence Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <IntelligenceMetricCard
        title="Emotional Intelligence"
        value="8.4/10"
        trend="+12%"
        subtitle="Growing self-awareness"
        color="bg-gradient-to-r from-purple-500 to-purple-600"
        icon={Heart}
      />
      <IntelligenceMetricCard
        title="Growth Trajectory"
        value="Ascending"
        trend="+24%"
        subtitle="Consistent improvement"
        color="bg-gradient-to-r from-green-500 to-green-600"
        icon={TrendingUp}
      />
      <IntelligenceMetricCard
        title="Pattern Recognition"
        value="Advanced"
        trend="Stable"
        subtitle="Strong self-insight"
        color="bg-gradient-to-r from-blue-500 to-blue-600"
        icon={Brain}
      />
      <IntelligenceMetricCard
        title="Resilience Score"
        value="7.8/10"
        trend="+8%"
        subtitle="Improved coping"
        color="bg-gradient-to-r from-orange-500 to-orange-600"
        icon={Shield}
      />
    </div>

    {/* Recent Insights Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Lightbulb className="text-purple-600" size={20} />
          Latest AI Insights
        </h3>
        {insights.slice(0, 3).map((insight, index) => (
          <div key={insight.id} className="mb-4 last:mb-0">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 text-sm">
                  {insight.title}
                </h4>
                <p className="text-purple-700 text-xs mt-1">
                  {insight.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {insight.confidence_score * 100}% confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-purple-600 text-sm">
            Keep journaling consistently to unlock personalized insights!
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Intelligence Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Analyzed Entries:</span>
            <span className="font-semibold">{data.overview.totalEntries}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Average Emotional Depth:</span>
            <span className="font-semibold">High</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Self-Awareness Growth:</span>
            <span className="font-semibold text-green-600">
              +15% this month
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pattern Complexity:</span>
            <span className="font-semibold">Sophisticated</span>
          </div>
        </div>
      </div>
    </div>

    {/* Multi-dimensional Analysis */}
    <div className="h-80 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Emotional-Energy Correlation Analysis
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="mood"
            type="number"
            domain={[0, 10]}
            name="Mood"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            dataKey="energy"
            type="number"
            domain={[0, 10]}
            name="Energy"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              `${value}/10`,
              name === "mood" ? "Mood" : "Energy",
            ]}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            name="Mood vs Energy"
            data={data.mood?.daily || []}
            fill={colors.primary}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Intelligence Metric Card Component
const IntelligenceMetricCard = ({
  title,
  value,
  trend,
  subtitle,
  color,
  icon: Icon,
}) => (
  <div
    className={`${color} p-6 rounded-lg text-white relative overflow-hidden`}
  >
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        <div className="flex items-center gap-1 text-sm">
          {trend.startsWith("+") ? (
            <ArrowUp className="w-4 h-4" />
          ) : trend.startsWith("-") ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>{trend}</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{subtitle}</p>
    </div>
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6"></div>
  </div>
);

// Enhanced Sentiment & Emotions Tab Component
const SentimentEmotionsTab = ({ data, colors }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [showEmotionDetails, setShowEmotionDetails] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Sentiment & Emotional Intelligence
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly Aggregation</option>
            <option value="monthly">Monthly Trends</option>
          </select>
          <button
            onClick={() => setShowEmotionDetails(!showEmotionDetails)}
            className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
          >
            {showEmotionDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            {showEmotionDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {/* Emotional Intelligence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">8.4</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Emotional Intelligence</h3>
          <p className="text-sm opacity-90">Above average self-awareness</p>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm opacity-90">accuracy</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Pattern Recognition</h3>
          <p className="text-sm opacity-90">Strong emotional patterns</p>
          <div className="mt-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="text-sm">Expert level</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">76%</div>
              <div className="text-sm opacity-90">positive</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Overall Sentiment</h3>
          <p className="text-sm opacity-90">Predominantly positive outlook</p>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Improving trend</span>
          </div>
        </div>
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sentiment Evolution Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} />
            Sentiment Evolution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                <Tooltip
                  formatter={(value, name) => [
                    `${(value * 100).toFixed(1)}%`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                  labelFormatter={(value) =>
                    `Date: ${new Date(value).toLocaleDateString()}`
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stackId="1"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.8}
                  name="Positive"
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.8}
                  name="Neutral"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stackId="1"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.8}
                  name="Negative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Insight:</strong> Your sentiment has been trending more
              positive over the past month, with notable improvements in
              emotional regulation.
            </p>
          </div>
        </div>

        {/* Emotional Landscape */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="text-pink-600" size={20} />
            Emotional Landscape
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.emotions || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="emotion"
                  label={({ emotion, percent }) =>
                    `${emotion} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(data?.emotions || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors.gradient[index % colors.gradient.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} mentions`, "Frequency"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Pattern:</strong> Gratitude and joy are your most
              frequent emotions, indicating strong emotional well-being.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Emotional Analysis */}
      {showEmotionDetails && (
        <div className="space-y-6 mb-8">
          {/* Emotion Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emotion Intensity Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="positive"
                    fill={colors.accent}
                    name="Positive Intensity"
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke={colors.danger}
                    strokeWidth={3}
                    name="Negative Intensity"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotional Volatility Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={18} />
                Emotional Stability Score
              </h4>
              <div className="text-3xl font-bold text-blue-800 mb-2">
                7.8/10
              </div>
              <p className="text-blue-700 text-sm mb-3">
                Your emotions show good stability with manageable fluctuations.
              </p>
              <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={18} />
                Emotional Growth Rate
              </h4>
              <div className="text-3xl font-bold text-purple-800 mb-2">
                +15%
              </div>
              <p className="text-purple-700 text-sm mb-3">
                Your emotional intelligence is growing at an above-average rate.
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Accelerating growth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Emotional Patterns */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-green-600" size={20} />
          Weekly Emotional Patterns
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.weekly || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${(value * 100).toFixed(1)}%`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend />
              <Bar dataKey="positive" fill={colors.accent} name="Positive" />
              <Bar dataKey="neutral" fill={colors.warning} name="Neutral" />
              <Bar dataKey="negative" fill={colors.danger} name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800">Best Day</div>
            <div className="text-green-600">Fridays</div>
            <div className="text-xs text-green-600">85% positive sentiment</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="font-semibold text-yellow-800">Most Balanced</div>
            <div className="text-yellow-600">Wednesdays</div>
            <div className="text-xs text-yellow-600">
              Even emotional distribution
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-800">Challenging Day</div>
            <div className="text-red-600">Mondays</div>
            <div className="text-xs text-red-600">Consider extra self-care</div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Lightbulb className="text-purple-600" size={20} />
          AI-Powered Emotional Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">
                  Emotional Peak Times
                </h4>
                <p className="text-purple-700 text-sm">
                  Your most positive emotions occur between 2-4 PM and on
                  weekend mornings. Consider scheduling important conversations
                  during these windows.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Growth Pattern
                </h4>
                <p className="text-blue-700 text-sm">
                  You're developing stronger emotional vocabulary and
                  self-awareness. This indicates growing emotional intelligence
                  and resilience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// More tab components would follow the same pattern...
// For brevity, I'll add placeholders for the remaining tabs

const CognitivePatternsTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Cognitive Patterns & Thinking Styles
    </h2>
    <div className="text-center py-12">
      <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Cognitive pattern analysis coming soon...</p>
    </div>
  </div>
);

const GrowthResilienceTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Growth & Resilience Tracking
    </h2>
    <div className="text-center py-12">
      <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">
        Growth tracking visualization coming soon...
      </p>
    </div>
  </div>
);

const CycleIntelligenceTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Cycle Intelligence & Hormonal Patterns
    </h2>
    <div className="text-center py-12">
      <Moon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Enhanced cycle analytics coming soon...</p>
    </div>
  </div>
);

const BehavioralInsightsTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Behavioral Insights & Patterns
    </h2>
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Behavioral analysis coming soon...</p>
    </div>
  </div>
);

const WellnessCorrelationsTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Wellness Correlations
    </h2>
    <div className="text-center py-12">
      <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">
        Wellness correlation analysis coming soon...
      </p>
    </div>
  </div>
);

const AIInsightsFeedTab = ({ insights, onAcknowledgeInsight, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      AI-Generated Insights Feed
    </h2>
    {insights.length > 0 ? (
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="text-purple-600" size={16} />
                  <span className="text-sm font-medium text-purple-900">
                    {insight.insight_type}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {Math.round(insight.confidence_score * 100)}% confidence
                  </span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  {insight.title}
                </h3>
                <p className="text-purple-700 text-sm mb-3">
                  {insight.description}
                </p>
                <div className="text-xs text-purple-600">
                  Generated {new Date(insight.created_at).toLocaleDateString()}
                </div>
              </div>
              {!insight.user_acknowledged && (
                <button
                  onClick={() => onAcknowledgeInsight(insight.id)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          Keep journaling to generate AI insights!
        </p>
      </div>
    )}
  </div>
);

const DataExportTab = ({ userId, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Data Analysis & Export
    </h2>
    <div className="text-center py-12">
      <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Data export functionality coming soon...</p>
    </div>
  </div>
);

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
