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
import pollyTTSService from "../services/pollyTTSService";
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

  // Speech State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showSessionInsights, setShowSessionInsights] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Premium color scheme
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
  };

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
    ttsVoice: "ruth",
    ttsEngine: "neural",
    ttsStyle: "calm",
  };

  // Filler sentences for better conversation flow
  const fillerSentences = [
    "I understand. Let me give that some thought...",
    "That sounds challenging. I'm processing what you've shared...",
    "I hear you. Give me a moment to consider this...",
    "Thank you for sharing that with me. Let me reflect on this...",
    "I can sense the importance of what you're telling me...",
    "That's really meaningful. I'm thinking about how to respond...",
    "I appreciate you opening up about this...",
    "Let me take a moment to process what you've shared...",
  ];

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage((prev) => prev + " " + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Speech functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = async (text) => {
    try {
      // Stop any current speech
      pollyTTSService.stopAudio();

      setIsSpeaking(true);

      // Use therapy-optimized speech for better therapeutic experience
      await pollyTTSService.speakTherapy(
        text,
        {
          voice: preferences?.ttsVoice || "ruth",
          ssmlStyle: "calm",
        },
        () => {
          setIsSpeaking(false); // Callback when speech ends
        }
      );
    } catch (error) {
      console.error("Error speaking text:", error);
      setIsSpeaking(false);

      // Fallback to browser TTS if Polly fails
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    pollyTTSService.stopAudio();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
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
        if (data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
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

  // Load sessions from backend
  const loadSessions = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions?user_id=${user.id}`
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
  const startNewSession = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 Starting new session for user:", user.id);

      const response = await fetch(`${API_BASE}/api/reflectionarian/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          tier: "premium",
        }),
      });

      console.log("📡 Session creation response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Session created:", data);
        setSessionId(data.session.id);
        setMessages([
          {
            id: 1,
            role: "assistant",
            content:
              "Hello! I'm here to listen and support you in your reflection journey. What's on your mind today?",
            created_at: new Date().toISOString(),
          },
        ]);
        await loadSessions(); // Refresh session list
      } else {
        const errorData = await response.text();
        console.error(
          "❌ Session creation failed:",
          response.status,
          errorData
        );
        throw new Error(`Failed to create session: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error starting session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // End current session - now shows insights modal
  const endSession = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions/${sessionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            user_id: user.id,
          }),
        }
      );

      if (response.ok) {
        // Show insights modal instead of old goal suggestions
        setShowSessionInsights(true);
        setShowEndSessionModal(false);

        // Reset session state
        setSessionId(null);
        setMessages([]);
        await loadSessions(); // Refresh session list
      }
    } catch (error) {
      console.error("Error ending session:", error);
      // Reset session state even if API call fails
      setSessionId(null);
      setMessages([]);
      alert(
        "Session ended. There was an issue saving insights, but your conversation has been saved."
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

    // Show a filler message immediately for better UX
    const fillerMessage = {
      id: Date.now() + 0.5,
      role: "assistant",
      content:
        fillerSentences[Math.floor(Math.random() * fillerSentences.length)],
      created_at: new Date().toISOString(),
      isFiller: true,
    };
    setMessages((prev) => [...prev, fillerMessage]);

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

        // Replace filler with actual response
        setMessages((prev) =>
          prev.filter((msg) => !msg.isFiller).concat([assistantMessage])
        );

        // Auto-speak the response if speech is enabled
        if (preferences?.enableSpeech) {
          // Use Polly for higher quality therapeutic speech
          try {
            await pollyTTSService.speakTherapy(
              data.response,
              {
                voice: preferences?.ttsVoice || "ruth",
              },
              () => {
                setIsSpeaking(false);
              }
            );
            setIsSpeaking(true);
          } catch (error) {
            console.error("Error with Polly TTS:", error);
            // Fallback to browser TTS
            speakText(data.response);
          }
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove filler and show error
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isFiller)
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

  // Handle continue session from follow-ups tab
  const handleContinueSession = (sessionId) => {
    setSessionId(sessionId);
    loadSessionMessages(sessionId);
    setActiveTab("chat");
  };

  // Handle review session from follow-ups tab
  const handleReviewSession = (session) => {
    // Could open a modal or navigate to a detailed view
    console.log("Review session:", session);
    // For now, just switch to the session and load messages
    setSessionId(session.id);
    loadSessionMessages(session.id);
    setActiveTab("chat");
  };

  // Handle creating goals from session insights
  const handleCreateGoalsFromSession = () => {
    setShowSessionInsights(false);
    // Navigate to goals page with session context
    // This would be handled by your router
    console.log("Navigate to goals with session context");
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
        </div>
      </div>
    );
  }

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <img
            src={ReflectionaryIcon}
            alt="Reflectionary"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
          <h2 className="text-xl font-semibold text-white mb-2">
            Preparing Your Session
          </h2>
          <p className="text-gray-300">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="p-6">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {/* Icon without background */}
                  <img
                    src={ReflectionaryIcon}
                    alt="Reflectionary"
                    className="w-12 h-12 object-contain"
                  />
                  {/* Larger title to match icon height */}
                  <h1 className="text-2xl font-bold text-white">
                    Premium Reflectionarian
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Privacy Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    End-to-End Encrypted
                  </span>
                </div>

                {/* Privacy Info Button */}
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
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 p-1">
                          <img
                            src={ReflectionaryIcon}
                            alt="Reflectionary"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-4 rounded-xl relative ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : message.isFiller
                            ? "bg-yellow-600/20 text-yellow-200 italic border border-yellow-600/30"
                            : "bg-white/10 text-white border border-white/20"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>

                        {/* Add speaker button for assistant messages */}
                        {message.role === "assistant" &&
                          !message.isFiller &&
                          !isSpeaking && (
                            <button
                              type="button"
                              onClick={() => speakText(message.content)}
                              className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded text-gray-300 hover:text-white transition-colors"
                              title="Read aloud"
                              aria-label="Read message aloud"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="You"
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-400 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/20 p-6">
                <form onSubmit={sendMessage} className="flex gap-3 mb-3">
                  <div className="flex-1 relative">
                    <label htmlFor="message-input" className="sr-only">
                      Enter your message
                    </label>
                    <input
                      id="message-input"
                      name="message"
                      ref={chatInputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Share what's on your mind... (or use voice)"
                      className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      disabled={isLoading}
                      aria-label="Message input"
                    />
                    {/* Voice input button */}
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white/10 hover:bg-white/20 text-gray-300"
                      }`}
                      disabled={isLoading}
                      title={
                        isListening ? "Stop listening" : "Start voice input"
                      }
                      aria-label={
                        isListening ? "Stop voice input" : "Start voice input"
                      }
                    >
                      <Mic
                        className={`w-4 h-4 ${
                          isListening ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !currentMessage.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-2"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send
                  </button>
                </form>

                {/* TTS Controls and Session Control */}
                <div className="flex justify-between items-center">
                  {/* TTS Controls - if message is being spoken */}
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                      aria-label="Stop reading message aloud"
                    >
                      <VolumeX className="w-4 h-4" />
                      Stop Speaking
                    </button>
                  )}

                  {/* Session Control */}
                  <button
                    type="button"
                    onClick={() => setShowEndSessionModal(true)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors text-red-300 text-sm ml-auto"
                    aria-label="End current session"
                  >
                    End Session
                  </button>
                </div>
              </div>
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
                <button
                  type="button"
                  onClick={startNewSession}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2 mx-auto"
                  aria-label="Start new therapy session"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                  Begin Session
                </button>
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
        {showEndSessionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <img
                  src={ReflectionaryIcon}
                  alt="Reflectionary"
                  className="w-6 h-6"
                />
                End Session?
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to end this session? We'll generate
                insights and key takeaways from your conversation.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndSessionModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  aria-label="Continue current session"
                >
                  Continue Session
                </button>
                <button
                  type="button"
                  onClick={endSession}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  aria-label="End session and generate insights"
                >
                  End & Generate Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Insights Modal */}
        {showSessionInsights && (
          <SessionInsightsModal
            sessionId={sessionId}
            userId={user.id}
            messages={messages}
            onClose={() => setShowSessionInsights(false)}
          />
        )}

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  Privacy & Security
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPrivacyInfo(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close privacy information"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">
                      End-to-End Encryption
                    </h4>
                    <p className="text-sm">
                      All your conversations are encrypted before being stored
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">
                      Zero Knowledge Architecture
                    </h4>
                    <p className="text-sm">
                      We cannot read your conversations even if we wanted to
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">Local Processing</h4>
                    <p className="text-sm">
                      Insights are generated using privacy-preserving methods
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">Data Control</h4>
                    <p className="text-sm">
                      You can delete your data at any time
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowPrivacyInfo(false)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  aria-label="Close privacy information"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumReflectionarian;
