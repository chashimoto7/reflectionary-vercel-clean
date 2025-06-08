// src/components/EditGoalModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

export default function EditGoalModal({ goal, onClose, onSave }) {
  const [priority, setPriority] = useState(goal.priority || 1);
  const [description, setDescription] = useState(
    goal.decryptedDescription || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...goal,
        priority,
        description,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update goal");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-purple-600"
          title="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Goal</h2>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "(Lowest)" : num === 5 ? "(Highest)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
