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
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const [currentGoalSuggestion, setCurrentGoalSuggestion] = useState(null);
  const [showSessionInsights, setShowSessionInsights] = useState(false);
  const [sessionInsights, setSessionInsights] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user preferences on mount
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

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

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("reflectionarian_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // First time user - show onboarding
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      const { data, error } = await supabase
        .from("reflectionarian_preferences")
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return data;
    } catch (error) {
      console.error("Error saving preferences:", error);
      throw error;
    }
  };

  const startNewSession = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/api/reflectionarian/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          session_type: "premium",
          preferences: preferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: data.welcome_message,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (data.session_prompts) {
        setSessionPrompts(data.session_prompts);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Show a filler message immediately for better UX
    const fillerMessage = {
      id: Date.now() + 0.5,
      role: "assistant",
      content:
        fillerSentences[Math.floor(Math.random() * fillerSentences.length)],
      timestamp: new Date().toISOString(),
      isFiller: true,
    };
    setMessages((prev) => [...prev, fillerMessage]);

    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/session/${sessionId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            message: currentMessage,
            user_id: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      // Replace filler with actual response
      setMessages((prev) =>
        prev.filter((msg) => !msg.isFiller).concat([assistantMessage])
      );

      // Auto-speak the response if speech is enabled
      if (preferences?.enableSpeech) {
        speakText(data.response);
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
              timestamp: new Date().toISOString(),
            },
          ])
      );
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE}/api/reflectionarian/session/${sessionId}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const data = await response.json();

      // Show session insights modal
      setSessionInsights(data.insights);
      setShowSessionInsights(true);

      // Reset session state
      setSessionId(null);
      setMessages([]);
      setSessionPrompts([]);
    } catch (error) {
      console.error("Error ending session:", error);
      // Reset session state even if API call fails
      setSessionId(null);
      setMessages([]);
      setSessionPrompts([]);
      alert(
        "Session ended. There was an issue saving insights, but your conversation has been saved."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE}/api/reflectionarian/session/${sessionId}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load session messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading session messages:", error);
      alert("Unable to load session messages. Please try again.");
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
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            Upgrade to Premium
          </button>
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
                  onClick={() => setShowPrivacyInfo(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Privacy Information"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 h-full">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "chat"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat Session
                  </button>

                  <button
                    onClick={() => setActiveTab("prompts")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "prompts"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Lightbulb className="w-5 h-5" />
                    Session Prompts
                  </button>

                  <button
                    onClick={() => setActiveTab("history")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "history"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    Session History
                  </button>

                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "reports"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Weekly Reports
                  </button>

                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "timeline"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Growth Timeline
                  </button>

                  <button
                    onClick={() => setActiveTab("export")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === "export"
                        ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    Export Sessions
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-full flex flex-col">
                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "chat" && (
                    <div className="h-full flex flex-col">
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {!sessionId ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-md">
                              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                              <h3 className="text-xl font-semibold text-white mb-2">
                                Ready for Your Session?
                              </h3>
                              <p className="text-gray-300 mb-6">
                                Start a new therapy-style conversation with your
                                AI coach. Everything is private and encrypted.
                              </p>
                              <button
                                onClick={startNewSession}
                                disabled={isLoading}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-5 h-5" />
                                )}
                                Begin Session
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] p-4 rounded-2xl relative ${
                                    message.role === "user"
                                      ? "bg-purple-600 text-white"
                                      : message.isFiller
                                      ? "bg-yellow-600/20 text-yellow-200 italic"
                                      : "bg-white/10 text-gray-100"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                  <p className="text-xs opacity-70 mt-2">
                                    {new Date(
                                      message.timestamp
                                    ).toLocaleTimeString()}
                                  </p>

                                  {/* Add speaker button for assistant messages */}
                                  {message.role === "assistant" &&
                                    !message.isFiller &&
                                    !isSpeaking && (
                                      <button
                                        onClick={() =>
                                          speakText(message.content)
                                        }
                                        className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded text-gray-300 hover:text-white transition-colors"
                                        title="Read aloud"
                                      >
                                        <Volume2 className="w-3 h-3" />
                                      </button>
                                    )}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-white/10 p-4 rounded-2xl">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-gray-300">
                                      Thinking...
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>

                      {/* Chat Input - Updated Layout */}
                      {sessionId && (
                        <div className="border-t border-white/10 p-6">
                          <div className="flex gap-3">
                            {/* Input box sized to match combined height of both buttons */}
                            <div className="flex-1 flex flex-col relative">
                              <textarea
                                ref={textareaRef}
                                value={currentMessage}
                                onChange={(e) =>
                                  setCurrentMessage(e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                  }
                                }}
                                placeholder="Share your thoughts... (or use voice)"
                                className="w-full h-24 bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={isLoading}
                              />

                              {/* Voice input button */}
                              <button
                                onClick={
                                  isListening ? stopListening : startListening
                                }
                                className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                                  isListening
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                                }`}
                                disabled={isLoading}
                                title={
                                  isListening
                                    ? "Stop listening"
                                    : "Start voice input"
                                }
                              >
                                <Mic
                                  className={`w-4 h-4 ${
                                    isListening ? "animate-pulse" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Buttons stacked vertically */}
                            <div className="flex flex-col gap-3">
                              {/* Send button with white text and icon */}
                              <button
                                onClick={sendMessage}
                                disabled={!currentMessage.trim() || isLoading}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 h-[45px]"
                              >
                                <Send className="w-4 h-4 text-white" />
                                <span className="text-white">Send</span>
                              </button>

                              {/* End Session button */}
                              <button
                                onClick={endSession}
                                disabled={isLoading}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2 h-[45px]"
                              >
                                <Save className="w-4 h-4" />
                                End Session
                              </button>
                            </div>
                          </div>

                          {/* TTS Controls - if message is being spoken */}
                          {isSpeaking && (
                            <div className="mt-3 flex items-center justify-center">
                              <button
                                onClick={stopSpeaking}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                              >
                                <VolumeX className="w-4 h-4" />
                                Stop Speaking
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "prompts" && (
                    <SessionPromptsTab
                      sessionPrompts={sessionPrompts}
                      preferences={preferences}
                      onStartNewSession={startNewSession}
                    />
                  )}

                  {activeTab === "history" && (
                    <SessionFollowUpsTab
                      userId={user.id}
                      onContinueSession={handleContinueSession}
                      onReviewSession={handleReviewSession}
                    />
                  )}

                  {activeTab === "reports" && (
                    <WeeklyReportTab userId={user.id} />
                  )}

                  {activeTab === "timeline" && (
                    <GrowthTimelineTab userId={user.id} />
                  )}

                  {activeTab === "export" && (
                    <ExportSessionsTab userId={user.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Insights Modal */}
        {showSessionInsights && sessionInsights && (
          <SessionInsightsModal
            insights={sessionInsights}
            onClose={() => setShowSessionInsights(false)}
            onCreateGoals={handleCreateGoalsFromSession}
          />
        )}

        {/* Goal Suggestions Modal */}
        {showGoalSuggestions && currentGoalSuggestion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Session Insights & Goals
                </h3>
                <button
                  onClick={() => setShowGoalSuggestions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {currentGoalSuggestion.reflectionPrompts && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">
                    Reflection Prompts for Next Session
                  </h4>
                  <ul className="space-y-2">
                    {currentGoalSuggestion.reflectionPrompts.map(
                      (prompt, i) => (
                        <li key={i} className="text-gray-300">
                          • {prompt}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {currentGoalSuggestion.goalSuggestions && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">
                    Goal Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {currentGoalSuggestion.goalSuggestions.map((goal, i) => (
                      <li key={i} className="text-gray-300">
                        • {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentGoalSuggestion.nextSessionFocus && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">
                    Next Session Focus
                  </h4>
                  <p className="text-gray-300">
                    {currentGoalSuggestion.nextSessionFocus}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowGoalSuggestions(false)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Your Privacy Matters
                </h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <p>
                  Your Reflectionarian sessions are protected with the highest
                  level of privacy:
                </p>

                <ul className="space-y-2 list-disc list-inside">
                  <li>All conversations are end-to-end encrypted</li>
                  <li>Only you can read your session content</li>
                  <li>No personal identifiers are sent to AI services</li>
                  <li>Voice data is processed locally when possible</li>
                  <li>Audio is never stored - only text transcripts</li>
                  <li>You can delete any session at any time</li>
                </ul>

                <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/30">
                  <p className="text-sm">
                    <strong className="text-purple-300">Note:</strong> While AI
                    responses are generated using OpenAI's API, all encryption
                    and decryption happens on our secure servers. Your messages
                    are never exposed in plain text outside our backend.
                  </p>
                </div>

                <p className="text-sm">
                  This is your private space for self-reflection and growth. Not
                  even our team can access your conversations.
                </p>
              </div>

              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
