// frontend/src/components/goals/tabs/PredictionsTab.jsx
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
  Award,
  BarChart3,
  LineChart as LineChartIcon,
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
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

const PredictionsTab = ({ goals, analytics, colors }) => {
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [predictionTimeframe, setPredictionTimeframe] = useState("3months");
  const [viewMode, setViewMode] = useState("overview");

  // Early return for empty state
  if (goals.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            AI-Powered Predictions
          </h3>
          <p className="text-sm text-gray-300">
            Get AI predictions for goal completion and progress trajectories
          </p>
        </div>
        <div className="text-center py-16">
          <TrendingUp className="h-20 w-20 text-gray-600 mx-auto mb-6" />
          <h4 className="text-xl font-semibold text-gray-300 mb-3">
            No Prediction Data Available
          </h4>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create goals and track progress for a few days to unlock AI-powered completion predictions and trend analysis.
          </p>
        </div>
      </div>
    );
  }

  // Generate predictions for each goal
  const predictions = goals.map((goal) => ({
    ...goal,
    predictedCompletion: calculatePredictedCompletion(goal),
    confidenceScore: calculateConfidenceScore(goal),
    riskFactors: identifyRiskFactors(goal),
    successFactors: identifySuccessFactors(goal),
    recommendedActions: generateRecommendations(goal),
    velocityTrend: calculateVelocityTrend(goal),
    predictedDate: calculatePredictedDate(goal),
  }));

  // Overall portfolio predictions
  const portfolioPredictions = {
    successRate: predictions.filter((p) => p.predictedCompletion > 70).length,
    atRiskCount: predictions.filter((p) => p.predictedCompletion < 40).length,
    avgConfidence: Math.round(
      predictions.reduce((acc, p) => acc + p.confidenceScore, 0) /
        predictions.length
    ),
    topPerformers: predictions
      .filter((p) => p.velocityTrend > 0)
      .sort((a, b) => b.predictedCompletion - a.predictedCompletion)
      .slice(0, 3),
  };

  // Mock trajectory data
  const trajectoryData = generateTrajectoryData();

  // Success factor radar data
  const successFactorRadarData = [
    { factor: "Consistency", current: 75, optimal: 90, predicted: 82 },
    { factor: "Momentum", current: 82, optimal: 85, predicted: 88 },
    { factor: "Resources", current: 65, optimal: 80, predicted: 72 },
    { factor: "Motivation", current: 88, optimal: 90, predicted: 85 },
    { factor: "Support", current: 70, optimal: 85, predicted: 78 },
    { factor: "Clarity", current: 92, optimal: 95, predicted: 94 },
  ];

  // Comparison scatter data
  const comparisonData = predictions.map((pred) => ({
    x: pred.progress || 0,
    y: pred.predictedCompletion,
    name: pred.decryptedTitle,
    confidence: pred.confidenceScore,
    risk:
      pred.predictedCompletion < 40
        ? "high"
        : pred.predictedCompletion < 70
        ? "medium"
        : "low",
  }));

  // Milestone prediction timeline
  const milestonePredictions = [
    { month: "Jan", planned: 12, predicted: 11, actual: 10 },
    { month: "Feb", planned: 15, predicted: 16, actual: 14 },
    { month: "Mar", planned: 18, predicted: 17, actual: null },
    { month: "Apr", planned: 20, predicted: 22, actual: null },
    { month: "May", planned: 16, predicted: 18, actual: null },
    { month: "Jun", planned: 22, predicted: 25, actual: null },
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
          Machine learning predictions for goal completion and success factors
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="overview">Overview</option>
          <option value="individual">Individual Goals</option>
          <option value="timeline">Timeline View</option>
          <option value="comparison">Comparison Analysis</option>
        </select>
        <select
          value={predictionTimeframe}
          onChange={(e) => setPredictionTimeframe(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="1month">Next Month</option>
          <option value="3months">Next 3 Months</option>
          <option value="6months">Next 6 Months</option>
          <option value="1year">Next Year</option>
        </select>
      </div>

      {/* Overall Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Goals Likely to Succeed"
          value={portfolioPredictions.successRate}
          total={predictions.length}
          icon={CheckCircle2}
          color="#10B981"
        />
        <MetricCard
          title="Goals at Risk"
          value={portfolioPredictions.atRiskCount}
          total={predictions.length}
          icon={AlertCircle}
          color="#EF4444"
        />
        <MetricCard
          title="Average Confidence"
          value={`${portfolioPredictions.avgConfidence}%`}
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

      {viewMode === "overview" && (
        <>
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
                Success Factor Predictions
              </h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={successFactorRadarData}>
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
                      name="Predicted"
                      dataKey="predicted"
                      stroke={colors.success}
                      fill={colors.success}
                      fillOpacity={0.2}
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
        </>
      )}

      {viewMode === "individual" && selectedPrediction && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            {selectedPrediction.decryptedTitle}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prediction Metrics */}
            <div>
              <h5 className="text-md font-medium text-white mb-3">
                Prediction Metrics
              </h5>
              <div className="space-y-3">
                <MetricRow
                  label="Predicted Completion"
                  value={`${selectedPrediction.predictedCompletion}%`}
                  color={colors.primary}
                />
                <MetricRow
                  label="Confidence Score"
                  value={`${selectedPrediction.confidenceScore}%`}
                  color={colors.secondary}
                />
                <MetricRow
                  label="Predicted Date"
                  value={selectedPrediction.predictedDate}
                  color={colors.info}
                />
                <MetricRow
                  label="Velocity Trend"
                  value={`${selectedPrediction.velocityTrend > 0 ? "+" : ""}${
                    selectedPrediction.velocityTrend
                  }%`}
                  color={
                    selectedPrediction.velocityTrend > 0
                      ? colors.success
                      : colors.danger
                  }
                />
              </div>
            </div>

            {/* Risk & Success Factors */}
            <div>
              <h5 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                Risk Factors
              </h5>
              <div className="space-y-2 mb-4">
                {selectedPrediction.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="text-sm text-gray-300">{factor}</span>
                  </div>
                ))}
              </div>

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

      {viewMode === "timeline" && (
        <>
          {/* Milestone Predictions Timeline */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Milestone Achievement Predictions
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={milestonePredictions}>
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
                  <Bar dataKey="actual" fill={colors.success} opacity={0.8} />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={colors.primary}
                    strokeWidth={3}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke={colors.secondary}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <LegendItem color={colors.success} label="Actual" />
              <LegendItem color={colors.primary} label="Predicted" dashed />
              <LegendItem color={colors.secondary} label="Planned" />
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Predicted Top Performers
            </h4>
            <div className="space-y-3">
              {portfolioPredictions.topPerformers.map((goal, index) => (
                <TopPerformerCard
                  key={goal.id}
                  goal={goal}
                  rank={index + 1}
                  colors={colors}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === "comparison" && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
          <h4 className="text-md font-semibold text-white mb-4">
            Current vs Predicted Progress
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Current Progress"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Predicted Completion"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Scatter name="Goals" data={comparisonData}>
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.risk === "high"
                          ? colors.danger
                          : entry.risk === "medium"
                          ? colors.warning
                          : colors.success
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Points above the diagonal line are predicted to accelerate, below to
            decelerate
          </p>
        </div>
      )}

      {/* AI Insights Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Prediction Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard
            type="achievement"
            title="High Confidence Predictions"
            description="3 goals show >85% completion likelihood with current momentum"
            icon={TrendingUp}
          />
          <InsightCard
            type="warning"
            title="Attention Required"
            description="2 goals need intervention to meet predicted timelines"
            icon={AlertCircle}
          />
          <InsightCard
            type="pattern"
            title="Velocity Pattern"
            description="Goals with weekly milestones show 40% better prediction accuracy"
            icon={Activity}
          />
          <InsightCard
            type="recommendation"
            title="Success Strategy"
            description="Focus on top 3 predicted performers for maximum impact"
            icon={Zap}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function calculatePredictedCompletion(goal) {
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
  const factors = [
    goal.milestones?.length > 0 ? 20 : 0,
    goal.progress > 0 ? 25 : 0,
    goal.status === "active" ? 30 : 0,
    Math.random() * 25, // Random factor for demo
  ];

  return Math.round(factors.reduce((a, b) => a + b, 0));
}

function calculateVelocityTrend(goal) {
  // Mock velocity trend calculation
  return Math.round((Math.random() - 0.5) * 40);
}

function calculatePredictedDate(goal) {
  const daysToComplete = Math.floor(Math.random() * 90) + 30;
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + daysToComplete);
  return predictedDate.toLocaleDateString();
}

function identifyRiskFactors(goal) {
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

const TopPerformerCard = ({ goal, rank, colors }) => {
  const rankColors = {
    1: colors.warning,
    2: colors.secondary,
    3: colors.info,
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
        style={{
          backgroundColor: `${rankColors[rank]}20`,
          color: rankColors[rank],
        }}
      >
        {rank}
      </div>
      <div className="flex-1">
        <h5 className="font-medium text-white text-sm">
          {goal.decryptedTitle}
        </h5>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Current: {goal.progress}%</span>
          <span>Predicted: {goal.predictedCompletion}%</span>
          <span className="text-green-400">
            +{goal.velocityTrend}% velocity
          </span>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
    <span className="text-sm text-gray-300">{label}</span>
    <span className="text-sm font-medium" style={{ color }}>
      {value}
    </span>
  </div>
);

const LegendItem = ({ color, label, dashed }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded"
      style={{
        backgroundColor: color,
        border: dashed ? `2px dashed ${color}` : "none",
        backgroundColor: dashed ? "transparent" : color,
      }}
    />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

const InsightCard = ({ type, title, description, icon: Icon }) => {
  const typeColors = {
    achievement: "#10B981",
    warning: "#F59E0B",
    pattern: "#3B82F6",
    recommendation: "#8B5CF6",
  };

  return (
    <div className="flex items-start gap-3">
      <Icon
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        style={{ color: typeColors[type] }}
      />
      <div>
        <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
        <p className="text-xs text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default PredictionsTab;
