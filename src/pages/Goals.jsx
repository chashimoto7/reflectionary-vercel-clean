// src/pages/Goals.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Award, ChevronDown } from "lucide-react";

const TABS = ["Overview", "Progress", "Journal Entries", "Tips"];

// --- Temporary for visual only; real data will be loaded soon!
const sampleGoals = [
  {
    id: "1",
    title: "Build Confidence",
    tier: "Advanced",
    mentions: 12,
    lastMentioned: "2025-06-08",
    priority: 4,
    status: "active",
    isTiered: true,
  },
  {
    id: "2",
    title: "Exercise 5x/week",
    tier: null,
    mentions: 8,
    lastMentioned: "2025-06-09",
    priority: 2,
    status: "active",
    isTiered: false,
  },
  {
    id: "3",
    title: "Read Every Day",
    tier: "Beginner",
    mentions: 3,
    lastMentioned: "2025-06-02",
    priority: 1,
    status: "paused",
    isTiered: true,
  },
];

export default function Goals() {
  // Replace these with real Supabase data soon!
  const [goals, setGoals] = useState(sampleGoals);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // -- For demo, automatically select the first goal
  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-lg overflow-hidden mt-6 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#E5E3EA] to-[#D9D6DF] border-r p-6 flex flex-col min-h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-900">Your Goals</h2>
          <button
            className="rounded-full bg-purple-500 hover:bg-purple-600 p-2 text-white"
            title="Add New Goal"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {goals.length === 0 ? (
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
        {/* Completed goals section can be added here */}
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
              <button className="text-sm text-gray-400 hover:text-purple-500 flex items-center gap-1">
                <Award size={18} />
                Edit
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
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a goal to see details!
          </div>
        )}
      </main>
    </div>
  );
}

// Sidebar Item
function GoalSidebarItem({ goal, isSelected, onClick }) {
  const badge = goal.isTiered ? goal.tier : "List";
  const badgeColor =
    goal.tier === "Advanced"
      ? "bg-purple-700"
      : goal.tier === "Intermediate"
      ? "bg-purple-400"
      : goal.tier === "Beginner"
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
        <span className="text-base">{goal.title}</span>
      </div>
      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
        <span>{goal.mentions} mentions</span>
        <span>•</span>
        <span>
          Last:{" "}
          {goal.lastMentioned
            ? new Date(goal.lastMentioned).toLocaleDateString()
            : "—"}
        </span>
      </div>
    </button>
  );
}

// Placeholder Tab Panels (will be replaced with real content & logic)
function GoalOverview({ goal }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{goal.title}</h1>
      <div className="flex items-center gap-4 mb-4">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800">
          {goal.tier || "Single-list"}
        </span>
        <span className="inline-block rounded-full px-3 py-1 text-xs bg-gray-100 text-gray-600">
          Priority: {goal.priority}
        </span>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs ${
            goal.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
        </span>
      </div>
      <p className="text-gray-700 mb-2">
        Description: (will show full description here)
      </p>
      <div className="mt-4 text-sm text-gray-500">Created: 2025-05-01</div>
      <div className="mt-1 text-sm text-gray-500">
        Last Mentioned:{" "}
        {goal.lastMentioned
          ? new Date(goal.lastMentioned).toLocaleDateString()
          : "—"}
      </div>
    </div>
  );
}
function GoalProgress({ goal }) {
  return (
    <div className="text-gray-500">
      Progress tab for {goal.title} (checklists, tiered milestones, and progress
      bars coming soon!)
    </div>
  );
}
function GoalJournalEntries({ goal }) {
  return (
    <div className="text-gray-500">
      Journal entries mentioning "{goal.title}" will be listed here (with
      date/snippet/expand).
    </div>
  );
}
function GoalTips({ goal }) {
  return (
    <div className="text-gray-500">
      AI tips and your own tips for "{goal.title}" go here. (Tier-aware,
      editable!)
    </div>
  );
}
