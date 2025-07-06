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
import GoalTrackingTab from "../components/reflectionarian/tabs/GoalTrackingTab";
import WeeklyReportTab from "../components/reflectionarian/tabs/WeeklyReportTab";
import GrowthTimelineTab from "../components/reflectionarian/tabs/GrowthTimelineTab";
import ExportSessionsTab from "../components/reflectionarian/tabs/ExportSessionsTab";

const PremiumReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess, tier } = useMembership();

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

  // Pro Features State
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showGrowthTimeline, setShowGrowthTimeline] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [weeklyReportData, setWeeklyReportData] = useState(null);

  // Audio State
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

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
    { id: "goals", label: "Goal Tracking", icon: Target },
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
  };

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load user preferences from backend
  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const response = await fetch(
        `/api/reflectionarian/preferences?user_id=${user.id}`
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
      const response = await fetch("/api/reflectionarian/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          preferences: newPrefs,
        }),
      });

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
        `/api/reflectionarian/sessions?user_id=${user.id}`
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
        `/api/reflectionarian/messages?session_id=${sessionId}&user_id=${user.id}`
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
      const response = await fetch("/api/reflectionarian/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          tier: "premium",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
        setMessages([]);
        await loadSessions(); // Refresh session list
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  // End current session
  const endSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `/api/reflectionarian/sessions/${sessionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            status: "completed",
          }),
        }
      );

      if (response.ok) {
        // Generate session suggestions
        await generateSessionSuggestions();

        setSessionId(null);
        setMessages([]);
        setShowEndSessionModal(false);
        await loadSessions(); // Refresh session list
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Ensure we have a session
      if (!sessionId) {
        await startNewSession();
      }

      // Send message to backend
      const response = await fetch("/api/reflectionarian/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          message: userMessage,
          session_id: sessionId,
          tier: "premium",
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add AI response to messages
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
          metadata: data.metadata,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Handle any metadata (insights, suggestions, etc.)
        if (data.metadata?.prompts) {
          setSessionPrompts((prev) => [...prev, ...data.metadata.prompts]);
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate session suggestions
  const generateSessionSuggestions = async () => {
    if (messages.length < 3) return;

    try {
      const response = await fetch("/api/reflectionarian/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          session_id: sessionId,
          therapy_approach: preferences.therapy_approach,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowGoalSuggestions(true);
        setCurrentGoalSuggestion(data);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  // Export session
  const exportSession = async (format = "pdf") => {
    try {
      const response = await fetch("/api/reflectionarian/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          session_id: sessionId,
          format: format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reflectionarian-session-${sessionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting session:", error);
      alert("Failed to export session. Please try again.");
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Audio functions (using Web Speech API)
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentMessage((prev) => prev + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakMessage = (text) => {
    if (!audioEnabled || !("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.voice =
      speechSynthesis
        .getVoices()
        .find(
          (voice) =>
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Samantha") ||
            voice.gender === "female"
        ) || speechSynthesis.getVoices()[0];

    speechSynthesis.speak(utterance);
  };

  // Render loading state
  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading your Reflectionarian...</p>
        </div>
      </div>
    );
  }

  // Render onboarding if needed
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Welcome to Premium Reflectionarian
            </h2>
            {/* Onboarding steps would go here */}
            <button
              onClick={() => {
                savePreferences(preferences);
                setShowOnboarding(false);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-300" />
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Premium Reflectionarian
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </h1>
                  <p className="text-purple-200 text-sm">
                    Your AI companion for deep self-discovery
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sessionId && (
                <button
                  onClick={() => setShowEndSessionModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  End Session
                </button>
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

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {proTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-purple-200 mt-20">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">
                      Welcome to your Premium Reflectionarian session
                    </p>
                    <p className="text-sm opacity-75">
                      Share your thoughts, and I'll help you explore them deeply
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white border border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.role === "assistant" && (
                          <Brain className="w-5 h-5 mt-1 text-purple-300" />
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {message.metadata?.prompts && (
                            <div className="mt-3 pt-3 border-t border-white/20">
                              <p className="text-sm text-purple-300 mb-2">
                                Reflection prompts:
                              </p>
                              <ul className="space-y-1 text-sm">
                                {message.metadata.prompts.map((prompt, i) => (
                                  <li key={i} className="text-purple-200">
                                    • {prompt}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {message.role === "assistant" && audioEnabled && (
                          <button
                            onClick={() => speakMessage(message.content)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Volume2 className="w-4 h-4 text-purple-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-purple-300 animate-pulse" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-white/10 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-3 rounded-lg transition-colors ${
                      audioEnabled
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    {audioEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`p-3 rounded-lg transition-colors ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-white/10 text-purple-200 hover:bg-white/20"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <textarea
                    ref={chatInputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    className="flex-1 bg-white/10 text-white placeholder-purple-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20"
                    rows="3"
                    disabled={isLoading}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === "prompts" && (
            <SessionPromptsTab
              prompts={sessionPrompts}
              onSavePrompt={(prompt) => {
                // Save to journal prompts
                console.log("Save prompt:", prompt);
              }}
            />
          )}

          {activeTab === "goals" && (
            <GoalTrackingTab sessionId={sessionId} userId={user.id} />
          )}

          {activeTab === "report" && (
            <WeeklyReportTab
              userId={user.id}
              onGenerateReport={() => {
                // Generate weekly report
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
              onExport={exportSession}
            />
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Reflectionarian Settings
                </h2>
                {/* Settings form would go here */}
              </div>
            </div>
          )}
        </div>

        {/* End Session Modal */}
        {showEndSessionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                End Session?
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to end this session? You'll receive
                personalized suggestions and can start a new session anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndSessionModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Continue Session
                </button>
                <button
                  onClick={endSession}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  End & Get Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Suggestions Modal */}
        {showGoalSuggestions && currentGoalSuggestion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Session Insights & Suggestions
              </h3>

              {currentGoalSuggestion.journalPrompts && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">
                    Journal Prompts
                  </h4>
                  <ul className="space-y-2">
                    {currentGoalSuggestion.journalPrompts.map((prompt, i) => (
                      <li key={i} className="text-gray-300">
                        • {prompt}
                      </li>
                    ))}
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
