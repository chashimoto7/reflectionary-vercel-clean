// src/components/womenshealth/PerimenopauseEntryModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import { supabase } from "../../lib/supabase";
import {
  X,
  Calendar,
  Heart,
  Thermometer,
  Activity,
  Brain,
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
  HelpCircle,
  Wind,
  Moon,
} from "lucide-react";

const PerimenopauseEntryModal = ({
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
  const [hadPeriod, setHadPeriod] = useState(false);
  const [daysSinceLastPeriod, setDaysSinceLastPeriod] = useState("");
  const [periodFlow, setPeriodFlow] = useState("");
  const [periodLength, setPeriodLength] = useState("");

  // Perimenopause-specific symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [overallSeverity, setOverallSeverity] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Wellness state
  const [moodRating, setMoodRating] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [cognitiveFog, setCognitiveFog] = useState(5);

  // Perimenopause-specific advanced fields
  const [hotFlashFrequency, setHotFlashFrequency] = useState("");
  const [hotFlashSeverity, setHotFlashSeverity] = useState(1);
  const [nightSweats, setNightSweats] = useState(false);
  const [weightChanges, setWeightChanges] = useState("");
  const [libidoChanges, setLibidoChanges] = useState("");
  const [jointPain, setJointPain] = useState(1);
  const [skinChanges, setSkinChanges] = useState([]);
  const [emotionalWellbeing, setEmotionalWellbeing] = useState("");

  // UI state
  const [activeSection, setActiveSection] = useState("basics");
  const [showTooltip, setShowTooltip] = useState(null);

  const isAdvancedUser = hasAccess("advanced_womens_health");

  // Perimenopause-specific symptoms with educational context
  const perimenopauseSymptoms = [
    {
      id: "hot_flashes",
      label: "Hot Flashes",
      icon: "🔥",
      category: "thermal",
      info: "Sudden feelings of heat, often with sweating and flushing. Usually last 30 seconds to 10 minutes.",
    },
    {
      id: "night_sweats",
      label: "Night Sweats",
      icon: "🌙",
      category: "thermal",
      info: "Hot flashes that occur during sleep, often disrupting sleep quality.",
    },
    {
      id: "irregular_periods",
      label: "Irregular Periods",
      icon: "📅",
      category: "menstrual",
      info: "Changes in cycle length, flow, or skipped periods. Normal during perimenopause transition.",
    },
    {
      id: "mood_swings",
      label: "Mood Swings",
      icon: "🎭",
      category: "emotional",
      info: "Rapid changes in mood due to fluctuating hormone levels.",
    },
    {
      id: "anxiety",
      label: "Anxiety",
      icon: "😰",
      category: "emotional",
      info: "Increased feelings of worry or nervousness, often related to hormonal changes.",
    },
    {
      id: "depression",
      label: "Low Mood",
      icon: "😢",
      category: "emotional",
      info: "Feeling sad, empty, or hopeless. Seek professional help if persistent.",
    },
    {
      id: "brain_fog",
      label: "Brain Fog",
      icon: "🌫️",
      category: "cognitive",
      info: "Difficulty concentrating, memory issues, or feeling mentally unclear.",
    },
    {
      id: "fatigue",
      label: "Fatigue",
      icon: "😴",
      category: "physical",
      info: "Persistent tiredness not relieved by rest, common during hormonal changes.",
    },
    {
      id: "insomnia",
      label: "Sleep Problems",
      icon: "🛌",
      category: "physical",
      info: "Difficulty falling asleep, staying asleep, or early waking.",
    },
    {
      id: "weight_gain",
      label: "Weight Changes",
      icon: "⚖️",
      category: "physical",
      info: "Changes in weight distribution, often around the midsection during perimenopause.",
    },
    {
      id: "joint_pain",
      label: "Joint Aches",
      icon: "🦴",
      category: "physical",
      info: "Stiffness or pain in joints, particularly in the morning.",
    },
    {
      id: "libido_changes",
      label: "Libido Changes",
      icon: "💕",
      category: "sexual",
      info: "Changes in sexual desire, often due to hormonal fluctuations.",
    },
    {
      id: "vaginal_dryness",
      label: "Vaginal Dryness",
      icon: "🌸",
      category: "sexual",
      info: "Decreased vaginal moisture due to declining estrogen levels.",
    },
    {
      id: "skin_changes",
      label: "Skin Changes",
      icon: "✨",
      category: "physical",
      info: "Dryness, thinning, or increased sensitivity of skin during hormonal changes.",
    },
    {
      id: "hair_changes",
      label: "Hair Changes",
      icon: "💇‍♀️",
      category: "physical",
      info: "Thinning, dryness, or texture changes in hair due to hormonal shifts.",
    },
  ];

  // Perimenopause stages for context
  const perimenopauseStages = [
    {
      name: "Early Perimenopause",
      emoji: "🌊",
      description:
        "Subtle changes beginning - periods may be slightly irregular",
      symptoms: ["Irregular periods", "Mood changes", "Sleep disruption"],
    },
    {
      name: "Mid Perimenopause",
      emoji: "🌪️",
      description: "More noticeable changes - symptoms becoming more frequent",
      symptoms: ["Hot flashes", "Night sweats", "Anxiety", "Brain fog"],
    },
    {
      name: "Late Perimenopause",
      emoji: "🌅",
      description: "Approaching menopause - longer gaps between periods",
      symptoms: [
        "Longer gaps between periods",
        "Vaginal dryness",
        "Joint pain",
      ],
    },
  ];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setEntryDate(initialData.date || new Date().toISOString().split("T")[0]);
      setHadPeriod(initialData.had_period || false);
      setDaysSinceLastPeriod(
        initialData.days_since_last_period?.toString() || ""
      );
      setPeriodFlow(initialData.period_flow || "");
      setPeriodLength(initialData.period_length?.toString() || "");
      setSelectedSymptoms(
        initialData.symptoms ? initialData.symptoms.split(",") : []
      );
      setOverallSeverity(initialData.symptom_severity || 5);
      setMoodRating(initialData.mood_rating || 5);
      setEnergyLevel(initialData.energy_level || 5);
      setSleepQuality(initialData.sleep_quality || 5);
      setStressLevel(initialData.stress_level || 5);
      setCognitiveFog(initialData.cognitive_fog || 5);
      setSymptomNotes(initialData.notes || "");

      // Advanced fields
      if (isAdvancedUser) {
        setHotFlashFrequency(initialData.hot_flash_frequency || "");
        setHotFlashSeverity(initialData.hot_flash_severity || 1);
        setNightSweats(initialData.night_sweats || false);
        setJointPain(initialData.joint_pain || 1);
        setEmotionalWellbeing(initialData.emotional_wellbeing || "");
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

      if (!entryDate) {
        setError("Please select a date for this entry");
        return;
      }

      // Prepare data for saving
      const healthData = {
        user_id: user.id,
        date: entryDate,
        life_stage: "perimenopause",
        had_period: hadPeriod,
        days_since_last_period: daysSinceLastPeriod
          ? parseInt(daysSinceLastPeriod)
          : null,
        period_flow: periodFlow || null,
        period_length: periodLength ? parseInt(periodLength) : null,
        symptoms: selectedSymptoms.join(","),
        symptom_severity: overallSeverity,
        mood_rating: moodRating,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        cognitive_fog: cognitiveFog,
        notes: symptomNotes,
      };

      // Add advanced fields for premium users
      if (isAdvancedUser) {
        healthData.hot_flash_frequency = hotFlashFrequency || null;
        healthData.hot_flash_severity = hotFlashSeverity;
        healthData.night_sweats = nightSweats;
        healthData.weight_changes = weightChanges || null;
        healthData.libido_changes = libidoChanges || null;
        healthData.joint_pain = jointPain;
        healthData.skin_changes = skinChanges.join(",");
        healthData.emotional_wellbeing = emotionalWellbeing || null;
      }

      // Save to database
      let result;
      if (initialData?.id) {
        result = await supabase
          .from("womens_health_data")
          .update(healthData)
          .eq("id", initialData.id)
          .eq("user_id", user.id);
      } else {
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

      if (onDataSaved) {
        onDataSaved();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving perimenopause data:", err);
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
      cognitive: [
        "Crystal Clear",
        "Sharp",
        "Good",
        "Fair",
        "Okay",
        "Cloudy",
        "Foggy",
        "Very Foggy",
        "Confused",
        "Extremely Foggy",
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

  const Tooltip = ({ content, children }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Thermometer className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData
                  ? "Edit Perimenopause Entry"
                  : "Add Perimenopause Entry"}
              </h2>
              <p className="text-sm text-gray-600">
                Track your transition journey with compassionate support
                {isAdvancedUser && (
                  <span className="text-orange-600 font-medium">
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

        {/* Perimenopause Stage Info */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">
              Perimenopause: The Transition Years
            </span>
            <Tooltip content="Perimenopause is the natural transition period before menopause, typically lasting 4-8 years. Your body is gradually adjusting hormone production.">
              <HelpCircle className="w-4 h-4 text-orange-600 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-sm text-orange-700">
            Every woman's perimenopause journey is unique. Track your patterns
            to better understand your body's changes and share insights with
            your healthcare provider.
          </p>
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
                    ? "border-orange-500 text-orange-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={hadPeriod}
                      onChange={(e) => setHadPeriod(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Droplets className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900">
                      Had Period
                    </span>
                    <Tooltip content="During perimenopause, periods become irregular. Track when you do have them to identify patterns.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                </div>
              </div>

              {/* Period-related fields (when applicable) */}
              {hadPeriod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Length (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={periodLength}
                      onChange={(e) => setPeriodLength(e.target.value)}
                      placeholder="Days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flow Heaviness
                    </label>
                    <select
                      value={periodFlow}
                      onChange={(e) => setPeriodFlow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select flow...</option>
                      <option value="spotting">Spotting</option>
                      <option value="light">Light</option>
                      <option value="normal">Normal</option>
                      <option value="heavy">Heavy</option>
                      <option value="very_heavy">Very Heavy</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Since Last Period (if known)
                  <Tooltip content="Tracking gaps between periods helps identify patterns during the perimenopause transition.">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline ml-1" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={daysSinceLastPeriod}
                  onChange={(e) => setDaysSinceLastPeriod(e.target.value)}
                  placeholder="Days (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Perimenopause Stage Reference */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-3">
                  Perimenopause Stages Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {perimenopauseStages.map((stage, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{stage.emoji}</span>
                        <span className="font-medium text-sm text-orange-900">
                          {stage.name}
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 mb-2">
                        {stage.description}
                      </p>
                      <div className="text-xs text-orange-600">
                        Common: {stage.symptoms.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Symptoms Section */}
          {activeSection === "symptoms" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Symptoms You're Experiencing
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perimenopauseSymptoms.map((symptom) => (
                    <Tooltip key={symptom.id} content={symptom.info}>
                      <button
                        type="button"
                        onClick={() => handleSymptomToggle(symptom.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                          selectedSymptoms.includes(symptom.id)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-lg">{symptom.icon}</span>
                        <span className="flex-1">{symptom.label}</span>
                        <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    </Tooltip>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) => e.key === "Enter" && addCustomSymptom()}
                  />
                  <button
                    type="button"
                    onClick={addCustomSymptom}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Overall Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Symptom Impact: {overallSeverity} (
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
                  placeholder="Any patterns, triggers, or additional details about your symptoms..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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

              {/* Cognitive Fog */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mental Clarity: {cognitiveFog} (
                  {getRatingLabel(cognitiveFog, "cognitive")})
                  <Tooltip content="Brain fog is common during perimenopause due to fluctuating hormones. Track patterns to discuss with your healthcare provider.">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline ml-1" />
                  </Tooltip>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Very Foggy</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cognitiveFog}
                    onChange={(e) => setCognitiveFog(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Crystal Clear</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    cognitiveFog
                  )}`}
                >
                  {getRatingLabel(cognitiveFog, "cognitive")}
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
                    Advanced Perimenopause Tracking
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Detailed tracking helps identify patterns and provides
                  comprehensive data for healthcare discussions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hot Flash Tracking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hot Flash Frequency Today
                  </label>
                  <select
                    value={hotFlashFrequency}
                    onChange={(e) => setHotFlashFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select frequency...</option>
                    <option value="none">None</option>
                    <option value="1-2">1-2 times</option>
                    <option value="3-5">3-5 times</option>
                    <option value="6-10">6-10 times</option>
                    <option value="10+">10+ times</option>
                  </select>
                </div>

                {/* Night Sweats */}
                <div>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={nightSweats}
                      onChange={(e) => setNightSweats(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Moon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">
                      Night Sweats
                    </span>
                  </label>
                </div>
              </div>

              {/* Hot Flash Severity */}
              {hotFlashFrequency && hotFlashFrequency !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hot Flash Severity: {hotFlashSeverity} (
                    {hotFlashSeverity <= 3
                      ? "Mild"
                      : hotFlashSeverity <= 6
                      ? "Moderate"
                      : "Severe"}
                    )
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Mild</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={hotFlashSeverity}
                      onChange={(e) =>
                        setHotFlashSeverity(parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-sm text-gray-500">Severe</span>
                  </div>
                </div>
              )}

              {/* Joint Pain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Joint Pain/Stiffness: {jointPain} (
                  {jointPain === 1
                    ? "None"
                    : jointPain <= 3
                    ? "Mild"
                    : jointPain <= 6
                    ? "Moderate"
                    : "Severe"}
                  )
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">None</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={jointPain}
                    onChange={(e) => setJointPain(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Severe</span>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Changes
                  </label>
                  <select
                    value={weightChanges}
                    onChange={(e) => setWeightChanges(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    <option value="no_change">No change</option>
                    <option value="gaining">Weight gain</option>
                    <option value="losing">Weight loss</option>
                    <option value="fluctuating">Fluctuating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libido Changes
                  </label>
                  <select
                    value={libidoChanges}
                    onChange={(e) => setLibidoChanges(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    <option value="no_change">No change</option>
                    <option value="decreased">Decreased</option>
                    <option value="increased">Increased</option>
                    <option value="fluctuating">Fluctuating</option>
                  </select>
                </div>
              </div>

              {/* Emotional Wellbeing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotional Wellbeing Notes
                </label>
                <textarea
                  value={emotionalWellbeing}
                  onChange={(e) => setEmotionalWellbeing(e.target.value)}
                  placeholder="How are you feeling emotionally today? Any specific concerns or victories..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          background: #ea580c;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ea580c;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default PerimenopauseEntryModal;
