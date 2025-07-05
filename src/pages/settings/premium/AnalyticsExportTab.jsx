// src/components/settings/premium/AnalyticsExportTab.jsx
import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  PieChart,
  Brain,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function AnalyticsExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Premium analytics options
  const [analyticsOptions, setAnalyticsOptions] = useState({
    // Basic analytics
    moodTrends: true,
    emotionPatterns: true,
    writingFrequency: true,
    topThemes: true,
    wordCount: true,
    entryStatistics: true,
    monthlyOverview: true,
    // Premium analytics
    sentimentAnalysis: true,
    emotionalJourney: true,
    growthIndicators: true,
    correlationAnalysis: true,
    predictiveInsights: true,
    comparativePeriods: true,
    detailedBreakdowns: true,
    customMetrics: [],
  });

  // Report customization
  const [reportOptions, setReportOptions] = useState({
    includeVisualizations: true,
    chartType: "interactive",
    colorScheme: "gradient",
    detailLevel: "comprehensive",
    includeRecommendations: true,
    includeRawData: false,
  });

  const presetRanges = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Time" },
    { value: "comparison", label: "Period Comparison" },
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
        reportOptions,
        premium: true,
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
      a.download = `premium-analytics-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Analytics report generated successfully!");
    } catch (err) {
      setError("Failed to generate analytics report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-purple-400" />
        Premium Analytics Export
      </h2>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
        <p className="text-purple-200 text-sm">
          Generate comprehensive analytics reports with AI-powered insights,
          predictive analysis, and personalized recommendations based on your
          journaling patterns.
        </p>
      </div>

      {/* Export Format */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Report Format</h3>

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
              <span className="font-medium text-white">Interactive PDF</span>
              <p className="text-xs text-gray-400 mt-1">
                With charts & visuals
              </p>
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
              <FileSpreadsheet className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="font-medium text-white">Data Export</span>
              <p className="text-xs text-gray-400 mt-1">For custom analysis</p>
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
              <p className="text-xs text-gray-400 mt-1">JSON format</p>
            </div>
          </label>
        </div>
      </div>

      {/* Analysis Period */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Analysis Period
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
                name="analysisRange"
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

        {presetRange === "comparison" && dateRangeType !== "custom" && (
          <div className="mt-4 p-4 bg-purple-600/20 rounded-lg">
            <p className="text-sm text-purple-200">
              Compare two periods to identify growth patterns and changes in
              your well-being journey.
            </p>
          </div>
        )}
      </div>

      {/* Premium Analytics Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Analytics to Include
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Analytics */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">
              Core Analytics
            </h4>
            <div className="space-y-2">
              {[
                { key: "moodTrends", label: "Mood Trends", icon: TrendingUp },
                {
                  key: "emotionPatterns",
                  label: "Emotion Patterns",
                  icon: PieChart,
                },
                { key: "writingFrequency", label: "Writing Frequency" },
                { key: "topThemes", label: "Top Themes" },
                { key: "monthlyOverview", label: "Monthly Overview" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analyticsOptions[item.key]}
                    onChange={(e) =>
                      setAnalyticsOptions({
                        ...analyticsOptions,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="rounded text-purple-600"
                  />
                  {item.icon && (
                    <item.icon className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Premium Analytics */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              Premium Analytics
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                EXCLUSIVE
              </span>
            </h4>
            <div className="space-y-2">
              {[
                {
                  key: "sentimentAnalysis",
                  label: "AI Sentiment Analysis",
                  icon: Brain,
                },
                { key: "emotionalJourney", label: "Emotional Journey Map" },
                { key: "growthIndicators", label: "Personal Growth Metrics" },
                { key: "correlationAnalysis", label: "Pattern Correlations" },
                { key: "predictiveInsights", label: "Predictive Insights" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analyticsOptions[item.key]}
                    onChange={(e) =>
                      setAnalyticsOptions({
                        ...analyticsOptions,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="rounded text-purple-600"
                  />
                  {item.icon && (
                    <item.icon className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Customization - Premium Only */}
      {exportFormat === "pdf" && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Report Customization
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visualization Style
                </label>
                <select
                  value={reportOptions.chartType}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      chartType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="interactive">Interactive Charts</option>
                  <option value="static">Static Graphs</option>
                  <option value="infographic">Infographic Style</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color Theme
                </label>
                <select
                  value={reportOptions.colorScheme}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      colorScheme: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gradient">Purple Gradient</option>
                  <option value="ocean">Ocean Blues</option>
                  <option value="sunset">Sunset Warmth</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportOptions.includeRecommendations}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeRecommendations: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">
                  Include AI-powered recommendations
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportOptions.includeRawData}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeRawData: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Append raw data tables</span>
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
              Generating Analytics...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Generate Premium Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
