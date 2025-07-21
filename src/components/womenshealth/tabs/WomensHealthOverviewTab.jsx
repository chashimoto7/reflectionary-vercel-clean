// frontend/src/components/womenshealth/tabs/WomensHealthOverviewTab.jsx
import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Brain,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  Droplets,
  Moon,
  Sun,
  Flower2,
  Thermometer,
  Zap,
  Users,
  BookOpen,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  addDays,
  differenceInDays,
  parseISO,
  startOfDay,
  isToday,
} from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const WomensHealthOverviewTab = ({ colors, user, lifeStage, onOpenEntry }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, lifeStage]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [
        analyticsRes,
        alertsRes,
        insightsRes,
        recommendationsRes,
        summaryRes,
        todayRes,
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/womens-health/analytics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/womens-health/alerts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/womens-health/insights?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/womens-health/recommendations?limit=3`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        fetch(`${process.env.REACT_APP_API_URL}/api/user-health-summary`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/health-entries/today`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      // Process responses
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
        processAnalyticsData(data.analytics);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights || []);
      }

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(data.recommendations || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setHealthScore(data.summary?.health_score || 0);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayEntry(data.entry);
      }

      // Fetch recent entries for trend chart
      await fetchRecentEntries();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (data) => {
    if (!data) return;

    // Process predictions
    const preds = data.predictions || {};
    setPredictions({
      nextPeriod: preds.next_period,
      nextOvulation: preds.next_ovulation,
      symptomForecast: preds.symptom_forecast,
      wellnessForecast: preds.wellness_forecast,
      confidence: preds.confidence || 0,
    });

    // Process cycle info for menstrual users
    if (lifeStage === "menstrual" && data.cycle_metrics) {
      const today = new Date();
      const nextPeriod = preds.next_period ? parseISO(preds.next_period) : null;
      const daysUntilPeriod = nextPeriod
        ? differenceInDays(nextPeriod, today)
        : null;

      setCycleInfo({
        day: data.current_cycle_day || 1,
        phase: data.current_phase || "follicular",
        nextPeriod: daysUntilPeriod,
        cycleLength: data.cycle_metrics.average_length || 28,
        regularity: data.cycle_metrics.regularity || "unknown",
      });
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/health-entries/recent?days=7`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Process entries for trend visualization
        const processed = data.entries.map((entry) => ({
          date: format(parseISO(entry.entry_date), "MMM d"),
          healthScore: calculateDailyHealthScore(entry),
          symptoms: entry.symptom_entries?.length || 0,
          mood: entry.mood_score || 3,
          energy: entry.energy_level || 3,
        }));
        setRecentEntries(processed);
      }
    } catch (error) {
      console.error("Error fetching recent entries:", error);
    }
  };

  const calculateDailyHealthScore = (entry) => {
    // Simple calculation based on mood, energy, and symptom count
    const moodScore = (entry.mood_score || 3) * 20;
    const energyScore = (entry.energy_level || 3) * 20;
    const symptomPenalty = Math.min(
      (entry.symptom_entries?.length || 0) * 5,
      30
    );
    return Math.max(
      0,
      Math.min(100, moodScore + energyScore + 20 - symptomPenalty)
    );
  };

  const getCyclePhaseInfo = () => {
    const phases = {
      menstrual: { name: "Menstrual", icon: Droplets, color: "text-red-400" },
      follicular: { name: "Follicular", icon: Flower2, color: "text-pink-400" },
      ovulation: { name: "Ovulation", icon: Sun, color: "text-yellow-400" },
      luteal: { name: "Luteal", icon: Moon, color: "text-purple-400" },
    };

    return phases[cycleInfo?.phase] || phases.follicular;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "stable":
        return <Minus className="w-4 h-4 text-yellow-400" />;
      case "declining":
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "#10B981"; // green
    if (score >= 60) return "#F59E0B"; // yellow
    if (score >= 40) return "#FB923C"; // orange
    return "#EF4444"; // red
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-900/90 backdrop-blur-sm p-3 rounded-lg border border-white/20">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-purple-200">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading your health overview...</p>
      </div>
    );
  }

  // Empty state for new users
  if (!analytics && !summary) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-3">
            Welcome to Your Health Dashboard
          </h3>
          <p className="text-purple-200 mb-6">
            Start tracking your health to unlock personalized insights,
            predictions, and recommendations.
          </p>

          <div className="space-y-4">
            <button
              onClick={onOpenEntry}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Your First Entry
            </button>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-left">
              <h4 className="text-white font-medium mb-3">
                What you'll discover:
              </h4>
              <ul className="space-y-2 text-purple-200 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Personalized health score and trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    {lifeStage === "menstrual"
                      ? "Cycle predictions and phase insights"
                      : "Symptom patterns and trigger identification"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>AI-powered wellness recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    Correlation insights between lifestyle and symptoms
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const phaseInfo = lifeStage === "menstrual" ? getCyclePhaseInfo() : null;

  return (
    <div className="p-6 space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1">Health Alerts</h4>
              <div className="space-y-2">
                {alerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {getAlertIcon(alert.severity)}
                    <p className="text-yellow-100 text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="text-yellow-300 hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Health Score & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Health Score</h3>
            <Heart className="w-6 h-6 text-pink-300" />
          </div>

          <div className="relative h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[
                  {
                    value: healthScore || 0,
                    fill: getHealthScoreColor(healthScore || 0),
                  },
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="value"
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill={getHealthScoreColor(healthScore || 0)}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {healthScore || 0}
                </p>
                <p className="text-sm text-purple-200">/ 100</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-purple-200 text-sm">Overall Health</span>
            {summary?.wellness_trend && getTrendIcon(summary.wellness_trend)}
          </div>
        </div>

        {/* Cycle/Life Stage Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {lifeStage === "menstrual" ? "Cycle Status" : "Life Stage"}
            </h3>
            {lifeStage === "menstrual" ? (
              <Calendar className="w-6 h-6 text-purple-300" />
            ) : (
              <Flower2 className="w-6 h-6 text-purple-300" />
            )}
          </div>

          {lifeStage === "menstrual" && cycleInfo ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <phaseInfo.icon className={`w-8 h-8 ${phaseInfo.color}`} />
                <div>
                  <p className="text-white font-medium">
                    {phaseInfo.name} Phase
                  </p>
                  <p className="text-purple-200 text-sm">Day {cycleInfo.day}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Next Period</span>
                  <span className="text-white font-medium">
                    {cycleInfo.nextPeriod !== null
                      ? `${cycleInfo.nextPeriod} days`
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">
                    Cycle Regularity
                  </span>
                  <span className="text-white font-medium capitalize">
                    {cycleInfo.regularity}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Flower2 className={`w-8 h-8 text-purple-400`} />
                <div>
                  <p className="text-white font-medium capitalize">
                    {lifeStage}
                  </p>
                  <p className="text-purple-200 text-sm">
                    {analytics?.life_stage_metrics?.transition_stage ||
                      "Active phase"}
                  </p>
                </div>
              </div>

              {lifeStage === "perimenopause" &&
                analytics?.life_stage_metrics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">
                        Months since period
                      </span>
                      <span className="text-white">
                        {analytics.life_stage_metrics.months_since_period || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Transition stage</span>
                      <span className="text-white capitalize">
                        {analytics.perimenopause_analysis?.transition_stage ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                )}

              {lifeStage === "menopause" && analytics?.life_stage_metrics && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">
                      Years post-menopause
                    </span>
                    <span className="text-white">
                      {Math.floor(
                        analytics.life_stage_metrics.months_post_menopause / 12
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Symptom burden</span>
                    <span className="text-white">
                      {analytics.life_stage_metrics.symptom_severity_index < 30
                        ? "Low"
                        : analytics.life_stage_metrics.symptom_severity_index <
                          60
                        ? "Moderate"
                        : "High"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Status</h3>
            <Clock className="w-6 h-6 text-purple-300" />
          </div>

          {todayEntry ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-200 text-xs mb-1">Mood</p>
                  <p className="text-white font-medium">
                    {todayEntry.mood_score || 3}/5
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-200 text-xs mb-1">Energy</p>
                  <p className="text-white font-medium">
                    {todayEntry.energy_level || 3}/5
                  </p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-purple-200 text-xs mb-1">Symptoms</p>
                <p className="text-white font-medium">
                  {todayEntry.symptom_entries?.length || 0} logged
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-purple-200 mb-3">No entry for today</p>
              <button
                onClick={onOpenEntry}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Predictions & Insights */}
      {predictions && Object.keys(predictions).length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <h3 className="text-lg font-semibold text-white">
                AI Predictions
              </h3>
            </div>
            <span className="text-sm text-purple-300">
              {predictions.confidence}% confidence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifeStage === "menstrual" && predictions.nextPeriod && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-purple-200">Next Period</span>
                  <Droplets className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-lg font-semibold text-white">
                  {format(parseISO(predictions.nextPeriod), "MMM d")}
                </p>
              </div>
            )}

            {lifeStage === "menstrual" && predictions.nextOvulation && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-purple-200">Ovulation</span>
                  <Sun className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-lg font-semibold text-white">
                  {format(parseISO(predictions.nextOvulation), "MMM d")}
                </p>
              </div>
            )}

            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-purple-200">
                  Symptom Forecast
                </span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-white text-sm">
                {predictions.symptomForecast || "No data"}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-purple-200">Wellness Trend</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white text-sm">
                {predictions.wellnessForecast || "Stable"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Trends */}
      {recentEntries.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Trends</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-purple-200">Health Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span className="text-purple-200">Symptoms</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentEntries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, r: 6 }}
                  name="Health Score"
                />
                <Line
                  type="monotone"
                  dataKey="symptoms"
                  stroke={colors.secondary}
                  strokeWidth={3}
                  dot={{ fill: colors.secondary, r: 6 }}
                  name="Symptom Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Key Insights</h3>
              <Lightbulb className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        insight.severity === "high"
                          ? "bg-red-400"
                          : insight.severity === "medium"
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {insight.title}
                      </p>
                      <p className="text-purple-200 text-xs mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Recommendations
              </h3>
              <Target className="w-5 h-5 text-green-300" />
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-300 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{rec.recommendation}</p>
                    <p className="text-green-300 text-xs mt-1">
                      {rec.category} • Priority: {rec.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onOpenEntry}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Entry
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/20">
          <Calendar className="w-4 h-4" />
          View Calendar
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/20">
          <BookOpen className="w-4 h-4" />
          Health Library
        </button>
      </div>
    </div>
  );
};

export default WomensHealthOverviewTab;
