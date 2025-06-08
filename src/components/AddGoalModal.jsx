// src/components/AddGoalModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

// MVP: List of predefined Reflectionary goals (expand as needed)
const PREDEFINED_GOALS = [
  {
    emoji: "🏅",
    title: "Build Confidence",
    description: "Feel more self-assured at work and in social situations.",
    priority: 4,
    tiers: {
      Beginner: [
        "Speak up once in a meeting or group",
        "Share my opinion with a friend or colleague",
        "Set one healthy boundary",
      ],
      Intermediate: [
        "Initiate a new project or idea",
        "Ask for feedback at work",
        "Assert myself in a group discussion",
      ],
      Advanced: [
        "Lead a team meeting or presentation",
        "Coach or mentor someone else",
        "Tackle a major fear (public speaking, etc.)",
      ],
    },
  },
  {
    emoji: "🌿",
    title: "Manage Anxiety",
    description: "Reduce anxiety and increase calm through small steps.",
    priority: 5,
    tiers: {
      Beginner: [
        "Try a 5-minute breathing exercise",
        "Journal my anxious thoughts",
        "Limit caffeine for a day",
      ],
      Intermediate: [
        "Practice mindfulness twice in a week",
        "Challenge an anxious thought pattern",
        "Share my anxiety with someone I trust",
      ],
      Advanced: [
        "Attend a group or therapy session",
        "Guide a friend through a calming technique",
        "Go a full day using new coping skills",
      ],
    },
  },
  {
    emoji: "💤",
    title: "Improve Sleep",
    description: "Create habits that support restful sleep and better energy.",
    priority: 3,
    tiers: {
      Beginner: [
        "Stick to a consistent bedtime for 3 days",
        "Avoid screens for 30 minutes before bed",
        "Write down worries before sleeping",
      ],
      Intermediate: [
        "Establish a calming bedtime routine",
        "Track sleep for a full week",
        "Limit caffeine after noon",
      ],
      Advanced: [
        "Go a week with no late-night work or TV",
        "Try meditation or gentle yoga before bed",
        "Wake up feeling refreshed three days in a row",
      ],
    },
  },
  {
    emoji: "🏃‍♀️",
    title: "Boost Physical Activity",
    description: "Move more often to increase energy and mood.",
    priority: 4,
    tiers: {
      Beginner: [
        "Take a 10-minute walk three times this week",
        "Stretch for five minutes daily",
        "Try a new physical activity",
      ],
      Intermediate: [
        "Meet a step or movement goal for a full week",
        "Exercise with a friend or group",
        "Track your progress in your journal",
      ],
      Advanced: [
        "Complete a new personal best (distance/time)",
        "Incorporate strength training",
        "Teach someone else a favorite activity",
      ],
    },
  },
  {
    emoji: "🤝",
    title: "Strengthen Relationships",
    description: "Build deeper connections with friends and family.",
    priority: 3,
    tiers: {
      Beginner: [
        "Reach out to someone you haven’t talked to in a while",
        "Share appreciation with a friend",
        "Schedule a check-in call",
      ],
      Intermediate: [
        "Have a meaningful one-on-one conversation",
        "Resolve a small conflict with kindness",
        "Support someone in need",
      ],
      Advanced: [
        "Organize a get-together or group event",
        "Initiate a vulnerable conversation",
        "Offer mentorship or guidance to someone",
      ],
    },
  },
  // ...add more as you wish!
];

const TABS = ["Predefined Goals", "Custom Goal"];

