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
  const { tier, hasAccess, loading: membershipLoading } = useMembership();
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

  // Filter tabs based on life stage
  const availableTabs = tabs.filter((tab) =>
    tab.availableIn.includes(lifeStage)
  );

  useEffect(() => {
    if (user && hasAccess("womens_health")) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load user profile and preferences
      await loadUserProfile();

      // Load health data
      await loadHealthData();
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `/api/womens-health/profile?user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          setLifeStage(data.profile.life_stage || "menstrual");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadHealthData = async () => {
    try {
      // Calculate date range for Premium (last 6 months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const response = await fetch(
        `/api/womens-health?user_id=${user.id}&date_from=${
          startDate.toISOString().split("T")[0]
        }&date_to=${
          endDate.toISOString().split("T")[0]
        }&include_cycle_analysis=true&include_predictions=true&tier=premium`
      );

      if (response.ok) {
        const data = await response.json();
        setHealthData(data.entries || []);
        setCycleData(data.cycle_analysis || null);
        setInsights(data.insights || null);

        // Extract symptom data from entries
        const symptoms = extractSymptomData(data.entries || []);
        setSymptomData(symptoms);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    }
  };

  const extractSymptomData = (entries) => {
    // Process entries to extract symptom patterns
    const symptomMap = new Map();

    entries.forEach((entry) => {
      if (entry.data?.symptoms) {
        entry.data.symptoms.forEach((symptom) => {
          if (!symptomMap.has(symptom)) {
            symptomMap.set(symptom, { count: 0, dates: [] });
          }
          const data = symptomMap.get(symptom);
          data.count++;
          data.dates.push(entry.date);
        });
      }
    });

    return Array.from(symptomMap.entries()).map(([symptom, data]) => ({
      symptom,
      ...data,
    }));
  };

  const handleStageChange = async (newStage) => {
    setLifeStage(newStage);
    setShowStageSelector(false);

    // Save to backend
    try {
      const response = await fetch("/api/womens-health/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          life_stage: newStage,
        }),
      });

      if (response.ok) {
        // Reset to overview tab when changing stages
        setActiveTab("overview");
        // Reload data for new stage
        await loadHealthData();
      }
    } catch (error) {
      console.error("Error updating life stage:", error);
    }
  };

  const handleSaveHealthData = async (data) => {
    try {
      const response = await fetch("/api/womens-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          date: new Date().toISOString().split("T")[0],
          health_data: data,
        }),
      });

      if (response.ok) {
        setShowEntryModal(false);
        // Reload data to reflect changes
        await loadHealthData();
      } else {
        throw new Error("Failed to save health data");
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save health data. Please try again.");
    }
  };

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your health insights...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess("womens_health")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Premium Women's Health Access Required
          </h2>
          <p className="text-purple-200 mb-6">
            Upgrade to unlock comprehensive women's health tracking with cycle
            intelligence, symptom analytics, and predictive insights.
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Upgrade to Premium
          </button>
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

              {/* Settings Button */}
              <button
                onClick={() => setShowStageSelector(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                title="Change Life Stage"
              >
                <Settings className="w-5 h-5" />
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

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Your Health Data is Private
                </h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Your women's health data is protected with the highest level
                  of privacy:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All health data is end-to-end encrypted</li>
                  <li>Only you can access your health records</li>
                  <li>No data is shared with third parties</li>
                  <li>Predictions are generated locally when possible</li>
                  <li>You can export or delete your data anytime</li>
                </ul>
                <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/30">
                  <p className="text-sm">
                    <strong className="text-purple-300">Note:</strong> All
                    encryption and decryption happens on our secure servers.
                    Your health data is never exposed in plain text.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Life Stage Selector Modal */}
        {showStageSelector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold text-white mb-6">
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
                    Regular or irregular cycles, fertility tracking, PMS
                    symptoms
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
                  historical data. Your tracking options will adjust to match
                  your current stage.
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
