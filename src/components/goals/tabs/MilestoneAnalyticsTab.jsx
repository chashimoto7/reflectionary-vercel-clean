// frontend/ src/components/goals/tabs/MilestoneAnalyticsTab.jsx
import React, { useState } from "react";
import {
  CheckCircle2,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Award,
  Flag,
  GitCommit,
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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";

const MilestoneAnalyticsTab = ({ goals, colors }) => {
  const [viewMode, setViewMode] = useState("overview");
  const [selectedGoalFilter, setSelectedGoalFilter] = useState("all");

  // Calculate milestone statistics
  const milestoneStats = calculateMilestoneStats(goals);

  // Milestone completion timeline
  const completionTimeline = [
    { month: "Jan", planned: 12, completed: 10, overdue: 2 },
    { month: "Feb", planned: 15, completed: 14, overdue: 1 },
    { month: "Mar", planned: 18, completed: 16, overdue: 3 },
    { month: "Apr", planned: 20, completed: 19, overdue: 2 },
    { month: "May", planned: 16, completed: 15, overdue: 1 },
    { month: "Jun", planned: 22, completed: 20, overdue: 3 },
  ];

  // Milestone types distribution
  const milestoneTypes = [
    { type: "Quick Win", count: 45, avgDays: 3, completionRate: 92 },
    { type: "Standard", count: 68, avgDays: 14, completionRate: 78 },
    { type: "Major", count: 32, avgDays: 30, completionRate: 65 },
    { type: "Stretch", count: 15, avgDays: 60, completionRate: 40 },
  ];

  // Milestone velocity by goal
  const goalMilestoneVelocity = goals.slice(0, 6).map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 15) + "...",
    velocity: Math.random() * 5 + 1,
    completed: Math.floor(Math.random() * 10) + 2,
    remaining: Math.floor(Math.random() * 8),
    onTrack: Math.random() > 0.3,
  }));

  // Bottleneck analysis
  const bottlenecks = [
    {
      milestone: "Portfolio Review",
      daysStuck: 15,
      impact: "high",
      blockers: ["Waiting for feedback", "Resource constraints"],
    },
    {
      milestone: "API Integration",
      daysStuck: 12,
      impact: "high",
      blockers: ["Technical dependencies", "Documentation gaps"],
    },
    {
      milestone: "User Testing",
      daysStuck: 8,
      impact: "medium",
      blockers: ["Participant recruitment", "Schedule conflicts"],
    },
    {
      milestone: "Documentation",
      daysStuck: 6,
      impact: "low",
      blockers: ["Time allocation", "Priority conflicts"],
    },
  ];

  // Time to completion scatter data
  const completionScatter = Array.from({ length: 50 }, () => ({
    estimated: Math.random() * 30 + 5,
    actual: Math.random() * 40 + 3,
    difficulty: Math.random() * 10,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-purple-400" />
          Milestone Analytics
        </h3>
        <p className="text-sm text-gray-300">
          Deep insights into milestone completion patterns and bottlenecks
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
          <option value="velocity">Velocity Analysis</option>
          <option value="bottlenecks">Bottleneck Detection</option>
          <option value="patterns">Completion Patterns</option>
        </select>
        <select
          value={selectedGoalFilter}
          onChange={(e) => setSelectedGoalFilter(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Goals</option>
          {goals.slice(0, 5).map((goal, index) => (
            <option key={goal.id} value={goal.id}>
              {goal.decryptedTitle?.substring(0, 20)}...
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          icon={CheckCircle2}
          value={milestoneStats.totalCompleted}
          label="Completed"
          subtitle="Total milestones"
          color={colors.success}
        />
        <MetricCard
          icon={Clock}
          value={milestoneStats.inProgress}
          label="In Progress"
          subtitle="Active milestones"
          color={colors.info}
        />
        <MetricCard
          icon={AlertCircle}
          value={milestoneStats.overdue}
          label="Overdue"
          subtitle="Need attention"
          color={colors.danger}
        />
        <MetricCard
          icon={TrendingUp}
          value={`${milestoneStats.completionRate}%`}
          label="Success Rate"
          subtitle="Last 30 days"
          color={colors.primary}
        />
        <MetricCard
          icon={Zap}
          value={`${milestoneStats.avgVelocity} days`}
          label="Avg Completion"
          subtitle="Time to complete"
          color={colors.secondary}
        />
      </div>

      {viewMode === "overview" && (
        <>
          {/* Completion Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Milestone Completion Timeline
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionTimeline}>
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
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill={colors.success}
                    />
                    <Bar dataKey="overdue" stackId="a" fill={colors.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Milestone Types */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Milestone Type Analysis
              </h4>
              <div className="space-y-3">
                {milestoneTypes.map((type, index) => (
                  <MilestoneTypeCard key={index} type={type} colors={colors} />
                ))}
              </div>
            </div>
          </div>

          {/* Estimated vs Actual Completion */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Estimated vs Actual Completion Time
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
                    dataKey="estimated"
                    name="Estimated Days"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="actual"
                    name="Actual Days"
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
                  <Scatter name="Milestones" data={completionScatter}>
                    {completionScatter.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.actual < entry.estimated
                            ? colors.success
                            : entry.actual < entry.estimated * 1.5
                            ? colors.warning
                            : colors.danger
                        }
                      />
                    ))}
                  </Scatter>
                  {/* Diagonal reference line */}
                  <Line
                    type="monotone"
                    dataKey={(v) => v}
                    stroke={colors.secondary}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Points above the line indicate milestones that took longer than
              estimated
            </p>
          </div>
        </>
      )}

      {viewMode === "velocity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Goal Milestone Velocity */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Milestone Velocity by Goal
            </h4>
            <div className="space-y-3">
              {goalMilestoneVelocity.map((goal, index) => (
                <GoalVelocityCard key={index} goal={goal} colors={colors} />
              ))}
            </div>
          </div>

          {/* Velocity Trends */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Velocity Trend Analysis
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTimeline}>
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
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: colors.secondary, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === "bottlenecks" && (
        <>
          {/* Bottleneck Detection */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Bottleneck Analysis
            </h4>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, index) => (
                <BottleneckCard
                  key={index}
                  bottleneck={bottleneck}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Bottleneck Resolution Strategies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StrategyCard
                title="Break Down Complex Milestones"
                description="Split milestones taking >30 days into 2-week sprints"
                impact="Reduce completion time by 40%"
              />
              <StrategyCard
                title="Parallel Processing"
                description="Identify independent milestones that can run simultaneously"
                impact="Increase velocity by 25%"
              />
              <StrategyCard
                title="Resource Reallocation"
                description="Shift focus from low-impact to high-impact milestones"
                impact="Improve success rate by 30%"
              />
              <StrategyCard
                title="Weekly Reviews"
                description="Implement weekly milestone health checks"
                impact="Catch delays 60% earlier"
              />
            </div>
          </div>
        </>
      )}

      {/* Milestone Health Score */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
        <h4 className="text-md font-semibold text-white mb-4">
          Overall Milestone Health
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthMetric
            label="Planning Accuracy"
            value={78}
            description="Estimation vs actual"
            color={colors.primary}
          />
          <HealthMetric
            label="Completion Consistency"
            value={85}
            description="On-time delivery rate"
            color={colors.success}
          />
          <HealthMetric
            label="Bottleneck Recovery"
            value={72}
            description="Speed of unblocking"
            color={colors.warning}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function calculateMilestoneStats(goals) {
  let totalCompleted = 0;
  let inProgress = 0;
  let overdue = 0;
  let totalMilestones = 0;

  goals.forEach((goal) => {
    if (goal.milestones) {
      goal.milestones.forEach((milestone) => {
        totalMilestones++;
        if (milestone.completed) totalCompleted++;
        else if (milestone.dueDate && new Date(milestone.dueDate) < new Date())
          overdue++;
        else inProgress++;
      });
    }
  });

  return {
    totalCompleted,
    inProgress,
    overdue,
    completionRate:
      totalMilestones > 0
        ? Math.round((totalCompleted / totalMilestones) * 100)
        : 0,
    avgVelocity: 12, // Mock average days to complete
  };
}

// Helper Components
const MetricCard = ({ icon: Icon, value, label, subtitle, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm font-medium text-gray-300">{label}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

const MilestoneTypeCard = ({ type, colors }) => {
  const completionColor =
    type.completionRate > 80
      ? colors.success
      : type.completionRate > 60
      ? colors.warning
      : colors.danger;

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white">{type.type}</span>
          <span className="text-xs text-gray-400">{type.count} milestones</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Avg: {type.avgDays} days</span>
          <span style={{ color: completionColor }}>
            {type.completionRate}% success
          </span>
        </div>
      </div>
      <div className="w-20">
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${type.completionRate}%`,
              backgroundColor: completionColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const GoalVelocityCard = ({ goal, colors }) => {
  const statusColor = goal.onTrack ? colors.success : colors.danger;

  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white truncate">
          {goal.name}
        </span>
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          {goal.onTrack ? "On Track" : "At Risk"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Velocity</span>
          <p className="text-white font-medium">
            {goal.velocity.toFixed(1)}/week
          </p>
        </div>
        <div>
          <span className="text-gray-400">Completed</span>
          <p className="text-white font-medium">{goal.completed}</p>
        </div>
        <div>
          <span className="text-gray-400">Remaining</span>
          <p className="text-white font-medium">{goal.remaining}</p>
        </div>
      </div>
    </div>
  );
};

const BottleneckCard = ({ bottleneck, colors }) => {
  const impactColor =
    bottleneck.impact === "high"
      ? colors.danger
      : bottleneck.impact === "medium"
      ? colors.warning
      : colors.info;

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium text-white">{bottleneck.milestone}</h5>
          <span className="text-xs text-gray-400">
            Stuck for {bottleneck.daysStuck} days
          </span>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{
            backgroundColor: `${impactColor}20`,
            color: impactColor,
          }}
        >
          {bottleneck.impact} impact
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Blockers:</p>
        {bottleneck.blockers.map((blocker, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs text-gray-300"
          >
            <Flag className="h-3 w-3 text-red-400" />
            {blocker}
          </div>
        ))}
      </div>
    </div>
  );
};

const StrategyCard = ({ title, description, impact }) => (
  <div className="p-3 bg-white/5 rounded-lg">
    <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
    <p className="text-xs text-gray-300 mb-2">{description}</p>
    <p className="text-xs text-purple-400 font-medium">{impact}</p>
  </div>
);

const HealthMetric = ({ label, value, description, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-bold text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);

export default MilestoneAnalyticsTab;
