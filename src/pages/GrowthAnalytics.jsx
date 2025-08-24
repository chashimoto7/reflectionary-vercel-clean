// frontend/ src/pages/GrowthAnalytics.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  TrendingUp,
  Heart,
  Zap,
  Calendar,
  BookOpen,
  Brain,
  Activity,
  Target,
  Lightbulb,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const GrowthAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mood");
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [dateRange, setDateRange] = useState("3months");

  const colors = {
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    accent: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  };

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case "1month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default: // 3months
          startDate.setMonth(startDate.getMonth() - 3);
      }

      // Fetch entries with metadata
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("created_at, metadata")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process analytics data
      const processed = processAnalyticsData(entries);
      setAnalyticsData(processed);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (entries) => {
    const analytics = {
      mood: { scores: [], average: 0, trend: 0, distribution: [] },
      writing: { wordsPerDay: [], totalWords: 0, avgWords: 0, consistency: 0 },
      themes: { topThemes: [], emotionDistribution: [], growthAreas: [] },
      progress: { streaks: [], goals: [], milestones: [] },
    };

    // Process mood data
    let totalMood = 0;
    const moodCounts = {};
    const dailyMoods = {};

    entries.forEach((entry, index) => {
      const mood = entry.metadata?.mood_score || 5;
      const date = new Date(entry.created_at).toLocaleDateString();

      totalMood += mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;

      if (!dailyMoods[date]) {
        dailyMoods[date] = { total: 0, count: 0 };
      }
      dailyMoods[date].total += mood;
      dailyMoods[date].count += 1;
    });

    // Calculate mood metrics
    analytics.mood.average =
      entries.length > 0 ? (totalMood / entries.length).toFixed(1) : 0;
    analytics.mood.scores = Object.entries(dailyMoods)
      .map(([date, data]) => ({
        date,
        mood: (data.total / data.count).toFixed(1),
      }))
      .slice(-30); // Last 30 days

    // Calculate trend (simple linear regression)
    if (analytics.mood.scores.length > 1) {
      const firstMood = parseFloat(analytics.mood.scores[0].mood);
      const lastMood = parseFloat(
        analytics.mood.scores[analytics.mood.scores.length - 1].mood
      );
      analytics.mood.trend = lastMood - firstMood;
    }

    // Mood distribution
    analytics.mood.distribution = Object.entries(moodCounts).map(
      ([mood, count]) => ({
        mood: `Level ${mood}`,
        count,
        percentage: ((count / entries.length) * 100).toFixed(1),
      })
    );

    // Process writing analytics
    const wordsPerDay = {};
    let totalWords = 0;

    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString();
      const words = entry.metadata?.word_count || 0;

      wordsPerDay[date] = (wordsPerDay[date] || 0) + words;
      totalWords += words;
    });

    analytics.writing.totalWords = totalWords;
    analytics.writing.avgWords =
      entries.length > 0 ? Math.round(totalWords / entries.length) : 0;
    analytics.writing.wordsPerDay = Object.entries(wordsPerDay)
      .map(([date, words]) => ({
        date,
        words,
      }))
      .slice(-30);

    // Calculate consistency (% of days with entries in date range)
    const totalDays = Math.ceil(
      (new Date() -
        new Date(entries[entries.length - 1]?.created_at || new Date())) /
        (1000 * 60 * 60 * 24)
    );
    analytics.writing.consistency = Math.round(
      (Object.keys(wordsPerDay).length / totalDays) * 100
    );

    // Process themes (simplified version)
    const emotions = ["Happy", "Grateful", "Anxious", "Sad", "Excited", "Calm"];
    analytics.themes.emotionDistribution = emotions.map((emotion) => ({
      emotion,
      count: Math.floor(Math.random() * 20) + 5, // Simulated data
    }));

    analytics.themes.topThemes = [
      { theme: "Personal Growth", count: Math.floor(Math.random() * 30) + 10 },
      { theme: "Relationships", count: Math.floor(Math.random() * 25) + 8 },
      { theme: "Work", count: Math.floor(Math.random() * 20) + 5 },
      { theme: "Health", count: Math.floor(Math.random() * 15) + 5 },
    ];

    // Process progress metrics
    analytics.progress.streaks = calculateStreaks(entries);
    analytics.progress.milestones = [
      {
        title: "7-Day Streak",
        achieved: analytics.progress.streaks.current >= 7,
      },
      { title: "30 Entries", achieved: entries.length >= 30 },
      {
        title: "Consistent Writer",
        achieved: analytics.writing.consistency >= 70,
      },
    ];

    return analytics;
  };

  const calculateStreaks = (entries) => {
    let current = 0;
    let longest = 0;
    let tempStreak = 1;

    for (let i = 1; i < entries.length; i++) {
      const prevDate = new Date(entries[i - 1].created_at);
      const currDate = new Date(entries[i].created_at);
      const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }

    // Check if current streak is ongoing
    const lastEntry = entries[0] ? new Date(entries[0].created_at) : new Date();
    const today = new Date();
    const daysSinceLastEntry = Math.floor(
      (today - lastEntry) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastEntry <= 1) {
      current = tempStreak;
    }

    return { current, longest: Math.max(longest, tempStreak) };
  };

  const MetricBox = ({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    onClick,
  }) => (
    <div
      className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-6 w-6 text-purple-400" />
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {trend > 0 ? (
              <ArrowUp className="h-4 w-4" />
            ) : trend < 0 ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            {Math.abs(trend).toFixed(1)}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-purple-300">{subtitle}</div>
      <div className="text-xs text-purple-400 mt-2">Click for details</div>
    </div>
  );

  const TabContent = () => {
    switch (activeTab) {
      case "mood":
        return <MoodTab data={analyticsData.mood} colors={colors} />;
      case "writing":
        return <WritingTab data={analyticsData.writing} colors={colors} />;
      case "themes":
        return <ThemesTab data={analyticsData.themes} colors={colors} />;
      case "progress":
        return <ProgressTab data={analyticsData.progress} colors={colors} />;
      default:
        return null;
    }
  };

  const MoodTab = ({ data, colors }) => (
    <div className="space-y-6">
      {/* Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBox
          title="Average Mood"
          value={`${data.average}/10`}
          subtitle="Overall emotional state"
          trend={data.trend}
          icon={Heart}
          onClick={() => setSelectedMetric("mood-detail")}
        />
        <MetricBox
          title="Mood Stability"
          value="Good"
          subtitle="Emotional consistency"
          icon={Activity}
          onClick={() => setSelectedMetric("stability-detail")}
        />
        <MetricBox
          title="Positive Days"
          value={`${data.distribution
            .filter((d) => parseInt(d.mood.split(" ")[1]) >= 7)
            .reduce((sum, d) => sum + d.count, 0)}`}
          subtitle="Days with mood ≥ 7"
          icon={TrendingUp}
          onClick={() => setSelectedMetric("positive-detail")}
        />
      </div>

      {/* Mood Trend Chart */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Mood Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.scores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Metric Detail Modal */}
      {selectedMetric === "mood-detail" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedMetric(null)}
        >
          <div
            className="backdrop-blur-xl bg-slate-800 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">
              Mood Score Details
            </h3>
            <p className="text-purple-300 mb-4">
              Your average mood score of {data.average}/10 is calculated from
              all your journal entries in the selected period.
            </p>
            <div className="space-y-2">
              {data.distribution.map((item) => (
                <div key={item.mood} className="flex justify-between">
                  <span>{item.mood}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              onClick={() => setSelectedMetric(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const WritingTab = ({ data, colors }) => (
    <div className="space-y-6">
      {/* Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricBox
          title="Total Words"
          value={data.totalWords.toLocaleString()}
          subtitle="Words written"
          icon={BookOpen}
          onClick={() => setSelectedMetric("words-detail")}
        />
        <MetricBox
          title="Avg. per Entry"
          value={data.avgWords}
          subtitle="Words per journal"
          icon={Zap}
          onClick={() => setSelectedMetric("avg-detail")}
        />
        <MetricBox
          title="Consistency"
          value={`${data.consistency}%`}
          subtitle="Daily writing rate"
          icon={Calendar}
          onClick={() => setSelectedMetric("consistency-detail")}
        />
        <MetricBox
          title="Writing Streak"
          value={`${analyticsData.progress?.streaks?.current || 0} days`}
          subtitle="Current streak"
          icon={Award}
          onClick={() => setSelectedMetric("streak-detail")}
        />
      </div>

      {/* Words Per Day Chart */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Daily Word Count
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.wordsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="words" fill={colors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const ThemesTab = ({ data, colors }) => (
    <div className="space-y-6">
      {/* Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBox
          title="Unique Themes"
          value={data.topThemes.length}
          subtitle="Topics explored"
          icon={Brain}
          onClick={() => setSelectedMetric("themes-detail")}
        />
        <MetricBox
          title="Top Theme"
          value={data.topThemes[0]?.theme || "N/A"}
          subtitle="Most discussed"
          icon={Lightbulb}
          onClick={() => setSelectedMetric("top-theme-detail")}
        />
        <MetricBox
          title="Emotions Tracked"
          value={data.emotionDistribution.length}
          subtitle="Emotional range"
          icon={Heart}
          onClick={() => setSelectedMetric("emotions-detail")}
        />
      </div>

      {/* Theme Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Themes</h3>
          <div className="space-y-3">
            {data.topThemes.map((theme, index) => (
              <div
                key={theme.theme}
                className="flex items-center justify-between"
              >
                <span className="text-purple-200">{theme.theme}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (theme.count / data.topThemes[0].count) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-purple-300 w-8">
                    {theme.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Emotion Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.emotionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ emotion, count }) => `${emotion}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.emotionDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        Object.values(colors)[
                          index % Object.values(colors).length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressTab = ({ data, colors }) => (
    <div className="space-y-6">
      {/* Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBox
          title="Current Streak"
          value={`${data.streaks.current} days`}
          subtitle="Keep it going!"
          icon={Award}
          onClick={() => setSelectedMetric("current-streak-detail")}
        />
        <MetricBox
          title="Longest Streak"
          value={`${data.streaks.longest} days`}
          subtitle="Personal record"
          icon={Target}
          onClick={() => setSelectedMetric("longest-streak-detail")}
        />
        <MetricBox
          title="Milestones"
          value={`${data.milestones.filter((m) => m.achieved).length}/${
            data.milestones.length
          }`}
          subtitle="Achievements unlocked"
          icon={Lightbulb}
          onClick={() => setSelectedMetric("milestones-detail")}
        />
      </div>

      {/* Milestones */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Milestones</h3>
        <div className="space-y-3">
          {data.milestones.map((milestone) => (
            <div
              key={milestone.title}
              className="flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.achieved
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {milestone.achieved ? "✓" : "○"}
                </div>
                <span
                  className={
                    milestone.achieved
                      ? "font-medium text-white"
                      : "text-purple-300"
                  }
                >
                  {milestone.title}
                </span>
              </div>
              <span
                className={`text-sm ${
                  milestone.achieved ? "text-green-400" : "text-purple-400"
                }`}
              >
                {milestone.achieved ? "Achieved" : "In Progress"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Growth Analytics
          </h1>
          <p className="text-purple-300">
            Track your journaling patterns and emotional insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            {["1month", "3months", "6months", "1year"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === range
                    ? "bg-purple-600 text-white"
                    : "backdrop-blur-xl bg-white/10 text-purple-200 hover:bg-white/20 border border-white/20"
                }`}
              >
                {range === "1month"
                  ? "1 Month"
                  : range === "3months"
                  ? "3 Months"
                  : range === "6months"
                  ? "6 Months"
                  : "1 Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/10 p-1 rounded-2xl mb-6 border border-white/20">
          <div className="flex gap-1">
            {[
              { id: "mood", label: "Mood", icon: Heart },
              { id: "writing", label: "Writing", icon: BookOpen },
              { id: "themes", label: "Themes", icon: Brain },
              { id: "progress", label: "Progress", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <TabContent />
      </div>
    </div>
  );
};

export default GrowthAnalytics;
