// src/components/womenshealth/MenopauseEntryModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import { supabase } from "../../lib/supabase";
import {
  X,
  Calendar,
  Heart,
  Sun,
  Activity,
  Brain,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Save,
  Sparkles,
  HelpCircle,
  Crown,
  Sunrise,
  Shield,
  Target,
  Award,
  BookOpen,
} from "lucide-react";

const MenopauseEntryModal = ({
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
  const [monthsSinceMenopause, setMonthsSinceMenopause] = useState("");
  const [onHRT, setOnHRT] = useState(false);
  const [hrtType, setHrtType] = useState("");

  // Menopause-specific symptoms and wellness tracking
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [overallWellbeing, setOverallWellbeing] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Wellness and vitality tracking
  const [moodRating, setMoodRating] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [vitalityScore, setVitalityScore] = useState(5);
  const [selfConfidence, setSelfConfidence] = useState(5);

  // Menopause-specific advanced tracking
  const [hotFlashFrequency, setHotFlashFrequency] = useState("");
  const [vaginalHealth, setVaginalHealth] = useState("");
  const [boneHealthConcerns, setBoneHealthConcerns] = useState(false);
  const [heartHealthFocus, setHeartHealthFocus] = useState("");
  const [sexualWellness, setSexualWellness] = useState("");
  const [cognitiveWellness, setCognitiveWellness] = useState(5);
  const [lifeGoals, setLifeGoals] = useState("");
  const [newIdentity, setNewIdentity] = useState("");

  // UI state
  const [activeSection, setActiveSection] = useState("basics");

  const isAdvancedUser = hasAccess("advanced_womens_health");

  // Menopause-specific symptoms with empowering context
  const menopauseSymptoms = [
    {
      id: "hot_flashes",
      label: "Hot Flashes",
      icon: "🔥",
      category: "thermal",
      info: "Often decrease in frequency and intensity over time. Track patterns to discuss management options with your healthcare provider.",
    },
    {
      id: "night_sweats",
      label: "Night Sweats",
      icon: "🌙",
      category: "thermal",
      info: "Can improve with lifestyle changes and treatment options. Quality sleep is essential for your overall wellness.",
    },
    {
      id: "vaginal_dryness",
      label: "Vaginal Dryness",
      icon: "🌸",
      category: "sexual",
      info: "Very common and treatable. Don't suffer in silence - many effective treatments are available.",
    },
    {
      id: "mood_changes",
      label: "Mood Fluctuations",
      icon: "🎭",
      category: "emotional",
      info: "Often stabilize after the transition period. Your emotional wisdom is valuable - honor your feelings.",
    },
    {
      id: "anxiety",
      label: "Anxiety",
      icon: "😰",
      category: "emotional",
      info: "Can be managed with various approaches. Your life experience gives you tools to cope.",
    },
    {
      id: "brain_fog",
      label: "Memory/Focus Issues",
      icon: "🌫️",
      category: "cognitive",
      info: "Often improves post-menopause. Your accumulated knowledge and wisdom are invaluable assets.",
    },
    {
      id: "fatigue",
      label: "Fatigue",
      icon: "😴",
      category: "physical",
      info: "Listen to your body's needs. Rest is productive and necessary for optimal health.",
    },
    {
      id: "joint_stiffness",
      label: "Joint Stiffness",
      icon: "🦴",
      category: "physical",
      info: "Stay active with appropriate exercise. Movement is medicine for joint health.",
    },
    {
      id: "weight_changes",
      label: "Body Changes",
      icon: "⚖️",
      category: "physical",
      info: "Your body has served you well. Focus on health and strength rather than just weight.",
    },
    {
      id: "skin_changes",
      label: "Skin Changes",
      icon: "✨",
      category: "physical",
      info: "Each line tells a story of your experiences. Embrace your natural beauty and wisdom.",
    },
    {
      id: "hair_changes",
      label: "Hair Changes",
      icon: "💇‍♀️",
      category: "physical",
      info: "Explore new styles that reflect this exciting life phase. Change can be liberating.",
    },
    {
      id: "libido_changes",
      label: "Sexual Changes",
      icon: "💕",
      category: "sexual",
      info: "Sexuality can evolve beautifully. Communicate openly and explore what brings you joy.",
    },
    {
      id: "sleep_changes",
      label: "Sleep Changes",
      icon: "🛌",
      category: "physical",
      info: "Prioritize sleep hygiene. Quality rest supports every aspect of your health and vitality.",
    },
    {
      id: "energy_shifts",
      label: "Energy Patterns",
      icon: "⚡",
      category: "physical",
      info: "Your energy may be different but can be powerful. Align activities with your natural rhythms.",
    },
    {
      id: "digestive_changes",
      label: "Digestive Changes",
      icon: "🌱",
      category: "physical",
      info: "Your body's needs may change. Listen to what nourishes you best at this stage.",
    },
  ];

  // Menopause empowerment themes
  const empowermentThemes = [
    {
      title: "Freedom & Liberation",
      emoji: "🕊️",
      description:
        "Embrace the freedom from monthly cycles and reproductive concerns",
    },
    {
      title: "Wisdom & Experience",
      emoji: "🌟",
      description:
        "Your accumulated knowledge and life experience are invaluable assets",
    },
    {
      title: "New Possibilities",
      emoji: "🌈",
      description:
        "This life stage opens doors to new adventures and self-discovery",
    },
    {
      title: "Authentic Self",
      emoji: "👑",
      description:
        "Time to live authentically and prioritize what truly matters to you",
    },
  ];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setEntryDate(initialData.date || new Date().toISOString().split("T")[0]);
      setMonthsSinceMenopause(
        initialData.months_since_menopause?.toString() || ""
      );
      setOnHRT(initialData.on_hrt || false);
      setHrtType(initialData.hrt_type || "");
      setSelectedSymptoms(
        initialData.symptoms ? initialData.symptoms.split(",") : []
      );
      setOverallWellbeing(initialData.overall_wellbeing || 5);
      setMoodRating(initialData.mood_rating || 5);
      setEnergyLevel(initialData.energy_level || 5);
      setSleepQuality(initialData.sleep_quality || 5);
      setStressLevel(initialData.stress_level || 5);
      setVitalityScore(initialData.vitality_score || 5);
      setSelfConfidence(initialData.self_confidence || 5);
      setSymptomNotes(initialData.notes || "");

      // Advanced fields
      if (isAdvancedUser) {
        setHotFlashFrequency(initialData.hot_flash_frequency || "");
        setVaginalHealth(initialData.vaginal_health || "");
        setBoneHealthConcerns(initialData.bone_health_concerns || false);
        setHeartHealthFocus(initialData.heart_health_focus || "");
        setSexualWellness(initialData.sexual_wellness || "");
        setCognitiveWellness(initialData.cognitive_wellness || 5);
        setLifeGoals(initialData.life_goals || "");
        setNewIdentity(initialData.new_identity || "");
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
        life_stage: "menopause",
        months_since_menopause: monthsSinceMenopause
          ? parseInt(monthsSinceMenopause)
          : null,
        on_hrt: onHRT,
        hrt_type: hrtType || null,
        symptoms: selectedSymptoms.join(","),
        overall_wellbeing: overallWellbeing,
        mood_rating: moodRating,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        vitality_score: vitalityScore,
        self_confidence: selfConfidence,
        notes: symptomNotes,
      };

      // Add advanced fields for premium users
      if (isAdvancedUser) {
        healthData.hot_flash_frequency = hotFlashFrequency || null;
        healthData.vaginal_health = vaginalHealth || null;
        healthData.bone_health_concerns = boneHealthConcerns;
        healthData.heart_health_focus = heartHealthFocus || null;
        healthData.sexual_wellness = sexualWellness || null;
        healthData.cognitive_wellness = cognitiveWellness;
        healthData.life_goals = lifeGoals || null;
        healthData.new_identity = newIdentity || null;
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
      console.error("Error saving menopause data:", err);
      setError(err.message || "Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "basics", label: "Basics", icon: Calendar },
    { id: "symptoms", label: "Wellness Check", icon: Activity },
    { id: "vitality", label: "Vitality & Mood", icon: Heart },
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
      vitality: [
        "Depleted",
        "Low",
        "Struggling",
        "Fair",
        "Okay",
        "Good",
        "Strong",
        "Vibrant",
        "Thriving",
        "Radiant",
      ],
      confidence: [
        "Very Low",
        "Low",
        "Uncertain",
        "Fair",
        "Okay",
        "Good",
        "Strong",
        "Very Strong",
        "Empowered",
        "Unstoppable",
      ],
      wellbeing: [
        "Poor",
        "Low",
        "Struggling",
        "Fair",
        "Okay",
        "Good",
        "Very Good",
        "Excellent",
        "Thriving",
        "Radiant",
      ],
      cognitive: [
        "Very Foggy",
        "Foggy",
        "Unclear",
        "Fair",
        "Okay",
        "Good",
        "Sharp",
        "Very Sharp",
        "Brilliant",
        "Crystal Clear",
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
            <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Edit Wellness Entry" : "Add Wellness Entry"}
              </h2>
              <p className="text-sm text-gray-600">
                Celebrate your wisdom years with comprehensive wellness tracking
                {isAdvancedUser && (
                  <span className="text-amber-600 font-medium">
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

        {/* Empowerment Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">
              Your Wisdom Years: A Time of Freedom & Possibility
            </span>
            <Tooltip content="Menopause marks the beginning of a powerful life phase. You're free from monthly cycles and empowered by your accumulated wisdom and experience.">
              <HelpCircle className="w-4 h-4 text-amber-600 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-sm text-amber-700">
            This is your time to thrive, explore new possibilities, and embrace
            the wisdom that comes with experience. Track your wellness journey
            with pride.
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
                    ? "border-amber-500 text-amber-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months Since Menopause
                    <Tooltip content="Knowing how long you've been post-menopausal helps track how your body is adapting to this new phase. Most symptoms stabilize over time.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline ml-1" />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={monthsSinceMenopause}
                    onChange={(e) => setMonthsSinceMenopause(e.target.value)}
                    placeholder="Months (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* HRT Information */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={onHRT}
                      onChange={(e) => setOnHRT(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span className="font-medium text-gray-900">
                      Currently on Hormone Replacement Therapy (HRT)
                    </span>
                    <Tooltip content="HRT can help manage menopause symptoms. Track your experience to discuss effectiveness with your healthcare provider.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                </div>

                {onHRT && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HRT Type
                    </label>
                    <select
                      value={hrtType}
                      onChange={(e) => setHrtType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select type...</option>
                      <option value="estrogen_only">Estrogen Only</option>
                      <option value="combined_hrt">
                        Combined HRT (Estrogen + Progesterone)
                      </option>
                      <option value="bioidentical">
                        Bioidentical Hormones
                      </option>
                      <option value="patch">Hormone Patch</option>
                      <option value="gel_cream">Gel/Cream</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Empowerment Themes */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-3">
                  Celebrating Your Menopause Journey
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {empowermentThemes.map((theme, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-amber-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{theme.emoji}</span>
                        <span className="font-medium text-sm text-amber-900">
                          {theme.title}
                        </span>
                      </div>
                      <p className="text-xs text-amber-700">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wellness Check Section */}
          {activeSection === "symptoms" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How Are You Feeling Today? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {menopauseSymptoms.map((symptom) => (
                    <Tooltip key={symptom.id} content={symptom.info}>
                      <button
                        type="button"
                        onClick={() => handleSymptomToggle(symptom.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                          selectedSymptoms.includes(symptom.id)
                            ? "border-amber-500 bg-amber-50 text-amber-700"
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
                  Add Custom Experience
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder="Describe something not listed..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyPress={(e) => e.key === "Enter" && addCustomSymptom()}
                  />
                  <button
                    type="button"
                    onClick={addCustomSymptom}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Overall Wellbeing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Wellbeing Today: {overallWellbeing} (
                  {getRatingLabel(overallWellbeing, "wellbeing")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Poor</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={overallWellbeing}
                    onChange={(e) =>
                      setOverallWellbeing(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Radiant</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    overallWellbeing
                  )}`}
                >
                  {getRatingLabel(overallWellbeing, "wellbeing")}
                </div>
              </div>

              {/* Wellness Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wellness Reflections (optional)
                </label>
                <textarea
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="How are you honoring your body today? Any insights about your wellness journey..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Vitality & Mood Section */}
          {activeSection === "vitality" && (
            <div className="space-y-6">
              {/* Mood Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Emotional Wellbeing: {moodRating} (
                  {getRatingLabel(moodRating, "mood")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Low</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodRating}
                    onChange={(e) => setMoodRating(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Excellent</span>
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
                  <span className="text-sm text-gray-500">Depleted</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Vibrant</span>
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
                  <span className="text-sm text-gray-500">Poor</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Restorative</span>
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

              {/* Vitality Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Life Vitality: {vitalityScore} (
                  {getRatingLabel(vitalityScore, "vitality")})
                  <Tooltip content="How alive, energetic, and engaged do you feel in your life right now? Your vitality can be powerful at any age.">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline ml-1" />
                  </Tooltip>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Depleted</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={vitalityScore}
                    onChange={(e) => setVitalityScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Radiant</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    vitalityScore
                  )}`}
                >
                  {getRatingLabel(vitalityScore, "vitality")}
                </div>
              </div>

              {/* Self Confidence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Self-Confidence: {selfConfidence} (
                  {getRatingLabel(selfConfidence, "confidence")})
                  <Tooltip content="How confident and empowered do you feel? Your accumulated wisdom and experience are sources of strength.">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline ml-1" />
                  </Tooltip>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Low</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={selfConfidence}
                    onChange={(e) =>
                      setSelfConfidence(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Unstoppable</span>
                </div>
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getRatingColor(
                    selfConfidence
                  )}`}
                >
                  {getRatingLabel(selfConfidence, "confidence")}
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
                    Advanced Menopause Wellness Tracking
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Comprehensive tracking supports optimal health management and
                  meaningful healthcare conversations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hot Flash Tracking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hot Flash Frequency (if any)
                  </label>
                  <select
                    value={hotFlashFrequency}
                    onChange={(e) => setHotFlashFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select frequency...</option>
                    <option value="none">None today</option>
                    <option value="rare">Rare/Occasional</option>
                    <option value="1-2">1-2 times</option>
                    <option value="3-5">3-5 times</option>
                    <option value="frequent">Frequent (6+)</option>
                  </select>
                </div>

                {/* Vaginal Health */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaginal/Sexual Health
                  </label>
                  <select
                    value={vaginalHealth}
                    onChange={(e) => setVaginalHealth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select status...</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="mild_dryness">Mild dryness</option>
                    <option value="moderate_dryness">Moderate dryness</option>
                    <option value="discomfort">Discomfort</option>
                    <option value="using_treatment">Using treatment</option>
                  </select>
                </div>

                {/* Heart Health Focus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Health Focus
                  </label>
                  <select
                    value={heartHealthFocus}
                    onChange={(e) => setHeartHealthFocus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select focus...</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="concerns">Have concerns</option>
                    <option value="medical_care">Under medical care</option>
                  </select>
                </div>

                {/* Sexual Wellness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Wellness
                  </label>
                  <select
                    value={sexualWellness}
                    onChange={(e) => setSexualWellness(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select status...</option>
                    <option value="thriving">Thriving</option>
                    <option value="satisfying">Satisfying</option>
                    <option value="changing">Evolving/Changing</option>
                    <option value="challenges">Facing challenges</option>
                    <option value="not_applicable">Not applicable</option>
                  </select>
                </div>
              </div>

              {/* Bone Health */}
              <div>
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={boneHealthConcerns}
                    onChange={(e) => setBoneHealthConcerns(e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">
                    Actively focusing on bone health
                  </span>
                  <Tooltip content="Post-menopause bone health is crucial. Weight-bearing exercise, calcium, vitamin D, and regular screening support strong bones.">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
              </div>

              {/* Cognitive Wellness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cognitive Wellness: {cognitiveWellness} (
                  {getRatingLabel(cognitiveWellness, "cognitive")})
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Foggy</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cognitiveWellness}
                    onChange={(e) =>
                      setCognitiveWellness(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Crystal Clear</span>
                </div>
              </div>

              {/* Life Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Life Goals & Aspirations
                </label>
                <textarea
                  value={lifeGoals}
                  onChange={(e) => setLifeGoals(e.target.value)}
                  placeholder="What are you excited to pursue in this life phase? Travel, hobbies, career changes, relationships..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* New Identity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evolving Identity & Self-Discovery
                </label>
                <textarea
                  value={newIdentity}
                  onChange={(e) => setNewIdentity(e.target.value)}
                  placeholder="How are you growing and changing? What new aspects of yourself are you discovering..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          background: #d97706;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d97706;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default MenopauseEntryModal;
