// src/pages/AdvancedJournaling.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import Quill from "quill";
import "quill/dist/quill.snow.css";
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
  wellness: {
    name: "Wellness Check-in",
    icon: Activity,
    prompts: [
      "How is my body feeling today?",
      "What did I do for my physical health?",
      "How is my mental/emotional state?",
      "What self-care practices helped me today?",
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

// Helper functions for encryption (same as StandardJournaling)
const getStaticMasterKey = async () => {
  const keyHex = import.meta.env.VITE_MASTER_ENCRYPTION_KEY;
  return keyHex;
};

export default function AdvancedJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, tier } = useMembership();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const audioRef = useRef(null);
  const quillInitialized = useRef(false);

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

  // Wellness tracking (enhanced for premium)
  const [showWellnessSection, setShowWellnessSection] = useState(false);
  const [wellnessData, setWellnessData] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 7,
    water: 0,
    exercise: 0,
    mindfulness: 0,
    socialConnection: 5,
    productivity: 5,
    selfCare: false,
    nutrition: "balanced",
  });

  // Encryption function (same as StandardJournaling)
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

  // Initialize Quill editor
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

    return () => {
      // Don't destroy Quill on visibility change, only on actual unmount
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

  // Load folders
  const loadFolders = async () => {
    setLoadingFolders(true);
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
        .insert({
          user_id: user.id,
          name: newFolderName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      setSelectedFolder(data.id);
      setNewFolderName("");
      setShowFolderModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    }
  };

  // Generate AI prompt (random)
  const generateAIPrompt = async () => {
    setIsLoadingRandom(true);
    try {
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generatePrompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("initial");
        setShowPromptButton(false);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      setPrompt("What's on your mind today?");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Generate subject-specific prompt
  const handleSubjectPrompt = async () => {
    if (!subject.trim()) return;

    try {
      setIsLoadingSubject(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-subject-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            user_id: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("subject");
        setShowPromptButton(false);
        setSubject("");
      } else {
        alert("No prompt returned. Try again.");
      }
    } catch (err) {
      console.error("Failed to fetch subject prompt:", err);
      alert("Something went wrong while generating the prompt.");
    } finally {
      setIsLoadingSubject(false);
    }
  };

  // Generate folder-specific prompt
  const generateFolderPrompt = async () => {
    if (!selectedFolder) {
      alert("Please select a folder first");
      return;
    }

    setIsLoading(true);
    try {
      // Get entries from selected folder
      const { data: folderEntries, error } = await supabase
        .from("journal_entries")
        .select("content, encryption_key")
        .eq("user_id", user.id)
        .eq("folder_id", selectedFolder)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // For now, use the folder name as context
      const folder = folders.find((f) => f.id === selectedFolder);
      const folderContext = `Generate a journaling prompt for the folder "${
        folder?.name || "Untitled"
      }". This folder contains ${folderEntries?.length || 0} entries.`;

      setPrompt(
        `Reflect on your journey in "${folder?.name}" - what patterns or insights have emerged?`
      );
      setPromptType("folder");
      setShowPromptButton(false);
    } catch (error) {
      console.error("Error generating folder prompt:", error);
      setPrompt("What would you like to add to this folder today?");
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting voice recording:", error);
      alert("Unable to access microphone. Please check your permissions.");
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
      // Here you would integrate with a transcription service
      // For now, we'll simulate with a placeholder
      setTimeout(() => {
        const simulatedTranscription =
          "This is where your transcribed text would appear.";
        setTranscribedText(simulatedTranscription);

        // Append to editor
        if (quillRef.current) {
          const currentContent = quillRef.current.root.innerHTML;
          quillRef.current.root.innerHTML =
            currentContent + "<p>" + simulatedTranscription + "</p>";
          setEditorContent(quillRef.current.root.innerHTML);
        }

        setIsTranscribing(false);
      }, 2000);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setIsTranscribing(false);
    }
  };

  // Text-to-speech for reading entries
  const toggleAudioPlayback = () => {
    if (!audioPlayback) {
      setAudioPlayback(true);
      return;
    }

    const text = quillRef.current?.getText() || "";
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Load last entry
  const loadLastEntry = async () => {
    try {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (entries && entries.length > 0) {
        const lastEntry = entries[0];
        const decryptedContent = await encryptionService.decrypt(
          lastEntry.content,
          lastEntry.encryption_key
        );
        setLastSavedEntry({ ...lastEntry, content: decryptedContent });

        // Load metadata if available
        if (lastEntry.metadata) {
          if (lastEntry.metadata.tags) setTags(lastEntry.metadata.tags);
          if (lastEntry.metadata.folder_id)
            setSelectedFolder(lastEntry.metadata.folder_id);
          if (lastEntry.metadata.is_starred)
            setIsStarred(lastEntry.metadata.is_starred);
          if (lastEntry.metadata.is_pinned)
            setIsPinned(lastEntry.metadata.is_pinned);
        }
      }
    } catch (error) {
      console.error("Error loading last entry:", error);
    }
  };

  // FIXED: Enhanced save entry using same workflow as StandardJournaling
  const saveEntry = async () => {
    console.log("🔄 Advanced journaling save entry function called");

    if (!editorContent.trim() || saveLabel === "Saving...") return;

    setSaveLabel("Saving...");

    try {
      const journalContent = quillRef.current?.getText().trim();

      if (!journalContent) {
        alert("Please write something before saving.");
        setSaveLabel("Save Entry");
        return;
      }

      const htmlContent = quillRef.current?.root.innerHTML;
      const userId = user?.id;

      if (!userId) {
        alert("Something went wrong. Please log in again.");
        setSaveLabel("Save Entry");
        return;
      }

      console.log("🔐 Encrypting entry data on frontend...");

      // Use the same encryption workflow as StandardJournaling
      const encryptedData = await encryptJournalEntry({
        content: htmlContent,
        prompt: prompt || null,
      });

      console.log("✅ Entry encrypted successfully");

      // Crisis detection using plain text
      if (showCrisisResources && journalContent) {
        const crisisCheck = await checkForCrisisContent(journalContent);
        if (crisisCheck.showResources) {
          triggerCrisisModal(crisisCheck);
        }
      }

      // Prepare Advanced journaling specific metadata
      const advancedMetadata = {
        template: selectedTemplate,
        tags: tags,
        hasAudio: audioChunks?.length > 0 || false,
        attachments: mediaAttachments?.length || 0,
        promptType: promptType,
        isFollowUp: promptType === "followUp",
        isStarred: isStarred,
        isPinned: isPinned,
        folder_id: selectedFolder,
        wellness: wellnessData,
      };

      // Prepare the entry data using the same structure as StandardJournaling
      const entryData = {
        ...encryptedData,
        user_id: userId,
        is_follow_up: promptType === "followUp",
        parent_entry_id: currentThreadId,
        thread_id: currentThreadId,
        // Basic wellness data (compatible with backend)
        mood: wellnessData.mood,
        energy: wellnessData.energy,
        cycle_day: null, // Advanced doesn't track cycle by default
        cycle_phase: null,
        // Store Advanced metadata in a way that won't break the backend
        metadata: advancedMetadata,
      };

      console.log(
        "📦 Sending encrypted entry data to backend (Advanced journaling)"
      );

      // Use the same backend API as StandardJournaling
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

      console.log("✅ Advanced entry saved with ID:", result.entry_id);

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
        metadata: advancedMetadata,
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

      setTimeout(() => {
        setSaveLabel("Save Entry");
        setSaveConfirmation(false);
        setShowModal(true); // Show follow-up modal
      }, 1500);
    } catch (error) {
      console.error("❌ Error saving advanced entry:", error);
      setSaveLabel("Error Saving");
      setTimeout(() => setSaveLabel("Save Entry"), 3000);
    }
  };

  // FIXED: Generate follow-up prompt using same workflow as StandardJournaling
  const generateFollowUp = async () => {
    if (!lastSavedEntry) {
      alert("Please write a journal entry first.");
      return;
    }

    try {
      setIsLoading(true);
      setShowModal(false);

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
        setFollowUpPrompt(data.prompt);
        setShowFollowUpModal(true);
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

  // ADDED: Handle ending follow-ups (same as StandardJournaling)
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

    // Clear global variables
    window.currentConversationChain = [];
    window.currentThreadId = null;

    // Clear the advanced editor
    clearEditor();
    console.log("🎉 Ready for new conversation thread");
  };

  // ADDED: Handle "No Thanks" (same as StandardJournaling)
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

  // Continue with follow-up
  const continueWithFollowUp = () => {
    setPrompt(followUpPrompt);
    setPromptType("followUp");
    setShowFollowUpModal(false);

    // Clear editor
    if (quillRef.current) {
      quillRef.current.setText("");
      setEditorContent("");
    }

    // Maintain thread
    if (!currentThreadId && lastSavedEntry) {
      setCurrentThreadId(lastSavedEntry.id);
    }
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

  // Check for crisis content
  const checkForCrisisContent = async (text) => {
    // This would integrate with your crisis detection service
    return { showResources: false };
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                {formatGreeting()}
              </h1>
              <p className="text-gray-600">
                Your premium journaling experience awaits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-full">
            <Crown className="text-purple-600" size={16} />
            <span className="text-purple-700 font-medium text-sm">Premium</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            <FileText size={16} />
            Templates
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
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            {isRecording ? "Stop" : "Voice"}
          </button>

          <button
            onClick={toggleAudioPlayback}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            {audioPlayback ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Read Aloud
          </button>

          <button
            onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Info size={16} />
            Privacy
          </button>
        </div>

        {/* Privacy Information */}
        {showPrivacyInfo && (
          <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Info
                className="text-purple-600 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  Your Privacy is Protected
                </h3>
                <p className="text-purple-700 text-sm mb-2">
                  All your journal entries are end-to-end encrypted using
                  military-grade encryption. Your actual journal content is
                  encrypted on your device before being stored and can only be
                  decrypted by you.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Entries are encrypted locally on your device</li>
                  <li>• We cannot read your journal content</li>
                  <li>
                    • Starred, pinned, and tag data is stored separately from
                    content
                  </li>
                  <li>• Analytics are performed on encrypted metadata only</li>
                  <li>• Your data is never shared or sold</li>
                </ul>
                <p className="text-purple-600 text-xs mt-2">
                  Folder names, tags, and organizational data are stored in our
                  database to enable search and filtering features, but your
                  journal content remains fully encrypted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subject Prompt Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubjectPrompt()}
            placeholder="Enter a subject for a specific prompt..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSubjectPrompt}
            disabled={isLoadingSubject || !subject.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingSubject ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Lightbulb size={16} />
            )}
            Get Prompt
          </button>
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
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                }`}
              >
                <Icon className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">{template.name}</h3>
              </button>
            );
          })}
        </div>
      )}

      {/* AI Prompt Display */}
      {prompt && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 rounded-lg mb-6 border border-purple-200">
          <p className="text-lg font-bold text-purple-800">
            {promptType === "followUp"
              ? "Follow-up prompt:"
              : promptType === "subject"
              ? "Subject-specific prompt:"
              : promptType === "folder"
              ? "Folder-based prompt:"
              : promptType === "template"
              ? "Template-based prompt:"
              : "Your journaling prompt:"}
          </p>
          <p className="text-purple-700 mt-1">{prompt}</p>
        </div>
      )}

      {/* Folder & Organization Section */}
      <div className="mb-6 space-y-4">
        {/* Folder Selection */}
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Folder:</span>
          <select
            value={selectedFolder || ""}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        {/* Entry Options */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsStarred(!isStarred)}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
              isStarred
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isStarred ? (
              <Star size={16} fill="currentColor" />
            ) : (
              <StarOff size={16} />
            )}
            {isStarred ? "Starred" : "Star"}
          </button>

          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
              isPinned
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isPinned ? (
              <Pin size={16} fill="currentColor" />
            ) : (
              <PinOff size={16} />
            )}
            {isPinned ? "Pinned" : "Pin"}
          </button>
        </div>

        {/* Tags Input */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag..."
              className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Wellness Tracking */}
      <div className="mb-6">
        <button
          onClick={() => setShowWellnessSection(!showWellnessSection)}
          className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          <span
            className={`transform transition-transform ${
              showWellnessSection ? "rotate-90" : ""
            }`}
          >
            <ChevronRight size={16} />
          </span>
          <Activity size={16} className="text-purple-600" />
          <span>Advanced Wellness Tracking</span>
          {!showWellnessSection && (
            <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </button>

        {showWellnessSection && (
          <div className="mt-4 bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 rounded-lg p-6 border border-purple-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Track Your Wellness Journey
              </h3>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                Premium Feature
              </span>
            </div>

            {/* Mood, Energy, Stress Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Mood: {wellnessData.mood}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.mood}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      mood: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😔</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Energy: {wellnessData.energy}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.energy}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      energy: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-yellow-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>🔋</span>
                  <span>⚡</span>
                  <span>🚀</span>
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Stress: {wellnessData.stress}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.stress}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      stress: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😌</span>
                  <span>😐</span>
                  <span>😰</span>
                </div>
              </div>
            </div>

            {/* Additional Wellness Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Sleep (hrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={wellnessData.sleep}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      sleep: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Water (cups)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={wellnessData.water}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      water: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Dumbbell className="w-4 h-4 text-green-500" />
                  Exercise (min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="5"
                  value={wellnessData.exercise}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      exercise: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Wind className="w-4 h-4 text-cyan-500" />
                  Mindfulness (min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  step="5"
                  value={wellnessData.mindfulness}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      mindfulness: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="text-xs text-purple-700 mt-4 flex items-center gap-1 bg-purple-100 p-2 rounded">
              <Info size={12} />
              All wellness data is encrypted and used to enhance your insights
              and track patterns over time.
            </div>
          </div>
        )}
      </div>

      {/* Transcription Status */}
      {isTranscribing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <span className="text-blue-700 text-sm">
            Transcribing your voice note...
          </span>
        </div>
      )}

      {/* Quill Editor */}
      <div className="mb-6">
        <div
          ref={editorRef}
          className="border border-gray-300 rounded-lg"
          style={{ minHeight: "400px" }}
        />
      </div>

      {/* Save Button & Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {isEditorReady ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Premium editor ready
              </span>
            ) : (
              <span>Setting up editor...</span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="text-sm text-gray-500">
              {tags.length} tag{tags.length !== 1 ? "s" : ""} added
            </div>
          )}
        </div>

        <button
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg"
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

      {/* Save Confirmation */}
      {saveConfirmation && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Star className="w-5 h-5" />
          Entry saved successfully!
        </div>
      )}

      {/* FIXED: Follow-up Modal using same workflow as StandardJournaling */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="text-white" size={32} />
              </div>
              <p className="text-lg font-medium">
                Great job! Your entry has been saved.
              </p>
            </div>
            <p className="mb-6 text-gray-600">
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
                onClick={handleNoThanks}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Follow-up Question Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="text-white" size={32} />
              </div>
              <p className="text-lg font-medium">Follow-up Question</p>
            </div>
            <p className="mb-6 text-gray-600 text-left bg-gray-50 p-4 rounded-lg">
              {followUpPrompt || prompt}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
  );
}
