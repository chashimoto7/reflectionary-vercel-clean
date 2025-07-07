// frontend/ src/components/goals/tabs/ProgressVelocityTab.jsx
import React, { useState } from "react";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Timer,
  Zap,
  Target,
  Calendar,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Cell,
} from "recharts";

const ProgressVelocityTab = ({ goals, colors }) => {
  const [timeRange, setTimeRange] = useState("30days");
  const [velocityView, setVelocityView] = useState("acceleration");
  const [selectedGoal, setSelectedGoal] = useState(null);

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
  }));

  // Velocity over time data
  const velocityTimeline = [
    {
      week: "W1",
      avgVelocity: 2.5,
      minVelocity: 0.5,
      maxVelocity: 4.5,
      acceleration: 0,
    },
    {
      week: "W2",
      avgVelocity: 3.2,
      minVelocity: 1.0,
      maxVelocity: 5.2,
      acceleration: 0.7,
    },
    {
      week: "W3",
      avgVelocity: 3.8,
      minVelocity: 1.5,
      maxVelocity: 6.0,
      acceleration: 0.6,
    },
    {
      week: "W4",
      avgVelocity: 4.1,
      minVelocity: 2.0,
      maxVelocity: 6.5,
      acceleration: 0.3,
    },
    {
      week: "W5",
      avgVelocity: 3.9,
      minVelocity: 1.8,
      maxVelocity: 6.2,
      acceleration: -0.2,
    },
    {
      week: "W6",
      avgVelocity: 4.5,
      minVelocity: 2.5,
      maxVelocity: 7.0,
      acceleration: 0.6,
    },
  ];

  // Acceleration patterns
  const accelerationData = [
    {
      goal: "Fitness",
      week1: 0.5,
      week2: 0.8,
      week3: 1.2,
      week4: 0.9,
      current: 1.1,
    },
    {
      goal: "Learning",
      week1: 0.3,
      week2: 0.6,
      week3: 0.7,
      week4: 1.0,
      current: 1.3,
    },
    {
      goal: "Career",
      week1: 0.2,
      week2: 0.4,
      week3: 0.5,
      week4: 0.6,
      current: 0.8,
    },
    {
      goal: "Finance",
      week1: 0.8,
      week2: 0.7,
      week3: 0.6,
      week4: 0.4,
      current: 0.3,
    },
  ];

  // Velocity distribution
  const velocityDistribution = [
    { range: "0-1", count: 2, percentage: 10 },
    { range: "1-2", count: 3, percentage: 15 },
    { range: "2-3", count: 5, percentage: 25 },
    { range: "3-4", count: 6, percentage: 30 },
    { range: "4-5", count: 3, percentage: 15 },
    { range: "5+", count: 1, percentage: 5 },
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
          <LineChartIcon className="h-5 w-5 text-purple-400" />
          Progress Velocity Tracking
        </h3>
        <p className="text-sm text-gray-300">
          Monitor the speed and acceleration of your goal progress
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={velocityView}
          onChange={(e) => setVelocityView(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="acceleration">Acceleration View</option>
          <option value="comparison">Velocity Comparison</option>
          <option value="distribution">Distribution Analysis</option>
          <option value="prediction">Completion Predictions</option>
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
          icon={Activity}
          label="Momentum Score"
          value={momentumIndicators.overall}
          unit="%"
          trend={+5}
          color={colors.secondary}
        />
        <VelocityMetricCard
          icon={Timer}
          label="Est. Completion"
          value="45"
          unit="days avg"
          trend={-5}
          color={colors.info}
        />
      </div>

      {/* Main Visualizations */}
      {velocityView === "acceleration" && (
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

          {/* Goal Acceleration Matrix */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Acceleration Patterns
            </h4>
            <div className="space-y-3">
              {accelerationData.map((goal, index) => (
                <AccelerationCard key={index} goal={goal} colors={colors} />
              ))}
            </div>
          </div>
        </>
      )}

      {velocityView === "comparison" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goal Velocity Comparison */}
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
                  isSelected={selectedGoal === goal.id}
                  onSelect={() => setSelectedGoal(goal.id)}
                />
              ))}
            </div>
          </div>

          {/* Velocity Distribution */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Velocity Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="range"
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
                  <Bar dataKey="count" fill={colors.primary}>
                    {velocityDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index >= 3
                            ? colors.success
                            : index >= 1
                            ? colors.primary
                            : colors.warning
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Points per day distribution across all goals
            </p>
          </div>
        </div>
      )}

      {/* Momentum Analysis */}
      <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" />
          Velocity Insights & Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard
            type="positive"
            title="Strong Acceleration Detected"
            description="3 goals showing consistent velocity increase over 2 weeks"
            recommendation="Maintain current strategies for these high-performers"
          />
          <InsightCard
            type="warning"
            title="Deceleration Alert"
            description="2 goals showing velocity decrease of >30%"
            recommendation="Review blockers and adjust approach"
          />
          <InsightCard
            type="info"
            title="Optimal Velocity Range"
            description="Goals with 3-4 pts/day velocity have highest completion rate"
            recommendation="Adjust pacing for outlier goals"
          />
          <InsightCard
            type="action"
            title="Sprint Opportunity"
            description="'Fitness Goal' is 85% complete with high velocity"
            recommendation="Push for completion in next 5 days"
          />
        </div>
      </div>

      {/* Velocity Sustainability Score */}
      <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-white mb-1">
              Velocity Sustainability Analysis
            </h4>
            <p className="text-sm text-gray-300">
              Current pace is sustainable with{" "}
              {100 - momentumIndicators.riskOfStalling}% confidence
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {momentumIndicators.sustainabilityScore}%
            </div>
            <div className="text-sm text-gray-400">Sustainability Score</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-700/50 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${momentumIndicators.sustainabilityScore}%` }}
          />
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

const AccelerationCard = ({ goal, colors }) => {
  const trend =
    goal.current > goal.week4
      ? "up"
      : goal.current < goal.week4
      ? "down"
      : "stable";
  const trendColor =
    trend === "up"
      ? colors.success
      : trend === "down"
      ? colors.danger
      : colors.warning;

  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{goal.goal}</span>
        <div className="flex items-center gap-2">
          {trend === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
          {trend === "down" && (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          {trend === "stable" && <Minus className="h-4 w-4 text-yellow-400" />}
          <span className="text-sm font-medium" style={{ color: trendColor }}>
            {goal.current.toFixed(1)} pts/day²
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        {[goal.week1, goal.week2, goal.week3, goal.week4, goal.current].map(
          (value, index) => (
            <div
              key={index}
              className="flex-1 h-1 rounded"
              style={{
                backgroundColor:
                  value > 0.8
                    ? colors.success
                    : value > 0.5
                    ? colors.primary
                    : colors.warning,
                opacity: 0.2 + index * 0.2,
              }}
            />
          )
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">4 weeks ago</span>
        <span className="text-xs text-gray-400">Now</span>
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

const InsightCard = ({ type, title, description, recommendation }) => {
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

const LegendItem = ({ label, color, opacity = 1 }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded"
      style={{ backgroundColor: color, opacity }}
    />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

export default ProgressVelocityTab;
