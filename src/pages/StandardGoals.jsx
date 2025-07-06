// src/pages/StandardGoals.jsx - Fixed to use backend encryption
import React, { useState, useEffect } from "react";
import {
  Plus,
  Award,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  BookOpen,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AddGoalModal from "../components/AddGoalModal";
import EditGoalModal from "../components/EditGoalModal";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";
import EditMilestonesModal from "../components/EditMilestonesModal";
import GoalTips from "../components/GoalTips";

const TABS = ["Overview", "Progress", "Journal Entries", "Tips"];

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMilestonesModal, setShowEditMilestonesModal] = useState(false);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Load goals from backend
  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/goals?user_id=${user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await response.json();
      setGoals(data.goals || []);

      // Select first goal if none selected
      if (data.goals && data.goals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(data.goals[0].id);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      alert("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS FOR STATUS
  const handleStatusChange = async (goal, newStatus) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: goal.id,
          user_id: user.id,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setGoals((goals) =>
        goals.map((g) => (g.id === goal.id ? { ...g, status: newStatus } : g))
      );
    } catch (err) {
      alert("Failed to update goal status: " + err.message);
    }
  };

  const handleRemoveGoal = async (goal) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this goal? This cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/goals?goal_id=${goal.id}&user_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete goal");

      setGoals((goals) => goals.filter((g) => g.id !== goal.id));
      setSelectedGoalId(null);
    } catch (err) {
      alert("Failed to remove goal: " + err.message);
    }
  };

  // Handler for adding a new goal
  const handleAddGoal = async ({
    title,
    description,
    priority,
    milestones,
    tiers,
  }) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title,
          description,
          priority,
          milestones,
          tiers,
        }),
      });

      if (!response.ok) throw new Error("Failed to save goal");

      const data = await response.json();

      // Reload goals to get the new one
      await loadGoals();

      // Select the new goal
      if (data.goal && data.goal.id) {
        setSelectedGoalId(data.goal.id);
      }

      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal: " + error.message);
    }
  };

  // Handler for editing a goal
  const handleEditGoal = async ({ title, description, priority }) => {
    if (!selectedGoal) return;

    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: selectedGoal.id,
          user_id: user.id,
          title,
          description,
          priority,
        }),
      });

      if (!response.ok) throw new Error("Failed to update goal");

      // Update local state
      setGoals((goals) =>
        goals.map((g) =>
          g.id === selectedGoal.id ? { ...g, title, description, priority } : g
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Failed to update goal: " + error.message);
    }
  };

  // Handler for updating milestones
  const handleUpdateMilestones = async (updatedProgress) => {
    if (!selectedGoal) return;

    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: selectedGoal.id,
          user_id: user.id,
          ...(updatedProgress.tiers
            ? { tiers: updatedProgress.tiers }
            : { milestones: updatedProgress.milestones }),
        }),
      });

      if (!response.ok) throw new Error("Failed to update milestones");

      // Update local state
      setGoals((goals) =>
        goals.map((g) =>
          g.id === selectedGoal.id ? { ...g, progress: updatedProgress } : g
        )
      );
    } catch (error) {
      console.error("Error updating milestones:", error);
      alert("Failed to update milestones: " + error.message);
    }
  };

  // UI Components
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Goals
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No goals yet!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              <PlusCircle className="h-4 w-4" />
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => (
              <GoalSidebarItem
                key={goal.id}
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {selectedGoal ? (
          <>
            {/* Goal Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {selectedGoal.title}
                  </h1>
                  {selectedGoal.description && (
                    <p className="text-gray-300">{selectedGoal.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveGoal(selectedGoal)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Status:</span>
                <select
                  value={selectedGoal.status}
                  onChange={(e) =>
                    handleStatusChange(selectedGoal, e.target.value)
                  }
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/20">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-4 transition ${
                    activeTab === tab
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              {activeTab === "Overview" && <GoalOverview goal={selectedGoal} />}
              {activeTab === "Progress" && (
                <GoalProgress
                  goal={selectedGoal}
                  onUpdateProgress={handleUpdateMilestones}
                  onEditMilestones={() => setShowEditMilestonesModal(true)}
                />
              )}
              {activeTab === "Journal Entries" && (
                <GoalJournalEntries goal={selectedGoal} />
              )}
              {activeTab === "Tips" && <GoalTips goal={selectedGoal} />}
            </div>

            {/* Edit Milestones Modal */}
            {showEditMilestonesModal && (
              <EditMilestonesModal
                goal={selectedGoal}
                onClose={() => setShowEditMilestonesModal(false)}
                onSave={async (updatedProgress) => {
                  await handleUpdateMilestones(updatedProgress);
                  setShowEditMilestonesModal(false);
                }}
              />
            )}
          </>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Loading...
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a goal to see details!
          </div>
        )}
      </main>

      {/* Add Goal Modal */}
      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGoal}
        />
      )}

      {/* Edit Goal Modal */}
      {showEditModal && selectedGoal && (
        <EditGoalModal
          goal={selectedGoal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditGoal}
        />
      )}
    </div>
  );
}

