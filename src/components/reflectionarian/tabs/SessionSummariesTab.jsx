// src/components/reflectionarian/tabs/SessionSummariesTab.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MessageCircle,
  Brain,
  Eye,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
  Heart,
  Lightbulb,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SessionSummariesTab = ({
  userId,
  onContinueSession,
  onStartNewSession,
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showConversation, setShowConversation] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [sessionInsights, setSessionInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/sessions?user_id=${userId}&status=completed`
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (session) => {
    setSelectedSession(session);

    // Load conversation messages
    try {
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/messages?session_id=${session.id}&user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setConversationMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }

    // Load or generate insights
    await loadOrGenerateInsights(session);
  };

  const loadOrGenerateInsights = async (session) => {
    setGeneratingInsights(true);
    setSessionInsights(null);

    try {
      // First, try to load existing insights
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/insights?session_id=${session.id}&user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.insights) {
          setSessionInsights(data.insights);
          setGeneratingInsights(false);
          return;
        }
      }

      // If no insights exist, generate them
      if (conversationMessages.length > 0) {
        const generateResponse = await fetch(
          `https://reflectionary-api.vercel.app/api/reflectionarian/insights`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: session.id,
              user_id: userId,
              messages: conversationMessages,
              generate_summary: true,
            }),
          }
        );

        if (generateResponse.ok) {
          const data = await generateResponse.json();
          setSessionInsights(data.insights);
        } else {
          throw new Error("Failed to generate insights");
        }
      }
    } catch (error) {
      console.error("Error with insights:", error);
      setSessionInsights({
        error: true,
        message: "Unable to load insights for this session",
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handleContinueSession = () => {
    if (selectedSession) {
      onContinueSession(selectedSession);
      setShowInsights(false);
      setShowConversation(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Quick session";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-gray-300">Loading your sessions...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Sessions List */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            Session Summaries
          </h3>
          <p className="text-gray-300">
            Review your past reflection sessions and continue conversations
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-gray-400 mb-4">No completed sessions yet</p>
            <button
              onClick={onStartNewSession}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(session.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {session.message_count || 0} messages
                      </span>
                      {session.dominant_emotion && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {session.dominant_emotion}
                        </span>
                      )}
                    </div>

                    {/* Session Summary */}
                    {session.session_summary ? (
                      <p className="text-gray-300 line-clamp-3 mb-3">
                        {session.session_summary}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic mb-3">
                        No summary available
                      </p>
                    )}

                    {/* Key Themes */}
                    {session.key_themes && session.key_themes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {session.key_themes.slice(0, 3).map((theme, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs"
                          >
                            {theme}
                          </span>
                        ))}
                        {session.key_themes.length > 3 && (
                          <span className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-xs">
                            +{session.key_themes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          loadSessionDetails(session);
                          setShowInsights(true);
                        }}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        View Insights
                      </button>
                      <button
                        onClick={() => {
                          loadSessionDetails(session);
                          setShowConversation(true);
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Conversation
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          handleContinueSession();
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Continue
                      </button>
                    </div>
                  </div>

                  {/* Quality Indicator */}
                  {session.session_quality_score && (
                    <div className="ml-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {Math.round(session.session_quality_score * 10)}
                        </div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      {showConversation && selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Session Conversation
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(selectedSession.created_at).toLocaleDateString()}{" "}
                    • {conversationMessages.length} messages
                  </p>
                </div>
                <button
                  onClick={() => setShowConversation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {conversationMessages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-purple-600/20 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-50 mt-2">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConversation(false);
                    setShowInsights(true);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  View Session Summary
                </button>
                <button
                  onClick={handleContinueSession}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Continue This Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {showInsights && selectedSession && (
        <SessionInsightsModal
          isOpen={showInsights}
          onClose={() => {
            setShowInsights(false);
            setSessionInsights(null);
          }}
          insights={sessionInsights}
          isLoading={generatingInsights}
          session={selectedSession}
          onContinueSession={handleContinueSession}
          onViewConversation={() => {
            setShowInsights(false);
            setShowConversation(true);
          }}
        />
      )}
    </div>
  );
};

// Enhanced SessionInsightsModal for both current and historical viewing
export const SessionInsightsModal = ({
  isOpen,
  onClose,
  insights,
  isLoading = false,
  session = null,
  onContinueSession = null,
  onViewConversation = null,
}) => {
  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-8 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">
            Analyzing Your Session
          </h3>
          <p className="text-gray-300 mb-3">
            Conducting deep analysis...
          </p>
          <p className="text-gray-400 text-sm mb-4">
            This can take a few minutes. Please be patient.
          </p>
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs text-gray-500">Processing conversation data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!insights || insights.error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold text-white mb-2">
              Insights Unavailable
            </h3>
            <p className="text-gray-300 mb-6">
              {insights?.message ||
                "Unable to generate insights for this session"}
            </p>
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

  // Success state with insights
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Session Insights
              </h3>
              {session && (
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Session Summary */}
          {insights.sessionSummary && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Session Overview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {insights.sessionSummary.duration ? 
                      `${insights.sessionSummary.duration}m` : 
                      '--'}
                  </div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {insights.sessionSummary.messageCount || '--'}
                  </div>
                  <div className="text-xs text-gray-400">Messages</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {insights.sessionSummary.userMessageCount || '--'}
                  </div>
                  <div className="text-xs text-gray-400">Your Messages</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {insights.emotionalJourney?.intensity || "Moderate"}
                  </div>
                  <div className="text-xs text-gray-400">Intensity</div>
                </div>
              </div>
            </div>
          )}

          {/* Key Themes */}
          {insights.keyThemes && insights.keyThemes.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Themes Explored
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.keyThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Journey */}
          {insights.emotionalJourney && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Emotional Journey
              </h4>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Primary Emotion</span>
                  <span className="text-white font-medium">
                    {insights.emotionalJourney.primaryEmotion}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Progression</span>
                  <span className="text-white font-medium">
                    {insights.emotionalJourney.progression}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Breakthrough Moments */}
          {insights.breakthroughMoments &&
            insights.breakthroughMoments.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Breakthrough Moments
                </h4>
                <div className="space-y-3">
                  {insights.breakthroughMoments.map((moment, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4">
                      <p className="text-white mb-2">{moment.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(moment.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Follow-up Suggestions */}
          {insights.followUpSuggestions &&
            insights.followUpSuggestions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">
                  Reflection Questions
                </h4>
                <ul className="space-y-2">
                  {insights.followUpSuggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-purple-400 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Next Steps */}
          {insights.nextSteps && insights.nextSteps.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-3">
                Recommended Next Steps
              </h4>
              <ul className="space-y-2">
                {insights.nextSteps.map((step, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            {onViewConversation && (
              <button
                onClick={onViewConversation}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                View Full Conversation
              </button>
            )}
            {onContinueSession && (
              <button
                onClick={onContinueSession}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Continue This Session
              </button>
            )}
            {!onContinueSession && !onViewConversation && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummariesTab;
