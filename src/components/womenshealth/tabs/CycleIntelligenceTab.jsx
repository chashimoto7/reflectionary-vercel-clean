// src/components/womenshealth/tabs/CycleIntelligenceTab.jsx
import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Droplets,
  Flower2,
  Calendar,
  Info,
  TrendingUp,
  AlertCircle,
  Clock,
  Activity,
  Brain,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  X,
  Check,
  Edit2,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInDays,
} from "date-fns";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

const CycleIntelligenceTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [editingCycleLength, setEditingCycleLength] = useState(false);

  // Cycle data
  const [cycleData, setCycleData] = useState({
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: subDays(new Date(), 14),
    cycles: [],
    currentDay: 14,
    currentPhase: "ovulation",
  });

  const [predictions, setPredictions] = useState({
    nextPeriod: null,
    ovulation: null,
    fertileWindow: { start: null, end: null },
    confidence: 85,
  });

  const [irregularityData, setIrregularityData] = useState([]);
  const [symptomPatterns, setSymptomPatterns] = useState({});

  useEffect(() => {
    loadCycleData();
    setTimeout(() => setLoading(false), 1000);
  }, [lifeStage]);

  const loadCycleData = () => {
    // Mock data - will be replaced with database calls
    const mockCycles = generateMockCycles();
    setCycleData({
      ...cycleData,
      cycles: mockCycles,
    });

    calculatePredictions();

    if (lifeStage === "perimenopause") {
      setIrregularityData(generateIrregularityData());
    }
  };

  const generateMockCycles = () => {
    const cycles = [];
    let startDate = subDays(new Date(), 365);

    for (let i = 0; i < 12; i++) {
      const cycleLength =
        lifeStage === "perimenopause"
          ? Math.floor(Math.random() * 15) + 23 // 23-38 days for perimenopause
          : Math.floor(Math.random() * 4) + 26; // 26-30 days for regular

      cycles.push({
        startDate: startDate,
        endDate: addDays(startDate, cycleLength),
        length: cycleLength,
        periodLength: Math.floor(Math.random() * 3) + 4,
        symptoms: ["cramps", "mood swings", "fatigue"],
        flow: "moderate",
      });

      startDate = addDays(startDate, cycleLength);
    }

    return cycles;
  };

  const generateIrregularityData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      data.push({
        month: format(subDays(new Date(), i * 30), "MMM"),
        variation: Math.floor(Math.random() * 10) + 5,
        cycleLength: Math.floor(Math.random() * 15) + 23,
      });
    }
    return data;
  };

  const calculatePredictions = () => {
    const lastPeriod = cycleData.lastPeriodStart;
    const nextPeriod = addDays(lastPeriod, cycleData.cycleLength);
    const ovulationDay = addDays(lastPeriod, cycleData.cycleLength - 14);

    setPredictions({
      nextPeriod: nextPeriod,
      ovulation: ovulationDay,
      fertileWindow: {
        start: subDays(ovulationDay, 5),
        end: addDays(ovulationDay, 1),
      },
      confidence: lifeStage === "perimenopause" ? 65 : 85,
    });
  };

  const getCyclePhase = (dayInCycle) => {
    if (dayInCycle <= 5) return "menstrual";
    if (dayInCycle <= 13) return "follicular";
    if (dayInCycle <= 16) return "ovulation";
    return "luteal";
  };

  const getPhaseInfo = (phase) => {
    const phases = {
      menstrual: {
        name: "Menstrual Phase",
        icon: Droplets,
        color: "bg-red-500",
        description: "Your period. The uterine lining sheds.",
        duration: "3-7 days",
        hormones: "Low estrogen and progesterone",
        symptoms: ["Cramps", "Fatigue", "Mood changes", "Headaches"],
        tips: [
          "Rest and gentle exercise can help with cramps",
          "Stay hydrated and eat iron-rich foods",
          "Use heat therapy for pain relief",
        ],
      },
      follicular: {
        name: "Follicular Phase",
        icon: Flower2,
        color: "bg-pink-500",
        description: "Your body prepares for ovulation. Energy levels rise.",
        duration: "7-10 days",
        hormones: "Rising estrogen",
        symptoms: ["Increased energy", "Better mood", "Clearer skin"],
        tips: [
          "Great time for new projects and exercise",
          "Your body responds well to strength training",
          "Focus on complex carbohydrates",
        ],
      },
      ovulation: {
        name: "Ovulation Phase",
        icon: Sun,
        color: "bg-yellow-500",
        description: "An egg is released. Peak fertility window.",
        duration: "3-5 days",
        hormones: "Peak estrogen, LH surge",
        symptoms: [
          "Mild cramping",
          "Increased libido",
          "Cervical mucus changes",
        ],
        tips: [
          "Track basal body temperature for accuracy",
          "Most fertile 2 days before ovulation",
          "Some women experience ovulation pain",
        ],
      },
      luteal: {
        name: "Luteal Phase",
        icon: Moon,
        color: "bg-purple-500",
        description: "Post-ovulation phase. PMS symptoms may appear.",
        duration: "12-14 days",
        hormones: "High progesterone, then drops",
        symptoms: ["PMS", "Breast tenderness", "Mood swings", "Bloating"],
        tips: [
          "Reduce caffeine and salt intake",
          "Practice stress-reduction techniques",
          "Gentle yoga can help with symptoms",
        ],
      },
    };

    return phases[phase];
  };

  const handleCycleLengthUpdate = (newLength) => {
    setCycleData({ ...cycleData, cycleLength: newLength });
    setEditingCycleLength(false);
    calculatePredictions();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading cycle intelligence...</p>
      </div>
    );
  }

  const currentPhaseInfo = getPhaseInfo(cycleData.currentPhase);

  return (
    <div className="p-6 space-y-6">
      {/* Cycle Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle Wheel */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Your Cycle</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-200">
                Day {cycleData.currentDay} of {cycleData.cycleLength}
              </span>
              <button
                onClick={() => setEditingCycleLength(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Settings className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Circular Cycle Visualization */}
          <div className="relative h-80 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Phase segments */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="60"
                />
                {/* Menstrual phase (red) */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.6)"
                  strokeWidth="60"
                  strokeDasharray={`${
                    (5 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }% ${100}%`}
                  strokeDashoffset="0"
                />
                {/* Follicular phase (pink) */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="rgba(236, 72, 153, 0.6)"
                  strokeWidth="60"
                  strokeDasharray={`${
                    (8 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }% ${100}%`}
                  strokeDashoffset={`-${
                    (5 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }%`}
                />
                {/* Ovulation phase (yellow) */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="60"
                  strokeDasharray={`${
                    (3 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }% ${100}%`}
                  strokeDashoffset={`-${
                    (13 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }%`}
                />
                {/* Luteal phase (purple) */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.6)"
                  strokeWidth="60"
                  strokeDasharray={`${
                    ((cycleData.cycleLength - 16) / cycleData.cycleLength) *
                    2 *
                    Math.PI *
                    40
                  }% ${100}%`}
                  strokeDashoffset={`-${
                    (16 / cycleData.cycleLength) * 2 * Math.PI * 40
                  }%`}
                />
                {/* Current day indicator */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray="2 4"
                  transform={`rotate(${
                    (cycleData.currentDay / cycleData.cycleLength) * 360
                  } 160 160)`}
                />
              </svg>
            </div>

            {/* Center info */}
            <div className="text-center z-10">
              <currentPhaseInfo.icon className="w-12 h-12 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {currentPhaseInfo.name}
              </p>
              <p className="text-purple-200 text-sm mt-1">Current Phase</p>
            </div>
          </div>

          {/* Phase Legend */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {Object.entries({
              menstrual: { color: "bg-red-500", label: "Menstrual" },
              follicular: { color: "bg-pink-500", label: "Follicular" },
              ovulation: { color: "bg-yellow-500", label: "Ovulation" },
              luteal: { color: "bg-purple-500", label: "Luteal" },
            }).map(([phase, info]) => (
              <button
                key={phase}
                onClick={() => {
                  setSelectedPhase(phase);
                  setShowPhaseInfo(true);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                <span className="text-xs text-purple-200">{info.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Predictions</h3>

          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Next Period</span>
                <span className="text-xs text-purple-300">
                  {predictions.confidence}% accurate
                </span>
              </div>
              <p className="text-lg font-semibold text-white">
                {predictions.nextPeriod &&
                  format(predictions.nextPeriod, "MMM d")}
              </p>
              <p className="text-sm text-purple-200">
                In{" "}
                {predictions.nextPeriod &&
                  differenceInDays(predictions.nextPeriod, new Date())}{" "}
                days
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Next Ovulation</span>
                <Calendar className="w-4 h-4 text-purple-300" />
              </div>
              <p className="text-lg font-semibold text-white">
                {predictions.ovulation &&
                  format(predictions.ovulation, "MMM d")}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Fertile Window</span>
                <Heart className="w-4 h-4 text-pink-300" />
              </div>
              <p className="text-lg font-semibold text-white">
                {predictions.fertileWindow.start &&
                  format(predictions.fertileWindow.start, "MMM d")}{" "}
                -{" "}
                {predictions.fertileWindow.end &&
                  format(predictions.fertileWindow.end, "MMM d")}
              </p>
            </div>

            {lifeStage === "perimenopause" && (
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-200">
                    Predictions may be less accurate due to cycle irregularity
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cycle History & Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Length History */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Cycle Length History
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cycleData.cycles.slice(-6).map((cycle, index) => ({
                  month: format(cycle.startDate, "MMM"),
                  length: cycle.length,
                  average: cycleData.cycleLength,
                }))}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="length"
                  fill={colors.primary}
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke={colors.secondary}
                  strokeDasharray="5 5"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-purple-200">
              Average: {cycleData.cycleLength} days
            </span>
            {lifeStage === "perimenopause" && (
              <span className="text-yellow-300">High variability</span>
            )}
          </div>
        </div>

        {/* Period Flow Pattern */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Flow Patterns
          </h3>

          <div className="space-y-3">
            {cycleData.cycles.slice(-4).map((cycle, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-200">
                    {format(cycle.startDate, "MMM yyyy")}
                  </span>
                  <span className="text-xs text-purple-300">
                    {cycle.periodLength} days
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(7)].map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`h-2 flex-1 rounded ${
                        dayIndex < cycle.periodLength
                          ? dayIndex < 2
                            ? "bg-red-400"
                            : dayIndex < cycle.periodLength - 1
                            ? "bg-red-500"
                            : "bg-red-300"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Calendar View</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 30))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="text-white font-medium px-4">
              {format(selectedDate, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 30))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm text-purple-300 font-medium py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {eachDayOfInterval({
            start: startOfMonth(selectedDate),
            end: endOfMonth(selectedDate),
          }).map((date, index) => {
            const dayOfCycle =
              (differenceInDays(date, cycleData.lastPeriodStart) %
                cycleData.cycleLength) +
              1;
            const phase = getCyclePhase(dayOfCycle);
            const isToday = isSameDay(date, new Date());
            const isPeriod = dayOfCycle <= cycleData.periodLength;
            const isFertile = dayOfCycle >= 11 && dayOfCycle <= 17;

            return (
              <div
                key={date}
                className={`
                  relative p-3 rounded-lg border transition-all cursor-pointer
                  ${isToday ? "border-white" : "border-white/20"}
                  ${
                    isPeriod
                      ? "bg-red-500/20"
                      : isFertile
                      ? "bg-green-500/20"
                      : "bg-white/5"
                  }
                  hover:bg-white/10
                `}
              >
                <span
                  className={`text-sm ${
                    isToday ? "font-bold text-white" : "text-purple-200"
                  }`}
                >
                  {format(date, "d")}
                </span>
                {isPeriod && (
                  <Droplets className="w-3 h-3 text-red-400 absolute bottom-1 right-1" />
                )}
                {isFertile && (
                  <Heart className="w-3 h-3 text-green-400 absolute bottom-1 right-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 rounded"></div>
            <span className="text-purple-200">Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 rounded"></div>
            <span className="text-purple-200">Fertile Window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-white rounded"></div>
            <span className="text-purple-200">Today</span>
          </div>
        </div>
      </div>

      {/* Perimenopause-specific: Irregularity Tracking */}
      {lifeStage === "perimenopause" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Cycle Irregularity Tracking
          </h3>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={irregularityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
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
                  dataKey="variation"
                  stroke={colors.warning}
                  strokeWidth={3}
                  dot={{ fill: colors.warning, r: 6 }}
                  name="Variation (days)"
                />
                <Line
                  type="monotone"
                  dataKey="cycleLength"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, r: 6 }}
                  name="Cycle Length"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-100 font-medium mb-1">
                  Increasing Irregularity Detected
                </p>
                <p className="text-xs text-yellow-200">
                  Your cycles have varied by an average of 8 days over the last
                  6 months. This is common during perimenopause. Continue
                  tracking to help identify patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase Information Modal */}
      {showPhaseInfo && selectedPhase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                {React.createElement(getPhaseInfo(selectedPhase).icon, {
                  className: "w-8 h-8",
                })}
                {getPhaseInfo(selectedPhase).name}
              </h3>
              <button
                onClick={() => setShowPhaseInfo(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Overview
                </h4>
                <p className="text-purple-200">
                  {getPhaseInfo(selectedPhase).description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-purple-300 mb-1">
                    Duration
                  </h5>
                  <p className="text-white">
                    {getPhaseInfo(selectedPhase).duration}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-purple-300 mb-1">
                    Hormones
                  </h5>
                  <p className="text-white">
                    {getPhaseInfo(selectedPhase).hormones}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Common Symptoms
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {getPhaseInfo(selectedPhase).symptoms.map(
                    (symptom, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-lg px-4 py-2 text-purple-200"
                      >
                        {symptom}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Tips & Recommendations
                </h4>
                <div className="space-y-2">
                  {getPhaseInfo(selectedPhase).tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                      <p className="text-purple-200 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cycle Length Modal */}
      {editingCycleLength && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              Customize Cycle Length
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-2 block">
                  Average Cycle Length (days)
                </label>
                <input
                  type="number"
                  min="21"
                  max="40"
                  value={cycleData.cycleLength}
                  onChange={(e) =>
                    setCycleData({
                      ...cycleData,
                      cycleLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-purple-200">
                  <Info className="w-3 h-3 inline mr-1" />
                  Most cycles range from 21-35 days. Your tracking will adjust
                  predictions based on your actual cycle data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleCycleLengthUpdate(cycleData.cycleLength)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingCycleLength(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleIntelligenceTab;
