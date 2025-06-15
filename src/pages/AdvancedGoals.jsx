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

  // Advanced tabs structure
  const advancedTabs = [
    { id: "overview", label: "Intelligence Overview", icon: TrendingUp },
    { id: "progress-patterns", label: "Progress Patterns", icon: BarChart3 },
    { id: "goal-insights", label: "Goal Insights", icon: Brain },
    { id: "mention-timeline", label: "Mention Analytics", icon: Calendar },
    { id: "goal-comparison", label: "Goal Comparison", icon: Users },
    { id: "mood-correlations", label: "Mood Correlations", icon: Heart },
    { id: "growth-tracking", label: "Growth Tracking", icon: Sparkles },
    { id: "insights-feed", label: "AI Insights", icon: Lightbulb },
    { id: "data-export", label: "Export & Reports", icon: Download },
  ];

  // Check access control
  useEffect(() => {
    if (!membershipLoading && !hasAccess("goal_tracking")) {
      // Redirect or show upgrade message
      return;
    }
  }, [hasAccess, membershipLoading]);

  // Load goals and analytics data
  useEffect(() => {
    if (user) {
      loadGoalsAndAnalytics();
    }
  }, [user, dateRange]);

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

  if (!hasAccess("goal_tracking")) {
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
          {/* Advanced Tab Navigation - Two Row Layout */}
          <div className="mb-8">
            <div className="bg-gray-50 p-3 rounded-lg">
              {/* First Row */}
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

              {/* Second Row */}
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

          {/* Goal Sidebar - Similar to original but enhanced */}
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Goals Overview
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {goals.map((goal) => (
                <GoalSidebarItem
                  key={goal.id}
                  goal={goal}
                  isSelected={goal.id === selectedGoalId}
                  onClick={() => setSelectedGoalId(goal.id)}
                />
              ))}
            </div>
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

// Intelligence Overview Tab Component
const IntelligenceOverviewTab = ({
  goals,
  analyticsData,
  insights,
  colors,
  onSelectGoal,
  onEditGoal,
  onStatusChange,
  onRemoveGoal,
}) => (
  <div className="p-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Goals"
        value={analyticsData?.overview?.totalGoals || 0}
        icon={Target}
        color={colors.primary}
        subtitle="Your goal portfolio"
      />
      <MetricCard
        title="Active Goals"
        value={analyticsData?.overview?.activeGoals || 0}
        icon={Zap}
        color={colors.accent}
        subtitle="Currently pursuing"
      />
      <MetricCard
        title="Completion Rate"
        value={`${analyticsData?.overview?.averageProgress || 0}%`}
        icon={CheckCircle2}
        color={colors.secondary}
        subtitle="Average progress"
      />
      <MetricCard
        title="Goal Streak"
        value={`${analyticsData?.overview?.streak || 0} days`}
        icon={Award}
        color={colors.warning}
        subtitle="Consistent progress"
      />
    </div>

    {/* Quick Progress Chart */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progress Trajectory
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData?.completionRate || []}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.primary}
                  stopOpacity={0.8}
                />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Top Insights */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Insights</h3>
      <div className="space-y-3">
        {insights.slice(0, 3).map((insight) => (
          <InsightCard key={insight.id} insight={insight} colors={colors} />
        ))}
      </div>
    </div>
  </div>
);

