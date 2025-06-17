// src/pages/BasicReflectionarian.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  Plus,
  BookOpen,
  Heart,
  Lightbulb,
  History,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ReflectionarianService from "../services/ReflectionarianService";

const BasicReflectionarian = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const reflectionarianService = new ReflectionarianService();

  // Sample conversation starters for Basic tier
  const conversationStarters = [
    "How are you feeling today?",
    "What's been on your mind lately?",
    "Tell me about something you're grateful for",
    "What challenges are you facing right now?",
    "What would you like to reflect on today?",
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load session and messages on mount
  useEffect(() => {
    if (user) {
      loadActiveSession();
      loadRecentEntries();
    }
  }, [user]);

  const loadActiveSession = async () => {
    try {
      setIsLoading(true);

      // Get or create active session
      const sessionResult =
        await reflectionarianService.getOrCreateActiveSession(user.id);
      if (!sessionResult.success) throw new Error(sessionResult.error);

      setCurrentSession(sessionResult.session);

      // Load existing messages
      const messagesResult = await reflectionarianService.getSessionMessages(
        sessionResult.session.id,
        user.id
      );

      if (messagesResult.success) {
        setMessages(messagesResult.messages);
        // Hide welcome if there are existing messages
        if (messagesResult.messages.length > 0) {
          setShowWelcome(false);
        }
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load your conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const result = await reflectionarianService.getRecentEntriesContext(
        user.id
      );
      if (result.success) {
        setRecentEntries(result.entries);
      }
    } catch (err) {
      console.error("Error loading recent entries:", err);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || currentMessage.trim();
    if (!textToSend || isLoading) return;

    // Clear input and hide welcome
    if (!messageText) setCurrentMessage("");
    setShowWelcome(false);
    setError(null);
    setShowPromptSuggestions(false);

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      sender: "user",
      decryptedMessage: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Send to Reflectionarian service
      const result = await reflectionarianService.sendMessage(
        user.id,
        textToSend,
        currentSession?.id
      );

      if (!result.success) throw new Error(result.error);

      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + 1,
        sender: "bot",
        decryptedMessage: result.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        "I'm having trouble responding right now. Please try again in a moment."
      );

      // Remove the user message if the AI failed to respond
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      setIsLoading(true);

      // End current session if exists
      if (currentSession) {
        await reflectionarianService.endSession(currentSession.id, user.id);
      }

      // Start new session
      const result = await reflectionarianService.startSession(user.id);
      if (!result.success) throw new Error(result.error);

      setCurrentSession(result.session);
      setMessages([]);
      setShowWelcome(true);
      setError(null);
    } catch (err) {
      console.error("Error starting new session:", err);
      setError("Failed to start new conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFollowUpPrompt = async () => {
    if (!currentSession || messages.length === 0) return;

    try {
      setIsLoading(true);
      const result = await reflectionarianService.generateFollowUpPrompt(
        user.id,
        currentSession.id
      );

      if (result.success) {
        handleSendMessage(result.prompt);
      }
    } catch (err) {
      console.error("Error generating follow-up prompt:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading && !currentSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Starting your conversation with the Reflectionarian...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Reflectionarian
              </h1>
              <p className="text-sm text-gray-600">
                Your AI companion for reflection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Basic Tier Badge */}
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              Basic
            </div>

            {/* New Session Button */}
            <button
              onClick={handleNewSession}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Welcome State */}
        {showWelcome && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Reflectionarian
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              I'm here to help you reflect on your thoughts, feelings, and
              experiences. Let's have a meaningful conversation about what's on
              your mind.
            </p>

            {/* Basic Tier Features */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                <BookOpen className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Recent Entry Awareness</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                <Lightbulb className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Follow-up Questions</p>
              </div>
            </div>

            {/* Recent Entries Context Preview */}
            {recentEntries.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-purple-100 max-w-md mx-auto mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    I'm aware of your recent journal entries
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Last entry:{" "}
                  {new Date(recentEntries[0]?.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Conversation Starters */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Start with one of these:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {conversationStarters.map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(starter)}
                    className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-purple-50 hover:text-purple-700 border border-gray-200 transition-colors"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "bot" && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">
                {message.decryptedMessage}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.sender === "user"
                    ? "text-purple-200"
                    : "text-gray-500"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.sender === "user" && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-lg max-w-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-purple-100 p-4">
        {/* Follow-up Prompt Button (Basic Tier Feature) */}
        {messages.length > 0 && !isLoading && (
          <div className="flex justify-center mb-3">
            <button
              onClick={generateFollowUpPrompt}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate follow-up question
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!currentMessage.trim() || isLoading}
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Basic Tier Info */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>Aware of last 5 entries</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            <span>Follow-up questions</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>Subject-specific prompts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicReflectionarian;
