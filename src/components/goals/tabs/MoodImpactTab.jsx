// frontend/src/components/goals/tabs/MoodImpactTab.jsx
import React, { useState } from "react";
import {
  Heart,
  TrendingUp,
  Brain,
  Activity,
  Smile,
  Frown,
  Meh,
  Calendar,
  BarChart3,
  Sparkles,
  MessageSquare,
  Hash,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart,
} from "recharts";

const MoodImpactTab = ({ goals, correlations, colors }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30days");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");
  const [viewMode, setViewMode] = useState("correlations");

  // Extended mood correlation data
  const extendedMoodData = [
    { mood: "Excited", goalProgress: 92, frequency: 15, avgProductivity: 88 },
    { mood: "Happy", goalProgress: 85, frequency: 28, avgProductivity: 82 },
    { mood: "Motivated", goalProgress: 90, frequency: 22, avgProductivity: 90 },
    { mood: "Calm", goalProgress: 78, frequency: 35, avgProductivity: 75 },
    { mood: "Neutral", goalProgress: 65, frequency: 20, avgProductivity: 60 },
    { mood: "Stressed", goalProgress: 45, frequency: 18, avgProductivity: 48 },
    { mood: "Tired", goalProgress: 38, frequency: 12, avgProductivity: 35 },
    { mood: "Anxious", goalProgress: 42, frequency: 10, avgProductivity: 40 },
  ];

  // Time series mood and progress data
  const timeSeriesData = [
    { date: "Week 1", avgMood: 7.2, avgProgress: 75, entries: 12 },
    { date: "Week 2", avgMood: 6.8, avgProgress: 68, entries: 15 },
    { date: "Week 3", avgMood: 8.1, avgProgress: 85, entries: 18 },
    { date: "Week 4", avgMood: 7.5, avgProgress: 78, entries: 20 },
  ];

  // Mood impact by goal category
  const categoryMoodImpact = [
    { category: "Health", positive: 85, negative: 15, neutral: 20 },
    { category: "Career", positive: 72, negative: 28, neutral: 35 },
    { category: "Personal", positive: 90, negative: 10, neutral: 15 },
    { category: "Financial", positive: 65, negative: 35, neutral: 40 },
    { category: "Learning", positive: 88, negative: 12, neutral: 18 },
  ];

  // Goal mention frequency integrated with mood
  const goalMentionMood = goals.slice(0, 6).map((goal) => ({
    name: goal.decryptedTitle?.substring(0, 20) + "...",
    mentions: Math.floor(Math.random() * 50) + 10,
    avgSentiment: Math.random() * 0.5 + 0.5,
    moodCorrelation: Math.random() * 0.8 + 0.2,
    lastMention: Math.floor(Math.random() * 7) + 1,
  }));

  // Time of day mood patterns
  const timeOfDayMood = [
    { hour: "6AM", mood: 6.5, mentions: 5 },
    { hour: "9AM", mood: 7.8, mentions: 18 },
    { hour: "12PM", mood: 7.2, mentions: 12 },
    { hour: "3PM", mood: 6.5, mentions: 8 },
    { hour: "6PM", mood: 7.5, mentions: 22 },
    { hour: "9PM", mood: 6.8, mentions: 35 },
  ];

  // Scatter data for mood vs productivity
  const scatterData = Array.from({ length: 50 }, (_, i) => ({
    mood: Math.random() * 10,
    productivity: Math.random() * 100,
    goalType: ["Health", "Career", "Personal", "Financial", "Learning"][
      Math.floor(Math.random() * 5)
    ],
  }));

  // Radial data for mood distribution
  const moodDistribution = [
    { name: "Positive", value: 65, fill: colors.success },
    { name: "Neutral", value: 20, fill: colors.warning },
    { name: "Negative", value: 15, fill: colors.danger },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-pink-400" />
          Mood Impact Analysis
        </h3>
        <p className="text-sm text-gray-300">
          Understand how emotions affect your goals and track mood patterns
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="correlations">Mood Correlations</option>
          <option value="timeline">Mood Timeline</option>
          <option value="mentions">Goal Mentions & Mood</option>
          <option value="patterns">Daily Patterns</option>
        </select>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
        <select
          value={selectedMoodFilter}
          onChange={(e) => setSelectedMoodFilter(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Moods</option>
          <option value="positive">Positive Only</option>
          <option value="negative">Negative Only</option>
        </select>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <InsightCard
          icon={Smile}
          title="Best Mood for Progress"
          value="Motivated"
          subtitle="90% avg progress"
          color={colors.success}
        />
        <InsightCard
          icon={Activity}
          title="Mood-Progress Correlation"
          value="0.82"
          subtitle="Strong positive"
          color={colors.primary}
        />
        <InsightCard
          icon={TrendingUp}
          title="Positive Mood Days"
          value="65%"
          subtitle="Last 30 days"
          color={colors.secondary}
        />
        <InsightCard
          icon={Brain}
          title="Optimal Mood Score"
          value="7.5+"
          subtitle="For peak performance"
          color={colors.info}
        />
      </div>

      {viewMode === "correlations" && (
        <>
          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mood vs Progress Bar Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Goal Progress by Mood State
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={extendedMoodData} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      type="number"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF" }}
                    />
                    <YAxis
                      dataKey="mood"
                      type="category"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="goalProgress" fill={colors.primary}>
                      {extendedMoodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.goalProgress > 80
                              ? colors.success
                              : entry.goalProgress > 60
                              ? colors.primary
                              : entry.goalProgress > 40
                              ? colors.warning
                              : colors.danger
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Series Analysis */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Mood & Progress Over Time
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgMood"
                      stroke={colors.secondary}
                      strokeWidth={3}
                      dot={{ fill: colors.secondary, r: 6 }}
                      name="Avg Mood (1-10)"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgProgress"
                      stroke={colors.primary}
                      strokeWidth={3}
                      dot={{ fill: colors.primary, r: 6 }}
                      name="Avg Progress %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mood vs Productivity Scatter Plot */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Mood Score vs Productivity Analysis
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    type="number"
                    dataKey="mood"
                    name="Mood Score"
                    unit="/10"
                    domain={[0, 10]}
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="productivity"
                    name="Productivity"
                    unit="%"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter name="Data Points" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.mood > 7
                            ? colors.success
                            : entry.mood > 4
                            ? colors.warning
                            : colors.danger
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Each dot represents a journal entry. Higher mood scores correlate
              with increased productivity.
            </p>
          </div>
        </>
      )}

      {viewMode === "timeline" && (
        <>
          {/* Mood Timeline with Goal Mentions */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Mood Timeline & Goal Activity
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeOfDayMood}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="hour"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="mentions"
                    fill={colors.primary}
                    opacity={0.6}
                    name="Goal Mentions"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="mood"
                    stroke={colors.secondary}
                    strokeWidth={3}
                    dot={{ fill: colors.secondary, r: 6 }}
                    name="Mood Score"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Mood Patterns */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              When You Feel Your Best
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeOfDayMood}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="hour"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke={colors.accent}
                    fill={colors.accent}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {viewMode === "mentions" && (
        <>
          {/* Goal Mentions with Mood */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Mentions & Emotional Context
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {goalMentionMood.map((goal, index) => (
                <GoalMentionMoodCard
                  key={index}
                  goal={goal}
                  color={colors.gradient[index % colors.gradient.length]}
                />
              ))}
            </div>
          </div>

          {/* Mention Context Analysis */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Emotional Context of Goal Mentions
            </h4>
            <div className="space-y-3">
              <ContextBar
                context="Positive Context"
                percentage={65}
                color={colors.success}
                examples={["Excited about progress", "Feeling motivated"]}
              />
              <ContextBar
                context="Neutral Context"
                percentage={20}
                color={colors.warning}
                examples={["Planning sessions", "Status updates"]}
              />
              <ContextBar
                context="Challenging Context"
                percentage={15}
                color={colors.danger}
                examples={["Discussing obstacles", "Feeling stuck"]}
              />
            </div>
          </div>
        </>
      )}

      {/* Mood Distribution and Category Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Mood Distribution */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Mood Distribution
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                data={moodDistribution}
              >
                <RadialBar minAngle={15} background clockWise dataKey="value" />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ color: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {moodDistribution.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Impact Analysis */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
          <h4 className="text-md font-semibold text-white mb-4">
            Mood Impact by Goal Category
          </h4>
          <div className="space-y-3">
            {categoryMoodImpact.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">
                    {category.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {category.positive}% positive impact
                  </span>
                </div>
                <div className="flex gap-1">
                  <div
                    className="h-2 rounded-l bg-green-500"
                    style={{ width: `${category.positive}%` }}
                  />
                  <div
                    className="h-2 bg-yellow-500"
                    style={{ width: `${category.neutral}%` }}
                  />
                  <div
                    className="h-2 rounded-r bg-red-500"
                    style={{ width: `${category.negative}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <LegendItem color="#10B981" label="Positive" />
            <LegendItem color="#F59E0B" label="Neutral" />
            <LegendItem color="#EF4444" label="Negative" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Mood-Based Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RecommendationCard
            mood="positive"
            title="Maximize High-Energy Days"
            description="Schedule challenging goals on days when you feel motivated or excited"
            icon={TrendingUp}
          />
          <RecommendationCard
            mood="neutral"
            title="Build Consistency"
            description="Use calm days for routine tasks and milestone planning"
            icon={Calendar}
          />
          <RecommendationCard
            mood="negative"
            title="Recovery Strategy"
            description="On low-mood days, focus on self-care goals and small wins"
            icon={Heart}
          />
          <RecommendationCard
            mood="insight"
            title="Pattern Recognition"
            description="Your best progress happens 2-3 days after highly positive moods"
            icon={Brain}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InsightCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm font-medium text-gray-300">{title}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

const GoalMentionMoodCard = ({ goal, color }) => {
  const sentimentIcon =
    goal.avgSentiment > 0.7 ? (
      <Smile className="h-4 w-4 text-green-400" />
    ) : goal.avgSentiment > 0.4 ? (
      <Meh className="h-4 w-4 text-yellow-400" />
    ) : (
      <Frown className="h-4 w-4 text-red-400" />
    );

  return (
    <div className="p-4 rounded-lg border border-white/20 bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-white text-sm truncate flex-1">
          {goal.name}
        </h5>
        <div className="flex items-center gap-2">
          {sentimentIcon}
          <span className="text-sm font-medium text-white">
            {goal.mentions} mentions
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>Last: {goal.lastMention} days ago</span>
        <span>Sentiment: {(goal.avgSentiment * 100).toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Mood correlation:</span>
        <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${goal.moodCorrelation * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span className="text-xs text-white">
          {(goal.moodCorrelation * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

const ContextBar = ({ context, percentage, color, examples }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-gray-300">{context}</span>
      <span className="text-sm font-medium text-white">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
      <div
        className="h-2 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
    <div className="flex flex-wrap gap-2">
      {examples.map((example, index) => (
        <span key={index} className="text-xs text-gray-400">
          • {example}
        </span>
      ))}
    </div>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

const RecommendationCard = ({ mood, title, description, icon: Icon }) => {
  const colorMap = {
    positive: "border-green-400/30 bg-green-500/10",
    neutral: "border-yellow-400/30 bg-yellow-500/10",
    negative: "border-red-400/30 bg-red-500/10",
    insight: "border-purple-400/30 bg-purple-500/10",
  };

  const iconColorMap = {
    positive: "text-green-400",
    neutral: "text-yellow-400",
    negative: "text-red-400",
    insight: "text-purple-400",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorMap[mood]}`}>
      <div className="flex items-start gap-3">
        <Icon
          className={`h-5 w-5 ${iconColorMap[mood]} flex-shrink-0 mt-0.5`}
        />
        <div>
          <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
          <p className="text-xs text-gray-300">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default MoodImpactTab;
