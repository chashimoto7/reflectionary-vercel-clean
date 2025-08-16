// src/pages/PremiumReflectionarian.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Settings,
  AlertTriangle,
  Brain,
  Heart,
  Lightbulb,
  Target,
  ChevronRight,
  Sparkles,
  BookOpen,
  Save,
  RefreshCw,
  Send,
  Loader2,
  Shield,
  CheckCircle,
  PlusCircle,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  Mic,
  Volume2,
  VolumeX,
  Info,
  Crown,
  X,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";

// Import services
import chatService from "../services/reflectionarian/chatService";
import voiceService from "../services/reflectionarian/voiceService";
import preferencesService from "../services/reflectionarian/preferencesService";
import sessionService from "../services/reflectionarian/sessionService";

// Import components
import MoodTracker from "../components/reflectionarian/MoodTracker";
import SessionPromptsTab from "../components/reflectionarian/tabs/SessionPromptsTab";
import WeeklyReportTab from "../components/reflectionarian/tabs/WeeklyReportTab";
import GrowthTimelineTab from "../components/reflectionarian/tabs/GrowthTimelineTab";
import ExportSessionsTab from "../components/reflectionarian/tabs/ExportSessionsTab";
import SessionInsightsModal from "../components/reflectionarian/modals/SessionInsightsModal";
import OnboardingModal from "../components/reflectionarian/OnboardingModal";
import EndSessionModal from "../components/reflectionarian/modals/EndSessionModal";
import VoiceSettingsModal from "../components/reflectionarian/VoiceSettingsModal";
import SessionSummariesTab from "../components/reflectionarian/tabs/SessionSummariesTab";
import ReflectionaryIcon from "../assets/ReflectionaryIcon.svg";

const PremiumReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();

  // Onboarding & Preferences State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionType, setSessionType] = useState(null); // 'text' or 'voice'
  const [inputHeight, setInputHeight] = useState(48); // Track textarea height
  const textareaRef = useRef(null);

  // Session Management State
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionInsights, setSessionInsights] = useState(null);
  const [showSessionInsights, setShowSessionInsights] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wasStopped, setWasStopped] = useState(false);
  const interimTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const recordingIntervalRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [voiceError, setVoiceError] = useState(null);
  const [canInterrupt, setCanInterrupt] = useState(false);
  const [transcriptBackup, setTranscriptBackup] = useState("");
  const [lastSavedTranscript, setLastSavedTranscript] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showStartConversation, setShowStartConversation] = useState(false);

  // MoodTracker State
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [pendingSessionType, setPendingSessionType] = useState(null);
  const [currentMoodData, setCurrentMoodData] = useState(null);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Premium color scheme
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
  };

  // Pro Features Tabs
  const proTabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "prompts", label: "Session Prompts", icon: BookOpen },
    { id: "summaries", label: "Session Summaries", icon: Calendar },
    { id: "report", label: "Weekly Report", icon: FileText },
    { id: "timeline", label: "Growth Timeline", icon: TrendingUp },
    { id: "export", label: "Export Sessions", icon: Download },
  ];

  // Load preferences and sessions on mount
  useEffect(() => {
    if (user && hasAccess("premium_reflectionarian")) {
      loadPreferences();
      loadSessions();
    }
  }, [user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // No automatic TTS - user will manually start conversation

  // Auto-scroll textarea during voice recording
  useEffect(() => {
    if (isRecording && textareaRef.current && currentMessage.length > 0) {
      const textarea = textareaRef.current;

      // Scroll to end with smooth animation
      textarea.scrollTop = textarea.scrollHeight;

      // Also ensure we can see the cursor
      textarea.focus();
      textarea.setSelectionRange(currentMessage.length, currentMessage.length);
    }
  }, [currentMessage, isRecording]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-resize textarea and scroll to show latest text
  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setCurrentMessage(value);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to calculate new height
      textarea.style.height = "auto";

      // Calculate new height (min 48px, max 150px for voice input)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 150);
      setInputHeight(newHeight);
      textarea.style.height = `${newHeight}px`;

      // Auto-scroll to end for long text during STT
      if (isRecording && value.length > 50) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    try {
      console.log("🔍 Starting to load preferences for user:", user.id);
      const result = await preferencesService.loadPreferences(user.id);
      console.log("📥 Raw preference result:", result);
      
      if (result && result.preferences) {
        console.log("✅ Setting preferences:", result.preferences);
        setPreferences(result.preferences);
        console.log("✅ Voice preferences loaded:", {
          ttsVoice: result.preferences.ttsVoice,
          speechRate: result.preferences.speechRate
        });
        
        if (result.isNewUser) {
          setShowOnboarding(true);
        }
      } else {
        console.log("❌ No preferences found, using defaults");
        // Set default preferences so button works
        const defaultPrefs = {
          ttsVoice: "nova",
          speechRate: 1.0,
          enableSpeech: true
        };
        setPreferences(defaultPrefs);
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("❌ Error loading preferences:", error);
      // Set default preferences so button works even on error
      const defaultPrefs = {
        ttsVoice: "nova", 
        speechRate: 1.0,
        enableSpeech: true
      };
      setPreferences(defaultPrefs);
      setShowOnboarding(true);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/sessions?user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setSessionHistory(data.sessions || []);

        // Load active session if exists
        const activeSession = data.sessions?.find((s) => s.status === "active");
        if (activeSession) {
          setSessionId(activeSession.id);
          await loadSessionMessages(activeSession.id);
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  // Load messages for a session
  const loadSessionMessages = async (sessionId) => {
    try {
      const data = await chatService.loadSessionMessages({
        sessionId,
        userId: user.id,
      });

      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }

      if (data.session) {
        setSessionType(data.session.session_type || "text");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Start new session with mood tracking
  const startNewSession = async (type = "text") => {
    // Show mood tracker for both text and voice sessions
    setPendingSessionType(type);
    setShowMoodTracker(true);
  };

  // Handle mood submission and start session
  const handleMoodSubmit = async (moodData) => {
    setCurrentMoodData(moodData);
    setShowMoodTracker(false);
    await startSessionWithMood(pendingSessionType, moodData);
    setPendingSessionType(null);
  };

  // Handle mood skip and start session
  const handleMoodSkip = async () => {
    setShowMoodTracker(false);
    await startSessionWithMood(pendingSessionType, null);
    setPendingSessionType(null);
  };

  // Start session with mood data
  const startSessionWithMood = async (type = "text", moodData = null) => {
    setIsLoading(true);

    // Clear any previous TTS state
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);

    try {
      // Start the session on backend
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            session_type: type,
            preferences,
            mood_data: moodData, // Pass mood data to backend
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      setSessionId(data.session.id);
      setSessionType(type);

      // Create ONE welcome message (either custom or default, not both)
      let welcomeMessage;

      if (moodData) {
        // Create custom welcome message based on mood
        const moodLevel = moodData.mood_score;
        const energyLevel = moodData.energy_level;

        let moodContext = "";
        if (moodLevel <= 4) {
          moodContext = "I sense you might be having a challenging day. ";
        } else if (moodLevel >= 7) {
          moodContext = "I can sense you're feeling positive today. ";
        }

        if (energyLevel <= 4) {
          moodContext +=
            "Take your time - we can explore whatever feels right for you today.";
        } else if (energyLevel >= 7) {
          moodContext +=
            "Your energy feels good - let's make the most of this time together.";
        }

        const sessionTypeText =
          type === "voice"
            ? "I'm here to listen and support your reflection journey. Feel free to speak naturally about whatever is on your mind."
            : "I'm here to support your personal growth and self-reflection journey. What's on your mind today?";

        welcomeMessage = `Hello! I'm your AI reflection companion. ${moodContext} ${sessionTypeText}`;
      } else {
        // Use simple default welcome for both voice and text
        welcomeMessage =
          type === "voice"
            ? "Hello! I'm your AI reflection companion. Feel free to speak naturally about whatever is on your mind."
            : "Hello! I'm your AI reflection companion. What's on your mind today?";
      }

      if (type === "voice") {
        // For voice sessions, show "Start Conversation" screen instead of auto-playing
        setShowStartConversation(true);
        setMessages([]);
      } else {
        // For text sessions, show the welcome message immediately
        const welcomeMsg = sessionService.createMessage(
          "assistant",
          welcomeMessage
        );
        setMessages([welcomeMsg]);
      }

      await loadSessions();
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start conversation manually (for voice sessions)
  const startConversation = async () => {
    try {
      console.log("🎬 Starting conversation with preferences:", preferences);
      setShowStartConversation(false);
      setIsSpeaking(true);
      setVoiceError(null);

      // Create the welcome message that was prepared during session start
      let welcomeMessage;
      if (currentMoodData) {
        const moodLevel = currentMoodData.mood_score;
        const energyLevel = currentMoodData.energy_level;

        let moodContext = "";
        if (moodLevel <= 4) {
          moodContext = "I sense you might be having a challenging day. ";
        } else if (moodLevel >= 7) {
          moodContext = "I can sense you're feeling positive today. ";
        }

        if (energyLevel <= 4) {
          moodContext +=
            "Take your time - we can explore whatever feels right for you today.";
        } else if (energyLevel >= 7) {
          moodContext +=
            "Your energy feels good - let's make the most of this time together.";
        }

        welcomeMessage = `Hello! I'm your AI reflection companion. ${moodContext} I'm here to listen and support your reflection journey. Feel free to speak naturally about whatever is on your mind.`;
      } else {
        welcomeMessage = "Hello! I'm your AI reflection companion. Feel free to speak naturally about whatever is on your mind.";
      }

      const welcomeMsg = sessionService.createMessage("assistant", welcomeMessage);
      setMessages([welcomeMsg]);

      console.log("🎭 Manual conversation start - preferences:", preferences);
      console.log("🎭 preferences?.ttsVoice:", preferences?.ttsVoice);

      // Use streaming for longer messages
      console.log("🎤 About to call TTS with:", {
        text: welcomeMessage,
        voice: preferences?.ttsVoice || "alloy",
        userId: user.id,
        rate: preferences?.speechRate || 1.0,
        isLongMessage: welcomeMessage.length > 200
      });
      
      if (welcomeMessage.length > 200) {
        console.log("📱 Using streamTTS for long message");
        setIsStreaming(true);
        await voiceService.streamTTS(
          welcomeMessage,
          preferences?.ttsVoice || "alloy",
          user.id,
          0,
          preferences?.speechRate || 1.0
        );
      } else {
        console.log("🔊 Using speakText for short message");
        await voiceService.speakText(
          welcomeMessage,
          preferences?.ttsVoice || "alloy",
          user.id,
          preferences?.speechRate || 1.0
        );
      }
      console.log("✅ TTS call completed");

      // Set up completion listener
      const checkCompletion = setInterval(() => {
        if (!voiceService.isSpeaking()) {
          setIsSpeaking(false);
          setIsPaused(false);
          setIsStreaming(false);
          setStreamingProgress(0);
          setCanInterrupt(false);
          clearInterval(checkCompletion);
        } else {
          setCanInterrupt(true);
        }
      }, 100);
    } catch (error) {
      console.error("TTS error:", error);
      setVoiceError("Voice playback failed");
      setIsSpeaking(false);
      setIsPaused(false);
      setIsStreaming(false);
      setShowStartConversation(true); // Show start button again
    }
  };

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);

    // Add user message
    const userMsg = sessionService.createMessage("user", userMessage);
    setMessages((prev) => [...prev, userMsg]);

    // Show loading (except for first message)
    let loadingMsg = null;
    if (messages.length > 1) {
      loadingMsg = sessionService.createLoadingMessage();
      setMessages((prev) => [...prev, loadingMsg]);
    }

    try {
      // Check if this session has a parent for context
      const currentSession = sessionHistory.find((s) => s.id === sessionId);
      const parentContext = currentSession?.parent_session_id
        ? sessionHistory.find((s) => s.id === currentSession.parent_session_id)
        : null;

      const data = await chatService.sendMessage({
        message: userMessage,
        sessionId,
        userId: user.id,
        preferences,
        moodData: currentMoodData, // Include mood data in API call
        parentContext: parentContext
          ? {
              summary: parentContext.session_summary,
              themes: parentContext.key_themes,
              emotion: parentContext.dominant_emotion,
            }
          : null,
      });

      const assistantMsg = sessionService.createMessage(
        "assistant",
        data.response
      );

      // Update messages
      if (loadingMsg) {
        setMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat([assistantMsg])
        );
      } else {
        setMessages((prev) => [...prev, assistantMsg]);
      }

      // Auto-speak for voice sessions
      if (sessionType === "voice" || preferences?.enableSpeech) {
        try {
          setIsSpeaking(true);
          setVoiceError(null);
          setCanInterrupt(false);

          // Use streaming for longer responses
          if (data.response.length > 200 && data.response.includes(".")) {
            setIsStreaming(true);
            setStreamingProgress(0);

            // Start streaming with progress tracking
            const startTime = Date.now();
            await voiceService.streamTTS(
              data.response,
              preferences?.ttsVoice || "nova",
              user.id,
              0,
              preferences?.speechRate || 1.0
            );

            // Progress simulation (since we can't get real progress from TTS)
            const progressInterval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const estimatedDuration = data.response.length * 50; // ~50ms per character
              const progress = Math.min(
                (elapsed / estimatedDuration) * 100,
                95
              );
              setStreamingProgress(progress);

              if (progress >= 95 || !voiceService.isSpeaking()) {
                clearInterval(progressInterval);
                setStreamingProgress(100);
              }
            }, 100);
          } else {
            // Use regular TTS for short responses
            await voiceService.speakText(
              data.response,
              preferences?.ttsVoice || "nova",
              user.id,
              preferences?.speechRate || 1.0
            );
          }

          // Set up completion listener with interrupt capability
          setTimeout(() => setCanInterrupt(true), 2000); // Allow interrupt after 2 seconds

          const checkCompletion = setInterval(() => {
            if (!voiceService.isSpeaking()) {
              setIsSpeaking(false);
              setIsPaused(false);
              setIsStreaming(false);
              setStreamingProgress(0);
              setCanInterrupt(false);
              clearInterval(checkCompletion);
            }
          }, 100);
        } catch (error) {
          console.error("TTS error:", error);
          setVoiceError("Voice playback failed");
          setIsSpeaking(false);
          setIsPaused(false);
          setIsStreaming(false);
          setStreamingProgress(0);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove loading and show error
      const errorMsg = sessionService.createMessage(
        "assistant",
        "I apologize, but I'm having trouble connecting right now. Please try again."
      );

      if (loadingMsg) {
        setMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat([errorMsg])
        );
      } else {
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Enhanced Voice recording with interrpution detection
  const startRecording = async (preserveExisting = false) => {
    try {
      // If AI is speaking, stop it when user starts recording
      if (isSpeaking && canInterrupt) {
        stopSpeaking();
      }

      setVoiceError(null);
      
      // Store existing message if preserving
      const existingMessage = preserveExisting ? currentMessage : "";

      voiceService.initializeRecognition({
        onStart: () => {
          console.log("🎤 Voice recognition started");
          if (!preserveExisting) {
            setCurrentMessage("");
            setTranscriptBackup("");
          }
          setVoiceError(null);
        },
        onResult: (data) => {
          const newContent = data.final + (data.interim || "");
          const fullContent = existingMessage ? existingMessage + " " + newContent : newContent;
          setCurrentMessage(fullContent);

          // Backup transcript every few words
          if (
            data.final &&
            data.final.trim().length > lastSavedTranscript.length + 10
          ) {
            setTranscriptBackup(data.final);
            setLastSavedTranscript(data.final);
            console.log(
              "💾 Transcript backed up:",
              data.final.length,
              "characters"
            );
          }
        },
        onError: (event) => {
          console.error("🎤 Voice recognition error:", event.error);

          if (event.error === "network") {
            // Network error - try to recover transcript
            if (transcriptBackup || lastSavedTranscript) {
              const recoveredText = transcriptBackup || lastSavedTranscript;
              setCurrentMessage(recoveredText);
              setVoiceError(
                `Network error occurred. Recovered ${recoveredText.length} characters of your speech.`
              );
            } else {
              setVoiceError(
                "Network error occurred. Please try recording again."
              );
            }
            stopRecording();
          } else if (event.error !== "no-speech") {
            stopRecording();
            setVoiceError(`Recording error: ${event.error}`);
          }
        },
        onEnd: () => {
          console.log("🎤 Voice recognition ended");
          if (isRecording) {
            // Only restart if we're still in recording mode and no errors
            setTimeout(() => {
              if (isRecording && !voiceError) {
                voiceService.startRecording().catch(console.error);
              }
            }, 100);
          }
        },
      });

      await voiceService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("🎤 Failed to start recording:", error);
      setVoiceError(error.message);
    }
  };
  const stopRecording = () => {
    voiceService.stopRecording();

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  };

  // Enhanced TTS controls
  const pauseSpeaking = () => {
    if (voiceService.pauseSpeaking()) {
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (voiceService.resumeSpeaking()) {
      setIsPaused(false);
    }
  };

  const stopSpeaking = (preserveForResume = true) => {
    voiceService.stopSpeaking(preserveForResume);
    voiceService.stopStreaming(); // Also stop streaming
    setIsSpeaking(false);
    setIsPaused(false);
    setIsStreaming(false);
    setStreamingProgress(0);
    setCanInterrupt(false);
    setIsLoading(false);
    if (preserveForResume) {
      setWasStopped(true);
    }
  };
  
  const restartSpeaking = async () => {
    try {
      setIsSpeaking(true);
      setVoiceError(null);
      setIsStreaming(true);
      setWasStopped(false);
      
      await voiceService.restartSpeaking();
      
      // Set up completion listener
      const checkCompletion = setInterval(() => {
        if (!voiceService.isSpeaking()) {
          setIsSpeaking(false);
          setIsPaused(false);
          setIsStreaming(false);
          setStreamingProgress(0);
          setWasStopped(false);
          clearInterval(checkCompletion);
        }
      }, 100);
    } catch (error) {
      console.error("Restart TTS error:", error);
      setVoiceError("Failed to restart playback");
      setIsSpeaking(false);
      setIsStreaming(false);
      setWasStopped(false);
    }
  };

  // Add this new function for smart interruption
  const interruptAndRecord = async () => {
    if (isSpeaking) {
      stopSpeaking();
      // Small delay to ensure audio stops before starting recording
      setTimeout(() => {
        startRecording();
      }, 200);
    } else {
      startRecording();
    }
  };

  // End session
  const endSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      console.log("🔄 Starting endSession for:", sessionId);

      // Generate insights directly using your existing modal logic
      console.log("🧠 Calling SessionInsightsModal to generate insights...");

      // Simply show the insights modal - it will generate its own insights
      setShowSessionInsights(true);

      // Update session status in background
      await chatService.endSession({
        sessionId,
        userId: user.id,
        messages,
        generateInsights: false, // Don't duplicate insight generation
      });

      // Don't reset UI state here - wait for insights modal to close
      setShowEndSessionModal(false);

      await loadSessions();
    } catch (error) {
      console.error("❌ Error ending session:", error);
      // Still show insights modal even if backend fails
      setShowSessionInsights(true);
      
      setShowEndSessionModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Export session
  const handleExportSession = async (session, format) => {
    try {
      const blob = await chatService.exportSession({
        sessionId: session.id,
        userId: user.id,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflectionarian-session-${session.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export session. Please try again.");
    }
  };

  // Handle continue/review session
  const handleContinueSession = async (sessionToContin) => {
    try {
      // Get the session summary for context
      const parentSession = sessionToContin || selectedSession;

      if (!parentSession) return;

      // Start new session with parent context
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            parent_session_id: parentSession.id,
            session_type: "text", // Default to text for continuations
            preferences,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
        setSessionType("text");

        // Create contextual welcome message
        const contextMessage = `Welcome back! I've reviewed our previous conversation where ${
          parentSession.session_summary ||
          `we explored ${
            parentSession.key_themes?.join(", ") || "your thoughts"
          }`
        }. I'm here to continue supporting your reflection journey. What would you like to explore further today?`;

        const welcomeMsg = sessionService.createMessage(
          "assistant",
          contextMessage
        );
        setMessages([welcomeMsg]);

        // Switch to chat tab
        setActiveTab("chat");

        await loadSessions();
      }
    } catch (error) {
      console.error("Error continuing session:", error);
      alert("Failed to continue session. Please try again.");
    }
  };

  // Handle onboarding complete
  const handleOnboardingComplete = async (newPreferences) => {
    const saved = await preferencesService.savePreferences(
      user.id,
      newPreferences
    );
    if (saved) {
      setPreferences(newPreferences);
      setShowOnboarding(false);
      // Start first session
      startNewSession("text");
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // Start with default preferences
    startNewSession("text");
  };

  // Loading state
  if (!user || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <img
            src={ReflectionaryIcon}
            alt="Reflectionary"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
          <h2 className="text-xl font-semibold text-white mb-2">
            Loading Reflectionarian
          </h2>
          <p className="text-gray-300">Preparing your session...</p>
        </div>
      </div>
    );
  }

  // Access check
  if (!hasAccess("premium_reflectionarian")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Premium Feature
          </h2>
          <p className="text-gray-300 mb-6">
            The Premium Reflectionarian requires a Premium membership to access
            advanced AI coaching features.
          </p>
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-medium transition-all"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-6">
      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        currentVoice={preferences?.ttsVoice || "nova"}
        currentRate={preferences?.speechRate || 1.0}
        userId={user.id}
        onVoiceChange={async (voice) => {
          const newPrefs = { ...preferences, ttsVoice: voice };
          setPreferences(newPrefs);
          await preferencesService.savePreferences(user.id, newPrefs);
          console.log("🔄 Voice changed to:", voice);
        }}
        onRateChange={async (rate) => {
          const newPrefs = { ...preferences, speechRate: rate };
          setPreferences(newPrefs);
          await preferencesService.savePreferences(user.id, newPrefs);
          console.log("🔄 Speech rate changed to:", rate);
        }}
        onReloadPreferences={loadPreferences}
      />

      <EndSessionModal
        isOpen={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        onConfirm={endSession}
        messageCount={messages.length}
        isLoading={isLoading}
      />

      {/* MoodTracker Modal */}
      {showMoodTracker && (
        <MoodTracker onSubmit={handleMoodSubmit} onSkip={handleMoodSkip} />
      )}

      {showSessionInsights && (
        <SessionInsightsModal
          sessionId={sessionId}
          userId={user.id}
          messages={messages}
          onClose={() => {
            // Close the insights modal
            setShowSessionInsights(false);
            setSessionInsights(null);
            
            // Reset session state to return to default screen
            setSessionId(null);
            setMessages([]);
            setSessionType(null);
            setCurrentMoodData(null);
            setShowStartConversation(false);
            
            // Stop any ongoing voice activities
            if (isRecording) {
              stopRecording();
            }
            if (isSpeaking) {
              stopSpeaking();
            }
            
            // Reset voice state
            setIsRecording(false);
            setRecordingTime(0);
            setIsSpeaking(false);
            setIsPaused(false);
            setIsStreaming(false);
            setStreamingProgress(0);
            setVoiceError(null);
            setCurrentMessage("");
            setInputHeight(48); // Reset textarea height
            setTranscriptBackup("");
            setLastSavedTranscript("");
            
            // Clear any localStorage items for voice sessions
            if (sessionId) {
              // Clear any spoken message flags
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key.startsWith('spoken_')) {
                  localStorage.removeItem(key);
                }
              });
            }
            
            // Ensure we're on the chat tab to show the default screen
            setActiveTab("chat");
            
            console.log("✅ Session completed - returned to default screen");
          }}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Premium Reflectionarian
                </h1>
                <p className="text-gray-300">
                  {sessionId
                    ? `Session Active - ${
                        sessionType === "voice" ? "Voice" : "Text"
                      } Mode`
                    : "Start a new session to begin"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!sessionId && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startNewSession("text")}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Text Session</span>
                  </button>
                  <button
                    onClick={() => startNewSession("voice")}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white transition-colors flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Voice Session</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {proTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {activeTab === "chat" && sessionId && showStartConversation && (
            <div className="flex flex-col h-[600px] items-center justify-center p-12">
              <div className="text-center max-w-md">
                <Volume2 className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Reflectionarian is Ready to Begin
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Your voice session is prepared and ready. Click the button below to start the conversation and begin your reflection journey.
                </p>
                
                {/* Voice Settings Display */}
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300">Voice:</span>
                    <span className="text-white capitalize">
                      {preferences?.ttsVoice || "Alloy"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-purple-300">Speed:</span>
                    <span className="text-white">
                      {preferences?.speechRate || 1.0}x
                    </span>
                  </div>
                  <button
                    onClick={() => setShowVoiceSettings(true)}
                    className="w-full mt-3 px-3 py-2 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 rounded-md text-xs text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    Adjust Voice Settings
                  </button>
                </div>

                <button
                  onClick={startConversation}
                  disabled={isLoadingPreferences || !preferences}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold transition-all flex items-center space-x-3 mx-auto text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Start Conversation</span>
                </button>

                {isLoadingPreferences && (
                  <p className="text-purple-300 text-sm mt-4">
                    Loading your voice preferences...
                  </p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "chat" && sessionId && !showStartConversation && (
            <div className="flex flex-col h-[600px]">
              {/* TTS Controls for Voice Session */}
              {/* Enhanced TTS Controls for Voice Session */}
              {sessionType === "voice" && (isSpeaking || isStreaming || wasStopped) && (
                <div className="p-4 border-b border-white/10 bg-purple-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-purple-300 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {wasStopped && !isSpeaking
                            ? "Playback stopped"
                            : isStreaming
                            ? "Streaming response..."
                            : "Reflectionarian is speaking..."}
                        </span>
                        {isStreaming && (
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-32 bg-white/20 rounded-full h-2">
                              <div
                                className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${streamingProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-purple-200">
                              {Math.round(streamingProgress)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {/* Restart button when stopped */}
                      {wasStopped && !isSpeaking && (
                        <button
                          onClick={restartSpeaking}
                          className="px-3 py-2 bg-green-600/30 hover:bg-green-600/40 rounded-lg transition-colors flex items-center space-x-1"
                          title="Restart playback"
                        >
                          <RefreshCw className="w-4 h-4 text-white" />
                          <span className="text-white text-xs">Restart</span>
                        </button>
                      )}
                      
                      {/* Interrupt button when speaking */}
                      {canInterrupt && isSpeaking && (
                        <button
                          onClick={interruptAndRecord}
                          className="px-3 py-2 bg-orange-600/30 hover:bg-orange-600/40 rounded-lg transition-colors text-xs"
                          title="Stop and speak"
                        >
                          <div className="flex items-center space-x-1">
                            <Mic className="w-3 h-3 text-white" />
                            <span className="text-white">Interrupt</span>
                          </div>
                        </button>
                      )}

                      {/* Pause/Resume - only show when speaking */}
                      {isSpeaking && (
                        isPaused ? (
                          <button
                            onClick={resumeSpeaking}
                            className="p-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg transition-colors"
                            title="Resume"
                          >
                            <Volume2 className="w-4 h-4 text-white" />
                          </button>
                        ) : (
                          <button
                            onClick={pauseSpeaking}
                            className="p-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg transition-colors"
                            title="Pause"
                          >
                            <VolumeX className="w-4 h-4 text-white" />
                          </button>
                        )
                      )}

                      {/* Stop - always visible when speaking or stopped */}
                      {(isSpeaking || wasStopped) && (
                        <button
                          onClick={() => {
                            stopSpeaking(false); // Don't preserve for resume
                            setWasStopped(false);
                          }}
                          className="p-2 bg-red-600/30 hover:bg-red-600/40 rounded-lg transition-colors"
                          title="Clear"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Voice Error Display */}
                  {voiceError && (
                    <div className="mt-2 text-xs text-red-300 bg-red-500/20 rounded px-2 py-1">
                      {voiceError}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`mb-4 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white border border-white/20"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Form */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-white/10"
              >
                <div className="flex space-x-3 items-end">
                  {sessionType === "voice" ? (
                    <>
                      {/* Voice Input - Multi-line Textarea */}
                      <div className="flex-1 relative">
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            value={currentMessage}
                            onChange={handleTextareaChange}
                            placeholder={
                              isRecording
                                ? "🎤 Listening... speak naturally"
                                : "Click microphone to speak or type here"
                            }
                            className={`voice-textarea w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none transition-all duration-200 ${
                              isRecording
                                ? "border-red-400 bg-red-500/10 placeholder-red-300"
                                : "border-white/20 focus:border-purple-400"
                            }`}
                            style={{
                              height: `${inputHeight}px`,
                              minHeight: "48px",
                              maxHeight: "150px",
                            }}
                            disabled={isLoading}
                            rows={1}
                          />

                          {/* Recording Indicator Overlay */}
                          {isRecording && (
                            <div className="absolute top-2 right-2 flex items-center space-x-2 bg-red-500/20 rounded-lg px-2 py-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-xs text-red-300 font-medium">
                                {voiceService.formatRecordingTime
                                  ? voiceService.formatRecordingTime(
                                      recordingTime
                                    )
                                  : `${recordingTime}s`}
                              </span>
                            </div>
                          )}

                          {/* Character Count for Long Messages */}
                          {currentMessage.length > 200 && (
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 rounded px-2 py-1">
                              {currentMessage.length} chars
                            </div>
                          )}
                        </div>

                        {/* Voice Input Hints */}
                        {sessionType === "voice" &&
                          !isRecording &&
                          currentMessage.length === 0 && (
                            <div className="mt-2 text-xs text-purple-300 flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Mic className="w-3 h-3" />
                                <span>Click mic to record</span>
                              </span>
                              <span>•</span>
                              <span>Or type directly</span>
                              <span>•</span>
                            </div>
                          )}
                      </div>

                      {voiceError &&
                        voiceError.includes("Network error") &&
                        (transcriptBackup || currentMessage) && (
                          <div className="mt-2 bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-orange-300 text-sm font-medium">
                                  Connection Error
                                </p>
                                <p className="text-orange-200 text-xs mt-1">
                                  Your recording was interrupted. You have {currentMessage.length} characters saved.
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setVoiceError(null);
                                      startRecording(true); // Resume with existing text
                                    }}
                                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1"
                                  >
                                    <Mic className="w-3 h-3" />
                                    Continue Recording
                                  </button>
                                  <button
                                    onClick={() => {
                                      setVoiceError(null);
                                      // Keep text in textarea for manual editing
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                  >
                                    Type Rest
                                  </button>
                                  <button
                                    onClick={() => {
                                      sendMessage({ preventDefault: () => {} });
                                      setVoiceError(null);
                                    }}
                                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                  >
                                    Send As Is
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentMessage("");
                                      setTranscriptBackup("");
                                      setVoiceError(null);
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                  >
                                    Clear All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Enhanced Voice Recording Button */}
                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={
                            isSpeaking && canInterrupt
                              ? interruptAndRecord
                              : isRecording
                              ? stopRecording
                              : startRecording
                          }
                          className={`p-3 rounded-xl transition-all flex items-center justify-center relative ${
                            isRecording
                              ? "bg-red-600 hover:bg-red-700 animate-pulse"
                              : isSpeaking && canInterrupt
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "bg-purple-600 hover:bg-purple-700"
                          }`}
                          disabled={isLoading}
                          title={
                            isRecording
                              ? "Stop Recording"
                              : isSpeaking && canInterrupt
                              ? "Interrupt & Speak"
                              : "Start Recording"
                          }
                        >
                          <Mic className="w-5 h-5 text-white" />

                          {/* Smart indicator */}
                          {isSpeaking && canInterrupt && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce" />
                          )}
                        </button>

                        {/* Status indicator */}
                        <div className="text-xs text-center">
                          {isRecording && (
                            <span className="text-red-300">Recording</span>
                          )}
                          {isSpeaking && canInterrupt && !isRecording && (
                            <span className="text-orange-300">
                              Can interrupt
                            </span>
                          )}
                          {!isRecording && !isSpeaking && (
                            <span className="text-purple-300">Ready</span>
                          )}
                        </div>
                      </div>

                      {/* Clear/Reset Button for Voice */}
                      {currentMessage.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMessage("");
                            setInputHeight(48);
                            if (textareaRef.current) {
                              textareaRef.current.style.height = "48px";
                            }
                          }}
                          className="p-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
                          title="Clear text"
                        >
                          <RefreshCw className="w-5 h-5 text-white" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Text Input - Enhanced */}
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={currentMessage}
                          onChange={handleTextareaChange}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                          placeholder="Share your thoughts... (Shift+Enter for new line)"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none transition-all duration-200"
                          style={{
                            height: `${inputHeight}px`,
                            minHeight: "48px",
                            maxHeight: "120px",
                          }}
                          disabled={isLoading}
                          rows={1}
                        />

                        {/* Character Count for Long Messages */}
                        {currentMessage.length > 200 && (
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 rounded px-2 py-1">
                            {currentMessage.length} chars
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !currentMessage.trim()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-xl transition-colors flex items-center space-x-2 min-h-[48px]"
                    title="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Enhanced Recording Status */}
                {isRecording && (
                  <div className="mt-3 flex items-center justify-between bg-red-500/10 border border-red-400/30 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-300 font-medium">
                          Recording
                        </span>
                      </div>
                      <span className="text-red-200 text-sm">
                        {voiceService.formatRecordingTime
                          ? voiceService.formatRecordingTime(recordingTime)
                          : `${recordingTime}s`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-red-300">
                      <span>Speak naturally</span>
                      <span>•</span>
                      <span>Click mic to stop</span>
                      {isSpeaking && (
                        <>
                          <span>•</span>
                          <span className="text-orange-300">
                            Will interrupt AI
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Voice Error Display */}
                {voiceError && (
                  <div className="mt-2 bg-red-500/20 border border-red-400/30 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm">{voiceError}</span>
                      <button
                        onClick={() => setVoiceError(null)}
                        className="ml-auto text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Voice Session Tips & Settings */}
                {sessionType === "voice" &&
                  !isRecording &&
                  messages.length <= 1 && (
                    <div className="mt-3 bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tips Column */}
                        <div className="flex items-start space-x-3">
                          <Volume2 className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-purple-200">
                            <p className="font-medium mb-1">
                              Voice Session Tips:
                            </p>
                            <ul className="text-xs space-y-1 text-purple-300">
                              <li>
                                • Speak naturally - I'll transcribe as you talk
                              </li>
                              <li>
                                • Text will scroll automatically to show your words
                              </li>
                              <li>• You can edit the text before sending</li>
                              <li>• I'll respond with both voice and text</li>
                            </ul>
                          </div>
                        </div>

                        {/* Voice Settings Column */}
                        <div className="flex items-start space-x-3">
                          <Settings className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-purple-200">
                            <p className="font-medium mb-2">Voice Settings:</p>
                            <div className="space-y-2">
                              {/* Current Voice Display */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-purple-300">Voice:</span>
                                <span className="text-white capitalize">
                                  {preferences?.ttsVoice || "Nova"}
                                </span>
                              </div>
                              
                              {/* Current Rate Display */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-purple-300">Speed:</span>
                                <span className="text-white">
                                  {preferences?.speechRate || 1.0}x
                                </span>
                              </div>

                              {/* Settings Button */}
                              <button
                                onClick={() => setShowVoiceSettings(true)}
                                className="w-full mt-2 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 rounded-md text-xs text-white transition-colors flex items-center justify-center gap-1"
                              >
                                <Settings className="w-3 h-3" />
                                Customize Voice
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </form>

              {/* End Session Button */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setShowEndSessionModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all flex items-center justify-center space-x-2"
                  disabled={!sessionId}
                >
                  <Save className="w-5 h-5" />
                  <span>End Session & Generate Insights</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "chat" && !sessionId && (
            <div className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to Begin?
              </h3>
              <p className="text-gray-300 mb-6">
                Choose your preferred session type to start your reflection
                journey.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => startNewSession("text")}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Text Session</span>
                </button>
                <button
                  onClick={() => startNewSession("voice")}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl text-white transition-colors flex items-center space-x-2"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Voice Session</span>
                </button>
              </div>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === "prompts" && (
            <SessionPromptsTab
              userId={user.id}
              sessionId={sessionId}
              preferences={preferences}
            />
          )}

          {activeTab === "summaries" && (
            <SessionSummariesTab
              userId={user.id}
              onContinueSession={handleContinueSession}
              onStartNewSession={() => startNewSession("text")}
            />
          )}

          {activeTab === "report" && <WeeklyReportTab userId={user.id} />}

          {activeTab === "timeline" && <GrowthTimelineTab userId={user.id} />}

          {activeTab === "export" && (
            <ExportSessionsTab
              userId={user.id}
              sessions={sessionHistory}
              onExportSession={handleExportSession}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumReflectionarian;
