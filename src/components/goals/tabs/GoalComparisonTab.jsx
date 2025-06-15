// src/components/goals/tabs/GoalComparisonTab.jsx
import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GoalComparisonTab = ({ goals, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Comparison & Analysis
    </h3>

    {/* Progress Comparison */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Progress Comparison</h4>
      <div className="space-y-4">
        {goals.slice(0, 5).map((goal, index) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {goal.decryptedTitle}
              </span>
              <span className="text-sm text-gray-600">{65 + index * 5}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${65 + index * 5}%`,
                  backgroundColor:
                    colors.gradient[index % colors.gradient.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Priority vs Progress Matrix */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Priority vs Progress Matrix
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="priority" name="Priority" />
            <YAxis dataKey="progress" name="Progress" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={goals.map((goal, index) => ({
                priority: goal.priority || (index % 5) + 1,
                progress: 65 + index * 5,
                name: goal.decryptedTitle,
              }))}
              fill={colors.primary}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Conflict & Synergy Analysis */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">
        Conflict & Synergy Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium text-red-900 mb-3">Potential Conflicts</h5>
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                <strong>Time Conflict:</strong> "Exercise 3x/week" and "Work
                60hrs/week" may compete for time slots.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                <strong>Energy Conflict:</strong> High-intensity goals scheduled
                on same days.
              </p>
            </div>
          </div>
        </div>
        <div>
          <h5 className="font-medium text-green-900 mb-3">
            Synergistic Opportunities
          </h5>
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700">
                <strong>Mutual Support:</strong> "Meditation" and "Stress
                Management" can reinforce each other.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700">
                <strong>Skill Building:</strong> "Reading" supports "Learning
                Spanish" vocabulary development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default GoalComparisonTab;
