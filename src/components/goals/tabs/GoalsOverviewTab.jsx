// frontend/ src/components/goals/tabs/GoalsOverviewTab.jsx
import React from "react";
import {
  Target,
  Edit2,
  Settings,
  Play,
  Pause,
  X,
  Trash2,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const GoalsOverviewTab = ({
  goals,
  selectedGoalId,
  onSelectGoal,
  onEditGoal,
  onEditMilestones,
  onStatusChange,
  onRemoveGoal,
  colors,
}) => {
  // Calculate statistics
  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "active").length,
    completed: goals.filter((g) => g.status === "completed").length,
    paused: goals.filter((g) => g.status === "paused").length,
    overdue: goals.filter(
      (g) =>
        g.status === "active" && g.dueDate && new Date(g.dueDate) < new Date()
    ).length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Goals Overview
        </h3>
        <p className="text-sm text-gray-300">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Goals"
          value={stats.total}
          color={colors.primary}
          icon={Target}
        />
        <StatCard
          title="Active"
          value={stats.active}
          color={colors.success}
          icon={Play}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          color={colors.info}
          icon={CheckCircle2}
        />
        <StatCard
          title="Paused"
          value={stats.paused}
          color={colors.warning}
          icon={Pause}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          color={colors.danger}
          icon={AlertCircle}
        />
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-300 mb-2">
            No Goals Yet
          </h4>
          <p className="text-gray-400">
            Create your first goal to start tracking your progress and unlock
            advanced analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isSelected={selectedGoalId === goal.id}
              onSelect={() => onSelectGoal(goal.id)}
              onEdit={() => onEditGoal(goal)}
              onEditMilestones={() => onEditMilestones(goal)}
              onStatusChange={(status) => onStatusChange(goal.id, status)}
              onRemove={() => onRemoveGoal(goal.id)}
              colors={colors}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Goal Card Component with dark theme
const GoalCard = ({
  goal,
  isSelected,
  onSelect,
  onEdit,
  onEditMilestones,
  onStatusChange,
  onRemove,
  colors,
}) => {
  const progress = goal.progress || 0;
  const milestones = goal.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;

  // Determine badge based on progress
  const badge =
    progress >= 80
      ? "Expert"
      : progress >= 60
      ? "Advanced"
      : progress >= 40
      ? "Intermediate"
      : progress >= 20
      ? "Beginner"
      : "Novice";

  const badgeColor =
    badge === "Expert"
      ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
      : badge === "Advanced"
      ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
      : badge === "Intermediate"
      ? "bg-green-500/20 text-green-300 border-green-400/30"
      : badge === "Beginner"
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
      : "bg-gray-500/20 text-gray-300 border-gray-400/30";

  const statusColor =
    goal.status === "active"
      ? "text-green-400"
      : goal.status === "paused"
      ? "text-yellow-400"
      : goal.status === "completed"
      ? "text-blue-400"
      : "text-red-400";

  const statusBgColor =
    goal.status === "active"
      ? "bg-green-500/10 border-green-400/30"
      : goal.status === "paused"
      ? "bg-yellow-500/10 border-yellow-400/30"
      : goal.status === "completed"
      ? "bg-blue-500/10 border-blue-400/30"
      : "bg-red-500/10 border-red-400/30";

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? "border-purple-500 bg-purple-500/10 shadow-md"
          : "border-white/20 bg-white/10 hover:border-purple-400/50 backdrop-blur-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm leading-tight truncate">
            {goal.decryptedTitle}
          </h4>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full mt-1 border ${badgeColor}`}
          >
            {badge}
          </span>
        </div>

        {/* Actions Dropdown */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-gray-400 hover:text-purple-400 rounded transition-colors"
            title="Edit Goal"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditMilestones();
            }}
            className="p-1 text-gray-400 hover:text-blue-400 rounded transition-colors"
            title="Edit Milestones"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
            title="Remove Goal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-300">Progress</span>
          <span className="text-xs font-medium text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status and Milestones */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full border ${statusBgColor} ${statusColor}`}
        >
          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
        </span>
        {milestones.length > 0 && (
          <span className="text-xs text-gray-300">
            <CheckCircle2 className="inline h-3 w-3 mr-1" />
            {completedMilestones}/{milestones.length} milestones
          </span>
        )}
      </div>

      {/* Due Date */}
      {goal.dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <Calendar className="h-3 w-3" />
          <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        {goal.status === "paused" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("active");
            }}
            className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition border border-green-400/30"
          >
            Resume
          </button>
        )}
        {goal.status === "active" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("paused");
            }}
            className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 transition border border-yellow-400/30"
          >
            Pause
          </button>
        )}
        {goal.status !== "completed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("completed");
            }}
            className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition border border-blue-400/30"
          >
            Complete
          </button>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
    </div>
  </div>
);

export default GoalsOverviewTab;
