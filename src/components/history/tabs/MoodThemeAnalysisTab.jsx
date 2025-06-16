// src/components/history/tabs/MoodThemeAnalysisTab.jsx
import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Heart,
  Brain,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Zap,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

const MoodThemeAnalysisTab = ({ entries, analytics, colors }) => {
  const [analysisView, setAnalysisView] = useState("overview"); // overview, mood, theme, correlations
  const [timeRange, setTimeRange] = useState("all");

  // Process mood and theme data
  const moodThemeData = useMemo(() => {
    return processMoodThemeData(entries, timeRange);
  }, [entries, timeRange]);

  // Calculate correlations
  const correlations = useMemo(() => {
    return calculateCorrelations(entries);
  }, [entries]);

  // Mood patterns over time
  const moodTimeline = useMemo(() => {
    return calculateMoodTimeline(entries);
  }, [entries]);

  // Theme evolution
  const themeEvolution = useMemo(() => {
    return calculateThemeEvolution(entries);
  }, [entries]);

  const processMoodThemeData = (entries, timeRange) => {
    let filteredEntries = entries;

    if (timeRange !== "all") {
      const cutoffDate = new Date();
      const days =
        timeRange === "30days" ? 30 : timeRange === "90days" ? 90 : 365;
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredEntries = entries.filter(
        (entry) => new Date(entry.created_at) >= cutoffDate
      );
    }

    const moods = {};
    const themes = {};
    const tones = {};
    const moodThemeCombos = {};
    const moodToneMatrix = {};

    filteredEntries.forEach((entry) => {
      // Count moods
      if (entry.mood) {
        moods[entry.mood] = (moods[entry.mood] || 0) + 1;
      }

      // Count themes
      if (entry.theme) {
        themes[entry.theme] = (themes[entry.theme] || 0) + 1;
      }

      // Count tones
      if (entry.tone) {
        tones[entry.tone] = (tones[entry.tone] || 0) + 1;
      }

      // Mood-theme combinations
      if (entry.mood && entry.theme) {
        const combo = `${entry.mood} + ${entry.theme}`;
        moodThemeCombos[combo] = (moodThemeCombos[combo] || 0) + 1;
      }

      // Mood-tone matrix
      if (entry.mood && entry.tone) {
        if (!moodToneMatrix[entry.mood]) {
          moodToneMatrix[entry.mood] = {};
        }
        moodToneMatrix[entry.mood][entry.tone] =
          (moodToneMatrix[entry.mood][entry.tone] || 0) + 1;
      }
    });

    return {
      moods: Object.entries(moods)
        .map(([mood, count]) => ({
          mood,
          count,
          percentage: ((count / filteredEntries.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count),

      themes: Object.entries(themes)
        .map(([theme, count]) => ({
          theme,
          count,
          percentage: ((count / filteredEntries.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count),

      tones: Object.entries(tones)
        .map(([tone, count]) => ({
          tone,
          count,
          percentage: ((count / filteredEntries.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count),

      moodThemeCombos: Object.entries(moodThemeCombos)
        .map(([combo, count]) => ({
          combo,
          count,
          percentage: ((count / filteredEntries.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      moodToneMatrix,
      totalEntries: filteredEntries.length,
    };
  };

  const calculateCorrelations = (entries) => {
    const correlations = {
      moodWordCount: [],
      themeWordCount: [],
      moodTimeOfDay: {},
      themeDayOfWeek: {},
    };

    entries.forEach((entry) => {
      const wordCount = entry.decryptedContent?.split(" ").length || 0;
      const date = new Date(entry.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

      // Mood-word count correlation
      if (entry.mood) {
        correlations.moodWordCount.push({
          mood: entry.mood,
          wordCount,
          moodScore: getMoodScore(entry.mood),
        });
      }

      // Theme-word count correlation
      if (entry.theme) {
        correlations.themeWordCount.push({
          theme: entry.theme,
          wordCount,
        });
      }

      // Mood-time correlation
      if (entry.mood) {
        const timeSlot = getTimeSlot(hour);
        if (!correlations.moodTimeOfDay[entry.mood]) {
          correlations.moodTimeOfDay[entry.mood] = {};
        }
        correlations.moodTimeOfDay[entry.mood][timeSlot] =
          (correlations.moodTimeOfDay[entry.mood][timeSlot] || 0) + 1;
      }

      // Theme-day correlation
      if (entry.theme) {
        if (!correlations.themeDayOfWeek[entry.theme]) {
          correlations.themeDayOfWeek[entry.theme] = {};
        }
        correlations.themeDayOfWeek[entry.theme][dayOfWeek] =
          (correlations.themeDayOfWeek[entry.theme][dayOfWeek] || 0) + 1;
      }
    });

    return correlations;
  };

  const calculateMoodTimeline = (entries) => {
    const monthlyMoods = {};

    entries.forEach((entry) => {
      if (!entry.mood) return;

      const date = new Date(entry.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyMoods[monthKey]) {
        monthlyMoods[monthKey] = {
          month: monthKey,
          moods: {},
          totalEntries: 0,
          avgMoodScore: 0,
        };
      }

      monthlyMoods[monthKey].moods[entry.mood] =
        (monthlyMoods[monthKey].moods[entry.mood] || 0) + 1;
      monthlyMoods[monthKey].totalEntries += 1;
    });

    return Object.values(monthlyMoods)
      .map((month) => {
        const moodScores = Object.entries(month.moods).map(
          ([mood, count]) => getMoodScore(mood) * count
        );
        const avgScore =
          moodScores.reduce((a, b) => a + b, 0) / month.totalEntries;

        return {
          ...month,
          avgMoodScore: avgScore,
          displayMonth: new Date(month.month + "-01").toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short" }
          ),
          dominantMood: Object.entries(month.moods).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0],
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateThemeEvolution = (entries) => {
    const monthlyThemes = {};

    entries.forEach((entry) => {
      if (!entry.theme) return;

      const date = new Date(entry.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyThemes[monthKey]) {
        monthlyThemes[monthKey] = {};
      }

      monthlyThemes[monthKey][entry.theme] =
        (monthlyThemes[monthKey][entry.theme] || 0) + 1;
    });

    const themes = [...new Set(entries.map((e) => e.theme).filter(Boolean))];

    return Object.entries(monthlyThemes)
      .map(([month, themeData]) => {
        const result = {
          month,
          displayMonth: new Date(month + "-01").toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          }),
        };

        themes.forEach((theme) => {
          result[theme] = themeData[theme] || 0;
        });

        return result;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getMoodScore = (mood) => {
    const moodScores = {
      happy: 5,
      excited: 5,
      grateful: 5,
      joy: 5,
      calm: 4,
      peaceful: 4,
      content: 4,
      hopeful: 4,
      neutral: 3,
      okay: 3,
      fine: 3,
      sad: 2,
      disappointed: 2,
      worried: 2,
      tired: 2,
      angry: 1,
      frustrated: 1,
      anxious: 1,
      stressed: 1,
    };

    return moodScores[mood?.toLowerCase()] || 3;
  };

  const getTimeSlot = (hour) => {
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

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
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Mood & Theme Analysis
          </h2>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "mood", label: "Mood", icon: Heart },
              { id: "theme", label: "Theme", icon: Brain },
              { id: "correlations", label: "Correlations", icon: Activity },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setAnalysisView(view.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded transition ${
                  analysisView === view.id
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <view.icon className="h-4 w-4" />
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Time</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="365days">Last Year</option>
        </select>
      </div>

      {/* Overview Tab */}
      {analysisView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    data={moodThemeData.moods}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="mood"
                  >
                    {moodThemeData.moods.map((entry, index) => (
                      <Cell
                        key={`mood-${index}`}
                        fill={colors.gradient[index % colors.gradient.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {moodThemeData.moods.slice(0, 6).map((mood, index) => (
                <div key={mood.mood} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        colors.gradient[index % colors.gradient.length],
                    }}
                  />
                  <span className="text-sm text-gray-600 truncate">
                    {mood.mood} ({mood.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Theme Distribution
              </h3>
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodThemeData.themes.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="theme"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill={colors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Mood-Theme Combinations */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Mood-Theme Combinations
              </h3>
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moodThemeData.moodThemeCombos.slice(0, 6).map((combo, index) => (
                <div key={combo.combo} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {combo.combo}
                  </div>
                  <div className="text-xs text-gray-600">
                    {combo.count} entries ({combo.percentage}%)
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(combo.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mood Analysis Tab */}
      {analysisView === "mood" && (
        <div className="space-y-6">
          {/* Mood Timeline */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mood Timeline
              </h3>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avgMoodScore"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moodThemeData.moods.map((mood, index) => (
              <div
                key={mood.mood}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {mood.mood}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        colors.gradient[index % colors.gradient.length],
                    }}
                  />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {mood.count}
                </div>
                <div className="text-sm text-gray-600">
                  {mood.percentage}% of entries
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor:
                        colors.gradient[index % colors.gradient.length],
                      width: `${mood.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Analysis Tab */}
      {analysisView === "theme" && (
        <div className="space-y-6">
          {/* Theme Evolution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Theme Evolution Over Time
              </h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={themeEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  {moodThemeData.themes.slice(0, 5).map((theme, index) => (
                    <Line
                      key={theme.theme}
                      type="monotone"
                      dataKey={theme.theme}
                      stroke={colors.gradient[index]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {moodThemeData.themes.slice(0, 5).map((theme, index) => (
                <div key={theme.theme} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.gradient[index] }}
                  />
                  <span className="text-sm text-gray-600">{theme.theme}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moodThemeData.themes.map((theme, index) => (
              <div
                key={theme.theme}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {theme.theme}
                  </span>
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {theme.count}
                </div>
                <div className="text-sm text-gray-600">
                  {theme.percentage}% of entries
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${theme.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlations Tab */}
      {analysisView === "correlations" && (
        <div className="space-y-6">
          {/* Mood vs Word Count */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mood vs Entry Length
              </h3>
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlations.moodWordCount}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="moodScore" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="wordCount" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === "moodScore" ? "Mood Score" : "Word Count",
                    ]}
                  />
                  <Scatter dataKey="wordCount" fill={colors.accent} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood-Time Correlation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mood by Time of Day
              </h3>
              <div className="space-y-3">
                {Object.entries(correlations.moodTimeOfDay)
                  .slice(0, 5)
                  .map(([mood, times]) => (
                    <div key={mood} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-gray-900 capitalize">
                        {mood}
                      </div>
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        {["Morning", "Afternoon", "Evening", "Night"].map(
                          (timeSlot) => (
                            <div key={timeSlot} className="text-center">
                              <div className="text-xs text-gray-600">
                                {timeSlot.slice(0, 3)}
                              </div>
                              <div className="text-sm font-medium">
                                {times[timeSlot] || 0}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Insights
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">
                    Most Positive Mood
                  </p>
                  <p className="text-xs text-purple-600">
                    {moodThemeData.moods.find((m) => getMoodScore(m.mood) >= 4)
                      ?.mood || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Dominant Theme
                  </p>
                  <p className="text-xs text-blue-600">
                    {moodThemeData.themes[0]?.theme || "N/A"} (
                    {moodThemeData.themes[0]?.percentage}%)
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm font-medium text-emerald-800">
                    Mood Stability
                  </p>
                  <p className="text-xs text-emerald-600">
                    {moodThemeData.moods.length} different moods tracked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodThemeAnalysisTab;
