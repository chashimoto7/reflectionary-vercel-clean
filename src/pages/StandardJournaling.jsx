// src/pages/StandardJournaling.jsx - Updated to remove subject prompts
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
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
} from "lucide-react";

export default function StandardJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, tier, loading } = useMembership();

  console.log("🎯 Current membership tier:", tier, "Loading:", loading);
  console.log("🔍 Has access to journaling:", hasAccess("journaling"));

  // Add feature access management
  const {
    checkFeatureAccess,
    showUpgradePrompt,
    requestedFeature,
    handleUpgrade,
    closeUpgradePrompt,
    getUpgradeMessage,
  } = useFeatureAccess(tier);

  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // EXISTING State declarations
  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("initial");
  const [showPromptButton, setShowPromptButton] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Entry");
  const [editorContent, setEditorContent] = useState("");
  const [entryChain, setEntryChain] = useState([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [showFollowUpButtons, setShowFollowUpButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // ENHANCED: Wellness tracking state with exercise and nutrition
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

  // New state for wellness modal
  const [wellnessData, setWellnessData] = useState({
    exerciseType: "",
    exerciseDuration: "",
    sleepHours: "",
    sleepQuality: "",
    hydration: "",
    mood: "",
    stressLevel: "",
    nutrition: "",
    additionalNotes: "",
  });

  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const { encryptJournalEntry } = encryptionService;

  // Utility function to format date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote"],
            ["clean"],
          ],
        },
        formats: [
          "header",
          "bold",
          "italic",
          "underline",
          "list",
          "bullet",
          "blockquote",
        ],
      });

      quillRef.current.on("text-change", () => {
        const content = quillRef.current.getText();
        setEditorContent(content);
      });

      setIsEditorReady(true);
    }
  }, []);

  // UPDATED: Only random prompts for Standard tier
  const generateRandomPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get random prompt");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-random-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            pastEntries: [],
          }),
        }
      );

      const data = await response.json();
      const generatedPrompt =
        data.prompt || "Write about your current thoughts and feelings.";

      setPrompt(generatedPrompt);
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } catch (err) {
      console.error("Prompt fetch failed:", err);
      setPrompt("Write about a recent moment that impacted you.");
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ENHANCED saveEntry function with wellness data
  const saveEntry = async () => {
    console.log("🔄 Save entry function called");

    try {
      const journalContent = quillRef.current?.getText().trim();

      if (!journalContent) {
        alert("Please write something before saving.");
        return;
      }

      const htmlContent = quillRef.current?.root.innerHTML;
      const userId = user?.id;

      if (!userId) {
        alert("Something went wrong. Please log in again.");
        return;
      }

      setSaveLabel("Saving...");

      console.log("🔐 Encrypting entry data on frontend...");
      const encryptedData = await encryptJournalEntry({
        content: htmlContent,
        prompt: prompt || null,
      });

      console.log("✅ Entry encrypted successfully");

      // Prepare wellness tracking data (user-entered)
      const wellnessTrackingData = {
        // Exercise data
        exercise_type: exerciseType || null,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,

        // Sleep data
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality,

        // Hydration
        hydration_glasses: hydration ? parseInt(hydration) : null,

        // Mental health
        mood: mood,
        stress_level: stressLevel,

        // Nutrition
        nutrition_notes: nutrition || null,
        additional_notes: additionalNotes || null,
      };

      // Save to database
      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: userId,
        content: encryptedData.encryptedContent,
        encryption_key: encryptedData.encryptedKey,
        prompt: prompt || null,
        created_at: new Date().toISOString(),
        word_count: journalContent.split(/\s+/).filter(Boolean).length,
        wellness_data: wellnessTrackingData,
        thread_id: currentThreadId,
      });

      if (error) {
        console.error("❌ Database save error:", error);
        alert("Failed to save entry. Please try again.");
        setSaveLabel("Save Entry");
        return;
      }

      console.log("✅ Entry saved successfully");

      // Reset everything after successful save
      quillRef.current.setText("");
      setPrompt("");
      setShowPromptButton(true);
      setSaveLabel("Save Entry");
      setLastSavedEntry(data);
      setShowFollowUpButtons(true);
      setEntryChain([]);
      setCurrentThreadId(null);

      // Reset wellness data
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

      // Run crisis detection
      await triggerCrisisModal(journalContent);

      // Show save confirmation
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
    } catch (error) {
      console.error("💥 Unexpected save error:", error);
      alert("Something went wrong while saving. Please try again.");
      setSaveLabel("Save Entry");
    }
  };

  // EXISTING follow-up functions (unchanged)
  const generateFollowUpPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get follow-up prompt");
      return;
    }

    try {
      const lastEntry = quillRef.current?.getText();
      if (!lastEntry?.trim()) {
        alert("Please write an entry first before getting a follow-up prompt.");
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-followup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            lastEntry,
            entryChain,
          }),
        }
      );

      const data = await response.json();
      const followUpPrompt =
        data.prompt || "What else would you like to explore about this topic?";

      setPrompt(followUpPrompt);
      setPromptType("followUp");
      setSaveLabel("Save Follow-up");
      setShowPromptButton(false);
      setShowFollowUpButtons(false);
    } catch (err) {
      console.error("Follow-up generation failed:", err);
      setPrompt("What else would you like to explore about this topic?");
      setPromptType("followUp");
      setSaveLabel("Save Follow-up");
      setShowPromptButton(false);
      setShowFollowUpButtons(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutFollowUp = () => {
    setShowFollowUpButtons(false);
    navigate("/history");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journaling experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Standard Journaling
        </h1>
        <p className="text-gray-600">
          {formatDate(new Date())} • Write freely with AI prompts and follow-up
          questions
        </p>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature={requestedFeature}
          message={getUpgradeMessage()}
          onUpgrade={handleUpgrade}
          onClose={closeUpgradePrompt}
        />
      )}

      {/* Crisis Resource Modal */}
      {showCrisisModal && (
        <CrisisResourceModal
          isOpen={showCrisisModal}
          onClose={closeCrisisModal}
          analysisResult={crisisAnalysisResult}
        />
      )}

      {/* Save Confirmation */}
      {saveConfirmation && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Entry saved successfully!
        </div>
      )}

      {/* Prompt Section */}
      <div className="mb-6">
        {showPromptButton ? (
          <div className="text-center">
            <button
              onClick={generateRandomPrompt}
              disabled={isLoading}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                "✨"
              )}
              {isLoading ? "Generating..." : "Get Random Prompt"}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Or start writing without a prompt
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 rounded-lg border border-purple-200">
            <p className="text-lg font-medium text-purple-800 mb-2">
              {promptType === "followUp"
                ? "Follow-up prompt:"
                : "Writing prompt:"}
            </p>
            <p className="text-purple-700">{prompt}</p>
            <button
              onClick={() => {
                setPrompt("");
                setShowPromptButton(true);
                setPromptType("initial");
              }}
              className="text-sm text-purple-600 hover:text-purple-800 mt-2 underline"
            >
              Clear prompt and start fresh
            </button>
          </div>
        )}
      </div>

      {/* Wellness Tracking Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowWellnessTracking(!showWellnessTracking)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Activity size={20} />
          {showWellnessTracking ? "Hide" : "Add"} Wellness Tracking
        </button>

        {/* Wellness Tracking Form */}
        {showWellnessTracking && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Exercise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  placeholder="Type of exercise"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  placeholder="Minutes"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Sleep */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="Hours"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Quality</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Hydration & Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hydration (glasses)
              </label>
              <input
                type="number"
                value={hydration}
                onChange={(e) => setHydration(e.target.value)}
                placeholder="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select mood</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="neutral">Neutral</option>
                <option value="low">Low</option>
                <option value="stressed">Stressed</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Wellness Notes
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any other wellness observations..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="md:col-span-2 text-xs text-gray-500">
              <Info size={16} className="inline mr-1" />
              All data is encrypted and private to you.
            </div>
          </div>
        )}
      </div>

      {/* Quill Editor */}
      <div className="mb-6">
        <div
          ref={editorRef}
          className="border border-gray-300 rounded-lg"
          style={{ height: "350px" }}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {isEditorReady ? (
            <span>✓ Editor ready</span>
          ) : (
            <span>Setting up editor...</span>
          )}
        </div>

        <button
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          onClick={saveEntry}
          disabled={
            !isEditorReady || !editorContent.trim() || saveLabel === "Saving..."
          }
        >
          {saveLabel === "Saving..." && (
            <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          )}
          {saveLabel}
        </button>
      </div>

      {/* Follow-up Buttons */}
      {showFollowUpButtons && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium mb-3">
            Your entry has been saved! Would you like to continue reflecting?
          </p>
          <div className="flex gap-3">
            <button
              onClick={generateFollowUpPrompt}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              Get Follow-up Question
            </button>
            <button
              onClick={handleContinueWithoutFollowUp}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              View Entry History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
