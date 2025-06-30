// src/components/womenshealth/PerimenopauseEntryModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Droplets,
  Flame,
  Brain,
  Activity,
  Moon,
  Coffee,
  Pill,
  ThermometerSun,
  Wind,
  CloudSnow,
  Heart,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
  Save,
  Info,
  CheckCircle,
  Sparkles,
  Plus,
  Minus,
  ChevronDown,
  Timer,
  Waves,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

const PerimenopauseEntryModal = ({ isOpen, onClose, colors, user, onSave }) => {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSection, setActiveSection] = useState("cycle");
  const [saving, setSaving] = useState(false);
  const [savedSections, setSavedSections] = useState([]);
  const [lastPeriodDate, setLastPeriodDate] = useState(null);

  // Form data specific to perimenopause
  const [formData, setFormData] = useState({
    // Irregular cycle tracking
    periodFlow: "",
    periodDay: 0,
    daysSinceLastPeriod: 0,
    cycleLength: "irregular",
    spotting: false,
    skippedPeriod: false,
    flooding: false,

    // Hot flashes & night sweats
    hotFlashCount: 0,
    hotFlashSeverity: [],
    hotFlashTriggers: [],
    nightSweatSeverity: 0,
    nightsWithSweats: 0,

    // Hormonal symptoms
    moodSwings: 0,
    anxiety: 0,
    irritability: 0,
    depression: 0,
    brainFog: 0,
    memoryIssues: false,
    concentrationDifficulty: false,

    // Physical symptoms
    jointPain: 0,
    muscleAches: 0,
    headaches: 0,
    palpitations: false,
    dizziness: false,
    weightGain: false,
    bloating: 0,
    breastTenderness: 0,

    // Sleep & energy
    sleepQuality: 3,
    sleepHours: 7,
    nightWakings: 0,
    insomnia: false,
    earlyWaking: false,
    energy: 3,
    fatigue: 0,

    // Vaginal & urinary
    vaginalDryness: 0,
    libido: 3,
    urinaryFrequency: false,
    urinaryIncontinence: false,

    // Skin & hair
    drySkin: false,
    skinChanges: [],
    hairThinning: false,
    hairTexture: "normal",

    // Lifestyle
    exercise: "",
    exerciseMinutes: 0,
    stressLevel: 3,
    caffeineIntake: 0,
    alcoholIntake: 0,
    diet: [],

    // Management strategies
    hrt: false,
    supplements: [],
    copingStrategies: [],

    // Notes
    notes: "",
    concernsForDoctor: "",
  });

  // Perimenopause-specific options
  const hotFlashTriggers = [
    "Stress",
    "Caffeine",
    "Alcohol",
    "Spicy food",
    "Hot weather",
    "Tight clothing",
    "Sugar",
    "Unknown",
  ];

  const skinChanges = [
    "Acne",
    "Dryness",
    "Oiliness",
    "Age spots",
    "Wrinkles",
    "Sensitivity",
    "Rashes",
  ];

  const dietOptions = [
    "Mediterranean",
    "Low sugar",
    "High protein",
    "Plant-based",
    "Anti-inflammatory",
    "Balanced",
    "Keto",
    "Other",
  ];

  const copingStrategies = [
    "Deep breathing",
    "Meditation",
    "Yoga",
    "Cool showers",
    "Layered clothing",
    "Fan/AC",
    "Exercise",
    "Acupuncture",
  ];

  const supplementOptions = [
    "Black cohosh",
    "Evening primrose",
    "Vitamin D",
    "Calcium",
    "Magnesium",
    "B vitamins",
    "Omega-3",
    "Probiotics",
    "Red clover",
    "Dong quai",
    "Multivitamin",
    "Iron",
  ];

  // Section definitions
  const sections = [
    { id: "cycle", label: "Cycle", icon: Droplets },
    { id: "hotflashes", label: "Hot Flashes", icon: Flame },
    { id: "hormonal", label: "Hormonal", icon: Brain },
    { id: "physical", label: "Physical", icon: Activity },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "management", label: "Management", icon: Heart },
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

  const addHotFlash = () => {
    const severity = prompt("Rate severity 1-5:");
    if (severity) {
      setFormData((prev) => ({
        ...prev,
        hotFlashCount: prev.hotFlashCount + 1,
        hotFlashSeverity: [...prev.hotFlashSeverity, parseInt(severity)],
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        date: selectedDate,
        userId: user.id,
        timestamp: new Date(),
        lifeStage: "perimenopause",
      };

      await onSave(dataToSave);

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

  const renderSeveritySelector = (field, label, includeZero = true) => (
    <div className="space-y-2">
      <label className="text-sm text-purple-200">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-purple-300">None</span>
        <div className="flex gap-1">
          {(includeZero ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5]).map((value) => (
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-pink-400" />
              Irregular Cycle Tracking
            </h3>

            {/* Period status */}
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-100 font-medium mb-1">
                    Irregular Cycles Are Normal
                  </p>
                  <p className="text-xs text-yellow-200">
                    During perimenopause, cycles may vary from 21-60+ days.
                    Track what happens, not what's "supposed" to happen.
                  </p>
                </div>
              </div>
            </div>

            {/* Days since last period */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Days since last period started
              </label>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <Calendar className="w-5 h-5 text-purple-300" />
                <input
                  type="number"
                  min="0"
                  value={formData.daysSinceLastPeriod}
                  onChange={(e) =>
                    handleInputChange(
                      "daysSinceLastPeriod",
                      parseInt(e.target.value)
                    )
                  }
                  className="bg-transparent text-2xl font-bold text-white w-20 text-center focus:outline-none"
                />
                <span className="text-purple-200">days</span>
              </div>
            </div>

            {/* Current period tracking */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.periodFlow !== ""}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      handleInputChange("periodFlow", "");
                      handleInputChange("periodDay", 0);
                    }
                  }}
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Currently having period</span>
              </label>

              {formData.periodFlow !== "" && (
                <div className="ml-8 space-y-4">
                  {/* Flow selector */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      {
                        value: "spotting",
                        label: "Spotting",
                        color: "bg-pink-300",
                      },
                      { value: "light", label: "Light", color: "bg-pink-400" },
                      { value: "medium", label: "Medium", color: "bg-red-400" },
                      { value: "heavy", label: "Heavy", color: "bg-red-600" },
                      {
                        value: "flooding",
                        label: "Flooding",
                        color: "bg-red-800",
                      },
                    ].map((option) => (
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
                        <span className="text-xs text-white">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Period day */}
                  <div>
                    <label className="text-sm text-purple-200 mb-2 block">
                      Period Day
                    </label>
                    <div className="flex items-center gap-3">
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
                      <span className="text-xl font-bold text-white">
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
                </div>
              )}
            </div>

            {/* Irregular symptoms */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Irregular Patterns
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.spotting}
                    onChange={(e) =>
                      handleInputChange("spotting", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Spotting between periods</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.flooding}
                    onChange={(e) =>
                      handleInputChange("flooding", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">
                    Flooding (soaking through protection)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.skippedPeriod}
                    onChange={(e) =>
                      handleInputChange("skippedPeriod", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">
                    Skipped this expected period
                  </span>
                </label>
              </div>
            </div>

            {/* Cycle pattern note */}
            <div className="bg-purple-600/20 rounded-lg p-4">
              <p className="text-sm text-purple-200">
                <Info className="w-4 h-4 inline mr-1" />
                Your cycle may become shorter, longer, or skip months entirely.
                This is all part of the perimenopause journey.
              </p>
            </div>
          </div>
        );

      case "hotflashes":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Hot Flashes & Night Sweats
            </h3>

            {/* Hot flash counter */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-200">Hot Flashes Today</span>
                <button
                  onClick={addHotFlash}
                  className="bg-orange-600/30 hover:bg-orange-600/40 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Hot Flash
                </button>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formData.hotFlashCount}
              </div>
              {formData.hotFlashSeverity.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.hotFlashSeverity.map((severity, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(
                        severity
                      )} text-white`}
                    >
                      #{index + 1}: {severity}/5
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Night sweats */}
            {renderSeveritySelector(
              "nightSweatSeverity",
              "Night Sweat Severity"
            )}

            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Nights with sweats this week
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInputChange("nightsWithSweats", num)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.nightsWithSweats === num
                        ? "bg-orange-500 text-white"
                        : "bg-white/10 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Identified Triggers
              </label>
              <div className="grid grid-cols-2 gap-2">
                {hotFlashTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() =>
                      handleArrayToggle("hotFlashTriggers", trigger)
                    }
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.hotFlashTriggers.includes(trigger)
                        ? "bg-orange-600/30 border-2 border-orange-400 text-white"
                        : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips for hot flashes */}
            <div className="bg-orange-600/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Quick Relief Tips</h4>
              <ul className="space-y-1 text-sm text-orange-200">
                <li>• Keep a fan or cooling spray nearby</li>
                <li>• Wear layers you can easily remove</li>
                <li>• Try slow, deep breathing when you feel one starting</li>
                <li>• Keep your bedroom cool at night</li>
              </ul>
            </div>
          </div>
        );

      case "hormonal":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Hormonal & Cognitive Symptoms
            </h3>

            {/* Mood symptoms */}
            <div className="space-y-4">
              {renderSeveritySelector("moodSwings", "Mood Swings")}
              {renderSeveritySelector("anxiety", "Anxiety")}
              {renderSeveritySelector("irritability", "Irritability")}
              {renderSeveritySelector("depression", "Depression")}
            </div>

            {/* Cognitive symptoms */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium">Cognitive Changes</h4>
              {renderSeveritySelector("brainFog", "Brain Fog")}

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.memoryIssues}
                    onChange={(e) =>
                      handleInputChange("memoryIssues", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Memory issues</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.concentrationDifficulty}
                    onChange={(e) =>
                      handleInputChange(
                        "concentrationDifficulty",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Difficulty concentrating</span>
                </label>
              </div>
            </div>

            {/* Educational content */}
            <div className="bg-purple-600/20 rounded-lg p-4">
              <p className="text-sm text-purple-200">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Fluctuating hormones can affect neurotransmitters, leading to
                mood changes and "brain fog." This is temporary and manageable.
              </p>
            </div>
          </div>
        );

      case "physical":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Physical Symptoms
            </h3>

            {/* Pain symptoms */}
            <div className="space-y-4">
              {renderSeveritySelector("jointPain", "Joint Pain")}
              {renderSeveritySelector("muscleAches", "Muscle Aches")}
              {renderSeveritySelector("headaches", "Headaches")}
              {renderSeveritySelector("breastTenderness", "Breast Tenderness")}
              {renderSeveritySelector("bloating", "Bloating")}
            </div>

            {/* Other physical symptoms */}
            <div className="space-y-3 mt-6">
              <label className="text-sm text-purple-200">Other Symptoms</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.palpitations}
                    onChange={(e) =>
                      handleInputChange("palpitations", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Heart palpitations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dizziness}
                    onChange={(e) =>
                      handleInputChange("dizziness", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Dizziness</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weightGain}
                    onChange={(e) =>
                      handleInputChange("weightGain", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Unexplained weight gain</span>
                </label>
              </div>
            </div>

            {/* Vaginal & urinary health */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium">
                Vaginal & Urinary Health
              </h4>
              {renderSeveritySelector("vaginalDryness", "Vaginal Dryness")}

              <div className="space-y-3">
                <label className="text-sm text-purple-200">Libido</label>
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

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.urinaryFrequency}
                    onChange={(e) =>
                      handleInputChange("urinaryFrequency", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">
                    Increased urinary frequency
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.urinaryIncontinence}
                    onChange={(e) =>
                      handleInputChange("urinaryIncontinence", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Urinary incontinence</span>
                </label>
              </div>
            </div>

            {/* Skin & hair changes */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium">Skin & Hair Changes</h4>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.drySkin}
                    onChange={(e) =>
                      handleInputChange("drySkin", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Dry skin</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hairThinning}
                    onChange={(e) =>
                      handleInputChange("hairThinning", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Hair thinning</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-purple-200">Skin changes</label>
                <div className="grid grid-cols-2 gap-2">
                  {skinChanges.map((change) => (
                    <button
                      key={change}
                      onClick={() => handleArrayToggle("skinChanges", change)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        formData.skinChanges.includes(change)
                          ? "bg-green-600/30 border-2 border-green-400 text-white"
                          : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      {change}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "sleep":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Sleep & Energy
            </h3>

            {/* Sleep quality */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Sleep Quality</label>
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-4">
                {["😴", "😪", "😐", "😊", "🤗"].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange("sleepQuality", index + 1)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      formData.sleepQuality === index + 1
                        ? "bg-indigo-600/50 scale-110"
                        : "hover:bg-white/20"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep hours */}
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
                    handleInputChange("sleepHours", parseFloat(e.target.value))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-2 block">
                  Night wakings
                </label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, "5+"].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        handleInputChange(
                          "nightWakings",
                          typeof num === "number" ? num : 5
                        )
                      }
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.nightWakings ===
                        (typeof num === "number" ? num : 5)
                          ? "bg-indigo-500 text-white"
                          : "bg-white/10 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sleep issues */}
            <div className="space-y-2">
              <label className="text-sm text-purple-200">Sleep Issues</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.insomnia}
                    onChange={(e) =>
                      handleInputChange("insomnia", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Trouble falling asleep</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.earlyWaking}
                    onChange={(e) =>
                      handleInputChange("earlyWaking", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Waking too early</span>
                </label>
              </div>
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

            {renderSeveritySelector("fatigue", "Fatigue Level")}

            {/* Sleep tips */}
            <div className="bg-indigo-600/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Better Sleep Tips</h4>
              <ul className="space-y-1 text-sm text-indigo-200">
                <li>• Keep bedroom cool (60-67°F)</li>
                <li>• Avoid screens 1 hour before bed</li>
                <li>• Try magnesium or melatonin supplements</li>
                <li>• Use breathable, moisture-wicking bedding</li>
              </ul>
            </div>
          </div>
        );

      case "management":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Management & Support
            </h3>

            {/* Medical interventions */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Medical Support</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hrt}
                  onChange={(e) => handleInputChange("hrt", e.target.checked)}
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">
                  Using HRT (Hormone Replacement Therapy)
                </span>
              </label>
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

            {/* Lifestyle management */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Stress Level</label>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.stressLevel}
                  onChange={(e) =>
                    handleInputChange("stressLevel", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-white font-medium">
                  {formData.stressLevel}/5
                </span>
              </div>
            </div>

            {/* Coping strategies */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">What's Helping</label>
              <div className="grid grid-cols-2 gap-2">
                {copingStrategies.map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() =>
                      handleArrayToggle("copingStrategies", strategy)
                    }
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.copingStrategies.includes(strategy)
                        ? "bg-purple-600/30 border-2 border-purple-400 text-white"
                        : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {strategy}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet approach */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Dietary Approach
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dietOptions.map((diet) => (
                  <button
                    key={diet}
                    onClick={() => handleArrayToggle("diet", diet)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.diet.includes(diet)
                        ? "bg-amber-600/30 border-2 border-amber-400 text-white"
                        : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns for doctor */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Questions/Concerns for Healthcare Provider
              </label>
              <textarea
                value={formData.concernsForDoctor}
                onChange={(e) =>
                  handleInputChange("concernsForDoctor", e.target.value)
                }
                placeholder="Note any symptoms or questions to discuss..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-400 resize-none"
                rows="3"
              />
            </div>

            {/* Additional notes */}
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-800 to-orange-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Perimenopause Check-In
              </h2>
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

          {/* Perimenopause indicator */}
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-200">
            <Sun className="w-4 h-4" />
            <span>
              Tracking irregular patterns is key during this transition
            </span>
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
                      ? "bg-white text-orange-600"
                      : "bg-white/10 text-orange-200 hover:bg-white/20"
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
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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

export default PerimenopauseEntryModal;
