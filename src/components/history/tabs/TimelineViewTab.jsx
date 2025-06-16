// src/components/history/tabs/TimelineViewTab.jsx
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Clock,
  TrendingUp,
  Calendar,
  Zap,
  Star,
  Pin,
  Heart,
  Brain,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TimelineViewTab = ({ entries, analytics, colors }) => {
  const [timeScale, setTimeScale] = useState("weekly"); // daily, weekly, monthly
  const [selectedMetric, setSelectedMetric] = useState("frequency"); // frequency, wordCount, mood
  const [selectedTimeRange, setSelectedTimeRange] = useState("3months");

  // Process timeline data based on scale
  const timelineData = useMemo(() => {
    const sortedEntries = entries.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    if (timeScale === "daily") {
      return processDailyData(sortedEntries);
    } else if (timeScale === "weekly") {
      return processWeeklyData(sortedEntries);
    } else {
      return processMonthlyData(sortedEntries);
    }
  }, [entries, timeScale]);

  // Calculate writing patterns
  const writingPatterns = useMemo(() => {
    return calculateWritingPatterns(entries);
  }, [entries]);

  // Calculate mood trends over time
  const moodTimeline = useMemo(() => {
    return calculateMoodTimeline(entries, timeScale);
  }, [entries, timeScale]);

  const processDailyData = (entries) => {
    const dailyData = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          frequency: 0,
          wordCount: 0,
          entries: [],
          moods: {},
          themes: {},
        };
      }

      dailyData[date].frequency += 1;
      dailyData[date].wordCount +=
        entry.decryptedContent?.split(" ").length || 0;
      dailyData[date].entries.push(entry);

      if (entry.mood) {
        dailyData[date].moods[entry.mood] =
          (dailyData[date].moods[entry.mood] || 0) + 1;
      }
      if (entry.theme) {
        dailyData[date].themes[entry.theme] =
          (dailyData[date].themes[entry.theme] || 0) + 1;
      }
    });

    return Object.values(dailyData).map((day) => ({
      ...day,
      displayDate: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      avgWordCount:
        day.frequency > 0 ? Math.round(day.wordCount / day.frequency) : 0,
      dominantMood: getMostFrequent(day.moods),
      dominantTheme: getMostFrequent(day.themes),
    }));
  };

  const processWeeklyData = (entries) => {
    const weeklyData = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          date: weekKey,
          frequency: 0,
          wordCount: 0,
          entries: [],
          moods: {},
          themes: {},
        };
      }

      weeklyData[weekKey].frequency += 1;
      weeklyData[weekKey].wordCount +=
        entry.decryptedContent?.split(" ").length || 0;
      weeklyData[weekKey].entries.push(entry);

      if (entry.mood) {
        weeklyData[weekKey].moods[entry.mood] =
          (weeklyData[weekKey].moods[entry.mood] || 0) + 1;
      }
      if (entry.theme) {
        weeklyData[weekKey].themes[entry.theme] =
          (weeklyData[weekKey].themes[entry.theme] || 0) + 1;
      }
    });

    return Object.values(weeklyData).map((week) => ({
      ...week,
      displayDate: `Week of ${new Date(week.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
      avgWordCount:
        week.frequency > 0 ? Math.round(week.wordCount / week.frequency) : 0,
      dominantMood: getMostFrequent(week.moods),
      dominantTheme: getMostFrequent(week.themes),
    }));
  };

  const processMonthlyData = (entries) => {
    const monthlyData = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: monthKey,
          frequency: 0,
          wordCount: 0,
          entries: [],
          moods: {},
          themes: {},
        };
      }

      monthlyData[monthKey].frequency += 1;
      monthlyData[monthKey].wordCount +=
        entry.decryptedContent?.split(" ").length || 0;
      monthlyData[monthKey].entries.push(entry);

      if (entry.mood) {
        monthlyData[monthKey].moods[entry.mood] =
          (monthlyData[monthKey].moods[entry.mood] || 0) + 1;
      }
      if (entry.theme) {
        monthlyData[monthKey].themes[entry.theme] =
          (monthlyData[monthKey].themes[entry.theme] || 0) + 1;
      }
    });

    return Object.values(monthlyData).map((month) => ({
      ...month,
      displayDate: new Date(month.date + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      avgWordCount:
        month.frequency > 0 ? Math.round(month.wordCount / month.frequency) : 0,
      dominantMood: getMostFrequent(month.moods),
      dominantTheme: getMostFrequent(month.themes),
    }));
  };

  const calculateWritingPatterns = (entries) => {
    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      monthlyTrends: {},
    };

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
      const month = date.toLocaleDateString("en-US", { month: "long" });

      // Time of day patterns
      const timeSlot = getTimeSlot(hour);
      patterns.timeOfDay[timeSlot] = (patterns.timeOfDay[timeSlot] || 0) + 1;

      // Day of week patterns
      patterns.dayOfWeek[dayOfWeek] = (patterns.dayOfWeek[dayOfWeek] || 0) + 1;

      // Monthly patterns
      patterns.monthlyTrends[month] = (patterns.monthlyTrends[month] || 0) + 1;
    });

    return patterns;
  };

  const calculateMoodTimeline = (entries, scale) => {
    const moodData = {};
    const moodValues = { positive: 3, neutral: 2, negative: 1 };

    entries.forEach((entry) => {
      if (!entry.mood) return;

      let key;
      const date = new Date(entry.created_at);

      if (scale === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (scale === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }

      if (!moodData[key]) {
        moodData[key] = { date: key, moodScores: [], avgMood: 0 };
      }

      // Convert mood to numeric value (simplified)
      const moodScore = getMoodScore(entry.mood);
      moodData[key].moodScores.push(moodScore);
    });

    // Calculate averages
    Object.values(moodData).forEach((item) => {
      if (item.moodScores.length > 0) {
        item.avgMood =
          item.moodScores.reduce((a, b) => a + b, 0) / item.moodScores.length;
      }
    });

    return Object.values(moodData);
  };

  const getTimeSlot = (hour) => {
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const getMostFrequent = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return null;
    return Object.entries(obj).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getMoodScore = (mood) => {
    const positiveWords = [
      "happy",
      "excited",
      "grateful",
      "hopeful",
      "calm",
      "confident",
    ];
    const negativeWords = [
      "sad",
      "angry",
      "frustrated",
      "anxious",
      "stressed",
      "worried",
    ];

    if (positiveWords.some((word) => mood.toLowerCase().includes(word)))
      return 4;
    if (negativeWords.some((word) => mood.toLowerCase().includes(word)))
      return 2;
    return 3; // neutral
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
            Timeline Analysis
          </h2>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {["daily", "weekly", "monthly"].map((scale) => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`px-3 py-1 text-sm rounded transition ${
                  timeScale === scale
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {scale.charAt(0).toUpperCase() + scale.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="frequency">Entry Frequency</option>
            <option value="wordCount">Word Count</option>
            <option value="mood">Mood Trends</option>
          </select>
        </div>
      </div>

      {/* Main Timeline Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedMetric === "frequency" && "Journaling Frequency Over Time"}
            {selectedMetric === "wordCount" && "Word Count Trends"}
            {selectedMetric === "mood" && "Mood Timeline"}
          </h3>
          <Clock className="h-5 w-5 text-purple-600" />
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === "mood" ? (
              <LineChart data={moodTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgMood"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={
                    selectedMetric === "frequency" ? "frequency" : "wordCount"
                  }
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Writing Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time of Day Pattern */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Time of Day</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(writingPatterns.timeOfDay).map(
                  ([time, count]) => ({ time, count })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
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

        {/* Day of Week Pattern */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Day of Week</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(writingPatterns.dayOfWeek).map(
                  ([day, count]) => ({ day: day.slice(0, 3), count })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={colors.accent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">
                Most Active Time
              </p>
              <p className="text-xs text-purple-600">
                {getMostFrequent(writingPatterns.timeOfDay)} (
                {writingPatterns.timeOfDay[
                  getMostFrequent(writingPatterns.timeOfDay)
                ] || 0}{" "}
                entries)
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm font-medium text-emerald-800">
                Favorite Day
              </p>
              <p className="text-xs text-emerald-600">
                {getMostFrequent(writingPatterns.dayOfWeek)} (
                {writingPatterns.dayOfWeek[
                  getMostFrequent(writingPatterns.dayOfWeek)
                ] || 0}{" "}
                entries)
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Consistency</p>
              <p className="text-xs text-blue-600">
                {timelineData.filter((d) => d.frequency > 0).length} active{" "}
                {timeScale.slice(0, -2)} periods
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Details Timeline */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Timeline
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timelineData
            .slice(-10)
            .reverse()
            .map((period, index) => (
              <div
                key={period.date}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-900 min-w-32">
                  {period.displayDate}
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {period.frequency} entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {period.wordCount} words
                    </span>
                  </div>
                  {period.dominantMood && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span className="text-sm text-gray-600">
                        {period.dominantMood}
                      </span>
                    </div>
                  )}
                  {period.dominantTheme && (
                    <div className="flex items-center gap-2">
                      <Brain className="h-3 w-3 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        {period.dominantTheme}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineViewTab;
