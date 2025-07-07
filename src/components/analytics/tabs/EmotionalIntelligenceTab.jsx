// frontend/ src/components/analytics/tabs/EmotionalIntelligenceTab.jsx
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Heart,
  Brain,
  Smile,
  Frown,
  Meh,
  Activity,
  TrendingUp,
  Eye,
  Shield,
  Zap,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const EmotionalIntelligenceTab = ({ data, colors }) => {
  const [selectedEmotion, setSelectedEmotion] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Extract emotional data
  const emotionalProfile =
    data?.emotional?.profile || generateEmotionalProfile();
  const emotionTrends = data?.emotional?.trends || generateEmotionTrends();
  const emotionalTriggers =
    data?.emotional?.triggers || generateEmotionalTriggers();
  const copingStrategies =
    data?.emotional?.copingStrategies || generateCopingStrategies();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Emotional Intelligence Dashboard
          </h3>
          <p className="text-sm text-purple-250">
            Deep insights into your emotional patterns and growth
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
          </select>
        </div>
      </div>

      {/* Emotional Intelligence Score */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="DDD6FE"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * 0.85} ${
                    2 * Math.PI * 56 * 0.15
                  }`}
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-purple-100">85</span>
                <span className="text-xs text-purple-200">EQ Score</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-purple-150">
              Overall Emotional Intelligence
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <ScoreItem label="Self-Awareness" score={88} color="DDD6FE" />
            <ScoreItem label="Self-Regulation" score={82} color={colors.pink} />
            <ScoreItem
              label="Emotional Expression"
              score={79}
              color={colors.cyan}
            />
            <ScoreItem
              label="Empathy & Understanding"
              score={91}
              color={colors.emerald}
            />
            <ScoreItem
              label="Emotional Resilience"
              score={85}
              color={colors.amber}
            />
          </div>
        </div>
      </div>

      {/* Emotional Components Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-300" />
            Emotional Components Analysis
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={emotionalProfile}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              dataKey="component" tick={{ fill: "#FFFFFF", fontSize: 12 }}
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "FFFFFF" }} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#E9D5FF"
                fill="#DDD6FE"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Growth"
                dataKey="growth"
                stroke={colors.pink}
                fill={colors.pink}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Distribution */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-300" />
            Emotion Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEmotionDistribution()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {getEmotionDistribution().map((entry, index) => (
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
            {getEmotionDistribution().map((emotion) => (
              <div key={emotion.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: emotion.color }}
                />
                <span className="text-xs text-purple-300">
                  {emotion.name}: {emotion.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emotion Trends Over Time */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-250" />
          Emotional Journey Timeline
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={emotionTrends}>
            <defs>
              <linearGradient id="joyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.amber} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.amber} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="calmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={colors.purple}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.2)"
            />

            <XAxis
              dataKey="date"
              stroke={colors.purple}
              tick={{ fill: "#FFFFFF" }}
            />
            <YAxis stroke={colors.purple} tick={{ fill: "#FFFFFF" }} />
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
              dataKey="joy"
              stroke={colors.amber}
              fillOpacity={1}
              fill="url(#joyGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="calm"
              stroke={colors.cyan}
              fillOpacity={1}
              fill="url(#calmGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke={colors.purple}
              fillOpacity={1}
              fill="url(#energyGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Emotional Triggers & Coping Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triggers */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-400" />
            Emotional Triggers Identified
          </h4>
          <div className="space-y-3">
            {emotionalTriggers.map((trigger, index) => (
              <TriggerCard key={index} trigger={trigger} colors={colors} />
            ))}
          </div>
        </div>

        {/* Coping Strategies */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Effective Coping Strategies
          </h4>
          <div className="space-y-3">
            {copingStrategies.map((strategy, index) => (
              <StrategyCard key={index} strategy={strategy} colors={colors} />
            ))}
          </div>
        </div>
      </div>

      {/* Emotional Weather Forecast */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-purple-400" />
          Your Emotional Weather Forecast
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WeatherCard
            day="Today"
            emotion="Sunny"
            icon={Sun}
            description="High energy, positive outlook"
            color={colors.amber}
          />
          <WeatherCard
            day="Tomorrow"
            emotion="Partly Cloudy"
            icon={Cloud}
            description="Mixed emotions expected"
            color={colors.purple}
          />
          <WeatherCard
            day="This Week"
            emotion="Clear Skies"
            icon={Wind}
            description="Stable and balanced"
            color={colors.cyan}
          />
          <WeatherCard
            day="Next Week"
            emotion="Light Rain"
            icon={CloudRain}
            description="Emotional processing phase"
            color={colors.indigo}
          />
        </div>
      </div>

      {/* Growth Insights */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Emotional Growth Insights
            </h4>
            <div className="space-y-2 text-sm text-purple-200">
              <p>
                • Your emotional self-awareness has increased by 23% in the past
                month
              </p>
              <p>
                • You're developing stronger emotional regulation during
                stressful situations
              </p>
              <p>
                • Morning journaling correlates with 40% better emotional
                balance throughout the day
              </p>
              <p>
                • Your empathy scores are in the top 15% compared to similar
                profiles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Score Item Component
const ScoreItem = ({ label, score, color }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-purple-200">{label}</span>
          <span className="text-sm font-semibold text-purple-100">
            {score}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              background: `linear-gradient(to right, ${color}, ${color}dd)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Trigger Card Component
const TriggerCard = ({ trigger, colors }) => {
  const getIcon = () => {
    switch (trigger.type) {
      case "stress":
        return AlertCircle;
      case "social":
        return Heart;
      case "work":
        return Brain;
      case "physical":
        return Activity;
      default:
        return Zap;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-white/5 rounded-lg">
      <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-medium text-purple-100">{trigger.name}</p>
          <span className="text-xs text-purple-400">
            {trigger.frequency}/week
          </span>
        </div>
        <p className="text-xs text-purple-300">{trigger.impact}</p>
      </div>
    </div>
  );
};

// Strategy Card Component
const StrategyCard = ({ strategy, colors }) => {
  return (
    <div className="p-3 backdrop-blur-xl bg-green-500/10 rounded-lg border border-green-500/20">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium text-purple-100">{strategy.name}</p>
        <span className="text-xs text-green-400">
          {strategy.effectiveness}% effective
        </span>
      </div>
      <p className="text-xs text-purple-300">{strategy.description}</p>
    </div>
  );
};

// Weather Card Component
const WeatherCard = ({ day, emotion, icon: Icon, description, color }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4 text-center">
      <p className="text-xs text-purple-400 mb-2">{day}</p>
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
      <p className="text-sm font-medium text-purple-100 mb-1">{emotion}</p>
      <p className="text-xs text-purple-300">{description}</p>
    </div>
  );
};

// Sample data generators
const generateEmotionalProfile = () => [
  { component: "Recognition", current: 85, growth: 92 },
  { component: "Understanding", current: 78, growth: 85 },
  { component: "Expression", current: 72, growth: 80 },
  { component: "Regulation", current: 80, growth: 88 },
  { component: "Empathy", current: 88, growth: 91 },
  { component: "Resilience", current: 75, growth: 85 },
];

const generateEmotionTrends = () => {
  const days = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    joy: 60 + Math.random() * 30,
    calm: 55 + Math.random() * 35,
    energy: 50 + Math.random() * 40,
  }));
  return days;
};

