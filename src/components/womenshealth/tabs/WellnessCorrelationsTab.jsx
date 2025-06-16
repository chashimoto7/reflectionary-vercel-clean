// src/components/womenshealth/tabs/WellnessCorrelationsTab.jsx
import React, { useState } from "react";
import {
  Target,
  Heart,
  Zap,
  Moon,
  Brain,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  Calendar,
  Thermometer,
  Sun,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  BarChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const WellnessCorrelationsTab = ({ data, lifeStage, colors }) => {
  const [selectedCorrelation, setSelectedCorrelation] = useState("mood-cycle");
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");
  const [showStatistics, setShowStatistics] = useState(false);

  // Process wellness correlation data
  const correlationData = data || {
    moodCycle: { correlation: 0.7 },
    energyPatterns: { correlation: 0.6 },
    sleepCycle: { correlation: 0.5 },
  };

  // Mock correlation data for visualization
  const moodCycleData = [
    { day: 1, cycleDay: 1, mood: 5.2, journalMood: 5.1, phase: "Menstrual" },
    { day: 2, cycleDay: 5, mood: 6.1, journalMood: 6.3, phase: "Menstrual" },
    { day: 3, cycleDay: 8, mood: 7.8, journalMood: 7.6, phase: "Follicular" },
    { day: 4, cycleDay: 12, mood: 8.2, journalMood: 8.1, phase: "Follicular" },
    { day: 5, cycleDay: 14, mood: 8.9, journalMood: 9.0, phase: "Ovulatory" },
    { day: 6, cycleDay: 16, mood: 8.7, journalMood: 8.5, phase: "Ovulatory" },
    { day: 7, cycleDay: 20, mood: 6.8, journalMood: 6.9, phase: "Luteal" },
    { day: 8, cycleDay: 25, mood: 5.5, journalMood: 5.8, phase: "Luteal" },
    { day: 9, cycleDay: 28, mood: 5.0, journalMood: 4.9, phase: "Luteal" },
  ];

  const energyCorrelationData = [
    { day: 1, cycleEnergy: 4.1, journalEnergy: 4.3, sleep: 6.2 },
    { day: 2, cycleEnergy: 5.5, journalEnergy: 5.8, sleep: 7.1 },
    { day: 3, cycleEnergy: 8.2, journalEnergy: 8.0, sleep: 8.0 },
    { day: 4, cycleEnergy: 9.1, journalEnergy: 8.9, sleep: 8.2 },
    { day: 5, cycleEnergy: 9.0, journalEnergy: 9.2, sleep: 7.9 },
    { day: 6, cycleEnergy: 7.8, journalEnergy: 7.5, sleep: 7.3 },
    { day: 7, cycleEnergy: 5.8, journalEnergy: 6.1, sleep: 6.8 },
    { day: 8, cycleEnergy: 4.2, journalEnergy: 4.5, sleep: 6.0 },
  ];

  const sleepCycleData = [
    {
      phase: "Menstrual",
      sleepQuality: 6.3,
      sleepDuration: 7.8,
      symptoms: 7.2,
    },
    {
      phase: "Follicular",
      sleepQuality: 7.9,
      sleepDuration: 7.5,
      symptoms: 2.1,
    },
    {
      phase: "Ovulatory",
      sleepQuality: 8.1,
      sleepDuration: 7.2,
      symptoms: 1.5,
    },
    { phase: "Luteal", sleepQuality: 6.8, sleepDuration: 7.6, symptoms: 5.8 },
  ];

  // Correlation strength indicators
  const correlationStrengths = [
    {
      name: "Mood ↔ Cycle Phase",
      value: 0.84,
      significance: "high",
      description: "Strong correlation between cycle phase and mood ratings",
      icon: Heart,
      color: colors.primary,
    },
    {
      name: "Energy ↔ Hormones",
      value: 0.76,
      significance: "high",
      description: "Energy levels closely follow hormonal fluctuations",
      icon: Zap,
      color: colors.accent,
    },
    {
      name: "Sleep ↔ Cycle",
      value: 0.68,
      significance: "medium",
      description: "Sleep quality varies predictably with cycle phases",
      icon: Moon,
      color: colors.secondary,
    },
    {
      name: "Journal Frequency ↔ Mood",
      value: 0.62,
      significance: "medium",
      description: "Lower moods correlate with more frequent journaling",
      icon: Brain,
      color: colors.warning,
    },
    {
      name: "Symptoms ↔ Journal Tone",
      value: 0.58,
      significance: "medium",
      description: "Physical symptoms reflected in journal emotional tone",
      icon: Activity,
      color: colors.danger,
    },
  ];

  // Phase-specific wellness patterns
  const phaseWellnessData = [
    {
      phase: "Menstrual",
      mood: 5.2,
      energy: 4.1,
      sleep: 6.3,
      journaling: 8.5,
      selfCare: 7.8,
      socialConnection: 4.2,
    },
    {
      phase: "Follicular",
      mood: 7.8,
      energy: 8.2,
      sleep: 7.9,
      journaling: 6.1,
      selfCare: 6.5,
      socialConnection: 8.9,
    },
    {
      phase: "Ovulatory",
      mood: 8.9,
      energy: 9.1,
      sleep: 8.1,
      journaling: 5.2,
      selfCare: 5.8,
      socialConnection: 9.5,
    },
    {
      phase: "Luteal",
      mood: 6.1,
      energy: 5.8,
      sleep: 6.8,
      journaling: 7.9,
      selfCare: 8.2,
      socialConnection: 6.1,
    },
  ];

  // Journaling pattern insights
  const journalingInsights = [
    {
      pattern: "Increased frequency during luteal phase",
      strength: "Strong",
      insight:
        "You journal 40% more during PMS, using it as emotional processing",
    },
    {
      pattern: "Longer entries when mood is low",
      strength: "Moderate",
      insight: "Low mood days average 350+ words vs 180 words on good days",
    },
    {
      pattern: "More gratitude mentions in follicular phase",
      strength: "Moderate",
      insight: "Gratitude language peaks during rising estrogen phase",
    },
  ];

  const getCorrelationStrength = (value) => {
    if (value >= 0.7)
      return { label: "Strong", color: "text-green-600", bg: "bg-green-50" };
    if (value >= 0.4)
      return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Weak", color: "text-red-600", bg: "bg-red-50" };
  };

  const getSignificanceIcon = (significance) => {
    switch (significance) {
      case "high":
        return CheckCircle;
      case "medium":
        return Info;
      case "low":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Wellness Correlations
              </h2>
              <p className="text-gray-600">
                Discover connections between your cycle and well-being
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-600">
              {
                correlationStrengths.filter((c) => c.significance === "high")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Strong Correlations</div>
          </div>
        </div>

        {/* Quick Correlation Overview */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {correlationStrengths.map((corr, index) => {
            const strength = getCorrelationStrength(corr.value);
            return (
              <div
                key={index}
                className="bg-white/70 rounded-lg p-3 text-center"
              >
                <div className="text-lg font-semibold text-gray-900">
                  {corr.value.toFixed(2)}
                </div>
                <div className={`text-xs ${strength.color}`}>
                  {strength.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlation Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "mood-cycle", label: "Mood & Cycle", icon: Heart },
            { id: "energy-patterns", label: "Energy Patterns", icon: Zap },
            { id: "sleep-cycle", label: "Sleep & Cycle", icon: Moon },
            { id: "journaling", label: "Journaling Patterns", icon: Brain },
          ].map((view) => {
            const IconComponent = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedCorrelation(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCorrelation === view.id
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm"
          >
            {showStatistics ? <EyeOff size={16} /> : <Eye size={16} />}
            Statistics
          </button>
        </div>
      </div>

      {/* Mood & Cycle Correlation */}
      {selectedCorrelation === "mood-cycle" && (
        <div className="space-y-6">
          {/* Mood Correlation Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Mood-Cycle Correlation Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={moodCycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="cycleDay" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      fill={colors.primary}
                      fillOpacity={0.3}
                      stroke={colors.primary}
                      strokeWidth={2}
                      name="Health App Mood"
                    />
                    <Line
                      type="monotone"
                      dataKey="journalMood"
                      stroke={colors.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Journal Mood"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Correlation Insights
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Strong Correlation (r = 0.84)
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      Your mood ratings in health tracking align closely with
                      journal mood analysis
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Predictable Patterns
                      </span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Mood peaks during ovulation (days 12-16) and dips during
                      menstruation
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        Journal Validation
                      </span>
                    </div>
                    <div className="text-xs text-purple-700">
                      Your written reflections consistently validate tracked
                      mood scores
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase-by-Phase Mood Analysis */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Mood Patterns by Cycle Phase
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["Menstrual", "Follicular", "Ovulatory", "Luteal"].map(
                (phase, index) => {
                  const phaseData = moodCycleData.filter(
                    (d) => d.phase === phase
                  );
                  const avgMood =
                    phaseData.reduce((sum, d) => sum + d.mood, 0) /
                    phaseData.length;
                  const phaseColors = [
                    colors.danger,
                    colors.accent,
                    colors.warning,
                    colors.secondary,
                  ];

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: phaseColors[index] }}
                        ></div>
                        <h4 className="font-medium text-gray-900">{phase}</h4>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {avgMood.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Average Mood
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(avgMood / 10) * 100}%`,
                                backgroundColor: phaseColors[index],
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Energy Patterns */}
      {selectedCorrelation === "energy-patterns" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Energy Pattern Correlations
            </h3>

            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={energyCorrelationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                <Tooltip />
                <Bar
                  dataKey="sleep"
                  fill={colors.secondary}
                  fillOpacity={0.6}
                  name="Sleep Quality"
                />
                <Line
                  type="monotone"
                  dataKey="cycleEnergy"
                  stroke={colors.primary}
                  strokeWidth={3}
                  name="Cycle Energy"
                />
                <Line
                  type="monotone"
                  dataKey="journalEnergy"
                  stroke={colors.accent}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Journal Energy"
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">r = 0.76</div>
                <div className="text-xs text-green-700">Cycle ↔ Energy</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">r = 0.68</div>
                <div className="text-xs text-blue-700">Sleep ↔ Energy</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  r = 0.71
                </div>
                <div className="text-xs text-purple-700">Journal ↔ Tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleep & Cycle */}
      {selectedCorrelation === "sleep-cycle" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Sleep Quality by Cycle Phase
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={sleepCycleData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="phase"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis
                    angle={0}
                    domain={[0, 10]}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                  />
                  <Radar
                    name="Sleep Quality"
                    dataKey="sleepQuality"
                    stroke={colors.secondary}
                    fill={colors.secondary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Sleep Duration"
                    dataKey="sleepDuration"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Sleep Insights</h4>
                <div className="space-y-3">
                  {sleepCycleData.map((phase, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {phase.phase}
                        </span>
                        <span className="text-sm text-gray-600">
                          {phase.sleepQuality.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Duration: {phase.sleepDuration.toFixed(1)}h | Symptoms:{" "}
                        {phase.symptoms.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journaling Patterns */}
      {selectedCorrelation === "journaling" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Journaling Pattern Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={phaseWellnessData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="phase" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                    <Tooltip />
                    <Bar
                      dataKey="journaling"
                      fill={colors.primary}
                      name="Journaling Frequency"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Pattern Insights
                </h4>
                <div className="space-y-3">
                  {journalingInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-900">
                          {insight.pattern}
                        </span>
                        <span className="text-xs text-blue-600">
                          {insight.strength}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        {insight.insight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Strength Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Correlation Strength Overview
        </h3>

        <div className="space-y-4">
          {correlationStrengths.map((corr, index) => {
            const IconComponent = corr.icon;
            const SignificanceIcon = getSignificanceIcon(corr.significance);
            const strength = getCorrelationStrength(corr.value);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${corr.color}20` }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: corr.color }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{corr.name}</div>
                    <div className="text-sm text-gray-600">
                      {corr.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${strength.color}`}>
                      {corr.value.toFixed(2)}
                    </div>
                    <div className={`text-xs ${strength.color}`}>
                      {strength.label}
                    </div>
                  </div>

                  <SignificanceIcon
                    className={`w-5 h-5 ${
                      corr.significance === "high"
                        ? "text-green-600"
                        : corr.significance === "medium"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {showStatistics && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">
              Statistical Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <div className="font-medium">Correlation Range</div>
                <div>-1.00 to +1.00</div>
              </div>
              <div>
                <div className="font-medium">Sample Size</div>
                <div>90+ data points</div>
              </div>
              <div>
                <div className="font-medium">Confidence Level</div>
                <div>95% (p &lt; 0.05)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Insights */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Actionable Insights
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-900 mb-1">
                Leverage Your Patterns
              </div>
              <div className="text-sm text-green-700">
                Your strong correlations show predictable patterns. Use
                ovulation energy peaks for important tasks and prepare self-care
                for luteal phase mood dips.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900 mb-1">
                Journaling as Early Warning
              </div>
              <div className="text-sm text-blue-700">
                Your increased journaling during difficult phases serves as an
                early indicator. Consider this a cue to implement extra support
                strategies.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-purple-900 mb-1">
                Sleep Optimization Strategy
              </div>
              <div className="text-sm text-purple-700">
                Focus sleep hygiene efforts during luteal phase when quality
                naturally dips. This can help minimize mood and energy impacts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCorrelationsTab;
