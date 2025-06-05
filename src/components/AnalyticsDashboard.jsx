import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { AnalyticsService } from "../services/AnalyticsService";
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
} from "lucide-react";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("3months"); // 1month, 3months, 6months, 1year
  const [cycleTracking, setCycleTracking] = useState(false);

  // Load analytics data on component mount
  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Get the date range for analysis
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

      // Load existing analytics data from Supabase
      const { data: existingAnalytics } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("analysis_date", startDate.toISOString())
        .lte("analysis_date", endDate.toISOString())
        .order("analysis_date", { ascending: true });

      // Load cycle tracking preference
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("cycle_tracking_enabled")
        .eq("user_id", user.id)
        .single();

      setCycleTracking(userProfile?.cycle_tracking_enabled || false);

      // Process and aggregate the analytics data
      const processedData = await processAnalyticsData(
        existingAnalytics,
        startDate,
        endDate
      );
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = async (rawData, startDate, endDate) => {
    // This function aggregates and processes the raw analytics data
    // into formats suitable for visualization

    const processedData = {
      overview: {
        totalEntries: rawData.length,
        averageMood: calculateAverageMood(rawData),
        averageEnergy: calculateAverageEnergy(rawData),
        mostCommonThemes: extractTopThemes(rawData),
        journalingStreak: calculateJournalingStreak(rawData),
      },
      sentiment: {
        daily: aggregateDailySentiment(rawData),
        weekly: aggregateWeeklySentiment(rawData),
        monthly: aggregateMonthlySentiment(rawData),
        emotions: aggregateEmotionDistribution(rawData),
      },
      mood: {
        daily: aggregateDailyMood(rawData),
        patterns: identifyMoodPatterns(rawData),
        correlations: findMoodCorrelations(rawData),
      },
      energy: {
        daily: aggregateDailyEnergy(rawData),
        patterns: identifyEnergyPatterns(rawData),
        correlations: findEnergyCorrelations(rawData),
      },
      themes: {
        topThemes: extractTopThemes(rawData),
        themeEvolution: trackThemeEvolution(rawData),
        emergingThemes: identifyEmergingThemes(rawData),
      },
      behavioral: {
        journalingHabits: analyzeJournalingHabits(rawData),
        activityPatterns: identifyActivityPatterns(rawData),
        socialDynamics: analyzeSocialDynamics(rawData),
      },
      cognitive: {
        thinkingPatterns: analyzeThinkingPatterns(rawData),
        problemSolving: analyzeProblemSolving(rawData),
        growthIndicators: identifyGrowthIndicators(rawData),
      },
      wellness: {
        selfCarePatterns: analyzeSelfCarePatterns(rawData),
        stressIndicators: identifyStressIndicators(rawData),
        sleepPatterns: analyzeSleepPatterns(rawData),
      },
    };

    return processedData;
  };

  // Helper functions for data processing
  const calculateAverageMood = (data) => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, entry) => acc + (entry.mood_score || 0), 0);
    return (sum / data.length).toFixed(1);
  };

  const calculateAverageEnergy = (data) => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, entry) => acc + (entry.energy_level || 0), 0);
    return (sum / data.length).toFixed(1);
  };

  const extractTopThemes = (data) => {
    const themeCount = {};
    data.forEach((entry) => {
      if (entry.emotional_themes) {
        entry.emotional_themes.forEach((theme) => {
          themeCount[theme] = (themeCount[theme] || 0) + 1;
        });
      }
    });

    return Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
  };

  const calculateJournalingStreak = (data) => {
    // Calculate current journaling streak
    const sortedDates = data
      .map((entry) => new Date(entry.analysis_date).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const aggregateDailySentiment = (data) => {
    const dailyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { positive: 0, negative: 0, neutral: 0, count: 0 };
      }
      dailyData[date].positive += entry.sentiment_positive || 0;
      dailyData[date].negative += entry.sentiment_negative || 0;
      dailyData[date].neutral += entry.sentiment_neutral || 0;
      dailyData[date].count++;
    });

    return Object.entries(dailyData).map(([date, sentiment]) => ({
      date,
      positive: (sentiment.positive / sentiment.count).toFixed(2),
      negative: (sentiment.negative / sentiment.count).toFixed(2),
      neutral: (sentiment.neutral / sentiment.count).toFixed(2),
    }));
  };

  const aggregateWeeklySentiment = (data) => {
    // Group data by week and calculate average sentiment
    const weeklyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date);
      const weekStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay()
      );
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          count: 0,
        };
      }
      weeklyData[weekKey].positive += entry.sentiment_positive || 0;
      weeklyData[weekKey].negative += entry.sentiment_negative || 0;
      weeklyData[weekKey].neutral += entry.sentiment_neutral || 0;
      weeklyData[weekKey].count++;
    });

    return Object.entries(weeklyData).map(([week, sentiment]) => ({
      week,
      positive: (sentiment.positive / sentiment.count).toFixed(2),
      negative: (sentiment.negative / sentiment.count).toFixed(2),
      neutral: (sentiment.neutral / sentiment.count).toFixed(2),
    }));
  };

  const aggregateMonthlySentiment = (data) => {
    // Group data by month and calculate average sentiment
    const monthlyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          count: 0,
        };
      }
      monthlyData[monthKey].positive += entry.sentiment_positive || 0;
      monthlyData[monthKey].negative += entry.sentiment_negative || 0;
      monthlyData[monthKey].neutral += entry.sentiment_neutral || 0;
      monthlyData[monthKey].count++;
    });

    return Object.entries(monthlyData).map(([month, sentiment]) => ({
      month,
      positive: (sentiment.positive / sentiment.count).toFixed(2),
      negative: (sentiment.negative / sentiment.count).toFixed(2),
      neutral: (sentiment.neutral / sentiment.count).toFixed(2),
    }));
  };

  const aggregateEmotionDistribution = (data) => {
    const emotionCount = {};
    data.forEach((entry) => {
      if (entry.emotional_themes) {
        entry.emotional_themes.forEach((emotion) => {
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
      }
    });

    return Object.entries(emotionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([emotion, count]) => ({ emotion, count }));
  };

  const aggregateDailyMood = (data) => {
    const dailyMood = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toDateString();
      if (!dailyMood[date]) {
        dailyMood[date] = { mood: 0, count: 0 };
      }
      dailyMood[date].mood += entry.mood_score || 0;
      dailyMood[date].count++;
    });

    return Object.entries(dailyMood).map(([date, mood]) => ({
      date,
      mood: (mood.mood / mood.count).toFixed(1),
    }));
  };

  const aggregateDailyEnergy = (data) => {
    const dailyEnergy = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toDateString();
      if (!dailyEnergy[date]) {
        dailyEnergy[date] = { energy: 0, count: 0 };
      }
      dailyEnergy[date].energy += entry.energy_level || 0;
      dailyEnergy[date].count++;
    });

    return Object.entries(dailyEnergy).map(([date, energy]) => ({
      date,
      energy: (energy.energy / energy.count).toFixed(1),
    }));
  };

  // Placeholder functions for advanced analysis (to be implemented)
  const identifyMoodPatterns = (data) => {
    // Analyze cyclical patterns in mood data
    return { weeklyPattern: [], monthlyPattern: [], seasonalPattern: [] };
  };

  const findMoodCorrelations = (data) => {
    // Find correlations between mood and various factors
    return { weather: 0, activities: [], relationships: [] };
  };

  const identifyEnergyPatterns = (data) => {
    // Analyze patterns in energy levels
    return { dailyPattern: [], weeklyPattern: [] };
  };

  const findEnergyCorrelations = (data) => {
    // Find correlations between energy and various factors
    return { sleep: 0, activities: [], time: [] };
  };

  const trackThemeEvolution = (data) => {
    // Track how themes evolve over time
    return [];
  };

  const identifyEmergingThemes = (data) => {
    // Identify new themes appearing in recent entries
    return [];
  };

  const analyzeJournalingHabits = (data) => {
    // Analyze when and how often user journals
    return { frequency: 0, bestTimes: [], consistency: 0 };
  };

  const identifyActivityPatterns = (data) => {
    // Identify patterns in mentioned activities
    return [];
  };

  const analyzeSocialDynamics = (data) => {
    // Analyze mentions of people and relationships
    return { relationships: [], sentiment: {} };
  };

  const analyzeThinkingPatterns = (data) => {
    // Analyze cognitive patterns in entries
    return { patterns: [], distortions: [] };
  };

  const analyzeProblemSolving = (data) => {
    // Analyze problem-solving approaches
    return { approaches: [], effectiveness: 0 };
  };

  const identifyGrowthIndicators = (data) => {
    // Identify indicators of personal growth
    return { indicators: [], trends: [] };
  };

  const analyzeSelfCarePatterns = (data) => {
    // Analyze self-care mentions and patterns
    return { activities: [], frequency: 0 };
  };

  const identifyStressIndicators = (data) => {
    // Identify stress indicators in entries
    return { indicators: [], trends: [] };
  };

  const analyzeSleepPatterns = (data) => {
    // Analyze sleep-related mentions
    return { quality: 0, patterns: [] };
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "sentiment", label: "Sentiment", icon: Heart },
    { id: "mood", label: "Mood & Energy", icon: Zap },
    { id: "themes", label: "Themes", icon: BookOpen },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "cognitive", label: "Cognitive", icon: Brain },
    { id: "wellness", label: "Wellness", icon: Heart },
  ];

  const colors = [
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#6366F1",
    "#84CC16",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
        <p className="text-gray-600">Insights from your journaling journey</p>

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
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  if (!data) return <div className="p-6">Loading overview data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Total Entries</h3>
          <p className="text-3xl font-bold">{data.totalEntries}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Average Mood</h3>
          <p className="text-3xl font-bold">{data.averageMood}/10</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Average Energy</h3>
          <p className="text-3xl font-bold">{data.averageEnergy}/10</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
          <p className="text-3xl font-bold">{data.journalingStreak} days</p>
        </div>
      </div>

      {/* Top Themes */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Most Common Themes
        </h3>
        <div className="space-y-3">
          {data.mostCommonThemes.map((theme, index) => (
            <div
              key={theme.theme}
              className="flex items-center justify-between"
            >
              <span className="text-gray-700 capitalize">{theme.theme}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (theme.count / data.mostCommonThemes[0].count) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500">{theme.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sentiment Tab Component
const SentimentTab = ({ data, colors }) => {
  if (!data) return <div className="p-6">Loading sentiment data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sentiment Analysis
      </h2>

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
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="positive"
                stroke={colors[0]}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="negative"
                stroke={colors[4]}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="neutral"
                stroke={colors[1]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Distribution */}
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
    </div>
  );
};

// Mood & Energy Tab Component
const MoodEnergyTab = ({ data, colors, cycleTracking }) => {
  if (!data) return <div className="p-6">Loading mood and energy data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Mood & Energy Patterns
      </h2>

      {/* Mood and Energy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Chart */}
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
                <Tooltip />
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

        {/* Energy Chart */}
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
                <Tooltip />
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
      </div>

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
          {/* Cycle correlation charts would go here */}
          <div className="text-center text-gray-500 py-8">
            Cycle correlation visualizations will be displayed here based on
            your tracking data.
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder components for other tabs
const ThemesTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Themes & Topics</h2>
    <div className="text-center text-gray-500 py-8">
      Theme analysis visualizations will be implemented here.
    </div>
  </div>
);

const BehavioralTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Behavioral Insights
    </h2>
    <div className="text-center text-gray-500 py-8">
      Behavioral analysis visualizations will be implemented here.
    </div>
  </div>
);

const CognitiveTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Cognitive Patterns
    </h2>
    <div className="text-center text-gray-500 py-8">
      Cognitive analysis visualizations will be implemented here.
    </div>
  </div>
);

const WellnessTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Wellness Metrics</h2>
    <div className="text-center text-gray-500 py-8">
      Wellness analysis visualizations will be implemented here.
    </div>
  </div>
);

export default AnalyticsDashboard;
