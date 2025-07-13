// frontend/src/pages/PremiumJournaling.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import FollowUpModal from "../components/FollowUpModal";
import {
  Save,
  RefreshCw,
  ChevronRight,
  Sparkles,
  FileText,
  Mic,
  MicOff,
  Volume2,
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
  Plus,
  Square,
  Loader2,
} from "lucide-react";

export default function PremiumJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();

  // API Base URL
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

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

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showFormatButton, setShowFormatButton] = useState(false);
  const recognitionRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const interimTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const rawTranscriptRef = useRef("");

  // TTS (Text-to-Speech) state
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Premium features state
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [folderLoading, setFolderLoading] = useState(false);
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
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Reflectionarian prompts state
  const [reflectionarianPrompts, setReflectionarianPrompts] = useState([]);
  const [showReflectionarianDropdown, setShowReflectionarianDropdown] =
    useState(false);

  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const stylesInjected = useRef(false);

  // Custom styles for Quill dark theme integration
  const quillStyles = `
    .ql-editor {
      color: white !important;
      font-size: 16px;
      line-height: 1.6;
      min-height: 350px;
    }

    .ql-editor.ql-blank::before {
      color: rgba(255, 255, 255, 0.6) !important;
      font-style: italic;
    }

    .ql-toolbar {
      background: rgba(255, 255, 255, 0.1) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .ql-toolbar .ql-stroke {
      stroke: rgba(255, 255, 255, 0.8) !important;
    }

    .ql-toolbar .ql-fill {
      fill: rgba(255, 255, 255, 0.8) !important;
    }

    .ql-toolbar button:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }

    .ql-toolbar button.ql-active {
      background: rgba(147, 51, 234, 0.3) !important;
    }

    .ql-container {
      border: none !important;
      font-family: inherit;
      background: rgba(255, 255, 255, 0.05);
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .ql-picker {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .ql-picker-options {
      background: rgba(30, 41, 59, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    .ql-picker-item:hover {
      background: rgba(147, 51, 234, 0.2) !important;
    }
  `;

  // Remove the old formatTranscript function
  // Inject custom styles once
  useEffect(() => {
    if (!stylesInjected.current) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = quillStyles;
      document.head.appendChild(styleSheet);
      stylesInjected.current = true;

      return () => {
        // Clean up styles on unmount
        if (styleSheet.parentNode) {
          styleSheet.parentNode.removeChild(styleSheet);
        }
      };
    }
  }, []);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  // Redirect if locked
  useEffect(() => {
    if (isLocked) {
      navigate("/dashboard");
    }
  }, [isLocked, navigate]);

  // Load premium data
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

  // Initialize Quill editor
  useEffect(() => {
    const initializeEditor = () => {
      if (isLocked || !editorRef.current || quillRef.current) return;

      try {
        const toolbarOptions = [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ color: [] }, { background: [] }],
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
          // Handle content changes if needed
        });

        quillRef.current = quill;

        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.focus();
          }
        }, 200);

        console.log("✅ Quill editor initialized once");
      } catch (error) {
        console.error("❌ Error initializing Quill editor:", error);
      }
    };

    const timer = setTimeout(initializeEditor, 150);

    return () => {
      clearTimeout(timer);
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [isLocked]); // ONLY depend on isLocked, not prompt

  // Separate effect to update placeholder when prompt changes
  useEffect(() => {
    if (quillRef.current && prompt) {
      // Clear content and update placeholder
      quillRef.current.setText("");
      quillRef.current.root.setAttribute("data-placeholder", prompt);
      // Force a re-render of the placeholder
      quillRef.current.blur();
      setTimeout(() => {
        if (quillRef.current) {
          quillRef.current.focus();
        }
      }, 50);
      console.log("📝 Updated placeholder to:", prompt);
    }
  }, [prompt]); // Only update placeholder, don't reinitialize

  // Voice recording functions
  const initializeRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      interimTranscriptRef.current = "";
      finalTranscriptRef.current = "";
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      interimTranscriptRef.current = interimTranscript;
      finalTranscriptRef.current += finalTranscript;

      // Store raw transcript for AI formatting
      rawTranscriptRef.current =
        finalTranscriptRef.current + interimTranscriptRef.current;

      // Update Quill editor with the raw transcript (real-time feedback)
      if (quillRef.current) {
        const currentContent =
          finalTranscriptRef.current + interimTranscriptRef.current;
        quillRef.current.setText(currentContent);
        // Move cursor to end
        const length = quillRef.current.getLength();
        quillRef.current.setSelection(length - 1);
      }
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        // Continue recording even if no speech detected
        return;
      }
      stopRecording();
      alert(`Voice recording error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");
      // Restart if still recording
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Failed to restart recognition:", error);
        }
      }
    };

    return recognition;
  };

  const startRecording = () => {
    if (!voiceSupported) {
      alert(
        "Voice recording is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    // Request microphone permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        const recognition = initializeRecognition();
        if (!recognition) return;

        recognitionRef.current = recognition;
        setIsRecording(true);
        setRecordingTime(0);
        setShowVoiceModal(true);

        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to start recognition:", error);
          alert("Failed to start voice recording. Please try again.");
          return;
        }

        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      })
      .catch((error) => {
        console.error("Microphone permission denied:", error);
        alert(
          "Microphone access is required for voice recording. Please allow microphone access and try again."
        );
      });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
    setShowVoiceModal(false);
    setRecordingTime(0);

    // Show format button if we have content
    if (rawTranscriptRef.current.trim().length > 20) {
      setShowFormatButton(true);
    }
  };

  const formatWithAI = async () => {
    if (
      !rawTranscriptRef.current ||
      rawTranscriptRef.current.trim().length < 10
    ) {
      return;
    }

    setIsFormatting(true);
    setShowFormatButton(false);

    try {
      const response = await fetch(`${API_BASE}/api/format-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken") || localStorage.getItem("token")
          }`,
        },
        body: JSON.stringify({
          transcript: rawTranscriptRef.current.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format transcript");
      }

      const data = await response.json();

      if (data.formattedText && quillRef.current) {
        // Replace the content with formatted version
        quillRef.current.setText(data.formattedText);

        // Move cursor to end
        const length = quillRef.current.getLength();
        quillRef.current.setSelection(length - 1);

        // Clear the raw transcript reference
        rawTranscriptRef.current = "";

        // Show success briefly
        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error("Format error:", error);
      // Keep the original text if formatting fails
      alert("Unable to format with AI. You can continue editing manually.");
    } finally {
      setIsFormatting(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // TTS functions
  const generateAudio = async () => {
    if (!lastSavedEntry) {
      alert("Please save an entry first before generating audio.");
      return;
    }

    setTtsLoading(true);
    try {
      // First, prepare the text
      const prepareResponse = await fetch(`${API_BASE}/api/tts/prepare-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken") || localStorage.getItem("token")
          }`,
        },
        body: JSON.stringify({
          entryId: lastSavedEntry.id,
          userId: user.id, // Pass userId in body since we're not decoding JWT
        }),
      });

      if (!prepareResponse.ok) {
        throw new Error("Failed to prepare text");
      }

      const { text } = await prepareResponse.json();

      // Then generate the audio
      const audioResponse = await fetch(`${API_BASE}/api/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken") || localStorage.getItem("token")
          }`,
        },
        body: JSON.stringify({
          text: text,
          voice: "nova", // You can make this configurable
          model: "tts-1",
        }),
      });

      if (!audioResponse.ok) {
        throw new Error("Failed to generate audio");
      }

      // Create blob URL for audio playback
      const audioBlob = await audioResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("TTS error:", error);
      alert("Failed to generate audio. Please try again.");
    } finally {
      setTtsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const loadFolders = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/folders?user_id=${user.id}&include_entry_count=true`
      );

      if (!response.ok) {
        console.error("Failed to load folders:", response.status);
        return;
      }

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
      setFolders([]);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/goals?user_id=${user.id}`);

      if (!response.ok) {
        console.error("Failed to load goals:", response.status);
        return;
      }

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
      setUserGoals([]);
    }
  };

  const loadReflectionarianPrompts = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian-prompts?user_id=${user.id}`
      );

      if (!response.ok) {
        console.error(
          "Failed to load Reflectionarian prompts:",
          response.status
        );
        return;
      }

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
      setReflectionarianPrompts([]);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return;

    setFolderLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          name: newFolderName.trim(),
          description: newFolderDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create folder");
      }

      const data = await response.json();

      // Refresh folders list
      await loadFolders();

      // Select the newly created folder
      if (data.folder) {
        setSelectedFolder(data.folder.id);
      }

      // Reset form and close modal
      setNewFolderName("");
      setNewFolderDescription("");
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(error.message || "Failed to create folder");
    } finally {
      setFolderLoading(false);
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
      const response = await fetch(`${API_BASE}/api/reflectionarian-prompts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_id: promptId,
          user_id: user.id,
          status: "completed",
        }),
      });

      if (response.ok) {
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
        `${API_BASE}/api/reflectionarian-prompts?prompt_id=${promptId}&user_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
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
      const response = await fetch(`${API_BASE}/api/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
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
      const response = await fetch(`${API_BASE}/api/generate-subject-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          subject: subject,
        }),
      });

      if (!response.ok) {
        const fallbackPrompt = `Take a moment to explore your thoughts and feelings about ${subject}. What comes up for you when you think about this?`;
        setPrompt(fallbackPrompt);
        return;
      }

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (error) {
      console.error("Error generating subject prompt:", error);
      const fallbackPrompt = `What role does ${subject.toLowerCase()} play in your life right now? How has your relationship with it evolved?`;
      setPrompt(fallbackPrompt);
    } finally {
      setLoadingPrompt(false);
      setSubjectPrompt("");
    }
  };

  const generateGuidedQuestions = async (topic) => {
    setLoadingPrompt(true);
    try {
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
    console.log("🔍 DEBUG: Save function called");
    console.log("🔍 DEBUG: user object:", user);
    console.log("🔍 DEBUG: user.id:", user?.id);
    console.log("🔍 DEBUG: quillRef.current:", !!quillRef.current);

    if (!quillRef.current || !user) {
      console.error("❌ Missing quillRef or user:", {
        quillRef: !!quillRef.current,
        user: !!user,
      });
      alert("Unable to save. Please try again.");
      return;
    }

    if (!user.id) {
      console.error("❌ User object exists but no user.id:", user);
      alert("User ID not found. Please refresh and try again.");
      return;
    }

    const htmlContent = quillRef.current.root.innerHTML;
    const plainText = quillRef.current.getText().trim();

    console.log("🔍 DEBUG: Content length:", plainText.length);

    if (!plainText || plainText.length < 10) {
      alert("Please write a bit more before saving.");
      return;
    }

    setSaveLabel("Saving...");

    try {
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

      const requestBody = {
        user_id: user.id,
        content: htmlContent,
        title: `Entry from ${new Date().toLocaleDateString()}`,
        prompt: prompt || null,
        is_follow_up: !!entryChain.length, // True if this is a follow-up
        parent_entry_id: entryChain.length > 0 ? entryChain[0] : null, // First entry in chain
        thread_id: currentThreadId,
        prompt_used: prompt ? "AI-generated" : "user-initiated",
        folder_id: selectedFolder,
        starred: isStarred,
        pinned: isPinned,
        tags: tags,
        goal_ids: connectedGoals,
        metadata: metadata,
      };

      console.log("🚀 Attempting to save entry...");
      console.log("🔍 API_BASE value:", API_BASE);
      console.log("🔍 Full URL will be:", `${API_BASE}/api/save-entry`);
      console.log("🔍 Request body:", requestBody);
      console.log("🔍 User ID being sent:", requestBody.user_id);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/save-entry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📡 Response status:", response.status, response.statusText);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error("📡 Error data:", errorData);
          } catch (e) {
            console.error("📡 Failed to parse error JSON:", e);
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("📡 Error text:", errorText);
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (e) {
            console.error("📡 Failed to get error text:", e);
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.crisis_analysis && result.crisis_analysis.should_alert) {
        await triggerCrisisModal(plainText, result.crisis_analysis);
      }

      // Set the saved entry and show follow-up modal
      setLastSavedEntry(result.entry);
      setSaveLabel("Save Entry");

      // Show the follow-up modal instead of clearing immediately
      setShowFollowUpModal(true);

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
      const response = await fetch(`${API_BASE}/api/generate-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          parent_entry_id: lastSavedEntry.id,
          thread_id: currentThreadId || lastSavedEntry.id,
        }),
      });

      if (!response.ok) {
        const fallbackFollowUp =
          "Let's dive deeper into what you just wrote. What else comes up for you when you sit with these thoughts?";
        setPrompt(fallbackFollowUp);

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
      const fallbackFollowUp =
        "What would you like to explore further about what you just shared?";
      setPrompt(fallbackFollowUp);

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

  const handleFollowUpYes = async () => {
    if (!lastSavedEntry) return;

    setFollowUpLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          parent_entry_id: lastSavedEntry.id,
          thread_id: currentThreadId || lastSavedEntry.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate follow-up");
      }

      const data = await response.json();

      // Set the follow-up prompt and close modal
      setPrompt(data.prompt);
      setShowFollowUpModal(false);

      // Clear the editor and set the new prompt
      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.root.setAttribute("data-placeholder", data.prompt);
        setTimeout(() => quillRef.current.focus(), 100);
      }

      // Set up for follow-up entry
      setEntryChain((prev) => (prev.length === 0 ? [lastSavedEntry.id] : prev));
      if (!currentThreadId) {
        setCurrentThreadId(lastSavedEntry.id);
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      // Use fallback prompt
      const fallbackPrompt =
        "What else comes up for you when you sit with these thoughts?";
      setPrompt(fallbackPrompt);
      setShowFollowUpModal(false);

      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.root.setAttribute("data-placeholder", fallbackPrompt);
        setTimeout(() => quillRef.current.focus(), 100);
      }
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleFollowUpNo = () => {
    setShowFollowUpModal(false);

    // Clear the form completely - both content AND placeholder
    if (quillRef.current) {
      quillRef.current.setText("");
      // Clear the placeholder back to default
      quillRef.current.root.setAttribute(
        "data-placeholder",
        "Start writing your thoughts..."
      );
    }

    // Clear the prompt state (this removes the prompt display below buttons)
    setPrompt("");

    // Reset premium features
    setTags([]);
    setIsStarred(false);
    setIsPinned(false);
    setConnectedGoals([]);
    setWritingMode("free");
    setGuidedQuestions([]);
    setCurrentQuestionIndex(0);

    // Reset follow-up state
    setLastSavedEntry(null);
    setShowFollowUpButtons(false);
    setCurrentThreadId(null);
    setEntryChain([]);
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

  // Voice Recording Modal
  const VoiceRecordingModal = () => {
    if (!showVoiceModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-white/20 rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-red-500 p-6 rounded-full">
                <Mic className="h-8 w-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-2">
              Recording...
            </h3>
            <p className="text-4xl font-mono text-red-400 mb-4">
              {formatRecordingTime(recordingTime)}
            </p>

            <p className="text-gray-400 mb-6">
              Speak clearly and naturally. Your words will appear in the editor
              as you speak.
            </p>

            <button
              onClick={stopRecording}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
            >
              <Square className="h-5 w-5" />
              Stop Recording
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create Folder Modal Component
  const CreateFolderModal = () => {
    if (!showCreateFolderModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowCreateFolderModal(false);
          setNewFolderName("");
          setNewFolderDescription("");
        }}
      >
        <div
          className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Create New Folder
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="What will you store in this folder?"
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowCreateFolderModal(false);
                setNewFolderName("");
                setNewFolderDescription("");
              }}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={createFolder}
              disabled={!newFolderName.trim() || folderLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {folderLoading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Premium Journaling
        </h1>

        <div className="space-y-6">
          {/* Compact prompt section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold mb-3">
              How would you like to start?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Reflectionarian Prompts Dropdown */}
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

              {/* Generate Subject Prompt */}
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

          {/* Premium Features Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {/* Voice Note */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Voice Note
                </label>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!voiceSupported}
                  className={`w-full px-2 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : voiceSupported
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  title={
                    voiceSupported
                      ? isRecording
                        ? "Stop recording"
                        : "Start recording"
                      : "Voice recording not supported"
                  }
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span className="text-xs">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span className="text-xs">Record</span>
                    </>
                  )}
                </button>
              </div>

              {/* Folder Selection */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-1">
                  Folder
                </label>
                <select
                  value={selectedFolder || ""}
                  onChange={(e) => {
                    if (e.target.value === "create-new") {
                      setShowCreateFolderModal(true);
                    } else {
                      setSelectedFolder(e.target.value || null);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 text-sm appearance-none cursor-pointer"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} ({folder.entry_count || 0})
                    </option>
                  ))}
                  <option
                    value="create-new"
                    className="font-semibold text-purple-300"
                  >
                    + Create New Folder
                  </option>
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

              {/* Connect to Goals */}
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

          {/* Fixed Editor Container */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div ref={editorRef} style={{ minHeight: "400px" }} />
          </div>

          {/* AI Format Button - shows after voice recording */}
          {showFormatButton && (
            <div className="bg-purple-600/20 backdrop-blur-sm rounded-lg border border-purple-400/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 font-medium mb-1">
                    Voice recording complete!
                  </p>
                  <p className="text-sm text-purple-200">
                    Would you like AI to add punctuation and formatting?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFormatButton(false)}
                    className="px-4 py-2 text-purple-300 hover:text-white transition"
                  >
                    Keep as is
                  </button>
                  <button
                    onClick={formatWithAI}
                    disabled={isFormatting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isFormatting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Formatting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Format with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

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

            {/* TTS Button - only show after saving */}
            {lastSavedEntry && (
              <button
                onClick={generateAudio}
                disabled={ttsLoading}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                title="Listen to your entry"
              >
                {ttsLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Volume2 className="h-5 w-5" />
                    <span>Playing</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Audio Player (hidden but functional) */}
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />

          {/* Save Confirmation */}
          {saveConfirmation && (
            <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200">
              Entry saved successfully!
            </div>
          )}
        </div>
      </div>

      {/* Voice Recording Modal */}
      <VoiceRecordingModal />

      {/* Create Folder Modal */}
      <CreateFolderModal />

      {/* Crisis Resource Modal */}
      {showCrisisModal && (
        <CrisisResourceModal
          isOpen={showCrisisModal}
          onClose={closeCrisisModal}
          analysisResult={crisisAnalysisResult}
          showResources={showCrisisResources}
        />
      )}

      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        onYes={handleFollowUpYes}
        onNo={handleFollowUpNo}
        loading={followUpLoading}
      />
    </div>
  );
}
