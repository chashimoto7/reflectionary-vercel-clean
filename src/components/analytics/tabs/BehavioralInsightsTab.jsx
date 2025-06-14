// src/components/analytics/tabs/BehavioralInsightsTab.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Treemap,
  ScatterChart,
  Scatter,
  Cell,
  SankeyChart,
  Sankey,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  Users,
  Activity,
  Clock,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  Zap,
  Coffee,
  Moon,
  Sun,
  Home,
  Briefcase,
  Music,
  Book,
  Dumbbell,
  Utensils,
  Brain,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

const BehavioralInsightsTab = ({ data, colors }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [showDetailedPatterns, setShowDetailedPatterns] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Process behavioral data from analytics
  const behavioralData = data || {
    journalingHabits: {},
    activityPatterns: [],
    socialDynamics: {},
  };

  // Calculate behavioural metrics with real exercise data
  const calculateBehaviouralMetrics = () => {
    // Journaling consistency
    const consistency = behavioralData.journalingHabits?.consistency || 0;

    // Activity diversity including real exercise types
    const exerciseTypes = Object.keys(
      behavioralData.exercisePatterns?.exerciseTypes || {}
    ).length;
    const otherActivities = behavioralData.activityPatterns?.length || 0;
    const totalActivities = exerciseTypes + otherActivities;
    const activityDiversity = Math.min(10, (totalActivities / 5) * 10);

    // Social engagement
    const socialMentions = Object.values(
      behavioralData.socialDynamics?.relationships || {}
    ).reduce((sum, count) => sum + count, 0);
    const socialEngagement = Math.min(10, socialMentions / 10);

    // Routine strength based on exercise frequency
    const exerciseFrequency =
      behavioralData.exercisePatterns?.exerciseFrequency || 0;
    const routineStrength = Math.min(10, 5 + exerciseFrequency * 10);

    return {
      consistency: (consistency * 10).toFixed(1),
      activityDiversity: activityDiversity.toFixed(1),
      socialEngagement: socialEngagement.toFixed(1),
      routineStrength: routineStrength.toFixed(1),
      exerciseFrequency: (exerciseFrequency * 100).toFixed(0),
    };
  };

  const metrics = calculateBehaviouralMetrics();

  // Generate time-of-day activity patterns
  const generateTimeOfDayPatterns = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i;
      const activity =
        hour >= 6 && hour <= 9
          ? 60 + Math.random() * 30
          : hour >= 12 && hour <= 13
          ? 40 + Math.random() * 20
          : hour >= 18 && hour <= 21
          ? 70 + Math.random() * 20
          : hour >= 22 || hour <= 5
          ? 10 + Math.random() * 10
          : 30 + Math.random() * 20;

      hours.push({
        hour: `${hour}:00`,
        activity: activity,
        journaling: hour === 7 || hour === 20 ? activity * 1.5 : activity * 0.3,
        mood: 5 + Math.random() * 3,
      });
    }
    return hours;
  };

  const timePatterns = generateTimeOfDayPatterns();

  // Generate activity categories with mood correlations from real data
  const generateActivityCategories = () => {
    // Check if we have real exercise data
    const exerciseData = behavioralData.exercisePatterns?.exerciseTypes || {};
    const hasRealExerciseData = Object.keys(exerciseData).length > 0;

    if (hasRealExerciseData) {
      // Use real exercise data
      const realCategories = [];

      // Add real exercise types
      Object.entries(exerciseData).forEach(([type, stats]) => {
        const iconMap = {
          walking: Dumbbell,
          running: Dumbbell,
          cycling: Dumbbell,
          swimming: Dumbbell,
          yoga: Heart,
          strength: Dumbbell,
          cardio: Activity,
          sports: Users,
          other: Activity,
        };

        realCategories.push({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          icon: iconMap[type] || Activity,
          count: stats.count,
          avgMood: stats.avgMood || 7,
          duration: stats.avgDuration || 0,
          color: colors.accent,
          isReal: true,
        });
      });

      // Add other tracked activities
      const otherCategories = [
        {
          name: "Work/Career",
          icon: Briefcase,
          count: 0,
          avgMood: 6.8,
          color: colors.primary,
        },
        {
          name: "Social",
          icon: Users,
          count: 0,
          avgMood: 7.9,
          color: colors.secondary,
        },
        {
          name: "Self-Care",
          icon: Heart,
          count: 0,
          avgMood: 8.5,
          color: colors.pink,
        },
        {
          name: "Learning",
          icon: Book,
          count: 0,
          avgMood: 7.5,
          color: colors.warning,
        },
        {
          name: "Creative",
          icon: Music,
          count: 0,
          avgMood: 8.1,
          color: colors.indigo,
        },
      ];

      // Merge and sort by frequency
      return [...realCategories, ...otherCategories]
        .filter((cat) => cat.count > 0 || !cat.isReal)
        .sort((a, b) => b.count - a.count);
    }

    // Return projected data if no real data yet
    const categories = [
      {
        name: "Work/Career",
        icon: Briefcase,
        count: 45,
        avgMood: 6.8,
        color: colors.primary,
        isProjected: true,
      },
      {
        name: "Exercise",
        icon: Dumbbell,
        count: 0,
        avgMood: 8.2,
        color: colors.accent,
        isProjected: true,
      },
      {
        name: "Social",
        icon: Users,
        count: 28,
        avgMood: 7.9,
        color: colors.secondary,
        isProjected: true,
      },
      {
        name: "Self-Care",
        icon: Heart,
        count: 25,
        avgMood: 8.5,
        color: colors.pink,
        isProjected: true,
      },
      {
        name: "Learning",
        icon: Book,
        count: 22,
        avgMood: 7.5,
        color: colors.warning,
        isProjected: true,
      },
      {
        name: "Creative",
        icon: Music,
        count: 18,
        avgMood: 8.1,
        color: colors.indigo,
        isProjected: true,
      },
      {
        name: "Rest",
        icon: Moon,
        count: 20,
        avgMood: 7.2,
        color: colors.lime,
        isProjected: true,
      },
      {
        name: "Nutrition",
        icon: Utensils,
        count: 15,
        avgMood: 7.0,
        color: colors.danger,
        isProjected: true,
      },
    ];
    return categories;
  };

  const activityCategories = generateActivityCategories();

  // Generate social interaction patterns
  const generateSocialPatterns = () => {
    return [
      { type: "Family", interactions: 85, sentiment: 8.2, depth: "deep" },
      {
        type: "Close Friends",
        interactions: 62,
        sentiment: 8.5,
        depth: "deep",
      },
      {
        type: "Colleagues",
        interactions: 124,
        sentiment: 6.8,
        depth: "surface",
      },
      {
        type: "Acquaintances",
        interactions: 31,
        sentiment: 7.0,
        depth: "surface",
      },
      {
        type: "Online Community",
        interactions: 45,
        sentiment: 7.5,
        depth: "medium",
      },
    ];
  };

  const socialPatterns = generateSocialPatterns();

  // Generate habit formation data
  const generateHabitData = () => {
    const habits = [
      { habit: "Morning Journaling", consistency: 85, impact: 9.2, streak: 42 },
      { habit: "Evening Reflection", consistency: 72, impact: 8.5, streak: 15 },
      { habit: "Exercise Routine", consistency: 68, impact: 8.8, streak: 23 },
      { habit: "Meditation", consistency: 45, impact: 8.0, streak: 7 },
      { habit: "Reading", consistency: 90, impact: 7.5, streak: 58 },
      { habit: "Social Connection", consistency: 60, impact: 8.2, streak: 12 },
    ];
    return habits;
  };

  const habitData = generateHabitData();

  // Generate weekly behavioral rhythm
  const generateWeeklyRhythm = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      productivity: 50 + Math.random() * 40,
      social: 30 + Math.random() * 50,
      selfCare: 40 + Math.random() * 40,
      mood: 5 + Math.random() * 4,
      energy: 5 + Math.random() * 4,
    }));
  };

  const weeklyRhythm = generateWeeklyRhythm();

  // Activity icon mapper
  const getActivityIcon = (activity) => {
    const iconMap = {
      "Work/Career": Briefcase,
      Exercise: Dumbbell,
      Social: Users,
      "Self-Care": Heart,
      Learning: Book,
      Creative: Music,
      Rest: Moon,
      Nutrition: Utensils,
    };
    return iconMap[activity] || Activity;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={28} />
            Behavioural Insights
          </h2>
          <p className="text-gray-600 mt-1">
            Understand your activity patterns, social dynamics, and habit
            formation
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="day">Daily View</option>
            <option value="week">Weekly Patterns</option>
            <option value="month">Monthly Trends</option>
          </select>

          <button
            onClick={() => setShowDetailedPatterns(!showDetailedPatterns)}
            className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
          >
            {showDetailedPatterns ? <EyeOff size={16} /> : <Eye size={16} />}
            {showDetailedPatterns ? "Simple View" : "Detailed Analysis"}
          </button>
        </div>
      </div>

      {/* Behavioural Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.consistency}</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Consistency Score</h3>
          <p className="text-sm opacity-90">Behavioural regularity</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.activityDiversity}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Activity Diversity</h3>
          <p className="text-sm opacity-90">Range of activities</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <MessageCircle className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.socialEngagement}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Social Engagement</h3>
          <p className="text-sm opacity-90">Connection frequency</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.routineStrength}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Routine Strength</h3>
          <p className="text-sm opacity-90">Habit consistency</p>
        </div>
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time of Day Patterns */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Daily Activity Rhythm
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timePatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  name="General Activity"
                />
                <Area
                  type="monotone"
                  dataKey="journaling"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.5}
                  name="Journaling Activity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sun className="text-yellow-500" size={16} />
              <span className="text-gray-600">Peak: 7-9 AM, 6-9 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="text-purple-500" size={16} />
              <span className="text-gray-600">Low: 10 PM - 6 AM</span>
            </div>
          </div>
        </div>

        {/* Activity Categories with Mood Impact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-purple-600" size={20} />
            Activities & Mood Impact
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="count"
                  name="Frequency"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Frequency",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="avgMood"
                  name="Average Mood"
                  tick={{ fontSize: 12 }}
                  domain={[5, 10]}
                  label={{
                    value: "Mood Impact",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Average Mood")
                      return [value.toFixed(1), "Mood"];
                    return [value, name];
                  }}
                />
                <Scatter name="Activities" data={activityCategories}>
                  {activityCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {activityCategories.slice(0, 4).map((category, i) => {
              const IconComponent = category.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <IconComponent size={14} className="text-gray-600" />
                  <span className="text-gray-700">{category.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Habit Formation Tracking */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="text-green-600" size={20} />
          Habit Formation & Impact
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={habitData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="habit"
                type="category"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Impact")
                    return [value.toFixed(1), "Mood Impact"];
                  if (name === "Consistency") return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Bar
                dataKey="consistency"
                fill={colors.primary}
                fillOpacity={0.8}
                name="Consistency"
              />
              <Line
                type="monotone"
                dataKey="impact"
                stroke={colors.accent}
                strokeWidth={3}
                dot={{ fill: colors.accent, r: 6 }}
                name="Impact"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {habitData.slice(0, 3).map((habit, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {habit.habit}
                </span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {habit.streak} days
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Consistency: {habit.consistency}% • Impact:{" "}
                {habit.impact.toFixed(1)}/10
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Patterns Section */}
      {showDetailedPatterns && (
        <div className="space-y-8 mb-8">
          {/* Social Dynamics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-pink-600" size={20} />
              Social Connection Patterns
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={socialPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="interactions"
                      fill={colors.secondary}
                      name="Interactions"
                    />
                    <Bar
                      dataKey="sentiment"
                      fill={colors.pink}
                      name="Sentiment Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Connection Quality Analysis
                </h4>
                {socialPatterns.map((pattern, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 text-sm">
                        {pattern.type}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        {pattern.interactions} interactions • {pattern.depth}{" "}
                        connection
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-purple-600">
                        {pattern.sentiment.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">sentiment</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Behavioural Rhythm */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-amber-600" size={20} />
              Weekly Behavioural Rhythm
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={weeklyRhythm}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="day" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Productivity"
                    dataKey="productivity"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Social"
                    dataKey="social"
                    stroke={colors.secondary}
                    fill={colors.secondary}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Self-Care"
                    dataKey="selfCare"
                    stroke={colors.pink}
                    fill={colors.pink}
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-600">Most Productive</div>
                <div className="font-semibold text-purple-600">Wednesday</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Most Social</div>
                <div className="font-semibold text-blue-600">Friday</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Best Self-Care</div>
                <div className="font-semibold text-pink-600">Sunday</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Behavioural Insights Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Brain className="text-blue-600" size={20} />
          Personalised Behavioural Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Optimal Performance Windows
                </h4>
                <p className="text-blue-700 text-sm">
                  Your peak productivity occurs between 7-9 AM and 6-8 PM.
                  Consider scheduling important tasks during these windows.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">
                  Activity-Mood Connection
                </h4>
                <p className="text-purple-700 text-sm">
                  Exercise and creative activities show the strongest positive
                  correlation with your mood. Prioritise these for emotional
                  wellbeing.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-pink-900 mb-1">
                  Social Energy Patterns
                </h4>
                <p className="text-pink-700 text-sm">
                  Family interactions provide the highest emotional return.
                  You're most socially energised on Fridays and weekends.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Habit Optimisation
                </h4>
                <p className="text-green-700 text-sm">
                  Your morning journaling habit shows the highest impact on
                  overall wellbeing. Consider protecting this routine above
                  others.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp
              className="text-blue-600 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Behavioural Growth Opportunity
              </h4>
              <p className="text-blue-700 text-sm">
                Your meditation habit shows high impact potential but low
                consistency (45%). Increasing this to 70% could significantly
                improve your stress management and emotional regulation based on
                your patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehavioralInsightsTab;
