// src/pages/Goals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
import { Plus, Award } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AddGoalModal from "../components/AddGoalModal";
import EditGoalModal from "../components/EditGoalModal";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks"; // lightweight window size hook

// Helper: Parse decrypted milestones/tier data
function parseProgress(goal, dataKey) {
  try {
    if (!goal.encrypted_progress || !goal.progress_iv)
      return { type: null, data: null };
    // Decrypt progress JSON
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

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Fetch & decrypt goals for this user
  useEffect(() => {
    if (!user) return;

    async function fetchGoals() {
      setLoading(true);
      try {
        // 1. Fetch raw goal rows
        const { data, error } = await supabase
          .from("user_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // 2. Load master key for decryption
        const masterKey = await encryptionService.getStaticMasterKey();

        // 3. Decrypt each goal (title and description)
        const decryptedGoals = await Promise.all(
          data.map(async (goal) => {
            // Decrypt data key for this goal
            const encryptedDataKey = {
              encryptedData: goal.encrypted_data_key,
              iv: goal.data_key_iv,
            };
            const dataKey = await encryptionService.decryptKey(
              encryptedDataKey,
              masterKey
            );
            // Decrypt goal text
            const decryptedTitle = await encryptionService.decryptText(
              goal.encrypted_goal,
              goal.goal_iv,
              dataKey
            );
            // Decrypt description if available
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
              _dataKey: dataKey, // Keep for editing
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

  // Auto-select first goal when goals are loaded
  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

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

      // Encrypt milestones/tiered progress as JSON if provided
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

      // Reload goals (same as before)
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

  // Handler for editing/updating a goal (priority, description)
  const handleEditGoal = async (updatedGoal) => {
    try {
      const { id, _dataKey, decryptedTitle } = updatedGoal;
      const { priority, description } = updatedGoal;

      // Encrypt updated fields
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

      // Update in local state for immediate feedback
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
              {/* Edit Goal */}
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
              {activeTab === "Overview" && <GoalOverview goal={selectedGoal} />}
              {activeTab === "Progress" && <GoalProgress goal={selectedGoal} />}
              {activeTab === "Journal Entries" && (
                <GoalJournalEntries goal={selectedGoal} />
              )}
              {activeTab === "Tips" && <GoalTips goal={selectedGoal} />}
            </div>
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

function GoalProgress({ goal }) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(null); // "tiered" or "list"
  const [milestones, setMilestones] = useState(null); // for single-list
  const [tiers, setTiers] = useState(null); // for tiered
  const [activeTier, setActiveTier] = useState("Beginner");
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  function normalizeMilestone(m) {
    if (typeof m === "string") return { label: m, completed: false };
    if (m && typeof m === "object") {
      return {
        label: m.label || "",
        completed: !!m.completed,
      };
    }
    return { label: "", completed: false };
  }

  // Load and decrypt progress data
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

  // Handle checkbox toggle
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

  // Save progress to Supabase
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

      // Prepare encrypted payload
      let payload, plaintext;
      if (type === "tiered") {
        plaintext = JSON.stringify({ tiers });
      } else if (type === "list") {
        plaintext = JSON.stringify({ milestones });
      }
      payload = await encryptionService.encryptText(plaintext, dataKey);

      // Update Supabase
      const { error } = await supabase
        .from("user_goals")
        .update({
          encrypted_progress: payload.encryptedData,
          progress_iv: payload.iv,
        })
        .eq("id", goal.id);
      if (error) throw new Error("Could not save progress: " + error.message);

      // Confetti if tier or goal completed
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
    } catch (err) {
      setSaving(false);
      alert(err.message || "Failed to save.");
    }
  }

  // Render
  if (loading) return <div className="text-gray-400">Loading progress...</div>;
  if (!type)
    return (
      <div className="text-gray-400">No milestones set for this goal yet.</div>
    );

  return (
    <div className="relative">
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
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  useEffect(() => {
    if (!goal || !user) return;

    async function fetchGoalEntries() {
      setLoading(true);

      try {
        // 1. Fetch all journal entries that reference this goal
        // Update this query if your schema is different!
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          // This assumes an array column; adjust if you use a single goal_id or string match
          .contains("goal_ids", [goal.id])
          .order("created_at", { ascending: false });

        if (error) throw error;

        // 2. Decrypt each entry and their follow-ups
        const masterKey = await encryptionService.getStaticMasterKey();
        const entriesWithDecryptedData = await Promise.all(
          data.map(async (entry) => {
            const dataKey = await encryptionService.decryptKey(
              {
                encryptedData: entry.encrypted_data_key,
                iv: entry.data_key_iv,
              },
              masterKey
            );
            const content = await encryptionService.decryptText(
              entry.encrypted_content,
              entry.content_iv,
              dataKey
            );
            let prompt = "";
            if (entry.encrypted_prompt && entry.prompt_iv) {
              prompt = await encryptionService.decryptText(
                entry.encrypted_prompt,
                entry.prompt_iv,
                dataKey
              );
            }

            // Fetch and decrypt follow-ups for this entry (recursive)
            const { data: followups } = await supabase
              .from("journal_entries")
              .select("*")
              .eq("is_followup", true)
              .eq("parent_entry_id", entry.id)
              .eq("user_id", user.id);

            async function decryptFollowUps(entries, parentId, level = 1) {
              const filtered = (entries || []).filter(
                (f) => f.parent_entry_id === parentId
              );
              return Promise.all(
                filtered.map(async (f) => {
                  const fDataKey = await encryptionService.decryptKey(
                    { encryptedData: f.encrypted_data_key, iv: f.data_key_iv },
                    masterKey
                  );
                  const fContent = await encryptionService.decryptText(
                    f.encrypted_content,
                    f.content_iv,
                    fDataKey
                  );
                  let fPrompt = "";
                  if (f.encrypted_prompt && f.prompt_iv) {
                    fPrompt = await encryptionService.decryptText(
                      f.encrypted_prompt,
                      f.prompt_iv,
                      fDataKey
                    );
                  }
                  const nested = await decryptFollowUps(
                    entries,
                    f.id,
                    level + 1
                  );
                  return {
                    ...f,
                    content: fContent,
                    prompt: fPrompt,
                    follow_ups: nested,
                  };
                })
              );
            }

            const followUps = await decryptFollowUps(followups, entry.id);

            return {
              ...entry,
              content,
              prompt,
              follow_ups: followUps,
            };
          })
        );

        setEntries(entriesWithDecryptedData);
      } catch (err) {
        alert("Error loading journal entries: " + err.message);
        setEntries([]);
      }
      setLoading(false);
    }

    fetchGoalEntries();
  }, [goal, user]);

  // Render helper for follow-ups
  const renderFollowUps = (followUps, level = 1) =>
    followUps.map((f) => (
      <div
        key={f.id}
        className={`pl-${
          level * 4
        } mt-4 border-l-2 border-gray-200 ml-2 space-y-2`}
      >
        <p className="text-xs text-gray-500">
          {new Date(f.created_at).toLocaleString()}
        </p>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Follow-up response
        </p>
        {f.prompt && (
          <p className="text-base text-purple-600 italic mb-1">
            Prompt: {f.prompt}
          </p>
        )}
        <div
          className="text-base"
          dangerouslySetInnerHTML={{ __html: f.content }}
        />
        {f.follow_ups?.length > 0 && renderFollowUps(f.follow_ups, level + 1)}
      </div>
    ));

  if (loading) return <div>Loading journal entries…</div>;
  if (entries.length === 0)
    return <div>No journal entries found for this goal.</div>;

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="border p-4 rounded-xl bg-gray-50 shadow-md"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(entry.created_at).toLocaleString()}
              </p>
              {entry.prompt && (
                <p className="text-base text-purple-600 italic mb-1">
                  Prompt: {entry.prompt}
                </p>
              )}
              <div className="text-base font-medium mb-1">
                {entry.content.slice(0, 80)}…
              </div>
            </div>
            <button
              className="ml-4 text-sm text-purple-700 underline"
              onClick={() =>
                setExpandedEntryId(
                  expandedEntryId === entry.id ? null : entry.id
                )
              }
            >
              {expandedEntryId === entry.id ? "Hide" : "Expand"}
            </button>
          </div>
          {expandedEntryId === entry.id && (
            <div className="mt-2">
              <div
                className="text-base leading-relaxed mb-2"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
              {entry.follow_ups?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Follow-up responses:
                  </p>
                  {renderFollowUps(entry.follow_ups)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GoalTips({ goal }) {
  return <div>Tips for: {goal?.decryptedTitle}</div>;
}

// Add this inside your main Goals component (not inside GoalOverview)
const handleStatusChange = async (goal, newStatus) => {
  try {
    const { error } = await supabase
      .from("user_goals")
      .update({ status: newStatus })
      .eq("id", goal.id);
    if (error) throw new Error(error.message);

    // Update the goal in local state for instant feedback
    setGoals((goals) =>
      goals.map((g) => (g.id === goal.id ? { ...g, status: newStatus } : g))
    );
    // Optionally: Show a toast/snackbar for feedback
  } catch (err) {
    alert("Failed to update goal status: " + err.message);
  }
};

const handleRemoveGoal = async (goal) => {
  // Optional: Confirm before removing
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

    // Remove from local state
    setGoals((goals) => goals.filter((g) => g.id !== goal.id));
    setSelectedGoalId(null);
    // Optionally: Show a toast/snackbar for feedback
  } catch (err) {
    alert("Failed to remove goal: " + err.message);
  }
};

function GoalOverview({ goal }) {
  if (!goal) return null;

  // Nice badge for priority
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

  // Show if it is tiered or list
  let kind = goal.tier
    ? goal.tier
    : goal.tiers
    ? "Tiered"
    : goal.milestones
    ? "Single-list"
    : "Custom";

  // Status badge (placeholder for now, e.g., 'Active', 'Completed')
  const status = goal.status
    ? goal.status.charAt(0).toUpperCase() + goal.status.slice(1)
    : "Active";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{goal.decryptedTitle}</h1>
      {/* ...other badges... */}
      <div className="mt-1 text-sm text-gray-500">
        Journal Mentions: {goal.mention_count || 0}
      </div>
      {/* --- New Action Buttons --- */}
      <div className="flex gap-3 mt-6">
        {goal.status !== "paused" && (
          <button
            className="px-4 py-2 rounded bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200"
            onClick={() => handleStatusChange(goal, "paused")}
          >
            Pause
          </button>
        )}
        {goal.status !== "cancelled" && (
          <button
            className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
            onClick={() => handleStatusChange(goal, "cancelled")}
          >
            Cancel
          </button>
        )}
        <button
          className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
          onClick={() => handleRemoveGoal(goal)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
