// src/components/analytics/tabs/IntelligenceOverviewTab.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  Activity,
  Heart,
  Award,
  Target,
  Zap,
  ChevronRight,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Area,
  ComposedChart,
  Bar,
} from "recharts";

const IntelligenceOverviewTab = ({
  data,
  colors,
  insights,
  onAcknowledgeInsight,
}) => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate intelligence metrics
  const calculateIntelligenceMetrics = () => {
    if (!data || !data.sentiment) {
      return {
        emotionalIntelligence: 0,
        growthTrajectory: 0,
        patternRecognition: 0,
        resilienceScore: 0,
      };
    }

    // Emotional Intelligence Score (0-100)
    const avgSentiment = data.sentiment.overall || 50;
    const emotionalRange = data.sentiment.emotionalRange || 0;
    const emotionalIntelligence = Math.round(
      avgSentiment * 0.6 + emotionalRange * 0.4
    );

    // Growth Trajectory (0-100)
    const journalConsistency = data.overview?.journalConsistency || 0;
    const insightEngagement =
      (insights?.filter((i) => i.acknowledged).length /
        Math.max(insights?.length || 1, 1)) *
      100;
    const growthTrajectory = Math.round(
      journalConsistency * 0.5 + insightEngagement * 0.5
    );

    // Pattern Recognition (0-100)
    const uniqueThemes = data.themes?.topThemes?.length || 0;
    const patternDiversity = Math.min(uniqueThemes * 10, 100);
    const patternRecognition = Math.round(patternDiversity);

    // Resilience Score (0-100)
    const moodStability = 100 - (data.mood?.volatility || 50);
    const recoveryRate = data.behavioral?.recoveryRate || 50;
    const resilienceScore = Math.round(
      moodStability * 0.5 + recoveryRate * 0.5
    );

    return {
      emotionalIntelligence,
      growthTrajectory,
      patternRecognition,
      resilienceScore,
    };
  };

  const metrics = calculateIntelligenceMetrics();

  // Prepare mood vs energy correlation data
  const prepareMoodEnergyData = () => {
    if (!data?.mood?.history || !data?.energy?.history) return [];

    const moodHistory = data.mood.history;
    const energyHistory = data.energy.history;

    return moodHistory
      .map((moodItem, index) => {
        const energyItem = energyHistory.find((e) => e.date === moodItem.date);
        return {
          date: moodItem.date,
          mood: moodItem.value || 0,
          energy: energyItem?.value || 0,
          label: new Date(moodItem.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
      })
      .slice(-30); // Last 30 data points for clarity
  };

  const moodEnergyData = prepareMoodEnergyData();

  // Prepare radar chart data for multi-dimensional intelligence
  const radarData = [
    {
      dimension: "Emotional",
      value: metrics.emotionalIntelligence,
      fullMark: 100,
    },
    {
      dimension: "Growth",
      value: metrics.growthTrajectory,
      fullMark: 100,
    },
    {
      dimension: "Pattern",
      value: metrics.patternRecognition,
      fullMark: 100,
    },
    {
      dimension: "Resilience",
      value: metrics.resilienceScore,
      fullMark: 100,
    },
    {
      dimension: "Consistency",
      value: data?.overview?.journalConsistency || 0,
      fullMark: 100,
    },
    {
      dimension: "Awareness",
      value: Math.min((data?.themes?.topThemes?.length || 0) * 20, 100),
      fullMark: 100,
    },
  ];

  // Recent insights preview
  const recentInsights = insights?.slice(0, 3) || [];

  // Calculate weekly progress
  const calculateWeeklyProgress = () => {
    if (!data?.mood?.history) return { mood: 0, energy: 0, entries: 0 };

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = data.mood.history.filter(
      (item) => new Date(item.date) >= weekAgo
    );
    const lastWeek = data.mood.history.filter(
      (item) =>
        new Date(item.date) >= twoWeeksAgo && new Date(item.date) < weekAgo
    );

    const thisWeekAvg =
      thisWeek.reduce((sum, item) => sum + (item.value || 0), 0) /
      Math.max(thisWeek.length, 1);
    const lastWeekAvg =
      lastWeek.reduce((sum, item) => sum + (item.value || 0), 0) /
      Math.max(lastWeek.length, 1);

    return {
      mood: thisWeekAvg - lastWeekAvg,
      energy: data?.energy?.weeklyChange || 0,
      entries:
        ((thisWeek.length - lastWeek.length) / Math.max(lastWeek.length, 1)) *
        100,
    };
  };

  const weeklyProgress = calculateWeeklyProgress();

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    description,
  }) => (
    <div
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedMetric(title)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : trend < 0 ? (
              <ArrowDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={`text-sm font-medium ${
                trend > 0
                  ? "text-green-600"
                  : trend < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="mt-4 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {payload[0].payload.label}
          </p>
          <p className="text-sm text-purple-600">
            Mood: {payload[0].payload.mood}
          </p>
          <p className="text-sm text-cyan-600">
            Energy: {payload[0].payload.energy}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" />
          Intelligence Overview
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Last updated</span>
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Intelligence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Emotional Intelligence"
          value={metrics.emotionalIntelligence}
          icon={Heart}
          color="from-purple-500 to-purple-600"
          trend={5}
          description="Understanding and managing emotions"
        />
        <MetricCard
          title="Growth Trajectory"
          value={metrics.growthTrajectory}
          icon={TrendingUp}
          color="from-cyan-500 to-cyan-600"
          trend={12}
          description="Progress toward personal goals"
        />
        <MetricCard
          title="Pattern Recognition"
          value={metrics.patternRecognition}
          icon={Brain}
          color="from-emerald-500 to-emerald-600"
          trend={-2}
          description="Identifying behavioral patterns"
        />
        <MetricCard
          title="Resilience Score"
          value={metrics.resilienceScore}
          icon={Shield}
          color="from-amber-500 to-amber-600"
          trend={8}
          description="Ability to bounce back"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood vs Energy Correlation */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Mood-Energy Correlation
          </h3>
          {moodEnergyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="mood"
                  type="number"
                  domain={[0, 10]}
                  label={{
                    value: "Mood Level",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="energy"
                  type="number"
                  domain={[0, 10]}
                  label={{
                    value: "Energy Level",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  name="Mood vs Energy"
                  data={moodEnergyData}
                  fill={colors.primary}
                  fillOpacity={0.6}
                  strokeWidth={2}
                  stroke={colors.primary}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No correlation data available</p>
            </div>
          )}
        </div>

        {/* Multi-dimensional Intelligence Radar */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            Intelligence Dimensions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="dimension" className="text-sm" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Intelligence"
                dataKey="value"
                stroke={colors.secondary}
                fill={colors.secondary}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Progress & Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Weekly Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Mood Trend
                  </p>
                  <p className="text-xs text-gray-500">Week over week change</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  weeklyProgress.mood >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {weeklyProgress.mood >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {Math.abs(weeklyProgress.mood.toFixed(1))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Energy Level
                  </p>
                  <p className="text-xs text-gray-500">Average daily energy</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  weeklyProgress.energy >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {weeklyProgress.energy >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {Math.abs(weeklyProgress.energy)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Journal Entries
                  </p>
                  <p className="text-xs text-gray-500">Consistency change</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  weeklyProgress.entries >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {weeklyProgress.entries >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {Math.abs(weeklyProgress.entries.toFixed(0))}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Insights Preview */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Recent AI Insights
            </h3>
            <button
              onClick={() =>
                document.querySelector('[data-tab="insights-feed"]')?.click()
              }
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentInsights.length > 0 ? (
            <div className="space-y-3">
              {recentInsights.map((insight, idx) => (
                <div
                  key={insight.id || idx}
                  className="p-3 bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg border border-amber-200"
                >
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {insight.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {!insight.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeInsight(insight.id)}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No insights available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              Your Intelligence Summary
            </h3>
            <p className="text-purple-100 mb-4">
              Based on your journal entries and behavioral patterns, you're
              showing strong emotional awareness with a score of{" "}
              {metrics.emotionalIntelligence}/100. Your growth trajectory is{" "}
              {metrics.growthTrajectory > 70
                ? "excellent"
                : metrics.growthTrajectory > 50
                ? "good"
                : "developing"}
              , indicating{" "}
              {metrics.growthTrajectory > 70
                ? "consistent progress"
                : "room for improvement"}{" "}
              in personal development.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-purple-200">Total Entries</p>
                <p className="text-2xl font-bold">
                  {data?.overview?.totalEntries || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-200">Unique Themes</p>
                <p className="text-2xl font-bold">
                  {data?.themes?.topThemes?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-200">Insights Generated</p>
                <p className="text-2xl font-bold">{insights?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-purple-200">Consistency</p>
                <p className="text-2xl font-bold">
                  {data?.overview?.journalConsistency || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Tooltip */}
      {selectedMetric && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMetric(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">{selectedMetric}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {selectedMetric === "Emotional Intelligence" &&
                "Your emotional intelligence score reflects your ability to recognize, understand, and manage emotions effectively. It's calculated based on sentiment patterns and emotional range in your journal entries."}
              {selectedMetric === "Growth Trajectory" &&
                "This metric shows your personal development progress over time, considering journal consistency and engagement with insights."}
              {selectedMetric === "Pattern Recognition" &&
                "Measures how well you identify recurring themes and patterns in your thoughts and behaviors."}
              {selectedMetric === "Resilience Score" &&
                "Indicates your ability to recover from challenges and maintain emotional stability."}
            </p>
            <button
              onClick={() => setSelectedMetric(null)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceOverviewTab;
