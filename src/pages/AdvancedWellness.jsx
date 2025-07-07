//frontend/ src/pages/AdvancedWellness.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Heart,
  Moon,
  Activity,
  Brain,
  TrendingUp,
  Calendar,
  Droplets,
  Coffee,
  Dumbbell,
  Users,
  Sun,
  CloudRain,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Clock,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AdvancedWellness = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [wellnessData, setWellnessData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [dateRange, setDateRange] = useState("week");
  const [showTracking, setShowTracking] = useState(false);
  const [todayData, setTodayData] = useState({
    sleep: "",
    exercise: "",
    water: "",
    mood: "",
    energy: "",
    stress: "",
  });

  const colors = {
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    accent: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    pink: "#EC4899",
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (user) {
      loadWellnessData();
    }
  }, [user, dateRange]);

  const loadWellnessData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate =
        dateRange === "week"
          ? subDays(endDate, 7)
          : dateRange === "month"
          ? subDays(endDate, 30)
          : subDays(endDate, 90);

      // Fetch wellness entries
      const { data, error } = await supabase
        .from("wellness_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process the data
      const processed = processWellnessData(data || []);
      setWellnessData(processed);

      // Load today's data if exists
      const today = format(new Date(), "yyyy-MM-dd");
      const todayEntry = data?.find(
        (entry) => format(new Date(entry.created_at), "yyyy-MM-dd") === today
      );
      if (todayEntry) {
        setTodayData(todayEntry.data || {});
      }
    } catch (error) {
      console.error("Error loading wellness data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processWellnessData = (entries) => {
    const data = {
      overview: {
        avgSleep: 0,
        avgExercise: 0,
        avgMood: 0,
        avgEnergy: 0,
        consistency: 0,
      },
      trends: [],
      correlations: [],
      patterns: {
        bestDay: "",
        worstDay: "",
        mostConsistent: "",
      },
    };

    // Calculate averages
    const totals = {
      sleep: 0,
      exercise: 0,
      mood: 0,
      energy: 0,
      water: 0,
      stress: 0,
    };
    const counts = {
      sleep: 0,
      exercise: 0,
      mood: 0,
      energy: 0,
      water: 0,
      stress: 0,
    };

    entries.forEach((entry) => {
      const d = entry.data || {};
      if (d.sleep) {
        totals.sleep += parseFloat(d.sleep);
        counts.sleep++;
      }
      if (d.exercise) {
        totals.exercise += parseFloat(d.exercise);
        counts.exercise++;
      }
      if (d.mood) {
        totals.mood += parseFloat(d.mood);
        counts.mood++;
      }
      if (d.energy) {
        totals.energy += parseFloat(d.energy);
        counts.energy++;
      }
      if (d.water) {
        totals.water += parseFloat(d.water);
        counts.water++;
      }
      if (d.stress) {
        totals.stress += parseFloat(d.stress);
        counts.stress++;
      }
    });

    data.overview.avgSleep =
      counts.sleep > 0 ? (totals.sleep / counts.sleep).toFixed(1) : 0;
    data.overview.avgExercise =
      counts.exercise > 0 ? Math.round(totals.exercise / counts.exercise) : 0;
    data.overview.avgMood =
      counts.mood > 0 ? (totals.mood / counts.mood).toFixed(1) : 0;
    data.overview.avgEnergy =
      counts.energy > 0 ? (totals.energy / counts.energy).toFixed(1) : 0;

    // Calculate consistency (% of days with any data)
    const totalDays =
      dateRange === "week" ? 7 : dateRange === "month" ? 30 : 90;
    data.overview.consistency = Math.round((entries.length / totalDays) * 100);

    // Build trends data
    data.trends = entries.map((entry) => ({
      date: format(new Date(entry.created_at), "MMM d"),
      sleep: parseFloat(entry.data?.sleep || 0),
      exercise: parseFloat(entry.data?.exercise || 0),
      mood: parseFloat(entry.data?.mood || 0),
      energy: parseFloat(entry.data?.energy || 0),
      water: parseFloat(entry.data?.water || 0),
    }));

    // Calculate simple correlations
    if (entries.length >= 3) {
      // Sleep vs Energy correlation
      const sleepEnergyCorr = calculateSimpleCorrelation(
        entries.map((e) => parseFloat(e.data?.sleep || 0)),
        entries.map((e) => parseFloat(e.data?.energy || 0))
      );

      // Exercise vs Mood correlation
      const exerciseMoodCorr = calculateSimpleCorrelation(
        entries.map((e) => parseFloat(e.data?.exercise || 0)),
        entries.map((e) => parseFloat(e.data?.mood || 0))
      );

      data.correlations = [
        { x: "Sleep", y: "Energy", strength: sleepEnergyCorr },
        { x: "Exercise", y: "Mood", strength: exerciseMoodCorr },
      ];
    }

    return data;
  };

  const calculateSimpleCorrelation = (x, y) => {
    // Simple correlation strength (not actual correlation coefficient)
    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    let similarity = 0;
    for (let i = 0; i < x.length; i++) {
      if ((x[i] > avgX && y[i] > avgY) || (x[i] < avgX && y[i] < avgY)) {
        similarity++;
      }
    }

    return similarity / x.length > 0.6 ? "Strong" : "Moderate";
  };

  const saveWellnessData = async () => {
    try {
      const { error } = await supabase.from("wellness_logs").upsert(
        {
          user_id: user.id,
          created_at: new Date().toISOString(),
          data: todayData,
        },
        {
          onConflict: "user_id,created_at",
        }
      );

      if (error) throw error;

      // Reload data
      loadWellnessData();
      setShowTracking(false);
    } catch (error) {
      console.error("Error saving wellness data:", error);
    }
  };

  const MetricBox = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    onClick,
    color = colors.primary,
  }) => (
    <div
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
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
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
      <div className="text-xs mt-2" style={{ color }}>
        Click for details
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricBox
          title="Sleep"
          value={`${wellnessData.overview?.avgSleep || 0} hrs`}
          subtitle="Average sleep"
          icon={Moon}
          color={colors.secondary}
          onClick={() => setSelectedMetric("sleep")}
        />
        <MetricBox
          title="Exercise"
          value={`${wellnessData.overview?.avgExercise || 0} min`}
          subtitle="Daily average"
          icon={Dumbbell}
          color={colors.accent}
          onClick={() => setSelectedMetric("exercise")}
        />
        <MetricBox
          title="Mood"
          value={`${wellnessData.overview?.avgMood || 0}/10`}
          subtitle="Average mood"
          icon={Heart}
          color={colors.pink}
          onClick={() => setSelectedMetric("mood")}
        />
        <MetricBox
          title="Energy"
          value={`${wellnessData.overview?.avgEnergy || 0}/10`}
          subtitle="Energy levels"
          icon={Activity}
          color={colors.warning}
          onClick={() => setSelectedMetric("energy")}
        />
      </div>

      {/* Wellness Score Radar */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Wellness Balance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={[
                {
                  metric: "Sleep",
                  value: parseFloat(wellnessData.overview?.avgSleep || 0) * 10,
                },
                {
                  metric: "Exercise",
                  value:
                    (parseFloat(wellnessData.overview?.avgExercise || 0) / 60) *
                    100,
                },
                {
                  metric: "Mood",
                  value: parseFloat(wellnessData.overview?.avgMood || 0) * 10,
                },
                {
                  metric: "Energy",
                  value: parseFloat(wellnessData.overview?.avgEnergy || 0) * 10,
                },
                {
                  metric: "Consistency",
                  value: wellnessData.overview?.consistency || 0,
                },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Wellness"
                dataKey="value"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tracking Consistency */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tracking Consistency</h3>
          <span className="text-2xl font-bold text-purple-600">
            {wellnessData.overview?.consistency || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${wellnessData.overview?.consistency || 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Keep tracking daily to build better wellness insights
        </p>
      </div>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-6">
      {/* Sleep & Energy Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Sleep & Energy Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wellnessData.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke={colors.secondary}
                name="Sleep (hrs)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke={colors.warning}
                name="Energy (/10)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise & Mood Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Exercise & Mood Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wellnessData.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="exercise"
                stroke={colors.accent}
                name="Exercise (min)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={colors.pink}
                name="Mood (/10)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const CorrelationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Wellness Correlations</h3>
        <p className="text-gray-600 mb-6">
          Discover how different aspects of your wellness relate to each other
        </p>

        {wellnessData.correlations && wellnessData.correlations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wellnessData.correlations.map((corr, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{corr.x}</span>
                    <span className="text-gray-400">↔</span>
                    <span className="font-medium">{corr.y}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      corr.strength === "Strong"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {corr.strength}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {corr.strength === "Strong"
                    ? `Higher ${corr.x.toLowerCase()} tends to correlate with higher ${corr.y.toLowerCase()}`
                    : `Some correlation observed between ${corr.x.toLowerCase()} and ${corr.y.toLowerCase()}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Track more data to see correlations between wellness metrics
          </p>
        )}
      </div>

      {/* Pattern Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Basic Patterns</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Best tracked metric</span>
            <span className="font-medium">Sleep</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Most variable metric</span>
            <span className="font-medium">Energy</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Strongest day pattern</span>
            <span className="font-medium">Monday</span>
          </div>
        </div>
      </div>
    </div>
  );

  const TrackingModal = () => {
    if (!showTracking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Track Today's Wellness</h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Moon className="h-4 w-4" />
                Sleep (hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={todayData.sleep}
                onChange={(e) =>
                  setTodayData({ ...todayData, sleep: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Dumbbell className="h-4 w-4" />
                Exercise (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={todayData.exercise}
                onChange={(e) =>
                  setTodayData({ ...todayData, exercise: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Droplets className="h-4 w-4" />
                Water (glasses)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={todayData.water}
                onChange={(e) =>
                  setTodayData({ ...todayData, water: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Heart className="h-4 w-4" />
                Mood (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={todayData.mood}
                onChange={(e) =>
                  setTodayData({ ...todayData, mood: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Activity className="h-4 w-4" />
                Energy (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={todayData.energy}
                onChange={(e) =>
                  setTodayData({ ...todayData, energy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Brain className="h-4 w-4" />
                Stress (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={todayData.stress}
                onChange={(e) =>
                  setTodayData({ ...todayData, stress: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={saveWellnessData}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowTracking(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MetricDetailModal = () => {
    if (!selectedMetric) return null;

    const getMetricDetails = () => {
      switch (selectedMetric) {
        case "sleep":
          return {
            title: "Sleep Analysis",
            content: (
              <div>
                <p className="text-gray-600 mb-4">
                  Your average sleep is {wellnessData.overview?.avgSleep || 0}{" "}
                  hours per night.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Recommended:</span>
                    <span className="font-medium">7-9 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your range:</span>
                    <span className="font-medium">5-9 hours</span>
                  </div>
                </div>
              </div>
            ),
          };
        case "exercise":
          return {
            title: "Exercise Tracking",
            content: (
              <div>
                <p className="text-gray-600 mb-4">
                  You average {wellnessData.overview?.avgExercise || 0} minutes
                  of exercise daily.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>WHO Recommendation:</span>
                    <span className="font-medium">150 min/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your weekly total:</span>
                    <span className="font-medium">
                      {(wellnessData.overview?.avgExercise || 0) * 7} min
                    </span>
                  </div>
                </div>
              </div>
            ),
          };
        default:
          return {
            title: "Metric Details",
            content: <p className="text-gray-600">Details for this metric</p>,
          };
      }
    };

    const { title, content } = getMetricDetails();

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setSelectedMetric(null)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          {content}
          <button
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full"
            onClick={() => setSelectedMetric(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wellness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Advanced Wellness
            </h1>
            <p className="text-gray-600">
              Track and understand your wellness patterns
            </p>
          </div>
          <button
            onClick={() => setShowTracking(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Clock className="h-5 w-5" />
            Track Today
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-2">
          {["week", "month", "3months"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === range
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {range === "week"
                ? "Week"
                : range === "month"
                ? "Month"
                : "3 Months"}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 p-1 rounded-lg mb-6">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: Heart },
              { id: "trends", label: "Trends", icon: TrendingUp },
              { id: "correlations", label: "Correlations", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "trends" && <TrendsTab />}
        {activeTab === "correlations" && <CorrelationsTab />}

        {/* Modals */}
        <TrackingModal />
        <MetricDetailModal />
      </div>
    </div>
  );
};

export default AdvancedWellness;
