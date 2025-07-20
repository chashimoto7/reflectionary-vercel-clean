// frontend/src/pages/PremiumWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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

// Import crypto service for client-side operations
import encryptionService from "../services/encryptionService";

const PremiumWomensHealth = () => {
  const { user } = useAuth();
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
  const [profile, setProfile] = useState(null);

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

  // Filter tabs based on current life stage
  const availableTabs = tabs.filter((tab) =>
    tab.availableIn.includes(lifeStage)
  );

  // Load user profile and data on mount
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadHealthData();
    }
  }, [user, lifeStage]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/profile?user_id=${
          user.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.life_stage) {
          setLifeStage(data.life_stage);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadHealthData = async () => {
    setLoading(true);
    try {
      // Fetch health data from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health?user_id=${
          user.id
        }&life_stage=${lifeStage}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHealthData(data.healthData);
        setCycleData(data.cycleData);
        setSymptomData(data.symptomData);
        setInsights(data.insights);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLifeStageChange = async (newStage) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            life_stage: newStage,
          }),
        }
      );

      if (response.ok) {
        setLifeStage(newStage);
        setShowStageSelector(false);
        loadHealthData();
      }
    } catch (error) {
      console.error("Error updating life stage:", error);
    }
  };

  const handleSaveHealthData = async (data) => {
    try {
      // Prepare data for encryption
      const dataToEncrypt = {
        ...data,
        life_stage: lifeStage,
        user_id: user.id,
      };

      // Send to backend for encryption and storage
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify(dataToEncrypt),
        }
      );

      if (response.ok) {
        setShowEntryModal(false);
        loadHealthData();
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save data. Please try again.");
    }
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
                onClick={() => setShowPrivacyInfo(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                title="Privacy Information"
              >
                <Shield className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Life Stage Display */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              {getStageIcon()}
              <span className="text-white font-medium capitalize">
                {lifeStage.replace("menopause", "Menopause")}
              </span>
            </div>
            <button
              onClick={() => setShowStageSelector(true)}
              className="text-purple-200 hover:text-white text-sm underline"
            >
              Change life stage
            </button>
          </div>
        </div>

        {/* Life Stage Selector Modal - Fixed positioning */}
        {showStageSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-800 to-pink-800 backdrop-blur-md rounded-lg p-6 max-w-md w-full mx-4 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Select Your Life Stage
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleLifeStageChange("menstrual")}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    lifeStage === "menstrual"
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Menstrual</p>
                      <p className="text-sm opacity-90">
                        Regular cycles and reproductive health tracking
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLifeStageChange("perimenopause")}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    lifeStage === "perimenopause"
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Perimenopause</p>
                      <p className="text-sm opacity-90">
                        Transitional phase with changing patterns
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLifeStageChange("menopause")}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    lifeStage === "menopause"
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Flower2 className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Menopause</p>
                      <p className="text-sm opacity-90">
                        Post-menopausal health and wellness
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-purple-100">
                  Your tracking options will adjust to match your current stage.
                </p>
              </div>
              <button
                onClick={() => setShowStageSelector(false)}
                className="mt-6 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-800 to-pink-800 backdrop-blur-md rounded-lg p-6 max-w-md w-full mx-4 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Your Privacy Protected
              </h3>
              <div className="space-y-3 text-purple-100">
                <p>
                  All your health data is encrypted end-to-end using advanced
                  encryption standards.
                </p>
                <p>
                  Your sensitive health information is never visible to anyone
                  else, including us.
                </p>
                <p>
                  AI insights are generated from encrypted patterns without
                  exposing your actual data.
                </p>
              </div>
              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation - Updated to match PremiumGoals layout */}
        <div className="mb-8">
          <div className="space-y-4">
            {/* Top row - 4 tabs */}
            <div className="grid grid-cols-4 gap-4">
              {availableTabs.slice(0, 4).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                          : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom row - 4 tabs (or fewer if not available) */}
            {availableTabs.length > 4 && (
              <div className="grid grid-cols-4 gap-4">
                {availableTabs.slice(4, 8).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                            : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
              profile={profile}
              onOpenEntry={() => setShowEntryModal(true)}
              onRefreshData={loadHealthData}
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
          onSave={handleSaveHealthData}
        />
      )}

      {showEntryModal && lifeStage === "perimenopause" && (
        <PerimenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          colors={colors}
          user={user}
          onSave={handleSaveHealthData}
        />
      )}

      {showEntryModal && lifeStage === "menopause" && (
        <MenopauseEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          colors={colors}
          user={user}
          onSave={handleSaveHealthData}
        />
      )}
    </div>
  );
};

export default PremiumWomensHealth;
