// frontend/ src/pages/PremiumJournaling.jsx
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
  MessageCircle,
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

  // Reflectionarian prompts state
  const [reflectionarianPrompts, setReflectionarianPrompts] = useState([]);
  const [showReflectionarianPrompts, setShowReflectionarianPrompts] =
    useState(false);

  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);

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
      loadReflectionarianPrompts();
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

      // Focus on the editor
      quillRef.current.focus();
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

  const loadReflectionarianPrompts = async () => {
    try {
      // Check if user has any saved prompts from Reflectionarian sessions
      const response = await fetch(
        `/api/reflectionarian/saved-prompts?user_id=${user.id}`
      );
      if (!response.ok) return;

      const data = await response.json();
      if (data.prompts && data.prompts.length > 0) {
        setReflectionarianPrompts(data.prompts);
        setShowReflectionarianPrompts(true);
      }
    } catch (error) {
      console.error("Error loading Reflectionarian prompts:", error);
    }
  };

  const useReflectionarianPrompt = (promptText) => {
    setPrompt(promptText);
    setShowPromptOptions(false);
    setShowReflectionarianPrompts(false);
    if (quillRef.current) {
      quillRef.current.root.setAttribute("data-placeholder", promptText);
      quillRef.current.focus();
    }
  };

  const generatePrompt = async () => {
    setLoadingPrompt(true);
    try {
      const response = await fetch("/api/generate-prompt", {
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
        quillRef.current.focus();
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
        quillRef.current.focus();
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
    } finally {
      setSaveLabel("Save Entry");
    }
  };

  const generateFollowUp = async () => {
    if (!lastSavedEntry) return;

    setLoadingPrompt(true);
    try {
      const response = await fetch("/api/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          parent_entry_id: lastSavedEntry.id,
          thread_id: currentThreadId || lastSavedEntry.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate follow-up");

      const data = await response.json();
      setPrompt(data.prompt);
      setShowPromptOptions(false);
      setShowFollowUpButtons(false);

      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.root.setAttribute("data-placeholder", data.prompt);
      }

      setEntryChain((prev) => [...prev, lastSavedEntry.id]);
      if (!currentThreadId) {
        setCurrentThreadId(lastSavedEntry.id);
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      alert("Failed to generate follow-up. Please try again.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  const addTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const toggleGoal = (goalId) => {
    if (connectedGoals.includes(goalId)) {
      setConnectedGoals(connectedGoals.filter((id) => id !== goalId));
    } else {
      setConnectedGoals([...connectedGoals, goalId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    navigate("/journaling");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Premium Journaling
        </h1>

        {/* Main content area - Full width without sidebar */}
        <div className="space-y-6">
          {/* Reflectionarian Prompts (if available) */}
          {showReflectionarianPrompts && reflectionarianPrompts.length > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg border border-purple-400/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">
                    Prompts from your Reflectionarian sessions
                  </h3>
                </div>
                <button
                  onClick={() => setShowReflectionarianPrompts(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2">
                {reflectionarianPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => useReflectionarianPrompt(prompt.text)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    <p className="text-sm">{prompt.text}</p>
                    <span className="text-xs text-gray-400">
                      From {new Date(prompt.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Options - Only show if not already writing */}
          {showPromptOptions && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <h3 className="text-lg font-semibold mb-4">
                Choose how you'd like to start writing:
              </h3>

              <div className="space-y-3">
                {/* Start Writing (no prompt) */}
                <button
                  onClick={() => {
                    setShowPromptOptions(false);
                    if (quillRef.current) {
                      quillRef.current.focus();
                    }
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-left px-4"
                >
                  <div className="flex items-center justify-between">
                    <span>Start Writing</span>
                    <span className="text-sm text-gray-400">
                      Write freely without a prompt
                    </span>
                  </div>
                </button>

                {/* Generate AI Prompt */}
                <button
                  onClick={generatePrompt}
                  disabled={loadingPrompt}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="h-5 w-5" />
                  {loadingPrompt ? "Generating..." : "Generate AI Prompt"}
                </button>

                {/* Topic-specific prompt */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or write about a specific topic..."
                    value={subjectPrompt}
                    onChange={(e) => setSubjectPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && subjectPrompt.trim()) {
                        generateSubjectPrompt(subjectPrompt);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => generateSubjectPrompt(subjectPrompt)}
                    disabled={!subjectPrompt.trim() || loadingPrompt}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>

                {/* Guided Questions */}
                <button
                  onClick={() => generateGuidedQuestions("general")}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-left px-4"
                >
                  <div className="flex items-center justify-between">
                    <span>Guided Questions</span>
                    <span className="text-sm text-gray-400">
                      Answer structured prompts
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Current Prompt Display */}
          {prompt && !showPromptOptions && (
            <div className="bg-purple-600/20 backdrop-blur-sm rounded-lg border border-purple-400/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-purple-100">{prompt}</p>
                <button
                  onClick={() => {
                    setPrompt("");
                    setShowPromptOptions(true);
                  }}
                  className="text-sm text-purple-300 hover:text-white"
                >
                  Change prompt
                </button>
              </div>
            </div>
          )}

          {/* Guided Questions Display */}
          {writingMode === "guided" && guidedQuestions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Question {currentQuestionIndex + 1} of{" "}
                  {guidedQuestions.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.min(
                        currentQuestionIndex + 1,
                        guidedQuestions.length - 1
                      )
                    )
                  }
                  disabled={currentQuestionIndex >= guidedQuestions.length - 1}
                  className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  Next Question →
                </button>
              </div>
              <p className="text-lg">{guidedQuestions[currentQuestionIndex]}</p>
            </div>
          )}

          {/* Premium Features Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Folder Selection */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-1">
                  Folder
                </label>
                <select
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Add tags..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={addTag}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Star & Pin */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`p-2 rounded-lg transition ${
                    isStarred
                      ? "bg-yellow-500 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <Star
                    className="h-5 w-5"
                    fill={isStarred ? "white" : "none"}
                  />
                </button>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-lg transition ${
                    isPinned
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <Pin className="h-5 w-5" fill={isPinned ? "white" : "none"} />
                </button>
              </div>

              {/* Goals Connection */}
              <div className="relative">
                <button
                  onClick={() => setShowGoalSelector(!showGoalSelector)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center justify-between"
                >
                  <span>
                    {connectedGoals.length > 0
                      ? `${connectedGoals.length} Goals`
                      : userGoals.length > 0
                      ? "Connect Goals"
                      : "No Goals Set"}
                  </span>
                  <Target className="h-4 w-4" />
                </button>

                {/* Goal Selector Dropdown */}
                {showGoalSelector && (
                  <div className="absolute mt-2 w-64 bg-slate-800 border border-white/20 rounded-lg shadow-xl p-3 z-10 right-0">
                    {userGoals.length > 0 ? (
                      <div className="space-y-2">
                        {userGoals.map((goal) => (
                          <label
                            key={goal.id}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:text-purple-300"
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
                    ) : (
                      <div className="text-sm text-gray-400">
                        <p className="mb-2">You haven't set any goals yet.</p>
                        <button
                          onClick={() => navigate("/goals")}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Create your first goal →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/30 rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Editor with fixed height and scrollbar */}
          <div
            ref={editorContainerRef}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
          >
            <div
              ref={editorRef}
              className="h-[500px] overflow-y-auto"
              style={{
                maxHeight: "500px",
              }}
            />
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
