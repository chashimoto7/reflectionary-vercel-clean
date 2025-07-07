// frontend/ src/components/GoalTips.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import { useAuth } from "../contexts/AuthContext";
import {
  Lightbulb,
  RefreshCw,
  Calendar,
  BookOpen,
  Sparkles,
  Clock,
} from "lucide-react";

export default function GoalTips({ goal }) {
  const { user } = useAuth();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [entryCount, setEntryCount] = useState(0);

  // Load tips when component mounts or goal changes
  useEffect(() => {
    if (goal && user) {
      loadTips();
      loadEntryCount();
    }
  }, [goal?.id, user]);

  const loadTips = async () => {
    if (!goal) return;

    setLoading(true);
    setError(null);

    try {
      // Check if goal has encrypted tips
      if (!goal.encrypted_tips || !goal.tips_iv) {
        setTips([]);
        setLastGenerated(null);
        setLoading(false);
        return;
      }

      // Decrypt the tips
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.decryptKey(
        { encryptedData: goal.encrypted_data_key, iv: goal.data_key_iv },
        masterKey
      );

      const decryptedTipsText = await encryptionService.decryptText(
        goal.encrypted_tips,
        goal.tips_iv,
        dataKey
      );

      const parsedTips = JSON.parse(decryptedTipsText);
      setTips(Array.isArray(parsedTips) ? parsedTips : []);
      setLastGenerated(goal.tips_last_generated);
    } catch (err) {
      console.error("Failed to load tips:", err);
      setError("Failed to load tips. Please try again.");
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEntryCount = async () => {
    if (!goal || !user) return;

    try {
      // Count journal entries from last 3 months that reference this goal
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

      const { count, error } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .contains("goal_ids", [goal.id])
        .gte("created_at", threeMonthsAgo.toISOString());

      if (error) {
        console.error("Error counting entries:", error);
      } else {
        setEntryCount(count || 0);
      }
    } catch (err) {
      console.error("Failed to load entry count:", err);
    }
  };

  const handleGenerateNewTips = async () => {
    if (!goal || !user) return;

    setGenerating(true);
    setError(null);

    try {
      // Call the tip generation API
      const response = await fetch("/api/start-batch-tips-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal_id: goal.id,
          force_regenerate: true, // Force regeneration even if recently generated
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start tip generation");
      }

      // Show success message
      alert(
        "Tip generation started! Your personalized tips will be ready shortly. Check back in a few minutes."
      );

      // Refresh the page or trigger a reload after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Failed to generate tips:", err);
      setError(err.message || "Failed to generate tips. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const shouldShowRegenerateButton = () => {
    if (!lastGenerated) return true; // Never generated
    const daysAgo = getDaysAgo(lastGenerated);
    return daysAgo && daysAgo >= 7; // 7+ days old
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span>Loading your personalized tips...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            Your Personalized Tips
          </h3>
        </div>

        {shouldShowRegenerateButton() && (
          <button
            onClick={handleGenerateNewTips}
            disabled={generating || entryCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              entryCount === 0
                ? "Write journal entries about this goal to get personalized tips"
                : "Generate new tips based on your recent journal entries"
            }
          >
            <RefreshCw
              className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
            />
            {generating ? "Generating..." : "Generate New Tips"}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">
              How Your Tips Are Generated
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              These tips are uniquely yours! Our AI analyzes your journal
              entries from the past 3 months to understand your specific
              challenges, patterns, and what works for you.
            </p>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{entryCount} relevant journal entries</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatDate(lastGenerated)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Display */}
      {tips.length > 0 ? (
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-800 leading-relaxed">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              No Tips Generated Yet
            </h4>
            {entryCount === 0 ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Start writing journal entries about this goal to get
                  personalized tips! The more you write about your experiences,
                  challenges, and progress, the better your tips will be.
                </p>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Tip:</strong> Write about what's working, what's
                    challenging, and specific situations related to this goal.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  You have {entryCount} journal entries about this goal. Click
                  "Generate New Tips" to create personalized recommendations
                  based on your writing.
                </p>
                <button
                  onClick={handleGenerateNewTips}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generating..." : "Generate Your First Tips"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regeneration Info */}
      {tips.length > 0 && !shouldShowRegenerateButton() && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Tips were generated {getDaysAgo(lastGenerated)} days ago. You can
              generate new tips in {7 - getDaysAgo(lastGenerated)} days, or when
              you have more journal entries about this goal.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
