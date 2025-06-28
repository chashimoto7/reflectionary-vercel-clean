// src/components/goals/tabs/AchievementPredictionsTab.jsx
import React, { useState } from "react";
import {
  TrendingUp,
  Target,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Brain,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const AchievementPredictionsTab = ({ goals, colors }) => {
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Mock prediction data - in real app, this would come from AI analysis
  const predictions = goals.map((goal) => ({
    ...goal,
    predictedCompletion: calculatePredictedCompletion(goal),
    confidenceScore: calculateConfidenceScore(goal),
    riskFactors: identifyRiskFactors(goal),
    successFactors: identifySuccessFactors(goal),
    recommendedActions: generateRecommendations(goal),
  }));

  // Mock trajectory data
  const trajectoryData = generateTrajectoryData();

  // Mock success factor radar data
  const radarData = [
    { factor: "Consistency", current: 75, optimal: 90 },
    { factor: "Momentum", current: 82, optimal: 85 },
    { factor: "Resources", current: 65, optimal: 80 },
    { factor: "Motivation", current: 88, optimal: 90 },
    { factor: "Support", current: 70, optimal: 85 },
    { factor: "Clarity", current: 92, optimal: 95 },
  ];

  const selectedPrediction = selectedGoalId
    ? predictions.find((p) => p.id === selectedGoalId)
    : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          AI Achievement Predictions
        </h3>
        <p className="text-sm text-gray-300">
          Machine learning analysis of your goal completion likelihood based on
          historical patterns
        </p>
      </div>

      {/* Overall Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Goals Likely to Succeed"
          value={predictions.filter((p) => p.predictedCompletion > 70).length}
          total={predictions.length}
          icon={CheckCircle2}
          color="#10B981"
        />
        <MetricCard
          title="Goals at Risk"
          value={predictions.filter((p) => p.predictedCompletion < 40).length}
          total={predictions.length}
          icon={AlertCircle}
          color="#EF4444"
        />
        <MetricCard
          title="Average Confidence"
          value={`${Math.round(
            predictions.reduce((acc, p) => acc + p.confidenceScore, 0) /
              predictions.length
          )}%`}
          icon={Brain}
          color="#8B5CF6"
        />
        <MetricCard
          title="Predicted by Year End"
          value={predictions.filter((p) => p.predictedCompletion > 50).length}
          total={predictions.length}
          icon={Calendar}
          color="#06B6D4"
        />
      </div>

      {/* Goal Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Goal Predictions
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {predictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                isSelected={selectedGoalId === prediction.id}
                onSelect={() => setSelectedGoalId(prediction.id)}
                colors={colors}
              />
            ))}
          </div>
        </div>

        {/* Success Factors Radar */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Success Factor Analysis
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Optimal"
                  dataKey="optimal"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trajectory Projection */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Projected Progress Trajectory
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="optimistic"
                stackId="1"
                stroke={colors.success}
                fill={colors.success}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="realistic"
                stackId="2"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="conservative"
                stackId="3"
                stroke={colors.warning}
                fill={colors.warning}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <LegendItem color={colors.success} label="Optimistic" />
          <LegendItem color={colors.primary} label="Realistic" />
          <LegendItem color={colors.warning} label="Conservative" />
        </div>
      </div>

      {/* Selected Goal Detail */}
      {selectedPrediction && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            {selectedPrediction.decryptedTitle}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div>
              <h5 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                Risk Factors
              </h5>
              <div className="space-y-2">
                {selectedPrediction.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="text-sm text-gray-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Factors */}
            <div>
              <h5 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-400" />
                Success Factors
              </h5>
              <div className="space-y-2">
                {selectedPrediction.successFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span className="text-sm text-gray-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-white mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              AI Recommended Actions
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedPrediction.recommendedActions.map((action, index) => (
                <div
                  key={index}
                  className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3"
                >
                  <p className="text-sm text-white">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, total, icon: Icon, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
      <span className="text-xs text-gray-400">{total && `of ${total}`}</span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-300">{title}</p>
  </div>
);

const PredictionCard = ({ prediction, isSelected, onSelect, colors }) => {
  const confidenceColor =
    prediction.confidenceScore > 75
      ? colors.success
      : prediction.confidenceScore > 50
      ? colors.warning
      : colors.danger;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-purple-500 bg-purple-500/20"
          : "border-white/20 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-white text-sm truncate flex-1">
          {prediction.decryptedTitle}
        </h5>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {prediction.predictedCompletion}% likely
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${prediction.predictedCompletion}%`,
                backgroundColor: confidenceColor,
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400">
            {prediction.confidenceScore}%
          </span>
        </div>
      </div>

      {prediction.predictedCompletion < 40 && (
        <div className="mt-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span className="text-xs text-red-400">At risk</span>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

// Helper functions for calculations
function calculatePredictedCompletion(goal) {
  // Mock calculation - in real app, this would use ML models
  const progress = goal.progress || 0;
  const daysRemaining = goal.dueDate
    ? Math.max(
        0,
        Math.floor(
          (new Date(goal.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 365;

  const velocity = progress / 30; // Progress per day (mock)
  const predicted = Math.min(100, progress + velocity * daysRemaining);

  return Math.round(predicted);
}

function calculateConfidenceScore(goal) {
  // Mock confidence calculation
  const factors = [
    goal.milestones?.length > 0 ? 20 : 0,
    goal.progress > 0 ? 25 : 0,
    goal.status === "active" ? 30 : 0,
    Math.random() * 25, // Random factor for demo
  ];

  return Math.round(factors.reduce((a, b) => a + b, 0));
}

function identifyRiskFactors(goal) {
  // Mock risk identification
  const risks = [];

  if (goal.progress < 20)
    risks.push("Low initial progress may indicate lack of momentum");
  if (!goal.milestones || goal.milestones.length === 0)
    risks.push("No milestones defined to track progress");
  if (goal.status === "paused") risks.push("Goal is currently paused");
  if (Math.random() > 0.5)
    risks.push(
      "Historical data shows similar goals have lower completion rates"
    );

  return risks.length > 0 ? risks : ["No significant risks identified"];
}

function identifySuccessFactors(goal) {
  // Mock success factor identification
  const factors = [];

  if (goal.progress > 50) factors.push("Strong progress already made");
  if (goal.milestones?.length > 3)
    factors.push("Well-defined milestones increase success likelihood");
  if (goal.status === "active") factors.push("Goal is actively being pursued");
  if (Math.random() > 0.5)
    factors.push("Your track record with similar goals is excellent");

  return factors.length > 0 ? factors : ["Building momentum is key to success"];
}

function generateRecommendations(goal) {
  // Mock AI recommendations
  const recommendations = [];

  if (goal.progress < 30) {
    recommendations.push(
      "Break down into smaller daily actions to build momentum"
    );
    recommendations.push("Set a specific time each day to work on this goal");
  }

  if (!goal.milestones || goal.milestones.length < 3) {
    recommendations.push("Define clear milestones to track progress");
  }

  recommendations.push("Review and celebrate small wins weekly");
  recommendations.push("Find an accountability partner for this goal");

  return recommendations.slice(0, 4);
}

function generateTrajectoryData() {
  // Mock trajectory data
  return [
    { month: "Jan", realistic: 10, optimistic: 15, conservative: 5 },
    { month: "Feb", realistic: 22, optimistic: 30, conservative: 15 },
    { month: "Mar", realistic: 35, optimistic: 45, conservative: 25 },
    { month: "Apr", realistic: 48, optimistic: 60, conservative: 35 },
    { month: "May", realistic: 60, optimistic: 75, conservative: 45 },
    { month: "Jun", realistic: 72, optimistic: 88, conservative: 55 },
    { month: "Jul", realistic: 82, optimistic: 95, conservative: 65 },
    { month: "Aug", realistic: 90, optimistic: 100, conservative: 72 },
    { month: "Sep", realistic: 95, optimistic: 100, conservative: 78 },
    { month: "Oct", realistic: 98, optimistic: 100, conservative: 82 },
    { month: "Nov", realistic: 100, optimistic: 100, conservative: 85 },
    { month: "Dec", realistic: 100, optimistic: 100, conservative: 88 },
  ];
}

export default AchievementPredictionsTab;
