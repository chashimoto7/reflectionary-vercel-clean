// frontend/ src/components/analytics/tabs/PredictiveAnalyticsTab.jsx
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  Telescope,
  TrendingUp,
  Brain,
  Target,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  CloudRain,
  Sun,
  Moon,
  Activity,
} from "lucide-react";

const PredictiveAnalyticsTab = ({ data, colors }) => {
  const [selectedPrediction, setSelectedPrediction] = useState("30days");
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);

  // Extract prediction data
  const predictions = data?.predictions || generateSamplePredictions();
  const riskFactors = data?.riskFactors || generateSampleRiskFactors();
  const opportunities = data?.opportunities || generateSampleOpportunities();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Predictive Analytics & Future Insights
          </h3>
          <p className="text-sm text-purple-300">
            AI-powered predictions based on your patterns and trends
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPrediction}
            onChange={(e) => setSelectedPrediction(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="7days">Next 7 Days</option>
            <option value="30days">Next 30 Days</option>
            <option value="90days">Next 90 Days</option>
          </select>

          <button
            onClick={() => setShowConfidenceIntervals(!showConfidenceIntervals)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              showConfidenceIntervals
                ? "backdrop-blur-xl bg-purple-600/40 text-purple-100 border border-purple-400"
                : "backdrop-blur-xl bg-white/10 text-purple-300 border border-white/20"
            }`}
          >
            <Activity className="w-4 h-4" />
            Confidence
          </button>
        </div>
      </div>

      {/* Primary Predictions Chart */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Telescope className="w-5 h-5 text-purple-300" />
          Multi-Feature Predictions
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictions.timeline}>
            <defs>
              <linearGradient
                id="emotionalPredGradient"
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
              <linearGradient
                id="wellnessPredGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.rose} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.rose} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="goalPredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1} />
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
              labelStyle={{ color: colors.purple }}
            />
            <Legend wrapperStyle={{ color: colors.purple }} iconType="circle" />

            {/* Predicted values with confidence intervals */}
            <Area
              type="monotone"
              dataKey="emotionalWellbeing"
              name="Emotional Wellbeing"
              stroke={colors.purple}
              fillOpacity={1}
              fill="url(#emotionalPredGradient)"
              strokeWidth={2}
            />
            {showConfidenceIntervals && (
              <Area
                type="monotone"
                dataKey="emotionalConfidence"
                stroke="none"
                fill={colors.purple}
                fillOpacity={0.1}
              />
            )}

            <Area
              type="monotone"
              dataKey="wellnessScore"
              name="Wellness Score"
              stroke={colors.rose}
              fillOpacity={1}
              fill="url(#wellnessPredGradient)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="goalAchievement"
              name="Goal Achievement"
              stroke={colors.cyan}
              fillOpacity={1}
              fill="url(#goalPredGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PredictionCard
          title="Emotional Outlook"
          prediction="Positive trend expected"
          confidence={87}
          timeframe={selectedPrediction}
          icon={Heart}
          color={colors.purple}
          details={[
            "Peak emotional state in 2 weeks",
            "Watch for minor dip around day 18",
            "Strong recovery pattern predicted",
          ]}
        />
        <PredictionCard
          title="Goal Completion"
          prediction="3 goals likely to complete"
          confidence={92}
          timeframe={selectedPrediction}
          icon={Target}
          color={colors.cyan}
          details={[
            "Meditation goal: 95% likely",
            "Fitness goal: 88% likely",
            "Reading goal: 79% likely",
          ]}
        />
        <PredictionCard
          title="Wellness Trajectory"
          prediction="Steady improvement"
          confidence={79}
          timeframe={selectedPrediction}
          icon={Activity}
          color={colors.emerald}
          details={[
            "+15% wellness score predicted",
            "Sleep quality improving",
            "Energy levels rising",
          ]}
        />
      </div>

      {/* Risk Factors & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Potential Challenges
          </h4>
          <div className="space-y-3">
            {riskFactors.map((risk, index) => (
              <RiskCard key={index} risk={risk} colors={colors} />
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Growth Opportunities
          </h4>
          <div className="space-y-3">
            {opportunities.map((opp, index) => (
              <OpportunityCard key={index} opportunity={opp} colors={colors} />
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Predictions */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Pattern-Based Predictions
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={getSeasonalPredictions()}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="aspect"
              tick={{ fill: colors.purple, fontSize: 12 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: colors.purple }} />
            <Radar
              name="Current"
              dataKey="current"
              stroke={colors.purple}
              fill={colors.purple}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Predicted"
              dataKey="predicted"
              stroke={colors.pink}
              fill={colors.pink}
              fillOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Recommendation */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Predictive Intelligence Summary
            </h4>
            <p className="text-sm text-purple-200 mb-3">
              Based on your patterns, the next {selectedPrediction} show strong
              potential for growth. Your consistency in journaling and goal
              tracking is creating positive momentum.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="backdrop-blur-xl bg-white/5 rounded-lg p-3">
                <p className="text-xs text-purple-400 mb-1">
                  Highest Growth Potential
                </p>
                <p className="text-sm font-semibold text-purple-100">
                  Emotional Intelligence
                </p>
              </div>
              <div className="backdrop-blur-xl bg-white/5 rounded-lg p-3">
                <p className="text-xs text-purple-400 mb-1">
                  Optimal Focus Time
                </p>
                <p className="text-sm font-semibold text-purple-100">
                  Mornings (8-10 AM)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prediction Card Component
const PredictionCard = ({
  title,
  prediction,
  confidence,
  timeframe,
  icon: Icon,
  color,
  details,
}) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="text-right">
          <p className="text-xs text-purple-400">Confidence</p>
          <p className="text-lg font-bold text-purple-100">{confidence}%</p>
        </div>
      </div>
      <h4 className="font-semibold text-purple-100 mb-1">{title}</h4>
      <p className="text-sm text-purple-300 mb-3">{prediction}</p>
      <div className="space-y-1">
        {details.map((detail, index) => (
          <p
            key={index}
            className="text-xs text-purple-400 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            {detail}
          </p>
        ))}
      </div>
    </div>
  );
};

// Risk Card Component
const RiskCard = ({ risk, colors }) => {
  return (
    <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-red-500/10 rounded-lg border border-red-500/20">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-100">{risk.title}</p>
        <p className="text-xs text-purple-300 mt-1">{risk.description}</p>
        <p className="text-xs text-purple-400 mt-2">
          Likelihood: {risk.likelihood}%
        </p>
      </div>
    </div>
  );
};

// Opportunity Card Component
const OpportunityCard = ({ opportunity, colors }) => {
  return (
    <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-green-500/10 rounded-lg border border-green-500/20">
      <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-100">
          {opportunity.title}
        </p>
        <p className="text-xs text-purple-300 mt-1">
          {opportunity.description}
        </p>
        <p className="text-xs text-purple-400 mt-2">
          Impact potential: {opportunity.impact}%
        </p>
      </div>
    </div>
  );
};

// Sample data generators
const generateSamplePredictions = () => ({
  timeline: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    emotionalWellbeing: 70 + Math.sin(i / 5) * 15 + i * 0.3,
    emotionalConfidence: 10,
    wellnessScore: 65 + Math.cos(i / 7) * 10 + i * 0.4,
    goalAchievement: 60 + Math.sin(i / 4) * 20 + i * 0.5,
  })),
});

const generateSampleRiskFactors = () => [
  {
    title: "Consistency Drop Risk",
    description: "Historical pattern shows potential decrease around day 21",
    likelihood: 35,
  },
  {
    title: "Seasonal Affective Pattern",
    description: "Previous data suggests lower mood in winter months",
    likelihood: 42,
  },
  {
    title: "Goal Abandonment Risk",
    description: "New goals have 30% dropout rate after 2 weeks",
    likelihood: 30,
  },
];

const generateSampleOpportunities = () => [
  {
    title: "Peak Performance Window",
    description: "Next 2 weeks show optimal conditions for breakthrough",
    impact: 85,
  },
  {
    title: "Habit Formation Opportunity",
    description:
      "Current consistency creates perfect habit-building environment",
    impact: 92,
  },
  {
    title: "Social Connection Boost",
    description: "Patterns suggest increased social energy upcoming",
    impact: 78,
  },
];

const getSeasonalPredictions = () => [
  { aspect: "Energy", current: 75, predicted: 85 },
  { aspect: "Focus", current: 80, predicted: 88 },
  { aspect: "Creativity", current: 70, predicted: 82 },
  { aspect: "Social", current: 65, predicted: 78 },
  { aspect: "Wellness", current: 78, predicted: 85 },
  { aspect: "Productivity", current: 82, predicted: 90 },
];

export default PredictiveAnalyticsTab;
