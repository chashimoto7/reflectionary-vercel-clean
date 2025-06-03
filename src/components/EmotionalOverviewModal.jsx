// src/components/EmotionalOverviewModal.jsx
import React from "react";

export default function EmotionalOverviewModal() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Emotional Overview</h2>
      <p className="text-gray-600 text-sm mt-2">
        This is a placeholder modal for emotional trends. A full-page view will eventually replace this.
      </p>

      {/* Placeholder chart */}
      <div className="mt-4 h-40 bg-purple-100 rounded-lg shadow-inner flex items-center justify-center text-purple-800">
        [Emotion trend chart coming soon]
      </div>
    </div>
  );
}
