// src/components/goals/tabs/GoalInsightsTab.jsx
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

const GoalInsightsTab = ({
  goals,
  moodCorrelations,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Insights & Correlations
    </h3>

    {/* Mood Correlations */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Mood Correlations</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={moodCorrelations}>
            <CartesianGrid />
            <XAxis dataKey="moodBefore" name="Mood Before" />
            <YAxis dataKey="moodAfter" name="Mood After" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter dataKey="correlation" fill={colors.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Growth Language Analysis */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Growth Language Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { phrase: "I learned", count: 15, sentiment: 0.8 },
          { phrase: "I improved", count: 12, sentiment: 0.75 },
          { phrase: "I struggled", count: 8, sentiment: 0.3 },
          { phrase: "I achieved", count: 10, sentiment: 0.9 },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">"{item.phrase}"</span>
              <span className="text-sm text-blue-600">{item.count}x</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${item.sentiment * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-600 mt-1">
              {(item.sentiment * 100).toFixed(0)}% positive sentiment
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Goal-Related Journal Entries */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">
        Recent Goal-Related Journal Entries
      </h4>
      <div className="space-y-3">
        {goals.slice(0, 3).map((goal) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{goal.decryptedTitle}</h5>
            <p className="text-sm text-gray-600 mt-1">
              Last mentioned 3 days ago with positive sentiment.
              <span className="text-purple-600 hover:text-purple-700 cursor-pointer ml-1">
                View entries →
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GoalInsightsTab;
