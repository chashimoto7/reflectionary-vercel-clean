// frontend/ src/components/ReflectionarianRecommendations.jsx
// Reusable component for managing Reflectionarian recommendations

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  Plus,
  Trash2,
  BookOpen,
  Target,
  Clock,
  Star,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Component for displaying prompt suggestions (used in Advanced Journaling)
export const PromptRecommendations = ({ onSelectPrompt }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load prompt suggestions
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://reflectionary.ca/api/reflectionarian/get-prompt-suggestions?user_id=${user?.id}&status=available`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load suggestions");
      }

      setSuggestions(result.suggestions || []);
    } catch (err) {
      console.error("❌ Error loading prompt suggestions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use a prompt suggestion (moves it to active prompts and marks as used)
  const usePrompt = async (suggestion) => {
    try {
      // Update database to mark as used
      const response = await fetch(
        "https://reflectionary.ca/api/reflectionarian/update-prompt-suggestion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion_id: suggestion.id,
            user_id: user?.id,
            action: "use",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update suggestion status");
      }

      // Call the parent callback to actually use the prompt
      onSelectPrompt(suggestion.suggested_prompt_text);

      // Remove from local state
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (err) {
      console.error("❌ Error using prompt:", err);
      alert("Sorry, there was an issue using that prompt. Please try again.");
    }
  };

  // Delete a suggestion
  const deleteSuggestion = async (suggestionId) => {
    try {
      const response = await fetch(
        "https://reflectionary.ca/api/reflectionarian/delete-prompt-suggestion",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion_id: suggestionId,
            user_id: user?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete suggestion");
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (err) {
      console.error("❌ Error deleting suggestion:", err);
      alert("Sorry, there was an issue deleting that suggestion.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSuggestions();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white border border-purple-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">
            Reflectionarian Recommendations
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-600">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">
            Error Loading Recommendations
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadSuggestions}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">
            Reflectionarian Recommendations
          </h3>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
            {suggestions.length}
          </span>
        </div>
        <button
          onClick={loadSuggestions}
          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No new recommendations yet</p>
          <p className="text-sm text-gray-400">
            Start a conversation with your Reflectionarian to get personalized
            prompts!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-purple-50 border border-purple-100 rounded-lg p-4 group hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2 font-medium">
                    "{suggestion.suggested_prompt_text}"
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{suggestion.suggestion_type}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => usePrompt(suggestion)}
                    className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors flex items-center space-x-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Use Prompt</span>
                  </button>
                  <button
                    onClick={() => deleteSuggestion(suggestion.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete suggestion"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for displaying goal suggestions (used in Advanced Goals)
export const GoalRecommendations = ({ onCreateGoal }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load goal suggestions
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://reflectionary.ca/api/reflectionarian/get-goal-suggestions?user_id=${user?.id}&status=available`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load suggestions");
      }

      setSuggestions(result.suggestions || []);
    } catch (err) {
      console.error("❌ Error loading goal suggestions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Accept a goal suggestion (create actual goal)
  const acceptGoal = async (suggestion) => {
    try {
      // Call parent callback to create the goal
      if (onCreateGoal) {
        await onCreateGoal({
          title: suggestion.suggested_goal_text,
          description: suggestion.suggestion_rationale || "",
          priority: suggestion.suggestion_priority || "medium",
          source: "reflectionarian",
        });
      }

      // Update database to mark as accepted
      const response = await fetch(
        "https://reflectionary.ca/api/reflectionarian/update-goal-suggestion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion_id: suggestion.id,
            user_id: user?.id,
            action: "accept",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update suggestion status");
      }

      // Remove from local state
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (err) {
      console.error("❌ Error accepting goal:", err);
      alert("Sorry, there was an issue creating that goal. Please try again.");
    }
  };

  // Dismiss a suggestion
  const dismissSuggestion = async (suggestionId) => {
    try {
      const response = await fetch(
        "https://reflectionary.ca/api/reflectionarian/update-goal-suggestion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion_id: suggestionId,
            user_id: user?.id,
            action: "dismiss",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to dismiss suggestion");
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (err) {
      console.error("❌ Error dismissing suggestion:", err);
      alert("Sorry, there was an issue dismissing that suggestion.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSuggestions();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Reflectionarian Goal Suggestions
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">
            Error Loading Suggestions
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadSuggestions}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Reflectionarian Goal Suggestions
          </h3>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {suggestions.length}
          </span>
        </div>
        <button
          onClick={loadSuggestions}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Refresh suggestions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No new goal suggestions yet</p>
          <p className="text-sm text-gray-400">
            Have deeper conversations with your Reflectionarian to get
            personalized goals!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-blue-50 border border-blue-100 rounded-lg p-4 group hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-gray-900 font-medium mb-2">
                    {suggestion.suggested_goal_text}
                  </h4>
                  {suggestion.suggestion_rationale && (
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.suggestion_rationale}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{suggestion.suggestion_priority} priority</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => acceptGoal(suggestion)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Goal</span>
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Dismiss suggestion"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