// Progress Patterns Tab Component
const ProgressPatternsTab = ({
  goals,
  progressPatterns,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Progress Patterns Analysis
    </h3>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Completion Rate Trends */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">
          Completion Rate Trends
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completion"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Achievement Timeline */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">
          Milestone Achievement Timeline
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="milestones"
                fill={colors.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Goal Plateau Warnings */}
    <div className="mt-8">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Goal Plateau Warnings
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.slice(0, 3).map((goal) => (
          <div
            key={goal.id}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <h5 className="font-medium text-amber-900">
              {goal.decryptedTitle}
            </h5>
            <p className="text-sm text-amber-700 mt-1">
              No progress detected in the last 2 weeks. Consider breaking into
              smaller milestones.
            </p>
            <button className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium">
              View Suggestions →
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Goal Insights Tab Component
const GoalInsightsTab = ({
  goals,
  moodCorrelations,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Insights & Correlations
    </h3>

    {/* Mood Correlations */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Mood Correlations</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={moodCorrelations}>
            <CartesianGrid />
            <XAxis dataKey="moodBefore" name="Mood Before" />
            <YAxis dataKey="moodAfter" name="Mood After" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter dataKey="correlation" fill={colors.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Growth Language Analysis */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Growth Language Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { phrase: "I learned", count: 15, sentiment: 0.8 },
          { phrase: "I improved", count: 12, sentiment: 0.75 },
          { phrase: "I struggled", count: 8, sentiment: 0.3 },
          { phrase: "I achieved", count: 10, sentiment: 0.9 },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">"{item.phrase}"</span>
              <span className="text-sm text-blue-600">{item.count}x</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${item.sentiment * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-600 mt-1">
              {(item.sentiment * 100).toFixed(0)}% positive sentiment
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Goal-Related Journal Entries */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">
        Recent Goal-Related Journal Entries
      </h4>
      <div className="space-y-3">
        {goals.slice(0, 3).map((goal) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{goal.decryptedTitle}</h5>
            <p className="text-sm text-gray-600 mt-1">
              Last mentioned 3 days ago with positive sentiment.
              <span className="text-purple-600 hover:text-purple-700 cursor-pointer ml-1">
                View entries →
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Mention Timeline Tab Component
const MentionTimelineTab = ({
  goals,
  goalMentions,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Mention Analytics
    </h3>

    {/* Weekly Mention Graph */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Weekly Goal Mentions</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={goalMentions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="mentions"
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Spike Detection */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Spike Detection & Summaries
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">
              Mention Spike Detected
            </span>
          </div>
          <p className="text-sm text-green-700">
            Week 6 showed 50% increase in goal mentions, particularly around
            "Exercise" goals.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-900">Mention Drop</span>
          </div>
          <p className="text-sm text-amber-700">
            Week 4 showed decreased mentions. Consider reviewing goal relevance
            and adjusting approach.
          </p>
        </div>
      </div>
    </div>

    {/* Sentiment Timeline */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Sentiment Over Time</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={goalMentions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke={colors.accent}
              strokeWidth={3}
              dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// Goal Comparison Tab Component
const GoalComparisonTab = ({ goals, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Comparison & Analysis
    </h3>

    {/* Progress Comparison */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Progress Comparison</h4>
      <div className="space-y-4">
        {goals.slice(0, 5).map((goal, index) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {goal.decryptedTitle}
              </span>
              <span className="text-sm text-gray-600">{65 + index * 5}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${65 + index * 5}%`,
                  backgroundColor:
                    colors.gradient[index % colors.gradient.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Priority vs Progress Matrix */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Priority vs Progress Matrix
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="priority" name="Priority" />
            <YAxis dataKey="progress" name="Progress" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={goals.map((goal, index) => ({
                priority: goal.priority || (index % 5) + 1,
                progress: 65 + index * 5,
                name: goal.decryptedTitle,
              }))}
              fill={colors.primary}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Conflict & Synergy Analysis */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">
        Conflict & Synergy Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium text-red-900 mb-3">Potential Conflicts</h5>
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                <strong>Time Conflict:</strong> "Exercise 3x/week" and "Work
                60hrs/week" may compete for time slots.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                <strong>Energy Conflict:</strong> High-intensity goals scheduled
                on same days.
              </p>
            </div>
          </div>
        </div>
        <div>
          <h5 className="font-medium text-green-900 mb-3">
            Synergistic Opportunities
          </h5>
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700">
                <strong>Mutual Support:</strong> "Meditation" and "Stress
                Management" can reinforce each other.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700">
                <strong>Skill Building:</strong> "Reading" supports "Learning
                Spanish" vocabulary development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Mood Correlations Tab Component
const MoodCorrelationsTab = ({ goals, moodCorrelations, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Mood Correlations
    </h3>

    {/* Correlation Strength Chart */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Goal-Mood Correlation Strength
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={moodCorrelations} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 1]} />
            <YAxis dataKey="goal" type="category" width={80} />
            <Tooltip />
            <Bar
              dataKey="correlation"
              fill={colors.primary}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Before/After Mood Analysis */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Before/After Mood Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {moodCorrelations.map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h5 className="font-medium text-blue-900 mb-3">{item.goal}</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Before:</span>
                <span className="font-medium">{item.moodBefore}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">After:</span>
                <span className="font-medium">{item.moodAfter}/10</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-700">Improvement:</span>
                <span className="text-green-600">
                  +{(item.moodAfter - item.moodBefore).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">AI Recommendations</h4>
      <div className="space-y-3">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h5 className="font-medium text-purple-900">
            Mood Boosting Schedule
          </h5>
          <p className="text-sm text-purple-700 mt-1">
            Schedule high-correlation goals (Exercise, Meditation) during
            low-mood periods for maximum benefit.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900">Positive Momentum</h5>
          <p className="text-sm text-green-700 mt-1">
            Your "Exercise" goal consistently improves mood by 26%. Consider
            increasing frequency.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Growth Tracking Tab Component
const GrowthTrackingTab = ({ goals, colors, selectedGoalId, onSelectGoal }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Growth Tracking & Development
    </h3>

    {/* Growth Metrics Radar */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Growth Dimensions</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={[
              { dimension: "Consistency", score: 85 },
              { dimension: "Challenge Level", score: 70 },
              { dimension: "Completion Rate", score: 78 },
              { dimension: "Motivation", score: 82 },
              { dimension: "Learning", score: 75 },
              { dimension: "Reflection", score: 88 },
            ]}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              dataKey="score"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Skill Development Tracking */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Skill Development Tracking
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { skill: "Self-Discipline", level: 7, growth: "+12%" },
          { skill: "Time Management", level: 6, growth: "+8%" },
          { skill: "Consistency", level: 8, growth: "+15%" },
          { skill: "Goal Setting", level: 7, growth: "+10%" },
          { skill: "Self-Reflection", level: 9, growth: "+18%" },
          { skill: "Motivation", level: 6, growth: "+5%" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-indigo-900">{item.skill}</span>
              <span className="text-sm text-green-600 font-medium">
                {item.growth}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${item.level * 10}%` }}
                />
              </div>
              <span className="text-sm text-indigo-600 font-medium">
                {item.level}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Achievement Timeline */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Recent Achievements</h4>
      <div className="space-y-3">
        {[
          {
            title: "Completed Exercise Goal Week 3",
            date: "3 days ago",
            type: "milestone",
          },
          {
            title: "Maintained 7-day Learning Streak",
            date: "5 days ago",
            type: "streak",
          },
          {
            title: "Achieved Meditation Tier Upgrade",
            date: "1 week ago",
            type: "tier",
          },
        ].map((achievement, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <Award className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="font-medium text-yellow-900">
                {achievement.title}
              </h5>
              <p className="text-sm text-yellow-700">{achievement.date}</p>
            </div>
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
              {achievement.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Insights Feed Tab Component
const InsightsFeedTab = ({ insights, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      AI Insights Feed
    </h3>

    <div className="space-y-4">
      {insights
        .concat([
          {
            id: 3,
            type: "recommendation",
            title: "Optimize Your Goal Schedule",
            message:
              "Based on your energy patterns, schedule challenging goals in the morning when your energy is highest.",
            priority: "high",
            date: new Date().toISOString(),
          },
          {
            id: 4,
            type: "pattern",
            title: "Weekly Pattern Detected",
            message:
              "You consistently struggle with goals on Mondays. Consider lighter goal loads to start the week.",
            priority: "medium",
            date: new Date().toISOString(),
          },
          {
            id: 5,
            type: "achievement",
            title: "Growth Milestone Reached",
            message:
              "Your goal completion rate has improved by 23% over the past month. Keep up the excellent work!",
            priority: "high",
            date: new Date().toISOString(),
          },
        ])
        .map((insight) => (
          <InsightCard key={insight.id} insight={insight} colors={colors} />
        ))}
    </div>
  </div>
);

// Data Export Tab Component
const DataExportTab = ({ goals, analyticsData, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Export & Reports
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Export Options */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Export Options</h4>
        <div className="space-y-3">
          {[
            {
              title: "Goal Progress Report",
              description: "Comprehensive progress analysis with charts",
            },
            {
              title: "Mood Correlation Data",
              description: "CSV export of mood-goal correlations",
            },
            {
              title: "Achievement Timeline",
              description: "PDF timeline of all achievements",
            },
            {
              title: "Custom Analytics Report",
              description: "Customizable data export",
            },
          ].map((option, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900">{option.title}</h5>
              <p className="text-sm text-gray-600 mt-1 mb-3">
                {option.description}
              </p>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Report Preview</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h5 className="font-medium text-gray-900 mb-3">
            Monthly Goal Intelligence Report
          </h5>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Total Goals: {goals.length}</p>
            <p>
              • Average Progress:{" "}
              {analyticsData?.overview?.averageProgress || 0}%
            </p>
            <p>• Top Performing Goal: Exercise</p>
            <p>• Mood Correlation: +0.73</p>
            <p>• Growth Indicators: 5 detected</p>
            <p>• Recommendations: 3 actionable insights</p>
          </div>
          <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Utility Components
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
    </div>
  </div>
);

const InsightCard = ({ insight, colors }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case "plateau_warning":
        return AlertTriangle;
      case "mood_correlation":
        return Heart;
      case "recommendation":
        return Lightbulb;
      case "pattern":
        return Brain;
      case "achievement":
        return Award;
      default:
        return Info;
    }
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case "high":
        return colors.danger;
      case "medium":
        return colors.warning;
      case "low":
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const Icon = getInsightIcon(insight.type);
  const color = getInsightColor(insight.priority);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{insight.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(insight.date).toLocaleDateString()}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const GoalSidebarItem = ({ goal, isSelected, onClick }) => {
  const badge = goal.tier || "List";
  const badgeColor =
    badge === "Advanced"
      ? "bg-purple-100 text-purple-700"
      : badge === "Intermediate"
      ? "bg-blue-100 text-blue-700"
      : badge === "Beginner"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  const statusColor =
    goal.status === "active"
      ? "text-green-600"
      : goal.status === "paused"
      ? "text-yellow-600"
      : goal.status === "completed"
      ? "text-blue-600"
      : "text-red-600";

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected
          ? "bg-purple-50 border-l-4 border-l-purple-500"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {goal.decryptedTitle}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>

      {goal.decryptedDescription && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {goal.decryptedDescription}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${statusColor}`}>
          {goal.status?.charAt(0).toUpperCase() + goal.status?.slice(1) ||
            "Active"}
        </span>
        <span className="text-gray-500">Priority {goal.priority || "—"}</span>
      </div>

      {goal.last_mentioned_date && (
        <div className="mt-2 text-xs text-gray-500">
          Last mentioned:{" "}
          {new Date(goal.last_mentioned_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyAdvancedGoalsState = ({ onAddGoal }) => (
  <div className="text-center py-12">
    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-2">
      Welcome to Advanced Goals Intelligence
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      Create your first goal to unlock powerful analytics, AI insights, and
      advanced tracking features.
    </p>
    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 max-w-lg mx-auto mb-6">
      <h4 className="font-semibold text-purple-900 mb-3">
        🚀 Advanced Features You'll Unlock:
      </h4>
      <ul className="text-purple-700 text-sm space-y-2 text-left">
        <li>• Progress pattern analysis with plateau detection</li>
        <li>• Mood correlation tracking and optimization</li>
        <li>• AI-powered goal insights and recommendations</li>
        <li>• Mention timeline analytics with spike detection</li>
        <li>• Goal comparison and conflict/synergy analysis</li>
        <li>• Growth tracking across multiple dimensions</li>
        <li>• Customizable reports and data export</li>
      </ul>
    </div>
    <button
      onClick={onAddGoal}
      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 mx-auto"
    >
      <Plus className="h-5 w-5" />
      Create Your First Goal
    </button>
  </div>
);

export default AdvancedGoals;
