// src/components/reflectionarian/modals/SessionInsightsModal.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  Heart,
  TrendingUp,
  BookOpen,
  Calendar,
  ArrowRight,
  CheckCircle,
  X,
  Lightbulb,
  MessageCircle,
  Loader2,
  Target,
} from "lucide-react";

const SessionInsightsModal = ({ sessionId, userId, messages, onClose }) => {
  console.log("🔍 SessionInsightsModal rendered:", {
    sessionId,
    userId,
    hasMessages: !!messages,
    messageCount: messages?.length,
  });

  const [insights, setInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId && messages?.length > 0) {
      generateSessionInsights();
    }
  }, [sessionId, messages]);

  const generateSessionInsights = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log("🧠 Generating AI insights for session:", sessionId);

      // Call the backend AI insights endpoint
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/reflectionarian/insights",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
            messages: messages,
            generate_summary: true, // Get comprehensive AI analysis
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`);
      }

      const data = await response.json();

      if (data.insights) {
        console.log("✅ AI insights generated successfully");
        setInsights(data.insights);
      } else {
        throw new Error("No insights returned from API");
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setError("Failed to generate AI insights, using basic analysis");

      // Fallback to basic local analysis
      const fallbackInsights = analyzeSessionLocally(messages);
      setInsights(fallbackInsights);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple local analysis for now (can be enhanced with AI later)
  const analyzeSessionLocally = async (messages) => {
    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");

    // Calculate basic metrics
    const sessionDuration =
      messages.length > 0
        ? new Date(messages[messages.length - 1].created_at) -
          new Date(messages[0].created_at)
        : 0;

    const durationMinutes = Math.round(sessionDuration / (1000 * 60));

    // Extract themes from user messages (simple keyword analysis)
    const allText = userMessages.map((m) => m.content.toLowerCase()).join(" ");
    const commonThemes = extractThemes(allText);

    // Detect emotional indicators
    const emotionalTone = detectEmotionalTone(allText);

    // Find potential breakthrough moments (longer user messages or emotional language)
    const breakthroughMoments = identifyBreakthroughs(userMessages);

    // Generate follow-up suggestions
    const followUpSuggestions = generateFollowUpSuggestions(
      commonThemes,
      emotionalTone
    );

    return {
      sessionSummary: {
        duration: durationMinutes,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        date: new Date().toLocaleDateString(),
      },
      keyThemes: commonThemes,
      emotionalJourney: {
        primaryEmotion: emotionalTone.primary,
        intensity: emotionalTone.intensity,
        progression: emotionalTone.progression,
      },
      breakthroughMoments: breakthroughMoments,
      followUpSuggestions: followUpSuggestions,
      nextSteps: [
        "Continue exploring the themes that emerged today",
        "Journal about the insights you gained",
        "Consider setting specific goals based on our conversation",
        "Schedule your next session within the next week",
      ],
    };
  };

  const generateFallbackInsights = (messages) => {
    return {
      sessionSummary: {
        duration: 25,
        messageCount: messages.length,
        userMessageCount: messages.filter((m) => m.role === "user").length,
        date: new Date().toLocaleDateString(),
      },
      keyThemes: ["Self-reflection", "Personal growth", "Emotional awareness"],
      emotionalJourney: {
        primaryEmotion: "Thoughtful",
        intensity: "Moderate",
        progression: "Positive",
      },
      breakthroughMoments: [
        {
          message: "You showed great insight in exploring your thoughts today",
          timestamp: new Date().toISOString(),
        },
      ],
      followUpSuggestions: [
        "What resonated most with you from our conversation?",
        "How can you apply today's insights to your daily life?",
        "What would you like to explore further next time?",
      ],
      nextSteps: [
        "Reflect on today's conversation through journaling",
        "Consider setting goals based on our discussion",
        "Schedule your next session",
      ],
    };
  };

  const extractThemes = (text) => {
    const themeKeywords = {
      relationships: [
        "relationship",
        "family",
        "friend",
        "partner",
        "love",
        "connection",
      ],
      work: [
        "work",
        "job",
        "career",
        "boss",
        "colleague",
        "stress",
        "productivity",
      ],
      emotions: [
        "feel",
        "emotion",
        "angry",
        "sad",
        "happy",
        "anxious",
        "worried",
      ],
      growth: ["grow", "learn", "change", "better", "improve", "develop"],
      challenges: [
        "difficult",
        "hard",
        "struggle",
        "problem",
        "challenge",
        "tough",
      ],
      goals: ["goal", "want", "hope", "plan", "future", "dream"],
    };

    const themes = [];
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const count = keywords.reduce((acc, keyword) => {
        return acc + (text.split(keyword).length - 1);
      }, 0);

      if (count > 0) {
        themes.push({ theme, relevance: count });
      }
    }

    return themes
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4)
      .map((t) => t.theme);
  };

  const detectEmotionalTone = (text) => {
    const positiveWords = [
      "good",
      "happy",
      "excited",
      "grateful",
      "hopeful",
      "confident",
    ];
    const negativeWords = [
      "sad",
      "angry",
      "frustrated",
      "worried",
      "anxious",
      "stressed",
    ];
    const neutralWords = ["think", "consider", "maybe", "perhaps", "wonder"];

    let positive = 0,
      negative = 0,
      neutral = 0;

    positiveWords.forEach((word) => (positive += text.split(word).length - 1));
    negativeWords.forEach((word) => (negative += text.split(word).length - 1));
    neutralWords.forEach((word) => (neutral += text.split(word).length - 1));

    const total = positive + negative + neutral;

    if (total === 0) {
      return {
        primary: "Reflective",
        intensity: "Moderate",
        progression: "Steady",
      };
    }

    if (positive > negative && positive > neutral) {
      return { primary: "Positive", intensity: "High", progression: "Upward" };
    } else if (negative > positive && negative > neutral) {
      return {
        primary: "Contemplative",
        intensity: "Moderate",
        progression: "Processing",
      };
    } else {
      return {
        primary: "Thoughtful",
        intensity: "Balanced",
        progression: "Exploring",
      };
    }
  };

  const identifyBreakthroughs = (userMessages) => {
    const breakthroughs = [];

    userMessages.forEach((message, index) => {
      // Look for longer messages (potential deep sharing)
      if (message.content.length > 200) {
        breakthroughs.push({
          message: "Deep reflection and sharing occurred",
          timestamp: message.created_at,
          context: message.content.substring(0, 100) + "...",
        });
      }
    });

    return breakthroughs.slice(0, 2); // Max 2 breakthrough moments
  };

  const generateFollowUpSuggestions = (themes, emotionalTone) => {
    const suggestions = [];

    if (themes.includes("relationships")) {
      suggestions.push(
        "How do your relationships affect your daily well-being?"
      );
    }
    if (themes.includes("emotions")) {
      suggestions.push(
        "What patterns do you notice in your emotional responses?"
      );
    }
    if (themes.includes("growth")) {
      suggestions.push(
        "What's one small step you can take toward personal growth this week?"
      );
    }
    if (themes.includes("challenges")) {
      suggestions.push(
        "What strengths have helped you overcome challenges before?"
      );
    }

    // Add emotion-based suggestions
    if (emotionalTone.primary === "Positive") {
      suggestions.push("How can you maintain this positive momentum?");
    } else if (emotionalTone.primary === "Contemplative") {
      suggestions.push(
        "What support do you need as you process these thoughts?"
      );
    }

    return suggestions.slice(0, 3);
  };

  const handleContinueLater = () => {
    // Save insights to session record for later review
    onClose();
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-8 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">
            Analyzing Your Session
          </h3>
          <p className="text-gray-300 mb-4">
            Generating insights and identifying key themes...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
        </div>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
          <div className="text-center">
            <X className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold text-white mb-2">
              Unable to Generate Insights
            </h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-7 h-7 text-purple-400" />
                Your Reflectionarian Summary
              </h2>
              <p className="text-gray-300 mt-1">
                Your Reflectionarian conversation from{" "}
                {insights?.sessionSummary.date}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">
                {insights?.sessionSummary.duration}m
              </div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">
                {insights?.sessionSummary.userMessageCount}
              </div>
              <div className="text-sm text-gray-400">Your Messages</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <div className="text-lg font-bold text-white capitalize">
                {insights?.emotionalJourney.primaryEmotion}
              </div>
              <div className="text-sm text-gray-400">Primary Emotion</div>
            </div>
          </div>

          {/* Key Themes */}
          {insights?.keyThemes?.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Key Themes Explored
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.keyThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30 capitalize"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Journey */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Emotional Journey
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-400 mb-1">Tone</div>
                <div className="text-white font-medium">
                  {insights?.emotionalJourney.primaryEmotion}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Intensity</div>
                <div className="text-white font-medium">
                  {insights?.emotionalJourney.intensity}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Progression</div>
                <div className="text-white font-medium">
                  {insights?.emotionalJourney.progression}
                </div>
              </div>
            </div>
          </div>

          {/* Breakthrough Moments */}
          {insights?.breakthroughMoments?.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Breakthrough Moments
              </h3>
              <div className="space-y-3">
                {insights.breakthroughMoments.map((moment, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white text-sm">{moment.message}</p>
                    {moment.context && (
                      <p className="text-gray-400 text-xs mt-1 italic">
                        "{moment.context}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Suggestions */}
          {insights?.followUpSuggestions?.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Questions for Further Reflection
              </h3>
              <div className="space-y-2">
                {insights.followUpSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Suggested Next Steps
            </h3>
            <div className="space-y-2">
              {insights?.nextSteps?.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleContinueLater}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all"
            >
              Save Insights
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all"
            >
              Close
            </button>
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 text-center">
              The Reflectionarian provides personal insights for
              self-exploration. It is not a substitute for professional
              counseling, therapy, or medical advice. If you're experiencing
              mental health concerns, please consult a qualified healthcare
              provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInsightsModal;
