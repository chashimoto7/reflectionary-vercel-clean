//src/pages/AdvancedHistory
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  Download,
  Search,
  TrendingUp,
  Hash,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generatePDF, generateWord } from "../utils/exportUtils";

const AdvancedHistory = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTag, setSearchTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [exportRange, setExportRange] = useState("month");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);

  // Date utility functions
  const formatDate = (date, formatStr) => {
    const d = new Date(date);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const fullMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    switch (formatStr) {
      case "MMM d":
        return `${months[d.getMonth()]} ${d.getDate()}`;
      case "MMMM yyyy":
        return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
      case "MMMM d, yyyy":
        return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      case "yyyy-MM-dd":
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
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

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, currentDate]);

  const fetchEntries = async () => {
    setLoading(true);
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
      setEntries(data || []);

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
      setLoading(false);
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
    entries.forEach((entry) => {
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
      fetchEntries();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .contains("tags", [searchTag])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error searching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let startDate, endDate;
      const now = new Date();

      switch (exportRange) {
        case "all":
          startDate = new Date(2020, 0, 1); // Far past date
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

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval(start, end);
  };

  const getEntriesForDay = (day) => {
    return entries.filter((entry) => {
      const entryDate = parseISO(entry.created_at);
      return (
        formatDate(entryDate, "yyyy-MM-dd") === formatDate(day, "yyyy-MM-dd")
      );
    });
  };

  const getIntelligenceOverview = () => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce(
      (sum, entry) => sum + (entry.content?.split(" ").length || 0),
      0
    );
    const avgWords =
      totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    const taggedEntries = entries.filter(
      (entry) => entry.tags && entry.tags.length > 0
    ).length;

    return { totalEntries, avgWords, taggedEntries };
  };

  const { totalEntries, avgWords, taggedEntries } = getIntelligenceOverview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Intelligence Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Intelligence Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-700">Total Entries</h3>
              </div>
              <p className="text-2xl font-semibold text-purple-600">
                {totalEntries}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-700">Avg. Word Count</h3>
              </div>
              <p className="text-2xl font-semibold text-purple-600">
                {avgWords}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-700">Tagged Entries</h3>
              </div>
              <p className="text-2xl font-semibold text-purple-600">
                {taggedEntries}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Entry Timeline
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Tag Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Tag
              </label>
              <div className="flex gap-2">
                <select
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Entries
              </label>
              <div className="flex gap-2">
                <select
                  value={exportRange}
                  onChange={(e) => setExportRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                </select>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Calendar View
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <span className="font-medium">
                {formatDate(currentDate, "MMMM yyyy")}
              </span>
              <button
                onClick={() =>
                  setCurrentDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 p-2"
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
                  onClick={() => hasEntries && setSelectedEntry(dayEntries[0])}
                  className={`
                    aspect-square p-2 border rounded-lg cursor-pointer
                    ${
                      hasEntries
                        ? "bg-purple-50 border-purple-300 hover:bg-purple-100"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="text-sm font-medium">
                    {formatDate(day, "d")}
                  </div>
                  {hasEntries && (
                    <div className="text-xs text-purple-600 mt-1">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {formatDate(parseISO(selectedEntry.created_at), "MMMM d, yyyy")}
            </h3>
            {selectedEntry.prompt_text && (
              <p className="text-sm text-gray-600 mb-3">
                Prompt: {selectedEntry.prompt_text}
              </p>
            )}
            <p className="text-gray-700 line-clamp-3">
              {selectedEntry.content}
            </p>
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {selectedEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedHistory;
