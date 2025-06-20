// src/pages/AdvancedGoals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { GoalRecommendations } from "../components/ReflectionarianRecommendations";
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

// Import separate tab components
import IntelligenceOverviewTab from "../components/goals/tabs/IntelligenceOverviewTab";
import ProgressPatternsTab from "../components/goals/tabs/ProgressPatternsTab";
import GoalInsightsTab from "../components/goals/tabs/GoalInsightsTab";
import MentionTimelineTab from "../components/goals/tabs/MentionTimelineTab";
import GoalsOverviewTab from "../components/goals/tabs/GoalsOverviewTab";
import GoalComparisonTab from "../components/goals/tabs/GoalComparisonTab";
import MoodCorrelationsTab from "../components/goals/tabs/MoodCorrelationsTab";
import GrowthTrackingTab from "../components/goals/tabs/GrowthTrackingTab";
import InsightsFeedTab from "../components/goals/tabs/InsightsFeedTab";
import DataExportTab from "../components/goals/tabs/DataExportTab";
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
    {
      id: "intelligence-overview",
      label: "Intelligence Overview",
      icon: TrendingUp,
    },
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
    try {
      if (!user?.id) return;

      // Calculate real goal statistics
      const totalGoals = goals.length;
      const activeGoals = goals.filter((g) => g.status === "active").length;
      const completedGoals = goals.filter(
        (g) => g.status === "completed"
      ).length;

      // Calculate average progress from milestone completion
      let totalProgress = 0;
      let progressCount = 0;

      for (const goal of goals) {
        try {
          const masterKey = await encryptionService.getStaticMasterKey();
          const dataKey = await encryptionService.decryptKey(
            {
              encryptedData: goal.encrypted_data_key,
              iv: goal.data_key_iv,
            },
            masterKey
          );

          if (goal.encrypted_progress && goal.progress_iv) {
            const progressData = await encryptionService.decryptText(
              goal.encrypted_progress,
              goal.progress_iv,
              dataKey
            );

            const parsed = JSON.parse(progressData);

            if (parsed.tiers) {
              // Calculate completion for tiered goals
              Object.values(parsed.tiers).forEach((tierArray) => {
                if (tierArray.length > 0) {
                  const completed = tierArray.filter((m) => m.completed).length;
                  totalProgress += (completed / tierArray.length) * 100;
                  progressCount++;
                }
              });
            } else if (parsed.milestones) {
              // Calculate completion for milestone goals
              if (parsed.milestones.length > 0) {
                const completed = parsed.milestones.filter(
                  (m) => m.completed
                ).length;
                totalProgress += (completed / parsed.milestones.length) * 100;
                progressCount++;
              }
            }
          }
        } catch (err) {
          console.warn("Error calculating progress for goal:", goal.id, err);
        }
      }

      const averageProgress =
        progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

      // Get goal mentions from journal entries for completion rate trend
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("created_at, goal_ids")
        .eq("user_id", user.id)
        .gte(
          "created_at",
          new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: true });

      if (journalError) {
        console.error(
          "Error loading journal entries for goal analytics:",
          journalError
        );
      }

      // Calculate weekly completion rates based on goal mentions
      const weeklyData = {};
      const now = new Date();

      // Initialize 8 weeks of data
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekKey = `Week ${8 - i}`;
        weeklyData[weekKey] = { mentions: 0, totalEntries: 0 };
      }

      // Count goal mentions per week
      journalEntries?.forEach((entry) => {
        const entryDate = new Date(entry.created_at);
        const weeksAgo = Math.floor(
          (now - entryDate) / (7 * 24 * 60 * 60 * 1000)
        );

        if (weeksAgo >= 0 && weeksAgo < 8) {
          const weekKey = `Week ${8 - weeksAgo}`;
          if (weeklyData[weekKey]) {
            weeklyData[weekKey].totalEntries++;
            if (entry.goal_ids && entry.goal_ids.length > 0) {
              weeklyData[weekKey].mentions++;
            }
          }
        }
      });

      // Calculate completion rate (goal mentions / total entries)
      const completionRate = Object.entries(weeklyData).map(([name, data]) => ({
        name,
        rate:
          data.totalEntries > 0
            ? Math.round((data.mentions / data.totalEntries) * 100)
            : 0,
      }));

      // Calculate current streak
      let streak = 0;
      const recentEntries = journalEntries?.slice(-30) || [];
      for (let i = recentEntries.length - 1; i >= 0; i--) {
        if (recentEntries[i].goal_ids && recentEntries[i].goal_ids.length > 0) {
          streak++;
        } else {
          break;
        }
      }

      const realAnalytics = {
        overview: {
          totalGoals,
          activeGoals,
          completedGoals,
          averageProgress,
          streak,
          lastUpdate: new Date().toISOString(),
        },
        completionRate,
      };

      setAnalyticsData(realAnalytics);
    } catch (error) {
      console.error("Error loading goal analytics:", error);
      // Fallback to basic stats if analytics fails
      setAnalyticsData({
        overview: {
          totalGoals: goals.length,
          activeGoals: goals.filter((g) => g.status === "active").length,
          completedGoals: goals.filter((g) => g.status === "completed").length,
          averageProgress: 0,
          streak: 0,
          lastUpdate: new Date().toISOString(),
        },
        completionRate: [],
      });
    }
  };

  const loadInsights = async () => {
    try {
      if (!user?.id || goals.length === 0) {
        setInsights([]);
        return;
      }

      const insights = [];
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get recent journal entries for analysis
      const { data: recentEntries, error: entriesError } = await supabase
        .from("journal_entries")
        .select("created_at, goal_ids, mood, energy")
        .eq("user_id", user.id)
        .gte("created_at", oneMonthAgo.toISOString())
        .order("created_at", { ascending: false });

      if (entriesError) {
        console.error("Error loading entries for insights:", entriesError);
        setInsights([]);
        return;
      }

      // Analyze each goal for insights
      for (const goal of goals) {
        try {
          // 1. Check for goal plateau (no mentions in recent entries)
          const goalMentions =
            recentEntries?.filter(
              (entry) => entry.goal_ids && entry.goal_ids.includes(goal.id)
            ) || [];

          const recentMentions = goalMentions.filter(
            (entry) => new Date(entry.created_at) >= twoWeeksAgo
          );

          if (goalMentions.length > 0 && recentMentions.length === 0) {
            insights.push({
              id: `plateau_${goal.id}`,
              type: "plateau_warning",
              title: "Goal Activity Plateau Detected",
              message: `Your "${goal.decryptedTitle}" goal hasn't been mentioned in journal entries for 2+ weeks. Consider reflecting on what might help you re-engage with this goal.`,
              priority: "medium",
              goalId: goal.id,
              date: new Date().toISOString(),
            });
          }

          // 2. Check for positive mood correlation
          if (goalMentions.length >= 3) {
            const moodWithGoal = goalMentions
              .filter((entry) => entry.mood !== null)
              .map((entry) => entry.mood);

            const moodWithoutGoal =
              recentEntries
                ?.filter(
                  (entry) =>
                    entry.mood !== null &&
                    (!entry.goal_ids || !entry.goal_ids.includes(goal.id))
                )
                .map((entry) => entry.mood) || [];

            if (moodWithGoal.length >= 3 && moodWithoutGoal.length >= 3) {
              const avgMoodWith =
                moodWithGoal.reduce((a, b) => a + b, 0) / moodWithGoal.length;
              const avgMoodWithout =
                moodWithoutGoal.reduce((a, b) => a + b, 0) /
                moodWithoutGoal.length;

              const improvement =
                ((avgMoodWith - avgMoodWithout) / avgMoodWithout) * 100;

              if (improvement > 10) {
                insights.push({
                  id: `mood_positive_${goal.id}`,
                  type: "mood_correlation",
                  title: "Positive Mood Correlation",
                  message: `Your mood tends to be ${improvement.toFixed(
                    0
                  )}% higher on days when you work on "${
                    goal.decryptedTitle
                  }". This goal appears to boost your well-being!`,
                  priority: "high",
                  goalId: goal.id,
                  date: new Date().toISOString(),
                });
              }
            }
          }

          // 3. Check for energy correlation
          if (goalMentions.length >= 3) {
            const energyWithGoal = goalMentions
              .filter((entry) => entry.energy !== null)
              .map((entry) => entry.energy);

            const energyWithoutGoal =
              recentEntries
                ?.filter(
                  (entry) =>
                    entry.energy !== null &&
                    (!entry.goal_ids || !entry.goal_ids.includes(goal.id))
                )
                .map((entry) => entry.energy) || [];

            if (energyWithGoal.length >= 3 && energyWithoutGoal.length >= 3) {
              const avgEnergyWith =
                energyWithGoal.reduce((a, b) => a + b, 0) /
                energyWithGoal.length;
              const avgEnergyWithout =
                energyWithoutGoal.reduce((a, b) => a + b, 0) /
                energyWithoutGoal.length;

              const energyChange = avgEnergyWith - avgEnergyWithout;

              if (energyChange > 1) {
                insights.push({
                  id: `energy_boost_${goal.id}`,
                  type: "energy_correlation",
                  title: "Energy Boost Pattern",
                  message: `Working on "${
                    goal.decryptedTitle
                  }" appears to increase your energy levels by ${energyChange.toFixed(
                    1
                  )} points on average. Consider scheduling this goal during lower-energy periods.`,
                  priority: "medium",
                  goalId: goal.id,
                  date: new Date().toISOString(),
                });
              } else if (energyChange < -1) {
                insights.push({
                  id: `energy_drain_${goal.id}`,
                  type: "energy_correlation",
                  title: "Energy Impact Pattern",
                  message: `"${goal.decryptedTitle}" tends to be more challenging on your energy levels. Consider breaking it into smaller steps or scheduling it when you have more energy.`,
                  priority: "medium",
                  goalId: goal.id,
                  date: new Date().toISOString(),
                });
              }
            }
          }

          // 4. Check for milestone completion insights
          try {
            const masterKey = await encryptionService.getStaticMasterKey();
            const dataKey = await encryptionService.decryptKey(
              {
                encryptedData: goal.encrypted_data_key,
                iv: goal.data_key_iv,
              },
              masterKey
            );

            if (goal.encrypted_progress && goal.progress_iv) {
              const progressData = await encryptionService.decryptText(
                goal.encrypted_progress,
                goal.progress_iv,
                dataKey
              );

              const parsed = JSON.parse(progressData);

              if (parsed.milestones) {
                const completed = parsed.milestones.filter(
                  (m) => m.completed
                ).length;
                const total = parsed.milestones.length;
                const completionRate = (completed / total) * 100;

                if (completionRate >= 80 && completionRate < 100) {
                  insights.push({
                    id: `near_completion_${goal.id}`,
                    type: "completion_celebration",
                    title: "Almost There!",
                    message: `You're ${completionRate.toFixed(
                      0
                    )}% complete with "${goal.decryptedTitle}"! Just ${
                      total - completed
                    } milestone${
                      total - completed !== 1 ? "s" : ""
                    } to go. You've got this!`,
                    priority: "high",
                    goalId: goal.id,
                    date: new Date().toISOString(),
                  });
                }
              }
            }
          } catch (progressError) {
            // Skip milestone insights if we can't decrypt progress
            console.warn("Could not analyze progress for goal:", goal.id);
          }
        } catch (goalError) {
          console.warn(
            "Error analyzing goal for insights:",
            goal.id,
            goalError
          );
        }
      }

      // Add general insights if we have enough data
      if (recentEntries && recentEntries.length >= 10) {
        const goalsWithEntries = goals.filter((goal) =>
          recentEntries.some(
            (entry) => entry.goal_ids && entry.goal_ids.includes(goal.id)
          )
        );

        if (goalsWithEntries.length === 0 && goals.length > 0) {
          insights.push({
            id: "general_engagement",
            type: "engagement_suggestion",
            title: "Increase Goal Engagement",
            message:
              "You haven't mentioned any of your goals in recent journal entries. Try reflecting on your progress or challenges with your goals during your next journaling session.",
            priority: "medium",
            goalId: null,
            date: new Date().toISOString(),
          });
        }
      }

      setInsights(insights);
    } catch (error) {
      console.error("Error generating goal insights:", error);
      setInsights([]);
    }
  };

  const loadProgressPatterns = async () => {
    try {
      if (!user?.id || goals.length === 0) {
        setProgressPatterns([]);
        return;
      }

      // Get the last 6 months of data
      const months = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          period: date.toLocaleDateString("en-US", { month: "short" }),
          year: date.getFullYear(),
          month: date.getMonth(),
          completion: 0,
          milestones: 0,
          goalMentions: 0,
          totalEntries: 0,
        });
      }

      // Get journal entries for the last 6 months
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("created_at, goal_ids")
        .eq("user_id", user.id)
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (journalError) {
        console.error(
          "Error loading journal entries for progress patterns:",
          journalError
        );
        setProgressPatterns([]);
        return;
      }

      // Count goal mentions per month
      journalEntries?.forEach((entry) => {
        const entryDate = new Date(entry.created_at);
        const monthIndex = months.findIndex(
          (m) =>
            m.year === entryDate.getFullYear() &&
            m.month === entryDate.getMonth()
        );

        if (monthIndex !== -1) {
          months[monthIndex].totalEntries++;
          if (entry.goal_ids && entry.goal_ids.length > 0) {
            months[monthIndex].goalMentions++;
          }
        }
      });

      // Calculate milestone completion patterns for each month
      for (const goal of goals) {
        try {
          const masterKey = await encryptionService.getStaticMasterKey();
          const dataKey = await encryptionService.decryptKey(
            {
              encryptedData: goal.encrypted_data_key,
              iv: goal.data_key_iv,
            },
            masterKey
          );

          if (goal.encrypted_progress && goal.progress_iv) {
            const progressData = await encryptionService.decryptText(
              goal.encrypted_progress,
              goal.progress_iv,
              dataKey
            );

            const parsed = JSON.parse(progressData);
            let totalMilestones = 0;
            let completedMilestones = 0;

            if (parsed.tiers) {
              // Count milestones across all tiers
              Object.values(parsed.tiers).forEach((tierArray) => {
                totalMilestones += tierArray.length;
                completedMilestones += tierArray.filter(
                  (m) => m.completed
                ).length;
              });
            } else if (parsed.milestones) {
              totalMilestones = parsed.milestones.length;
              completedMilestones = parsed.milestones.filter(
                (m) => m.completed
              ).length;
            }

            // For now, we'll distribute the milestones evenly across months
            // In a real implementation, you might track completion dates
            if (totalMilestones > 0) {
              const milestonesPerMonth = totalMilestones / 6;
              const completionRate =
                (completedMilestones / totalMilestones) * 100;

              months.forEach((month) => {
                month.milestones += Math.round(milestonesPerMonth);
              });

              // Apply completion rate based on goal mentions
              months.forEach((month) => {
                if (month.totalEntries > 0) {
                  const engagementRate =
                    month.goalMentions / month.totalEntries;
                  month.completion += Math.round(
                    completionRate * engagementRate
                  );
                }
              });
            }
          }
        } catch (progressError) {
          console.warn(
            "Error processing progress for goal:",
            goal.id,
            progressError
          );
        }
      }

      // Calculate final completion percentages and normalize
      const patterns = months.map((month) => {
        let finalCompletion = 0;

        if (month.totalEntries > 0) {
          // Base completion on goal engagement rate
          const engagementRate =
            (month.goalMentions / month.totalEntries) * 100;
          finalCompletion = Math.min(100, Math.max(0, engagementRate));
        }

        return {
          period: month.period,
          completion: Math.round(finalCompletion),
          milestones: month.milestones,
          goalMentions: month.goalMentions,
          totalEntries: month.totalEntries,
        };
      });

      setProgressPatterns(patterns);
    } catch (error) {
      console.error("Error loading progress patterns:", error);
      // Fallback to empty data if analysis fails
      setProgressPatterns([]);
    }
  };

  const loadGoalMentions = async () => {
    try {
      if (!user?.id || goals.length === 0) {
        setGoalMentions([]);
        return;
      }

      // Get the last 8 weeks of data
      const weeks = [];
      const now = new Date();

      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        weeks.push({
          week: `W${8 - i}`,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          mentions: 0,
          totalEntries: 0,
          moodSum: 0,
          moodCount: 0,
          sentiment: 0,
        });
      }

      // Get journal entries for the last 8 weeks
      const eightWeeksAgo = new Date(
        now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000
      );
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("created_at, goal_ids, mood, tone")
        .eq("user_id", user.id)
        .gte("created_at", eightWeeksAgo.toISOString())
        .order("created_at", { ascending: true });

      if (journalError) {
        console.error(
          "Error loading journal entries for goal mentions:",
          journalError
        );
        setGoalMentions([]);
        return;
      }

      // Process entries to count mentions per week
      journalEntries?.forEach((entry) => {
        const entryDate = new Date(entry.created_at);

        // Find which week this entry belongs to
        const weekIndex = weeks.findIndex(
          (week) =>
            entryDate >= new Date(week.weekStart) &&
            entryDate <= new Date(week.weekEnd)
        );

        if (weekIndex !== -1) {
          weeks[weekIndex].totalEntries++;

          // Count goal mentions
          if (entry.goal_ids && entry.goal_ids.length > 0) {
            // Check if any of the mentioned goals are in our current goals list
            const hasRelevantGoal = entry.goal_ids.some((goalId) =>
              goals.some((goal) => goal.id === goalId)
            );

            if (hasRelevantGoal) {
              weeks[weekIndex].mentions++;

              // Add mood data for sentiment calculation
              if (entry.mood !== null && entry.mood !== undefined) {
                weeks[weekIndex].moodSum += entry.mood;
                weeks[weekIndex].moodCount++;
              }
            }
          }
        }
      });

      // Calculate sentiment scores
      const mentionsData = weeks.map((week) => {
        let sentiment = 0.5; // Neutral default

        if (week.moodCount > 0) {
          // Convert mood (1-10) to sentiment (0-1)
          const avgMood = week.moodSum / week.moodCount;
          sentiment = Math.max(0, Math.min(1, (avgMood - 1) / 9));
        } else if (week.mentions > 0) {
          // If no mood data but we have mentions, assume slightly positive
          sentiment = 0.6;
        }

        return {
          week: week.week,
          mentions: week.mentions,
          sentiment: Math.round(sentiment * 100) / 100, // Round to 2 decimal places
          totalEntries: week.totalEntries,
          engagementRate:
            week.totalEntries > 0
              ? Math.round((week.mentions / week.totalEntries) * 100) / 100
              : 0,
        };
      });

      setGoalMentions(mentionsData);
    } catch (error) {
      console.error("Error loading goal mentions:", error);
      setGoalMentions([]);
    }
  };

  const loadMoodCorrelations = async () => {
    try {
      if (!user?.id || goals.length === 0) {
        setMoodCorrelations([]);
        return;
      }

      const correlations = [];

      // Get journal entries from the last 3 months for better correlation analysis
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("created_at, goal_ids, mood, energy")
        .eq("user_id", user.id)
        .gte("created_at", threeMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (journalError) {
        console.error(
          "Error loading journal entries for mood correlations:",
          journalError
        );
        setMoodCorrelations([]);
        return;
      }

      // Analyze each goal for mood correlations
      for (const goal of goals) {
        try {
          // Get entries that mention this goal
          const goalEntries =
            journalEntries?.filter(
              (entry) =>
                entry.goal_ids &&
                entry.goal_ids.includes(goal.id) &&
                entry.mood !== null &&
                entry.mood !== undefined
            ) || [];

          // Get entries that don't mention this goal (for comparison)
          const nonGoalEntries =
            journalEntries?.filter(
              (entry) =>
                (!entry.goal_ids || !entry.goal_ids.includes(goal.id)) &&
                entry.mood !== null &&
                entry.mood !== undefined
            ) || [];

          // Need at least 3 data points for meaningful correlation
          if (goalEntries.length >= 3 && nonGoalEntries.length >= 3) {
            // Calculate mood statistics for goal-related entries
            const goalMoods = goalEntries.map((entry) => entry.mood);
            const avgMoodWithGoal =
              goalMoods.reduce((sum, mood) => sum + mood, 0) / goalMoods.length;

            // Calculate mood statistics for non-goal entries
            const nonGoalMoods = nonGoalEntries.map((entry) => entry.mood);
            const avgMoodWithoutGoal =
              nonGoalMoods.reduce((sum, mood) => sum + mood, 0) /
              nonGoalMoods.length;

            // Calculate correlation strength
            // This is a simplified correlation - in a real app you might use Pearson correlation
            const moodDifference = avgMoodWithGoal - avgMoodWithoutGoal;
            const normalizedCorrelation = Math.max(
              -1,
              Math.min(1, moodDifference / 5)
            ); // Normalize to -1 to 1

            // Only include goals with meaningful mood impact (absolute correlation > 0.1)
            if (Math.abs(normalizedCorrelation) > 0.1) {
              // For "before/after" we'll simulate by looking at temporal patterns
              // In a real implementation, you might track mood before/after goal activities
              let moodBefore = avgMoodWithoutGoal;
              let moodAfter = avgMoodWithGoal;

              // If correlation is negative, swap the values to show the pattern
              if (normalizedCorrelation < 0) {
                moodBefore = avgMoodWithGoal + Math.abs(moodDifference);
                moodAfter = avgMoodWithGoal;
              }

              correlations.push({
                goal: goal.decryptedTitle,
                goalId: goal.id,
                moodBefore: Math.round(moodBefore * 10) / 10,
                moodAfter: Math.round(moodAfter * 10) / 10,
                correlation:
                  Math.round(Math.abs(normalizedCorrelation) * 100) / 100,
                impact: normalizedCorrelation > 0 ? "positive" : "negative",
                sampleSize: goalEntries.length,
                avgMoodWithGoal: Math.round(avgMoodWithGoal * 10) / 10,
                avgMoodWithoutGoal: Math.round(avgMoodWithoutGoal * 10) / 10,
              });
            }
          }
        } catch (goalError) {
          console.warn(
            "Error analyzing mood correlation for goal:",
            goal.id,
            goalError
          );
        }
      }

      // Sort by correlation strength (strongest correlations first)
      correlations.sort((a, b) => b.correlation - a.correlation);

      // Limit to top 10 correlations to avoid overwhelming the UI
      setMoodCorrelations(correlations.slice(0, 10));
    } catch (error) {
      console.error("Error loading mood correlations:", error);
      setMoodCorrelations([]);
    }
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

  <div className="mb-6">
    <GoalRecommendations
      onCreateGoal={async (goalData) => {
        // This integrates with your existing goal creation
        // You'll need to adapt this to your actual goal creation function
        console.log("Creating goal from Reflectionarian:", goalData);

        // Example integration - replace with your actual goal creation logic:
        // await createNewGoal({
        //   title: goalData.title,
        //   description: goalData.description,
        //   priority: goalData.priority
        // });

        // For now, just alert - you can wire this up to your actual goal creation
        alert(`Goal "${goalData.title}" would be created here!`);
      }}
    />
  </div>;

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
