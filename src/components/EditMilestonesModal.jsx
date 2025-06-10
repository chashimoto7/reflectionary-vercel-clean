import React, { useState, useEffect } from "react";
import { X, Trash2, PlusCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";

// Helper: Parse decrypted milestones/tier data - matches the one in Goals.jsx
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

export default function EditMilestonesModal({ goal, onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tiers, setTiers] = useState({});
  const [activeTier, setActiveTier] = useState("Beginner");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

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

        const result = await parseProgress(goal, dataKey);

        console.log("PARSED PROGRESS", result);
        console.log("GOAL PROPS", goal);

        if (ignore) return;

        setType(result.type);

        if (
          result.type === "tiered" &&
          result.data &&
          typeof result.data === "object"
        ) {
          setTiers({ ...result.data });
          const tierKeys = Object.keys(result.data);
          setActiveTier(tierKeys[0] || "Beginner");
        } else if (result.type === "list" && Array.isArray(result.data)) {
          setMilestones([...result.data]);
        } else {
          // No existing milestones - set up empty structure
          setType(null);
          setMilestones([]);
          setTiers({});
        }
      } catch (e) {
        console.error("Error loading milestones:", e);
        setType(null);
        setMilestones([]);
        setTiers({});
      }

      setLoading(false);
    }

    load();

    return () => {
      ignore = true;
    };
  }, [goal.id, goal.encrypted_progress, goal.progress_iv]);

  function handleMilestoneText(idx, val, tier = null) {
    if (type === "tiered" && tier) {
      setTiers((ts) => ({
        ...ts,
        [tier]: Array.isArray(ts[tier])
          ? ts[tier].map((m, i) => (i === idx ? { ...m, label: val } : m))
          : [{ label: val, completed: false }],
      }));
    } else if (type === "list") {
      setMilestones((ms) =>
        Array.isArray(ms)
          ? ms.map((m, i) => (i === idx ? { ...m, label: val } : m))
          : [{ label: val, completed: false }]
      );
    }
  }

  function handleAddMilestone(tier = null) {
    if (type === "tiered" && tier) {
      setTiers((ts) => ({
        ...ts,
        [tier]: Array.isArray(ts[tier])
          ? [...ts[tier], { label: "", completed: false }]
          : [{ label: "", completed: false }],
      }));
    } else if (type === "list") {
      setMilestones((ms) =>
        Array.isArray(ms)
          ? [...ms, { label: "", completed: false }]
          : [{ label: "", completed: false }]
      );
    }
  }

  function handleDeleteMilestone(idx, tier = null) {
    if (type === "tiered" && tier) {
      setTiers((ts) => ({
        ...ts,
        [tier]: Array.isArray(ts[tier])
          ? ts[tier].filter((_, i) => i !== idx)
          : [],
      }));
    } else if (type === "list") {
      setMilestones((ms) =>
        Array.isArray(ms) ? ms.filter((_, i) => i !== idx) : []
      );
    }
  }

  async function handleSave() {
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
      } else {
        throw new Error("Invalid milestone type");
      }

      payload = await encryptionService.encryptText(plaintext, dataKey);

      const { error } = await supabase
        .from("user_goals")
        .update({
          encrypted_progress: payload.encryptedData,
          progress_iv: payload.iv,
        })
        .eq("id", goal.id);

      if (error) throw new Error("Could not save milestones: " + error.message);

      setSaving(false);
      if (onSave) onSave();
      else onClose();
    } catch (err) {
      setSaving(false);
      alert(err.message || "Failed to save milestones.");
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-purple-600"
          title="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Milestones</h2>

        {type === "tiered" ? (
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

            <div className="mb-4">
              {(!tiers[activeTier] || tiers[activeTier].length === 0) && (
                <div className="text-gray-400 text-sm mb-3">
                  No milestones yet for {activeTier} tier.
                </div>
              )}

              {tiers[activeTier] &&
                Array.isArray(tiers[activeTier]) &&
                tiers[activeTier].map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      className="flex-1 px-2 py-1 border rounded"
                      value={milestone.label || ""}
                      onChange={(e) =>
                        handleMilestoneText(idx, e.target.value, activeTier)
                      }
                      placeholder={`${activeTier} milestone ${idx + 1}`}
                    />
                    <button
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                      onClick={() => handleDeleteMilestone(idx, activeTier)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

              <button
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors"
                onClick={() => handleAddMilestone(activeTier)}
              >
                <PlusCircle size={18} /> Add Milestone
              </button>
            </div>
          </>
        ) : type === "list" ? (
          <>
            <div className="mb-4">
              {(!milestones || milestones.length === 0) && (
                <div className="text-gray-400 text-sm mb-3">
                  No milestones yet for this goal.
                </div>
              )}

              {Array.isArray(milestones) &&
                milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      className="flex-1 px-2 py-1 border rounded"
                      value={milestone.label || ""}
                      onChange={(e) => handleMilestoneText(idx, e.target.value)}
                      placeholder={`Milestone ${idx + 1}`}
                    />
                    <button
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                      onClick={() => handleDeleteMilestone(idx)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

              <button
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors"
                onClick={() => handleAddMilestone()}
              >
                <PlusCircle size={18} /> Add Milestone
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <p className="mb-4">
              No milestones have been set up for this goal yet.
            </p>
            <div className="space-y-2">
              <button
                className="block mx-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                onClick={() => {
                  setType("list");
                  setMilestones([]);
                }}
              >
                Set up as Simple List
              </button>
              <button
                className="block mx-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                onClick={() => {
                  setType("tiered");
                  setTiers({ Beginner: [], Intermediate: [], Advanced: [] });
                  setActiveTier("Beginner");
                }}
              >
                Set up with Tiers (Beginner/Intermediate/Advanced)
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
