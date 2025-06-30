// src/components/womenshealth/MenopauseEntryModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Flower2,
  Flame,
  Brain,
  Activity,
  Moon,
  Heart,
  Pill,
  ThermometerSun,
  Shield,
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
  Coffee,
  Users,
  Dumbbell,
  Droplets,
  Sun,
} from "lucide-react";
import { format } from "date-fns";

const MenopauseEntryModal = ({ isOpen, onClose, colors, user, onSave }) => {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSection, setActiveSection] = useState("symptoms");
  const [saving, setSaving] = useState(false);
  const [savedSections, setSavedSections] = useState([]);

  // Form data specific to menopause
  const [formData, setFormData] = useState({
    // Core symptoms
    hotFlashCount: 0,
    hotFlashSeverity: [],
    nightSweatSeverity: 0,
    nightsWithSweats: 0,

    // Physical symptoms
    jointPain: 0,
    muscleAches: 0,
    headaches: 0,
    fatigue: 0,
    weightChanges: "",
    bodyComposition: "",

    // Cardiovascular
    palpitations: false,
    bloodPressure: "",
    chestDiscomfort: false,

    // Bone health
    boneHealthConcerns: false,
    calciumIntake: false,
    vitaminD: false,
    weightBearing: false,

    // Genitourinary
    vaginalDryness: 0,
    painDuringIntercourse: false,
    libido: 3,
    urinaryFrequency: false,
    urinaryIncontinence: false,
    utis: false,

    // Cognitive & mood
    memoryIssues: 0,
    concentrationDifficulty: 0,
    moodChanges: 0,
    anxiety: 0,
    depression: 0,
    brainFog: 0,

    // Sleep
    sleepQuality: 3,
    sleepHours: 7,
    nightWakings: 0,
    insomnia: false,
    restlessLegs: false,
    sleepApnea: false,

    // Skin, hair, nails
    skinDryness: 0,
    skinElasticity: "normal",
    hairThinning: false,
    nailChanges: false,

    // Energy & wellbeing
    energy: 3,
    overallWellbeing: 3,
    qualityOfLife: 3,

    // Lifestyle
    exercise: "",
    exerciseMinutes: 0,
    strengthTraining: false,
    flexibility: false,
    balance: false,

    // Nutrition
    proteinIntake: "moderate",
    calciumFoods: [],
    hydration: 0,
    alcoholIntake: 0,
    caffeineIntake: 0,

    // Medical management
    hrt: false,
    hrtType: "",
    otherMedications: [],
    supplements: [],

    // Social & emotional
    socialSupport: 3,
    stressLevel: 3,
    copingStrategies: [],

    // Health monitoring
    lastMammogram: "",
    lastBoneDensity: "",
    lastCheckup: "",

    // Notes
    notes: "",
    positiveChanges: "",
    concerns: "",
  });

  // Menopause-specific options
  const calciumFoods = [
    "Dairy",
    "Leafy greens",
    "Fortified foods",
    "Almonds",
    "Sardines",
    "Tofu",
    "Yogurt",
    "Cheese",
  ];

  const otherMedications = [
    "Blood pressure",
    "Cholesterol",
    "Osteoporosis",
    "Antidepressants",
    "Sleep aids",
    "Pain relief",
  ];

  const supplementOptions = [
    "Calcium",
    "Vitamin D",
    "Magnesium",
    "B vitamins",
    "Omega-3",
    "Black cohosh",
    "Evening primrose",
    "Probiotics",
    "Collagen",
    "Vitamin E",
    "Multivitamin",
    "Iron",
  ];

  const copingStrategies = [
    "Meditation",
    "Yoga",
    "Walking",
    "Swimming",
    "Support group",
    "Therapy",
    "Hobbies",
    "Volunteering",
    "Mindfulness",
    "Journaling",
    "Social activities",
    "Creative pursuits",
  ];

  const exerciseTypes = [
    { value: "none", label: "Rest day", icon: Moon },
    { value: "light", label: "Light", icon: Activity },
    { value: "moderate", label: "Moderate", icon: Activity },
    { value: "vigorous", label: "Vigorous", icon: Activity },
  ];

  // Section definitions
  const sections = [
    { id: "symptoms", label: "Symptoms", icon: Flame },
    { id: "physical", label: "Physical Health", icon: Activity },
    { id: "emotional", label: "Mental Health", icon: Brain },
    { id: "lifestyle", label: "Lifestyle", icon: Heart },
    { id: "medical", label: "Medical", icon: Pill },
    { id: "monitoring", label: "Health Monitoring", icon: Shield },
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
        lifeStage: "menopause",
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
      case "symptoms":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Common Symptoms
            </h3>

            {/* Vasomotor symptoms info */}
            <div className="bg-pink-500/20 rounded-lg p-4 border border-pink-500/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-pink-100 font-medium mb-1">
                    Post-Menopausal Symptoms
                  </p>
                  <p className="text-xs text-pink-200">
                    Many women continue to experience symptoms after menopause.
                    Tracking helps identify patterns and effective management
                    strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Hot flashes */}
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

            {/* Physical symptoms */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium">Physical Symptoms</h4>
              {renderSeveritySelector("jointPain", "Joint Pain")}
              {renderSeveritySelector("muscleAches", "Muscle Aches")}
              {renderSeveritySelector("headaches", "Headaches")}
              {renderSeveritySelector("fatigue", "Fatigue")}
            </div>

            {/* Weight changes */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Body Changes</label>
              <select
                value={formData.weightChanges}
                onChange={(e) =>
                  handleInputChange("weightChanges", e.target.value)
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select weight changes...</option>
                <option value="stable">Weight stable</option>
                <option value="gaining">Gaining weight</option>
                <option value="losing">Losing weight</option>
                <option value="redistributing">Weight redistributing</option>
              </select>
            </div>

            {/* Positive note */}
            <div className="bg-green-600/20 rounded-lg p-4">
              <p className="text-sm text-green-200">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Many symptoms improve over time. Focus on what makes you feel
                better!
              </p>
            </div>
          </div>
        );

      case "physical":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Physical Health
            </h3>

            {/* Bone health */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Bone className="w-4 h-4 text-purple-300" />
                Bone Health
              </h4>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.boneHealthConcerns}
                    onChange={(e) =>
                      handleInputChange("boneHealthConcerns", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Bone health concerns</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weightBearing}
                    onChange={(e) =>
                      handleInputChange("weightBearing", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">
                    Did weight-bearing exercise today
                  </span>
                </label>
              </div>
            </div>

            {/* Cardiovascular */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Heart Health
              </h4>

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
                    checked={formData.chestDiscomfort}
                    onChange={(e) =>
                      handleInputChange("chestDiscomfort", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Chest discomfort</span>
                </label>
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-2 block">
                  Blood Pressure (if measured)
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={(e) =>
                    handleInputChange("bloodPressure", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Genitourinary health */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">
                Vaginal & Urinary Health
              </h4>
              {renderSeveritySelector("vaginalDryness", "Vaginal Dryness")}

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.painDuringIntercourse}
                    onChange={(e) =>
                      handleInputChange(
                        "painDuringIntercourse",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Pain during intercourse</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.urinaryFrequency}
                    onChange={(e) =>
                      handleInputChange("urinaryFrequency", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Frequent urination</span>
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
                  <span className="text-white">Urinary leakage</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.utis}
                    onChange={(e) =>
                      handleInputChange("utis", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">UTI symptoms</span>
                </label>
              </div>
            </div>

            {/* Skin & hair */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Skin, Hair & Nails</h4>
              {renderSeveritySelector("skinDryness", "Skin Dryness")}

              <div className="space-y-2">
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
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nailChanges}
                    onChange={(e) =>
                      handleInputChange("nailChanges", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">
                    Nail changes (brittle, ridged)
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case "emotional":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Mental & Emotional Health
            </h3>

            {/* Mood tracking */}
            <div className="space-y-4">
              {renderSeveritySelector("moodChanges", "Mood Changes")}
              {renderSeveritySelector("anxiety", "Anxiety")}
              {renderSeveritySelector("depression", "Depression")}
            </div>

            {/* Cognitive function */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium">Cognitive Function</h4>
              {renderSeveritySelector("memoryIssues", "Memory Issues")}
              {renderSeveritySelector(
                "concentrationDifficulty",
                "Concentration Difficulty"
              )}
              {renderSeveritySelector("brainFog", "Brain Fog")}
            </div>

            {/* Sleep quality */}
            <div className="space-y-4 mt-6">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Sleep Quality
              </h4>

              <div className="space-y-3">
                <label className="text-sm text-purple-200">
                  Overall Sleep Quality
                </label>
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-4">
                  {["😴", "😪", "😐", "😊", "🤗"].map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleInputChange("sleepQuality", index + 1)
                      }
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
                    Night wakings
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, "4+"].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          handleInputChange(
                            "nightWakings",
                            typeof num === "number" ? num : 4
                          )
                        }
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.nightWakings ===
                          (typeof num === "number" ? num : 4)
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
                  <span className="text-white">Insomnia</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.restlessLegs}
                    onChange={(e) =>
                      handleInputChange("restlessLegs", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Restless legs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sleepApnea}
                    onChange={(e) =>
                      handleInputChange("sleepApnea", e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                  />
                  <span className="text-white">Sleep apnea symptoms</span>
                </label>
              </div>
            </div>

            {/* Overall wellbeing */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Overall Wellbeing
              </label>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.overallWellbeing}
                  onChange={(e) =>
                    handleInputChange(
                      "overallWellbeing",
                      parseInt(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="text-white font-medium">
                  {formData.overallWellbeing}/5
                </span>
              </div>
            </div>
          </div>
        );

      case "lifestyle":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Lifestyle & Wellness
            </h3>

            {/* Exercise */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Exercise Today</label>
              <div className="grid grid-cols-4 gap-2">
                {exerciseTypes.map((option) => {
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
                <>
                  <div>
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

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.strengthTraining}
                        onChange={(e) =>
                          handleInputChange(
                            "strengthTraining",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                      />
                      <span className="text-white">
                        Included strength training
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flexibility}
                        onChange={(e) =>
                          handleInputChange("flexibility", e.target.checked)
                        }
                        className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                      />
                      <span className="text-white">Flexibility/stretching</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.balance}
                        onChange={(e) =>
                          handleInputChange("balance", e.target.checked)
                        }
                        className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                      />
                      <span className="text-white">Balance exercises</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Nutrition */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Nutrition</h4>

              <div className="space-y-3">
                <label className="text-sm text-purple-200">
                  Protein Intake
                </label>
                <select
                  value={formData.proteinIntake}
                  onChange={(e) =>
                    handleInputChange("proteinIntake", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-purple-200">
                  Calcium-Rich Foods
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {calciumFoods.map((food) => (
                    <button
                      key={food}
                      onClick={() => handleArrayToggle("calciumFoods", food)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        formData.calciumFoods.includes(food)
                          ? "bg-green-600/30 border-2 border-green-400 text-white"
                          : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      {food}
                    </button>
                  ))}
                </div>
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
                        onClick={() => handleInputChange("hydration", i + 1)}
                        className={`w-8 h-8 rounded transition-all ${
                          formData.hydration >= i + 1
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
            </div>

            {/* Social & Support */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">Social Support</label>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.socialSupport}
                  onChange={(e) =>
                    handleInputChange("socialSupport", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-white font-medium">
                  {formData.socialSupport}/5
                </span>
              </div>
            </div>

            {/* Coping strategies */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Activities That Help
              </label>
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
          </div>
        );

      case "medical":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-400" />
              Medical Management
            </h3>

            {/* HRT */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hrt}
                  onChange={(e) => handleInputChange("hrt", e.target.checked)}
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">
                  Using Hormone Therapy (HT/HRT)
                </span>
              </label>

              {formData.hrt && (
                <div className="ml-8">
                  <input
                    type="text"
                    placeholder="Type of HRT..."
                    value={formData.hrtType}
                    onChange={(e) =>
                      handleInputChange("hrtType", e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>

            {/* Other medications */}
            <div className="space-y-3">
              <label className="text-sm text-purple-200">
                Other Medications
              </label>
              <div className="grid grid-cols-2 gap-2">
                {otherMedications.map((med) => (
                  <button
                    key={med}
                    onClick={() => handleArrayToggle("otherMedications", med)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.otherMedications.includes(med)
                        ? "bg-blue-600/30 border-2 border-blue-400 text-white"
                        : "bg-white/10 border-2 border-white/20 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {med}
                  </button>
                ))}
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

            {/* Medical reminders */}
            <div className="bg-purple-600/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                Important Nutrients
              </h4>
              <ul className="space-y-1 text-sm text-purple-200">
                <li>• Calcium: 1,200mg daily</li>
                <li>• Vitamin D: 800-1,000 IU daily</li>
                <li>• Protein: 1-1.2g per kg body weight</li>
                <li>• B vitamins for energy and mood</li>
              </ul>
            </div>
          </div>
        );

      case "monitoring":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Health Monitoring
            </h3>

            {/* Screening dates */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-purple-200 mb-2 block">
                  Last Mammogram
                </label>
                <input
                  type="date"
                  value={formData.lastMammogram}
                  onChange={(e) =>
                    handleInputChange("lastMammogram", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-2 block">
                  Last Bone Density Scan
                </label>
                <input
                  type="date"
                  value={formData.lastBoneDensity}
                  onChange={(e) =>
                    handleInputChange("lastBoneDensity", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-2 block">
                  Last General Check-up
                </label>
                <input
                  type="date"
                  value={formData.lastCheckup}
                  onChange={(e) =>
                    handleInputChange("lastCheckup", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Health concerns */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Current Health Concerns
              </label>
              <textarea
                value={formData.concerns}
                onChange={(e) => handleInputChange("concerns", e.target.value)}
                placeholder="Note any concerns to discuss with your healthcare provider..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-400 resize-none"
                rows="3"
              />
            </div>

            {/* Positive changes */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Positive Changes You've Noticed
              </label>
              <textarea
                value={formData.positiveChanges}
                onChange={(e) =>
                  handleInputChange("positiveChanges", e.target.value)
                }
                placeholder="Celebrate your wins..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-400 resize-none"
                rows="3"
              />
            </div>

            {/* General notes */}
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

            {/* Health reminders */}
            <div className="bg-blue-600/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                Screening Reminders
              </h4>
              <ul className="space-y-1 text-sm text-blue-200">
                <li>• Mammogram: Every 1-2 years</li>
                <li>• Bone density: Every 2 years</li>
                <li>• Colonoscopy: Every 10 years</li>
                <li>• Annual wellness exam</li>
              </ul>
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
              <h2 className="text-2xl font-bold text-white">
                Menopause Wellness Check-In
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

          {/* Menopause indicator */}
          <div className="mt-3 flex items-center gap-2 text-sm text-pink-200">
            <Flower2 className="w-4 h-4" />
            <span>Embracing this new chapter with grace and strength</span>
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
                      ? "bg-white text-pink-600"
                      : "bg-white/10 text-pink-200 hover:bg-white/20"
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
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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

// Add Bone icon component if not already available
const Bone = (props) => (
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
    <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" />
  </svg>
);

export default MenopauseEntryModal;
