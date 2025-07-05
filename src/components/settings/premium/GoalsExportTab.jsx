// src/components/settings/premium/GoalsExportTab.jsx
import React, { useState } from "react";
import {
  Target,
  Calendar,
  Download,
  FileText,
  Trophy,
  TrendingUp,
  CheckCircle,
  Circle,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function GoalsExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Premium goals export options
  const [goalsOptions, setGoalsOptions] = useState({
    includeActive: true,
    includeCompleted: true,
    includeArchived: true,
    includePaused: true,
    includeProgress: true,
    includeCheckIns: true,
    includeReflections: true,
    includeSubgoals: true,
    includeMilestones: true,
    includeHabits: true,
    groupByCategory: true,
    groupByPriority: true,
    includeAnalytics: true,
    includeRecommendations: true,
  });

  // Premium filtering
  const [filters, setFilters] = useState({
    categories: [],
    priority: "all",
    completionRate: "",
    tags: [],
    timeframe: "all",
  });

  const presetRanges = [
    { value: "all", label: "All Goals" },
    { value: "active", label: "Currently Active" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
    { value: "completed", label: "Completed Only" },
    { value: "upcoming", label: "Upcoming Goals" },
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
        goalsOptions,
        filters,
        premium: true,
      };

      const response = await fetch(`/api/export/goals-${exportFormat}`, {
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
      a.download = `premium-goals-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Goals exported successfully!");
    } catch (err) {
      setError("Failed to export goals. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <Target className="h-6 w-6 text-purple-400" />
        Premium Goals Export
      </h2>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
        <p className="text-green-200 text-sm">
          Export your complete goal-setting journey with progress analytics,
          achievement insights, and personalized recommendations for future goal
          success.
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
              <span className="font-medium text-white">Visual Report</span>
              <p className="text-xs text-gray-400 mt-1">Progress charts</p>
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
              <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="font-medium text-white">Data Export</span>
              <p className="text-xs text-gray-400 mt-1">Track metrics</p>
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

      {/* Goals Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Goals Selection
        </h3>

        <div className="grid grid-cols-3 gap-3">
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
                name="goalRange"
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
        <div className="mt-4 pt-4 border-t border-white/10">
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
                  Goals Created After
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
                  Goals Created Before
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

      {/* Premium Export Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Export Options</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Goal Types */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">
              Goal Types
            </h4>
            <div className="space-y-2">
              {[
                {
                  key: "includeActive",
                  label: "Active Goals",
                  icon: Circle,
                  color: "text-blue-400",
                },
                {
                  key: "includeCompleted",
                  label: "Completed Goals",
                  icon: CheckCircle,
                  color: "text-green-400",
                },
                {
                  key: "includeArchived",
                  label: "Archived Goals",
                  color: "text-gray-400",
                },
                {
                  key: "includePaused",
                  label: "Paused Goals",
                  color: "text-yellow-400",
                },
                {
                  key: "includeSubgoals",
                  label: "Include Sub-goals",
                  color: "text-purple-400",
                },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={goalsOptions[item.key]}
                    onChange={(e) =>
                      setGoalsOptions({
                        ...goalsOptions,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="rounded text-purple-600"
                  />
                  {item.icon ? (
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  ) : (
                    <span
                      className={`h-4 w-4 rounded-full bg-current ${item.color}`}
                    />
                  )}
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data to Include */}
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">
              Include Data
            </h4>
            <div className="space-y-2">
              {[
                { key: "includeProgress", label: "Progress Tracking" },
                { key: "includeCheckIns", label: "All Check-ins" },
                { key: "includeReflections", label: "Reflection Notes" },
                { key: "includeMilestones", label: "Milestones" },
                { key: "includeHabits", label: "Related Habits" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={goalsOptions[item.key]}
                    onChange={(e) =>
                      setGoalsOptions({
                        ...goalsOptions,
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

        {/* Premium Features */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            Premium Features
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
              EXCLUSIVE
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={goalsOptions.includeAnalytics}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeAnalytics: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300 text-sm">
                Goal Achievement Analytics
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={goalsOptions.includeRecommendations}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeRecommendations: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-300 text-sm">AI Recommendations</span>
            </label>
          </div>
        </div>
      </div>

      {/* Premium Filtering */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          Advanced Filtering
          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
            PREMIUM
          </span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Categories
              </label>
              <input
                type="text"
                placeholder="e.g., Health, Career, Personal"
                value={filters.categories.join(", ")}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    categories: e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Level
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority Only</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Completion Rate (%)
            </label>
            <input
              type="number"
              placeholder="e.g., 50"
              min="0"
              max="100"
              value={filters.completionRate}
              onChange={(e) =>
                setFilters({ ...filters, completionRate: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
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
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
        >
          {exporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Exporting Goals...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Premium Goals
            </>
          )}
        </button>
      </div>
    </div>
  );
}
