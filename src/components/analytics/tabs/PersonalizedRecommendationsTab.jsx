// frontend/ src/components/analytics/tabs/PersonalizedRecommendationsTab.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  Sparkles,
  Brain,
  Heart,
  Target,
  Activity,
  MessageCircle,
  Calendar,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  BookOpen,
  Coffee,
  Moon,
  Sun,
  Users,
} from "lucide-react";

const PersonalizedRecommendationsTab = ({ data, colors, insights, userId }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [completedActions, setCompletedActions] = useState([]);

  // Extract recommendations
  const recommendations =
    data?.recommendations || generateSampleRecommendations();
  const actionPlan = data?.actionPlan || generateActionPlan();
  const habits = data?.suggestedHabits || generateSuggestedHabits();

  const handleActionComplete = (actionId) => {
    setCompletedActions([...completedActions, actionId]);
    // In real app, this would update the database
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-100 mb-1">
            Your Personalized Action Plan
          </h3>
          <p className="text-sm text-purple-300">
            AI-curated recommendations based on your unique patterns and goals
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Recommendations</option>
          <option value="emotional">Emotional Wellness</option>
          <option value="goals">Goal Achievement</option>
          <option value="wellness">Physical Wellness</option>
          <option value="productivity">Productivity</option>
          <option value="growth">Personal Growth</option>
        </select>
      </div>

      {/* Priority Recommendations */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-600/40">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-purple-100">
              Top 3 Priority Actions This Week
            </h4>
            <p className="text-sm text-purple-300">
              Focus on these for maximum impact
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.priority.map((rec, index) => (
            <PriorityCard
              key={index}
              recommendation={rec}
              index={index + 1}
              colors={colors}
              onComplete={handleActionComplete}
              isCompleted={completedActions.includes(rec.id)}
            />
          ))}
        </div>
      </div>

      {/* Habit Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Habits to Form */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Recommended Habits
          </h4>
          <div className="space-y-3">
            {habits.map((habit, index) => (
              <HabitCard key={index} habit={habit} colors={colors} />
            ))}
          </div>
        </div>

        {/* Optimal Schedule */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Your Optimal Daily Schedule
          </h4>
          <div className="space-y-3">
            <ScheduleItem
              time="8:00 - 9:00 AM"
              activity="Morning Journaling"
              icon={BookOpen}
              reason="Peak creativity hours"
              color={colors.purple}
            />
            <ScheduleItem
              time="9:00 - 11:00 AM"
              activity="Deep Work / Goals"
              icon={Target}
              reason="Highest focus period"
              color={colors.cyan}
            />
            <ScheduleItem
              time="2:00 - 3:00 PM"
              activity="Wellness Check-in"
              icon={Heart}
              reason="Energy renewal time"
              color={colors.rose}
            />
            <ScheduleItem
              time="8:00 - 9:00 PM"
              activity="Reflectionarian Session"
              icon={MessageCircle}
              reason="Best for introspection"
              color={colors.emerald}
            />
          </div>
        </div>
      </div>

      {/* Category-Based Recommendations */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Detailed Recommendations by Category
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.categories
            .filter(
              (cat) =>
                selectedCategory === "all" || cat.type === selectedCategory
            )
            .map((category, index) => (
              <CategoryCard key={index} category={category} colors={colors} />
            ))}
        </div>
      </div>

      {/* Impact Visualization */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Projected Impact of Recommendations
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getImpactData()}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="area"
              stroke={colors.purple}
              tick={{ fill: colors.purple, fontSize: 12 }}
            />
            <YAxis stroke={colors.purple} tick={{ fill: colors.purple }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(139,92,246,0.5)",
                borderRadius: "8px",
              }}
              formatter={(value) => `${value}% improvement`}
            />
            <Bar
              dataKey="current"
              fill={colors.purple}
              radius={[8, 8, 0, 0]}
              fillOpacity={0.6}
            />
            <Bar dataKey="projected" fill={colors.pink} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Action Plan Summary */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Your 30-Day Action Plan
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {actionPlan.map((week, index) => (
            <WeekCard
              key={index}
              week={week}
              weekNumber={index + 1}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Actions Available"
          value={recommendations.totalActions || 24}
          icon={Lightbulb}
          color={colors.purple}
        />
        <MetricCard
          label="Completed Today"
          value={completedActions.length}
          icon={CheckCircle}
          color={colors.emerald}
        />
        <MetricCard
          label="Success Rate"
          value="87%"
          icon={TrendingUp}
          color={colors.cyan}
        />
        <MetricCard
          label="Impact Score"
          value="9.2/10"
          icon={Star}
          color={colors.amber}
        />
      </div>
    </div>
  );
};

// Priority Card Component
const PriorityCard = ({
  recommendation,
  index,
  colors,
  onComplete,
  isCompleted,
}) => {
  return (
    <div
      className={`backdrop-blur-xl ${
        isCompleted ? "bg-green-500/10" : "bg-white/5"
      } rounded-xl border ${
        isCompleted ? "border-green-500/30" : "border-white/10"
      } p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: `${colors.purple}40`,
              color: colors.purple,
            }}
          >
            {index}
          </div>
          <h5 className="font-semibold text-purple-100">
            {recommendation.title}
          </h5>
        </div>
        {!isCompleted && (
          <button
            onClick={() => onComplete(recommendation.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </button>
        )}
      </div>
      <p className="text-sm text-purple-300 mb-3">
        {recommendation.description}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-400">Impact: {recommendation.impact}</span>
        <span className="text-purple-400">
          Time: {recommendation.timeRequired}
        </span>
      </div>
    </div>
  );
};

// Habit Card Component
const HabitCard = ({ habit, colors }) => {
  const getIcon = () => {
    switch (habit.type) {
      case "morning":
        return Sun;
      case "evening":
        return Moon;
      case "wellness":
        return Heart;
      case "productivity":
        return Zap;
      case "social":
        return Users;
      default:
        return Coffee;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-white/5 rounded-lg">
      <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-100">{habit.name}</p>
        <p className="text-xs text-purple-300 mt-1">{habit.benefit}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${habit.successLikelihood}%` }}
            />
          </div>
          <span className="text-xs text-purple-400">
            {habit.successLikelihood}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Schedule Item Component
const ScheduleItem = ({ time, activity, icon: Icon, reason, color }) => {
  return (
    <div className="flex items-center gap-3 p-3 backdrop-blur-xl bg-white/5 rounded-lg">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-purple-100">{activity}</p>
          <span className="text-xs text-purple-400">{time}</span>
        </div>
        <p className="text-xs text-purple-300 mt-1">{reason}</p>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, colors }) => {
  const getIcon = () => {
    switch (category.type) {
      case "emotional":
        return Heart;
      case "goals":
        return Target;
      case "wellness":
        return Activity;
      case "productivity":
        return Zap;
      case "growth":
        return TrendingUp;
      default:
        return Brain;
    }
  };

  const Icon = getIcon();

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-purple-400" />
        <h5 className="font-medium text-purple-100">{category.name}</h5>
      </div>
      <ul className="space-y-2">
        {category.actions.map((action, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-xs text-purple-300"
          >
            <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Week Card Component
const WeekCard = ({ week, weekNumber, colors }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4">
      <h5 className="font-medium text-purple-100 mb-2">Week {weekNumber}</h5>
      <p className="text-sm text-purple-300 mb-3">{week.focus}</p>
      <div className="space-y-1">
        {week.goals.map((goal, index) => (
          <p key={index} className="text-xs text-purple-400">
            • {goal}
          </p>
        ))}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 p-4 text-center">
      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
      <p className="text-lg font-bold text-purple-100">{value}</p>
      <p className="text-xs text-purple-400">{label}</p>
    </div>
  );
};

// Sample data generators
const generateSampleRecommendations = () => ({
  priority: [
    {
      id: "p1",
      title: "Morning Meditation",
      description:
        "Start with 10-minute guided sessions to improve emotional balance",
      impact: "High",
      timeRequired: "10 min/day",
    },
    {
      id: "p2",
      title: "Weekly Goal Reviews",
      description: "Sunday evening check-ins to boost goal completion by 40%",
      impact: "Very High",
      timeRequired: "30 min/week",
    },
    {
      id: "p3",
      title: "Gratitude Journaling",
      description: "End each day with 3 things you're grateful for",
      impact: "High",
      timeRequired: "5 min/day",
    },
  ],
  categories: [
    {
      type: "emotional",
      name: "Emotional Wellness",
      actions: [
        "Practice emotional labeling during journaling",
        "Use Reflectionarian for weekly emotional check-ins",
        "Track mood patterns with wellness features",
      ],
    },
    {
      type: "goals",
      name: "Goal Achievement",
      actions: [
        "Break large goals into weekly milestones",
        "Review progress every Sunday",
        "Celebrate small wins in your journal",
      ],
    },
    {
      type: "wellness",
      name: "Physical Wellness",
      actions: [
        "Link exercise to mood tracking",
        "Monitor sleep quality impacts",
        "Stay hydrated - track water intake",
      ],
    },
  ],
  totalActions: 24,
});

const generateActionPlan = () => [
  {
    focus: "Foundation Building",
    goals: [
      "Establish morning routine",
      "Set up tracking systems",
      "Define core values",
    ],
  },
  {
    focus: "Momentum Building",
    goals: [
      "Increase journaling frequency",
      "Launch first major goal",
      "Deepen self-awareness",
    ],
  },
  {
    focus: "Pattern Recognition",
    goals: [
      "Identify success patterns",
      "Optimize daily schedule",
      "Address challenges",
    ],
  },
  {
    focus: "Growth Acceleration",
    goals: [
      "Implement advanced strategies",
      "Expand comfort zone",
      "Measure progress",
    ],
  },
];

const generateSuggestedHabits = () => [
  {
    name: "Morning Pages",
    benefit: "Clears mental clutter, boosts creativity by 35%",
    type: "morning",
    successLikelihood: 85,
  },
  {
    name: "Evening Reflection",
    benefit: "Improves self-awareness and sleep quality",
    type: "evening",
    successLikelihood: 78,
  },
  {
    name: "Weekly Wellness Review",
    benefit: "Identifies patterns and optimization opportunities",
    type: "wellness",
    successLikelihood: 82,
  },
];

const getImpactData = () => [
  { area: "Emotional Balance", current: 65, projected: 85 },
  { area: "Goal Achievement", current: 70, projected: 92 },
  { area: "Wellness Score", current: 72, projected: 88 },
  { area: "Self-Awareness", current: 68, projected: 90 },
  { area: "Productivity", current: 75, projected: 87 },
];

export default PersonalizedRecommendationsTab;
