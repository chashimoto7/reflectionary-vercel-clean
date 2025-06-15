// src/components/goals/tabs/GrowthTrackingTab.jsx
import React from "react";
import { Award } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const GrowthTrackingTab = ({ goals, colors, selectedGoalId, onSelectGoal }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Growth Tracking & Development
    </h3>

    {/* Growth Metrics Radar */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">Growth Dimensions</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={[
              { dimension: "Consistency", score: 85 },
              { dimension: "Challenge Level", score: 70 },
              { dimension: "Completion Rate", score: 78 },
              { dimension: "Motivation", score: 82 },
              { dimension: "Learning", score: 75 },
              { dimension: "Reflection", score: 88 },
            ]}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              dataKey="score"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Skill Development Tracking */}
    <div className="mb-8">
      <h4 className="font-semibold text-gray-900 mb-4">
        Skill Development Tracking
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { skill: "Self-Discipline", level: 7, growth: "+12%" },
          { skill: "Time Management", level: 6, growth: "+8%" },
          { skill: "Consistency", level: 8, growth: "+15%" },
          { skill: "Goal Setting", level: 7, growth: "+10%" },
          { skill: "Self-Reflection", level: 9, growth: "+18%" },
          { skill: "Motivation", level: 6, growth: "+5%" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-indigo-900">{item.skill}</span>
              <span className="text-sm text-green-600 font-medium">
                {item.growth}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${item.level * 10}%` }}
                />
              </div>
              <span className="text-sm text-indigo-600 font-medium">
                {item.level}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Achievement Timeline */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Recent Achievements</h4>
      <div className="space-y-3">
        {[
          {
            title: "Completed Exercise Goal Week 3",
            date: "3 days ago",
            type: "milestone",
          },
          {
            title: "Maintained 7-day Learning Streak",
            date: "5 days ago",
            type: "streak",
          },
          {
            title: "Achieved Meditation Tier Upgrade",
            date: "1 week ago",
            type: "tier",
          },
        ].map((achievement, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <Award className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="font-medium text-yellow-900">
                {achievement.title}
              </h5>
              <p className="text-sm text-yellow-700">{achievement.date}</p>
            </div>
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
              {achievement.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GrowthTrackingTab;
