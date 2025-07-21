// frontend/src/components/womenshealth/experiments/CycleAwareExperimentModal.jsx
import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Target,
  Activity,
  Brain,
  Heart,
  Beaker,
  ChevronRight,
  Info,
  Sparkles,
  Moon,
  Sun,
  Droplets,
  Flower2,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";

const CycleAwareExperimentModal = ({
  onClose,
  onStart,
  lifeStage,
  cycleInfo,
  colors,
}) => {
  const [activeTab, setActiveTab] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customExperiment, setCustomExperiment] = useState({
    title: "",
    description: "",
    hypothesis: "",
    duration_days: 14,
    category: "nutrition",
    difficulty_level: "moderate",
    frequency: "daily",
    timing: "anytime",
    symptom_targets: [],
    metrics_to_track: [],
    materials_needed: [],
    expected_outcomes: [],
    precautions: [],
    phase_timing: "any",
    life_stage_specific: lifeStage !== "menstrual",
  });

  // Predefined templates based on life stage
  const getTemplates = () => {
    const baseTemplates = [
      {
        id: "sleep-optimization",
        title: "Sleep Quality Optimization",
        category: "sleep",
        icon: Moon,
        description:
          "Improve sleep quality through evening routine modifications",
        hypothesis:
          "A consistent bedtime routine will improve sleep quality and reduce fatigue",
        duration_days: 21,
        difficulty_level: "easy",
        frequency: "daily",
        timing: "evening",
        symptom_targets: ["fatigue", "insomnia", "mood_swings"],
        metrics_to_track: [
          "sleep_quality",
          "time_to_fall_asleep",
          "morning_energy",
        ],
        materials_needed: [
          "Sleep journal",
          "Blue light blocking glasses (optional)",
        ],
        expected_outcomes: [
          "Better sleep quality",
          "Reduced fatigue",
          "Improved morning energy",
        ],
        precautions: ["Consult doctor if taking sleep medications"],
      },
      {
        id: "anti-inflammatory-diet",
        title: "Anti-Inflammatory Nutrition",
        category: "nutrition",
        icon: Heart,
        description: "Reduce inflammation through dietary changes",
        hypothesis:
          "Anti-inflammatory foods will reduce pain and improve overall wellbeing",
        duration_days: 30,
        difficulty_level: "moderate",
        frequency: "daily",
        timing: "anytime",
        symptom_targets: ["cramps", "bloating", "joint_pain", "headaches"],
        metrics_to_track: ["pain_levels", "bloating", "energy", "mood"],
        materials_needed: ["Food diary", "Anti-inflammatory food list"],
        expected_outcomes: [
          "Reduced pain",
          "Less bloating",
          "More stable energy",
        ],
        precautions: ["Watch for food sensitivities"],
      },
      {
        id: "stress-reduction",
        title: "Stress Management Protocol",
        category: "stress",
        icon: Brain,
        description: "Daily stress reduction techniques",
        hypothesis:
          "Regular stress management will improve hormonal balance and symptoms",
        duration_days: 14,
        difficulty_level: "easy",
        frequency: "twice_daily",
        timing: "morning_evening",
        symptom_targets: ["stress", "anxiety", "mood_swings", "irritability"],
        metrics_to_track: [
          "stress_level",
          "mood",
          "sleep_quality",
          "symptom_severity",
        ],
        materials_needed: ["Meditation app or timer", "Journal"],
        expected_outcomes: [
          "Reduced stress",
          "Better emotional regulation",
          "Improved symptoms",
        ],
        precautions: ["Seek professional help for severe anxiety"],
      },
      {
        id: "gentle-movement",
        title: "Gentle Movement Practice",
        category: "movement",
        icon: Activity,
        description: "Low-impact exercise routine",
        hypothesis:
          "Regular gentle movement will improve energy and reduce pain",
        duration_days: 21,
        difficulty_level: "easy",
        frequency: "daily",
        timing: "morning",
        symptom_targets: ["fatigue", "cramps", "mood_swings", "stiffness"],
        metrics_to_track: ["energy_level", "pain", "mood", "flexibility"],
        materials_needed: ["Yoga mat", "Comfortable clothing"],
        expected_outcomes: ["Increased energy", "Reduced pain", "Better mood"],
        precautions: ["Start slowly, modify as needed"],
      },
    ];

    // Add life-stage specific templates
    if (lifeStage === "perimenopause" || lifeStage === "menopause") {
      baseTemplates.push({
        id: "hot-flash-management",
        title: "Hot Flash Management",
        category: "stress",
        icon: Thermometer,
        description: "Techniques to reduce hot flash frequency and intensity",
        hypothesis:
          "Cooling techniques and stress reduction will minimize hot flashes",
        duration_days: 14,
        difficulty_level: "moderate",
        frequency: "as_needed",
        timing: "anytime",
        symptom_targets: ["hot_flashes", "night_sweats"],
        metrics_to_track: [
          "hot_flash_frequency",
          "hot_flash_intensity",
          "sleep_disruption",
        ],
        materials_needed: ["Cooling vest or fan", "Temperature diary"],
        expected_outcomes: [
          "Fewer hot flashes",
          "Less severe symptoms",
          "Better sleep",
        ],
        precautions: ["Track triggers carefully"],
        life_stage_specific: true,
      });
    }

    return baseTemplates;
  };

  const templates = getTemplates();

  // Common symptoms by category
  const symptomOptions = {
    menstrual: [
      "cramps",
      "bloating",
      "mood_swings",
      "fatigue",
      "headaches",
      "breast_tenderness",
      "acne",
      "irritability",
    ],
    perimenopause: [
      "hot_flashes",
      "night_sweats",
      "irregular_periods",
      "mood_swings",
      "fatigue",
      "brain_fog",
      "weight_gain",
      "insomnia",
    ],
    menopause: [
      "hot_flashes",
      "night_sweats",
      "mood_swings",
      "fatigue",
      "joint_pain",
      "dry_skin",
      "weight_gain",
      "insomnia",
    ],
  };

  // Metrics options
  const metricOptions = [
    "symptom_severity",
    "energy_level",
    "mood",
    "sleep_quality",
    "pain_level",
    "stress_level",
    "productivity",
    "exercise_duration",
    "water_intake",
    "supplement_adherence",
  ];

  // Handle template selection
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setCustomExperiment({
      ...customExperiment,
      ...template,
      experiment_source: "manual",
    });
    setActiveTab("customize");
  };

  // Handle custom field updates
  const updateCustomField = (field, value) => {
    setCustomExperiment({
      ...customExperiment,
      [field]: value,
    });
  };

  // Add/remove array items
  const addArrayItem = (field, item) => {
    if (item && !customExperiment[field].includes(item)) {
      updateCustomField(field, [...customExperiment[field], item]);
    }
  };

  const removeArrayItem = (field, item) => {
    updateCustomField(
      field,
      customExperiment[field].filter((i) => i !== item)
    );
  };

  // Validate experiment
  const isValid = () => {
    return (
      customExperiment.title &&
      customExperiment.description &&
      customExperiment.hypothesis &&
      customExperiment.duration_days > 0 &&
      customExperiment.symptom_targets.length > 0 &&
      customExperiment.metrics_to_track.length > 0
    );
  };

  // Start experiment
  const handleStart = () => {
    if (isValid()) {
      onStart({
        ...customExperiment,
        status: "active",
        started_at: new Date().toISOString(),
        experiment_source: "manual",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Create New Experiment
              </h3>
              <p className="text-purple-200">
                Start with a template or create your own wellness experiment
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-purple-200" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("template")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "template"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:text-white"
              }`}
            >
              Choose Template
            </button>
            <button
              onClick={() => setActiveTab("customize")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "customize"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:text-white"
              }`}
            >
              Customize
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {activeTab === "template" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">
                          {template.title}
                        </h4>
                        <p className="text-purple-200 text-sm mb-3">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                            {template.duration_days} days
                          </span>
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                            {template.difficulty_level}
                          </span>
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}

              {/* Create from scratch option */}
              <button
                onClick={() => setActiveTab("customize")}
                className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      Create from Scratch
                    </h4>
                    <p className="text-purple-200 text-sm">
                      Design your own experiment tailored to your specific needs
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {activeTab === "customize" && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={customExperiment.title}
                      onChange={(e) =>
                        updateCustomField("title", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Give your experiment a clear title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Description
                    </label>
                    <textarea
                      value={customExperiment.description}
                      onChange={(e) =>
                        updateCustomField("description", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Describe what you'll be doing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Hypothesis
                    </label>
                    <textarea
                      value={customExperiment.hypothesis}
                      onChange={(e) =>
                        updateCustomField("hypothesis", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="What do you expect to happen?"
                    />
                  </div>
                </div>
              </div>

              {/* Experiment Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Experiment Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Duration (days)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCustomField(
                            "duration_days",
                            Math.max(1, customExperiment.duration_days - 1)
                          )
                        }
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 text-purple-200" />
                      </button>
                      <input
                        type="number"
                        value={customExperiment.duration_days}
                        onChange={(e) =>
                          updateCustomField(
                            "duration_days",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="90"
                      />
                      <button
                        onClick={() =>
                          updateCustomField(
                            "duration_days",
                            Math.min(90, customExperiment.duration_days + 1)
                          )
                        }
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-purple-200" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Category
                    </label>
                    <select
                      value={customExperiment.category}
                      onChange={(e) =>
                        updateCustomField("category", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="nutrition">Nutrition</option>
                      <option value="movement">Movement</option>
                      <option value="stress">Stress Management</option>
                      <option value="sleep">Sleep</option>
                      <option value="supplements">Supplements</option>
                      <option value="mindfulness">Mindfulness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={customExperiment.difficulty_level}
                      onChange={(e) =>
                        updateCustomField("difficulty_level", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Frequency
                    </label>
                    <select
                      value={customExperiment.frequency}
                      onChange={(e) =>
                        updateCustomField("frequency", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice_daily">Twice Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as_needed">As Needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Best Timing
                    </label>
                    <select
                      value={customExperiment.timing}
                      onChange={(e) =>
                        updateCustomField("timing", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="anytime">Anytime</option>
                      <option value="morning_evening">Morning & Evening</option>
                    </select>
                  </div>

                  {lifeStage === "menstrual" && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Cycle Phase Timing
                      </label>
                      <select
                        value={customExperiment.phase_timing}
                        onChange={(e) =>
                          updateCustomField("phase_timing", e.target.value)
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="any">Any Phase</option>
                        <option value="menstrual">Menstrual Phase</option>
                        <option value="follicular">Follicular Phase</option>
                        <option value="ovulation">Ovulation Phase</option>
                        <option value="luteal">Luteal Phase</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Symptoms */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Target Symptoms
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {symptomOptions[lifeStage]?.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => {
                          if (
                            customExperiment.symptom_targets.includes(symptom)
                          ) {
                            removeArrayItem("symptom_targets", symptom);
                          } else {
                            addArrayItem("symptom_targets", symptom);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          customExperiment.symptom_targets.includes(symptom)
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        {symptom.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                  {customExperiment.symptom_targets.length === 0 && (
                    <p className="text-purple-300 text-sm">
                      Select at least one symptom to target
                    </p>
                  )}
                </div>
              </div>

              {/* Metrics to Track */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Metrics to Track
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {metricOptions.map((metric) => (
                      <button
                        key={metric}
                        onClick={() => {
                          if (
                            customExperiment.metrics_to_track.includes(metric)
                          ) {
                            removeArrayItem("metrics_to_track", metric);
                          } else {
                            addArrayItem("metrics_to_track", metric);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          customExperiment.metrics_to_track.includes(metric)
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        {metric.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                  {customExperiment.metrics_to_track.length === 0 && (
                    <p className="text-purple-300 text-sm">
                      Select at least one metric to track progress
                    </p>
                  )}
                </div>
              </div>

              {/* Validation Warnings */}
              {!isValid() && (
                <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-600/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-100 text-sm">
                      Please fill in all required fields to start your
                      experiment
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/20 backdrop-blur-sm p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>

            {activeTab === "customize" && (
              <button
                onClick={handleStart}
                disabled={!isValid()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Beaker className="w-4 h-4" />
                Start Experiment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleAwareExperimentModal;
