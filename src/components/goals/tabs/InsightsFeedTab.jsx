// frontend/ src/components/goals/tabs/InsightsFeedTab.jsx
import React, { useState } from "react";
import {
  Lightbulb,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
  Calendar,
  MessageSquare,
  Star,
  Filter,
  RefreshCw,
  ChevronRight,
  Clock,
} from "lucide-react";

const InsightsFeedTab = ({ insights, goals, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Extended insights with more detail
  const extendedInsights = [
    {
      id: 1,
      type: "achievement",
      category: "success",
      priority: "high",
      title: "Major Milestone Approaching",
      description:
        "3 goals are within 10% of completion. A focused push this week could lead to multiple achievements.",
      action: "Review and complete",
      impact: "3 goal completions",
      relatedGoals: ["Fitness Challenge", "Reading Goal", "Skill Development"],
      confidence: 92,
      timestamp: "2 hours ago",
      icon: CheckCircle2,
    },
    {
      id: 2,
      type: "pattern",
      category: "behavioral",
      priority: "medium",
      title: "Optimal Performance Window Detected",
      description:
        "Your data shows 3x higher goal progress between 6-8 AM compared to other times.",
      action: "Adjust schedule",
      impact: "40% efficiency gain",
      dataPoints: "Based on 30 days of activity",
      confidence: 88,
      timestamp: "5 hours ago",
      icon: Clock,
    },
    {
      id: 3,
      type: "risk",
      category: "warning",
      priority: "high",
      title: "Goal Momentum Alert",
      description:
        "2 career goals haven't seen progress in 14 days. Historical data suggests this leads to abandonment.",
      action: "Re-engage now",
      impact: "Prevent goal failure",
      relatedGoals: ["Learn Python", "Portfolio Update"],
      confidence: 85,
      timestamp: "1 day ago",
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "recommendation",
      category: "optimization",
      priority: "medium",
      title: "Goal Consolidation Opportunity",
      description:
        "3 of your health goals have 80% overlap. Merging them could improve focus and results.",
      action: "Merge goals",
      impact: "Simplify tracking",
      relatedGoals: ["Exercise Daily", "Improve Fitness", "Stay Active"],
      confidence: 78,
      timestamp: "2 days ago",
      icon: Target,
    },
    {
      id: 5,
      type: "correlation",
      category: "discovery",
      priority: "low",
      title: "Surprising Connection Found",
      description:
        "Progress on creative goals increases by 25% within 48 hours of completing fitness activities.",
      action: "Leverage pattern",
      impact: "Boost creativity",
      confidence: 72,
      timestamp: "3 days ago",
      icon: Zap,
    },
  ];

  // Filter insights
  const filteredInsights =
    selectedCategory === "all"
      ? extendedInsights
      : extendedInsights.filter((i) => i.category === selectedCategory);

  // Sort insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    if (sortBy === "relevance") return b.confidence - a.confidence;
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === "recent") return b.id - a.id; // Mock: newer IDs = more recent
    return 0;
  });

  // Categories for filtering
  const categories = [
    { id: "all", label: "All Insights", count: extendedInsights.length },
    {
      id: "success",
      label: "Achievements",
      count: extendedInsights.filter((i) => i.category === "success").length,
    },
    {
      id: "warning",
      label: "Alerts",
      count: extendedInsights.filter((i) => i.category === "warning").length,
    },
    {
      id: "behavioral",
      label: "Patterns",
      count: extendedInsights.filter((i) => i.category === "behavioral").length,
    },
    {
      id: "optimization",
      label: "Optimizations",
      count: extendedInsights.filter((i) => i.category === "optimization")
        .length,
    },
    {
      id: "discovery",
      label: "Discoveries",
      count: extendedInsights.filter((i) => i.category === "discovery").length,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Insights Feed
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-300">
          Personalized recommendations powered by advanced pattern recognition
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="relevance">By Relevance</option>
            <option value="priority">By Priority</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Lightbulb}
          value={sortedInsights.length}
          label="Active Insights"
          color={colors.primary}
        />
        <SummaryCard
          icon={Star}
          value={sortedInsights.filter((i) => i.priority === "high").length}
          label="High Priority"
          color={colors.danger}
        />
        <SummaryCard
          icon={TrendingUp}
          value={`${Math.round(
            sortedInsights.reduce((acc, i) => acc + i.confidence, 0) /
              sortedInsights.length
          )}%`}
          label="Avg Confidence"
          color={colors.success}
        />
        <SummaryCard
          icon={Zap}
          value={sortedInsights.filter((i) => i.action).length}
          label="Actionable"
          color={colors.info}
        />
      </div>

      {/* Insights Feed */}
      <div className="space-y-4 mb-6">
        {sortedInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} colors={colors} />
        ))}
      </div>

      {/* AI Learning Progress */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Learning Progress
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LearningMetric
            label="Pattern Recognition"
            value={87}
            description="Identifying behavioral patterns"
            color={colors.primary}
          />
          <LearningMetric
            label="Prediction Accuracy"
            value={82}
            description="Goal completion predictions"
            color={colors.secondary}
          />
          <LearningMetric
            label="Personalization"
            value={91}
            description="Tailored recommendations"
            color={colors.accent}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SummaryCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-300">{label}</p>
  </div>
);

const InsightCard = ({ insight, colors }) => {
  const IconComponent = insight.icon;

  const priorityColors = {
    high: "border-red-400/30 bg-red-500/10",
    medium: "border-yellow-400/30 bg-yellow-500/10",
    low: "border-green-400/30 bg-green-500/10",
  };

  const typeColors = {
    achievement: colors.success,
    pattern: colors.info,
    risk: colors.danger,
    recommendation: colors.primary,
    correlation: colors.secondary,
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all hover:shadow-lg ${
        priorityColors[insight.priority]
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${typeColors[insight.type]}20` }}
        >
          <IconComponent
            className="h-6 w-6"
            style={{ color: typeColors[insight.type] }}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{insight.title}</h4>
            <span className="text-xs text-gray-400">{insight.timestamp}</span>
          </div>

          <p className="text-sm text-gray-300 mb-3">{insight.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
            {insight.impact && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Impact: {insight.impact}
              </span>
            )}
            {insight.dataPoints && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {insight.dataPoints}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Confidence: {insight.confidence}%
            </span>
          </div>

          {/* Related Goals */}
          {insight.relatedGoals && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Related goals:</p>
              <div className="flex flex-wrap gap-2">
                {insight.relatedGoals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {insight.action && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors">
              {insight.action}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Confidence Indicator */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={typeColors[insight.type]}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(insight.confidence / 100) * 126} 126`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {insight.confidence}%
            </span>
          </div>
          <span className="text-xs text-gray-400 mt-1">Confidence</span>
        </div>
      </div>
    </div>
  );
};

const LearningMetric = ({ label, value, description, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-bold text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);

export default InsightsFeedTab;
