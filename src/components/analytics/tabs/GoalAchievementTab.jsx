// src/components/analytics/tabs/GoalAchievementTab.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Treemap,
  Sankey,
} from "recharts";
import {
  Target,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Calendar,
  BarChart3,
  Award,
  Star,
  Flag,
  Rocket,
  Mountain,
  Gauge,
} from "lucide-react";

const GoalAchievementTab = ({ data, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeView, setTimeView] = useState("quarter");

  // Extract goal data
  const goalMetrics = data?.goals?.metrics || generateGoalMetrics();
  const goalProgress = data?.goals?.progress || generateGoalProgress();
  const goalCategories = data?.goals?.categories || generateGoalCategories();
  const achievementTimeline =
    data?.goals?.timeline || generateAchievementTimeline();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Goal Achievement Analytics
          </h3>
          <p className="text-sm text-purple-300">
            Track your progress and optimize your goal-setting strategy
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="health">Health & Fitness</option>
            <option value="career">Career & Skills</option>
            <option value="personal">Personal Growth</option>
            <option value="financial">Financial</option>
            <option value="relationships">Relationships</option>
          </select>

          <select
            value={timeView}
            onChange={(e) => setTimeView(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {/* Goal Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Goals"
          value={goalMetrics.active}
          icon={Target}
          color={colors.purple}
          subtitle="Currently pursuing"
          trend={+5}
        />
        <MetricCard
          title="Completed"
          value={goalMetrics.completed}
          icon={Trophy}
          color={colors.emerald}
          subtitle="Successfully achieved"
          trend={+12}
        />
        <MetricCard
          title="Success Rate"
          value={`${goalMetrics.successRate}%`}
          icon={TrendingUp}
          color={colors.cyan}
          subtitle="Overall completion"
          trend={+8}
        />
        <MetricCard
          title="Avg. Time"
          value={`${goalMetrics.avgTime} days`}
          icon={Clock}
          color={colors.amber}
          subtitle="To completion"
          trend={-15}
        />
      </div>

      {/* Goal Progress Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radial Progress Chart */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-400" />
            Current Goals Progress
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={goalProgress}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                dataKey="progress"
                tick={false}
              />
              <RadialBar
                dataKey="progress"
                cornerRadius={10}
                fill={colors.purple}
                label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  borderRadius: "8px",
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {goalProgress.slice(0, 4).map((goal) => (
              <div key={goal.name} className="text-center">
                <p className="text-xs text-purple-400 truncate">{goal.name}</p>
                <p className="text-sm font-semibold text-purple-100">
                  {goal.progress}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Performance by Category
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalCategories} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                type="number"
                stroke={colors.purple}
                tick={{ fill: colors.purple }}
              />
              <YAxis
                dataKey="category"
                type="category"
                stroke={colors.purple}
                tick={{ fill: colors.purple, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="completed"
                fill={colors.emerald}
                radius={[0, 8, 8, 0]}
              />
              <Bar
                dataKey="active"
                fill={colors.purple}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievement Timeline */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Goal Achievement Timeline
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={achievementTimeline}>
            <defs>
              <linearGradient
                id="achievementGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={colors.purple}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="period"
              stroke={colors.purple}
              tick={{ fill: colors.purple }}
            />
            <YAxis stroke={colors.purple} tick={{ fill: colors.purple }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(139,92,246,0.5)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="completed"
              name="Goals Completed"
              stroke={colors.purple}
              fillOpacity={1}
              fill="url(#achievementGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="velocity"
              name="Achievement Velocity"
              stroke={colors.cyan}
              fillOpacity={1}
              fill="url(#velocityGradient)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target Line"
              stroke={colors.amber}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="On Track Goals"
          count={12}
          goals={[
            { name: "Morning Meditation", progress: 85, daysLeft: 15 },
            { name: "Read 20 Books", progress: 75, daysLeft: 90 },
            { name: "Fitness Journey", progress: 68, daysLeft: 45 },
          ]}
          icon={CheckCircle}
          color={colors.emerald}
          bgColor="bg-green-500/10"
          borderColor="border-green-500/20"
        />
        <StatusCard
          title="At Risk Goals"
          count={3}
          goals={[
            { name: "Learn Spanish", progress: 25, daysLeft: 30 },
            { name: "Side Project", progress: 15, daysLeft: 20 },
          ]}
          icon={AlertCircle}
          color={colors.amber}
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/20"
        />
        <StatusCard
          title="Recently Completed"
          count={5}
          goals={[
            { name: "30-Day Challenge", completedDays: 5 },
            { name: "Online Course", completedDays: 12 },
            { name: "Declutter Home", completedDays: 20 },
          ]}
          icon={Trophy}
          color={colors.purple}
          bgColor="bg-purple-500/10"
          borderColor="border-purple-500/20"
        />
      </div>

      {/* Goal Insights & Patterns */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Mountain className="w-5 h-5 text-purple-400" />
          Goal Achievement Patterns
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-purple-100 mb-3">
              Success Factors
            </h5>
            <div className="space-y-2">
              <InsightItem
                text="Goals with daily check-ins have 3x higher completion rate"
                icon={Star}
                color={colors.emerald}
              />
              <InsightItem
                text="Breaking goals into milestones increases success by 45%"
                icon={Flag}
                color={colors.cyan}
              />
              <InsightItem
                text="Morning goal work sessions are 60% more effective"
                icon={Zap}
                color={colors.amber}
              />
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-purple-100 mb-3">
              Optimization Tips
            </h5>
            <div className="space-y-2">
              <InsightItem
                text="Your best goal completion time is 8-10 AM"
                icon={Clock}
                color={colors.purple}
              />
              <InsightItem
                text="Pair new goals with existing habits for 2x success"
                icon={Rocket}
                color={colors.pink}
              />
              <InsightItem
                text="Weekly reviews correlate with 85% completion rate"
                icon={Calendar}
                color={colors.indigo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Goal Achievement Intelligence
            </h4>
            <div className="space-y-2 text-sm text-purple-200">
              <p>
                • You're most successful with health and personal growth goals
                (92% completion)
              </p>
              <p>
                • Your optimal goal duration is 30-45 days based on historical
                patterns
              </p>
              <p>
                • Combining goals with Reflectionarian sessions increases
                success by 40%
              </p>
              <p>
                • Consider focusing on one major goal per category for better
                results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0)
      return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return null;
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xs text-purple-400">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-purple-100 mb-1">{value}</h3>
      <p className="text-sm text-purple-300">{title}</p>
      {subtitle && <p className="text-xs text-purple-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Status Card Component
const StatusCard = ({
  title,
  count,
  goals,
  icon: Icon,
  color,
  bgColor,
  borderColor,
}) => {
  return (
    <div
      className={`backdrop-blur-xl ${bgColor} rounded-xl border ${borderColor} p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-purple-100">{title}</h5>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color }} />
          <span className="text-lg font-bold text-purple-100">{count}</span>
        </div>
      </div>
      <div className="space-y-2">
        {goals.map((goal, index) => (
          <div key={index} className="text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-purple-200 truncate">{goal.name}</span>
              {goal.progress && (
                <span className="text-purple-400">{goal.progress}%</span>
              )}
              {goal.completedDays && (
                <span className="text-purple-400">
                  {goal.completedDays}d ago
                </span>
              )}
            </div>
            {goal.progress && (
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Insight Item Component
const InsightItem = ({ text, icon: Icon, color }) => {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <p className="text-xs text-purple-300">{text}</p>
    </div>
  );
};

// Sample data generators
const generateGoalMetrics = () => ({
  active: 15,
  completed: 42,
  successRate: 78,
  avgTime: 32,
});

const generateGoalProgress = () => [
  { name: "Morning Meditation", progress: 85, fill: "#8B5CF6" },
  { name: "Fitness Goals", progress: 72, fill: "#EC4899" },
  { name: "Reading Challenge", progress: 65, fill: "#06B6D4" },
  { name: "Career Development", progress: 58, fill: "#10B981" },
  { name: "Financial Targets", progress: 45, fill: "#F59E0B" },
];

const generateGoalCategories = () => [
  { category: "Health", completed: 12, active: 3 },
  { category: "Career", completed: 8, active: 4 },
  { category: "Personal", completed: 15, active: 5 },
  { category: "Financial", completed: 5, active: 2 },
  { category: "Relationships", completed: 7, active: 1 },
];

const generateAchievementTimeline = () => [
  { period: "Jan", completed: 3, velocity: 60, target: 5 },
  { period: "Feb", completed: 5, velocity: 75, target: 5 },
  { period: "Mar", completed: 4, velocity: 70, target: 5 },
  { period: "Apr", completed: 7, velocity: 85, target: 5 },
  { period: "May", completed: 6, velocity: 80, target: 5 },
  { period: "Jun", completed: 8, velocity: 90, target: 5 },
];

export default GoalAchievementTab;
