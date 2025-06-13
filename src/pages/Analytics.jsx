// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
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
  TrendingUp,
  Calendar,
  Heart,
  Zap,
  BookOpen,
  BarChart3,
  Users,
  Target,
  Lock,
  Crown,
} from "lucide-react";

const Analytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("3months");

  // Chart colors matching your brand
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

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "1month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch journal entries
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        setAnalyticsData(getEmptyAnalytics());
        setLoading(false);
        return;
      }

      // Process the data for visualization
      const processedData = await processAnalyticsData(entries);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data. Please try again.");
      setAnalyticsData(getEmptyAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = async (entries) => {
    // Decrypt and process journal entries
    const masterKey = await encryptionService.getStaticMasterKey();
    const processedEntries = [];

    for (const entry of entries) {
      try {
        const encryptedDataKey = {
          encryptedData: entry.encrypted_data_key,
          iv: entry.data_key_iv,
        };
        const dataKey = await encryptionService.decryptKey(
          encryptedDataKey,
          masterKey
        );

        // We don't need the full text for analytics, just the metadata
        processedEntries.push({
          id: entry.id,
          created_at: entry.created_at,
          mood: entry.mood,
          energy: entry.energy,
          emotions: entry.emotions || [],
          topics: entry.topics || [],
          word_count: entry.word_count || 0,
          tone: entry.tone,
        });
      } catch (err) {
        console.warn("Failed to process entry for analytics:", err);
        // Skip entries we can't process
      }
    }

    return {
      overview: processOverviewData(processedEntries),
      mood: processMoodData(processedEntries),
      energy: processEnergyData(processedEntries),
      themes: processThemesData(processedEntries),
      consistency: processConsistencyData(processedEntries),
      totalEntries: processedEntries.length,
    };
  };

  const processOverviewData = (entries) => {
    if (entries.length === 0) return getEmptyOverview();

    const totalEntries = entries.length;
    const totalWords = entries.reduce(
      (sum, entry) => sum + (entry.word_count || 0),
      0
    );
    const avgWordsPerEntry = Math.round(totalWords / totalEntries);

    const avgMood =
      entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / totalEntries;
    const avgEnergy =
      entries.reduce((sum, entry) => sum + (entry.energy || 0), 0) /
      totalEntries;

    // Calculate journaling streak (consecutive days)
    const dates = entries.map((entry) =>
      new Date(entry.created_at).toDateString()
    );
    const uniqueDates = [...new Set(dates)].sort(
      (a, b) => new Date(b) - new Date(a)
    );

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    // Get top emotions
    const emotionCount = {};
    entries.forEach((entry) => {
      entry.emotions.forEach((emotion) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      });
    });

    const topEmotions = Object.entries(emotionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    return {
      totalEntries,
      totalWords,
      avgWordsPerEntry,
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      currentStreak: streak,
      topEmotions,
    };
  };

  const processMoodData = (entries) => {
    // Daily mood aggregation
    const dailyMood = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toISOString().split("T")[0];
      if (!dailyMood[date]) {
        dailyMood[date] = { total: 0, count: 0 };
      }
      dailyMood[date].total += entry.mood || 0;
      dailyMood[date].count++;
    });

    const moodTrend = Object.entries(dailyMood)
      .map(([date, data]) => ({
        date,
        mood: (data.total / data.count).toFixed(1),
        displayDate: new Date(date).toLocaleDateString(),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { daily: moodTrend };
  };

  const processEnergyData = (entries) => {
    // Daily energy aggregation
    const dailyEnergy = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toISOString().split("T")[0];
      if (!dailyEnergy[date]) {
        dailyEnergy[date] = { total: 0, count: 0 };
      }
      dailyEnergy[date].total += entry.energy || 0;
      dailyEnergy[date].count++;
    });

    const energyTrend = Object.entries(dailyEnergy)
      .map(([date, data]) => ({
        date,
        energy: (data.total / data.count).toFixed(1),
        displayDate: new Date(date).toLocaleDateString(),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { daily: energyTrend };
  };

  const processThemesData = (entries) => {
    const topicCount = {};

    entries.forEach((entry) => {
      entry.topics.forEach((topic) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    const topThemes = Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    return { topThemes };
  };

  const processConsistencyData = (entries) => {
    // Calculate entries per week
    const weeklyData = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split("T")[0];

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    const weeklyConsistency = Object.entries(weeklyData)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString(),
        entries: count,
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week));

    return { weekly: weeklyConsistency };
  };

  const getEmptyAnalytics = () => ({
    overview: getEmptyOverview(),
    mood: { daily: [] },
    energy: { daily: [] },
    themes: { topThemes: [] },
    consistency: { weekly: [] },
    totalEntries: 0,
  });

  const getEmptyOverview = () => ({
    totalEntries: 0,
    totalWords: 0,
    avgWordsPerEntry: 0,
    avgMood: "0.0",
    avgEnergy: "0.0",
    currentStreak: 0,
    topEmotions: [],
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "mood", label: "Mood Trends", icon: Heart },
    { id: "energy", label: "Energy Patterns", icon: Zap },
    { id: "themes", label: "Common Themes", icon: BookOpen },
    { id: "consistency", label: "Journaling Habits", icon: Calendar },
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
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Analytics
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAnalyticsData}
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
          Your Journaling Analytics
        </h1>
        <p className="text-gray-600">
          Discover patterns and insights from your personal reflections
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

      {analyticsData.totalEntries === 0 ? (
        <EmptyState />
      ) : (
        <>
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
              <OverviewTab data={analyticsData.overview} colors={colors} />
            )}
            {activeTab === "mood" && (
              <MoodTab data={analyticsData.mood} colors={colors} />
            )}
            {activeTab === "energy" && (
              <EnergyTab data={analyticsData.energy} colors={colors} />
            )}
            {activeTab === "themes" && (
              <ThemesTab data={analyticsData.themes} colors={colors} />
            )}
            {activeTab === "consistency" && (
              <ConsistencyTab
                data={analyticsData.consistency}
                colors={colors}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12">
    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-2">
      Start Your Analytics Journey
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Create a few journal entries to begin seeing insights about your emotional
      patterns, growth trends, and personal development journey.
    </p>
  </div>
);

// Overview Tab Component
const OverviewTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

    {/* Key Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Entries"
        value={data.totalEntries}
        subtitle="Journal entries analyzed"
        color="bg-gradient-to-r from-purple-500 to-purple-600"
        icon={BookOpen}
      />
      <MetricCard
        title="Average Mood"
        value={`${data.avgMood}/10`}
        subtitle="Emotional wellbeing score"
        color="bg-gradient-to-r from-blue-500 to-blue-600"
        icon={Heart}
      />
      <MetricCard
        title="Average Energy"
        value={`${data.avgEnergy}/10`}
        subtitle="Vitality and motivation"
        color="bg-gradient-to-r from-green-500 to-green-600"
        icon={Zap}
      />
      <MetricCard
        title="Current Streak"
        value={`${data.currentStreak} days`}
        subtitle="Consecutive journaling"
        color="bg-gradient-to-r from-orange-500 to-orange-600"
        icon={Calendar}
      />
    </div>

    {/* Writing Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Writing Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Words Written:</span>
            <span className="font-semibold">
              {data.totalWords.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average Words per Entry:</span>
            <span className="font-semibold">{data.avgWordsPerEntry}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Most Productive Session:</span>
            <span className="font-semibold">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Most Common Emotions
        </h3>
        {data.topEmotions.length > 0 ? (
          <div className="space-y-3">
            {data.topEmotions.map((emotion, index) => (
              <div
                key={emotion.emotion}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 capitalize font-medium">
                  {emotion.emotion}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500`}
                      style={{
                        backgroundColor: colors[index % colors.length],
                        width: `${
                          (emotion.count / data.topEmotions[0].count) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {emotion.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No emotion data available yet.
          </p>
        )}
      </div>
    </div>
  </div>
);

// Metric Card Component
const MetricCard = ({ title, value, subtitle, color, icon: Icon }) => (
  <div className={`${color} p-6 rounded-lg text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm opacity-90 mt-1">{subtitle}</p>
      </div>
      <Icon className="w-8 h-8 opacity-80" />
    </div>
  </div>
);

// Mood Tab Component
const MoodTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Mood Trends</h2>

    {data.daily.length > 0 ? (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value}/10`, "Mood Score"]}
              labelFormatter={(value) => `Date: ${value}`}
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
    ) : (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No mood data available yet. Keep journaling to see your patterns!
        </p>
      </div>
    )}
  </div>
);

// Energy Tab Component
const EnergyTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Energy Patterns</h2>

    {data.daily.length > 0 ? (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value}/10`, "Energy Level"]}
              labelFormatter={(value) => `Date: ${value}`}
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
    ) : (
      <div className="text-center py-12">
        <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No energy data available yet. Keep journaling to see your patterns!
        </p>
      </div>
    )}
  </div>
);

// Themes Tab Component
const ThemesTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Themes</h2>

    {data.topThemes.length > 0 ? (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.topThemes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="theme"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [value, "Mentions"]} />
            <Bar dataKey="count" fill={colors[0]} />
          </BarChart>
        </ResponsiveContainer>
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

// Consistency Tab Component
const ConsistencyTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Journaling Habits</h2>

    {data.weekly.length > 0 ? (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.weekly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, "Entries"]}
              labelFormatter={(value) => `Week of ${value}`}
            />
            <Bar dataKey="entries" fill={colors[3]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No consistency data available yet. Keep journaling to see your habits!
        </p>
      </div>
    )}
  </div>
);

export default Analytics;
