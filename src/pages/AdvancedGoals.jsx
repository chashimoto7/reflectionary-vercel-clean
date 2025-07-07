// frontend/ src/pages/AdvancedGoals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Circle,
  BarChart3,
  Hash,
  Clock,
  Award,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
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
} from "recharts";

const AdvancedGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mentionData, setMentionData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);

  const colors = {
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    accent: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (user) {
      loadGoals();
      loadMentionData();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMentionData = async () => {
    try {
      // Load mention analytics from batch job results
      const { data, error } = await supabase
        .from("goal_analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", subMonths(new Date(), 3).toISOString());

      if (error) throw error;

      // Process mention data by goal and time period
      const mentions = {};
      data?.forEach((record) => {
        if (!mentions[record.goal_id]) {
          mentions[record.goal_id] = {
            week: 0,
            month: 0,
            threeMonths: 0,
          };
        }

        const recordDate = new Date(record.mention_date);
        const now = new Date();

        if (isAfter(recordDate, subDays(now, 7))) {
          mentions[record.goal_id].week += record.mention_count || 0;
        }
        if (isAfter(recordDate, subMonths(now, 1))) {
          mentions[record.goal_id].month += record.mention_count || 0;
        }
        mentions[record.goal_id].threeMonths += record.mention_count || 0;
      });

      setMentionData(mentions);
    } catch (error) {
      console.error("Error loading mention data:", error);
    }
  };

  const calculateProgress = (goal) => {
    // Simple progress calculation based on milestones
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter((m) => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const getGoalStatus = (goal) => {
    const progress = calculateProgress(goal);
    if (progress === 100)
      return { label: "Completed", color: "text-green-600" };
    if (progress > 50) return { label: "On Track", color: "text-blue-600" };
    if (progress > 0) return { label: "Started", color: "text-yellow-600" };
    return { label: "Not Started", color: "text-gray-600" };
  };

  const MetricBox = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    onClick,
  }) => (
    <div
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-6 w-6 text-purple-600" />
        {trend && (
          <span
            className={`text-sm ${
              trend > 0 ? "text-green-600" : "text-gray-600"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
      <div className="text-xs text-purple-600 mt-2">Click for details</div>
    </div>
  );

  const GoalCard = ({ goal }) => {
    const progress = calculateProgress(goal);
    const status = getGoalStatus(goal);
    const mentions = mentionData[goal.id] || {
      week: 0,
      month: 0,
      threeMonths: 0,
    };

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
            <span
              className={`inline-flex items-center gap-1 mt-2 text-sm ${status.color}`}
            >
              <Circle className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Edit2 className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Trash2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mention Tracking */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Mention Tracking
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {mentions.week}
              </div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {mentions.month}
              </div>
              <div className="text-xs text-gray-600">This Month</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {mentions.threeMonths}
              </div>
              <div className="text-xs text-gray-600">3 Months</div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Milestones
              </span>
              <span className="text-sm text-gray-600">
                {goal.milestones.filter((m) => m.completed).length}/
                {goal.milestones.length}
              </span>
            </div>
            {goal.milestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="flex items-center gap-2">
                {milestone.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span
                  className={`text-sm ${
                    milestone.completed
                      ? "text-gray-700 line-through"
                      : "text-gray-700"
                  }`}
                >
                  {milestone.title}
                </span>
              </div>
            ))}
            {goal.milestones.length > 3 && (
              <button
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                onClick={() => setSelectedGoal(goal)}
              >
                View all milestones
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Target Date */}
        {goal.target_date && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </div>
    );
  };

  const OverviewMetrics = () => {
    const activeGoals = goals.filter(
      (g) => getGoalStatus(g).label !== "Completed"
    ).length;
    const completedGoals = goals.filter(
      (g) => getGoalStatus(g).label === "Completed"
    ).length;
    const totalMentions = Object.values(mentionData).reduce(
      (sum, m) => sum + m.month,
      0
    );
    const avgProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + calculateProgress(g), 0) /
              goals.length
          )
        : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricBox
          title="Active Goals"
          value={activeGoals}
          subtitle="Currently pursuing"
          icon={Target}
          onClick={() => setSelectedMetric("active-goals")}
        />
        <MetricBox
          title="Completed"
          value={completedGoals}
          subtitle="Goals achieved"
          icon={CheckCircle}
          onClick={() => setSelectedMetric("completed-goals")}
        />
        <MetricBox
          title="Monthly Mentions"
          value={totalMentions}
          subtitle="Total goal mentions"
          icon={Hash}
          trend={10} // Simulated trend
          onClick={() => setSelectedMetric("mentions")}
        />
        <MetricBox
          title="Avg Progress"
          value={`${avgProgress}%`}
          subtitle="Overall completion"
          icon={TrendingUp}
          onClick={() => setSelectedMetric("progress")}
        />
      </div>
    );
  };

  // Metric Detail Modal
  const MetricDetailModal = () => {
    if (!selectedMetric) return null;

    const getModalContent = () => {
      switch (selectedMetric) {
        case "active-goals":
          return {
            title: "Active Goals",
            content: (
              <div>
                <p className="text-gray-600 mb-4">
                  You have{" "}
                  {
                    goals.filter((g) => getGoalStatus(g).label !== "Completed")
                      .length
                  }{" "}
                  active goals. Focus on making consistent progress across all
                  areas.
                </p>
                <div className="space-y-2">
                  {goals
                    .filter((g) => getGoalStatus(g).label !== "Completed")
                    .map((goal) => (
                      <div
                        key={goal.id}
                        className="flex justify-between items-center"
                      >
                        <span>{goal.title}</span>
                        <span className="text-sm text-gray-600">
                          {calculateProgress(goal)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ),
          };
        case "mentions":
          return {
            title: "Goal Mention Frequency",
            content: (
              <div>
                <p className="text-gray-600 mb-4">
                  How often you write about your goals in journal entries:
                </p>
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const mentions = mentionData[goal.id] || {
                      week: 0,
                      month: 0,
                      threeMonths: 0,
                    };
                    return (
                      <div key={goal.id} className="border-b pb-2">
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm text-gray-600">
                          Week: {mentions.week} | Month: {mentions.month} | 3
                          Months: {mentions.threeMonths}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          };
        default:
          return {
            title: "Goal Details",
            content: (
              <p className="text-gray-600">No additional details available.</p>
            ),
          };
      }
    };

    const { title, content } = getModalContent();

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setSelectedMetric(null)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          {content}
          <button
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full"
            onClick={() => setSelectedMetric(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Goal Detail Modal
  const GoalDetailModal = () => {
    if (!selectedGoal) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setSelectedGoal(null)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4">{selectedGoal.title}</h3>
          <p className="text-gray-600 mb-6">{selectedGoal.description}</p>

          {/* All Milestones */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">All Milestones</h4>
            <div className="space-y-2">
              {selectedGoal.milestones?.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      milestone.completed ? "line-through text-gray-500" : ""
                    }
                  >
                    {milestone.title}
                  </span>
                  {milestone.completed && milestone.completed_date && (
                    <span className="text-sm text-gray-500 ml-auto">
                      {format(new Date(milestone.completed_date), "MMM d")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mention History Chart */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Mention History</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                You've mentioned this goal{" "}
                {mentionData[selectedGoal.id]?.month || 0} times this month.
              </p>
            </div>
          </div>

          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full"
            onClick={() => setSelectedGoal(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Add Goal Modal
  const AddGoalModal = () => {
    const [newGoal, setNewGoal] = useState({
      title: "",
      description: "",
      target_date: "",
      milestones: [],
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Add goal logic here
      setShowAddGoal(false);
    };

    if (!showAddGoal) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowAddGoal(false)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4">Add New Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Advanced Goals
            </h1>
            <p className="text-gray-600">
              Track progress and mentions for your personal goals
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Goal
          </button>
        </div>

        {/* Overview Metrics */}
        <OverviewMetrics />

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Goals Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first goal to track your progress
            </p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {/* Modals */}
        <AddGoalModal />
        <GoalDetailModal />
        <MetricDetailModal />
      </div>
    </div>
  );
};

export default AdvancedGoals;
