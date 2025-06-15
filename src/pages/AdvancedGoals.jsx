// src/pages/AdvancedGoals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Plus,
  Award,
  Edit2,
  Trash2,
  Target,
  TrendingUp,
  Brain,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Lightbulb,
  Heart,
  BookOpen,
  Crown,
  Info,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Filter,
  Download,
  X,
} from "lucide-react";
import AddGoalModal from "../components/AddGoalModal";
import EditGoalModal from "../components/EditGoalModal";
import EditMilestonesModal from "../components/EditMilestonesModal";
import GoalTips from "../components/GoalTips";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";

// Helper: Parse decrypted milestones/tier data
function parseProgress(goal, dataKey) {
  try {
    if (!goal.encrypted_progress || !goal.progress_iv)
      return { type: null, data: null };
    return encryptionService
      .decryptText(goal.encrypted_progress, goal.progress_iv, dataKey)
      .then((progressJson) => {
        const parsed = JSON.parse(progressJson);
        if (parsed.tiers) {
          return { type: "tiered", data: parsed.tiers };
        } else if (parsed.milestones) {
          return { type: "list", data: parsed.milestones };
        }
        return { type: null, data: null };
      });
  } catch {
    return Promise.resolve({ type: null, data: null });
  }
}

const AdvancedGoals = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();
  const { width, height } = useWindowSize();

  // Core goals state
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMilestonesModal, setShowEditMilestonesModal] = useState(false);

  // Advanced analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState("3months");
  const [insights, setInsights] = useState([]);
  const [progressPatterns, setProgressPatterns] = useState([]);
  const [goalMentions, setGoalMentions] = useState([]);
  const [moodCorrelations, setMoodCorrelations] = useState([]);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Advanced color palette matching Advanced Analytics
  const colors = {
    primary: "#8B5CF6", // Purple
    secondary: "#06B6D4", // Cyan
    accent: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    danger: "#EF4444", // Red
    pink: "#EC4899", // Pink
    indigo: "#6366F1", // Indigo
    lime: "#84CC16", // Lime
    gradient: [
      "#8B5CF6",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#6366F1",
      "#84CC16",
    ],
  };

  // Advanced tabs structure - 5 tabs per row
  const advancedTabs = [
    { id: "overview", label: "Intelligence Overview", icon: TrendingUp },
    { id: "progress-patterns", label: "Progress Patterns", icon: BarChart3 },
    { id: "goal-insights", label: "Goal Insights", icon: Brain },
    { id: "mention-timeline", label: "Mention Analytics", icon: Calendar },
    { id: "goals-overview", label: "Goals Overview", icon: Target },
    { id: "goal-comparison", label: "Goal Comparison", icon: Users },
    { id: "mood-correlations", label: "Mood Correlations", icon: Heart },
    { id: "growth-tracking", label: "Growth Tracking", icon: Sparkles },
    { id: "insights-feed", label: "AI Insights", icon: Lightbulb },
    { id: "data-export", label: "Export & Reports", icon: Download },
  ];

  // Check access control - moved to useEffect like AdvancedAnalytics
  useEffect(() => {
    // Don't do anything until user and membership data are loaded
    if (!user || membershipLoading) {
      return;
    }

    // Check access directly without using the function in dependencies
    const userHasAccess = hasAccess("advanced_goals");

    if (userHasAccess) {
      loadGoalsAndAnalytics();
    } else {
      // User doesn't have access - stop loading
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

  // Load goals and analytics data - removed from useEffect since it's called conditionally now
  // useEffect(() => {
  //   if (user) {
  //     loadGoalsAndAnalytics();
  //   }
  // }, [user, dateRange]);

  const loadGoalsAndAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGoals(),
        loadAnalyticsData(),
        loadInsights(),
        loadProgressPatterns(),
        loadGoalMentions(),
        loadMoodCorrelations(),
      ]);
    } catch (error) {
      console.error("Error loading goals and analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Decrypt goal data
      const masterKey = await encryptionService.getStaticMasterKey();
      const decryptedGoals = await Promise.all(
        data.map(async (goal) => {
          try {
            const encryptedDataKey = {
              encryptedData: goal.encrypted_data_key,
              iv: goal.data_key_iv,
            };
            const dataKey = await encryptionService.decryptKey(
              encryptedDataKey,
              masterKey
            );

            const decryptedTitle = await encryptionService.decryptText(
              goal.encrypted_goal,
              goal.goal_iv,
              dataKey
            );

            let decryptedDescription = "";
            if (goal.encrypted_description && goal.description_iv) {
              decryptedDescription = await encryptionService.decryptText(
                goal.encrypted_description,
                goal.description_iv,
                dataKey
              );
            }

            return {
              ...goal,
              decryptedTitle,
              decryptedDescription,
              _dataKey: dataKey,
            };
          } catch (decryptError) {
            console.error("Error decrypting goal:", decryptError);
            return {
              ...goal,
              decryptedTitle: "Decryption Failed",
              decryptedDescription: "",
              _dataKey: null,
            };
          }
        })
      );

      setGoals(decryptedGoals);

      // Auto-select first goal if none selected
      if (!selectedGoalId && decryptedGoals.length > 0) {
        setSelectedGoalId(decryptedGoals[0].id);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const loadAnalyticsData = async () => {
    // Simulate analytics data loading
    // In real implementation, this would fetch from your analytics service
    const mockAnalytics = {
      overview: {
        totalGoals: goals.length,
        activeGoals: goals.filter((g) => g.status === "active").length,
        completedGoals: goals.filter((g) => g.status === "completed").length,
        averageProgress: 65,
        streak: 12,
        lastUpdate: new Date().toISOString(),
      },
      completionRate: [
        { name: "Week 1", rate: 45 },
        { name: "Week 2", rate: 52 },
        { name: "Week 3", rate: 48 },
        { name: "Week 4", rate: 61 },
        { name: "Week 5", rate: 58 },
        { name: "Week 6", rate: 65 },
        { name: "Week 7", rate: 72 },
        { name: "Week 8", rate: 68 },
      ],
    };
    setAnalyticsData(mockAnalytics);
  };

  const loadInsights = async () => {
    // Mock AI insights
    const mockInsights = [
      {
        id: 1,
        type: "plateau_warning",
        title: "Goal Plateau Detected",
        message:
          "Your 'Exercise 3x/week' goal hasn't seen progress in 2 weeks. Consider breaking it into smaller milestones.",
        priority: "medium",
        goalId: selectedGoalId,
        date: new Date().toISOString(),
      },
      {
        id: 2,
        type: "mood_correlation",
        title: "Positive Mood Correlation",
        message:
          "Your mood increases by 15% on days when you work on 'Learn Spanish' goal.",
        priority: "high",
        goalId: selectedGoalId,
        date: new Date().toISOString(),
      },
    ];
    setInsights(mockInsights);
  };

  const loadProgressPatterns = async () => {
    // Mock progress patterns data
    const mockPatterns = [
      { period: "Jan", completion: 35, milestones: 8 },
      { period: "Feb", completion: 42, milestones: 12 },
      { period: "Mar", completion: 38, milestones: 10 },
      { period: "Apr", completion: 55, milestones: 15 },
      { period: "May", completion: 61, milestones: 18 },
      { period: "Jun", completion: 58, milestones: 16 },
    ];
    setProgressPatterns(mockPatterns);
  };

  const loadGoalMentions = async () => {
    // Mock goal mentions data
    const mockMentions = [
      { week: "W1", mentions: 5, sentiment: 0.8 },
      { week: "W2", mentions: 3, sentiment: 0.6 },
      { week: "W3", mentions: 8, sentiment: 0.9 },
      { week: "W4", mentions: 2, sentiment: 0.4 },
      { week: "W5", mentions: 6, sentiment: 0.7 },
      { week: "W6", mentions: 9, sentiment: 0.85 },
    ];
    setGoalMentions(mockMentions);
  };

  const loadMoodCorrelations = async () => {
    // Mock mood correlation data
    const mockCorrelations = [
      { goal: "Exercise", moodBefore: 6.2, moodAfter: 7.8, correlation: 0.73 },
      {
        goal: "Meditation",
        moodBefore: 5.8,
        moodAfter: 7.5,
        correlation: 0.68,
      },
      { goal: "Reading", moodBefore: 6.5, moodAfter: 7.2, correlation: 0.45 },
      { goal: "Learning", moodBefore: 6.0, moodAfter: 7.0, correlation: 0.52 },
    ];
    setMoodCorrelations(mockCorrelations);
  };

  // Standard goal handlers (from original Goals.jsx)
  const handleAddGoal = async (goalData) => {
    try {
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.generateKey();
      const encryptedDataKey = await encryptionService.encryptKey(
        dataKey,
        masterKey
      );

      const titlePayload = await encryptionService.encryptText(
        goalData.title,
        dataKey
      );
      const descPayload = goalData.description
        ? await encryptionService.encryptText(goalData.description, dataKey)
        : null;

      const { data, error } = await supabase
        .from("user_goals")
        .insert({
          user_id: user.id,
          encrypted_goal: titlePayload.encryptedData,
          goal_iv: titlePayload.iv,
          encrypted_description: descPayload?.encryptedData || null,
          description_iv: descPayload?.iv || null,
          encrypted_data_key: encryptedDataKey.encryptedData,
          data_key_iv: encryptedDataKey.iv,
          priority: goalData.priority,
          tier: goalData.tier || null,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal = {
        ...data,
        decryptedTitle: goalData.title,
        decryptedDescription: goalData.description || "",
        _dataKey: dataKey,
      };

      setGoals([newGoal, ...goals]);
      setSelectedGoalId(newGoal.id);

      // Refresh analytics
      loadAnalyticsData();
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal: " + error.message);
    }
  };

  const handleEditGoal = async (goalData) => {
    try {
      const goal = goals.find((g) => g.id === goalData.id);
      if (!goal) return;

      const titlePayload = await encryptionService.encryptText(
        goalData.title,
        goal._dataKey
      );
      const descPayload = goalData.description
        ? await encryptionService.encryptText(
            goalData.description,
            goal._dataKey
          )
        : null;

      const { error } = await supabase
        .from("user_goals")
        .update({
          encrypted_goal: titlePayload.encryptedData,
          goal_iv: titlePayload.iv,
          encrypted_description: descPayload?.encryptedData || null,
          description_iv: descPayload?.iv || null,
          priority: goalData.priority,
          tier: goalData.tier || null,
        })
        .eq("id", goalData.id);

      if (error) throw error;

      setGoals(
        goals.map((g) =>
          g.id === goalData.id
            ? {
                ...g,
                decryptedTitle: goalData.title,
                decryptedDescription: goalData.description || "",
                priority: goalData.priority,
                tier: goalData.tier,
              }
            : g
        )
      );
    } catch (error) {
      console.error("Error editing goal:", error);
      alert("Failed to edit goal: " + error.message);
    }
  };

  const handleStatusChange = async (goal, newStatus) => {
    try {
      const { error } = await supabase
        .from("user_goals")
        .update({ status: newStatus })
        .eq("id", goal.id);

      if (error) throw error;

      setGoals(
        goals.map((g) => (g.id === goal.id ? { ...g, status: newStatus } : g))
      );

      // Refresh analytics
      loadAnalyticsData();
    } catch (error) {
      console.error("Error updating goal status:", error);
      alert("Failed to update goal status: " + error.message);
    }
  };

  const handleRemoveGoal = async (goal) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this goal? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_goals")
        .delete()
        .eq("id", goal.id);

      if (error) throw error;

      setGoals(goals.filter((g) => g.id !== goal.id));

      if (selectedGoalId === goal.id) {
        const remainingGoals = goals.filter((g) => g.id !== goal.id);
        setSelectedGoalId(
          remainingGoals.length > 0 ? remainingGoals[0].id : null
        );
      }

      // Refresh analytics
      loadAnalyticsData();
    } catch (error) {
      console.error("Error removing goal:", error);
      alert("Failed to remove goal: " + error.message);
    }
  };

  if (membershipLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your advanced goals intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess("advanced_goals")) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-8 text-center">
          <Crown className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-900 mb-2">
            Advanced Goals Intelligence
          </h2>
          <p className="text-purple-700 mb-4">
            Unlock deep insights into your goal patterns, progress analytics,
            and AI-powered recommendations.
          </p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
            Upgrade to Access Advanced Goals
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-600" />
              Advanced Goals Intelligence
              <Crown className="h-6 w-6 text-purple-500" />
            </h1>
            <p className="text-gray-600">
              Deep insights, pattern recognition, and AI-powered goal
              optimization
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-900">
                  🔒 Privacy-First Goal Analytics
                </h3>
                <button
                  onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              {showPrivacyInfo && (
                <p className="text-green-700 text-sm mt-2">
                  Your goal data is end-to-end encrypted and processed locally.
                  Analytics insights are generated from your encrypted data
                  patterns without exposing personal content. This data is
                  visible only to you and never shared.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Date Range & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Analysis Period:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            AI Goal Analysis Active
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <EmptyAdvancedGoalsState onAddGoal={() => setShowAddModal(true)} />
      ) : (
        <>
          {/* Advanced Tab Navigation - Two Row Layout (5 tabs each) */}
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
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200"
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
                {advancedTabs.slice(5).map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === "overview" && (
              <IntelligenceOverviewTab
                goals={goals}
                analyticsData={analyticsData}
                insights={insights}
                colors={colors}
                onSelectGoal={setSelectedGoalId}
                onEditGoal={(goal) => {
                  setSelectedGoalId(goal.id);
                  setShowEditModal(true);
                }}
                onStatusChange={handleStatusChange}
                onRemoveGoal={handleRemoveGoal}
              />
            )}
            {activeTab === "progress-patterns" && (
              <ProgressPatternsTab
                goals={goals}
                progressPatterns={progressPatterns}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            )}
            {activeTab === "goal-insights" && (
              <GoalInsightsTab
                goals={goals}
                moodCorrelations={moodCorrelations}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            )}
            {activeTab === "mention-timeline" && (
              <MentionTimelineTab
                goals={goals}
                goalMentions={goalMentions}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            )}
            {activeTab === "goals-overview" && (
              <GoalsOverviewTab
                goals={goals}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
                onEditGoal={(goal) => {
                  setSelectedGoalId(goal.id);
                  setShowEditModal(true);
                }}
                onEditMilestones={(goal) => {
                  setSelectedGoalId(goal.id);
                  setShowEditMilestonesModal(true);
                }}
                onStatusChange={handleStatusChange}
                onRemoveGoal={handleRemoveGoal}
                colors={colors}
              />
            )}
            {activeTab === "goal-comparison" && (
              <GoalComparisonTab goals={goals} colors={colors} />
            )}
            {activeTab === "mood-correlations" && (
              <MoodCorrelationsTab
                goals={goals}
                moodCorrelations={moodCorrelations}
                colors={colors}
              />
            )}
            {activeTab === "growth-tracking" && (
              <GrowthTrackingTab
                goals={goals}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            )}
            {activeTab === "insights-feed" && (
              <InsightsFeedTab insights={insights} colors={colors} />
            )}
            {activeTab === "data-export" && (
              <DataExportTab
                goals={goals}
                analyticsData={analyticsData}
                colors={colors}
              />
            )}
            {activeTab === "goal-comparison" && (
              <GoalComparisonTab goals={goals} colors={colors} />
            )}
            {activeTab === "mood-correlations" && (
              <MoodCorrelationsTab
                goals={goals}
                moodCorrelations={moodCorrelations}
                colors={colors}
              />
            )}
            {activeTab === "growth-tracking" && (
              <GrowthTrackingTab
                goals={goals}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            )}
            {activeTab === "insights-feed" && (
              <InsightsFeedTab insights={insights} colors={colors} />
            )}
            {activeTab === "data-export" && (
              <DataExportTab
                goals={goals}
                analyticsData={analyticsData}
                colors={colors}
              />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGoal}
        />
      )}
      {showEditModal && selectedGoal && (
        <EditGoalModal
          goal={selectedGoal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditGoal}
        />
      )}
      {showEditMilestonesModal && selectedGoal && (
        <EditMilestonesModal
          goal={selectedGoal}
          onClose={() => setShowEditMilestonesModal(false)}
          onSave={() => {
            setShowEditMilestonesModal(false);
            loadGoals(); // Refresh goals data
          }}
        />
      )}
    </div>
  );
};

export default AdvancedGoals;
