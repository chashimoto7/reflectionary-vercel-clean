// src/components/womenshealth/tabs/DataExportTab.jsx
import React, { useState } from "react";
import {
  Download,
  Share,
  Cloud,
  FileText,
  Database,
  Calendar,
  Filter,
  Settings,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Smartphone,
  Monitor,
  Mail,
  Printer,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
} from "lucide-react";

const DataExportTab = ({ data, lifeStage, colors }) => {
  const [selectedExportType, setSelectedExportType] = useState("comprehensive");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("all");
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  // Export type configurations
  const exportTypes = [
    {
      id: "comprehensive",
      title: "Complete Health Data",
      description:
        "All tracked health data including cycles, symptoms, and analytics",
      icon: Database,
      dataPoints: "2,847",
      size: "~2.3 MB",
      includes: [
        "Daily health entries",
        "Cycle data",
        "Symptoms",
        "Analytics",
        "Insights",
      ],
    },
    {
      id: "cycle-only",
      title: "Cycle Data Only",
      description: "Menstrual cycle information and patterns",
      icon: Calendar,
      dataPoints: "156",
      size: "~0.8 MB",
      includes: [
        "Period dates",
        "Cycle length",
        "Flow data",
        "Phase information",
      ],
    },
    {
      id: "symptoms",
      title: "Symptom Tracking",
      description: "Detailed symptom logs and severity ratings",
      icon: FileText,
      dataPoints: "1,249",
      size: "~1.1 MB",
      includes: [
        "Symptom entries",
        "Severity ratings",
        "Frequency data",
        "Correlations",
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Insights",
      description: "Generated insights and pattern analysis",
      icon: Share,
      dataPoints: "89",
      size: "~0.3 MB",
      includes: [
        "AI insights",
        "Pattern analysis",
        "Predictions",
        "Recommendations",
      ],
    },
  ];

  // Export format options
  const exportFormats = [
    {
      id: "csv",
      title: "CSV (Spreadsheet)",
      description: "Compatible with Excel, Google Sheets",
      icon: FileText,
      pros: ["Easy to analyze", "Universal compatibility", "Human readable"],
      cons: ["Limited metadata", "No formatting"],
    },
    {
      id: "json",
      title: "JSON (Structured)",
      description: "Complete data with full structure and metadata",
      icon: Database,
      pros: [
        "Complete data integrity",
        "Preserves relationships",
        "Developer friendly",
      ],
      cons: ["Requires technical knowledge", "Larger file size"],
    },
    {
      id: "pdf",
      title: "PDF Report",
      description: "Formatted report for sharing with providers",
      icon: Printer,
      pros: ["Professional format", "Easy to share", "Preserves formatting"],
      cons: ["Not editable", "Limited data analysis"],
    },
  ];

  // Integration options
  const integrationOptions = [
    {
      id: "apple-health",
      title: "Apple Health",
      description: "Export to Apple Health app",
      icon: Smartphone,
      status: "available",
      dataTypes: ["Menstrual cycles", "Symptoms", "Body temperature"],
    },
    {
      id: "google-fit",
      title: "Google Fit",
      description: "Sync with Google Fit",
      icon: Monitor,
      status: "coming-soon",
      dataTypes: ["Activity data", "Sleep patterns", "Wellness metrics"],
    },
    {
      id: "healthcare-provider",
      title: "Healthcare Provider Portal",
      description: "Direct sharing with your provider",
      icon: Mail,
      status: "available",
      dataTypes: [
        "Complete health summary",
        "Trend analysis",
        "Recommendations",
      ],
    },
  ];

  // Privacy options
  const privacyOptions = [
    {
      id: "full-data",
      title: "Complete Data Export",
      description: "All data including sensitive information",
      level: "high-sensitivity",
    },
    {
      id: "anonymized",
      title: "Anonymized Export",
      description: "Data with personal identifiers removed",
      level: "medium-sensitivity",
    },
    {
      id: "aggregated",
      title: "Summary Only",
      description: "Aggregated patterns without raw data",
      level: "low-sensitivity",
    },
  ];

  const currentExportType = exportTypes.find(
    (t) => t.id === selectedExportType
  );
  const currentFormat = exportFormats.find((f) => f.id === selectedFormat);

  const handleExport = async () => {
    setExportStatus("processing");

    // Simulate export process
    setTimeout(() => {
      setExportStatus("complete");
      setTimeout(() => setExportStatus(null), 3000);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50";
      case "coming-soon":
        return "text-amber-600 bg-amber-50";
      case "unavailable":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSensitivityColor = (level) => {
    switch (level) {
      case "high-sensitivity":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium-sensitivity":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low-sensitivity":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Download className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Data Export & Sharing
              </h2>
              <p className="text-gray-600">
                Export, share, and integrate your health data
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {data?.overview?.totalEntries || 2847}
            </div>
            <div className="text-sm text-gray-600">Total Data Points</div>
          </div>
        </div>

        {/* Quick Export Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">4</div>
            <div className="text-xs text-gray-600">Export Types</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">3</div>
            <div className="text-xs text-gray-600">File Formats</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">3</div>
            <div className="text-xs text-gray-600">Integrations</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">100%</div>
            <div className="text-xs text-gray-600">Privacy Protected</div>
          </div>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Configure Your Export
        </h3>

        {/* Export Type Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Choose Data to Export
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedExportType(type.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedExportType === type.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent
                      className={`w-5 h-5 mt-1 ${
                        selectedExportType === type.id
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {type.title}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {type.description}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>{type.dataPoints} data points</span>
                        <span>{type.size}</span>
                      </div>

                      <div className="space-y-1">
                        {type.includes.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Choose Export Format
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedFormat === format.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent
                      className={`w-5 h-5 ${
                        selectedFormat === format.id
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {format.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-green-700 mb-1">
                        Pros:
                      </div>
                      {format.pros.map((pro, index) => (
                        <div key={index} className="text-xs text-green-600">
                          • {pro}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-red-700 mb-1">
                        Cons:
                      </div>
                      {format.cons.map((con, index) => (
                        <div key={index} className="text-xs text-red-600">
                          • {con}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <Settings className="w-4 h-4" />
            Advanced Options
            {showAdvancedOptions ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {showAdvancedOptions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Time</option>
                    <option value="last-year">Last Year</option>
                    <option value="last-6months">Last 6 Months</option>
                    <option value="last-3months">Last 3 Months</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Data
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeAnalytics}
                        onChange={(e) => setIncludeAnalytics(e.target.checked)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        Include analytics data
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeInsights}
                        onChange={(e) => setIncludeInsights(e.target.checked)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        Include AI insights
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div>
            <div className="font-medium text-gray-900">
              Ready to export: {currentExportType?.title} as{" "}
              {currentFormat?.title}
            </div>
            <div className="text-sm text-gray-600">
              Estimated size: {currentExportType?.size} •{" "}
              {currentExportType?.dataPoints} data points
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exportStatus === "processing"}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {exportStatus === "processing" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : exportStatus === "complete" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Integration Options */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Health App Integrations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrationOptions.map((integration) => {
            const IconComponent = integration.icon;
            const statusClass = getStatusColor(integration.status);

            return (
              <div
                key={integration.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-4">
                  <IconComponent className="w-6 h-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {integration.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {integration.description}
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                    >
                      {integration.status === "available"
                        ? "Available"
                        : integration.status === "coming-soon"
                        ? "Coming Soon"
                        : "Unavailable"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xs font-medium text-gray-700">
                    Supported Data:
                  </div>
                  {integration.dataTypes.map((type, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {type}
                    </div>
                  ))}
                </div>

                <button
                  disabled={integration.status !== "available"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {integration.status === "available"
                    ? "Connect"
                    : "Not Available"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Privacy & Security Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {privacyOptions.map((option) => {
            const sensitivityClass = getSensitivityColor(option.level);

            return (
              <div
                key={option.id}
                className={`p-4 border rounded-lg ${sensitivityClass}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">{option.title}</span>
                </div>
                <div className="text-sm mb-3">{option.description}</div>
                <div className="text-xs uppercase font-medium">
                  {option.level.replace("-", " ")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Security Features
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                End-to-end encryption
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Secure download links (24-hour expiry)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Password protection option
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Audit trail for all exports
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Compliance</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                HIPAA compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                GDPR compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                SOC 2 Type II certified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Data portability rights
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Export History
        </h3>

        <div className="space-y-3">
          {[
            {
              type: "Complete Health Data",
              format: "CSV",
              date: "2025-06-14",
              size: "2.3 MB",
              status: "completed",
            },
            {
              type: "Cycle Data Only",
              format: "JSON",
              date: "2025-05-28",
              size: "0.8 MB",
              status: "completed",
            },
            {
              type: "Analytics & Insights",
              format: "PDF",
              date: "2025-05-15",
              size: "0.3 MB",
              status: "completed",
            },
          ].map((export_item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {export_item.type}
                  </div>
                  <div className="text-sm text-gray-600">
                    {export_item.format} • {export_item.date} •{" "}
                    {export_item.size}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Completed
                </span>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View All Exports
          </button>
        </div>
      </div>

      {/* Data Rights & Control */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Your Data Rights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Portability</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                You have the right to receive your personal data in a
                structured, commonly used, and machine-readable format.
              </p>
              <p>
                You can request data transfer to another service provider where
                technically feasible.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Control</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Request complete data download
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
                Request data deletion
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Note</p>
              <p>
                All exported data is your personal property. We recommend
                storing exports securely and only sharing with trusted
                healthcare providers. Data exports may contain sensitive health
                information that should be handled according to privacy
                regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportTab;
