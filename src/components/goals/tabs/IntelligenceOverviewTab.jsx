// frontend/ src/components/goals/tabs/IntelligenceOverviewTab.jsx
import React from "react";
import {
  Target,
  Zap,
  CheckCircle2,
  Award,
  AlertTriangle,
  Heart,
  Lightbulb,
  Brain,
  Info,
  X,
  TrendingUp,
  Activity,
  Clock,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
} from "recharts";

const IntelligenceOverviewTab = ({
  goals,
  analyticsData,
  insights,
  colors,
  onSelectGoal,
  onEditGoal,
  onStatusChange,
  onRemoveGoal,
}) => {
  // Prepare data for visualizations
  const progressDistribution = [
    {
      name: "0-25%",
      value: goals.filter((g) => g.progress < 25).length,
      color: colors.danger,
    },
    {
      name: "25-50%",
      value: goals.filter((g) => g.progress >= 25 && g.progress < 50).length,
      color: colors.warning,
    },
    {
      name: "50-75%",
      value: goals.filter((g) => g.progress >= 50 && g.progress < 75).length,
      color: colors.info,
    },
    {
      name: "75-100%",
      value: goals.filter((g) => g.progress >= 75).length,
      color: colors.success,
    },
  ];

  const statusDistribution = [
    {
      name: "Active",
      value: analyticsData?.overview?.activeGoals || 0,
      color: colors.success,
    },
    {
      name: "Paused",
      value: analyticsData?.overview?.pausedGoals || 0,
      color: colors.warning,
    },
    {
      name: "Completed",
      value: analyticsData?.overview?.completedGoals || 0,
      color: colors.info,
    },
  ];

  // Mock time series data for progress over time
  const progressOverTime = [
    { month: "Jan", avgProgress: 15, goalsActive: 5 },
    { month: "Feb", avgProgress: 28, goalsActive: 7 },
    { month: "Mar", avgProgress: 42, goalsActive: 8 },
    { month: "Apr", avgProgress: 55, goalsActive: 8 },
    { month: "May", avgProgress: 67, goalsActive: 10 },
    { month: "Jun", avgProgress: 78, goalsActive: 12 },
  ];

  // Mock radial data for goal categories
  const categoryData = [
    { name: "Health", uv: 85, pv: 85, fill: colors.success },
    { name: "Career", uv: 72, pv: 72, fill: colors.primary },
    { name: "Personal", uv: 90, pv: 90, fill: colors.secondary },
    { name: "Financial", uv: 65, pv: 65, fill: colors.warning },
    { name: "Learning", uv: 88, pv: 88, fill: colors.info },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Intelligence Overview
        </h3>
        <p className="text-sm text-gray-300">
          AI-powered analysis of your goal portfolio and performance patterns
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Goals"
          value={analyticsData?.overview?.totalGoals || 0}
          icon={Target}
          color={colors.primary}
          subtitle="Your goal portfolio"
          trend="+2 this month"
          trendUp={true}
        />
        <MetricCard
          title="Active Goals"
          value={analyticsData?.overview?.activeGoals || 0}
          icon={Zap}
          color={colors.accent}
          subtitle="Currently pursuing"
          trend="85% of total"
        />
        <MetricCard
          title="Completion Rate"
          value={`${analyticsData?.overview?.averageProgress || 0}%`}
          icon={CheckCircle2}
          color={colors.secondary}
          subtitle="Average progress"
          trend="+12% this month"
          trendUp={true}
        />
        <MetricCard
          title="Goal Streak"
          value={`${analyticsData?.overview?.streak || 0} days`}
          icon={Award}
          color={colors.warning}
          subtitle="Consistent progress"
          trend="Personal best!"
          trendUp={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progress Distribution */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Progress Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Over Time */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Progress Trajectory
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressOverTime}>
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
                  dataKey="avgProgress"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="goalsActive"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  dot={{ fill: colors.secondary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Category Performance
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="90%"
                data={categoryData}
              >
                <RadialBar minAngle={15} background clockWise dataKey="uv" />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ color: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Goal Status Breakdown
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="value" fill={colors.primary}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          AI-Generated Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
          {insights.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                AI insights will appear here as you make progress on your goals
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-purple-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3">
          Recommended Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionCard
            icon={Target}
            title="Review Stalled Goals"
            description="3 goals haven't been updated in 2 weeks"
            actionText="Review Now"
            color={colors.warning}
          />
          <ActionCard
            icon={CheckCircle2}
            title="Complete Milestones"
            description="5 milestones are 80%+ complete"
            actionText="Finish Strong"
            color={colors.success}
          />
          <ActionCard
            icon={Calendar}
            title="Set New Targets"
            description="2 goals need updated deadlines"
            actionText="Update Dates"
            color={colors.info}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  trendUp,
}) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
    <div className="flex items-center justify-between mb-3">
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs ${
            trendUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {trendUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3 rotate-180" />
          )}
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-300 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const InsightCard = ({ insight }) => {
  const IconComponent = insight.icon || Lightbulb;
  const bgColor =
    insight.type === "success"
      ? "bg-green-500/10 border-green-400/30"
      : insight.type === "warning"
      ? "bg-yellow-500/10 border-yellow-400/30"
      : insight.type === "info"
      ? "bg-blue-500/10 border-blue-400/30"
      : "bg-purple-500/10 border-purple-400/30";

  const iconColor =
    insight.type === "success"
      ? "text-green-400"
      : insight.type === "warning"
      ? "text-yellow-400"
      : insight.type === "info"
      ? "text-blue-400"
      : "text-purple-400";

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

const ActionCard = ({ icon: Icon, title, description, actionText, color }) => (
  <div className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors">
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1">
        <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
        <p className="text-xs text-gray-400 mb-3">{description}</p>
        <button
          className="text-xs font-medium hover:underline"
          style={{ color }}
        >
          {actionText} →
        </button>
      </div>
    </div>
  </div>
);

export default IntelligenceOverviewTab;
