// src/components/history/tabs/WritingPatternsTab.jsx
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
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Activity,
  BarChart3,
} from "lucide-react";

const WritingPatternsTab = ({ entries, analytics, colors }) => {
  const [timeScale, setTimeScale] = useState("weekly"); // daily, weekly, monthly
  const [selectedMetric, setSelectedMetric] = useState("frequency"); // frequency, velocity, consistency
  const [selectedTimeRange, setSelectedTimeRange] = useState("3months");

  // Helper functions moved before useMemo to avoid scope errors
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

  // Process timeline data based on scale
  const timelineData = useMemo(() => {
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
            writingTime: 0,
          };
        }

        dailyData[date].frequency += 1;
        dailyData[date].wordCount +=
          entry.decryptedContent?.split(" ").length || 0;
        dailyData[date].entries.push(entry);

        // Estimate writing time (words per minute average: 40)
        dailyData[date].writingTime +=
          (entry.decryptedContent?.split(" ").length || 0) / 40;
      });

      return Object.values(dailyData).map((day) => ({
        ...day,
        displayDate: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        avgWordCount:
          day.frequency > 0 ? Math.round(day.wordCount / day.frequency) : 0,
        writingVelocity:
          day.writingTime > 0 ? Math.round(day.wordCount / day.writingTime) : 0,
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
            writingTime: 0,
          };
        }

        weeklyData[weekKey].frequency += 1;
        weeklyData[weekKey].wordCount +=
          entry.decryptedContent?.split(" ").length || 0;
        weeklyData[weekKey].entries.push(entry);
        weeklyData[weekKey].writingTime +=
          (entry.decryptedContent?.split(" ").length || 0) / 40;
      });

      return Object.values(weeklyData).map((week) => ({
        ...week,
        displayDate: new Date(week.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        avgWordCount:
          week.frequency > 0 ? Math.round(week.wordCount / week.frequency) : 0,
        writingVelocity:
          week.writingTime > 0
            ? Math.round(week.wordCount / week.writingTime)
            : 0,
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
            writingTime: 0,
          };
        }

        monthlyData[monthKey].frequency += 1;
        monthlyData[monthKey].wordCount +=
          entry.decryptedContent?.split(" ").length || 0;
        monthlyData[monthKey].entries.push(entry);
        monthlyData[monthKey].writingTime +=
          (entry.decryptedContent?.split(" ").length || 0) / 40;
      });

      return Object.values(monthlyData).map((month) => ({
        ...month,
        displayDate: new Date(month.date + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        avgWordCount:
          month.frequency > 0
            ? Math.round(month.wordCount / month.frequency)
            : 0,
        writingVelocity:
          month.writingTime > 0
            ? Math.round(month.wordCount / month.writingTime)
            : 0,
      }));
    };

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
    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      monthlyTrends: {},
      consistencyStreaks: [],
      peakWritingTimes: [],
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

      // Peak writing times (specific hours)
      patterns.peakWritingTimes[hour] =
        (patterns.peakWritingTimes[hour] || 0) + 1;
    });

    // Calculate consistency streaks
    const dates = entries
      .map((e) => new Date(e.created_at).toDateString())
      .sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }
    }

    patterns.consistencyStreaks = { current: currentStreak, max: maxStreak };

    return patterns;
  }, [entries]);

  // Calculate writing velocity over time
  const velocityData = useMemo(() => {
    return timelineData.map((period) => ({
      date: period.displayDate,
      velocity: period.writingVelocity,
      avgWords: period.avgWordCount,
      frequency: period.frequency,
    }));
  }, [timelineData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-purple-500/30 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-300">
              {`${item.dataKey}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Writing Patterns</h2>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            {["daily", "weekly", "monthly"].map((scale) => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`px-3 py-1 text-sm rounded transition ${
                  timeScale === scale
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
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
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="frequency">Entry Frequency</option>
            <option value="velocity">Writing Velocity</option>
            <option value="consistency">Consistency Streaks</option>
          </select>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {selectedMetric === "frequency" && "Writing Frequency Over Time"}
            {selectedMetric === "velocity" && "Writing Velocity Trends"}
            {selectedMetric === "consistency" && "Consistency Analysis"}
          </h3>
          <Edit3 className="h-5 w-5 text-purple-400" />
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === "velocity" ? (
              <LineChart data={velocityData}>
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
                  dataKey="velocity"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgWords"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={{ fill: "#EC4899", r: 4 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="displayDate"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={
                    selectedMetric === "frequency" ? "frequency" : "wordCount"
                  }
                  stroke="#8B5CF6"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Writing Pattern Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Peak Writing Times
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <p className="text-sm font-medium text-purple-300">Best Time</p>
                <p className="text-xs text-purple-200">
                  {getMostFrequent(writingPatterns.timeOfDay) || "N/A"} (
                  {writingPatterns.timeOfDay[
                    getMostFrequent(writingPatterns.timeOfDay)
                  ] || 0}{" "}
                  entries)
                </p>
              </div>
              <div className="p-3 bg-pink-600/20 rounded-lg">
                <p className="text-sm font-medium text-pink-300">Best Day</p>
                <p className="text-xs text-pink-200">
                  {getMostFrequent(writingPatterns.dayOfWeek) || "N/A"} (
                  {writingPatterns.dayOfWeek[
                    getMostFrequent(writingPatterns.dayOfWeek)
                  ] || 0}{" "}
                  entries)
                </p>
              </div>
            </div>

            {/* Time distribution bar chart */}
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(writingPatterns.timeOfDay).map(
                    ([time, count]) => ({ time, count })
                  )}
                >
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Consistency Metrics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-600/20 rounded-lg">
                <p className="text-sm font-medium text-emerald-300">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-emerald-200">
                  {writingPatterns.consistencyStreaks?.current || 0} days
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <p className="text-sm font-medium text-blue-300">
                  Longest Streak
                </p>
                <p className="text-2xl font-bold text-blue-200">
                  {writingPatterns.consistencyStreaks?.max || 0} days
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-600/20 rounded-lg">
              <p className="text-sm font-medium text-amber-300">
                Active Periods
              </p>
              <p className="text-xs text-amber-200">
                {timelineData.filter((d) => d.frequency > 0).length}{" "}
                {timeScale.slice(0, -2)} periods with entries
              </p>
            </div>

            <div className="p-3 bg-indigo-600/20 rounded-lg">
              <p className="text-sm font-medium text-indigo-300">
                Average Entry Length
              </p>
              <p className="text-xs text-indigo-200">
                {Math.round(
                  entries.reduce(
                    (sum, e) =>
                      sum + (e.decryptedContent?.split(" ").length || 0),
                    0
                  ) / entries.length
                )}{" "}
                words per entry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Timeline */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Writing Activity
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timelineData
            .slice(-10)
            .reverse()
            .map((period, index) => (
              <div
                key={period.date}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="text-sm font-medium text-gray-300 min-w-32">
                  {period.displayDate}
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      {period.frequency} entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      {period.wordCount} words
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    <span className="text-sm text-gray-300">
                      {period.writingVelocity} wpm
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WritingPatternsTab;
