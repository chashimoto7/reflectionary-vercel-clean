// src/components/settings/premium/ReflectionarianTab.jsx
import React, { useState } from "react";
import {
  MessageCircle,
  Calendar,
  Download,
  FileText,
  Brain,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ReflectionarianTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Reflectionarian export options
  const [reflectionOptions, setReflectionOptions] = useState({
    includeConversations: true,
    includeInsights: true,
    includePrompts: true,
    includeAnalysis: true,
    includeThemes: true,
    includeBreakthroughs: true,
    includeActionItems: true,
    includeGrowthTracking: true,
    groupByTopic: true,
    includeEmotionalJourney: true,
    includeAIRecommendations: true,
    preserveThreading: true,
  });

  // Export customization
  const [exportSettings, setExportSettings] = useState({
    conversationStyle: "full",
    insightDepth: "comprehensive",
    includeSystemPrompts: false,
    anonymizePersonal: false,
    highlightBreakthroughs: true,
    includeTimestamps: true,
  });

  const presetRanges = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Conversations" },
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
        reflectionOptions,
        exportSettings,
        premium: true,
      };

      const response = await fetch(
        `/api/export/reflectionarian-${exportFormat}`,
        {
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
        }
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflectionarian-export-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Reflectionarian conversations exported successfully!");
    } catch (err) {
      setError("Failed to export Reflectionarian data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-purple-400" />
        Reflectionarian Export
        <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full">
          PREMIUM EXCLUSIVE
        </span>
      </h2>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-purple-200 text-sm">
            Export your AI coaching conversations, personalized insights, and
            breakthrough moments from your Reflectionarian sessions. Preserve
            your growth journey and wisdom gained.
          </p>
        </div>
      </div>

      {/* Export Format */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Export Format</h3>

        <div className="grid grid-cols-3 gap-4">
          <label
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              exportFormat === "pdf"
                ? "border-purple-500 bg-purple-500/20"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={(e) => setExportFormat(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <FileText className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <span className="font-medium text-white">Conversation Book</span>
              <p className="text-xs text-gray-400 mt-1">Formatted dialogues</p>
            </div>
          </label>

          <label
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              exportFormat === "csv"
                ? "border-purple-500 bg-purple-500/20"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              value="csv"
              checked={exportFormat === "csv"}
              onChange={(e) => setExportFormat(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <Brain className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="font-medium text-white">Insights Export</span>
              <p className="text-xs text-gray-400 mt-1">Key learnings</p>
            </div>
          </label>

          <label
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              exportFormat === "json"
                ? "border-purple-500 bg-purple-500/20"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              value="json"
              checked={exportFormat === "json"}
              onChange={(e) => setExportFormat(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <Code className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <span className="font-medium text-white">Developer</span>
              <p className="text-xs text-gray-400 mt-1">Full data export</p>
            </div>
          </label>
        </div>
      </div>

      {/* Time Period Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Conversation Period
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {presetRanges.map((range) => (
            <label
              key={range.value}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                presetRange === range.value && dateRangeType !== "custom"
                  ? "border-purple-500 bg-purple-500/20 text-white"
                  : "border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              <input
                type="radio"
                name="reflectionRange"
                value={range.value}
                checked={
                  presetRange === range.value && dateRangeType !== "custom"
                }
                onChange={() => {
                  setPresetRange(range.value);
                  setDateRangeType("preset");
                }}
                className="sr-only"
              />
              <span className="block text-center text-sm">{range.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="pt-4 border-t border-white/10">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={dateRangeType === "custom"}
              onChange={(e) =>
                setDateRangeType(e.target.checked ? "custom" : "preset")
              }
              className="rounded text-purple-600"
            />
            <span className="text-white">Use custom date range</span>
          </label>

          {dateRangeType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Content to Include
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Conversation Content */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversation Content
            </h4>
            <div className="space-y-2">
              {[
                { key: "includeConversations", label: "Full Conversations" },
                { key: "includePrompts", label: "Reflection Prompts" },
                {
                  key: "preserveThreading",
                  label: "Preserve Thread Structure",
                },
                { key: "includeTimestamps", label: "Include Timestamps" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      item.key.includes(".")
                        ? exportSettings[item.key.split(".")[1]]
                        : reflectionOptions[item.key]
                    }
                    onChange={(e) => {
                      if (item.key.includes(".")) {
                        setExportSettings({
                          ...exportSettings,
                          [item.key.split(".")[1]]: e.target.checked,
                        });
                      } else {
                        setReflectionOptions({
                          ...reflectionOptions,
                          [item.key]: e.target.checked,
                        });
                      }
                    }}
                    className="rounded text-purple-600"
                  />
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Insights & Analysis */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights & Analysis
            </h4>
            <div className="space-y-2">
              {[
                { key: "includeInsights", label: "Key Insights" },
                { key: "includeBreakthroughs", label: "Breakthrough Moments" },
                { key: "includeThemes", label: "Recurring Themes" },
                { key: "includeActionItems", label: "Action Items" },
                { key: "includeGrowthTracking", label: "Growth Tracking" },
                { key: "includeEmotionalJourney", label: "Emotional Journey" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reflectionOptions[item.key]}
                    onChange={(e) =>
                      setReflectionOptions({
                        ...reflectionOptions,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="rounded text-purple-600"
                  />
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Customization */}
      {exportFormat === "pdf" && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Export Customization
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Conversation Style
                </label>
                <select
                  value={exportSettings.conversationStyle}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      conversationStyle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="full">Full Dialogue</option>
                  <option value="summary">Summarized</option>
                  <option value="highlights">Highlights Only</option>
                  <option value="insights">Insights Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Insight Depth
                </label>
                <select
                  value={exportSettings.insightDepth}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      insightDepth: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="moderate">Moderate Detail</option>
                  <option value="summary">Summary Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportSettings.highlightBreakthroughs}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      highlightBreakthroughs: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">
                  Highlight breakthrough moments
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportSettings.anonymizePersonal}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      anonymizePersonal: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">
                  Anonymize personal information
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={
            exporting ||
            (dateRangeType === "custom" && (!customStartDate || !customEndDate))
          }
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
        >
          {exporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Exporting Conversations...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Reflectionarian Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
