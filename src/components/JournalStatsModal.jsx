// src/components/JournalStatsModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function JournalStatsModal({ onClose }) {
  const navigate = useNavigate();

  // Temporary mock stats
  const stats = {
    totalEntriesYear: 127,
    totalEntriesMonth: 22,
    totalEntriesWeek: 6,
    avgWordCountMonth: 254,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Journaling Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Entries This Year" value={stats.totalEntriesYear} />
        <StatCard label="Entries This Month" value={stats.totalEntriesMonth} />
        <StatCard label="Entries This Week" value={stats.totalEntriesWeek} />
        <StatCard
          label="Avg. Word Count (This Month)"
          value={`${stats.avgWordCountMonth} words`}
        />
      </div>

      <button
        onClick={() => {
          onClose();
          navigate("/analytics/journaling");
        }}
        className="mt-4 inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
      >
        View Detailed Insights
      </button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 border rounded-lg shadow-sm text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
