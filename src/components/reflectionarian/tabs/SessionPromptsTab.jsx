// frontend/ src/components/reflectionarian/tabs/SessionPromptsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  RefreshCw,
  Save,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  Heart,
  Brain,
  Target,
  Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const SessionPromptsTab = ({ sessionId, userId, preferences, messages }) => {
  const [prompts, setPrompts] = useState([]);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [promptHistory, setPromptHistory] = useState([]);

  // Prompt categories based on approach
  const promptCategories = {
    "CBT/Solution-Focused": [
      { id: "thoughts", label: "Thought Patterns", icon: Brain },
      { id: "behaviors", label: "Behavioral Changes", icon: Target },
      { id: "solutions", label: "Solution Building", icon: Lightbulb },
      { id: "challenges", label: "Challenge Navigation", icon: RefreshCw },
    ],
    "Mindfulness/DBT": [
      { id: "awareness", label: "Present Awareness", icon: Heart },
      { id: "emotions", label: "Emotional Regulation", icon: Heart },
      { id: "grounding", label: "Grounding Exercises", icon: BookOpen },
      { id: "acceptance", label: "Radical Acceptance", icon: Star },
    ],
    "ACT/Positive Psychology": [
      { id: "values", label: "Values Exploration", icon: Star },
      { id: "strengths", label: "Strength Building", icon: Target },
      { id: "meaning", label: "Meaning Making", icon: Heart },
      { id: "action", label: "Committed Action", icon: ChevronRight },
    ],
    "Narrative/Humanistic": [
      { id: "story", label: "Story Exploration", icon: BookOpen },
      { id: "identity", label: "Identity Development", icon: Brain },
      { id: "growth", label: "Personal Growth", icon: Sparkles },
      { id: "connection", label: "Human Connection", icon: Heart },
    ],
  };

  const currentCategories =
    promptCategories[preferences?.therapy_approach] ||
    promptCategories["Narrative/Humanistic"];

  // Load saved prompts and history
  useEffect(() => {
    loadSavedPrompts();
    loadPromptHistory();
  }, [userId]);

  const loadSavedPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_prompts")
        .select("*")
        .eq("user_id", userId)
        .eq("source", "reflectionarian")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSavedPrompts(data);
      }
    } catch (error) {
      console.error("Error loading saved prompts:", error);
    }
  };

  const loadPromptHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("prompt_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPromptHistory(data);
      }
    } catch (error) {
      console.error("Error loading prompt history:", error);
    }
  };

  // Generate AI prompts based on conversation
  const generatePrompts = async (category = null) => {
    setIsGenerating(true);
    try {
      // Get recent messages for context
      const recentMessages = messages.slice(-5);
      const context = recentMessages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await fetch("/api/reflectionarian/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          category: category || selectedCategory,
          approach: preferences.therapy_approach,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate prompts");

      const data = await response.json();
      setPrompts(data.prompts || []);

      // Save to history
      if (data.prompts && data.prompts.length > 0) {
        await supabase.from("prompt_history").insert(
          data.prompts.map((prompt) => ({
            session_id: sessionId,
            user_id: userId,
            prompt_text: prompt.text,
            category: prompt.category,
            created_at: new Date().toISOString(),
          }))
        );
      }
    } catch (error) {
      console.error("Error generating prompts:", error);
      setPrompts([
        {
          text: "What patterns have you noticed in your thoughts this week?",
          category: "reflection",
        },
        {
          text: "How would you like to approach similar situations differently?",
          category: "growth",
        },
        {
          text: "What values are most important to you right now?",
          category: "values",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save prompt to journaling
  const savePromptToJournal = async (prompt) => {
    try {
      const { error } = await supabase.from("custom_prompts").insert({
        user_id: userId,
        prompt_text: prompt.text,
        source: "reflectionarian",
        category: prompt.category || "reflection",
        created_at: new Date().toISOString(),
      });

      if (!error) {
        alert("Prompt saved to your journaling prompts!");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      alert("Failed to save prompt. Please try again.");
    }
  };

  // Save prompt to favorites
  const saveToFavorites = async (prompt) => {
    try {
      const { error } = await supabase.from("saved_prompts").insert({
        user_id: userId,
        prompt_text: prompt.text,
        category: prompt.category,
        source: "reflectionarian",
        created_at: new Date().toISOString(),
      });

      if (!error) {
        loadSavedPrompts();
      }
    } catch (error) {
      console.error("Error saving to favorites:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              Session Prompts
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Personalized prompts based on your conversation
            </p>
          </div>
          <button
            onClick={() => generatePrompts()}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Generate New
              </>
            )}
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === "all"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            All Prompts
          </button>
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                generatePrompts(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Prompts */}
      {prompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white">Suggested Prompts</h4>
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 hover:bg-white/15 transition-colors"
            >
              <p className="text-white mb-3">{prompt.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                  {prompt.category || "reflection"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveToFavorites(prompt)}
                    className="p-2 text-gray-300 hover:text-purple-400 transition-colors"
                    title="Save to favorites"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => savePromptToJournal(prompt)}
                    className="p-2 text-gray-300 hover:text-purple-400 transition-colors"
                    title="Send to journaling"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Favorites */}
      {savedPrompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            Favorite Prompts
          </h4>
          <div className="grid gap-3">
            {savedPrompts.slice(0, 5).map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-3"
              >
                <p className="text-gray-300 text-sm">{prompt.prompt_text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => savePromptToJournal(prompt)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Use in journal →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt History */}
      {promptHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Recent Prompts
          </h4>
          <div className="text-sm text-gray-400">
            {promptHistory.length} prompts generated this session
          </div>
        </div>
      )}

      {/* Empty State */}
      {prompts.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">
            No prompts yet
          </h4>
          <p className="text-gray-400 mb-4">
            Click "Generate New" to get personalized prompts based on your
            conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionPromptsTab;
