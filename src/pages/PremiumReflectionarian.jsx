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

// Import services
import chatService from "../services/reflectionarian/chatService";
import voiceService from "../services/reflectionarian/voiceService";
import preferencesService from "../services/reflectionarian/preferencesService";
import sessionService from "../services/reflectionarian/sessionService";

// Import components
import SessionPromptsTab from "../components/reflectionarian/tabs/SessionPromptsTab";
import SessionFollowUpsTab from "../components/reflectionarian/tabs/SessionFollowUpsTab";
import WeeklyReportTab from "../components/reflectionarian/tabs/WeeklyReportTab";
import GrowthTimelineTab from "../components/reflectionarian/tabs/GrowthTimelineTab";
import ExportSessionsTab from "../components/reflectionarian/tabs/ExportSessionsTab";
import SessionInsightsModal from "../components/reflectionarian/modals/SessionInsightsModal";
import OnboardingModal from "../components/reflectionarian/OnboardingModal";
import EndSessionModal from "../components/reflectionarian/modals/EndSessionModal";
import VoiceSettingsModal from "../components/reflectionarian/VoiceSettingsModal";
import SessionSummariesTab from "../components/reflectionarian/tabs/SessionSummariesTab";

// Import your custom logo icon
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

  // Session Management State
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionInsights, setSessionInsights] = useState(null);
  const [showSessionInsights, setShowSessionInsights] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const interimTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const recordingIntervalRef = useRef(null);

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

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

  // Handle TTS for welcome message in voice sessions
  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0].role === "assistant" &&
      sessionType === "voice" &&
      !isSpeaking
    ) {
      // Delay TTS slightly to ensure message is rendered
      const timer = setTimeout(() => {
        voiceService
          .speakText(messages[0].content, preferences?.ttsVoice, user.id)
          .then(() => setIsSpeaking(true))
          .catch((error) => console.error("TTS error:", error));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, sessionType, preferences?.ttsVoice, user.id]);

  // Monitor TTS state
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      if (!voiceService.isSpeaking() && isSpeaking) {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    }, 500);

    return () => clearInterval(checkSpeaking);
  }, [isSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load user preferences
  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const prefs = await preferencesService.loadPreferences(user.id);

      if (prefs) {
        setPreferences(prefs);
      } else {
        // First time user - show onboarding
        setShowOnboarding(true);
        const defaultPrefs =
          preferencesService.getDefaultPreferences("premium");
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      const defaultPrefs = preferencesService.getDefaultPreferences("premium");
      setPreferences(defaultPrefs);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      const sessions = await chatService.loadSessions(user.id);
      setSessionHistory(sessions);

      // Check for active session
      const activeSession = sessions.find((s) => s.status === "active");
      if (activeSession) {
        setSessionId(activeSession.id);
        setSessionType(activeSession.session_type || "text");
        await loadSessionMessages(activeSession.id);
        // DO NOT set showSessionInsights to true here!
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
      } else {
        // If no messages, add welcome message
        const welcomeMsg = sessionService.createMessage(
          "assistant",
          sessionService.getWelcomeMessage(preferences, sessionType || "text")
        );
        setMessages([welcomeMsg]);
      }

      if (data.session) {
        setSessionType(data.session.session_type || "text");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Start new session
  const startNewSession = async (type = "text") => {
    setIsLoading(true);
    try {
      const data = await chatService.startSession({
        userId: user.id,
        preferences,
        sessionType: type,
      });

      setSessionId(data.session.id);
      setSessionType(type);

      // Create and set welcome message immediately
      const welcomeMsg = sessionService.createMessage(
        "assistant",
        sessionService.getWelcomeMessage(preferences, type)
      );

      // Important: Set messages with the welcome message
      setMessages([welcomeMsg]);

      await loadSessions();
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsLoading(false);
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
          await voiceService.speakText(
            data.response,
            preferences?.ttsVoice,
            user.id
          );
          setIsSpeaking(true);
        } catch (error) {
          console.error("TTS error:", error);
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

  // Voice recording handlers
  const startRecording = async () => {
    try {
      // Initialize recognition with callbacks
      voiceService.initializeRecognition({
        onStart: () => {
          interimTranscriptRef.current = "";
          finalTranscriptRef.current = "";
        },
        onResult: async (data) => {
          if (data.formattedFinal) {
            finalTranscriptRef.current = data.formattedFinal;
          }
          if (data.interim) {
            interimTranscriptRef.current = data.interim;
          }

          const currentContent =
            finalTranscriptRef.current + interimTranscriptRef.current;
          setCurrentMessage(currentContent);
        },
        onError: (event) => {
          if (event.error !== "no-speech") {
            stopRecording();
            alert(`Voice recording error: ${event.error}`);
          }
        },
        onEnd: () => {
          if (isRecording) {
            voiceService.startRecording();
          }
        },
      });

      await voiceService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      alert(error.message);
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

  // TTS controls
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

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // End session
  const endSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const data = await chatService.endSession({
        sessionId,
        userId: user.id,
        messages,
        generateInsights: true,
      });

      // Show insights ONLY here, after session ends
      if (data.insights) {
        setSessionInsights(data.insights);
        setShowSessionInsights(true); // Only set true here!
      }

      // Reset state
      setSessionId(null);
      setMessages([]);
      setSessionType(null);
      setShowEndSessionModal(false);

      await loadSessions();
    } catch (error) {
      console.error("Error ending session:", error);
      // ... error handling
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
        currentVoice={preferences?.ttsVoice}
        onVoiceChange={async (voice) => {
          const newPrefs = { ...preferences, ttsVoice: voice };
          setPreferences(newPrefs);
          await preferencesService.savePreferences(user.id, newPrefs);
        }}
      />

      <EndSessionModal
        isOpen={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        onConfirm={endSession}
        messageCount={messages.length}
        isLoading={isLoading}
      />

      {showSessionInsights && sessionInsights && (
        <SessionInsightsModal
          isOpen={true} // Only render when showSessionInsights is true
          onClose={() => {
            setShowSessionInsights(false);
            setSessionInsights(null);
          }}
          insights={sessionInsights}
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

              <button
                onClick={() => setShowVoiceSettings(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
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
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {activeTab === "chat" && sessionId && (
            <div className="flex flex-col h-[600px]">
              {/* TTS Controls for Voice Session */}
              {sessionType === "voice" && isSpeaking && (
                <div className="p-4 border-b border-white/10 bg-purple-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-purple-300 animate-pulse" />
                      <span className="text-white">
                        Reflectionarian is speaking...
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {isPaused ? (
                        <button
                          onClick={resumeSpeaking}
                          className="p-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg transition-colors"
                        >
                          <Volume2 className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={pauseSpeaking}
                          className="p-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg transition-colors"
                        >
                          <VolumeX className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={stopSpeaking}
                        className="p-2 bg-red-600/30 hover:bg-red-600/40 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
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
                          ? "bg-purple-600/20 text-white ml-auto"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
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

              {/* Chat Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-white/10"
              >
                <div className="relative flex items-center">
                  {/* Session Type Indicator - Updated */}
                  {sessionType && (
                    <div className="absolute -top-12 left-0 bg-purple-600/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 flex items-center space-x-2">
                      {sessionType === "voice" ? (
                        <>
                          <Mic className="w-3 h-3" />
                          <span>Voice Session Active</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-3 h-3" />
                          <span>Text Session Active</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Input Field */}
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isRecording
                        ? "Listening..."
                        : sessionType === "voice"
                        ? "Speak or type your thoughts..."
                        : "Type your thoughts..."
                    }
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 pr-24"
                    disabled={isLoading || isRecording}
                  />

                  {/* Voice Controls */}
                  {sessionType === "voice" && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`absolute right-12 p-2 rounded-lg transition-all ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                      }`}
                      disabled={isLoading}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !currentMessage.trim()}
                    className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Recording Timer */}
                {isRecording && (
                  <div className="mt-2 text-xs text-red-400 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>
                      Recording:{" "}
                      {voiceService.formatRecordingTime(recordingTime)}
                    </span>
                  </div>
                )}
              </form>

              {/* End Session Button - Updated (removed the "Text" bubble) */}
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
