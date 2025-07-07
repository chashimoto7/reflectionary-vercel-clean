// frontend/ src/components/analytics/tabs/ReflectionarianInsightsTab.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
} from "recharts";
import {
  MessageCircle,
  Brain,
  Heart,
  TrendingUp,
  Clock,
  Lightbulb,
  Users,
  BookOpen,
  Target,
  Sparkles,
  Activity,
  Shield,
  Award,
  Calendar,
  MessageSquare,
  Zap,
} from "lucide-react";

const ReflectionarianInsightsTab = ({ data, colors, userId }) => {
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Extract Reflectionarian data
  const sessionData = data?.reflectionarian?.sessions || generateSessionData();
  const topicAnalysis =
    data?.reflectionarian?.topics || generateTopicAnalysis();
  const growthMetrics =
    data?.reflectionarian?.growth || generateGrowthMetrics();
  const conversationPatterns =
    data?.reflectionarian?.patterns || generateConversationPatterns();
  const breakthroughs =
    data?.reflectionarian?.breakthroughs || generateBreakthroughs();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Reflectionarian AI Companion Insights
          </h3>
          <p className="text-sm text-purple-300">
            Analysis of your AI-guided self-discovery sessions
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value={sessionData.totalSessions}
          icon={MessageCircle}
          color={colors.purple}
          subtitle="AI conversations"
          trend={+15}
        />
        <MetricCard
          title="Avg. Session Length"
          value={`${sessionData.avgLength} min`}
          icon={Clock}
          color={colors.cyan}
          subtitle="Deep dive time"
          trend={+8}
        />
        <MetricCard
          title="Insights Generated"
          value={sessionData.insightsGenerated}
          icon={Lightbulb}
          color={colors.amber}
          subtitle="Breakthrough moments"
          trend={+22}
        />
        <MetricCard
          title="Growth Score"
          value={`${sessionData.growthScore}/10`}
          icon={TrendingUp}
          color={colors.emerald}
          subtitle="Personal development"
          trend={+18}
        />
      </div>

      {/* Topic Analysis & Session Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Conversation Topics Analysis
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topicAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {topicAnalysis.slice(0, 4).map((topic) => (
              <div key={topic.name} className="text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: topic.color }}
                  />
                  <span className="text-purple-300">{topic.name}</span>
                </div>
                <p className="text-purple-400 ml-5">
                  {topic.sessions} sessions
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Patterns */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Session Engagement Patterns
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={conversationPatterns}>
              <defs>
                <linearGradient
                  id="engagementGradient"
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
                <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.pink} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={colors.pink}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="day"
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
              <Area
                type="monotone"
                dataKey="engagement"
                name="Engagement Level"
                stroke={colors.purple}
                fillOpacity={1}
                fill="url(#engagementGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="depth"
                name="Conversation Depth"
                stroke={colors.pink}
                fillOpacity={1}
                fill="url(#depthGradient)"
                strokeWidth={2}
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Personal Growth Through AI Conversations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Areas */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="90%"
                data={growthMetrics}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="score"
                  tick={false}
                />
                <RadialBar
                  dataKey="score"
                  cornerRadius={10}
                  fill={colors.purple}
                  label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontSize: 11,
                  }}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Timeline */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateGrowthTimeline()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="week"
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
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke={colors.purple}
                  strokeWidth={3}
                  dot={{ fill: colors.purple, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="insights"
                  stroke={colors.pink}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: colors.pink, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakthrough Moments */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Breakthrough Moments & Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakthroughs.map((breakthrough, index) => (
            <BreakthroughCard
              key={index}
              breakthrough={breakthrough}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Conversation Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QualityMetric
          title="Emotional Processing"
          score={88}
          description="Deep emotional exploration"
          icon={Heart}
          color={colors.rose}
        />
        <QualityMetric
          title="Self-Awareness"
          score={92}
          description="Pattern recognition ability"
          icon={Brain}
          color={colors.purple}
        />
        <QualityMetric
          title="Action Planning"
          score={78}
          description="Converting insights to action"
          icon={Target}
          color={colors.cyan}
        />
      </div>

      {/* AI Companion Effectiveness */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Reflectionarian Impact Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-2">
                  Positive Impacts:
                </p>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• 85% improvement in emotional clarity</li>
                  <li>• 3x faster pattern recognition</li>
                  <li>• 92% of sessions lead to actionable insights</li>
                  <li>• Consistent growth in self-awareness scores</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-100 mb-2">
                  Optimization Opportunities:
                </p>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Schedule weekly deep-dive sessions</li>
                  <li>• Focus on implementation of insights</li>
                  <li>• Explore new conversation approaches</li>
                  <li>• Connect insights to goal tracking</li>
                </ul>
              </div>
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

// Breakthrough Card Component
const BreakthroughCard = ({ breakthrough, colors }) => {
  const getIcon = () => {
    switch (breakthrough.type) {
      case "emotional":
        return Heart;
      case "cognitive":
        return Brain;
      case "behavioral":
        return Activity;
      case "relational":
        return Users;
      default:
        return Lightbulb;
    }
  };

  const Icon = getIcon();

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: `${breakthrough.color || colors.purple}20`,
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: breakthrough.color || colors.purple }}
          />
        </div>
        <div>
          <h5 className="font-medium text-purple-100 text-sm">
            {breakthrough.title}
          </h5>
          <p className="text-xs text-purple-400">{breakthrough.date}</p>
        </div>
      </div>
      <p className="text-xs text-purple-300 mb-2">{breakthrough.insight}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-400">
          Impact: {breakthrough.impact}/10
        </span>
        <Award className="w-3 h-3 text-amber-400" />
      </div>
    </div>
  );
};

// Quality Metric Component
const QualityMetric = ({ title, score, description, icon: Icon, color }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-5 text-center">
      <Icon className="w-8 h-8 mx-auto mb-3" style={{ color }} />
      <h5 className="font-medium text-purple-100 mb-1">{title}</h5>
      <div className="text-3xl font-bold text-purple-100 mb-2">{score}%</div>
      <p className="text-xs text-purple-300">{description}</p>
    </div>
  );
};

// Sample data generators
const generateSessionData = () => ({
  totalSessions: 42,
  avgLength: 28,
  insightsGenerated: 156,
  growthScore: 8.5,
});

const generateTopicAnalysis = () => [
  { name: "Emotional Processing", value: 35, sessions: 15, color: "#EC4899" },
  { name: "Goal Clarity", value: 25, sessions: 11, color: "#06B6D4" },
  { name: "Relationships", value: 20, sessions: 8, color: "#10B981" },
  { name: "Self-Discovery", value: 15, sessions: 6, color: "#8B5CF6" },
  { name: "Life Purpose", value: 5, sessions: 2, color: "#F59E0B" },
];

const generateGrowthMetrics = () => [
  { area: "Self-Awareness", score: 85, fill: "#8B5CF6" },
  { area: "Emotional Intelligence", score: 78, fill: "#EC4899" },
  { area: "Decision Making", score: 72, fill: "#06B6D4" },
  { area: "Pattern Recognition", score: 88, fill: "#10B981" },
  { area: "Action Taking", score: 65, fill: "#F59E0B" },
];

const generateConversationPatterns = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    engagement: 60 + Math.random() * 30,
    depth: 55 + Math.random() * 35,
  }));
};

const generateBreakthroughs = () => [
  {
    type: "emotional",
    title: "Anxiety Pattern Recognition",
    date: "2 days ago",
    insight:
      "Identified connection between morning routines and anxiety levels",
    impact: 9,
    color: "#EC4899",
  },
  {
    type: "cognitive",
    title: "Decision Framework",
    date: "1 week ago",
    insight: "Developed personal framework for major life decisions",
    impact: 8,
    color: "#8B5CF6",
  },
  {
    type: "behavioral",
    title: "Habit Loop Discovery",
    date: "2 weeks ago",
    insight: "Uncovered trigger-routine-reward pattern in procrastination",
    impact: 7,
    color: "#06B6D4",
  },
];

const generateGrowthTimeline = () => [
  { week: "W1", growth: 65, insights: 3 },
  { week: "W2", growth: 68, insights: 5 },
  { week: "W3", growth: 72, insights: 4 },
  { week: "W4", growth: 78, insights: 8 },
  { week: "W5", growth: 82, insights: 6 },
  { week: "W6", growth: 85, insights: 9 },
];

export default ReflectionarianInsightsTab;
