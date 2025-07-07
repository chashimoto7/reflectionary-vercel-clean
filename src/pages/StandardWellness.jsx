// frontend/ src/pages/StandardWellness.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Activity,
  Moon,
  Droplets,
  Heart,
  Brain,
  Coffee,
  Apple,
  Dumbbell,
  Wind,
  TrendingUp,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StandardWellness = () => {
  const { user } = useAuth();
  const { hasAccess } = useMembership();
  const [wellnessData, setWellnessData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("track");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form state
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [moodScore, setMoodScore] = useState("");
  const [energyScore, setEnergyScore] = useState("");
  const [stressScore, setStressScore] = useState("");
  const [nutritionNotes, setNutritionNotes] = useState("");

  useEffect(() => {
    if (user && hasAccess("wellness")) {
      fetchWellnessData();
    }
  }, [user]);

  useEffect(() => {
    // Load existing data for selected date
    if (wellnessData && wellnessData.entries) {
      const existingEntry = wellnessData.entries.find(
        (e) => e.date === selectedDate
      );
      if (existingEntry) {
        loadEntryData(existingEntry.data);
      } else {
        clearForm();
      }
    }
  }, [selectedDate, wellnessData]);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/wellness?user_id=${user.id}&limit=30&include_stats=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wellness data");
      }

      const data = await response.json();
      setWellnessData(data);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching wellness data:", error);
      setError("Failed to load wellness data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadEntryData = (data) => {
    setSleepHours(data.sleep?.duration?.toString() || "");
    setSleepQuality(data.sleep?.quality?.toString() || "");
    setExerciseType(data.exercise?.type || "");
    setExerciseDuration(data.exercise?.duration?.toString() || "");
    setWaterIntake(data.hydration?.glasses?.toString() || "");
    setMoodScore(data.mood?.overall?.toString() || "");
    setEnergyScore(data.mood?.energy?.toString() || "");
    setStressScore(data.mood?.stress?.toString() || "");
    setNutritionNotes(data.nutrition?.notes || "");
  };

  const clearForm = () => {
    setSleepHours("");
    setSleepQuality("");
    setExerciseType("");
    setExerciseDuration("");
    setWaterIntake("");
    setMoodScore("");
    setEnergyScore("");
    setStressScore("");
    setNutritionNotes("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const wellnessEntry = {
        sleep:
          sleepHours || sleepQuality
            ? {
                duration: sleepHours ? parseFloat(sleepHours) : null,
                quality: sleepQuality ? parseInt(sleepQuality) : null,
              }
            : null,
        exercise:
          exerciseType || exerciseDuration
            ? {
                type: exerciseType || null,
                duration: exerciseDuration ? parseInt(exerciseDuration) : null,
              }
            : null,
        hydration: waterIntake
          ? {
              glasses: parseInt(waterIntake),
            }
          : null,
        mood:
          moodScore || energyScore || stressScore
            ? {
                overall: moodScore ? parseInt(moodScore) : null,
                energy: energyScore ? parseInt(energyScore) : null,
                stress: stressScore ? parseInt(stressScore) : null,
              }
            : null,
        nutrition: nutritionNotes
          ? {
              notes: nutritionNotes,
            }
          : null,
      };

      // Check if entry exists for this date
      const existingEntry = wellnessData?.entries?.find(
        (e) => e.date === selectedDate
      );

      const response = await fetch("/api/wellness", {
        method: existingEntry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          date: selectedDate,
          wellness_data: wellnessEntry,
          ...(existingEntry && { entry_id: existingEntry.id }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save wellness data");
      }

      setSaveStatus("success");
      await fetchWellnessData(); // Refresh data

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving wellness data:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading wellness data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchWellnessData}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Wellness Tracking
          </h1>
          <p className="text-gray-300">
            Monitor your health and well-being patterns
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("track")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "track"
                ? "bg-purple-600 text-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Track Today
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "trends"
                ? "bg-purple-600 text-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            View Trends
          </button>
        </div>

        {activeTab === "track" ? (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Sleep Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Moon className="h-6 w-6 text-purple-400" />
                Sleep
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hours Slept
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="e.g., 7.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sleep Quality (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="1-10"
                  />
                </div>
              </div>
            </div>

            {/* Exercise Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-green-400" />
                Exercise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type of Exercise
                  </label>
                  <input
                    type="text"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="e.g., Running, Yoga"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>

            {/* Hydration Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Droplets className="h-6 w-6 text-blue-400" />
                Hydration
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Glasses of Water
                </label>
                <input
                  type="number"
                  min="0"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  placeholder="Number of 8oz glasses"
                />
              </div>
            </div>

            {/* Mental Health Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-6 w-6 text-pink-400" />
                Mental Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mood (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="1-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Energy (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={energyScore}
                    onChange={(e) => setEnergyScore(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="1-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stress (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={stressScore}
                    onChange={(e) => setStressScore(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="1-10"
                  />
                </div>
              </div>
            </div>

            {/* Nutrition Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Apple className="h-6 w-6 text-red-400" />
                Nutrition
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={nutritionNotes}
                  onChange={(e) => setNutritionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 h-24"
                  placeholder="Any notes about your nutrition today..."
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Save Wellness Data
                </>
              )}
            </button>

            {/* Save Status */}
            {saveStatus && (
              <div
                className={`p-4 rounded-lg flex items-center gap-2 ${
                  saveStatus === "success"
                    ? "bg-green-500/20 border border-green-500/40 text-green-200"
                    : "bg-red-500/20 border border-red-500/40 text-red-200"
                }`}
              >
                {saveStatus === "success" ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Wellness data saved successfully!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Failed to save. Please try again.
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wellness Stats */}
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Moon className="h-8 w-8 text-purple-400" />
                      <span className="text-3xl font-bold">
                        {stats.sleep?.averageHours || 0}h
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">Avg Sleep</h3>
                    <p className="text-sm text-gray-300">
                      Trend: {stats.sleep?.trend || "stable"}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-8 w-8 text-green-400" />
                      <span className="text-3xl font-bold">
                        {stats.exercise?.daysActive || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">Active Days</h3>
                    <p className="text-sm text-gray-300">
                      {stats.exercise?.averagePerDay || 0} min/day avg
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="h-8 w-8 text-pink-400" />
                      <span className="text-3xl font-bold">
                        {stats.mood?.averageOverall || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">Avg Mood</h3>
                    <p className="text-sm text-gray-300">
                      Trend: {stats.mood?.moodTrend || "stable"}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sleep Trends */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Sleep Patterns
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={wellnessData.entries.slice(0, 7).reverse()}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.1)"
                          />
                          <XAxis
                            dataKey="date"
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
                              border: "1px solid rgba(139,92,246,0.5)",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="data.sleep.duration"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            dot={{ fill: "#8B5CF6" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Exercise Frequency */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Exercise Activity
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={wellnessData.entries.slice(0, 7).reverse()}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.1)"
                          />
                          <XAxis
                            dataKey="date"
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
                              border: "1px solid rgba(139,92,246,0.5)",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="data.exercise.duration"
                            fill="#10B981"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Correlations */}
                {stats.patterns?.correlations && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Wellness Correlations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Sleep ↔ Mood</p>
                        <p className="text-2xl font-bold text-purple-300">
                          {(
                            parseFloat(
                              stats.patterns.correlations.sleepVsMood
                            ) * 100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Exercise ↔ Mood</p>
                        <p className="text-2xl font-bold text-green-300">
                          {(
                            parseFloat(
                              stats.patterns.correlations.exerciseVsMood
                            ) * 100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">
                          Exercise ↔ Energy
                        </p>
                        <p className="text-2xl font-bold text-blue-300">
                          {(
                            parseFloat(
                              stats.patterns.correlations.exerciseVsEnergy
                            ) * 100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardWellness;
