// frontend/src/components/reflectionarian/tabs/GoalTrackingTab.jsx
import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle,
  Circle,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  AlertCircle,
  Loader2,
  Flag,
  BarChart3,
  Check,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

// API Base URL - using the correct backend URL
const API_BASE = "https://reflectionary-api.vercel.app";

const GoalTrackingTab = ({ sessionId, userId, preferences, messages }) => {
  const [userGoals, setUserGoals] = useState([]);
  const [sessionGoals, setSessionGoals] = useState([]);
  const [suggestedGoals, setSuggestedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addingGoalId, setAddingGoalId] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Goal categories
  const goalCategories = {
    personal_growth: { label: "Personal Growth", color: "purple" },
    emotional_wellness: { label: "Emotional Wellness", color: "pink" },
    relationships: { label: "Relationships", color: "blue" },
    professional: { label: "Professional", color: "green" },
    health: { label: "Health & Wellness", color: "emerald" },
    mindfulness: { label: "Mindfulness", color: "indigo" },
  };

  useEffect(() => {
    loadUserGoals();
    loadSessionGoals();
    loadSuggestedGoals();
  }, [userId, sessionId]);

  // Load user's existing goals from Premium Goals
  const loadUserGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["not_started", "in_progress"])
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUserGoals(data);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load goals linked to this session
  const loadSessionGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("session_goals")
        .select("*, goals(*)")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSessionGoals(data);
      }
    } catch (error) {
      console.error("Error loading session goals:", error);
    }
  };

  // Load suggested goals from the database
  const loadSuggestedGoals = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/get-goal-suggestions?user_id=${userId}&status=available`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Loaded suggestions:", data);

        // Transform suggestions into the format expected by the component
        const transformed = data.suggestions.map((suggestion) => ({
          id: suggestion.id,
          title:
            suggestion.suggested_goal_text.substring(0, 50) +
            (suggestion.suggested_goal_text.length > 50 ? "..." : ""),
          description: suggestion.suggested_goal_text,
          category: mapSuggestionTypeToCategory(suggestion.suggestion_type),
          rationale: suggestion.suggestion_rationale,
          timeframe: "3_months", // Default timeframe
        }));
        setSuggestedGoals(transformed);
      }
    } catch (error) {
      console.error("Error loading suggested goals:", error);
    }
  };

  const mapSuggestionTypeToCategory = (type) => {
    const mapping = {
      behavioral: "personal_growth",
      emotional: "emotional_wellness",
      cognitive: "mindfulness",
      relational: "relationships",
      professional: "professional",
      health: "health",
    };
    return mapping[type] || "personal_growth";
  };

  // Generate goal suggestions
  const generateGoalSuggestions = async () => {
    setIsGenerating(true);
    try {
      // Call the generate-goals endpoint
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/generate-goals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            messages: messages?.slice(-10), // Last 10 messages for context
            preferences: preferences || {},
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Generated goals:", data);

      if (data.goals && data.goals.length > 0) {
        // Save the generated goals as suggestions
        for (const goal of data.goals) {
          try {
            const saveResponse = await fetch(
              `${API_BASE}/api/reflectionarian/save-goal-suggestion`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_id: userId,
                  session_id: sessionId,
                  goal_text: goal.text,
                  rationale: goal.rationale,
                  suggestion_type: goal.type || "behavioral",
                  priority: goal.priority || "medium",
                  confidence_score: 0.9,
                }),
              }
            );

            if (!saveResponse.ok) {
              console.error("Failed to save goal suggestion");
            }
          } catch (saveError) {
            console.error("Error saving goal:", saveError);
          }
        }

        // Reload suggestions
        await loadSuggestedGoals();
      } else {
        console.log("No goals generated");
      }
    } catch (error) {
      console.error("Error generating goal suggestions:", error);
      alert("Failed to generate goal suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save goal from suggestion to user's goals
  const saveGoalToPremium = async (goal) => {
    setAddingGoalId(goal.id);

    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/create-goal-from-suggestion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            goal_text: goal.description,
            goal_title: goal.title.replace("...", ""),
            category: goal.category,
            description: goal.description,
            suggestion_id: goal.id,
            session_id: sessionId,
            timeframe: goal.timeframe,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Reload goals to show the new one
        await loadUserGoals();

        // Remove from suggested goals
        setSuggestedGoals((prev) => prev.filter((g) => g.id !== goal.id));

        // Optionally, auto-link to session
        if (sessionId && data.goal && data.goal.id) {
          await linkGoalToSession(data.goal.id);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert(`Failed to add goal: ${error.message}`);
    } finally {
      setAddingGoalId(null);
    }
  };

  // Link existing goal to session
  const linkGoalToSession = async (goalId) => {
    try {
      const { error } = await supabase.from("session_goals").insert({
        session_id: sessionId,
        goal_id: goalId,
        user_id: userId,
        linked_at: new Date().toISOString(),
      });

      if (!error) {
        loadSessionGoals();
      }
    } catch (error) {
      console.error("Error linking goal:", error);
    }
  };

  // Update goal progress
  const updateGoalProgress = async (goalId, progress) => {
    try {
      const { error } = await supabase.from("goal_progress").insert({
        goal_id: goalId,
        user_id: userId,
        session_id: sessionId,
        progress_note: progress,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        alert("Progress recorded!");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
          <Check className="w-5 h-5" />
          Goal added successfully!
        </div>
      )}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Goal Tracking
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Connect your personal development goals to this session
            </p>
          </div>
          <button
            onClick={generateGoalSuggestions}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Suggest Goals
              </>
            )}
          </button>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {sessionGoals.length}
            </div>
            <div className="text-xs text-gray-400">Goals This Session</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {userGoals.filter((g) => g.status === "in_progress").length}
            </div>
            <div className="text-xs text-gray-400">Active Goals</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {userGoals.filter((g) => g.status === "completed").length || 0}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Suggested Goals */}
      {suggestedGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-purple-400" />
            Suggested Goals Based on Your Conversation
          </h4>
          {suggestedGoals.map((goal, index) => (
            <div
              key={goal.id || index}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-lg border border-purple-500/30 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-1">{goal.title}</h5>
                  <p className="text-sm text-gray-300 mb-2">
                    {goal.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                      {goalCategories[goal.category]?.label ||
                        "Personal Growth"}
                    </span>
                    {goal.rationale && (
                      <span className="text-xs text-gray-400">
                        • {goal.rationale}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => saveGoalToPremium(goal)}
                  disabled={addingGoalId === goal.id}
                  className="ml-4 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  {addingGoalId === goal.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Add Goal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Goals */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-white">Your Active Goals</h4>
        {userGoals.length > 0 ? (
          <div className="grid gap-3">
            {userGoals.map((goal) => {
              const isLinked = sessionGoals.some(
                (sg) => sg.goal_id === goal.id
              );
              return (
                <div
                  key={goal.id}
                  className={`bg-white/10 backdrop-blur-md rounded-lg border p-4 transition-all ${
                    isLinked
                      ? "border-purple-500/50 bg-purple-600/10"
                      : "border-white/20 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {goal.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <h5 className="font-medium text-white">{goal.title}</h5>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {goal.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {goalCategories[goal.category]?.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(goal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isLinked && (
                        <button
                          onClick={() => linkGoalToSession(goal.id)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
                        >
                          Link to Session
                        </button>
                      )}
                      {isLinked && (
                        <button
                          onClick={() => setSelectedGoal(goal)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                        >
                          Update Progress
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-lg">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">
              No active goals yet. Click "Suggest Goals" to get personalized
              recommendations!
            </p>
          </div>
        )}
      </div>

      {/* Session-Linked Goals */}
      {sessionGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Goals Discussed This Session
          </h4>
          <div className="bg-purple-600/10 backdrop-blur-md rounded-lg border border-purple-500/30 p-4">
            <div className="space-y-2">
              {sessionGoals.map((sg) => (
                <div key={sg.id} className="flex items-center justify-between">
                  <span className="text-white">{sg.goals?.title}</span>
                  <span className="text-xs text-purple-300">
                    Linked {new Date(sg.linked_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Update Progress: {selectedGoal.title}
            </h3>
            <textarea
              placeholder="What progress have you made on this goal?"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 mb-4"
              rows={4}
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  e.preventDefault();
                  updateGoalProgress(selectedGoal.id, e.target.value);
                  setSelectedGoal(null);
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGoal(null)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const textarea = document.querySelector("textarea");
                  updateGoalProgress(selectedGoal.id, textarea.value);
                  setSelectedGoal(null);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GoalTrackingTab;
