// src/components/goals/tabs/IntelligenceOverviewTab.jsx update
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
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
}) => (
  <div className="p-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Goals"
        value={analyticsData?.overview?.totalGoals || 0}
        icon={Target}
        color={colors.primary}
        subtitle="Your goal portfolio"
      />
      <MetricCard
        title="Active Goals"
        value={analyticsData?.overview?.activeGoals || 0}
        icon={Zap}
        color={colors.accent}
        subtitle="Currently pursuing"
      />
      <MetricCard
        title="Completion Rate"
        value={`${analyticsData?.overview?.averageProgress || 0}%`}
        icon={CheckCircle2}
        color={colors.secondary}
        subtitle="Average progress"
      />
      <MetricCard
        title="Goal Streak"
        value={`${analyticsData?.overview?.streak || 0} days`}
        icon={Award}
        color={colors.warning}
        subtitle="Consistent progress"
      />
    </div>

    {/* Quick Progress Chart */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progress Trajectory
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData?.completionRate || []}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.primary}
                  stopOpacity={0.8}
                />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Top Insights */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Insights</h3>
      <div className="space-y-3">
        {insights.slice(0, 3).map((insight) => (
          <InsightCard key={insight.id} insight={insight} colors={colors} />
        ))}
      </div>
    </div>
  </div>
);

// Utility Components
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
    </div>
  </div>
);

const InsightCard = ({ insight, colors }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case "plateau_warning":
        return AlertTriangle;
      case "mood_correlation":
        return Heart;
      case "recommendation":
        return Lightbulb;
      case "pattern":
        return Brain;
      case "achievement":
        return Award;
      default:
        return Info;
    }
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case "high":
        return colors.danger;
      case "medium":
        return colors.warning;
      case "low":
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const Icon = getInsightIcon(insight.type);
  const color = getInsightColor(insight.priority);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{insight.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(insight.date).toLocaleDateString()}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default IntelligenceOverviewTab;
