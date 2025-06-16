// src/components/wellness/tabs/WellnessGoalsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  Activity,
  Heart,
  Moon,
  Dumbbell,
  Droplets,
  Brain,
  Star,
  Clock,
  Award,
  BarChart3,
  Lightbulb,
  Settings,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

const WellnessGoalsTab = () => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  // Mock wellness goals data
  const wellnessGoals = [
    {
      id: 1,
      title: "Sleep 7+ Hours Nightly",
      category: "sleep",
      target: 7,
      current: 6.8,
      unit: "hours",
      targetType: "minimum",
      priority: "high",
      streak: 12,
      bestStreak: 18,
      progress: 85,
      status: "on-track",
      createdDate: "2024-05-01",
      journalMentions: 23,
      correlatedMetrics: ["mood", "energy", "stress"],
      weeklyData: [
        { week: "Week 1", target: 7, actual: 6.2, mood: 6.5 },
        { week: "Week 2", target: 7, actual: 6.8, mood: 7.1 },
        { week: "Week 3", target: 7, actual: 7.1, mood: 7.8 },
        { week: "Week 4", target: 7, actual: 6.9, mood: 7.5 },
      ],
      insights: [
        "Sleep quality improves mood by avg 1.2 points",
        "Best sleep occurs on weekends (7.8h avg)",
        "Journal mentions 'tired' decrease by 60% when hitting target",
      ],
    },
    {
      id: 2,
      title: "Exercise 4+ Times Per Week",
      category: "exercise",
      target: 4,
      current: 3.2,
      unit: "times/week",
      targetType: "minimum",
      priority: "high",
      streak: 3,
      bestStreak: 8,
      progress: 80,
      status: "needs-attention",
      createdDate: "2024-04-15",
      journalMentions: 31,
      correlatedMetrics: ["energy", "mood", "stress"],
      weeklyData: [
        { week: "Week 1", target: 4, actual: 2, energy: 5.8 },
        { week: "Week 2", target: 4, actual: 4, energy: 7.2 },
        { week: "Week 3", target: 4, actual: 3, energy: 6.5 },
        { week: "Week 4", target: 4, actual: 4, energy: 7.8 },
      ],
      insights: [
        "Exercise days show 18% higher energy levels",
        "Morning workouts correlate with better journal sentiment",
        "Missed sessions often precede stress mentions in journal",
      ],
    },
    {
      id: 3,
      title: "Maintain Daily Mood Above 7",
      category: "mood",
      target: 7,
      current: 7.3,
      unit: "score",
      targetType: "minimum",
      priority: "medium",
      streak: 8,
      bestStreak: 15,
      progress: 95,
      status: "excellent",
      createdDate: "2024-04-01",
      journalMentions: 45,
      correlatedMetrics: ["sleep", "exercise", "stress"],
      weeklyData: [
        { week: "Week 1", target: 7, actual: 6.8, satisfaction: 6.2 },
        { week: "Week 2", target: 7, actual: 7.2, satisfaction: 7.5 },
        { week: "Week 3", target: 7, actual: 7.5, satisfaction: 8.1 },
        { week: "Week 4", target: 7, actual: 7.1, satisfaction: 7.8 },
      ],
      insights: [
        "Mood goal achievement increases life satisfaction by 22%",
        "Journal gratitude mentions 3x higher when mood target met",
        "Weekend mood scores 12% higher than weekdays",
      ],
    },
    {
      id: 4,
      title: "Reduce Daily Stress Below 5",
      category: "stress",
      target: 5,
      current: 4.2,
      unit: "score",
      targetType: "maximum",
      priority: "high",
      streak: 15,
      bestStreak: 22,
      progress: 88,
      status: "excellent",
      createdDate: "2024-03-20",
      journalMentions: 38,
      correlatedMetrics: ["sleep", "exercise", "mood"],
      weeklyData: [
        { week: "Week 1", target: 5, actual: 5.8, coping: 6.2 },
        { week: "Week 2", target: 5, actual: 4.5, coping: 7.1 },
        { week: "Week 3", target: 5, actual: 3.8, coping: 8.2 },
        { week: "Week 4", target: 5, actual: 4.2, coping: 7.8 },
      ],
      insights: [
        "Stress management improves sleep quality by 0.8 hours",
        "Journal reflects better problem-solving when stress controlled",
        "Meditation mentions correlate with stress goal achievement",
      ],
    },
    {
      id: 5,
      title: "Drink 8+ Glasses of Water Daily",
      category: "hydration",
      target: 8,
      current: 6.4,
      unit: "glasses",
      targetType: "minimum",
      priority: "low",
      streak: 0,
      bestStreak: 5,
      progress: 60,
      status: "behind",
      createdDate: "2024-05-15",
      journalMentions: 8,
      correlatedMetrics: ["energy", "mood"],
      weeklyData: [
        { week: "Week 1", target: 8, actual: 5.2, energy: 6.1 },
        { week: "Week 2", target: 8, actual: 6.8, energy: 6.8 },
        { week: "Week 3", target: 8, actual: 7.1, energy: 7.2 },
        { week: "Week 4", target: 8, actual: 6.4, energy: 6.5 },
      ],
      insights: [
        "Proper hydration increases afternoon energy by 15%",
        "Journal mentions 'fatigue' 40% less on well-hydrated days",
        "Water intake correlates with exercise performance",
      ],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "on-track":
        return "text-blue-600 bg-blue-100";
      case "needs-attention":
        return "text-yellow-600 bg-yellow-100";
      case "behind":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "sleep":
        return Moon;
      case "exercise":
        return Dumbbell;
      case "mood":
        return Heart;
      case "stress":
        return Brain;
      case "hydration":
        return Droplets;
      default:
        return Target;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Calculate overall wellness goal progress
  const overallProgress =
    wellnessGoals.reduce((sum, goal) => sum + goal.progress, 0) /
    wellnessGoals.length;

  // Generate goal achievement trends
  const generateGoalTrends = () => {
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const achievedGoals = wellnessGoals.filter((goal) => {
        // Simulate daily achievement based on current progress
        const achievementProbability = goal.progress / 100;
        return Math.random() < achievementProbability;
      }).length;

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        achieved: achievedGoals,
        total: wellnessGoals.length,
        percentage: (achievedGoals / wellnessGoals.length) * 100,
      });
    }
    return data;
  };

  const goalTrends = generateGoalTrends();

  return (
    <div className="space-y-6">
      {/* Header with Overall Progress */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Wellness Goals Integration
            </h2>
            <p className="text-gray-600 mt-1">
              Track wellness goals with AI insights from your journal data
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-sm text-gray-600">Overall Progress</div>
            <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {wellnessGoals.filter((g) => g.status === "excellent").length}
            </div>
            <div className="text-sm text-green-700">Excellent</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {wellnessGoals.filter((g) => g.status === "on-track").length}
            </div>
            <div className="text-sm text-blue-700">On Track</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {
                wellnessGoals.filter((g) => g.status === "needs-attention")
                  .length
              }
            </div>
            <div className="text-sm text-yellow-700">Needs Attention</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {wellnessGoals.filter((g) => g.status === "behind").length}
            </div>
            <div className="text-sm text-red-700">Behind</div>
          </div>
        </div>
      </div>

      {/* Goal Achievement Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          30-Day Goal Achievement Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={goalTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [
                `${value.toFixed(1)}%`,
                "Achievement Rate",
              ]}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", r: 4 }}
              name="Daily Achievement %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wellnessGoals.map((goal) => {
          const Icon = getCategoryIcon(goal.category);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {goal.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          goal.status
                        )}`}
                      >
                        {goal.status
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <Star
                        className={`w-3 h-3 ${getPriorityColor(goal.priority)}`}
                      />
                      <span
                        className={`text-xs ${getPriorityColor(goal.priority)}`}
                      >
                        {goal.priority} priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {goal.current}
                    <span className="text-sm text-gray-500">
                      /{goal.target}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{goal.unit}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      goal.progress >= 80
                        ? "bg-green-500"
                        : goal.progress >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  4-Week Trend
                </h5>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={goal.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                    <Bar dataKey="actual" fill="#8b5cf6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {goal.streak}
                  </div>
                  <div className="text-xs text-gray-600">Current Streak</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {goal.bestStreak}
                  </div>
                  <div className="text-xs text-gray-600">Best Streak</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {goal.journalMentions}
                  </div>
                  <div className="text-xs text-gray-600">Journal Mentions</div>
                </div>
              </div>

              {/* Key Insight */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Key Insight
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      {goal.insights[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedGoal(goal.id)}
                className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View Detailed Analysis →
              </button>
            </div>
          );
        })}
      </div>

      {/* Journal-Goal Correlation Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Journal-Goal Correlation Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Predictive Patterns
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Journal entries mentioning "tired" or "exhausted" precede
                  sleep goal failures by 1.3 days on average.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">
                  Success Indicators
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Gratitude mentions in journal entries correlate with 85%
                  higher wellness goal achievement rates.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Timing Insights</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Morning journal entries with positive sentiment predict 23%
                  better goal completion that day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI-Powered Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Goal Optimization Suggestions
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Adjust Sleep Target
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Consider reducing sleep goal to 6.8h initially - you're
                    close and this builds momentum.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Dumbbell className="w-4 h-4 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Exercise Timing
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Schedule workouts for Tuesday/Thursday - your energy is
                    highest and compliance increases by 40%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Heart className="w-4 h-4 text-purple-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Mood Goal Synergy
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Your mood goal is working well - consider adding a gratitude
                    practice to maintain momentum.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              New Goal Suggestions
            </h4>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Meditation Practice
                    </p>
                    <p className="text-xs text-gray-600">
                      5+ minutes daily - predicted 92% compatibility
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Digital Detox Hours
                    </p>
                    <p className="text-xs text-gray-600">
                      Screen-free evenings - improves sleep quality
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Nature Time
                    </p>
                    <p className="text-xs text-gray-600">
                      15+ minutes outdoors - boosts mood & energy
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Integration with Journal Prompts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Goal-Driven Journal Prompts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Personalized Prompts Based on Your Goals
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">
                  Sleep Reflection
                </p>
                <p className="text-xs text-indigo-700 mt-1 italic">
                  "What factors contributed to my sleep quality last night? How
                  did I feel today as a result?"
                </p>
                <div className="mt-2 text-xs text-indigo-600">
                  Triggered by: Sleep goal performance
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Exercise Motivation
                </p>
                <p className="text-xs text-green-700 mt-1 italic">
                  "What form of movement would bring me joy today? How can I
                  honor my body's needs?"
                </p>
                <div className="mt-2 text-xs text-green-600">
                  Triggered by: Missed exercise sessions
                </div>
              </div>

              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm font-medium text-pink-900">
                  Mood Check-in
                </p>
                <p className="text-xs text-pink-700 mt-1 italic">
                  "What emotions am I experiencing right now? What do they tell
                  me about my needs?"
                </p>
                <div className="mt-2 text-xs text-pink-600">
                  Triggered by: Low mood scores
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Integration Benefits
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Enhanced Self-Awareness
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Goal-specific prompts increase awareness of patterns and
                    triggers by 45%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Improved Goal Achievement
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Users with integrated goal-journal prompts achieve 38%
                    higher success rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Deeper Insights
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Contextual prompts reveal underlying motivations and
                    barriers to wellness goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sustainable Habits
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reflective practice builds intrinsic motivation, leading to
                    lasting behavior change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Goal Analysis Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detailed Goal Analysis
                </h2>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Detailed goal analysis and recommendations would be
                    displayed here, including deeper insights, correlation data,
                    and personalized action plans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Wellness Goal
                </h2>
                <button
                  onClick={() => setShowCreateGoal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-700 text-sm">
                    Goal creation form with categories, targets, priorities, and
                    integration options would be implemented here.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateGoal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowCreateGoal(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Goal Button */}
      <div className="text-center">
        <button
          onClick={() => setShowCreateGoal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Wellness Goal
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Set SMART wellness goals integrated with your journaling practice
        </p>
      </div>
    </div>
  );
};

export default WellnessGoalsTab;
