// src/components/womenshealth/tabs/WomensHealthOverviewTab.jsx
import React, { useState } from "react";
import {
  Heart,
  Moon,
  Sun,
  Calendar,
  TrendingUp,
  Thermometer,
  Activity,
  Zap,
  Brain,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";

const WomensHealthOverviewTab = ({ data, lifeStage, colors }) => {
  const [selectedMetric, setSelectedMetric] = useState("mood");

  // Process data for overview
  const processedData = data || {
    totalEntries: 0,
    hasData: false,
    currentPhase: "Unknown",
    cycleDay: 0,
    cyclePredictions: {},
    healthScore: 0,
  };

  // Life stage configuration
  const lifeStageConfig = {
    menstrual: {
      title: "Menstrual Cycle Tracking",
      icon: Moon,
      color: colors.primary,
      phases: ["Menstrual", "Follicular", "Ovulatory", "Luteal"],
    },
    perimenopause: {
      title: "Perimenopause Journey",
      icon: Thermometer,
      color: colors.warning,
      phases: ["Early", "Mid", "Late Transition"],
    },
    menopause: {
      title: "Menopause Wellness",
      icon: Sun,
      color: colors.secondary,
      phases: ["Early", "Established", "Late"],
    },
  };

  const currentConfig = lifeStageConfig[lifeStage] || lifeStageConfig.menstrual;

  // Mock data for demonstration - in real app, this would come from the service
  const mockTrendData = [
    { date: "Week 1", mood: 6, energy: 5, sleep: 7, symptoms: 3 },
    { date: "Week 2", mood: 7, energy: 8, sleep: 8, symptoms: 2 },
    { date: "Week 3", mood: 8, energy: 9, sleep: 7, symptoms: 1 },
    { date: "Week 4", mood: 5, energy: 4, sleep: 5, symptoms: 6 },
  ];

  const healthScoreData = [
    {
      name: "Health Score",
      value: processedData.healthScore || 75,
      fill: colors.primary,
    },
    {
      name: "Remaining",
      value: 100 - (processedData.healthScore || 75),
      fill: "#f3f4f6",
    },
  ];

  const phaseDistribution = [
    { name: "Menstrual", value: 25, fill: colors.menstrual },
    { name: "Follicular", value: 40, fill: colors.follicular },
    { name: "Ovulatory", value: 15, fill: colors.ovulatory },
    { name: "Luteal", value: 20, fill: colors.luteal },
  ];

  if (!processedData.hasData) {
    return (
      <div className="p-8 text-center">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Start Your Health Journey
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Begin tracking your cycle, symptoms, and health patterns to unlock
          powerful AI-driven insights about your well-being.
        </p>
        <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          Start Tracking Today
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with Current Status */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <currentConfig.icon
              className="w-8 h-8"
              style={{ color: currentConfig.color }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentConfig.title}
              </h2>
              <p className="text-gray-600">Your current health overview</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {processedData.currentPhase}
            </div>
            <div className="text-sm text-gray-600">
              {lifeStage === "menstrual" &&
                `Day ${processedData.cycleDay} of cycle`}
              {lifeStage === "perimenopause" && "Transition phase"}
              {lifeStage === "menopause" && "Post-menopause"}
            </div>
          </div>
        </div>

        {/* Quick Status Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {processedData.totalEntries}
            </div>
            <div className="text-xs text-gray-600">Total Entries</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {processedData.cyclePredictions?.confidence || 0}%
            </div>
            <div className="text-xs text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {processedData.healthScore || 0}
            </div>
            <div className="text-xs text-gray-600">Health Score</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Current Phase Card */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Moon className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {processedData.currentPhase}
              </div>
              <div className="text-sm opacity-90">Current Phase</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm opacity-90">
              {lifeStage === "menstrual" && "Focus on cycle awareness"}
              {lifeStage === "perimenopause" && "Managing transition symptoms"}
              {lifeStage === "menopause" && "Embracing this life stage"}
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {processedData.healthScore || 75}
              </div>
              <div className="text-sm opacity-90">Health Score</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(processedData.healthScore || 75) >= 80 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="text-sm opacity-90">
              {(processedData.healthScore || 75) >= 80 ? "Excellent" : "Good"}
            </span>
          </div>
        </div>

        {/* Predictions Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-lg font-bold">
                {lifeStage === "menstrual" && "Next Period"}
                {lifeStage === "perimenopause" && "Transition"}
                {lifeStage === "menopause" && "Wellness"}
              </div>
              <div className="text-sm opacity-90">
                {processedData.cyclePredictions?.nextPeriod || "Calculating..."}
              </div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            {processedData.cyclePredictions?.confidence || 85}% confidence
          </div>
        </div>

        {/* Insights Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm opacity-90">New Insights</div>
            </div>
          </div>
          <div className="text-sm opacity-90">AI-generated recommendations</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Trends
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="mood">Mood</option>
              <option value="energy">Energy</option>
              <option value="sleep">Sleep Quality</option>
              <option value="symptoms">Symptom Severity</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Score Radial Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Health Score
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-600">Your Score</span>
            </div>
          </div>

          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[{ value: processedData.healthScore || 75 }]}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={colors.primary}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {processedData.healthScore || 75}
                </div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-emerald-600">85+</div>
              <div className="text-xs text-gray-600">Excellent</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-amber-600">70-84</div>
              <div className="text-xs text-gray-600">Good</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">&lt;70</div>
              <div className="text-xs text-gray-600">Needs Attention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions & Insights */}
      {lifeStage === "menstrual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycle Predictions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Cycle Predictions
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <div>
                    <div className="font-medium text-gray-900">Next Period</div>
                    <div className="text-sm text-gray-600">
                      {processedData.cyclePredictions?.nextPeriod ||
                        "June 25, 2025"}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-pink-600 font-medium">
                  {processedData.cyclePredictions?.confidence || 85}% confident
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Fertile Window
                    </div>
                    <div className="text-sm text-gray-600">
                      June 12-16, 2025
                    </div>
                  </div>
                </div>
                <div className="text-sm text-amber-600 font-medium">
                  Peak fertility
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Energy Peak</div>
                    <div className="text-sm text-gray-600">
                      Ovulatory phase (June 12-16)
                    </div>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium">
                  Plan important tasks
                </div>
              </div>
            </div>
          </div>

          {/* Phase Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Cycle Phase Distribution
            </h3>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={phaseDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {phaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {phaseDistribution.map((phase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phase.fill }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {phase.name}: {phase.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Insights */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent AI Insights
          </h3>
          <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                Excellent Cycle Regularity
              </div>
              <div className="text-sm text-gray-600">
                Your cycles have been highly regular (92% consistency) over the
                past 3 months. This indicates good hormonal balance.
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Generated 2 hours ago • High confidence
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                Energy Pattern Identified
              </div>
              <div className="text-sm text-gray-600">
                Your energy consistently peaks during the ovulatory phase.
                Consider scheduling important tasks during this time.
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Generated 1 day ago • Medium confidence
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                Sleep Quality Correlation
              </div>
              <div className="text-sm text-gray-600">
                Your sleep quality tends to decrease during the luteal phase.
                Consider adjusting your bedtime routine during this time.
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Generated 3 days ago • High confidence
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensHealthOverviewTab;
