// src/components/womenshealth/tabs/PredictiveInsightsTab.jsx
import React, { useState } from "react";
import {
  Zap,
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Brain,
  Heart,
  Activity,
  Moon,
  Sun,
  Thermometer,
  Shield,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart3,
  Lightbulb,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PredictiveInsightsTab = ({ data, lifeStage, colors }) => {
  const [selectedPrediction, setSelectedPrediction] = useState("next-period");
  const [predictionTimeframe, setPredictionTimeframe] = useState("3months");
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  // Process predictive insights data
  const predictiveData = data || {
    nextPeriod: { date: "June 25, 2025", confidence: 85 },
    symptomForecasts: { forecasts: [] },
    fertileWindow: { start: "June 12", end: "June 16" },
    riskAssessments: { risks: [] },
  };

  // Mock predictive data
  const cyclePredictions = [
    {
      cycle: "Next",
      startDate: "Jun 25",
      endDate: "Jun 29",
      length: 28,
      confidence: 87,
      status: "predicted",
    },
    {
      cycle: "Following",
      startDate: "Jul 23",
      endDate: "Jul 27",
      length: 28,
      confidence: 82,
      status: "predicted",
    },
    {
      cycle: "Aug",
      startDate: "Aug 20",
      endDate: "Aug 24",
      length: 28,
      confidence: 78,
      status: "predicted",
    },
  ];

  const symptomPredictions = [
    {
      symptom: "Cramps",
      nextOccurrence: "Jun 25",
      severity: 6.2,
      confidence: 89,
      trend: "stable",
      recommendations: [
        "Heat therapy ready",
        "Pain relief on hand",
        "Gentle exercise planned",
      ],
    },
    {
      symptom: "Mood Changes",
      nextOccurrence: "Jul 20",
      severity: 5.8,
      confidence: 84,
      trend: "improving",
      recommendations: [
        "Schedule self-care",
        "Inform support network",
        "Practice mindfulness",
      ],
    },
    {
      symptom: "Bloating",
      nextOccurrence: "Jul 18",
      severity: 4.9,
      confidence: 76,
      trend: "stable",
      recommendations: [
        "Adjust diet early",
        "Increase water intake",
        "Wear comfortable clothes",
      ],
    },
    {
      symptom: "Fatigue",
      nextOccurrence: "Jun 25",
      severity: 6.5,
      confidence: 91,
      trend: "stable",
      recommendations: [
        "Plan lighter schedule",
        "Prioritize sleep",
        "Gentle movement only",
      ],
    },
  ];

  const fertilityPredictions = [
    {
      window: "Next Fertile Window",
      start: "Jun 12",
      end: "Jun 16",
      peak: "Jun 14",
      confidence: 88,
      quality: "high",
    },
    {
      window: "Following Window",
      start: "Jul 10",
      end: "Jul 14",
      peak: "Jul 12",
      confidence: 84,
      quality: "high",
    },
  ];

  const riskAssessments = [
    {
      risk: "Irregular Cycles",
      probability: 12,
      severity: "low",
      timeframe: "Next 6 months",
      indicators: ["Stress levels", "Age factors"],
      prevention: ["Stress management", "Regular exercise", "Adequate sleep"],
    },
    {
      risk: "Increased PMS",
      probability: 25,
      severity: "medium",
      timeframe: "Next 3 months",
      indicators: ["Recent stress", "Sleep quality"],
      prevention: [
        "Magnesium supplement",
        "Regular routine",
        "Stress reduction",
      ],
    },
    {
      risk: "Hormone Imbalance",
      probability: 8,
      severity: "low",
      timeframe: "Next 12 months",
      indicators: ["Lifestyle factors"],
      prevention: [
        "Balanced nutrition",
        "Regular check-ups",
        "Monitor symptoms",
      ],
    },
  ];

  // Prediction accuracy tracking
  const accuracyHistory = [
    { month: "Jan", predicted: 28, actual: 29, accuracy: 96 },
    { month: "Feb", predicted: 28, actual: 27, accuracy: 96 },
    { month: "Mar", predicted: 29, actual: 28, accuracy: 97 },
    { month: "Apr", predicted: 28, actual: 28, accuracy: 100 },
    { month: "May", predicted: 28, actual: 30, accuracy: 93 },
    { month: "Jun", predicted: 29, actual: 28, accuracy: 97 },
  ];

  // Life stage specific predictions
  const lifeStageInsights = {
    menstrual: {
      keyPredictions: [
        "Cycle regularity maintaining 92% consistency",
        "Ovulation occurring predictably day 13-15",
        "PMS symptoms following established pattern",
      ],
      futureOutlook: "Continued healthy reproductive cycles expected",
      recommendedTracking: [
        "Basal body temperature",
        "Cervical mucus",
        "Mood patterns",
      ],
    },
    perimenopause: {
      keyPredictions: [
        "Cycle irregularity likely to increase gradually",
        "Symptoms may intensify in coming months",
        "Transition phase estimated 2-4 years remaining",
      ],
      futureOutlook: "Natural transition progressing normally",
      recommendedTracking: [
        "Hot flash frequency",
        "Sleep quality",
        "Mood stability",
      ],
    },
    menopause: {
      keyPredictions: [
        "Stable post-menopausal patterns established",
        "Symptom management strategies effective",
        "Long-term health metrics looking positive",
      ],
      futureOutlook: "Healthy post-reproductive phase",
      recommendedTracking: [
        "Bone health indicators",
        "Cardiovascular markers",
        "Mental wellness",
      ],
    },
  };

  const currentLifeStage =
    lifeStageInsights[lifeStage] || lifeStageInsights.menstrual;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getRiskColor = (severity) => {
    switch (severity) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Predictive Insights
              </h2>
              <p className="text-gray-600">
                AI-powered forecasting for your health journey
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(
                accuracyHistory.reduce((sum, m) => sum + m.accuracy, 0) /
                  accuracyHistory.length
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Prediction Accuracy</div>
          </div>
        </div>

        {/* Quick Prediction Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">Jun 25</div>
            <div className="text-xs text-gray-600">Next Period</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">Jun 12-16</div>
            <div className="text-xs text-gray-600">Fertile Window</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">4</div>
            <div className="text-xs text-gray-600">Symptoms Tracked</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">Low</div>
            <div className="text-xs text-gray-600">Risk Level</div>
          </div>
        </div>
      </div>

      {/* Prediction Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "next-period", label: "Next Period", icon: Calendar },
            { id: "symptoms", label: "Symptom Forecast", icon: Activity },
            { id: "fertility", label: "Fertility Windows", icon: Heart },
            { id: "risks", label: "Risk Assessment", icon: Shield },
          ].map((view) => {
            const IconComponent = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedPrediction(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPrediction === view.id
                    ? "bg-white text-indigo-600 shadow-sm"
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
            value={predictionTimeframe}
            onChange={(e) => setPredictionTimeframe(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1month">Next Month</option>
            <option value="3months">Next 3 Months</option>
            <option value="6months">Next 6 Months</option>
          </select>
          <button
            onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {showConfidenceDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            Confidence
          </button>
        </div>
      </div>

      {/* Next Period Predictions */}
      {selectedPrediction === "next-period" && (
        <div className="space-y-6">
          {/* Cycle Prediction Timeline */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Upcoming Cycle Predictions
            </h3>

            <div className="space-y-4">
              {cyclePredictions.map((cycle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {cycle.cycle} Cycle
                      </div>
                      <div className="text-sm text-gray-600">
                        {cycle.startDate} - {cycle.endDate} ({cycle.length}{" "}
                        days)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(
                          cycle.confidence
                        )}`}
                      >
                        {cycle.confidence}% confident
                      </div>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{ width: `${cycle.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Accuracy History */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Prediction Accuracy History
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={accuracyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[25, 35]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[90, 100]}
                />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="predicted"
                  fill={colors.primary}
                  fillOpacity={0.6}
                  name="Predicted"
                />
                <Bar
                  yAxisId="left"
                  dataKey="actual"
                  fill={colors.secondary}
                  fillOpacity={0.6}
                  name="Actual"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke={colors.accent}
                  strokeWidth={3}
                  name="Accuracy %"
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">96.5%</div>
                <div className="text-xs text-green-700">Average Accuracy</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">±1.2</div>
                <div className="text-xs text-blue-700">Avg Days Variation</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">6</div>
                <div className="text-xs text-purple-700">Months Tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Forecasts */}
      {selectedPrediction === "symptoms" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Symptom Forecast & Preparation
            </h3>

            <div className="space-y-4">
              {symptomPredictions.map((symptom, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {symptom.symptom}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expected: {symptom.nextOccurrence} | Severity:{" "}
                          {symptom.severity}/10
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTrendIcon(symptom.trend)}
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${getConfidenceColor(
                          symptom.confidence
                        )}`}
                      >
                        {symptom.confidence}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Preparation Recommendations:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {symptom.recommendations.map((rec, recIndex) => (
                        <div
                          key={recIndex}
                          className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptom Trend Analysis */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Symptom Intensity Trends
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  {
                    month: "Jan",
                    cramps: 6.1,
                    bloating: 4.8,
                    mood: 5.2,
                    fatigue: 6.3,
                  },
                  {
                    month: "Feb",
                    cramps: 5.9,
                    bloating: 4.5,
                    mood: 5.0,
                    fatigue: 6.0,
                  },
                  {
                    month: "Mar",
                    cramps: 6.2,
                    bloating: 5.1,
                    mood: 5.8,
                    fatigue: 6.5,
                  },
                  {
                    month: "Apr",
                    cramps: 6.0,
                    bloating: 4.7,
                    mood: 4.9,
                    fatigue: 6.1,
                  },
                  {
                    month: "May",
                    cramps: 6.2,
                    bloating: 4.9,
                    mood: 5.8,
                    fatigue: 6.5,
                  },
                  {
                    month: "Jun",
                    cramps: 6.2,
                    bloating: 4.9,
                    mood: 5.8,
                    fatigue: 6.5,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cramps"
                  stackId="1"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="bloating"
                  stackId="1"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stackId="1"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  stackId="1"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fertility Predictions */}
      {selectedPrediction === "fertility" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Fertility Window Predictions
            </h3>

            <div className="space-y-4">
              {fertilityPredictions.map((window, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {window.window}
                      </div>
                      <div className="text-sm text-gray-600">
                        {window.start} - {window.end} (Peak: {window.peak})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium px-2 py-1 rounded-full ${
                          window.quality === "high"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {window.quality} quality
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {window.confidence}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {lifeStage === "menstrual" && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Fertility Optimization Tips
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Before Fertile Window
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Track cervical mucus changes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Monitor basal body temperature
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Maintain healthy lifestyle
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    During Fertile Window
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-3 h-3 text-pink-600" />
                      Optimal timing for conception
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-3 h-3 text-pink-600" />
                      Peak fertility signs present
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-3 h-3 text-pink-600" />
                      Stress management important
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment */}
      {selectedPrediction === "risks" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Health Risk Assessment
            </h3>

            <div className="space-y-4">
              {riskAssessments.map((risk, index) => {
                const riskClass = getRiskColor(risk.severity);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${riskClass}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{risk.risk}</div>
                          <div className="text-sm opacity-75">
                            {risk.timeframe}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {risk.probability}%
                        </div>
                        <div className="text-xs uppercase font-medium">
                          {risk.severity} risk
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Risk Indicators:
                        </h5>
                        <div className="space-y-1">
                          {risk.indicators.map((indicator, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <AlertTriangle className="w-3 h-3 opacity-60" />
                              {indicator}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Prevention Strategies:
                        </h5>
                        <div className="space-y-1">
                          {risk.prevention.map((strategy, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              {strategy}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Trend Analysis */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Risk Trend Analysis
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={[
                  {
                    month: "Jan",
                    overall: 15,
                    cycle: 10,
                    hormone: 8,
                    lifestyle: 12,
                  },
                  {
                    month: "Feb",
                    overall: 12,
                    cycle: 8,
                    hormone: 7,
                    lifestyle: 10,
                  },
                  {
                    month: "Mar",
                    overall: 14,
                    cycle: 12,
                    hormone: 8,
                    lifestyle: 11,
                  },
                  {
                    month: "Apr",
                    overall: 11,
                    cycle: 9,
                    hormone: 6,
                    lifestyle: 9,
                  },
                  {
                    month: "May",
                    overall: 13,
                    cycle: 11,
                    hormone: 8,
                    lifestyle: 10,
                  },
                  {
                    month: "Jun",
                    overall: 10,
                    cycle: 8,
                    hormone: 6,
                    lifestyle: 8,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 20]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="overall"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                Overall risk level has decreased by 33% over the past 6 months
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Life Stage Specific Insights */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Life Stage Specific Predictions
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Key Predictions</h4>
            <div className="space-y-3">
              {currentLifeStage.keyPredictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-700">{prediction}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Recommended Tracking
            </h4>
            <div className="space-y-2">
              {currentLifeStage.recommendedTracking.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Target className="w-3 h-3 text-purple-600" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-900 mb-1">
                Future Outlook
              </div>
              <div className="text-sm text-purple-700">
                {currentLifeStage.futureOutlook}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence & Methodology */}
      {showConfidenceDetails && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Prediction Methodology & Confidence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                How Predictions Work
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Machine learning analyzes your historical patterns
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Multiple data points create comprehensive models</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Continuous learning improves accuracy over time</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Confidence Levels
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-700">High (85%+)</span>
                  <span className="text-xs text-green-600">
                    Strong historical patterns
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                  <span className="text-sm text-amber-700">
                    Medium (70-84%)
                  </span>
                  <span className="text-xs text-amber-600">
                    Some variability detected
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-700">Lower (&lt;70%)</span>
                  <span className="text-xs text-red-600">
                    Irregular patterns
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> Predictions are based on your personal
              patterns and should be used as guidance. Always consult healthcare
              providers for medical decisions.
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Recommended Actions
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-900 mb-1">
                Prepare for Next Cycle
              </div>
              <div className="text-sm text-green-700">
                Based on predictions, stock up on comfort items and plan lighter
                activities for June 25-29. Your symptoms are likely to follow
                established patterns.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900 mb-1">
                Schedule Around Predictions
              </div>
              <div className="text-sm text-blue-700">
                Plan important events during your high-energy phases (June
                12-20) and schedule downtime during predicted low periods.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-purple-900 mb-1">
                Continue Tracking for Better Accuracy
              </div>
              <div className="text-sm text-purple-700">
                Your consistent tracking has achieved 96% accuracy. Continue
                daily logging to maintain and improve prediction reliability.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsightsTab;
