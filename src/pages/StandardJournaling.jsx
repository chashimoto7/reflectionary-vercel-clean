// frontend/ src/pages/StandardJournaling.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import UpgradePrompt from "../components/UpgradePrompt";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import {
  Activity,
  Moon,
  Droplets,
  Heart,
  Brain,
  Coffee,
  Apple,
  Dumbbell,
  Wind,
  Info,
  Save,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

export default function StandardJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, tier, loading } = useMembership();

  // Feature access management
  const {
    checkFeatureAccess,
    showUpgradePrompt,
    requestedFeature,
    handleUpgrade,
    closeUpgradePrompt,
    getUpgradeMessage,
  } = useFeatureAccess(tier);

  // Crisis integration
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Journal entry state
  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [showPromptButton, setShowPromptButton] = useState(true);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Entry");
  const [showFollowUpButtons, setShowFollowUpButtons] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [entryChain, setEntryChain] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Wellness tracking state
  const [showWellnessTracking, setShowWellnessTracking] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [hydration, setHydration] = useState("");
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Redirect if locked
  useEffect(() => {
    if (isLocked) {
      navigate("/dashboard");
    }
  }, [isLocked, navigate]);

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: prompt || "What's on your mind today?",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
          ],
        },
      });

      // Update placeholder when prompt changes
      if (prompt) {
        quillRef.current.root.setAttribute("data-placeholder", prompt);
      }
    }
  }, [prompt]);

  const generatePrompt = async () => {
    if (!checkFeatureAccess("ai_prompts")) return;

    setLoadingPrompt(true);
    try {
      const response = await fetch("/api/generatePrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) throw new Error("Failed to generate prompt");

      const data = await response.json();
      setPrompt(data.prompt);
      setShowPromptButton(false);

      if (quillRef.current) {
        quillRef.current.root.setAttribute("data-placeholder", data.prompt);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      alert("Failed to generate prompt. Please try again.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  const saveJournalEntry = async () => {
    if (!quillRef.current || !user) {
      alert("Unable to save. Please try again.");
      return;
    }

    const htmlContent = quillRef.current.root.innerHTML;
    const plainText = quillRef.current.getText().trim();

    if (!plainText) {
      alert("Please write something before saving.");
      return;
    }

    setSaveLabel("Saving...");

    try {
      // Prepare wellness data if tracking is enabled
      const wellnessData = showWellnessTracking
        ? {
            exercise_type: exerciseType || null,
            exercise_duration: exerciseDuration
              ? parseInt(exerciseDuration)
              : null,
            sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
            sleep_quality: sleepQuality || null,
            hydration_glasses: hydration ? parseInt(hydration) : null,
            mood: mood || null,
            stress_level: stressLevel || null,
            nutrition_notes: nutrition || null,
            additional_notes: additionalNotes || null,
          }
        : null;

      // Send to backend for encryption and saving
      const response = await fetch("/api/save-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: htmlContent,
          title: `Entry from ${new Date().toLocaleDateString()}`,
          prompt: prompt || null,
          is_follow_up: false,
          parent_entry_id: null,
          thread_id: currentThreadId,
          prompt_used: prompt ? "AI-generated" : "user-initiated",
          // Include wellness data if available
          ...wellnessData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save entry");
      }

      const result = await response.json();

      // Handle crisis detection result
      if (result.crisis_analysis) {
        await triggerCrisisModal(plainText, result.crisis_analysis);
      }

      // Reset form after successful save
      quillRef.current.setText("");
      setPrompt("");
      setShowPromptButton(true);
      setSaveLabel("Save Entry");
      setLastSavedEntry(result.entry);
      setShowFollowUpButtons(true);

      // Reset wellness tracking
      if (showWellnessTracking) {
        setExerciseType("");
        setExerciseDuration("");
        setSleepHours("");
        setSleepQuality("");
        setHydration("");
        setMood("");
        setStressLevel("");
        setNutrition("");
        setAdditionalNotes("");
        setShowWellnessTracking(false);
      }

      // Show confirmation
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      alert(error.message || "Failed to save entry. Please try again.");
      setSaveLabel("Save Entry");
    }
  };

  const generateFollowUp = async () => {
    if (!lastSavedEntry || !checkFeatureAccess("ai_followups")) return;

    setLoadingPrompt(true);
    try {
      const response = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: lastSavedEntry.id,
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate follow-up");

      const data = await response.json();
      setPrompt(data.followUpQuestion);
      setShowFollowUpButtons(false);
      setShowPromptButton(false);

      if (quillRef.current) {
        quillRef.current.root.setAttribute(
          "data-placeholder",
          data.followUpQuestion
        );
        quillRef.current.focus();
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      alert("Failed to generate follow-up. Please try again.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Standard Journaling
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Journal Area */}
          <div className="lg:col-span-2">
            {/* Prompt Generation */}
            {showPromptButton && checkFeatureAccess("ai_prompts", true) && (
              <div className="mb-6">
                <button
                  onClick={generatePrompt}
                  disabled={loadingPrompt}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingPrompt ? "animate-spin" : ""}`}
                  />
                  {loadingPrompt ? "Generating..." : "Generate AI Prompt"}
                </button>
              </div>
            )}

            {/* Current Prompt Display */}
            {prompt && (
              <div className="mb-6 p-4 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20">
                <p className="text-purple-200 font-medium">Today's Prompt:</p>
                <p className="text-gray-100 mt-1">{prompt}</p>
              </div>
            )}

            {/* Editor */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden mb-6">
              <div ref={editorRef} className="min-h-[400px]" />
            </div>

            {/* Save Button */}
            <button
              onClick={saveJournalEntry}
              disabled={saveLabel === "Saving..."}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saveLabel}
            </button>

            {/* Save Confirmation */}
            {saveConfirmation && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200">
                Entry saved successfully!
              </div>
            )}

            {/* Follow-up Buttons */}
            {showFollowUpButtons &&
              checkFeatureAccess("ai_followups", true) && (
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={generateFollowUp}
                    disabled={loadingPrompt}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Generate Follow-up Question
                  </button>
                  <button
                    onClick={() => setShowFollowUpButtons(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                  >
                    Continue New Entry
                  </button>
                </div>
              )}
          </div>

          {/* Wellness Tracking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Wellness Tracking
              </h2>

              {!showWellnessTracking ? (
                <button
                  onClick={() => setShowWellnessTracking(true)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  Add Wellness Data
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Exercise */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Dumbbell className="h-4 w-4" />
                      Exercise
                    </label>
                    <input
                      type="text"
                      placeholder="Type (e.g., Running, Yoga)"
                      value={exerciseType}
                      onChange={(e) => setExerciseType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm mt-2"
                    />
                  </div>

                  {/* Sleep */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Moon className="h-4 w-4" />
                      Sleep
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Hours slept"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                    />
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm mt-2"
                    >
                      <option value="">Sleep quality</option>
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>

                  {/* Mood & Stress */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Brain className="h-4 w-4" />
                      Mental Health
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                    >
                      <option value="">Mood</option>
                      <option value="very-low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="neutral">Neutral</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                    <select
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm mt-2"
                    >
                      <option value="">Stress level</option>
                      <option value="very-low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="text-sm font-medium mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Any other wellness observations..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm h-20"
                    />
                  </div>

                  <button
                    onClick={() => setShowWellnessTracking(false)}
                    className="w-full py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition text-sm"
                  >
                    Close Wellness Tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature={requestedFeature}
          currentTier={tier}
          onUpgrade={handleUpgrade}
          onClose={closeUpgradePrompt}
          message={getUpgradeMessage()}
        />
      )}

      {/* Crisis Resource Modal */}
      {showCrisisModal && (
        <CrisisResourceModal
          isOpen={showCrisisModal}
          onClose={closeCrisisModal}
          analysisResult={crisisAnalysisResult}
          showResources={showCrisisResources}
        />
      )}
    </div>
  );
}
