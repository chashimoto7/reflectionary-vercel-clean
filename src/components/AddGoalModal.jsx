// src/components/AddGoalModal.jsx (or inline in Goals.jsx)
import React, { useState } from "react";
import { Check, X, Plus } from "lucide-react";

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
  // Add more as desired...
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
  const [preTierEdits, setPreTierEdits] = useState({}); // { idx: { Beginner: [...], ... }, ... }
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

  // Save goal
  // Save goal (REPLACE your function with this version)
  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (activeTab === "Predefined Goals") {
        if (selectedPre === null) throw new Error("Select a goal.");
        // Convert each milestone to an object with label & completed
        const tiersToSave = {};
        Object.entries(editableTiers).forEach(([tier, arr]) => {
          tiersToSave[tier] = arr
            .filter(Boolean)
            .map((milestone) =>
              typeof milestone === "string"
                ? { label: milestone, completed: false }
                : milestone && typeof milestone === "object"
                ? { label: milestone.label, completed: !!milestone.completed }
                : { label: "", completed: false }
            );
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
            Beginner: customMilestones
              .filter(Boolean)
              .map((milestone) =>
                typeof milestone === "string"
                  ? { label: milestone, completed: false }
                  : milestone && typeof milestone === "object"
                  ? { label: milestone.label, completed: !!milestone.completed }
                  : { label: "", completed: false }
              ),
          };
        } else {
          goalObj.milestones = customMilestones
            .filter(Boolean)
            .map((milestone) =>
              typeof milestone === "string"
                ? { label: milestone, completed: false }
                : milestone && typeof milestone === "object"
                ? { label: milestone.label, completed: !!milestone.completed }
                : { label: "", completed: false }
            );
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

  // Custom goal: manage milestones
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
            {/* List of predefined */}
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
            {/* Preview and edit when selected */}
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
                        value={milestone}
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

        {/* ...rest of your Custom Goal tab remains unchanged... */}
      </div>
    </div>
  );
}
