// src/components/goals/tabs/MentionTimelineTab.jsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MentionTimelineTab = ({
  goals,
  goalMentions,
  colors,
  selectedGoalId,
  onSelectGoal,
}) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Goal Mention Analytics
    </h3>

    {/* Weekly Mention Graph */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Weekly Goal Mentions</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={goalMentions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="mentions"
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Spike Detection */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Spike Detection & Summaries
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">
              Mention Spike Detected
            </span>
          </div>
          <p className="text-sm text-green-700">
            Week 6 showed 50% increase in goal mentions, particularly around
            "Exercise" goals.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-900">Mention Drop</span>
          </div>
          <p className="text-sm text-amber-700">
            Week 4 showed decreased mentions. Consider reviewing goal relevance
            and adjusting approach.
          </p>
        </div>
      </div>
    </div>

    {/* Sentiment Timeline */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Sentiment Over Time</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={goalMentions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke={colors.accent}
              strokeWidth={3}
              dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default MentionTimelineTab;
