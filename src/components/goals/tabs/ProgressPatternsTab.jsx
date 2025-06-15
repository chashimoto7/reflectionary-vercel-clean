// src/components/goals/tabs/ProgressPatternsTab.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProgressPatternsTab = ({
  goals,
  progressPatterns,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Progress Patterns Analysis
    </h3>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Completion Rate Trends */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">
          Completion Rate Trends
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completion"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Achievement Timeline */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">
          Milestone Achievement Timeline
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="milestones"
                fill={colors.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Goal Plateau Warnings */}
    <div className="mt-8">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Goal Plateau Warnings
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.slice(0, 3).map((goal) => (
          <div
            key={goal.id}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <h5 className="font-medium text-amber-900">
              {goal.decryptedTitle}
            </h5>
            <p className="text-sm text-amber-700 mt-1">
              No progress detected in the last 2 weeks. Consider breaking into
              smaller milestones.
            </p>
            <button className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium">
              View Suggestions →
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProgressPatternsTab;
