// frontend/ src/components/history/tabs/JournalHealthMetricsTab.jsx
import React, { useState, useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
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
  Cell,
} from "recharts";
import {
  Heart,
  Brain,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Lightbulb,
  MessageSquare,
  Layers,
  Info,
} from "lucide-react";

const JournalHealthMetricsTab = ({
  entries = [],
  analytics = {},
  colors = {},
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [selectedHealthMetric, setSelectedHealthMetric] = useState("overall");
  const [showComponentsInfo, setShowComponentsInfo] = useState(false);
  const [showQualityInfo, setShowQualityInfo] = useState(false);

  // Calculate journal health score
  const healthScore = useMemo(() => {
    if (!analytics?.journalHealth) {
      // Generate sample data
      const consistency = 75;
      const depth = 82;
      const reflection = 78;
      const engagement = 88;
      const growth = 71;

      return {
        overall: Math.round(
          (consistency + depth + reflection + engagement + growth) / 5
        ),
        components: {
          consistency,
          depth,
          reflection,
          engagement,
          growth,
        },
        trend: "+5%",
      };
    }
    return analytics.journalHealth;
  }, [analytics]);

  // Entry quality metrics over time
  const qualityTrends = useMemo(() => {
    if (!analytics?.qualityTrends) {
      // Sample data
      const periods =
        selectedTimeframe === "week"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : selectedTimeframe === "month"
          ? ["Week 1", "Week 2", "Week 3", "Week 4"]
          : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

      return periods.map((period, index) => ({
        period,
        entryDepth: 70 + Math.random() * 20,
        reflectionQuality: 65 + Math.random() * 25,
        emotionalProcessing: 75 + Math.random() * 15,
        insightGeneration: 60 + Math.random() * 30,
      }));
    }
    return analytics.qualityTrends;
  }, [analytics, selectedTimeframe]);

  // Engagement patterns
  const engagementMetrics = useMemo(() => {
    if (!analytics?.engagement) {
      return {
        promptUsage: 65,
        mediaAttachments: 23,
        revisitRate: 42,
        editFrequency: 18,
        shareRate: 8,
        averageSessionTime: "12:34",
        entriesWithLinks: 34,
        entriesWithQuestions: 56,
      };
    }
    return analytics.engagement;
  }, [analytics]);

  // Reflection depth analysis
  const reflectionDepthData = useMemo(() => {
    if (!analytics?.reflectionDepth) {
      return [
        { level: "Surface", count: 15, percentage: 15 },
        { level: "Descriptive", count: 35, percentage: 35 },
        { level: "Analytical", count: 30, percentage: 30 },
        { level: "Reflective", count: 15, percentage: 15 },
        { level: "Critical", count: 5, percentage: 5 },
      ];
    }
    return analytics.reflectionDepth;
  }, [analytics]);

  // Health recommendations
  const healthRecommendations = useMemo(() => {
    const recommendations = [];

    if (healthScore.components.consistency < 70) {
      recommendations.push({
        type: "improvement",
        icon: Calendar,
        title: "Build Consistency",
        message:
          "Try setting a daily reminder to maintain your journaling habit",
      });
    }

    if (healthScore.components.depth < 75) {
      recommendations.push({
        type: "improvement",
        icon: Brain,
        title: "Deepen Reflection",
        message: "Use prompts to explore topics more thoroughly",
      });
    }

    if (healthScore.components.growth > 80) {
      recommendations.push({
        type: "strength",
        icon: TrendingUp,
        title: "Growth Mindset",
        message: "Your entries show excellent personal development focus",
      });
    }

    return recommendations;
  }, [healthScore]);

  // Radial chart data for health score
  const radialData = [
    {
      name: "Health Score",
      value: healthScore.overall,
      fill: "#8B5CF6",
    },
  ];

  const DEPTH_COLORS = ["#4C1D95", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-purple-500/30 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-300">
              {`${item.name}: ${
                typeof item.value === "number"
                  ? item.value.toFixed(1)
                  : item.value
              }%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Journal Health Metrics
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor the quality and depth of your reflective practice
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Overall Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Health Score */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Overall Health</h3>
            <Heart className="h-5 w-5 text-red-400" />
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={radialData}
              >
                <PolarGrid stroke="none" />
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#8B5CF6"
                  background={{ fill: "#374151" }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x="50%"
                    dy="-0.1em"
                    className="text-3xl font-bold fill-white"
                  >
                    {healthScore.overall}%
                  </tspan>
                  <tspan x="50%" dy="1.5em" className="text-sm fill-gray-400">
                    Health Score
                  </tspan>
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center mt-2">
            <span className="text-emerald-400 text-sm">
              {healthScore.trend} from last period
            </span>
          </div>
        </div>

        {/* Health Components */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Health Components
            </h3>
            <button
              onClick={() => setShowComponentsInfo(!showComponentsInfo)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          {showComponentsInfo && (
            <div className="mb-4 p-3 bg-purple-600/20 rounded-lg text-xs text-gray-300">
              <p className="font-medium text-purple-300 mb-2">
                Health Component Definitions:
              </p>
              <ul className="space-y-1">
                <li>
                  <span className="text-purple-300">Consistency:</span> How
                  regularly you journal
                </li>
                <li>
                  <span className="text-purple-300">Depth:</span> Length and
                  detail of entries
                </li>
                <li>
                  <span className="text-purple-300">Reflection:</span> Quality
                  of self-analysis
                </li>
                <li>
                  <span className="text-purple-300">Engagement:</span> Use of
                  features and prompts
                </li>
                <li>
                  <span className="text-purple-300">Growth:</span> Personal
                  development language
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(healthScore.components).map(
              ([component, value]) => (
                <div key={component}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {component}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Quality Trends */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Entry Quality Trends
          </h3>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-purple-400" />
            <button
              onClick={() => setShowQualityInfo(!showQualityInfo)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showQualityInfo && (
          <div className="mb-4 p-3 bg-purple-600/20 rounded-lg text-xs text-gray-300">
            <p className="font-medium text-purple-300 mb-2">
              Quality Metric Definitions:
            </p>
            <ul className="space-y-1">
              <li>
                <span className="text-purple-300">Entry Depth:</span> Word count
                and topic exploration
              </li>
              <li>
                <span className="text-purple-300">Reflection Quality:</span>{" "}
                Self-awareness and introspection level
              </li>
              <li>
                <span className="text-purple-300">Emotional Processing:</span>{" "}
                Recognition and exploration of feelings
              </li>
              <li>
                <span className="text-purple-300">Insight Generation:</span> New
                realizations and connections made
              </li>
            </ul>
          </div>
        )}

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="entryDepth"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
                name="Entry Depth"
              />
              <Line
                type="monotone"
                dataKey="reflectionQuality"
                stroke="#EC4899"
                strokeWidth={2}
                dot={{ fill: "#EC4899", r: 4 }}
                name="Reflection Quality"
              />
              <Line
                type="monotone"
                dataKey="emotionalProcessing"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 4 }}
                name="Emotional Processing"
              />
              <Line
                type="monotone"
                dataKey="insightGeneration"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: "#F59E0B", r: 4 }}
                name="Insight Generation"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement and Reflection Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Engagement Patterns
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span className="text-xl font-bold text-white">
                  {engagementMetrics.promptUsage}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Prompt Usage</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Layers className="h-4 w-4 text-pink-400" />
                <span className="text-xl font-bold text-white">
                  {engagementMetrics.mediaAttachments}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Media Added</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-xl font-bold text-white">
                  {engagementMetrics.revisitRate}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Revisit Rate</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <span className="text-xl font-bold text-white">
                  {engagementMetrics.entriesWithQuestions}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Self-Inquiry</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
            <p className="text-sm text-purple-300">
              Average session time:{" "}
              <span className="font-bold">
                {engagementMetrics.averageSessionTime}
              </span>
            </p>
          </div>
        </div>

        {/* Reflection Depth */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Reflection Depth Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reflectionDepthData}
                layout="vertical"
                margin={{ left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis
                  dataKey="level"
                  type="category"
                  stroke="#9CA3AF"
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percentage" name="Percentage">
                  {reflectionDepthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPTH_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recommendations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthRecommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  rec.type === "strength"
                    ? "bg-emerald-600/10 border-emerald-600/30"
                    : "bg-amber-600/10 border-amber-600/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 mt-1 ${
                      rec.type === "strength"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-300">{rec.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Recent Achievements
          </h3>
          <Award className="h-5 w-5 text-yellow-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xs text-gray-300">Consistency Master</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-pink-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="h-8 w-8 text-pink-400" />
            </div>
            <p className="text-xs text-gray-300">Deep Thinker</p>
          </div>

          <div className="text-center opacity-50">
            <div className="w-16 h-16 bg-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Speed Writer</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>

          <div className="text-center opacity-50">
            <div className="w-16 h-16 bg-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Growth Champion</p>
            <p className="text-xs text-gray-500">5 more entries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalHealthMetricsTab;
