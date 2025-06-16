// src/components/womenshealth/WomensHealthEntryModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import { supabase } from "../../lib/supabase";
import {
  X,
  Calendar,
  Heart,
  Moon,
  Activity,
  Brain,
  Thermometer,
  Clock,
  Droplets,
  Zap,
  Sun,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Plus,
  Minus,
  Save,
  Sparkles,
} from "lucide-react";

const WomensHealthEntryModal = ({
  isOpen,
  onClose,
  onDataSaved,
  initialData = null,
}) => {
  const { user } = useAuth();
  const { hasAccess } = useMembership();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Core data state
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isPeriodStart, setIsPeriodStart] = useState(false);
  const [cycleDay, setCycleDay] = useState("");
  const [cyclePhase, setCyclePhase] = useState("");

  // Symptoms state
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [overallSeverity, setOverallSeverity] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Wellness state
  const [moodRating, setMoodRating] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);

  // Advanced fields (for premium users)
  const [flowHeaviness, setFlowHeaviness] = useState("");
  const [exerciseIntensity, setExerciseIntensity] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [medicationsTaken, setMedicationsTaken] = useState([]);
  const [temperature, setTemperature] = useState("");
  const [cervicalMucus, setCervicalMucus] = useState("");
  const [breastTenderness, setBreastTenderness] = useState(0);

  // UI state
  const [activeSection, setActiveSection] = useState("basics");
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const isAdvancedUser = hasAccess("advanced_womens_health");

  // Common symptoms with icons
  const commonSymptoms = [
    { id: "cramps", label: "Cramps", icon: "🔥", category: "physical" },
    { id: "bloating", label: "Bloating", icon: "🎈", category: "physical" },
    { id: "headache", label: "Headache", icon: "🤕", category: "physical" },
    { id: "fatigue", label: "Fatigue", icon: "😴", category: "physical" },
    { id: "backpain", label: "Back Pain", icon: "⚡", category: "physical" },
    { id: "nausea", label: "Nausea", icon: "🤢", category: "physical" },
    {
      id: "breast_tenderness",
      label: "Breast Tenderness",
      icon: "💔",
      category: "physical",
    },
    {
      id: "mood_swings",
      label: "Mood Swings",
      icon: "🎭",
      category: "emotional",
    },
    {
      id: "irritability",
      label: "Irritability",
      icon: "😤",
      category: "emotional",
    },
    { id: "anxiety", label: "Anxiety", icon: "😰", category: "emotional" },
    { id: "depression", label: "Sadness", icon: "😢", category: "emotional" },
    { id: "brain_fog", label: "Brain Fog", icon: "🌫️", category: "cognitive" },
    {
      id: "insomnia",
      label: "Sleep Issues",
      icon: "🌙",
      category: "cognitive",
    },
    {
      id: "food_cravings",
      label: "Food Cravings",
      icon: "🍫",
      category: "behavioral",
    },
    {
      id: "social_withdrawal",
      label: "Social Withdrawal",
      icon: "🏠",
      category: "behavioral",
    },
  ];

  // Flow options for advanced users
  const flowOptions = [
    { value: "spotting", label: "Spotting", color: "#FEE2E2" },
    { value: "light", label: "Light", color: "#FECACA" },
    { value: "normal", label: "Normal", color: "#F87171" },
    { value: "heavy", label: "Heavy", color: "#DC2626" },
    { value: "very_heavy", label: "Very Heavy", color: "#991B1B" },
  ];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setEntryDate(initialData.date || new Date().toISOString().split("T")[0]);
      setIsPeriodStart(initialData.is_period_start || false);
      setCycleDay(initialData.cycle_day?.toString() || "");
      setCyclePhase(initialData.cycle_phase || "");
      setSelectedSymptoms(
        initialData.symptoms ? initialData.symptoms.split(",") : []
      );
      setOverallSeverity(initialData.symptom_severity || 5);
      setMoodRating(initialData.mood_rating || 5);
      setEnergyLevel(initialData.energy_level || 5);
      setSleepQuality(initialData.sleep_quality || 5);
      setStressLevel(initialData.stress_level || 5);
      setSymptomNotes(initialData.notes || "");

      // Advanced fields
      if (isAdvancedUser) {
        setFlowHeaviness(initialData.flow_heaviness || "");
        setTemperature(initialData.temperature?.toString() || "");
        setCervicalMucus(initialData.cervical_mucus || "");
        setBreastTenderness(initialData.breast_tenderness || 0);
      }
    }
  }, [initialData, isAdvancedUser]);

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const addCustomSymptom = () => {
    if (
      customSymptom.trim() &&
      !selectedSymptoms.includes(customSymptom.trim())
    ) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validation
      if (!entryDate) {
        setError("Please select a date for this entry");
        return;
      }

      // Prepare data for saving
      const healthData = {
        user_id: user.id,
        date: entryDate,
        is_period_start: isPeriodStart,
        cycle_day: cycleDay ? parseInt(cycleDay) : null,
        cycle_phase: cyclePhase || null,
        symptoms: selectedSymptoms.join(","),
        symptom_severity: overallSeverity,
        mood_rating: moodRating,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        notes: symptomNotes,
      };

      // Add advanced fields for premium users
      if (isAdvancedUser) {
        healthData.flow_heaviness = flowHeaviness || null;
        healthData.exercise_intensity = exerciseIntensity || null;
        healthData.water_intake = waterIntake || null;
        healthData.temperature = temperature ? parseFloat(temperature) : null;
        healthData.cervical_mucus = cervicalMucus || null;
        healthData.breast_tenderness = breastTenderness;
        healthData.medications = medicationsTaken.join(",");
      }

      // Save to database
      let result;
      if (initialData?.id) {
        // Update existing entry
        result = await supabase
          .from("womens_health_data")
          .update(healthData)
          .eq("id", initialData.id)
          .eq("user_id", user.id);
      } else {
        // Create new entry
        result = await supabase.from("womens_health_data").insert([healthData]);
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(
        initialData
          ? "Entry updated successfully!"
          : "Entry saved successfully!"
      );

      // Notify parent component
      if (onDataSaved) {
        onDataSaved();
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving health data:", err);
      setError(err.message || "Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "basics", label: "Basics", icon: Calendar },
    { id: "symptoms", label: "Symptoms", icon: Activity },
    { id: "wellness", label: "Wellness", icon: Heart },
    ...(isAdvancedUser
      ? [{ id: "advanced", label: "Advanced", icon: Sparkles }]
      : []),
  ];

  const getRatingColor = (rating) => {
    if (rating <= 3) return "text-red-600 bg-red-50";
    if (rating <= 6) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

  const getRatingLabel = (rating, type) => {
    const labels = {
      mood: [
        "Terrible",
        "Poor",
        "Low",
        "Fair",
        "Okay",
        "Good",
        "Great",
        "Excellent",
        "Amazing",
        "Perfect",
      ],
      energy: [
        "Exhausted",
        "Drained",
        "Low",
        "Tired",
        "Okay",
        "Good",
        "Energetic",
        "High",
        "Vibrant",
        "Peak",
      ],
      sleep: [
        "Terrible",
        "Poor",
        "Bad",
        "Fair",
        "Okay",
        "Good",
        "Great",
        "Excellent",
        "Perfect",
        "Amazing",
      ],
      stress: [
        "Calm",
        "Relaxed",
        "Low",
        "Mild",
        "Moderate",
        "Elevated",
        "High",
        "Very High",
        "Intense",
        "Overwhelming",
      ],
      severity: [
        "None",
        "Minimal",
        "Mild",
        "Low",
        "Moderate",
        "Noticeable",
        "Significant",
        "Severe",
        "Intense",
        "Extreme",
      ],
    };
    return labels[type]?.[rating - 1] || rating.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Edit Health Entry" : "Add Health Entry"}
              </h2>
              <p className="text-sm text-gray-600">
                Track your cycle, symptoms, and wellness data
                {isAdvancedUser && (
                  <span className="text-pink-600 font-medium">
                    {" "}
                    • Advanced Features Enabled
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Basics Section */}
          {activeSection === "basics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPeriodStart}
                      onChange={(e) => setIsPeriodStart(e.target.checked)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <Droplets className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900">
                      Period Start
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Day (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cycleDay}
                    onChange={(e) => setCycleDay(e.target.value)}
                    placeholder="Day of cycle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Phase (optional)
                  </label>
                  <select
                    value={cyclePhase}
                    onChange={(e) => setCyclePhase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select phase...</option>
                    <option value="Menstrual">🩸 Menstrual</option>
                    <option value="Follicular">🌱 Follicular</option>
                    <option value="Ovulatory">🥚 Ovulatory</option>
                    <option value="Luteal">🌙 Luteal</option>
                  </select>
                </div>
              </div>

              {/* Flow Heaviness for Advanced Users */}
              {isAdvancedUser && isPeriodStart && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Flow Heaviness
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {flowOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFlowHeaviness(option.value)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          flowHeaviness === option.value
                            ? "border-pink-500 text-pink-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor:
                            flowHeaviness === option.value
                              ? option.color
                              : "transparent",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Symptoms Section */}
          {activeSection === "symptoms" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Symptoms
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSymptoms.includes(symptom.id)
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{symptom.icon}</span>
                      {symptom.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Symptom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Symptom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder="Enter custom symptom..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onKeyPress={(e) => e.key === "Enter" && addCustomSymptom()}
                  />
                  <button
                    type="button"
                    onClick={addCustomSymptom}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Overall Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Symptom Severity: {overallSeverity} (
                  {getRatingLabel(overallSeverity, "severity")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Minimal</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={overallSeverity}
                    onChange={(e) =>
                      setOverallSeverity(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Extreme</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    overallSeverity
                  )}`}
                >
                  {getRatingLabel(overallSeverity, "severity")}
                </div>
              </div>

              {/* Symptom Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="Any additional details about your symptoms..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Wellness Section */}
          {activeSection === "wellness" && (
            <div className="space-y-6">
              {/* Mood Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood: {moodRating} ({getRatingLabel(moodRating, "mood")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Terrible</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodRating}
                    onChange={(e) => setMoodRating(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Perfect</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    moodRating
                  )}`}
                >
                  {getRatingLabel(moodRating, "mood")}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Energy Level: {energyLevel} (
                  {getRatingLabel(energyLevel, "energy")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Exhausted</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Peak</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    energyLevel
                  )}`}
                >
                  {getRatingLabel(energyLevel, "energy")}
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sleep Quality: {sleepQuality} (
                  {getRatingLabel(sleepQuality, "sleep")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Terrible</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Amazing</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    sleepQuality
                  )}`}
                >
                  {getRatingLabel(sleepQuality, "sleep")}
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stress Level: {stressLevel} (
                  {getRatingLabel(stressLevel, "stress")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Calm</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Overwhelming</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    10 - stressLevel + 1
                  )}`}
                >
                  {getRatingLabel(stressLevel, "stress")}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Section (Premium Users Only) */}
          {activeSection === "advanced" && isAdvancedUser && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Advanced Tracking
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  These additional data points help provide more detailed
                  insights and correlations in your advanced analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basal Body Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="95"
                    max="102"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Cervical Mucus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cervical Mucus
                  </label>
                  <select
                    value={cervicalMucus}
                    onChange={(e) => setCervicalMucus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select type...</option>
                    <option value="dry">Dry</option>
                    <option value="sticky">Sticky</option>
                    <option value="creamy">Creamy</option>
                    <option value="watery">Watery</option>
                    <option value="egg_white">Egg White</option>
                  </select>
                </div>

                {/* Exercise Intensity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Intensity
                  </label>
                  <select
                    value={exerciseIntensity}
                    onChange={(e) => setExerciseIntensity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select intensity...</option>
                    <option value="none">No Exercise</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="vigorous">Vigorous</option>
                    <option value="intense">Intense</option>
                  </select>
                </div>

                {/* Water Intake */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Intake (glasses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(e.target.value)}
                    placeholder="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Breast Tenderness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Breast Tenderness: {breastTenderness} (
                  {breastTenderness === 0
                    ? "None"
                    : breastTenderness <= 3
                    ? "Mild"
                    : breastTenderness <= 6
                    ? "Moderate"
                    : "Severe"}
                  )
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">None</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={breastTenderness}
                    onChange={(e) =>
                      setBreastTenderness(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Severe</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            All data is encrypted and stored securely
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? "Update Entry" : "Save Entry"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default WomensHealthEntryModal;
