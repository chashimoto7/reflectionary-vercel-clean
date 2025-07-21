// frontend/src/components/womenshealth/tabs/WellnessCorrelationsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Brain,
  Heart,
  Moon,
  Coffee,
  Droplets,
  TrendingUp,
  AlertCircle,
  Info,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  CloudRain,
  Sun,
  Wind,
  Pizza,
  Apple,
  Dumbbell,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Shield,
  Lightbulb,
  Clock,
  Thermometer,
  Flower2,
  HelpCircle,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  Cell,
  Legend,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const WellnessCorrelationsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [expandedCorrelation, setExpandedCorrelation] = useState(null);
  const [viewMode, setViewMode] = useState("overview"); // overview, detailed, triggers

  // Data states
  const [correlationData, setCorrelationData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [strongestCorrelations, setStrongestCorrelations] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Metric definitions based on life stage
  const getMetricDefinitions = () => {
    const baseMetrics = {
      sleep: {
        name: "Sleep Quality",
        icon: Moon,
        color: colors.primary,
        unit: "hours",
        description: "How sleep patterns affect your symptoms",
      },
      exercise: {
        name: "Physical Activity",
        icon: Activity,
        color: colors.secondary,
        unit: "minutes",
        description: "Exercise impact on hormonal balance",
      },
      stress: {
        name: "Stress Levels",
        icon: Brain,
        color: colors.accent,
        unit: "level",
        description: "Stress and symptom relationships",
      },
      nutrition: {
        name: "Nutrition Quality",
        icon: Apple,
        color: colors.emerald,
        unit: "score",
        description: "Diet impact on wellness",
      },
      hydration: {
        name: "Hydration",
        icon: Droplets,
        color: colors.blue,
        unit: "glasses",
        description: "Water intake and symptom correlation",
      },
    };

    // Add life stage specific metrics
    if (lifeStage === "menstrual") {
      baseMetrics.cycle = {
        name: "Cycle Phase",
        icon: Flower2,
        color: colors.pink,
        unit: "phase",
        description: "How cycle phases affect wellness",
      };
    } else if (lifeStage === "perimenopause" || lifeStage === "menopause") {
      baseMetrics.temperature = {
        name: "Temperature Triggers",
        icon: Thermometer,
        color: colors.danger,
        unit: "triggers",
        description: "Environmental factors and hot flashes",
      };
      baseMetrics.hormonal = {
        name: "Hormonal Fluctuations",
        icon: Zap,
        color: colors.warning,
        unit: "level",
        description: "Hormone changes and symptoms",
      };
    }

    return baseMetrics;
  };

  const metricDefinitions = getMetricDefinitions();

  useEffect(() => {
    fetchCorrelationData();
  }, [selectedTimeRange, user?.id]);

  const fetchCorrelationData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch analytics data with correlations
      const [analyticsRes, insightsRes, recommendationsRes] = await Promise.all(
        [
          fetch(
            `${process.env.REACT_APP_API_URL}/api/womens-health/analytics`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          fetch(`${process.env.REACT_APP_API_URL}/api/womens-health/insights`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(
            `${process.env.REACT_APP_API_URL}/api/womens-health/recommendations`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]
      );

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        processCorrelationData(data.analytics);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights.filter((i) => i.insight_type === "wellness"));
      }

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(
          data.recommendations.filter((r) =>
            ["lifestyle", "nutrition", "exercise", "stress"].includes(
              r.category
            )
          )
        );
      }
    } catch (error) {
      console.error("Error fetching correlation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processCorrelationData = (analyticsData) => {
    if (!analyticsData?.wellness_correlations) return;

    const correlations = analyticsData.wellness_correlations;
    const processed = {};

    // Process base correlations
    if (lifeStage === "menstrual") {
      processed.mood_cycle = {
        value: correlations.mood_cycle_correlation || 0,
        strength: getCorrelationStrength(correlations.mood_cycle_correlation),
        direction:
          correlations.mood_cycle_correlation > 0 ? "positive" : "negative",
      };
      processed.energy_cycle = {
        value: correlations.energy_cycle_correlation || 0,
        strength: getCorrelationStrength(correlations.energy_cycle_correlation),
        direction:
          correlations.energy_cycle_correlation > 0 ? "positive" : "negative",
      };
    } else {
      processed.mood_symptom = {
        value: correlations.mood_symptom_correlation || 0,
        strength: getCorrelationStrength(correlations.mood_symptom_correlation),
        direction:
          correlations.mood_symptom_correlation > 0 ? "positive" : "negative",
      };
      processed.energy_sleep = {
        value: correlations.energy_sleep_correlation || 0,
        strength: getCorrelationStrength(correlations.energy_sleep_correlation),
        direction:
          correlations.energy_sleep_correlation > 0 ? "positive" : "negative",
      };
    }

    // Common correlations
    processed.stress_symptom = {
      value: correlations.stress_symptom_correlation || 0,
      strength: getCorrelationStrength(correlations.stress_symptom_correlation),
      direction:
        correlations.stress_symptom_correlation > 0 ? "positive" : "negative",
    };
    processed.sleep_mood = {
      value: correlations.sleep_mood_correlation || 0,
      strength: getCorrelationStrength(correlations.sleep_mood_correlation),
      direction:
        correlations.sleep_mood_correlation > 0 ? "positive" : "negative",
    };

    // Life stage specific
    if (
      lifeStage !== "menstrual" &&
      correlations.hot_flash_stress_correlation
    ) {
      processed.hot_flash_stress = {
        value: correlations.hot_flash_stress_correlation || 0,
        strength: getCorrelationStrength(
          correlations.hot_flash_stress_correlation
        ),
        direction:
          correlations.hot_flash_stress_correlation > 0
            ? "positive"
            : "negative",
      };
    }

    setCorrelationData(processed);

    // Extract strongest correlations
    const strongest = Object.entries(processed)
      .map(([key, data]) => ({
        name: key,
        ...data,
        absValue: Math.abs(data.value),
      }))
      .sort((a, b) => b.absValue - a.absValue)
      .slice(0, 5);

    setStrongestCorrelations(strongest);

    // Process triggers if available
    if (analyticsData.life_stage_metrics?.hot_flash_frequency) {
      processTriggers(analyticsData);
    }
  };

  const processTriggers = (analyticsData) => {
    // Extract trigger patterns from analytics
    const triggerData = [];

    if (analyticsData.hormonal_patterns?.hot_flash_patterns?.trigger_patterns) {
      triggerData.push(
        ...analyticsData.hormonal_patterns.hot_flash_patterns.trigger_patterns.map(
          (t) => ({
            trigger: t,
            type: "hot_flash",
            frequency: "common",
          })
        )
      );
    }

    setTriggers(triggerData);
  };

  const getCorrelationStrength = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return "strong";
    if (absValue >= 0.4) return "moderate";
    if (absValue >= 0.2) return "weak";
    return "negligible";
  };

  const getCorrelationColor = (strength) => {
    switch (strength) {
      case "strong":
        return "text-purple-400";
      case "moderate":
        return "text-blue-400";
      case "weak":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getCorrelationIcon = (direction, strength) => {
    if (strength === "negligible")
      return <Minus className="w-4 h-4 text-gray-400" />;
    if (direction === "positive")
      return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  };

  // Format correlation name for display
  const formatCorrelationName = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" → ");
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-900/90 backdrop-blur-sm p-3 rounded-lg border border-white/20">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-purple-200">
              {entry.name}: {entry.value.toFixed(2)}
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
        <p className="text-purple-200">Analyzing wellness correlations...</p>
      </div>
    );
  }

  // Empty state
  if (!correlationData || Object.keys(correlationData).length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-3">
            No Correlation Data Yet
          </h3>
          <p className="text-purple-200 mb-6">
            Track your wellness metrics for at least a week to discover
            meaningful patterns and correlations.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-left space-y-4">
            <h4 className="text-white font-medium mb-3">
              Start tracking these key metrics:
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm font-medium">
                    Sleep Quality
                  </p>
                  <p className="text-purple-300 text-xs">
                    Track hours and quality each night
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm font-medium">
                    Stress Levels
                  </p>
                  <p className="text-purple-300 text-xs">
                    Rate your daily stress (1-5)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm font-medium">
                    Physical Activity
                  </p>
                  <p className="text-purple-300 text-xs">
                    Log exercise type and duration
                  </p>
                </div>
              </div>
              {lifeStage === "menstrual" ? (
                <div className="flex items-center gap-3">
                  <Flower2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      Cycle Phase
                    </p>
                    <p className="text-purple-300 text-xs">
                      Track your menstrual cycle
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      Symptom Triggers
                    </p>
                    <p className="text-purple-300 text-xs">
                      Note potential triggers
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-purple-200 text-sm">
                <Info className="w-4 h-4 inline mr-1" />
                The more consistently you track, the more accurate your
                correlations will be!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("overview")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "overview"
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "detailed"
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              Detailed
            </button>
            {(lifeStage === "perimenopause" || lifeStage === "menopause") && (
              <button
                onClick={() => setViewMode("triggers")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === "triggers"
                    ? "bg-purple-600 text-white"
                    : "text-purple-200 hover:text-white"
                }`}
              >
                Triggers
              </button>
            )}
          </div>

          {/* Metric Filter */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Metrics</option>
            {Object.entries(metricDefinitions).map(([key, metric]) => (
              <option key={key} value={key}>
                {metric.name}
              </option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
          </select>
        </div>

        {/* Help Button */}
        <button className="text-purple-300 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-300" />
            <h3 className="text-lg font-semibold text-white">
              Wellness Insights
            </h3>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium">{insight.title}</p>
                  <p className="text-purple-200 text-sm mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview View */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Strongest Correlations */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">
              Strongest Correlations
            </h3>
            <div className="space-y-4">
              {strongestCorrelations.map((corr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedCorrelation(
                      expandedCorrelation === corr.name ? null : corr.name
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-2xl font-bold ${getCorrelationColor(
                        corr.strength
                      )}`}
                    >
                      {Math.abs(corr.value).toFixed(2)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {formatCorrelationName(corr.name)}
                      </p>
                      <p className="text-purple-300 text-sm capitalize">
                        {corr.strength} {corr.direction} correlation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getCorrelationIcon(corr.direction, corr.strength)}
                    {expandedCorrelation === corr.name ? (
                      <ChevronUp className="w-5 h-5 text-purple-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix Visualization */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">
              Correlation Patterns
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={Object.entries(correlationData).map(([key, data]) => ({
                    metric: formatCorrelationName(key).split(" → ")[0],
                    value: Math.abs(data.value),
                    fullMark: 1,
                  }))}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    stroke="#fff"
                    opacity={0.6}
                  />
                  <PolarRadiusAxis
                    stroke="#fff"
                    opacity={0.6}
                    domain={[0, 1]}
                  />
                  <Radar
                    name="Correlation Strength"
                    dataKey="value"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metricDefinitions).map(([key, metric]) => {
              const relatedCorrelations = Object.entries(
                correlationData
              ).filter(([corrKey]) => corrKey.includes(key));

              return (
                <div
                  key={key}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <metric.icon
                        className="w-5 h-5"
                        style={{ color: metric.color }}
                      />
                      <h4 className="text-white font-medium">{metric.name}</h4>
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm mb-4">
                    {metric.description}
                  </p>
                  {relatedCorrelations.length > 0 ? (
                    <div className="space-y-2">
                      {relatedCorrelations.map(([corrKey, corrData]) => (
                        <div
                          key={corrKey}
                          className="flex items-center justify-between"
                        >
                          <span className="text-purple-300 text-sm">
                            {formatCorrelationName(corrKey).split(" → ")[1]}
                          </span>
                          <span
                            className={`text-sm font-medium ${getCorrelationColor(
                              corrData.strength
                            )}`}
                          >
                            {corrData.value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-purple-300 text-sm">
                      No correlations found
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed View */}
      {viewMode === "detailed" && (
        <div className="space-y-6">
          {Object.entries(correlationData).map(([key, data]) => (
            <div
              key={key}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {formatCorrelationName(key)}
                </h3>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${getCorrelationColor(
                      data.strength
                    )}`}
                  >
                    {data.value.toFixed(2)}
                  </span>
                  {getCorrelationIcon(data.direction, data.strength)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">
                    What this means
                  </h4>
                  <p className="text-purple-200 text-sm">
                    {data.direction === "positive"
                      ? `As ${key.split("_")[0]} increases, ${
                          key.split("_")[1]
                        } tends to increase.`
                      : `As ${key.split("_")[0]} increases, ${
                          key.split("_")[1]
                        } tends to decrease.`}
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Strength</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full"
                        style={{ width: `${Math.abs(data.value) * 100}%` }}
                      />
                    </div>
                    <span className="text-purple-300 text-sm capitalize">
                      {data.strength}
                    </span>
                  </div>
                </div>
              </div>

              {/* Correlation-specific recommendations */}
              {getCorrelationRecommendation(key, data) && (
                <div className="mt-4 p-4 bg-purple-600/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-300 mt-0.5" />
                    <div>
                      <p className="text-white font-medium mb-1">
                        Recommendation
                      </p>
                      <p className="text-purple-200 text-sm">
                        {getCorrelationRecommendation(key, data)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Triggers View (for perimenopause/menopause) */}
      {viewMode === "triggers" &&
        (lifeStage === "perimenopause" || lifeStage === "menopause") && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-6">
                Symptom Triggers
              </h3>

              {triggers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {triggers.map((trigger, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {trigger.trigger}
                        </span>
                        <span className="text-xs text-purple-300 bg-purple-600/20 px-2 py-1 rounded">
                          {trigger.frequency}
                        </span>
                      </div>
                      <p className="text-purple-200 text-sm">
                        Associated with {trigger.type.replace("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Thermometer className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                  <p className="text-purple-200">
                    No trigger patterns identified yet. Keep tracking to
                    discover your triggers.
                  </p>
                </div>
              )}
            </div>

            {/* Trigger Management Tips */}
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-300" />
                <h3 className="text-lg font-semibold text-white">
                  Trigger Management
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">
                    Common Triggers to Track
                  </h4>
                  <ul className="space-y-2 text-purple-200 text-sm">
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Caffeine & alcohol
                    </li>
                    <li className="flex items-center gap-2">
                      <Pizza className="w-4 h-4" />
                      Spicy foods
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Stress & anxiety
                    </li>
                    <li className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      Hot environments
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-medium">
                    Management Strategies
                  </h4>
                  <ul className="space-y-2 text-purple-200 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Keep a detailed trigger diary
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Practice stress-reduction techniques
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Maintain consistent sleep schedule
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Stay hydrated and cool
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg font-semibold text-white">
              Lifestyle Recommendations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-300 text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{rec.recommendation}</p>
                  <p className="text-blue-300 text-xs mt-1 capitalize">
                    {rec.category} • Priority: {rec.priority}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Helper function for correlation-specific recommendations
  function getCorrelationRecommendation(key, data) {
    const recommendations = {
      stress_symptom:
        data.direction === "positive"
          ? "High stress correlates with increased symptoms. Consider stress-reduction techniques like meditation or yoga."
          : "Lower stress correlates with fewer symptoms. Keep up your stress management practices.",
      sleep_mood:
        data.direction === "positive"
          ? "Better sleep quality correlates with improved mood. Prioritize consistent sleep schedules."
          : "Poor sleep correlates with mood challenges. Focus on sleep hygiene improvements.",
      mood_cycle:
        "Your mood fluctuates with your cycle. Track patterns to anticipate and prepare for changes.",
      energy_cycle:
        "Energy levels vary by cycle phase. Plan activities according to your energy patterns.",
      hot_flash_stress:
        "Stress triggers hot flashes. Practice relaxation techniques when you feel stress rising.",
    };

    return recommendations[key] || null;
  }
};

export default WellnessCorrelationsTab;