// Sidebar Item Component
function GoalSidebarItem({ goal, isSelected, onClick }) {
  const badge = goal.progress?.tiers ? "Tiered" : "List";
  const badgeColor = badge === "Tiered" ? "bg-purple-600" : "bg-blue-600";

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition ${
        isSelected
          ? "bg-purple-600/30 border border-purple-600/50"
          : "hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">{goal.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-gray-400">
        Status: <span className="capitalize">{goal.status}</span>
      </p>
    </div>
  );
}

// Goal Overview Component
function GoalOverview({ goal }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Goal Details</h3>
        <div className="space-y-2 text-gray-300">
          <p>
            <span className="text-gray-400">Priority:</span>{" "}
            <span className="capitalize">{goal.priority}</span>
          </p>
          <p>
            <span className="text-gray-400">Created:</span>{" "}
            {new Date(goal.created_at).toLocaleDateString()}
          </p>
          <p>
            <span className="text-gray-400">Status:</span>{" "}
            <span className="capitalize">{goal.status}</span>
          </p>
        </div>
      </div>

      {goal.description && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-300">{goal.description}</p>
        </div>
      )}
    </div>
  );
}

// Goal Progress Component
function GoalProgress({ goal, onUpdateProgress, onEditMilestones }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTier, setActiveTier] = useState("Bronze");
  const { width, height } = useWindowSize();

  const progress = goal.progress || {};
  const type = progress.tiers ? "tiered" : progress.milestones ? "list" : null;
  const tiers = progress.tiers || {};
  const milestones = progress.milestones || [];

  const handleToggle = async (index, tier = null) => {
    let updatedProgress;

    if (type === "tiered" && tier) {
      const updatedTiers = { ...tiers };
      updatedTiers[tier] = tiers[tier].map((item, i) => {
        if (i === index) {
          const updated = { ...item, completed: !item.completed };
          if (updated.completed) setShowConfetti(true);
          return updated;
        }
        return item;
      });
      updatedProgress = { tiers: updatedTiers };
    } else if (type === "list") {
      const updatedMilestones = milestones.map((item, i) => {
        if (i === index) {
          const updated = { ...item, completed: !item.completed };
          if (updated.completed) setShowConfetti(true);
          return updated;
        }
        return item;
      });
      updatedProgress = { milestones: updatedMilestones };
    }

    if (updatedProgress) {
      await onUpdateProgress(updatedProgress);
    }
  };

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [showConfetti]);

  if (!type) {
    return (
      <div className="text-gray-400">
        No milestones set for this goal yet.
        <button
          className="ml-2 text-purple-400 hover:text-purple-300"
          onClick={onEditMilestones}
        >
          Add milestones
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <button
          onClick={onEditMilestones}
          className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
      </div>

      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={130}
          recycle={false}
        />
      )}

      {type === "tiered" && (
        <>
          <div className="flex gap-2 mb-4">
            {Object.keys(tiers).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1 rounded font-bold ${
                  activeTier === tier
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {tiers[activeTier] &&
              tiers[activeTier].map((milestone, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!milestone.completed}
                    onChange={() => handleToggle(idx, activeTier)}
                    className="rounded"
                  />
                  <span
                    className={
                      milestone.completed
                        ? "line-through text-gray-400"
                        : "text-gray-300"
                    }
                  >
                    {milestone.label || milestone}
                  </span>
                </label>
              ))}
          </div>
        </>
      )}

      {type === "list" && (
        <div className="space-y-2">
          {milestones.map((milestone, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!milestone.completed}
                onChange={() => handleToggle(idx)}
                className="rounded"
              />
              <span
                className={
                  milestone.completed
                    ? "line-through text-gray-400"
                    : "text-gray-300"
                }
              >
                {milestone.label || milestone}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Goal Journal Entries Component (placeholder)
function GoalJournalEntries({ goal }) {
  return (
    <div className="text-center py-8">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-400">
        Journal entries related to this goal will appear here
      </p>
      <p className="text-sm text-gray-500 mt-2">
        This feature tracks when you mention this goal in your journal entries
      </p>
    </div>
  );
}
