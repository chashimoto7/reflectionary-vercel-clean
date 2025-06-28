// src/components/history/tabs/WritingStyleEvolutionTab.jsx
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  TrendingUp,
  Sparkles,
  Hash,
  Type,
  Feather,
  BarChart3,
  Zap,
  Layers,
  ChevronRight,
} from "lucide-react";

const WritingStyleEvolutionTab = ({ entries, analytics, colors }) => {
  const [timeScale, setTimeScale] = useState("monthly"); // weekly, monthly, quarterly
  const [selectedMetric, setSelectedMetric] = useState("vocabulary");

  // Process style evolution data
  const styleEvolutionData = useMemo(() => {
    if (!analytics?.styleEvolution) {
      // Generate sample data for demonstration
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return months.map((month, index) => ({
        month,
        vocabularyDiversity: 65 + index * 3 + Math.random() * 10,
        sentenceComplexity: 70 + index * 2 + Math.random() * 8,
        uniqueWords: 450 + index * 25 + Math.random() * 50,
        avgSentenceLength: 15 + index * 0.5 + Math.random() * 3,
        readabilityScore: 85 - index * 1.5 + Math.random() * 5,
      }));
    }
    return analytics.styleEvolution;
  }, [analytics]);

  // Calculate vocabulary growth metrics
  const vocabularyMetrics = useMemo(() => {
    if (!analytics?.vocabularyMetrics) {
      // Sample data
      return {
        totalUniqueWords: 2847,
        growthRate: 12.5,
        commonWords: [
          { word: "feel", count: 234 },
          { word: "think", count: 189 },
          { word: "today", count: 167 },
          { word: "grateful", count: 145 },
          { word: "learned", count: 132 },
        ],
        rareWords: [
          { word: "serendipitous", count: 3 },
          { word: "ephemeral", count: 2 },
          { word: "cathartic", count: 4 },
          { word: "introspection", count: 5 },
        ],
        lexicalDiversity: 0.73,
      };
    }
    return analytics.vocabularyMetrics;
  }, [analytics]);

  // Style characteristics radar data
  const styleRadarData = useMemo(() => {
    if (!analytics?.styleCharacteristics) {
      return [
        { metric: "Descriptiveness", value: 85 },
        { metric: "Emotional Depth", value: 78 },
        { metric: "Clarity", value: 92 },
        { metric: "Creativity", value: 73 },
        { metric: "Structure", value: 88 },
        { metric: "Voice Consistency", value: 81 },
      ];
    }
    return analytics.styleCharacteristics;
  }, [analytics]);

  // Complexity trends
  const complexityTrends = useMemo(() => {
    if (!analytics?.complexityTrends) {
      // Sample weekly data
      const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
      return weeks.map((week, index) => ({
        week,
        syllablesPerWord: 1.4 + index * 0.02 + Math.random() * 0.1,
        wordsPerSentence: 14 + index * 0.3 + Math.random() * 2,
        paragraphLength: 4 + Math.random() * 2,
        transitionWords: 8 + index * 0.2 + Math.random() * 1,
      }));
    }
    return analytics.complexityTrends;
  }, [analytics]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-purple-500/30 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-300">
              {`${item.name}: ${
                typeof item.value === "number"
                  ? item.value.toFixed(1)
                  : item.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Writing Style Evolution
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Track how your writing voice and style develop over time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
            {["weekly", "monthly", "quarterly"].map((scale) => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`px-3 py-1 text-sm rounded transition ${
                  timeScale === scale
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {scale.charAt(0).toUpperCase() + scale.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">
              Unique Vocabulary
            </h4>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {vocabularyMetrics.totalUniqueWords.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-400 mt-1">
            +{vocabularyMetrics.growthRate}% this month
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">
              Lexical Diversity
            </h4>
            <Hash className="h-4 w-4 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(vocabularyMetrics.lexicalDiversity * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Type-token ratio</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">
              Avg Complexity
            </h4>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {styleEvolutionData[
              styleEvolutionData.length - 1
            ]?.sentenceComplexity.toFixed(0) || 75}
          </p>
          <p className="text-xs text-gray-400 mt-1">Flesch-Kincaid score</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">
              Voice Maturity
            </h4>
            <Feather className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">Level 4</p>
          <p className="text-xs text-gray-400 mt-1">Developing style</p>
        </div>
      </div>

      {/* Main Evolution Chart */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Style Metrics Over Time
          </h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="vocabulary">Vocabulary Diversity</option>
            <option value="complexity">Sentence Complexity</option>
            <option value="readability">Readability Score</option>
            <option value="all">All Metrics</option>
          </select>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === "all" ? (
              <LineChart data={styleEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="vocabularyDiversity"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4 }}
                  name="Vocabulary"
                />
                <Line
                  type="monotone"
                  dataKey="sentenceComplexity"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={{ fill: "#EC4899", r: 4 }}
                  name="Complexity"
                />
                <Line
                  type="monotone"
                  dataKey="readabilityScore"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 4 }}
                  name="Readability"
                />
              </LineChart>
            ) : (
              <AreaChart data={styleEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={
                    selectedMetric === "vocabulary"
                      ? "vocabularyDiversity"
                      : selectedMetric === "complexity"
                      ? "sentenceComplexity"
                      : "readabilityScore"
                  }
                  stroke="#8B5CF6"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Style Characteristics Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Writing Style Profile
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={styleRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar
                  name="Style"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Word Usage Insights */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Vocabulary Insights
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Most Used Words
              </h4>
              <div className="space-y-2">
                {vocabularyMetrics.commonWords
                  .slice(0, 4)
                  .map((word, index) => (
                    <div
                      key={word.word}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-300">{word.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                              width: `${
                                (word.count /
                                  vocabularyMetrics.commonWords[0].count) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">
                          {word.count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Unique Expression
              </h4>
              <div className="flex flex-wrap gap-2">
                {vocabularyMetrics.rareWords.map((word) => (
                  <span
                    key={word.word}
                    className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complexity Breakdown */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Writing Complexity Trends
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexityTrends.slice(-8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="wordsPerSentence"
                fill="#8B5CF6"
                name="Words/Sentence"
              />
              <Bar
                dataKey="transitionWords"
                fill="#EC4899"
                name="Transition Words"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Style Evolution Insights */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-6 rounded-xl border border-white/20">
        <div className="flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Your Writing Style is Evolving!
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Your vocabulary has grown by {vocabularyMetrics.growthRate}% this
              month, and your sentence complexity shows increasing
              sophistication. You're developing a more nuanced writing voice
              with better flow and structure.
            </p>
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <span>View detailed style report</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingStyleEvolutionTab;
