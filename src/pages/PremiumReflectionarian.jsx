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

  // Session & Features State
  const [sessionPrompts, setSessionPrompts] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recordingIntervalRef = useRef(null);
  const interimTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showSessionInsights, setShowSessionInsights] = useState(false);
  const [sessionInsights, setSessionInsights] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Updated tabs
  const proTabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "prompts", label: "Session Prompts", icon: BookOpen },
    { id: "followups", label: "Session History", icon: Calendar },
    { id: "report", label: "Weekly Report", icon: FileText },
    { id: "timeline", label: "Growth Timeline", icon: TrendingUp },
    { id: "export", label: "Export Sessions", icon: Download },
  ];

  // Check voice support on mount
  useEffect(() => {
    setVoiceSupported(voiceService.isVoiceSupported());
  }, []);

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

  // Load user preferences
  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const { preferences: loadedPrefs, isNewUser } =
        await preferencesService.loadPreferences(user.id);
      setPreferences(loadedPrefs);
      setShowOnboarding(isNewUser);
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences(preferencesService.getDefaultPreferences());
      setShowOnboarding(true);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (onboardingPreferences) => {
    const success = await preferencesService.completeOnboarding(
      user.id,
      onboardingPreferences
    );
    if (success) {
      setPreferences({
        ...preferencesService.getDefaultPreferences(),
        ...onboardingPreferences,
      });
      setShowOnboarding(false);
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    const success = await preferencesService.skipOnboarding(user.id);
    if (success) {
      setShowOnboarding(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      const sessions = await chatService.loadSessions(user.id);
      setSessionHistory(sessions);

      // Load active session if exists
      const activeSession = sessions.find((s) => s.status === "active");
      if (activeSession && !sessionId && activeTab === "chat") {
        setSessionId(activeSession.id);
        loadSessionMessages(activeSession.id);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    try {
      const { messages: loadedMessages, session } =
        await chatService.loadSessionMessages({
          sessionId,
          userId: user.id,
        });
      setMessages(loadedMessages);
      setSessionType(session?.type || "text");
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Start a new session
  const startNewSession = async (type = "text") => {
    setIsLoading(true);

    try {
      // Clear any existing session state
      setSessionId(null);
      setMessages([]);
      setSessionType(type);

      const data = await chatService.startSession({
        userId: user.id,
        preferences,
        sessionType: type,
      });

      setSessionId(data.session.id);

      // Create welcome message
      const welcomeMessage = sessionService.getWelcomeMessage(
        type,
        data.welcome_message
      );
      setMessages([sessionService.createMessage("assistant", welcomeMessage)]);

      // Auto-enable TTS for voice sessions
      if (type === "voice" && preferences) {
        setPreferences({ ...preferences, enableSpeech: true });
        // Speak the welcome message
        try {
          await voiceService.speakText(
            welcomeMessage,
            preferences?.ttsVoice,
            user.id
          );
          setIsSpeaking(true);
        } catch (error) {
          console.error("TTS error:", error);
        }
      }

      await loadSessions();
    } catch (error) {
      console.error("Error starting session:", error);
      setSessionId(null);
      setMessages([]);
      setSessionType(null);
      alert("Unable to start a new session right now. Please try again.");
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
      const data = await chatService.sendMessage({
        message: userMessage,
        sessionId,
        userId: user.id,
        preferences,
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
        onResult: (event) => {
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

      // Show insights
      setSessionInsights(
        data.insights || chatService.generateFallbackInsights(messages)
      );
      setShowSessionInsights(true);

      // Reset state
      setSessionId(null);
      setMessages([]);
      setSessionType(null);
      setShowEndSessionModal(false);

      await loadSessions();
    } catch (error) {
      console.error("Error ending session:", error);

      // Still reset state
      setSessionId(null);
      setMessages([]);
      setSessionType(null);
      setShowEndSessionModal(false);

      alert("Session ended. Your conversation has been saved.");
      await loadSessions();
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
  const handleContinueSession = (sessionId) => {
    setSessionId(sessionId);
    loadSessionMessages(sessionId);
    setActiveTab("chat");
  };

  const handleReviewSession = (session) => {
    setSessionId(session.id);
    loadSessionMessages(session.id);
    setActiveTab("chat");
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
          {/* Chat Tab - Active Session */}
          {activeTab === "chat" && sessionId && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[600px] flex flex-col">
              {/* Messages Area */}
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
                          <div>
                            <p className="text-white whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.role === "assistant" &&
                              sessionType === "voice" && (
                                <div className="flex items-center gap-2 mt-2 text-purple-300/70 text-xs">
                                  <Volume2 className="w-3 h-3" />
                                  <span>
                                    Audio response playing automatically
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
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

              {/* Chat Input */}
              <form
                onSubmit={sendMessage}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 shadow-xl"
              >
                {/* Voice Settings for Voice Sessions */}
                {sessionType === "voice" && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">Voice Session Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoiceSettings(true)}
                      className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Voice: {preferences?.ttsVoice || "nova"}</span>
                    </button>
                  </div>
                )}

                {/* Text Session Indicator */}
                {sessionType === "text" && (
                  <div className="flex items-center gap-2 mb-3 text-purple-300">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Text Session Active</span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Input Area */}
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
                          ? "Click the microphone to speak..."
                          : isRecording
                          ? "Listening..."
                          : "Type your message..."
                      }
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 disabled:opacity-50 transition-colors"
                    />

                    {/* Voice Button */}
                    {voiceSupported && (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`${
                          sessionType === "voice" ? "px-4 py-3" : "p-3"
                        } rounded-xl transition-all flex items-center gap-2 ${
                          isRecording
                            ? sessionType === "voice"
                              ? "bg-red-500 hover:bg-red-600 animate-pulse"
                              : "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300"
                            : sessionType === "voice"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                        } disabled:opacity-50`}
                      >
                        <Mic
                          className={
                            sessionType === "voice"
                              ? "w-5 h-5 text-white"
                              : "w-4 h-4"
                          }
                        />
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-between items-center">
                    <button
                      type="submit"
                      disabled={!currentMessage.trim() || isLoading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {sessionType && (
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
                              <span>Voice</span>
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-3 h-3" />
                              <span>Text</span>
                            </>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowEndSessionModal(true)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        End Session
                      </button>
                    </div>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm">
                        Recording...{" "}
                        {voiceService.formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                  )}
                </div>
              </form>

              {/* TTS Controls */}
              {isSpeaking && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    type="button"
                    onClick={isPaused ? resumeSpeaking : pauseSpeaking}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {isPaused ? (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4" />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Stop Speaking
                  </button>
                </div>
              )}
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

                {/* Dual Session Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => startNewSession("text")}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2 group"
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

          {/* Other Tabs */}
          {activeTab === "prompts" && (
            <SessionPromptsTab userId={user.id} tier="premium" />
          )}

          {activeTab === "followups" && (
            <SessionFollowUpsTab
              userId={user.id}
              onContinueSession={handleContinueSession}
              onReviewSession={handleReviewSession}
            />
          )}

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
              onExport={handleExportSession}
            />
          )}
        </div>

        {/* Modals */}
        <EndSessionModal
          isOpen={showEndSessionModal}
          onClose={() => setShowEndSessionModal(false)}
          onConfirm={endSession}
          isLoading={isLoading}
        />

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

        {/* Privacy Info Modal */}
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
