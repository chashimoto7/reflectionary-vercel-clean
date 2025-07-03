// src/components/analytics/tabs/GrowthVelocityTab.jsx
import React, { useState } from "react";
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
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  Rocket,
  Gauge,
  Zap,
  Timer,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Brain,
  Heart,
  Sparkles,
  BarChart3,
  Mountain,
  Compass,
} from "lucide-react";

const GrowthVelocityTab = ({ data, colors }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedDimension, setSelectedDimension] = useState("all");

  // Extract growth data
  const velocityMetrics = data?.growth?.velocity || generateVelocityMetrics();
  const accelerationData =
    data?.growth?.acceleration || generateAccelerationData();
  const dimensionGrowth = data?.growth?.dimensions || generateDimensionGrowth();
  const milestones = data?.growth?.milestones || generateGrowthMilestones();
  const momentum = data?.growth?.momentum || generateMomentumData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Personal Growth Velocity Analysis
          </h3>
          <p className="text-sm text-purple-300">
            Measure the speed and direction of your personal development
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Velocity Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <VelocityCard
          title="Current Velocity"
          value={velocityMetrics.current}
          unit="pts/week"
          icon={Rocket}
          color={colors.purple}
          trend={velocityMetrics.trend}
          status="Accelerating"
        />
        <VelocityCard
          title="Peak Velocity"
          value={velocityMetrics.peak}
          unit="pts/week"
          icon={Mountain}
          color={colors.pink}
          subtitle="Achieved last month"
        />
        <VelocityCard
          title="Acceleration"
          value={`+${velocityMetrics.acceleration}%`}
          unit="monthly"
          icon={Zap}
          color={colors.cyan}
          trend={8}
          status="Increasing"
        />
        <VelocityCard
          title="Momentum Score"
          value={velocityMetrics.momentum}
          unit="/100"
          icon={Gauge}
          color={colors.emerald}
          subtitle="Strong momentum"
        />
      </div>

      {/* Growth Velocity Chart */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Growth Velocity Over Time
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={accelerationData}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={colors.purple}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="accelerationGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="period"
              stroke={colors.purple}
              tick={{ fill: colors.purple }}
            />
            <YAxis
              yAxisId="velocity"
              stroke={colors.purple}
              tick={{ fill: colors.purple }}
              label={{
                value: "Velocity",
                angle: -90,
                position: "insideLeft",
                fill: colors.purple,
              }}
            />
            <YAxis
              yAxisId="growth"
              orientation="right"
              stroke={colors.cyan}
              tick={{ fill: colors.cyan }}
              label={{
                value: "Cumulative Growth",
                angle: 90,
                position: "insideRight",
                fill: colors.cyan,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(139,92,246,0.5)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              yAxisId="velocity"
              type="monotone"
              dataKey="velocity"
              name="Growth Velocity"
              stroke={colors.purple}
              fillOpacity={1}
              fill="url(#velocityGradient)"
              strokeWidth={2}
            />
            <Line
              yAxisId="growth"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Growth"
              stroke={colors.cyan}
              strokeWidth={3}
              dot={{ fill: colors.cyan, r: 4 }}
            />
            <Bar
              yAxisId="velocity"
              dataKey="acceleration"
              name="Acceleration Points"
              fill={colors.pink}
              opacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Dimensional Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimension Radar */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            Multi-Dimensional Growth Velocity
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={dimensionGrowth}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: colors.purple, fontSize: 12 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: colors.purple }}
              />
              <Radar
                name="Current Velocity"
                dataKey="velocity"
                stroke={colors.purple}
                fill={colors.purple}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Potential"
                dataKey="potential"
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

        {/* Growth Momentum */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Growth Momentum Indicators
          </h4>
          <div className="space-y-4">
            {momentum.map((indicator, index) => (
              <MomentumIndicator
                key={index}
                indicator={indicator}
                colors={colors}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Growth Milestones Timeline */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Growth Acceleration Milestones
        </h4>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-600/30"></div>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <MilestoneItem
                key={index}
                milestone={milestone}
                colors={colors}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Velocity Factors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FactorCard
          title="Consistency Factor"
          value={87}
          description="Daily engagement drives 40% of velocity"
          icon={Timer}
          color={colors.purple}
        />
        <FactorCard
          title="Integration Factor"
          value={92}
          description="Cross-feature usage amplifies growth"
          icon={Brain}
          color={colors.cyan}
        />
        <FactorCard
          title="Depth Factor"
          value={78}
          description="Deep reflection accelerates insights"
          icon={Heart}
          color={colors.rose}
        />
      </div>

      {/* Growth Predictions */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Growth Velocity Insights & Predictions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-2">
                  Current Trajectory:
                </p>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Maintaining current velocity = 95% annual growth</li>
                  <li>
                    • Emotional intelligence growing fastest (12pts/month)
                  </li>
                  <li>
                    • Goal achievement velocity increased 45% this quarter
                  </li>
                  <li>
                    • Wellness integration boosting overall velocity by 25%
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-100 mb-2">
                  Optimization Opportunities:
                </p>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Morning sessions could add +15% velocity</li>
                  <li>• Weekly reviews predict 2x acceleration</li>
                  <li>• Connecting insights to actions = +30% growth</li>
                  <li>• Focus on lowest velocity dimension for balance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Velocity Card Component
const VelocityCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  status,
  subtitle,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
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
        {getTrendIcon()}
      </div>
      <h3 className="text-2xl font-bold text-purple-100 mb-1">
        {value}{" "}
        <span className="text-sm font-normal text-purple-400">{unit}</span>
      </h3>
      <p className="text-sm text-purple-300">{title}</p>
      {(status || subtitle) && (
        <p className="text-xs text-purple-400 mt-1">{status || subtitle}</p>
      )}
    </div>
  );
};

// Momentum Indicator Component
const MomentumIndicator = ({ indicator, colors }) => {
  const getStatusColor = () => {
    if (indicator.status === "accelerating") return colors.emerald;
    if (indicator.status === "steady") return colors.amber;
    return colors.rose;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-purple-100">
          {indicator.name}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: getStatusColor() }}
        >
          {indicator.status}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${indicator.value}%`,
            background: `linear-gradient(to right, ${colors.purple}, ${colors.pink})`,
          }}
        />
      </div>
      <p className="text-xs text-purple-400 mt-1">{indicator.description}</p>
    </div>
  );
};

// Milestone Item Component
const MilestoneItem = ({ milestone, colors }) => {
  const getIcon = () => {
    switch (milestone.type) {
      case "breakthrough":
        return Sparkles;
      case "achievement":
        return Award;
      case "acceleration":
        return Rocket;
      case "milestone":
        return Target;
      default:
        return Zap;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex gap-4">
      <div
        className="relative z-10 p-3 rounded-full"
        style={{ backgroundColor: `${milestone.color || colors.purple}20` }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: milestone.color || colors.purple }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-medium text-purple-100">{milestone.title}</h5>
            <p className="text-sm text-purple-300 mt-1">
              {milestone.description}
            </p>
          </div>
          <span className="text-xs text-purple-400">{milestone.date}</span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="text-purple-400">
            Velocity boost: +{milestone.velocityBoost}%
          </span>
          <span className="text-purple-400">Impact: {milestone.impact}/10</span>
        </div>
      </div>
    </div>
  );
};

// Factor Card Component
const FactorCard = ({ title, value, description, icon: Icon, color }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-5 text-center">
      <Icon className="w-8 h-8 mx-auto mb-3" style={{ color }} />
      <h5 className="font-medium text-purple-100 mb-2">{title}</h5>
      <div className="text-2xl font-bold text-purple-100 mb-2">{value}%</div>
      <p className="text-xs text-purple-300">{description}</p>
    </div>
  );
};

// Sample data generators
const generateVelocityMetrics = () => ({
  current: 12.5,
  peak: 18.2,
  acceleration: 15,
  momentum: 87,
  trend: 12,
});

const generateAccelerationData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    period: `Month ${i + 1}`,
    velocity: 8 + Math.random() * 10 + i * 0.5,
    cumulative: 20 + i * 8 + Math.random() * 5,
    acceleration: Math.random() * 5,
  }));
};

const generateDimensionGrowth = () => [
  { dimension: "Emotional", velocity: 85, potential: 95 },
  { dimension: "Intellectual", velocity: 72, potential: 85 },
  { dimension: "Physical", velocity: 68, potential: 80 },
  { dimension: "Social", velocity: 75, potential: 88 },
  { dimension: "Spiritual", velocity: 60, potential: 75 },
  { dimension: "Creative", velocity: 82, potential: 90 },
];

const generateMomentumData = () => [
  {
    name: "Consistency Momentum",
    value: 88,
    status: "accelerating",
    description: "45-day streak building compound growth",
  },
  {
    name: "Insight Integration",
    value: 75,
    status: "steady",
    description: "Converting 75% of insights into action",
  },
  {
    name: "Cross-Feature Synergy",
    value: 82,
    status: "accelerating",
    description: "Multiple features amplifying growth",
  },
  {
    name: "Depth of Engagement",
    value: 70,
    status: "steady",
    description: "Quality sessions driving breakthroughs",
  },
];

const generateGrowthMilestones = () => [
  {
    type: "breakthrough",
    title: "Emotional Intelligence Breakthrough",
    description: "Achieved 50% improvement in emotional awareness",
    date: "2 weeks ago",
    velocityBoost: 25,
    impact: 9,
    color: "#EC4899",
  },
  {
    type: "acceleration",
    title: "Growth Acceleration Point",
    description: "All features working synergistically",
    date: "1 month ago",
    velocityBoost: 35,
    impact: 10,
    color: "#8B5CF6",
  },
  {
    type: "achievement",
    title: "100-Day Consistency",
    description: "Maintained daily engagement for 100 days",
    date: "6 weeks ago",
    velocityBoost: 20,
    impact: 8,
    color: "#06B6D4",
  },
];

export default GrowthVelocityTab;
