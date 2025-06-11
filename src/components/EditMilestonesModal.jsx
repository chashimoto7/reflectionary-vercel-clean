import React, { useState, useEffect } from "react";
import { useSecurity } from "../contexts/SecurityContext";
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
  const { isLocked } = useSecurity();
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tiers, setTiers] = useState({});
  const [activeTier, setActiveTier] = useState("Beginner");
  const [saving, setSaving] = useState(false);

  // Close modal if locked
  useEffect(() => {
    if (isLocked) {
      onClose();
    }
  }, [isLocked, onClose]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      // Don't load if locked
      if (isLocked) {
        setLoading(false);
        return;
      }

      try {
        const encryptedDataKey = {
          encryptedData: goal.encrypted_data_key,
          iv: goal.data_key_iv,
        };

        // Always use the static master key (your existing approach)
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
  }, [goal.id, goal.encrypted_progress, goal.progress_iv, isLocked]);

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
      // REMOVED THE ISLOCKE CHECK THAT WAS CAUSING THE ISSUE
      // The modal already closes if locked, so we don't need this check here

      const encryptedDataKey = {
        encryptedData: goal.encrypted_data_key,
        iv: goal.data_key_iv,
      };

      // Use getStaticMasterKey() since SecurityContext doesn't store the actual master key
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
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <div className="space-y-2 mb-4">
              {Array.isArray(tiers[activeTier]) &&
                tiers[activeTier].map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Milestone text"
                      value={milestone.label || ""}
                      onChange={(e) =>
                        handleMilestoneText(idx, e.target.value, activeTier)
                      }
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => handleDeleteMilestone(idx, activeTier)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              <button
                onClick={() => handleAddMilestone(activeTier)}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <PlusCircle size={16} />
                Add Milestone
              </button>
            </div>
          </>
        ) : type === "list" ? (
          <>
            <div className="space-y-2 mb-4">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Milestone text"
                    value={milestone.label || ""}
                    onChange={(e) => handleMilestoneText(idx, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => handleDeleteMilestone(idx)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddMilestone()}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <PlusCircle size={16} />
                Add Milestone
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 mb-4">
            No milestones configured for this goal yet.
            <br />
            <button
              onClick={() => setType("list")}
              className="text-purple-600 hover:underline"
            >
              Start with a simple list
            </button>{" "}
            or{" "}
            <button
              onClick={() => {
                setType("tiered");
                setTiers({
                  Beginner: [],
                  Intermediate: [],
                  Advanced: [],
                });
              }}
              className="text-purple-600 hover:underline"
            >
              create tiered milestones
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            disabled={saving || !type}
          >
            {saving ? "Saving..." : "Save Milestones"}
          </button>
        </div>
      </div>
    </div>
  );
}
