// src/components/wellness/tabs/WellnessDashboardTab.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Activity,
  Heart,
  Moon,
  Brain,
  Zap,
  Droplets,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  ChevronRight,
  Sparkles,
  Target,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  Flame,
} from "lucide-react";
import { format, subDays, startOfWeek, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const WellnessDashboardTab = ({ colors, user }) => {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(null);
  const [streaks, setStreaks] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntryData, setQuickEntryData] = useState({
    energy: 5,
    mood: 5,
    stress: 5,
    sleep_hours: 7,
    sleep_quality: 5,
    exercise_minutes: 0,
    water_glasses: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load today's data
      const today = new Date().toISOString().split("T")[0];
      const { data: todayEntry } = await supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (todayEntry) {
        setTodayData(todayEntry);
      }

      // Load week data for trends
      const weekAgo = subDays(new Date(), 7).toISOString().split("T")[0];
      const { data: weekEntries } = await supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", weekAgo)
        .order("date", { ascending: true });

      if (weekEntries) {
        setWeekData(weekEntries);
        calculateWellnessScore(weekEntries);
        calculateStreaks(weekEntries);
      }

      // Generate AI recommendations (mock for now)
      generateRecommendations();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWellnessScore = (entries) => {
    if (!entries || entries.length === 0) {
      setWellnessScore(null);
      return;
    }

    const recent = entries.slice(-3); // Last 3 days
    let score = 70; // Base score

    // Calculate based on various factors
    recent.forEach((entry) => {
      // Sleep impact (25% weight)
      if (entry.sleep_hours) {
        const sleepScore =
          entry.sleep_hours >= 7 && entry.sleep_hours <= 9
            ? 10
            : entry.sleep_hours >= 6 && entry.sleep_hours <= 10
            ? 7
            : 4;
        score += sleepScore * 0.25;
      }

      // Exercise impact (20% weight)
      if (entry.exercise_minutes) {
        const exerciseScore =
          entry.exercise_minutes >= 30
            ? 10
            : entry.exercise_minutes >= 15
            ? 7
            : 3;
        score += exerciseScore * 0.2;
      }

      // Mood impact (20% weight)
      if (entry.mood) {
        score += (entry.mood / 10) * 20 * 0.2;
      }

      // Energy impact (15% weight)
      if (entry.energy) {
        score += (entry.energy / 10) * 15 * 0.15;
      }

      // Stress impact (inverse, 20% weight)
      if (entry.stress) {
        score += ((10 - entry.stress) / 10) * 20 * 0.2;
      }
    });

    const finalScore = Math.round(score / recent.length);
    setWellnessScore(Math.min(100, Math.max(0, finalScore)));
  };

  const calculateStreaks = (entries) => {
    // Calculate various streaks
    const streakData = {
      wellness: 0,
      exercise: 0,
      sleep: 0,
      hydration: 0,
    };

    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate consecutive days with wellness tracking
    let currentStreak = 0;
    let lastDate = null;

    sortedEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (!lastDate || differenceInDays(entryDate, lastDate) === 1) {
        currentStreak++;
      } else if (differenceInDays(entryDate, lastDate) > 1) {
        currentStreak = 1;
      }
      lastDate = entryDate;
    });

    streakData.wellness = currentStreak;

    // Exercise streak (days with 20+ minutes)
    let exerciseStreak = 0;
    sortedEntries.reverse().forEach((entry) => {
      if (entry.exercise_minutes >= 20) {
        exerciseStreak++;
      } else {
        return false;
      }
    });
    streakData.exercise = exerciseStreak;

    // Good sleep streak (7-9 hours)
    let sleepStreak = 0;
    sortedEntries.forEach((entry) => {
      if (entry.sleep_hours >= 7 && entry.sleep_hours <= 9) {
        sleepStreak++;
      } else {
        return false;
      }
    });
    streakData.sleep = sleepStreak;

    setStreaks(streakData);
  };

  const generateRecommendations = () => {
    // Mock AI recommendations - in production, this would call your AI service
    setRecommendations([
      {
        id: 1,
        type: "insight",
        priority: "high",
        title: "Energy Pattern Detected",
        message:
          "Your energy tends to dip around 3 PM. Consider a 15-minute walk or light snack.",
        icon: Zap,
        color: colors.amber,
      },
      {
        id: 2,
        type: "suggestion",
        priority: "medium",
        title: "Sleep Optimization",
        message:
          "Going to bed 30 minutes earlier could improve your morning energy by 25%.",
        icon: Moon,
        color: colors.purple,
      },
      {
        id: 3,
        type: "celebration",
        priority: "low",
        title: "Hydration Goal Met!",
        message:
          "You've hit your water intake goal 5 days straight. Keep it up!",
        icon: Droplets,
        color: colors.cyan,
      },
    ]);
  };

  const handleQuickEntry = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("wellness_entries").upsert({
        user_id: user.id,
        date: today,
        ...quickEntryData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowQuickEntry(false);
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error("Error saving wellness data:", error);
    }
  };

  // Prepare chart data
  const getWeekChartData = () => {
    return weekData.map((entry) => ({
      date: format(new Date(entry.date), "EEE"),
      mood: entry.mood || 0,
      energy: entry.energy || 0,
      stress: entry.stress || 0,
      wellness: calculateDailyScore(entry),
    }));
  };

  const calculateDailyScore = (entry) => {
    if (!entry) return 0;
    let score = 50;

    if (entry.mood) score += (entry.mood - 5) * 3;
    if (entry.energy) score += (entry.energy - 5) * 2;
    if (entry.stress) score += (5 - entry.stress) * 2;
    if (entry.sleep_hours) score += entry.sleep_hours >= 7 ? 10 : 0;
    if (entry.exercise_minutes)
      score += Math.min(entry.exercise_minutes / 3, 10);

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  // Radar chart data for wellness dimensions
  const getRadarData = () => {
    const latestEntries = weekData.slice(-3);
    const dimensions = {
      Sleep: 0,
      Exercise: 0,
      Mood: 0,
      Energy: 0,
      Stress: 0,
      Hydration: 0,
    };

    latestEntries.forEach((entry) => {
      dimensions.Sleep += ((entry.sleep_hours || 0) / 8) * 10;
      dimensions.Exercise += Math.min(
        ((entry.exercise_minutes || 0) / 30) * 10,
        10
      );
      dimensions.Mood += entry.mood || 0;
      dimensions.Energy += entry.energy || 0;
      dimensions.Stress += entry.stress ? 10 - entry.stress : 5;
      dimensions.Hydration += Math.min(
        ((entry.water_glasses || 0) / 8) * 10,
        10
      );
    });

    return Object.entries(dimensions).map(([key, value]) => ({
      dimension: key,
      score: Math.round((value / latestEntries.length) * 10) / 10,
      fullMark: 10,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wellness Score Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              Today's Wellness Score
            </h3>
            <div className="relative">
              <div className="w-48 h-48 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={
                      wellnessScore > 70
                        ? colors.emerald
                        : wellnessScore > 40
                        ? colors.amber
                        : colors.danger
                    }
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(wellnessScore || 0) * 5.5} 999`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white">
                      {wellnessScore || "--"}
                    </div>
                    <div className="text-purple-200 text-sm">out of 100</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-purple-200 mt-4">
                {wellnessScore > 70
                  ? "You're thriving! 🌟"
                  : wellnessScore > 40
                  ? "Room for improvement 💪"
                  : "Let's focus on self-care 💙"}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Today's Metrics */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-purple-200 text-sm">Energy</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.energy || "--"}/10
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {todayData?.energy > 7
                  ? "High"
                  : todayData?.energy > 4
                  ? "Moderate"
                  : "Low"}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span className="text-purple-200 text-sm">Mood</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.mood || "--"}/10
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {todayData?.mood > 7
                  ? "Great"
                  : todayData?.mood > 4
                  ? "Good"
                  : "Low"}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-purple-200 text-sm">Stress</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.stress || "--"}/10
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {todayData?.stress < 4
                  ? "Low"
                  : todayData?.stress < 7
                  ? "Moderate"
                  : "High"}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-purple-200 text-sm">Sleep</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.sleep_hours || "--"}h
              </div>
              <div className="text-xs text-purple-300 mt-1">
                Quality: {todayData?.sleep_quality || "--"}/10
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-purple-200 text-sm">Exercise</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.exercise_minutes || 0}m
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {todayData?.exercise_minutes >= 30
                  ? "Goal met!"
                  : "Keep moving"}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="text-purple-200 text-sm">Hydration</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayData?.water_glasses || 0}
              </div>
              <div className="text-xs text-purple-300 mt-1">
                glasses of water
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Entry Button */}
      {!todayData && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Track Today's Wellness
              </h3>
              <p className="text-purple-200">
                Take 30 seconds to log your wellness metrics
              </p>
            </div>
            <button
              onClick={() => setShowQuickEntry(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Quick Entry
            </button>
          </div>
        </div>
      )}

      {/* Week Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            7-Day Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getWeekChartData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={colors.rose}
                strokeWidth={2}
                dot={{ fill: colors.rose, r: 4 }}
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke={colors.amber}
                strokeWidth={2}
                dot={{ fill: colors.amber, r: 4 }}
                name="Energy"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke={colors.cyan}
                strokeWidth={2}
                dot={{ fill: colors.cyan, r: 4 }}
                name="Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wellness Radar */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Wellness Balance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={getRadarData()}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis
                dataKey="dimension"
                stroke="rgba(255,255,255,0.5)"
              />
              <PolarRadiusAxis
                domain={[0, 10]}
                stroke="rgba(255,255,255,0.2)"
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={colors.purple}
                fill={colors.purple}
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {streaks.wellness || 0}
              </div>
              <div className="text-xs text-purple-200">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {streaks.exercise || 0}
              </div>
              <div className="text-xs text-purple-200">Exercise Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Moon className="w-8 h-8 text-indigo-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {streaks.sleep || 0}
              </div>
              <div className="text-xs text-purple-200">Good Sleep</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {weekData.length}
              </div>
              <div className="text-xs text-purple-200">Days Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI Insights & Recommendations
          </h3>
          <button className="text-purple-300 hover:text-white text-sm flex items-center gap-1 transition-colors">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/10`}>
                    <Icon className="w-5 h-5" style={{ color: rec.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                    <p className="text-purple-200 text-sm">{rec.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reflectionarian Prompt */}
        <div className="mt-4 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-300" />
            <div className="flex-1">
              <p className="text-purple-200 text-sm">
                The Reflectionarian suggests exploring: "What activities gave
                you the most energy this week?"
              </p>
            </div>
            <button className="text-purple-300 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Entry Modal */}
      {showQuickEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Quick Wellness Entry
              </h3>
              <button
                onClick={() => setShowQuickEntry(false)}
                className="text-purple-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Energy */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Energy Level
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">Low</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quickEntryData.energy}
                    onChange={(e) =>
                      setQuickEntryData({
                        ...quickEntryData,
                        energy: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-purple-300">High</span>
                  <span className="text-white font-bold ml-2 w-8">
                    {quickEntryData.energy}
                  </span>
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Mood
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">😔</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quickEntryData.mood}
                    onChange={(e) =>
                      setQuickEntryData({
                        ...quickEntryData,
                        mood: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-purple-300">😄</span>
                  <span className="text-white font-bold ml-2 w-8">
                    {quickEntryData.mood}
                  </span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Stress Level
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">Calm</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quickEntryData.stress}
                    onChange={(e) =>
                      setQuickEntryData({
                        ...quickEntryData,
                        stress: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-purple-300">Stressed</span>
                  <span className="text-white font-bold ml-2 w-8">
                    {quickEntryData.stress}
                  </span>
                </div>
              </div>

              {/* Sleep */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Sleep Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={quickEntryData.sleep_hours}
                    onChange={(e) =>
                      setQuickEntryData({
                        ...quickEntryData,
                        sleep_hours: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Sleep Quality
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quickEntryData.sleep_quality}
                    onChange={(e) =>
                      setQuickEntryData({
                        ...quickEntryData,
                        sleep_quality: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Exercise */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Exercise Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={quickEntryData.exercise_minutes}
                  onChange={(e) =>
                    setQuickEntryData({
                      ...quickEntryData,
                      exercise_minutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Water */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Water (glasses)
                </label>
                <div className="flex gap-2">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setQuickEntryData({
                          ...quickEntryData,
                          water_glasses: i + 1,
                        })
                      }
                      className={`p-2 rounded ${
                        quickEntryData.water_glasses >= i + 1
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-purple-300"
                      }`}
                    >
                      <Droplets className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleQuickEntry}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Save Entry
              </button>
              <button
                onClick={() => setShowQuickEntry(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessDashboardTab;
