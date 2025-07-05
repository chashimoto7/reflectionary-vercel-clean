// src/components/settings/premium/CompleteExportTab.jsx
import React, { useState } from "react";
import {
  Package,
  Calendar,
  Download,
  FileArchive,
  Shield,
  Database,
  CheckCircle,
  AlertTriangle,
  Code,
  Loader,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function CompleteExportTab({ user, setError, setSuccess }) {
  const [exporting, setExporting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedSections, setSelectedSections] = useState({
    journal: true,
    analytics: true,
    goals: true,
    wellness: true,
    reflectionarian: true,
    settings: true,
    media: true,
    metadata: true,
  });

  const [exportOptions, setExportOptions] = useState({
    format: "archive", // archive, separate, developer
    encryption: true,
    includeDeleted: false,
    compression: "high",
    splitSize: "none", // none, 100mb, 500mb, 1gb
    generateReport: true,
    preserveStructure: true,
  });

  const [dateRange, setDateRange] = useState({
    type: "all",
    startDate: "",
    endDate: "",
  });

  const handleCompleteExport = async () => {
    setExporting(true);
    setPreparing(true);
    setExportProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Prepare export
      const exportId = `export-${user.id}-${Date.now()}`;

      const exportConfig = {
        userId: user.id,
        exportId,
        sections: selectedSections,
        options: exportOptions,
        dateRange,
        premium: true,
      };

      // Initialize export
      const initResponse = await fetch("/api/export/complete/init", {
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

      if (!initResponse.ok) throw new Error("Failed to initialize export");

      setPreparing(false);

      // Step 2: Process export with progress updates
      const processExport = async () => {
        const sections = Object.entries(selectedSections).filter(
          ([_, enabled]) => enabled
        );
        const totalSections = sections.length;

        for (let i = 0; i < sections.length; i++) {
          const [section] = sections[i];
          setExportProgress(Math.round(((i + 1) / totalSections) * 100));

          // Process each section
          await fetch(`/api/export/complete/process/${exportId}/${section}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${
                (
                  await supabase.auth.getSession()
                ).data.session?.access_token
              }`,
            },
          });
        }
      };

      await processExport();

      // Step 3: Generate final archive
      const finalResponse = await fetch(
        `/api/export/complete/finalize/${exportId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
          },
        }
      );

      if (!finalResponse.ok) throw new Error("Failed to finalize export");

      const blob = await finalResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `complete-export-${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(
        "Complete data export successful! Check your downloads folder."
      );
    } catch (err) {
      setError(
        "Failed to complete export. Please try again or contact support."
      );
    } finally {
      setExporting(false);
      setPreparing(false);
      setExportProgress(0);
    }
  };

  const calculateEstimatedSize = () => {
    // Rough estimates based on selected sections
    let sizeInMB = 0;
    if (selectedSections.journal) sizeInMB += 50;
    if (selectedSections.analytics) sizeInMB += 20;
    if (selectedSections.goals) sizeInMB += 10;
    if (selectedSections.wellness) sizeInMB += 15;
    if (selectedSections.reflectionarian) sizeInMB += 30;
    if (selectedSections.media) sizeInMB += 200;

    return sizeInMB;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <Package className="h-6 w-6 text-purple-400" />
        Complete Data Export
        <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full">
          PREMIUM ONLY
        </span>
      </h2>

      {/* Warning Banner */}
      <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-200 text-sm font-medium mb-1">
              Complete Export Notice
            </p>
            <p className="text-yellow-200/80 text-sm">
              This will export all your data in a downloadable archive. The
              process may take several minutes depending on the amount of data.
              Estimated size: ~{calculateEstimatedSize()}MB
            </p>
          </div>
        </div>
      </div>

      {/* Data Sections */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Data to Export</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              key: "journal",
              label: "Journal Entries",
              desc: "All entries, drafts, and templates",
            },
            {
              key: "analytics",
              label: "Analytics & Insights",
              desc: "Reports, trends, and analysis",
            },
            {
              key: "goals",
              label: "Goals & Progress",
              desc: "All goals, milestones, and tracking",
            },
            {
              key: "wellness",
              label: "Wellness Data",
              desc: "Health metrics and tracking",
            },
            {
              key: "reflectionarian",
              label: "AI Conversations",
              desc: "Reflectionarian chat history",
            },
            {
              key: "settings",
              label: "Settings & Preferences",
              desc: "App configuration and preferences",
            },
            {
              key: "media",
              label: "Media & Attachments",
              desc: "Images, files, and voice notes",
            },
            {
              key: "metadata",
              label: "Account Metadata",
              desc: "Tags, categories, and structure",
            },
          ].map((section) => (
            <label
              key={section.key}
              className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSections[section.key]}
                onChange={(e) =>
                  setSelectedSections({
                    ...selectedSections,
                    [section.key]: e.target.checked,
                  })
                }
                className="mt-1 rounded text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{section.label}</div>
                <div className="text-sm text-gray-400 mt-0.5">
                  {section.desc}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              const allSelected = Object.values(selectedSections).every(
                (v) => v
              );
              const newState = !allSelected;
              setSelectedSections(
                Object.keys(selectedSections).reduce(
                  (acc, key) => ({
                    ...acc,
                    [key]: newState,
                  }),
                  {}
                )
              );
            }}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {Object.values(selectedSections).every((v) => v)
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Export Options</h3>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={exportOptions.format}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, format: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="archive">Single Archive (ZIP)</option>
              <option value="separate">Separate Files by Type</option>
              <option value="developer">Developer Format (JSON + Media)</option>
            </select>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.encryption}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    encryption: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-white">Encrypt archive with password</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeDeleted}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    includeDeleted: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-white">Include deleted/archived items</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.generateReport}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    generateReport: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <span className="text-white">Generate export summary report</span>
            </label>
          </div>

          {/* Compression Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compression Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["low", "medium", "high"].map((level) => (
                <label
                  key={level}
                  className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                    exportOptions.compression === level
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-white/20 text-gray-300 hover:border-white/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="compression"
                    value={level}
                    checked={exportOptions.compression === level}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        compression: e.target.value,
                      })
                    }
                    className="sr-only"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range (Optional) */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Date Range (Optional)
        </h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRangeType"
              value="all"
              checked={dateRange.type === "all"}
              onChange={() =>
                setDateRange({ type: "all", startDate: "", endDate: "" })
              }
              className="text-purple-600"
            />
            <span className="text-white">Export all data (recommended)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRangeType"
              value="custom"
              checked={dateRange.type === "custom"}
              onChange={() => setDateRange({ ...dateRange, type: "custom" })}
              className="text-purple-600"
            />
            <span className="text-white">Limit to date range</span>
          </label>

          {dateRange.type === "custom" && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Progress */}
      {exporting && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">
                {preparing ? "Preparing export..." : "Exporting data..."}
              </span>
              <span className="text-purple-400">{exportProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              This may take a few minutes. Please don't close this window.
            </p>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <Database className="h-4 w-4 inline mr-1" />
          Your data privacy is our priority
        </div>

        <button
          onClick={handleCompleteExport}
          disabled={
            exporting || !Object.values(selectedSections).some((v) => v)
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
              <FileArchive className="h-5 w-5" />
              Start Complete Export
            </>
          )}
        </button>
      </div>
    </div>
  );
}
