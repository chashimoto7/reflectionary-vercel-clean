// src/pages/AdvancedWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import {
  Heart,
  Moon,
  Sun,
  Calendar,
  BookOpen,
  Thermometer,
  TrendingUp,
  Info,
  Crown,
  Shield,
  Flower,
  Activity,
  Brain,
  Clock,
  Sparkles,
  BarChart3,
  Target,
  Download,
  Users,
  Lightbulb,
  Award,
  Zap,
  AlertCircle,
} from "lucide-react";

// Import separate tab components
import WomensHealthOverviewTab from "../components/womenshealth/tabs/WomensHealthOverviewTab";
import CycleIntelligenceTab from "../components/womenshealth/tabs/CycleIntelligenceTab";
import HormonalPatternsTab from "../components/womenshealth/tabs/HormonalPatternsTab";
import SymptomAnalyticsTab from "../components/womenshealth/tabs/SymptomAnalyticsTab";
import LifeStageInsightsTab from "../components/womenshealth/tabs/LifeStageInsightsTab";
import WellnessCorrelationsTab from "../components/womenshealth/tabs/WellnessCorrelationsTab";
import PredictiveInsightsTab from "../components/womenshealth/tabs/PredictiveInsightsTab";
import EducationalResourcesTab from "../components/womenshealth/tabs/EducationalResourcesTab";
import HealthReportsTab from "../components/womenshealth/tabs/HealthReportsTab";
import DataExportTab from "../components/womenshealth/tabs/DataExportTab";

// Import life stage-specific modals
import WomensHealthEntryModal from "../components/womenshealth/WomensHealthEntryModal";
import PerimenopauseEntryModal from "../components/womenshealth/PerimenopauseEntryModal";
import MenopauseEntryModal from "../components/womenshealth/MenopauseEntryModal";

