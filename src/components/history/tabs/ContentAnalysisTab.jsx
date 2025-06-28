// src/components/history/tabs/ContentAnalysisTab.jsx
import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
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
} from "recharts";
import {
  BookOpen,
  Hash,
  TrendingUp,
  Calendar,
  Filter,
  Info,
  Eye,
  Zap,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  FileText,
} from "lucide-react";

const ContentAnalysisTab = ({ entries, analytics, colors }) => {
  const [analysisView, setAnalysisView] = useState("overview"); // overview, topics, depth, evolution
  const [timeRange, setTimeRange] = useState("all");
  const [showComplexityInfo, setShowComplexityInfo] = useState(false);

  // Helper functions
  const getTopWords = (entries, excludeCommon = true) => {
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "up",
      "about",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "under",
      "again",
      "further",
      "then",
      "once",
      "i",
      "me",
      "my",
      "we",
      "our",
      "you",
      "your",
      "he",
      "she",
      "it",
      "they",
      "them",
      "that",
      "this",
      "these",
      "those",
      "am",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "may",
      "might",
      "must",
      "can",
      "cant",
      "dont",
      "ive",
      "im",
      "id",
      "ill",
    ]);

    const wordFreq = {};

    entries.forEach((entry) => {
      const words = (entry.decryptedContent || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2);

      words.forEach((word) => {
        if (!excludeCommon || !commonWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  };

  // Process content data
  const contentData = useMemo(() => {
    let filteredEntries = entries;

    if (timeRange !== "all") {
      const cutoffDate = new Date();
      const days =
        timeRange === "30days" ? 30 : timeRange === "90days" ? 90 : 365;
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredEntries = entries.filter(
        (entry) => new Date(entry.created_at) > cutoffDate
      );
    }

    // Topic analysis (simplified - in real app would use AI)
    const topics = {};
    const themes = {};

    filteredEntries.forEach((entry) => {
      if (entry.theme) {
        themes[entry.theme] = (themes[entry.theme] || 0) + 1;
      }

      // Simple topic detection based on keywords
      const content = (entry.decryptedContent || "").toLowerCase();
      if (
        content.includes("work") ||
        content.includes("job") ||
        content.includes("career")
      ) {
        topics["Work/Career"] = (topics["Work/Career"] || 0) + 1;
      }
      if (
        content.includes("family") ||
        content.includes("friend") ||
        content.includes("relationship")
      ) {
        topics["Relationships"] = (topics["Relationships"] || 0) + 1;
      }
      if (
        content.includes("health") ||
        content.includes("exercise") ||
        content.includes("sleep")
      ) {
        topics["Health"] = (topics["Health"] || 0) + 1;
      }
      if (
        content.includes("goal") ||
        content.includes("future") ||
        content.includes("plan")
      ) {
        topics["Goals/Future"] = (topics["Goals/Future"] || 0) + 1;
      }
      if (
        content.includes("grateful") ||
        content.includes("thankful") ||
        content.includes("appreciate")
      ) {
        topics["Gratitude"] = (topics["Gratitude"] || 0) + 1;
      }
    });

    const topicData = Object.entries(topics)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / filteredEntries.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const themeData = Object.entries(themes)
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: Math.round((count / filteredEntries.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topics: topicData,
      themes: themeData,
      totalEntries: filteredEntries.length,
      topWords: getTopWords(filteredEntries),
    };
  }, [entries, timeRange]);

  // Calculate content depth metrics
  const depthMetrics = useMemo(() => {
    const metrics = entries.map((entry) => {
      const content = entry.decryptedContent || "";
      const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
      const sentenceCount = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0).length;
      const avgWordsPerSentence =
        sentenceCount > 0 ? wordCount / sentenceCount : 0;

      // Simple complexity score based on word and sentence length
      const complexityScore = Math.min(
        100,
        avgWordsPerSentence * 3 + wordCount / 10
      );

      return {
        date: new Date(entry.created_at).toLocaleDateString(),
        wordCount,
        sentenceCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence),
        complexityScore: Math.round(complexityScore),
        hasPrompt: !!entry.decryptedPrompt,
      };
    });

    return metrics;
  }, [entries]);

  // Topic evolution over time
  const topicEvolution = useMemo(() => {
    const monthlyTopics = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyTopics[monthKey]) {
        monthlyTopics[monthKey] = {
          Work: 0,
          Relationships: 0,
          Health: 0,
          Goals: 0,
          Personal: 0,
        };
      }

      const content = (entry.decryptedContent || "").toLowerCase();
      if (content.includes("work") || content.includes("job"))
        monthlyTopics[monthKey].Work++;
      if (content.includes("family") || content.includes("friend"))
        monthlyTopics[monthKey].Relationships++;
      if (content.includes("health") || content.includes("exercise"))
        monthlyTopics[monthKey].Health++;
      if (content.includes("goal") || content.includes("future"))
        monthlyTopics[monthKey].Goals++;
      monthlyTopics[monthKey].Personal++; // All entries contribute to personal growth
    });

    return Object.entries(monthlyTopics)
      .map(([month, topics]) => ({
        month,
        displayMonth: new Date(month + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        ...topics,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [entries]);

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

  const COLORS = [
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Analysis</h2>
          <p className="text-gray-400 mt-1">
            Discover what you write about and how your content evolves
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="365days">Last Year</option>
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "topics", label: "Topics", icon: Hash },
          { id: "depth", label: "Depth", icon: BookOpen },
          { id: "evolution", label: "Evolution", icon: TrendingUp },
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setAnalysisView(view.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded transition ${
                analysisView === view.id
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Content Views */}
      {analysisView === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topic Distribution */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Topic Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentData.topics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ topic, percentage }) => `${topic} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {contentData.topics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Words */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Most Used Words
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentData.topWords.slice(0, 10)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="word"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {analysisView === "topics" && (
        <div className="space-y-6">
          {/* Topic Details */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Topic Analysis
            </h3>
            <div className="space-y-3">
              {contentData.topics.map((topic, index) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {topic.count} entries
                    </span>
                    <div className="w-32 bg-white/10 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${topic.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {topic.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Distribution */}
          {contentData.themes.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Theme Usage
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contentData.themes.map((theme, index) => (
                  <div
                    key={theme.theme}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <p className="font-medium text-purple-300">{theme.theme}</p>
                    <p className="text-sm text-gray-400">
                      {theme.count} entries ({theme.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysisView === "depth" && (
        <div className="space-y-6">
          {/* Content Depth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">
                  Avg Entry Length
                </h4>
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round(
                  depthMetrics.reduce((sum, m) => sum + m.wordCount, 0) /
                    depthMetrics.length
                )}
              </p>
              <p className="text-xs text-gray-400">words per entry</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">
                  Avg Complexity
                </h4>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-400" />
                  <button
                    onClick={() => setShowComplexityInfo(!showComplexityInfo)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round(
                  depthMetrics.reduce((sum, m) => sum + m.complexityScore, 0) /
                    depthMetrics.length
                )}
              </p>
              <p className="text-xs text-gray-400">complexity score</p>

              {showComplexityInfo && (
                <div className="mt-3 p-3 bg-purple-600/20 rounded-lg text-xs text-gray-300">
                  <p className="font-medium text-purple-300 mb-1">
                    Complexity Score (0-100)
                  </p>
                  <p>
                    Measures sentence variety, vocabulary richness, and thought
                    structure. Higher scores indicate more sophisticated writing
                    patterns.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">
                  Prompt Usage
                </h4>
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round(
                  (depthMetrics.filter((m) => m.hasPrompt).length /
                    depthMetrics.length) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-gray-400">entries use prompts</p>
            </div>
          </div>

          {/* Depth Over Time */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Writing Depth Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depthMetrics.slice(-30)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="wordCount"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6", r: 3 }}
                    name="Word Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="complexityScore"
                    stroke="#EC4899"
                    strokeWidth={2}
                    dot={{ fill: "#EC4899", r: 3 }}
                    name="Complexity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {analysisView === "evolution" && (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Topic Evolution Over Time
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topicEvolution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="displayMonth"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Work"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Relationships"
                  stroke="#EC4899"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Health"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Goals"
                  stroke="#F59E0B"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Personal"
                  stroke="#06B6D4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {["Work", "Relationships", "Health", "Goals", "Personal"].map(
              (topic, index) => (
                <div key={topic} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: [
                        COLORS[0],
                        COLORS[1],
                        COLORS[3],
                        COLORS[4],
                        COLORS[2],
                      ][index],
                    }}
                  />
                  <span className="text-sm text-gray-300">{topic}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAnalysisTab;
