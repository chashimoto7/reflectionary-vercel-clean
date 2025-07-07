//frontend/ src/pages/AdvancedReflectionarian.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Settings,
  Brain,
  Heart,
  Lightbulb,
  Target,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  CheckCircle,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";

const AdvancedReflectionarian = () => {
  const { user } = useAuth();
  const { membershipData, hasAccess } = useMembership();

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Advanced Features State
  const [detectedMood, setDetectedMood] = useState(null);
  const [adaptiveMode, setAdaptiveMode] = useState("balanced"); // gentle, direct, curious, balanced
  const [sessionPrompts, setSessionPrompts] = useState([]);
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const [currentGoalSuggestion, setCurrentGoalSuggestion] = useState(null);
  const [growthSuggestions, setGrowthSuggestions] = useState([]);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showAdaptiveSettings, setShowAdaptiveSettings] = useState(false);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // ====================================================================
  // ADVANCED FEATURES: MOOD DETECTION & ADAPTIVE RESPONSES
  // ====================================================================

  const detectMoodFromMessage = (message) => {
    const moodIndicators = {
      stressed: {
        keywords: [
          "stressed",
          "overwhelmed",
          "pressure",
          "too much",
          "can't handle",
          "exhausted",
        ],
        weight: 1.2,
        color: "bg-red-100 text-red-800",
        icon: "⚡",
        response_style: "gentle",
      },
      anxious: {
        keywords: [
          "anxious",
          "worried",
          "nervous",
          "scared",
          "panic",
          "racing thoughts",
        ],
        weight: 1.3,
        color: "bg-yellow-100 text-yellow-800",
        icon: "🌀",
        response_style: "calming",
      },
      sad: {
        keywords: ["sad", "down", "depressed", "lonely", "empty", "hopeless"],
        weight: 1.3,
        color: "bg-blue-100 text-blue-800",
        icon: "💙",
        response_style: "supportive",
      },
      excited: {
        keywords: [
          "excited",
          "amazing",
          "great",
          "wonderful",
          "fantastic",
          "love",
        ],
        weight: 1.0,
        color: "bg-green-100 text-green-800",
        icon: "✨",
        response_style: "enthusiastic",
      },
      reflective: {
        keywords: [
          "thinking",
          "wondering",
          "realize",
          "understand",
          "pattern",
          "insight",
        ],
        weight: 0.9,
        color: "bg-purple-100 text-purple-800",
        icon: "🤔",
        response_style: "curious",
      },
      frustrated: {
        keywords: [
          "frustrated",
          "annoyed",
          "angry",
          "unfair",
          "stupid",
          "hate",
        ],
        weight: 1.1,
        color: "bg-orange-100 text-orange-800",
        icon: "🔥",
        response_style: "understanding",
      },
    };

    const messageLower = message.toLowerCase();
    let detectedMood = null;
    let highestScore = 0;

    for (const [mood, config] of Object.entries(moodIndicators)) {
      const matches = config.keywords.filter((keyword) =>
        messageLower.includes(keyword)
      );
      const score = matches.length * config.weight;

      if (score > highestScore && score > 0) {
        highestScore = score;
        detectedMood = {
          mood,
          confidence: Math.min(score / 2, 1),
          ...config,
        };
      }
    }

    return detectedMood;
  };

  const adaptResponseStyle = (mood) => {
    const adaptiveStyles = {
      gentle: {
        name: "Gentle & Supportive",
        description: "Warm, nurturing responses for difficult times",
        icon: Heart,
        color: "text-pink-600",
      },
      calming: {
        name: "Calming & Grounding",
        description: "Soothing responses to reduce anxiety",
        icon: Brain,
        color: "text-blue-600",
      },
      supportive: {
        name: "Supportive & Validating",
        description: "Deep empathy and emotional validation",
        icon: Heart,
        color: "text-blue-600",
      },
      enthusiastic: {
        name: "Enthusiastic & Celebrating",
        description: "Matching your positive energy",
        icon: Sparkles,
        color: "text-green-600",
      },
      curious: {
        name: "Curious & Exploring",
        description: "Thoughtful questions for deeper insight",
        icon: Lightbulb,
        color: "text-purple-600",
      },
      understanding: {
        name: "Understanding & Direct",
        description: "Honest, clear perspective on challenges",
        icon: Target,
        color: "text-orange-600",
      },
      balanced: {
        name: "Balanced & Adaptive",
        description: "Adjusts naturally to your needs",
        icon: Brain,
        color: "text-gray-600",
      },
    };

    if (mood?.response_style && adaptiveStyles[mood.response_style]) {
      setAdaptiveMode(mood.response_style);
      return adaptiveStyles[mood.response_style];
    }

    return adaptiveStyles.balanced;
  };

  // ====================================================================
  // ADVANCED FEATURES: PERSONAL GROWTH SUGGESTIONS
  // ====================================================================

  const generateGrowthSuggestions = (conversation, detectedTopics) => {
    const suggestions = [
      {
        id: 1,
        title: "Mindfulness Check-in Practice",
        description:
          "Based on your recent stress, try a daily 5-minute mindfulness practice",
        category: "stress_management",
        actionable: true,
        icon: "🧘‍♀️",
      },
      {
        id: 2,
        title: "Values Reflection Exercise",
        description:
          "Your conversations show interest in authenticity - explore your core values",
        category: "self_awareness",
        actionable: true,
        icon: "⭐",
      },
      {
        id: 3,
        title: "Boundary Setting Strategy",
        description:
          "Consider developing clearer boundaries in your relationships",
        category: "relationships",
        actionable: true,
        icon: "🛡️",
      },
      {
        id: 4,
        title: "Thought Pattern Tracking",
        description:
          "Try noting your thought patterns when you feel overwhelmed",
        category: "cognitive_awareness",
        actionable: true,
        icon: "📝",
      },
    ];

    // Return random suggestions based on conversation themes
    return suggestions.slice(0, 2);
  };

  // ====================================================================
  // CHAT INTERFACE
  // ====================================================================

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    // Detect mood from message
    const mood = detectMoodFromMessage(currentMessage);
    if (mood) {
      setDetectedMood(mood);
      adaptResponseStyle(mood);
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
      detectedMood: mood,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Real API call to Advanced Reflectionarian endpoint
      const response = await fetch("/api/openai/chat-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          message: currentMessage.trim(),
          sessionId: sessionId,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.response || "Failed to get response");
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        adaptiveStyle: data.adaptiveMode || adaptiveMode,
        sessionPrompts: data.sessionPrompts || [],
        goalSuggestion: data.goalSuggestion || null,
        detectedUserMood: data.detectedMood,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update detected mood and adaptive mode
      if (data.detectedMood) {
        setDetectedMood(data.detectedMood);
      }
      if (data.adaptiveMode) {
        setAdaptiveMode(data.adaptiveMode);
      }

      // Handle session prompts
      if (data.sessionPrompts && data.sessionPrompts.length > 0) {
        setSessionPrompts(data.sessionPrompts);
      }

      // Handle goal suggestions
      if (data.goalSuggestion) {
        setCurrentGoalSuggestion(data.goalSuggestion);
        setShowGoalSuggestions(true);
      }

      // Handle growth suggestions
      if (data.growthSuggestions && data.growthSuggestions.length > 0) {
        setGrowthSuggestions(data.growthSuggestions);
      }

      // Set session ID from response
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I'm having trouble responding right now. Please try again in a moment! 🔧",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Updated functions for AdvancedReflectionarian.jsx
  // Replace the existing placeholder functions with these implementations

  // ====================================================================
  // ADVANCED FEATURES: SESSION PROMPTS & GOAL SUGGESTIONS - REAL IMPLEMENTATION
  // ====================================================================

  const savePromptToJournal = async (prompt) => {
    try {
      console.log("💾 Saving prompt to journal recommendations:", prompt);

      // Prepare the data to send to our API
      const promptData = {
        user_id: user?.id,
        session_id: sessionId,
        prompt_text: prompt,
        context: {
          conversation_type: "advanced",
          generated_at: new Date().toISOString(),
          adaptive_mode: adaptiveMode,
          detected_mood: detectedMood?.mood || "balanced",
        },
        suggestion_type: "adaptive", // Advanced tier uses adaptive suggestions
        confidence_score: 0.75, // Good confidence for Advanced tier prompts
      };

      const response = await fetch(
        "https://reflectionary.ca/api/reflectionarian/save-prompt-suggestion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(promptData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save prompt");
      }

      console.log("✅ Prompt saved successfully:", result.suggestion_id);

      // Show success feedback
      alert("✨ Prompt saved to your Advanced Journaling recommendations!");
    } catch (error) {
      console.error("❌ Error saving prompt:", error);
      alert("Sorry, there was an issue saving the prompt. Please try again.");
    }
  };

  const handleGoalSuggestion = async (action, goalText = null) => {
    try {
      console.log("🎯 Handling goal suggestion:", action, goalText);

      if (action === "accept" && goalText) {
        // Prepare the data to send to our API
        const goalData = {
          user_id: user?.id,
          session_id: sessionId,
          goal_text: goalText,
          rationale:
            "Generated during Advanced Reflectionarian conversation with adaptive mood detection",
          context: {
            conversation_type: "advanced",
            generated_at: new Date().toISOString(),
            adaptive_mode: adaptiveMode,
            detected_mood: detectedMood?.mood || "balanced",
            mood_confidence: detectedMood?.confidence || 0,
          },
          suggestion_type: "adaptive",
          confidence_score: 0.8, // High confidence for Advanced tier goals
          priority: "medium", // Advanced tier gets medium priority
        };

        const response = await fetch(
          "https://reflectionary.ca/api/reflectionarian/save-goal-suggestion",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(goalData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to save goal");
        }

        console.log("✅ Goal saved successfully:", result.suggestion_id);

        // Show success feedback
        alert("🎯 Goal added to your Advanced Goals recommendations!");
      } else if (action === "dismiss") {
        console.log("👋 Goal suggestion dismissed by user");
        // Could track dismissals for improving future suggestions
      }

      // Clear the current goal suggestion from the UI
      setCurrentGoalSuggestion(null);
      setShowGoalSuggestions(false);
    } catch (error) {
      console.error("❌ Error handling goal suggestion:", error);
      if (action === "accept") {
        alert("Sorry, there was an issue saving the goal. Please try again.");
      }
    }
  };

  const handleGrowthSuggestion = async (action, suggestion) => {
    try {
      console.log("🌱 Growth suggestion action:", action, suggestion);

      if (action === "save") {
        // For now, we'll save growth suggestions as goals with a special type
        // In the future, you might want a separate table for growth suggestions
        const goalData = {
          user_id: user?.id,
          session_id: sessionId,
          goal_text: suggestion.description || suggestion.title,
          rationale: `Growth suggestion: ${suggestion.title}`,
          context: {
            conversation_type: "advanced",
            suggestion_category: "growth",
            growth_title: suggestion.title,
            growth_icon: suggestion.icon,
            generated_at: new Date().toISOString(),
            adaptive_mode: adaptiveMode,
          },
          suggestion_type: "growth",
          confidence_score: 0.7,
          priority: "low", // Growth suggestions are lower priority than direct goals
        };

        const response = await fetch(
          "https://reflectionary.ca/api/reflectionarian/save-goal-suggestion",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(goalData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to save growth suggestion");
        }

        console.log(
          "✅ Growth suggestion saved successfully:",
          result.suggestion_id
        );
        alert("🌱 Growth suggestion saved to your Goals recommendations!");
      }

      // Remove suggestion from list
      setGrowthSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestion.id)
      );
    } catch (error) {
      console.error("❌ Error handling growth suggestion:", error);
      if (action === "save") {
        alert(
          "Sorry, there was an issue saving the growth suggestion. Please try again."
        );
      }
    }
  };

  // ====================================================================
  // EFFECTS
  // ====================================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Welcome message for Advanced tier
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hi! I'm your Advanced Reflectionarian - I adapt my responses to match your mood and needs, provide personalized growth suggestions, and can help you explore topics more deeply. What's on your mind today?",
        timestamp: new Date(),
        adaptiveStyle: "balanced",
      },
    ]);
  }, []);

  // ====================================================================
  // LOADING & ACCESS CONTROL
  // ====================================================================

  if (!membershipData?.hasAdvancedReflectionarian) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Advanced Reflectionarian
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Unlock intelligent mood detection, adaptive responses, personalized
          growth suggestions, and deep topic-based conversations with your AI
          companion.
        </p>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
          Upgrade to Advanced
        </button>
      </div>
    );
  }

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Advanced Reflectionarian
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Adaptive mode: {adaptiveMode}</span>
                {detectedMood && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <span>{detectedMood.icon}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${detectedMood.color}`}
                      >
                        {detectedMood.mood}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdaptiveSettings(!showAdaptiveSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Adaptive Settings"
            >
              <Zap className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl px-6 py-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : message.isError
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {/* Adaptive Style Indicator */}
                  {message.role === "assistant" && message.adaptiveStyle && (
                    <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
                      <Zap className="w-3 h-3" />
                      <span>Adaptive mode: {message.adaptiveStyle}</span>
                    </div>
                  )}

                  {/* Detected Mood Indicator */}
                  {message.role === "user" && message.detectedMood && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-white/80">
                        Mood detected:
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${message.detectedMood.color
                          .replace("text-", "text-white bg-")
                          .replace("-800", "-600")}`}
                      >
                        {message.detectedMood.icon} {message.detectedMood.mood}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Session Prompts */}
                  {message.sessionPrompts?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        ✨ Reflection prompts for deeper insight:
                      </p>
                      <div className="space-y-2">
                        {message.sessionPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => savePromptToJournal(prompt)}
                            className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-800 transition-colors flex items-center justify-between"
                          >
                            <span>"{prompt}"</span>
                            <BookOpen className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goal Suggestion */}
                  {message.goalSuggestion && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        🎯 Personalized goal suggestion:
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800 mb-3">
                          "{message.goalSuggestion}"
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleGoalSuggestion(
                                "accept",
                                message.goalSuggestion
                              )
                            }
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Add to Goals
                          </button>
                          <button
                            onClick={() => handleGoalSuggestion("dismiss")}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                          >
                            Not now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Growth Suggestions */}
            {growthSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Personal Growth Suggestions
                  </h3>
                </div>
                <div className="space-y-3">
                  {growthSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-white p-4 rounded-lg border border-green-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{suggestion.icon}</span>
                            <h4 className="font-medium text-gray-900">
                              {suggestion.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {suggestion.description}
                          </p>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {suggestion.category.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() =>
                              handleGrowthSuggestion("save", suggestion)
                            }
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() =>
                              handleGrowthSuggestion("dismiss", suggestion)
                            }
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-gray-600">
                      Adapting to your needs...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex space-x-4">
              <textarea
                ref={messageInputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind - I'll adapt my responses to support you best..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Adaptive Settings Sidebar */}
        {showAdaptiveSettings && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Adaptive Response Settings
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  I automatically detect your mood and adapt my responses. You
                  can also manually set your preferred style.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Response Styles
                </h4>
                <div className="space-y-2">
                  {[
                    {
                      key: "balanced",
                      name: "Balanced & Adaptive",
                      icon: Brain,
                      desc: "Adjusts naturally to your needs",
                    },
                    {
                      key: "gentle",
                      name: "Gentle & Supportive",
                      icon: Heart,
                      desc: "Warm, nurturing responses",
                    },
                    {
                      key: "curious",
                      name: "Curious & Exploring",
                      icon: Lightbulb,
                      desc: "Thoughtful questions for insight",
                    },
                    {
                      key: "understanding",
                      name: "Understanding & Direct",
                      icon: Target,
                      desc: "Clear, honest perspective",
                    },
                  ].map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.key}
                        onClick={() => setAdaptiveMode(style.key)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          adaptiveMode === style.key
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {style.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {style.desc}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {detectedMood && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Current Mood Detection
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{detectedMood.icon}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${detectedMood.color}`}
                    >
                      {detectedMood.mood}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Confidence: {Math.round(detectedMood.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Settings Sidebar */}
        {showSettings && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Advanced Features
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Mood detection & adaptive responses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personal growth suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Session-ending journal prompts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Topic-based context awareness</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Goals integration</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Want even more?
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Upgrade to Pro Reflectionarian for therapy-style structured
                  sessions, weekly reports, and growth timeline tracking.
                </p>
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReflectionarian;
