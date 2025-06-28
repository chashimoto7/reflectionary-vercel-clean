// src/pages/PremiumGoals.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import {
  Calendar,
  Search,
  Filter,
  Star,
  Pin,
  FolderOpen,
  Clock,
  TrendingUp,
  Heart,
  Brain,
  Zap,
  Download,
  Eye,
  Play,
  FileText,
  BookOpen,
  Lightbulb,
  BarChart3,
  Info,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Edit3,
  Hash,
  Feather,
  Activity,
  Users,
  Crown,
  CheckCircle2,
  GitBranch,
  Gauge,
  LineChart,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";

// Import separate tab components
import GoalsOverviewTab from "../components/goals/tabs/GoalsOverviewTab";
import IntelligenceOverviewTab from "../components/goals/tabs/IntelligenceOverviewTab";
import ProgressPatternsTab from "../components/goals/tabs/ProgressPatternsTab";
import GoalInsightsTab from "../components/goals/tabs/GoalInsightsTab";
import GoalComparisonTab from "../components/goals/tabs/GoalComparisonTab";
import MoodCorrelationsTab from "../components/goals/tabs/MoodCorrelationsTab";
import GrowthTrackingTab from "../components/goals/tabs/GrowthTrackingTab";
import MentionTimelineTab from "../components/goals/tabs/MentionTimelineTab";
import InsightsFeedTab from "../components/goals/tabs/InsightsFeedTab";
// New tab components to be created
import AchievementPredictionsTab from "../components/goals/tabs/AchievementPredictionsTab";
import MilestoneAnalyticsTab from "../components/goals/tabs/MilestoneAnalyticsTab";
import GoalDependenciesTab from "../components/goals/tabs/GoalDependenciesTab";
import SuccessFactorsTab from "../components/goals/tabs/SuccessFactorsTab";
import GoalHealthScoreTab from "../components/goals/tabs/GoalHealthScoreTab";
import ProgressVelocityTab from "../components/goals/tabs/ProgressVelocityTab";

// Import modals
import AddGoalModal from "../components/AddGoalModal";
import EditGoalModal from "../components/EditGoalModal";
import EditMilestonesModal from "../components/EditMilestonesModal";
import GoalTips from "../components/GoalTips";

