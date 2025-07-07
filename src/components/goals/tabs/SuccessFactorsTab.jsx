// frontend/ src/components/goals/tabs/SuccessFactorsTab.jsx
import React, { useState } from "react";
import {
  Zap,
  TrendingUp,
  Target,
  Brain,
  Activity,
  Calendar,
  Clock,
  Users,
  Heart,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  Cell,
  PieChart,
  Pie,
} from "recharts";

const SuccessFactorsTab = ({ goals, colors }) => {
  const [selectedFactor, setSelectedFactor] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Key success factors data
  const successFactors = [
    {
      factor: "Consistency",
      score: 85,
      impact: 0.92,
      description: "Daily engagement with goals",
      trend: "up",
      insights: [
        "Goals with daily check-ins show 3x higher completion rate",
        "15-day streak average",
      ],
    },
    {
      factor: "Clear Milestones",
      score: 78,
      impact: 0.88,
      description: "Well-defined progress markers",
      trend: "up",
      insights: [
        "Goals with 3+ milestones have 65% higher success",
        "Weekly milestones most effective",
      ],
    },
    {
      factor: "Time Allocation",
      score: 72,
      impact: 0.85,
      description: "Dedicated time blocks",
      trend: "stable",
      insights: [
        "Morning sessions 2x more productive",
        "30-60 min blocks optimal",
      ],
    },
    {
      factor: "Social Support",
      score: 68,
      impact: 0.78,
      description: "Accountability and encouragement",
      trend: "down",
      insights: [
        "Shared goals 40% more likely to succeed",
        "Weekly check-ins boost completion",
      ],
    },
    {
      factor: "Resource Access",
      score: 82,
      impact: 0.75,
      description: "Tools and materials availability",
      trend: "stable",
      insights: [
        "Well-resourced goals progress 50% faster",
        "Digital tools increase engagement",
      ],
    },
    {
      factor: "Emotional State",
      score: 76,
      impact: 0.82,
      description: "Positive mood correlation",
      trend: "up",
      insights: [
        "High energy days show 80% more progress",
        "Stress reduces goal focus by 45%",
      ],
    },
  ];

  // Factor correlation matrix
  const factorCorrelations = {
    consistency: {
      milestones: 0.85,
      time: 0.78,
      support: 0.65,
      resources: 0.72,
      emotion: 0.68,
    },
    milestones: {
      consistency: 0.85,
      time: 0.82,
      support: 0.58,
      resources: 0.75,
      emotion: 0.62,
    },
    time: {
      consistency: 0.78,
      milestones: 0.82,
      support: 0.55,
      resources: 0.68,
      emotion: 0.7,
    },
  };

  // Success patterns by goal type
  const goalTypePatterns = [
    {
      type: "Health & Fitness",
      topFactor: "Consistency",
      successRate: 78,
      avgFactorScore: 82,
    },
    {
      type: "Career & Skills",
      topFactor: "Clear Milestones",
      successRate: 72,
      avgFactorScore: 76,
    },
    {
      type: "Personal Growth",
      topFactor: "Emotional State",
      successRate: 85,
      avgFactorScore: 80,
    },
    {
      type: "Financial",
      topFactor: "Resource Access",
      successRate: 68,
      avgFactorScore: 74,
    },
    {
      type: "Relationships",
      topFactor: "Social Support",
      successRate: 82,
      avgFactorScore: 78,
    },
  ];

  // Time series data for factor trends
  const factorTrends = [
    { week: "W1", consistency: 65, milestones: 70, time: 60, emotion: 72 },
    { week: "W2", consistency: 72, milestones: 74, time: 65, emotion: 68 },
    { week: "W3", consistency: 78, milestones: 76, time: 70, emotion: 75 },
    { week: "W4", consistency: 85, milestones: 78, time: 72, emotion: 76 },
  ];

  // Factor impact on different goal stages
  const stageImpact = [
    {
      stage: "Starting",
      consistency: 45,
      milestones: 85,
      time: 70,
      support: 80,
    },
    {
      stage: "Building",
      consistency: 75,
      milestones: 65,
      time: 80,
      support: 60,
    },
    {
      stage: "Maintaining",
      consistency: 90,
      milestones: 50,
      time: 75,
      support: 55,
    },
    {
      stage: "Completing",
      consistency: 85,
      milestones: 70,
      time: 85,
      support: 70,
    },
  ];

  // Radar data for overall factor analysis
  const radarData = successFactors.map((f) => ({
    factor: f.factor,
    current: f.score,
    optimal: 90,
    impact: f.impact * 100,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-purple-400" />
          Success Factors Analysis
        </h3>
        <p className="text-sm text-gray-300">
          Identify what drives your goal achievement success
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={selectedFactor}
          onChange={(e) => setSelectedFactor(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Factors</option>
          {successFactors.map((f) => (
            <option key={f.factor} value={f.factor}>
              {f.factor}
            </option>
          ))}
        </select>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Success Factor Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Factor Radar Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Success Factor Profile
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
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

        {/* Factor Trends */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Factor Trends Over Time
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={factorTrends}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="week"
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
                <Line
                  type="monotone"
                  dataKey="consistency"
                  stroke={colors.primary}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="milestones"
                  stroke={colors.secondary}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke={colors.accent}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="emotion"
                  stroke={colors.success}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Factor Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {successFactors.map((factor, index) => (
          <FactorCard key={index} factor={factor} colors={colors} />
        ))}
      </div>

      {/* Goal Type Success Patterns */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Success Patterns by Goal Type
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-sm text-gray-300">
                  Goal Type
                </th>
                <th className="text-left p-3 text-sm text-gray-300">
                  Top Success Factor
                </th>
                <th className="text-left p-3 text-sm text-gray-300">
                  Success Rate
                </th>
                <th className="text-left p-3 text-sm text-gray-300">
                  Avg Factor Score
                </th>
              </tr>
            </thead>
            <tbody>
              {goalTypePatterns.map((pattern, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="p-3 text-sm text-white">{pattern.type}</td>
                  <td className="p-3">
                    <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                      {pattern.topFactor}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700/50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${pattern.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-white">
                        {pattern.successRate}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-white">
                    {pattern.avgFactorScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Impact Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Factor Importance by Goal Stage
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageImpact} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis
                dataKey="stage"
                type="category"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="consistency" stackId="a" fill={colors.primary} />
              <Bar dataKey="milestones" stackId="a" fill={colors.secondary} />
              <Bar dataKey="time" stackId="a" fill={colors.accent} />
              <Bar dataKey="support" stackId="a" fill={colors.success} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <LegendItem color={colors.primary} label="Consistency" />
          <LegendItem color={colors.secondary} label="Milestones" />
          <LegendItem color={colors.accent} label="Time" />
          <LegendItem color={colors.success} label="Support" />
        </div>
      </div>

      {/* Success Factor Recommendations */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Personalized Success Strategies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StrategyCard
            title="Boost Consistency"
            description="Set up daily reminders and track streaks to improve your #1 success factor"
            impact="Expected: +25% completion rate"
            icon={Activity}
          />
          <StrategyCard
            title="Optimize Time Blocks"
            description="Schedule goal work during your peak hours (6-8 AM based on your data)"
            impact="Expected: +40% productivity"
            icon={Clock}
          />
          <StrategyCard
            title="Strengthen Milestones"
            description="Break down vague goals into specific weekly targets"
            impact="Expected: +35% clarity"
            icon={Target}
          />
          <StrategyCard
            title="Build Support Network"
            description="Share 2 goals publicly for accountability boost"
            impact="Expected: +30% motivation"
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FactorCard = ({ factor, colors }) => {
  const trendIcon =
    factor.trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : factor.trend === "down" ? (
      <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
    ) : (
      <Activity className="h-4 w-4 text-yellow-400" />
    );

  const impactColor =
    factor.impact > 0.85
      ? colors.success
      : factor.impact > 0.75
      ? colors.primary
      : colors.warning;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-white">{factor.factor}</h5>
        {trendIcon}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Score</span>
          <span className="text-sm font-medium text-white">
            {factor.score}/100
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${factor.score}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-300 mb-3">{factor.description}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Impact Score</span>
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{
            backgroundColor: `${impactColor}20`,
            color: impactColor,
          }}
        >
          {(factor.impact * 100).toFixed(0)}%
        </span>
      </div>

      <div className="space-y-1">
        {factor.insights.map((insight, index) => (
          <p
            key={index}
            className="text-xs text-gray-400 flex items-start gap-1"
          >
            <CheckCircle2 className="h-3 w-3 text-purple-400 flex-shrink-0 mt-0.5" />
            {insight}
          </p>
        ))}
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

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

export default SuccessFactorsTab;
