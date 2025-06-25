//scr/pages/StandardJournaling.jsx
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
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // ENHANCED: Wellness tracking state with exercise and sleep
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [cycleDay, setCycleDay] = useState("");
  const [cyclePhase, setCyclePhase] = useState("");
  const [showWellnessSection, setShowWellnessSection] = useState(false);

  // NEW: Exercise and wellness tracking
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(5);
  const [hydration, setHydration] = useState("");
  const [wellnessActivities, setWellnessActivities] = useState({
    meditation: false,
    yoga: false,
    natureTime: false,
    socialConnection: false,
    creativeActivity: false,
    selfCare: false,
  });

  // Check if user has advanced analytics add-on
  const hasAdvancedAnalytics = hasAccess("advanced_analytics");

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // EXISTING getStaticMasterKey function (unchanged)
  const getStaticMasterKey = async () => {
    const STATIC_MASTER_KEY_HEX = import.meta.env.VITE_MASTER_DECRYPTION_KEY;

    console.log("🧪 Checking master key:", STATIC_MASTER_KEY_HEX);

    if (!STATIC_MASTER_KEY_HEX) {
      throw new Error("Master key is undefined. Check your .env or build.");
    }

    if (STATIC_MASTER_KEY_HEX.length !== 64) {
      throw new Error(
        `Master key is the wrong length: ${STATIC_MASTER_KEY_HEX.length}. It must be exactly 64 characters.`
      );
    }

    const keyBuffer = new Uint8Array(
      STATIC_MASTER_KEY_HEX.match(/.{1,2}/g).map((b) => parseInt(b, 16))
    );

    return await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );
  };

  // EXISTING useEffect hooks (unchanged)
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const initEditor = () => {
      if (editorRef.current && !quillRef.current && !isLocked) {
        try {
          console.log("Initializing Quill editor...");

          const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: "Start writing your journal entry here...",
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                ["link"],
                ["clean"],
              ],
            },
          });

          quillRef.current = quill;

          // Listen for content changes
          quill.on("text-change", () => {
            const content = quill.getText().trim();
            setEditorContent(content);
            console.log("Editor content changed, length:", content.length);
          });

          // Set editor height with scroll
          const qlEditor = editorRef.current.querySelector(".ql-editor");
          if (qlEditor) {
            qlEditor.style.height = "300px";
            qlEditor.style.maxHeight = "300px";
            qlEditor.style.overflowY = "auto";
            qlEditor.style.fontSize = "16px";
            qlEditor.style.lineHeight = "1.6";
          }

          setIsEditorReady(true);
          console.log("Quill editor initialized successfully");
        } catch (error) {
          console.error("Error initializing Quill:", error);
        }
      }
    };

    const timer = setTimeout(initEditor, 100);

    return () => {
      clearTimeout(timer);
      if (quillRef.current) {
        console.log("Cleaning up Quill editor");
        quillRef.current = null;
      }
    };
  }, [isLocked]);

  // EXISTING functions (unchanged)
  const encryptJournalEntry = async (entryData) => {
    const masterKey = await getStaticMasterKey();
    const dataKey = await encryptionService.generateDataKey();
    const encryptedContent = await encryptionService.encryptText(
      entryData.content,
      dataKey
    );

    let encryptedPrompt = { encryptedData: "", iv: "" };
    if (entryData.prompt) {
      encryptedPrompt = await encryptionService.encryptText(
        entryData.prompt,
        dataKey
      );
    }

    const encryptedDataKey = await encryptionService.encryptKey(
      dataKey,
      masterKey
    );

    return {
      encrypted_content: encryptedContent.encryptedData,
      content_iv: encryptedContent.iv,
      encrypted_prompt: encryptedPrompt.encryptedData,
      prompt_iv: encryptedPrompt.iv,
      encrypted_data_key: encryptedDataKey.encryptedData,
      data_key_iv: encryptedDataKey.iv,
    };
  };

  const clearEditor = () => {
    if (quillRef.current && isEditorReady) {
      try {
        quillRef.current.setText("");
        setEditorContent("");
        console.log("Editor cleared");
      } catch (error) {
        console.error("Error clearing editor:", error);
      }
    }
  };

  const getPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get prompt");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        "https://reflectionary-api.vercel.app/api/generatePrompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await res.json();
      const generatedPrompt =
        data?.prompt || "Write about a recent moment that impacted you.";

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

  const handleSubjectPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get custom prompt");
      return;
    }

    if (!subject.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-subject-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            user_id: user.id,
            pastEntries: [],
          }),
        }
      );

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setShowPromptButton(false);
        setSubject("");
      } else {
        alert("No prompt returned. Try again.");
      }
    } catch (err) {
      console.error("Failed to fetch subject prompt:", err);
      alert("Something went wrong while generating the prompt.");
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

        // Wellness activities
        wellness_activities: Object.entries(wellnessActivities)
          .filter(([_, value]) => value)
          .map(([key, _]) => key),
      };

      // ENHANCED: Add wellness data to existing payload
      const entryData = {
        ...encryptedData,
        user_id: userId,
        is_follow_up: promptType === "followUp",
        parent_entry_id: currentThreadId,
        thread_id: currentThreadId,
        // Existing wellness data
        mood: mood,
        energy: energy,
        cycle_day: cycleDay ? parseInt(cycleDay) : null,
        cycle_phase: cyclePhase || null,
        // NEW: Store user-entered wellness tracking separately
        wellness_tracking: wellnessTrackingData,
      };

      console.log(
        "📦 Sending encrypted entry data to backend (with enhanced wellness data)"
      );

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/save-entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setSaveLabel("Save Entry");
        throw new Error(result.error || "Failed to save entry");
      }

      console.log("✅ Entry saved with ID:", result.entry_id);

      // Check for crisis analysis
      if (result.crisis_analysis?.should_alert) {
        console.log("🚨 Crisis analysis triggered:", result.crisis_analysis);
        triggerCrisisModal(result.crisis_analysis);
      }

      // EXISTING logic continues unchanged
      const newEntry = {
        id: result.entry_id,
        prompt: prompt || null,
        response: journalContent,
        htmlContent: htmlContent,
        created_at: new Date().toISOString(),
        is_follow_up: promptType === "followUp",
        parent_id: currentThreadId,
      };

      let updatedChain;
      if (promptType === "initial") {
        console.log("📝 Starting new conversation thread");
        updatedChain = [newEntry];
        setCurrentThreadId(result.entry_id);
      } else {
        console.log("➕ Adding followUp to thread:", currentThreadId);
        updatedChain = [...entryChain, newEntry];
      }

      setEntryChain(updatedChain);
      setLastSavedEntry(newEntry);
      window.currentConversationChain = updatedChain;
      window.currentThreadId = currentThreadId || result.entry_id;

      // Clear form including wellness fields
      clearEditor();
      setPrompt("");
      setShowPromptButton(true);
      resetWellnessFields();

      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
      setSaveLabel("Save Entry");

      // Only show follow-up modal if no crisis detected
      if (!result.crisis_analysis?.should_alert) {
        setShowFollowUpModal(true);
      }
    } catch (err) {
      console.error("❌ Error saving entry:", err);
      alert(`Failed to save entry: ${err.message}`);
      setSaveLabel("Save Entry");
    }
  };

  // NEW: Reset wellness fields after save
  const resetWellnessFields = () => {
    setMood(5);
    setEnergy(5);
    setCycleDay("");
    setCyclePhase("");
    setExerciseType("");
    setExerciseDuration("");
    setSleepHours("");
    setSleepQuality(5);
    setHydration("");
    setWellnessActivities({
      meditation: false,
      yoga: false,
      natureTime: false,
      socialConnection: false,
      creativeActivity: false,
      selfCare: false,
    });
  };

  // EXISTING functions (unchanged)
  const handleFollowUpFromChain = async () => {
    console.log("🤔 Generating followUp for entry ID:", lastSavedEntry?.id);

    const hasFollowUpAccess = checkFeatureAccess("follow_up_prompts", () => {
      proceedWithFollowUp();
    });
  };

  const proceedWithFollowUp = async () => {
    if (!lastSavedEntry?.id) {
      console.error("❌ No saved entry ID available for followUp");
      alert("No previous entries found. Please write a journal entry first.");
      return;
    }

    try {
      setIsLoading(true);
      setShowFollowUpModal(false);
      setPrompt("Thinking...");

      console.log("Sending follow-up request for entry ID:", lastSavedEntry.id);
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/follow-up",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            entry_id: lastSavedEntry.id,
          }),
        }
      );

      const data = await response.json();
      console.log("🎯 FollowUp response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch follow-up");
      }

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("followUp");
        setSaveLabel("Save Follow-Up Answer");
        setShowPromptButton(false);
        setShowFollowUpButtons(true);
      } else {
        throw new Error("No follow-up prompt returned");
      }
    } catch (error) {
      console.error("❌ FollowUp error:", error);
      setPrompt("Sorry, I couldn't generate a follow-up question this time.");
      alert(`Failed to generate follow-up question: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndFollowUps = () => {
    console.log("✋ User ending follow-up session");

    setEntryChain([]);
    setLastSavedEntry(null);
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEditorContent("");
    setShowPromptButton(true);
    setShowFollowUpButtons(false);
    setShowFollowUpModal(false);
    setCurrentThreadId(null);

    window.currentConversationChain = [];
    window.currentThreadId = null;

    clearEditor();
    console.log("🎉 Ready for new conversation thread");
  };

  const handleNoThanks = () => {
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEntryChain([]);
    setLastSavedEntry(null);
    setShowModal(false);
    setShowFollowUpModal(false);
    setShowPromptButton(true);
    setCurrentThreadId(null);
    clearEditor();
  };

  // Show loading while encryption is being set up
  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Journal is locked. Please unlock to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            New Journal Entry
          </h2>
          <div className="flex items-center gap-4">
            {/* Support resources button */}
            <button
              onClick={showCrisisResources}
              className="flex items-center gap-2 px-3 py-1 text-purple-600 border border-purple-300 rounded-full hover:bg-purple-50 transition-colors text-sm"
              title="Access mental health resources"
            >
              <span>💜</span>
              Support
            </button>
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Encryption Active
            </div>
          </div>
        </div>

        {saveConfirmation && (
          <div className="bg-green-100 text-green-800 text-sm px-4 py-2 mb-4 rounded shadow">
            Entry saved successfully and encrypted!
          </div>
        )}

        {/* EXISTING Prompt Generation Section (unchanged) */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <input
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to write about?"
              disabled={isLoading}
            />
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              onClick={handleSubjectPrompt}
              disabled={isLoading || !subject.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Thinking...
                </div>
              ) : (
                "Get Custom Prompt"
              )}
            </button>
          </div>

          {showPromptButton && (
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              onClick={getPrompt}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Thinking...
                </div>
              ) : (
                "Generate Random Prompt"
              )}
            </button>
          )}
        </div>

        {/* EXISTING Prompt Display (unchanged) */}
        {prompt && (
          <div className={`bg-green-100 px-4 py-3 rounded mb-6 shadow`}>
            <p
              className={`text-lg font-bold ${
                promptType === "followUp" ? "text-purple-700" : "text-green-800"
              }`}
            >
              {promptType === "followUp"
                ? "Here's your follow-up prompt:"
                : "Here's your journaling prompt:"}
            </p>
            <p className="text-green-900 mt-1 font-normal">{prompt}</p>
          </div>
        )}

        {/* ENHANCED: Wellness Tracking Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowWellnessSection(!showWellnessSection)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
          >
            <span
              className={`transform transition-transform ${
                showWellnessSection ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
            Track wellness data (optional)
            {hasAdvancedAnalytics && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
                Enhanced for Advanced Analytics
              </span>
            )}
          </button>

          {showWellnessSection && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {/* Mood and Energy (existing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Mood: {mood}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Energy: {energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* NEW: Exercise and Sleep */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-green-500" />
                      Exercise
                    </label>
                    <select
                      value={exerciseType}
                      onChange={(e) => setExerciseType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mb-2"
                    >
                      <option value="">Select type...</option>
                      <option value="walking">Walking</option>
                      <option value="running">Running</option>
                      <option value="cycling">Cycling</option>
                      <option value="swimming">Swimming</option>
                      <option value="yoga">Yoga</option>
                      <option value="strength">Strength Training</option>
                      <option value="cardio">Cardio</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </select>
                    {exerciseType && (
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={exerciseDuration}
                        onChange={(e) => setExerciseDuration(e.target.value)}
                        placeholder="Duration (minutes)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-purple-500" />
                      Sleep
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="Hours slept"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mb-2"
                    />
                    {sleepHours && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Sleep Quality: {sleepQuality}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={sleepQuality}
                          onChange={(e) =>
                            setSleepQuality(parseInt(e.target.value))
                          }
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEW: Hydration and Wellness Activities */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    Hydration (glasses of water)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={hydration}
                    onChange={(e) => setHydration(e.target.value)}
                    placeholder="Glasses of water"
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    Wellness Activities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries({
                      meditation: "Meditation",
                      yoga: "Yoga/Stretching",
                      natureTime: "Nature Time",
                      socialConnection: "Social Connection",
                      creativeActivity: "Creative Activity",
                      selfCare: "Self-Care",
                    }).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={wellnessActivities[key]}
                          onChange={(e) =>
                            setWellnessActivities({
                              ...wellnessActivities,
                              [key]: e.target.checked,
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cycle tracking (existing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Day (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={cycleDay}
                    onChange={(e) => setCycleDay(e.target.value)}
                    placeholder="Day of cycle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Phase (optional)
                  </label>
                  <select
                    value={cyclePhase}
                    onChange={(e) => setCyclePhase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Select phase...</option>
                    <option value="Menstrual">Menstrual</option>
                    <option value="Follicular">Follicular</option>
                    <option value="Ovulatory">Ovulatory</option>
                    <option value="Luteal">Luteal</option>
                  </select>
                </div>
              </div>

              {/* Info message */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  This wellness data helps our AI provide personalized insights
                  about how your physical health impacts your emotional
                  well-being. All data is encrypted and private to you.
                  {hasAdvancedAnalytics && (
                    <span className="block mt-1 font-medium">
                      As an Advanced Analytics subscriber, you'll see detailed
                      correlations and predictive insights based on this data.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* EXISTING Quill Editor (unchanged) */}
        <div className="mb-6">
          <div
            ref={editorRef}
            className="border border-gray-300 rounded-lg"
            style={{ height: "350px" }}
          />
        </div>

        {/* EXISTING Save Button (unchanged) */}
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
              !isEditorReady ||
              !editorContent.trim() ||
              saveLabel === "Saving..."
            }
          >
            {saveLabel === "Saving..." && (
              <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            )}
            {saveLabel}
          </button>
        </div>

        {/* EXISTING Follow-up Modals (unchanged) */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-4 text-lg font-medium">
                Your journal entry has been saved securely.
              </p>
              <p className="mb-4">
                Would you like me to generate a follow-up question to help you
                reflect further?
              </p>
              <div className="space-x-2">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                  onClick={handleFollowUpFromChain}
                >
                  Yes, ask me
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleNoThanks}
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-2 text-lg font-semibold text-gray-800">
                Would you like to explore this a little deeper?
              </p>
              <p className="mb-4 text-sm text-gray-700">
                I can provide a follow-up question based on what you've shared
                so far.
              </p>
              <div className="space-x-2">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  onClick={handleFollowUpFromChain}
                  disabled={isLoading}
                >
                  {isLoading ? "Thinking..." : "Yes, please"}
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={handleEndFollowUps}
                  disabled={isLoading}
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXISTING Upgrade Prompt Modal (unchanged) */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature={requestedFeature}
          onClose={closeUpgradePrompt}
          onUpgrade={handleUpgrade}
          message={getUpgradeMessage()}
        />
      )}

      <CrisisResourceModal
        isOpen={showCrisisModal}
        onClose={() => {
          closeCrisisModal();
          // Show follow-up modal after crisis modal if we have a saved entry
          if (lastSavedEntry) {
            setShowFollowUpModal(true);
          }
        }}
        analysisResult={crisisAnalysisResult}
      />
    </>
  );
}
