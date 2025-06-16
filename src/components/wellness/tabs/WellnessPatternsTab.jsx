// src/components/wellness/tabs/WellnessPatternsTab.jsx
import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  Clock,
  Activity,
  Moon,
  Heart,
  Dumbell,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Heatmap,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const WellnessPatternsTab = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [viewType, setViewType] = useState("weekly");

  // Generate weekly pattern data
  const generateWeeklyPatterns = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      // Simulate realistic weekly patterns
      const isWeekend = index >= 5;
      const mood = isWeekend
        ? 7.2 + Math.random() * 1.5
        : 6.8 + Math.random() * 1.8;
      const energy = isWeekend
        ? 6.8 + Math.random() * 1.8
        : 6.2 + Math.random() * 2;
      const stress = isWeekend
        ? 3.5 + Math.random() * 2
        : 5.5 + Math.random() * 2.5;
      const sleep = isWeekend
        ? 7.8 + Math.random() * 1.5
        : 6.5 + Math.random() * 1.8;
      const exercise = isWeekend
        ? 45 + Math.random() * 30
        : index === 1 || index === 3
        ? 35 + Math.random() * 25
        : Math.random() * 20;

      return {
        day,
        dayName: day,
        mood: parseFloat(mood.toFixed(1)),
        energy: parseFloat(energy.toFixed(1)),
        stress: parseFloat(stress.toFixed(1)),
        sleep: parseFloat(sleep.toFixed(1)),
        exercise: Math.round(exercise),
        isWeekend,
      };
    });
  };

  const weeklyPatterns = generateWeeklyPatterns();

  // Generate time-of-day patterns
  const generateTimePatterns = () => {
    const hours = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
    return hours.map((hour, index) => {
      let mood, energy;

      // Simulate realistic daily energy/mood patterns
      switch (index) {
        case 0: // 6AM
          mood = 5.5 + Math.random() * 1.5;
          energy = 6.0 + Math.random() * 2;
          break;
        case 1: // 9AM
          mood = 6.8 + Math.random() * 1.8;
          energy = 7.5 + Math.random() * 1.5;
          break;
        case 2: // 12PM
          mood = 7.2 + Math.random() * 1.3;
          energy = 7.8 + Math.random() * 1.2;
          break;
        case 3: // 3PM
          mood = 6.5 + Math.random() * 1.8;
          energy = 6.2 + Math.random() * 2;
          break;
        case 4: // 6PM
          mood = 7.0 + Math.random() * 1.5;
          energy = 6.8 + Math.random() * 1.7;
          break;
        case 5: // 9PM
          mood = 6.2 + Math.random() * 2;
          energy = 5.5 + Math.random() * 2;
          break;
        default:
          mood = 6;
          energy = 6;
      }

      return {
        time: hour,
        mood: parseFloat(mood.toFixed(1)),
        energy: parseFloat(energy.toFixed(1)),
      };
    });
  };

  const timePatterns = generateTimePatterns();

  // Generate monthly heatmap data
  const generateMonthlyHeatmap = () => {
    const data = [];
    const today = new Date();

    for (let week = 0; week < 5; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (4 - week) * 7 - (6 - day));

        if (date <= today) {
          // Generate wellness score (0-10)
          const score = 4 + Math.random() * 6;
          data.push({
            week,
            day,
            date: date.toLocaleDateString(),
            score: parseFloat(score.toFixed(1)),
            dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
          });
        }
      }
    }
    return data;
  };

  const monthlyHeatmap = generateMonthlyHeatmap();

  // Sleep pattern analysis
  const generateSleepPatterns = () => {
    return {
      weekdayAvg: 6.8,
      weekendAvg: 7.6,
      optimalBedtime: "10:30 PM",
      avgBedtime: "11:15 PM",
      sleepDebt: 2.5, // hours
      patterns: [
        {
          day: "Monday",
          bedtime: "11:30 PM",
          wakeTime: "6:30 AM",
          duration: 7.0,
          quality: 6.5,
        },
        {
          day: "Tuesday",
          bedtime: "11:00 PM",
          wakeTime: "6:30 AM",
          duration: 7.5,
          quality: 7.2,
        },
        {
          day: "Wednesday",
          bedtime: "11:45 PM",
          wakeTime: "6:30 AM",
          duration: 6.75,
          quality: 6.8,
        },
        {
          day: "Thursday",
          bedtime: "10:45 PM",
          wakeTime: "6:30 AM",
          duration: 7.75,
          quality: 8.0,
        },
        {
          day: "Friday",
          bedtime: "12:00 AM",
          wakeTime: "7:30 AM",
          duration: 7.5,
          quality: 7.5,
        },
        {
          day: "Saturday",
          bedtime: "1:00 AM",
          wakeTime: "9:00 AM",
          duration: 8.0,
          quality: 8.5,
        },
        {
          day: "Sunday",
          bedtime: "11:30 PM",
          wakeTime: "8:00 AM",
          duration: 8.5,
          quality: 8.2,
        },
      ],
    };
  };

  const sleepData = generateSleepPatterns();

  // Pattern insights
  const patternInsights = [
    {
      type: "positive",
      title: "Weekend Recovery",
      description:
        "Your mood and energy significantly improve on weekends, suggesting good work-life balance recovery.",
      metric: "+18% mood improvement",
    },
    {
      type: "attention",
      title: "Midweek Dip",
      description:
        "Wednesday shows consistently lower energy levels. Consider scheduling lighter activities.",
      metric: "15% below weekly average",
    },
    {
      type: "positive",
      title: "Exercise Correlation",
      description:
        "Days with exercise show 20% higher energy levels throughout the day.",
      metric: "+1.2 energy points",
    },
    {
      type: "attention",
      title: "Sleep Inconsistency",
      description:
        "Bedtime varies by 2+ hours. More consistent sleep schedule could improve overall wellness.",
      metric: "2.25 hour variance",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return "#10b981"; // green
    if (score >= 6) return "#f59e0b"; // yellow
    if (score >= 4) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  const getHeatmapColor = (score) => {
    const opacity = (score - 1) / 9; // normalize 1-10 to 0-1
    return `rgba(139, 92, 246, ${opacity})`; // purple with varying opacity
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Type
              </label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="weekly">Weekly Patterns</option>
                <option value="daily">Daily Rhythms</option>
                <option value="monthly">Monthly Overview</option>
                <option value="sleep">Sleep Analysis</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Pattern Recognition</p>
            <p className="text-xs text-gray-500">
              AI-powered insights from your data
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Patterns View */}
      {viewType === "weekly" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Mood & Energy */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              Weekly Mood & Energy Patterns
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: "#ec4899", r: 4 }}
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", r: 4 }}
                  name="Energy"
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", r: 4 }}
                  name="Stress"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Exercise & Sleep */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Weekly Exercise & Sleep
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  yAxisId="right"
                  dataKey="exercise"
                  fill="#10b981"
                  name="Exercise (min)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sleep"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Sleep (hours)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily Rhythms View */}
      {viewType === "daily" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Daily Energy & Mood Rhythms
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timePatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: "#ec4899", r: 5 }}
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", r: 5 }}
                  name="Energy"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Peak Energy:</strong> 12PM - 3PM
              </p>
              <p>
                <strong>Energy Dip:</strong> 3PM - 6PM (common afternoon slump)
              </p>
              <p>
                <strong>Evening Wind-down:</strong> After 9PM
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Rhythm Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Morning Person Profile
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your energy peaks in late morning (9AM-12PM). Schedule
                      important tasks during this window.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Afternoon Energy Management
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Consider a light walk or healthy snack around 3PM to
                      combat the natural energy dip.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Good Evening Routine
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your mood and energy decline naturally after 9PM,
                      supporting healthy sleep timing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Analysis View */}
      {viewType === "sleep" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-600" />
              Sleep Duration & Quality
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sleepData.patterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="duration"
                  fill="#6366f1"
                  name="Duration (hours)"
                />
                <Bar dataKey="quality" fill="#8b5cf6" name="Quality (1-10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sleep Pattern Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {sleepData.weekdayAvg}h
                  </p>
                  <p className="text-sm text-gray-600">Weekday Average</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {sleepData.weekendAvg}h
                  </p>
                  <p className="text-sm text-gray-600">Weekend Average</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Sleep Recommendations
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • Target bedtime: {sleepData.optimalBedtime} (currently{" "}
                    {sleepData.avgBedtime})
                  </li>
                  <li>• Sleep debt to recover: {sleepData.sleepDebt} hours</li>
                  <li>• Best sleep quality: Weekends (8.4/10 average)</li>
                  <li>• Improvement focus: Weekday consistency</li>
                </ul>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Moon className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Sleep Schedule Optimization
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      Moving bedtime 45 minutes earlier could improve weekday
                      sleep quality by an estimated 1.2 points.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Heatmap View */}
      {viewType === "monthly" && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Monthly Wellness Heatmap
          </h3>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
            {monthlyHeatmap.map((day, index) => (
              <div
                key={index}
                className="aspect-square rounded text-xs text-white font-medium flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: getHeatmapColor(day.score) }}
                title={`${day.date}: Wellness Score ${day.score}/10`}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {[1, 3, 5, 7, 9].map((score) => (
                <div
                  key={score}
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getHeatmapColor(score) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      {/* Pattern Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Pattern Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patternInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                insight.type === "positive"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {insight.type === "positive" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      insight.type === "positive"
                        ? "text-green-900"
                        : "text-yellow-900"
                    }`}
                  >
                    {insight.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      insight.type === "positive"
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {insight.description}
                  </p>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${
                      insight.type === "positive"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {insight.metric}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessPatternsTab;
