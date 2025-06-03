// src/pages/Goals.jsx
import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const predefinedGoals = [
  "Exercise regularly",
  "Eat healthier",
  "Save money",
  "Build confidence",
  "Improve work-life balance",
  "Get better sleep",
];

export default function Goals() {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [customGoal, setCustomGoal] = useState("");
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [goalInsights, setGoalInsights] = useState([]);

  const fetchGoalInsights = async () => {
    try {
      const response = await fetch(
        "https://reflectory-api.onrender.com/api/goal-insights?user_id=anonymous"
      );
      const data = await response.json();
      setGoalInsights(data.goalInsights || []);
    } catch (err) {
      console.error("Failed to fetch goal insights:", err);
    }
  };

  useEffect(() => {
    fetchGoalInsights();
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("user_goals")
        .select("goal")
        .eq("user_id", "anonymous");

      if (error) {
        console.error("Error fetching goals:", error);
      } else if (data.length > 0) {
        const loadedGoals = data.map((row) => row.goal);

        // Deduplicate case-insensitively
        const uniqueGoals = Array.from(
          new Set(loadedGoals.map((g) => g.trim().toLowerCase()))
        ).map((lower) =>
          loadedGoals.find((g) => g.trim().toLowerCase() === lower)
        );

        setSelectedGoals(uniqueGoals);
        setCustomGoal("");
      }
    };

    fetchGoals();
  }, []);

  // Fetch goal insights whenever selected goals change
  useEffect(() => {
    if (selectedGoals.length > 0) {
      // Add a small delay to ensure database operations complete
      const timer = setTimeout(() => {
        fetchGoalInsights();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedGoals]);

  const handleCheckboxChange = (goal) => {
    const updatedGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];

    setSelectedGoals(updatedGoals);
    saveGoalsToSupabase(updatedGoals);
  };

  const handleAddCustomGoal = () => {
    const trimmed = customGoal.trim();
    if (
      trimmed &&
      !selectedGoals.some((g) => g.toLowerCase() === trimmed.toLowerCase())
    ) {
      const updated = [...selectedGoals, trimmed];
      setSelectedGoals(updated);
      setCustomGoal("");
      saveGoalsToSupabase(updated);
    }
  };

  const saveGoalsToSupabase = async (goalsArray = selectedGoals) => {
    const userId = "anonymous";

    const allGoals = [...goalsArray];
    const normalizedCustom = customGoal.trim().toLowerCase();

    if (
      normalizedCustom &&
      !allGoals.some((g) => g.toLowerCase() === normalizedCustom)
    ) {
      allGoals.push(customGoal.trim());
    }

    const deduplicatedGoals = Array.from(
      new Set(allGoals.map((g) => g.toLowerCase()))
    ).map((lower) => {
      return allGoals.find((g) => g.toLowerCase() === lower);
    });

    for (const goal of deduplicatedGoals) {
      // Save goal initially with empty tips
      const { data: upsertedGoal, error: upsertError } = await supabase
        .from("user_goals")
        .upsert([{ user_id: userId, goal, tips: [] }], {
          onConflict: ["user_id", "goal"],
          returning: "representation",
        })
        .select()
        .single();

      if (upsertError) {
        console.error("❌ Error saving goal:", upsertError);
        continue;
      }

      // Get tips from AI
      try {
        const response = await fetch(
          "https://reflectory-api.onrender.com/api/goal-tips",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goal }),
          }
        );

        const { tips } = await response.json();

        if (tips && tips.length > 0) {
          const { error: updateError } = await supabase
            .from("user_goals")
            .update({ tips })
            .eq("user_id", userId)
            .eq("goal", goal);

          if (updateError) {
            console.error("⚠️ Error updating tips for goal:", updateError);
          } else {
            console.log(`💡 AI Tips added for "${goal}":`, tips);
            fetchGoalInsights();
          }
        }
      } catch (err) {
        console.error("🛑 AI tip fetch failed:", err);
      }
    }

    fetchGoalInsights(); // Refresh the insights view
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">Set Your Goals</h1>
      <div className="space-y-2 mb-4">
        {predefinedGoals.map((goal) => (
          <label key={goal} className="block">
            <input
              type="checkbox"
              checked={selectedGoals.includes(goal)}
              onChange={() => handleCheckboxChange(goal)}
              className="mr-2"
            />
            {goal}
          </label>
        ))}
        <div className="flex mt-4">
          <input
            type="text"
            placeholder="Add Custom Goal"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="border rounded-l px-3 py-1 flex-grow"
          />
          <button
            onClick={handleAddCustomGoal}
            className="bg-purple-500 text-white px-4 rounded-r"
          >
            Add
          </button>
        </div>
      </div>

      {selectedGoals.length > 0 && (
        <div className="space-y-4">
          {selectedGoals.map((goal) => {
            const insight = goalInsights.find(
              (g) => g.goal.trim().toLowerCase() === goal.trim().toLowerCase()
            );

            return (
              <div
                key={goal}
                className="border-t-4 border-purple-300 p-4 rounded shadow-sm"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpandedGoal((prev) => (prev === goal ? null : goal))
                  }
                >
                  <h2 className="text-lg font-semibold">{goal}</h2>
                  <span>{expandedGoal === goal ? "−" : "+"}</span>
                </div>
                {expandedGoal === goal && (
                  <div className="mt-3">
                    <p className="text-sm mb-2 text-gray-600">
                      Mentioned {insight?.mentionsThisMonth ?? 0}x this month
                    </p>
                    <p className="text-sm mb-2 text-gray-600">
                      Last mentioned: {insight?.lastMentioned ?? "Never"}
                    </p>

                    <div className="mb-2">
                      <p className="font-semibold">Stats</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        <li>Movement toward goal: (coming soon)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Tips</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {(insight?.tips ?? []).length > 0 ? (
                          insight.tips.map((tip, i) => <li key={i}>{tip}</li>)
                        ) : (
                          <li>Tips are being generated...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
