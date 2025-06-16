// src/components/wellness/tabs/WellnessOverviewTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Moon,
  Dumbbell,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Brain,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const WellnessOverviewTab = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data generation
  const generateWellnessData = () => {
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic correlated data
      const sleep = 6 + Math.random() * 3;
      const exercise = Math.random() > 0.3 ? 20 + Math.random() * 60 : 0;
      const mood = Math.min(
        10,
        Math.max(
          1,
          5 +
            (sleep - 7) * 0.8 +
            (exercise > 0 ? 1 : -0.5) +
            (Math.random() - 0.5) * 2
        )
      );
      const energy = Math.min(
        10,
        Math.max(
          1,
          4 +
            (sleep - 7) * 0.9 +
            (exercise > 0 ? 1.5 : 0) +
            (Math.random() - 0.5) * 1.5
        )
      );
      const stress = Math.min(
        10,
        Math.max(
          1,
          8 -
            (sleep - 7) * 0.5 -
            (exercise > 0 ? 1 : 0) +
            (Math.random() - 0.5) * 2
        )
      );

      data.push({
        date: date.toLocaleDateString(),
        dateShort: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        mood: parseFloat(mood.toFixed(1)),
        energy: parseFloat(energy.toFixed(1)),
        sleep: parseFloat(sleep.toFixed(1)),
        stress: parseFloat(stress.toFixed(1)),
        exercise: Math.round(exercise),
      });
    }
    return data;
  };

  const wellnessData = generateWellnessData();

  // Calculate key metrics
  const calculateMetrics = () => {
    const last7Days = wellnessData.slice(-7);
    const previous7Days = wellnessData.slice(-14, -7);

    const avgMood = last7Days.reduce((sum, d) => sum + d.mood, 0) / 7;
    const avgEnergy = last7Days.reduce((sum, d) => sum + d.energy, 0) / 7;
    const avgSleep = last7Days.reduce((sum, d) => sum + d.sleep, 0) / 7;
    const avgStress = last7Days.reduce((sum, d) => sum + d.stress, 0) / 7;
    const exerciseDays = last7Days.filter((d) => d.exercise > 0).length;

    const prevAvgMood = previous7Days.reduce((sum, d) => sum + d.mood, 0) / 7;
    const prevAvgEnergy =
      previous7Days.reduce((sum, d) => sum + d.energy, 0) / 7;

    return {
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      avgStress: avgStress.toFixed(1),
      exerciseDays,
      moodTrend: avgMood > prevAvgMood ? "up" : "down",
      energyTrend: avgEnergy > prevAvgEnergy ? "up" : "down",
    };
  };

  const metrics = calculateMetrics();

  // Wellness Score calculation
  const calculateWellnessScore = () => {
    const moodScore = parseFloat(metrics.avgMood) * 10;
    const energyScore = parseFloat(metrics.avgEnergy) * 10;
    const sleepScore = Math.min(
      100,
      Math.max(0, (parseFloat(metrics.avgSleep) - 5) * 25)
    );
    const stressScore = (10 - parseFloat(metrics.avgStress)) * 10;
    const exerciseScore = (metrics.exerciseDays / 7) * 100;

    return Math.round(
      (moodScore + energyScore + sleepScore + stressScore + exerciseScore) / 5
    );
  };

  const wellnessScore = calculateWellnessScore();

  // Goal integration data
  const wellnessGoals = [
    {
      name: "Sleep 7+ hours",
      target: 7,
      current: parseFloat(metrics.avgSleep),
      type: "sleep",
    },
    {
      name: "Exercise 4x/week",
      target: 4,
      current: metrics.exerciseDays,
      type: "exercise",
    },
    {
      name: "Maintain mood 7+",
      target: 7,
      current: parseFloat(metrics.avgMood),
      type: "mood",
    },
    {
      name: "Keep stress below 6",
      target: 6,
      current: parseFloat(metrics.avgStress),
      type: "stress",
      inverse: true,
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreRing = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wellness Score & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Score Card */}
        <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(wellnessScore / 100) * 339.292} 339.292`}
                  className={getScoreRing(wellnessScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {wellnessScore}
                  </div>
                  <div className="text-sm text-gray-500">Wellness Score</div>
                </div>
              </div>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                wellnessScore
              )}`}
            >
              {wellnessScore >= 80
                ? "Excellent"
                : wellnessScore >= 60
                ? "Good"
                : "Needs Focus"}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Mood</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.avgMood}
                </p>
                <div
                  className={`flex items-center text-xs ${
                    metrics.moodTrend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`w-3 h-3 mr-1 ${
                      metrics.moodTrend === "down" ? "rotate-180" : ""
                    }`}
                  />
                  vs last week
                </div>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Energy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.avgEnergy}
                </p>
                <div
                  className={`flex items-center text-xs ${
                    metrics.energyTrend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`w-3 h-3 mr-1 ${
                      metrics.energyTrend === "down" ? "rotate-180" : ""
                    }`}
                  />
                  vs last week
                </div>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Sleep</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.avgSleep}h
                </p>
                <p className="text-xs text-gray-500">
                  {parseFloat(metrics.avgSleep) >= 7
                    ? "On target"
                    : "Below target"}
                </p>
              </div>
              <Moon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exercise Days</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.exerciseDays}/7
                </p>
                <p className="text-xs text-gray-500">
                  {metrics.exerciseDays >= 4 ? "Great job!" : "Aim for 4+"}
                </p>
              </div>
              <Dumbbell className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Wellness Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            30-Day Wellness Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={wellnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dateShort" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", r: 3 }}
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                name="Energy"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3 }}
                name="Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep & Exercise Pattern */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Sleep & Exercise (Last 14 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={wellnessData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dateShort" tick={{ fontSize: 12 }} />
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
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sleep"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
                name="Sleep (hours)"
              />
              <Bar
                yAxisId="right"
                dataKey="exercise"
                fill="#10b981"
                fillOpacity={0.7}
                name="Exercise (min)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Wellness Goals Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wellnessGoals.map((goal, index) => {
            const progress = goal.inverse
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((goal.target - goal.current) / goal.target) * 100
                  )
                )
              : Math.min(100, (goal.current / goal.target) * 100);
            const isOnTrack = goal.inverse
              ? goal.current <= goal.target
              : goal.current >= goal.target;

            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {goal.name}
                  </p>
                  {isOnTrack ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      Current: {goal.current}
                      {goal.type === "sleep"
                        ? "h"
                        : goal.type === "exercise"
                        ? "d"
                        : ""}
                    </span>
                    <span>
                      Target: {goal.target}
                      {goal.type === "sleep"
                        ? "h"
                        : goal.type === "exercise"
                        ? "d"
                        : ""}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOnTrack ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {isOnTrack
                    ? "On track!"
                    : goal.inverse
                    ? "Reduce to meet goal"
                    : "Increase to meet goal"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Wellness Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Sleep Quality Impact
              </p>
              <p className="text-xs text-blue-700">
                Your mood averages 1.2 points higher on days with 7+ hours of
                sleep. Consider maintaining consistent bedtime.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Award className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Exercise Streak
              </p>
              <p className="text-xs text-green-700">
                You've exercised {metrics.exerciseDays} times this week! Your
                energy levels are 15% higher on exercise days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Stress Pattern Notice
              </p>
              <p className="text-xs text-yellow-700">
                Stress tends to be higher on weekdays. Consider adding a midweek
                stress-relief activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessOverviewTab;
