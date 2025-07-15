// frontend/src/components/goals/tabs/ProgressAnalyticsTab.jsx
import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Activity,
  Target,
  Zap,
  Award,
  LineChart as LineChartIcon,
  Timer,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  Hash,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  ScatterChart,
  Scatter,
  Cell,
  ComposedChart,
  ReferenceLine,
} from "recharts";

const ProgressAnalyticsTab = ({ goals, patterns, colors }) => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [viewMode, setViewMode] = useState("patterns");
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Mock data for different timeframes
  const weeklyData = [
    { day: "Mon", progress: 85, focus: 92, energy: 78 },
    { day: "Tue", progress: 72, focus: 85, energy: 65 },
    { day: "Wed", progress: 90, focus: 88, energy: 82 },
    { day: "Thu", progress: 65, focus: 70, energy: 60 },
    { day: "Fri", progress: 88, focus: 95, energy: 85 },
    { day: "Sat", progress: 95, focus: 98, energy: 90 },
    { day: "Sun", progress: 78, focus: 82, energy: 72 },
  ];

  const monthlyData = [
    { week: "Week 1", progress: 75, goals: 5, completed: 2 },
    { week: "Week 2", progress: 82, goals: 6, completed: 3 },
    { week: "Week 3", progress: 88, goals: 7, completed: 4 },
    { week: "Week 4", progress: 92, goals: 8, completed: 5 },
  ];

  const timeOfDayData = [
    { time: "6AM", productivity: 45 },
    { time: "9AM", productivity: 85 },
    { time: "12PM", productivity: 70 },
    { time: "3PM", productivity: 60 },
    { time: "6PM", productivity: 75 },
    { time: "9PM", productivity: 55 },
  ];

  // Velocity metrics for each goal
  const goalVelocities = goals.slice(0, 8).map((goal) => ({
    id: goal.id,
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    currentVelocity: Math.random() * 5 + 1,
    avgVelocity: Math.random() * 4 + 2,
    acceleration: (Math.random() - 0.5) * 2,
    momentum: Math.random() * 100,
    trend:
      Math.random() > 0.5
        ? "accelerating"
        : Math.random() > 0.3
        ? "steady"
        : "decelerating",
    daysToComplete: Math.floor(Math.random() * 60) + 30,
    mentions: Math.floor(Math.random() * 50) + 10,
    lastMention: Math.floor(Math.random() * 7) + 1,
  }));

  // Velocity over time data
  const velocityTimeline = [
    {
      week: "W1",
      avgVelocity: 2.5,
      minVelocity: 0.5,
      maxVelocity: 4.5,
      acceleration: 0,
      mentions: 32,
    },
    {
      week: "W2",
      avgVelocity: 3.2,
      minVelocity: 1.0,
      maxVelocity: 5.2,
      acceleration: 0.7,
      mentions: 45,
    },
    {
      week: "W3",
      avgVelocity: 3.8,
      minVelocity: 1.5,
      maxVelocity: 6.0,
      acceleration: 0.6,
      mentions: 58,
    },
    {
      week: "W4",
      avgVelocity: 4.1,
      minVelocity: 2.0,
      maxVelocity: 6.5,
      acceleration: 0.3,
      mentions: 52,
    },
    {
      week: "W5",
      avgVelocity: 3.9,
      minVelocity: 1.8,
      maxVelocity: 6.2,
      acceleration: -0.2,
      mentions: 48,
    },
    {
      week: "W6",
      avgVelocity: 4.5,
      minVelocity: 2.5,
      maxVelocity: 7.0,
      acceleration: 0.6,
      mentions: 65,
    },
  ];

  const goalProgressComparison = goals.map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 15) + "...",
    current: goal.progress || 0,
    projected: Math.min(100, (goal.progress || 0) + 20),
    momentum: Math.random() * 30 + 70,
  }));

  const patternInsights = [
    {
      type: "success",
      title: "Peak Performance Time",
      description: "You make the most progress between 9 AM and 11 AM",
      icon: Clock,
    },
    {
      type: "info",
      title: "Weekly Pattern",
      description: "Saturdays show 20% higher productivity than weekdays",
      icon: Calendar,
    },
    {
      type: "warning",
      title: "Energy Dip",
      description: "Thursday afternoons show consistent low progress",
      icon: Activity,
    },
  ];

  // Momentum indicators
  const momentumIndicators = {
    overall: 78,
    trending: "up",
    sustainabilityScore: 82,
    riskOfStalling: 15,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Progress Analytics & Patterns
        </h3>
        <p className="text-sm text-gray-300">
          Track progress patterns, velocity, and goal mentions over time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="patterns">Progress Patterns</option>
            <option value="velocity">Velocity Analysis</option>
            <option value="mentions">Goal Mentions</option>
            <option value="comparison">Goal Comparison</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Timeframe:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <VelocityMetricCard
          icon={Gauge}
          label="Avg Velocity"
          value="3.8"
          unit="pts/day"
          trend={+0.5}
          color={colors.primary}
        />
        <VelocityMetricCard
          icon={TrendingUp}
          label="Acceleration"
          value="+0.8"
          unit="pts/day²"
          trend={+0.2}
          color={colors.success}
        />
        <VelocityMetricCard
          icon={MessageSquare}
          label="Goal Mentions"
          value="256"
          unit="last 30 days"
          trend={+32}
          color={colors.secondary}
        />
        <VelocityMetricCard
          icon={Activity}
          label="Momentum Score"
          value={momentumIndicators.overall}
          unit="%"
          trend={+5}
          color={colors.info}
        />
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === "patterns" && (
        <>
          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Weekly Progress Pattern */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                {timeframe === "weekly" ? "Weekly" : "Monthly"} Progress Pattern
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeframe === "weekly" ? weeklyData : monthlyData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey={timeframe === "weekly" ? "day" : "week"}
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
                      dataKey="progress"
                      stackId="1"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.6}
                    />
                    {timeframe === "weekly" && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="focus"
                          stackId="2"
                          stroke={colors.secondary}
                          fill={colors.secondary}
                          fillOpacity={0.4}
                        />
                        <Area
                          type="monotone"
                          dataKey="energy"
                          stackId="3"
                          stroke={colors.accent}
                          fill={colors.accent}
                          fillOpacity={0.2}
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {timeframe === "weekly" && (
                <div className="flex items-center justify-center gap-4 mt-3">
                  <LegendItem color={colors.primary} label="Progress" />
                  <LegendItem color={colors.secondary} label="Focus" />
                  <LegendItem color={colors.accent} label="Energy" />
                </div>
              )}
            </div>

            {/* Time of Day Analysis */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Productivity by Time of Day
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeOfDayData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="time"
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
                    <Bar dataKey="productivity" fill={colors.primary}>
                      {timeOfDayData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.productivity > 70
                              ? colors.success
                              : entry.productivity > 50
                              ? colors.warning
                              : colors.danger
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Higher bars indicate more productive time periods
              </p>
            </div>
          </div>

          {/* Pattern Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {patternInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </>
      )}

      {viewMode === "velocity" && (
        <>
          {/* Velocity Timeline */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Velocity & Acceleration Timeline
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={velocityTimeline}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="week"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
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
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="minVelocity"
                    stackId="1"
                    stroke="transparent"
                    fill={colors.primary}
                    fillOpacity={0.2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxVelocity"
                    stackId="1"
                    stroke="transparent"
                    fill={colors.primary}
                    fillOpacity={0.2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgVelocity"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="acceleration"
                    fill={colors.secondary}
                    fillOpacity={0.6}
                  >
                    {velocityTimeline.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.acceleration >= 0
                            ? colors.success
                            : colors.danger
                        }
                      />
                    ))}
                  </Bar>
                  <ReferenceLine
                    y={0}
                    yAxisId="right"
                    stroke={colors.danger}
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <LegendItem
                label="Velocity Range"
                color={colors.primary}
                opacity={0.2}
              />
              <LegendItem label="Avg Velocity" color={colors.primary} />
              <LegendItem label="Acceleration" color={colors.secondary} />
            </div>
          </div>

          {/* Goal Velocity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Goal Velocity Comparison
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {goalVelocities.map((goal) => (
                  <GoalVelocityCard
                    key={goal.id}
                    goal={goal}
                    colors={colors}
                    isSelected={selectedGoalId === goal.id}
                    onSelect={() => setSelectedGoalId(goal.id)}
                  />
                ))}
              </div>
            </div>

            {/* Velocity Insights */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
              <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Velocity Insights
              </h4>
              <div className="space-y-3">
                <InsightItem
                  type="positive"
                  title="Strong Acceleration Detected"
                  description="3 goals showing consistent velocity increase over 2 weeks"
                  recommendation="Maintain current strategies for these high-performers"
                />
                <InsightItem
                  type="warning"
                  title="Deceleration Alert"
                  description="2 goals showing velocity decrease of >30%"
                  recommendation="Review blockers and adjust approach"
                />
                <InsightItem
                  type="info"
                  title="Optimal Velocity Range"
                  description="Goals with 3-4 pts/day velocity have highest completion rate"
                  recommendation="Adjust pacing for outlier goals"
                />
                <InsightItem
                  type="action"
                  title="Sprint Opportunity"
                  description="'Fitness Goal' is 85% complete with high velocity"
                  recommendation="Push for completion in next 5 days"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === "mentions" && (
        <>
          {/* Mention Timeline */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Mention Timeline
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={velocityTimeline}>
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
                  <Bar dataKey="mentions" fill={colors.primary} opacity={0.8} />
                  <Line
                    type="monotone"
                    dataKey="avgVelocity"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    dot={{ fill: colors.secondary }}
                    yAxisId="right"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Correlation between goal mentions and progress velocity
            </p>
          </div>

          {/* Goal Mention Frequency */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Mention Frequency
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {goalVelocities.map((goal, index) => (
                <GoalMentionCard
                  key={index}
                  goal={goal}
                  isSelected={selectedGoalId === goal.id}
                  onSelect={() => setSelectedGoalId(goal.id)}
                  color={colors.gradient[index % colors.gradient.length]}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === "comparison" && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
          <h4 className="text-md font-semibold text-white mb-4">
            Goal Progress Comparison
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={goalProgressComparison.slice(0, 6)}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Radar
                  name="Current Progress"
                  dataKey="current"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Projected Progress"
                  dataKey="projected"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.2}
                />
                <Radar
                  name="Momentum"
                  dataKey="momentum"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.1}
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
      )}

      {/* Progress Velocity Indicator */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-white mb-1">
              Overall Progress Velocity
            </h4>
            <p className="text-sm text-gray-300">
              Your goal progress is accelerating at a healthy pace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">+15%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const VelocityMetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  color,
}) => {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" style={{ color }} />
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUp className="h-3 w-3 text-green-400" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-400" />
          )}
          <span className={isPositive ? "text-green-400" : "text-red-400"}>
            {Math.abs(trend)}
          </span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-300">{label}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  );
};

const LegendItem = ({ color, label, opacity = 1 }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded"
      style={{ backgroundColor: color, opacity }}
    />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

const InsightCard = ({ insight }) => {
  const IconComponent = insight.icon;
  const bgColor =
    insight.type === "success"
      ? "bg-green-500/10 border-green-400/30"
      : insight.type === "warning"
      ? "bg-yellow-500/10 border-yellow-400/30"
      : "bg-blue-500/10 border-blue-400/30";

  const iconColor =
    insight.type === "success"
      ? "text-green-400"
      : insight.type === "warning"
      ? "text-yellow-400"
      : "text-blue-400";

  return (
    <div className={`${bgColor} rounded-lg border p-4`}>
      <div className="flex items-start gap-3">
        <IconComponent
          className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`}
        />
        <div>
          <h5 className="font-medium text-white text-sm mb-1">
            {insight.title}
          </h5>
          <p className="text-xs text-gray-300">{insight.description}</p>
        </div>
      </div>
    </div>
  );
};

const GoalVelocityCard = ({ goal, colors, isSelected, onSelect }) => {
  const trendIcon =
    goal.trend === "accelerating" ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : goal.trend === "decelerating" ? (
      <TrendingDown className="h-4 w-4 text-red-400" />
    ) : (
      <Activity className="h-4 w-4 text-yellow-400" />
    );

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-purple-500/20 border border-purple-400/30"
          : "bg-white/5 border border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white truncate">
          {goal.name}
        </span>
        {trendIcon}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Current</span>
          <p className="text-white font-medium">
            {goal.currentVelocity.toFixed(1)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Average</span>
          <p className="text-white font-medium">
            {goal.avgVelocity.toFixed(1)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">ETA</span>
          <p className="text-white font-medium">{goal.daysToComplete}d</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-400">Momentum</div>
        <div className="flex-1 ml-2 bg-gray-700/50 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${goal.momentum}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const GoalMentionCard = ({ goal, isSelected, onSelect, color }) => {
  const trendIcon =
    goal.trend === "accelerating" ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
    );

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
          {goal.name}
        </h5>
        <div className="flex items-center gap-2">
          {trendIcon}
          <span className="text-sm font-medium text-white">
            {goal.mentions}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Last: {goal.lastMention} days ago</span>
        <span>Velocity: {goal.currentVelocity.toFixed(1)} pts/day</span>
      </div>
      <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
        <div
          className="h-1 rounded-full"
          style={{
            width: `${(goal.mentions / 50) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

const InsightItem = ({ type, title, description, recommendation }) => {
  const typeStyles = {
    positive: "bg-green-500/10 border-green-400/30",
    warning: "bg-yellow-500/10 border-yellow-400/30",
    info: "bg-blue-500/10 border-blue-400/30",
    action: "bg-purple-500/10 border-purple-400/30",
  };

  const iconStyles = {
    positive: "text-green-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    action: "text-purple-400",
  };

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[type]}`}>
      <h5 className={`font-medium text-white text-sm mb-1 ${iconStyles[type]}`}>
        {title}
      </h5>
      <p className="text-xs text-gray-300 mb-2">{description}</p>
      <p className="text-xs text-gray-400 italic">{recommendation}</p>
    </div>
  );
};

export default ProgressAnalyticsTab;
