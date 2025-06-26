//src/pages/BasicWomensHealth
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Plus, TrendingUp, Heart, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const BasicWomensHealth = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cycleData, setCycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    cycle_day: "",
    flow_level: "",
    symptoms: [],
    mood: "",
    notes: "",
  });

  const SYMPTOMS = [
    "cramps",
    "bloating",
    "headache",
    "fatigue",
    "nausea",
    "breast_tenderness",
    "mood_swings",
    "irritability",
    "acne",
    "back_pain",
    "food_cravings",
    "insomnia",
  ];

  const FLOW_LEVELS = ["none", "spotting", "light", "medium", "heavy"];
  const MOODS = ["great", "good", "okay", "low", "irritable", "anxious"];

  useEffect(() => {
    if (user) {
      fetchCycleData();
    }
  }, [user]);

  const fetchCycleData = async () => {
    try {
      const { data, error } = await supabase
        .from("womens_health_tracking")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching cycle data:", error);
      } else {
        setCycleData(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching cycle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    try {
      const entry = {
        user_id: user.id,
        date: selectedDate,
        cycle_day: currentEntry.cycle_day
          ? parseInt(currentEntry.cycle_day)
          : null,
        flow_level: currentEntry.flow_level || null,
        symptoms: currentEntry.symptoms,
        mood: currentEntry.mood || null,
        notes: currentEntry.notes || null,
      };

      const { error } = await supabase
        .from("womens_health_tracking")
        .upsert(entry, { onConflict: "user_id,date" });

      if (error) {
        console.error("Error saving entry:", error);
      } else {
        setShowAddEntry(false);
        setCurrentEntry({
          cycle_day: "",
          flow_level: "",
          symptoms: [],
          mood: "",
          notes: "",
        });
        fetchCycleData();
      }
    } catch (error) {
      console.error("Unexpected error saving entry:", error);
    }
  };

  const toggleSymptom = (symptom) => {
    const newSymptoms = currentEntry.symptoms.includes(symptom)
      ? currentEntry.symptoms.filter((s) => s !== symptom)
      : [...currentEntry.symptoms, symptom];

    setCurrentEntry((prev) => ({ ...prev, symptoms: newSymptoms }));
  };

  const generateCycleChart = () => {
    if (!cycleData.length) return [];

    return cycleData
      .filter((entry) => entry.cycle_day)
      .slice(0, 30)
      .reverse()
      .map((entry, index) => ({
        day: index + 1,
        cycle_day: entry.cycle_day,
        date: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  };

  const generateSymptomChart = () => {
    const symptomCounts = {};
    cycleData.forEach((entry) => {
      if (entry.symptoms) {
        entry.symptoms.forEach((symptom) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
    });

    return Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([symptom, count]) => ({
        symptom: symptom
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Women's Health Tracking
          </h1>
          <p className="text-gray-600">
            Track your menstrual cycle, symptoms, and patterns to better
            understand your health.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {cycleData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Days Tracked
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {cycleData.length
                    ? Math.ceil(
                        (new Date() -
                          new Date(cycleData[cycleData.length - 1]?.date)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Cycle Length
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {cycleData.filter((e) => e.cycle_day).length
                    ? Math.round(
                        cycleData
                          .filter((e) => e.cycle_day)
                          .reduce((sum, e) => sum + e.cycle_day, 0) /
                          cycleData.filter((e) => e.cycle_day).length
                      )
                    : 0}{" "}
                  days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Track Today</span>
          </button>
        </div>

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Health Entry
                </h3>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Cycle Day */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Day (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={currentEntry.cycle_day}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        cycle_day: e.target.value,
                      }))
                    }
                    placeholder="e.g., 1, 15, 28"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Flow Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flow Level
                  </label>
                  <select
                    value={currentEntry.flow_level}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        flow_level: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select flow level</option>
                    {FLOW_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Symptoms */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`text-xs p-2 rounded-md transition-colors ${
                          currentEntry.symptoms.includes(symptom)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {symptom
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <select
                    value={currentEntry.mood}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        mood: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select mood</option>
                    {MOODS.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={currentEntry.notes}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any additional notes..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddEntry(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {cycleData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cycle Tracking Chart */}
            {generateCycleChart().length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cycle Days Tracked
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateCycleChart()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cycle_day"
                      stroke="#EC4899"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Symptom Frequency Chart */}
            {generateSymptomChart().length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Common Symptoms
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateSymptomChart()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symptom" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start tracking your health
            </h3>
            <p className="text-gray-600 mb-6">
              Begin logging your cycle and symptoms to see patterns and
              insights.
            </p>
            <button
              onClick={() => setShowAddEntry(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Add Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicWomensHealth;
