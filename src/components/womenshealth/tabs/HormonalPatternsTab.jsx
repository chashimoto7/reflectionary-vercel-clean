// src/components/womenshealth/tabs/HormonalPatternsTab.jsx
import React, { useState } from "react";
import {
  TrendingUp,
  Thermometer,
  Zap,
  Moon,
  Sun,
  Activity,
  Brain,
  Heart,
  AlertTriangle,
  Info,
  CheckCircle,
  BarChart3,
  Calendar,
  Target,
  Waves,
  Clock,
  Eye,
  EyeOff,
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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

const HormonalPatternsTab = ({ data, lifeStage, colors }) => {
  const [selectedView, setSelectedView] = useState("trends");
  const [selectedHormone, setSelectedHormone] = useState("estrogen");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Process hormonal patterns data
  const hormonalData = data || {
    trends: { trends: [] },
    fluctuations: { fluctuations: [] },
    lifeStageChanges: { changes: [] },
  };

  // Mock hormonal trend data
  const hormonalTrendData = [
    { day: 1, estrogen: 20, progesterone: 10, mood: 5, energy: 4, temp: 97.2 },
    { day: 5, estrogen: 35, progesterone: 12, mood: 6, energy: 6, temp: 97.3 },
    {
      day: 10,
      estrogen: 120,
      progesterone: 15,
      mood: 8,
      energy: 8,
      temp: 97.4,
    },
    {
      day: 14,
      estrogen: 200,
      progesterone: 20,
      mood: 9,
      energy: 9,
      temp: 98.1,
    },
    {
      day: 18,
      estrogen: 150,
      progesterone: 80,
      mood: 7,
      energy: 7,
      temp: 98.4,
    },
    {
      day: 21,
      estrogen: 100,
      progesterone: 120,
      mood: 6,
      energy: 6,
      temp: 98.6,
    },
    {
      day: 25,
      estrogen: 60,
      progesterone: 100,
      mood: 4,
      energy: 5,
      temp: 98.5,
    },
    { day: 28, estrogen: 25, progesterone: 15, mood: 5, energy: 4, temp: 97.3 },
  ];

  // Life stage transition data
  const lifeStageData = {
    menstrual: {
      title: "Regular Menstrual Cycles",
      icon: Moon,
      color: colors.primary,
      indicators: [
        { name: "Cycle Regularity", value: 92, status: "excellent" },
        { name: "Hormone Balance", value: 88, status: "good" },
        { name: "Ovulation Consistency", value: 94, status: "excellent" },
        { name: "Luteal Phase Length", value: 85, status: "good" },
      ],
      insights: [
        "Your hormone patterns show healthy cyclical fluctuations",
        "Estrogen and progesterone levels are well-balanced",
        "Ovulation occurring consistently around day 14",
      ],
    },
    perimenopause: {
      title: "Perimenopause Transition",
      icon: Thermometer,
      color: colors.warning,
      indicators: [
        { name: "Cycle Irregularity", value: 65, status: "concerning" },
        { name: "Hormone Fluctuations", value: 78, status: "elevated" },
        { name: "Hot Flash Frequency", value: 45, status: "moderate" },
        { name: "Sleep Disruption", value: 60, status: "concerning" },
      ],
      insights: [
        "Hormone levels showing increased variability",
        "Estrogen fluctuations contributing to symptoms",
        "Progesterone production becoming inconsistent",
      ],
    },
    menopause: {
      title: "Post-Menopause Stability",
      icon: Sun,
      color: colors.secondary,
      indicators: [
        { name: "Hormone Stability", value: 85, status: "good" },
        { name: "Symptom Management", value: 78, status: "good" },
        { name: "Bone Health Markers", value: 82, status: "good" },
        { name: "Cardiovascular Health", value: 88, status: "excellent" },
      ],
      insights: [
        "Hormone levels have stabilized at new baseline",
        "Body has adapted to post-menopausal state",
        "Focus on long-term health maintenance",
      ],
    },
  };

  const currentStageData = lifeStageData[lifeStage] || lifeStageData.menstrual;

  // Hormone fluctuation analysis
  const fluctuationData = [
    {
      hormone: "Estrogen",
      variability: 45,
      stability: 55,
      trend: "decreasing",
    },
    {
      hormone: "Progesterone",
      variability: 52,
      stability: 48,
      trend: "stable",
    },
    {
      hormone: "Testosterone",
      variability: 23,
      stability: 77,
      trend: "stable",
    },
    {
      hormone: "Cortisol",
      variability: 38,
      stability: 62,
      trend: "increasing",
    },
  ];

  // Monthly hormone comparison
  const monthlyComparison = [
    { month: "Jan", estrogen: 95, progesterone: 85, symptoms: 3.2 },
    { month: "Feb", estrogen: 88, progesterone: 82, symptoms: 2.8 },
    { month: "Mar", estrogen: 92, progesterone: 88, symptoms: 3.0 },
    { month: "Apr", estrogen: 90, progesterone: 85, symptoms: 2.9 },
    { month: "May", estrogen: 87, progesterone: 80, symptoms: 3.5 },
    { month: "Jun", estrogen: 89, progesterone: 83, symptoms: 3.1 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "moderate":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "concerning":
        return "text-red-600 bg-red-50 border-red-200";
      case "elevated":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return CheckCircle;
      case "good":
        return CheckCircle;
      case "moderate":
        return Info;
      case "concerning":
        return AlertTriangle;
      case "elevated":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header with Life Stage Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <currentStageData.icon
              className="w-8 h-8"
              style={{ color: currentStageData.color }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Hormonal Patterns
              </h2>
              <p className="text-gray-600">{currentStageData.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: currentStageData.color }}
            >
              {lifeStage === "menstrual"
                ? "Cycling"
                : lifeStage === "perimenopause"
                ? "Transitioning"
                : "Stable"}
            </div>
            <div className="text-sm text-gray-600">Hormone Status</div>
          </div>
        </div>

        {/* Life Stage Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentStageData.indicators.map((indicator, index) => {
            const StatusIcon = getStatusIcon(indicator.status);
            return (
              <div key={index} className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {indicator.name}
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {indicator.value}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "trends", label: "Hormone Trends", icon: TrendingUp },
          { id: "fluctuations", label: "Fluctuation Analysis", icon: Waves },
          { id: "correlations", label: "Symptom Correlations", icon: Target },
          { id: "lifecycle", label: "Life Stage Changes", icon: Calendar },
        ].map((view) => {
          const IconComponent = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === view.id
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Hormone Trends View */}
      {selectedView === "trends" && (
        <div className="space-y-6">
          {/* Cycle Hormone Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Hormonal Cycle Patterns
              </h3>
              <div className="flex items-center gap-4">
                <select
                  value={selectedHormone}
                  onChange={(e) => setSelectedHormone(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="estrogen">Estrogen Focus</option>
                  <option value="progesterone">Progesterone Focus</option>
                  <option value="both">Both Hormones</option>
                  <option value="correlation">With Symptoms</option>
                </select>
                <button
                  onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm"
                >
                  {showAdvancedMetrics ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                  Advanced
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              {selectedHormone === "correlation" ? (
                <ComposedChart data={hormonalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 10]}
                  />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="estrogen"
                    stackId="1"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mood"
                    stroke={colors.secondary}
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="energy"
                    stroke={colors.accent}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              ) : (
                <AreaChart data={hormonalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  {(selectedHormone === "estrogen" ||
                    selectedHormone === "both") && (
                    <Area
                      type="monotone"
                      dataKey="estrogen"
                      stackId="1"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.3}
                    />
                  )}
                  {(selectedHormone === "progesterone" ||
                    selectedHormone === "both") && (
                    <Area
                      type="monotone"
                      dataKey="progesterone"
                      stackId="1"
                      stroke={colors.secondary}
                      fill={colors.secondary}
                      fillOpacity={0.3}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>

            {/* Chart Legend and Insights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Hormone Phases
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-sm">
                      Menstrual (Days 1-5): Low hormones
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm">
                      Follicular (Days 6-13): Rising estrogen
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-sm">
                      Ovulatory (Days 14-16): Peak estrogen
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-sm">
                      Luteal (Days 17-28): High progesterone
                    </span>
                  </div>
                </div>
              </div>

              {showAdvancedMetrics && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Advanced Metrics
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Estrogen peak: ~200 pg/mL (day 14)</div>
                    <div>• Progesterone peak: ~120 ng/mL (day 21)</div>
                    <div>• Hormone ratio balance: 1.67</div>
                    <div>• Cycle consistency: 94%</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Monthly Hormone Trends
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="estrogen"
                  stroke={colors.primary}
                  strokeWidth={2}
                  name="Estrogen Index"
                />
                <Line
                  type="monotone"
                  dataKey="progesterone"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Progesterone Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fluctuation Analysis View */}
      {selectedView === "fluctuations" && (
        <div className="space-y-6">
          {/* Hormone Variability */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Hormone Fluctuation Analysis
            </h3>

            <div className="space-y-4">
              {fluctuationData.map((hormone, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      {hormone.hormone}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hormone.trend === "stable"
                          ? "bg-green-100 text-green-700"
                          : hormone.trend === "increasing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {hormone.trend}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Variability
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-red-400"
                            style={{ width: `${hormone.variability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {hormone.variability}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Stability
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-400"
                            style={{ width: `${hormone.stability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {hormone.stability}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fluctuation Insights */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Fluctuation Insights
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Healthy Hormone Patterns
                  </div>
                  <div className="text-sm text-green-700">
                    Your hormone fluctuations are within normal ranges for your
                    life stage. The cyclical patterns show good reproductive
                    health.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-amber-900 mb-1">
                    Cortisol Elevation Detected
                  </div>
                  <div className="text-sm text-amber-700">
                    Stress hormone levels showing slight increase. Consider
                    stress management techniques and adequate sleep to support
                    hormonal balance.
                  </div>
                </div>
              </div>

              {lifeStage === "perimenopause" && (
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Thermometer className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-orange-900 mb-1">
                      Transition-Related Changes
                    </div>
                    <div className="text-sm text-orange-700">
                      Increased hormone variability is typical during
                      perimenopause. Your patterns suggest you're in early
                      transition phase.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Correlations View */}
      {selectedView === "correlations" && (
        <div className="space-y-6">
          {/* Hormone-Symptom Correlations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Hormone-Symptom Correlations
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={hormonalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="estrogen"
                      name="Estrogen"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis
                      dataKey="mood"
                      name="Mood"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter fill={colors.primary} />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-gray-600 mt-2">
                  Estrogen vs Mood Correlation (r = 0.84)
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Strong Correlations
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Estrogen ↔ Mood</span>
                    <span className="text-sm text-green-600 font-medium">
                      r = 0.84
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Progesterone ↔ Sleep
                    </span>
                    <span className="text-sm text-blue-600 font-medium">
                      r = 0.76
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Estrogen ↔ Energy
                    </span>
                    <span className="text-sm text-purple-600 font-medium">
                      r = 0.72
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Correlation */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Basal Body Temperature Patterns
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hormonalTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[97, 99]} stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke={colors.danger}
                  strokeWidth={2}
                  dot={{ fill: colors.danger, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Temperature rises after ovulation due to progesterone,
                confirming hormonal patterns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Life Stage Changes View */}
      {selectedView === "lifecycle" && (
        <div className="space-y-6">
          {/* Current Life Stage Assessment */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Life Stage Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <currentStageData.icon
                    className="w-6 h-6"
                    style={{ color: currentStageData.color }}
                  />
                  <h4 className="font-semibold text-gray-900">
                    {currentStageData.title}
                  </h4>
                </div>

                <div className="space-y-3">
                  {currentStageData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Key Indicators
                </h4>
                <div className="space-y-3">
                  {currentStageData.indicators.map((indicator, index) => {
                    const statusClass = getStatusColor(indicator.status);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${statusClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {indicator.name}
                          </span>
                          <span className="text-sm font-medium">
                            {indicator.value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Transition Timeline */}
          {lifeStage === "perimenopause" && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Perimenopause Transition Timeline
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Early Perimenopause
                    </div>
                    <div className="text-sm text-gray-600">
                      Subtle cycle changes, occasional symptoms
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Complete
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Mid Perimenopause
                    </div>
                    <div className="text-sm text-gray-600">
                      Irregular cycles, increasing symptoms
                    </div>
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    Current Phase
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Late Perimenopause
                    </div>
                    <div className="text-sm text-gray-600">
                      Longer gaps between periods
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Upcoming
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Menopause</div>
                    <div className="text-sm text-gray-600">
                      12 months without a period
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Future
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Life Stage Recommendations
            </h3>

            <div className="space-y-4">
              {lifeStage === "menstrual" && (
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-900 mb-1">
                      Maintain Healthy Cycles
                    </div>
                    <div className="text-sm text-green-700">
                      Continue your current lifestyle habits. Regular exercise,
                      balanced nutrition, and stress management support optimal
                      hormone production.
                    </div>
                  </div>
                </div>
              )}

              {lifeStage === "perimenopause" && (
                <>
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Thermometer className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-orange-900 mb-1">
                        Symptom Management
                      </div>
                      <div className="text-sm text-orange-700">
                        Focus on managing hot flashes, sleep disruption, and
                        mood changes. Consider consulting with a healthcare
                        provider about treatment options.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1">
                        Bone and Heart Health
                      </div>
                      <div className="text-sm text-blue-700">
                        Prioritize calcium, vitamin D, and weight-bearing
                        exercise to protect bone density as estrogen levels
                        decline.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {lifeStage === "menopause" && (
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Sun className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-purple-900 mb-1">
                      Embrace Your New Chapter
                    </div>
                    <div className="text-sm text-purple-700">
                      Focus on long-term health maintenance. Regular health
                      screenings, cardiovascular exercise, and social
                      connections support overall well-being.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HormonalPatternsTab;
