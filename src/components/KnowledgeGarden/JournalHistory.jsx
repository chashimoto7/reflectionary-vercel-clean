// src/components/KnowledgeGarden/JournalHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  TrendingUp,
  Hash,
  Search,
  Download,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
  X,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { generatePDF, generateWord } from '../../utils/exportUtils';

export default function JournalHistory() {
  const { user } = useAuth();

  // State management
  const [historyEntries, setHistoryEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTag, setSearchTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [exportRange, setExportRange] = useState("month");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);

  // Date utility functions
  const formatDate = (date, formatStr) => {
    const d = new Date(date);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const fullMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    switch (formatStr) {
      case "MMM d":
        return `${months[d.getMonth()]} ${d.getDate()}`;
      case "MMMM yyyy":
        return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
      case "MMMM d, yyyy":
        return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      case "yyyy-MM-dd":
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      case "d":
        return String(d.getDate());
      default:
        return d.toISOString();
    }
  };

  const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const endOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const startOfYear = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1);
  };

  const subMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
  };

  const eachDayOfInterval = (start, end) => {
    const days = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const parseISO = (dateString) => {
    return new Date(dateString);
  };

  // Effects
  useEffect(() => {
    if (user) {
      fetchHistoryEntries();
    }
  }, [user, currentDate]);

  // Data fetching functions
  const fetchHistoryEntries = async () => {
    setHistoryLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistoryEntries(data || []);

      // Fetch all unique tags
      const { data: allEntries } = await supabase
        .from("journal_entries")
        .select("tags")
        .eq("user_id", user.id)
        .not("tags", "is", null);

      if (allEntries) {
        const tags = new Set();
        allEntries.forEach((entry) => {
          if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach((tag) => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getTimelineData = () => {
    // Get last 30 days of entry frequency
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return formatDate(date, "yyyy-MM-dd");
    });

    const entryCounts = {};
    historyEntries.forEach((entry) => {
      const date = formatDate(parseISO(entry.created_at), "yyyy-MM-dd");
      entryCounts[date] = (entryCounts[date] || 0) + 1;
    });

    return last30Days.map((date) => ({
      date: formatDate(parseISO(date), "MMM d"),
      entries: entryCounts[date] || 0,
    }));
  };

  const searchByTag = async () => {
    if (!searchTag) {
      fetchHistoryEntries();
      return;
    }

    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .contains("tags", [searchTag])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistoryEntries(data || []);
    } catch (error) {
      console.error("Error searching entries:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let startDate, endDate;
      const now = new Date();

      switch (exportRange) {
        case "all":
          startDate = new Date(2020, 0, 1);
          endDate = now;
          break;
        case "year":
          startDate = startOfYear(now);
          endDate = now;
          break;
        case "month":
        default:
          startDate = subMonths(now, 1);
          endDate = now;
          break;
      }

      const { data: exportEntries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = {
        entries: exportEntries,
        options: {
          includePrompts: true,
          includeFollowUps: true,
        },
      };

      if (exportFormat === "pdf") {
        await generatePDF(exportData);
      } else {
        await generateWord(exportData);
      }
    } catch (error) {
      console.error("Error exporting entries:", error);
      alert("Failed to export entries. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);
    try {
      // Delete follow-up entries first (if any)
      const { error: followUpError } = await supabase
        .from("journal_follow_ups")
        .delete()
        .eq("entry_id", entryToDelete);

      if (followUpError) {
        console.error("Error deleting follow-ups:", followUpError);
      }

      // Delete the main entry
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entryToDelete)
        .eq("user_id", user.id);

      if (error) throw error;

      // Refresh the entries list
      await fetchHistoryEntries();

      // Clear selected entries if they were deleted
      if (selectedEntry && selectedEntry.id === entryToDelete) {
        setSelectedEntry(null);
      }
      if (expandedEntry && expandedEntry.id === entryToDelete) {
        setExpandedEntry(null);
      }

      setShowDeleteModal(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  const handleViewFullEntry = (entry) => {
    setExpandedEntry(entry);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval(start, end);
  };

  const getEntriesForDay = (day) => {
    return historyEntries.filter((entry) => {
      const entryDate = parseISO(entry.created_at);
      return (
        formatDate(entryDate, "yyyy-MM-dd") === formatDate(day, "yyyy-MM-dd")
      );
    });
  };

  const getIntelligenceOverview = () => {
    const totalEntries = historyEntries.length;
    const totalWords = historyEntries.reduce(
      (sum, entry) => sum + (entry.content?.split(" ").length || 0),
      0
    );
    const avgWords =
      totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    const taggedEntries = historyEntries.filter(
      (entry) => entry.tags && entry.tags.length > 0
    ).length;

    return { totalEntries, avgWords, taggedEntries };
  };

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your journal history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Intelligence Overview */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400 mb-4">
          Journal Intelligence Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-gray-200">Total Entries</h3>
            </div>
            <p className="text-2xl font-semibold text-white">
              {getIntelligenceOverview().totalEntries}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-gray-200">Avg. Word Count</h3>
            </div>
            <p className="text-2xl font-semibold text-white">
              {getIntelligenceOverview().avgWords}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-gray-200">Tagged Entries</h3>
            </div>
            <p className="text-2xl font-semibold text-white">
              {getIntelligenceOverview().taggedEntries}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400 mb-4">
          Entry Timeline
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="entries"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Export */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Tag Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Search by Tag
            </label>
            <div className="flex gap-2">
              <select
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-green-400"
              >
                <option value="">All entries</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <button
                onClick={searchByTag}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          {/* Export */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Export Entries
            </label>
            <div className="flex gap-2">
              <select
                value={exportRange}
                onChange={(e) => setExportRange(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-green-400"
              >
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-green-400"
              >
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
              </select>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-600 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Calendar View
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                )
              }
              className="p-2 hover:bg-white/10 rounded-lg text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-white min-w-[120px] text-center">
              {formatDate(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                )
              }
              className="p-2 hover:bg-white/10 rounded-lg text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-300 p-2"
            >
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day) => {
            const dayEntries = getEntriesForDay(day);
            const hasEntries = dayEntries.length > 0;

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  if (hasEntries) {
                    // If there are multiple entries, show the first one in preview
                    // User can then click "View Full" to see the expanded modal
                    setSelectedEntry(dayEntries[0]);
                  }
                }}
                className={`
                  aspect-square p-2 border rounded-lg cursor-pointer transition-colors
                  ${
                    hasEntries
                      ? "bg-green-500/20 border-green-400/30 hover:bg-green-500/30 text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                  }
                `}
              >
                <div className="text-sm font-medium">
                  {formatDate(day, "d")}
                </div>
                {hasEntries && (
                  <div className="text-xs text-green-300 mt-1">
                    {dayEntries.length}{" "}
                    {dayEntries.length === 1 ? "entry" : "entries"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Entry Preview */}
      {selectedEntry && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
              {formatDate(parseISO(selectedEntry.created_at), "MMMM d, yyyy")}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewFullEntry(selectedEntry)}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                View Full
              </button>
              <button
                onClick={() => handleDeleteEntry(selectedEntry.id)}
                className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
          {selectedEntry.prompt_text && (
            <p className="text-sm text-gray-300 mb-3">
              Prompt: {selectedEntry.prompt_text}
            </p>
          )}
          <p className="text-gray-100 line-clamp-3">
            {selectedEntry.content}
          </p>
          {selectedEntry.tags && selectedEntry.tags.length > 0 && (
            <div className="flex gap-2 mt-3">
              {selectedEntry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Entry Modal */}
      {expandedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Journal Entry
                  </h2>
                  <p className="text-gray-300">
                    {formatDate(parseISO(expandedEntry.created_at), "MMMM d, yyyy")} at{" "}
                    {new Date(expandedEntry.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedEntry(null)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {expandedEntry.prompt_text && (
                <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-purple-200 mb-2">Prompt</h3>
                  <p className="text-purple-100">{expandedEntry.prompt_text}</p>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Entry Content</h3>
                <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {expandedEntry.content}
                </div>
              </div>

              {expandedEntry.tags && expandedEntry.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-200 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {expandedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Button at Bottom */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Word count: {expandedEntry.content?.split(' ').length || 0} words
                  </div>
                  <button
                    onClick={() => {
                      setExpandedEntry(null);
                      handleDeleteEntry(expandedEntry.id);
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 border border-red-400/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-red-400/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Delete Journal Entry
                </h3>
              </div>

              <div className="text-gray-300 mb-6 space-y-2">
                <p>
                  Are you sure you want to delete this journal entry? This action will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Permanently delete the main entry</li>
                  <li>Delete all associated follow-up prompts and responses</li>
                  <li>Remove it from all analytics and insights</li>
                </ul>
                <p className="font-medium text-red-300 mt-3">
                  ⚠️ This action cannot be undone. The entry will be permanently lost.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEntry}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}