// src/components/womenshealth/tabs/HealthReportsTab.jsx
import React, { useState } from "react";
import {
  BarChart3,
  FileText,
  Download,
  Share,
  Calendar,
  TrendingUp,
  Heart,
  Activity,
  Moon,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  Printer,
  Mail,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Shield,
  Lock,
  Key,
  Users,
  Database,
  ExternalLink,
  Copy,
  Settings,
  FileX,
  History,
  Archive,
  Globe,
  UserCheck,
  HelpCircle,
  Star,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const HealthReportsTab = ({ data, lifeStage, colors }) => {
  const [selectedReport, setSelectedReport] = useState("comprehensive");
  const [reportPeriod, setReportPeriod] = useState("3months");
  const [showDetails, setShowDetails] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [shareSettings, setShareSettings] = useState({
    includeRawData: false,
    includeInsights: true,
    includePredictions: false,
    anonymize: true,
  });

  // Mock comprehensive health data
  const healthData = data || {
    overview: { totalEntries: 0, healthScore: 0 },
    cycles: { averageLength: 28, regularity: 85 },
    symptoms: { frequency: [] },
    predictions: { accuracy: 85 },
  };

  // Available report types
  const reportTypes = [
    {
      id: "comprehensive",
      title: "Comprehensive Health Report",
      description: "Complete overview of your women's health journey",
      icon: FileText,
      duration: "Full analysis",
      sections: [
        "Overview",
        "Cycle Analysis",
        "Symptom Patterns",
        "Predictions",
        "Recommendations",
      ],
      privacy: "high",
      fileSize: "2.8 MB",
    },
    {
      id: "cycle-summary",
      title: "Cycle Summary Report",
      description: "Focused analysis of your menstrual cycle patterns",
      icon: Moon,
      duration: "Cycle-focused",
      sections: [
        "Cycle Length",
        "Regularity",
        "Phase Patterns",
        "Fertility Windows",
      ],
      privacy: "medium",
      fileSize: "1.2 MB",
    },
    {
      id: "symptom-analysis",
      title: "Symptom Analysis Report",
      description: "Detailed breakdown of symptoms and triggers",
      icon: Activity,
      duration: "Symptom-focused",
      sections: [
        "Frequency Analysis",
        "Severity Trends",
        "Correlations",
        "Management Tips",
      ],
      privacy: "medium",
      fileSize: "1.8 MB",
    },
    {
      id: "wellness-trends",
      title: "Wellness Trends Report",
      description: "Holistic view of your overall well-being patterns",
      icon: TrendingUp,
      duration: "Wellness-focused",
      sections: [
        "Mood Trends",
        "Energy Patterns",
        "Sleep Quality",
        "Lifestyle Factors",
      ],
      privacy: "low",
      fileSize: "1.5 MB",
    },
    {
      id: "medical-summary",
      title: "Medical Summary Report",
      description: "Professional report for healthcare providers",
      icon: Heart,
      duration: "Clinical format",
      sections: [
        "Medical History",
        "Cycle Data",
        "Symptoms",
        "Recommendations",
      ],
      privacy: "high",
      fileSize: "3.2 MB",
    },
  ];

  // Report history
  const reportHistory = [
    {
      id: "1",
      type: "comprehensive",
      title: "Comprehensive Health Report",
      date: "2025-06-01",
      period: "3months",
      status: "completed",
      downloads: 3,
    },
    {
      id: "2",
      type: "cycle-summary",
      title: "Cycle Summary Report",
      date: "2025-05-15",
      period: "1month",
      status: "completed",
      downloads: 1,
    },
    {
      id: "3",
      type: "symptom-analysis",
      title: "Symptom Analysis Report",
      date: "2025-05-01",
      period: "6months",
      status: "archived",
      downloads: 2,
    },
  ];

  // Generate mock report data based on selected type and period
  const generateReportData = () => {
    const baseData = {
      generatedDate: new Date().toLocaleDateString(),
      period: reportPeriod,
      totalDays:
        reportPeriod === "1month" ? 30 : reportPeriod === "3months" ? 90 : 180,
      dataPoints:
        reportPeriod === "1month"
          ? 850
          : reportPeriod === "3months"
          ? 2100
          : 4200,
    };

    switch (selectedReport) {
      case "comprehensive":
        return {
          ...baseData,
          healthScore: 87,
          cycleRegularity: 92,
          symptomManagement: 78,
          overallTrend: "improving",
          keyInsights: [
            "Your cycle regularity has improved by 8% over the analysis period",
            "Energy levels consistently peak during ovulatory phase",
            "Sleep quality correlates strongly with cycle phase (r=0.72)",
            "Stress management techniques show positive impact on symptoms",
          ],
          recommendations: [
            "Continue current lifestyle habits as they're supporting healthy cycles",
            "Consider scheduling important activities during high-energy phases",
            "Implement targeted sleep hygiene during luteal phase",
          ],
        };
      case "cycle-summary":
        return {
          ...baseData,
          averageCycleLength: 28.3,
          cycleVariation: "±2.1 days",
          regularityScore: 92,
          ovulationConsistency: 94,
          lutealPhaseLength: 14.2,
        };
      case "symptom-analysis":
        return {
          ...baseData,
          primarySymptoms: ["Cramps", "Fatigue", "Mood Changes"],
          averageSeverity: 4.8,
          symptomsImproving: 2,
          symptomsStable: 4,
          symptomsWorsening: 1,
        };
      case "wellness-trends":
        return {
          ...baseData,
          averageMood: 7.2,
          energyTrend: "stable",
          sleepQuality: 7.8,
          stressLevel: 4.2,
        };
      case "medical-summary":
        return {
          ...baseData,
          medicalRelevance: "high",
          clinicalMarkers: ["Regular cycles", "Normal symptom patterns"],
          recommendations: [
            "Continue monitoring",
            "Annual check-up recommended",
          ],
        };
      default:
        return baseData;
    }
  };

  const reportData = generateReportData();
  const currentReport = reportTypes.find((r) => r.id === selectedReport);

  // Chart data for different report types
  const chartData = {
    comprehensive: [
      { month: "Jan", health: 82, mood: 7.1, energy: 7.8, sleep: 7.2 },
      { month: "Feb", health: 84, mood: 7.3, energy: 8.0, sleep: 7.4 },
      { month: "Mar", health: 87, mood: 7.5, energy: 8.2, sleep: 7.8 },
    ],
    cycleSummary: [
      { cycle: 1, length: 28, regularity: 95 },
      { cycle: 2, length: 29, regularity: 90 },
      { cycle: 3, length: 27, regularity: 88 },
      { cycle: 4, length: 28, regularity: 92 },
    ],
    symptomAnalysis: [
      { symptom: "Cramps", frequency: 85, severity: 6.2 },
      { symptom: "Fatigue", frequency: 72, severity: 5.8 },
      { symptom: "Bloating", frequency: 68, severity: 4.9 },
      { symptom: "Mood Changes", frequency: 61, severity: 5.5 },
    ],
    wellnessTrends: [
      { week: "Week 1", mood: 6.8, energy: 7.2, stress: 4.5 },
      { week: "Week 2", mood: 7.8, energy: 8.5, stress: 3.2 },
      { week: "Week 3", mood: 8.2, energy: 8.8, stress: 2.8 },
      { week: "Week 4", mood: 6.5, energy: 6.8, stress: 5.1 },
    ],
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "stable":
        return <Target className="w-4 h-4 text-blue-600" />;
      case "declining":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getPrivacyColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleExportReport = (format) => {
    // Mock export functionality
    console.log(`Exporting ${selectedReport} report as ${format}`);
    setShowExportModal(false);
    // In real app, would trigger download
  };

  const handleShareReport = (method) => {
    // Mock sharing functionality
    console.log(`Sharing report via ${method}`);
    // In real app, would handle sharing
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Health Reports
              </h2>
              <p className="text-gray-600">
                Comprehensive analysis and insights
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {reportData.dataPoints?.toLocaleString() || "2,100"}
            </div>
            <div className="text-sm text-gray-600">Data Points Analyzed</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {reportData.totalDays || 90}
            </div>
            <div className="text-xs text-gray-600">Days Covered</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {reportData.healthScore || 87}%
            </div>
            <div className="text-xs text-gray-600">Health Score</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {reportData.cycleRegularity || 92}%
            </div>
            <div className="text-xs text-gray-600">Regularity</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">High</div>
            <div className="text-xs text-gray-600">Data Quality</div>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Generate Health Report
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            const privacyClass = getPrivacyColor(report.privacy);
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${privacyClass}`}
                    >
                      {report.privacy} privacy
                    </span>
                    <div className="text-xs text-gray-500">
                      {report.fileSize}
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {report.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {report.description}
                </p>
                <div className="text-xs text-blue-600">{report.duration}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Report Preview */}
      {currentReport && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <currentReport.icon className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentReport.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentReport.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => setShowPrivacySettings(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Privacy
              </button>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Report Sections:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentReport.sections.map((section, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{section}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Visualization Preview */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Data Preview:</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {selectedReport === "comprehensive" && (
                  <LineChart data={chartData.comprehensive}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke={colors.primary}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke={colors.secondary}
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
                {selectedReport === "cycle-summary" && (
                  <BarChart data={chartData.cycleSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="cycle" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="length" fill={colors.primary} />
                  </BarChart>
                )}
                {selectedReport === "symptom-analysis" && (
                  <BarChart data={chartData.symptomAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="symptom" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill={colors.warning} />
                  </BarChart>
                )}
                {selectedReport === "wellness-trends" && (
                  <AreaChart data={chartData.wellnessTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stackId="1"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stackId="1"
                      stroke={colors.accent}
                      fill={colors.accent}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}
                {selectedReport === "medical-summary" && (
                  <LineChart data={chartData.comprehensive}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke={colors.danger}
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Security */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Privacy & Security
            </h3>
            <p className="text-sm text-gray-600">
              Your health data is protected with end-to-end encryption
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <Lock className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-medium text-green-900 mb-2">
              End-to-End Encryption
            </h4>
            <p className="text-sm text-green-700">
              All report data is encrypted using AES-256 encryption before
              storage or transmission.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Key className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-medium text-blue-900 mb-2">HIPAA Compliance</h4>
            <p className="text-sm text-blue-700">
              Our platform meets HIPAA standards for healthcare data protection
              and privacy.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <UserCheck className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-medium text-purple-900 mb-2">
              Your Data Rights
            </h4>
            <p className="text-sm text-purple-700">
              You maintain full control over your data with options to export,
              delete, or restrict access.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900 mb-1">
                Data Usage Transparency
              </div>
              <div className="text-sm text-gray-600">
                Your health reports are generated locally on your device. No raw
                personal data is transmitted to our servers without your
                explicit consent. Aggregated, anonymized data may be used for
                research with your permission.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Rights & Control */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Data Rights & Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Your Rights</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">
                    Data Portability
                  </div>
                  <div className="text-sm text-green-700">
                    Export all your data in standard formats
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">
                    Access Control
                  </div>
                  <div className="text-sm text-blue-700">
                    View and manage who has access to your data
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <FileX className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">
                    Right to Deletion
                  </div>
                  <div className="text-sm text-red-700">
                    Permanently delete your data at any time
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Data Controls</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium">
                  Analytics Participation
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium">
                  Research Contribution
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium">Third-party Sharing</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-amber-900 mb-1">
                Data Retention Policy
              </div>
              <div className="text-sm text-amber-700">
                Your health data is retained for as long as your account is
                active. Deleted data is permanently removed within 30 days.
                Anonymized analytics data may be retained longer for research
                purposes only with your consent.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Export Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF Report</option>
                  <option value="csv">CSV Data</option>
                  <option value="json">JSON Data</option>
                  <option value="xlsx">Excel Spreadsheet</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includePersonalData}
                    onChange={(e) => setIncludePersonalData(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Include personal identifiers
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareSettings.includeInsights}
                    onChange={(e) =>
                      setShareSettings((prev) => ({
                        ...prev,
                        includeInsights: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Include AI insights
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareSettings.includePredictions}
                    onChange={(e) =>
                      setShareSettings((prev) => ({
                        ...prev,
                        includePredictions: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Include predictions
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleExportReport(selectedFormat)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export Report
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Privacy Settings
              </h3>
              <button
                onClick={() => setShowPrivacySettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Data Sharing Preferences
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium">
                      Include raw data in reports
                    </span>
                    <input
                      type="checkbox"
                      checked={shareSettings.includeRawData}
                      onChange={(e) =>
                        setShareSettings((prev) => ({
                          ...prev,
                          includeRawData: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium">
                      Anonymize personal data
                    </span>
                    <input
                      type="checkbox"
                      checked={shareSettings.anonymize}
                      onChange={(e) =>
                        setShareSettings((prev) => ({
                          ...prev,
                          anonymize: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Security Level
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="security"
                      value="standard"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Standard encryption
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="security"
                      value="enhanced"
                      defaultChecked
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Enhanced encryption (recommended)
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="security"
                      value="maximum"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Maximum security (may impact performance)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrivacySettings(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowPrivacySettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Report History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {report.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Generated on {new Date(report.date).toLocaleDateString()}{" "}
                      • {report.period}
                    </div>
                    <div className="text-xs text-gray-500">
                      Downloaded {report.downloads} times
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {report.status}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthReportsTab;
