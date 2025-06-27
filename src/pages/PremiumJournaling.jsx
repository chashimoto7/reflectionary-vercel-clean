// src/pages/PremiumJournaling.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PromptRecommendations } from "../components/ReflectionarianRecommendations";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import {
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Sparkles,
  BookOpen,
  Tag,
  Calendar,
  Image,
  Link,
  Hash,
  Heart,
  Zap,
  Target,
  Crown,
  ChevronDown,
  ChevronRight,
  Settings,
  Palette,
  MessageCircle,
  Lightbulb,
  Clock,
  Star,
  Check,
  Users,
  Folder,
  FolderPlus,
  Pin,
  PinOff,
  StarOff,
  X,
  Plus,
  Shuffle,
  Search,
  Shield,
} from "lucide-react";

// Journal templates for different use cases
const JOURNAL_TEMPLATES = {
  daily: {
    name: "Daily Reflection",
    icon: Calendar,
    prompts: [
      "What am I grateful for today?",
      "What challenged me and how did I respond?",
      "What did I learn about myself?",
      "What intentions do I set for tomorrow?",
    ],
  },
  emotions: {
    name: "Emotional Processing",
    icon: Heart,
    prompts: [
      "What emotions am I experiencing right now?",
      "Where do I feel these emotions in my body?",
      "What might be triggering these feelings?",
      "How can I honor and process these emotions?",
    ],
  },
  growth: {
    name: "Personal Growth",
    icon: Zap,
    prompts: [
      "What patterns do I notice in my behavior?",
      "What am I learning about myself lately?",
      "What would I like to change or improve?",
      "What strengths can I celebrate?",
    ],
  },
  goals: {
    name: "Goal Setting",
    icon: Target,
    prompts: [
      "What do I want to achieve?",
      "What steps can I take today?",
      "What obstacles might I face?",
      "How will I measure progress?",
    ],
  },
  relationships: {
    name: "Relationships",
    icon: Users,
    prompts: [
      "How are my relationships affecting me?",
      "What communication patterns do I notice?",
      "How can I show up better for others?",
      "What boundaries do I need to set?",
    ],
  },
  creativity: {
    name: "Creative Expression",
    icon: Palette,
    prompts: [
      "What inspires me today?",
      "How can I express myself creatively?",
      "What ideas are flowing through me?",
      "What would I create if there were no limitations?",
    ],
  },
};

