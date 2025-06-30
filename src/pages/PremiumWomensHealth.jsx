// src/pages/PremiumWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Heart,
  Activity,
  Brain,
  Calendar,
  BookOpen,
  TrendingUp,
  Sparkles,
  Flower2,
  Moon,
  Sun,
  Thermometer,
  Crown,
  Settings,
  Info,
  Shield,
  AlertCircle,
  Clock,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

// Import tab components
import WomensHealthOverviewTab from "../components/womenshealth/tabs/WomensHealthOverviewTab";
import CycleIntelligenceTab from "../components/womenshealth/tabs/CycleIntelligenceTab";
import SymptomAnalyticsTab from "../components/womenshealth/tabs/SymptomAnalyticsTab";
import HormonalInsightsTab from "../components/womenshealth/tabs/HormonalInsightsTab";
import LifeStageNavigatorTab from "../components/womenshealth/tabs/LifeStageNavigatorTab";
import WellnessCorrelationsTab from "../components/womenshealth/tabs/WellnessCorrelationsTab";
import PredictiveInsightsTab from "../components/womenshealth/tabs/PredictiveInsightsTab";
import HealthLibraryTab from "../components/womenshealth/tabs/HealthLibraryTab";

// Import entry modals
import MenstrualEntryModal from "../components/womenshealth/MenstrualEntryModal";
import PerimenopauseEntryModal from "../components/womenshealth/PerimenopauseEntryModal";
import MenopauseEntryModal from "../components/womenshealth/MenopauseEntryModal";

