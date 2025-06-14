// src/components/analytics/tabs/DataExportTab.jsx
import React, { useState, useEffect } from "react";
import {
  Download,
  Search,
  Calendar,
  FileText,
  Filter,
  CheckCircle,
  AlertCircle,
  FileJson,
  Table,
  ChevronDown,
  ChevronRight,
  Database,
  Shield,
  Clock,
  Hash,
  TrendingUp,
  Brain,
  Heart,
  Activity,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import AnalyticsIntegrationService from "../../../services/AnalyticsIntegrationService";

const DataExportTab = ({ userId, colors }) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [dataTypes, setDataTypes] = useState({
    journalEntries: true,
    analytics: true,
    insights: true,
    patterns: true,
    wellness: true,
  });
  const [exportStatus, setExportStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    export: true,
    search: true,
    summary: true,
  });
  const [dataSummary, setDataSummary] = useState(null);

  const analyticsService = new AnalyticsIntegrationService();

  useEffect(() => {
    loadDataSummary();
  }, [userId]);

  const loadDataSummary = async () => {
    try {
      // Get entry count
      const { count: entryCount } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get analytics count
      const { count: analyticsCount } = await supabase
        .from("user_analytics")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get insights count
      const { count: insightsCount } = await supabase
        .from("analytics_insights")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get date range
      const { data: dateData } = await supabase
        .from("journal_entries")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      const { data: latestData } = await supabase
        .from("journal_entries")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      setDataSummary({
        entryCount,
        analyticsCount,
        insightsCount,
        firstEntry: dateData?.[0]?.created_at,
        lastEntry: latestData?.[0]?.created_at,
      });
    } catch (error) {
      console.error("Error loading data summary:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Search in analytics data
      const { data: analyticsData } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", userId)
        .or(
          `topics.cs.{${searchQuery}},emotions.cs.{${searchQuery}},themes.cs.{${searchQuery}}`
        )
        .order("date", { ascending: false })
        .limit(20);

      // Search in insights
      const { data: insightsData } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("user_id", userId)
        .ilike("content", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      setSearchResults({
        analytics: analyticsData || [],
        insights: insightsData || [],
      });
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      const exportData = {};
      const dateFilter = getDateFilter();

      // Fetch journal entries if selected
      if (dataTypes.journalEntries) {
        const query = supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId);

        if (dateFilter) {
          query
            .gte("created_at", dateFilter.start)
            .lte("created_at", dateFilter.end);
        }

        const { data } = await query.order("created_at", { ascending: false });
        exportData.journalEntries = data || [];
      }

      // Fetch analytics if selected
      if (dataTypes.analytics) {
        const query = supabase
          .from("user_analytics")
          .select("*")
          .eq("user_id", userId);

        if (dateFilter) {
          query.gte("date", dateFilter.start).lte("date", dateFilter.end);
        }

        const { data } = await query.order("date", { ascending: false });
        exportData.analytics = data || [];
      }

      // Fetch insights if selected
      if (dataTypes.insights) {
        const query = supabase
          .from("analytics_insights")
          .select("*")
          .eq("user_id", userId);

        if (dateFilter) {
          query
            .gte("created_at", dateFilter.start)
            .lte("created_at", dateFilter.end);
        }

        const { data } = await query.order("created_at", { ascending: false });
        exportData.insights = data || [];
      }

      // Fetch patterns if selected
      if (dataTypes.patterns) {
        const analyticsData = await analyticsService.getAnalyticsForDashboard(
          userId,
          dateRange === "all" ? "1year" : dateRange
        );
        exportData.patterns = {
          themes: analyticsData.themes,
          cognitive: analyticsData.cognitive,
          behavioral: analyticsData.behavioral,
        };
      }

      // Fetch wellness data if selected
      if (dataTypes.wellness) {
        const query = supabase
          .from("user_analytics")
          .select("wellness_indicators, self_care_activities, date")
          .eq("user_id", userId)
          .not("wellness_indicators", "is", null);

        if (dateFilter) {
          query.gte("date", dateFilter.start).lte("date", dateFilter.end);
        }

        const { data } = await query.order("date", { ascending: false });
        exportData.wellness = data || [];
      }

      // Generate file based on format
      if (exportFormat === "csv") {
        generateCSV(exportData);
      } else if (exportFormat === "json") {
        generateJSON(exportData);
      }

      setExportStatus({
        type: "success",
        message: `Data exported successfully as ${exportFormat.toUpperCase()}!`,
      });
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus({
        type: "error",
        message: "Failed to export data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getDateFilter = () => {
    if (dateRange === "all") return null;

    const now = new Date();
    let start = new Date();

    switch (dateRange) {
      case "1month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            start: customStartDate,
            end: customEndDate,
          };
        }
        return null;
      default:
        return null;
    }

    return {
      start: start.toISOString(),
      end: now.toISOString(),
    };
  };

  const generateCSV = (data) => {
    let csvContent = "";

    // Journal Entries CSV
    if (data.journalEntries && data.journalEntries.length > 0) {
      csvContent += "JOURNAL ENTRIES\n";
      csvContent += "Date,Mood,Energy,Word Count,Topics,Emotions\n";
      data.journalEntries.forEach((entry) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        const topics = entry.topics?.join("; ") || "";
        const emotions = entry.emotions?.join("; ") || "";
        csvContent += `"${date}","${entry.mood || ""}","${
          entry.energy || ""
        }","${entry.word_count || 0}","${topics}","${emotions}"\n`;
      });
      csvContent += "\n";
    }

    // Analytics CSV
    if (data.analytics && data.analytics.length > 0) {
      csvContent += "ANALYTICS DATA\n";
      csvContent += "Date,Mood,Energy,Stress Level,Tone,Themes\n";
      data.analytics.forEach((record) => {
        const date = new Date(record.date).toLocaleDateString();
        const themes = record.themes?.join("; ") || "";
        csvContent += `"${date}","${record.mood || ""}","${
          record.energy || ""
        }","${record.stress_level || ""}","${record.tone || ""}","${themes}"\n`;
      });
      csvContent += "\n";
    }

    // Insights CSV
    if (data.insights && data.insights.length > 0) {
      csvContent += "AI INSIGHTS\n";
      csvContent += "Date,Type,Content,Impact Score\n";
      data.insights.forEach((insight) => {
        const date = new Date(insight.created_at).toLocaleDateString();
        csvContent += `"${date}","${insight.insight_type || ""}","${
          insight.content || ""
        }","${insight.impact_score || ""}"\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateJSON = (data) => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      dateRange:
        dateRange === "custom"
          ? { start: customStartDate, end: customEndDate }
          : dateRange,
      data: data,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Data Summary Section */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Your Data Summary
          </h3>
          <button
            onClick={() => toggleSection("summary")}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.summary ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {expandedSections.summary && dataSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Journal Entries</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dataSummary.entryCount || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Analytics Records</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {dataSummary.analyticsCount || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Insights</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {dataSummary.insightsCount || 0}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            Search Your Analytics
          </h3>
          <button
            onClick={() => toggleSection("search")}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.search ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {expandedSections.search && (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search topics, emotions, themes, or insights..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.analytics?.length > 0 ||
            searchResults.insights?.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.analytics?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Analytics Matches
                    </h4>
                    <div className="space-y-2">
                      {searchResults.analytics.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-600">
                                {new Date(result.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Topics:</span>{" "}
                                {result.topics?.join(", ") || "None"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Emotions:</span>{" "}
                                {result.emotions?.join(", ") || "None"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                Mood: {result.mood || "N/A"}
                              </span>
                              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                                Energy: {result.energy || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.insights?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Insight Matches
                    </h4>
                    <div className="space-y-2">
                      {searchResults.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-200"
                        >
                          <p className="text-sm text-gray-600">
                            {new Date(insight.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm mt-1">{insight.content}</p>
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded mt-2 inline-block">
                            {insight.insight_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-600" />
            Export Your Data
          </h3>
          <button
            onClick={() => toggleSection("export")}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.export ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {expandedSections.export && (
          <>
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === "csv"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <Table className="w-4 h-4 mr-1" />
                  CSV (Spreadsheet)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="json"
                    checked={exportFormat === "json"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <FileJson className="w-4 h-4 mr-1" />
                  JSON (Technical)
                </label>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Time</option>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Types Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data to Include
              </label>
              <div className="space-y-2">
                {Object.entries({
                  journalEntries: { label: "Journal Entries", icon: FileText },
                  analytics: { label: "Analytics Data", icon: TrendingUp },
                  insights: { label: "AI Insights", icon: Brain },
                  patterns: { label: "Pattern Analysis", icon: Activity },
                  wellness: { label: "Wellness Data", icon: Heart },
                }).map(([key, { label, icon: Icon }]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dataTypes[key]}
                      onChange={(e) =>
                        setDataTypes({ ...dataTypes, [key]: e.target.checked })
                      }
                      className="mr-3 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <Icon className="w-4 h-4 mr-2 text-gray-600" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || !Object.values(dataTypes).some((v) => v)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export Selected Data
                </>
              )}
            </button>

            {/* Export Status */}
            {exportStatus && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  exportStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {exportStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    exportStatus.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {exportStatus.message}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">
              Your Privacy is Protected
            </h4>
            <p className="text-sm text-purple-700">
              All exported data remains encrypted and is only accessible by you.
              We never access or share your personal journal content. Exports
              are generated locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportTab;
