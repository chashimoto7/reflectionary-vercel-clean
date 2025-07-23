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
  Star,
  AlertCircle,
  Pause,
  Play,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import MoodTracker from "../components/reflectionarian/MoodTracker";
import SessionPromptsTab from "../components/reflectionarian/tabs/SessionPromptsTab";
import GoalTrackingTab from "../components/reflectionarian/tabs/GoalTrackingTab";

// API Base URL
const API_BASE =
  import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

const PremiumReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess, tier } = useMembership();

  // Onboarding & Preferences State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Mood State
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [sessionMood, setSessionMood] = useState(null);

  // Session & Features State
  const [sessionPrompts, setSessionPrompts] = useState([]);
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const [currentGoalSuggestion, setCurrentGoalSuggestion] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [bookmarkedMessages, setBookmarkedMessages] = useState([]);

  // Voice State
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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

  // Pro Features Tabs - Updated to remove Weekly Report and Export
  const proTabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "prompts", label: "Session Prompts", icon: BookOpen },
    { id: "goals", label: "Goal Tracking", icon: Target },
    { id: "bookmarks", label: "Key Moments", icon: Star },
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
      // Load these independently so one failure doesn't block others
      loadPreferences().catch(console.error);
      loadSessions().catch(console.error);
      loadBookmarks().catch(console.error);
    }
  }, [user, hasAccess]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentMessage((prev) => prev + finalTranscript);
          setCurrentTranscript("");
        } else {
          setCurrentTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load user preferences from backend
  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/preferences?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
        } else {
          // First time user - use defaults
          setPreferences(defaultPreferences);
        }
      } else if (response.status === 404) {
        // No preferences found - use defaults
        setPreferences(defaultPreferences);
      } else {
        console.error("Error response:", response.status);
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
          headers: {
            "Content-Type": "application/json",
          },
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
        `${API_BASE}/api/reflectionarian/sessions?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
        `${API_BASE}/api/reflectionarian/messages?session_id=${sessionId}&user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Load bookmarks
  const loadBookmarks = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/bookmarks?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookmarkedMessages(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  // Start a new session
  const startNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reflectionarian/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          tier: "premium",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
        setMessages([]);
        setShowMoodTracker(true); // Show mood tracker for new session
        await loadSessions(); // Refresh session list
      } else {
        console.error("Failed to start session:", response.status);
        alert("Failed to start a new session. Please try again.");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start a new session. Please check your connection.");
    }
  };

  // Save mood tracking
  const saveMoodTracking = async (moodData) => {
    try {
      const response = await fetch(`${API_BASE}/api/reflectionarian/mood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          session_id: sessionId,
          ...moodData,
        }),
      });

      if (response.ok) {
        setSessionMood(moodData);
        setShowMoodTracker(false);
      }
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };

  // End current session
  const endSession = async () => {
    if (!sessionId) return;

    // Generate suggestions before ending
    await generateSessionSuggestions();

    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            status: "completed",
          }),
        }
      );

      if (response.ok) {
        setSessionId(null);
        setMessages([]);
        setSessionMood(null);
        await loadSessions(); // Refresh session list
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);

    // Add user message to chat
    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch(`${API_BASE}/api/reflectionarian/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          message: userMessage,
          session_id: sessionId,
          tier: "premium",
          mood: sessionMood,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          canBookmark: true,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Use TTS if voice is enabled
        if (voiceEnabled) {
          speakMessage(data.response);
        }

        // Update session prompts if provided
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
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            session_id: sessionId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShowGoalSuggestions(true);
        setCurrentGoalSuggestion(data);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  // Bookmark a message
  const bookmarkMessage = async (messageId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/bookmarks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            message_id: messageId,
            session_id: sessionId,
          }),
        }
      );

      if (response.ok) {
        await loadBookmarks();
      }
    } catch (error) {
      console.error("Error bookmarking message:", error);
    }
  };

  // Voice functions
  const toggleListening = () => {
    if (!speechRecognition) return;

    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
      setIsListening(true);
    }
  };

  const speakMessage = async (text) => {
    if (!voiceEnabled) return;

    setIsSpeaking(true);

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova", // or "alloy", "echo", "fable", "onyx", "shimmer"
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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

  // Render main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <MoodTracker
          onSubmit={saveMoodTracking}
          onSkip={() => setShowMoodTracker(false)}
        />
      )}

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Important Notice</h3>
            </div>
            <p className="text-white/80 mb-6">
              The Reflectionarian is an AI companion designed to help you
              explore your thoughts and feelings. It is{" "}
              <strong>not a therapist</strong> and does not provide medical
              advice, therapy, or diagnoses. If you're experiencing a mental
              health crisis or need professional help, please contact a licensed
              mental health professional or emergency services.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Premium Reflectionarian
                <Crown className="w-5 h-5 text-yellow-400" />
              </h1>
              <p className="text-sm text-white/70">
                Your AI-powered reflection companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDisclaimer(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Important Notice"
            >
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </button>
            {sessionId ? (
              <button
                onClick={() => setShowEndSessionModal(true)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
              >
                End Session
              </button>
            ) : (
              <button
                onClick={startNewSession}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
              >
                Start New Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {proTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Chat Tab */}
          {activeTab === "chat" && sessionId && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 mt-20">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
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
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/10 text-white/90"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.canBookmark && (
                          <button
                            onClick={() => bookmarkMessage(message.id)}
                            className="mt-2 text-xs text-white/50 hover:text-white/70 flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Bookmark
                          </button>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold">You</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    onClick={toggleListening}
                    className={`p-3 rounded-lg transition-all ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        currentTranscript || "Share your thoughts..."
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                      disabled={isLoading}
                    />
                    {currentTranscript && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                        <p className="text-white/50 italic">
                          {currentTranscript}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-3 rounded-lg transition-all ${
                      voiceEnabled
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Session State */}
          {activeTab === "chat" && !sessionId && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <Brain className="w-24 h-24 mx-auto mb-6 text-white/30" />
              <h3 className="text-2xl font-bold mb-4">No Active Session</h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Start a new session to begin your reflection journey. Your mood
                will be tracked to provide personalized support.
              </p>
              <button
                onClick={startNewSession}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all text-lg font-medium"
              >
                Start New Session
              </button>
            </div>
          )}

          {/* Session Prompts Tab */}
          {activeTab === "prompts" && (
            <SessionPromptsTab userId={user.id} tier="premium" />
          )}

          {/* Goal Tracking Tab */}
          {activeTab === "goals" && (
            <GoalTrackingTab
              userId={user.id}
              suggestions={currentGoalSuggestion?.goals || []}
            />
          )}

          {/* Key Moments Tab */}
          {activeTab === "bookmarks" && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Key Moments
              </h3>
              {bookmarkedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <p className="text-white/50">No bookmarked moments yet</p>
                  <p className="text-sm text-white/40 mt-2">
                    Star important messages during your conversations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarkedMessages.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <p className="text-white/90 mb-2">
                        {bookmark.message_content}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/50">
                          {new Date(bookmark.created_at).toLocaleDateString()}
                        </p>
                        {bookmark.note && (
                          <p className="text-sm text-white/70 italic">
                            {bookmark.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* End Session Modal */}
      {showEndSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">End Session?</h3>
            <p className="text-white/70 mb-6">
              I'll generate personalized goals and prompts based on our
              conversation. You can review them in your settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
              >
                Continue Session
              </button>
              <button
                onClick={() => {
                  endSession();
                  setShowEndSessionModal(false);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all"
              >
                End & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Suggestions Modal */}
      {showGoalSuggestions && currentGoalSuggestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              Session Insights & Suggestions
            </h3>

            {/* Goals */}
            {currentGoalSuggestion.goals?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Suggested Goals
                </h4>
                <div className="space-y-3">
                  {currentGoalSuggestion.goals.map((goal, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <p className="text-white/90">{goal.text}</p>
                      <p className="text-sm text-white/50 mt-1">
                        Timeframe: {goal.timeframe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompts */}
            {currentGoalSuggestion.prompts?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Reflection Prompts
                </h4>
                <div className="space-y-3">
                  {currentGoalSuggestion.prompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <p className="text-white/90">{prompt.text}</p>
                      <p className="text-sm text-white/50 mt-1">
                        Category: {prompt.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGoalSuggestions(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumReflectionarian;
