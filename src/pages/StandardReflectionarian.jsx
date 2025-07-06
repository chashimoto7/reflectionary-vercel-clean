// src/pages/StandardReflectionarian.jsx - Fixed to use backend API
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Settings,
  Trash2,
  Calendar,
  Brain,
  Heart,
  Lightbulb,
  RefreshCw,
  Shield,
  Info,
} from "lucide-react";

const StandardReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess } = useMembership();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Default preferences for Standard tier
  const defaultPreferences = {
    therapy_approach: "Person-Centered",
    communication_style: "Warm and Gentle",
    primary_focus: "General Wellbeing",
    session_frequency: "As Needed",
  };

  useEffect(() => {
    if (user && hasAccess("reflectionarian")) {
      loadPreferences();
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadPreferences = async () => {
    try {
      setLoadingPreferences(true);
      const response = await fetch(
        `/api/reflectionarian/preferences?user_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences || defaultPreferences);
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences(defaultPreferences);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(
        `/api/reflectionarian/sessions?user_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load sessions");
      }

      const data = await response.json();
      setSessions(data.sessions || []);

      // Load the most recent session if exists
      if (data.sessions && data.sessions.length > 0 && !currentSessionId) {
        const latestSession = data.sessions[0];
        setCurrentSessionId(latestSession.id);
        // Note: We'd need another endpoint to load messages for a session
        // For now, we'll just have an empty conversation
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const startNewSession = async () => {
    try {
      const response = await fetch("/api/reflectionarian/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          tier: "standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      setCurrentSessionId(data.session.id);
      setMessages([]);
      await loadSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Create new session if needed
      let sessionId = currentSessionId;
      if (!sessionId) {
        const sessionResponse = await fetch("/api/reflectionarian/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            tier: "standard",
          }),
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to create session");
        }

        const sessionData = await sessionResponse.json();
        sessionId = sessionData.session.id;
        setCurrentSessionId(sessionId);
      }

      // Send message to AI
      const response = await fetch("/api/reflectionarian/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          message: currentMessage,
          session_id: sessionId,
          tier: "standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble responding right now. Please try again.",
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const response = await fetch("/api/reflectionarian/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          preferences: newPrefs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setShowSettings(false);
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const response = await fetch(
        `/api/reflectionarian/sessions?user_id=${user.id}&session_id=${sessionId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      await loadSessions();
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Reflectionarian
          </h2>
          <p className="text-sm text-gray-300">Your AI Wellness Companion</p>
        </div>

        <button
          onClick={startNewSession}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg mb-4 flex items-center justify-center gap-2 transition"
        >
          <MessageCircle className="h-4 w-4" />
          New Session
        </button>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Recent Sessions
          </h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No sessions yet
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  // In a real app, we'd load messages for this session
                  setMessages([]);
                }}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  currentSessionId === session.id
                    ? "bg-purple-600/30 border border-purple-600/50"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      {new Date(session.started_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.message_count || 0} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 mt-4">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Settings className="h-4 w-4" />
            Preferences
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Info className="h-4 w-4" />
            About
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Reflectionarian</h3>
                <p className="text-sm text-gray-300">
                  {preferences?.therapy_approach || "Person-Centered"} Approach
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Shield className="h-4 w-4" />
              End-to-end encrypted
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Welcome to Reflectionarian
              </h3>
              <p className="text-gray-300 max-w-md mx-auto">
                I'm here to support your emotional wellbeing through thoughtful
                conversation. Share what's on your mind, and let's explore
                together.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentMessage("I'd like to talk about my day")
                  }
                  className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg text-sm transition"
                >
                  Talk about my day
                </button>
                <button
                  onClick={() => setCurrentMessage("I'm feeling stressed")}
                  className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg text-sm transition"
                >
                  Discuss stress
                </button>
                <button
                  onClick={() =>
                    setCurrentMessage("Help me reflect on my goals")
                  }
                  className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg text-sm transition"
                >
                  Reflect on goals
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : message.error
                      ? "bg-red-500/20 border border-red-500/40"
                      : "bg-white/10 border border-white/20"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-300">
                      {message.metadata.primary_emotion && (
                        <p>
                          Emotion detected: {message.metadata.primary_emotion}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Share what's on your mind..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 transition"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Reflectionarian provides supportive conversation, not therapy or
            medical advice.
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Conversation Preferences
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Therapy Approach
                </label>
                <select
                  value={preferences?.therapy_approach || "Person-Centered"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      therapy_approach: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="Person-Centered">
                    Person-Centered (Warm & Supportive)
                  </option>
                  <option value="CBT">
                    CBT (Practical & Solution-Focused)
                  </option>
                  <option value="Mindfulness">
                    Mindfulness (Present & Aware)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Communication Style
                </label>
                <select
                  value={preferences?.communication_style || "Warm and Gentle"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      communication_style: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="Warm and Gentle">Warm and Gentle</option>
                  <option value="Direct and Clear">Direct and Clear</option>
                  <option value="Balanced">Balanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Focus
                </label>
                <select
                  value={preferences?.primary_focus || "General Wellbeing"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      primary_focus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="General Wellbeing">General Wellbeing</option>
                  <option value="Stress Management">Stress Management</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Emotional Processing">
                    Emotional Processing
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updatePreferences(preferences)}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              About Reflectionarian
            </h3>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">
                    AI-Powered Support
                  </p>
                  <p>
                    Thoughtful conversations using advanced AI to help you
                    reflect and grow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">
                    Complete Privacy
                  </p>
                  <p>
                    All conversations are encrypted. Only you can read your
                    sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">Not Therapy</p>
                  <p>
                    Reflectionarian provides supportive conversation, not
                    professional therapy or medical advice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">
                    Standard Features
                  </p>
                  <p>
                    Personalized conversations, session history, and
                    customizable approaches.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardReflectionarian;
