// src/components/womenshealth/tabs/SymptomAnalyticsTab.jsx
import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Zap,
  Brain,
  Heart,
  Thermometer,
  Moon,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  HeatmapChart,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const SymptomAnalyticsTab = ({ data, lifeStage, colors }) => {
  const [selectedView, setSelectedView] = useState("frequency");
  const [selectedSymptom, setSelectedSymptom] = useState("cramps");
  const [selectedTimeRange, setSelectedTimeRange] = useState("3months");
  const [showCorrelations, setShowCorrelations] = useState(false);

  // Process symptom analytics data
  const symptomData = data || {
    frequency: { symptoms: [] },
    severity: { symptoms: [] },
    correlations: { correlations: [] },
    clusters: { clusters: [] },
  };

  // Mock symptom frequency data
  const symptomFrequencyData = [
    { symptom: "Cramps", frequency: 85, severity: 6.2, phase: "Menstrual" },
    { symptom: "Bloating", frequency: 72, severity: 5.8, phase: "Luteal" },
    { symptom: "Mood Swings", frequency: 68, severity: 5.5, phase: "Luteal" },
    { symptom: "Fatigue", frequency: 61, severity: 6.8, phase: "Menstrual" },
    { symptom: "Headache", frequency: 45, severity: 7.1, phase: "Menstrual" },
    {
      symptom: "Breast Tenderness",
      frequency: 42,
      severity: 5.3,
      phase: "Luteal",
    },
    { symptom: "Irritability", frequency: 38, severity: 6.0, phase: "Luteal" },
    { symptom: "Back Pain", frequency: 35, severity: 6.5, phase: "Menstrual" },
  ];

  // Symptom severity trends over time
  const symptomTrendsData = [
    { date: "Week 1", cramps: 7, bloating: 3, mood: 5, fatigue: 6 },
    { date: "Week 2", cramps: 2, bloating: 4, mood: 7, fatigue: 3 },
    { date: "Week 3", cramps: 1, bloating: 5, mood: 8, fatigue: 2 },
    { date: "Week 4", cramps: 8, bloating: 7, mood: 4, fatigue: 7 },
    { date: "Week 5", cramps: 6, bloating: 2, mood: 6, fatigue: 5 },
    { date: "Week 6", cramps: 2, bloating: 3, mood: 8, fatigue: 3 },
  ];

  // Symptom correlation matrix
  const correlationData = [
    {
      symptom1: "Cramps",
      symptom2: "Back Pain",
      correlation: 0.82,
      significance: "high",
    },
    {
      symptom1: "Mood Swings",
      symptom2: "Irritability",
      correlation: 0.76,
      significance: "high",
    },
    {
      symptom1: "Bloating",
      symptom2: "Breast Tenderness",
      correlation: 0.68,
      significance: "medium",
    },
    {
      symptom1: "Fatigue",
      symptom2: "Headache",
      correlation: 0.64,
      significance: "medium",
    },
    {
      symptom1: "Cramps",
      symptom2: "Mood Swings",
      correlation: 0.45,
      significance: "low",
    },
  ];

  // Symptom clusters by phase
  const symptomClusters = [
    {
      phase: "Menstrual",
      symptoms: ["Cramps", "Fatigue", "Back Pain", "Headache"],
      severity: "high",
      frequency: 85,
    },
    {
      phase: "Follicular",
      symptoms: ["Mild Fatigue"],
      severity: "low",
      frequency: 25,
    },
    {
      phase: "Ovulatory",
      symptoms: ["Breast Tenderness", "Mild Bloating"],
      severity: "low",
      frequency: 30,
    },
    {
      phase: "Luteal",
      symptoms: [
        "Mood Swings",
        "Bloating",
        "Irritability",
        "Breast Tenderness",
      ],
      severity: "medium",
      frequency: 70,
    },
  ];

  // Phase-specific symptom data for radar chart
  const phaseSymptomData = [
    {
      phase: "Menstrual",
      physical: 8.2,
      emotional: 5.1,
      cognitive: 4.3,
      energy: 3.8,
    },
    {
      phase: "Follicular",
      physical: 2.1,
      emotional: 7.8,
      cognitive: 8.2,
      energy: 8.5,
    },
    {
      phase: "Ovulatory",
      physical: 1.8,
      emotional: 8.9,
      cognitive: 8.7,
      energy: 9.1,
    },
    {
      phase: "Luteal",
      physical: 6.2,
      emotional: 4.5,
      cognitive: 6.1,
      energy: 5.8,
    },
  ];

  const getSeverityColor = (severity) => {
    if (severity >= 7) return "text-red-600 bg-red-50";
    if (severity >= 5) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

  const getFrequencyColor = (frequency) => {
    if (frequency >= 70) return colors.danger;
    if (frequency >= 40) return colors.warning;
    return colors.accent;
  };

  const getCorrelationStrength = (correlation) => {
    if (Math.abs(correlation) >= 0.7) return "Strong";
    if (Math.abs(correlation) >= 0.4) return "Moderate";
    return "Weak";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header with Analytics Overview */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-rose-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Symptom Analytics
              </h2>
              <p className="text-gray-600">
                Comprehensive symptom pattern analysis
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-600">
              {symptomFrequencyData.length}
            </div>
            <div className="text-sm text-gray-600">Symptoms Tracked</div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(
                symptomFrequencyData.reduce((sum, s) => sum + s.frequency, 0) /
                  symptomFrequencyData.length
              )}
              %
            </div>
            <div className="text-xs text-gray-600">Avg Frequency</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(
                symptomFrequencyData.reduce((sum, s) => sum + s.severity, 0) /
                symptomFrequencyData.length
              ).toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Avg Severity</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {correlationData.filter((c) => c.significance === "high").length}
            </div>
            <div className="text-xs text-gray-600">Strong Correlations</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {symptomClusters.length}
            </div>
            <div className="text-xs text-gray-600">Symptom Clusters</div>
          </div>
        </div>
      </div>

      {/* View Selector and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "frequency", label: "Frequency", icon: BarChart3 },
            { id: "severity", label: "Severity Trends", icon: TrendingUp },
            { id: "correlations", label: "Correlations", icon: Target },
            { id: "clusters", label: "Phase Clusters", icon: Brain },
          ].map((view) => {
            const IconComponent = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view.id
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Frequency Analysis View */}
      {selectedView === "frequency" && (
        <div className="space-y-6">
          {/* Symptom Frequency Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Symptom Frequency Analysis
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-sm text-gray-600">Frequency (%)</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={symptomFrequencyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="symptom"
                  stroke="#6b7280"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="frequency"
                  fill={colors.primary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Symptom Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Detailed Symptom Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Symptom
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Frequency
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Avg Severity
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Most Common Phase
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {symptomFrequencyData.map((symptom, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{symptom.symptom}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${symptom.frequency}%`,
                                backgroundColor: getFrequencyColor(
                                  symptom.frequency
                                ),
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {symptom.frequency}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            symptom.severity
                          )}`}
                        >
                          {symptom.severity}/10
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {symptom.phase}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">Stable</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Severity Trends View */}
      {selectedView === "severity" && (
        <div className="space-y-6">
          {/* Symptom Selector */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Severity Trends Over Time
              </h3>
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="cramps">Cramps</option>
                <option value="bloating">Bloating</option>
                <option value="mood">Mood Swings</option>
                <option value="fatigue">Fatigue</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={symptomTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedSymptom}
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-Symptom Comparison */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Multi-Symptom Comparison
            </h3>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={symptomTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cramps"
                  stroke={colors.danger}
                  strokeWidth={2}
                  name="Cramps"
                />
                <Line
                  type="monotone"
                  dataKey="bloating"
                  stroke={colors.warning}
                  strokeWidth={2}
                  name="Bloating"
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke={colors.primary}
                  strokeWidth={2}
                  name="Mood Swings"
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Fatigue"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-4 gap-4">
              {[
                { name: "Cramps", color: colors.danger },
                { name: "Bloating", color: colors.warning },
                { name: "Mood Swings", color: colors.primary },
                { name: "Fatigue", color: colors.secondary },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Correlations View */}
      {selectedView === "correlations" && (
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Symptom Correlations
              </h3>
              <button
                onClick={() => setShowCorrelations(!showCorrelations)}
                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 text-sm"
              >
                {showCorrelations ? <EyeOff size={16} /> : <Eye size={16} />}
                {showCorrelations ? "Hide Details" : "Show Details"}
              </button>
            </div>

            <div className="space-y-4">
              {correlationData.map((corr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{corr.symptom1}</span>
                      <span className="text-gray-400">↔</span>
                      <span className="font-medium">{corr.symptom2}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {getCorrelationStrength(corr.correlation)}
                      </div>
                      <div className="text-xs text-gray-600">
                        r = {corr.correlation.toFixed(2)}
                      </div>
                    </div>

                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.abs(corr.correlation) * 100}%`,
                          backgroundColor:
                            Math.abs(corr.correlation) >= 0.7
                              ? colors.danger
                              : Math.abs(corr.correlation) >= 0.4
                              ? colors.warning
                              : colors.accent,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showCorrelations && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Understanding Correlations
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    • <strong>Strong (0.7+):</strong> Symptoms frequently occur
                    together
                  </div>
                  <div>
                    • <strong>Moderate (0.4-0.7):</strong> Some relationship
                    between symptoms
                  </div>
                  <div>
                    • <strong>Weak (&lt;0.4):</strong> Little to no relationship
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Correlation Insights */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Correlation Insights
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-red-900 mb-1">
                    Strong Physical Symptom Cluster
                  </div>
                  <div className="text-sm text-red-700">
                    Cramps and back pain show a strong correlation (r=0.82).
                    When you experience cramps, you're very likely to also have
                    back pain. Consider treating these symptoms together.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Brain className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-amber-900 mb-1">
                    Emotional Symptom Pattern
                  </div>
                  <div className="text-sm text-amber-700">
                    Mood swings and irritability are closely linked (r=0.76).
                    These emotional symptoms tend to occur during the same
                    phases of your cycle.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Predictable Patterns
                  </div>
                  <div className="text-sm text-green-700">
                    Your symptom correlations are consistent, which helps
                    predict when certain symptoms might occur and allows for
                    proactive management.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase Clusters View */}
      {selectedView === "clusters" && (
        <div className="space-y-6">
          {/* Phase Symptom Overview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Symptom Clusters by Cycle Phase
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={phaseSymptomData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="phase"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={0}
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <Radar
                  name="Physical"
                  dataKey="physical"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Emotional"
                  dataKey="emotional"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Cognitive"
                  dataKey="cognitive"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Energy"
                  dataKey="energy"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-4 gap-4">
              {[
                { name: "Physical", color: colors.danger },
                { name: "Emotional", color: colors.primary },
                { name: "Cognitive", color: colors.secondary },
                { name: "Energy", color: colors.accent },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Phase Clusters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {symptomClusters.map((cluster, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    {cluster.phase} Phase
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cluster.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : cluster.severity === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {cluster.severity} severity
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequency</span>
                    <span className="text-sm font-medium">
                      {cluster.frequency}%
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Common Symptoms:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cluster.symptoms.map((symptom, sIndex) => (
                        <span
                          key={sIndex}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cluster Recommendations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Phase-Specific Recommendations
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <Moon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-red-900 mb-1">
                    Menstrual Phase Strategy
                  </div>
                  <div className="text-sm text-red-700">
                    Focus on pain management and rest. Your physical symptoms
                    are highest during this phase. Consider heat therapy, gentle
                    movement, and adequate sleep.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-purple-900 mb-1">
                    Luteal Phase Management
                  </div>
                  <div className="text-sm text-purple-700">
                    Prepare for emotional symptoms and bloating. Consider stress
                    management techniques, dietary adjustments, and emotional
                    support during this time.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Optimize High-Energy Phases
                  </div>
                  <div className="text-sm text-green-700">
                    Take advantage of your follicular and ovulatory phases when
                    symptoms are minimal. Schedule important tasks and social
                    activities during these times.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyticsTab;
