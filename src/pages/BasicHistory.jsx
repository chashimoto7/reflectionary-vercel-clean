// src/pages/BasicHistory.jsx - Fixed to use backend API
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  FileText,
} from "lucide-react";

const BasicHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const entriesPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, currentPage]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the backend API to get decrypted entries
      const response = await fetch(
        `/api/get-entries?user_id=${user.id}&limit=${entriesPerPage}&offset=${
          (currentPage - 1) * entriesPerPage
        }&parent_only=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const data = await response.json();

      setEntries(data.entries || []);
      setTotalEntries(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / entriesPerPage));
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("Failed to load your journal history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getPreview = (content, maxLength = 150) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading your journal history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchEntries}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Journal History
          </h1>
          <p className="text-gray-300">
            Your journal entries ({totalEntries} total)
          </p>
        </div>

        {/* Entry List */}
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-4">No journal entries yet</p>
            <p className="text-gray-300 mb-6">
              Start your journaling journey today!
            </p>
            <button
              onClick={() => navigate("/journal")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-purple-400/50 transition"
              >
                {/* Entry Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(entry.created_at)}</span>
                        </div>
                      </div>

                      {/* Entry Preview */}
                      <p className="text-gray-100">
                        {entry.prompt && (
                          <span className="text-purple-400 italic mr-2">
                            Prompt: "{entry.prompt}"
                          </span>
                        )}
                        {getPreview(entry.content)}
                      </p>

                      {/* Basic Stats */}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {entry.word_count && (
                          <span className="text-gray-400">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {entry.word_count} words
                          </span>
                        )}
                        {entry.follow_ups && entry.follow_ups.length > 0 && (
                          <span className="text-purple-400">
                            {entry.follow_ups.length} follow-up
                            {entry.follow_ups.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="ml-4 mt-1">
                      {expandedEntries.has(entry.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEntries.has(entry.id) && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    {/* Full Content */}
                    <div
                      className="mt-4 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />

                    {/* Follow-ups */}
                    {entry.follow_ups && entry.follow_ups.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-semibold text-purple-300">
                          Follow-up Reflections
                        </h4>
                        {entry.follow_ups.map((followUp, index) => (
                          <div
                            key={followUp.id}
                            className="ml-4 pl-4 border-l-2 border-purple-600/30"
                          >
                            {followUp.prompt && (
                              <p className="text-sm text-purple-400 italic mb-2">
                                {followUp.prompt}
                              </p>
                            )}
                            <div
                              className="text-sm text-gray-300 prose prose-sm prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: followUp.content,
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(followUp.created_at)} at{" "}
                              {formatTime(followUp.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upgrade Prompt for Basic Users */}
                    <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-200">
                        <strong>Upgrade to Standard</strong> to see mood
                        tracking, emotions, and AI-powered insights for your
                        entries.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Basic Tier Info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Basic members can view their journal entries and follow-ups.
            <br />
            Upgrade for advanced analytics, mood tracking, and AI insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicHistory;
