// frontend/ src/pages/StandardHistory.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Brain,
  Heart,
  BarChart,
} from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const dateRange = searchParams.get("range") || "3months";

  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Redirect if locked
  useEffect(() => {
    if (isLocked) {
      navigate("/dashboard");
    }
  }, [isLocked, navigate]);

  // Fetch entries when user or page changes
  useEffect(() => {
    if (user && !isLocked) {
      fetchEntries();
    }
  }, [user, isLocked, page, dateRange]);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/history?user_id=${user.id}&page=${page}&limit=20&date_range=${dateRange}&include_analytics=true`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data = await response.json();

      setEntries(data.entries || []);
      setAnalytics(data.analytics || null);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load your journal history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString(), range: dateRange });
  };

  const handleDateRangeChange = (newRange) => {
    setSearchParams({ page: "1", range: newRange });
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

  const getContentPreview = (content, maxLength = 200) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.textContent || div.innerText || "";

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Journal History
          </h1>
          <p className="text-gray-300">
            Explore your past entries and track your journey
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          {/* Analytics Toggle */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition"
          >
            <BarChart className="h-5 w-5" />
            {showAnalytics ? "Hide" : "Show"} Analytics
          </button>
        </div>

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Entries */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold">
                  {analytics.totalEntries}
                </span>
              </div>
              <p className="text-sm text-gray-300">Total Entries</p>
            </div>

            {/* Average Mood */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-5 w-5 text-pink-400" />
                <span className="text-2xl font-bold">
                  {analytics.averageMood}/10
                </span>
              </div>
              <p className="text-sm text-gray-300">Average Mood</p>
            </div>

            {/* Writing Streak */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold">
                  {analytics.writingStreak}
                </span>
              </div>
              <p className="text-sm text-gray-300">Day Streak</p>
            </div>

            {/* Average Words */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold">
                  {analytics.averageWordCount}
                </span>
              </div>
              <p className="text-sm text-gray-300">Avg Words/Entry</p>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-4">No entries found</p>
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
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
              >
                {/* Entry Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {formatDate(entry.created_at)}
                        </span>
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-300">
                          {formatTime(entry.created_at)}
                        </span>
                      </div>

                      {/* Entry Preview */}
                      <p className="text-gray-100">
                        {entry.prompt && (
                          <span className="text-purple-400 italic">
                            Prompt: {entry.prompt} -
                          </span>
                        )}
                        {getContentPreview(entry.content)}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.mood && (
                          <span className="text-xs px-2 py-1 bg-purple-600/30 rounded-full">
                            Mood: {entry.mood}/10
                          </span>
                        )}
                        {entry.word_count && (
                          <span className="text-xs px-2 py-1 bg-blue-600/30 rounded-full">
                            {entry.word_count} words
                          </span>
                        )}
                        {entry.topics && entry.topics.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                            {entry.topics.length} topics
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="ml-4">
                      {expandedEntries.has(entry.id) ? (
                        <ChevronLeft className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEntries.has(entry.id) && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    <div
                      className="mt-4 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />

                    {/* Follow-ups */}
                    {entry.follow_ups && entry.follow_ups.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h4 className="text-sm font-semibold text-purple-300">
                          Follow-up Reflections ({entry.follow_ups.length})
                        </h4>
                        {entry.follow_ups.map((followUp, index) => (
                          <div
                            key={followUp.id}
                            className="ml-4 pl-4 border-l-2 border-purple-600/30"
                          >
                            <p className="text-sm text-purple-400 italic mb-2">
                              {followUp.prompt || `Follow-up ${index + 1}`}
                            </p>
                            <div
                              className="text-sm text-gray-300 prose prose-sm prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: followUp.content,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Topics & Emotions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.topics?.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 bg-purple-600/20 rounded-full"
                        >
                          #{topic}
                        </span>
                      ))}
                      {entry.emotions?.map((emotion) => (
                        <span
                          key={emotion}
                          className="text-xs px-2 py-1 bg-pink-600/20 rounded-full"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
