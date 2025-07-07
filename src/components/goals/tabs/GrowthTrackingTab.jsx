// frontend/ src/components/goals/tabs/GrowthTrackingTab.jsx
import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Activity,
  Brain,
  Zap,
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

const GrowthTrackingTab = ({ goals, colors }) => {
  const [growthMetric, setGrowthMetric] = useState("overall");
  const [timeframe, setTimeframe] = useState("monthly");

  // Mock growth data
  const overallGrowthData = [
    { month: "Jan", growth: 15, momentum: 20, skills: 10 },
    { month: "Feb", growth: 28, momentum: 35, skills: 22 },
    { month: "Mar", growth: 42, momentum: 48, skills: 38 },
    { month: "Apr", growth: 58, momentum: 55, skills: 52 },
    { month: "May", growth: 72, momentum: 70, skills: 68 },
    { month: "Jun", growth: 85, momentum: 82, skills: 80 },
  ];

  // Skill development data
  const skillGrowth = [
    { skill: "Time Management", before: 45, after: 78, growth: 73 },
    { skill: "Consistency", before: 52, after: 85, growth: 63 },
    { skill: "Focus", before: 38, after: 72, growth: 89 },
    { skill: "Planning", before: 60, after: 88, growth: 47 },
    { skill: "Execution", before: 42, after: 75, growth: 79 },
    { skill: "Adaptability", before: 55, after: 82, growth: 49 },
  ];

  // Personal records
  const personalRecords = [
    { metric: "Longest Streak", value: "23 days", date: "May 15", icon: Award },
    {
      metric: "Most Goals Active",
      value: "8 goals",
      date: "Jun 1",
      icon: Target,
    },
    {
      metric: "Highest Weekly Progress",
      value: "92%",
      date: "May 28",
      icon: TrendingUp,
    },
    {
      metric: "Best Focus Score",
      value: "9.5/10",
      date: "Jun 10",
      icon: Brain,
    },
  ];

  // Growth milestones
  const milestones = [
    { date: "Jan 15", event: "Started goal tracking journey", impact: "high" },
    { date: "Feb 28", event: "Completed first major goal", impact: "high" },
    { date: "Mar 20", event: "Established daily routine", impact: "medium" },
    {
      date: "Apr 10",
      event: "Reached 50% on all active goals",
      impact: "high",
    },
    {
      date: "May 5",
      event: "Implemented new productivity system",
      impact: "medium",
    },
    {
      date: "Jun 1",
      event: "Personal best month for progress",
      impact: "high",
    },
  ];

  // Comparative growth across categories
  const categoryGrowth = [
    { category: "Health & Fitness", q1: 65, q2: 82, growth: 26 },
    { category: "Career & Skills", q1: 48, q2: 75, growth: 56 },
    { category: "Personal Development", q1: 55, q2: 88, growth: 60 },
    { category: "Financial Goals", q1: 40, q2: 68, growth: 70 },
    { category: "Relationships", q1: 60, q2: 78, growth: 30 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Personal Growth Tracking
        </h3>
        <p className="text-sm text-gray-300">
          Track your development journey and celebrate your progress
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={growthMetric}
          onChange={(e) => setGrowthMetric(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="overall">Overall Growth</option>
          <option value="skills">Skill Development</option>
          <option value="categories">Category Progress</option>
          <option value="momentum">Momentum Analysis</option>
        </select>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {/* Personal Records */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {personalRecords.map((record, index) => (
          <PersonalRecordCard
            key={index}
            record={record}
            color={colors.gradient[index]}
          />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall Growth Trajectory */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Growth Trajectory
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overallGrowthData}>
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
                  dataKey="growth"
                  stackId="1"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="momentum"
                  stackId="1"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="skills"
                  stackId="1"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <LegendItem color={colors.primary} label="Overall Growth" />
            <LegendItem color={colors.secondary} label="Momentum" />
            <LegendItem color={colors.accent} label="Skills" />
          </div>
        </div>

        {/* Skill Development Radar */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Skill Development Analysis
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillGrowth}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Radar
                  name="Before"
                  dataKey="before"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.3}
                />
                <Radar
                  name="After"
                  dataKey="after"
                  stroke={colors.success}
                  fill={colors.success}
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Growth Comparison */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4">
          Growth by Category
        </h4>
        <div className="space-y-3">
          {categoryGrowth.map((category, index) => (
            <CategoryGrowthBar
              key={index}
              category={category}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Growth Timeline */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Growth Milestones Timeline
        </h4>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              isLast={index === milestones.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Growth Insights */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Growth Insights & Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard
            type="achievement"
            title="Exceptional Growth Rate"
            description="Your overall growth rate of 85% exceeds 90% of users"
            icon={TrendingUp}
          />
          <InsightCard
            type="opportunity"
            title="Focus Area Identified"
            description="Financial goals show highest growth potential at 70%"
            icon={Target}
          />
          <InsightCard
            type="pattern"
            title="Consistency Pays Off"
            description="Goals with daily check-ins show 3x faster growth"
            icon={Activity}
          />
          <InsightCard
            type="next"
            title="Next Growth Sprint"
            description="Set new personal records in the next 30 days"
            icon={Zap}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const PersonalRecordCard = ({ record, color }) => {
  const IconComponent = record.icon;
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <IconComponent className="h-5 w-5" style={{ color }} />
        <span className="text-xs text-gray-400">{record.date}</span>
      </div>
      <p className="text-2xl font-bold text-white">{record.value}</p>
      <p className="text-sm text-gray-300">{record.metric}</p>
    </div>
  );
};

const CategoryGrowthBar = ({ category, colors }) => {
  const growthPercent = ((category.q2 - category.q1) / category.q1) * 100;
  const isPositive = growthPercent > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">
          {category.category}
        </span>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-green-400" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            +{category.growth}%
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-1">
          <div
            className="h-2 bg-gray-700/50 rounded-l"
            style={{ width: `${category.q1}%` }}
          >
            <div
              className="h-full bg-gray-500 rounded-l"
              style={{ width: "100%" }}
            />
          </div>
          <div
            className="h-2 bg-green-500/50 rounded-r"
            style={{ width: `${category.q2 - category.q1}%` }}
          >
            <div
              className="h-full bg-green-500 rounded-r"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Q1: {category.q1}%</span>
          <span className="text-xs text-gray-400">Q2: {category.q2}%</span>
        </div>
      </div>
    </div>
  );
};

const MilestoneCard = ({ milestone, isLast }) => {
  const impactColor = {
    high: "border-green-400/30 bg-green-500/10",
    medium: "border-yellow-400/30 bg-yellow-500/10",
    low: "border-gray-400/30 bg-gray-500/10",
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            milestone.impact === "high" ? "bg-green-500" : "bg-gray-500"
          }`}
        />
        {!isLast && <div className="w-0.5 h-full bg-gray-600 mt-1" />}
      </div>
      <div
        className={`flex-1 rounded-lg border p-3 ${
          impactColor[milestone.impact]
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">{milestone.date}</span>
          <span className="text-xs font-medium text-white capitalize">
            {milestone.impact} impact
          </span>
        </div>
        <p className="text-sm text-white">{milestone.event}</p>
      </div>
    </div>
  );
};

const InsightCard = ({ type, title, description, icon: Icon }) => {
  const typeStyles = {
    achievement: "text-green-400",
    opportunity: "text-yellow-400",
    pattern: "text-blue-400",
    next: "text-purple-400",
  };

  return (
    <div className="flex items-start gap-3">
      <Icon className={`h-5 w-5 ${typeStyles[type]} flex-shrink-0 mt-0.5`} />
      <div>
        <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
        <p className="text-xs text-gray-300">{description}</p>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

export default GrowthTrackingTab;