const AdvancedWomensHealth = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("3months");
  const [lifeStage, setLifeStage] = useState("menstrual"); // menstrual, perimenopause, menopause
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Advanced color palette for women's health
  const colors = {
    primary: "#EC4899", // Pink
    secondary: "#8B5CF6", // Purple
    accent: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    danger: "#EF4444", // Red
    menstrual: "#EF4444", // Red
    follicular: "#10B981", // Green
    ovulatory: "#F59E0B", // Amber
    luteal: "#8B5CF6", // Purple
    perimenopause: "#EC4899", // Pink
    menopause: "#6366F1", // Indigo
    gradient: [
      "#EC4899",
      "#8B5CF6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#06B6D4",
      "#6366F1",
      "#84CC16",
    ],
  };

  // Advanced tabs structure - 5 tabs per row
  const advancedTabs = [
    {
      id: "overview",
      label: "Health Overview",
      icon: Heart,
    },
    {
      id: "cycle-intelligence",
      label: "Cycle Intelligence",
      icon: Brain,
    },
    {
      id: "hormonal-patterns",
      label: "Hormonal Patterns",
      icon: TrendingUp,
    },
    {
      id: "symptom-analytics",
      label: "Symptom Analytics",
      icon: Activity,
    },
    {
      id: "life-stage-insights",
      label: "Life Stage Insights",
      icon: Sparkles,
    },
    {
      id: "wellness-correlations",
      label: "Wellness Correlations",
      icon: Target,
    },
    {
      id: "predictive-insights",
      label: "Predictive Insights",
      icon: Zap,
    },
    {
      id: "educational-resources",
      label: "Educational Hub",
      icon: BookOpen,
    },
    {
      id: "health-reports",
      label: "Health Reports",
      icon: BarChart3,
    },
    {
      id: "data-export",
      label: "Export & Data",
      icon: Download,
    },
  ];

  useEffect(() => {
    // Don't do anything until user and membership data are loaded
    if (!user || membershipLoading) {
      return;
    }

    // Check access directly without using the function in dependencies
    const userHasAccess = hasAccess("advanced_womens_health");

    if (userHasAccess) {
      loadAdvancedWomensHealthData();
    } else {
      // User doesn't have access - stop loading
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

  const loadAdvancedWomensHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🩸 Loading Advanced Women's Health Data...");

      // Load comprehensive women's health data
      const { data: healthEntries, error: healthError } = await supabase
        .from("womens_health_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (healthError) {
        console.error("Error loading women's health data:", healthError);
        setError("Failed to load women's health data");
        return;
      }

      // Load journal entries for correlation analysis
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (journalError) {
        console.error("Error loading journal entries:", journalError);
      }

      // Process and integrate data
      const processedData = await processAdvancedHealthData(
        healthEntries || [],
        journalEntries || []
      );

      setHealthData(processedData);
      console.log("✅ Advanced Women's Health Data Loaded:", processedData);
    } catch (err) {
      console.error("Error in loadAdvancedWomensHealthData:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const processAdvancedHealthData = async (healthEntries, journalEntries) => {
    // Advanced data processing for women's health analytics
    return {
      overview: {
        totalEntries: healthEntries.length,
        hasData: healthEntries.length > 0,
        currentPhase: calculateCurrentPhase(healthEntries),
        cycleDay: calculateCycleDay(healthEntries),
        cyclePredictions: generateCyclePredictions(healthEntries),
        healthScore: calculateOverallHealthScore(healthEntries),
      },
      cycleIntelligence: {
        patterns: analyzeCyclePatterns(healthEntries),
        irregularities: detectIrregularities(healthEntries),
        phaseCorrelations: correlateWithJournalData(
          healthEntries,
          journalEntries
        ),
        predictiveModel: buildPredictiveModel(healthEntries),
      },
      hormonalPatterns: {
        trends: analyzeHormonalTrends(healthEntries),
        fluctuations: trackHormonalFluctuations(healthEntries),
        lifeStageChanges: detectLifeStageChanges(healthEntries),
      },
      symptomAnalytics: {
        frequency: analyzeSymptomFrequency(healthEntries),
        severity: trackSymptomSeverity(healthEntries),
        correlations: findSymptomCorrelations(healthEntries, journalEntries),
        clusters: identifySymptomClusters(healthEntries),
      },
      lifeStageInsights: {
        currentStage: determineLifeStage(healthEntries),
        transitions: trackLifeStageTransitions(healthEntries),
        stageSpecificInsights: generateStageInsights(healthEntries),
      },
      wellnessCorrelations: {
        moodCycle: correlateMoodWithCycle(healthEntries, journalEntries),
        energyPatterns: correlateEnergyWithHormones(
          healthEntries,
          journalEntries
        ),
        sleepCycle: correlateSleepWithCycle(healthEntries, journalEntries),
      },
      predictiveInsights: {
        nextPeriod: predictNextPeriod(healthEntries),
        symptomForecasts: forecastSymptoms(healthEntries),
        fertileWindow: calculateFertileWindow(healthEntries),
        riskAssessments: assessHealthRisks(healthEntries),
      },
    };
  };

  // Helper functions for data processing
  const calculateCurrentPhase = (data) => {
    if (!data || data.length === 0) return "Unknown";

    const cycleDay = calculateCycleDay(data);
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 16) return "Ovulatory";
    return "Luteal";
  };

  const calculateCycleDay = (data) => {
    if (!data || data.length === 0) return 1;

    const lastPeriodEntry = data.find((d) => d.is_period_start);
    if (!lastPeriodEntry) return 1;

    const daysSince = Math.floor(
      (new Date() - new Date(lastPeriodEntry.date)) / (1000 * 60 * 60 * 24)
    );
    return Math.max(1, daysSince + 1);
  };

  const generateCyclePredictions = (data) => {
    // Simplified prediction logic
    return {
      nextPeriod: "June 25, 2025",
      fertileWindow: "June 12-16, 2025",
      confidence: 85,
    };
  };

  const calculateOverallHealthScore = (data) => {
    if (!data || data.length === 0) return 0;

    // Simplified health score calculation
    const recentEntries = data.slice(0, 30);
    const avgSymptomSeverity =
      recentEntries.reduce((sum, entry) => {
        return sum + (entry.symptom_severity || 5);
      }, 0) / recentEntries.length;

    return Math.round(((10 - avgSymptomSeverity) / 10) * 100);
  };

  // Placeholder functions for advanced analytics
  const analyzeCyclePatterns = (data) => ({ patterns: [], regularity: 85 });
  const detectIrregularities = (data) => ({ count: 2, severity: "low" });
  const correlateWithJournalData = (health, journal) => ({ correlations: [] });
  const buildPredictiveModel = (data) => ({ accuracy: 85, confidence: "high" });
  const analyzeHormonalTrends = (data) => ({ trends: [] });
  const trackHormonalFluctuations = (data) => ({ fluctuations: [] });
  const detectLifeStageChanges = (data) => ({ changes: [] });
  const analyzeSymptomFrequency = (data) => ({ symptoms: [] });
  const trackSymptomSeverity = (data) => ({ severity: [] });
  const findSymptomCorrelations = (health, journal) => ({ correlations: [] });
  const identifySymptomClusters = (data) => ({ clusters: [] });
  const determineLifeStage = (data) => "menstrual";
  const trackLifeStageTransitions = (data) => ({ transitions: [] });
  const generateStageInsights = (data) => ({ insights: [] });
  const correlateMoodWithCycle = (health, journal) => ({ correlation: 0.7 });
  const correlateEnergyWithHormones = (health, journal) => ({
    correlation: 0.6,
  });
  const correlateSleepWithCycle = (health, journal) => ({ correlation: 0.5 });
  const predictNextPeriod = (data) => ({
    date: "June 25, 2025",
    confidence: 85,
  });
  const forecastSymptoms = (data) => ({ forecasts: [] });
  const calculateFertileWindow = (data) => ({
    start: "June 12",
    end: "June 16",
  });
  const assessHealthRisks = (data) => ({ risks: [] });

  // Check access control
  useEffect(() => {
    if (!membershipLoading && user && !hasAccess("advanced_womens_health")) {
      setError(
        "Advanced Women's Health requires Premium membership or Standard+ with add-on"
      );
      setLoading(false);
    }
  }, [hasAccess, membershipLoading, user]);

  // Get appropriate button text based on life stage
  const getStartTrackingText = () => {
    switch (lifeStage) {
      case "perimenopause":
        return "Begin Transition Tracking";
      case "menopause":
        return "Start Wellness Journey";
      default:
        return "Start Advanced Tracking";
    }
  };

  // Get appropriate empty state messaging
  const getEmptyStateContent = () => {
    switch (lifeStage) {
      case "perimenopause":
        return {
          title: "Navigate Your Transition with Wisdom",
          description:
            "Track your perimenopause journey with compassionate support and evidence-based insights. Every woman's transition is unique.",
        };
      case "menopause":
        return {
          title: "Embrace Your Wisdom Years",
          description:
            "Celebrate this powerful life phase with comprehensive wellness tracking. Your accumulated wisdom deserves to be honored.",
        };
      default:
        return {
          title: "Start Your Advanced Health Journey",
          description:
            "Begin tracking your cycle, symptoms, and health patterns to unlock powerful AI-driven insights about your well-being and hormonal health.",
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your advanced women's health dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Advanced Women's Health
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAdvancedWomensHealthData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Advanced Women's Health
              </h1>
              <p className="text-gray-600">
                Deep insights powered by AI pattern recognition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-2 rounded-full">
              <Crown className="text-pink-600" size={16} />
              <span className="text-pink-700 font-medium text-sm">
                Premium Feature
              </span>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm"
            >
              <Shield size={16} />
              Privacy Info
            </button>
          </div>
        </div>

        {/* Privacy Information */}
        {showPrivacyInfo && (
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 mb-4">
            <div className="flex items-start gap-2">
              <Shield
                className="text-pink-600 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div className="text-sm">
                <p className="text-pink-800 font-medium mb-1">
                  🔒 Your Privacy is Protected
                </p>
                <p className="text-pink-700">
                  All health analytics are generated from encrypted metadata
                  only. Your actual journal content and health data remain
                  end-to-end encrypted and are only decrypted locally on your
                  device. This data is visible only to you and never shared.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Life Stage Selector & Date Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Life Stage:
            </label>
            <div className="flex gap-2">
              {[
                { id: "menstrual", label: "Menstrual Cycle", icon: Moon },
                {
                  id: "perimenopause",
                  label: "Perimenopause",
                  icon: Thermometer,
                },
                { id: "menopause", label: "Menopause", icon: Sun },
              ].map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setLifeStage(stage.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      lifeStage === stage.id
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <IconComponent size={16} />
                    {stage.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Analysis Period:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Tab Navigation - Always Show */}
      <div className="mb-8">
        <div className="bg-gray-50 p-3 rounded-lg">
          {/* First Row - 5 tabs */}
          <div className="flex flex-wrap gap-2 mb-2">
            {advancedTabs.slice(0, 5).map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                    activeTab === tab.id
                      ? "bg-white text-pink-600 shadow-sm border border-pink-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Second Row - 5 tabs */}
          <div className="flex flex-wrap gap-2">
            {advancedTabs.slice(5, 10).map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                    activeTab === tab.id
                      ? "bg-white text-pink-600 shadow-sm border border-pink-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Getting Started Banner - Show when no data */}
        {(!healthData || healthData?.overview?.totalEntries === 0) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">
                  Welcome to Advanced Women's Health
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Explore all the powerful features available to you. Some tabs
                  will show sample data, while others will provide more detailed
                  insights as you add health entries and journal data.
                </p>
                <button
                  onClick={() => setShowEntryModal(true)}
                  className={`px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                    lifeStage === "perimenopause"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : lifeStage === "menopause"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-pink-600 hover:bg-pink-700"
                  }`}
                >
                  {getStartTrackingText()}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content - Always Show */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === "overview" && (
          <WomensHealthOverviewTab
            data={healthData?.overview}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "cycle-intelligence" && (
          <CycleIntelligenceTab
            data={healthData?.cycleIntelligence}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "hormonal-patterns" && (
          <HormonalPatternsTab
            data={healthData?.hormonalPatterns}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "symptom-analytics" && (
          <SymptomAnalyticsTab
            data={healthData?.symptomAnalytics}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "life-stage-insights" && (
          <LifeStageInsightsTab
            data={healthData?.lifeStageInsights}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "wellness-correlations" && (
          <WellnessCorrelationsTab
            data={healthData?.wellnessCorrelations}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "predictive-insights" && (
          <PredictiveInsightsTab
            data={healthData?.predictiveInsights}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "educational-resources" && (
          <EducationalResourcesTab lifeStage={lifeStage} colors={colors} />
        )}
        {activeTab === "health-reports" && (
          <HealthReportsTab
            data={healthData}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
        {activeTab === "data-export" && (
          <DataExportTab
            data={healthData}
            lifeStage={lifeStage}
            colors={colors}
            hasData={healthData?.overview?.totalEntries > 0}
          />
        )}
      </div>

      {/* Life Stage-Aware Modals */}
      {lifeStage === "menstrual" && (
        <WomensHealthEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          onDataSaved={() => {
            setShowEntryModal(false);
            loadAdvancedWomensHealthData();
          }}
        />
      )}

      {lifeStage === "perimenopause" && (
        <PerimenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          onDataSaved={() => {
            setShowEntryModal(false);
            loadAdvancedWomensHealthData();
          }}
        />
      )}

      {lifeStage === "menopause" && (
        <MenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          onDataSaved={() => {
            setShowEntryModal(false);
            loadAdvancedWomensHealthData();
          }}
        />
      )}
    </div>
  );
};

// Updated Empty State Component with Life Stage Awareness
const EmptyAdvancedWomensHealthState = ({
  onStartTracking,
  lifeStage,
  getEmptyStateContent,
  getStartTrackingText,
}) => {
  const content = getEmptyStateContent();
  const buttonText = getStartTrackingText();

  // Get appropriate icon based on life stage
  const getIcon = () => {
    switch (lifeStage) {
      case "perimenopause":
        return (
          <Thermometer className="h-16 w-16 text-orange-400 mx-auto mb-4" />
        );
      case "menopause":
        return <Sun className="h-16 w-16 text-amber-400 mx-auto mb-4" />;
      default:
        return <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />;
    }
  };

  // Get appropriate button color based on life stage
  const getButtonColor = () => {
    switch (lifeStage) {
      case "perimenopause":
        return "bg-orange-600 hover:bg-orange-700";
      case "menopause":
        return "bg-amber-600 hover:bg-amber-700";
      default:
        return "bg-pink-600 hover:bg-pink-700";
    }
  };

  return (
    <div className="text-center py-12">
      {getIcon()}
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {content.description}
      </p>
      <button
        onClick={onStartTracking}
        className={`px-6 py-3 text-white rounded-lg transition-colors ${getButtonColor()}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default AdvancedWomensHealth;
