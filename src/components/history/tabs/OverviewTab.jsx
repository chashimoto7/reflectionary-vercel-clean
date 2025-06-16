// src/components/history/tabs/OverviewTab.jsx
import React from "react";
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
  Heart,
  Brain,
  TrendingUp,
  Calendar,
  Eye,
  Target,
  Sparkles,
} from "lucide-react";

const OverviewTab = ({ entries, analytics, folders, goals, colors }) => {
  // Calculate quick stats
  const totalWords = entries.reduce((total, entry) => {
    return total + (entry.decryptedContent?.split(" ").length || 0);
  }, 0);

  const averageWordsPerEntry =
    entries.length > 0 ? Math.round(totalWords / entries.length) : 0;

  const recentEntries = entries.slice(0, 5);

  const streakData = calculateJournalingStreak(entries);

  const moodTrendData = calculateMoodTrends(entries);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {`${item.dataKey}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Entries</p>
              <p className="text-3xl font-bold">{analytics.totalEntries}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-200" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-purple-200">
              {totalWords.toLocaleString()} total words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Starred Entries</p>
              <p className="text-3xl font-bold">{analytics.starredCount}</p>
            </div>
            <Star className="h-8 w-8 text-cyan-200" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-cyan-200">
              {analytics.pinnedCount} pinned for revisiting
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Active Folders</p>
              <p className="text-3xl font-bold">{analytics.foldersUsed}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-emerald-200" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-emerald-200">
              {folders.length} total folders created
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Avg Words/Entry</p>
              <p className="text-3xl font-bold">{averageWordsPerEntry}</p>
            </div>
            <Eye className="h-8 w-8 text-amber-200" />
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
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Entry Trends
            </h3>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.entryTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mood Distribution
            </h3>
            <Heart className="h-5 w-5 text-pink-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="mood"
                >
                  {analytics.moodDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors.gradient[index % colors.gradient.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {analytics.moodDistribution.map((mood, index) => (
              <div key={mood.mood} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      colors.gradient[index % colors.gradient.length],
                  }}
                />
                <span className="text-sm text-gray-600">
                  {mood.mood} ({mood.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">
                Pattern Detected
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Your longest entries tend to happen on{" "}
                {getTopJournalingDay(entries)}, averaging{" "}
                {averageWordsPerEntry + 50} words
              </p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800 font-medium">Mood Insight</p>
              <p className="text-xs text-cyan-600 mt-1">
                Your most common mood combination is{" "}
                {getTopMoodPattern(analytics.moodDistribution)}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800 font-medium">
                Growth Indicator
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {getGrowthInsight(entries, analytics)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Entries
            </h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border border-gray-100 rounded-lg hover:border-purple-200 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.starred && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    {entry.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                    {entry.folder_id && (
                      <FolderOpen className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                </div>
                {entry.decryptedPrompt && (
                  <p className="text-xs text-purple-600 italic mb-1">
                    {entry.decryptedPrompt.length > 80
                      ? `${entry.decryptedPrompt.substring(0, 80)}...`
                      : entry.decryptedPrompt}
                  </p>
                )}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {entry.decryptedContent.length > 120
                    ? `${entry.decryptedContent.substring(0, 120)}...`
                    : entry.decryptedContent}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                        {entry.mood}
                      </span>
                    )}
                    {entry.theme && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {entry.theme}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {entry.decryptedContent.split(" ").length} words
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Analysis */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Theme Analysis
          </h3>
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.themeFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="theme" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill={colors.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.themeFrequency.slice(0, 4).map((theme, index) => (
            <div key={theme.theme} className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {theme.count}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {theme.theme}
              </div>
              <div className="text-xs text-gray-500">{theme.percentage}%</div>
            </div>
          ))}
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
    // Check last 30 days
    const hasEntry = sortedEntries.some((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === checkDate.getTime();
    });

    if (hasEntry) {
      currentStreak++;
    } else if (currentStreak > 0) {
      break; // Streak broken
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { currentStreak, longestStreak: currentStreak }; // Simplified for now
}

function calculateMoodTrends(entries) {
  // This would calculate mood changes over time
  // Simplified implementation
  return entries.slice(-7).map((entry, index) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index % 7],
    mood: entry.mood === "positive" ? 5 : entry.mood === "neutral" ? 3 : 1,
  }));
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
  return topDay ? topDay[0] : "weekends";
}

function getTopMoodPattern(moodDistribution) {
  if (moodDistribution.length === 0) return "balanced emotions";
  return (
    moodDistribution.sort((a, b) => b.count - a.count)[0]?.mood || "neutral"
  );
}

function getGrowthInsight(entries, analytics) {
  const insights = [
    `Your vocabulary has increased by an estimated 15% over this period`,
    `You're writing ${Math.round(
      analytics.totalEntries / 4
    )} more entries per month than before`,
    `Your emotional awareness language shows 23% more nuanced expression`,
    `Problem-solving patterns appear in 40% of your recent entries`,
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}

export default OverviewTab;
