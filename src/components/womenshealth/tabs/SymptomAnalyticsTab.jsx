// frontend/src/components/womenshealth/tabs/SymptomAnalyticsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Brain,
  Heart,
  Thermometer,
  Droplets,
  Moon,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Plus,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  Zap,
  Wind,
  Coffee,
  Pizza,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Shield,
  Target,
  CalendarDays,
  Lightbulb,
} from "lucide-react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  startOfWeek,
  parseISO,
  isWithinInterval,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const SymptomAnalyticsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [viewMode, setViewMode] = useState("trends"); // trends, calendar, correlations

  // Data states
  const [symptomData, setSymptomData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  // Life stage specific symptom categories
  const getSymptomCategories = () => {
    const baseCategories = {
      physical: {
        name: "Physical",
        icon: Activity,
        color: colors.primary,
        symptoms:
          lifeStage === "menstrual"
            ? [
                "Cramps",
                "Headache",
                "Back pain",
                "Breast tenderness",
                "Bloating",
                "Nausea",
                "Dizziness",
                "Fatigue",
              ]
            : [
                "Joint pain",
                "Muscle aches",
                "Headache",
                "Heart palpitations",
                "Dizziness",
                "Fatigue",
                "Weight changes",
              ],
      },
      hormonal: {
        name: "Hormonal",
        icon: Thermometer,
        color: colors.secondary,
        symptoms:
          lifeStage === "menstrual"
            ? [
                "Mood swings",
                "Irritability",
                "Anxiety",
                "Acne",
                "Hair changes",
                "Appetite changes",
              ]
            : [
                "Hot flashes",
                "Night sweats",
                "Mood swings",
                "Vaginal dryness",
                "Low libido",
                "Hair thinning",
              ],
      },
      cognitive: {
        name: "Cognitive",
        icon: Brain,
        color: colors.accent,
        symptoms: [
          "Brain fog",
          "Memory issues",
          "Concentration difficulty",
          "Confusion",
          "Mental fatigue",
        ],
      },
      sleep: {
        name: "Sleep",
        icon: Moon,
        color: colors.warning,
        symptoms: [
          "Insomnia",
          "Frequent waking",
          "Early waking",
          "Restless sleep",
          "Vivid dreams",
          "Sleep apnea",
        ],
      },
    };

    // Add life stage specific categories
    if (lifeStage === "perimenopause" || lifeStage === "menopause") {
      baseCategories.vasomotor = {
        name: "Vasomotor",
        icon: Thermometer,
        color: colors.danger,
        symptoms: [
          "Hot flashes",
          "Night sweats",
          "Cold flashes",
          "Skin flushing",
          "Sweating episodes",
        ],
      };
    }

    return baseCategories;
  };

  const symptomCategories = getSymptomCategories();

  // Fetch data on mount and when timeframe changes
  useEffect(() => {
    fetchSymptomData();
  }, [selectedTimeRange, user?.id]);

  const fetchSymptomData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate;
      switch (selectedTimeRange) {
        case "week":
          startDate = subDays(endDate, 7);
          break;
        case "month":
          startDate = subDays(endDate, 30);
          break;
        case "quarter":
          startDate = subDays(endDate, 90);
          break;
        case "year":
          startDate = subDays(endDate, 365);
          break;
        default:
          startDate = subDays(endDate, 30);
      }

      // Fetch analytics data
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
        setAnalytics(data.analytics);
        processSymptomData(data.analytics);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights.filter((i) => i.insight_type === "symptom"));
      }

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(
          data.recommendations.filter(
            (r) => r.category === "symptom_management"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching symptom data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processSymptomData = (analyticsData) => {
    if (!analyticsData) return;

    // Process symptom summary
    const symptomSummary = analyticsData.symptom_summary || {};

    // Create trend data
    const trendData =
      symptomSummary.most_common?.map((symptom) => ({
        name: symptom.symptom,
        frequency: parseFloat(symptom.frequency),
        severity: symptom.avg_severity,
        trend: symptom.severity_trends,
        category: getSymptomCategory(symptom.symptom),
      })) || [];

    // Create correlation data
    const correlationData = analyticsData.wellness_correlations || {};
    const correlations = [
      {
        x: "Stress",
        y: "Symptoms",
        value: Math.abs(correlationData.stress_symptom_correlation || 0) * 100,
      },
      {
        x: "Sleep",
        y: "Mood",
        value: Math.abs(correlationData.sleep_mood_correlation || 0) * 100,
      },
    ];

    if (
      lifeStage !== "menstrual" &&
      correlationData.hot_flash_stress_correlation
    ) {
      correlations.push({
        x: "Stress",
        y: "Hot Flashes",
        value: Math.abs(correlationData.hot_flash_stress_correlation) * 100,
      });
    }

    // Create heatmap data for calendar view
    generateHeatmapData();

    setSymptomData({
      trends: trendData,
      severity: symptomSummary.severity_trends || "stable",
      clusters: symptomSummary.symptom_clusters || [],
      effectiveness:
        symptomSummary.management_effectiveness || "needs_attention",
    });

    setCorrelations(correlations);
  };

  const generateHeatmapData = () => {
    // Generate sample heatmap data - in production, this would come from actual symptom entries
    const days = eachDayOfInterval({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    });

    const heatmap = days.map((day) => ({
      date: format(day, "yyyy-MM-dd"),
      severity: Math.random() * 5,
      count: Math.floor(Math.random() * 5),
    }));

    setHeatmapData(heatmap);
  };

  const getSymptomCategory = (symptomName) => {
    for (const [key, category] of Object.entries(symptomCategories)) {
      if (category.symptoms.includes(symptomName)) {
        return key;
      }
    }
    return "other";
  };

  const getSeverityColor = (severity) => {
    if (severity <= 1) return "text-green-400";
    if (severity <= 2) return "text-yellow-400";
    if (severity <= 3) return "text-orange-400";
    return "text-red-400";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
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
              {entry.name}: {entry.value.toFixed(1)}
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
        <p className="text-purple-200">Analyzing your symptom patterns...</p>
      </div>
    );
  }

  // Empty state
  if (!symptomData || symptomData.trends.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-3">
            No Symptom Data Yet
          </h3>
          <p className="text-purple-200 mb-6">
            Start tracking your symptoms to discover patterns and gain insights
            into your health.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-purple-300">
              Quick add common symptoms:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {lifeStage === "menstrual" ? (
                <>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Cramps
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Headache
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Mood swings
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Fatigue
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Hot flashes
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Night sweats
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Sleep issues
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-3 text-sm text-white transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Brain fog
                  </button>
                </>
              )}
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
              onClick={() => setViewMode("trends")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "trends"
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode("correlations")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "correlations"
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              Correlations
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last year</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(symptomCategories).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Symptom Button */}
        <button
          onClick={() => setShowAddSymptom(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Symptom
        </button>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-300" />
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
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

      {/* Main Content Area */}
      {viewMode === "trends" && (
        <div className="space-y-6">
          {/* Symptom Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Severity Trend</h4>
                {getTrendIcon(symptomData.severity)}
              </div>
              <p className="text-2xl font-bold text-white capitalize">
                {symptomData.severity}
              </p>
              <p className="text-sm text-purple-200 mt-2">
                Overall symptom severity
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Management</h4>
                <Target className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-2xl font-bold text-white">
                {symptomData.effectiveness === "well_managed"
                  ? "Good"
                  : symptomData.effectiveness === "partially_managed"
                  ? "Fair"
                  : "Needs Work"}
              </p>
              <p className="text-sm text-purple-200 mt-2">
                Symptom control effectiveness
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Symptom Clusters</h4>
                <Activity className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-2xl font-bold text-white">
                {symptomData.clusters.length}
              </p>
              <p className="text-sm text-purple-200 mt-2">
                Related symptom groups
              </p>
            </div>
          </div>

          {/* Symptom Frequency Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">
              Most Common Symptoms
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomData.trends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="name" stroke="#fff" opacity={0.6} />
                  <YAxis stroke="#fff" opacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="frequency"
                    fill={colors.primary}
                    radius={[8, 8, 0, 0]}
                  >
                    {symptomData.trends.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          symptomCategories[entry.category]?.color ||
                          colors.primary
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Symptom Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(symptomCategories).map(([key, category]) => {
              const categorySymptoms = symptomData.trends.filter(
                (s) => s.category === key
              );

              return (
                <div
                  key={key}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() =>
                      setExpandedCategory(expandedCategory === key ? null : key)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <category.icon
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                      <h4 className="text-white font-medium">
                        {category.name}
                      </h4>
                    </div>
                    {expandedCategory === key ? (
                      <ChevronUp className="w-5 h-5 text-purple-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-300" />
                    )}
                  </div>

                  {expandedCategory === key && (
                    <div className="space-y-3">
                      {categorySymptoms.length > 0 ? (
                        categorySymptoms.map((symptom, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${getSeverityColor(
                                  symptom.severity
                                )}`}
                              />
                              <span className="text-white">{symptom.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-purple-200">
                                {symptom.frequency.toFixed(0)}%
                              </span>
                              {getTrendIcon(symptom.trend)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-purple-300 text-sm">
                          No symptoms in this category
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-6">
            Symptom Intensity Calendar
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs text-purple-300 font-medium py-2"
              >
                {day}
              </div>
            ))}
            {heatmapData.map((day, index) => {
              const intensity = day.severity;
              const bgColor =
                intensity === 0
                  ? "bg-white/5"
                  : intensity < 2
                  ? "bg-green-500/30"
                  : intensity < 3
                  ? "bg-yellow-500/30"
                  : intensity < 4
                  ? "bg-orange-500/30"
                  : "bg-red-500/30";

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg ${bgColor} border border-white/10 flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors`}
                  title={`${format(parseISO(day.date), "MMM d")}: ${
                    day.count
                  } symptoms, avg severity ${intensity.toFixed(1)}`}
                >
                  <span className="text-xs text-white/80">
                    {format(parseISO(day.date), "d")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/5 rounded" />
              <span className="text-purple-300">None</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 rounded" />
              <span className="text-purple-300">Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/30 rounded" />
              <span className="text-purple-300">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500/30 rounded" />
              <span className="text-purple-300">Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/30 rounded" />
              <span className="text-purple-300">Very Severe</span>
            </div>
          </div>
        </div>
      )}

      {/* Correlations View */}
      {viewMode === "correlations" && (
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">
              Symptom Correlations
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    type="category"
                    dataKey="x"
                    stroke="#fff"
                    opacity={0.6}
                  />
                  <YAxis
                    type="category"
                    dataKey="y"
                    stroke="#fff"
                    opacity={0.6}
                  />
                  <ZAxis type="number" dataKey="value" range={[100, 1000]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter
                    data={correlations}
                    fill={colors.primary}
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Symptom Clusters */}
          {symptomData.clusters.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Symptom Clusters
              </h3>
              <p className="text-purple-200 mb-6">
                These symptoms tend to occur together:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {symptomData.clusters.map((cluster, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <h5 className="text-white font-medium mb-2">
                      Cluster {index + 1}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {cluster.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-600/30 text-purple-100 px-3 py-1 rounded-full text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-300" />
            <h3 className="text-lg font-semibold text-white">
              Personalized Recommendations
            </h3>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-300 text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white">{rec.recommendation}</p>
                  {rec.evidence_based && (
                    <p className="text-green-300 text-xs mt-1">
                      Evidence-based
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyticsTab;