export default function AddGoalModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState("Predefined Goals");
  const [selectedPredefinedIdx, setSelectedPredefinedIdx] = useState(null);

  // Custom goal state
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customPriority, setCustomPriority] = useState(1);
  const [customTiers, setCustomTiers] = useState(false);
  const [customMilestones, setCustomMilestones] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Predefined editing state
  const selectedPre =
    selectedPredefinedIdx !== null
      ? { ...PREDEFINED_GOALS[selectedPredefinedIdx] }
      : null;
  const [preTierEdits, setPreTierEdits] = useState({});
  const [activeTierTab, setActiveTierTab] = useState("Beginner");

  // Handle milestone editing for predefined
  const editableTiers = selectedPre
    ? preTierEdits[selectedPredefinedIdx] || selectedPre.tiers
    : {};

  function handleEditPreMilestone(tier, idx, value) {
    setPreTierEdits((prev) => {
      const all = { ...prev };
      const tiers = { ...(all[selectedPredefinedIdx] || selectedPre.tiers) };
      const arr = [...tiers[tier]];
      arr[idx] = value;
      tiers[tier] = arr;
      all[selectedPredefinedIdx] = tiers;
      return all;
    });
  }

  function handleAddPreMilestone(tier) {
    setPreTierEdits((prev) => {
      const all = { ...prev };
      const tiers = { ...(all[selectedPredefinedIdx] || selectedPre.tiers) };
      tiers[tier] = [...tiers[tier], ""];
      all[selectedPredefinedIdx] = tiers;
      return all;
    });
  }

  function handleRemovePreMilestone(tier, idx) {
    setPreTierEdits((prev) => {
      const all = { ...prev };
      const tiers = { ...(all[selectedPredefinedIdx] || selectedPre.tiers) };
      tiers[tier] = tiers[tier].filter((_, i) => i !== idx);
      all[selectedPredefinedIdx] = tiers;
      return all;
    });
  }

  // Always return { label, completed: false }
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

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (activeTab === "Predefined Goals") {
        if (selectedPre === null) throw new Error("Select a goal.");
        const tiersToSave = {};
        Object.entries(editableTiers).forEach(([tier, arr]) => {
          tiersToSave[tier] = arr.filter(Boolean).map(normalizeMilestone);
        });
        await onSave({
          title: selectedPre.title,
          description: selectedPre.description,
          priority: selectedPre.priority,
          tiers: tiersToSave,
        });
      } else {
        if (!customTitle.trim()) throw new Error("Title required.");
        const goalObj = {
          title: customTitle,
          description: customDescription,
          priority: customPriority,
        };
        if (customTiers) {
          goalObj.tiers = {
            Beginner: customMilestones.filter(Boolean).map(normalizeMilestone),
          };
        } else {
          goalObj.milestones = customMilestones
            .filter(Boolean)
            .map(normalizeMilestone);
        }
        await onSave(goalObj);
      }
      setSaving(false);
      onClose();
    } catch (err) {
      setError(err.message || "Error saving goal.");
      setSaving(false);
    }
  }

  function handleMilestoneChange(idx, value) {
    setCustomMilestones((milestones) => {
      const arr = [...milestones];
      arr[idx] = value;
      return arr;
    });
  }
  function addMilestone() {
    setCustomMilestones((milestones) => [...milestones, ""]);
  }
  function removeMilestone(idx) {
    setCustomMilestones((milestones) => milestones.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative
                      max-h-[95vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-purple-600"
          title="Close"
        >
          <X size={20} />
        </button>
        {/* Tabs for Predefined/Custom */}
        <div className="flex gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-purple-100 text-purple-900 shadow"
                  : "bg-gray-50 text-gray-400 hover:text-purple-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Predefined Goals" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {PREDEFINED_GOALS.map((g, idx) => (
                <button
                  key={g.title}
                  onClick={() => setSelectedPredefinedIdx(idx)}
                  className={`border rounded-xl p-4 flex flex-col items-start transition-all ${
                    selectedPredefinedIdx === idx
                      ? "border-purple-500 shadow bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{g.emoji}</span>
                  <span className="font-semibold text-lg mb-1">{g.title}</span>
                  <span className="text-sm text-gray-600">{g.description}</span>
                </button>
              ))}
            </div>
            {selectedPre && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4 border max-h-[60vh] overflow-y-auto">
                <h3 className="font-bold mb-1">Preview and Edit</h3>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-500">
                    Title
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                    value={selectedPre.title}
                    disabled
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-500">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                    value={selectedPre.description}
                    disabled
                  />
                </div>
                {/* --- Horizontal Tabs for Tier Selection --- */}
                <div className="flex gap-2 mb-2 mt-4">
                  {["Beginner", "Intermediate", "Advanced"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setActiveTierTab(tier)}
                      className={`px-3 py-1 rounded font-bold ${
                        activeTierTab === tier
                          ? "bg-purple-600 text-white shadow"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                {/* Show milestones only for active tier */}
                <div>
                  {editableTiers[activeTierTab].map((milestone, idx) => (
                    <div className="flex items-center gap-1 my-1" key={idx}>
                      <input
                        type="text"
                        value={
                          typeof milestone === "string"
                            ? milestone
                            : milestone.label
                        }
                        onChange={(e) =>
                          handleEditPreMilestone(
                            activeTierTab,
                            idx,
                            e.target.value
                          )
                        }
                        className="flex-1 px-2 py-1 border rounded"
                      />
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() =>
                          handleRemovePreMilestone(activeTierTab, idx)
                        }
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-1 text-xs text-purple-600 hover:underline"
                    onClick={() => handleAddPreMilestone(activeTierTab)}
                  >
                    + Add {activeTierTab} Milestone
                  </button>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Goal"}
                  </button>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>
            )}
          </div>
        )}

        {/* --- Custom Goal tab below (unchanged) --- */}
        {activeTab === "Custom Goal" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-500">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-500">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                maxLength={300}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-500">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                value={customPriority}
                onChange={(e) => setCustomPriority(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}{" "}
                    {num === 1 ? "(Lowest)" : num === 5 ? "(Highest)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="tiers"
                checked={customTiers}
                onChange={(e) => setCustomTiers(e.target.checked)}
              />
              <label htmlFor="tiers" className="text-sm text-gray-600">
                Advanced: Use beginner/intermediate/advanced tiers
              </label>
            </div>
            {customTiers ? (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500">
                  Beginner Milestones
                </label>
                {customMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-1 my-1">
                    <input
                      className="flex-1 px-2 py-1 border rounded"
                      value={
                        typeof milestone === "string"
                          ? milestone
                          : milestone.label
                      }
                      onChange={(e) =>
                        handleMilestoneChange(idx, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeMilestone(idx)}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 text-xs text-purple-600 hover:underline"
                  onClick={addMilestone}
                >
                  + Add Beginner Milestone
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500">
                  Milestones (optional)
                </label>
                {customMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-1 my-1">
                    <input
                      className="flex-1 px-2 py-1 border rounded"
                      value={
                        typeof milestone === "string"
                          ? milestone
                          : milestone.label
                      }
                      onChange={(e) =>
                        handleMilestoneChange(idx, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeMilestone(idx)}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 text-xs text-purple-600 hover:underline"
                  onClick={addMilestone}
                >
                  + Add Milestone
                </button>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
