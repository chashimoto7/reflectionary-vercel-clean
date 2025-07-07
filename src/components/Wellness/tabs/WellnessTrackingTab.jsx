// frontend/ src/components/wellness/tabs/WellnessTrackingTab.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Activity,
  Heart,
  Moon,
  Brain,
  Zap,
  Droplets,
  Clock,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Coffee,
  Pizza,
  Apple,
  Salad,
  Cookie,
  Fish,
  Dumbbell,
  Users,
  Music,
  Book,
  Palette,
  Mountain,
  Smile,
  Frown,
  Meh,
  Star,
  AlertCircle,
  Save,
  Calendar,
  TrendingUp,
  Wind,
  Sun,
  Cloud,
  Thermometer,
  Home,
  Building,
  Trees,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const WellnessTrackingTab = ({ colors, user }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [wellnessData, setWellnessData] = useState({
    // Core metrics
    energy: 5,
    mood: 5,
    stress: 5,

    // Sleep
    sleep_hours: 7,
    sleep_quality: 5,
    sleep_time: "23:00",
    wake_time: "07:00",
    sleep_disturbances: 0,

    // Physical
    exercise_minutes: 0,
    exercise_type: [],
    exercise_intensity: 5,
    steps: 0,
    active_calories: 0,

    // Nutrition & Hydration
    water_glasses: 0,
    caffeine_cups: 0,
    alcohol_units: 0,
    meals_quality: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
    },

    // Mental & Social
    meditation_minutes: 0,
    social_interactions: 0,
    social_quality: 5,
    screen_time_hours: 0,

    // Environmental
    outdoors_minutes: 0,
    weather_mood_impact: 5,
    work_location: "office",

    // Symptoms & Feelings
    symptoms: [],
    emotions: [],

    // Activities & Habits
    positive_activities: [],
    gratitude_count: 0,

    // Notes
    notes: "",
    voice_note_url: null,
  });

  const [expandedSections, setExpandedSections] = useState({
    core: true,
    sleep: true,
    physical: true,
    nutrition: true,
    mental: false,
    environmental: false,
    symptoms: false,
    activities: false,
  });

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);

  // Exercise types
  const exerciseTypes = [
    { id: "walking", label: "Walking", icon: Activity },
    { id: "running", label: "Running", icon: Activity },
    { id: "cycling", label: "Cycling", icon: Activity },
    { id: "swimming", label: "Swimming", icon: Activity },
    { id: "yoga", label: "Yoga", icon: Activity },
    { id: "strength", label: "Strength", icon: Dumbbell },
    { id: "sports", label: "Sports", icon: Activity },
    { id: "dance", label: "Dance", icon: Music },
  ];

  // Symptoms
  const commonSymptoms = [
    "Headache",
    "Fatigue",
    "Nausea",
    "Anxiety",
    "Insomnia",
    "Body aches",
    "Digestive issues",
    "Brain fog",
    "Irritability",
  ];

  // Emotions
  const emotionOptions = [
    { id: "happy", label: "Happy", icon: Smile },
    { id: "sad", label: "Sad", icon: Frown },
    { id: "anxious", label: "Anxious", icon: AlertCircle },
    { id: "calm", label: "Calm", icon: Heart },
    { id: "excited", label: "Excited", icon: Sparkles },
    { id: "frustrated", label: "Frustrated", icon: Meh },
    { id: "grateful", label: "Grateful", icon: Star },
    { id: "motivated", label: "Motivated", icon: TrendingUp },
  ];

  // Positive activities
  const positiveActivities = [
    { id: "meditation", label: "Meditation", icon: Brain },
    { id: "reading", label: "Reading", icon: Book },
    { id: "music", label: "Music", icon: Music },
    { id: "art", label: "Creative Art", icon: Palette },
    { id: "nature", label: "Nature Time", icon: Trees },
    { id: "social", label: "Social Time", icon: Users },
    { id: "hobby", label: "Hobby", icon: Star },
    { id: "selfcare", label: "Self Care", icon: Heart },
  ];

  useEffect(() => {
    loadDayData();
  }, [selectedDate, user]);

  useEffect(() => {
    // Autosave every 30 seconds if enabled
    if (autosaveEnabled) {
      const interval = setInterval(() => {
        saveData(true); // silent save
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [wellnessData, autosaveEnabled]);

  const loadDayData = async () => {
    try {
      const { data, error } = await supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", selectedDate)
        .single();

      if (data) {
        setWellnessData((prev) => ({
          ...prev,
          ...data,
          exercise_type: data.exercise_type || [],
          symptoms: data.symptoms || [],
          emotions: data.emotions || [],
          positive_activities: data.positive_activities || [],
          meals_quality: data.meals_quality || prev.meals_quality,
        }));
      }
    } catch (error) {
      console.error("Error loading wellness data:", error);
    }
  };

  const saveData = async (silent = false) => {
    try {
      setSaving(true);

      const { error } = await supabase.from("wellness_entries").upsert({
        user_id: user.id,
        date: selectedDate,
        ...wellnessData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      if (!silent) {
        setLastSaved(new Date());
        setTimeout(() => setLastSaved(null), 3000);
      }
    } catch (error) {
      console.error("Error saving wellness data:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateData = (field, value) => {
    setWellnessData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleArrayItem = (field, item) => {
    setWellnessData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  // Calculate sleep duration
  const calculateSleepDuration = () => {
    if (wellnessData.sleep_time && wellnessData.wake_time) {
      const sleepTime = new Date(`2000-01-01T${wellnessData.sleep_time}`);
      let wakeTime = new Date(`2000-01-01T${wellnessData.wake_time}`);

      // If wake time is before sleep time, add a day
      if (wakeTime < sleepTime) {
        wakeTime = new Date(`2000-01-02T${wellnessData.wake_time}`);
      }

      const duration = (wakeTime - sleepTime) / (1000 * 60 * 60);
      updateData("sleep_hours", Math.round(duration * 10) / 10);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Track Your Wellness
            </h3>
            <p className="text-purple-200">
              Log your daily wellness metrics in detail
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <button
              onClick={() => saveData()}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            Saved successfully
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="autosave"
            checked={autosaveEnabled}
            onChange={(e) => setAutosaveEnabled(e.target.checked)}
            className="rounded border-white/20 bg-white/10 text-purple-600"
          />
          <label htmlFor="autosave" className="text-purple-200 text-sm">
            Enable autosave (every 30 seconds)
          </label>
        </div>
      </div>

      {/* Core Metrics Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("core")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Core Wellness Metrics
          </h3>
          {expandedSections.core ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.core && (
          <div className="p-6 pt-0 space-y-6">
            {/* Energy */}
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Energy Level
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.energy}
                  onChange={(e) =>
                    updateData("energy", parseInt(e.target.value))
                  }
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.energy}
                </span>
              </div>
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Exhausted</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Overall Mood
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.mood}
                  onChange={(e) => updateData("mood", parseInt(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.mood}
                </span>
              </div>
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Very Low</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Stress */}
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Stress Level
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.stress}
                  onChange={(e) =>
                    updateData("stress", parseInt(e.target.value))
                  }
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.stress}
                </span>
              </div>
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Very Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sleep Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("sleep")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            Sleep Tracking
          </h3>
          {expandedSections.sleep ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.sleep && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={wellnessData.sleep_time}
                  onChange={(e) => {
                    updateData("sleep_time", e.target.value);
                    calculateSleepDuration();
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wellnessData.wake_time}
                  onChange={(e) => {
                    updateData("wake_time", e.target.value);
                    calculateSleepDuration();
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Total Sleep: {wellnessData.sleep_hours} hours
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={wellnessData.sleep_hours}
                onChange={(e) =>
                  updateData("sleep_hours", parseFloat(e.target.value))
                }
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Sleep Quality
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.sleep_quality}
                  onChange={(e) =>
                    updateData("sleep_quality", parseInt(e.target.value))
                  }
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.sleep_quality}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Sleep Disturbances
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, "5+"].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      updateData(
                        "sleep_disturbances",
                        typeof num === "number" ? num : 5
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      wellnessData.sleep_disturbances ===
                      (typeof num === "number" ? num : 5)
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-purple-300 hover:bg-white/20"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physical Activity Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("physical")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Physical Activity
          </h3>
          {expandedSections.physical ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.physical && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Exercise Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={wellnessData.exercise_minutes}
                onChange={(e) =>
                  updateData("exercise_minutes", parseInt(e.target.value) || 0)
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Exercise Types
              </label>
              <div className="grid grid-cols-4 gap-2">
                {exerciseTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = wellnessData.exercise_type.includes(
                    type.id
                  );
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleArrayItem("exercise_type", type.id)}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-white/10 text-purple-300 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Exercise Intensity
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.exercise_intensity}
                  onChange={(e) =>
                    updateData("exercise_intensity", parseInt(e.target.value))
                  }
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.exercise_intensity}
                </span>
              </div>
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Light</span>
                <span>Intense</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Steps
                </label>
                <input
                  type="number"
                  min="0"
                  value={wellnessData.steps}
                  onChange={(e) =>
                    updateData("steps", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Active Calories
                </label>
                <input
                  type="number"
                  min="0"
                  value={wellnessData.active_calories}
                  onChange={(e) =>
                    updateData("active_calories", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nutrition & Hydration Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("nutrition")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-400" />
            Nutrition & Hydration
          </h3>
          {expandedSections.nutrition ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.nutrition && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Water Intake (glasses)
              </label>
              <div className="flex gap-2 flex-wrap">
                {[...Array(12)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateData("water_glasses", i + 1)}
                    className={`p-2 rounded-lg transition-colors ${
                      wellnessData.water_glasses >= i + 1
                        ? "bg-cyan-500 text-white"
                        : "bg-white/10 text-purple-300 hover:bg-white/20"
                    }`}
                  >
                    <Droplets className="w-5 h-5" />
                  </button>
                ))}
              </div>
              <p className="text-purple-300 text-sm mt-1">
                {wellnessData.water_glasses} glasses
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  <Coffee className="w-4 h-4 inline mr-1" />
                  Caffeine (cups)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={wellnessData.caffeine_cups}
                  onChange={(e) =>
                    updateData("caffeine_cups", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Alcohol (units)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={wellnessData.alcohol_units}
                  onChange={(e) =>
                    updateData("alcohol_units", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-3">
                Meal Quality Ratings
              </label>
              <div className="space-y-3">
                {Object.entries(wellnessData.meals_quality).map(
                  ([meal, quality]) => (
                    <div key={meal} className="flex items-center gap-3">
                      <span className="text-purple-300 capitalize w-20">
                        {meal}
                      </span>
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() =>
                              updateData("meals_quality", {
                                ...wellnessData.meals_quality,
                                [meal]: rating,
                              })
                            }
                            className={`flex-1 py-2 rounded transition-colors ${
                              quality >= rating
                                ? "bg-green-500 text-white"
                                : "bg-white/10 text-purple-300 hover:bg-white/20"
                            }`}
                          >
                            {rating === 1
                              ? "😞"
                              : rating === 3
                              ? "😐"
                              : rating === 5
                              ? "😊"
                              : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mental & Social Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("mental")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Mental & Social Wellness
          </h3>
          {expandedSections.mental ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.mental && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Meditation/Mindfulness (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={wellnessData.meditation_minutes}
                  onChange={(e) =>
                    updateData(
                      "meditation_minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Screen Time (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={wellnessData.screen_time_hours}
                  onChange={(e) =>
                    updateData(
                      "screen_time_hours",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Social Interactions
              </label>
              <input
                type="number"
                min="0"
                value={wellnessData.social_interactions}
                onChange={(e) =>
                  updateData(
                    "social_interactions",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                placeholder="Number of meaningful social interactions"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Social Interaction Quality
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.social_quality}
                  onChange={(e) =>
                    updateData("social_quality", parseInt(e.target.value))
                  }
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.social_quality}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Gratitude Count
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateData(
                      "gratitude_count",
                      Math.max(0, wellnessData.gratitude_count - 1)
                    )
                  }
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-lg w-12 text-center">
                  {wellnessData.gratitude_count}
                </span>
                <button
                  onClick={() =>
                    updateData(
                      "gratitude_count",
                      wellnessData.gratitude_count + 1
                    )
                  }
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-purple-300 text-sm ml-2">
                  things I'm grateful for
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Factors */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("environmental")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            Environmental Factors
          </h3>
          {expandedSections.environmental ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.environmental && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Time Outdoors (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={wellnessData.outdoors_minutes}
                onChange={(e) =>
                  updateData("outdoors_minutes", parseInt(e.target.value) || 0)
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Weather Impact on Mood
              </label>
              <div className="flex items-center gap-4">
                <Cloud className="w-5 h-5 text-purple-300" />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.weather_mood_impact}
                  onChange={(e) =>
                    updateData("weather_mood_impact", parseInt(e.target.value))
                  }
                  className="flex-1 accent-purple-500"
                />
                <Sun className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold text-lg w-8">
                  {wellnessData.weather_mood_impact}
                </span>
              </div>
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Negative Impact</span>
                <span>Positive Impact</span>
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Work Location
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "office", label: "Office", icon: Building },
                  { id: "outdoor", label: "Outdoor", icon: Trees },
                ].map((location) => {
                  const Icon = location.icon;
                  return (
                    <button
                      key={location.id}
                      onClick={() => updateData("work_location", location.id)}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        wellnessData.work_location === location.id
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-purple-300 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{location.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Symptoms & Emotions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("symptoms")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Symptoms & Emotions
          </h3>
          {expandedSections.symptoms ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.symptoms && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Physical Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleArrayItem("symptoms", symptom)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      wellnessData.symptoms.includes(symptom)
                        ? "bg-amber-600 text-white"
                        : "bg-white/10 text-purple-300 hover:bg-white/20"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Today's Emotions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {emotionOptions.map((emotion) => {
                  const Icon = emotion.icon;
                  const isSelected = wellnessData.emotions.includes(emotion.id);
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => toggleArrayItem("emotions", emotion.id)}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-purple-300 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{emotion.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Positive Activities */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection("activities")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Positive Activities & Notes
          </h3>
          {expandedSections.activities ? (
            <ChevronUp className="w-5 h-5 text-purple-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-300" />
          )}
        </button>

        {expandedSections.activities && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Activities That Brought Joy
              </label>
              <div className="grid grid-cols-4 gap-2">
                {positiveActivities.map((activity) => {
                  const Icon = activity.icon;
                  const isSelected = wellnessData.positive_activities.includes(
                    activity.id
                  );
                  return (
                    <button
                      key={activity.id}
                      onClick={() =>
                        toggleArrayItem("positive_activities", activity.id)
                      }
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-white/10 text-purple-300 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{activity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Daily Reflection Notes
              </label>
              <textarea
                value={wellnessData.notes}
                onChange={(e) => updateData("notes", e.target.value)}
                placeholder="How was your day? Any thoughts or observations about your wellness..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Today's Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {calculateDailyScore()}
            </div>
            <div className="text-purple-200 text-sm">Wellness Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {wellnessData.water_glasses}
            </div>
            <div className="text-purple-200 text-sm">Water Glasses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {wellnessData.exercise_minutes}
            </div>
            <div className="text-purple-200 text-sm">Active Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {wellnessData.positive_activities.length}
            </div>
            <div className="text-purple-200 text-sm">Positive Activities</div>
          </div>
        </div>
      </div>
    </div>
  );

  function calculateDailyScore() {
    let score = 50;

    // Core metrics (40% weight)
    score += (wellnessData.mood - 5) * 2;
    score += (wellnessData.energy - 5) * 2;
    score += (5 - wellnessData.stress) * 2;

    // Sleep (20% weight)
    if (wellnessData.sleep_hours >= 7 && wellnessData.sleep_hours <= 9) {
      score += 10;
    }
    score += wellnessData.sleep_quality - 5;

    // Physical (20% weight)
    score += Math.min(wellnessData.exercise_minutes / 3, 10);

    // Hydration (10% weight)
    score += Math.min(wellnessData.water_glasses, 8) * 1.25;

    // Mental/Social (10% weight)
    if (wellnessData.meditation_minutes > 0) score += 5;
    if (wellnessData.positive_activities.length > 0) score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }
};

export default WellnessTrackingTab;
