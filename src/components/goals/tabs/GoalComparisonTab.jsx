// frontend/ src/components/goals/tabs/GoalComparisonTab.jsx
import React, { useState } from "react";
import {
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  Calendar,
  Award,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  ScatterChart,
  Scatter,
  Cell,
  Legend,
} from "recharts";

const GoalComparisonTab = ({ goals, colors }) => {
  const [comparisonMode, setComparisonMode] = useState("progress");
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Toggle goal selection
  const toggleGoalSelection = (goalId) => {
    setSelectedGoals(
      (prev) =>
        prev.includes(goalId)
          ? prev.filter((id) => id !== goalId)
          : [...prev, goalId].slice(0, 5) // Limit to 5 goals
    );
  };

  // Prepare comparison data
  const comparisonData = goals.map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    progress: goal.progress || 0,
    milestones: goal.milestones?.length || 0,
    completedMilestones:
      goal.milestones?.filter((m) => m.completed).length || 0,
    daysActive: Math.floor(Math.random() * 90) + 10, // Mock data
    velocity: Math.random() * 5 + 1, // Mock data
    consistency: Math.random() * 100, // Mock data
  }));

  // Filter data for selected goals
  const filteredData =
    selectedGoals.length > 0
      ? comparisonData.filter((_, index) =>
          selectedGoals.includes(goals[index].id)
        )
      : comparisonData.slice(0, 5);

  // Radar chart data
  const radarData = [
    {
      metric: "Progress",
      ...Object.fromEntries(
        filteredData.map((d, i) => [`goal${i}`, d.progress])
      ),
    },
    {
      metric: "Velocity",
      ...Object.fromEntries(
        filteredData.map((d, i) => [`goal${i}`, d.velocity * 20])
      ),
    },
    {
      metric: "Consistency",
      ...Object.fromEntries(
        filteredData.map((d, i) => [`goal${i}`, d.consistency])
      ),
    },
    {
      metric: "Milestones",
      ...Object.fromEntries(
        filteredData.map((d, i) => [
          `goal${i}`,
          (d.completedMilestones / Math.max(d.milestones, 1)) * 100,
        ])
      ),
    },
    {
      metric: "Engagement",
      ...Object.fromEntries(
        filteredData.map((d, i) => [`goal${i}`, Math.random() * 100])
      ),
    },
  ];

  // Scatter plot data for efficiency analysis
  const scatterData = goals.map((goal, index) => ({
    x: goal.progress || 0,
    y: Math.random() * 100, // Mock efficiency score
    name: goal.decryptedTitle,
    category:
      index % 3 === 0
        ? "High Performer"
        : index % 3 === 1
        ? "Steady Progress"
        : "Needs Attention",
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-purple-400" />
          Goal Comparison Analysis
        </h3>
        <p className="text-sm text-gray-300">
          Compare performance metrics across multiple goals
        </p>
      </div>

      {/* Goal Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
        <h4 className="text-md font-semibold text-white mb-3">
          Select Goals to Compare (Max 5)
        </h4>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoalSelection(goal.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedGoals.includes(goal.id)
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              {goal.decryptedTitle?.substring(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Mode Selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-300">View:</span>
        <select
          value={comparisonMode}
          onChange={(e) => setComparisonMode(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="progress">Progress Comparison</option>
          <option value="velocity">Velocity Analysis</option>
          <option value="efficiency">Efficiency Matrix</option>
          <option value="timeline">Timeline View</option>
        </select>
      </div>

      {/* Main Comparison Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart Comparison */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            {comparisonMode === "progress"
              ? "Progress Comparison"
              : "Performance Metrics"}
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="progress" fill={colors.primary} />
                {comparisonMode === "velocity" && (
                  <Bar dataKey="velocity" fill={colors.secondary} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart - Multi-dimensional Comparison */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Multi-Metric Comparison
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF" }}
                />
                {filteredData.map((_, index) => (
                  <Radar
                    key={index}
                    name={filteredData[index].name}
                    dataKey={`goal${index}`}
                    stroke={colors.gradient[index]}
                    fill={colors.gradient[index]}
                    fillOpacity={0.2}
                  />
                ))}
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

      {/* Efficiency Matrix */}
      {comparisonMode === "efficiency" && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
          <h4 className="text-md font-semibold text-white mb-4">
            Progress vs Efficiency Matrix
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Progress"
                  unit="%"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Efficiency"
                  unit="%"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Scatter name="Goals" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.category === "High Performer"
                          ? colors.success
                          : entry.category === "Steady Progress"
                          ? colors.primary
                          : colors.warning
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <LegendItem color={colors.success} label="High Performer" />
            <LegendItem color={colors.primary} label="Steady Progress" />
            <LegendItem color={colors.warning} label="Needs Attention" />
          </div>
        </div>
      )}

      {/* Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <ComparisonStat
          icon={TrendingUp}
          title="Highest Progress"
          value={Math.max(...filteredData.map((d) => d.progress))}
          unit="%"
          color={colors.success}
        />
        <ComparisonStat
          icon={Clock}
          title="Avg. Days Active"
          value={Math.round(
            filteredData.reduce((acc, d) => acc + d.daysActive, 0) /
              filteredData.length
          )}
          unit="days"
          color={colors.info}
        />
        <ComparisonStat
          icon={Zap}
          title="Avg. Velocity"
          value={(
            filteredData.reduce((acc, d) => acc + d.velocity, 0) /
            filteredData.length
          ).toFixed(1)}
          unit="pts/day"
          color={colors.warning}
        />
        <ComparisonStat
          icon={Award}
          title="Completion Rate"
          value={Math.round(
            (filteredData.filter((d) => d.progress === 100).length /
              filteredData.length) *
              100
          )}
          unit="%"
          color={colors.primary}
        />
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Comparison Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightItem
            icon={CheckCircle2}
            text="Health goals show 23% higher completion rates than career goals"
            type="success"
          />
          <InsightItem
            icon={AlertCircle}
            text="3 goals have similar progress patterns - consider consolidating"
            type="warning"
          />
          <InsightItem
            icon={TrendingUp}
            text="Morning-focused goals have 40% better velocity scores"
            type="info"
          />
          <InsightItem
            icon={Target}
            text="Goals with 3+ milestones show more consistent progress"
            type="tip"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ComparisonStat = ({ icon: Icon, title, value, unit, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
      <span className="text-xs text-gray-400">{unit}</span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-300">{title}</p>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

const InsightItem = ({ icon: Icon, text, type }) => {
  const colorMap = {
    success: "text-green-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    tip: "text-purple-400",
  };

  return (
    <div className="flex items-start gap-2">
      <Icon className={`h-4 w-4 ${colorMap[type]} flex-shrink-0 mt-0.5`} />
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  );
};

export default GoalComparisonTab;
