// frontend/ src/components/settings/advanced/JournalExportTab.jsx
import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Download,
  Filter,
  FileSpreadsheet,
  Star,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function JournalExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterPinned, setFilterPinned] = useState(false);

  // PDF customization options (Advanced feature)
  const [pdfOptions, setPdfOptions] = useState({
    includePrompts: true,
    includeAnalysis: true,
    includeMood: true,
    includeTags: true,
    pageSize: "letter",
    fontSize: "medium",
  });

  const presetRanges = [
    { value: "all", label: "All Time" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
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
        filters: {
          starred: filterStarred,
          pinned: filterPinned,
        },
        pdfOptions: exportFormat === "pdf" ? pdfOptions : null,
      };

      const response = await fetch(`/api/export/journal-${exportFormat}`, {
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
      a.download = `journal-export-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Journal exported successfully!");
    } catch (err) {
      setError("Failed to export journal. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-purple-600" />
        Journal Export
      </h2>

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
                Best for spreadsheets and data analysis
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
                <span className="font-medium text-gray-900">PDF Format</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Best for reading and archiving
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Date Range
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
            <span className="text-gray-900">Preset Ranges</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={dateRangeType === "custom"}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="text-purple-600"
            />
            <span className="text-gray-900">Custom Range</span>
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

      {/* Filtering Options - Advanced Feature */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-600" />
          Filter Options
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filterStarred}
              onChange={(e) => setFilterStarred(e.target.checked)}
              className="rounded text-purple-600"
            />
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-900">
                Include only starred entries
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filterPinned}
              onChange={(e) => setFilterPinned(e.target.checked)}
              className="rounded text-purple-600"
            />
            <div className="flex items-center gap-2">
              <span className="text-gray-900">Include only pinned entries</span>
            </div>
          </label>
        </div>
      </div>

      {/* PDF Customization - Show only when PDF is selected */}
      {exportFormat === "pdf" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            PDF Customization
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Page Size
              </label>
              <select
                value={pdfOptions.pageSize}
                onChange={(e) =>
                  setPdfOptions({ ...pdfOptions, pageSize: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="letter">Letter (8.5" × 11")</option>
                <option value="a4">A4 (210mm × 297mm)</option>
                <option value="legal">Legal (8.5" × 14")</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Font Size
              </label>
              <select
                value={pdfOptions.fontSize}
                onChange={(e) =>
                  setPdfOptions({ ...pdfOptions, fontSize: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.includePrompts}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      includePrompts: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">
                  Include reflection prompts
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeMood}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      includeMood: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">Include mood tracking</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeTags}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      includeTags: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-gray-900">
                  Include tags and categories
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Journal
            </>
          )}
        </button>
      </div>
    </div>
  );
}
