// src/pages/StandardAnalytics.jsx - Fixed to use backend API
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  TrendingUp,
  Heart,
  Brain,
  Activity,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Target,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const StandardAnalytics = () => {
  const { user } = useAuth();
  const { hasAccess } = useMembership();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30days");
  const [expandedInsights, setExpandedInsights] = useState(new Set());

  // Color palette
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    tertiary: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
    chart: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
  };

  useEffect(() => {
    if (user && hasAccess("analytics")) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics?user_id=${user.id}&tier=standard&date_range=${dateRange}&include_wellness=false&include_goals=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInsight = (insightId) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Analyzing your journal data...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "No analytics data available"}
          </p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Journal Analytics
          </h1>
          <p className="text-gray-300">
            Discover patterns and insights in your journaling journey
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-purple-400" />
              <span className="text-3xl font-bold">
                {analytics.overview?.totalEntries || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Total Entries</h3>
            <p className="text-sm text-gray-300">
              {analytics.overview?.followUpRate || 0}% have follow-ups
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-pink-400" />
              <span className="text-3xl font-bold">
                {analytics.overview?.averageMood || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Average Mood</h3>
            <p className="text-sm text-gray-300">Out of 10</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-3xl font-bold">
                {analytics.overview?.averageEnergy || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Average Energy</h3>
            <p className="text-sm text-gray-300">Out of 10</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-3xl font-bold">
                {analytics.writingPatterns?.consistency || 0}%
              </span>
            </div>
            <h3 className="text-lg font-semibold">Consistency</h3>
            <p className="text-sm text-gray-300">Writing regularly</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mood Trends */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LineChartIcon className="h-6 w-6 text-purple-400" />
              Mood Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.mood?.trends || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(139,92,246,0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ fill: colors.primary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-purple-400" />
              Mood Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={Object.entries(
                      analytics.mood?.distribution || {}
                    ).map(([key, value]) => ({
                      name: key,
                      value: value,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.mood?.distribution || {}).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors.chart[index % colors.chart.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Emotions & Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Emotions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold mb-4">Top Emotions</h3>
            <div className="space-y-3">
              {analytics.emotions?.topEmotions
                ?.slice(0, 5)
                .map((emotion, index) => (
                  <div
                    key={emotion.emotion}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300">{emotion.emotion}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{
                            width: `${
                              (emotion.count /
                                analytics.overview.totalEntries) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {emotion.count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Topics */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold mb-4">Top Topics</h3>
            <div className="space-y-3">
              {analytics.topics?.topTopics?.slice(0, 5).map((topic, index) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${
                            (topic.count / analytics.overview.totalEntries) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {topic.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Writing Patterns */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-400" />
            Writing Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Most Productive Day</p>
              <p className="text-2xl font-bold text-purple-300">
                {analytics.writingPatterns?.mostProductiveDay?.day || "N/A"}
              </p>
              <p className="text-sm text-gray-300">
                Avg {analytics.writingPatterns?.mostProductiveDay?.average || 0}{" "}
                words
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Best Writing Time</p>
              <p className="text-2xl font-bold text-purple-300">
                {analytics.writingPatterns?.averageByHour?.reduce(
                  (best, current) =>
                    current.average > (best?.average || 0) ? current : best
                )?.hour || 0}
                :00
              </p>
              <p className="text-sm text-gray-300">Most active hour</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Average Length</p>
              <p className="text-2xl font-bold text-purple-300">
                {analytics.overview?.averageWordsPerEntry || 0}
              </p>
              <p className="text-sm text-gray-300">Words per entry</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        {analytics.insights && analytics.insights.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              Personal Insights
            </h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                  onClick={() => toggleInsight(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          insight.type === "positive"
                            ? "text-green-400"
                            : insight.type === "concern"
                            ? "text-yellow-400"
                            : "text-purple-400"
                        }`}
                      >
                        {insight.category.charAt(0).toUpperCase() +
                          insight.category.slice(1)}
                      </p>
                      <p className="text-gray-300 mt-1">{insight.message}</p>
                      {expandedInsights.has(index) && insight.data && (
                        <div className="mt-2 text-sm text-gray-400">
                          {Object.entries(insight.data).map(([key, value]) => (
                            <p key={key}>
                              {key}: {value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transform transition ${
                        expandedInsights.has(index) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Progress (if available) */}
        {analytics.goals && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-400" />
              Goals Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-300">
                  {analytics.goals.activeGoals}
                </p>
                <p className="text-sm text-gray-400">Active Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-300">
                  {analytics.goals.completedGoals}
                </p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-300">
                  {analytics.goals.completionRate}%
                </p>
                <p className="text-sm text-gray-400">Completion Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
