// frontend/ src/pages/StandardWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Heart,
  Moon,
  Sun,
  Calendar,
  BookOpen,
  Thermometer,
  TrendingUp,
  Info,
  Shield,
  Flower,
  Activity,
  Brain,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StandardWomensHealth = () => {
  const { user } = useAuth();
  const { hasAccess } = useMembership();
  const [healthData, setHealthData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cycleAnalysis, setCycleAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Entry form state
  const [cycleDay, setCycleDay] = useState("");
  const [periodFlow, setPeriodFlow] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [notes, setNotes] = useState("");

  // Standard symptoms list
  const standardSymptoms = [
    "Cramps",
    "Headache",
    "Mood swings",
    "Fatigue",
    "Bloating",
    "Back pain",
    "Breast tenderness",
    "Acne",
    "Food cravings",
    "Irritability",
    "Anxiety",
    "Insomnia",
  ];

  // Phase descriptions
  const phaseInfo = {
    menstrual: {
      name: "Menstrual Phase",
      days: "Days 1-5",
      description: "Your period. Energy may be lower.",
      tips: ["Rest when needed", "Stay hydrated", "Gentle exercise"],
      color: "#EF4444",
    },
    follicular: {
      name: "Follicular Phase",
      days: "Days 6-14",
      description: "Energy rising, mood improving.",
      tips: ["Great time for new projects", "Increase exercise intensity"],
      color: "#10B981",
    },
    ovulatory: {
      name: "Ovulatory Phase",
      days: "Days 15-17",
      description: "Peak energy and mood.",
      tips: ["Social activities", "High-intensity workouts"],
      color: "#F59E0B",
    },
    luteal: {
      name: "Luteal Phase",
      days: "Days 18-28",
      description: "Energy declining, PMS possible.",
      tips: ["Practice self-care", "Reduce stress", "Moderate exercise"],
      color: "#8B5CF6",
    },
  };

  useEffect(() => {
    if (user && hasAccess("womens_health")) {
      fetchHealthData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/womens-health?user_id=${user.id}&include_cycle_analysis=true&tier=standard`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch health data");
      }

      const data = await response.json();
      setHealthData(data);
      setProfile(data.profile);
      setCycleAnalysis(data.cycleAnalysis);
    } catch (error) {
      console.error("Error fetching health data:", error);
      setError("Failed to load women's health data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    setSaving(true);
    try {
      const healthEntry = {
        cycle: {
          day: cycleDay ? parseInt(cycleDay) : null,
          phase: calculatePhase(parseInt(cycleDay)),
        },
        flow: periodFlow || null,
        symptoms: symptoms.length > 0 ? symptoms : null,
        mood: {
          overall: mood ? parseInt(mood) : null,
          energy: energy ? parseInt(energy) : null,
        },
        notes: notes || null,
      };

      const response = await fetch("/api/womens-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          date: selectedDate.toISOString().split("T")[0],
          health_data: healthEntry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save health data");
      }

      await fetchHealthData();
      setShowEntryModal(false);
      clearForm();
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const calculatePhase = (day) => {
    if (!day) return null;
    if (day <= 5) return "menstrual";
    if (day <= 14) return "follicular";
    if (day <= 17) return "ovulatory";
    return "luteal";
  };

  const clearForm = () => {
    setCycleDay("");
    setPeriodFlow("");
    setSymptoms([]);
    setMood("");
    setEnergy("");
    setNotes("");
  };

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading women's health data...</p>
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
            onClick={fetchHealthData}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Current phase calculation
  const currentPhase = profile?.last_period_date
    ? calculatePhase(
        Math.floor(
          (new Date() - new Date(profile.last_period_date)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Women's Health Insights
              </h1>
              <p className="text-gray-300">
                Track your cycle and understand your patterns
              </p>
            </div>
            <button
              onClick={() => setShowEntryModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Log Today
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 p-4 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20 flex items-start gap-3">
          <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-purple-200 font-semibold mb-1">
              Your Privacy is Protected
            </p>
            <p className="text-gray-300">
              All health data is end-to-end encrypted. Only you can see this
              information.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {["overview", "cycle", "symptoms", "insights"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Current Phase */}
            {currentPhase && (
              <div
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
                style={{ borderColor: phaseInfo[currentPhase].color + "40" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Flower
                        className="h-6 w-6"
                        style={{ color: phaseInfo[currentPhase].color }}
                      />
                      {phaseInfo[currentPhase].name}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {phaseInfo[currentPhase].description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-200">
                        Tips for this phase:
                      </p>
                      {phaseInfo[currentPhase].tips.map((tip, index) => (
                        <p
                          key={index}
                          className="text-sm text-gray-300 flex items-center gap-2"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Typical days</p>
                    <p className="text-lg font-semibold">
                      {phaseInfo[currentPhase].days}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-purple-400" />
                  <span className="text-3xl font-bold">
                    {profile?.average_cycle_length || 28}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">Average Cycle</h3>
                <p className="text-sm text-gray-300">days</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-8 w-8 text-pink-400" />
                  <span className="text-3xl font-bold">
                    {cycleAnalysis?.cycleRegularity || "Regular"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">Cycle Pattern</h3>
                <p className="text-sm text-gray-300">consistency</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="h-8 w-8 text-blue-400" />
                  <span className="text-3xl font-bold">
                    {healthData.entries?.length || 0}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">Entries Logged</h3>
                <p className="text-sm text-gray-300">this cycle</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cycle" && (
          <div className="space-y-6">
            {/* Cycle Calendar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4">Cycle Calendar</h3>
              {/* Simplified calendar view */}
              <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-gray-400 p-2"
                  >
                    {day}
                  </div>
                ))}
                {/* Calendar days would go here */}
              </div>
            </div>

            {/* Phase Analysis */}
            {cycleAnalysis?.phasePatterns && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-4">Phase Patterns</h3>
                <div className="space-y-4">
                  {Object.entries(cycleAnalysis.phasePatterns).map(
                    ([phase, data]) => (
                      <div
                        key={phase}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: phaseInfo[phase]?.color }}
                          />
                          <span className="font-medium">
                            {phaseInfo[phase]?.name || phase}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <p>Avg Mood: {data.averageMood || "N/A"}</p>
                          <p>Avg Energy: {data.averageEnergy || "N/A"}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "symptoms" && (
          <div className="space-y-6">
            {/* Symptom Frequency */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4">Common Symptoms</h3>
              <div className="space-y-3">
                {cycleAnalysis?.symptomPatterns &&
                  Object.entries(cycleAnalysis.symptomPatterns)
                    .slice(0, 5)
                    .map(([day, symptoms]) => (
                      <div key={day} className="p-3 bg-white/5 rounded-lg">
                        <p className="font-medium mb-2">Cycle {day}</p>
                        <div className="flex flex-wrap gap-2">
                          {symptoms.map((symptom, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-600/30 rounded-full text-xs"
                            >
                              {symptom.symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Mood by Phase Chart */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4">Mood Across Phases</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      cycleAnalysis?.phasePatterns
                        ? Object.entries(cycleAnalysis.phasePatterns).map(
                            ([phase, data]) => ({
                              phase: phaseInfo[phase]?.name || phase,
                              mood: parseFloat(data.averageMood) || 0,
                              energy: parseFloat(data.averageEnergy) || 0,
                            })
                          )
                        : []
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="phase" stroke="rgba(255,255,255,0.5)" />
                    <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(139,92,246,0.5)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#EC4899"
                      fill="#EC4899"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#06B6D4"
                      fill="#06B6D4"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                Your Patterns
              </h3>
              <div className="space-y-4">
                {cycleAnalysis?.cycleRegularity && (
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="font-medium text-purple-300 mb-1">
                      Cycle Regularity
                    </p>
                    <p className="text-gray-300">
                      Your cycle is {cycleAnalysis.cycleRegularity}. This helps
                      predict future cycles with
                      {cycleAnalysis.cycleRegularity === "very regular"
                        ? " high"
                        : " moderate"}{" "}
                      accuracy.
                    </p>
                  </div>
                )}

                {cycleAnalysis?.phasePatterns && (
                  <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                    <p className="font-medium text-pink-300 mb-1">Best Phase</p>
                    <p className="text-gray-300">
                      You tend to feel best during your follicular phase with
                      higher energy and mood scores.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="font-medium text-blue-300 mb-1">Tracking Tip</p>
                  <p className="text-gray-300">
                    Continue logging daily to build more accurate predictions
                    and discover your unique patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                Log Health Data for {selectedDate.toLocaleDateString()}
              </h3>

              {/* Cycle Day */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Cycle Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={cycleDay}
                  onChange={(e) => setCycleDay(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  placeholder="What day of your cycle?"
                />
              </div>

              {/* Period Flow */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Period Flow
                </label>
                <div className="flex gap-2">
                  {["Light", "Medium", "Heavy"].map((flow) => (
                    <button
                      key={flow}
                      onClick={() =>
                        setPeriodFlow(periodFlow === flow ? "" : flow)
                      }
                      className={`px-4 py-2 rounded-lg transition ${
                        periodFlow === flow
                          ? "bg-pink-600 text-white"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {flow}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Symptoms
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {standardSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-2 rounded-lg text-sm transition ${
                        symptoms.includes(symptom)
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood & Energy */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mood (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
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
                    value={energy}
                    onChange={(e) => setEnergy(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 h-20"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEntry}
                  disabled={saving}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Entry"}
                </button>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    clearForm();
                  }}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardWomensHealth;