const PremiumWomensHealth = () => {
  const { user } = useAuth();
  const { tier } = useMembership();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Life stage management
  const [lifeStage, setLifeStage] = useState("menstrual"); // menstrual, perimenopause, menopause
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Data states
  const [healthData, setHealthData] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [symptomData, setSymptomData] = useState(null);
  const [insights, setInsights] = useState(null);

  // Color palette matching the premium theme
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#F472B6",
    warning: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    pink: "#EC4899",
    rose: "#F472B6",
    amber: "#F59E0B",
    emerald: "#10B981",
    gradient: "from-purple-900 via-purple-800 to-pink-900",
  };

  // Tab configuration
  const tabs = [
    {
      id: "overview",
      label: "Health Overview",
      icon: Heart,
      component: WomensHealthOverviewTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "cycle",
      label: "Cycle Intelligence",
      icon: Moon,
      component: CycleIntelligenceTab,
      availableIn: ["menstrual", "perimenopause"],
    },
    {
      id: "symptoms",
      label: "Symptom Analytics",
      icon: Activity,
      component: SymptomAnalyticsTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "hormonal",
      label: "Hormonal Insights",
      icon: Thermometer,
      component: HormonalInsightsTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "navigator",
      label: "Life Stage Navigator",
      icon: Flower2,
      component: LifeStageNavigatorTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "correlations",
      label: "Wellness Correlations",
      icon: TrendingUp,
      component: WellnessCorrelationsTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "predictions",
      label: "Predictive Insights",
      icon: Brain,
      component: PredictiveInsightsTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
    {
      id: "library",
      label: "Health Library",
      icon: BookOpen,
      component: HealthLibraryTab,
      availableIn: ["menstrual", "perimenopause", "menopause"],
    },
  ];

  // Filter tabs based on life stage
  const availableTabs = tabs.filter((tab) =>
    tab.availableIn.includes(lifeStage)
  );

  useEffect(() => {
    // Load user's saved life stage preference
    loadUserPreferences();
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const loadUserPreferences = async () => {
    // In the future, this will load from database
    // For now, we'll use localStorage
    const savedStage = localStorage.getItem("womensHealthLifeStage");
    if (savedStage) {
      setLifeStage(savedStage);
    }
  };

  const handleStageChange = (newStage) => {
    setLifeStage(newStage);
    localStorage.setItem("womensHealthLifeStage", newStage);
    setShowStageSelector(false);

    // Reset to overview tab when changing stages
    setActiveTab("overview");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your health insights...</p>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = availableTabs.find(
    (tab) => tab.id === activeTab
  )?.component;

  const getStageIcon = () => {
    switch (lifeStage) {
      case "menstrual":
        return <Moon className="w-5 h-5" />;
      case "perimenopause":
        return <Sun className="w-5 h-5" />;
      case "menopause":
        return <Flower2 className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Heart className="w-10 h-10 text-pink-300" />
                  Premium Women's Health
                  <Crown className="w-8 h-8 text-yellow-400" />
                </h1>
                <p className="text-purple-200 text-lg">
                  Comprehensive health tracking and insights tailored to your
                  life stage
                </p>
              </div>
              <div className="bg-purple-600/30 backdrop-blur-sm border border-purple-400/50 px-3 py-1.5 rounded-full">
                <span className="text-purple-100 text-sm font-medium">
                  Premium
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Privacy Info Button */}
              <button
                onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                className="text-purple-300 hover:text-white transition-colors"
                title="Privacy Information"
              >
                <Shield className="w-6 h-6" />
              </button>

              {/* Life Stage Selector Button */}
              <button
                onClick={() => setShowStageSelector(!showStageSelector)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                {getStageIcon()}
                <span>Select Your Life Stage</span>
                <Settings className="w-4 h-4" />
              </button>

              {/* Quick Entry Button */}
              <button
                onClick={() => setShowEntryModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Clock className="w-5 h-5" />
                Track Today
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-2">
                  Your Privacy is Protected
                </h4>
                <p className="text-sm text-purple-200">
                  Your information is personal - and we treat it that way. All
                  health data is end-to-end encrypted so no one else can read
                  it. Not our team. Not our servers. Only you. Your information
                  is never shared and remains completely private.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Life Stage Selector Modal */}
        {showStageSelector && (
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Flower2 className="w-6 h-6 text-pink-300" />
              Select Your Life Stage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleStageChange("menstrual")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  lifeStage === "menstrual"
                    ? "bg-purple-600/30 border-purple-400 text-white"
                    : "bg-white/5 border-white/20 text-purple-200 hover:bg-white/10"
                }`}
              >
                <Moon className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Menstrual</h4>
                <p className="text-sm opacity-80">
                  Regular or irregular cycles, fertility tracking, PMS symptoms
                </p>
              </button>

              <button
                onClick={() => handleStageChange("perimenopause")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  lifeStage === "perimenopause"
                    ? "bg-purple-600/30 border-purple-400 text-white"
                    : "bg-white/5 border-white/20 text-purple-200 hover:bg-white/10"
                }`}
              >
                <Sun className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Perimenopause</h4>
                <p className="text-sm opacity-80">
                  Irregular cycles, hormonal changes, transition symptoms
                </p>
              </button>

              <button
                onClick={() => handleStageChange("menopause")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  lifeStage === "menopause"
                    ? "bg-purple-600/30 border-purple-400 text-white"
                    : "bg-white/5 border-white/20 text-purple-200 hover:bg-white/10"
                }`}
              >
                <Flower2 className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Menopause</h4>
                <p className="text-sm opacity-80">
                  Post-menopausal tracking, symptom management, wellness focus
                </p>
              </button>
            </div>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-purple-200 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                You can change your life stage at any time without losing your
                historical data. Your tracking options will adjust to match your
                current stage.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation - Grid Layout */}
        <div className="mb-6 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
          <div className="grid grid-cols-4 gap-2">
            {availableTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          {ActiveTabComponent && (
            <ActiveTabComponent
              colors={colors}
              user={user}
              lifeStage={lifeStage}
              healthData={healthData}
              cycleData={cycleData}
              symptomData={symptomData}
              insights={insights}
              onOpenEntry={() => setShowEntryModal(true)}
            />
          )}
        </div>
      </div>

      {/* Entry Modals */}
      {showEntryModal && lifeStage === "menstrual" && (
        <MenstrualEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          colors={colors}
          user={user}
          onSave={(data) => {
            console.log("Saving menstrual data:", data);
            setShowEntryModal(false);
          }}
        />
      )}

      {showEntryModal && lifeStage === "perimenopause" && (
        <PerimenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          colors={colors}
          user={user}
          onSave={(data) => {
            console.log("Saving perimenopause data:", data);
            setShowEntryModal(false);
          }}
        />
      )}

      {showEntryModal && lifeStage === "menopause" && (
        <MenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          colors={colors}
          user={user}
          onSave={(data) => {
            console.log("Saving menopause data:", data);
            setShowEntryModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PremiumWomensHealth;
