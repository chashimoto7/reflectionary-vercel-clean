// frontend/ src/components/settings/advanced/WellnessExportTab.jsx
import React, { useState } from "react";
import {
  Heart,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Activity,
  Brain,
  Moon,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function WellnessExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");

  // Wellness export options
  const [wellnessOptions, setWellnessOptions] = useState({
    moodTracking: true,
    sleepPatterns: true,
    exerciseLog: true,
    mindfulnessMinutes: true,
    energyLevels: true,
    stressIndicators: true,
    wellnessGoals: true,
    dailySummaries: true,
  });

  const presetRanges = [
    { value: "7days", label: "Last Week" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 3 Months" },
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
        wellnessOptions,
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
      a.download = `wellness-export-${
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-purple-600" />
        Wellness Export
      </h2>

      {/* Info Banner */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <p className="text-pink-800 text-sm">
          Export comprehensive wellness tracking data including mood patterns,
          sleep quality, exercise habits, and mindfulness practices to better
          understand your well-being journey.
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
                Analyze trends in spreadsheets
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
                Visual wellness dashboard
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Time Period
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
            <span className="text-gray-900">Quick Select</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={dateRangeType === "custom"}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="text-purple-600"
            />
            <span className="text-gray-900">Custom Dates</span>
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

      {/* Wellness Data Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Wellness Metrics to Include
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.moodTracking}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  moodTracking: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Mood Tracking</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Daily mood scores and emotional patterns
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.sleepPatterns}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  sleepPatterns: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Sleep Patterns
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Sleep duration and quality metrics
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.exerciseLog}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  exerciseLog: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Exercise Log</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Physical activity and workout tracking
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.mindfulnessMinutes}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  mindfulnessMinutes: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Mindfulness Practice
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Meditation and mindfulness minutes
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.energyLevels}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  energyLevels: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">Energy Levels</span>
              <p className="text-sm text-gray-600 mt-1">
                Daily energy and vitality tracking
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={wellnessOptions.stressIndicators}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  stressIndicators: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Stress Indicators
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Stress levels and coping strategies
              </p>
            </div>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={wellnessOptions.dailySummaries}
              onChange={(e) =>
                setWellnessOptions({
                  ...wellnessOptions,
                  dailySummaries: e.target.checked,
                })
              }
              className="rounded text-purple-600"
            />
            <span className="text-gray-900">
              Include daily wellness summaries
            </span>
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
              Exporting Wellness Data...
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
