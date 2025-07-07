// frontend/ src/components/history/tabs/GoalConnectionsTab.jsx
import React, { useState, useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  TrendingUp,
  Calendar,
  Search,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
} from "lucide-react";

const GoalConnectionsTab = ({ entries, goals, colors }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("overview"); // overview, detailed, timeline

  // Helper functions defined before useMemo
  const getMostFrequent = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return null;
    return Object.entries(obj).sort((a, b) => b[1] - a[1])[0][0];
  };

  // Calculate goal connections
  const goalConnections = useMemo(() => {
    const connections = {};

    goals.forEach((goal) => {
      const goalId = goal.id;
      const goalTitle = goal.decryptedTitle?.toLowerCase() || "";
      const goalKeywords = goalTitle
        .split(" ")
        .filter((word) => word.length > 3);

      connections[goalId] = {
        goal,
        directMentions: [],
        relatedEntries: [],
        mentionCount: 0,
        totalWords: 0,
        progressEntries: [],
        timeline: [],
        lastMention: null,
        avgWordsPerMention: 0,
        consistency: 0,
        completionCorrelation: 0,
      };

      entries.forEach((entry) => {
        const content = entry.decryptedContent?.toLowerCase() || "";
        const prompt = entry.decryptedPrompt?.toLowerCase() || "";

        // Check for direct mentions of goal title
        const isDirect =
          content.includes(goalTitle) || prompt.includes(goalTitle);

        // Check for keyword matches
        const hasKeywords = goalKeywords.some(
          (keyword) => content.includes(keyword) || prompt.includes(keyword)
        );

        // Check for progress indicators
        const hasProgress =
          content.includes("progress") ||
          content.includes("achieved") ||
          content.includes("completed") ||
          content.includes("milestone");

        if (isDirect || hasKeywords) {
          const entryData = {
            ...entry,
            mentionType: isDirect ? "direct" : "keyword",
            relevanceScore: isDirect ? 100 : 50,
            hasProgress,
          };

          connections[goalId].relatedEntries.push(entryData);

          if (isDirect) {
            connections[goalId].directMentions.push(entryData);
          }

          if (hasProgress) {
            connections[goalId].progressEntries.push(entryData);
          }

          connections[goalId].mentionCount++;
          connections[goalId].totalWords += content.split(" ").length;
          connections[goalId].lastMention = entry.created_at;
        }
      });

      // Calculate metrics
      if (connections[goalId].mentionCount > 0) {
        connections[goalId].avgWordsPerMention = Math.round(
          connections[goalId].totalWords / connections[goalId].mentionCount
        );
      }

      // Calculate consistency (mentions per week)
      if (entries.length > 0) {
        const firstEntry = new Date(entries[entries.length - 1].created_at);
        const lastEntry = new Date(entries[0].created_at);
        const weeksDiff = (lastEntry - firstEntry) / (1000 * 60 * 60 * 24 * 7);
        connections[goalId].consistency =
          weeksDiff > 0
            ? (connections[goalId].mentionCount / weeksDiff).toFixed(2)
            : 0;
      }
    });

    return connections;
  }, [entries, goals]);

  // Calculate goal mention timeline
  const goalTimeline = useMemo(() => {
    const timeline = {};

    Object.values(goalConnections).forEach(({ goal, relatedEntries }) => {
      relatedEntries.forEach((entry) => {
        const monthKey = new Date(entry.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
          }
        );

        if (!timeline[monthKey]) {
          timeline[monthKey] = {};
        }

        if (!timeline[monthKey][goal.id]) {
          timeline[monthKey][goal.id] = {
            goalTitle: goal.decryptedTitle,
            mentions: 0,
            progress: 0,
          };
        }

        timeline[monthKey][goal.id].mentions++;
        if (entry.hasProgress) {
          timeline[monthKey][goal.id].progress++;
        }
      });
    });

    return Object.entries(timeline)
      .map(([month, goalData]) => ({
        month,
        ...Object.entries(goalData).reduce((acc, [goalId, data]) => {
          acc[`${data.goalTitle}_mentions`] = data.mentions;
          acc[`${data.goalTitle}_progress`] = data.progress;
          return acc;
        }, {}),
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [goalConnections]);

  // Filter goals based on search
  const filteredGoals = useMemo(() => {
    if (!searchQuery.trim()) return goals;
    return goals.filter(
      (goal) =>
        goal.decryptedTitle
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        goal.decryptedDescription
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [goals, searchQuery]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-purple-500/30 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-300">
              {`${item.name}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"];

  const GoalCard = ({ goal, connection }) => {
    const isSelected = selectedGoal?.id === goal.id;

    return (
      <div
        className={`p-4 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "border-purple-500 bg-purple-600/20"
            : "border-white/20 bg-white/10 hover:border-purple-400/50"
        }`}
        onClick={() =>
          setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)
        }
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {goal.decryptedTitle}
              </h3>
              {goal.decryptedDescription && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {goal.decryptedDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                goal.status === "completed"
                  ? "bg-green-600/20 text-green-400"
                  : goal.status === "active"
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-gray-600/20 text-gray-400"
              }`}
            >
              {goal.status || "active"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Total Mentions</p>
            <p className="text-lg font-semibold text-white">
              {connection.mentionCount}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Progress Updates</p>
            <p className="text-lg font-semibold text-white">
              {connection.progressEntries.length}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Avg Words</p>
            <p className="text-lg font-semibold text-white">
              {connection.avgWordsPerMention}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Weekly Mentions</p>
            <p className="text-lg font-semibold text-white">
              {connection.consistency}
            </p>
          </div>
        </div>

        {connection.lastMention && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-400">
              Last mentioned:{" "}
              <span className="text-gray-300">
                {new Date(connection.lastMention).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  };

  const GoalDetails = ({ connection }) => {
    const { goal, relatedEntries, progressEntries } = connection;

    return (
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">
            Entries related to "{goal.decryptedTitle}"
          </h4>
          <div className="text-sm text-gray-400">
            {relatedEntries.length} total entries
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-600/20 p-4 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-300">
              {connection.directMentions.length}
            </div>
            <div className="text-sm text-purple-200">Direct mentions</div>
          </div>
          <div className="bg-pink-600/20 p-4 rounded-lg border border-pink-500/30">
            <div className="text-2xl font-bold text-pink-300">
              {progressEntries.length}
            </div>
            <div className="text-sm text-pink-200">Progress updates</div>
          </div>
          <div className="bg-emerald-600/20 p-4 rounded-lg border border-emerald-500/30">
            <div className="text-2xl font-bold text-emerald-300">
              {connection.consistency}
            </div>
            <div className="text-sm text-emerald-200">Mentions per week</div>
          </div>
          <div className="bg-amber-600/20 p-4 rounded-lg border border-amber-500/30">
            <div className="text-2xl font-bold text-amber-300">
              {Math.round(
                (progressEntries.length / relatedEntries.length) * 100
              ) || 0}
              %
            </div>
            <div className="text-sm text-amber-200">Entries show progress</div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h5 className="font-medium text-white mb-4">
            Recent Related Entries
          </h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {relatedEntries
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 10)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      {entry.mentionType === "direct" && (
                        <span className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded">
                          Direct
                        </span>
                      )}
                      {entry.hasProgress && (
                        <span className="text-xs px-2 py-0.5 bg-green-600/30 text-green-300 rounded">
                          Progress
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2">
                    {entry.decryptedContent.length > 200
                      ? `${entry.decryptedContent.substring(0, 200)}...`
                      : entry.decryptedContent}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {entry.decryptedContent.split(" ").length} words
                    </span>
                    <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      View full
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Goal Progress Tracking
          </h2>
          <p className="text-gray-400 mt-1">
            Track how your journaling correlates with goal achievement
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "detailed", label: "Detailed" },
            { id: "timeline", label: "Timeline" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-2 text-sm rounded transition ${
                viewMode === mode.id
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Views */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {goals.length}
                </span>
              </div>
              <p className="text-sm text-gray-300">Total Goals</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-2xl font-bold text-white">
                  {
                    Object.values(goalConnections).filter(
                      (c) => c.mentionCount > 0
                    ).length
                  }
                </span>
              </div>
              <p className="text-sm text-gray-300">Goals Tracked</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {goals.filter((g) => g.status === "completed").length}
                </span>
              </div>
              <p className="text-sm text-gray-300">Completed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold text-white">
                  {Math.round(
                    (Object.values(goalConnections).reduce(
                      (sum, c) => sum + c.progressEntries.length,
                      0
                    ) /
                      Math.max(
                        1,
                        Object.values(goalConnections).reduce(
                          (sum, c) => sum + c.mentionCount,
                          0
                        )
                      )) *
                      100
                  ) || 0}
                  %
                </span>
              </div>
              <p className="text-sm text-gray-300">Progress Rate</p>
            </div>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                connection={goalConnections[goal.id]}
              />
            ))}
          </div>

          {selectedGoal && goalConnections[selectedGoal.id] && (
            <GoalDetails connection={goalConnections[selectedGoal.id]} />
          )}
        </div>
      )}

      {viewMode === "detailed" && (
        <div className="space-y-6">
          {/* Goal Progress Chart */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Goal Mention Frequency
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={goals.map((goal, index) => ({
                    name: goal.decryptedTitle,
                    mentions: goalConnections[goal.id]?.mentionCount || 0,
                    progress:
                      goalConnections[goal.id]?.progressEntries.length || 0,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="mentions"
                    fill="#8B5CF6"
                    name="Total Mentions"
                  />
                  <Bar
                    dataKey="progress"
                    fill="#10B981"
                    name="Progress Updates"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goal Completion Correlation */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Journaling Consistency by Goal Status
            </h3>
            <div className="space-y-4">
              {["completed", "active", "paused"].map((status) => {
                const statusGoals = goals.filter(
                  (g) => (g.status || "active") === status
                );
                const avgMentions =
                  statusGoals.length > 0
                    ? statusGoals.reduce(
                        (sum, g) =>
                          sum + (goalConnections[g.id]?.mentionCount || 0),
                        0
                      ) / statusGoals.length
                    : 0;

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status === "completed"
                            ? "bg-green-400"
                            : status === "active"
                            ? "bg-blue-400"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="capitalize text-gray-300">
                        {status} Goals
                      </span>
                      <span className="text-sm text-gray-500">
                        ({statusGoals.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        Avg mentions: {avgMentions.toFixed(1)}
                      </span>
                      <div className="w-32 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            status === "completed"
                              ? "bg-green-400"
                              : status === "active"
                              ? "bg-blue-400"
                              : "bg-gray-400"
                          }`}
                          style={{
                            width: `${Math.min(100, avgMentions * 10)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Goal Mentions Over Time
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goalTimeline}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                {goals.slice(0, 5).map((goal, index) => (
                  <Line
                    key={goal.id}
                    type="monotone"
                    dataKey={`${goal.decryptedTitle}_mentions`}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={goal.decryptedTitle}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {goals.slice(0, 5).map((goal, index) => (
              <div key={goal.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">
                  {goal.decryptedTitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalConnectionsTab;
