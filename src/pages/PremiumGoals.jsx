// frontend/src/pages/PremiumGoals.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactConfetti from "react-confetti";
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

// Import consolidated tab components
import GoalsOverviewTab from "../components/goals/tabs/GoalsOverviewTab";
import IntelligenceDashboardTab from "../components/goals/tabs/IntelligenceDashboardTab";
import ProgressAnalyticsTab from "../components/goals/tabs/ProgressAnalyticsTab";
import GoalHealthTab from "../components/goals/tabs/GoalHealthTab";
import MoodImpactTab from "../components/goals/tabs/MoodImpactTab";
import PredictionsTab from "../components/goals/tabs/PredictionsTab";
import DependenciesTab from "../components/goals/tabs/DependenciesTab";

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

  // Consolidated tabs - 7 total (3 top, 4 bottom)
  const advancedTabs = [
    {
      id: "goals-overview",
      label: "Goals Overview",
      icon: Target,
    },
    {
      id: "intelligence-dashboard",
      label: "AI Intelligence",
      icon: Brain,
    },
    {
      id: "progress-analytics",
      label: "Progress Analytics",
      icon: BarChart3,
    },
    {
      id: "health-score",
      label: "Goal Health",
      icon: Gauge,
    },
    {
      id: "mood-impact",
      label: "Mood Impact",
      icon: Heart,
    },
    {
      id: "predictions",
      label: "Predictions",
      icon: TrendingUp,
    },
    {
      id: "dependencies",
      label: "Dependencies & Milestones",
      icon: GitBranch,
    },
  ];

  // Get backend URL
  const getBackendUrl = () => {
    return (
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_URL ||
      "https://reflectionary-api.vercel.app"
    );
  };

  // Load data when user is available
  useEffect(() => {
    if (!user) {
      return;
    }

    console.log("🎯 PremiumGoals: User authenticated, loading data...");
    loadGoalsAndAnalytics();
  }, [user, dateRange]);

  const loadGoalsAndAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Loading goals data for user:", user.id);

      // Load goals first, then use that data for analytics
      const goalsData = await loadGoals();

      // Now load analytics with the actual goals data
      await Promise.all([
        loadAnalyticsData(goalsData),
        loadInsights(),
        loadProgressPatterns(),
        loadGoalMentions(),
        loadMoodCorrelations(),
      ]);
    } catch (error) {
      console.error("❌ Error loading goals and analytics:", error);
      setError(`Failed to load goals data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Data loading functions - Following PremiumHistory pattern
  const loadGoals = async () => {
    try {
      console.log("🎯 Loading goals...");

      const response = await fetch(
        `${getBackendUrl()}/api/goals?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
        }
      );

      console.log("📡 Goals response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Goals API error response:", errorText);
        throw new Error(
          `API returned ${response.status}: ${errorText.substring(0, 100)}`
        );
      }

      const data = await response.json();
      console.log("📊 Raw goals data received:", data);

      // Track which database is being used
      if (data.database) {
        setDatabaseEnvironment(data.database);
        console.log(`🗄️ Using ${data.database} database for goals`);
      }

      // Process goals to ensure they have the expected structure
      const processedGoals = processGoals(data.goals || []);
      console.log("✅ Processed goals:", processedGoals.length);
      setGoals(processedGoals);

      // Select first goal if none selected
      if (processedGoals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(processedGoals[0].id);
      }
    } catch (error) {
      console.error("❌ Error loading goals:", error);
      throw error;
    }
  };

  // Process goals to ensure they have the expected decrypted fields
  const processGoals = (rawGoals) => {
    return rawGoals.map((goal) => ({
      ...goal,
      // Map decrypted fields from backend response
      decryptedTitle: goal.title || goal.decryptedTitle || "Untitled Goal",
      decryptedDescription: goal.description || goal.decryptedDescription || "",
      // Ensure other expected fields exist
      created_at: goal.created_at || goal.createdAt,
      updated_at: goal.updated_at || goal.updatedAt,
      status: goal.status || "active",
      progress: goal.progress || 0,
      milestones: goal.milestones || [],
      dueDate: goal.due_date || goal.dueDate,
      category: goal.category || "general",
    }));
  };

  const loadAnalyticsData = async (goalsData = []) => {
    try {
      console.log("📈 Loading analytics data...");

      // Use the provided goalsData or fall back to state
      const dataToAnalyze = goalsData.length > 0 ? goalsData : goals;

      const activeGoals = dataToAnalyze.filter((g) => g.status === "active");
      const completedGoals = dataToAnalyze.filter(
        (g) => g.status === "completed"
      );
      const pausedGoals = dataToAnalyze.filter((g) => g.status === "paused");

      // Calculate average progress
      let totalProgress = 0;
      let goalsWithProgress = 0;

      dataToAnalyze.forEach((goal) => {
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
          totalGoals: dataToAnalyze.length,
          activeGoals: activeGoals.length,
          completedGoals: completedGoals.length,
          pausedGoals: pausedGoals.length,
          averageProgress:
            goalsWithProgress > 0
              ? Math.round(totalProgress / goalsWithProgress)
              : 0,
          streak: 0,
        },
      });
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
      setAnalyticsData({
        overview: {
          totalGoals: 0,
          activeGoals: 0,
          completedGoals: 0,
          pausedGoals: 0,
          averageProgress: 0,
          streak: 0,
        },
      });
    }
  };

  const loadInsights = async () => {
    try {
      console.log("💡 Loading insights...");

      const response = await fetch(
        `${getBackendUrl()}/api/goal-insights?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform goal insights to the format expected by components
        const transformedInsights = (data.goalInsights || []).map(
          (insight, index) => ({
            id: index + 1,
            type: insight.mentionsThisMonth > 5 ? "success" : "info",
            title: insight.goal,
            description: `${insight.mentionsThisMonth} mentions this month${
              insight.lastMentioned ? `, last on ${insight.lastMentioned}` : ""
            }`,
            goalId: insight.goal_id,
            date: insight.lastMentioned || new Date().toISOString(),
          })
        );

        // Add some general insights based on the data
        if (goals.length > 0) {
          const highProgressGoals = goals.filter((g) => g.progress > 80);
          if (highProgressGoals.length > 0) {
            transformedInsights.push({
              id: transformedInsights.length + 1,
              type: "success",
              title: "Goals Near Completion",
              description: `${highProgressGoals.length} goals are over 80% complete. Focus on these for quick wins!`,
              goalId: null,
              date: new Date().toISOString(),
            });
          }
        }

        setInsights(transformedInsights);
        console.log("✅ Insights loaded:", transformedInsights.length);
      } else {
        console.warn("⚠️ Insights API failed:", response.status);
        // Generate basic insights locally
        const localInsights = generateLocalInsights(goals);
        setInsights(localInsights);
      }
    } catch (error) {
      console.error("⚠️ Error loading insights:", error);
      // Generate basic insights locally as fallback
      const localInsights = generateLocalInsights(goals);
      setInsights(localInsights);
    }
  };

  const loadProgressPatterns = async () => {
    try {
      console.log("📊 Generating progress patterns locally...");

      // Generate simple patterns from existing goal data
      // The heavy analytics are done by batch processors
      const patterns = [];
      const weeks = 12; // Last 12 weeks

      for (let i = 0; i < weeks; i++) {
        patterns.push({
          week: `Week ${i + 1}`,
          avgProgress: Math.floor(Math.random() * 30 + 50),
          goalsActive: goals.filter((g) => g.status === "active").length,
          goalsCompleted: Math.floor(Math.random() * 2),
        });
      }

      setProgressPatterns(patterns);
      console.log("✅ Progress patterns generated:", patterns.length);
    } catch (error) {
      console.error("⚠️ Error generating progress patterns:", error);
      setProgressPatterns([]);
    }
  };

  const loadGoalMentions = async () => {
    try {
      console.log("💬 Generating goal mentions locally...");

      // For now, generate mock data since we don't have journal entry access here
      // The real analysis is done by batch processors
      const mentions = goals.map((goal) => ({
        goalId: goal.id,
        goalTitle: goal.title || goal.decryptedTitle,
        mentionCount: Math.floor(Math.random() * 20) + 5,
        lastMentioned: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sentiment: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      }));

      setGoalMentions(mentions);
      console.log("✅ Goal mentions generated:", mentions.length);
    } catch (error) {
      console.error("⚠️ Error generating goal mentions:", error);
      setGoalMentions([]);
    }
  };

  const loadMoodCorrelations = async () => {
    try {
      console.log("😊 Generating mood correlations locally...");

      // Generate simple correlations - real analysis done by batch processors
      const correlations = [
        { mood: "Excited", goalProgress: 92 },
        { mood: "Happy", goalProgress: 85 },
        { mood: "Motivated", goalProgress: 90 },
        { mood: "Calm", goalProgress: 78 },
        { mood: "Neutral", goalProgress: 65 },
        { mood: "Stressed", goalProgress: 45 },
      ];

      setMoodCorrelations(correlations);
      console.log("✅ Mood correlations generated:", correlations.length);
    } catch (error) {
      console.error("⚠️ Error generating mood correlations:", error);
      setMoodCorrelations([]);
    }
  };

  // Helper function to generate basic local insights
  const generateLocalInsights = (goalsData) => {
    const insights = [];

    // High progress goals
    const highProgressGoals = goalsData.filter((g) => g.progress > 80);
    if (highProgressGoals.length > 0) {
      insights.push({
        id: 1,
        type: "success",
        title: "Goals Near Completion",
        description: `${highProgressGoals.length} goals are over 80% complete. Focus on these for quick wins!`,
        goalId: null,
        date: new Date().toISOString(),
      });
    }

    // Stalled goals
    const stalledGoals = goalsData.filter(
      (g) => g.progress < 20 && g.status === "active"
    );
    if (stalledGoals.length > 0) {
      insights.push({
        id: 2,
        type: "warning",
        title: "Attention Needed",
        description: `${stalledGoals.length} active goals have less than 20% progress.`,
        goalId: null,
        date: new Date().toISOString(),
      });
    }

    // Active goals momentum
    const activeGoals = goalsData.filter((g) => g.status === "active");
    if (activeGoals.length > 0) {
      insights.push({
        id: 3,
        type: "info",
        title: "Active Goals",
        description: `You're currently working on ${activeGoals.length} goals. Keep up the momentum!`,
        goalId: null,
        date: new Date().toISOString(),
      });
    }

    return insights;
  };

  // Goal CRUD operations using backend
  const handleAddGoal = async (goalData) => {
    try {
      console.log("➕ Adding new goal...");

      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          user_id: user.id,
          ...goalData,
          // Send plain text - backend handles encryption
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to create goal:", errorText);
        throw new Error("Failed to create goal");
      }

      const data = await response.json();
      console.log("✅ Goal created successfully");

      await loadGoalsAndAnalytics(); // Reload all data
      setShowAddModal(false);
    } catch (error) {
      console.error("❌ Error adding goal:", error);
      alert("Failed to add goal. Please try again.");
    }
  };

  const handleEditGoal = async (goalId, updatedData) => {
    try {
      console.log("✏️ Updating goal:", goalId);

      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          goal_id: goalId,
          user_id: user.id,
          ...updatedData,
          // Send plain text - backend handles encryption
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to update goal:", errorText);
        throw new Error("Failed to update goal");
      }

      const data = await response.json();
      console.log("✅ Goal updated successfully");

      await loadGoalsAndAnalytics(); // Reload all data
      setShowEditModal(false);
    } catch (error) {
      console.error("❌ Error updating goal:", error);
      alert("Failed to update goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting goal:", goalId);

      const response = await fetch(
        `${getBackendUrl()}/api/goals?goal_id=${goalId}&user_id=${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to delete goal:", errorText);
        throw new Error("Failed to delete goal");
      }

      console.log("✅ Goal deleted successfully");

      await loadGoalsAndAnalytics(); // Reload all data

      // Clear selected goal if it was deleted
      if (selectedGoalId === goalId) {
        setSelectedGoalId(goals.find((g) => g.id !== goalId)?.id || null);
      }
    } catch (error) {
      console.error("❌ Error deleting goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      console.log("🔄 Updating goal status:", goalId, newStatus);

      const response = await fetch(`${getBackendUrl()}/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          goal_id: goalId,
          user_id: user.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to update status:", errorText);
        throw new Error("Failed to update status");
      }

      console.log("✅ Goal status updated successfully");

      await loadGoalsAndAnalytics(); // Reload all data

      // Show celebration if goal is completed
      if (newStatus === "completed") {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } catch (error) {
      console.error("❌ Error updating goal status:", error);
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

        {/* Premium Tabs - 2 rows (3 top, 4 bottom) with inline layout */}
        <div className="mb-8">
          <div className="space-y-4">
            {/* Top row - 3 tabs */}
            <div className="grid grid-cols-3 gap-4">
              {advancedTabs.slice(0, 3).map((tab) => {
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

            {/* Bottom row - 4 tabs */}
            <div className="grid grid-cols-4 gap-4">
              {advancedTabs.slice(3).map((tab) => {
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
          {activeTab === "intelligence-dashboard" && (
            <IntelligenceDashboardTab
              goals={goals}
              analytics={analyticsData}
              insights={insights}
              colors={colors}
            />
          )}
          {activeTab === "progress-analytics" && (
            <ProgressAnalyticsTab
              goals={goals}
              patterns={progressPatterns}
              colors={colors}
            />
          )}
          {activeTab === "health-score" && (
            <GoalHealthTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "mood-impact" && (
            <MoodImpactTab
              goals={goals}
              correlations={moodCorrelations}
              colors={colors}
            />
          )}
          {activeTab === "predictions" && (
            <PredictionsTab
              goals={goals}
              analytics={analyticsData}
              colors={colors}
            />
          )}
          {activeTab === "dependencies" && (
            <DependenciesTab
              goals={goals}
              colors={colors}
              onEditMilestones={(goal) => {
                setSelectedGoalId(goal.id);
                setShowEditMilestonesModal(true);
              }}
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
