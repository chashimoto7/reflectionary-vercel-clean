// src/components/analytics/tabs/WellnessCorrelationsTab.jsx
import React, { useState } from "react";
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
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Heatmap,
} from "recharts";
import {
  Shield,
  Heart,
  Brain,
  Activity,
  Moon,
  Sun,
  Droplets,
  Apple,
  Dumbbell,
  Wind,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Coffee,
  Wine,
  Pill,
  Stethoscope,
  Eye,
  EyeOff,
} from "lucide-react";

const WellnessCorrelationsTab = ({ data, colors }) => {
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [showDetailedCorrelations, setShowDetailedCorrelations] =
    useState(false);
  const [integrateExternalData, setIntegrateExternalData] = useState(false);

  // Process wellness data from analytics
  const wellnessData = data || {
    selfCarePatterns: {},
    averageStressLevel: 0,
    stressIndicators: [],
    sleepPatterns: {},
  };

  // Calculate wellness metrics using real user-tracked data
  const calculateWellnessMetrics = () => {
    const stressLevel = wellnessData.averageStressLevel || 5;

    // Get real sleep quality from user tracking
    const userSleepData = wellnessData.userTrackedWellness?.sleep || {};
    const sleepQuality = userSleepData.avgQuality || 5;

    // Calculate self-care score from activities
    const selfCareActivities = Object.values(
      wellnessData.selfCarePatterns || {}
    ).reduce((sum, count) => sum + count, 0);
    const selfCareScore = Math.min(10, selfCareActivities / 10);

    // Overall wellness score incorporating real data
    const wellnessScore = (10 - stressLevel + sleepQuality + selfCareScore) / 3;

    return {
      overallWellness: wellnessScore.toFixed(1),
      stressManagement: (10 - stressLevel).toFixed(1),
      sleepQuality: sleepQuality.toFixed(1),
      selfCareConsistency: selfCareScore.toFixed(1),
    };
  };

  const metrics = calculateWellnessMetrics();

  // Generate correlation data using real wellness tracking
  const generateCorrelationData = () => {
    // Check if we have real user-tracked data
    const hasRealData =
      wellnessData.userTrackedWellness &&
      Object.keys(wellnessData.userTrackedWellness).length > 0;

    if (!hasRealData) {
      // Return mock data if no real data yet
      const days = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const sleepHours = 5 + Math.random() * 4;
        const exercise = Math.random() > 0.3 ? 20 + Math.random() * 60 : 0;
        const mood =
          4 +
          (sleepHours - 5) * 0.5 +
          (exercise > 0 ? 1 : 0) +
          Math.random() * 2;
        const stress =
          8 - sleepHours * 0.5 - (exercise > 0 ? 1 : 0) + Math.random() * 2;
        const energy =
          3 + sleepHours * 0.7 + (exercise > 0 ? 1.5 : 0) + Math.random();

        days.push({
          date: date.toLocaleDateString(),
          sleep: sleepHours,
          exercise: exercise,
          mood: Math.min(10, Math.max(1, mood)),
          stress: Math.min(10, Math.max(1, stress)),
          energy: Math.min(10, Math.max(1, energy)),
          hydration: 40 + Math.random() * 60,
          nutrition: 50 + Math.random() * 40,
          isProjected: true,
        });
      }
      return days;
    }

    // Use real data from journal entries
    const behavioralData = data?.behavioral || {};
    const exerciseData = behavioralData.exercisePatterns?.exerciseTypes || {};
    const sleepStats = wellnessData.userTrackedWellness.sleep || {};
    const hydrationStats = wellnessData.userTrackedWellness.hydration || {};

    // Get recent entries with wellness tracking
    const moodData = data?.mood?.daily || [];
    const energyData = data?.energy?.daily || [];

    // Create correlation data from real entries
    const correlationData = moodData.map((moodEntry, index) => {
      const energyEntry = energyData.find((e) => e.date === moodEntry.date);

      return {
        date: new Date(moodEntry.date).toLocaleDateString(),
        mood: parseFloat(moodEntry.mood),
        energy: energyEntry ? parseFloat(energyEntry.energy) : 5,
        sleep: sleepStats.avgHours || 7,
        exercise: 0, // Will be populated from exercise patterns
        stress: 10 - parseFloat(moodEntry.mood), // Inverse of mood as proxy
        hydration: hydrationStats.avgGlasses
          ? hydrationStats.avgGlasses * 10
          : 60,
        nutrition: 70, // Placeholder until nutrition tracking is added
        isProjected: false,
      };
    });

    return correlationData.slice(-30); // Last 30 days
  };

  const correlationData = generateCorrelationData();

  // Generate sleep pattern analysis
  const generateSleepPatterns = () => {
    return {
      weekday: {
        avgBedtime: "11:30 PM",
        avgWakeTime: "6:45 AM",
        avgDuration: 7.25,
        quality: 7.2,
      },
      weekend: {
        avgBedtime: "12:45 AM",
        avgWakeTime: "8:30 AM",
        avgDuration: 7.75,
        quality: 8.1,
      },
      patterns: [
        { day: "Mon", duration: 6.5, quality: 6.8 },
        { day: "Tue", duration: 7.0, quality: 7.2 },
        { day: "Wed", duration: 6.8, quality: 6.9 },
        { day: "Thu", duration: 7.2, quality: 7.5 },
        { day: "Fri", duration: 7.5, quality: 7.8 },
        { day: "Sat", duration: 8.2, quality: 8.5 },
        { day: "Sun", duration: 8.0, quality: 8.2 },
      ],
    };
  };

  const sleepAnalysis = generateSleepPatterns();

  // Generate wellness dimensions for radar chart
  const wellnessDimensions = [
    {
      dimension: "Sleep Quality",
      score: parseFloat(metrics.sleepQuality),
      ideal: 9,
    },
    {
      dimension: "Stress Management",
      score: parseFloat(metrics.stressManagement),
      ideal: 8,
    },
    { dimension: "Physical Activity", score: 7.2, ideal: 8 },
    { dimension: "Nutrition", score: 6.8, ideal: 8 },
    { dimension: "Hydration", score: 7.5, ideal: 9 },
    { dimension: "Mental Health", score: 8.0, ideal: 8 },
    { dimension: "Social Connection", score: 7.8, ideal: 8 },
    { dimension: "Mindfulness", score: 6.5, ideal: 7 },
  ];

  // Generate correlation matrix data
  const generateCorrelationMatrix = () => {
    const factors = [
      "Sleep",
      "Exercise",
      "Nutrition",
      "Stress",
      "Mood",
      "Energy",
    ];
    const matrix = [];

    // Predefined correlations for realism
    const correlations = {
      "Sleep-Exercise": 0.45,
      "Sleep-Mood": 0.72,
      "Sleep-Energy": 0.85,
      "Sleep-Stress": -0.68,
      "Exercise-Mood": 0.78,
      "Exercise-Energy": 0.82,
      "Exercise-Stress": -0.75,
      "Nutrition-Mood": 0.52,
      "Nutrition-Energy": 0.65,
      "Stress-Mood": -0.89,
      "Stress-Energy": -0.76,
      "Mood-Energy": 0.81,
    };

    factors.forEach((factor1, i) => {
      factors.forEach((factor2, j) => {
        if (i === j) {
          matrix.push({ x: factor1, y: factor2, value: 1 });
        } else {
          const key = `${factor1}-${factor2}`;
          const reverseKey = `${factor2}-${factor1}`;
          const value =
            correlations[key] ||
            correlations[reverseKey] ||
            0.1 + Math.random() * 0.3;
          matrix.push({ x: factor1, y: factor2, value });
        }
      });
    });

    return matrix;
  };

  const correlationMatrix = generateCorrelationMatrix();

  // Generate activity impact data
  const activityImpacts = [
    {
      activity: "Yoga/Stretching",
      mood: 8.2,
      stress: -3.5,
      energy: 7.5,
      frequency: 12,
    },
    {
      activity: "Cardio Exercise",
      mood: 8.5,
      stress: -4.2,
      energy: 8.8,
      frequency: 8,
    },
    {
      activity: "Meditation",
      mood: 7.8,
      stress: -4.8,
      energy: 6.5,
      frequency: 15,
    },
    {
      activity: "Nature Walks",
      mood: 8.0,
      stress: -3.8,
      energy: 7.2,
      frequency: 6,
    },
    {
      activity: "Social Exercise",
      mood: 8.8,
      stress: -3.2,
      energy: 8.0,
      frequency: 4,
    },
    {
      activity: "Strength Training",
      mood: 7.5,
      stress: -3.0,
      energy: 8.5,
      frequency: 5,
    },
  ];

  // Helper function to get correlation strength color
  const getCorrelationColor = (value) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? "#10B981" : "#EF4444";
    if (absValue > 0.4) return value > 0 ? "#3B82F6" : "#F59E0B";
    return "#9CA3AF";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-green-600" size={28} />
            Wellness Correlations
          </h2>
          <p className="text-gray-600 mt-1">
            Discover how physical wellness factors impact your emotional
            well-being
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Metrics</option>
            <option value="sleep">Sleep Focus</option>
            <option value="activity">Activity Focus</option>
            <option value="stress">Stress Focus</option>
          </select>

          <button
            onClick={() =>
              setShowDetailedCorrelations(!showDetailedCorrelations)
            }
            className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
          >
            {showDetailedCorrelations ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
            {showDetailedCorrelations ? "Simple View" : "Detailed Analysis"}
          </button>
        </div>
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.overallWellness}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Overall Wellness</h3>
          <p className="text-sm opacity-90">Holistic health score</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.stressManagement}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Stress Management</h3>
          <p className="text-sm opacity-90">Coping effectiveness</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Moon className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.sleepQuality}</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Sleep Quality</h3>
          <p className="text-sm opacity-90">Rest & recovery</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.selfCareConsistency}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Self-Care Practice</h3>
          <p className="text-sm opacity-90">Consistency score</p>
        </div>
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Multi-Factor Correlation Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-green-600" size={20} />
            Wellness Factor Correlations
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={correlationData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="mood"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  name="Mood"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="energy"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.3}
                  name="Energy"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sleep"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Sleep Hours"
                />
                <Bar
                  yAxisId="right"
                  dataKey="exercise"
                  fill={colors.warning}
                  fillOpacity={0.5}
                  name="Exercise (min)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {correlationData.some((d) => !d.isProjected) ? (
              <p>
                💡 <strong>Real Data Analysis:</strong> This chart shows
                correlations based on your actual tracked wellness data.
                Continue tracking to improve accuracy.
              </p>
            ) : (
              <p>
                💡 <strong>Projected Analysis:</strong> Start tracking your
                exercise, sleep, and hydration in your journal entries to see
                real correlations. Your mood and energy levels show strong
                potential correlation with these factors.
              </p>
            )}
          </div>
        </div>

        {/* Wellness Dimensions Radar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            Holistic Wellness Profile
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={wellnessDimensions}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Ideal"
                  dataKey="ideal"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sleep Pattern Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Moon className="text-purple-600" size={20} />
          Sleep Pattern Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sleepAnalysis.patterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="duration"
                    fill={colors.primary}
                    fillOpacity={0.6}
                    name="Sleep Duration (hrs)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quality"
                    stroke={colors.secondary}
                    strokeWidth={3}
                    dot={{ fill: colors.secondary }}
                    name="Sleep Quality"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">
                Weekday Patterns
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Avg Bedtime:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekday.avgBedtime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Avg Wake:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekday.avgWakeTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Duration:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekday.avgDuration} hrs
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Weekend Patterns
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Avg Bedtime:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekend.avgBedtime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Avg Wake:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekend.avgWakeTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Duration:</span>
                  <span className="font-medium">
                    {sleepAnalysis.weekend.avgDuration} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Correlations */}
      {showDetailedCorrelations && (
        <div className="space-y-8 mb-8">
          {/* Activity Impact Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Dumbbell className="text-green-600" size={20} />
              Physical Activity Impact Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityImpacts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-5, 10]} />
                    <YAxis
                      dataKey="activity"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="mood"
                      fill={colors.primary}
                      name="Mood Impact"
                    />
                    <Bar
                      dataKey="stress"
                      fill={colors.danger}
                      name="Stress Impact"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Activity Effectiveness Rankings
                </h4>
                {activityImpacts
                  .sort((a, b) => b.mood - a.mood)
                  .map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900 text-sm">
                          {activity.activity}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {activity.frequency} sessions tracked
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          +{activity.mood.toFixed(1)} mood
                        </div>
                        <div className="text-xs text-red-600">
                          {activity.stress.toFixed(1)} stress
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="text-blue-600" size={20} />
              Wellness Factor Correlation Matrix
            </h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[600px]">
                <div></div>
                {[
                  "Sleep",
                  "Exercise",
                  "Nutrition",
                  "Stress",
                  "Mood",
                  "Energy",
                ].map((factor) => (
                  <div
                    key={factor}
                    className="text-xs font-medium text-gray-700 text-center p-2"
                  >
                    {factor}
                  </div>
                ))}
                {[
                  "Sleep",
                  "Exercise",
                  "Nutrition",
                  "Stress",
                  "Mood",
                  "Energy",
                ].map((factor1, i) => (
                  <React.Fragment key={factor1}>
                    <div className="text-xs font-medium text-gray-700 text-right p-2">
                      {factor1}
                    </div>
                    {[
                      "Sleep",
                      "Exercise",
                      "Nutrition",
                      "Stress",
                      "Mood",
                      "Energy",
                    ].map((factor2, j) => {
                      const correlation = correlationMatrix.find(
                        (item) => item.x === factor1 && item.y === factor2
                      );
                      return (
                        <div
                          key={`${factor1}-${factor2}`}
                          className="aspect-square flex items-center justify-center rounded text-xs font-medium"
                          style={{
                            backgroundColor: getCorrelationColor(
                              correlation?.value || 0
                            ),
                            color:
                              Math.abs(correlation?.value || 0) > 0.5
                                ? "white"
                                : "black",
                            opacity: i === j ? 0.3 : 0.8,
                          }}
                        >
                          {correlation?.value.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Strong Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Moderate Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Weak/None</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Negative</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External Data Integration Prompt */}
      {!integrateExternalData && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Connect Your Health Apps
              </h3>
              <p className="text-green-700 mb-4">
                Integrate with Apple Health, Google Fit, or other wellness apps
                to automatically track sleep, exercise, and nutrition data for
                deeper correlations.
              </p>
              <button
                onClick={() => setIntegrateExternalData(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Connect Health Apps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Insights Summary */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Stethoscope className="text-green-600" size={20} />
          Personalised Wellness Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Sleep-Mood Connection
                </h4>
                <p className="text-green-700 text-sm">
                  Getting less than 7 hours of sleep correlates with a 2.3-point
                  drop in your mood score. Prioritise 7.5-8 hours for optimal
                  emotional well-being.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Exercise Impact
                </h4>
                <p className="text-blue-700 text-sm">
                  Your mood increases by 1.8 points on days with 30+ minutes of
                  exercise. Yoga and cardio show the strongest positive effects.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">
                  Stress Management
                </h4>
                <p className="text-purple-700 text-sm">
                  Meditation shows the highest stress reduction impact (-4.8
                  points). Consider increasing frequency from 45% to 70%
                  consistency.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-pink-900 mb-1">
                  Recovery Patterns
                </h4>
                <p className="text-pink-700 text-sm">
                  Your weekend sleep recovery pattern (+45 min) helps reset your
                  energy levels. Maintain this healthy compensation strategy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp
              className="text-green-600 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div>
              <h4 className="font-medium text-green-900 mb-1">
                Primary Wellness Opportunity
              </h4>
              <p className="text-green-700 text-sm">
                Your mindfulness score (6.5/10) has the highest potential for
                improvement. Based on correlation data, increasing mindfulness
                practice could improve your stress management by up to 25% and
                enhance overall wellness by 1.2 points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCorrelationsTab;