const generateEmotionalTriggers = () => [
  {
    name: "Work deadlines",
    type: "stress",
    frequency: 3,
    impact: "Increases anxiety by 35%",
  },
  {
    name: "Social interactions",
    type: "social",
    frequency: 5,
    impact: "Boosts mood by 25%",
  },
  {
    name: "Morning routine disruption",
    type: "physical",
    frequency: 2,
    impact: "Decreases focus by 40%",
  },
  {
    name: "Creative activities",
    type: "work",
    frequency: 4,
    impact: "Enhances joy by 45%",
  },
];

const generateCopingStrategies = () => [
  {
    name: "Deep breathing",
    effectiveness: 88,
    description: "Reduces stress within 5 minutes",
  },
  {
    name: "Journaling",
    effectiveness: 92,
    description: "Processes emotions effectively",
  },
  {
    name: "Physical exercise",
    effectiveness: 85,
    description: "Releases tension and boosts mood",
  },
  {
    name: "Reflectionarian sessions",
    effectiveness: 90,
    description: "Provides clarity and perspective",
  },
];

const getEmotionDistribution = () => [
  { name: "Joy", value: 32, color: "#F59E0B" },
  { name: "Calm", value: 28, color: "#06B6D4" },
  { name: "Focus", value: 22, color: "#8B5CF6" },
  { name: "Anxiety", value: 10, color: "#EF4444" },
  { name: "Neutral", value: 8, color: "#6B7280" },
];

export default EmotionalIntelligenceTab;
