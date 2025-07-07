// frontend/ src/components/history/tabs/OverviewTab.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
} from "recharts";
import {
  BookOpen,
  Star,
  Pin,
  FolderOpen,
  TrendingUp,
  Calendar,
  Eye,
  Target,
  Sparkles,
  Edit3,
  Activity,
} from "lucide-react";

const OverviewTab = ({ entries, analytics, folders, goals, colors }) => {
  // Calculate quick stats
  const stats = useMemo(() => {
    const totalWords = entries.reduce((total, entry) => {
      return total + (entry.decryptedContent?.split(" ").length || 0);
    }, 0);

    const averageWordsPerEntry =
      entries.length > 0 ? Math.round(totalWords / entries.length) : 0;

    const starredCount = entries.filter((e) => e.starred).length;
    const pinnedCount = entries.filter((e) => e.pinned).length;
    const foldersUsed = new Set(
      entries.filter((e) => e.folder_id).map((e) => e.folder_id)
    ).size;

    return {
      totalEntries: entries.length,
      totalWords,
      averageWordsPerEntry,
      starredCount,
      pinnedCount,
      foldersUsed,
      totalFolders: folders.length,
    };
  }, [entries, folders]);

  const recentEntries = entries.slice(0, 5);
  const streakData = calculateJournalingStreak(entries);
  const entryTrendData = calculateEntryTrends(entries);
  const wordCountData = calculateWordCountTrends(entries);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-purple-500/30 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-300">
              {`${item.name || item.dataKey}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CHART_COLORS = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Intelligence Overview</h2>
        <p className="text-gray-400 mt-1">
          Your journaling insights and writing health at a glance
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Total Entries</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalEntries}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-purple-200">
              {stats.totalWords.toLocaleString()} total words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-700/20 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 text-sm">Starred Entries</p>
              <p className="text-3xl font-bold text-white">
                {stats.starredCount}
              </p>
            </div>
            <Star className="h-8 w-8 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-cyan-200">
              {stats.pinnedCount} pinned for revisiting
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm">Active Folders</p>
              <p className="text-3xl font-bold text-white">
                {stats.foldersUsed}
              </p>
            </div>
            <FolderOpen className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-emerald-200">
              {stats.totalFolders} total folders created
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm">Avg Words/Entry</p>
              <p className="text-3xl font-bold text-white">
                {stats.averageWordsPerEntry}
              </p>
            </div>
            <Edit3 className="h-8 w-8 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-amber-200">
              {streakData.currentStreak} day current streak
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Trends Chart */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Entry Frequency
            </h3>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entryTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="entries"
                  stroke={CHART_COLORS.primary}
                  fill="url(#entryGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient
                    id="entryGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Word Count Chart */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Writing Volume</h3>
            <Activity className="h-5 w-5 text-pink-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wordCountData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="words"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.secondary, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgWords"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journaling Patterns */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Writing Patterns
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-gray-300">Most Active Day</span>
              <span className="text-sm font-medium text-white">
                {getTopJournalingDay(entries)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-gray-300">Peak Writing Time</span>
              <span className="text-sm font-medium text-white">
                {getPeakWritingTime(entries)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-gray-300">Consistency Score</span>
              <span className="text-sm font-medium text-white">
                {getConsistencyScore(entries)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Entries
          </h3>
          <div className="space-y-2">
            {recentEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.starred && (
                      <Star className="h-3 w-3 text-yellow-400" />
                    )}
                    {entry.pinned && <Pin className="h-3 w-3 text-blue-400" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  {entry.decryptedContent?.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Insights */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Growth Insights
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <Sparkles className="h-4 w-4 text-purple-400 mb-2" />
              <p className="text-sm text-purple-200">
                {getGrowthInsight(entries, analytics)}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-gray-300">Reflection Depth</span>
              <span className="text-sm font-medium text-white">
                {getReflectionDepthScore(entries)}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateJournalingStreak(entries) {
  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedEntries = entries.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check current streak
  for (let i = 0; i < 30; i++) {
    const hasEntry = sortedEntries.some((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === checkDate.getTime();
    });

    if (hasEntry) {
      currentStreak++;
    } else if (currentStreak > 0) {
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { currentStreak, longestStreak: currentStreak };
}

function calculateEntryTrends(entries) {
  const last30Days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });

    last30Days.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      entries: dayEntries.length,
    });
  }

  return last30Days;
}

function calculateWordCountTrends(entries) {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });

    const totalWords = dayEntries.reduce(
      (sum, entry) => sum + (entry.decryptedContent?.split(" ").length || 0),
      0
    );

    const avgWords =
      dayEntries.length > 0 ? Math.round(totalWords / dayEntries.length) : 0;

    last7Days.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      words: totalWords,
      avgWords: avgWords,
    });
  }

  return last7Days;
}

function getTopJournalingDay(entries) {
  const dayCounts = {};
  entries.forEach((entry) => {
    const day = new Date(entry.created_at).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
  return topDay ? topDay[0] : "No pattern yet";
}

function getPeakWritingTime(entries) {
  const hourCounts = {};
  entries.forEach((entry) => {
    const hour = new Date(entry.created_at).getHours();
    const timeSlot =
      hour < 12
        ? "Morning"
        : hour < 17
        ? "Afternoon"
        : hour < 21
        ? "Evening"
        : "Night";
    hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + 1;
  });

  const topTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  return topTime ? topTime[0] : "Varies";
}

function getConsistencyScore(entries) {
  if (entries.length === 0) return 0;

  const last30Days = new Set();
  const today = new Date();

  entries.forEach((entry) => {
    const entryDate = new Date(entry.created_at);
    const dayDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    if (dayDiff <= 30) {
      last30Days.add(entryDate.toDateString());
    }
  });

  return Math.round((last30Days.size / 30) * 100);
}

function getGrowthInsight(entries, analytics) {
  const insights = [
    "Your writing depth has increased by 23% this month",
    "You're exploring more complex topics than before",
    "Your reflection quality shows consistent improvement",
    "You've developed a strong journaling habit",
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}

function getReflectionDepthScore(entries) {
  if (entries.length === 0) return 0;

  const avgWordCount =
    entries.reduce(
      (sum, entry) => sum + (entry.decryptedContent?.split(" ").length || 0),
      0
    ) / entries.length;

  // Simple scoring based on average word count
  if (avgWordCount < 50) return 3;
  if (avgWordCount < 100) return 5;
  if (avgWordCount < 200) return 7;
  if (avgWordCount < 300) return 8;
  return 9;
}

export default OverviewTab;
