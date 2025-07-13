// frontend/src/pages/PremiumGoals.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactConfetti from "react-confetti"; // Added missing import
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
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("goals-overview");
  const [dateRange, setDateRange] = useState("3months");
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [databaseEnvironment, setDatabaseEnvironment] = useState(null);

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

  // Get backend URL
  const getBackendUrl = () => {
    return (
      import.meta.env.VITE_BACKEND_URL || "https://reflectionary-api.vercel.app"
    );
  };

  // Load data when user is available
  useEffect(() => {
    if (!user) {
      return;
    }

    loadGoalsAndAnalytics();
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
      setError("Failed to load goals data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Data loading functions - Using proper backend URLs
  const loadGoals = async () => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/api/goals?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await response.json();
      setGoals(data.goals || []);

      // Track which database is being used
      if (data.database) {
        setDatabaseEnvironment(data.database);
        console.log(`🎯 Using ${data.database} database for goals`);
      }

      // Select first goal if none selected
      if (data.goals && data.goals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(data.goals[0].id);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      throw error;
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // For now, calculate analytics client-side since the endpoint might not exist yet
      // In the future, this should call the backend API

      const activeGoals = goals.filter((g) => g.status === "active");
      const completedGoals = goals.filter((g) => g.status === "completed");
      const pausedGoals = goals.filter((g) => g.status === "paused");

      // Calculate average progress
      let totalProgress = 0;
      let goalsWithProgress = 0;

      goals.forEach((goal) => {
        if (goal.progress && goal.progress.data) {
          const progressData = goal.progress.data;
          if (goal.progress.type === "milestones") {
            const completed = progressData.filter((m) => m.completed).length;
            const total = progressData.length;
            if (total > 0) {
              totalProgress += (completed / total) * 100;
              goalsWithProgress++;
            }
          } else if (goal.progress.type === "tiers") {
            // Handle tier-based progress
            const currentTier = progressData.findIndex((t) => !t.completed);
            if (currentTier > 0) {
              totalProgress += (currentTier / progressData.length) * 100;
              goalsWithProgress++;
            }
          }
        }
      });

      setAnalyticsData({
        overview: {
          totalGoals: goals.length,
          activeGoals: activeGoals.length,
          completedGoals: completedGoals.length,
          pausedGoals: pausedGoals.length,
          averageProgress:
            goalsWithProgress > 0
              ? Math.round(totalProgress / goalsWithProgress)
              : 0,
          streak: 0, // Would need journal entries to calculate
        },
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set default values if calculation fails
      setAnalyticsData({
        overview: {
          totalGoals: goals.length,
          activeGoals: goals.filter((g) => g.status === "active").length,
          completedGoals: goals.filter((g) => g.status === "completed").length,
          pausedGoals: goals.filter((g) => g.status === "paused").length,
          averageProgress: 0,
          streak: 0,
        },
      });
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/api/goal-insights?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await response.json();
      setInsights(data.goalInsights || []);
    } catch (error) {
      console.error("Error loading insights:", error);
      // Set default insights
      setInsights([
        {
          id: 1,
          type: "success",
          title: "Strong Progress on Goals",
          description: "Keep up the momentum on your active goals.",
          goalId: null,
          date: new Date().toISOString(),
        },
      ]);
    }
  };

  const loadProgressPatterns = async () => {
    try {
      // This endpoint might not exist yet, so we'll handle the error gracefully
      const response = await fetch(
        `${getBackendUrl()}/api/goal-patterns?user_id=${
          user.id
        }&date_range=${dateRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProgressPatterns(data.patterns || []);
      }
    } catch (error) {
      console.error("Error loading progress patterns:", error);
      setProgressPatterns([]);
    }
  };

  const loadGoalMentions = async () => {
    try {
      // This endpoint might not exist yet, so we'll handle the error gracefully
      const response = await fetch(
        `${getBackendUrl()}/api/goal-mentions?user_id=${
          user.id
        }&date_range=${dateRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGoalMentions(data.mentions || []);
      }
    } catch (error) {
      console.error("Error loading goal mentions:", error);
      setGoalMentions([]);
    }
  };

  const loadMoodCorrelations = async () => {
    try {
      // This endpoint might not exist yet, so we'll handle the error gracefully
      const response = await fetch(
        `${getBackendUrl()}/api/goal-mood-correlations?user_id=${
          user.id
        }&date_range=${dateRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMoodCorrelations(data.correlations || []);
      }
    } catch (error) {
      console.error("Error loading mood correlations:", error);
      setMoodCorrelations([]);
    }
  };

  // Goal CRUD operations using backend
  const handleAddGoal = async (goalData) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.id,
          ...goalData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create goal");
      }

      const data = await response.json();
      await loadGoalsAndAnalytics(); // Reload all data
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal. Please try again.");
    }
  };

  const handleEditGoal = async (goalId, updatedData) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          goal_id: goalId,
          user_id: user.id,
          ...updatedData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update goal");
      }

      const data = await response.json();
      await loadGoalsAndAnalytics(); // Reload all data
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Failed to update goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      const response = await fetch(
        `${getBackendUrl()}/api/goals?goal_id=${goalId}&user_id=${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      await loadGoalsAndAnalytics(); // Reload all data

      // Clear selected goal if it was deleted
      if (selectedGoalId === goalId) {
        setSelectedGoalId(goals.find((g) => g.id !== goalId)?.id || null);
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          goal_id: goalId,
          user_id: user.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await loadGoalsAndAnalytics(); // Reload all data

      // Show celebration if goal is completed
      if (newStatus === "completed") {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } catch (error) {
      console.error("Error updating goal status:", error);
      alert("Failed to update goal status. Please try again.");
    }
  };

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals and analytics...</p>
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

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Celebration Confetti */}
        {showCelebration && (
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            colors={colors.gradient}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                Premium Goal Tracking
                <Crown className="h-8 w-8 text-yellow-400" />
              </h1>
              <p className="text-gray-400">
                Advanced goal analytics with AI-powered insights
                {databaseEnvironment && (
                  <span className="ml-2 text-xs text-purple-400">
                    ({databaseEnvironment} data)
                  </span>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                <Plus className="h-5 w-5" />
                Add Goal
              </button>

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
                      All goal data is encrypted end-to-end. Your goals and
                      progress are private and only visible to you. AI analysis
                      is performed on encrypted data without exposing content.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date Range & Analytics Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300">
                  {analyticsData.overview.activeGoals} Active Goals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">
                  {analyticsData.overview.completedGoals} Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">
                  {analyticsData.overview.averageProgress}% Avg Progress
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Tabs - 3x5 Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-2">
            {advancedTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Determine row based on index
              const row = Math.floor(index / 5) + 1;
              const rowClass = `row-start-${row}`;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${rowClass}
                    flex flex-col items-center justify-center p-4 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-center">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
          {activeTab === "goals-overview" && (
            <GoalsOverviewTab
              goals={goals}
              selectedGoalId={selectedGoalId}
              setSelectedGoalId={setSelectedGoalId}
              onEditGoal={(goal) => {
                setSelectedGoalId(goal.id);
                setShowEditModal(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onStatusChange={handleStatusChange}
              colors={colors}
            />
          )}
          {activeTab === "intelligence-overview" && (
            <IntelligenceOverviewTab
              goals={goals}
              analytics={analyticsData}
              insights={insights}
              colors={colors}
            />
          )}
          {activeTab === "progress-patterns" && (
            <ProgressPatternsTab
              goals={goals}
              patterns={progressPatterns}
              colors={colors}
            />
          )}
          {activeTab === "goal-insights" && (
            <GoalInsightsTab
              goals={goals}
              insights={insights}
              colors={colors}
            />
          )}
          {activeTab === "goal-comparison" && (
            <GoalComparisonTab goals={goals} colors={colors} />
          )}
          {activeTab === "achievement-predictions" && (
            <AchievementPredictionsTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "milestone-analytics" && (
            <MilestoneAnalyticsTab goals={goals} colors={colors} />
          )}
          {activeTab === "goal-dependencies" && (
            <GoalDependenciesTab goals={goals} colors={colors} />
          )}
          {activeTab === "success-factors" && (
            <SuccessFactorsTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "goal-health-score" && (
            <GoalHealthScoreTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "mood-correlations" && (
            <MoodCorrelationsTab
              goals={goals}
              correlations={moodCorrelations}
              colors={colors}
            />
          )}
          {activeTab === "growth-tracking" && (
            <GrowthTrackingTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "mention-analytics" && (
            <MentionTimelineTab
              goals={goals}
              mentions={goalMentions}
              colors={colors}
            />
          )}
          {activeTab === "progress-velocity" && (
            <ProgressVelocityTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "ai-insights" && (
            <InsightsFeedTab
              insights={insights}
              goals={goals}
              colors={colors}
            />
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddGoalModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddGoal}
          />
        )}

        {showEditModal && selectedGoal && (
          <EditGoalModal
            goal={selectedGoal}
            onClose={() => setShowEditModal(false)}
            onSave={(updatedData) =>
              handleEditGoal(selectedGoal.id, updatedData)
            }
          />
        )}

        {showEditMilestonesModal && selectedGoal && (
          <EditMilestonesModal
            goal={selectedGoal}
            onClose={() => setShowEditMilestonesModal(false)}
            onSave={(milestones) =>
              handleEditGoal(selectedGoal.id, { milestones })
            }
          />
        )}
      </div>
    </div>
  );
};

export default PremiumGoals;
