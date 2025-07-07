// frontend/ src/components/settings/premium/WellnessExportTab.jsx
import React, { useState } from "react";
import {
  Heart,
  Calendar,
  Download,
  FileText,
  Activity,
  Brain,
  Moon,
  Sparkles,
  TrendingUp,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function WellnessExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Premium wellness export options
  const [wellnessOptions, setWellnessOptions] = useState({
    // Basic wellness data
    moodTracking: true,
    sleepPatterns: true,
    exerciseLog: true,
    mindfulnessMinutes: true,
    energyLevels: true,
    stressIndicators: true,
    wellnessGoals: true,
    dailySummaries: true,
    // Premium wellness features
    biometricData: true,
    nutritionTracking: true,
    symptomLog: true,
    medicationTracking: true,
    therapyNotes: true,
    customMetrics: true,
    correlationAnalysis: true,
    wellnessScore: true,
    recommendations: true,
    predictiveInsights: true,
  });

  // Premium report customization
  const [reportOptions, setReportOptions] = useState({
    visualizationType: "comprehensive",
    includeCharts: true,
    includeHeatmaps: true,
    includeCorrelations: true,
    comparePeriods: false,
    includeBaseline: true,
    customBranding: false,
  });

  const presetRanges = [
    { value: "7days", label: "Last Week" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Time" },
    { value: "ytd", label: "Year to Date" },
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
        wellnessOptions,
        reportOptions,
        premium: true,
      };

      const response = await fetch(`/api/export/wellness-${exportFormat}`, {
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
      a.download = `premium-wellness-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Wellness data exported successfully!");
    } catch (err) {
      setError("Failed to export wellness data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-purple-400" />
        Premium Wellness Export
      </h2>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg p-4 border border-pink-500/30">
        <p className="text-pink-200 text-sm">
          Generate comprehensive wellness reports with biometric tracking,
          correlation analysis, and AI-powered health insights to optimize your
          well-being journey.
        </p>
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
              <span className="font-medium text-white">Health Report</span>
              <p className="text-xs text-gray-400 mt-1">Visual dashboard</p>
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
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="font-medium text-white">Data Export</span>
              <p className="text-xs text-gray-400 mt-1">For analysis</p>
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

      {/* Time Period Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Time Period
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
                name="wellnessRange"
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

      {/* Wellness Metrics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Wellness Metrics to Include
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Core Metrics */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">
              Core Metrics
            </h4>
            <div className="space-y-2">
              {[
                { key: "moodTracking", label: "Mood Tracking", icon: Brain },
                { key: "sleepPatterns", label: "Sleep Patterns", icon: Moon },
                { key: "exerciseLog", label: "Exercise Log", icon: Activity },
                { key: "energyLevels", label: "Energy Levels" },
                { key: "stressIndicators", label: "Stress Levels" },
                { key: "dailySummaries", label: "Daily Summaries" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={wellnessOptions[item.key]}
                    onChange={(e) =>
                      setWellnessOptions({
                        ...wellnessOptions,
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

          {/* Premium Metrics */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              Premium Metrics
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                EXCLUSIVE
              </span>
            </h4>
            <div className="space-y-2">
              {[
                { key: "biometricData", label: "Biometric Data" },
                { key: "nutritionTracking", label: "Nutrition Logs" },
                { key: "symptomLog", label: "Symptom Tracking" },
                { key: "medicationTracking", label: "Medication Log" },
                { key: "therapyNotes", label: "Therapy Notes" },
                { key: "customMetrics", label: "Custom Metrics" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={wellnessOptions[item.key]}
                    onChange={(e) =>
                      setWellnessOptions({
                        ...wellnessOptions,
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

        {/* AI Features */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            AI-Powered Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wellnessOptions.correlationAnalysis}
                onChange={(e) =>
                  setWellnessOptions({
                    ...wellnessOptions,
                    correlationAnalysis: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-300 text-sm">
                Pattern Correlations
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wellnessOptions.wellnessScore}
                onChange={(e) =>
                  setWellnessOptions({
                    ...wellnessOptions,
                    wellnessScore: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-300 text-sm">Wellness Score</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wellnessOptions.recommendations}
                onChange={(e) =>
                  setWellnessOptions({
                    ...wellnessOptions,
                    recommendations: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-300 text-sm">
                Personalized Recommendations
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wellnessOptions.predictiveInsights}
                onChange={(e) =>
                  setWellnessOptions({
                    ...wellnessOptions,
                    predictiveInsights: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-300 text-sm">Predictive Insights</span>
            </label>
          </div>
        </div>
      </div>

      {/* Premium Report Options */}
      {exportFormat === "pdf" && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Premium Report Options
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visualization Style
              </label>
              <select
                value={reportOptions.visualizationType}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    visualizationType: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="comprehensive">Comprehensive Dashboard</option>
                <option value="minimal">Minimal Report</option>
                <option value="medical">Medical Style</option>
                <option value="infographic">Infographic Style</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportOptions.includeHeatmaps}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeHeatmaps: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Include pattern heatmaps</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportOptions.comparePeriods}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      comparePeriods: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Compare with previous period</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportOptions.includeBaseline}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeBaseline: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Show baseline comparisons</span>
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
              Generating Wellness Report...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Wellness Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
