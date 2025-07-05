// src/components/settings/premium/JournalExportTab.jsx
import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Download,
  Filter,
  FileSpreadsheet,
  Star,
  Folder,
  Tag,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function JournalExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetRange, setPresetRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Premium filtering options
  const [filters, setFilters] = useState({
    starred: false,
    pinned: false,
    folders: [],
    tags: [],
    mood: "",
    minWordCount: "",
    searchQuery: "",
  });

  // Premium PDF customization
  const [pdfOptions, setPdfOptions] = useState({
    includePrompts: true,
    includeAnalysis: true,
    includeMood: true,
    includeTags: true,
    includeAttachments: true,
    pageSize: "letter",
    fontSize: "medium",
    theme: "elegant",
    includeTableOfContents: true,
    includeStatistics: true,
    customBranding: false,
    brandingText: "",
    watermark: false,
  });

  const presetRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "ytd", label: "Year to Date" },
    { value: "custom", label: "Custom Range" },
  ];

  const exportFormats = [
    { value: "pdf", label: "PDF", icon: FileText, color: "text-red-400" },
    {
      value: "csv",
      label: "CSV",
      icon: FileSpreadsheet,
      color: "text-green-400",
    },
    {
      value: "json",
      label: "JSON",
      icon: Code,
      color: "text-blue-400",
      premium: true,
    },
  ];

  const pdfThemes = [
    { value: "elegant", label: "Elegant" },
    { value: "minimal", label: "Minimal" },
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "creative", label: "Creative" },
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
          ...filters,
          premium: true,
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
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-purple-400" />
        Premium Journal Export
      </h2>

      {/* Export Format Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Export Format</h3>

        <div className="grid grid-cols-3 gap-4">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <label
                key={format.value}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  exportFormat === format.value
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <input
                  type="radio"
                  value={format.value}
                  checked={exportFormat === format.value}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <Icon className={`h-8 w-8 ${format.color} mx-auto mb-2`} />
                  <span className="font-medium text-white">{format.label}</span>
                  {format.premium && (
                    <div className="mt-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      PREMIUM
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Date Range
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {presetRanges.slice(0, -1).map((range) => (
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
                name="dateRange"
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
              <span className="block text-center">{range.label}</span>
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

      {/* Premium Filtering Options */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-400" />
          Advanced Filters
          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
            PREMIUM
          </span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input
                type="checkbox"
                checked={filters.starred}
                onChange={(e) =>
                  setFilters({ ...filters, starred: e.target.checked })
                }
                className="rounded text-purple-600"
              />
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white">Starred entries only</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input
                type="checkbox"
                checked={filters.pinned}
                onChange={(e) =>
                  setFilters({ ...filters, pinned: e.target.checked })
                }
                className="rounded text-purple-600"
              />
              <span className="text-white">Pinned entries only</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Folders
            </label>
            <input
              type="text"
              placeholder="Enter folder names, separated by commas"
              value={filters.folders.join(", ")}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  folders: e.target.value
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Tags
            </label>
            <input
              type="text"
              placeholder="Enter tags, separated by commas"
              value={filters.tags.join(", ")}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mood Filter
              </label>
              <select
                value={filters.mood}
                onChange={(e) =>
                  setFilters({ ...filters, mood: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All moods</option>
                <option value="happy">Happy</option>
                <option value="calm">Calm</option>
                <option value="anxious">Anxious</option>
                <option value="sad">Sad</option>
                <option value="excited">Excited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Word Count
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={filters.minWordCount}
                onChange={(e) =>
                  setFilters({ ...filters, minWordCount: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Premium PDF Customization */}
      {exportFormat === "pdf" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            PDF Customization
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={pdfOptions.theme}
                  onChange={(e) =>
                    setPdfOptions({ ...pdfOptions, theme: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {pdfThemes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <select
                  value={pdfOptions.fontSize}
                  onChange={(e) =>
                    setPdfOptions({ ...pdfOptions, fontSize: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeTableOfContents}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      includeTableOfContents: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Include table of contents</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeStatistics}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      includeStatistics: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Include statistics summary</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pdfOptions.customBranding}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      customBranding: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-white">Add custom branding</span>
              </label>

              {pdfOptions.customBranding && (
                <input
                  type="text"
                  placeholder="Your branding text"
                  value={pdfOptions.brandingText}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      brandingText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ml-6"
                />
              )}
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
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export Premium Journal
            </>
          )}
        </button>
      </div>
    </div>
  );
}
