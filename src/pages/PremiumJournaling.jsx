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
  gratitude: {
    name: "Gratitude Practice",
    icon: Heart,
    prompts: [
      "Three things I'm grateful for...",
      "Someone who made a positive impact today...",
      "A small moment that brought joy...",
      "Something about myself I appreciate...",
    ],
  },
  goals: {
    name: "Goal Tracking",
    icon: Target,
    prompts: [
      "Progress I made toward my goals today...",
      "Obstacles I encountered and how I'll overcome them...",
      "Next steps for tomorrow...",
      "How I'm feeling about my progress...",
    ],
  },
  creative: {
    name: "Creative Expression",
    icon: Palette,
    prompts: [
      "A story or scene that came to mind...",
      "Colors, sounds, or sensations I noticed...",
      "An idea I want to explore...",
      "Something that inspired me today...",
    ],
  },
};

export default function PremiumJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, tier, loading } = useMembership();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const audioRef = useRef(null);
  const quillInitialized = useRef(false);

  // Add custom CSS for white text in Quill
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Premium Quill Editor Styling */
      .premium-quill-container .ql-toolbar {
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 0.5rem 0.5rem 0 0;
      }
      
      .premium-quill-container .ql-toolbar .ql-stroke {
        stroke: white;
      }
      
      .premium-quill-container .ql-toolbar .ql-fill {
        fill: white;
      }
      
      .premium-quill-container .ql-toolbar .ql-picker-label {
        color: white;
      }
      
      .premium-quill-container .ql-toolbar button:hover .ql-stroke {
        stroke: #8B5CF6;
      }
      
      .premium-quill-container .ql-toolbar button:hover .ql-fill {
        fill: #8B5CF6;
      }
      
      .premium-quill-container .ql-toolbar button.ql-active .ql-stroke {
        stroke: #8B5CF6;
      }
      
      .premium-quill-container .ql-toolbar button.ql-active .ql-fill {
        fill: #8B5CF6;
      }
      
      .premium-quill-container .ql-container {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-top: none;
        border-radius: 0 0 0.5rem 0.5rem;
        min-height: 400px;
        max-height: 600px;
        overflow-y: auto;
      }
      
      .premium-quill-container .ql-editor {
        color: white;
        font-size: 1.125rem;
        line-height: 1.75rem;
        min-height: 400px;
      }
      
      .premium-quill-container .ql-editor.ql-blank::before {
        color: rgba(255, 255, 255, 0.5);
      }
      
      .premium-quill-container .ql-editor h1,
      .premium-quill-container .ql-editor h2,
      .premium-quill-container .ql-editor h3,
      .premium-quill-container .ql-editor h4,
      .premium-quill-container .ql-editor h5,
      .premium-quill-container .ql-editor h6 {
        color: white;
      }
      
      .premium-quill-container .ql-editor blockquote {
        border-left-color: #8B5CF6;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .premium-quill-container .ql-editor a {
        color: #8B5CF6;
      }
      
      .premium-quill-container .ql-editor code,
      .premium-quill-container .ql-editor pre {
        background: rgba(139, 92, 246, 0.1);
        color: white;
      }
      
      /* Scrollbar styling */
      .premium-quill-container .ql-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .premium-quill-container .ql-container::-webkit-scrollbar-track {
        background: rgba(139, 92, 246, 0.1);
        border-radius: 4px;
      }
      
      .premium-quill-container .ql-container::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 4px;
      }
      
      .premium-quill-container .ql-container::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Crisis integration
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Core state
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
  const [followUpPrompt, setFollowUpPrompt] = useState("");

  // Advanced features state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlayback, setAudioPlayback] = useState(true);
  const [showReflectionarian, setShowReflectionarian] = useState(false);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [mediaAttachments, setMediaAttachments] = useState([]);
  const [smartPromptsEnabled, setSmartPromptsEnabled] = useState(true);
  const [reflectionarianInsight, setReflectionarianInsight] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isLoadingSubject, setIsLoadingSubject] = useState(false);

  // Folders state
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Voice recording state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Encryption function (same as StandardJournaling)
  const encryptJournalEntry = async (entryData) => {
    const masterKey = await encryptionService.getStaticMasterKey();
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

  // Clear editor function
  const clearEditor = () => {
    if (quillRef.current && isEditorReady) {
      try {
        quillRef.current.setText("");
        setEditorContent("");
        console.log("Advanced editor cleared");
      } catch (error) {
        console.error("Error clearing advanced editor:", error);
      }
    }
  };

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

  // Initialize Quill editor - Fixed to prevent multiple toolbars
  useEffect(() => {
    if (isLocked || !editorRef.current) return;

    // Don't initialize if already initialized
    if (quillInitialized.current) return;

    // Clean up any existing editor
    if (editorRef.current.querySelector(".ql-toolbar")) {
      editorRef.current.innerHTML = "";
    }

    // Check if Quill is already initialized in this element
    if (editorRef.current.classList.contains("ql-container")) {
      return;
    }

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
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
      } catch (error) {
        console.error("Error initializing Quill:", error);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      // Cleanup on unmount
      if (quillRef.current) {
        quillInitialized.current = false;
      }
    };
  }, [isLocked, user]);

  // Update placeholder when template changes
  useEffect(() => {
    if (quillRef.current && isEditorReady) {
      quillRef.current.root.dataset.placeholder = selectedTemplate
        ? "Start writing based on the template prompts..."
        : "Start writing your thoughts...";
    }
  }, [selectedTemplate, isEditorReady]);

  // Access check
  useEffect(() => {
    if (!loading && tier && tier !== "premium") {
      navigate("/journaling");
    }
  }, [tier, loading, navigate]);

  // Load last saved entry
  const loadLastEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setLastSavedEntry(data[0]);
      }
    } catch (error) {
      console.error("Error loading last entry:", error);
    }
  };

  // Load folders
  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const { data, error } = await supabase
        .from("journal_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (!error) {
        setFolders(data || []);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Create new folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("journal_folders")
        .insert({ user_id: user.id, name: newFolderName.trim() })
        .select()
        .single();

      if (!error) {
        setFolders([...folders, data]);
        setSelectedFolder(data.id);
        setNewFolderName("");
        setShowFolderModal(false);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Generate AI prompt (Premium tier includes all types)
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
            pastEntries: lastSavedEntry ? [lastSavedEntry.content] : [],
          }),
        }
      );

      const data = await response.json();
      setPrompt(data.prompt || "What's on your mind today?");
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setPrompt("Take a moment to reflect on your day...");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Generate subject-based prompt (Premium feature)
  const generateSubjectPrompt = async () => {
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
      setPrompt(data.prompt || `Write about ${subject}...`);
      setPromptType("subject");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } catch (error) {
      console.error("Error generating subject prompt:", error);
      setPrompt(`Explore your thoughts about ${subject}...`);
    } finally {
      setIsLoadingSubject(false);
    }
  };

  // Generate folder-based prompt (Premium feature)
  const generateFolderPrompt = async () => {
    if (!selectedFolder) return;

    const folder = folders.find((f) => f.id === selectedFolder);
    if (!folder) return;

    try {
      setIsLoading(true);
      // Get recent entries from this folder for context
      const { data: recentEntries } = await supabase
        .from("journal_entries")
        .select("content")
        .eq("user_id", user.id)
        .eq("folder_id", selectedFolder)
        .order("created_at", { ascending: false })
        .limit(3);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-folder-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            folderName: folder.name,
            recentEntries: recentEntries?.map((e) => e.content) || [],
          }),
        }
      );

      const data = await response.json();
      setPrompt(data.prompt || `Continue your journey in "${folder.name}"...`);
      setPromptType("folder");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } catch (error) {
      console.error("Error generating folder prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select template (Premium feature)
  const selectTemplate = (templateKey) => {
    const template = JOURNAL_TEMPLATES[templateKey];
    setSelectedTemplate(template);
    const randomPrompt =
      template.prompts[Math.floor(Math.random() * template.prompts.length)];
    setPrompt(randomPrompt);
    setPromptType("template");
    setSaveLabel("Save Entry");
    setShowPromptButton(false);
    setShowTemplates(false);
  };

  // Voice recording functions (Premium feature)
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      // In a real app, send to transcription service
      // For now, simulate transcription
      setTimeout(() => {
        const mockTranscription =
          "This is where your transcribed audio would appear...";
        if (quillRef.current) {
          const currentContent = quillRef.current.getText();
          quillRef.current.setText(currentContent + " " + mockTranscription);
        }
        setIsTranscribing(false);
      }, 2000);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setIsTranscribing(false);
    }
  };

  // Tag management (Premium feature)
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Save entry function
  const saveEntry = async () => {
    if (!editorContent || editorContent.trim() === "<p><br></p>") {
      alert("Please write something before saving.");
      return;
    }

    try {
      setSaveLabel("Saving...");

      const threadId = currentThreadId || crypto.randomUUID();
      const cleanContent = editorContent.trim();
      const contentToAnalyze = quillRef.current?.getText() || "";

      // Encrypt the entry
      const encryptedData = await encryptJournalEntry({
        content: cleanContent,
        prompt: promptType !== "none" ? prompt : null,
      });

      // Save to database
      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        thread_id: threadId,
        encrypted_content: encryptedData.encrypted_content,
        content_iv: encryptedData.content_iv,
        encrypted_prompt: encryptedData.encrypted_prompt,
        prompt_iv: encryptedData.prompt_iv,
        encrypted_data_key: encryptedData.encrypted_data_key,
        data_key_iv: encryptedData.data_key_iv,
        prompt_type: promptType,
        entry_number: entryChain.length + 1,
        word_count: contentToAnalyze.split(/\s+/).filter(Boolean).length,
        folder_id: selectedFolder,
        tags: tags,
        is_starred: isStarred,
        is_pinned: isPinned,
        template_used: selectedTemplate?.name || null,
        has_voice_note: false, // Will implement later
        wellness_data: {}, // Can add wellness tracking
      });

      if (error) throw error;

      setLastSavedEntry(data);
      setCurrentThreadId(threadId);
      setEntryChain([...entryChain, cleanContent]);
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);

      if (promptType === "initial") {
        setShowModal(true);
      } else {
        handleEndFollowUps();
      }

      // Crisis detection
      if (showCrisisResources) {
        await triggerCrisisModal(contentToAnalyze);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setSaveLabel("Save Entry");
    }
  };

  // Generate follow-up prompt
  const generateFollowUp = async () => {
    setShowModal(false);
    clearEditor();

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-followup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            previousEntries: entryChain,
            currentEntry: lastSavedEntry?.content || editorContent,
          }),
        }
      );

      const data = await response.json();
      setFollowUpPrompt(data.prompt || "Tell me more about that...");
      setPromptType("followup");
      setSaveLabel("Save & Continue");
      setShowFollowUpModal(true);
    } catch (error) {
      console.error("Error generating follow-up:", error);
      setFollowUpPrompt("What else would you like to explore?");
      setShowFollowUpModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // End follow-ups
  const handleEndFollowUps = () => {
    setShowModal(false);
    setShowFollowUpModal(false);
    clearEditor();
    setPrompt("");
    setPromptType("none");
    setSaveLabel("Save Entry");
    setShowPromptButton(true);
    setEntryChain([]);
    setCurrentThreadId(null);
    setSelectedTemplate(null);
    setTags([]);
    setIsStarred(false);
    setIsPinned(false);
  };

  // Access denied screen
  if (!hasAccess("premium_journaling")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md text-center">
          <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Premium Feature
          </h2>
          <p className="text-gray-300 mb-6">
            Upgrade to Premium to unlock advanced journaling features including
            templates, voice recording, and AI-powered insights.
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            View Premium Plans
          </button>
        </div>
      </div>
    );
  }

  // Locked state
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-gray-300">
            Please unlock to continue journaling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-8">
      <div className="px-6 py-6 max-w-full">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {formatGreeting()}
                </h1>
                <p className="text-gray-300">
                  Your premium journaling experience awaits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-3 py-2 rounded-full border border-purple-400/30">
                <Crown className="text-purple-400" size={16} />
                <span className="text-purple-300 font-medium text-sm">
                  Premium
                </span>
              </div>
              <button
                onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
                title="Privacy Info"
              >
                <Shield size={16} />
                <span>Privacy Info</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 text-white text-sm transition-colors"
            >
              <FileText size={16} />
              Templates
            </button>

            <button
              onClick={generateSubjectPrompt}
              disabled={!subject.trim() || isLoadingSubject}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm transition-colors"
            >
              {isLoadingSubject ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search size={16} />
              )}
              Subject Prompt
            </button>

            <button
              onClick={generateAIPrompt}
              disabled={isLoadingRandom}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 text-sm transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm transition-colors"
            >
              <MessageCircle size={16} />
              Reflectionarian
            </button>

            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              {isRecording ? "Stop" : "Voice"}
            </button>

            <button
              onClick={() => setAudioPlayback(!audioPlayback)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 text-white text-sm transition-colors"
            >
              {audioPlayback ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Read Aloud
            </button>
          </div>
        </div>

        {/* Privacy Modal */}
        {showPrivacyInfo && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPrivacyInfo(false)}
          >
            <div
              className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Your Privacy Matters
                </h3>
                <button
                  onClick={() => setShowPrivacyInfo(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-300">
                Your information is personal — and we treat it that way. All
                your reflections and data are end-to-end encrypted so no one
                else can read it. Not our team. Not our servers. Just you.
                Reflectionary is your private space to be real, raw, and fully
                yourself.
              </p>
            </div>
          </div>
        )}

        {/* Templates Section */}
        {showTemplates && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              Choose a Template
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(JOURNAL_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <button
                    key={key}
                    onClick={() => selectTemplate(key)}
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-center transition-colors"
                  >
                    <Icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <span className="text-sm text-white">{template.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflectionarian Integration */}
        {showReflectionarian && (
          <div className="mb-6">
            <PromptRecommendations
              onSelectPrompt={(p) => {
                setPrompt(p);
                setPromptType("reflectionarian");
                setShowPromptButton(false);
                setShowReflectionarian(false);
              }}
            />
          </div>
        )}

        {/* Subject Prompt Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter a subject for a specific prompt..."
              className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === "Enter" && subject.trim()) {
                  generateSubjectPrompt();
                }
              }}
            />
            <button
              onClick={generateSubjectPrompt}
              disabled={!subject.trim() || isLoadingSubject}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingSubject ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                "Get Prompt"
              )}
            </button>
          </div>
        </div>

        {/* Tags, Folder, Star/Pin Row */}
        <div className="mb-6 space-y-4">
          {/* Tags Input */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Add tags:</span>
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-purple-100"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Star and Pin buttons */}
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                isStarred
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {isStarred ? (
                <Star size={16} fill="currentColor" />
              ) : (
                <StarOff size={16} />
              )}
              Star
            </button>

            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                isPinned
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {isPinned ? (
                <Pin size={16} fill="currentColor" />
              ) : (
                <PinOff size={16} />
              )}
              Pin
            </button>
          </div>

          {/* Folder Selection */}
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Folder:</span>
            <select
              value={selectedFolder || ""}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
              className="flex-1 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFolderModal(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
            >
              <FolderPlus size={16} />
            </button>
            {selectedFolder && (
              <button
                onClick={generateFolderPrompt}
                disabled={isLoading}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
              >
                Folder Prompt
              </button>
            )}
          </div>
        </div>

        {/* Current Prompt Display */}
        {prompt && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-400/30">
            <p className="text-sm text-purple-300 mb-1">
              {promptType === "followup"
                ? "Follow-up prompt:"
                : promptType === "subject"
                ? "Subject-specific prompt:"
                : promptType === "folder"
                ? "Folder-based prompt:"
                : promptType === "template"
                ? "Template-based prompt:"
                : "Your journaling prompt:"}
            </p>
            <p className="text-white">{prompt}</p>
          </div>
        )}

        {/* Quill Editor Container */}
        <div className="mb-6">
          <div className="premium-quill-container">
            <div ref={editorRef} />
          </div>
          {isTranscribing && (
            <div className="mt-2 text-sm text-purple-300 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300" />
              Transcribing audio...
            </div>
          )}
        </div>

        {/* Save Button & Status */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {isEditorReady ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-400" />
                Premium editor ready
              </span>
            ) : (
              <span>Setting up editor...</span>
            )}
            {tags.length > 0 && (
              <div className="text-sm text-gray-400">
                {tags.length} tag{tags.length !== 1 ? "s" : ""} added
              </div>
            )}
          </div>

          <button
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg transition-all"
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

        {/* Save Confirmation */}
        {saveConfirmation && (
          <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <Star className="w-5 h-5" />
            Entry saved successfully!
          </div>
        )}

        {/* Follow-up Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-slate-800 border border-white/20 p-6 rounded-lg shadow-lg max-w-sm text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="text-white" size={32} />
                </div>
                <p className="text-lg font-medium text-white">
                  Great job! Your entry has been saved.
                </p>
              </div>
              <p className="mb-6 text-gray-300">
                Would you like a personalized follow-up question?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={generateFollowUp}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Yes, Please!"}
                </button>
                <button
                  onClick={handleEndFollowUps}
                  className="px-6 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-white/10"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Prompt Modal */}
        {showFollowUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-slate-800 border border-white/20 p-6 rounded-lg shadow-lg max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Your Follow-up Prompt
              </h3>
              <p className="text-purple-300 mb-6">{followUpPrompt}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setPrompt(followUpPrompt);
                    setShowFollowUpModal(false);
                    // Focus on editor to continue writing
                    if (quillRef.current) {
                      quillRef.current.focus();
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  Continue Writing
                </button>
                <button
                  onClick={handleEndFollowUps}
                  className="px-6 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-white/10"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Folder Creation Modal */}
        {showFolderModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-slate-800 border border-white/20 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Create New Folder
              </h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowFolderModal(false);
                    setNewFolderName("");
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Resource Modal */}
        {showCrisisModal && (
          <CrisisResourceModal
            isOpen={showCrisisModal}
            onClose={closeCrisisModal}
            analysisResult={crisisAnalysisResult}
          />
        )}
      </div>
    </div>
  );
}
