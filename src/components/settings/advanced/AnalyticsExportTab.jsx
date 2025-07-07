// frontend/ src/components/settings/advanced/AnalyticsExportTab.jsx
import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  PieChart,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function AnalyticsExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");

  // Analytics options
  const [analyticsOptions, setAnalyticsOptions] = useState({
    moodTrends: true,
    emotionPatterns: true,
    writingFrequency: true,
    topThemes: true,
    wordCount: true,
    entryStatistics: true,
    monthlyOverview: true,
  });

  const presetRanges = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const exportConfig = {
        userId: user.id,
        dateRange:
          dateRangeType === "custom"
            ? {
                type: "custom",
                startDate: customStartDate,
                endDate: customEndDate,
              }
            : { type: presetRange },
        format: exportFormat,
        analyticsOptions,
      };

      const response = await fetch(`/api/export/analytics-${exportFormat}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            ).data.session?.access_token
          }`,
        },
        body: JSON.stringify(exportConfig),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Analytics exported successfully!");
    } catch (err) {
      setError("Failed to export analytics. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-purple-600" />
        Analytics Export
      </h2>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-purple-800 text-sm">
          Export comprehensive analytics and insights from your journal entries,
          including mood trends, writing patterns, and emotional analysis.
        </p>
      </div>

      {/* Export Format */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Export Format
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === "csv"}
              onChange={(e) => setExportFormat(e.target.value)}
              className="text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">CSV Format</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Raw data for custom analysis
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="radio"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={(e) => setExportFormat(e.target.value)}
              className="text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900">PDF Report</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Visual charts and summaries
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Analysis Period
        </h3>

        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="preset"
              checked={dateRangeType === "preset"}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="text-purple-600"
            />
            <span className="text-gray-900">Preset Periods</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={dateRangeType === "custom"}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="text-purple-600"
            />
            <span className="text-gray-900">Custom Period</span>
          </label>
        </div>

        {dateRangeType === "preset" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetRanges.map((range) => (
              <label
                key={range.value}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="presetRange"
                  value={range.value}
                  checked={presetRange === range.value}
                  onChange={(e) => setPresetRange(e.target.value)}
                  className="text-purple-600"
                />
                <span className="text-gray-900">{range.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Analytics Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Analytics to Include
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.moodTrends}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  moodTrends: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Mood Trends</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Daily mood changes and patterns over time
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.emotionPatterns}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  emotionPatterns: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Emotion Patterns
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Distribution of emotions across entries
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.writingFrequency}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  writingFrequency: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Writing Frequency
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Journal entry frequency and consistency
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.topThemes}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  topThemes: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">Top Themes</span>
              <p className="text-sm text-gray-600 mt-1">
                Most common topics and themes
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.wordCount}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  wordCount: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Word Count Analytics
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Average entry length and total words
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={analyticsOptions.monthlyOverview}
              onChange={(e) =>
                setAnalyticsOptions({
                  ...analyticsOptions,
                  monthlyOverview: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Monthly Overview
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Month-by-month summary statistics
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={
            exporting ||
            (dateRangeType === "custom" && (!customStartDate || !customEndDate))
          }
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Analytics
            </>
          )}
        </button>
      </div>
    </div>
  );
}
