// src/pages/PremiumJournaling.jsx - Fixed to use backend API
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
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
  Save,
  RefreshCw,
  ChevronRight,
  Sparkles,
  FileText,
  Mic,
  Camera,
  Paperclip,
  Tag,
  Folder,
  Star,
  Pin,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";

export default function PremiumJournaling() {
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
  const [subjectPrompt, setSubjectPrompt] = useState("");
  const [showPromptOptions, setShowPromptOptions] = useState(true);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Entry");
  const [showFollowUpButtons, setShowFollowUpButtons] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [entryChain, setEntryChain] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Premium features state
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [connectedGoals, setConnectedGoals] = useState([]);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [userGoals, setUserGoals] = useState([]);
  const [writingMode, setWritingMode] = useState("free"); // free, guided, structured
  const [guidedQuestions, setGuidedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Redirect if locked
  useEffect(() => {
    if (isLocked) {
      navigate("/dashboard");
    }
  }, [isLocked, navigate]);

  // Load premium data
  useEffect(() => {
    if (user) {
      loadFolders();
      loadGoals();
    }
  }, [user]);

  // Initialize Quill with premium features
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: prompt || "Begin your reflection...",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "video"],
          ],
        },
      });

      // Update placeholder when prompt changes
      if (prompt) {
        quillRef.current.root.setAttribute("data-placeholder", prompt);
      }
    }
  }, [prompt]);

  const loadFolders = async () => {
    try {
      const response = await fetch(
        `/api/folders?user_id=${user.id}&include_entry_count=true`
      );
      if (!response.ok) throw new Error("Failed to load folders");

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch(`/api/goals?user_id=${user.id}`);
      if (!response.ok) throw new Error("Failed to load goals");

      const data = await response.json();
      setUserGoals(data.goals?.filter((g) => g.status === "active") || []);
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const generatePrompt = async () => {
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
      setShowPromptOptions(false);

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

  const generateSubjectPrompt = async (subject) => {
    setLoadingPrompt(true);
    try {
      const response = await fetch("/api/generate-subject-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          subject: subject,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate subject prompt");

      const data = await response.json();
      setPrompt(data.prompt);
      setShowPromptOptions(false);

      if (quillRef.current) {
        quillRef.current.root.setAttribute("data-placeholder", data.prompt);
      }
    } catch (error) {
      console.error("Error generating subject prompt:", error);
      alert("Failed to generate prompt. Please try again.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  const generateGuidedQuestions = async (topic) => {
    setLoadingPrompt(true);
    try {
      // For premium, we could have a special endpoint for guided journaling
      const response = await fetch("/api/generate-guided-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          topic: topic,
          tier: "premium",
        }),
      });

      if (!response.ok) {
        // Fallback to local questions if API doesn't exist yet
        const fallbackQuestions = [
          "What brought this topic to mind today?",
          "How does this make you feel emotionally and physically?",
          "What patterns do you notice in your thoughts about this?",
          "What would you like to explore or understand better?",
          "What insights are emerging as you reflect on this?",
        ];
        setGuidedQuestions(fallbackQuestions);
        setCurrentQuestionIndex(0);
        setWritingMode("guided");
        setShowPromptOptions(false);
        return;
      }

      const data = await response.json();
      setGuidedQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setWritingMode("guided");
      setShowPromptOptions(false);
    } catch (error) {
      console.error("Error generating guided questions:", error);
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
      // Prepare metadata for premium features
      const metadata = {
        folder_id: selectedFolder,
        tags: tags.length > 0 ? tags : null,
        starred: isStarred,
        pinned: isPinned,
        connected_goals: connectedGoals.length > 0 ? connectedGoals : null,
        writing_mode: writingMode,
        attachments:
          attachments.length > 0 ? attachments.map((a) => a.name) : null,
        guided_questions: writingMode === "guided" ? guidedQuestions : null,
        current_question_index:
          writingMode === "guided" ? currentQuestionIndex : null,
      };

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

          // Premium metadata
          folder_id: selectedFolder,
          starred: isStarred,
          pinned: isPinned,
          tags: tags,
          goal_ids: connectedGoals,
          metadata: metadata,
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
      setShowPromptOptions(true);
      setSaveLabel("Save Entry");
      setLastSavedEntry(result.entry);
      setShowFollowUpButtons(true);

      // Reset premium features
      setTags([]);
      setIsStarred(false);
      setIsPinned(false);
      setConnectedGoals([]);
      setAttachments([]);
      setWritingMode("free");
      setGuidedQuestions([]);

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
    if (!lastSavedEntry) return;

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
      setShowPromptOptions(false);

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

  const handleTagInput = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const toggleGoal = (goalId) => {
    setConnectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-400" />
          Premium Journaling Studio
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Journal Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prompt Options */}
            {showPromptOptions && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Choose Your Journaling Approach
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* AI Prompt */}
                  <button
                    onClick={generatePrompt}
                    disabled={loadingPrompt}
                    className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition text-left"
                  >
                    <RefreshCw
                      className={`h-5 w-5 mb-2 ${
                        loadingPrompt ? "animate-spin" : ""
                      }`}
                    />
                    <h4 className="font-semibold">AI Prompt</h4>
                    <p className="text-sm text-gray-300">
                      Get a personalized prompt
                    </p>
                  </button>

                  {/* Subject Prompt */}
                  <div className="p-4 bg-purple-600/20 rounded-lg">
                    <BookOpen className="h-5 w-5 mb-2" />
                    <h4 className="font-semibold mb-2">Subject Prompt</h4>
                    <input
                      type="text"
                      placeholder="Enter topic..."
                      value={subjectPrompt}
                      onChange={(e) => setSubjectPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && subjectPrompt.trim()) {
                          generateSubjectPrompt(subjectPrompt);
                        }
                      }}
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
                    />
                  </div>

                  {/* Guided Journaling */}
                  <button
                    onClick={() => generateGuidedQuestions("personal growth")}
                    className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition text-left"
                  >
                    <Zap className="h-5 w-5 mb-2" />
                    <h4 className="font-semibold">Guided Journey</h4>
                    <p className="text-sm text-gray-300">
                      Step-by-step reflection
                    </p>
                  </button>
                </div>

                {/* Free Writing Option */}
                <button
                  onClick={() => setShowPromptOptions(false)}
                  className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Or start free writing...
                </button>
              </div>
            )}

            {/* Current Prompt Display */}
            {prompt && (
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
                <p className="text-purple-200 font-medium">Today's Prompt:</p>
                <p className="text-gray-100 mt-1">{prompt}</p>
              </div>
            )}

            {/* Guided Questions */}
            {writingMode === "guided" && guidedQuestions.length > 0 && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-200 font-medium">
                    Question {currentQuestionIndex + 1} of{" "}
                    {guidedQuestions.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.max(0, currentQuestionIndex - 1)
                        )
                      }
                      disabled={currentQuestionIndex === 0}
                      className="p-1 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.min(
                            guidedQuestions.length - 1,
                            currentQuestionIndex + 1
                          )
                        )
                      }
                      disabled={
                        currentQuestionIndex === guidedQuestions.length - 1
                      }
                      className="p-1 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-100">
                  {guidedQuestions[currentQuestionIndex]}
                </p>
              </div>
            )}

            {/* Premium Metadata Bar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Folder Selector */}
                <select
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} ({folder.entry_count})
                    </option>
                  ))}
                </select>

                {/* Tags Input */}
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add tags..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagInput}
                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm flex-1"
                  />
                </div>

                {/* Star & Pin */}
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`p-2 rounded transition ${
                    isStarred
                      ? "bg-yellow-500/30 text-yellow-400"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Star
                    className="h-4 w-4"
                    fill={isStarred ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded transition ${
                    isPinned
                      ? "bg-blue-500/30 text-blue-400"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Pin
                    className="h-4 w-4"
                    fill={isPinned ? "currentColor" : "none"}
                  />
                </button>

                {/* Goal Connection */}
                <button
                  onClick={() => setShowGoalSelector(!showGoalSelector)}
                  className="p-2 hover:bg-white/10 rounded transition"
                >
                  <Target className="h-4 w-4" />
                </button>
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-600/30 rounded-full text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Goal Selector */}
              {showGoalSelector && userGoals.length > 0 && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm font-medium mb-2">Connect to Goals:</p>
                  <div className="space-y-2">
                    {userGoals.map((goal) => (
                      <label
                        key={goal.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={connectedGoals.includes(goal.id)}
                          onChange={() => toggleGoal(goal.id)}
                          className="rounded"
                        />
                        {goal.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
              <div ref={editorRef} className="min-h-[500px]" />
            </div>

            {/* Premium Tools Bar */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice Note
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Add Photo
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attach File
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={saveJournalEntry}
                disabled={saveLabel === "Saving..."}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                {saveLabel}
              </button>

              {/* Follow-up Options */}
              {showFollowUpButtons && (
                <button
                  onClick={generateFollowUp}
                  disabled={loadingPrompt}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
                >
                  <ChevronRight className="h-5 w-5" />
                  Follow-up
                </button>
              )}
            </div>

            {/* Save Confirmation */}
            {saveConfirmation && (
              <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200">
                Entry saved successfully!
              </div>
            )}
          </div>

          {/* Premium Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Session Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Words Written</span>
                  <span>
                    {quillRef.current?.getText()?.split(/\s+/).filter(Boolean)
                      .length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Elapsed</span>
                  <span>
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Writing Mode</span>
                  <span className="capitalize">{writingMode}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/history")}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  View History
                </button>
                <button
                  onClick={() => navigate("/analytics")}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Analytics
                </button>
                <button
                  onClick={() => navigate("/goals")}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Goals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
