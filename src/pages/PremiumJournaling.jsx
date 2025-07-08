// frontend/src/pages/PremiumJournaling.jsx
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
  Target,
  MessageCircle,
  ChevronDown,
  X,
  Check,
  Trash2,
  Lightbulb,
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
  const [connectedGoals, setConnectedGoals] = useState([]);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [userGoals, setUserGoals] = useState([]);
  const [writingMode, setWritingMode] = useState("free");
  const [guidedQuestions, setGuidedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Reflectionarian prompts state - Fixed to use dropdown
  const [reflectionarianPrompts, setReflectionarianPrompts] = useState([]);
  const [showReflectionarianDropdown, setShowReflectionarianDropdown] =
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

  // Load premium data - Make this non-blocking for editor
  useEffect(() => {
    if (user) {
      // Load data in background, don't block editor initialization
      setTimeout(() => {
        loadFolders();
        loadGoals();
        loadReflectionarianPrompts();
      }, 100);
    }
  }, [user]);

  // Initialize Quill editor - Make it more resilient and independent
  useEffect(() => {
    // Don't let other errors block editor initialization
    const initializeEditor = () => {
      if (isLocked || !editorRef.current || quillRef.current) return;

      // Check if Quill is already initialized in this element
      if (editorRef.current.classList.contains("ql-container")) {
        return;
      }

      try {
        const toolbarOptions = [
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
          ["link", "image"],
          ["clean"],
        ];

        const quill = new Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: toolbarOptions,
          },
          placeholder: "Start writing your thoughts...",
        });

        quill.on("text-change", () => {
          // You can add content change handling here if needed
        });

        quillRef.current = quill;

        // Force focus to make sure it's clickable
        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.focus();
          }
        }, 200);

        console.log("✅ Quill editor initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing Quill editor:", error);
      }
    };

    // Initialize editor with a slight delay to ensure DOM is ready
    const timer = setTimeout(initializeEditor, 100);

    return () => {
      clearTimeout(timer);
      // Clean up on unmount
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [isLocked]);

  // Separate effect to handle prompt changes
  useEffect(() => {
    if (quillRef.current && prompt) {
      quillRef.current.root.setAttribute("data-placeholder", prompt);
    }
  }, [prompt]);

  const loadFolders = async () => {
    try {
      const response = await fetch(
        `/api/folders?user_id=${user.id}&include_entry_count=true`
      );

      if (!response.ok) {
        console.error("Failed to load folders:", response.status);
        return;
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Folders API returned non-JSON response");
        return;
      }

      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      // Don't show error to user, just continue without folders
      setFolders([]);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch(`/api/goals?user_id=${user.id}`);

      if (!response.ok) {
        console.error("Failed to load goals:", response.status);
        return;
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Goals API returned non-JSON response");
        return;
      }

      const data = await response.json();
      if (data.goals) {
        setUserGoals(data.goals.filter((g) => g.status === "active"));
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      // Don't show error to user, just continue without goals
      setUserGoals([]);
    }
  };

  const loadReflectionarianPrompts = async () => {
    try {
      const response = await fetch(
        `/api/reflectionarian-prompts?user_id=${user.id}`
      );

      if (!response.ok) {
        console.error(
          "Failed to load Reflectionarian prompts:",
          response.status
        );
        return;
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Reflectionarian prompts API returned non-JSON response");
        return;
      }

      const data = await response.json();
      if (data.prompts && data.prompts.length > 0) {
        setReflectionarianPrompts(data.prompts);
      }
    } catch (error) {
      console.error("Error loading Reflectionarian prompts:", error);
      // Continue without prompts - this is not critical
      setReflectionarianPrompts([]);
    }
  };

  const useReflectionarianPrompt = (promptText) => {
    setPrompt(promptText);
    setShowReflectionarianDropdown(false);
    if (quillRef.current) {
      quillRef.current.root.setAttribute("data-placeholder", promptText);
      setTimeout(() => quillRef.current.focus(), 100);
    }
  };

  const markReflectionarianPromptDone = async (promptId) => {
    try {
      const response = await fetch(`/api/reflectionarian-prompts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_id: promptId,
          user_id: user.id,
          status: "completed",
        }),
      });

      if (response.ok) {
        // Remove from local state
        setReflectionarianPrompts((prev) =>
          prev.filter((p) => p.id !== promptId)
        );
      }
    } catch (error) {
      console.error("Error marking prompt as done:", error);
    }
  };

  const deleteReflectionarianPrompt = async (promptId) => {
    try {
      const response = await fetch(
        `/api/reflectionarian-prompts?prompt_id=${promptId}&user_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove from local state
        setReflectionarianPrompts((prev) =>
          prev.filter((p) => p.id !== promptId)
        );
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
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

      if (!response.ok) {
        // Fallback to local prompts
        const fallbackPrompts = [
          "What emotions have been most present for you today, and what might they be trying to tell you?",
          "Describe a moment from today that made you pause. What made it significant?",
          "If you could have a conversation with your future self, what would you want to know?",
          "What patterns have you noticed in your thoughts lately? How do they serve or limit you?",
          "Write about something you've been avoiding. What would happen if you faced it with compassion?",
        ];

        const randomPrompt =
          fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
        setPrompt(randomPrompt);
        return;
      }

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      // Use fallback
      const fallbackPrompts = [
        "What's on your mind today? Take a moment to reflect on your thoughts and feelings.",
        "How are you feeling in this moment? Explore what's behind those feelings.",
        "What would you like to explore about yourself today?",
      ];

      const randomPrompt =
        fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
      setPrompt(randomPrompt);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const generateSubjectPrompt = async (subject) => {
    if (!subject.trim()) return;

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

      if (!response.ok) {
        // Fallback prompt based on subject
        const fallbackPrompt = `Take a moment to explore your thoughts and feelings about ${subject}. What comes up for you when you think about this?`;
        setPrompt(fallbackPrompt);
        return;
      }

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (error) {
      console.error("Error generating subject prompt:", error);
      // Use fallback
      const fallbackPrompt = `What role does ${subject.toLowerCase()} play in your life right now? How has your relationship with it evolved?`;
      setPrompt(fallbackPrompt);
    } finally {
      setLoadingPrompt(false);
      setSubjectPrompt(""); // Clear the input
    }
  };

  const generateGuidedQuestions = async (topic) => {
    setLoadingPrompt(true);
    try {
      // Always use fallback questions for now
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

      if (quillRef.current) {
        quillRef.current.root.setAttribute(
          "data-placeholder",
          fallbackQuestions[0]
        );
        setTimeout(() => quillRef.current.focus(), 100);
      }
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

    if (!plainText || plainText.length < 10) {
      alert("Please write a bit more before saving.");
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
        const errorText = await response.text();
        console.error("Save error response:", errorText);
        throw new Error(`Failed to save entry: ${response.status}`);
      }

      const result = await response.json();

      // Handle crisis detection result
      if (result.crisis_analysis && result.crisis_analysis.should_alert) {
        await triggerCrisisModal(plainText, result.crisis_analysis);
      }

      // Reset form after successful save
      quillRef.current.setText("");
      setPrompt("");
      setSaveLabel("Save Entry");
      setLastSavedEntry(result.entry);
      setShowFollowUpButtons(true);

      // Reset premium features
      setTags([]);
      setIsStarred(false);
      setIsPinned(false);
      setConnectedGoals([]);
      setWritingMode("free");
      setGuidedQuestions([]);
      setCurrentQuestionIndex(0);

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

      if (!response.ok) {
        // Use a generic follow-up prompt
        const fallbackFollowUp =
          "Let's dive deeper into what you just wrote. What else comes up for you when you sit with these thoughts?";
        setPrompt(fallbackFollowUp);
        setShowFollowUpButtons(false);

        if (quillRef.current) {
          quillRef.current.setText("");
          quillRef.current.root.setAttribute(
            "data-placeholder",
            fallbackFollowUp
          );
          setTimeout(() => quillRef.current.focus(), 100);
        }
        return;
      }

      const data = await response.json();
      setPrompt(data.prompt);
      setShowFollowUpButtons(false);

      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.root.setAttribute("data-placeholder", data.prompt);
        setTimeout(() => quillRef.current.focus(), 100);
      }

      setEntryChain((prev) => [...prev, lastSavedEntry.id]);
      if (!currentThreadId) {
        setCurrentThreadId(lastSavedEntry.id);
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      // Use fallback
      const fallbackFollowUp =
        "What would you like to explore further about what you just shared?";
      setPrompt(fallbackFollowUp);
      setShowFollowUpButtons(false);

      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.root.setAttribute(
          "data-placeholder",
          fallbackFollowUp
        );
        setTimeout(() => quillRef.current.focus(), 100);
      }
    } finally {
      setLoadingPrompt(false);
    }
  };

  const addTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
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

        {/* Main content area - Reorganized layout */}
        <div className="space-y-6">
          {/* Compact prompt section with inline buttons */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold mb-3">
              How would you like to start?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Reflectionarian Prompts Dropdown - Replaces Start Writing */}
              <div className="relative">
                <button
                  onClick={() =>
                    setShowReflectionarianDropdown(!showReflectionarianDropdown)
                  }
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">
                      {reflectionarianPrompts.length > 0
                        ? `Reflectionarian (${reflectionarianPrompts.length})`
                        : "Reflectionarian"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-purple-400 transform transition-transform ${
                      showReflectionarianDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown overlay */}
                {showReflectionarianDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-purple-400/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {reflectionarianPrompts.length > 0 ? (
                      reflectionarianPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="flex items-center justify-between p-3 hover:bg-purple-600/20 border-b border-purple-400/20 last:border-b-0"
                        >
                          <button
                            onClick={() =>
                              useReflectionarianPrompt(prompt.text)
                            }
                            className="flex-1 text-left text-sm text-purple-100 hover:text-white"
                          >
                            {prompt.text}
                          </button>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() =>
                                markReflectionarianPromptDone(prompt.id)
                              }
                              className="p-1 text-green-400 hover:text-green-300 transition"
                              title="Mark as done"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() =>
                                deleteReflectionarianPrompt(prompt.id)
                              }
                              className="p-1 text-red-400 hover:text-red-300 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-400 text-center">
                        No prompts available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generate AI Prompt */}
              <button
                onClick={generatePrompt}
                disabled={loadingPrompt}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">
                  {loadingPrompt ? "Generating..." : "Generate AI Prompt"}
                </span>
              </button>

              {/* Generate Subject Prompt - Inline */}
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Topic..."
                  value={subjectPrompt}
                  onChange={(e) => setSubjectPrompt(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && subjectPrompt.trim()) {
                      generateSubjectPrompt(subjectPrompt);
                    }
                  }}
                  className="flex-1 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-sm"
                />
                <button
                  onClick={() => generateSubjectPrompt(subjectPrompt)}
                  disabled={!subjectPrompt.trim() || loadingPrompt}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                  title="Generate Subject Prompt"
                >
                  <Lightbulb className="h-4 w-4" />
                </button>
              </div>

              {/* Guided Questions */}
              <button
                onClick={() => generateGuidedQuestions("general")}
                disabled={loadingPrompt}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm"
              >
                Guided Questions
              </button>
            </div>
          </div>

          {/* Current Prompt Display */}
          {prompt && (
            <div className="bg-purple-600/20 backdrop-blur-sm rounded-lg border border-purple-400/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-purple-100 flex-1">{prompt}</p>
                <button
                  onClick={() => setPrompt("")}
                  className="text-sm text-purple-300 hover:text-white whitespace-nowrap"
                >
                  Clear prompt
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
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(currentQuestionIndex - 1);
                        if (quillRef.current) {
                          quillRef.current.root.setAttribute(
                            "data-placeholder",
                            guidedQuestions[currentQuestionIndex - 1]
                          );
                        }
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < guidedQuestions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        if (quillRef.current) {
                          quillRef.current.root.setAttribute(
                            "data-placeholder",
                            guidedQuestions[currentQuestionIndex + 1]
                          );
                        }
                      }
                    }}
                    disabled={
                      currentQuestionIndex >= guidedQuestions.length - 1
                    }
                    className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <p className="text-lg">{guidedQuestions[currentQuestionIndex]}</p>
            </div>
          )}

          {/* Premium Features Bar - Reorganized inline: Voice Note, Folder, Tags, Star, Pin, Connect to Goals */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {/* Voice Note - Smaller */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Voice Note
                </label>
                <button
                  onClick={() => alert("Voice recording feature coming soon!")}
                  className="w-full px-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Mic className="h-4 w-4" />
                  <span className="text-xs">Record</span>
                </button>
              </div>

              {/* Folder Selection */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-1">
                  Folder
                </label>
                <select
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 text-sm"
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
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>

              {/* Star Button */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Star</label>
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`w-full px-2 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                    isStarred
                      ? "bg-yellow-500 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={isStarred ? "Unstar" : "Star"}
                >
                  <Star
                    className="h-4 w-4"
                    fill={isStarred ? "white" : "none"}
                  />
                  <span className="text-xs">
                    {isStarred ? "Starred" : "Star"}
                  </span>
                </button>
              </div>

              {/* Pin Button */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pin</label>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-full px-2 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                    isPinned
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  <Pin className="h-4 w-4" fill={isPinned ? "white" : "none"} />
                  <span className="text-xs">{isPinned ? "Pinned" : "Pin"}</span>
                </button>
              </div>

              {/* Connect to Goals - Smaller */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-1">
                  Connect to Goals
                </label>
                <button
                  onClick={() => setShowGoalSelector(!showGoalSelector)}
                  className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center justify-center gap-1"
                >
                  <Target className="h-4 w-4" />
                  <span className="text-xs">
                    {connectedGoals.length > 0
                      ? `${connectedGoals.length}`
                      : userGoals.length > 0
                      ? "Goals"
                      : "None"}
                  </span>
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
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{goal.title}</span>
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

          {/* Editor with fixed height and scrollbar - Now higher up with always-visible toolbar */}
          <div
            ref={editorContainerRef}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
          >
            <div
              ref={editorRef}
              className="border border-gray-300 rounded-lg"
              style={{ minHeight: "400px" }}
            />
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
