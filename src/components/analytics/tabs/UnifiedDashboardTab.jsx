// frontend/ src/components/analytics/tabs/UnifiedDashboardTab.jsx
import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  Heart,
  Brain,
  Target,
  Activity,
  MessageCircle,
  Sparkles,
  Award,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

const UnifiedDashboardTab = ({
  data,
  colors,
  insights,
  onAcknowledgeInsight,
}) => {
  // Calculate key metrics
  const totalJournalEntries = data?.journal?.totalEntries || 0;
  const activeGoals = data?.goals?.activeGoals || 0;
  const wellnessScore = data?.wellness?.currentScore || 0;
  const reflectionarianSessions = data?.reflectionarian?.totalSessions || 0;

  // Calculate growth metrics
  const emotionalGrowth = data?.emotional?.growthRate || 0;
  const goalCompletionRate = data?.goals?.completionRate || 0;
  const consistencyScore = data?.journal?.consistencyScore || 0;
  const insightImplementationRate = data?.insights?.implementationRate || 0;

  // Prepare data for visualizations
  const radarData = [
    {
      subject: "Self-Awareness",
      value: data?.emotional?.selfAwarenessScore || 0,
      fullMark: 100,
    },
    {
      subject: "Emotional Balance",
      value: data?.emotional?.balanceScore || 0,
      fullMark: 100,
    },
    { subject: "Goal Progress", value: goalCompletionRate, fullMark: 100 },
    { subject: "Wellness", value: wellnessScore, fullMark: 100 },
    { subject: "Consistency", value: consistencyScore, fullMark: 100 },
    {
      subject: "Growth Velocity",
      value: data?.growth?.velocityScore || 0,
      fullMark: 100,
    },
  ];

  const monthlyTrends = data?.trends?.monthly || [];
  const topInsights = insights?.slice(0, 3) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Journal Entries"
          value={totalJournalEntries}
          icon={Brain}
          color={colors.purple}
          trend={data?.journal?.trend}
          subtitle="Total reflections"
        />
        <MetricCard
          title="Active Goals"
          value={activeGoals}
          icon={Target}
          color={colors.cyan}
          trend={data?.goals?.trend}
          subtitle={`${goalCompletionRate}% completion rate`}
        />
        <MetricCard
          title="Wellness Score"
          value={`${wellnessScore}/100`}
          icon={Heart}
          color={colors.rose}
          trend={data?.wellness?.trend}
          subtitle="Overall wellbeing"
        />
        <MetricCard
          title="AI Sessions"
          value={reflectionarianSessions}
          icon={MessageCircle}
          color={colors.emerald}
          trend={data?.reflectionarian?.trend}
          subtitle="Reflectionarian chats"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Growth Radar */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Personal Growth Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: colors.purple, fontSize: 12 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: colors.purple }}
                tickCount={5}
              />
              <Radar
                dataKey="value"
                stroke={colors.purple}
                fill={colors.purple}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Journey Timeline */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Your Journey Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient
                  id="journalGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors.purple}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.purple}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="wellnessGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={colors.rose} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={colors.rose}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="goalsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={colors.cyan}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="month"
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
                labelStyle={{ color: colors.purple }}
              />
              <Area
                type="monotone"
                dataKey="journalEntries"
                stroke={colors.purple}
                fillOpacity={1}
                fill="url(#journalGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="wellnessScore"
                stroke={colors.rose}
                fillOpacity={1}
                fill="url(#wellnessGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="goalProgress"
                stroke={colors.cyan}
                fillOpacity={1}
                fill="url(#goalsGradient)"
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ color: colors.purple }}
                iconType="circle"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI-Generated Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAcknowledge={onAcknowledgeInsight}
              color={colors}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label="Emotional Growth"
          value={`${emotionalGrowth}%`}
          icon={Heart}
          trend="up"
          color={colors.pink}
        />
        <QuickStat
          label="Consistency Score"
          value={`${consistencyScore}%`}
          icon={Calendar}
          trend={consistencyScore > 70 ? "up" : "neutral"}
          color={colors.purple}
        />
        <QuickStat
          label="Insights Applied"
          value={`${insightImplementationRate}%`}
          icon={CheckCircle}
          trend="up"
          color={colors.emerald}
        />
        <QuickStat
          label="Growth Velocity"
          value={`${data?.growth?.velocityScore || 0}%`}
          icon={TrendingUp}
          trend="up"
          color={colors.cyan}
        />
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {getTrendIcon()}
      </div>
      <h3 className="text-2xl font-bold text-purple-100 mb-1">{value}</h3>
      <p className="text-sm text-purple-300">{title}</p>
      {subtitle && <p className="text-xs text-purple-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ insight, onAcknowledge, color }) => {
  const getIcon = () => {
    switch (insight.type) {
      case "pattern":
        return Brain;
      case "recommendation":
        return Sparkles;
      case "achievement":
        return Award;
      case "warning":
        return AlertCircle;
      default:
        return Sparkles;
    }
  };

  const Icon = getIcon();

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color.purple}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: color.purple }} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-purple-100 mb-1">
            {insight.title}
          </h4>
          <p className="text-xs text-purple-300 mb-2">{insight.description}</p>
          {!insight.acknowledged && (
            <button
              onClick={() => onAcknowledge(insight.id)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Stat Component
const QuickStat = ({ label, value, icon: Icon, trend, color }) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className={`text-2xl font-bold ${getTrendColor()}`}>{value}</span>
      </div>
      <p className="text-xs text-purple-300">{label}</p>
    </div>
  );
};

export default UnifiedDashboardTab;
