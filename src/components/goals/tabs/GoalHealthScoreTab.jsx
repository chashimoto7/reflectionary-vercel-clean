// frontend/ src/components/goals/tabs/GoalHealthScoreTab.jsx
import React, { useState } from "react";
import {
  Gauge,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  Shield,
  Award,
  BarChart3,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";

const GoalHealthScoreTab = ({ goals, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeframe, setTimeframe] = useState("current");

  // Calculate overall health score
  const overallHealthScore = calculateOverallHealth(goals);

  // Health categories
  const healthCategories = [
    {
      category: "Balance",
      score: 78,
      description: "Goal diversity across life areas",
      status: "good",
      factors: [
        "Well distributed goals",
        "No overconcentration",
        "Life balance maintained",
      ],
    },
    {
      category: "Momentum",
      score: 82,
      description: "Progress velocity and consistency",
      status: "excellent",
      factors: [
        "Strong weekly progress",
        "Consistent engagement",
        "Positive trajectory",
      ],
    },
    {
      category: "Clarity",
      score: 68,
      description: "Goal definition and milestones",
      status: "needs_attention",
      factors: [
        "Some vague goals",
        "Missing milestones",
        "Unclear success criteria",
      ],
    },
    {
      category: "Sustainability",
      score: 75,
      description: "Long-term viability",
      status: "good",
      factors: [
        "Realistic timelines",
        "Resource availability",
        "Manageable workload",
      ],
    },
    {
      category: "Engagement",
      score: 88,
      description: "Active participation",
      status: "excellent",
      factors: ["Daily check-ins", "Regular updates", "High interaction"],
    },
  ];

  // Individual goal health scores
  const goalHealthScores = goals.slice(0, 8).map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    healthScore: Math.floor(Math.random() * 40) + 60,
    balance: Math.floor(Math.random() * 30) + 70,
    momentum: Math.floor(Math.random() * 35) + 65,
    clarity: Math.floor(Math.random() * 25) + 75,
    sustainability: Math.floor(Math.random() * 30) + 70,
    engagement: Math.floor(Math.random() * 40) + 60,
    risk: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
  }));

  // Health trend data
  const healthTrend = [
    {
      month: "Jan",
      overall: 65,
      balance: 60,
      momentum: 70,
      clarity: 62,
      engagement: 68,
    },
    {
      month: "Feb",
      overall: 72,
      balance: 68,
      momentum: 75,
      clarity: 70,
      engagement: 72,
    },
    {
      month: "Mar",
      overall: 75,
      balance: 72,
      momentum: 78,
      clarity: 71,
      engagement: 76,
    },
    {
      month: "Apr",
      overall: 78,
      balance: 75,
      momentum: 80,
      clarity: 74,
      engagement: 80,
    },
    {
      month: "May",
      overall: 82,
      balance: 78,
      momentum: 82,
      clarity: 76,
      engagement: 85,
    },
    {
      month: "Jun",
      overall: 80,
      balance: 78,
      momentum: 82,
      clarity: 68,
      engagement: 88,
    },
  ];

  // Portfolio risks
  const portfolioRisks = [
    {
      risk: "Overcommitment",
      severity: "medium",
      affected: 3,
      description: "Too many active goals",
    },
    {
      risk: "Unclear Priorities",
      severity: "high",
      affected: 2,
      description: "Conflicting goal timelines",
    },
    {
      risk: "Resource Strain",
      severity: "low",
      affected: 1,
      description: "Limited time allocation",
    },
    {
      risk: "Motivation Decline",
      severity: "medium",
      affected: 2,
      description: "Lack of quick wins",
    },
  ];

  // Radial data for main score
  const radialData = [
    {
      name: "Health",
      value: overallHealthScore,
      fill: getHealthColor(overallHealthScore),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Gauge className="h-5 w-5 text-purple-400" />
          Goal Portfolio Health Score
        </h3>
        <p className="text-sm text-gray-300">
          Comprehensive assessment of your goal ecosystem health
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Categories</option>
          <option value="balance">Balance</option>
          <option value="momentum">Momentum</option>
          <option value="clarity">Clarity</option>
          <option value="sustainability">Sustainability</option>
          <option value="engagement">Engagement</option>
        </select>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="current">Current Status</option>
          <option value="trend">6 Month Trend</option>
          <option value="projection">Future Projection</option>
        </select>
      </div>

      {/* Main Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overall Score */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h4 className="text-md font-semibold text-white mb-4 text-center">
            Overall Health Score
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={radialData}
              >
                <PolarGrid stroke="none" />
                <RadialBar
                  minAngle={15}
                  background={{ fill: "rgba(255,255,255,0.1)" }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                  fill={getHealthColor(overallHealthScore)}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white"
                >
                  <tspan className="text-4xl font-bold">
                    {overallHealthScore}
                  </tspan>
                  <tspan className="text-sm" x="50%" dy="1.5em">
                    /100
                  </tspan>
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white mb-1">
              {getHealthStatus(overallHealthScore)}
            </p>
            <p className="text-xs text-gray-400">
              {getHealthDescription(overallHealthScore)}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Health Categories
          </h4>
          <div className="space-y-3">
            {healthCategories.map((category, index) => (
              <HealthCategoryBar
                key={index}
                category={category}
                colors={colors}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Health Trend Chart */}
      {timeframe === "trend" && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
          <h4 className="text-md font-semibold text-white mb-4">
            Health Score Trends
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke={colors.primary}
                  strokeWidth={3}
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Balance"
                />
                <Line
                  type="monotone"
                  dataKey="momentum"
                  stroke={colors.accent}
                  strokeWidth={2}
                  name="Momentum"
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke={colors.success}
                  strokeWidth={2}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Goal Health */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Individual Goal Health Scores
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-sm text-gray-300">Goal</th>
                <th className="text-center p-3 text-sm text-gray-300">
                  Overall
                </th>
                <th className="text-center p-3 text-sm text-gray-300">
                  Balance
                </th>
                <th className="text-center p-3 text-sm text-gray-300">
                  Momentum
                </th>
                <th className="text-center p-3 text-sm text-gray-300">
                  Clarity
                </th>
                <th className="text-center p-3 text-sm text-gray-300">Risk</th>
              </tr>
            </thead>
            <tbody>
              {goalHealthScores.map((goal, index) => (
                <GoalHealthRow key={index} goal={goal} colors={colors} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            Portfolio Risks
          </h4>
          <div className="space-y-3">
            {portfolioRisks.map((risk, index) => (
              <RiskCard key={index} risk={risk} colors={colors} />
            ))}
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Health Improvement Plan
          </h4>
          <div className="space-y-3">
            <RecommendationItem
              priority="high"
              action="Define clear milestones for vague goals"
              impact="Improve clarity score by 15 points"
            />
            <RecommendationItem
              priority="medium"
              action="Balance portfolio with personal goals"
              impact="Enhance life balance by 20%"
            />
            <RecommendationItem
              priority="medium"
              action="Schedule weekly goal reviews"
              impact="Boost momentum by 10 points"
            />
            <RecommendationItem
              priority="low"
              action="Celebrate recent completions"
              impact="Maintain high engagement levels"
            />
          </div>
        </div>
      </div>

      {/* Health Score Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-white mb-1">
              Portfolio Health Summary
            </h4>
            <p className="text-sm text-gray-300">
              Your goal portfolio is{" "}
              {getHealthStatus(overallHealthScore).toLowerCase()} with room for
              optimization in clarity and balance.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {overallHealthScore}
            </p>
            <p className="text-sm text-gray-400">Health Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function calculateOverallHealth(goals) {
  // Mock calculation - in real app, this would be based on actual metrics
  return 80;
}

function getHealthColor(score) {
  if (score >= 80) return "#10B981"; // Green
  if (score >= 60) return "#F59E0B"; // Yellow
  return "#EF4444"; // Red
}

function getHealthStatus(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Attention";
}

function getHealthDescription(score) {
  if (score >= 90)
    return "Your goal portfolio is optimally balanced and thriving";
  if (score >= 80) return "Strong performance with minor areas for improvement";
  if (score >= 70)
    return "Healthy portfolio with some optimization opportunities";
  if (score >= 60) return "Several areas need attention for better balance";
  return "Significant improvements needed for portfolio health";
}

// Helper Components
const HealthCategoryBar = ({ category, colors }) => {
  const statusColor =
    category.status === "excellent"
      ? colors.success
      : category.status === "good"
      ? colors.primary
      : category.status === "needs_attention"
      ? colors.warning
      : colors.danger;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-white">
            {category.category}
          </span>
          <p className="text-xs text-gray-400">{category.description}</p>
        </div>
        <span className="text-sm font-bold text-white">{category.score}</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${category.score}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {category.factors.map((factor, index) => (
          <span key={index} className="text-xs text-gray-400">
            • {factor}
          </span>
        ))}
      </div>
    </div>
  );
};

const GoalHealthRow = ({ goal, colors }) => {
  const riskColor =
    goal.risk === "high"
      ? colors.danger
      : goal.risk === "medium"
      ? colors.warning
      : colors.success;

  return (
    <tr className="border-b border-white/5">
      <td className="p-3 text-sm text-white">{goal.name}</td>
      <td className="p-3 text-center">
        <HealthBadge score={goal.healthScore} />
      </td>
      <td className="p-3 text-center">
        <MiniBar value={goal.balance} color={colors.secondary} />
      </td>
      <td className="p-3 text-center">
        <MiniBar value={goal.momentum} color={colors.primary} />
      </td>
      <td className="p-3 text-center">
        <MiniBar value={goal.clarity} color={colors.accent} />
      </td>
      <td className="p-3 text-center">
        <span
          className="text-xs px-2 py-1 rounded capitalize"
          style={{
            backgroundColor: `${riskColor}20`,
            color: riskColor,
          }}
        >
          {goal.risk}
        </span>
      </td>
    </tr>
  );
};

const HealthBadge = ({ score }) => {
  const color = getHealthColor(score);
  return (
    <span
      className="text-sm font-bold px-3 py-1 rounded-full"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {score}
    </span>
  );
};

const MiniBar = ({ value, color }) => (
  <div className="w-16 mx-auto">
    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full"
        style={{
          width: `${value}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <span className="text-xs text-gray-400">{value}</span>
  </div>
);

const RiskCard = ({ risk, colors }) => {
  const severityColor =
    risk.severity === "high"
      ? colors.danger
      : risk.severity === "medium"
      ? colors.warning
      : colors.info;

  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
      <AlertCircle
        className="h-5 w-5 flex-shrink-0"
        style={{ color: severityColor }}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h5 className="text-sm font-medium text-white">{risk.risk}</h5>
          <span
            className="text-xs px-2 py-1 rounded capitalize"
            style={{
              backgroundColor: `${severityColor}20`,
              color: severityColor,
            }}
          >
            {risk.severity}
          </span>
        </div>
        <p className="text-xs text-gray-400">{risk.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          Affects {risk.affected} goal{risk.affected > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

const RecommendationItem = ({ priority, action, impact }) => {
  const priorityColor =
    priority === "high"
      ? "#EF4444"
      : priority === "medium"
      ? "#F59E0B"
      : "#10B981";

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: priorityColor }}
      />
      <div>
        <p className="text-sm text-white">{action}</p>
        <p className="text-xs text-purple-400 mt-1">{impact}</p>
      </div>
    </div>
  );
};

export default GoalHealthScoreTab;
