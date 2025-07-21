// frontend/src/components/womenshealth/tabs/CycleIntelligenceTab.jsx
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
  Database,
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
  isValid,
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

const CycleIntelligenceTab = ({
  colors,
  user,
  lifeStage,
  healthData = [],
  cycleData = null,
  profile = null,
  onRefreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [editingCycleLength, setEditingCycleLength] = useState(false);
  const [customCycleLength, setCustomCycleLength] = useState(28);

  // Get backend URL from environment
  const backendUrl =
    import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

  // Phase information
  const phaseInfo = {
    menstrual: {
      name: "Menstrual Phase",
      icon: Droplets,
      color: "bg-red-500",
      description: "Your period. The uterine lining sheds.",
      duration: "3-7 days",
      hormones: "Low estrogen and progesterone",
      symptoms: ["Cramps", "Fatigue", "Mood changes", "Headaches"],
      tips: [
        "Rest and gentle movement can help",
        "Stay hydrated",
        "Iron-rich foods support blood loss recovery",
      ],
    },
    follicular: {
      name: "Follicular Phase",
      icon: Flower2,
      color: "bg-pink-500",
      description: "Eggs develop in the ovaries. Energy levels rise.",
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
      symptoms: ["Mild cramping", "Increased libido", "Cervical mucus changes"],
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
      hormones: "High progesterone",
      symptoms: ["PMS", "Breast tenderness", "Mood swings", "Bloating"],
      tips: [
        "Reduce caffeine and sugar",
        "Magnesium can help with symptoms",
        "Prioritize sleep and stress management",
      ],
    },
  };

  // Process cycle data from health entries
  function processCycleData(entries, cycleAnalysis, userProfile) {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return {
        cycleLength: userProfile?.average_cycle_length || 28,
        periodLength: 5,
        lastPeriodStart: null,
        cycles: [],
        currentDay: null,
        currentPhase: null,
        averageCycleLength: null,
        cycleVariability: null,
      };
    }

    // Find period starts - handle both encrypted and decrypted data
    const periodStarts = entries
      .filter((entry) => {
        if (!entry || !entry.date) return false;

        // Handle both encrypted and decrypted data structures
        const data = entry.data || entry.decrypted_data || {};
        const periodFlow = data.periodFlow || data.period_flow;
        const periodDay = data.periodDay || data.period_day;

        return periodFlow && periodFlow !== "none" && periodDay === 1;
      })
      .map((entry) => {
        try {
          return new Date(entry.date);
        } catch (e) {
          console.error("Invalid date:", entry.date);
          return null;
        }
      })
      .filter((date) => date && isValid(date))
      .sort((a, b) => b - a); // Most recent first

    if (periodStarts.length === 0) {
      return {
        cycleLength: userProfile?.average_cycle_length || 28,
        periodLength: 5,
        lastPeriodStart: null,
        cycles: [],
        currentDay: null,
        currentPhase: null,
        averageCycleLength: null,
        cycleVariability: null,
      };
    }

    const lastPeriodStart = periodStarts[0];
    const daysSinceLastPeriod = differenceInDays(new Date(), lastPeriodStart);

    // Calculate cycles from period starts
    const cycles = [];
    for (let i = 0; i < periodStarts.length - 1; i++) {
      const cycleLength = differenceInDays(
        periodStarts[i],
        periodStarts[i + 1]
      );

      if (cycleLength > 0 && cycleLength < 90) {
        // Sanity check
        const periodDays = entries.filter((e) => {
          if (!e || !e.date) return false;

          const data = e.data || e.decrypted_data || {};
          const periodFlow = data.periodFlow || data.period_flow;

          try {
            const entryDate = new Date(e.date);
            return (
              periodFlow &&
              periodFlow !== "none" &&
              entryDate >= periodStarts[i + 1] &&
              entryDate < periodStarts[i]
            );
          } catch (error) {
            return false;
          }
        }).length;

        cycles.push({
          startDate: periodStarts[i + 1],
          endDate: periodStarts[i],
          length: cycleLength,
          periodLength: periodDays || 5,
        });
      }
    }

    // Calculate average cycle length
    const averageCycleLength =
      cycles.length > 0
        ? Math.round(
            cycles.reduce((sum, cycle) => sum + cycle.length, 0) / cycles.length
          )
        : userProfile?.average_cycle_length || 28;

    // Calculate current cycle day and phase
    const currentCycleDay = (daysSinceLastPeriod % averageCycleLength) + 1;
    const currentPhase = getCyclePhase(currentCycleDay, averageCycleLength);

    // Calculate cycle variability
    const cycleVariability =
      cycles.length > 1
        ? Math.round(
            cycles.reduce(
              (sum, cycle) => sum + Math.abs(cycle.length - averageCycleLength),
              0
            ) / cycles.length
          )
        : 0;

    return {
      cycleLength: averageCycleLength,
      periodLength: cycles[0]?.periodLength || 5,
      lastPeriodStart,
      cycles,
      currentDay: currentCycleDay,
      currentPhase,
      averageCycleLength,
      cycleVariability,
    };
  }

  // Get cycle phase based on day
  function getCyclePhase(day, cycleLength = 28) {
    if (!day || day < 1) return null;

    if (day <= 5) return "menstrual";
    if (day <= Math.floor(cycleLength / 2) - 2) return "follicular";
    if (day <= Math.floor(cycleLength / 2) + 2) return "ovulation";
    return "luteal";
  }

  // Handle cycle length update
  const handleCycleLengthUpdate = async (newLength) => {
    try {
      const response = await fetch(`${backendUrl}/womens-health/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          average_cycle_length: newLength,
        }),
      });

      if (response.ok) {
        setEditingCycleLength(false);
        setCustomCycleLength(newLength);
        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (error) {
      console.error("Error updating cycle length:", error);
    }
  };

  // Empty state component
  const EmptyState = ({ minDataRequired = false }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Database className="w-16 h-16 text-purple-300 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        {minDataRequired ? "More Data Needed" : "No Cycle Data Yet"}
      </h3>
      <p className="text-purple-200 max-w-md mb-6">
        {minDataRequired
          ? "Track at least 2 complete cycles to see detailed analytics and predictions."
          : "Start tracking your cycle to unlock powerful insights about your health patterns."}
      </p>
      <div className="bg-purple-600/20 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-purple-100">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Track your period, symptoms, and mood daily to build your personalized
          cycle intelligence.
        </p>
      </div>
    </div>
  );

  // Initialize cycle data processing
  useEffect(() => {
    if (profile?.average_cycle_length) {
      setCustomCycleLength(profile.average_cycle_length);
    }
  }, [profile]);

  // Early return if no user
  if (!user || !user.id) {
    return (
      <div className="p-8 text-center">
        <p className="text-purple-200">
          Please log in to view your cycle intelligence.
        </p>
      </div>
    );
  }

  // Process the data with proper error handling
  const processedCycleData = React.useMemo(() => {
    try {
      return processCycleData(healthData, cycleData, profile);
    } catch (error) {
      console.error("Error processing cycle data:", error);
      return {
        cycleLength: profile?.average_cycle_length || 28,
        periodLength: 5,
        lastPeriodStart: null,
        cycles: [],
        currentDay: null,
        currentPhase: null,
        averageCycleLength: null,
        cycleVariability: null,
      };
    }
  }, [healthData, cycleData, profile]);

  const currentPhaseInfo = processedCycleData.currentPhase
    ? phaseInfo[processedCycleData.currentPhase]
    : phaseInfo.menstrual;

  const hasData =
    healthData && Array.isArray(healthData) && healthData.length > 0;
  const hasMinimumData = hasData && healthData.length >= 14; // At least 2 weeks of data

  // Calculate predictions with proper date validation
  const predictions = React.useMemo(() => {
    const result = {
      nextPeriod: null,
      ovulation: null,
      fertileWindow: { start: null, end: null },
    };

    if (
      processedCycleData.lastPeriodStart &&
      isValid(processedCycleData.lastPeriodStart)
    ) {
      result.nextPeriod = addDays(
        processedCycleData.lastPeriodStart,
        processedCycleData.cycleLength
      );
      result.ovulation = addDays(
        processedCycleData.lastPeriodStart,
        Math.floor(processedCycleData.cycleLength / 2)
      );
      result.fertileWindow = {
        start: addDays(
          processedCycleData.lastPeriodStart,
          Math.floor(processedCycleData.cycleLength / 2) - 5
        ),
        end: addDays(
          processedCycleData.lastPeriodStart,
          Math.floor(processedCycleData.cycleLength / 2) + 1
        ),
      };
    }

    return result;
  }, [processedCycleData]);

  // Prepare chart data for cycle length variations
  const cycleChartData = React.useMemo(() => {
    if (!processedCycleData.cycles || processedCycleData.cycles.length === 0) {
      return [];
    }

    return processedCycleData.cycles
      .slice(0, 10) // Limit to last 10 cycles
      .map((cycle, index) => ({
        name: `Cycle ${processedCycleData.cycles.length - index}`,
        length: cycle.length,
        average: processedCycleData.averageCycleLength || 28,
      }))
      .reverse();
  }, [processedCycleData]);

  // Prepare pattern data for perimenopause users
  const patternData = React.useMemo(() => {
    if (
      lifeStage !== "perimenopause" ||
      !processedCycleData.cycles ||
      processedCycleData.cycles.length < 3
    ) {
      return null;
    }

    const recentCycles = processedCycleData.cycles.slice(0, 6);
    const irregularCycles = recentCycles.filter(
      (cycle) =>
        Math.abs(cycle.length - processedCycleData.averageCycleLength) > 7
    ).length;

    return {
      irregularityRate: Math.round(
        (irregularCycles / recentCycles.length) * 100
      ),
      longestCycle: Math.max(...recentCycles.map((c) => c.length)),
      shortestCycle: Math.min(...recentCycles.map((c) => c.length)),
      missedPeriods: recentCycles.filter((c) => c.length > 60).length,
    };
  }, [lifeStage, processedCycleData]);

  // Calendar view data
  const calendarDays = React.useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Check if a date is in period
  const isInPeriod = (date) => {
    if (!processedCycleData.lastPeriodStart || !isValid(date)) return false;

    const daysSinceLastPeriod = differenceInDays(
      date,
      processedCycleData.lastPeriodStart
    );
    const cycleDay = (daysSinceLastPeriod % processedCycleData.cycleLength) + 1;

    return cycleDay >= 1 && cycleDay <= processedCycleData.periodLength;
  };

  // Get cycle day for a date
  const getCycleDayForDate = (date) => {
    if (!processedCycleData.lastPeriodStart || !isValid(date)) return null;

    const daysSinceLastPeriod = differenceInDays(
      date,
      processedCycleData.lastPeriodStart
    );
    if (daysSinceLastPeriod < 0) return null;

    return (daysSinceLastPeriod % processedCycleData.cycleLength) + 1;
  };

  return (
    <div className="p-6">
      {!hasData ? (
        <EmptyState />
      ) : !hasMinimumData ? (
        <EmptyState minDataRequired={true} />
      ) : (
        <div className="space-y-6">
          {/* Current Phase Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Current Cycle Phase
              </h3>
              <button
                onClick={() => setEditingCycleLength(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                {React.createElement(currentPhaseInfo.icon, {
                  className: "w-12 h-12 text-white",
                })}
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    {currentPhaseInfo.name}
                  </h4>
                  <p className="text-purple-200">
                    Day {processedCycleData.currentDay} of{" "}
                    {processedCycleData.cycleLength}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-200">Progress</span>
                  <span className="text-white">
                    {Math.round(
                      (processedCycleData.currentDay /
                        processedCycleData.cycleLength) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    style={{
                      width: `${
                        (processedCycleData.currentDay /
                          processedCycleData.cycleLength) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedPhase(processedCycleData.currentPhase);
                  setShowPhaseInfo(true);
                }}
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-purple-100 text-sm transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Predictions & Next Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">
              Predictions & Next Events
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.nextPeriod && (
                <div className="bg-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Droplets className="w-5 h-5 text-red-400" />
                    <span className="text-white font-medium">Next Period</span>
                  </div>
                  <p className="text-red-200 text-sm">
                    {format(predictions.nextPeriod, "EEEE, MMMM d")}
                  </p>
                  <p className="text-red-300 text-xs mt-1">
                    {differenceInDays(predictions.nextPeriod, new Date())} days
                    away
                  </p>
                </div>
              )}

              {predictions.ovulation && lifeStage === "menstrual" && (
                <div className="bg-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Ovulation</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    {format(predictions.ovulation, "EEEE, MMMM d")}
                  </p>
                  <p className="text-yellow-300 text-xs mt-1">
                    {differenceInDays(predictions.ovulation, new Date())} days
                    away
                  </p>
                </div>
              )}

              {predictions.fertileWindow.start &&
                predictions.fertileWindow.end &&
                lifeStage === "menstrual" && (
                  <div className="bg-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">
                        Fertile Window
                      </span>
                    </div>
                    <p className="text-green-200 text-sm">
                      {format(predictions.fertileWindow.start, "MMM d")} -{" "}
                      {format(predictions.fertileWindow.end, "MMM d")}
                    </p>
                    <p className="text-green-300 text-xs mt-1">6-day window</p>
                  </div>
                )}
            </div>
          </div>

          {/* Cycle Patterns - Perimenopause Special Section */}
          {lifeStage === "perimenopause" && hasMinimumData && patternData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Perimenopause Patterns
                </h3>
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-500/20 rounded-lg p-4">
                  <p className="text-amber-200 text-sm mb-1">
                    Irregularity Rate
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {patternData.irregularityRate}%
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-1">Cycle Range</p>
                  <p className="text-2xl font-bold text-white">
                    {patternData.shortestCycle}-{patternData.longestCycle} days
                  </p>
                </div>
              </div>

              {patternData.missedPeriods > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-200 text-sm">
                    <Info className="w-4 h-4 inline mr-1" />
                    You've had {patternData.missedPeriods} cycle(s) longer than
                    60 days. This is common during perimenopause.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cycle History */}
          {hasMinimumData && cycleChartData.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">
                Cycle History
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.7)" }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.7)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="length"
                      fill={colors.primary}
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke={colors.accent}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {processedCycleData.cycleVariability !== null && (
                <div className="mt-4 text-center">
                  <p className="text-purple-200 text-sm">
                    Average variability: ±{processedCycleData.cycleVariability}{" "}
                    days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Cycle Calendar
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(subDays(selectedDate, 30))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <p className="text-white font-medium">
                  {format(selectedDate, "MMMM yyyy")}
                </p>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 30))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-purple-300 font-medium py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const cycleDay = getCycleDayForDate(day);
                const isPeriod = isInPeriod(day);
                const isToday = isSameDay(day, new Date());
                const phase = cycleDay
                  ? getCyclePhase(cycleDay, processedCycleData.cycleLength)
                  : null;

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                    relative aspect-square p-1 rounded-lg text-center
                    ${isToday ? "ring-2 ring-white" : ""}
                    ${isPeriod ? "bg-red-500/30" : ""}
                    ${phase === "ovulation" ? "bg-yellow-500/20" : ""}
                    ${phase === "follicular" ? "bg-pink-500/10" : ""}
                    ${phase === "luteal" ? "bg-purple-500/10" : ""}
                  `}
                  >
                    <p className="text-sm text-white">{format(day, "d")}</p>
                    {cycleDay && (
                      <p className="text-xs text-purple-200 mt-0.5">
                        {cycleDay}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/30 rounded" />
                <span className="text-purple-200">Period</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500/20 rounded" />
                <span className="text-purple-200">Ovulation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase Information Modal */}
      {showPhaseInfo && selectedPhase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 backdrop-blur-md rounded-xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(phaseInfo[selectedPhase].icon, {
                  className: "w-8 h-8 text-white",
                })}
                <h3 className="text-2xl font-bold text-white">
                  {phaseInfo[selectedPhase].name}
                </h3>
              </div>
              <button
                onClick={() => setShowPhaseInfo(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-purple-100 mb-4">
              {phaseInfo[selectedPhase].description}
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-purple-300 mb-1">
                  Duration
                </p>
                <p className="text-white">
                  {phaseInfo[selectedPhase].duration}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-300 mb-1">
                  Hormones
                </p>
                <p className="text-white">
                  {phaseInfo[selectedPhase].hormones}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-300 mb-2">
                  Common Symptoms
                </p>
                <div className="flex flex-wrap gap-2">
                  {phaseInfo[selectedPhase].symptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-purple-100"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-300 mb-2">
                  Tips & Recommendations
                </p>
                <ul className="space-y-2">
                  {phaseInfo[selectedPhase].tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-100 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cycle Length Modal */}
      {editingCycleLength && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 backdrop-blur-md rounded-xl p-6 max-w-sm w-full border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              Customize Cycle Length
            </h3>

            <p className="text-purple-100 mb-4">
              Set your average cycle length. The typical range is 21-35 days.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Cycle Length (days)
              </label>
              <input
                type="number"
                min="21"
                max="90"
                value={customCycleLength}
                onChange={(e) =>
                  setCustomCycleLength(parseInt(e.target.value) || 28)
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingCycleLength(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCycleLengthUpdate(customCycleLength)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleIntelligenceTab;
