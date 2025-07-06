// src/pages/BasicAnalytics.jsx - Fixed to use backend API
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  TrendingUp,
  Calendar,
  FileText,
  Award,
  BarChart3,
  ArrowUp,
  Clock,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BasicAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30days");

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics?user_id=${user.id}&tier=basic&date_range=${dateRange}`
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

  const formatDateRange = () => {
    switch (dateRange) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 90 Days";
      case "all":
        return "All Time";
      default:
        return "Last 30 Days";
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
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

  // Prepare chart data from entry frequency
  const chartData = analytics?.entryFrequency
    ? analytics.entryFrequency.map((count, index) => ({
        day: `Day ${index + 1}`,
        entries: count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Journal Analytics
          </h1>
          <p className="text-gray-300">
            Track your journaling progress and patterns
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 text-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Entries */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-purple-400" />
              <span className="text-3xl font-bold">
                {analytics?.overview?.totalEntries || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Entries</h3>
            <p className="text-sm text-gray-300">{formatDateRange()}</p>
          </div>

          {/* Current Streak */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-yellow-400" />
              <span className="text-3xl font-bold">
                {analytics?.overview?.currentStreak || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Day Streak</h3>
            <p className="text-sm text-gray-300">Keep it going!</p>
          </div>

          {/* Total Words */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-green-400" />
              <span className="text-3xl font-bold">
                {analytics?.overview?.totalWords?.toLocaleString() || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Words</h3>
            <p className="text-sm text-gray-300">Keep writing!</p>
          </div>

          {/* Average Words */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <span className="text-3xl font-bold">
                {analytics?.overview?.averageWordsPerEntry || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Avg Words/Entry</h3>
            <p className="text-sm text-gray-300">Per journal entry</p>
          </div>
        </div>

        {/* Entry Frequency Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-400" />
            Recent Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
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
                <Bar dataKey="entries" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-400" />
              Recent Entries
            </h3>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-gray-300">
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-sm text-purple-300">
                    {activity.wordCount} words
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6">
          <div className="flex items-start gap-4">
            <Target className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Unlock Advanced Analytics
              </h3>
              <p className="text-gray-300 mb-4">
                Upgrade to Standard or higher to access:
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4">
                <li className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  Mood and energy tracking with trends
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  Emotion and topic analysis
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  Writing pattern insights
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  AI-powered recommendations
                </li>
              </ul>
              <button
                onClick={() => navigate("/pricing")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Basic Tier Info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Basic analytics show your journaling consistency and writing volume.
            <br />
            Upgrade for deeper insights into your emotional patterns and
            personal growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicAnalytics;
