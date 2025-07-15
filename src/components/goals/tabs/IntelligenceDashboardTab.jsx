// frontend/src/components/goals/tabs/IntelligenceDashboardTab.jsx
import React, { useState } from "react";
import {
  Brain,
  Target,
  Zap,
  CheckCircle2,
  Award,
  AlertTriangle,
  Heart,
  Lightbulb,
  Info,
  TrendingUp,
  Activity,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronRight,
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

const IntelligenceDashboardTab = ({ goals, analytics, insights, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Generate additional insights based on goal data
  const allInsights = [...insights, ...generateGoalInsights(goals)];

  // Filter insights by category
  const filteredInsights =
    selectedCategory === "all"
      ? allInsights
      : allInsights.filter((i) => i.category === selectedCategory);

  // Sort insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    if (sortBy === "relevance")
      return (b.confidence || 80) - (a.confidence || 80);
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.priority || "medium"] -
        priorityOrder[a.priority || "medium"]
      );
    }
    if (sortBy === "recent")
      return new Date(b.date || 0) - new Date(a.date || 0);
    return 0;
  });

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
      value: analytics?.overview?.activeGoals || 0,
      color: colors.success,
    },
    {
      name: "Paused",
      value: analytics?.overview?.pausedGoals || 0,
      color: colors.warning,
    },
    {
      name: "Completed",
      value: analytics?.overview?.completedGoals || 0,
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

  // Goal performance metrics
  const performanceData = [
    { metric: "Consistency", score: 78, benchmark: 85 },
    { metric: "Velocity", score: 82, benchmark: 70 },
    { metric: "Focus", score: 65, benchmark: 80 },
    { metric: "Milestone Hit Rate", score: 90, benchmark: 75 },
    { metric: "Time Management", score: 72, benchmark: 80 },
  ];

  // Categories for filtering
  const categories = [
    { id: "all", label: "All Insights", count: allInsights.length },
    {
      id: "opportunities",
      label: "Opportunities",
      count: allInsights.filter((i) => i.category === "opportunities").length,
    },
    {
      id: "risks",
      label: "Risks",
      count: allInsights.filter((i) => i.category === "risks").length,
    },
    {
      id: "patterns",
      label: "Patterns",
      count: allInsights.filter((i) => i.category === "patterns").length,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      count: allInsights.filter((i) => i.category === "recommendations").length,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Intelligence Dashboard
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh Analysis
          </button>
        </div>
        <p className="text-sm text-gray-300">
          AI-powered analysis of your goal portfolio, insights, and
          recommendations
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Goals"
          value={analytics?.overview?.totalGoals || 0}
          icon={Target}
          color={colors.primary}
          subtitle="Your goal portfolio"
          trend="+2 this month"
          trendUp={true}
        />
        <MetricCard
          title="Active Goals"
          value={analytics?.overview?.activeGoals || 0}
          icon={Zap}
          color={colors.accent}
          subtitle="Currently pursuing"
          trend="85% of total"
        />
        <MetricCard
          title="Completion Rate"
          value={`${analytics?.overview?.averageProgress || 0}%`}
          icon={CheckCircle2}
          color={colors.secondary}
          subtitle="Average progress"
          trend="+12% this month"
          trendUp={true}
        />
        <MetricCard
          title="Goal Streak"
          value={`${analytics?.overview?.streak || 0} days`}
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

      {/* Performance vs Benchmarks */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Performance vs Benchmarks
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} layout="horizontal">
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
                dataKey="metric"
                type="category"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill={colors.primary} />
              <Bar dataKey="benchmark" fill={colors.secondary} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Feed */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Personalized Insights & Recommendations
          </h4>
        </div>

        {/* Insight Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="relevance">By Relevance</option>
            <option value="priority">By Priority</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} colors={colors} />
          ))}
          {sortedInsights.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No insights available for the selected category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-purple-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
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

const InsightCard = ({ insight, colors }) => {
  const IconComponent = insight.icon || Lightbulb;

  const priorityColors = {
    high: "border-red-400/30 bg-red-500/10",
    medium: "border-yellow-400/30 bg-yellow-500/10",
    low: "border-green-400/30 bg-green-500/10",
  };

  const typeColors = {
    success: colors.success,
    opportunity: colors.success,
    risk: colors.danger,
    warning: colors.warning,
    pattern: colors.info,
    recommendation: colors.primary,
  };

  const bgColor = priorityColors[insight.priority || "medium"];
  const iconColor = typeColors[insight.type] || colors.primary;

  return (
    <div
      className={`${bgColor} rounded-lg border p-4 transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <IconComponent className="h-5 w-5" style={{ color: iconColor }} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-white text-sm">{insight.title}</h5>
            {insight.confidence && (
              <span className="text-xs text-gray-400">
                {insight.confidence}% confidence
              </span>
            )}
          </div>

          <p className="text-xs text-gray-300 mb-3">{insight.description}</p>

          {insight.action && (
            <button
              className="flex items-center gap-2 text-xs font-medium hover:underline"
              style={{ color: iconColor }}
            >
              {insight.action}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
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

// Generate insights based on goals
function generateGoalInsights(goals) {
  const insights = [];

  // Opportunity insights
  const highProgressGoals = goals.filter((g) => g.progress > 80);
  if (highProgressGoals.length > 0) {
    insights.push({
      id: "gen-1",
      type: "opportunity",
      category: "opportunities",
      icon: CheckCircle2,
      title: "Goals Near Completion",
      description: `${highProgressGoals.length} goals are over 80% complete. Focus on these for quick wins!`,
      action: "Review and complete",
      priority: "high",
      confidence: 95,
    });
  }

  // Risk insights
  const stalledGoals = goals.filter(
    (g) => g.progress < 20 && g.status === "active"
  );
  if (stalledGoals.length > 0) {
    insights.push({
      id: "gen-2",
      type: "risk",
      category: "risks",
      icon: AlertTriangle,
      title: "Stalled Goals Detected",
      description: `${stalledGoals.length} active goals have less than 20% progress. Consider breaking them down.`,
      action: "Create action plan",
      priority: "high",
      confidence: 90,
    });
  }

  // Pattern insights
  insights.push({
    id: "gen-3",
    type: "pattern",
    category: "patterns",
    icon: Activity,
    title: "Best Performance Day",
    description:
      "You make 40% more progress on Saturdays compared to weekdays.",
    action: "Schedule important tasks",
    priority: "medium",
    confidence: 85,
  });

  // Recommendation insights
  insights.push({
    id: "gen-4",
    type: "recommendation",
    category: "recommendations",
    icon: Zap,
    title: "Momentum Building",
    description:
      "Start with small wins in the morning to build momentum for bigger goals.",
    action: "Try tomorrow",
    priority: "low",
    confidence: 75,
  });

  return insights;
}

export default IntelligenceDashboardTab;
