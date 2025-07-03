// src/components/analytics/tabs/JourneyTimelineTab.jsx
import React, { useState } from "react";
import {
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
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  Calendar,
  Compass,
  Flag,
  Heart,
  Target,
  TrendingUp,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Award,
  AlertCircle,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

const JourneyTimelineTab = ({ data, colors, userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [showMilestones, setShowMilestones] = useState(true);

  // Sample timeline data - would come from your API
  const timelineData = data?.timeline || generateSampleTimeline();
  const milestones = data?.milestones || generateSampleMilestones();

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Your Personal Growth Journey
          </h3>
          <p className="text-sm text-purple-300">
            Visualize your progress and key moments over time
          </p>
        </div>

        <div className="flex gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          {/* Metric Filter */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Metrics</option>
            <option value="emotional">Emotional Patterns</option>
            <option value="goals">Goal Progress</option>
            <option value="wellness">Wellness Trends</option>
            <option value="insights">Insight Generation</option>
          </select>

          {/* Milestones Toggle */}
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              showMilestones
                ? "backdrop-blur-xl bg-purple-600/40 text-purple-100 border border-purple-400"
                : "backdrop-blur-xl bg-white/10 text-purple-300 border border-white/20"
            }`}
          >
            <Flag className="w-4 h-4" />
            Milestones
          </button>
        </div>
      </div>

      {/* Main Timeline Visualization */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient
                id="emotionalGradient"
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
              <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.rose} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.rose} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.emerald}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors.emerald}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="date"
              stroke={colors.purple}
              tick={{ fill: colors.purple, fontSize: 12 }}
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
            <Legend wrapperStyle={{ color: colors.purple }} iconType="circle" />

            {(selectedMetric === "all" || selectedMetric === "emotional") && (
              <Area
                type="monotone"
                dataKey="emotionalScore"
                name="Emotional Balance"
                stroke={colors.purple}
                fillOpacity={1}
                fill="url(#emotionalGradient)"
                strokeWidth={2}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "wellness") && (
              <Area
                type="monotone"
                dataKey="wellnessScore"
                name="Wellness"
                stroke={colors.rose}
                fillOpacity={1}
                fill="url(#wellnessGradient)"
                strokeWidth={2}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "goals") && (
              <Area
                type="monotone"
                dataKey="goalProgress"
                name="Goal Progress"
                stroke={colors.cyan}
                fillOpacity={1}
                fill="url(#goalGradient)"
                strokeWidth={2}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "insights") && (
              <Area
                type="monotone"
                dataKey="insightCount"
                name="Insights Generated"
                stroke={colors.emerald}
                fillOpacity={1}
                fill="url(#insightGradient)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones Section */}
      {showMilestones && (
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-purple-400" />
            Key Milestones & Achievements
          </h4>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard
                key={index}
                milestone={milestone}
                colors={colors}
              />
            ))}
          </div>
        </div>
      )}

      {/* Journey Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Growth"
          value={`${data?.growth?.total || 87}%`}
          subtitle="Since you started"
          icon={TrendingUp}
          color={colors.purple}
        />
        <StatCard
          title="Breakthrough Moments"
          value={data?.breakthroughs || 12}
          subtitle="Major insights"
          icon={Sparkles}
          color={colors.pink}
        />
        <StatCard
          title="Consistency Streak"
          value={`${data?.streak || 45} days`}
          subtitle="Current streak"
          icon={Award}
          color={colors.emerald}
        />
      </div>

      {/* Interactive Journey Map */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-400" />
          Growth Trajectory Map
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="effort"
              name="Effort"
              stroke={colors.purple}
              tick={{ fill: colors.purple }}
              label={{
                value: "Effort Level",
                position: "insideBottom",
                offset: -5,
                fill: colors.purple,
              }}
            />
            <YAxis
              dataKey="growth"
              name="Growth"
              stroke={colors.purple}
              tick={{ fill: colors.purple }}
              label={{
                value: "Growth Rate",
                angle: -90,
                position: "insideLeft",
                fill: colors.purple,
              }}
            />
            <ZAxis dataKey="impact" range={[50, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(139,92,246,0.5)",
                borderRadius: "8px",
              }}
            />
            <Scatter
              name="Growth Points"
              data={generateGrowthPoints()}
              fill={colors.purple}
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Milestone Card Component
const MilestoneCard = ({ milestone, colors }) => {
  const getIcon = () => {
    switch (milestone.type) {
      case "achievement":
        return Award;
      case "breakthrough":
        return Sparkles;
      case "goal":
        return Target;
      case "insight":
        return Brain;
      case "wellness":
        return Heart;
      default:
        return Flag;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-start gap-4 p-4 backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
      <div
        className="p-3 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${milestone.color || colors.purple}20` }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: milestone.color || colors.purple }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-1">
          <h5 className="font-semibold text-purple-100">{milestone.title}</h5>
          <span className="text-xs text-purple-400">{milestone.date}</span>
        </div>
        <p className="text-sm text-purple-300 mb-2">{milestone.description}</p>
        {milestone.impact && (
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <CheckCircle className="w-3 h-3" />
            <span>{milestone.impact}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-2xl font-bold text-purple-100">{value}</span>
      </div>
      <h4 className="text-sm font-medium text-purple-100">{title}</h4>
      <p className="text-xs text-purple-400">{subtitle}</p>
    </div>
  );
};

// Sample data generators
const generateSampleTimeline = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, i) => ({
    date: month,
    emotionalScore: 60 + Math.random() * 30 + i * 5,
    wellnessScore: 55 + Math.random() * 35 + i * 4,
    goalProgress: 40 + Math.random() * 40 + i * 8,
    insightCount: Math.floor(5 + Math.random() * 15 + i * 2),
  }));
};

const generateSampleMilestones = () => [
  {
    type: "breakthrough",
    title: "Emotional Breakthrough",
    description: "Recognized and addressed long-standing anxiety patterns",
    date: "2 weeks ago",
    impact: "Reduced anxiety by 40%",
    color: "#8B5CF6",
  },
  {
    type: "goal",
    title: "First Goal Completed",
    description: "Successfully completed your mindfulness meditation goal",
    date: "1 month ago",
    impact: "Built lasting habit",
    color: "#06B6D4",
  },
  {
    type: "wellness",
    title: "Wellness Milestone",
    description: "Achieved 30-day consistency in wellness tracking",
    date: "6 weeks ago",
    impact: "Improved overall wellbeing",
    color: "#EC4899",
  },
];

const generateGrowthPoints = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    effort: 20 + Math.random() * 60,
    growth: 30 + Math.random() * 50,
    impact: 100 + Math.random() * 300,
  }));
};

export default JourneyTimelineTab;
