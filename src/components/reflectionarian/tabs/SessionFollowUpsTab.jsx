// src/components/reflectionarian/tabs/SessionFollowUpsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MessageCircle,
  Brain,
  Play,
  Eye,
  Clock,
  TrendingUp,
  Heart,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const API_BASE = "https://reflectionary-api.vercel.app";

const SessionFollowUpsTab = ({
  userId,
  onContinueSession,
  onReviewSession,
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, recent, completed
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionInsights, setSessionInsights] = useState({}); // Cache insights

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/sessions?user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        const sessionsWithInsights = await Promise.all(
          (data.sessions || []).map(async (session) => {
            // Try to load cached insights for each session
            const insights = await loadSessionInsights(session.id);
            return {
              ...session,
              insights: insights,
              hasInsights: !!insights,
            };
          })
        );
        setSessions(sessionsWithInsights);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionInsights = async (sessionId) => {
    // Check if we already have insights cached
    if (sessionInsights[sessionId]) {
      return sessionInsights[sessionId];
    }

    try {
      // Try to load from database or generate if not exists
      const { data, error } = await supabase
        .from("reflectionarian_sessions")
        .select(
          "key_themes, dominant_emotion, breakthrough_flagged, session_summary"
        )
        .eq("id", sessionId)
        .single();

      if (!error && data) {
        const insights = {
          keyThemes: data.key_themes || [],
          primaryEmotion: data.dominant_emotion || "Reflective",
          hasBreakthrough: data.breakthrough_flagged || false,
          summary: data.session_summary || null,
        };

        // Cache the insights
        setSessionInsights((prev) => ({
          ...prev,
          [sessionId]: insights,
        }));

        return insights;
      }
    } catch (error) {
      console.error("Error loading session insights:", error);
    }

    return null;
  };

  const generateInsightsForSession = async (sessionId) => {
    try {
      // Load session messages
      const response = await fetch(
        `${API_BASE}/api/reflectionarian/messages?session_id=${sessionId}&user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];

        if (messages.length > 0) {
          // Generate basic insights locally
          const insights = analyzeSessionLocally(messages);

          // Save insights back to the session record
          await supabase
            .from("reflectionarian_sessions")
            .update({
              key_themes: insights.keyThemes,
              dominant_emotion: insights.primaryEmotion,
              breakthrough_flagged: insights.hasBreakthrough,
              session_summary: insights.summary,
            })
            .eq("id", sessionId);

          // Update local state
          setSessionInsights((prev) => ({
            ...prev,
            [sessionId]: insights,
          }));

          // Update sessions list
          setSessions((prev) =>
            prev.map((session) =>
              session.id === sessionId
                ? { ...session, insights, hasInsights: true }
                : session
            )
          );

          return insights;
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    }

    return null;
  };

  const analyzeSessionLocally = (messages) => {
    const userMessages = messages.filter((m) => m.role === "user");
    const allText = userMessages.map((m) => m.content.toLowerCase()).join(" ");

    // Extract themes
    const themes = extractThemes(allText);

    // Detect emotional tone
    const emotion = detectPrimaryEmotion(allText);

    // Check for breakthrough indicators
    const hasBreakthrough = checkForBreakthrough(userMessages);

    // Generate summary
    const summary = `Session with ${
      userMessages.length
    } user messages exploring themes: ${themes.slice(0, 3).join(", ")}`;

    return {
      keyThemes: themes.slice(0, 5),
      primaryEmotion: emotion,
      hasBreakthrough: hasBreakthrough,
      summary: summary,
    };
  };

  const extractThemes = (text) => {
    const themeKeywords = {
      "Self-Reflection": ["think", "feel", "realize", "understand", "aware"],
      Relationships: ["relationship", "family", "friend", "partner", "love"],
      "Work & Career": [
        "work",
        "job",
        "career",
        "boss",
        "stress",
        "productivity",
      ],
      "Emotional Processing": [
        "emotion",
        "angry",
        "sad",
        "happy",
        "anxious",
        "worried",
      ],
      "Personal Growth": [
        "grow",
        "learn",
        "change",
        "better",
        "improve",
        "develop",
      ],
      "Life Changes": [
        "change",
        "transition",
        "new",
        "different",
        "move",
        "start",
      ],
      Challenges: ["difficult", "hard", "struggle", "problem", "challenge"],
      "Goals & Future": ["goal", "want", "hope", "plan", "future", "dream"],
      "Mental Health": ["therapy", "mental", "health", "depression", "anxiety"],
      Mindfulness: ["mindful", "present", "meditation", "breathing", "calm"],
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

    return themes.sort((a, b) => b.relevance - a.relevance).map((t) => t.theme);
  };

  const detectPrimaryEmotion = (text) => {
    const emotionKeywords = {
      Hopeful: ["hope", "optimistic", "positive", "excited", "motivated"],
      Contemplative: ["think", "wonder", "consider", "reflect", "ponder"],
      Concerned: ["worried", "anxious", "stressed", "nervous", "uncertain"],
      Grateful: ["grateful", "thankful", "appreciate", "blessed"],
      Determined: ["determined", "focused", "committed", "will", "must"],
      Processing: [
        "processing",
        "working",
        "trying",
        "figuring",
        "understanding",
      ],
    };

    let maxCount = 0;
    let primaryEmotion = "Reflective";

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const count = keywords.reduce((acc, keyword) => {
        return acc + (text.split(keyword).length - 1);
      }, 0);

      if (count > maxCount) {
        maxCount = count;
        primaryEmotion = emotion;
      }
    }

    return primaryEmotion;
  };

  const checkForBreakthrough = (messages) => {
    return messages.some(
      (message) =>
        message.content.length > 300 || // Long, detailed messages
        message.content.toLowerCase().includes("realize") ||
        message.content.toLowerCase().includes("understand") ||
        message.content.toLowerCase().includes("breakthrough") ||
        message.content.toLowerCase().includes("aha")
    );
  };

  const handleContinueSession = async (session) => {
    if (onContinueSession) {
      onContinueSession(session.id);
    }
  };

  const handleReviewSession = async (session) => {
    if (onReviewSession) {
      onReviewSession(session);
    }
  };

  const handleToggleExpanded = async (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);

      // Generate insights if not already available
      const session = sessions.find((s) => s.id === sessionId);
      if (session && !session.hasInsights) {
        await generateInsightsForSession(sessionId);
      }
    }
  };

  const filteredSessions = sessions.filter((session) => {
    // Filter by status
    if (filterStatus === "recent") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (new Date(session.session_start) < weekAgo) return false;
    } else if (filterStatus === "completed") {
      if (session.status !== "completed") return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const sessionTitle = (session.session_title || "").toLowerCase();
      const themes = session.insights?.keyThemes?.join(" ").toLowerCase() || "";

      if (
        !sessionTitle.includes(searchLower) &&
        !themes.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Session Follow-ups
          </h2>
          <p className="text-gray-300 mt-1">
            Review insights from your past conversations and continue where you
            left off
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions by title or themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Sessions</option>
          <option value="recent">Recent (7 days)</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Sessions Found
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Start a new Reflectionarian session to see insights here"}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
            >
              {/* Session Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {session.session_title || "Untitled Session"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {session.status}
                      </span>
                      {session.insights?.hasBreakthrough && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                          Breakthrough
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(session.session_start)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {session.message_count || 0} messages
                      </span>
                      {session.insights?.primaryEmotion && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {session.insights.primaryEmotion}
                        </span>
                      )}
                    </div>

                    {/* Quick Themes Preview */}
                    {session.insights?.keyThemes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {session.insights.keyThemes
                          .slice(0, 3)
                          .map((theme, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded border border-purple-500/30"
                            >
                              {theme}
                            </span>
                          ))}
                        {session.insights.keyThemes.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded">
                            +{session.insights.keyThemes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {session.status === "active" && (
                      <button
                        onClick={() => handleContinueSession(session)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </button>
                    )}
                    <button
                      onClick={() => handleReviewSession(session)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                    <button
                      onClick={() => handleToggleExpanded(session.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {expandedSession === session.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSession === session.id && session.insights && (
                <div className="border-t border-white/20 bg-white/5 p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* All Themes */}
                    {session.insights.keyThemes?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          All Themes Explored
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {session.insights.keyThemes.map((theme, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded border border-purple-500/30"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Session Summary */}
                    {session.insights.summary && (
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          Session Summary
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {session.insights.summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-3">
                      <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Track Progress
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {sessions.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Your Reflection Journey
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {sessions.length}
              </div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {sessions.filter((s) => s.status === "completed").length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {sessions.filter((s) => s.insights?.hasBreakthrough).length}
              </div>
              <div className="text-sm text-gray-400">Breakthroughs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(
                  sessions.reduce((acc, s) => acc + (s.message_count || 0), 0) /
                    (sessions.length || 1)
                )}
              </div>
              <div className="text-sm text-gray-400">Avg Messages</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionFollowUpsTab;
