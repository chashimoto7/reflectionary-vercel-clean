//src/pages/BasicWellness
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Activity,
  Heart,
  Moon,
  Dumbbell,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BasicWellness = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saveLabel, setSaveLabel] = useState("Save Entry");
  const [recentEntries, setRecentEntries] = useState([]);
  const [todayEntry, setTodayEntry] = useState(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(5);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");

  useEffect(() => {
    // Only load data if we have an authenticated user
    if (user?.id) {
      setUserId(user.id);
      loadWellnessData(user.id);
      loadTodayEntry(user.id);
    }
  }, [user, date]);

  const loadTodayEntry = async (userId) => {
    try {
      // Query for an existing entry for the selected date
      const { data: existingEntry, error } = await supabase
        .from("wellness_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("entry_date", date)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is fine
        console.error("Error loading today's entry:", error);
        setTodayEntry(null);
        resetForm();
        return;
      }

      if (existingEntry) {
        // Found existing entry - populate the form
        setTodayEntry(existingEntry);
        setMood(existingEntry.mood || 5);
        setEnergy(existingEntry.energy || 5);
        setSleepHours(
          existingEntry.sleep_hours ? existingEntry.sleep_hours.toString() : ""
        );
        setSleepQuality(existingEntry.sleep_quality || 5);
        setExerciseType(existingEntry.exercise_type || "");
        setExerciseDuration(
          existingEntry.exercise_duration
            ? existingEntry.exercise_duration.toString()
            : ""
        );
      } else {
        // No existing entry - reset form to defaults
        setTodayEntry(null);
        resetForm();
      }
    } catch (err) {
      console.error("Unexpected error loading today's entry:", err);
      setTodayEntry(null);
      resetForm();
    }
  };

  const loadWellnessData = async (userId) => {
    try {
      setLoading(true);

      // Query real wellness data from Supabase
      const { data: wellnessEntries, error } = await supabase
        .from("wellness_tracking")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error loading wellness data:", error);
        setRecentEntries([]); // Set empty array on error
        return;
      }

      // Set the real data (or empty array if no data)
      setRecentEntries(wellnessEntries || []);
    } catch (err) {
      console.error("Unexpected error loading wellness data:", err);
      setRecentEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMood(5);
    setEnergy(5);
    setSleepHours("");
    setSleepQuality(5);
    setExerciseType("");
    setExerciseDuration("");
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaveLabel("Saving...");

    try {
      const entryData = {
        user_id: userId,
        entry_date: date,
        mood: mood,
        energy: energy,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepHours ? sleepQuality : null,
        exercise_type: exerciseType || null,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,
      };

      let savedEntry;

      if (todayEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from("wellness_tracking")
          .update(entryData)
          .eq("id", todayEntry.id)
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from("wellness_tracking")
          .insert([entryData])
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      }

      // Update local state
      setTodayEntry(savedEntry);

      // Update recent entries list
      if (todayEntry) {
        // Replace existing entry in the list
        setRecentEntries((entries) =>
          entries.map((entry) =>
            entry.id === todayEntry.id ? savedEntry : entry
          )
        );
      } else {
        // Add new entry to the beginning of the list
        setRecentEntries((entries) => [savedEntry, ...entries]);
      }

      setSaveLabel("Saved!");

      setTimeout(() => {
        setSaveLabel("Save Entry");
      }, 2000);
    } catch (error) {
      console.error("Error saving wellness entry:", error);
      setSaveLabel("Error saving");

      setTimeout(() => {
        setSaveLabel("Save Entry");
      }, 2000);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    return recentEntries
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        date: new Date(entry.entry_date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        mood: entry.mood,
        energy: entry.energy,
        sleep: entry.sleep_hours || 0,
      }));
  };

  const getWeeklyStats = () => {
    const lastWeek = recentEntries.slice(0, 7);

    if (lastWeek.length === 0) {
      return {
        avgMood: "—",
        avgEnergy: "—",
        avgSleep: "—",
        exerciseDays: "—",
      };
    }

    const avgMood =
      lastWeek.reduce((sum, e) => sum + (e.mood || 0), 0) / lastWeek.length;
    const avgEnergy =
      lastWeek.reduce((sum, e) => sum + (e.energy || 0), 0) / lastWeek.length;
    const sleepEntries = lastWeek.filter((e) => e.sleep_hours);
    const avgSleep =
      sleepEntries.length > 0
        ? sleepEntries.reduce((sum, e) => sum + e.sleep_hours, 0) /
          sleepEntries.length
        : 0;
    const exerciseDays = lastWeek.filter((e) => e.exercise_duration > 0).length;

    return {
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      exerciseDays,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-purple-600">Loading wellness tracking...</div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wellness Tracking
          </h1>
          <p className="text-gray-600">
            Track your daily wellness metrics to understand patterns
          </p>
        </div>

        {/* Weekly Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Mood</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {weeklyStats.avgMood}/10
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Energy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {weeklyStats.avgEnergy}/10
                </p>
              </div>
              <Activity className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Sleep</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {weeklyStats.avgSleep}h
                </p>
              </div>
              <Moon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exercise Days</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {weeklyStats.exerciseDays}/7
                </p>
              </div>
              <Dumbbell className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Daily Entry
              </h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-6">
              {/* Mood Slider */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Mood: {mood}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                      (mood - 1) * 11.11
                    }%, #e5e7eb ${(mood - 1) * 11.11}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Energy Slider */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Energy: {energy}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                      (energy - 1) * 11.11
                    }%, #e5e7eb ${(energy - 1) * 11.11}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Sleep Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    Sleep Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="7.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Quality: {sleepQuality}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    disabled={!sleepHours}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Exercise Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Dumbbell className="w-4 h-4 text-green-500" />
                    Exercise Type
                  </label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">None</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength Training</option>
                    <option value="yoga">Yoga</option>
                    <option value="walking">Walking</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    placeholder="30"
                    disabled={!exerciseType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                {saveLabel}
              </button>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              7-Day Trends
            </h3>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899", r: 4 }}
                    name="Mood"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                    name="Energy"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <h4 className="font-medium text-gray-700 mb-2">
                    Start Your Wellness Journey
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Track your daily wellness to see trends and patterns over
                    time.
                  </p>
                  <p className="text-xs text-gray-400">
                    💡 Fill out the form on the left to begin tracking
                  </p>
                </div>
              </div>
            )}

            {/* Upgrade Prompt */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Want deeper insights?
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Upgrade to Advanced Wellness for correlations, patterns, and
                    personalized recommendations.
                  </p>
                  <button className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-700">
                    View pricing →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicWellness;
