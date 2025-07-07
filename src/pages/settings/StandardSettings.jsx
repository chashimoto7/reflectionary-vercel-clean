// frontend/ src/pages/settings/StandardSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  User,
  Download,
  Crown,
  Calendar,
  FileSpreadsheet,
  Target,
  Heart,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSecurity } from "../../contexts/SecurityContext";
import { supabase } from "../../lib/supabase";

export default function StandardSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Export states
  const [activeExportTab, setActiveExportTab] = useState("journal");
  const [dateRangeType, setDateRangeType] = useState("preset");
  const [presetDateRange, setPresetDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Handle export for different types
  const handleExport = async (type) => {
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
            : { type: presetDateRange },
        format: "csv",
      };

      const response = await fetch(`/api/export/${type}-csv`, {
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
      a.download = `${type}-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } data exported successfully!`
      );
    } catch (err) {
      setError(`Failed to export ${type} data. Please try again.`);
    } finally {
      setExporting(false);
    }
  };

  // Section navigation
  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "export", label: "Export Data", icon: Download },
  ];

  // Export tabs
  const exportTabs = [
    { id: "journal", label: "Journal", icon: FileSpreadsheet },
    { id: "goals", label: "Goals", icon: Target },
    { id: "wellness", label: "Wellness", icon: Heart },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8" />
        Standard Settings
      </h1>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
                  activeSection === section.id
                    ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Export Section */}
        {activeSection === "export" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Export Your Data
            </h2>

            {/* Export Tabs */}
            <div className="border-b">
              <div className="flex gap-4">
                {exportTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveExportTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                        activeExportTab === tab.id
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range
              </h3>

              {/* Range Type Toggle */}
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

              {/* Preset Options */}
              {dateRangeType === "preset" && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "all", label: "All Time" },
                    { value: "7days", label: "Last 7 Days" },
                    { value: "30days", label: "Last 30 Days" },
                    { value: "90days", label: "Last 90 Days" },
                    { value: "6months", label: "Last 6 Months" },
                    { value: "year", label: "Last Year" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="presetRange"
                        value={option.value}
                        checked={presetDateRange === option.value}
                        onChange={(e) => setPresetDateRange(e.target.value)}
                        className="text-purple-600"
                      />
                      <span className="text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Custom Date Inputs */}
              {dateRangeType === "custom" && (
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

              {/* Export Button */}
              <button
                onClick={() => handleExport(activeExportTab)}
                disabled={
                  exporting ||
                  (dateRangeType === "custom" &&
                    (!customStartDate || !customEndDate))
                }
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export{" "}
                    {activeExportTab.charAt(0).toUpperCase() +
                      activeExportTab.slice(1)}{" "}
                    Data
                  </>
                )}
              </button>
            </div>

            {/* Format Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Export Format</h4>
              <p className="text-sm text-gray-600">
                All exports are in CSV format, compatible with Excel, Google
                Sheets, and other spreadsheet applications.
              </p>
            </div>

            {/* Upgrade Prompt */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-900">
                    Want Advanced Export Options?
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Upgrade to Advanced or Premium for PDF exports, advanced
                    filtering, and analytics reports.
                  </p>
                  <button className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                    View Upgrade Options →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account and Security sections remain similar to BasicSettings */}
      </div>
    </div>
  );
}
