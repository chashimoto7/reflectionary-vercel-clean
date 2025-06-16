// src/components/womenshealth/tabs/CycleIntelligenceTab.jsx
import React, { useState } from "react";
import {
  Brain,
  Moon,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  BarChart3,
  Thermometer,
  Heart,
  ChevronRight,
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
  ScatterPlot,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";

const CycleIntelligenceTab = ({ data, lifeStage, colors }) => {
  const [selectedView, setSelectedView] = useState("patterns");
  const [showPredictiveModel, setShowPredictiveModel] = useState(false);

  // Process cycle intelligence data
  const cycleData = data || {
    patterns: { patterns: [], regularity: 85 },
    irregularities: { count: 2, severity: "low" },
    phaseCorrelations: { correlations: [] },
    predictiveModel: { accuracy: 85, confidence: "high" },
  };

  // Mock cycle history data for visualization
  const cycleHistoryData = [
    { cycle: 1, length: 28, periodLength: 5, regularity: 95 },
    { cycle: 2, length: 29, periodLength: 4, regularity: 90 },
    { cycle: 3, length: 27, periodLength: 5, regularity: 88 },
    { cycle: 4, length: 28, periodLength: 6, regularity: 92 },
    { cycle: 5, length: 30, periodLength: 5, regularity: 85 },
    { cycle: 6, length: 28, periodLength: 4, regularity: 95 },
  ];

  // Phase correlation data
  const phaseCorrelationData = [
    { phase: "Menstrual", mood: 5.2, energy: 4.1, symptoms: 7.8, sleep: 6.3 },
    { phase: "Follicular", mood: 7.8, energy: 8.2, symptoms: 2.1, sleep: 7.9 },
    { phase: "Ovulatory", mood: 8.9, energy: 9.1, symptoms: 1.5, sleep: 8.1 },
    { phase: "Luteal", mood: 6.1, energy: 5.8, symptoms: 6.2, sleep: 6.8 },
  ];

  // Predictive accuracy data
  const predictionAccuracyData = [
    { month: "Jan", predicted: 28, actual: 29, accuracy: 96 },
    { month: "Feb", predicted: 28, actual: 27, accuracy: 96 },
    { month: "Mar", predicted: 29, actual: 28, accuracy: 97 },
    { month: "Apr", predicted: 28, actual: 28, accuracy: 100 },
    { month: "May", predicted: 28, actual: 30, accuracy: 93 },
    { month: "Jun", predicted: 29, actual: 28, accuracy: 97 },
  ];

  // Irregularity patterns
  const irregularityData = [
    {
      type: "Late period",
      frequency: 2,
      lastOccurrence: "3 months ago",
      severity: "low",
    },
    {
      type: "Cycle length variation",
      frequency: 3,
      lastOccurrence: "1 month ago",
      severity: "medium",
    },
    {
      type: "Missed period",
      frequency: 0,
      lastOccurrence: "Never",
      severity: "none",
    },
    {
      type: "Early period",
      frequency: 1,
      lastOccurrence: "6 months ago",
      severity: "low",
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return AlertTriangle;
      case "medium":
        return Info;
      case "low":
        return CheckCircle;
      default:
        return Info;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header with Intelligence Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Cycle Intelligence
              </h2>
              <p className="text-gray-600">
                AI-powered pattern analysis and predictions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {cycleData.patterns.regularity}%
            </div>
            <div className="text-sm text-gray-600">Cycle Regularity</div>
          </div>
        </div>

        {/* Quick Intelligence Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {cycleData.predictiveModel.accuracy}%
            </div>
            <div className="text-xs text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {cycleData.irregularities.count}
            </div>
            <div className="text-xs text-gray-600">Irregularities Detected</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">6</div>
            <div className="text-xs text-gray-600">Cycles Analyzed</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">High</div>
            <div className="text-xs text-gray-600">Model Confidence</div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "patterns", label: "Pattern Analysis", icon: TrendingUp },
          { id: "predictions", label: "Predictions", icon: Target },
          { id: "correlations", label: "Phase Correlations", icon: BarChart3 },
          {
            id: "irregularities",
            label: "Irregularities",
            icon: AlertTriangle,
          },
        ].map((view) => {
          const IconComponent = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === view.id
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Pattern Analysis View */}
      {selectedView === "patterns" && (
        <div className="space-y-6">
          {/* Cycle Length Trends */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Cycle Length Patterns
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">
                  Cycle Length (days)
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cycleHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="cycle" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[25, 35]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="length"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="regularity"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Pattern Insights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Average Length
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  28.3 days
                </div>
                <div className="text-sm text-purple-700">
                  Within normal range
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Consistency
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ±2.1 days
                </div>
                <div className="text-sm text-green-700">Highly regular</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Trend</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">Stable</div>
                <div className="text-sm text-blue-700">
                  No concerning changes
                </div>
              </div>
            </div>
          </div>

          {/* Period Length Analysis */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Period Length Analysis
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cycleHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="cycle" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 8]} />
                <Tooltip />
                <Bar
                  dataKey="periodLength"
                  fill={colors.menstrual}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Average: 4.8 days</span>
              <span className="text-gray-600">Range: 4-6 days</span>
              <span className="text-green-600 font-medium">
                ✓ Normal variation
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Predictions View */}
      {selectedView === "predictions" && (
        <div className="space-y-6">
          {/* Next Cycle Predictions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Next Cycle Predictions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prediction Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-pink-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Next Period
                      </div>
                      <div className="text-sm text-gray-600">June 25, 2025</div>
                    </div>
                  </div>
                  <div className="text-sm text-pink-600 font-medium">
                    87% confident
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-medium text-gray-900">Ovulation</div>
                      <div className="text-sm text-gray-600">June 11, 2025</div>
                    </div>
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    83% confident
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Fertile Window
                      </div>
                      <div className="text-sm text-gray-600">
                        June 7-12, 2025
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Peak fertility
                  </div>
                </div>
              </div>

              {/* Prediction Accuracy Chart */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Prediction Accuracy History
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={predictionAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[90, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Predictive Model Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                AI Predictive Model
              </h3>
              <button
                onClick={() => setShowPredictiveModel(!showPredictiveModel)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
              >
                {showPredictiveModel ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPredictiveModel ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showPredictiveModel && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-700 mb-1">
                      Model Accuracy
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      96.2%
                    </div>
                    <div className="text-xs text-purple-600">
                      Based on 6 cycles
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700 mb-1">
                      Confidence Level
                    </div>
                    <div className="text-2xl font-bold text-blue-600">High</div>
                    <div className="text-xs text-blue-600">
                      Stable patterns detected
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700 mb-1">
                      Data Quality
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      Excellent
                    </div>
                    <div className="text-xs text-green-600">
                      Consistent tracking
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Model Factors
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Historical cycle length patterns (weighted 40%)</div>
                    <div>• Period duration consistency (weighted 25%)</div>
                    <div>• Symptom timing patterns (weighted 20%)</div>
                    <div>• Lifestyle and stress factors (weighted 15%)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase Correlations View */}
      {selectedView === "correlations" && (
        <div className="space-y-6">
          {/* Correlation Radar Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Phase Correlation Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={phaseCorrelationData}>
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
                      name="Mood"
                      dataKey="mood"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Energy"
                      dataKey="energy"
                      stroke={colors.secondary}
                      fill={colors.secondary}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Symptoms"
                      dataKey="symptoms"
                      stroke={colors.danger}
                      fill={colors.danger}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Key Correlations
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">
                          Mood vs Ovulatory
                        </span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        +0.84
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">
                          Energy vs Follicular
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">
                        +0.79
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">
                          Symptoms vs Menstrual
                        </span>
                      </div>
                      <span className="text-sm text-red-600 font-medium">
                        +0.73
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-900 mb-2">
                    🧠 AI Insight
                  </div>
                  <div className="text-sm text-purple-700">
                    Your mood and energy follow predictable patterns that align
                    closely with your cycle phases. This strong correlation
                    suggests your hormones have a significant impact on your
                    well-being.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase-by-Phase Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phaseCorrelationData.map((phase, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors.gradient[index] }}
                  ></div>
                  <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mood</span>
                    <span className="text-sm font-medium">{phase.mood}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Energy</span>
                    <span className="text-sm font-medium">
                      {phase.energy}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Symptoms</span>
                    <span className="text-sm font-medium">
                      {phase.symptoms}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sleep</span>
                    <span className="text-sm font-medium">
                      {phase.sleep}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Irregularities View */}
      {selectedView === "irregularities" && (
        <div className="space-y-6">
          {/* Irregularity Overview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Irregularity Analysis
            </h3>

            <div className="space-y-4">
              {irregularityData.map((item, index) => {
                const SeverityIcon = getSeverityIcon(item.severity);
                const severityClass = getSeverityColor(item.severity);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${severityClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <SeverityIcon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm opacity-75">
                          Last: {item.lastOccurrence} • Frequency:{" "}
                          {item.frequency} times
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {item.severity === "none"
                        ? "None detected"
                        : `${item.severity} concern`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recommendations
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Overall Cycle Health: Excellent
                  </div>
                  <div className="text-sm text-green-700">
                    Your cycles show minimal irregularities and strong patterns.
                    Continue your current lifestyle and tracking habits.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-900 mb-1">
                    Monitor Cycle Length Variations
                  </div>
                  <div className="text-sm text-blue-700">
                    Keep tracking to identify any patterns in the slight
                    variations you've experienced. Consider noting stress levels
                    and lifestyle changes.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-purple-900 mb-1">
                    AI Model Improvement
                  </div>
                  <div className="text-sm text-purple-700">
                    Your consistent tracking has helped our AI model achieve 96%
                    accuracy. Continue daily logging for even better
                    predictions.
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

export default CycleIntelligenceTab;
