// src/components/reflectionarian/tabs/SessionPromptsTab.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  RefreshCw,
  Loader2,
  ChevronRight,
  MessageCircle,
  Search,
  Compass,
  Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const SessionPromptsTab = ({ userId, tier = "standard" }) => {
  const [prompts, setPrompts] = useState({
    conversation_starters: [],
    deep_dive: [],
    check_in: [],
    breakthrough: [],
  });
  const [activeCategory, setActiveCategory] = useState("conversation_starters");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Category configuration
  const categories = [
    {
      id: "conversation_starters",
      label: "Conversation Starters",
      icon: MessageCircle,
      description: "General prompts to begin your reflection",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "deep_dive",
      label: "Deep Dive Topics",
      icon: Search,
      description: "Explore specific themes in depth",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "check_in",
      label: "Check-in Questions",
      icon: Compass,
      description: "Regular self-assessment prompts",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "breakthrough",
      label: "Breakthrough Moments",
      icon: Zap,
      description: "Prompts designed to unlock insights",
      color: "from-orange-500 to-red-500",
    },
  ];

  useEffect(() => {
    loadPrompts();
  }, [userId]);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);

      // Load prompts for each category
      const allPrompts = {};

      for (const category of categories) {
        const response = await fetch(
          `${API_BASE}/api/reflectionarian/prompts?user_id=${userId}&category=${category.id}`
        );

        if (response.ok) {
          const data = await response.json();
          allPrompts[category.id] = data.prompts || [];
        } else {
          allPrompts[category.id] = [];
        }
      }

      // Add some default conversation starters if none exist
      if (allPrompts.conversation_starters.length === 0) {
        allPrompts.conversation_starters = [
          {
            id: "default-1",
            text: "What's been on your mind lately that you haven't had a chance to fully process?",
            category: "conversation_starters",
            difficulty_level: "easy",
          },
          {
            id: "default-2",
            text: "If you could change one thing about how you've been feeling recently, what would it be?",
            category: "conversation_starters",
            difficulty_level: "easy",
          },
          {
            id: "default-3",
            text: "What pattern in your life would you like to understand better?",
            category: "conversation_starters",
            difficulty_level: "medium",
          },
        ];
      }

      setPrompts(allPrompts);
    } catch (error) {
      console.error("Error loading prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPrompts = async () => {
    setIsGenerating(true);
    try {
      // This would trigger the batch generation for this specific user
      const response = await fetch(
        `${API_BASE}/api/batch-processors/weekly/batch-reflectionarian-prompt-generator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_BATCH_API_KEY}`,
          },
          body: JSON.stringify({
            user_id: userId,
            limit: 1,
          }),
        }
      );

      if (response.ok) {
        // Wait a bit then reload prompts
        setTimeout(() => {
          loadPrompts();
        }, 3000);
      }
    } catch (error) {
      console.error("Error generating prompts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryPrompts = () => {
    return prompts[activeCategory] || [];
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white/70">Loading your prompts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`p-4 rounded-xl border transition-all ${
              activeCategory === category.id
                ? "bg-white/10 border-white/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 mx-auto`}
            >
              <category.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-white mb-1">{category.label}</h4>
            <p className="text-xs text-white/50">
              {prompts[category.id]?.length || 0} prompts
            </p>
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {(() => {
                const category = categories.find(
                  (c) => c.id === activeCategory
                );
                const Icon = category?.icon;
                return Icon ? <Icon className="w-6 h-6" /> : null;
              })()}
              {categories.find((c) => c.id === activeCategory)?.label}
            </h3>
            <p className="text-sm text-white/70 mt-1">
              {categories.find((c) => c.id === activeCategory)?.description}
            </p>
          </div>
          {tier === "premium" && (
            <button
              onClick={generateNewPrompts}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
              />
              Generate New
            </button>
          )}
        </div>

        {/* Prompts List */}
        <div className="space-y-3">
          {getCategoryPrompts().length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/50">
                No prompts available in this category
              </p>
              {tier === "premium" && (
                <button
                  onClick={generateNewPrompts}
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                >
                  Generate personalized prompts
                </button>
              )}
            </div>
          ) : (
            getCategoryPrompts().map((prompt, index) => (
              <div
                key={prompt.id || index}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-white/90 flex-1">{prompt.text}</p>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors flex-shrink-0" />
                </div>
                {prompt.difficulty_level && (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                        prompt.difficulty_level
                      )}`}
                    >
                      {prompt.difficulty_level}
                    </span>
                    {prompt.tags && prompt.tags.includes("ai-suggested") && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        AI Suggested
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPromptsTab;
