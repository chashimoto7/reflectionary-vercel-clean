// src/components/goals/tabs/InsightsFeedTab.jsx
import React from "react";
import {
  AlertTriangle,
  Heart,
  Lightbulb,
  Brain,
  Award,
  Info,
  X,
} from "lucide-react";

const InsightsFeedTab = ({ insights, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      AI Insights Feed
    </h3>

    <div className="space-y-4">
      {insights
        .concat([
          {
            id: 3,
            type: "recommendation",
            title: "Optimize Your Goal Schedule",
            message:
              "Based on your energy patterns, schedule challenging goals in the morning when your energy is highest.",
            priority: "high",
            date: new Date().toISOString(),
          },
          {
            id: 4,
            type: "pattern",
            title: "Weekly Pattern Detected",
            message:
              "You consistently struggle with goals on Mondays. Consider lighter goal loads to start the week.",
            priority: "medium",
            date: new Date().toISOString(),
          },
          {
            id: 5,
            type: "achievement",
            title: "Growth Milestone Reached",
            message:
              "Your goal completion rate has improved by 23% over the past month. Keep up the excellent work!",
            priority: "high",
            date: new Date().toISOString(),
          },
        ])
        .map((insight) => (
          <InsightCard key={insight.id} insight={insight} colors={colors} />
        ))}
    </div>
  </div>
);

const InsightCard = ({ insight, colors }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case "plateau_warning":
        return AlertTriangle;
      case "mood_correlation":
        return Heart;
      case "recommendation":
        return Lightbulb;
      case "pattern":
        return Brain;
      case "achievement":
        return Award;
      default:
        return Info;
    }
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case "high":
        return colors.danger;
      case "medium":
        return colors.warning;
      case "low":
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const Icon = getInsightIcon(insight.type);
  const color = getInsightColor(insight.priority);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{insight.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(insight.date).toLocaleDateString()}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InsightsFeedTab;
