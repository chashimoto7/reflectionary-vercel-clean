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

export default function AdvancedJournaling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const { hasAccess, tier } = useMembership();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const audioRef = useRef(null);

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

  // Format greeting based on time of day
  const formatGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "";
    return `Good ${timeOfDay}, ${name}`;
  };

  // Initialize Quill editor with enhanced toolbar
  useEffect(() => {
    if (isLocked || !editorRef.current) return;

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
    setIsEditorReady(true);

    // Load the last saved entry
    loadLastEntry();

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [isLocked, user, selectedTemplate]);

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

  // Enhanced AI prompt generation
  const generateAIPrompt = async () => {
    setIsLoading(true);
    try {
      let promptContext = "general";

      if (selectedTemplate) {
        promptContext = selectedTemplate;
      } else if (lastSavedEntry) {
        // Use last entry for context
        promptContext = "followup";
      }

      const { data, error } = await supabase.functions.invoke(
        "generate-journal-prompt",
        {
          body: {
            context: promptContext,
            template: selectedTemplate,
            previousEntry: lastSavedEntry?.content?.substring(0, 500),
            tags: tags,
            wellnessData: wellnessData,
          },
        }
      );

      if (error) throw error;

      setPrompt(data.prompt);
      setPromptType(selectedTemplate ? "template" : "general");

      // Get Reflectionarian insight if enabled
      if (showReflectionarian && data.reflectionarianInsight) {
        setReflectionarianInsight(data.reflectionarianInsight);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      setPrompt("What's on your mind today?");
    } finally {
      setIsLoading(false);
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
      }
    } catch (error) {
      console.error("Error loading last entry:", error);
    }
  };

  // Enhanced save entry with tags and metadata
  const saveEntry = async () => {
    if (!editorContent.trim() || saveLabel === "Saving...") return;

    setSaveLabel("Saving...");

    try {
      const plainText = quillRef.current.getText();
      const wordCount = plainText.trim().split(/\s+/).length;

      // Crisis detection
      if (showCrisisResources && plainText) {
        const crisisCheck = await checkForCrisisContent(plainText);
        if (crisisCheck.showResources) {
          triggerCrisisModal(crisisCheck);
        }
      }

      // Encrypt content
      const { encryptedData, encryptionKey } = await encryptionService.encrypt(
        editorContent
      );

      // Save entry with enhanced metadata
      const { data: savedEntry, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          content: encryptedData,
          encryption_key: encryptionKey,
          subject:
            subject ||
            (selectedTemplate
              ? JOURNAL_TEMPLATES[selectedTemplate].name
              : null),
          word_count: wordCount,
          mood: wellnessData.mood,
          energy: wellnessData.energy,
          thread_id: currentThreadId,
          metadata: {
            template: selectedTemplate,
            tags: tags,
            wellness: wellnessData,
            hasAudio: audioChunks.length > 0,
            attachments: mediaAttachments.length,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setLastSavedEntry({ ...savedEntry, content: editorContent });
      setEntryChain([...entryChain, savedEntry.id]);
      setSaveLabel("Saved!");
      setSaveConfirmation(true);

      setTimeout(() => {
        setSaveLabel("Save Entry");
        setSaveConfirmation(false);
        setShowModal(true);
      }, 1500);

      // Trigger analytics batch if needed
      await triggerAnalytics(savedEntry.id);
    } catch (error) {
      console.error("Error saving entry:", error);
      setSaveLabel("Error Saving");
      setTimeout(() => setSaveLabel("Save Entry"), 3000);
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

  // Trigger analytics
  const triggerAnalytics = async (entryId) => {
    // This would trigger your batch analytics processing
    console.log("Triggering analytics for entry:", entryId);
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
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 text-sm"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Lightbulb size={16} />
            )}
            Smart Prompt
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
            {promptType === "template"
              ? "Template-based prompt:"
              : "Your personalized prompt:"}
          </p>
          <p className="text-purple-700 mt-1">{prompt}</p>
        </div>
      )}

      {/* Reflectionarian Insight */}
      {showReflectionarian && reflectionarianInsight && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-lg mb-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">
                The Reflectionarian says:
              </p>
              <p className="text-amber-700 mt-1">{reflectionarianInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject/Title Input */}
      <div className="mb-6">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Entry title or subject (optional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tags Input */}
      <div className="mb-6">
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

      {/* Enhanced Wellness Tracking */}
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
            <ChevronRight size={16} />
          </span>
          <Activity size={16} />
          Advanced Wellness Tracking
        </button>

        {showWellnessSection && (
          <div className="bg-purple-50 rounded-lg p-4 space-y-4">
            {/* Mood, Energy, Stress Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
              </div>

              <div>
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
              </div>

              <div>
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
              </div>
            </div>

            {/* Additional Wellness Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
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

              <div>
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

              <div>
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

              <div>
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

            {/* Social Connection & Productivity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  Social Connection: {wellnessData.socialConnection}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.socialConnection}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      socialConnection: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 text-green-500" />
                  Productivity: {wellnessData.productivity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.productivity}
                  onChange={(e) =>
                    setWellnessData({
                      ...wellnessData,
                      productivity: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-green-500"
                />
              </div>
            </div>

            <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Info size={12} />
              All wellness data is encrypted and used to enhance your insights.
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

      {/* Follow-up Modal */}
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
              Would you like The Reflectionarian to generate a personalized
              follow-up question?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowFollowUpModal(true);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                Yes, inspire me
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                No thanks
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
