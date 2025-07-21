// frontend/src/components/womenshealth/tabs/PredictiveInsightsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock,
  Zap,
  Target,
  Info,
  ChevronRight,
  Sparkles,
  Activity,
  Moon,
  Sun,
  CloudRain,
  ThermometerSun,
  Heart,
  Shield,
  Bell,
  BarChart3,
  LineChart,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Settings,
  Lightbulb,
  Database,
  RefreshCw,
} from "lucide-react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
  isValid,
  differenceInDays,
} from "date-fns";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ReferenceArea,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const PredictiveInsightsTab = ({
  colors,
  user,
  lifeStage,
  healthData = [],
  onRefreshData,
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState("symptoms");
  const [timeHorizon, setTimeHorizon] = useState("week");
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [user]);

  // Load AI-generated analytics from backend
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch AI analytics
      const analyticsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/analytics?user_id=${
          user.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        setAnalytics(data.analytics);
        setInsights(data.insights || []);
        setRecommendations(data.recommendations || []);
      }

      // Fetch health alerts
      const alertsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/alerts?user_id=${
          user.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (alertsResponse.ok) {
        const alertData = await alertsResponse.json();
        setAlerts(alertData.alerts || []);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Empty state component
  const EmptyState = ({ type = "no-data" }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Database className="w-16 h-16 text-purple-300 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        {type === "no-analytics"
          ? "Analytics Processing"
          : "Start Tracking for Predictions"}
      </h3>
      <p className="text-purple-200 max-w-md mb-6">
        {type === "no-analytics"
          ? "Your health data is being analyzed. AI predictions will appear within 24 hours of consistent tracking."
          : "Track your symptoms, cycle, and wellness daily to unlock AI-powered predictions and insights."}
      </p>
      <div className="bg-purple-600/20 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-purple-100">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Our AI analyzes your patterns to predict symptoms, identify triggers,
          and provide personalized recommendations.
        </p>
      </div>
      {type === "no-analytics" && (
        <button
          onClick={onRefreshData}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Check for Updates
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading AI predictions...</p>
      </div>
    );
  }

  if (!healthData || healthData.length === 0) {
    return <EmptyState type="no-data" />;
  }

  if (!analytics) {
    return <EmptyState type="no-analytics" />;
  }

  // Process predictions for display
  const predictions = analytics.predictions || {};
  const confidenceScore = predictions.confidence || 0;
  const hasHighConfidence = confidenceScore >= 70;

  // Format dates for predictions
  const nextPeriodDate = predictions.next_period
    ? parseISO(predictions.next_period)
    : null;
  const nextOvulationDate = predictions.next_ovulation
    ? parseISO(predictions.next_ovulation)
    : null;
  const daysUntilPeriod = nextPeriodDate
    ? differenceInDays(nextPeriodDate, new Date())
    : null;
  const daysUntilOvulation = nextOvulationDate
    ? differenceInDays(nextOvulationDate, new Date())
    : null;

  // Get symptom predictions
  const symptomForecast =
    predictions.symptom_forecast || "No specific symptoms predicted";
  const wellnessForecast =
    predictions.wellness_forecast || "Stable mood and energy expected";

  // Get wellness correlations
  const correlations = analytics.wellness_correlations || {};

  // Get life stage specific data
  const lifeStageMetrics = analytics.life_stage_metrics || {};
  const hormonalPatterns = analytics.hormonal_patterns || {};

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            AI-Powered Predictions
          </h3>
          <p className="text-purple-200 text-sm mt-1">
            Based on {healthData.length} days of tracking
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-purple-200 mb-1">Confidence</p>
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={
                    confidenceScore > 80
                      ? colors.emerald
                      : confidenceScore > 60
                      ? colors.warning
                      : colors.danger
                  }
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(confidenceScore / 100) * 176} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                {confidenceScore}%
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAlertSettings(!showAlertSettings)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((a) => !a.acknowledged)
            .map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.severity === "high"
                    ? "bg-red-500/20 border-red-500/30"
                    : "bg-yellow-500/20 border-yellow-500/30"
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 ${
                    alert.severity === "high"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.message}</p>
                  <p className="text-sm text-purple-200 mt-1">
                    {format(new Date(alert.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Prediction Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "symptoms", label: "Symptoms", icon: Activity },
          { id: "cycle", label: "Cycle", icon: Moon },
          { id: "wellness", label: "Wellness", icon: Heart },
          { id: "insights", label: "Insights", icon: Lightbulb },
        ].map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedPrediction(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedPrediction === category.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Symptom Predictions */}
      {selectedPrediction === "symptoms" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Symptom Forecast
            </h3>

            {!hasHighConfidence ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-purple-200">
                  Continue tracking to improve prediction accuracy
                </p>
              </div>
            ) : (
              <>
                <div className="bg-purple-600/20 rounded-lg p-4 mb-4">
                  <p className="text-white font-medium mb-2">Next 7 Days:</p>
                  <p className="text-purple-100">{symptomForecast}</p>
                </div>

                {/* Most Common Symptoms */}
                {analytics.symptom_summary?.most_common && (
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Your Common Symptoms
                    </h4>
                    <div className="space-y-3">
                      {analytics.symptom_summary.most_common
                        .slice(0, 5)
                        .map((symptom, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-200">
                                  {symptom.symptom}
                                </span>
                                <span className="text-sm text-purple-300">
                                  {symptom.frequency}% of days
                                </span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                                  style={{ width: `${symptom.frequency}%` }}
                                />
                              </div>
                              {symptom.phase_correlation && (
                                <p className="text-xs text-purple-300 mt-1">
                                  Most common during {symptom.phase_correlation}{" "}
                                  phase
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Symptom Trend */}
                {analytics.symptom_summary?.severity_trends && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        analytics.symptom_summary.severity_trends ===
                        "improving"
                          ? "text-green-400"
                          : analytics.symptom_summary.severity_trends ===
                            "worsening"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    />
                    <span className="text-purple-200">
                      Overall symptom severity:{" "}
                      {analytics.symptom_summary.severity_trends}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Symptom Clusters */}
          {analytics.symptom_summary?.symptom_clusters &&
            analytics.symptom_summary.symptom_clusters.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Symptom Patterns
                </h3>
                <p className="text-purple-200 mb-3">
                  These symptoms often occur together:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analytics.symptom_summary.symptom_clusters.map(
                    (cluster, index) => (
                      <span
                        key={index}
                        className="bg-purple-600/30 text-purple-100 px-3 py-1 rounded-full text-sm"
                      >
                        {cluster}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Cycle Predictions */}
      {selectedPrediction === "cycle" && lifeStage !== "menopause" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cycle Predictions
            </h3>

            {!nextPeriodDate && !hasHighConfidence ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-purple-200">
                  Track at least 2 complete cycles for accurate predictions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Next Period */}
                {nextPeriodDate && (
                  <div className="bg-red-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Next Period</p>
                        <p className="text-red-200 text-sm">
                          {format(nextPeriodDate, "EEEE, MMMM d")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {daysUntilPeriod}
                        </p>
                        <p className="text-sm text-red-200">days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Ovulation */}
                {nextOvulationDate && lifeStage === "menstrual" && (
                  <div className="bg-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          Predicted Ovulation
                        </p>
                        <p className="text-yellow-200 text-sm">
                          {format(nextOvulationDate, "EEEE, MMMM d")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {daysUntilOvulation}
                        </p>
                        <p className="text-sm text-yellow-200">days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cycle Metrics */}
                {analytics.cycle_metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-200 text-sm">Average Cycle</p>
                      <p className="text-white font-medium">
                        {analytics.cycle_metrics.average_length ||
                          "Calculating..."}{" "}
                        days
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-200 text-sm">Regularity</p>
                      <p className="text-white font-medium capitalize">
                        {analytics.cycle_metrics.regularity || "Variable"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Perimenopause specific */}
                {lifeStage === "perimenopause" && analytics.cycle_metrics && (
                  <div className="bg-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-100 font-medium">
                          Transition Stage:{" "}
                          {analytics.cycle_metrics.transition_stage || "Early"}
                        </p>
                        <p className="text-yellow-200 text-sm mt-1">
                          Cycles may be unpredictable during perimenopause
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wellness Predictions */}
      {selectedPrediction === "wellness" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Wellness Forecast
            </h3>

            <div className="bg-purple-600/20 rounded-lg p-4 mb-4">
              <p className="text-white font-medium mb-2">Expected Patterns:</p>
              <p className="text-purple-100">{wellnessForecast}</p>
            </div>

            {/* Wellness Correlations */}
            {Object.keys(correlations).length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">
                  Your Wellness Correlations
                </h4>
                <div className="space-y-3">
                  {Object.entries(correlations)
                    .filter(
                      ([key, value]) =>
                        key !== "strongest_pattern" && typeof value === "number"
                    )
                    .map(([key, value]) => {
                      const label = key
                        .replace(/_/g, " ")
                        .replace(/correlation/g, "")
                        .trim();
                      const strength = Math.abs(value);
                      const isPositive = value > 0;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-purple-200 capitalize">
                            {label}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-white/20 rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${
                                  isPositive ? "bg-green-400" : "bg-red-400"
                                }`}
                                style={{ width: `${strength * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-purple-300 w-12 text-right">
                              {(strength * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {correlations.strongest_pattern && (
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-sm text-purple-200">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      <span className="text-white">Key Pattern:</span>{" "}
                      {correlations.strongest_pattern}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Life Stage Specific Metrics */}
          {lifeStage !== "menstrual" &&
            Object.keys(lifeStageMetrics).length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {lifeStage === "perimenopause"
                    ? "Perimenopause"
                    : "Menopause"}{" "}
                  Metrics
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(lifeStageMetrics).map(([key, value]) => {
                    const label = key
                      .replace(/_/g, " ")
                      .replace(/score|index/g, "")
                      .trim();

                    return (
                      <div key={key} className="bg-white/10 rounded-lg p-3">
                        <p className="text-purple-200 text-sm capitalize">
                          {label}
                        </p>
                        <p className="text-white font-medium">
                          {typeof value === "number" ? value : value || "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}

      {/* AI Insights */}
      {selectedPrediction === "insights" && (
        <div className="space-y-6">
          {/* Health Insights */}
          {insights.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                AI Health Insights
              </h3>

              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      insight.severity === "high"
                        ? "bg-red-500/20 border-red-500/30"
                        : insight.severity === "medium"
                        ? "bg-yellow-500/20 border-yellow-500/30"
                        : "bg-blue-500/20 border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Brain
                        className={`w-5 h-5 flex-shrink-0 ${
                          insight.severity === "high"
                            ? "text-red-400"
                            : insight.severity === "medium"
                            ? "text-yellow-400"
                            : "text-blue-400"
                        }`}
                      />
                      <div>
                        <h4 className="text-white font-medium">
                          {insight.title}
                        </h4>
                        <p className="text-purple-100 text-sm mt-1">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-purple-300">
                            Type: {insight.insight_type}
                          </span>
                          <span className="text-purple-300">
                            Confidence: {insight.confidence_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <Lightbulb className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-200">
                AI insights will appear after your next analysis cycle
              </p>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Personalized Recommendations
              </h3>

              <div className="space-y-3">
                {recommendations
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return (
                      priorityOrder[a.priority] - priorityOrder[b.priority]
                    );
                  })
                  .slice(0, 5)
                  .map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/10 rounded-lg"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 flex-shrink-0 ${
                          rec.priority === "high"
                            ? "text-red-400"
                            : rec.priority === "medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {rec.recommendation}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-purple-300">
                          <span className="capitalize">{rec.category}</span>
                          {rec.evidence_based && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Evidence-based
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last Analysis Info */}
      {analytics.analyzed_at && (
        <div className="bg-purple-600/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-300" />
            <div>
              <p className="text-purple-100 text-sm">Last AI Analysis</p>
              <p className="text-white font-medium">
                {format(new Date(analytics.analyzed_at), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
          <button
            onClick={onRefreshData}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}

      {/* Alert Settings Modal */}
      {showAlertSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  Prediction Alerts
                </h3>
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-purple-200 mb-4">
                Get notified about important predictions and health insights.
              </p>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-white">Period Predictions</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-white">Symptom Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-white">Health Insights</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-white">Wellness Tips</span>
                  <input type="checkbox" className="w-4 h-4" />
                </label>
              </div>

              <button
                onClick={() => setShowAlertSettings(false)}
                className="w-full mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing X icon
const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default PredictiveInsightsTab;
