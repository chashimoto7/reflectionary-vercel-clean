// frontend/ src/components/womenshealth/tabs/WellnessCorrelationsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Brain,
  Heart,
  Moon,
  Coffee,
  Droplets,
  TrendingUp,
  AlertCircle,
  Info,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  CloudRain,
  Sun,
  Wind,
  Pizza,
  Apple,
  Dumbbell,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";

const WellnessCorrelationsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("sleep");
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [expandedCorrelation, setExpandedCorrelation] = useState(null);

  // Correlation data
  const [correlationData, setCorrelationData] = useState({
    sleep: {},
    exercise: {},
    nutrition: {},
    stress: {},
    social: {},
    environment: {},
  });

  const [insights, setInsights] = useState([]);
  const [strongestCorrelations, setStrongestCorrelations] = useState([]);

  // Metric definitions
  const metricDefinitions = {
    sleep: {
      name: "Sleep Quality",
      icon: Moon,
      color: colors.primary,
      unit: "hours",
      description: "How sleep patterns affect your symptoms",
    },
    exercise: {
      name: "Physical Activity",
      icon: Activity,
      color: colors.secondary,
      unit: "minutes",
      description: "Exercise impact on hormonal balance",
    },
    nutrition: {
      name: "Nutrition",
      icon: Apple,
      color: colors.emerald,
      unit: "quality score",
      description: "Diet and symptom relationships",
    },
    stress: {
      name: "Stress Levels",
      icon: Brain,
      color: colors.warning,
      unit: "level",
      description: "Stress impact on women's health",
    },
    social: {
      name: "Social Connection",
      icon: Users,
      color: colors.accent,
      unit: "interactions",
      description: "Social support and well-being",
    },
    environment: {
      name: "Environmental",
      icon: Sun,
      color: colors.amber,
      unit: "index",
      description: "Weather and environmental factors",
    },
  };

  useEffect(() => {
    loadCorrelationData();
    setTimeout(() => setLoading(false), 1000);
  }, [selectedTimeRange, lifeStage]);

  const loadCorrelationData = () => {
    // Mock data - will be replaced with database calls
    setCorrelationData({
      sleep: generateSleepCorrelations(),
      exercise: generateExerciseCorrelations(),
      nutrition: generateNutritionCorrelations(),
      stress: generateStressCorrelations(),
      social: generateSocialCorrelations(),
      environment: generateEnvironmentCorrelations(),
    });

    generateInsights();
    findStrongestCorrelations();
  };

  const generateSleepCorrelations = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      data.push({
        date: format(subDays(new Date(), i), "MMM d"),
        sleepHours: 5 + Math.random() * 4,
        sleepQuality: Math.floor(Math.random() * 5) + 1,
        hotFlashes: Math.floor(Math.random() * 8),
        moodScore: Math.floor(Math.random() * 5) + 1,
        energyLevel: Math.floor(Math.random() * 5) + 1,
        symptoms: Math.floor(Math.random() * 6),
      });
    }

    return {
      correlation: -0.72,
      data: data,
      insights: [
        "7+ hours of sleep reduces hot flash frequency by 45%",
        "Poor sleep quality increases mood swings by 60%",
        "Consistent sleep schedule improves energy levels",
      ],
    };
  };

  const generateExerciseCorrelations = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      data.push({
        date: format(subDays(new Date(), i), "MMM d"),
        exerciseMinutes: Math.floor(Math.random() * 60),
        intensity: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
        symptoms: Math.floor(Math.random() * 5) + 1,
        mood: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
      });
    }

    return {
      correlation: -0.65,
      data: data,
      insights: [
        "30+ minutes of moderate exercise reduces symptoms by 40%",
        "Morning exercise correlates with better mood throughout the day",
        "Strength training shows strongest correlation with symptom relief",
      ],
    };
  };

  const generateNutritionCorrelations = () => {
    return {
      correlation: -0.58,
      data: generateMockData(30),
      insights: [
        "High caffeine intake correlates with increased hot flashes",
        "Mediterranean diet pattern shows 35% symptom reduction",
        "Regular meal timing improves energy stability",
      ],
    };
  };

  const generateStressCorrelations = () => {
    return {
      correlation: 0.82,
      data: generateMockData(30),
      insights: [
        "High stress days show 85% increase in symptom severity",
        "Stress management techniques reduce hot flashes by 50%",
        "Work stress particularly impacts sleep quality",
      ],
    };
  };

  const generateSocialCorrelations = () => {
    return {
      correlation: -0.45,
      data: generateMockData(30),
      insights: [
        "Social support correlates with 30% better symptom management",
        "Isolation increases mood symptom severity",
        "Group activities show positive impact on well-being",
      ],
    };
  };

  const generateEnvironmentCorrelations = () => {
    return {
      correlation: 0.35,
      data: generateMockData(30),
      insights: [
        "High humidity increases hot flash frequency by 25%",
        "Temperature changes trigger symptoms in 60% of tracking",
        "Seasonal patterns evident in mood and energy levels",
      ],
    };
  };

  const generateMockData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: format(subDays(new Date(), i), "MMM d"),
        value: Math.random() * 100,
        symptoms: Math.floor(Math.random() * 5) + 1,
      });
    }
    return data;
  };

  const generateInsights = () => {
    const insights = [
      {
        type: "strong",
        title: "Sleep is Your Superpower",
        description:
          "Your data shows the strongest correlation between sleep quality and symptom severity",
        metric: "sleep",
        impact: -72,
      },
      {
        type: "warning",
        title: "Stress Alert",
        description:
          "Stress levels show the highest positive correlation with symptom flare-ups",
        metric: "stress",
        impact: 82,
      },
      {
        type: "opportunity",
        title: "Exercise Opportunity",
        description:
          "Increasing exercise by just 15 minutes could reduce symptoms by 20%",
        metric: "exercise",
        impact: -65,
      },
    ];

    setInsights(insights);
  };

  const findStrongestCorrelations = () => {
    const correlations = [
      { name: "Stress → Symptoms", value: 0.82, negative: false },
      { name: "Sleep → Well-being", value: 0.72, negative: true },
      { name: "Exercise → Mood", value: 0.65, negative: true },
      { name: "Nutrition → Energy", value: 0.58, negative: true },
      { name: "Social → Mood", value: 0.45, negative: true },
    ];

    setStrongestCorrelations(correlations);
  };

  const getCorrelationStrength = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return { label: "Strong", color: "text-green-400" };
    if (absValue >= 0.5) return { label: "Moderate", color: "text-yellow-400" };
    if (absValue >= 0.3) return { label: "Weak", color: "text-orange-400" };
    return { label: "Very Weak", color: "text-red-400" };
  };

  const getCorrelationIcon = (value) => {
    if (value > 0.3) return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    if (value < -0.3)
      return <ArrowDownRight className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Analyzing wellness correlations...</p>
      </div>
    );
  }

  const selectedMetricData = correlationData[selectedMetric];
  const MetricIcon = metricDefinitions[selectedMetric].icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Wellness Correlations
        </h3>
        <div className="flex gap-2">
          {["week", "month", "3months"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedTimeRange === range
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              {range === "3months"
                ? "3 Months"
                : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`
              bg-gradient-to-br rounded-xl p-6 border
              ${
                insight.type === "strong"
                  ? "from-green-600/20 to-emerald-600/20 border-green-500/30"
                  : insight.type === "warning"
                  ? "from-red-600/20 to-orange-600/20 border-red-500/30"
                  : "from-blue-600/20 to-purple-600/20 border-blue-500/30"
              }
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  insight.type === "strong"
                    ? "bg-green-600/30"
                    : insight.type === "warning"
                    ? "bg-red-600/30"
                    : "bg-blue-600/30"
                }
              `}
              >
                {React.createElement(metricDefinitions[insight.metric].icon, {
                  className: "w-5 h-5 text-white",
                })}
              </div>
              <span className={`text-2xl font-bold text-white`}>
                {Math.abs(insight.impact)}%
              </span>
            </div>
            <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
            <p className="text-purple-200 text-sm">{insight.description}</p>
          </div>
        ))}
      </div>

      {/* Metric Selector */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(metricDefinitions).map(([key, metric]) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`
                  p-4 rounded-lg transition-all flex flex-col items-center gap-2
                  ${
                    isSelected
                      ? "bg-purple-600/30 border-2 border-purple-400"
                      : "bg-white/10 border-2 border-transparent hover:bg-white/20"
                  }
                `}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? "text-white" : "text-purple-300"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-purple-200"
                  }`}
                >
                  {metric.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MetricIcon className="w-5 h-5 text-purple-300" />
              {metricDefinitions[selectedMetric].name} vs Symptoms
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-200">Correlation:</span>
              <span
                className={`text-lg font-bold ${
                  selectedMetricData.correlation > 0
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {(selectedMetricData.correlation * 100).toFixed(0)}%
              </span>
              {getCorrelationIcon(selectedMetricData.correlation)}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="value"
                  name={metricDefinitions[selectedMetric].name}
                  stroke="#fff"
                  opacity={0.6}
                />
                <YAxis
                  dataKey="symptoms"
                  name="Symptom Severity"
                  stroke="#fff"
                  opacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter
                  name="Data Points"
                  data={selectedMetricData.data}
                  fill={metricDefinitions[selectedMetric].color}
                />
                <ReferenceLine
                  stroke="#fff"
                  strokeDasharray="5 5"
                  opacity={0.3}
                  segment={[
                    { x: 0, y: 5 },
                    { x: 100, y: selectedMetricData.correlation > 0 ? 1 : 5 },
                  ]}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm text-purple-200">
              <Info className="w-4 h-4 inline mr-1" />
              {metricDefinitions[selectedMetric].description}
            </p>
          </div>
        </div>

        {/* Correlation Insights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Key Findings
          </h3>

          <div className="space-y-3">
            {selectedMetricData.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-200">{insight}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-600/20 rounded-lg">
            <h4 className="text-white font-medium mb-2">
              Correlation Strength
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-200 text-sm">This metric</span>
                <span
                  className={`font-medium ${
                    getCorrelationStrength(selectedMetricData.correlation).color
                  }`}
                >
                  {getCorrelationStrength(selectedMetricData.correlation).label}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${
                    selectedMetricData.correlation > 0
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.abs(selectedMetricData.correlation) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strongest Correlations */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Strongest Correlations Found
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {strongestCorrelations.map((corr, index) => (
            <div key={index} className="text-center">
              <div className="mb-2">
                <div className="text-3xl font-bold text-white">
                  {(corr.value * 100).toFixed(0)}%
                </div>
                <div
                  className={`text-sm ${
                    corr.negative ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {corr.negative ? "Reduces symptoms" : "Increases symptoms"}
                </div>
              </div>
              <p className="text-sm text-purple-200">{corr.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Factor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Impact */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Combined Factor Impact
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={[
                  { factor: "Sleep", impact: 72 },
                  { factor: "Exercise", impact: 65 },
                  { factor: "Nutrition", impact: 58 },
                  { factor: "Stress", impact: 82 },
                  { factor: "Social", impact: 45 },
                  { factor: "Environment", impact: 35 },
                ]}
              >
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis
                  dataKey="factor"
                  stroke="#fff"
                  tick={{ fill: "#fff" }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  stroke="#fff"
                  tick={{ fill: "#fff" }}
                />
                <Radar
                  name="Impact"
                  dataKey="impact"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Personalized Recommendations
          </h3>

          <div className="space-y-3">
            <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">
                    Priority: Improve Sleep
                  </h4>
                  <p className="text-sm text-green-200">
                    Focus on getting 7-9 hours of quality sleep. This alone
                    could reduce symptoms by up to 45%.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">
                    Quick Win: Daily Walk
                  </h4>
                  <p className="text-sm text-yellow-200">
                    Add a 20-minute walk to see immediate mood and energy
                    improvements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">Manage Stress</h4>
                  <p className="text-sm text-purple-200">
                    Try meditation or deep breathing. Stress shows the highest
                    correlation with symptoms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600/30 rounded-full p-3">
            <BarChart3 className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">
              Your Wellness Action Plan
            </h4>
            <p className="text-purple-200 mb-4">
              Based on your correlation analysis, here's your personalized
              action plan:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">This Week</h5>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Track sleep consistently</li>
                  <li>• Add 10 min meditation</li>
                  <li>• Monitor trigger foods</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Next Month</h5>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Establish exercise routine</li>
                  <li>• Optimize sleep schedule</li>
                  <li>• Join support group</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Long Term</h5>
                <ul className="space-y-1 text-sm text-purple-200">
                  <li>• Maintain healthy habits</li>
                  <li>• Regular health checks</li>
                  <li>• Adapt as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCorrelationsTab;
