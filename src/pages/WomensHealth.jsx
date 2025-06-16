// src/pages/WomensHealth.jsx
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
  Lock,
  Flower,
  Activity,
  Brain,
  Clock,
} from "lucide-react";

import WomensHealthEntryModal from "../components/womenshealth/WomensHealthEntryModal";

const WomensHealth = () => {
  const { user } = useAuth();
  const { hasAccess, getUpgradeMessage, tier } = useMembership();
  const [activeTab, setActiveTab] = useState("overview");
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(null);
  const [lifeStage, setLifeStage] = useState("menstrual"); // menstrual, perimenopause, menopause
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Color scheme for women's health
  const colors = {
    primary: "#EC4899", // Pink
    secondary: "#8B5CF6", // Purple
    menstrual: "#EF4444", // Red
    follicular: "#10B981", // Green
    ovulatory: "#F59E0B", // Amber
    luteal: "#8B5CF6", // Purple
    perimenopause: "#EC4899", // Pink
    menopause: "#6366F1", // Indigo
  };

  // Basic tabs for women's health
  const tabs = [
    { id: "overview", label: "Overview", icon: Heart },
    { id: "cycle", label: "Cycle Tracking", icon: Moon },
    { id: "education", label: "Health Education", icon: BookOpen },
    { id: "symptoms", label: "Symptom Tracking", icon: Activity },
  ];

  useEffect(() => {
    if (user) {
      loadWomensHealthData();
    }
  }, [user]);

  const loadWomensHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's women's health data
      const { data: healthData, error: healthError } = await supabase
        .from("womens_health_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (healthError) {
        console.error("Error loading women's health data:", healthError);
        setError("Failed to load women's health data");
        return;
      }

      // Process the data for display
      const processedData = processHealthData(healthData || []);
      setCycleData(processedData);
    } catch (err) {
      console.error("Error in loadWomensHealthData:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const processHealthData = (data) => {
    if (!data || data.length === 0) {
      return {
        hasData: false,
        currentPhase: "Unknown",
        nextPeriod: null,
        cycleLength: 28,
        lastPeriod: null,
        symptoms: [],
        mood: [],
      };
    }

    // Basic cycle calculation
    const lastEntry = data[0];
    const cycleDay = calculateCycleDay(data);
    const currentPhase = calculateCurrentPhase(cycleDay);

    return {
      hasData: true,
      currentPhase,
      cycleDay,
      cycleLength: 28, // Default, could be calculated from historical data
      lastPeriod: lastEntry.date,
      symptoms: data.map((d) => d.symptoms).filter(Boolean),
      mood: data.map((d) => d.mood_rating).filter(Boolean),
      recentEntries: data.slice(0, 7),
    };
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

  const calculateCurrentPhase = (cycleDay) => {
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 16) return "Ovulatory";
    return "Luteal";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your women's health dashboard...
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
            Unable to Load Women's Health Data
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadWomensHealthData}
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Women's Health
              </h1>
              <p className="text-gray-600">
                Track your cycle, symptoms, and well-being
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Free Feature Badge for Paid Members */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-full">
              <Flower className="text-green-600" size={16} />
              <span className="text-green-700 font-medium text-sm">
                Free for All Paid Members
              </span>
            </div>

            {/* Upgrade to Advanced */}
            {!hasAccess("advanced_womens_health") && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <Crown size={16} />
                Upgrade to Advanced
              </button>
            )}
          </div>
        </div>

        {/* Life Stage Selector */}
        <div className="flex items-center gap-4 mb-4">
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
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === "overview" && (
          <OverviewTab
            cycleData={cycleData}
            lifeStage={lifeStage}
            colors={colors}
          />
        )}
        {activeTab === "cycle" && (
          <CycleTrackingTab
            cycleData={cycleData}
            lifeStage={lifeStage}
            colors={colors}
            onDataUpdate={loadWomensHealthData}
          />
        )}
        {activeTab === "education" && (
          <EducationTab lifeStage={lifeStage} colors={colors} />
        )}
        {activeTab === "symptoms" && (
          <SymptomsTab
            cycleData={cycleData}
            lifeStage={lifeStage}
            colors={colors}
            onDataUpdate={loadWomensHealthData}
          />
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          feature="advanced_womens_health"
          tier={tier}
        />
      )}
      <WomensHealthEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onDataSaved={() => {
          setShowEntryModal(false);
          loadWomensHealthData();
        }}
      />
    </div>
  );
};

// Basic Tab Components
const OverviewTab = ({ cycleData, lifeStage, colors }) => {
  if (!cycleData?.hasData) {
    return (
      <div className="p-8 text-center">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Start Tracking Your Health
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Begin tracking your cycle and symptoms to get personalized insights
          about your health and well-being.
        </p>
        <button
          onClick={() => setShowEntryModal(true)}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Start Tracking
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Health Overview
      </h3>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Moon className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{cycleData.currentPhase}</div>
              <div className="text-sm opacity-90">Current Phase</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Cycle Status</h3>
          <p className="text-sm opacity-90">
            Day {cycleData.cycleDay} of cycle
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{cycleData.cycleLength}</div>
              <div className="text-sm opacity-90">days</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Cycle Length</h3>
          <p className="text-sm opacity-90">Average cycle</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {cycleData.recentEntries?.length || 0}
              </div>
              <div className="text-sm opacity-90">entries</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Recent Tracking</h3>
          <p className="text-sm opacity-90">Last 7 days</p>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Today's Focus</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900">
                {getPhaseRecommendation(cycleData.currentPhase).title}
              </p>
              <p className="text-sm text-gray-600">
                {getPhaseRecommendation(cycleData.currentPhase).description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CycleTrackingTab = ({ cycleData, lifeStage, colors, onDataUpdate }) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Cycle Tracking
      </h3>

      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Cycle Tracking Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Track your menstrual cycle, symptoms, and patterns with our intuitive
          interface.
        </p>
      </div>
    </div>
  );
};

const EducationTab = ({ lifeStage, colors }) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Health Education
      </h3>

      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Educational Resources Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Access comprehensive educational content about women's health, cycles,
          and well-being.
        </p>
      </div>
    </div>
  );
};

const SymptomsTab = ({ cycleData, lifeStage, colors, onDataUpdate }) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Symptom Tracking
      </h3>

      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Symptom Tracking Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Track and analyze symptoms to better understand your patterns and
          well-being.
        </p>
      </div>
    </div>
  );
};

const UpgradeModal = ({ onClose, feature, tier }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Upgrade to Advanced Women's Health
          </h3>
          <p className="text-gray-600 mb-6">
            Get advanced analytics, predictive insights, and comprehensive
            health tracking.
          </p>
          <div className="space-y-3 mb-6">
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upgrade to Premium
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for phase recommendations
const getPhaseRecommendation = (phase) => {
  const recommendations = {
    Menstrual: {
      title: "Rest and Renewal",
      description: "Focus on gentle self-care and rest during this phase.",
    },
    Follicular: {
      title: "New Beginnings",
      description: "Great time to start new projects and build habits.",
    },
    Ovulatory: {
      title: "Peak Energy",
      description:
        "You're at your most energetic - perfect for challenging tasks.",
    },
    Luteal: {
      title: "Reflection Time",
      description: "Focus on finishing projects and preparing for rest.",
    },
  };

  return recommendations[phase] || recommendations.Menstrual;
};

export default WomensHealth;