const PremiumGoals = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("goals-overview");
  const [dateRange, setDateRange] = useState("3months");
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMilestonesModal, setShowEditMilestonesModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      pausedGoals: 0,
      averageProgress: 0,
      streak: 0,
    },
  });
  const [insights, setInsights] = useState([]);
  const [progressPatterns, setProgressPatterns] = useState([]);
  const [goalMentions, setGoalMentions] = useState([]);
  const [moodCorrelations, setMoodCorrelations] = useState([]);

  // Advanced color palette matching other Advanced pages
  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    lime: "#84CC16",
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

  // Updated tabs structure - 15 tabs in three rows (3x5)
  const advancedTabs = [
    // Row 1 - Core Overview & Analytics
    {
      id: "goals-overview",
      label: "Goals Overview",
      icon: Target,
    },
    {
      id: "intelligence-overview",
      label: "Intelligence Overview",
      icon: Brain,
    },
    {
      id: "progress-patterns",
      label: "Progress Patterns",
      icon: BarChart3,
    },
    {
      id: "goal-insights",
      label: "Goal Insights",
      icon: Lightbulb,
    },
    {
      id: "goal-comparison",
      label: "Goal Comparison",
      icon: Users,
    },
    // Row 2 - Advanced Analytics
    {
      id: "achievement-predictions",
      label: "Achievement Predictions",
      icon: TrendingUp,
    },
    {
      id: "milestone-analytics",
      label: "Milestone Analytics",
      icon: CheckCircle2,
    },
    {
      id: "goal-dependencies",
      label: "Goal Dependencies",
      icon: GitBranch,
    },
    {
      id: "success-factors",
      label: "Success Factors",
      icon: Zap,
    },
    {
      id: "goal-health-score",
      label: "Goal Health Score",
      icon: Gauge,
    },
    // Row 3 - Correlations & Tracking
    {
      id: "mood-correlations",
      label: "Mood Correlations",
      icon: Heart,
    },
    {
      id: "growth-tracking",
      label: "Growth Tracking",
      icon: Sparkles,
    },
    {
      id: "mention-analytics",
      label: "Mention Analytics",
      icon: Calendar,
    },
    {
      id: "progress-velocity",
      label: "Progress Velocity",
      icon: LineChart,
    },
    {
      id: "ai-insights",
      label: "AI Insights Feed",
      icon: Brain,
    },
  ];

  // Check access control
  useEffect(() => {
    if (!user || membershipLoading) {
      return;
    }

    const userHasAccess = hasAccess("premium_goals");

    if (userHasAccess) {
      loadGoalsAndAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

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
      setError("Failed to load goals data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Data loading functions
  const loadGoals = async () => {
    try {
      // Mock implementation - in real app, load from database
      setGoals([]); // Empty array for now
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const loadAnalyticsData = async () => {
    // Mock data
    setAnalyticsData({
      overview: {
        totalGoals: 12,
        activeGoals: 8,
        completedGoals: 3,
        pausedGoals: 1,
        averageProgress: 67,
        streak: 15,
      },
    });
  };

  const loadInsights = async () => {
    // Mock insights
    setInsights([
      {
        id: 1,
        type: "success",
        title: "Strong Progress on Fitness Goals",
        description:
          "You've maintained consistent progress on your fitness goals for 3 weeks.",
        icon: TrendingUp,
      },
    ]);
  };

  const loadProgressPatterns = async () => {
    // Mock data
    setProgressPatterns([
      { day: "Mon", progress: 85 },
      { day: "Tue", progress: 72 },
      { day: "Wed", progress: 90 },
      { day: "Thu", progress: 65 },
      { day: "Fri", progress: 88 },
      { day: "Sat", progress: 95 },
      { day: "Sun", progress: 78 },
    ]);
  };

  const loadGoalMentions = async () => {
    // Mock data
    setGoalMentions([
      { date: "2024-01", mentions: 12 },
      { date: "2024-02", mentions: 18 },
      { date: "2024-03", mentions: 25 },
    ]);
  };

  const loadMoodCorrelations = async () => {
    // Mock data
    setMoodCorrelations([
      { mood: "Happy", goalProgress: 85 },
      { mood: "Motivated", goalProgress: 92 },
      { mood: "Stressed", goalProgress: 45 },
      { mood: "Calm", goalProgress: 78 },
    ]);
  };

  // Handler functions
  const handleAddGoal = async (newGoal) => {
    // Implementation
  };

  const handleEditGoal = async (updatedGoal) => {
    // Implementation
  };

  const handleStatusChange = async (goalId, newStatus) => {
    // Implementation
  };

  const handleRemoveGoal = async (goalId) => {
    // Implementation
  };

  // Access control check
  if (!user || membershipLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess("premium_goals")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Goals Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Premium to unlock advanced goal analytics, AI
            predictions, and personalized insights.
          </p>
          <button
            onClick={() => (window.location.href = "/membership")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={loadGoalsAndAnalytics}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const EmptyGoalsState = () => (
    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
      <p className="text-gray-300 mb-6">
        Create your first goal to unlock powerful AI-driven analytics, progress
        tracking, and personalized insights.
      </p>
      <button
        onClick={() => setShowAddModal(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Create Your First Goal
      </button>
    </div>
  );

  const NoGoalsMessage = ({
    message = "Start tracking goals to see analytics and insights here.",
  }) => (
    <div className="p-12 text-center">
      <Target className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
      <p className="text-gray-300 max-w-md mx-auto">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Premium Goals Analytics
              </h1>
              <p className="text-gray-400">
                AI-powered insights to achieve your dreams
              </p>
            </div>

            {/* Privacy Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition bg-white/10 rounded-lg"
              >
                <Shield className="h-4 w-4" />
                Privacy Info
                <Info className="h-4 w-4" />
              </button>

              {showPrivacyInfo && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-white/20 rounded-lg shadow-lg p-4 z-10">
                  <p className="text-sm text-gray-300">
                    Analytics insights are generated from your encrypted data
                    patterns without exposing personal content. This data is
                    visible only to you and never shared.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date Range & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </button>

              <label className="text-sm font-medium text-gray-300">
                Analysis Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              AI Goal Analysis Active
            </div>
          </div>
        </div>

        {/* Advanced Tab Navigation - Three Row Layout (3x5) */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
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

            {/* Second Row - 5 tabs */}
            <div className="flex flex-wrap gap-2 mb-2">
              {advancedTabs.slice(5, 10).map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
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

            {/* Third Row - 5 tabs */}
            <div className="flex flex-wrap gap-2">
              {advancedTabs.slice(10, 15).map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
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
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "goals-overview" &&
            (goals.length === 0 ? (
              <NoGoalsMessage />
            ) : (
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
            ))}
          {activeTab === "intelligence-overview" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Start tracking goals to unlock AI-powered intelligence insights." />
            ) : (
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
            ))}
          {activeTab === "progress-patterns" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Progress patterns will appear once you start tracking goals." />
            ) : (
              <ProgressPatternsTab
                goals={goals}
                progressPatterns={progressPatterns}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            ))}
          {activeTab === "goal-insights" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Goal insights will be generated once you create your first goal." />
            ) : (
              <GoalInsightsTab
                goals={goals}
                moodCorrelations={moodCorrelations}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            ))}
          {activeTab === "goal-comparison" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Create multiple goals to compare their progress and performance." />
            ) : (
              <GoalComparisonTab goals={goals} colors={colors} />
            ))}
          {activeTab === "mood-correlations" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Track your moods alongside goals to discover correlations." />
            ) : (
              <MoodCorrelationsTab
                goals={goals}
                moodCorrelations={moodCorrelations}
                colors={colors}
              />
            ))}
          {activeTab === "growth-tracking" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Your growth journey will be tracked as you progress through goals." />
            ) : (
              <GrowthTrackingTab goals={goals} colors={colors} />
            ))}
          {activeTab === "mention-analytics" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="Goal mentions in your journal entries will be analyzed once you create goals." />
            ) : (
              <MentionTimelineTab
                goals={goals}
                goalMentions={goalMentions}
                colors={colors}
                selectedGoalId={selectedGoalId}
                onSelectGoal={setSelectedGoalId}
              />
            ))}
          {activeTab === "ai-insights" &&
            (goals.length === 0 ? (
              <NoGoalsMessage message="AI insights will be generated based on your goal progress and patterns." />
            ) : (
              <InsightsFeedTab
                insights={insights}
                goals={goals}
                colors={colors}
              />
            ))}

          {/* New tab components - placeholders for now */}
          {activeTab === "achievement-predictions" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Achievement Predictions
              </h3>
              <p className="text-gray-300">
                AI-powered predictions for goal completion coming soon...
              </p>
            </div>
          )}
          {activeTab === "milestone-analytics" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <CheckCircle2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Milestone Analytics
              </h3>
              <p className="text-gray-300">
                Deep dive into milestone patterns coming soon...
              </p>
            </div>
          )}
          {activeTab === "goal-dependencies" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <GitBranch className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Goal Dependencies
              </h3>
              <p className="text-gray-300">
                Visualize goal relationships coming soon...
              </p>
            </div>
          )}
          {activeTab === "success-factors" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Success Factors
              </h3>
              <p className="text-gray-300">
                Identify success patterns coming soon...
              </p>
            </div>
          )}
          {activeTab === "goal-health-score" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <Gauge className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Goal Health Score
              </h3>
              <p className="text-gray-300">
                Portfolio health assessment coming soon...
              </p>
            </div>
          )}
          {activeTab === "progress-velocity" && (
            <div className="p-6 text-center bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <LineChart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Progress Velocity
              </h3>
              <p className="text-gray-300">
                Track momentum changes coming soon...
              </p>
            </div>
          )}
        </div>

        {/* Goal Tips Section */}
        {goals.length === 0 && (
          <div className="mt-8">
            <EmptyGoalsState />
          </div>
        )}

        {/* Always show Goal Tips */}
        <div className="mt-8">
          <GoalTips />
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddGoalModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddGoal}
          />
        )}

        {showEditModal && selectedGoalId && (
          <EditGoalModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedGoalId(null);
            }}
            goal={goals.find((g) => g.id === selectedGoalId)}
            onUpdate={handleEditGoal}
          />
        )}

        {showEditMilestonesModal && selectedGoalId && (
          <EditMilestonesModal
            isOpen={showEditMilestonesModal}
            onClose={() => {
              setShowEditMilestonesModal(false);
              setSelectedGoalId(null);
            }}
            goal={goals.find((g) => g.id === selectedGoalId)}
            onUpdate={handleEditGoal}
          />
        )}
      </div>
    </div>
  );
};

export default PremiumGoals;
