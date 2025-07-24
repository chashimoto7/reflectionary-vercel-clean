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
  Plus,
} from "lucide-react";

// API Base URL
const API_BASE =
  import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

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
  const [generatingCategory, setGeneratingCategory] = useState(null);

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

      // Load existing prompts directly from the table
      const { data: existingPrompts, error } = await supabase
        .from("reflectionarian_prompt_suggestions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("used_in_journal", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading prompts:", error);
        throw error;
      }

      // Organize prompts by category
      const organizedPrompts = {
        conversation_starters: [],
        deep_dive: [],
        check_in: [],
        breakthrough: [],
      };

      if (existingPrompts && existingPrompts.length > 0) {
        existingPrompts.forEach((prompt) => {
          const formattedPrompt = {
            id: prompt.id,
            text: prompt.suggested_prompt_text,
            category: prompt.category,
            difficulty_level: prompt.difficulty_level,
            tags: prompt.tags || ["ai-suggested"],
            confidence_score:
              prompt.confidence_score || prompt.relevance_score / 10,
          };

          // Map to appropriate category based on the category field
          switch (prompt.category) {
            case "conversation_starters":
            case "general":
              organizedPrompts.conversation_starters.push(formattedPrompt);
              break;
            case "deep_dive":
              organizedPrompts.deep_dive.push(formattedPrompt);
              break;
            case "check_in":
              organizedPrompts.check_in.push(formattedPrompt);
              break;
            case "breakthrough":
              organizedPrompts.breakthrough.push(formattedPrompt);
              break;
            default:
              organizedPrompts.conversation_starters.push(formattedPrompt);
          }
        });
      }

      // Add default prompts if categories are empty
      if (organizedPrompts.conversation_starters.length === 0) {
        organizedPrompts.conversation_starters = getDefaultPrompts(
          "conversation_starters"
        );
      }

      setPrompts(organizedPrompts);
    } catch (error) {
      console.error("Error loading prompts:", error);
      // Load default prompts on error
      setPrompts({
        conversation_starters: getDefaultPrompts("conversation_starters"),
        deep_dive: getDefaultPrompts("deep_dive"),
        check_in: getDefaultPrompts("check_in"),
        breakthrough: getDefaultPrompts("breakthrough"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPrompts = (category) => {
    const defaults = {
      conversation_starters: [
        {
          id: "default-cs-1",
          text: "What's been on your mind lately that you haven't had a chance to fully process?",
          category: "conversation_starters",
          difficulty_level: "easy",
        },
        {
          id: "default-cs-2",
          text: "If you could change one thing about how you've been feeling recently, what would it be?",
          category: "conversation_starters",
          difficulty_level: "easy",
        },
        {
          id: "default-cs-3",
          text: "What pattern in your life would you like to understand better?",
          category: "conversation_starters",
          difficulty_level: "medium",
        },
      ],
      deep_dive: [
        {
          id: "default-dd-1",
          text: "What core belief about yourself might be limiting your growth?",
          category: "deep_dive",
          difficulty_level: "hard",
        },
        {
          id: "default-dd-2",
          text: "How has your relationship with yourself evolved over the past year?",
          category: "deep_dive",
          difficulty_level: "medium",
        },
      ],
      check_in: [
        {
          id: "default-ci-1",
          text: "On a scale of 1-10, how aligned do you feel with your values today?",
          category: "check_in",
          difficulty_level: "easy",
        },
        {
          id: "default-ci-2",
          text: "What emotion has been most present for you this week?",
          category: "check_in",
          difficulty_level: "easy",
        },
      ],
      breakthrough: [
        {
          id: "default-bt-1",
          text: "What would you attempt if you knew you couldn't fail?",
          category: "breakthrough",
          difficulty_level: "medium",
        },
        {
          id: "default-bt-2",
          text: "What truth about yourself have you been avoiding?",
          category: "breakthrough",
          difficulty_level: "hard",
        },
      ],
    };

    return defaults[category] || [];
  };

  const generateNewPrompts = async (category = null) => {
    const targetCategory = category || activeCategory;
    setIsGenerating(true);
    setGeneratingCategory(targetCategory);

    try {
      // Call the generate prompts endpoint
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/generate-prompts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            category: targetCategory,
            count: 5,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Save the generated prompts directly to the table
        for (const prompt of data.prompts) {
          await supabase.from("reflectionarian_prompt_suggestions").insert({
            user_id: userId,
            suggested_prompt_text: prompt.text,
            category: targetCategory,
            difficulty_level: prompt.difficulty_level || "medium",
            tags: prompt.tags || ["ai-generated"],
            status: "active",
            suggestion_type: mapCategoryToSuggestionType(targetCategory),
            confidence_score: prompt.confidence_score || 0.9,
            generation_context: {
              category: targetCategory,
              generated_at: new Date().toISOString(),
              model: "gpt-4o-mini",
            },
          });
        }

        // Reload prompts to show the new ones
        await loadPrompts();

        // Show success message
        alert(
          `Generated ${data.prompts.length} new prompts for ${
            categories.find((c) => c.id === targetCategory)?.label
          }!`
        );
      } else {
        throw new Error("Failed to generate prompts");
      }
    } catch (error) {
      console.error("Error generating prompts:", error);
      alert("Failed to generate new prompts. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingCategory(null);
    }
  };

  const mapCategoryToSuggestionType = (category) => {
    const mapping = {
      conversation_starters: "reflective",
      deep_dive: "deep_exploration",
      check_in: "check_in",
      breakthrough: "breakthrough",
    };
    return mapping[category] || "general";
  };

  const usePrompt = async (prompt) => {
    try {
      // Mark prompt as used directly in the table
      const { error } = await supabase
        .from("reflectionarian_prompt_suggestions")
        .update({
          used_in_journal: true,
          used_at: new Date().toISOString(),
          usage_count: (prompt.usage_count || 0) + 1,
        })
        .eq("id", prompt.id)
        .eq("user_id", userId);

      if (error) throw error;

      // Navigate to chat tab with this prompt
      // You'll need to pass this up to the parent component
      console.log("Using prompt:", prompt.text);

      // Reload prompts to remove the used one
      await loadPrompts();
    } catch (error) {
      console.error("Error using prompt:", error);
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
              onClick={() => generateNewPrompts()}
              disabled={isGenerating && generatingCategory === activeCategory}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isGenerating && generatingCategory === activeCategory
                    ? "animate-spin"
                    : ""
                }`}
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
                  onClick={() => generateNewPrompts()}
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Generate personalized prompts
                </button>
              )}
            </div>
          ) : (
            getCategoryPrompts().map((prompt, index) => (
              <div
                key={prompt.id || index}
                onClick={() => usePrompt(prompt)}
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
                    {prompt.tags?.includes("ai-suggested") && (
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
