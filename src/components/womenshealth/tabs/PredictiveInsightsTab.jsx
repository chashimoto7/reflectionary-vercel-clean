// frontend/ src/components/womenshealth/tabs/PredictiveInsightsTab.jsx
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
} from "lucide-react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
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

const PredictiveInsightsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState("symptoms");
  const [timeHorizon, setTimeHorizon] = useState("week");
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  // Prediction data
  const [predictions, setPredictions] = useState({
    symptoms: {},
    cycle: {},
    wellness: {},
    triggers: {},
  });

  const [confidenceScores, setConfidenceScores] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [patterns, setPatterns] = useState([]);

  // AI Insights
  const [aiInsights, setAiInsights] = useState({
    summary: "",
    recommendations: [],
    warnings: [],
  });

  useEffect(() => {
    loadPredictions();
    setTimeout(() => setLoading(false), 1000);
  }, [timeHorizon, lifeStage]);

  const loadPredictions = () => {
    // Mock AI predictions - will be replaced with actual AI model
    setPredictions({
      symptoms: generateSymptomPredictions(),
      cycle: generateCyclePredictions(),
      wellness: generateWellnessPredictions(),
      triggers: generateTriggerPredictions(),
    });

    setConfidenceScores(generateConfidenceScores());
    setAlerts(generateAlerts());
    setPatterns(generatePatterns());
    generateAIInsights();
  };

  const generateSymptomPredictions = () => {
    const days = timeHorizon === "week" ? 7 : timeHorizon === "month" ? 30 : 90;
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = addDays(new Date(), i);
      data.push({
        date: format(date, "MMM d"),
        predicted: Math.floor(Math.random() * 5) + 1,
        confidence: 75 + Math.random() * 20,
        hotFlashes:
          lifeStage !== "menstrual" ? Math.floor(Math.random() * 8) : 0,
        mood: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
      });
    }

    return {
      data,
      peakDays: [3, 7, 14],
      averageSeverity: 3.2,
    };
  };

  const generateCyclePredictions = () => {
    if (lifeStage === "menopause") return null;

    return {
      nextPeriod: addDays(new Date(), 14),
      confidence: lifeStage === "perimenopause" ? 65 : 85,
      cycleLength: lifeStage === "perimenopause" ? "25-32 days" : "28 days",
      ovulation: addDays(new Date(), 7),
      fertileWindow: {
        start: addDays(new Date(), 5),
        end: addDays(new Date(), 9),
      },
    };
  };

  const generateWellnessPredictions = () => {
    const data = [];
    const days = 14;

    for (let i = 0; i < days; i++) {
      data.push({
        date: format(addDays(new Date(), i), "MMM d"),
        wellnessScore: 65 + Math.random() * 25,
        sleepQuality: Math.floor(Math.random() * 5) + 1,
        stressLevel: Math.floor(Math.random() * 5) + 1,
      });
    }

    return {
      data,
      trend: "improving",
      keyFactors: ["sleep", "exercise", "stress"],
    };
  };

  const generateTriggerPredictions = () => {
    return [
      {
        trigger: "High stress day",
        probability: 85,
        timing: "Tomorrow",
        impact: "high",
      },
      {
        trigger: "Weather change",
        probability: 72,
        timing: "3 days",
        impact: "moderate",
      },
      {
        trigger: "Poor sleep",
        probability: 68,
        timing: "Tonight",
        impact: "high",
      },
      {
        trigger: "Dehydration risk",
        probability: 45,
        timing: "Weekend",
        impact: "low",
      },
    ];
  };

  const generateConfidenceScores = () => {
    return {
      overall: 78,
      symptoms: 82,
      cycle: lifeStage === "perimenopause" ? 65 : 85,
      wellness: 75,
      triggers: 70,
    };
  };

  const generateAlerts = () => {
    return [
      {
        id: 1,
        type: "warning",
        title: "High Symptom Day Predicted",
        description: "Based on your patterns, tomorrow may be challenging",
        date: addDays(new Date(), 1),
        actions: [
          "Prepare comfort items",
          "Plan light schedule",
          "Ensure good sleep tonight",
        ],
      },
      {
        id: 2,
        type: "info",
        title: "Optimal Exercise Window",
        description: "Your energy levels are predicted to peak this week",
        date: addDays(new Date(), 3),
        actions: [
          "Schedule workouts",
          "Try new activities",
          "Track energy response",
        ],
      },
      {
        id: 3,
        type: "reminder",
        title: "Cycle Tracking Reminder",
        description: "Your period is expected to start soon",
        date: addDays(new Date(), 13),
        actions: [
          "Stock supplies",
          "Clear schedule if needed",
          "Monitor symptoms",
        ],
      },
    ];
  };

  const generatePatterns = () => {
    return [
      {
        name: "Weekly Rhythm",
        description: "Symptoms tend to peak mid-week, improve on weekends",
        confidence: 85,
        impact: "moderate",
      },
      {
        name: "Stress Response",
        description: "Work stress triggers symptoms within 24-48 hours",
        confidence: 92,
        impact: "high",
      },
      {
        name: "Sleep Connection",
        description: "Poor sleep increases next-day symptom severity by 60%",
        confidence: 88,
        impact: "high",
      },
      {
        name: "Exercise Benefit",
        description: "Morning exercise reduces afternoon fatigue by 40%",
        confidence: 76,
        impact: "positive",
      },
    ];
  };

  const generateAIInsights = () => {
    setAiInsights({
      summary:
        lifeStage === "menstrual"
          ? "Your cycle is regular with predictable patterns. PMS symptoms typically begin 5-7 days before your period."
          : lifeStage === "perimenopause"
          ? "Your patterns show increasing irregularity typical of perimenopause. Hot flashes are most likely in the evening."
          : "Your symptom patterns are stabilizing. Hot flashes show a decreasing trend over the past month.",
      recommendations: [
        "Schedule important meetings during your predicted high-energy windows",
        "Prepare for potential symptom flare-ups with preventive measures",
        "Adjust exercise intensity based on predicted energy levels",
        "Plan stress-reduction activities before predicted difficult days",
      ],
      warnings: [
        "High stress levels predicted for next Tuesday - consider preventive measures",
        "Sleep quality may impact symptoms this weekend",
        "Weather changes midweek may trigger additional symptoms",
      ],
    });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      case "reminder":
        return <Bell className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high":
        return "text-red-400";
      case "moderate":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      case "positive":
        return "text-emerald-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Generating predictions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-white">
            AI-Powered Predictions
          </h3>
          <div className="flex items-center gap-2 bg-purple-600/20 px-3 py-1 rounded-full">
            <Brain className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200">
              {confidenceScores.overall}% Confidence
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {["week", "month", "3months"].map((horizon) => (
            <button
              key={horizon}
              onClick={() => setTimeHorizon(horizon)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeHorizon === horizon
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              {horizon === "3months"
                ? "3 Months"
                : horizon.charAt(0).toUpperCase() + horizon.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600/30 rounded-full p-3">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">
              AI Summary
            </h4>
            <p className="text-purple-200 mb-4">{aiInsights.summary}</p>
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask Reflectionarian
              </button>
              <button
                onClick={() => setShowAlertSettings(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Alert Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Alerts */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Upcoming Alerts
        </h3>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{alert.title}</h4>
                      <p className="text-sm text-purple-200 mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <span className="text-sm text-purple-300">
                      {format(alert.date, "MMM d")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {alert.actions.map((action, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white/10 px-2 py-1 rounded text-purple-200"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Predictions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Symptom Forecast
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions.symptoms.data.slice(0, 14)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis domain={[0, 5]} stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {predictions.symptoms.peakDays.map((day) => (
                  <ReferenceLine
                    key={day}
                    x={predictions.symptoms.data[day]?.date}
                    stroke="#ff0000"
                    strokeDasharray="5 5"
                    opacity={0.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-purple-200">
              Average severity:{" "}
              <span className="text-white font-medium">
                {predictions.symptoms.averageSeverity.toFixed(1)}/5
              </span>
            </span>
            <span className="text-purple-200">
              Peak days marked in <span className="text-red-400">red</span>
            </span>
          </div>
        </div>

        {/* Wellness Score Prediction */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Wellness Trajectory
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={predictions.wellness.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis domain={[0, 100]} stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wellnessScore"
                  stroke={colors.emerald}
                  strokeWidth={3}
                  dot={{ fill: colors.emerald, r: 4 }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#fff"
                  strokeDasharray="5 5"
                  opacity={0.3}
                  label={{ value: "Target", fill: "#fff", fontSize: 12 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-green-600/20 rounded-lg">
            <p className="text-sm text-green-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Wellness trend:{" "}
              <span className="text-white font-medium">Improving</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Identified Patterns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{pattern.name}</h4>
                <span className="text-sm bg-purple-600/30 px-2 py-1 rounded text-purple-200">
                  {pattern.confidence}% confident
                </span>
              </div>
              <p className="text-sm text-purple-200 mb-3">
                {pattern.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${getImpactColor(
                    pattern.impact
                  )}`}
                >
                  {pattern.impact.charAt(0).toUpperCase() +
                    pattern.impact.slice(1)}{" "}
                  impact
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trigger Forecast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trigger Forecast
          </h3>

          <div className="space-y-3">
            {predictions.triggers.map((trigger, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {trigger.trigger}
                  </span>
                  <span className="text-sm text-purple-300">
                    {trigger.timing}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Probability</span>
                    <span className="text-white">{trigger.probability}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        trigger.probability > 70
                          ? "bg-red-500"
                          : trigger.probability > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${trigger.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cycle Predictions (if applicable) */}
        {predictions.cycle && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cycle Predictions
            </h3>

            <div className="space-y-4">
              <div className="bg-purple-600/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200">Next Period</span>
                  <span className="text-sm text-purple-300">
                    {predictions.cycle.confidence}% confident
                  </span>
                </div>
                <p className="text-xl font-bold text-white">
                  {format(predictions.cycle.nextPeriod, "MMMM d")}
                </p>
                <p className="text-sm text-purple-200 mt-1">
                  In{" "}
                  {Math.ceil(
                    (predictions.cycle.nextPeriod - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>

              {lifeStage === "menstrual" && (
                <>
                  <div className="bg-pink-600/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-pink-200">Ovulation</span>
                      <Heart className="w-4 h-4 text-pink-300" />
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {format(predictions.cycle.ovulation, "MMMM d")}
                    </p>
                  </div>

                  <div className="bg-green-600/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-200">Fertile Window</span>
                      <Calendar className="w-4 h-4 text-green-300" />
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {format(predictions.cycle.fertileWindow.start, "MMM d")} -{" "}
                      {format(predictions.cycle.fertileWindow.end, "MMM d")}
                    </p>
                  </div>
                </>
              )}

              {lifeStage === "perimenopause" && (
                <div className="bg-yellow-600/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-200">
                      Cycle length varying between{" "}
                      {predictions.cycle.cycleLength}. Predictions may be less
                      accurate during perimenopause.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          AI Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-200">{rec}</p>
            </div>
          ))}
        </div>

        {aiInsights.warnings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Warnings
            </h4>
            <div className="space-y-2">
              {aiInsights.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confidence Metrics */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Prediction Confidence
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(confidenceScores).map(([key, score]) => (
            <div key={key} className="text-center">
              <div className="relative inline-flex">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke={
                      score > 70
                        ? colors.emerald
                        : score > 50
                        ? colors.warning
                        : colors.danger
                    }
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {score}%
                </span>
              </div>
              <p className="text-sm text-purple-200 mt-2 capitalize">{key}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm text-purple-200">
            <Info className="w-4 h-4 inline mr-1" />
            Predictions improve with more tracking data. Current accuracy based
            on {Math.floor(Math.random() * 200) + 100} days of data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsightsTab;
