// frontend/ src/pages/PersonalWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  Moon,
  Sun,
  Activity,
  Info,
  Lock,
  ChevronRight,
  Shield,
} from "lucide-react";

const PersonalWomensHealth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [cycleDay, setCycleDay] = useState("");
  const [periodFlow, setPeriodFlow] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [saving, setSaving] = useState(false);

  // Basic symptoms list
  const basicSymptoms = [
    "Cramps",
    "Headache",
    "Mood swings",
    "Fatigue",
    "Bloating",
    "Back pain",
  ];

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user, currentDate]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);

      // Get first and last day of current month
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(
        `/api/womens-health?user_id=${user.id}&date_from=${
          firstDay.toISOString().split("T")[0]
        }&date_to=${lastDay.toISOString().split("T")[0]}&tier=basic`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch health data");
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    // Check if there's an entry for this date
    const existingEntry = entries.find(
      (e) => e.date === date.toISOString().split("T")[0]
    );

    if (existingEntry) {
      setCycleDay(existingEntry.data.cycle?.day?.toString() || "");
      setPeriodFlow(existingEntry.data.flow || "");
      setSymptoms(existingEntry.data.symptoms || []);
    } else {
      setCycleDay("");
      setPeriodFlow("");
      setSymptoms([]);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !user) return;

    setSaving(true);
    try {
      const healthData = {
        cycle: cycleDay ? { day: parseInt(cycleDay) } : null,
        flow: periodFlow || null,
        symptoms: symptoms.length > 0 ? symptoms : null,
      };

      const response = await fetch("/api/womens-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          date: selectedDate.toISOString().split("T")[0],
          health_data: healthData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save health data");
      }

      // Refresh data
      await fetchHealthData();

      // Clear form
      setSelectedDate(null);
      setCycleDay("");
      setPeriodFlow("");
      setSymptoms([]);
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Calendar helpers
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEntryForDate = (date) => {
    if (!date) return null;
    return entries.find((e) => e.date === date.toISOString().split("T")[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Women's Health Tracking
            </h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/20"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-300">
            Basic cycle tracking and symptom logging
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 p-4 backdrop-blur-xl bg-purple-500/10 rounded-xl shadow-xl border border-purple-400/30 flex items-start gap-3">
          <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-purple-200 font-semibold mb-1">
              Your Privacy Matters
            </p>
            <p className="text-gray-300">
              All health data is encrypted and visible only to you. We never
              share your personal health information.
            </p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1
                  )
                )
              }
              className="p-2 hover:bg-white/10 rounded transition"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1
                  )
                )
              }
              className="p-2 hover:bg-white/10 rounded transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs text-gray-400 p-2">
                {day}
              </div>
            ))}
            {getDaysInMonth().map((date, index) => {
              const entry = date ? getEntryForDate(date) : null;
              const isToday =
                date && date.toDateString() === new Date().toDateString();
              const isSelected =
                date &&
                selectedDate &&
                date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-2 rounded-lg cursor-pointer transition
                    ${!date ? "" : "hover:bg-white/10"}
                    ${isToday ? "ring-2 ring-purple-400" : ""}
                    ${isSelected ? "bg-purple-600/30" : ""}
                    ${entry?.data.flow ? "bg-pink-600/20" : ""}
                  `}
                  onClick={() => date && handleDateClick(date)}
                >
                  {date && (
                    <>
                      <div className="text-sm">{date.getDate()}</div>
                      {entry && (
                        <div className="mt-1 flex gap-1 justify-center">
                          {entry.data.flow && (
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                          )}
                          {entry.data.symptoms &&
                            entry.data.symptoms.length > 0 && (
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                            )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Entry Form */}
        {selectedDate && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {/* Cycle Day */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Cycle Day (optional)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={cycleDay}
                onChange={(e) => setCycleDay(e.target.value)}
                className="w-full px-3 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 shadow-xl"
                placeholder="Enter day of cycle"
              />
            </div>

            {/* Period Flow */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Period Flow (if applicable)
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
              <label className="block text-sm font-medium mb-2">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {basicSymptoms.map((symptom) => (
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

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        )}

        {/* Upgrade Prompt */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl shadow-2xl border border-pink-400/30 p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Unlock Advanced Features
          </h3>
          <p className="text-purple-300 mb-4">
            Upgrade to Growth or higher for:
          </p>
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-pink-400" />
              Cycle predictions and fertile window tracking
            </li>
            <li className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-pink-400" />
              Symptom pattern analysis
            </li>
            <li className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-pink-400" />
              Phase-based wellness recommendations
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-400" />
              Mood and energy correlations with cycle
            </li>
          </ul>
          <button
            onClick={() => navigate("/pricing")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Upgrade Now
          </button>
        </div>

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-white/20">
              <h3 className="text-xl font-semibold mb-4">
                About Women's Health Tracking
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  Track your menstrual cycle, symptoms, and patterns in a safe,
                  private environment.
                </p>
                <p>
                  <strong className="text-purple-300">
                    Basic features include:
                  </strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Calendar view of your cycle</li>
                  <li>Basic symptom tracking</li>
                  <li>Period flow recording</li>
                  <li>Cycle day tracking</li>
                </ul>
                <p>
                  <strong className="text-purple-300">Your privacy:</strong> All
                  data is encrypted and only you can see it. We never share your
                  health information.
                </p>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="mt-6 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalWomensHealth;
