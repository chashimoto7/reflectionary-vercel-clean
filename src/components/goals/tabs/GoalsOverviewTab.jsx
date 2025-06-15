// src/components/goals/tabs/GoalsOverviewTab.jsx
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
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Goals Overview
        </h3>
        <p className="text-sm text-gray-600">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            No Goals Yet
          </h4>
          <p className="text-gray-500">
            Create your first goal to start tracking your progress and unlock
            advanced analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isSelected={goal.id === selectedGoalId}
              onSelect={() => onSelectGoal(goal.id)}
              onEdit={() => onEditGoal(goal)}
              onEditMilestones={() => onEditMilestones(goal)}
              onStatusChange={(newStatus) => onStatusChange(goal, newStatus)}
              onRemove={() => onRemoveGoal(goal)}
              colors={colors}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {goals.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Active Goals"
            value={goals.filter((g) => g.status === "active").length}
            color={colors.accent}
            icon={Play}
          />
          <StatCard
            title="Completed Goals"
            value={goals.filter((g) => g.status === "completed").length}
            color={colors.secondary}
            icon={Award}
          />
          <StatCard
            title="Paused Goals"
            value={goals.filter((g) => g.status === "paused").length}
            color={colors.warning}
            icon={Pause}
          />
          <StatCard
            title="Total Progress"
            value="67%" // Mock average progress
            color={colors.primary}
            icon={Target}
          />
        </div>
      )}
    </div>
  );
};

// Goal Card Component
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

  const statusBgColor =
    goal.status === "active"
      ? "bg-green-50 border-green-200"
      : goal.status === "paused"
      ? "bg-yellow-50 border-yellow-200"
      : goal.status === "completed"
      ? "bg-blue-50 border-blue-200"
      : "bg-red-50 border-red-200";

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "border-purple-500 bg-purple-50 shadow-md"
          : `border-gray-200 bg-white hover:border-purple-200`
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {goal.decryptedTitle}
          </h4>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${badgeColor}`}
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
            className="p-1 text-gray-400 hover:text-purple-600 rounded"
            title="Edit Goal"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditMilestones();
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="Edit Milestones"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Remove Goal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {goal.decryptedDescription && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {goal.decryptedDescription}
        </p>
      )}

      {/* Status and Priority */}
      <div
        className={`flex items-center justify-between text-xs p-2 rounded ${statusBgColor}`}
      >
        <span className={`font-medium ${statusColor}`}>
          {goal.status?.charAt(0).toUpperCase() + goal.status?.slice(1) ||
            "Active"}
        </span>
        <span className="text-gray-600">Priority {goal.priority || "—"}</span>
      </div>

      {/* Last Mentioned */}
      {goal.last_mentioned_date && (
        <div className="mt-2 text-xs text-gray-500">
          Last mentioned:{" "}
          {new Date(goal.last_mentioned_date).toLocaleDateString()}
        </div>
      )}

      {/* Mention Count */}
      <div className="mt-1 text-xs text-gray-500">
        Journal mentions: {goal.mention_count || 0}
      </div>

      {/* Status Change Buttons */}
      <div className="mt-3 flex gap-1">
        {goal.status !== "active" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("active");
            }}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
          >
            Activate
          </button>
        )}
        {goal.status !== "paused" && goal.status === "active" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("paused");
            }}
            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
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
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Complete
          </button>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
    </div>
  </div>
);

export default GoalsOverviewTab;
