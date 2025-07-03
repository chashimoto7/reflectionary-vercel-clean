// src/components/analytics/tabs/WellnessHolisticTab.jsx
import React, { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Activity,
  Heart,
  Brain,
  Moon,
  Sun,
  Droplets,
  Apple,
  Wind,
  Battery,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Flower2,
  HeartHandshake,
  Smile,
} from "lucide-react";

const WellnessHolisticTab = ({ data, colors }) => {
  const [selectedDimension, setSelectedDimension] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Extract wellness data
  const wellnessScore = data?.wellness?.overallScore || 78;
  const dimensions = data?.wellness?.dimensions || generateWellnessDimensions();
  const trends = data?.wellness?.trends || generateWellnessTrends();
  const habits = data?.wellness?.habits || generateWellnessHabits();
  const correlations =
    data?.wellness?.correlations || generateWellnessCorrelations();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Holistic Wellness Dashboard
          </h3>
          <p className="text-sm text-purple-300">
            Your complete mind-body-spirit wellness analysis
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Dimensions</option>
            <option value="physical">Physical</option>
            <option value="mental">Mental</option>
            <option value="emotional">Emotional</option>
            <option value="spiritual">Spiritual</option>
            <option value="social">Social</option>
          </select>
        </div>
      </div>

      {/* Overall Wellness Score */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Central Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={colors.purple}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${
                    2 * Math.PI * 70 * (wellnessScore / 100)
                  } ${2 * Math.PI * 70 * (1 - wellnessScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-purple-100">
                  {wellnessScore}
                </span>
                <span className="text-sm text-purple-300">Wellness Score</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-purple-200">Excellent Balance</p>
          </div>

          {/* Wellness Dimensions Radar */}
          <div className="md:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dimensions}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: colors.purple, fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: colors.purple }}
                  tickCount={5}
                />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke={colors.purple}
                  fill={colors.purple}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke={colors.pink}
                  fill={colors.pink}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Wellness Dimensions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DimensionCard
          title="Physical"
          score={82}
          icon={Activity}
          color={colors.emerald}
          metrics={[
            { label: "Exercise", value: "85%" },
            { label: "Sleep", value: "78%" },
            { label: "Nutrition", value: "82%" },
          ]}
        />
        <DimensionCard
          title="Mental"
          score={75}
          icon={Brain}
          color={colors.purple}
          metrics={[
            { label: "Focus", value: "72%" },
            { label: "Clarity", value: "78%" },
            { label: "Learning", value: "75%" },
          ]}
        />
        <DimensionCard
          title="Emotional"
          score={79}
          icon={Heart}
          color={colors.rose}
          metrics={[
            { label: "Balance", value: "80%" },
            { label: "Resilience", value: "75%" },
            { label: "Expression", value: "82%" },
          ]}
        />
        <DimensionCard
          title="Spiritual"
          score={71}
          icon={Flower2}
          color={colors.indigo}
          metrics={[
            { label: "Purpose", value: "68%" },
            { label: "Connection", value: "74%" },
            { label: "Growth", value: "71%" },
          ]}
        />
        <DimensionCard
          title="Social"
          score={76}
          icon={HeartHandshake}
          color={colors.cyan}
          metrics={[
            { label: "Relationships", value: "78%" },
            { label: "Community", value: "72%" },
            { label: "Support", value: "78%" },
          ]}
        />
        <DimensionCard
          title="Environmental"
          score={68}
          icon={Wind}
          color={colors.amber}
          metrics={[
            { label: "Space", value: "65%" },
            { label: "Nature", value: "70%" },
            { label: "Harmony", value: "69%" },
          ]}
        />
      </div>

      {/* Wellness Trends */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Wellness Trends Analysis
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trends}>
            <defs>
              <linearGradient id="physicalGradient" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={colors.purple}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="emotionalGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.rose} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.rose} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="date"
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
              dataKey="physical"
              name="Physical"
              stroke={colors.emerald}
              fillOpacity={1}
              fill="url(#physicalGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="mental"
              name="Mental"
              stroke={colors.purple}
              fillOpacity={1}
              fill="url(#mentalGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="emotional"
              name="Emotional"
              stroke={colors.rose}
              fillOpacity={1}
              fill="url(#emotionalGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wellness Habits & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wellness Habits */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Most Effective Wellness Habits
          </h4>
          <div className="space-y-3">
            {habits.map((habit, index) => (
              <HabitCard key={index} habit={habit} colors={colors} />
            ))}
          </div>
        </div>

        {/* Wellness Correlations */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Wellness Impact Factors
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                type="number"
                dataKey="activity"
                name="Activity Level"
                domain={[0, 100]}
                stroke={colors.purple}
                tick={{ fill: colors.purple }}
              />
              <YAxis
                type="number"
                dataKey="wellness"
                name="Wellness Impact"
                domain={[0, 100]}
                stroke={colors.purple}
                tick={{ fill: colors.purple }}
              />
              <ZAxis type="number" dataKey="frequency" range={[50, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  borderRadius: "8px",
                }}
              />
              <Scatter
                name="Activities"
                data={correlations}
                fill={colors.purple}
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Wellness Indicators */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Battery className="w-5 h-5 text-purple-400" />
          Today's Wellness Indicators
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <IndicatorCard
            label="Energy Level"
            value={85}
            icon={Zap}
            color={colors.amber}
            status="High"
          />
          <IndicatorCard
            label="Sleep Quality"
            value={78}
            icon={Moon}
            color={colors.indigo}
            status="Good"
          />
          <IndicatorCard
            label="Hydration"
            value={92}
            icon={Droplets}
            color={colors.cyan}
            status="Excellent"
          />
          <IndicatorCard
            label="Mood Balance"
            value={80}
            icon={Smile}
            color={colors.rose}
            status="Positive"
          />
        </div>
      </div>

      {/* AI Wellness Insights */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Heart className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Holistic Wellness Insights
            </h4>
            <div className="space-y-2 text-sm text-purple-200">
              <p>
                • Your physical wellness peaks when you maintain 7+ hours of
                sleep
              </p>
              <p>
                • Mental clarity improves by 35% after morning meditation
                sessions
              </p>
              <p>
                • Social connections boost your overall wellness score by 20%
              </p>
              <p>
                • Consider adding more nature exposure to improve environmental
                wellness
              </p>
              <p>
                • Your wellness scores are highest on days with balanced
                nutrition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dimension Card Component
const DimensionCard = ({ title, score, icon: Icon, color, metrics }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <h5 className="font-medium text-purple-100">{title}</h5>
        </div>
        <span className="text-xl font-bold text-purple-100">{score}</span>
      </div>
      <div className="space-y-1">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span className="text-purple-400">{metric.label}</span>
            <span className="text-purple-300">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Habit Card Component
const HabitCard = ({ habit, colors }) => {
  const getIcon = () => {
    switch (habit.category) {
      case "exercise":
        return Activity;
      case "nutrition":
        return Apple;
      case "sleep":
        return Moon;
      case "mindfulness":
        return Brain;
      case "social":
        return HeartHandshake;
      default:
        return Heart;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-sm font-medium text-purple-100">{habit.name}</p>
          <p className="text-xs text-purple-300">
            Impact: +{habit.impact}% wellness
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-purple-100">
          {habit.consistency}%
        </p>
        <p className="text-xs text-purple-400">consistency</p>
      </div>
    </div>
  );
};

// Indicator Card Component
const IndicatorCard = ({ label, value, icon: Icon, color, status }) => {
  return (
    <div className="text-center">
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
      <div className="relative inline-flex items-center justify-center mb-2">
        <svg className="w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28 * (value / 100)} ${
              2 * Math.PI * 28 * (1 - value / 100)
            }`}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
        <span className="absolute text-sm font-bold text-purple-100">
          {value}
        </span>
      </div>
      <p className="text-xs text-purple-300">{label}</p>
      <p className="text-xs font-medium text-purple-100">{status}</p>
    </div>
  );
};

// Sample data generators
const generateWellnessDimensions = () => [
  { dimension: "Physical", score: 82, target: 85 },
  { dimension: "Mental", score: 75, target: 80 },
  { dimension: "Emotional", score: 79, target: 82 },
  { dimension: "Spiritual", score: 71, target: 75 },
  { dimension: "Social", score: 76, target: 80 },
  { dimension: "Environmental", score: 68, target: 75 },
];

const generateWellnessTrends = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    physical: 70 + Math.sin(i / 5) * 10 + i * 0.3,
    mental: 65 + Math.cos(i / 7) * 12 + i * 0.2,
    emotional: 68 + Math.sin(i / 4) * 8 + i * 0.25,
  }));
};

const generateWellnessHabits = () => [
  {
    name: "Morning Meditation",
    category: "mindfulness",
    impact: 25,
    consistency: 85,
  },
  { name: "Daily Exercise", category: "exercise", impact: 30, consistency: 78 },
  { name: "8-Hour Sleep", category: "sleep", impact: 35, consistency: 72 },
  {
    name: "Healthy Nutrition",
    category: "nutrition",
    impact: 28,
    consistency: 80,
  },
  {
    name: "Social Connection",
    category: "social",
    impact: 22,
    consistency: 65,
  },
];

const generateWellnessCorrelations = () => {
  return Array.from({ length: 20 }, () => ({
    activity: Math.random() * 100,
    wellness: Math.random() * 100,
    frequency: Math.random() * 300 + 100,
  }));
};

export default WellnessHolisticTab;
