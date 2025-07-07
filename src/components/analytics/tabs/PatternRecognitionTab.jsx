// frontend/ src/components/analytics/tabs/PatternRecognitionTab.jsx
import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  Cell,
  Sankey,
  Treemap,
} from "recharts";
import {
  Network,
  Brain,
  Heart,
  Target,
  Activity,
  MessageCircle,
  Moon,
  Sun,
  Cloud,
  Calendar,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Link2,
  Layers,
} from "lucide-react";

const PatternRecognitionTab = ({ data, colors }) => {
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Extract pattern data
  const correlations =
    data?.patterns?.correlations || generateSampleCorrelations();
  const triggers = data?.patterns?.triggers || generateSampleTriggers();
  const cycles = data?.patterns?.cycles || generateSampleCycles();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Cross-Feature Pattern Analysis
          </h3>
          <p className="text-sm text-purple-300">
            Discover hidden connections across your journal, goals, wellness,
            and conversations
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Patterns</option>
            <option value="emotional">Emotional Patterns</option>
            <option value="behavioral">Behavioral Patterns</option>
            <option value="cyclical">Cyclical Patterns</option>
            <option value="triggers">Trigger Patterns</option>
          </select>
        </div>
      </div>

      {/* Main Correlation Matrix */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          Feature Correlation Matrix
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Correlation Scatter Plot */}
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Journal Sentiment"
                  domain={[0, 100]}
                  stroke={colors.purple}
                  tick={{ fill: colors.purple }}
                  label={{
                    value: "Journal Sentiment",
                    position: "insideBottom",
                    offset: -5,
                    fill: colors.purple,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Wellness Score"
                  domain={[0, 100]}
                  stroke={colors.purple}
                  tick={{ fill: colors.purple }}
                  label={{
                    value: "Wellness Score",
                    angle: -90,
                    position: "insideLeft",
                    fill: colors.purple,
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(139,92,246,0.5)",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => {
                    if (name === "Journal Sentiment")
                      return `${value}% positive`;
                    if (name === "Wellness Score") return `${value}/100`;
                    if (name === "Goal Progress") return `${value}%`;
                    return value;
                  }}
                />
                <Scatter
                  name="Data Points"
                  data={correlations}
                  fill={colors.purple}
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-purple-400 text-center mt-2">
              Strong correlation detected: r = 0.78
            </p>
          </div>

          {/* Radial Correlation Chart */}
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                data={getRadialData()}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="value"
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={colors.purple}
                  label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(139,92,246,0.5)",
                    borderRadius: "8px",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center">
                <p className="text-xs text-purple-400">Journal ↔ Goals</p>
                <p className="text-sm font-semibold text-purple-100">82%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-400">Wellness ↔ Mood</p>
                <p className="text-sm font-semibold text-purple-100">91%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-400">Sleep ↔ Productivity</p>
                <p className="text-sm font-semibold text-purple-100">76%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-400">AI Sessions ↔ Growth</p>
                <p className="text-sm font-semibold text-purple-100">88%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PatternCard
          title="Morning Productivity Pattern"
          description="Your best insights come between 8-10 AM"
          icon={Sun}
          strength={85}
          color={colors.amber}
          insights={[
            "Journal entries 3x more positive",
            "Goal progress 40% higher",
            "Creative insights peak",
          ]}
        />
        <PatternCard
          title="Weekly Emotional Cycle"
          description="Consistent mood patterns throughout the week"
          icon={Calendar}
          strength={72}
          color={colors.purple}
          insights={[
            "Mondays: Lower energy",
            "Wednesdays: Peak productivity",
            "Sundays: Reflection time",
          ]}
        />
        <PatternCard
          title="Wellness-Mood Connection"
          description="Strong link between exercise and emotional state"
          icon={Heart}
          strength={91}
          color={colors.rose}
          insights={[
            "Exercise → +25% mood",
            "Sleep quality critical",
            "Hydration impacts focus",
          ]}
        />
      </div>

      {/* Trigger Analysis */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-400" />
          Trigger & Response Patterns
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positive Triggers */}
          <div>
            <h5 className="text-sm font-medium text-purple-100 mb-3">
              Positive Triggers
            </h5>
            <div className="space-y-3">
              {triggers.positive.map((trigger, index) => (
                <TriggerItem
                  key={index}
                  trigger={trigger}
                  type="positive"
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Negative Triggers */}
          <div>
            <h5 className="text-sm font-medium text-purple-100 mb-3">
              Challenge Triggers
            </h5>
            <div className="space-y-3">
              {triggers.negative.map((trigger, index) => (
                <TriggerItem
                  key={index}
                  trigger={trigger}
                  type="negative"
                  colors={colors}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cyclical Patterns */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-400" />
          Cyclical Patterns Detected
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cycles}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="phase"
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
            <Bar dataKey="energy" fill={colors.amber} radius={[8, 8, 0, 0]} />
            <Bar dataKey="mood" fill={colors.purple} radius={[8, 8, 0, 0]} />
            <Bar
              dataKey="productivity"
              fill={colors.cyan}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-purple-100 mb-2">
              Key Pattern Insights
            </h4>
            <ul className="space-y-2 text-sm text-purple-200">
              <li>
                • Your emotional wellbeing is 78% correlated with morning
                journaling consistency
              </li>
              <li>
                • Goal progress accelerates by 3x when combined with
                Reflectionarian sessions
              </li>
              <li>
                • Sunday evening reflections lead to 40% more productive weeks
              </li>
              <li>
                • Wellness tracking for 5+ days creates a positive feedback loop
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pattern Card Component
const PatternCard = ({
  title,
  description,
  icon: Icon,
  strength,
  color,
  insights,
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
          <p className="text-xs text-purple-400">Strength</p>
          <p className="text-lg font-bold text-purple-100">{strength}%</p>
        </div>
      </div>
      <h4 className="font-semibold text-purple-100 mb-1">{title}</h4>
      <p className="text-sm text-purple-300 mb-3">{description}</p>
      <div className="space-y-1">
        {insights.map((insight, index) => (
          <p key={index} className="text-xs text-purple-400">
            • {insight}
          </p>
        ))}
      </div>
    </div>
  );
};

// Trigger Item Component
const TriggerItem = ({ trigger, type, colors }) => {
  const bgColor = type === "positive" ? "bg-green-500/20" : "bg-red-500/20";
  const textColor = type === "positive" ? "text-green-400" : "text-red-400";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${bgColor}`}
    >
      <div>
        <p className="text-sm font-medium text-purple-100">{trigger.name}</p>
        <p className="text-xs text-purple-300">{trigger.impact}</p>
      </div>
      <div className={`text-right ${textColor}`}>
        <p className="text-lg font-bold">{trigger.frequency}%</p>
        <p className="text-xs">frequency</p>
      </div>
    </div>
  );
};

// Sample data generators
const generateSampleCorrelations = () => {
  return Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 300 + 100,
  }));
};

const generateSampleTriggers = () => ({
  positive: [
    { name: "Morning meditation", impact: "+35% daily mood", frequency: 82 },
    { name: "Goal completion", impact: "+50% motivation", frequency: 91 },
    { name: "Nature walks", impact: "+28% creativity", frequency: 67 },
  ],
  negative: [
    { name: "Poor sleep", impact: "-40% focus", frequency: 45 },
    { name: "Skipped meals", impact: "-25% energy", frequency: 33 },
    { name: "Social media overuse", impact: "-30% mood", frequency: 58 },
  ],
});

const generateSampleCycles = () => [
  { phase: "Week 1", energy: 75, mood: 80, productivity: 70 },
  { phase: "Week 2", energy: 82, mood: 85, productivity: 88 },
  { phase: "Week 3", energy: 70, mood: 72, productivity: 75 },
  { phase: "Week 4", energy: 85, mood: 88, productivity: 92 },
];

const getRadialData = () => [
  { name: "Journal-Goals", value: 82, fill: "#8B5CF6" },
  { name: "Wellness-Mood", value: 91, fill: "#EC4899" },
  { name: "Sleep-Productivity", value: 76, fill: "#06B6D4" },
  { name: "AI-Growth", value: 88, fill: "#10B981" },
];

export default PatternRecognitionTab;
