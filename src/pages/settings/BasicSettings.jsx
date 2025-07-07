// frontend/ src/pages/settings/BasicSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  User,
  Download,
  Crown,
  Calendar,
  FileSpreadsheet,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSecurity } from "../../contexts/SecurityContext";
import { supabase } from "../../lib/supabase";

export default function BasicSettings() {
  const { user } = useAuth();
  const { securitySettings, updateSecuritySettings } = useSecurity();

  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Export state
  const [exportDateRange, setExportDateRange] = useState("all");

  // Handle journal export
  const handleJournalExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const exportConfig = {
        userId: user.id,
        dateRange: exportDateRange,
        format: "csv",
      };

      const response = await fetch("/api/export/journal-csv", {
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
      }.csv`;
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

  // Section navigation
  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "export", label: "Export Data", icon: Download },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8" />
        Basic Settings
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
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Export Your Data
            </h2>

            {/* Journal Export */}
            <div className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                    Journal Entries
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Export your journal entries as a spreadsheet (CSV format)
                  </p>
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date Range
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="dateRange"
                      value="all"
                      checked={exportDateRange === "all"}
                      onChange={(e) => setExportDateRange(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-gray-900">All entries</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="dateRange"
                      value="30days"
                      checked={exportDateRange === "30days"}
                      onChange={(e) => setExportDateRange(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-gray-900">Last 30 days</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="dateRange"
                      value="90days"
                      checked={exportDateRange === "90days"}
                      onChange={(e) => setExportDateRange(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-gray-900">Last 90 days</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleJournalExport}
                disabled={exporting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Journal
                  </>
                )}
              </button>
            </div>

            {/* Upgrade Prompt */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-900">
                    Want More Export Options?
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Upgrade to Standard or higher for custom date ranges,
                    multiple formats, and export goals & wellness data.
                  </p>
                  <button className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                    View Upgrade Options →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account and Security sections remain the same as FreeSettings */}
      </div>
    </div>
  );
}
