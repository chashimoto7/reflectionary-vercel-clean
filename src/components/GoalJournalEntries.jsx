// frontend/ src/components/GoalJournalEntries.jsx
import React from "react";

export default function GoalJournalEntries({ goal }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Journal Entries</h3>
      <p className="text-gray-600">
        Journal entries related to "{goal?.decryptedTitle}" will appear here.
      </p>
    </div>
  );
}
