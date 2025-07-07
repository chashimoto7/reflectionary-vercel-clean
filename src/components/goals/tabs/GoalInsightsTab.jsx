// frontend/ src/components/goals/tabs/GoalInsightsTab.jsx
import React, { useState } from "react";
import {
  Lightbulb,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Heart,
  Calendar,
  Clock,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const GoalInsightsTab = ({
  goals,
  moodCorrelations,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => {
  const [insightCategory, setInsightCategory] = useState("all");

  // Generate insights based on goal data
  const insights = generateGoalInsights(goals);

  // Filter insights by category
  const filteredInsights =
    insightCategory === "all"
      ? insights
      : insights.filter((i) => i.category === insightCategory);

  // Goal performance metrics
  const performanceData = [
    { metric: "Consistency", score: 78, benchmark: 85 },
    { metric: "Velocity", score: 82, benchmark: 70 },
    { metric: "Focus", score: 65, benchmark: 80 },
    { metric: "Milestone Hit Rate", score: 90, benchmark: 75 },
    { metric: "Time Management", score: 72, benchmark: 80 },
  ];

  // Goal type distribution
  const goalTypeData = [
    { name: "Health & Fitness", value: 4, color: colors.success },
    { name: "Career & Skills", value: 3, color: colors.primary },
    { name: "Personal Growth", value: 3, color: colors.secondary },
    { name: "Financial", value: 2, color: colors.warning },
    { name: "Relationships", value: 1, color: colors.info },
  ];

  // Success correlation data
  const correlationData = [
    { factor: "Morning Work", correlation: 0.85, impact: "High" },
    { factor: "Daily Review", correlation: 0.78, impact: "High" },
    { factor: "Social Support", correlation: 0.72, impact: "Medium" },
    { factor: "Weekend Progress", correlation: 0.65, impact: "Medium" },
    { factor: "Evening Planning", correlation: 0.58, impact: "Low" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Goal Insights & Intelligence
        </h3>
        <p className="text-sm text-gray-300">
          AI-powered insights to optimize your goal achievement strategy
        </p>
      </div>

      {/* Insight Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "opportunities", "risks", "patterns", "recommendations"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setInsightCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                insightCategory === category
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Insights Feed - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Personalized Insights
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
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
                  <Bar
                    dataKey="benchmark"
                    fill={colors.secondary}
                    opacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Distribution */}
        <div className="space-y-4">
          {/* Goal Type Distribution */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Categories
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {goalTypeData.map((entry, index) => (
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
            <div className="mt-3 space-y-2">
              {goalTypeData.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-gray-300">{type.name}</span>
                  </div>
                  <span className="text-white font-medium">{type.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Target}
              value="85%"
              label="On Track"
              color={colors.success}
            />
            <StatCard
              icon={TrendingUp}
              value="+12%"
              label="This Month"
              color={colors.primary}
            />
            <StatCard
              icon={Clock}
              value="2.5h"
              label="Daily Avg"
              color={colors.info}
            />
            <StatCard
              icon={Zap}
              value="High"
              label="Momentum"
              color={colors.warning}
            />
          </div>
        </div>
      </div>

      {/* Success Correlations */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Success Factor Correlations
        </h4>
        <div className="space-y-3">
          {correlationData.map((factor, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{factor.factor}</span>
                  <span
                    className={`text-xs font-medium ${
                      factor.impact === "High"
                        ? "text-green-400"
                        : factor.impact === "Medium"
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    {factor.impact} Impact
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${factor.correlation * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-white w-12 text-right">
                {Math.round(factor.correlation * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Correlations */}
      {moodCorrelations && moodCorrelations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            Mood & Progress Correlation
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodCorrelations}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="mood"
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
                  dataKey="goalProgress"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Higher mood scores correlate with increased goal progress
          </p>
        </div>
      )}
    </div>
  );
};

// Helper Components
const InsightCard = ({ insight }) => {
  const IconComponent = insight.icon || Lightbulb;

  const bgColor =
    insight.type === "opportunity"
      ? "bg-green-500/10 border-green-400/30"
      : insight.type === "risk"
      ? "bg-red-500/10 border-red-400/30"
      : insight.type === "pattern"
      ? "bg-blue-500/10 border-blue-400/30"
      : insight.type === "recommendation"
      ? "bg-purple-500/10 border-purple-400/30"
      : "bg-gray-500/10 border-gray-400/30";

  const iconColor =
    insight.type === "opportunity"
      ? "text-green-400"
      : insight.type === "risk"
      ? "text-red-400"
      : insight.type === "pattern"
      ? "text-blue-400"
      : insight.type === "recommendation"
      ? "text-purple-400"
      : "text-gray-400";

  return (
    <div
      className={`${bgColor} rounded-lg border p-4 transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <IconComponent
          className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <h5 className="font-medium text-white text-sm mb-1">
            {insight.title}
          </h5>
          <p className="text-xs text-gray-300 mb-2">{insight.description}</p>
          {insight.action && (
            <button
              className="text-xs font-medium hover:underline"
              style={{
                color: iconColor.replace("text-", "#").replace("400", "500"),
              }}
            >
              {insight.action} →
            </button>
          )}
        </div>
        {insight.priority && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              insight.priority === "high"
                ? "bg-red-500/20 text-red-300"
                : insight.priority === "medium"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-gray-500/20 text-gray-300"
            }`}
          >
            {insight.priority}
          </span>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3">
    <Icon className="h-4 w-4 mb-2" style={{ color }} />
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

// Generate insights based on goals
function generateGoalInsights(goals) {
  const insights = [];

  // Opportunity insights
  const highProgressGoals = goals.filter((g) => g.progress > 80);
  if (highProgressGoals.length > 0) {
    insights.push({
      id: 1,
      type: "opportunity",
      category: "opportunities",
      icon: CheckCircle2,
      title: "Goals Near Completion",
      description: `${highProgressGoals.length} goals are over 80% complete. Focus on these for quick wins!`,
      action: "Review and complete",
      priority: "high",
    });
  }

  // Risk insights
  const stalledGoals = goals.filter(
    (g) => g.progress < 20 && g.status === "active"
  );
  if (stalledGoals.length > 0) {
    insights.push({
      id: 2,
      type: "risk",
      category: "risks",
      icon: AlertCircle,
      title: "Stalled Goals Detected",
      description: `${stalledGoals.length} active goals have less than 20% progress. Consider breaking them down.`,
      action: "Create action plan",
      priority: "high",
    });
  }

  // Pattern insights
  insights.push({
    id: 3,
    type: "pattern",
    category: "patterns",
    icon: Activity,
    title: "Best Performance Day",
    description:
      "You make 40% more progress on Saturdays compared to weekdays.",
    action: "Schedule important tasks",
    priority: "medium",
  });

  // Recommendation insights
  insights.push({
    id: 4,
    type: "recommendation",
    category: "recommendations",
    icon: Zap,
    title: "Momentum Building",
    description:
      "Start with small wins in the morning to build momentum for bigger goals.",
    action: "Try tomorrow",
    priority: "low",
  });

  return insights;
}

export default GoalInsightsTab;
