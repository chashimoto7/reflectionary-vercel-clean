// src/components/womenshealth/MenstrualEntryModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Droplets,
  Heart,
  Brain,
  Activity,
  Moon,
  Coffee,
  Pizza,
  Pill,
  ThermometerSun,
  Wind,
  CloudRain,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Info,
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const MenstrualEntryModal = ({ isOpen, onClose, colors, user, onSave }) => {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSection, setActiveSection] = useState("cycle");
  const [saving, setSaving] = useState(false);
  const [savedSections, setSavedSections] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    // Cycle tracking
    periodFlow: "",
    periodDay: 1,
    cycleDay: 1,
    spotting: false,

    // Physical symptoms
    cramps: 0,
    headache: 0,
    backPain: 0,
    breastTenderness: 0,
    bloating: 0,
    acne: false,

    // Emotional/Mental
    mood: 3,
    anxiety: 0,
    irritability: 0,
    moodSwings: false,
    crying: false,

    // Energy & Sleep
    energy: 3,
    fatigue: 0,
    sleepHours: 7,
    sleepQuality: 3,
    insomnia: false,

    // Discharge & Fertility
    discharge: "",
    ovulationPain: false,
    libido: 3,

    // Lifestyle
    exercise: "",
    exerciseMinutes: 0,
    water: 0,
    caffeine: 0,
    alcohol: 0,

    // Medications & Supplements
    birthControl: false,
    painMedication: false,
    supplements: [],

    // Additional
    temperature: "",
    weight: "",
    notes: "",

    // Cravings & Appetite
    cravings: [],
    appetite: 3,

    // Digestive
    nausea: false,
    constipation: false,
    diarrhea: false,
  });

  // Options for various fields
  const flowOptions = [
    { value: "none", label: "No flow", color: "bg-gray-400" },
    { value: "spotting", label: "Spotting", color: "bg-pink-300" },
    { value: "light", label: "Light", color: "bg-pink-400" },
    { value: "medium", label: "Medium", color: "bg-red-400" },
    { value: "heavy", label: "Heavy", color: "bg-red-600" },
  ];

  const dischargeOptions = [
    { value: "none", label: "None" },
    { value: "dry", label: "Dry" },
    { value: "sticky", label: "Sticky" },
    { value: "creamy", label: "Creamy" },
    { value: "watery", label: "Watery" },
    { value: "eggwhite", label: "Egg white" },
  ];

  const exerciseOptions = [
    { value: "none", label: "Rest day", icon: Moon },
    { value: "light", label: "Light", icon: Activity },
    { value: "moderate", label: "Moderate", icon: Activity },
    { value: "intense", label: "Intense", icon: Activity },
  ];

  const cravingOptions = [
    "Chocolate",
    "Salty snacks",
    "Carbs",
    "Sweets",
    "Fatty foods",
    "Comfort food",
    "Fruit",
    "Ice cream",
  ];

  const supplementOptions = [
    "Iron",
    "Vitamin D",
    "B vitamins",
    "Magnesium",
    "Calcium",
    "Omega-3",
    "Probiotics",
    "Multivitamin",
  ];

  // Section definitions
  const sections = [
    { id: "cycle", label: "Cycle", icon: Droplets },
    { id: "symptoms", label: "Symptoms", icon: Activity },
    { id: "mood", label: "Mood & Energy", icon: Brain },
    { id: "fertility", label: "Fertility", icon: Heart },
    { id: "lifestyle", label: "Lifestyle", icon: Coffee },
    { id: "health", label: "Health", icon: Pill },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Add date to form data
      const dataToSave = {
        ...formData,
        date: selectedDate,
        userId: user.id,
        timestamp: new Date(),
      };

      await onSave(dataToSave);

      // Show success state
      setSavedSections([activeSection]);
      setTimeout(() => {
        setSavedSections([]);
      }, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (value) => {
    if (value === 0) return "bg-gray-400";
    if (value <= 2) return "bg-green-400";
    if (value <= 3) return "bg-yellow-400";
    if (value <= 4) return "bg-orange-400";
    return "bg-red-400";
  };

  const renderSeveritySelector = (field, label) => (
    <div className="space-y-2">
      <label className="text-sm text-purple-200">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-purple-300">None</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleInputChange(field, value)}
              className={`w-8 h-8 rounded-lg transition-all ${
                formData[field] === value
                  ? getSeverityColor(value)
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <span className="text-xs text-white">{value}</span>
            </button>
          ))}
        </div>
        <span className="text-xs text-purple-300">Severe</span>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "cycle":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-pink-400" />
                Period Tracking
              </h3>

              {/* Flow selector */}
              <div className="space-y-3">
                <label className="text-sm text-purple-200">Today's Flow</label>
                <div className="grid grid-cols-5 gap-2">
                  {flowOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleInputChange("periodFlow", option.value)
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.periodFlow === option.value
                          ? "border-purple-400 bg-purple-600/30"
                          : "border-white/20 bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${option.color} mx-auto mb-2`}
                      ></div>
                      <span className="text-xs text-white">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cycle day trackers */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">
                    Period Day
                  </label>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <button
                      onClick={() =>
                        handleInputChange(
                          "periodDay",
                          Math.max(1, formData.periodDay - 1)
                        )
                      }
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-xl font-bold text-white flex-1 text-center">
                      Day {formData.periodDay}
                    </span>
                    <button
                      onClick={() =>
                        handleInputChange("periodDay", formData.periodDay + 1)
                      }
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-purple-200 mb-2 block">
                    Cycle Day
                  </label>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <button
                      onClick={() =>
                        handleInputChange(
                          "cycleDay",
                          Math.max(1, formData.cycleDay - 1)
                        )
                      }
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-xl font-bold text-white flex-1 text-center">
                      Day {formData.cycleDay}
                    </span>
                    <button
                      onClick={() =>
                        handleInputChange("cycleDay", formData.cycleDay + 1)
                      }
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Spotting toggle */}
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.spotting}
                    onChange={(e) =>
                      handleInputChange("spotting", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white">Spotting between periods</span>
                </label>
              </div>
            </div>

            {/* Educational tip */}
            <div className="bg-purple-600/20 rounded-lg p-4">
              <p className="text-sm text-purple-200">
                <Info className="w-4 h-4 inline mr-1" />
                Tracking your flow helps predict future periods and identify any
                unusual patterns.
              </p>
            </div>
          </div>
        );

      case "symptoms":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Physical Symptoms
            </h3>

            <div className="space-y-4">
              {renderSeveritySelector("cramps", "Cramps")}
              {renderSeveritySelector("headache", "Headache")}
              {renderSeveritySelector("backPain", "Back pain")}
              {renderSeveritySelector("breastTenderness", "Breast tenderness")}
              {renderSeveritySelector("bloating", "Bloating")}
            </div>

            {/* Additional symptoms */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Other Symptoms</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acne}
                    onChange={(e) =>
                      handleInputChange("acne", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Acne breakout</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nausea}
                    onChange={(e) =>
                      handleInputChange("nausea", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Nausea</span>
                </label>
              </div>
            </div>

            {/* Digestive symptoms */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Digestive</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.constipation}
                    onChange={(e) =>
                      handleInputChange("constipation", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Constipation</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.diarrhea}
                    onChange={(e) =>
                      handleInputChange("diarrhea", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Diarrhea</span>
                </label>
              </div>
            </div>
          </div>
        );

      case "mood":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Mood & Energy
            </h3>

            {/* Overall mood */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Overall Mood</label>
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-4">
                {["😢", "😟", "😐", "🙂", "😊"].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange("mood", index + 1)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      formData.mood === index + 1
                        ? "bg-purple-600/50 scale-110"
                        : "hover:bg-white/20"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotional symptoms */}
            <div className="space-y-4">
              {renderSeveritySelector("anxiety", "Anxiety")}
              {renderSeveritySelector("irritability", "Irritability")}
            </div>

            {/* Mood indicators */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.moodSwings}
                  onChange={(e) =>
                    handleInputChange("moodSwings", e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Mood swings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.crying}
                  onChange={(e) =>
                    handleInputChange("crying", e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Crying spells</span>
              </label>
            </div>

            {/* Energy tracking */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Energy Level</label>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.energy}
                  onChange={(e) =>
                    handleInputChange("energy", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-white font-medium">
                  {formData.energy}/5
                </span>
              </div>
            </div>

            {renderSeveritySelector("fatigue", "Fatigue")}

            {/* Sleep tracking */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-300" />
                Sleep
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">
                    Hours slept
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.sleepHours}
                    onChange={(e) =>
                      handleInputChange(
                        "sleepHours",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-purple-200 mb-2 block">
                    Sleep quality
                  </label>
                  <select
                    value={formData.sleepQuality}
                    onChange={(e) =>
                      handleInputChange(
                        "sleepQuality",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="1">Poor</option>
                    <option value="2">Fair</option>
                    <option value="3">Good</option>
                    <option value="4">Very good</option>
                    <option value="5">Excellent</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.insomnia}
                  onChange={(e) =>
                    handleInputChange("insomnia", e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">
                  Trouble falling/staying asleep
                </span>
              </label>
            </div>
          </div>
        );

      case "fertility":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Fertility Signs
            </h3>

            {/* Discharge */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Cervical Fluid</label>
              <div className="grid grid-cols-2 gap-2">
                {dischargeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange("discharge", option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.discharge === option.value
                        ? "border-purple-400 bg-purple-600/30"
                        : "border-white/20 bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="text-sm text-white">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ovulation pain */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ovulationPain}
                onChange={(e) =>
                  handleInputChange("ovulationPain", e.target.checked)
                }
                className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
              />
              <span className="text-white">Ovulation pain (mittelschmerz)</span>
            </label>

            {/* Libido */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Sex Drive</label>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.libido}
                  onChange={(e) =>
                    handleInputChange("libido", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-white font-medium">
                  {formData.libido}/5
                </span>
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Basal Body Temperature (optional)
              </label>
              <div className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-400" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={formData.temperature}
                  onChange={(e) =>
                    handleInputChange("temperature", e.target.value)
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
                <span className="text-purple-200">°C</span>
              </div>
            </div>

            {/* Educational content */}
            <div className="bg-pink-600/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                Fertility Signs Guide
              </h4>
              <ul className="space-y-1 text-sm text-pink-200">
                <li>• Egg white cervical fluid indicates peak fertility</li>
                <li>• Temperature rises after ovulation</li>
                <li>• Ovulation pain occurs mid-cycle for some women</li>
              </ul>
            </div>
          </div>
        );

      case "lifestyle":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              Lifestyle & Nutrition
            </h3>

            {/* Exercise */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Exercise</label>
              <div className="grid grid-cols-4 gap-2">
                {exerciseOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleInputChange("exercise", option.value)
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.exercise === option.value
                          ? "border-purple-400 bg-purple-600/30"
                          : "border-white/20 bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                      <span className="text-xs text-white">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {formData.exercise !== "none" && (
                <div className="mt-2">
                  <label className="text-xs text-purple-200">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.exerciseMinutes}
                    onChange={(e) =>
                      handleInputChange(
                        "exerciseMinutes",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
              )}
            </div>

            {/* Hydration */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Water intake (glasses)
              </label>
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-400" />
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleInputChange("water", i + 1)}
                      className={`w-8 h-8 rounded transition-all ${
                        formData.water >= i + 1
                          ? "bg-blue-500"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <span className="text-xs text-white">{i + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Caffeine & Alcohol */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-purple-200 mb-2 block flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  Caffeine (cups)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.caffeine}
                  onChange={(e) =>
                    handleInputChange("caffeine", parseInt(e.target.value))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-2 block flex items-center gap-2">
                  <Wine className="w-4 h-4" />
                  Alcohol (units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.alcohol}
                  onChange={(e) =>
                    handleInputChange("alcohol", parseInt(e.target.value))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Cravings */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Cravings</label>
              <div className="flex flex-wrap gap-2">
                {cravingOptions.map((craving) => (
                  <button
                    key={craving}
                    onClick={() => handleArrayToggle("cravings", craving)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.cravings.includes(craving)
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {craving}
                  </button>
                ))}
              </div>
            </div>

            {/* Appetite */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Appetite</label>
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <span className="text-purple-300">Low</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.appetite}
                  onChange={(e) =>
                    handleInputChange("appetite", parseInt(e.target.value))
                  }
                  className="flex-1 mx-4"
                />
                <span className="text-purple-300">High</span>
              </div>
            </div>
          </div>
        );

      case "health":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-400" />
              Health & Medications
            </h3>

            {/* Medications */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Medications</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.birthControl}
                    onChange={(e) =>
                      handleInputChange("birthControl", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Birth control</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.painMedication}
                    onChange={(e) =>
                      handleInputChange("painMedication", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Pain medication</span>
                </label>
              </div>
            </div>

            {/* Supplements */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Supplements</label>
              <div className="grid grid-cols-2 gap-2">
                {supplementOptions.map((supplement) => (
                  <button
                    key={supplement}
                    onClick={() => handleArrayToggle("supplements", supplement)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.supplements.includes(supplement)
                        ? "bg-green-600/30 border-2 border-green-400 text-white"
                        : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {supplement}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Weight (optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="kg"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any other observations..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-400 resize-none"
                rows="3"
              />
            </div>

            {/* Quick insights */}
            <div className="bg-green-600/20 rounded-lg p-4">
              <p className="text-sm text-green-200">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Tracking medications and supplements helps identify what works
                best for your symptoms.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Check-In</h2>
              <p className="text-purple-200 mt-1">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isSaved = savedSections.includes(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeSection === section.id
                      ? "bg-white text-purple-600"
                      : "bg-white/10 text-purple-200 hover:bg-white/20"
                  }`}
                >
                  {isSaved ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-purple-200">
              <Clock className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Wine icon import at the top if not already present
const Wine = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 22h8" />
    <path d="M7 10h10" />
    <path d="M12 15v7" />
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
  </svg>
);

export default MenstrualEntryModal;
