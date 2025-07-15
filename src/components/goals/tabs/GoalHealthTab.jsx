// frontend/src/components/goals/tabs/GoalHealthTab.jsx
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
  Zap,
  Brain,
  Calendar,
  Clock,
  Users,
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
  RadarChart,
  Radar,
} from "recharts";

const GoalHealthTab = ({ goals, analytics, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeframe, setTimeframe] = useState("current");

  // Calculate overall health score
  const overallHealthScore = calculateOverallHealth(goals);

  // Health categories with success factors integrated
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
      successFactorScore: 0.85,
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
      successFactorScore: 0.92,
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
      successFactorScore: 0.78,
    },
    {
      category: "Resources",
      score: 82,
      description: "Tools and support availability",
      status: "good",
      factors: [
        "Well-resourced goals",
        "Digital tools available",
        "Time allocated",
      ],
      successFactorScore: 0.75,
    },
    {
      category: "Engagement",
      score: 88,
      description: "Active participation",
      status: "excellent",
      factors: ["Daily check-ins", "Regular updates", "High interaction"],
      successFactorScore: 0.82,
    },
  ];

  // Individual goal health scores
  const goalHealthScores = goals.slice(0, 8).map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    healthScore: Math.floor(Math.random() * 40) + 60,
    balance: Math.floor(Math.random() * 30) + 70,
    momentum: Math.floor(Math.random() * 35) + 65,
    clarity: Math.floor(Math.random() * 25) + 75,
    resources: Math.floor(Math.random() * 30) + 70,
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

  // Radar data for success factors
  const successFactorRadarData = healthCategories.map((cat) => ({
    factor: cat.category,
    current: cat.score,
    optimal: 90,
    impact: cat.successFactorScore * 100,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Gauge className="h-5 w-5 text-purple-400" />
          Goal Health & Success Factors
        </h3>
        <p className="text-sm text-gray-300">
          Comprehensive health assessment and success factor analysis
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
          <option value="resources">Resources</option>
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

      {/* Main Health Score and Success Factors */}
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

        {/* Success Factor Profile */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Success Factor Profile
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={successFactorRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Radar
                  name="Current Score"
                  dataKey="current"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Optimal Score"
                  dataKey="optimal"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="Impact Weight"
                  dataKey="impact"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.2}
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

      {/* Health Categories with Success Factors */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Health Categories & Success Factors
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

      {/* Portfolio Risks and Success Strategies */}
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

        {/* Success Strategies */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Success Enhancement Strategies
          </h4>
          <div className="space-y-3">
            <StrategyCard
              title="Boost Consistency"
              description="Set up daily reminders and track streaks"
              impact="Expected: +25% completion rate"
              icon={Activity}
            />
            <StrategyCard
              title="Optimize Time Blocks"
              description="Schedule goal work during peak hours (6-8 AM)"
              impact="Expected: +40% productivity"
              icon={Clock}
            />
            <StrategyCard
              title="Strengthen Milestones"
              description="Break down vague goals into weekly targets"
              impact="Expected: +35% clarity"
              icon={Target}
            />
            <StrategyCard
              title="Build Support Network"
              description="Share 2 goals publicly for accountability"
              impact="Expected: +30% motivation"
              icon={Users}
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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm font-bold text-white">
              {category.score}
            </span>
            <p className="text-xs text-gray-400">
              Impact: {(category.successFactorScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>
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

const StrategyCard = ({ title, description, impact, icon: Icon }) => (
  <div className="p-4 bg-white/5 rounded-lg">
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-purple-400 flex-shrink-0" />
      <div>
        <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
        <p className="text-xs text-gray-300 mb-2">{description}</p>
        <p className="text-xs text-purple-400 font-medium">{impact}</p>
      </div>
    </div>
  </div>
);

export default GoalHealthTab;
