// src/components/womenshealth/tabs/HormonalInsightsTab.jsx
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
} from "lucide-react";
import { format, subDays, addDays, differenceInDays } from "date-fns";
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

const HormonalInsightsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [showEducation, setShowEducation] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState(null);

  // Hormonal data states
  const [hormonalData, setHormonalData] = useState({
    temperature: [],
    hotFlashes: [],
    moodPatterns: [],
    energyLevels: [],
    symptoms: [],
    predictions: {},
  });

  const [basalTemp, setBasalTemp] = useState({
    current: 36.6,
    average: 36.5,
    trend: "stable",
  });

  // Hormone education content
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
        perimenopause: "Irregular production, often low",
        menopause: "Very low levels",
      },
    },
    testosterone: {
      name: "Testosterone",
      role: "Supports libido and energy",
      effects: [
        "Influences sex drive",
        "Affects muscle mass",
        "Impacts energy levels",
        "Influences mood",
      ],
      lifeStageInfo: {
        menstrual: "Slight peak around ovulation",
        perimenopause: "Gradual decline",
        menopause: "Continued gradual decline",
      },
    },
  };

  useEffect(() => {
    loadHormonalData();
    setTimeout(() => setLoading(false), 1000);
  }, [selectedTimeRange, lifeStage]);

  const loadHormonalData = () => {
    // Mock data - will be replaced with database calls
    setHormonalData({
      temperature: generateTemperatureData(),
      hotFlashes: generateHotFlashData(),
      moodPatterns: generateMoodData(),
      energyLevels: generateEnergyData(),
      symptoms: generateHormonalSymptoms(),
      predictions: generatePredictions(),
    });
  };

  const generateTemperatureData = () => {
    const data = [];
    const days =
      selectedTimeRange === "week"
        ? 7
        : selectedTimeRange === "month"
        ? 30
        : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      let temp = 36.5;

      if (lifeStage === "menstrual") {
        // Temperature rise during luteal phase
        const dayInCycle = (days - i) % 28;
        if (dayInCycle > 14) {
          temp += 0.3 + Math.random() * 0.2;
        }
      }

      temp += (Math.random() - 0.5) * 0.3;

      data.push({
        date: format(date, "MMM d"),
        temperature: parseFloat(temp.toFixed(2)),
        phase:
          lifeStage === "menstrual" ? getPhaseForDay((days - i) % 28) : null,
      });
    }

    return data;
  };

  const generateHotFlashData = () => {
    if (lifeStage === "menstrual") return [];

    const data = [];
    const days = 7;

    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: format(subDays(new Date(), i), "MMM d"),
        morning: Math.floor(Math.random() * 3),
        afternoon: Math.floor(Math.random() * 4),
        evening: Math.floor(Math.random() * 5),
        night: Math.floor(Math.random() * 6),
      });
    }

    return data;
  };

  const generateMoodData = () => {
    const data = [];
    const days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayInCycle = lifeStage === "menstrual" ? (days - i) % 28 : 0;

      // Mood influenced by cycle phase
      let baseAnxiety = 3;
      let baseIrritability = 3;
      let baseDepression = 2;

      if (lifeStage === "menstrual" && dayInCycle > 21) {
        // PMS phase
        baseAnxiety += 2;
        baseIrritability += 2;
        baseDepression += 1;
      }

      data.push({
        date: format(date, "MMM d"),
        anxiety: Math.min(
          5,
          Math.max(1, baseAnxiety + (Math.random() - 0.5) * 2)
        ),
        irritability: Math.min(
          5,
          Math.max(1, baseIrritability + (Math.random() - 0.5) * 2)
        ),
        depression: Math.min(
          5,
          Math.max(1, baseDepression + (Math.random() - 0.5) * 2)
        ),
        happiness: Math.min(5, Math.max(1, 4 + (Math.random() - 0.5) * 2)),
      });
    }

    return data;
  };

  const generateEnergyData = () => {
    const data = [];
    const days = 14;

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayInCycle = lifeStage === "menstrual" ? (days - i) % 28 : 0;

      // Energy influenced by cycle phase
      let energy = 3;
      if (lifeStage === "menstrual") {
        if (dayInCycle >= 6 && dayInCycle <= 14) {
          energy = 4; // Higher during follicular/ovulation
        } else if (dayInCycle <= 5) {
          energy = 2; // Lower during menstruation
        }
      }

      data.push({
        date: format(date, "MMM d"),
        energy: Math.min(5, Math.max(1, energy + (Math.random() - 0.5) * 1.5)),
        fatigue: Math.min(
          5,
          Math.max(1, 5 - energy + (Math.random() - 0.5) * 1.5)
        ),
      });
    }

    return data;
  };

  const generateHormonalSymptoms = () => {
    return [
      {
        symptom: "Hot Flashes",
        frequency: lifeStage === "menopause" ? 85 : 20,
      },
      {
        symptom: "Night Sweats",
        frequency: lifeStage === "menopause" ? 75 : 15,
      },
      { symptom: "Mood Swings", frequency: 65 },
      { symptom: "Low Libido", frequency: lifeStage === "menopause" ? 70 : 30 },
      {
        symptom: "Vaginal Dryness",
        frequency: lifeStage === "menopause" ? 60 : 10,
      },
      { symptom: "Sleep Issues", frequency: 80 },
    ];
  };

  const generatePredictions = () => {
    return {
      nextHotFlash: lifeStage !== "menstrual" ? "2-3 hours" : null,
      moodPeak: "Evening (6-8 PM)",
      energyDip: "Afternoon (2-4 PM)",
      optimalExercise: "Morning (7-9 AM)",
    };
  };

  const getPhaseForDay = (day) => {
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 16) return "Ovulation";
    return "Luteal";
  };

  const getTempTrendIcon = () => {
    if (basalTemp.trend === "rising")
      return <ArrowUp className="w-4 h-4 text-red-400" />;
    if (basalTemp.trend === "falling")
      return <ArrowDown className="w-4 h-4 text-blue-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading hormonal insights...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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

      {/* Temperature & Hot Flash Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basal Body Temperature */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            {lifeStage === "menstrual"
              ? "Basal Body Temperature"
              : "Body Temperature Patterns"}
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hormonalData.temperature}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis domain={[36, 37.5]} stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <ReferenceLine
                  y={36.5}
                  stroke="#fff"
                  strokeDasharray="5 5"
                  opacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {lifeStage === "menstrual" && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-purple-200">
                <Info className="w-4 h-4 inline mr-1" />
                Temperature typically rises 0.3-0.5°C after ovulation due to
                progesterone
              </p>
            </div>
          )}
        </div>

        {/* Temperature Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Temperature Stats
          </h3>

          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Current</span>
                {getTempTrendIcon()}
              </div>
              <p className="text-2xl font-bold text-white">
                {basalTemp.current}°C
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Average</span>
                <Thermometer className="w-4 h-4 text-purple-300" />
              </div>
              <p className="text-2xl font-bold text-white">
                {basalTemp.average}°C
              </p>
            </div>

            {lifeStage === "menstrual" && (
              <div className="bg-purple-600/20 rounded-lg p-3">
                <p className="text-sm text-purple-200">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Temperature shift detected - possible ovulation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hot Flash Tracking (Perimenopause/Menopause) */}
      {lifeStage !== "menstrual" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Hot Flash Patterns
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hormonalData.hotFlashes}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                  <YAxis stroke="#fff" opacity={0.6} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(139, 92, 246, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="morning" stackId="1" fill={colors.primary} />
                  <Bar
                    dataKey="afternoon"
                    stackId="1"
                    fill={colors.secondary}
                  />
                  <Bar dataKey="evening" stackId="1" fill={colors.accent} />
                  <Bar dataKey="night" stackId="1" fill={colors.warning} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-medium mb-2">Time Distribution</h4>
              <div className="space-y-2">
                {[
                  { time: "Morning", color: colors.primary, count: 12 },
                  { time: "Afternoon", color: colors.secondary, count: 18 },
                  { time: "Evening", color: colors.accent, count: 25 },
                  { time: "Night", color: colors.warning, count: 32 },
                ].map((item) => (
                  <div
                    key={item.time}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-purple-200">{item.time}</span>
                    </div>
                    <span className="text-white font-medium">
                      {item.count} total
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Peak time: Evening & Night hours
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood & Energy Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Patterns */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Mood Patterns
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hormonalData.moodPatterns.slice(-14)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis domain={[1, 5]} stroke="#fff" opacity={0.6} />
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
                />
                <Line
                  type="monotone"
                  dataKey="anxiety"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="irritability"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-purple-200">Happiness</span>
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
        </div>

        {/* Energy Levels */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Energy & Fatigue
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hormonalData.energyLevels}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis domain={[1, 5]} stroke="#fff" opacity={0.6} />
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
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Zap className="w-5 h-5 text-purple-300 mx-auto mb-1" />
              <p className="text-purple-200">Peak Energy</p>
              <p className="text-white font-medium">
                {hormonalData.predictions.optimalExercise}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Moon className="w-5 h-5 text-purple-300 mx-auto mb-1" />
              <p className="text-purple-200">Energy Dip</p>
              <p className="text-white font-medium">
                {hormonalData.predictions.energyDip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hormonal Symptom Frequency */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Hormonal Symptom Frequency
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {hormonalData.symptoms.map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative inline-flex">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke={colors.primary}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(item.frequency / 100) * 220} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {item.frequency}%
                </span>
              </div>
              <p className="text-sm text-purple-200 mt-2">{item.symptom}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hormone Balance Insights */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600/30 rounded-full p-3">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-3">
              Your Hormonal Pattern Insights
            </h4>
            <div className="space-y-3 text-purple-200">
              {lifeStage === "menstrual" && (
                <>
                  <p>
                    • Your temperature patterns suggest you're currently in the{" "}
                    <span className="text-white font-medium">
                      {getPhaseForDay(new Date().getDate())}
                    </span>{" "}
                    phase of your cycle.
                  </p>
                  <p>
                    • Mood swings appear most pronounced during your{" "}
                    <span className="text-white font-medium">luteal phase</span>
                    , which is typical due to progesterone fluctuations.
                  </p>
                  <p>
                    • Energy levels peak during{" "}
                    <span className="text-white font-medium">
                      follicular and ovulation
                    </span>{" "}
                    phases, optimal for intense workouts.
                  </p>
                </>
              )}

              {lifeStage === "perimenopause" && (
                <>
                  <p>
                    • Your hot flash frequency is{" "}
                    <span className="text-white font-medium">
                      highest during evening hours
                    </span>
                    , consider cooling strategies before bed.
                  </p>
                  <p>
                    • Mood fluctuations show an{" "}
                    <span className="text-white font-medium">
                      irregular pattern
                    </span>
                    , consistent with perimenopause hormone variability.
                  </p>
                  <p>
                    • Energy dips are most pronounced in the{" "}
                    <span className="text-white font-medium">afternoon</span>,
                    plan important tasks for morning hours.
                  </p>
                </>
              )}

              {lifeStage === "menopause" && (
                <>
                  <p>
                    • Hot flash patterns show{" "}
                    <span className="text-white font-medium">
                      improvement over the past month
                    </span>
                    , indicating hormone stabilization.
                  </p>
                  <p>
                    • Night sweats remain your most frequent symptom, occurring{" "}
                    <span className="text-white font-medium">
                      75% of nights
                    </span>{" "}
                    tracked.
                  </p>
                  <p>
                    • Morning energy levels are{" "}
                    <span className="text-white font-medium">
                      consistently higher
                    </span>
                    , suggesting optimal exercise timing.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                View Full Report
              </button>
              <button
                onClick={() => setShowEducation(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hormone Education Modal */}
      {showEducation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Understanding Your Hormones
              </h3>
              <button
                onClick={() => setShowEducation(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(hormoneInfo).map(([key, info]) => (
                <div key={key} className="bg-white/10 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-white mb-3">
                    {info.name}
                  </h4>
                  <p className="text-purple-200 mb-4">{info.role}</p>

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

              <div className="bg-purple-600/20 rounded-lg p-4">
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

export default HormonalInsightsTab;
