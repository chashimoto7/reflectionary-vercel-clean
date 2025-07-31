// src/pages/PremiumReflectionarian.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Settings,
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
import { supabase } from "../lib/supabase";
import SessionPromptsTab from "../components/reflectionarian/tabs/SessionPromptsTab";
import SessionFollowUpsTab from "../components/reflectionarian/tabs/SessionFollowUpsTab";
import WeeklyReportTab from "../components/reflectionarian/tabs/WeeklyReportTab";
import GrowthTimelineTab from "../components/reflectionarian/tabs/GrowthTimelineTab";
import ExportSessionsTab from "../components/reflectionarian/tabs/ExportSessionsTab";
import SessionInsightsModal from "../components/reflectionarian/modals/SessionInsightsModal";
import OnboardingModal from "../components/reflectionarian/OnboardingModal";
import EndSessionModal from "../components/reflectionarian/modals/EndSessionModal";

// Import your custom logo icon
import ReflectionaryIcon from "../assets/ReflectionaryIcon.svg";

const API_BASE = "https://reflectionary-api.vercel.app";

const PremiumReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();

  // Onboarding & Preferences State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Session & Features State
  const [sessionPrompts, setSessionPrompts] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Speech State (using OpenAI TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice Recording State (copied from Premium Journaling)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const interimTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showSessionInsights, setShowSessionInsights] = useState(false);
  const [sessionInsights, setSessionInsights] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const [sessionType, setSessionType] = useState(null); // 'text' or 'voice'

  // Check voice support on mount
  useEffect(() => {
    setVoiceSupported(
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    );
  }, []);

  // Updated tabs without Goal Tracking
  const proTabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "prompts", label: "Session Prompts", icon: BookOpen },
    { id: "followups", label: "Session History", icon: Calendar },
    { id: "report", label: "Weekly Report", icon: FileText },
    { id: "timeline", label: "Growth Timeline", icon: TrendingUp },
    { id: "export", label: "Export Sessions", icon: Download },
  ];

  // Default preferences for Premium tier
  const defaultPreferences = {
    tier: "premium",
    therapy_approach: "Integrative",
    communication_style: "Warm and Insightful",
    primary_focus: "Holistic Growth",
    session_structure: "Structured",
    voice_enabled: true,
    weekly_reports: true,
    enableSpeech: false,
    ttsVoice: "nova", // Changed to OpenAI voice
    ttsEngine: "openai", // Changed to OpenAI
    ttsStyle: "calm",
  };

  // ✅ NEW: OpenAI TTS Speech Function (using your existing system)
  const speakText = async (text) => {
    try {
      // Stop any current speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(true);

      console.log("🎤 Using OpenAI TTS system...");

      // Use your existing TTS endpoint (same as Premium Journaling)
      const audioResponse = await fetch(`${API_BASE}/api/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text: text,
          voice: preferences?.ttsVoice || "nova", // Warm female voice
          model: "tts-1",
        }),
      });

      if (audioResponse.ok) {
        // Create blob URL for audio playback
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play the audio
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;

        audio.onplay = () => {
          console.log("✅ OpenAI TTS playing successfully!");
        };

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl); // Clean up
        };

        audio.onerror = (error) => {
          console.error("❌ Audio playback error:", error);
          setIsSpeaking(false);
          // Fallback to browser TTS
          fallbackToBrowserTTS(text);
        };

        await audio.play();
      } else {
        throw new Error("TTS generation failed");
      }
    } catch (error) {
      console.error("❌ OpenAI TTS failed:", error);
      setIsSpeaking(false);

      // Fallback to browser TTS
      fallbackToBrowserTTS(text);
    }
  };

  // Helper function for browser TTS fallback
  const fallbackToBrowserTTS = (text) => {
    console.log("🔄 Falling back to browser TTS...");

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Try to use a better voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoices = voices.filter(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Alex") ||
          voice.name.includes("Samantha")
      );

      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
        console.log("🎭 Using enhanced browser voice:", utterance.voice.name);
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("❌ No speech synthesis available");
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // ✅ NEW: Voice Recognition (copied from Premium Journaling)
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

      // Update the current message with the transcript
      const currentContent =
        finalTranscriptRef.current + interimTranscriptRef.current;
      setCurrentMessage(currentContent);
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        return; // Continue recording even if no speech detected
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

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        const recognition = initializeRecognition();
        if (!recognition) return;

        recognitionRef.current = recognition;
        setIsRecording(true);
        setRecordingTime(0);

        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to start recognition:", error);
          alert("Failed to start voice recording. Please try again.");
          stopRecording();
        }
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
    setRecordingTime(0);
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load preferences and sessions on mount
  useEffect(() => {
    if (user && !membershipLoading) {
      loadPreferences();
      loadSessions();
    }
  }, [user, membershipLoading]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load user preferences from backend
  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/preferences?user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences && data.preferences.onboarding_completed) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
          setShowOnboarding(false);
        } else {
          // First time user - show onboarding
          setShowOnboarding(true);
          setPreferences(defaultPreferences);
        }
      } else {
        // No preferences found - show onboarding
        setShowOnboarding(true);
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences(defaultPreferences);
      setShowOnboarding(true);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Save preferences to backend
  const savePreferences = async (newPrefs) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/preferences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            preferences: newPrefs,
          }),
        }
      );

      if (response.ok) {
        setPreferences(newPrefs);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (onboardingPreferences) => {
    const updatedPreferences = {
      ...defaultPreferences,
      ...onboardingPreferences,
      onboarding_completed: true,
    };

    const saved = await savePreferences(updatedPreferences);
    if (saved) {
      setPreferences(updatedPreferences);
      setShowOnboarding(false);
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    const updatedPreferences = {
      ...defaultPreferences,
      onboarding_completed: true,
    };

    const saved = await savePreferences(updatedPreferences);
    if (saved) {
      setPreferences(updatedPreferences);
      setShowOnboarding(false);
    }
  };

  // Load sessions from backend
  const loadSessions = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions?user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setSessionHistory(data.sessions || []);

        // Only load active session if we don't already have one and we're on the chat tab
        const activeSession = data.sessions?.find((s) => s.status === "active");
        if (activeSession && !sessionId && activeTab === "chat") {
          setSessionId(activeSession.id);
          loadSessionMessages(activeSession.id);
        }
      } else {
        console.error("Failed to load sessions:", response.status);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/messages?session_id=${sessionId}&user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Start a new session
  const startNewSession = async (type = "text") => {
    setIsLoading(true);

    try {
      // Clear any existing session state first
      setSessionId(null);
      setMessages([]);
      setSessionType(type); // Store the session type

      const response = await fetch(`${API_BASE}/api/reflectionarian/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          preferences: preferences,
          session_type: type, // Pass session type to backend
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);

        // Different welcome messages for different session types
        const welcomeMessage =
          type === "voice"
            ? "Hello! I'm your AI reflection companion. I can hear you clearly - feel free to speak naturally. Click the microphone button below to start talking, and I'll respond both in text and voice. What's on your mind today?"
            : data.welcome_message ||
              "Hello! I'm your AI reflection companion, here to support your personal growth and self-reflection journey. I'm not a therapist or medical professional - our conversations are for personal insight and exploration. What's on your mind today?";

        setMessages([
          {
            id: Date.now(),
            role: "assistant",
            content: welcomeMessage,
            created_at: new Date().toISOString(),
          },
        ]);

        // Auto-enable TTS for voice sessions
        if (type === "voice" && preferences) {
          setPreferences({
            ...preferences,
            enableSpeech: true,
          });

          // Speak the welcome message
          await speakText(welcomeMessage);
        }

        // Reload sessions to show new session
        await loadSessions();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to start session" }));
        console.error("Session creation failed:", errorData);
        throw new Error(errorData.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);

      // Ensure we're in a clean state
      setSessionId(null);
      setMessages([]);
      setSessionType(null);

      alert(
        "Unable to start a new session right now. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message in the chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    // Show loading state immediately
    const loadingMessage = {
      id: Date.now() + 0.1,
      role: "assistant",
      content: "loading",
      created_at: new Date().toISOString(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch(`${API_BASE}/api/reflectionarian/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          user_id: user.id,
          preferences: preferences,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const assistantMessage = {
          id: data.message_id || Date.now() + 1,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString(),
        };

        // Replace loading with actual response
        setMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat([assistantMessage])
        );

        if (sessionType === "voice" || preferences?.enableSpeech) {
          try {
            await speakText(data.response);
          } catch (error) {
            console.error("Error with TTS:", error);
            // Don't alert user, just log - TTS is not critical
          }
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove loading and show error
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isLoading)
          .concat([
            {
              id: Date.now() + 1,
              role: "assistant",
              content:
                "I apologize, but I'm having trouble connecting right now. Please try again.",
              created_at: new Date().toISOString(),
            },
          ])
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // End the current session
  const endSession = async () => {
    if (!sessionId) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions?session_id=${sessionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            user_id: user.id,
            messages: messages,
            generate_ai_insights: true,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Show AI-generated insights
        if (data.insights) {
          setSessionInsights(data.insights);
          setShowSessionInsights(true);
        } else {
          // Fallback insights
          const basicInsights = generateFallbackInsights(messages);
          setSessionInsights(basicInsights);
          setShowSessionInsights(true);
        }

        // Reset session state
        setSessionId(null);
        setMessages([]);
        setShowEndSessionModal(false);
        await loadSessions();
      } else {
        // Handle errors gracefully
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Session end API error:", errorData);

        setSessionId(null);
        setMessages([]);
        setSessionType(null);
        setShowEndSessionModal(false);

        alert(
          "Session ended successfully, but we couldn't generate insights right now. Your conversation has been saved."
        );
        await loadSessions();
      }
    } catch (error) {
      console.error("Error ending session:", error);

      setSessionId(null);
      setMessages([]);
      setShowEndSessionModal(false);

      alert(
        "Session ended. Your conversation has been saved, but insights couldn't be generated right now."
      );

      try {
        await loadSessions();
      } catch (loadError) {
        console.error("Error reloading sessions:", loadError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue session from follow-ups tab
  const handleContinueSession = (sessionId) => {
    setSessionId(sessionId);
    loadSessionMessages(sessionId);
    setActiveTab("chat");
  };

  // Handle review session from follow-ups tab
  const handleReviewSession = (session) => {
    setSessionId(session.id);
    loadSessionMessages(session.id);
    setActiveTab("chat");
  };

  const generateFallbackInsights = (messages) => {
    const userMessages = messages.filter((m) => m.role === "user");

    return {
      sessionSummary: {
        duration: Math.max(5, Math.floor(messages.length * 1.5)),
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        date: new Date().toLocaleDateString(),
      },
      keyThemes: ["Self-reflection", "Personal growth", "Emotional awareness"],
      emotionalJourney: {
        primaryEmotion: "Thoughtful",
        intensity: "Moderate",
        progression: "Positive",
      },
      breakthroughMoments: [
        {
          message: "You showed great insight in exploring your thoughts today",
          timestamp: new Date().toISOString(),
        },
      ],
      followUpSuggestions: [
        "What resonated most with you from our conversation?",
        "How can you apply today's insights to your daily life?",
        "What would you like to explore further next time?",
      ],
      nextSteps: [
        "Continue exploring the themes that emerged today",
        "Journal about the insights you gained",
        "Consider setting specific goals based on our conversation",
        "Schedule your next session within the next week",
      ],
    };
  };

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
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={ReflectionaryIcon}
                alt="Reflectionary"
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Premium Reflectionarian
                  <Crown className="w-6 h-6 text-yellow-400" />
                </h1>
                <p className="text-purple-200">Your advanced AI companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (window.location.href = "/profile")}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowPrivacyInfo(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Privacy Information"
                aria-label="Show privacy information"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {proTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-purple-200 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Chat Tab */}
          {activeTab === "chat" && sessionId && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 mt-20">
                    <img
                      src={ReflectionaryIcon}
                      alt="Reflectionary"
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-lg">Ready to begin our conversation</p>
                    <p className="text-sm mt-2">Share what's on your mind...</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <img
                            src={ReflectionaryIcon}
                            alt="AI"
                            className="w-6 h-6"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-white/10"
                        } rounded-2xl p-4 backdrop-blur-sm shadow-lg`}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span className="text-white">Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-white whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}{" "}
                        message.role === "assistant" && sessionType === "voice"
                        && !message.isLoading && (
                        <div className="flex items-center gap-2 mt-2 text-purple-300/70 text-xs">
                          <Volume2 className="w-3 h-3" />
                          <span>Audio response playing automatically</span>
                        </div>
                        )
                        <p className="text-xs text-white/50 mt-2">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-white font-semibold">
                            {user?.email?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input - With Voice Optimization */}
              <form
                onSubmit={sendMessage}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 shadow-xl"
              >
                {/* Session Type Indicator */}
                {sessionType && (
                  <div className="flex items-center gap-2 mb-3 text-purple-300">
                    {sessionType === "voice" ? (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Voice Session Active</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Text Session Active</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Text Input Area */}
                  <div className="flex gap-3">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isRecording}
                      placeholder={
                        sessionType === "voice" && !isRecording
                          ? "Click the microphone to speak, or type here..."
                          : isRecording
                          ? "Listening..."
                          : "Type your message..."
                      }
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 disabled:opacity-50 transition-colors"
                      aria-label="Message input"
                    />

                    {/* Voice Recording Button - Show prominently for voice sessions */}
                    {voiceSupported && sessionType === "voice" && (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-purple-600 hover:bg-purple-700"
                        } disabled:opacity-50`}
                        aria-label={
                          isRecording ? "Stop recording" : "Start recording"
                        }
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </button>
                    )}

                    {/* Standard Voice Button for Text Sessions */}
                    {voiceSupported && sessionType === "text" && (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`p-3 rounded-xl transition-colors ${
                          isRecording
                            ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300"
                            : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                        } disabled:opacity-50`}
                        aria-label={
                          isRecording ? "Stop recording" : "Start recording"
                        }
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex gap-3 justify-between items-center">
                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!currentMessage.trim() || isLoading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors flex items-center gap-2 h-10"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                      <span className="text-white">Send</span>
                    </button>

                    {/* End Session button */}
                    <div className="flex items-center gap-3">
                      {sessionId && (
                        <>
                          {/* Session Type Badge */}
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                              sessionType === "voice"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {sessionType === "voice" ? (
                              <>
                                <Mic className="w-3 h-3" />
                                <span>Voice Session</span>
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-3 h-3" />
                                <span>Text Session</span>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => setShowEndSessionModal(true)}
                            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            End Session
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setShowPrivacyInfo(true)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                      >
                        <Shield className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setActiveTab("settings")}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm">
                        Recording... {formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Chat Tab - No Active Session */}
          {activeTab === "chat" && !sessionId && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <img
                  src={ReflectionaryIcon}
                  alt="Reflectionary"
                  className="w-20 h-20 mx-auto mb-6 text-purple-400"
                />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready for Your Next Session?
                </h3>
                <p className="text-gray-300 mb-8 max-w-md">
                  Start a new conversation with your AI coach to explore your
                  thoughts, feelings, and personal growth journey.
                </p>

                {/* REPLACE THE SINGLE BUTTON WITH THIS CODE: */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => startNewSession("text")}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2 group"
                    aria-label="Start text chat session"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    Text Chat
                  </button>

                  <button
                    type="button"
                    onClick={() => startNewSession("voice")}
                    disabled={isLoading || !voiceSupported}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2 group"
                    aria-label="Start voice chat session"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    Voice Chat
                  </button>
                </div>

                {!voiceSupported && (
                  <p className="text-yellow-400/70 text-sm mt-4">
                    Voice chat requires Chrome or Edge browser
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Session Prompts Tab */}
          {activeTab === "prompts" && (
            <SessionPromptsTab userId={user.id} tier="premium" />
          )}

          {/* Session History Tab */}
          {activeTab === "followups" && (
            <SessionFollowUpsTab
              userId={user.id}
              onContinueSession={handleContinueSession}
              onReviewSession={handleReviewSession}
            />
          )}

          {/* Other Tabs */}
          {activeTab === "report" && (
            <WeeklyReportTab
              userId={user.id}
              onGenerateReport={() => {
                console.log("Generate weekly report");
              }}
            />
          )}

          {activeTab === "timeline" && (
            <GrowthTimelineTab userId={user.id} sessions={sessionHistory} />
          )}

          {activeTab === "export" && (
            <ExportSessionsTab
              sessions={sessionHistory}
              onExport={(session) => {
                console.log("Export session:", session);
              }}
            />
          )}
        </div>

        {/* End Session Modal */}
        <EndSessionModal
          isOpen={showEndSessionModal}
          onClose={() => setShowEndSessionModal(false)}
          onConfirm={endSession}
          isLoading={isLoading}
        />

        {/* Session Insights Modal */}
        {showSessionInsights && sessionInsights && (
          <SessionInsightsModal
            isOpen={showSessionInsights}
            onClose={() => setShowSessionInsights(false)}
            insights={sessionInsights}
            onCreateGoals={() => {
              setShowSessionInsights(false);
              console.log("Navigate to goals with session context");
            }}
          />
        )}

        {/* Privacy Information Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Privacy & Security
                </h3>
                <button
                  onClick={() => setShowPrivacyInfo(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              <div className="space-y-4 text-white/80">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    End-to-End Encryption
                  </h4>
                  <p>
                    All your conversations are end-to-end encrypted using
                    industry-standard encryption. Only you can access your
                    session content.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Data Privacy
                  </h4>
                  <p>
                    Your sessions are never used for AI training. No personal
                    identifiers are sent to AI services. We NEVER share your
                    personal information with third parties. Voice data is
                    processed locally when possible.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Session Storage
                  </h4>
                  <p>
                    Sessions are stored securely and can be permanently deleted
                    at any time from your export tab.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Voice Data</h4>
                  <p>
                    Voice recordings are processed in real-time and never
                    stored. Only the text transcription is saved with your
                    session.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumReflectionarian;
