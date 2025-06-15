// src/components/goals/tabs/MoodCorrelationsTab.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MoodCorrelationsTab = ({ goals, moodCorrelations, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Mood Correlations
    </h3>

    {/* Correlation Strength Chart */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Goal-Mood Correlation Strength
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={moodCorrelations} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 1]} />
            <YAxis dataKey="goal" type="category" width={80} />
            <Tooltip />
            <Bar
              dataKey="correlation"
              fill={colors.primary}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Before/After Mood Analysis */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Before/After Mood Analysis
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {moodCorrelations.map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h5 className="font-medium text-blue-900 mb-3">{item.goal}</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Before:</span>
                <span className="font-medium">{item.moodBefore}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">After:</span>
                <span className="font-medium">{item.moodAfter}/10</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-700">Improvement:</span>
                <span className="text-green-600">
                  +{(item.moodAfter - item.moodBefore).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">AI Recommendations</h4>
      <div className="space-y-3">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h5 className="font-medium text-purple-900">
            Mood Boosting Schedule
          </h5>
          <p className="text-sm text-purple-700 mt-1">
            Schedule high-correlation goals (Exercise, Meditation) during
            low-mood periods for maximum benefit.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900">Positive Momentum</h5>
          <p className="text-sm text-green-700 mt-1">
            Your "Exercise" goal consistently improves mood by 26%. Consider
            increasing frequency.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default MoodCorrelationsTab;
