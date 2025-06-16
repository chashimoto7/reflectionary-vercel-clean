// src/components/history/tabs/GoalConnectionsTab.jsx
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
  Pin,
  Heart,
  Brain,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

const GoalConnectionsTab = ({ entries, goals, colors }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("overview"); // overview, detailed, timeline

  // Calculate goal connections
  const goalConnections = useMemo(() => {
    return calculateGoalConnections(entries, goals);
  }, [entries, goals]);

  // Calculate goal mention timeline
  const goalTimeline = useMemo(() => {
    return calculateGoalTimeline(entries, goals);
  }, [entries, goals]);

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

  const calculateGoalConnections = (entries, goals) => {
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
        moodDistribution: {},
        themeDistribution: {},
        timeline: [],
        lastMention: null,
        avgWordsPerMention: 0,
        consistency: 0,
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

        if (isDirect || hasKeywords) {
          const entryData = {
            ...entry,
            mentionType: isDirect ? "direct" : "keyword",
            relevanceScore: isDirect ? 1.0 : 0.5,
          };

          if (isDirect) {
            connections[goalId].directMentions.push(entryData);
          }
          connections[goalId].relatedEntries.push(entryData);
          connections[goalId].mentionCount += 1;
          connections[goalId].totalWords +=
            entry.decryptedContent?.split(" ").length || 0;

          // Track mood distribution
          if (entry.mood) {
            connections[goalId].moodDistribution[entry.mood] =
              (connections[goalId].moodDistribution[entry.mood] || 0) + 1;
          }

          // Track theme distribution
          if (entry.theme) {
            connections[goalId].themeDistribution[entry.theme] =
              (connections[goalId].themeDistribution[entry.theme] || 0) + 1;
          }

          // Update last mention
          if (
            !connections[goalId].lastMention ||
            new Date(entry.created_at) >
              new Date(connections[goalId].lastMention)
          ) {
            connections[goalId].lastMention = entry.created_at;
          }
        }
      });

      // Calculate averages and consistency
      if (connections[goalId].mentionCount > 0) {
        connections[goalId].avgWordsPerMention = Math.round(
          connections[goalId].totalWords / connections[goalId].mentionCount
        );

        // Calculate consistency (mentions per week over time period)
        const timeSpan = getTimeSpanWeeks(connections[goalId].relatedEntries);
        connections[goalId].consistency =
          timeSpan > 0
            ? (connections[goalId].mentionCount / timeSpan).toFixed(1)
            : 0;
      }
    });

    return connections;
  };

  const calculateGoalTimeline = (entries, goals) => {
    const timeline = {};

    goals.forEach((goal) => {
      const goalTitle = goal.decryptedTitle?.toLowerCase() || "";
      timeline[goal.id] = [];

      entries.forEach((entry) => {
        const content = entry.decryptedContent?.toLowerCase() || "";
        const prompt = entry.decryptedPrompt?.toLowerCase() || "";

        if (content.includes(goalTitle) || prompt.includes(goalTitle)) {
          const date = new Date(entry.created_at);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

          const existing = timeline[goal.id].find(
            (item) => item.month === monthKey
          );
          if (existing) {
            existing.mentions += 1;
            existing.entries.push(entry);
          } else {
            timeline[goal.id].push({
              month: monthKey,
              displayMonth: date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              }),
              mentions: 1,
              entries: [entry],
            });
          }
        }
      });

      timeline[goal.id].sort((a, b) => a.month.localeCompare(b.month));
    });

    return timeline;
  };

  const getTimeSpanWeeks = (entries) => {
    if (entries.length === 0) return 0;

    const dates = entries
      .map((e) => new Date(e.created_at))
      .sort((a, b) => a - b);
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    return Math.ceil((lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000));
  };

  const getTopMood = (moodDist) => {
    if (!moodDist || Object.keys(moodDist).length === 0) return null;
    return Object.entries(moodDist).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getTopTheme = (themeDist) => {
    if (!themeDist || Object.keys(themeDist).length === 0) return null;
    return Object.entries(themeDist).sort((a, b) => b[1] - a[1])[0][0];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {`${item.dataKey}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const GoalCard = ({ connection }) => {
    const {
      goal,
      mentionCount,
      avgWordsPerMention,
      lastMention,
      consistency,
      moodDistribution,
      themeDistribution,
    } = connection;

    return (
      <div
        className={`bg-white border-2 rounded-xl p-6 transition cursor-pointer ${
          selectedGoal?.id === goal.id
            ? "border-purple-500 bg-purple-50"
            : "border-gray-200 hover:border-purple-300"
        }`}
        onClick={() =>
          setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)
        }
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {goal.decryptedTitle}
              </h3>
              {goal.decryptedDescription && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {goal.decryptedDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                goal.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : goal.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {goal.status || "active"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {mentionCount}
            </div>
            <div className="text-xs text-gray-600">Mentions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {avgWordsPerMention}
            </div>
            <div className="text-xs text-gray-600">Avg Words</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getTopMood(moodDistribution) && (
              <span className="flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                <Heart className="h-3 w-3" />
                {getTopMood(moodDistribution)}
              </span>
            )}
            {getTopTheme(themeDistribution) && (
              <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <Brain className="h-3 w-3" />
                {getTopTheme(themeDistribution)}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {consistency} mentions/week
          </div>
        </div>

        {lastMention && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Last mentioned: {new Date(lastMention).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  const GoalDetails = ({ connection }) => {
    const {
      goal,
      relatedEntries,
      directMentions,
      moodDistribution,
      themeDistribution,
    } = connection;

    return (
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Entries related to "{goal.decryptedTitle}"
          </h4>
          <div className="text-sm text-gray-500">
            {relatedEntries.length} total entries
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {directMentions.length}
            </div>
            <div className="text-sm text-gray-600">Direct mentions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {relatedEntries.length - directMentions.length}
            </div>
            <div className="text-sm text-gray-600">Keyword matches</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-emerald-600">
              {Object.keys(moodDistribution).length}
            </div>
            <div className="text-sm text-gray-600">Different moods</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-amber-600">
              {Object.keys(themeDistribution).length}
            </div>
            <div className="text-sm text-gray-600">Different themes</div>
          </div>
        </div>

        {/* Goal timeline */}
        {goalTimeline[goal.id] && goalTimeline[goal.id].length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h5 className="text-md font-semibold text-gray-900 mb-4">
              Mention Timeline
            </h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalTimeline[goal.id]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="mentions"
                    fill={colors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Related entries list */}
        <div className="space-y-3">
          <h5 className="text-md font-semibold text-gray-900">
            Related Entries
          </h5>
          {relatedEntries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      entry.mentionType === "direct"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {entry.mentionType === "direct"
                      ? "Direct mention"
                      : "Keyword match"}
                  </span>
                  {entry.starred && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                  {entry.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                </div>
              </div>

              {entry.decryptedPrompt && (
                <p className="text-sm text-purple-600 italic mb-2">
                  {entry.decryptedPrompt.length > 100
                    ? `${entry.decryptedPrompt.substring(0, 100)}...`
                    : entry.decryptedPrompt}
                </p>
              )}

              <p className="text-sm text-gray-700 line-clamp-2">
                {entry.decryptedContent.length > 200
                  ? `${entry.decryptedContent.substring(0, 200)}...`
                  : entry.decryptedContent}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                      {entry.mood}
                    </span>
                  )}
                  {entry.theme && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {entry.theme}
                    </span>
                  )}
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View full
                </button>
              </div>
            </div>
          ))}

          {relatedEntries.length > 10 && (
            <div className="text-center">
              <button className="text-sm text-purple-600 hover:text-purple-700">
                Show {relatedEntries.length - 10} more entries
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goal Connections</h2>
          <p className="text-gray-600 mt-1">
            Discover how your goals connect with your journal entries
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
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
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Overview Stats */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Goals</p>
                <p className="text-3xl font-bold">{goals.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Goals Mentioned</p>
                <p className="text-3xl font-bold">
                  {
                    Object.values(goalConnections).filter(
                      (c) => c.mentionCount > 0
                    ).length
                  }
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Mentions</p>
                <p className="text-3xl font-bold">
                  {Object.values(goalConnections).reduce(
                    (sum, c) => sum + c.mentionCount,
                    0
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Avg Mentions</p>
                <p className="text-3xl font-bold">
                  {goals.length > 0
                    ? Math.round(
                        Object.values(goalConnections).reduce(
                          (sum, c) => sum + c.mentionCount,
                          0
                        ) / goals.length
                      )
                    : 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-amber-200" />
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {(viewMode === "overview" || viewMode === "detailed") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals
              .filter((goal) => goalConnections[goal.id])
              .sort(
                (a, b) =>
                  goalConnections[b.id].mentionCount -
                  goalConnections[a.id].mentionCount
              )
              .map((goal) => (
                <GoalCard key={goal.id} connection={goalConnections[goal.id]} />
              ))}
          </div>

          {/* No connections message */}
          {filteredGoals.filter(
            (goal) => goalConnections[goal.id]?.mentionCount > 0
          ).length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No goal connections found
              </h3>
              <p className="text-gray-600 mb-4">
                Start mentioning your goals in your journal entries to see
                connections here.
              </p>
            </div>
          )}

          {/* Goal details */}
          {selectedGoal && goalConnections[selectedGoal.id] && (
            <GoalDetails connection={goalConnections[selectedGoal.id]} />
          )}
        </>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-6">
          {/* Timeline chart for top goals */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Goal Mentions Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTimelineData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {getTopGoals().map((goal, index) => (
                    <Line
                      key={goal.id}
                      type="monotone"
                      dataKey={goal.id}
                      stroke={colors.gradient[index % colors.gradient.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {getTopGoals().map((goal, index) => (
                <div key={goal.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        colors.gradient[index % colors.gradient.length],
                    }}
                  />
                  <span className="text-sm text-gray-600">
                    {goal.decryptedTitle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal progress indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(goalConnections)
              .filter((c) => c.mentionCount > 0)
              .sort((a, b) => b.mentionCount - a.mentionCount)
              .slice(0, 6)
              .map((connection) => (
                <div
                  key={connection.goal.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 truncate">
                      {connection.goal.decryptedTitle}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {connection.mentionCount} mentions
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consistency</span>
                      <span className="font-medium">
                        {connection.consistency}/week
                      </span>
                    </div>

                    {connection.lastMention && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last mentioned</span>
                        <span className="text-gray-500">
                          {Math.ceil(
                            (new Date() - new Date(connection.lastMention)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days ago
                        </span>
                      </div>
                    )}

                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (connection.consistency / 2) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions
  function getTimelineData() {
    const allMonths = new Set();
    Object.values(goalTimeline).forEach((timeline) => {
      timeline.forEach((item) => allMonths.add(item.month));
    });

    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map((month) => {
      const data = {
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      };

      getTopGoals().forEach((goal) => {
        const timelineItem = goalTimeline[goal.id]?.find(
          (item) => item.month === month
        );
        data[goal.id] = timelineItem ? timelineItem.mentions : 0;
      });

      return data;
    });
  }

  function getTopGoals() {
    return Object.values(goalConnections)
      .filter((c) => c.mentionCount > 0)
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 5)
      .map((c) => c.goal);
  }
};

export default GoalConnectionsTab;
