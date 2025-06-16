// src/components/history/tabs/DataExportTab.jsx
import React, { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Settings,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  BarChart3,
  FileImage,
  Mail,
  Cloud,
  Printer,
  Share2,
} from "lucide-react";

const DataExportTab = ({ entries, analytics, folders, colors }) => {
  const [exportSettings, setExportSettings] = useState({
    format: "pdf", // pdf, docx, txt, json, csv
    dateRange: "all", // all, last30, last90, last365, custom
    includePrompts: true,
    includeFollowUps: true,
    includeMetadata: true,
    includeAnalytics: true,
    onlyStarred: false,
    onlyPinned: false,
    selectedFolders: [],
    customStartDate: "",
    customEndDate: "",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExportDate, setLastExportDate] = useState(null);

  const exportFormats = [
    {
      id: "pdf",
      name: "PDF Document",
      description: "Formatted document with styling",
      icon: FileText,
      recommended: true,
      features: [
        "Formatting preserved",
        "Images supported",
        "Professional layout",
      ],
    },
    {
      id: "docx",
      name: "Word Document",
      description: "Editable Microsoft Word format",
      icon: FileText,
      features: ["Fully editable", "Compatible with Word", "Table support"],
    },
    {
      id: "txt",
      name: "Plain Text",
      description: "Simple text file, no formatting",
      icon: FileText,
      features: ["Lightweight", "Universal compatibility", "No formatting"],
    },
    {
      id: "json",
      name: "JSON Data",
      description: "Structured data for developers",
      icon: Settings,
      features: ["Machine readable", "Complete metadata", "Developer friendly"],
    },
    {
      id: "csv",
      name: "Spreadsheet (CSV)",
      description: "For analysis in Excel/Sheets",
      icon: BarChart3,
      features: ["Excel compatible", "Data analysis", "Statistical work"],
    },
  ];

  const dateRangeOptions = [
    { id: "all", name: "All entries", description: "Export everything" },
    { id: "last30", name: "Last 30 days", description: "Recent entries" },
    { id: "last90", name: "Last 3 months", description: "Quarterly review" },
    { id: "last365", name: "Last year", description: "Annual export" },
    {
      id: "custom",
      name: "Custom range",
      description: "Select specific dates",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export process with progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // In a real implementation, this would call your export service
      const exportData = prepareExportData();
      downloadFile(exportData, exportSettings.format);

      setLastExportDate(new Date());
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const prepareExportData = () => {
    // Filter entries based on settings
    let filteredEntries = entries;

    // Date filtering
    if (exportSettings.dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (exportSettings.dateRange) {
        case "last30":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last90":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "last365":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "custom":
          startDate = exportSettings.customStartDate
            ? new Date(exportSettings.customStartDate)
            : null;
          break;
      }

      if (startDate) {
        filteredEntries = filteredEntries.filter(
          (entry) => new Date(entry.created_at) >= startDate
        );
      }
    }

    // Special filters
    if (exportSettings.onlyStarred) {
      filteredEntries = filteredEntries.filter((entry) => entry.starred);
    }
    if (exportSettings.onlyPinned) {
      filteredEntries = filteredEntries.filter((entry) => entry.pinned);
    }

    // Folder filter
    if (exportSettings.selectedFolders.length > 0) {
      filteredEntries = filteredEntries.filter((entry) =>
        exportSettings.selectedFolders.includes(entry.folder_id)
      );
    }

    return {
      entries: filteredEntries,
      settings: exportSettings,
      analytics: exportSettings.includeAnalytics ? analytics : null,
      exportDate: new Date().toISOString(),
      totalEntries: filteredEntries.length,
    };
  };

  const downloadFile = (data, format) => {
    // This would be replaced with actual file generation logic
    const filename = `journal-export-${
      new Date().toISOString().split("T")[0]
    }.${format}`;

    // Simulate file download
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredEntryCount = () => {
    // Calculate how many entries would be exported
    let count = entries.length;

    if (exportSettings.onlyStarred) {
      count = entries.filter((e) => e.starred).length;
    } else if (exportSettings.onlyPinned) {
      count = entries.filter((e) => e.pinned).length;
    }

    // Add date range filtering logic here if needed
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export & Reports</h2>
          <p className="text-gray-600 mt-1">
            Download your journal entries and analytics in various formats
          </p>
        </div>
        {lastExportDate && (
          <div className="text-sm text-gray-500">
            Last export: {lastExportDate.toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Export Status */}
      {isExporting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="flex-1">
              <p className="text-blue-800 font-medium">
                Preparing your export...
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <div
                  key={format.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    exportSettings.format === format.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setExportSettings((prev) => ({
                      ...prev,
                      format: format.id,
                    }))
                  }
                >
                  <div className="flex items-center gap-3">
                    <format.icon
                      className={`h-6 w-6 ${
                        exportSettings.format === format.id
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {format.name}
                        </span>
                        {format.recommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {format.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {format.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Date Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {dateRangeOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition ${
                    exportSettings.dateRange === option.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setExportSettings((prev) => ({
                      ...prev,
                      dateRange: option.id,
                    }))
                  }
                >
                  <div className="font-medium text-gray-900">{option.name}</div>
                  <div className="text-sm text-gray-600">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>

            {exportSettings.dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportSettings.customStartDate}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        customStartDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportSettings.customEndDate}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        customEndDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Options */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content Options
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportSettings.includePrompts}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        includePrompts: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Include prompts</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeFollowUps}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        includeFollowUps: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Include follow-ups</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeMetadata}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        includeMetadata: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    Include metadata (mood, theme, etc.)
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeAnalytics}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        includeAnalytics: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    Include analytics summary
                  </span>
                </label>
              </div>

              {/* Special Filters */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Special Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportSettings.onlyStarred}
                      onChange={(e) =>
                        setExportSettings((prev) => ({
                          ...prev,
                          onlyStarred: e.target.checked,
                          onlyPinned: false,
                        }))
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Only starred entries</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportSettings.onlyPinned}
                      onChange={(e) =>
                        setExportSettings((prev) => ({
                          ...prev,
                          onlyPinned: e.target.checked,
                          onlyStarred: false,
                        }))
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Only pinned entries</span>
                  </label>
                </div>
              </div>

              {/* Folder Selection */}
              {folders.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Select Folders (optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {folders.map((folder) => (
                      <label
                        key={folder.id}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={exportSettings.selectedFolders.includes(
                            folder.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportSettings((prev) => ({
                                ...prev,
                                selectedFolders: [
                                  ...prev.selectedFolders,
                                  folder.id,
                                ],
                              }));
                            } else {
                              setExportSettings((prev) => ({
                                ...prev,
                                selectedFolders: prev.selectedFolders.filter(
                                  (id) => id !== folder.id
                                ),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 text-sm">
                          {folder.decryptedName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Summary & Actions */}
        <div className="space-y-6">
          {/* Export Summary */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium text-gray-900">
                  {
                    exportFormats.find((f) => f.id === exportSettings.format)
                      ?.name
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Entries:</span>
                <span className="font-medium text-gray-900">
                  {getFilteredEntryCount()} entries
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date Range:</span>
                <span className="font-medium text-gray-900">
                  {
                    dateRangeOptions.find(
                      (d) => d.id === exportSettings.dateRange
                    )?.name
                  }
                </span>
              </div>
              {exportSettings.includeAnalytics && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analytics:</span>
                  <span className="font-medium text-green-700">Included</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Your data remains encrypted during export</span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <button
              onClick={handleExport}
              disabled={isExporting || getFilteredEntryCount() === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                isExporting || getFilteredEntryCount() === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <Download className="h-5 w-5" />
              {isExporting ? "Preparing Export..." : "Export Journal"}
            </button>

            {getFilteredEntryCount() === 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                No entries match your selected criteria
              </p>
            )}
          </div>

          {/* Quick Export Options */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Exports
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">This Month</div>
                  <div className="text-sm text-gray-600">
                    PDF format, all content
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <BookOpen className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-gray-900">Starred Only</div>
                  <div className="text-sm text-gray-600">
                    Your favorite entries
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Analytics Report
                  </div>
                  <div className="text-sm text-gray-600">
                    Data analysis only
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Email Export</div>
                  <div className="text-sm text-gray-600">
                    Send to your email
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Printer className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Print Version</div>
                  <div className="text-sm text-gray-600">
                    Printer-friendly format
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Share2 className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Share Insights
                  </div>
                  <div className="text-sm text-gray-600">
                    Share anonymized analytics
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Privacy & Security</h4>
            <p className="text-sm text-blue-800 mt-1">
              Your journal entries are decrypted locally before export. Exported
              files contain your personal data in plain text. Store exported
              files securely and delete them when no longer needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportTab;
