// src/components/goals/tabs/ProgressPatternsTab.jsx
import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Activity,
  Target,
  Zap,
  Award,
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
} from "recharts";

const ProgressPatternsTab = ({
  goals,
  progressPatterns,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [viewMode, setViewMode] = useState("combined");

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Progress Patterns Analysis
        </h3>
        <p className="text-sm text-gray-300">
          Discover when and how you make the most progress on your goals
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="combined">Combined</option>
            <option value="individual">Individual Goals</option>
            <option value="comparison">Comparison</option>
          </select>
        </div>
      </div>

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

      {/* Goal Progress Comparison */}
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

      {/* Pattern Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {patternInsights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>

      {/* Individual Goal Progress */}
      {viewMode === "individual" && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Individual Goal Progress Patterns
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.slice(0, 6).map((goal) => (
              <GoalPatternCard
                key={goal.id}
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onSelect={() => onSelectGoal(goal.id)}
                color={
                  colors.gradient[goals.indexOf(goal) % colors.gradient.length]
                }
              />
            ))}
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
const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
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

const GoalPatternCard = ({ goal, isSelected, onSelect, color }) => {
  // Mock mini chart data
  const miniChartData = [
    { day: 1, progress: 20 },
    { day: 2, progress: 35 },
    { day: 3, progress: 30 },
    { day: 4, progress: 45 },
    { day: 5, progress: 60 },
    { day: 6, progress: 55 },
    { day: 7, progress: goal.progress || 0 },
  ];

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-purple-500 bg-purple-500/20"
          : "border-white/20 bg-white/5 hover:bg-white/10"
      }`}
    >
      <h5 className="font-medium text-white text-sm mb-2 truncate">
        {goal.decryptedTitle}
      </h5>
      <div className="h-20 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={miniChartData}>
            <Line
              type="monotone"
              dataKey="progress"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">7-day trend</span>
        <span className="text-xs font-medium" style={{ color }}>
          {goal.progress || 0}%
        </span>
      </div>
    </div>
  );
};

export default ProgressPatternsTab;
