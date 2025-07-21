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

  // Process cycle data from props
  const processedCycleData = processCycleData(healthData, cycleData, profile);
  const hasData = healthData && healthData.length > 0;
  const hasMinimumData = healthData && healthData.length >= 2; // Need at least 2 periods for cycle calculation

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
    if (!entries || entries.length === 0) {
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

    // Find period starts
    const periodStarts = entries
      .filter(
        (entry) =>
          entry.data?.periodFlow &&
          entry.data.periodFlow !== "none" &&
          entry.data.periodDay === 1
      )
      .map((entry) => new Date(entry.date))
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
      const periodDays = entries.filter(
        (e) =>
          e.data?.periodFlow &&
          e.data.periodFlow !== "none" &&
          new Date(e.date) >= periodStarts[i + 1] &&
          new Date(e.date) < periodStarts[i]
      ).length;

      cycles.push({
        startDate: periodStarts[i + 1],
        endDate: periodStarts[i],
        length: cycleLength,
        periodLength: periodDays || 5,
      });
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
    if (!day) return null;

    if (day <= 5) return "menstrual";
    if (day <= Math.floor(cycleLength / 2) - 2) return "follicular";
    if (day <= Math.floor(cycleLength / 2) + 2) return "ovulation";
    return "luteal";
  }

  // Handle cycle length update
  const handleCycleLengthUpdate = async (newLength) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            average_cycle_length: newLength,
          }),
        }
      );

      if (response.ok) {
        setEditingCycleLength(false);
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

  const currentPhaseInfo = processedCycleData.currentPhase
    ? phaseInfo[processedCycleData.currentPhase]
    : phaseInfo.menstrual;

  // Calculate predictions
  const predictions = {
    nextPeriod: processedCycleData.lastPeriodStart
      ? addDays(
          processedCycleData.lastPeriodStart,
          processedCycleData.cycleLength
        )
      : null,
    ovulation: processedCycleData.lastPeriodStart
      ? addDays(
          processedCycleData.lastPeriodStart,
          Math.floor(processedCycleData.cycleLength / 2)
        )
      : null,
    fertileWindow: processedCycleData.lastPeriodStart
      ? {
          start: addDays(
            processedCycleData.lastPeriodStart,
            Math.floor(processedCycleData.cycleLength / 2) - 5
          ),
          end: addDays(
            processedCycleData.lastPeriodStart,
            Math.floor(processedCycleData.cycleLength / 2) + 1
          ),
        }
      : { start: null, end: null },
  };

  // Prepare chart data for cycle length variations
  const cycleChartData = processedCycleData.cycles
    .map((cycle, index) => ({
      name: `Cycle ${processedCycleData.cycles.length - index}`,
      length: cycle.length,
      average: processedCycleData.averageCycleLength,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* Current Cycle Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Current Cycle</h3>
          {processedCycleData.lastPeriodStart && (
            <button
              onClick={() => setEditingCycleLength(true)}
              className="text-sm text-purple-200 hover:text-white flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              Customize
            </button>
          )}
        </div>

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Cycle Wheel */}
            <div className="flex justify-center mb-8">
              <div className="relative w-80 h-80">
                {/* Cycle phases wheel */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Menstrual phase */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.6)"
                    strokeWidth="60"
                    strokeDasharray={`${
                      (5 / processedCycleData.cycleLength) * 2 * Math.PI * 40
                    }% ${100}%`}
                    transform="rotate(-90 160 160)"
                  />
                  {/* Follicular phase */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke="rgba(236, 72, 153, 0.6)"
                    strokeWidth="60"
                    strokeDasharray={`${
                      ((processedCycleData.cycleLength / 2 - 7) /
                        processedCycleData.cycleLength) *
                      2 *
                      Math.PI *
                      40
                    }% ${100}%`}
                    strokeDashoffset={`-${
                      (5 / processedCycleData.cycleLength) * 2 * Math.PI * 40
                    }%`}
                  />
                  {/* Ovulation phase */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.6)"
                    strokeWidth="60"
                    strokeDasharray={`${
                      (5 / processedCycleData.cycleLength) * 2 * Math.PI * 40
                    }% ${100}%`}
                    strokeDashoffset={`-${
                      ((processedCycleData.cycleLength / 2 - 2) /
                        processedCycleData.cycleLength) *
                      2 *
                      Math.PI *
                      40
                    }%`}
                  />
                  {/* Luteal phase */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.6)"
                    strokeWidth="60"
                    strokeDasharray={`${
                      ((processedCycleData.cycleLength -
                        processedCycleData.cycleLength / 2 -
                        3) /
                        processedCycleData.cycleLength) *
                      2 *
                      Math.PI *
                      40
                    }% ${100}%`}
                    strokeDashoffset={`-${
                      ((processedCycleData.cycleLength / 2 + 3) /
                        processedCycleData.cycleLength) *
                      2 *
                      Math.PI *
                      40
                    }%`}
                  />
                  {/* Current day indicator */}
                  {processedCycleData.currentDay && (
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray="2 4"
                      transform={`rotate(${
                        (processedCycleData.currentDay /
                          processedCycleData.cycleLength) *
                          360 -
                        90
                      } 160 160)`}
                    />
                  )}
                </svg>

                {/* Center info */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <currentPhaseInfo.icon className="w-12 h-12 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {processedCycleData.currentPhase
                        ? currentPhaseInfo.name
                        : "Track Your Cycle"}
                    </p>
                    <p className="text-purple-200 text-sm mt-1">
                      {processedCycleData.currentDay
                        ? `Day ${processedCycleData.currentDay} of ${processedCycleData.cycleLength}`
                        : "Start tracking to see your phase"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Legend */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(phaseInfo).map(([phase, info]) => (
                <button
                  key={phase}
                  onClick={() => {
                    setSelectedPhase(phase);
                    setShowPhaseInfo(true);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${info.color}`} />
                  <span className="text-sm text-purple-200">
                    {info.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Predictions & Next Events */}
      {hasData && predictions.nextPeriod && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">
            Upcoming Events
          </h3>

          <div className="space-y-4">
            {/* Next Period */}
            <div className="flex items-center justify-between p-4 bg-red-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white font-medium">Next Period</p>
                  <p className="text-red-200 text-sm">
                    Expected {format(predictions.nextPeriod, "MMM d")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  {differenceInDays(predictions.nextPeriod, new Date())} days
                </p>
                <p className="text-red-200 text-sm">from today</p>
              </div>
            </div>

            {/* Ovulation */}
            {predictions.ovulation &&
              differenceInDays(predictions.ovulation, new Date()) > 0 && (
                <div className="flex items-center justify-between p-4 bg-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">Ovulation</p>
                      <p className="text-yellow-200 text-sm">
                        Expected {format(predictions.ovulation, "MMM d")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {differenceInDays(predictions.ovulation, new Date())} days
                    </p>
                    <p className="text-yellow-200 text-sm">from today</p>
                  </div>
                </div>
              )}

            {/* Fertile Window */}
            {predictions.fertileWindow.start &&
              differenceInDays(predictions.fertileWindow.end, new Date()) >
                0 && (
                <div className="p-4 bg-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-green-400" />
                    <p className="text-white font-medium">Fertile Window</p>
                  </div>
                  <p className="text-green-200 text-sm">
                    {format(predictions.fertileWindow.start, "MMM d")} -{" "}
                    {format(predictions.fertileWindow.end, "MMM d")}
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Cycle Patterns */}
      {lifeStage === "perimenopause" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">
            Cycle Irregularity Tracking
          </h3>

          {!hasMinimumData ? (
            <EmptyState minDataRequired={true} />
          ) : (
            <>
              <div className="bg-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-100 font-medium mb-1">
                      Tracking Irregular Cycles
                    </p>
                    <p className="text-yellow-200 text-sm">
                      During perimenopause, cycles may vary significantly. Your
                      average cycle is {processedCycleData.averageCycleLength}{" "}
                      days with a variation of ±
                      {processedCycleData.cycleVariability} days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cycle Length Chart */}
              {cycleChartData.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cycleChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="name" stroke="#E9D5FF" />
                      <YAxis stroke="#E9D5FF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.9)",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="length"
                        stroke="#F472B6"
                        strokeWidth={2}
                        dot={{ fill: "#F472B6", r: 6 }}
                        name="Cycle Length"
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Average"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Cycle History */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Cycles</h3>

        {!hasMinimumData ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-purple-200">
              Your cycle history will appear here after tracking 2 or more
              cycles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedCycleData.cycles.slice(0, 6).map((cycle, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {format(cycle.startDate, "MMM d")} -{" "}
                    {format(cycle.endDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-purple-200 text-sm">
                    {cycle.periodLength} day period
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{cycle.length} days</p>
                  <p
                    className={`text-sm ${
                      Math.abs(
                        cycle.length - processedCycleData.averageCycleLength
                      ) <= 3
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {cycle.length > processedCycleData.averageCycleLength
                      ? "+"
                      : ""}
                    {cycle.length - processedCycleData.averageCycleLength} from
                    avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            const isToday = isSameDay(date, new Date());

            // Find if this date has tracked data
            const dayData = healthData.find((entry) =>
              isSameDay(new Date(entry.date), date)
            );

            // Calculate phase for this date if we have period data
            let phase = null;
            let dayOfCycle = null;

            if (processedCycleData.lastPeriodStart) {
              const daysSince = differenceInDays(
                date,
                processedCycleData.lastPeriodStart
              );
              if (daysSince >= 0) {
                dayOfCycle = (daysSince % processedCycleData.cycleLength) + 1;
                phase = getCyclePhase(
                  dayOfCycle,
                  processedCycleData.cycleLength
                );
              }
            }

            const isPeriod =
              dayData?.data?.periodFlow && dayData.data.periodFlow !== "none";
            const hasSymptoms =
              dayData?.data &&
              (dayData.data.cramps > 0 ||
                dayData.data.headache > 0 ||
                dayData.data.mood < 3);

            return (
              <div
                key={date.toISOString()}
                className={`
                  relative p-3 rounded-lg border transition-all cursor-pointer
                  ${isToday ? "border-white" : "border-white/20"}
                  ${
                    isPeriod
                      ? "bg-red-500/20"
                      : phase === "ovulation"
                      ? "bg-yellow-500/10"
                      : phase === "fertile"
                      ? "bg-green-500/10"
                      : "bg-white/5"
                  }
                  hover:bg-white/10
                `}
              >
                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${
                      isToday ? "text-white" : "text-purple-200"
                    }`}
                  >
                    {format(date, "d")}
                  </p>
                  {dayOfCycle && (
                    <p className="text-xs text-purple-300 mt-1">
                      CD{dayOfCycle}
                    </p>
                  )}
                </div>

                {/* Data indicators */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {isPeriod && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                  {hasSymptoms && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  )}
                  {dayData && !isPeriod && !hasSymptoms && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-purple-200">Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-purple-200">Symptoms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-purple-200">Data logged</span>
          </div>
        </div>
      </div>

      {/* Phase Information Modal */}
      {showPhaseInfo && selectedPhase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {phaseInfo[selectedPhase].name}
              </h3>
              <button
                onClick={() => setShowPhaseInfo(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const PhaseIcon = phaseInfo[selectedPhase].icon;
                  return <PhaseIcon className="w-8 h-8 text-white" />;
                })()}
                <div
                  className={`w-4 h-4 rounded-full ${phaseInfo[selectedPhase].color}`}
                />
              </div>

              <p className="text-purple-100">
                {phaseInfo[selectedPhase].description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-300 text-sm mb-1">Duration</p>
                  <p className="text-white font-medium">
                    {phaseInfo[selectedPhase].duration}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-300 text-sm mb-1">Hormones</p>
                  <p className="text-white font-medium text-sm">
                    {phaseInfo[selectedPhase].hormones}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Common Symptoms</h4>
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
                <h4 className="text-white font-medium mb-2">Tips</h4>
                <div className="space-y-2">
                  {phaseInfo[selectedPhase].tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
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
                  value={customCycleLength}
                  onChange={(e) =>
                    setCustomCycleLength(parseInt(e.target.value))
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
                  onClick={() => handleCycleLengthUpdate(customCycleLength)}
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