export default function PremiumJournaling() {
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess } = useMembership();
  const navigate = useNavigate();

  // Editor state
  const [editorContent, setEditorContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const quillInitialized = useRef(false);

  // UI state
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showReflectionarian, setShowReflectionarian] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showPromptButton, setShowPromptButton] = useState(true);

  // Entry state
  const [entry, setEntry] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [folders, setFolders] = useState([]);
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("");
  const [subject, setSubject] = useState("");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isLoadingSubject, setIsLoadingSubject] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);

  // Voice and audio
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlayback, setAudioPlayback] = useState(false);

  // Save state
  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Crisis detection
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Format greeting based on time of day
  const formatGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "";
    return `Good ${timeOfDay}, ${name}`;
  };

  // Load folders on mount
  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  // Initialize Quill editor with custom styling
  useEffect(() => {
    if (isLocked || !editorRef.current || quillInitialized.current) return;

    // Check if Quill is already initialized in this element
    if (editorRef.current.classList.contains("ql-container")) {
      return;
    }

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
      placeholder: selectedTemplate
        ? "Start writing based on the template prompts..."
        : "Start writing your thoughts...",
    });

    quill.on("text-change", () => {
      setEditorContent(quill.root.innerHTML);
    });

    quillRef.current = quill;
    quillInitialized.current = true;
    setIsEditorReady(true);

    // Load the last saved entry
    loadLastEntry();

    // Apply custom dark theme styling to Quill
    applyQuillDarkTheme();

    return () => {
      // Don't destroy Quill on visibility change, only on actual unmount
      if (quillRef.current) {
        quillInitialized.current = false;
      }
    };
  }, [isLocked, user]);

  // Apply dark theme to Quill editor
  const applyQuillDarkTheme = () => {
    // Add custom styles for dark theme
    const style = document.createElement("style");
    style.textContent = `
      .ql-editor {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border: 1px solid #475569 !important;
      }
      .ql-toolbar {
        background-color: #334155 !important;
        border: 1px solid #475569 !important;
        border-bottom: none !important;
      }
      .ql-toolbar .ql-stroke {
        stroke: #e2e8f0 !important;
      }
      .ql-toolbar .ql-fill {
        fill: #e2e8f0 !important;
      }
      .ql-toolbar button:hover {
        color: #b7ebff !important;
      }
      .ql-toolbar button.ql-active {
        color: #8b5cf6 !important;
      }
      .ql-container {
        border: 1px solid #475569 !important;
      }
      .ql-tooltip {
        background-color: #334155 !important;
        border: 1px solid #475569 !important;
        color: #e2e8f0 !important;
      }
    `;
    document.head.appendChild(style);
  };

  // Update placeholder when template changes
  useEffect(() => {
    if (quillRef.current && isEditorReady) {
      quillRef.current.root.dataset.placeholder = selectedTemplate
        ? "Start writing based on the template prompts..."
        : "Start writing your thoughts...";
    }
  }, [selectedTemplate, isEditorReady]);

  // Load folders
  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  // Load last entry
  const loadLastEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setLastSavedEntry(data[0]);
      }
    } catch (error) {
      console.error("Error loading last entry:", error);
    }
  };

  // Generate AI random prompt
  const generateAIPrompt = async () => {
    if (isLocked) return;

    try {
      setIsLoadingRandom(true);
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
      setPromptType("random");
    } catch (error) {
      console.error("Error generating prompt:", error);
      setPrompt("Write about a moment today that made you feel something.");
      setPromptType("random");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Handle subject prompt
  const handleSubjectPrompt = async () => {
    if (!subject.trim() || isLocked) return;

    try {
      setIsLoadingSubject(true);
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-subject-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            subject: subject.trim(),
          }),
        }
      );

      const data = await response.json();
      setPrompt(data.prompt || `Reflect on: ${subject}`);
      setPromptType("subject");
      setSubject("");
    } catch (error) {
      console.error("Error generating subject prompt:", error);
      setPrompt(`Write about your thoughts on: ${subject}`);
      setPromptType("subject");
      setSubject("");
    } finally {
      setIsLoadingSubject(false);
    }
  };

  // Voice recording functions
  const startVoiceRecording = () => {
    setIsRecording(true);
    // Voice recording implementation
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Stop recording implementation
  };

  const toggleAudioPlayback = () => {
    setAudioPlayback(!audioPlayback);
    // Audio playback implementation
  };

  // Clear editor
  const clearEditor = () => {
    if (quillRef.current) {
      quillRef.current.setText("");
      setEditorContent("");
    }
  };

  // Start new entry
  const startNewEntry = () => {
    setPrompt("");
    setPromptType("");
    setTags([]);
    setIsStarred(false);
    setIsPinned(false);
    setSelectedTemplate(null);
    setSelectedFolder("");
    setFollowUpPrompt("");
    setLastSavedEntry(null);
    setShowModal(false);
    setShowFollowUpModal(false);
    setShowPromptButton(true);
    setCurrentThreadId(null);
    clearEditor();
  };

  // Tag management
  const addTag = (e) => {
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

  // Template selection
  const selectTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    setShowTemplates(false);

    // Pre-fill with template prompts
    if (quillRef.current && JOURNAL_TEMPLATES[templateKey]) {
      const prompts = JOURNAL_TEMPLATES[templateKey].prompts;
      const formattedPrompts = prompts
        .map((p) => `<p><strong>${p}</strong></p><p><br></p>`)
        .join("");
      quillRef.current.root.innerHTML = formattedPrompts;
      setEditorContent(formattedPrompts);
    }
  };

  // Check access
  if (!hasAccess("journaling")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Access Restricted
          </h3>
          <p className="text-yellow-700">
            Please unlock to continue journaling.
          </p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Session Locked
          </h3>
          <p className="text-yellow-700">
            For your security, this session has been locked. Please unlock to
            continue journaling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#b7ebff" }}>
                {formatGreeting()}
              </h1>
              <p style={{ color: "#b7ebff" }}>
                Your premium journaling experience awaits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 rounded-full">
              <Crown className="text-white" size={16} />
              <span className="text-white font-medium text-sm">Premium</span>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="flex items-center gap-2 text-purple-300 hover:text-white text-sm"
            >
              <Shield size={16} />
              Privacy Info
            </button>
          </div>
        </div>

        {/* Privacy Information Modal - Floating */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-purple-500 max-w-md w-full mx-4 relative">
              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="absolute top-4 right-4 text-purple-300 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex items-start gap-3">
                <Shield
                  className="text-purple-400 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="font-semibold text-purple-200 mb-2">
                    🔒 Your Privacy is Protected
                  </h3>
                  <p className="text-purple-300 text-sm">
                    Your information is personal — and we treat it that way. All
                    your reflections and data are end-to-end encrypted so no one
                    else can read it. Not our team. Not our servers. Just you.
                    Reflectionary is your private space to be real, raw, and
                    fully yourself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 text-sm text-slate-200"
          >
            <FileText size={16} />
            Templates
          </button>

          <button
            onClick={handleSubjectPrompt}
            disabled={isLoadingSubject || !subject.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 disabled:opacity-50 text-sm"
          >
            {isLoadingSubject ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Lightbulb size={16} />
            )}
            Subject Prompt
          </button>

          <button
            onClick={generateAIPrompt}
            disabled={isLoadingRandom}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 text-sm"
          >
            {isLoadingRandom ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Shuffle size={16} />
            )}
            Random Prompt
          </button>

          <button
            onClick={() => setShowReflectionarian(!showReflectionarian)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm"
          >
            <MessageCircle size={16} />
            Reflectionarian
          </button>

          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              isRecording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            {isRecording ? "Stop" : "Voice"}
          </button>

          <button
            onClick={toggleAudioPlayback}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 text-sm text-slate-200"
          >
            {audioPlayback ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Read Aloud
          </button>
        </div>

        {/* Subject Prompt Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubjectPrompt()}
            placeholder="Enter a subject for a specific prompt..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(JOURNAL_TEMPLATES).map(([key, template]) => {
            const Icon = template.icon;
            return (
              <button
                key={key}
                onClick={() => selectTemplate(key)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedTemplate === key
                    ? "border-purple-500 bg-purple-900/50"
                    : "border-slate-600 hover:border-purple-400 bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 text-purple-400 mb-2" />
                <h3 className="font-medium text-slate-200">{template.name}</h3>
              </button>
            );
          })}
        </div>
      )}

      {/* AI Prompt Display */}
      {prompt && (
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-3 rounded-lg mb-6 border border-purple-500">
          <p className="text-lg font-bold text-purple-200">
            {promptType === "followUp"
              ? "Follow-up prompt:"
              : promptType === "subject"
              ? "Subject-specific prompt:"
              : promptType === "folder"
              ? "Folder-based prompt:"
              : promptType === "template"
              ? "Template prompt:"
              : "Writing prompt:"}
          </p>
          <p className="text-purple-100 mt-2">{prompt}</p>
        </div>
      )}

      {/* Entry Controls - Inline Layout */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Tag Section */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">#Tag</span>
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={addTag}
            placeholder="Add tag..."
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-200 placeholder-slate-400 text-sm w-24"
          />
        </div>

        {/* Folder Section */}
        <div className="flex items-center gap-2">
          <Folder className="text-slate-400" size={16} />
          <span className="text-slate-400 text-sm">Folder</span>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-200 text-sm"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Star and Pin buttons */}
        <button
          onClick={() => setIsStarred(!isStarred)}
          className={`p-2 rounded-lg transition-colors ${
            isStarred
              ? "bg-yellow-600 text-white"
              : "bg-slate-700 border border-slate-600 text-slate-400 hover:text-yellow-400"
          }`}
        >
          {isStarred ? (
            <Star size={16} fill="currentColor" />
          ) : (
            <Star size={16} />
          )}
        </button>

        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`p-2 rounded-lg transition-colors ${
            isPinned
              ? "bg-purple-600 text-white"
              : "bg-slate-700 border border-slate-600 text-slate-400 hover:text-purple-400"
          }`}
        >
          {isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
        </button>
      </div>

      {/* Selected Tags Display */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm border border-purple-500"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-purple-300 hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="mb-6">
        <div
          ref={editorRef}
          className="min-h-[400px] rounded-lg border border-slate-600"
        />
      </div>

      {/* Reflectionarian Section */}
      {showReflectionarian && (
        <div className="mb-6">
          <PromptRecommendations
            userId={user.id}
            entryContent={editorContent}
            onPromptSelect={(selectedPrompt) => {
              setPrompt(selectedPrompt);
              setPromptType("reflectionarian");
            }}
          />
        </div>
      )}

      {/* Crisis Modal */}
      <CrisisResourceModal
        isOpen={showCrisisModal}
        onClose={closeCrisisModal}
        analysisResult={crisisAnalysisResult}
        showResources={showCrisisResources}
      />
    </div>
  );
}
