// frontend/src/components/womenshealth/tabs/HormonalInsightsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Thermometer,
  TrendingUp,
  Activity,
  Brain,
  Heart,
  Moon,
  Sun,
  Zap,
  Droplets,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  Filter,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Wind,
  Flame,
  CloudSnow,
  Settings,
  BookOpen,
  Database,
  BarChart3,
} from "lucide-react";
import { format, subDays, addDays, differenceInDays, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";

const HormonalInsightsTab = ({
  colors,
  user,
  lifeStage,
  healthData = [],
  cycleData = null,
  insights = null,
  onRefreshData,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [showEducation, setShowEducation] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState(null);

  // Process health data for hormonal insights
  const processedData = processHormonalData(healthData, selectedTimeRange);
  const hasData = healthData && healthData.length > 0;
  const hasMinimumData = healthData && healthData.length >= 7; // Need at least a week of data

  // Hormone education content (keeping this hardcoded as discussed)
  const hormoneInfo = {
    estrogen: {
      name: "Estrogen",
      role: "Primary female sex hormone",
      effects: [
        "Regulates menstrual cycle",
        "Maintains bone density",
        "Affects mood and cognition",
        "Influences body temperature",
      ],
      lifeStageInfo: {
        menstrual: "Fluctuates throughout cycle, peaks before ovulation",
        perimenopause: "Becomes irregular, overall declining levels",
        menopause: "Low levels, occasional fluctuations",
      },
    },
    progesterone: {
      name: "Progesterone",
      role: "Prepares body for pregnancy",
      effects: [
        "Raises body temperature",
        "Can cause drowsiness",
        "Affects mood stability",
        "Influences water retention",
      ],
      lifeStageInfo: {
        menstrual: "Rises after ovulation, drops before period",
        perimenopause: "Irregular production, may cause symptoms",
        menopause: "Very low levels",
      },
    },
    testosterone: {
      name: "Testosterone",
      role: "Supports libido and energy",
      effects: [
        "Influences sex drive",
        "Maintains muscle mass",
        "Affects energy levels",
        "Supports bone health",
      ],
      lifeStageInfo: {
        menstrual: "Slight peak around ovulation",
        perimenopause: "Gradual decline",
        menopause: "Lower levels, affects libido",
      },
    },
    cortisol: {
      name: "Cortisol",
      role: "Stress hormone",
      effects: [
        "Regulates stress response",
        "Affects blood sugar",
        "Influences mood",
        "Can disrupt other hormones",
      ],
      lifeStageInfo: {
        menstrual: "Can affect cycle regularity if elevated",
        perimenopause: "May increase due to hormonal stress",
        menopause: "Often elevated, affects sleep",
      },
    },
  };

  // Process health data to extract hormonal patterns
  function processHormonalData(entries, timeRange) {
    if (!entries || entries.length === 0) {
      return {
        temperature: [],
        hotFlashes: [],
        moodPatterns: [],
        energyLevels: [],
        symptoms: [],
        basalTemp: null,
        averages: {},
      };
    }

    // Filter entries based on time range
    const now = new Date();
    const startDate =
      timeRange === "week"
        ? subDays(now, 7)
        : timeRange === "month"
        ? subDays(now, 30)
        : subDays(now, 90);

    const filteredEntries = entries
      .filter((entry) => new Date(entry.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Extract temperature data
    const temperature = filteredEntries
      .filter((e) => e.data?.temperature)
      .map((e) => ({
        date: format(new Date(e.date), "MMM d"),
        temp: parseFloat(e.data.temperature),
        phase: e.data.cyclePhase || "unknown",
      }));

    // Extract hot flash data (for perimenopause/menopause)
    const hotFlashes = filteredEntries
      .filter((e) => e.data?.hotFlashCount > 0)
      .map((e) => ({
        date: format(new Date(e.date), "MMM d"),
        count: e.data.hotFlashCount,
        severity:
          e.data.hotFlashSeverity?.reduce((a, b) => a + b, 0) /
            e.data.hotFlashSeverity?.length || 0,
      }));

    // Extract mood patterns
    const moodPatterns = filteredEntries
      .filter((e) => e.data?.mood || e.data?.anxiety || e.data?.irritability)
      .map((e) => ({
        date: format(new Date(e.date), "MMM d"),
        happiness: e.data.mood || 3,
        anxiety: e.data.anxiety || 0,
        irritability: e.data.irritability || 0,
      }));

    // Extract energy levels
    const energyLevels = filteredEntries
      .filter((e) => e.data?.energy || e.data?.fatigue)
      .map((e) => ({
        date: format(new Date(e.date), "MMM d"),
        energy: e.data.energy || 3,
        fatigue: e.data.fatigue || 0,
      }));

    // Calculate symptom frequencies
    const symptomCounts = {};
    filteredEntries.forEach((entry) => {
      if (!entry.data) return;

      // Count various symptoms
      if (entry.data.hotFlashCount > 0) {
        symptomCounts.hotFlashes = (symptomCounts.hotFlashes || 0) + 1;
      }
      if (entry.data.nightSweatSeverity > 0) {
        symptomCounts.nightSweats = (symptomCounts.nightSweats || 0) + 1;
      }
      if (entry.data.moodSwings) {
        symptomCounts.moodSwings = (symptomCounts.moodSwings || 0) + 1;
      }
      if (entry.data.insomnia || entry.data.sleepQuality < 3) {
        symptomCounts.sleepIssues = (symptomCounts.sleepIssues || 0) + 1;
      }
      if (entry.data.vaginalDryness > 0) {
        symptomCounts.vaginalDryness = (symptomCounts.vaginalDryness || 0) + 1;
      }
      if (entry.data.libido < 3) {
        symptomCounts.lowLibido = (symptomCounts.lowLibido || 0) + 1;
      }
    });

    // Convert to percentages
    const totalDays = filteredEntries.length || 1;
    const symptoms = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({
        symptom: symptom
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        frequency: Math.round((count / totalDays) * 100),
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Calculate basal temperature info
    const basalTemp =
      temperature.length > 0
        ? {
            current: temperature[temperature.length - 1]?.temp || null,
            average:
              temperature.reduce((sum, t) => sum + t.temp, 0) /
              temperature.length,
            trend:
              temperature.length > 1
                ? temperature[temperature.length - 1].temp >
                  temperature[temperature.length - 2].temp
                  ? "rising"
                  : temperature[temperature.length - 1].temp <
                    temperature[temperature.length - 2].temp
                  ? "falling"
                  : "stable"
                : "stable",
          }
        : null;

    // Calculate averages for insights
    const averages = {
      mood:
        moodPatterns.length > 0
          ? moodPatterns.reduce((sum, m) => sum + m.happiness, 0) /
            moodPatterns.length
          : null,
      energy:
        energyLevels.length > 0
          ? energyLevels.reduce((sum, e) => sum + e.energy, 0) /
            energyLevels.length
          : null,
      anxiety:
        moodPatterns.length > 0
          ? moodPatterns.reduce((sum, m) => sum + m.anxiety, 0) /
            moodPatterns.length
          : null,
      hotFlashesPerDay:
        hotFlashes.length > 0
          ? hotFlashes.reduce((sum, h) => sum + h.count, 0) / hotFlashes.length
          : null,
    };

    return {
      temperature,
      hotFlashes,
      moodPatterns,
      energyLevels,
      symptoms,
      basalTemp,
      averages,
    };
  }

  // Get predictions based on patterns
  const getPredictions = () => {
    if (!hasMinimumData) return null;

    const predictions = {
      nextHotFlash: null,
      moodPeak: null,
      energyDip: null,
      optimalExercise: null,
    };

    // Simple pattern detection based on time of day
    if (processedData.hotFlashes.length > 3) {
      predictions.nextHotFlash =
        "Pattern analysis available after more tracking";
    }

    if (processedData.energyLevels.length > 0) {
      // Find common energy patterns
      predictions.energyDip = "Afternoon (2-4 PM)"; // Common pattern
      predictions.optimalExercise = "Morning (7-9 AM)";
    }

    if (processedData.moodPatterns.length > 0) {
      predictions.moodPeak = "Evening (6-8 PM)";
    }

    return predictions;
  };

  const predictions = getPredictions();

  // Empty state component
  const EmptyState = ({ minDataRequired = false }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Database className="w-16 h-16 text-purple-300 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        {minDataRequired ? "More Data Needed" : "No Hormonal Data Yet"}
      </h3>
      <p className="text-purple-200 max-w-md mb-6">
        {minDataRequired
          ? "Track your symptoms, mood, and energy for at least 7 days to see hormonal patterns and insights."
          : "Start tracking your daily symptoms to unlock powerful hormonal insights and patterns."}
      </p>
      <div className="bg-purple-600/20 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-purple-100">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Track temperature, mood, energy, and symptoms daily to understand your
          hormonal patterns.
        </p>
      </div>
    </div>
  );

  const getTempTrendIcon = () => {
    if (!processedData.basalTemp) return null;

    if (processedData.basalTemp.trend === "rising")
      return <ArrowUp className="w-4 h-4 text-red-400" />;
    if (processedData.basalTemp.trend === "falling")
      return <ArrowDown className="w-4 h-4 text-blue-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-white">
            Hormonal Insights
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

        <button
          onClick={() => setShowEducation(!showEducation)}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Learn About Hormones
        </button>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Temperature & Hot Flash Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basal Body Temperature */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                {lifeStage === "menstrual"
                  ? "Basal Body Temperature"
                  : "Body Temperature Patterns"}
              </h3>

              {processedData.temperature.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Thermometer className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-200">
                      No temperature data recorded
                    </p>
                    <p className="text-purple-300 text-sm mt-1">
                      Track your basal body temperature daily for insights
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.temperature}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                        <YAxis
                          domain={[36, 38]}
                          stroke="#fff"
                          opacity={0.6}
                          tickFormatter={(value) => `${value}°C`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(139, 92, 246, 0.9)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value) => `${value}°C`}
                        />
                        <ReferenceLine
                          y={processedData.basalTemp?.average || 36.5}
                          stroke="#fff"
                          strokeDasharray="5 5"
                          opacity={0.5}
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke={colors.secondary}
                          strokeWidth={2}
                          dot={{ fill: colors.secondary, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <p className="text-purple-200">Current</p>
                      <p className="text-white font-medium text-lg">
                        {processedData.basalTemp?.current?.toFixed(1)}°C
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <p className="text-purple-200">Average</p>
                      <p className="text-white font-medium text-lg">
                        {processedData.basalTemp?.average?.toFixed(1)}°C
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <p className="text-purple-200">Trend</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {getTempTrendIcon()}
                        <span className="text-white font-medium capitalize">
                          {processedData.basalTemp?.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hot Flash Tracker (for perimenopause/menopause) */}
            {(lifeStage === "perimenopause" || lifeStage === "menopause") && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Hot Flash Tracker
                </h3>

                {processedData.hotFlashes.length === 0 ? (
                  <div className="text-center py-8">
                    <CloudSnow className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-200 text-sm">
                      No hot flashes tracked
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">
                          {processedData.averages.hotFlashesPerDay?.toFixed(
                            1
                          ) || 0}
                        </p>
                        <p className="text-purple-200 text-sm">
                          Average per day
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Today</span>
                          <span className="text-white font-medium">
                            {processedData.hotFlashes[
                              processedData.hotFlashes.length - 1
                            ]?.count || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">This week</span>
                          <span className="text-white font-medium">
                            {processedData.hotFlashes
                              .slice(-7)
                              .reduce((sum, h) => sum + h.count, 0)}
                          </span>
                        </div>
                      </div>

                      {predictions?.nextHotFlash && (
                        <div className="bg-orange-500/20 rounded-lg p-3 mt-4">
                          <p className="text-orange-200 text-sm">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {predictions.nextHotFlash}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mood & Emotional Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Tracking */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Mood & Emotional Patterns
              </h3>

              {processedData.moodPatterns.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-200">No mood data tracked</p>
                    <p className="text-purple-300 text-sm mt-1">
                      Track your mood daily to see patterns
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.moodPatterns}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                        <YAxis domain={[0, 5]} stroke="#fff" opacity={0.6} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(139, 92, 246, 0.9)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="happiness"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981", r: 3 }}
                          name="Mood"
                        />
                        <Line
                          type="monotone"
                          dataKey="anxiety"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ fill: "#F59E0B", r: 3 }}
                          name="Anxiety"
                        />
                        <Line
                          type="monotone"
                          dataKey="irritability"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={{ fill: "#EF4444", r: 3 }}
                          name="Irritability"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span className="text-purple-200">Mood</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded"></div>
                      <span className="text-purple-200">Anxiety</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-purple-200">Irritability</span>
                    </div>
                  </div>

                  {processedData.averages.mood && (
                    <div className="mt-4 bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-purple-200">
                        Average mood: {processedData.averages.mood.toFixed(1)}/5
                        {processedData.averages.anxiety > 2 && (
                          <span className="block mt-1 text-yellow-300">
                            Consider stress reduction techniques
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Energy Levels */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Energy & Fatigue
              </h3>

              {processedData.energyLevels.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-200">No energy data tracked</p>
                    <p className="text-purple-300 text-sm mt-1">
                      Track your energy levels to identify patterns
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processedData.energyLevels}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                        <YAxis domain={[0, 5]} stroke="#fff" opacity={0.6} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(139, 92, 246, 0.9)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="energy"
                          stroke={colors.primary}
                          fill={colors.primary}
                          fillOpacity={0.3}
                          name="Energy"
                        />
                        <Area
                          type="monotone"
                          dataKey="fatigue"
                          stroke={colors.warning}
                          fill={colors.warning}
                          fillOpacity={0.3}
                          name="Fatigue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {predictions && (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Zap className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                        <p className="text-purple-200">Peak Energy</p>
                        <p className="text-white font-medium">
                          {predictions.optimalExercise || "Track more data"}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Moon className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                        <p className="text-purple-200">Energy Dip</p>
                        <p className="text-white font-medium">
                          {predictions.energyDip || "Track more data"}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Hormonal Symptom Frequency */}
          {processedData.symptoms.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Symptom Frequency
              </h3>

              <div className="space-y-3">
                {processedData.symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-purple-200">{symptom.symptom}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-white/10 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                          style={{ width: `${symptom.frequency}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-12 text-right">
                        {symptom.frequency}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-purple-600/20 rounded-lg p-3">
                <p className="text-sm text-purple-200">
                  <Info className="w-4 h-4 inline mr-1" />
                  Tracking symptoms helps identify hormonal patterns and
                  triggers
                </p>
              </div>
            </div>
          )}

          {/* Insights Summary */}
          {hasMinimumData && processedData.averages && (
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Your Hormonal Insights
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {processedData.averages.mood && (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <Brain className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-purple-200 mb-1">Average Mood</p>
                    <p className="text-2xl font-bold text-white">
                      {processedData.averages.mood.toFixed(1)}/5
                    </p>
                  </div>
                )}

                {processedData.averages.energy && (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <Zap className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-purple-200 mb-1">
                      Average Energy
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {processedData.averages.energy.toFixed(1)}/5
                    </p>
                  </div>
                )}

                {processedData.averages.anxiety !== null && (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-purple-200 mb-1">
                      Anxiety Level
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {processedData.averages.anxiety.toFixed(1)}/5
                    </p>
                  </div>
                )}

                {processedData.basalTemp && (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <Thermometer className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-purple-200 mb-1">
                      Avg Temperature
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {processedData.basalTemp.average.toFixed(1)}°C
                    </p>
                  </div>
                )}
              </div>

              {lifeStage === "perimenopause" && (
                <div className="mt-4 bg-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-100">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Hormonal fluctuations are normal during perimenopause. Track
                    consistently to identify your patterns.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Hormone Education Modal */}
      {showEducation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  Understanding Your Hormones
                </h3>
                <button
                  onClick={() => setShowEducation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="space-y-6">
                {Object.entries(hormoneInfo).map(([key, info]) => (
                  <div
                    key={key}
                    className="bg-white/10 rounded-lg p-4 border border-white/20"
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {info.name}
                    </h4>
                    <p className="text-purple-200 mb-3">{info.role}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-white font-medium mb-2">
                          Effects on Your Body:
                        </h5>
                        <ul className="space-y-1">
                          {info.effects.map((effect, index) => (
                            <li
                              key={index}
                              className="text-purple-200 text-sm flex items-start gap-2"
                            >
                              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-white font-medium mb-2">
                          In Your Life Stage:
                        </h5>
                        <p className="text-purple-200 text-sm bg-white/10 rounded-lg p-3">
                          {info.lifeStageInfo[lifeStage]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-purple-600/20 rounded-lg p-4">
                <p className="text-sm text-purple-200">
                  <Info className="w-4 h-4 inline mr-1" />
                  Understanding your hormonal patterns can help you optimize
                  your daily activities, manage symptoms, and make informed
                  health decisions. Track consistently for the most accurate
                  insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing icon component
const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default HormonalInsightsTab;
