// frontend/ src/components/goals/tabs/MentionTimelineTab.jsx
import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  MessageSquare,
  Filter,
  Activity,
  Clock,
  Search,
  Hash,
  BarChart3,
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
  Cell,
} from "recharts";

const MentionTimelineTab = ({
  goals,
  goalMentions,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => {
  const [timeRange, setTimeRange] = useState("30days");
  const [viewMode, setViewMode] = useState("timeline");

  // Mock extended mention data
  const mentionData = [
    { date: "2024-01-01", totalMentions: 12, uniqueGoals: 3, sentiment: 0.8 },
    { date: "2024-01-08", totalMentions: 18, uniqueGoals: 4, sentiment: 0.7 },
    { date: "2024-01-15", totalMentions: 25, uniqueGoals: 5, sentiment: 0.85 },
    { date: "2024-01-22", totalMentions: 22, uniqueGoals: 4, sentiment: 0.6 },
    { date: "2024-01-29", totalMentions: 30, uniqueGoals: 6, sentiment: 0.9 },
    { date: "2024-02-05", totalMentions: 35, uniqueGoals: 7, sentiment: 0.88 },
  ];

  // Goal-specific mention frequency
  const goalMentionFrequency = goals.map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    mentions: Math.floor(Math.random() * 50) + 10,
    avgSentiment: Math.random() * 0.5 + 0.5,
    trend: Math.random() > 0.5 ? "up" : "down",
    lastMention: Math.floor(Math.random() * 7) + 1,
  }));

  // Mention context analysis
  const mentionContexts = [
    { context: "Progress Update", count: 45, percentage: 32 },
    { context: "Challenge/Obstacle", count: 28, percentage: 20 },
    { context: "Achievement", count: 35, percentage: 25 },
    { context: "Planning", count: 22, percentage: 16 },
    { context: "Reflection", count: 10, percentage: 7 },
  ];

  // Time of day mention patterns
  const timeOfDayMentions = [
    { hour: "6AM", mentions: 5 },
    { hour: "9AM", mentions: 18 },
    { hour: "12PM", mentions: 12 },
    { hour: "3PM", mentions: 8 },
    { hour: "6PM", mentions: 22 },
    { hour: "9PM", mentions: 35 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Goal Mention Analytics
        </h3>
        <p className="text-sm text-gray-300">
          Track when and how often you think about your goals
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="timeline">Timeline View</option>
          <option value="frequency">Frequency Analysis</option>
          <option value="patterns">Pattern Detection</option>
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={MessageSquare}
          value="256"
          label="Total Mentions"
          subtitle="Last 30 days"
          color={colors.primary}
        />
        <StatCard
          icon={Hash}
          value="8.5"
          label="Daily Average"
          subtitle="Mentions per day"
          color={colors.secondary}
        />
        <StatCard
          icon={TrendingUp}
          value="+32%"
          label="Mention Growth"
          subtitle="vs previous period"
          color={colors.success}
        />
        <StatCard
          icon={Activity}
          value="0.85"
          label="Sentiment Score"
          subtitle="Positive trend"
          color={colors.info}
        />
      </div>

      {/* Main Visualizations */}
      {viewMode === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Mention Timeline */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Mention Timeline
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mentionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="totalMentions"
                    fill={colors.primary}
                    opacity={0.8}
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueGoals"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    dot={{ fill: colors.secondary }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time of Day Pattern */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              When You Think About Goals
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeOfDayMentions}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="hour"
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
                    dataKey="mentions"
                    stroke={colors.accent}
                    fill={colors.accent}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Goal Mention Frequency */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Goal Mention Frequency
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {goalMentionFrequency.map((goal, index) => (
            <GoalMentionCard
              key={index}
              goal={goal}
              isSelected={selectedGoalId === goals[index]?.id}
              onSelect={() => onSelectGoal(goals[index]?.id)}
              color={colors.gradient[index % colors.gradient.length]}
            />
          ))}
        </div>
      </div>

      {/* Mention Context Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Mention Context Breakdown
          </h4>
          <div className="space-y-3">
            {mentionContexts.map((context, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    {context.context}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {context.count} ({context.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${context.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Mention Insights
          </h4>
          <div className="space-y-3">
            <InsightItem
              type="pattern"
              text="You think about goals most during evening reflection time (9 PM)"
            />
            <InsightItem
              type="trend"
              text="Health goals have seen 45% increase in mentions this month"
            />
            <InsightItem
              type="recommendation"
              text="Goals mentioned less than 3 times/week have 60% lower completion rate"
            />
            <InsightItem
              type="correlation"
              text="Positive sentiment mentions correlate with 2x faster progress"
            />
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
        <h4 className="text-md font-semibold text-white mb-4">
          Goal Mention Sentiment Over Time
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mentionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
                domain={[0, 1]}
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
                dataKey="sentiment"
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, r: 6 }}
                name="Sentiment Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Higher scores indicate more positive mentions about your goals
        </p>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon: Icon, value, label, subtitle, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm font-medium text-gray-300">{label}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

const GoalMentionCard = ({ goal, isSelected, onSelect, color }) => {
  const trendIcon =
    goal.trend === "up" ? (
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
        <span>Sentiment: {(goal.avgSentiment * 100).toFixed(0)}%</span>
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

const InsightItem = ({ type, text }) => {
  const iconMap = {
    pattern: Clock,
    trend: TrendingUp,
    recommendation: Search,
    correlation: Activity,
  };

  const Icon = iconMap[type];

  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  );
};

export default MentionTimelineTab;
