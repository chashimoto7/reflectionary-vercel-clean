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
import { Lock, Info, AlertTriangle } from "lucide-react";

export default function StandardJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, hasUsageRemaining, tier, loading, getTierDisplayName } =
    useMembership();

  console.log("🎯 Current membership tier:", tier, "Loading:", loading);
  console.log("🔍 Has access to journaling:", hasAccess("journaling"));

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

  // Core journaling state
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

  // Usage limiting state
  const [usageBlocked, setUsageBlocked] = useState(false);
  const [usageMessage, setUsageMessage] = useState("");

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Start writing your thoughts...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      quillRef.current.on("text-change", () => {
        setEditorContent(quillRef.current.root.innerHTML);
      });

      setIsEditorReady(true);
    }
  }, []);

  // Check usage limits and display appropriate messaging
  const checkUsageLimits = async (actionType) => {
    const usageCheck = hasUsageRemaining(actionType);

    if (!usageCheck.hasRemaining && !usageCheck.unlimited) {
      let message = "";

      switch (actionType) {
        case "journal_entries":
          message = `You've reached your limit of ${usageCheck.limit} journal entries this month. Upgrade to Basic for unlimited entries!`;
          break;
        case "prompts":
          message = `You've used all ${usageCheck.limit} prompts this month. ${
            tier === "free"
              ? "Upgrade to Basic for 6 prompts/month!"
              : "Wait until next month or upgrade for unlimited prompts!"
          }`;
          break;
        case "follow_ups":
          message = `You've used all ${
            usageCheck.limit
          } follow-ups this month. ${
            tier === "free"
              ? "Upgrade to Basic for 6 follow-ups/month!"
              : "Wait until next month or upgrade for unlimited!"
          }`;
          break;
        default:
          message = "Usage limit reached. Please upgrade your membership.";
      }

      setUsageMessage(message);
      setUsageBlocked(true);
      return false;
    }

    return true;
  };

  // Save journal entry with usage checking
  const saveEntry = async () => {
    console.log("🔄 Save entry function called");

    // Check journal entry usage limits for Free/Basic tiers
    const canSaveEntry = await checkUsageLimits("journal_entries");
    if (!canSaveEntry) {
      return; // Stop execution if usage limit reached
    }

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

      // Save to database
      const response = await fetch("/api/journal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          encrypted_content: encryptedData.content,
          encrypted_prompt: encryptedData.prompt,
          data_key_iv: encryptedData.dataKeyIv,
          prompt_data_key_iv: encryptedData.promptDataKeyIv,
          thread_id: currentThreadId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save entry");
      }

      console.log("✅ Entry saved with ID:", result.entry_id);

      // Check for crisis analysis
      if (result.crisis_analysis?.should_alert) {
        console.log("🚨 Crisis analysis triggered:", result.crisis_analysis);
        triggerCrisisModal(result.crisis_analysis);
      }

      // Create the new entry object for follow-ups
      const newEntry = {
        id: result.entry_id,
        prompt: prompt || null,
        content: htmlContent,
      };

      setLastSavedEntry(newEntry);

      // Set thread ID if this is a new conversation
      if (!currentThreadId && result.entry_id) {
        setCurrentThreadId(result.entry_id);
      }

      // Update entry chain for follow-ups
      const updatedChain = [...entryChain, newEntry];
      setEntryChain(updatedChain);

      // Set global variables for follow-up workflow
      window.currentConversationChain = updatedChain;
      window.currentThreadId = currentThreadId || result.entry_id;

      setSaveLabel("Saved!");
      setSaveConfirmation(true);

      // Update usage tracking
      try {
        const { error: usageError } = await supabase.rpc(
          "increment_usage_count",
          {
            user_uuid: user.id,
            usage_type: "journal_entries",
          }
        );

        if (usageError) {
          console.warn("Failed to update usage tracking:", usageError);
        }
      } catch (usageUpdateError) {
        console.warn("Error updating usage:", usageUpdateError);
      }

      setTimeout(() => {
        setSaveLabel("Save Entry");
        setSaveConfirmation(false);
        setShowModal(true); // Show follow-up modal
      }, 1500);
    } catch (error) {
      console.error("❌ Error saving entry:", error);
      setSaveLabel("Error Saving");
      setTimeout(() => setSaveLabel("Save Entry"), 3000);
    }
  };

  // Generate random prompt with usage checking
  const handleRandomPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get random prompt");
      return;
    }

    // Check prompt usage limits for Free/Basic tiers
    const canUsePrompt = await checkUsageLimits("prompts");
    if (!canUsePrompt) {
      return; // Stop execution if usage limit reached
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            pastEntries: entryChain,
          }),
        }
      );

      const data = await response.json();
      const generatedPrompt =
        data.prompt || "Write about something meaningful from today.";

      setPrompt(generatedPrompt);
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);

      // Update prompt usage tracking
      try {
        const { error: usageError } = await supabase.rpc(
          "increment_usage_count",
          {
            user_uuid: user.id,
            usage_type: "prompts",
          }
        );

        if (usageError) {
          console.warn("Failed to update prompt usage tracking:", usageError);
        }
      } catch (usageUpdateError) {
        console.warn("Error updating prompt usage:", usageUpdateError);
      }
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

  // Generate subject-specific prompt with usage checking
  const handleSubjectPrompt = async () => {
    if (isLocked) {
      console.log("App is locked, cannot get custom prompt");
      return;
    }

    if (!subject.trim()) return;

    // Check prompt usage limits for Free/Basic tiers
    const canUsePrompt = await checkUsageLimits("prompts");
    if (!canUsePrompt) {
      return; // Stop execution if usage limit reached
    }

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

        // Update prompt usage tracking
        try {
          const { error: usageError } = await supabase.rpc(
            "increment_usage_count",
            {
              user_uuid: user.id,
              usage_type: "prompts",
            }
          );

          if (usageError) {
            console.warn("Failed to update prompt usage tracking:", usageError);
          }
        } catch (usageUpdateError) {
          console.warn("Error updating prompt usage:", usageUpdateError);
        }
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

  // Generate follow-up prompt with usage checking
  const generateFollowUp = async () => {
    if (!lastSavedEntry) {
      alert("Please write a journal entry first.");
      return;
    }

    // Check follow-up usage limits for Free/Basic tiers
    const canUseFollowUp = await checkUsageLimits("follow_ups");
    if (!canUseFollowUp) {
      return; // Stop execution if usage limit reached
    }

    try {
      setIsLoading(true);
      setShowModal(false);

      const response = await fetch("/api/generate-follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastEntry: lastSavedEntry,
          conversationChain: entryChain,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("follow_up");
        setShowFollowUpButtons(true);

        // Update follow-up usage tracking
        try {
          const { error: usageError } = await supabase.rpc(
            "increment_usage_count",
            {
              user_uuid: user.id,
              usage_type: "follow_ups",
            }
          );

          if (usageError) {
            console.warn(
              "Failed to update follow-up usage tracking:",
              usageError
            );
          }
        } catch (usageUpdateError) {
          console.warn("Error updating follow-up usage:", usageUpdateError);
        }
      } else {
        alert("Unable to generate follow-up question. Please try again.");
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear editor and start fresh
  const clearEditor = () => {
    if (quillRef.current) {
      quillRef.current.setContents([]);
      setEditorContent("");
    }
    setPrompt("");
    setShowPromptButton(true);
    setPromptType("initial");
    setShowFollowUpButtons(false);
    setLastSavedEntry(null);
    setCurrentThreadId(null);
    setEntryChain([]);
    setSaveLabel("Save Entry");
  };

  // Encrypt journal entry
  const encryptJournalEntry = async (data) => {
    try {
      const contentKey = await encryptionService.generateDataKey();
      const encryptedContent = await encryptionService.encryptData(
        data.content,
        contentKey.plaintextKey
      );

      let encryptedPrompt = null;
      let promptDataKeyIv = null;

      if (data.prompt) {
        const promptKey = await encryptionService.generateDataKey();
        encryptedPrompt = await encryptionService.encryptData(
          data.prompt,
          promptKey.plaintextKey
        );
        promptDataKeyIv = promptKey.encryptedKey;
      }

      return {
        content: encryptedContent,
        prompt: encryptedPrompt,
        dataKeyIv: contentKey.encryptedKey,
        promptDataKeyIv,
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt journal entry");
    }
  };

  // Usage limit display component
  const UsageLimitDisplay = () => {
    if (
      tier === "standard" ||
      tier === "standard_plus" ||
      tier === "premium" ||
      tier === "pro"
    ) {
      return null; // Don't show for unlimited tiers
    }

    const entryUsage = hasUsageRemaining("journal_entries");
    const promptUsage = hasUsageRemaining("prompts");
    const followUpUsage = hasUsageRemaining("follow_ups");

    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">
            {tier === "free" ? "Free Plan Usage" : "Basic Plan Usage"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Journal Entries:</span>
            <span
              className={
                entryUsage.hasRemaining ? "text-green-600" : "text-red-600"
              }
            >
              {tier === "free"
                ? `${entryUsage.current || 0}/${entryUsage.limit}`
                : "Unlimited"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Prompts:</span>
            <span
              className={
                promptUsage.hasRemaining ? "text-green-600" : "text-red-600"
              }
            >
              {promptUsage.current || 0}/{promptUsage.limit}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Follow-ups:</span>
            <span
              className={
                followUpUsage.hasRemaining ? "text-green-600" : "text-red-600"
              }
            >
              {followUpUsage.current || 0}/{followUpUsage.limit}
            </span>
          </div>
        </div>

        {(!entryUsage.hasRemaining ||
          !promptUsage.hasRemaining ||
          !followUpUsage.hasRemaining) && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-sm text-purple-700">
              Upgrade to get unlimited access to all features!
            </p>
            <button
              onClick={() => navigate("/membership")}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    );
  };

  // Usage limit modal component
  const UsageLimitModal = () => {
    if (!usageBlocked) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Usage Limit Reached
              </h3>
              <p className="text-sm text-gray-600">
                {getTierDisplayName(tier)} Plan
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{usageMessage}</p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setUsageBlocked(false);
                setUsageMessage("");
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Okay
            </button>
            <button
              onClick={() => {
                setUsageBlocked(false);
                setUsageMessage("");
                navigate("/membership");
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading or access denied states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess("journaling")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Journaling Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Basic or higher to access the full journaling experience.
          </p>
          <button
            onClick={() => navigate("/membership")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Usage Limit Display - shows current usage for Free/Basic users */}
      <UsageLimitDisplay />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal</h1>
        <p className="text-gray-600">
          Express your thoughts, reflect on your experiences, and track your
          personal growth.
        </p>
      </div>

      {/* Prompt Generation Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Need inspiration? Generate a prompt
        </h2>

        <div className="space-y-4">
          {showPromptButton && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRandomPrompt}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? "Generating..." : "Random Prompt"}
              </button>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter a topic..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleSubjectPrompt()}
                />
                <button
                  onClick={handleSubjectPrompt}
                  disabled={isLoading || !subject.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          {prompt && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Your Prompt:</h3>
              <p className="text-purple-800">{prompt}</p>
              <button
                onClick={() => setPrompt("")}
                className="mt-3 text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Clear prompt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div
          ref={editorRef}
          className="min-h-[300px] prose max-w-none"
          style={{ fontSize: "16px", lineHeight: "1.6" }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={saveEntry}
          disabled={!isEditorReady}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
            saveConfirmation
              ? "bg-green-600 text-white"
              : "bg-purple-600 text-white hover:bg-purple-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saveLabel}
        </button>

        <button
          onClick={clearEditor}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Clear & Start Fresh
        </button>
      </div>

      {/* Follow-up Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Great job journaling!
            </h3>
            <p className="text-gray-600 mb-6">
              Would you like to explore your thoughts deeper with a follow-up
              question?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Not now
              </button>
              <button
                onClick={generateFollowUp}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {isLoading ? "Generating..." : "Yes, let's go deeper"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Limit Modal */}
      <UsageLimitModal />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={closeUpgradePrompt}
        feature={requestedFeature}
        message={getUpgradeMessage()}
        onUpgrade={handleUpgrade}
      />

      {/* Crisis Resources Modal */}
      <CrisisResourceModal
        isOpen={showCrisisModal}
        onClose={closeCrisisModal}
        analysisResult={crisisAnalysisResult}
      />
    </div>
  );
}
