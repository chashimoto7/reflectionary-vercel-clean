// src/components/wellness/tabs/WellnessTrackingTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  TrendingUp,
  Moon,
  Dumbbell,
  Droplets,
  Apple,
  Brain,
  Coffee,
  Smile,
  Frown,
  Meh,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const WellnessTrackingTab = () => {
  const [loading, setLoading] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Today's Entry");
  const [hasExistingEntry, setHasExistingEntry] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [anxiety, setAnxiety] = useState(5);

  // Sleep tracking
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(5);
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");

  // Exercise tracking
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [exerciseIntensity, setExerciseIntensity] = useState(5);

  // Physical wellness
  const [hydrationGlasses, setHydrationGlasses] = useState("");
  const [nutritionQuality, setNutritionQuality] = useState(5);
  const [caffeine, setCaffeine] = useState("");
  const [alcohol, setAlcohol] = useState("");

  // Symptoms/Notes
  const [physicalSymptoms, setPhysicalSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Check if there's already an entry for today
    checkExistingEntry();
  }, [date]);

  const checkExistingEntry = async () => {
    // Mock check - in production, this would query Supabase
    const random = Math.random();
    if (random > 0.7) {
      setHasExistingEntry(true);
      loadExistingEntry();
    } else {
      setHasExistingEntry(false);
      resetForm();
    }
  };

  const loadExistingEntry = () => {
    // Mock existing entry data
    setMood(7);
    setEnergy(6);
    setStress(4);
    setAnxiety(3);
    setSleepHours("7.5");
    setSleepQuality(8);
    setExerciseType("cardio");
    setExerciseDuration("30");
    setHydrationGlasses("6");
    setSaveLabel("Update Today's Entry");
  };

  const resetForm = () => {
    setMood(5);
    setEnergy(5);
    setStress(5);
    setAnxiety(5);
    setSleepHours("");
    setSleepQuality(5);
    setBedtime("");
    setWakeTime("");
    setExerciseType("");
    setExerciseDuration("");
    setExerciseIntensity(5);
    setHydrationGlasses("");
    setNutritionQuality(5);
    setCaffeine("");
    setAlcohol("");
    setPhysicalSymptoms([]);
    setNotes("");
    setSaveLabel("Save Today's Entry");
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveLabel("Saving...");

    // Mock save operation
    setTimeout(() => {
      setSaveLabel("Saved!");
      setHasExistingEntry(true);

      setTimeout(() => {
        setSaveLabel("Update Today's Entry");
        setLoading(false);
      }, 2000);
    }, 1000);
  };

  const symptomOptions = [
    "Headache",
    "Fatigue",
    "Muscle tension",
    "Digestive issues",
    "Joint pain",
    "Back pain",
    "Allergies",
    "Skin issues",
  ];

  const toggleSymptom = (symptom) => {
    setPhysicalSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getMoodIcon = (value) => {
    if (value >= 8) return <Smile className="w-5 h-5 text-green-500" />;
    if (value >= 6) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Frown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Daily Wellness Tracking
          </h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {hasExistingEntry && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            You already have wellness data for this date. You can update it
            below.
          </div>
        )}
      </div>

      {/* Mental/Emotional Wellness */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Mental & Emotional Wellness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {getMoodIcon(mood)}
              Mood: {mood}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Energy */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Energy: {energy}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Exhausted</span>
              <span>Moderate</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Stress */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Stress: {stress}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Moderate</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Anxiety */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              Anxiety: {anxiety}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={anxiety}
              onChange={(e) => setAnxiety(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Moderate</span>
              <span>Very High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Tracking */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-600" />
          Sleep Tracking
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Hours
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="7.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality: {sleepQuality}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              disabled={!sleepHours}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedtime
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wake Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Exercise & Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-600" />
          Exercise & Activity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Type
            </label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">None today</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength Training</option>
              <option value="yoga">Yoga</option>
              <option value="walking">Walking</option>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={exerciseDuration}
              onChange={(e) => setExerciseDuration(e.target.value)}
              placeholder="30"
              disabled={!exerciseType}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity: {exerciseIntensity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={exerciseIntensity}
              onChange={(e) => setExerciseIntensity(parseInt(e.target.value))}
              disabled={!exerciseType}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-green-500"
            />
          </div>
        </div>
      </div>

      {/* Physical Wellness */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Physical Wellness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Water Glasses
            </label>
            <input
              type="number"
              min="0"
              value={hydrationGlasses}
              onChange={(e) => setHydrationGlasses(e.target.value)}
              placeholder="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Apple className="w-4 h-4 text-green-500" />
              Nutrition Quality: {nutritionQuality}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={nutritionQuality}
              onChange={(e) => setNutritionQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Coffee className="w-4 h-4 text-amber-600" />
              Caffeine (cups)
            </label>
            <input
              type="number"
              min="0"
              value={caffeine}
              onChange={(e) => setCaffeine(e.target.value)}
              placeholder="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alcohol (drinks)
            </label>
            <input
              type="number"
              min="0"
              value={alcohol}
              onChange={(e) => setAlcohol(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Physical Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Physical Symptoms (if any)
          </label>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  physicalSymptoms.includes(symptom)
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional wellness notes, observations, or context for today..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saveLabel}
        </button>
      </div>
    </div>
  );
};

export default WellnessTrackingTab;
