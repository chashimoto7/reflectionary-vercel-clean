// frontend/ src/components/settings/advanced/GoalsExportTab.jsx
import React, { useState } from "react";
import {
  Target,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Circle,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function GoalsExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");

  // Goals export options
  const [goalsOptions, setGoalsOptions] = useState({
    includeActive: true,
    includeCompleted: true,
    includeArchived: false,
    includeProgress: true,
    includeCheckIns: true,
    includeReflections: true,
    groupByCategory: true,
  });

  const presetRanges = [
    { value: "all", label: "All Goals" },
    { value: "active", label: "Currently Active" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "This Year" },
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
      a.download = `goals-export-${
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Target className="h-6 w-6 text-purple-600" />
        Goals Export
      </h2>

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          Export your goals, progress tracking, and achievement history. Track
          your personal growth journey and celebrate your accomplishments.
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
                Track progress in spreadsheets
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
                Visual progress summaries
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Date/Status Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Goals Selection
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
            <span className="text-gray-900">By Status/Time</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={dateRangeType === "custom"}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="text-purple-600"
            />
            <span className="text-gray-900">Custom Date Range</span>
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
                Goals Created After
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
                Goals Created Before
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

      {/* Goals Export Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Export Options
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={goalsOptions.includeActive}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeActive: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-blue-500" />
                <span className="text-gray-900">Include Active Goals</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={goalsOptions.includeCompleted}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeCompleted: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-900">Include Completed Goals</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={goalsOptions.includeArchived}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeArchived: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-900">Include Archived Goals</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={goalsOptions.includeProgress}
                onChange={(e) =>
                  setGoalsOptions({
                    ...goalsOptions,
                    includeProgress: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-gray-900">Include Progress Tracking</span>
            </label>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Additional Data
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goalsOptions.includeCheckIns}
                  onChange={(e) =>
                    setGoalsOptions({
                      ...goalsOptions,
                      includeCheckIns: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">
                  Include all check-in notes
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goalsOptions.includeReflections}
                  onChange={(e) =>
                    setGoalsOptions({
                      ...goalsOptions,
                      includeReflections: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">
                  Include reflection entries
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goalsOptions.groupByCategory}
                  onChange={(e) =>
                    setGoalsOptions({
                      ...goalsOptions,
                      groupByCategory: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">Group by category</span>
              </label>
            </div>
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Exporting Goals...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Goals
            </>
          )}
        </button>
      </div>
    </div>
  );
}
