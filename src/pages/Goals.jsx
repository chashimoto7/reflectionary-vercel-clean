// src/pages/Goals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
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
import { useWindowSize } from "@uidotdev/usehooks"; // lightweight window size hook
import EditMilestonesModal from "../components/EditMilestonesModal";
import GoalTips from "../components/GoalTips";

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

  // --- HANDLERS FOR STATUS ---
  const handleStatusChange = async (goal, newStatus) => {
    try {
      const { error } = await supabase
        .from("user_goals")
        .update({ status: newStatus })
        .eq("id", goal.id);
      if (error) throw new Error(error.message);

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
      const { error } = await supabase
        .from("user_goals")
        .delete()
        .eq("id", goal.id);
      if (error) throw new Error(error.message);

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
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.generateDataKey();

      const encTitle = await encryptionService.encryptText(title, dataKey);
      let encDescription = { encryptedData: "", iv: "" };
      if (description && description.trim() !== "") {
        encDescription = await encryptionService.encryptText(
          description,
          dataKey
        );
      }
      const encDataKey = await encryptionService.encryptKey(dataKey, masterKey);

      let encryptedProgress = { encryptedData: "", iv: "" };
      if (tiers || milestones) {
        const progressObj = tiers ? { tiers } : { milestones };
        const progressJson = JSON.stringify(progressObj);
        encryptedProgress = await encryptionService.encryptText(
          progressJson,
          dataKey
        );
      }

      const { error } = await supabase.from("user_goals").insert([
        {
          user_id: user.id,
          encrypted_goal: encTitle.encryptedData,
          goal_iv: encTitle.iv,
          encrypted_description: encDescription.encryptedData,
          description_iv: encDescription.iv,
          encrypted_data_key: encDataKey.encryptedData,
          data_key_iv: encDataKey.iv,
          priority,
          encrypted_progress: encryptedProgress.encryptedData,
          progress_iv: encryptedProgress.iv,
        },
      ]);
      if (error) throw new Error("Failed to save goal: " + error.message);

      setSelectedGoalId(null);
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (fetchError) throw fetchError;

      const masterKeyReload = await encryptionService.getStaticMasterKey();
      const decryptedGoals = await Promise.all(
        data.map(async (goal) => {
          const encryptedDataKey = {
            encryptedData: goal.encrypted_data_key,
            iv: goal.data_key_iv,
          };
          const dataKey = await encryptionService.decryptKey(
            encryptedDataKey,
            masterKeyReload
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
        })
      );
      setGoals(decryptedGoals);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error.message);
      throw error;
    }
  };

  const handleEditGoal = async (updatedGoal) => {
    try {
      const { id, _dataKey, decryptedTitle } = updatedGoal;
      const { priority, description } = updatedGoal;

      let encDescription = { encryptedData: "", iv: "" };
      if (description && description.trim() !== "") {
        encDescription = await encryptionService.encryptText(
          description,
          _dataKey
        );
      }

      const { error } = await supabase
        .from("user_goals")
        .update({
          priority,
          encrypted_description: encDescription.encryptedData,
          description_iv: encDescription.iv,
        })
        .eq("id", id);
      if (error) throw new Error("Could not update goal: " + error.message);

      setGoals((goals) =>
        goals.map((g) =>
          g.id === id
            ? {
                ...g,
                priority,
                decryptedDescription: description,
              }
            : g
        )
      );
    } catch (error) {
      alert(error.message || "Failed to update goal");
      throw error;
    }
  };

  // Fetch & decrypt goals for this user
  useEffect(() => {
    if (!user) return;

    async function fetchGoals() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const masterKey = await encryptionService.getStaticMasterKey();

        const decryptedGoals = await Promise.all(
          data.map(async (goal) => {
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
          })
        );
        setGoals(decryptedGoals);
        setLoading(false);
        if (!selectedGoalId && decryptedGoals.length > 0) {
          setSelectedGoalId(decryptedGoals[0].id);
        }
      } catch (err) {
        setLoading(false);
        alert("Error loading your goals: " + err.message);
      }
    }

    fetchGoals();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-lg mt-6 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#E5E3EA] to-[#D9D6DF] border-r p-6 flex flex-col min-h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-900">Your Goals</h2>
          <button
            className="rounded-full bg-purple-500 hover:bg-purple-600 p-2 text-white"
            title="Add New Goal"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-gray-400 text-center mt-10">
              Loading goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">
              No goals yet.
              <br />
              Click the + to add your first goal!
            </div>
          ) : (
            goals.map((goal) => (
              <GoalSidebarItem
                key={goal.id}
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col bg-white h-full">
        {selectedGoal ? (
          <>
            {/* Tabs */}
            <div className="flex items-center border-b px-8 pt-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-colors ${
                    activeTab === tab
                      ? "bg-white border-b-2 border-purple-500 text-purple-900"
                      : "text-gray-500 hover:text-purple-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
              <div className="flex-1" />
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition"
                onClick={() => setShowEditModal(true)}
                style={{ marginLeft: "1rem" }}
              >
                <Award size={20} className="text-white" />
                Edit Goal
              </button>
            </div>
            {/* Tab Content */}
            <div className="p-8 flex-1 overflow-y-auto">
              {activeTab === "Overview" && (
                <GoalOverview
                  goal={selectedGoal}
                  handleStatusChange={handleStatusChange}
                  handleRemoveGoal={handleRemoveGoal}
                />
              )}
              {activeTab === "Progress" && (
                <GoalProgress
                  goal={selectedGoal}
                  onEditMilestones={() => setShowEditMilestonesModal(true)}
                  refreshGoal={async () => {
                    // Refresh just the selected goal after milestone update
                    const { data, error } = await supabase
                      .from("user_goals")
                      .select("*")
                      .eq("id", selectedGoal.id)
                      .single();
                    if (data) {
                      const masterKey =
                        await encryptionService.getStaticMasterKey();
                      const encryptedDataKey = {
                        encryptedData: data.encrypted_data_key,
                        iv: data.data_key_iv,
                      };
                      const dataKey = await encryptionService.decryptKey(
                        encryptedDataKey,
                        masterKey
                      );
                      const decryptedTitle =
                        await encryptionService.decryptText(
                          data.encrypted_goal,
                          data.goal_iv,
                          dataKey
                        );
                      let decryptedDescription = "";
                      if (data.encrypted_description && data.description_iv) {
                        decryptedDescription =
                          await encryptionService.decryptText(
                            data.encrypted_description,
                            data.description_iv,
                            dataKey
                          );
                      }
                      setGoals((goals) =>
                        goals.map((g) =>
                          g.id === data.id
                            ? {
                                ...data,
                                decryptedTitle,
                                decryptedDescription,
                                _dataKey: dataKey,
                              }
                            : g
                        )
                      );
                    }
                  }}
                />
              )}
              {activeTab === "Journal Entries" && (
                <GoalJournalEntries goal={selectedGoal} />
              )}
              {activeTab === "Tips" && <GoalTips goal={selectedGoal} />}
            </div>
            {showEditMilestonesModal && (
              <EditMilestonesModal
                goal={selectedGoal}
                onClose={() => setShowEditMilestonesModal(false)}
                onSave={async () => {
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

// Sidebar Item
function GoalSidebarItem({ goal, isSelected, onClick }) {
  const badge = goal.tier || "List";
  const badgeColor =
    badge === "Advanced"
      ? "bg-purple-700"
      : badge === "Intermediate"
      ? "bg-purple-400"
      : badge === "Beginner"
      ? "bg-purple-200"
      : "bg-gray-300";

  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition-all border
        ${
          isSelected
            ? "bg-white border-purple-400 shadow font-semibold"
            : "bg-white/60 border-transparent hover:bg-purple-50"
        }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-sm rounded px-2 py-0.5 ${badgeColor} text-white font-bold`}
        >
          {badge}
        </span>
        <span className="text-base">{goal.decryptedTitle}</span>
      </div>
      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
        <span>{goal.mention_count || 0} mentions</span>
        <span>•</span>
        <span>
          Last:{" "}
          {goal.last_mentioned_date
            ? new Date(goal.last_mentioned_date).toLocaleDateString()
            : "—"}
        </span>
      </div>
    </button>
  );
}

// ---- OVERVIEW COMPONENT WITH STATUS BADGE ----
function GoalOverview({ goal, handleStatusChange, handleRemoveGoal }) {
  if (!goal) return null;

  const getPriorityLabel = (priority) => {
    if (!priority) return "N/A";
    switch (priority) {
      case 1:
        return "Lowest";
      case 2:
        return "Low";
      case 3:
        return "Medium";
      case 4:
        return "High";
      case 5:
        return "Highest";
      default:
        return priority;
    }
  };

  let kind = goal.tier
    ? goal.tier
    : goal.tiers
    ? "Tiered"
    : goal.milestones
    ? "Single-list"
    : "Custom";

  const rawStatus = goal.status ? goal.status.toLowerCase() : "active";
  let statusLabel = "Active";
  let statusClass = "bg-green-100 text-green-700";
  if (rawStatus === "paused") {
    statusLabel = "Paused";
    statusClass = "bg-yellow-100 text-yellow-700";
  } else if (rawStatus === "cancelled") {
    statusLabel = "Cancelled";
    statusClass = "bg-red-100 text-red-700";
  }

  const badgeBtn =
    "inline-block rounded-full px-4 py-1 text-sm font-bold shadow cursor-pointer transition-colors";
  const pauseBtn = `${badgeBtn} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
  const cancelBtn = `${badgeBtn} bg-red-100 text-red-700 hover:bg-red-200`;
  const removeBtn = `${badgeBtn} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{goal.decryptedTitle}</h1>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800">
          {kind}
        </span>
        <span className="inline-block rounded-full px-3 py-1 text-xs bg-gray-100 text-gray-600">
          Priority: {goal.priority || 1} ({getPriorityLabel(goal.priority)})
        </span>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="text-gray-700 mb-2">
        {goal.decryptedDescription || <em>(No description yet)</em>}
      </p>
      <div className="mt-1 text-sm text-gray-500">
        Last Mentioned:{" "}
        {goal.last_mentioned_date
          ? new Date(goal.last_mentioned_date).toLocaleDateString()
          : "—"}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Journal Mentions: {goal.mention_count || 0}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Created:{" "}
        {goal.created_at ? new Date(goal.created_at).toLocaleDateString() : "—"}
      </div>
      <div className="flex gap-3 mt-6">
        {rawStatus !== "paused" && (
          <button
            className={pauseBtn}
            onClick={() => handleStatusChange(goal, "paused")}
          >
            Pause
          </button>
        )}
        {rawStatus !== "cancelled" && (
          <button
            className={cancelBtn}
            onClick={() => handleStatusChange(goal, "cancelled")}
          >
            Cancel
          </button>
        )}
        <button className={removeBtn} onClick={() => handleRemoveGoal(goal)}>
          Remove
        </button>
      </div>
    </div>
  );
}

// ---- PROGRESS TAB WITH EDIT MILESTONES BUTTON ----
function GoalProgress({ goal, onEditMilestones, refreshGoal }) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [tiers, setTiers] = useState(null);
  const [activeTier, setActiveTier] = useState("Beginner");
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const encryptedDataKey = {
        encryptedData: goal.encrypted_data_key,
        iv: goal.data_key_iv,
      };
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.decryptKey(
        encryptedDataKey,
        masterKey
      );
      const { type, data } = await parseProgress(goal, dataKey);
      if (ignore) return;
      setType(type);
      if (type === "tiered") {
        setTiers(data);
        setActiveTier(Object.keys(data)[0] || "Beginner");
      } else if (type === "list") {
        setMilestones(data);
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [goal.id, goal.encrypted_progress, goal.progress_iv]);

  function handleToggle(idx, tierName = null) {
    if (type === "list") {
      setMilestones((ms) =>
        ms.map((m, i) => (i === idx ? { ...m, completed: !m.completed } : m))
      );
    } else if (type === "tiered" && tierName) {
      setTiers((ts) => ({
        ...ts,
        [tierName]: ts[tierName].map((m, i) =>
          i === idx ? { ...m, completed: !m.completed } : m
        ),
      }));
    }
  }

  async function saveProgress() {
    setSaving(true);
    try {
      const encryptedDataKey = {
        encryptedData: goal.encrypted_data_key,
        iv: goal.data_key_iv,
      };
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.decryptKey(
        encryptedDataKey,
        masterKey
      );

      let payload, plaintext;
      if (type === "tiered") {
        plaintext = JSON.stringify({ tiers });
      } else if (type === "list") {
        plaintext = JSON.stringify({ milestones });
      }
      payload = await encryptionService.encryptText(plaintext, dataKey);

      const { error } = await supabase
        .from("user_goals")
        .update({
          encrypted_progress: payload.encryptedData,
          progress_iv: payload.iv,
        })
        .eq("id", goal.id);
      if (error) throw new Error("Could not save progress: " + error.message);

      let allComplete = false;
      if (type === "tiered") {
        allComplete = Object.values(tiers).every(
          (tierArr) => tierArr.length > 0 && tierArr.every((m) => m.completed)
        );
        const currentTierArr = tiers[activeTier];
        if (currentTierArr && currentTierArr.every((m) => m.completed)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4500);
        }
      } else if (type === "list") {
        allComplete =
          milestones.length > 0 && milestones.every((m) => m.completed);
        if (allComplete) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4500);
        }
      }

      setSaving(false);
      if (refreshGoal) refreshGoal();
    } catch (err) {
      setSaving(false);
      alert(err.message || "Failed to save.");
    }
  }

  // Capsule style for Edit Milestones button
  const editMilestonesBtn =
    "inline-block rounded-full px-4 py-1 text-sm font-bold shadow cursor-pointer transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200 ml-2";

  if (loading) return <div className="text-gray-400">Loading progress...</div>;
  if (!type)
    return (
      <div className="text-gray-400">
        No milestones set for this goal yet.
        <button className={editMilestonesBtn} onClick={onEditMilestones}>
          <Edit2 size={16} className="inline mb-0.5 mr-1" /> Edit Milestones
        </button>
      </div>
    );

  return (
    <div className="relative">
      <div className="flex items-center mb-3">
        <h3 className="font-bold mr-2">Milestones</h3>
        <button className={editMilestonesBtn} onClick={onEditMilestones}>
          <Edit2 size={16} className="inline mb-0.5 mr-1" /> Edit Milestones
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
                    ? "bg-purple-600 text-white shadow"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="space-y-2 mb-6">
            {tiers[activeTier] && tiers[activeTier].length === 0 && (
              <div className="text-gray-400 text-sm">
                No milestones yet for this tier.
              </div>
            )}
            {tiers[activeTier] &&
              tiers[activeTier].map((milestone, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!milestone.completed}
                    onChange={() => handleToggle(idx, activeTier)}
                  />
                  <span
                    className={`${
                      milestone.completed
                        ? "line-through text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {milestone.label || milestone}
                  </span>
                </label>
              ))}
          </div>
        </>
      )}
      {type === "list" && (
        <div className="space-y-2 mb-6">
          {milestones.length === 0 && (
            <div className="text-gray-400 text-sm">
              No milestones yet for this goal.
            </div>
          )}
          {milestones.map((milestone, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!milestone.completed}
                onChange={() => handleToggle(idx)}
              />
              <span
                className={`${
                  milestone.completed
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {milestone.label || milestone}
              </span>
            </label>
          ))}
        </div>
      )}
      <button
        onClick={saveProgress}
        className="px-5 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition disabled:opacity-60"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Progress"}
      </button>
    </div>
  );
}

function GoalJournalEntries({ goal }) {
  console.log(
    "🚀 NEW GoalJournalEntries component started!",
    goal?.decryptedTitle
  );
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (goal && user) {
      loadEntries();
    }
  }, [goal?.id, user, page]);

  const loadEntries = async () => {
    if (!goal || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Search for entries that mention this goal
      // We'll search in the decrypted content for the goal title
      const { data: allEntries, error: fetchError } = await supabase
        .from("journal_entries")
        .select(
          `
          id,
          created_at,
          is_followup,
          parent_entry_id,
          encrypted_data_key,
          data_key_iv,
          encrypted_content,
          content_iv,
          encrypted_prompt,
          prompt_iv,
          mood,
          energy,
          tone,
          emotions,
          topics,
          goal_ids
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50); // Get last 50 entries to search through

      if (fetchError) throw fetchError;

      // Decrypt and filter entries that mention this goal
      const masterKey = await encryptionService.getStaticMasterKey();
      const goalMentionEntries = [];

      for (const entry of allEntries || []) {
        try {
          const dataKey = await encryptionService.decryptKey(
            {
              encryptedData: entry.encrypted_data_key,
              iv: entry.data_key_iv,
            },
            masterKey
          );

          const decryptedContent = await encryptionService.decryptText(
            entry.encrypted_content,
            entry.content_iv,
            dataKey
          );

          let decryptedPrompt = null;
          if (entry.encrypted_prompt && entry.prompt_iv) {
            decryptedPrompt = await encryptionService.decryptText(
              entry.encrypted_prompt,
              entry.prompt_iv,
              dataKey
            );
          }

          // Check if this entry mentions the goal (case insensitive)
          const goalTitle = goal.decryptedTitle.toLowerCase();
          const contentLower = decryptedContent.toLowerCase();
          const promptLower = (decryptedPrompt || "").toLowerCase();

          const mentionsGoal =
            contentLower.includes(goalTitle) ||
            promptLower.includes(goalTitle) ||
            (entry.goal_ids && entry.goal_ids.includes(goal.id));

          if (mentionsGoal) {
            // Get follow-ups for this entry if it's a parent
            let followUps = [];
            if (!entry.is_followup) {
              const { data: followupEntries } = await supabase
                .from("journal_entries")
                .select("*")
                .eq("parent_entry_id", entry.id)
                .order("created_at", { ascending: true });

              // Decrypt follow-ups
              if (followupEntries) {
                for (const followup of followupEntries) {
                  try {
                    const fDataKey = await encryptionService.decryptKey(
                      {
                        encryptedData: followup.encrypted_data_key,
                        iv: followup.data_key_iv,
                      },
                      masterKey
                    );

                    const fContent = await encryptionService.decryptText(
                      followup.encrypted_content,
                      followup.content_iv,
                      fDataKey
                    );

                    let fPrompt = null;
                    if (followup.encrypted_prompt && followup.prompt_iv) {
                      fPrompt = await encryptionService.decryptText(
                        followup.encrypted_prompt,
                        followup.prompt_iv,
                        fDataKey
                      );
                    }

                    followUps.push({
                      ...followup,
                      content: fContent,
                      html_content: fContent,
                      prompt: fPrompt,
                    });
                  } catch (err) {
                    console.warn("Failed to decrypt follow-up:", err);
                  }
                }
              }
            }

            goalMentionEntries.push({
              ...entry,
              content: decryptedContent,
              html_content: decryptedContent,
              prompt: decryptedPrompt,
              follow_ups: followUps,
            });
          }
        } catch (err) {
          console.warn("Failed to decrypt entry:", entry.id, err);
        }
      }

      setEntries(goalMentionEntries);
      setHasMore(false); // For now, we're loading all at once
    } catch (err) {
      console.error("Failed to load goal entries:", err);
      setError("Failed to load journal entries for this goal.");
    } finally {
      setLoading(false);
    }
  };

  const renderFollowUps = (followUps, level = 1) => {
    return followUps.map((f) => (
      <div
        key={f.id}
        className={`pl-${
          level * 4
        } mt-4 border-l-2 border-purple-200 ml-2 space-y-2`}
      >
        <p className="text-sm text-gray-500">
          {new Date(f.created_at).toLocaleString()}
        </p>
        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
          Follow-up response
        </p>
        {f.prompt && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 italic">
              <strong>Prompt:</strong> {f.prompt}
            </p>
          </div>
        )}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: f.html_content || `<p>${f.content}</p>`,
          }}
        />
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span>Loading journal entries about this goal...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadEntries}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No Journal Entries Yet
          </h4>
          <p className="text-gray-600 mb-4">
            You haven't written any journal entries that mention this goal yet.
            Start journaling about "{goal.decryptedTitle}" to see your entries
            here!
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> When journaling, mention your goal by
              name or write about related experiences, challenges, and progress.
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Add this RIGHT AFTER the closing brace of: if (entries.length === 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Journal Entries About This Goal
        </h3>
        <div className="text-sm text-gray-500">
          {entries.length} {entries.length === 1 ? "entry" : "entries"} found
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border border-gray-200 p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            {/* Entry Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleString()}
              </p>
              <div className="flex items-center gap-3 text-xs">
                {entry.mood && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    Mood: {entry.mood}/10
                  </span>
                )}
                {entry.energy && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Energy: {entry.energy}/10
                  </span>
                )}
                {entry.tone && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                    {entry.tone}
                  </span>
                )}
              </div>
            </div>

            {/* Prompt */}
            {entry.prompt && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-700">
                  <strong>Prompt:</strong> {entry.prompt}
                </p>
              </div>
            )}

            {/* Entry Content */}
            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-2">Journal Entry:</p>
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: entry.html_content || `<p>${entry.content}</p>`,
                }}
              />
            </div>

            {/* Emotions & Topics */}
            {(entry.emotions?.length > 0 || entry.topics?.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.emotions?.map((emotion, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                  >
                    😊 {emotion}
                  </span>
                ))}
                {entry.topics?.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    🏷️ {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Follow-ups */}
            {entry.follow_ups?.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">
                  Follow-up Responses:
                </p>
                {renderFollowUps(entry.follow_ups)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button (for future pagination) */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Entries"}
          </button>
        </div>
      )}
    </div>
  );
} // <- This closing brace ends the GoalJournalEntries function
