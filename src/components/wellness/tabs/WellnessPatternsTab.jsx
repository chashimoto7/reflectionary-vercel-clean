// frontend/ src/components/wellness/tabs/WellnessPatternsTab.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Sun,
  Moon,
  Cloud,
  Activity,
  Heart,
  Brain,
  Zap,
  Target,
  AlertCircle,
  Info,
  ChevronRight,
  Filter,
  Download,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  getDay,
  addDays,
} from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const WellnessPatternsTab = ({ colors, user }) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // days
  const [wellnessData, setWellnessData] = useState([]);
  const [patterns, setPatterns] = useState({
    daily: {},
    weekly: {},
    correlations: [],
    triggers: [],
    optimal: {},
    warnings: [],
  });
  const [selectedPattern, setSelectedPattern] = useState("overview");

  useEffect(() => {
    loadPatternData();
  }, [user, dateRange]);

  const loadPatternData = async () => {
    try {
      setLoading(true);

      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setWellnessData(data);
        analyzePatterns(data);
      }
    } catch (error) {
      console.error("Error loading pattern data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = (data) => {
    const patterns = {
      daily: analyzeDailyPatterns(data),
      weekly: analyzeWeeklyPatterns(data),
      correlations: findCorrelations(data),
      triggers: identifyTriggers(data),
      optimal: findOptimalConditions(data),
      warnings: detectWarningPatterns(data),
    };
    setPatterns(patterns);
  };

  // Analyze patterns by time of day
  const analyzeDailyPatterns = (data) => {
    const hourlyData = {};

    // Group by hour of day
    data.forEach((entry) => {
      const hour = entry.created_at
        ? new Date(entry.created_at).getHours()
        : 12;
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          energy: [],
          mood: [],
          stress: [],
          count: 0,
        };
      }

      if (entry.energy) hourlyData[hour].energy.push(entry.energy);
      if (entry.mood) hourlyData[hour].mood.push(entry.mood);
      if (entry.stress) hourlyData[hour].stress.push(entry.stress);
      hourlyData[hour].count++;
    });

    // Calculate averages
    const hourlyAverages = [];
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyData[hour] && hourlyData[hour].count > 0) {
        hourlyAverages.push({
          hour,
          time: `${hour}:00`,
          energy: average(hourlyData[hour].energy),
          mood: average(hourlyData[hour].mood),
          stress: average(hourlyData[hour].stress),
          entries: hourlyData[hour].count,
        });
      }
    }

    return {
      hourlyAverages,
      peakEnergyTime: hourlyAverages.reduce(
        (max, curr) => (curr.energy > (max?.energy || 0) ? curr : max),
        null
      ),
      lowestEnergyTime: hourlyAverages.reduce(
        (min, curr) => (curr.energy < (min?.energy || 10) ? curr : min),
        null
      ),
    };
  };

  // Analyze patterns by day of week
  const analyzeWeeklyPatterns = (data) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weeklyData = {};

    // Initialize days
    dayNames.forEach((day, index) => {
      weeklyData[index] = {
        day,
        energy: [],
        mood: [],
        stress: [],
        sleep: [],
        exercise: [],
        count: 0,
      };
    });

    // Group by day of week
    data.forEach((entry) => {
      const dayOfWeek = getDay(new Date(entry.date));

      if (entry.energy) weeklyData[dayOfWeek].energy.push(entry.energy);
      if (entry.mood) weeklyData[dayOfWeek].mood.push(entry.mood);
      if (entry.stress) weeklyData[dayOfWeek].stress.push(entry.stress);
      if (entry.sleep_hours)
        weeklyData[dayOfWeek].sleep.push(entry.sleep_hours);
      if (entry.exercise_minutes)
        weeklyData[dayOfWeek].exercise.push(entry.exercise_minutes);
      weeklyData[dayOfWeek].count++;
    });

    // Calculate averages and create chart data
    const weeklyAverages = Object.values(weeklyData).map((day) => ({
      ...day,
      avgEnergy: average(day.energy),
      avgMood: average(day.mood),
      avgStress: average(day.stress),
      avgSleep: average(day.sleep),
      avgExercise: average(day.exercise),
      wellnessScore: calculateDayScore(day),
    }));

    return {
      weeklyAverages,
      bestDay: weeklyAverages.reduce((best, curr) =>
        curr.wellnessScore > (best?.wellnessScore || 0) ? curr : best
      ),
      worstDay: weeklyAverages.reduce((worst, curr) =>
        curr.wellnessScore < (worst?.wellnessScore || 100) ? curr : worst
      ),
    };
  };

  // Find correlations between different metrics
  const findCorrelations = (data) => {
    const correlations = [];

    // Sleep vs Energy
    const sleepEnergyCorr = calculateCorrelation(
      data.map((d) => d.sleep_hours || 0),
      data.map((d) => d.energy || 0)
    );
    if (Math.abs(sleepEnergyCorr) > 0.3) {
      correlations.push({
        factors: ["Sleep", "Energy"],
        strength: sleepEnergyCorr,
        relationship: sleepEnergyCorr > 0 ? "positive" : "negative",
        insight: `${
          sleepEnergyCorr > 0 ? "More" : "Less"
        } sleep correlates with ${
          sleepEnergyCorr > 0 ? "higher" : "lower"
        } energy levels`,
      });
    }

    // Exercise vs Mood
    const exerciseMoodCorr = calculateCorrelation(
      data.map((d) => d.exercise_minutes || 0),
      data.map((d) => d.mood || 0)
    );
    if (Math.abs(exerciseMoodCorr) > 0.3) {
      correlations.push({
        factors: ["Exercise", "Mood"],
        strength: exerciseMoodCorr,
        relationship: exerciseMoodCorr > 0 ? "positive" : "negative",
        insight: `Exercise shows a ${
          exerciseMoodCorr > 0 ? "positive" : "negative"
        } correlation with mood`,
      });
    }

    // Stress vs Sleep Quality
    const stressSleepCorr = calculateCorrelation(
      data.map((d) => d.stress || 0),
      data.map((d) => d.sleep_quality || 0)
    );
    if (Math.abs(stressSleepCorr) > 0.3) {
      correlations.push({
        factors: ["Stress", "Sleep Quality"],
        strength: stressSleepCorr,
        relationship: stressSleepCorr > 0 ? "positive" : "negative",
        insight: `Higher stress levels ${
          stressSleepCorr < 0 ? "negatively impact" : "correlate with"
        } sleep quality`,
      });
    }

    // Water vs Energy
    const waterEnergyCorr = calculateCorrelation(
      data.map((d) => d.water_glasses || 0),
      data.map((d) => d.energy || 0)
    );
    if (Math.abs(waterEnergyCorr) > 0.3) {
      correlations.push({
        factors: ["Hydration", "Energy"],
        strength: waterEnergyCorr,
        relationship: waterEnergyCorr > 0 ? "positive" : "negative",
        insight: `Better hydration ${
          waterEnergyCorr > 0 ? "boosts" : "affects"
        } energy levels`,
      });
    }

    // Social vs Mood
    const socialMoodCorr = calculateCorrelation(
      data.map((d) => d.social_interactions || 0),
      data.map((d) => d.mood || 0)
    );
    if (Math.abs(socialMoodCorr) > 0.3) {
      correlations.push({
        factors: ["Social Interactions", "Mood"],
        strength: socialMoodCorr,
        relationship: socialMoodCorr > 0 ? "positive" : "negative",
        insight: `Social interactions ${
          socialMoodCorr > 0 ? "improve" : "impact"
        } mood significantly`,
      });
    }

    return correlations.sort(
      (a, b) => Math.abs(b.strength) - Math.abs(a.strength)
    );
  };

  // Identify triggers for good/bad days
  const identifyTriggers = (data) => {
    const triggers = {
      positive: [],
      negative: [],
    };

    // Group data by wellness score
    const goodDays = data.filter((d) => calculateEntryScore(d) > 70);
    const badDays = data.filter((d) => calculateEntryScore(d) < 40);

    // Analyze positive triggers
    if (goodDays.length > 0) {
      const avgGoodDay = {
        sleep: average(goodDays.map((d) => d.sleep_hours || 0)),
        exercise: average(goodDays.map((d) => d.exercise_minutes || 0)),
        water: average(goodDays.map((d) => d.water_glasses || 0)),
        social: average(goodDays.map((d) => d.social_interactions || 0)),
        meditation: average(goodDays.map((d) => d.meditation_minutes || 0)),
        outdoors: average(goodDays.map((d) => d.outdoors_minutes || 0)),
      };

      if (avgGoodDay.sleep > 7.5) {
        triggers.positive.push({
          factor: "Good Sleep",
          icon: Moon,
          description: `${avgGoodDay.sleep.toFixed(1)}+ hours of sleep`,
          impact: "high",
        });
      }
      if (avgGoodDay.exercise > 30) {
        triggers.positive.push({
          factor: "Regular Exercise",
          icon: Activity,
          description: `${Math.round(
            avgGoodDay.exercise
          )}+ minutes of activity`,
          impact: "high",
        });
      }
      if (avgGoodDay.social > 2) {
        triggers.positive.push({
          factor: "Social Connection",
          icon: Heart,
          description: `${Math.round(
            avgGoodDay.social
          )} meaningful interactions`,
          impact: "medium",
        });
      }
    }

    // Analyze negative triggers
    if (badDays.length > 0) {
      const avgBadDay = {
        sleep: average(badDays.map((d) => d.sleep_hours || 0)),
        stress: average(badDays.map((d) => d.stress || 0)),
        screen: average(badDays.map((d) => d.screen_time_hours || 0)),
        caffeine: average(badDays.map((d) => d.caffeine_cups || 0)),
      };

      if (avgBadDay.sleep < 6) {
        triggers.negative.push({
          factor: "Poor Sleep",
          icon: Moon,
          description: `Less than ${avgBadDay.sleep.toFixed(1)} hours`,
          impact: "high",
        });
      }
      if (avgBadDay.stress > 7) {
        triggers.negative.push({
          factor: "High Stress",
          icon: AlertCircle,
          description: `Stress level ${avgBadDay.stress.toFixed(1)}/10`,
          impact: "high",
        });
      }
      if (avgBadDay.screen > 8) {
        triggers.negative.push({
          factor: "Excessive Screen Time",
          icon: Brain,
          description: `${avgBadDay.screen.toFixed(1)}+ hours daily`,
          impact: "medium",
        });
      }
    }

    return triggers;
  };

  // Find optimal conditions
  const findOptimalConditions = (data) => {
    const topDays = data
      .map((d) => ({ ...d, score: calculateEntryScore(d) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.ceil(data.length * 0.2)); // Top 20%

    if (topDays.length === 0) return {};

    return {
      sleep: {
        optimal: average(topDays.map((d) => d.sleep_hours || 0)),
        range: {
          min: Math.min(...topDays.map((d) => d.sleep_hours || 0)),
          max: Math.max(...topDays.map((d) => d.sleep_hours || 0)),
        },
      },
      exercise: {
        optimal: average(topDays.map((d) => d.exercise_minutes || 0)),
        frequency:
          topDays.filter((d) => d.exercise_minutes > 0).length / topDays.length,
      },
      hydration: {
        optimal: average(topDays.map((d) => d.water_glasses || 0)),
        minimum: Math.min(...topDays.map((d) => d.water_glasses || 0)),
      },
      stress: {
        optimal: average(topDays.map((d) => d.stress || 5)),
        maximum: Math.max(...topDays.map((d) => d.stress || 5)),
      },
      activities: getMostCommonActivities(topDays),
    };
  };

  // Detect warning patterns
  const detectWarningPatterns = (data) => {
    const warnings = [];
    const recentData = data.slice(-7); // Last 7 days

    // Check for declining trends
    if (recentData.length >= 3) {
      const moodTrend = calculateTrend(recentData.map((d) => d.mood || 5));
      const energyTrend = calculateTrend(recentData.map((d) => d.energy || 5));
      const sleepTrend = calculateTrend(
        recentData.map((d) => d.sleep_hours || 0)
      );

      if (moodTrend < -0.3) {
        warnings.push({
          type: "trend",
          severity: "medium",
          title: "Declining Mood Trend",
          description: "Your mood has been decreasing over the past week",
          suggestion:
            "Consider scheduling activities that typically boost your mood",
        });
      }

      if (energyTrend < -0.3 && sleepTrend < -0.2) {
        warnings.push({
          type: "compound",
          severity: "high",
          title: "Energy & Sleep Decline",
          description: "Both energy and sleep quality are trending downward",
          suggestion:
            "Prioritize sleep hygiene and consider reducing evening activities",
        });
      }
    }

    // Check for missing data
    const missingDays = 7 - recentData.length;
    if (missingDays > 3) {
      warnings.push({
        type: "tracking",
        severity: "low",
        title: "Inconsistent Tracking",
        description: `${missingDays} days of missing data in the past week`,
        suggestion: "Regular tracking helps identify patterns more accurately",
      });
    }

    // Check for high stress persistence
    const highStressDays = recentData.filter((d) => d.stress > 7).length;
    if (highStressDays >= 4) {
      warnings.push({
        type: "stress",
        severity: "high",
        title: "Persistent High Stress",
        description: `High stress levels detected on ${highStressDays} of the last 7 days`,
        suggestion:
          "Consider stress reduction techniques or speaking with a professional",
      });
    }

    return warnings;
  };

  // Helper functions
  const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const calculateCorrelation = (x, y) => {
    if (x.length !== y.length || x.length < 3) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const correlation =
      (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return isNaN(correlation) ? 0 : correlation;
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 0;
    const xValues = values.map((_, i) => i);
    return calculateCorrelation(xValues, values);
  };

  const calculateEntryScore = (entry) => {
    let score = 50;
    if (entry.mood) score += (entry.mood - 5) * 3;
    if (entry.energy) score += (entry.energy - 5) * 2;
    if (entry.stress) score += (5 - entry.stress) * 2;
    if (entry.sleep_hours >= 7 && entry.sleep_hours <= 9) score += 10;
    if (entry.exercise_minutes > 20) score += 10;
    return Math.min(100, Math.max(0, score));
  };

  const calculateDayScore = (day) => {
    let score = 50;
    score += (day.avgMood - 5) * 3;
    score += (day.avgEnergy - 5) * 2;
    score += (5 - day.avgStress) * 2;
    if (day.avgSleep >= 7) score += 10;
    if (day.avgExercise > 20) score += 10;
    return Math.min(100, Math.max(0, score));
  };

  const getMostCommonActivities = (entries) => {
    const activityCount = {};
    entries.forEach((entry) => {
      if (entry.positive_activities) {
        entry.positive_activities.forEach((activity) => {
          activityCount[activity] = (activityCount[activity] || 0) + 1;
        });
      }
    });

    return Object.entries(activityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity, count]) => ({
        activity,
        frequency: ((count / entries.length) * 100).toFixed(0) + "%",
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Your Wellness Patterns
            </h3>
            <p className="text-purple-200">
              Discover insights from your wellness journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pattern Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "daily", label: "Daily Rhythms", icon: Sun },
            { id: "weekly", label: "Weekly Patterns", icon: Calendar },
            { id: "correlations", label: "Correlations", icon: TrendingUp },
            { id: "triggers", label: "Triggers", icon: Target },
            { id: "optimal", label: "Optimal Conditions", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPattern(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                  selectedPattern === tab.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning Patterns */}
      {patterns.warnings.length > 0 && (
        <div className="space-y-3">
          {patterns.warnings.map((warning, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border ${
                warning.severity === "high"
                  ? "border-red-500/50"
                  : warning.severity === "medium"
                  ? "border-amber-500/50"
                  : "border-white/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    warning.severity === "high"
                      ? "text-red-400"
                      : warning.severity === "medium"
                      ? "text-amber-400"
                      : "text-yellow-400"
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">
                    {warning.title}
                  </h4>
                  <p className="text-purple-200 text-sm mb-2">
                    {warning.description}
                  </p>
                  <p className="text-purple-300 text-sm flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    {warning.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pattern Content */}
      {selectedPattern === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wellness Score Trend */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Wellness Score Trend
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={wellnessData.map((d) => ({
                  date: format(new Date(d.date), "MMM d"),
                  score: calculateEntryScore(d),
                }))}
              >
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.purple}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.purple}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={colors.purple}
                  fill="url(#scoreGradient)"
                  strokeWidth={2}
                />
                <ReferenceLine
                  y={70}
                  stroke={colors.emerald}
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  y={40}
                  stroke={colors.amber}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics Comparison */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Metrics Overview
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart
                data={[
                  {
                    metric: "Energy",
                    value: average(wellnessData.map((d) => d.energy || 0)),
                  },
                  {
                    metric: "Mood",
                    value: average(wellnessData.map((d) => d.mood || 0)),
                  },
                  {
                    metric: "Sleep",
                    value: average(
                      wellnessData.map((d) => (d.sleep_hours || 0) / 1.2)
                    ),
                  },
                  {
                    metric: "Exercise",
                    value: average(
                      wellnessData.map((d) =>
                        Math.min(10, (d.exercise_minutes || 0) / 6)
                      )
                    ),
                  },
                  {
                    metric: "Hydration",
                    value: average(
                      wellnessData.map((d) =>
                        Math.min(10, d.water_glasses || 0)
                      )
                    ),
                  },
                  {
                    metric: "Stress",
                    value: 10 - average(wellnessData.map((d) => d.stress || 5)),
                  },
                ]}
              >
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis
                  dataKey="metric"
                  stroke="rgba(255,255,255,0.5)"
                />
                <PolarRadiusAxis
                  domain={[0, 10]}
                  stroke="rgba(255,255,255,0.2)"
                />
                <Radar
                  name="Average"
                  dataKey="value"
                  stroke={colors.cyan}
                  fill={colors.cyan}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedPattern === "daily" && patterns.daily.hourlyAverages && (
        <div className="space-y-6">
          {/* Energy Throughout the Day */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Daily Energy Patterns
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={patterns.daily.hourlyAverages}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  fill={colors.amber}
                  fillOpacity={0.3}
                  stroke={colors.amber}
                  strokeWidth={2}
                  name="Energy"
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke={colors.rose}
                  strokeWidth={2}
                  dot={{ fill: colors.rose }}
                  name="Mood"
                />
                <Bar
                  dataKey="entries"
                  fill={colors.purple}
                  fillOpacity={0.3}
                  name="Entries"
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {patterns.daily.peakEnergyTime && (
              <div className="mt-4 p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <p className="text-white">
                  <Zap className="w-4 h-4 inline mr-2 text-emerald-400" />
                  Peak energy typically at{" "}
                  <strong>{patterns.daily.peakEnergyTime.time}</strong>(
                  {patterns.daily.peakEnergyTime.energy.toFixed(1)}/10)
                </p>
              </div>
            )}
          </div>

          {/* Stress Patterns */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Stress Throughout the Day
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={patterns.daily.hourlyAverages}>
                <defs>
                  <linearGradient
                    id="stressGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.danger}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.danger}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke={colors.danger}
                  fill="url(#stressGradient)"
                  strokeWidth={2}
                />
                <ReferenceLine
                  y={5}
                  stroke="rgba(255,255,255,0.3)"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedPattern === "weekly" && patterns.weekly.weeklyAverages && (
        <div className="space-y-6">
          {/* Weekly Pattern Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Weekly Wellness Patterns
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patterns.weekly.weeklyAverages}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="wellnessScore" name="Wellness Score">
                  {patterns.weekly.weeklyAverages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.wellnessScore > 70
                          ? colors.emerald
                          : entry.wellnessScore > 40
                          ? colors.amber
                          : colors.danger
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Best and Worst Days */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {patterns.weekly.bestDay && (
                <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <h5 className="font-semibold text-white mb-1">Best Day</h5>
                  <p className="text-emerald-300">
                    {patterns.weekly.bestDay.day}
                  </p>
                  <p className="text-sm text-purple-200">
                    Score: {patterns.weekly.bestDay.wellnessScore.toFixed(0)}
                    /100
                  </p>
                </div>
              )}
              {patterns.weekly.worstDay && (
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <h5 className="font-semibold text-white mb-1">
                    Challenging Day
                  </h5>
                  <p className="text-red-300">{patterns.weekly.worstDay.day}</p>
                  <p className="text-sm text-purple-200">
                    Score: {patterns.weekly.worstDay.wellnessScore.toFixed(0)}
                    /100
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Metrics Breakdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Metrics by Day of Week
            </h4>
            <div className="space-y-3">
              {patterns.weekly.weeklyAverages.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-purple-300 w-24">{day.day}</span>
                  <div className="flex-1 grid grid-cols-5 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {day.avgEnergy.toFixed(1)}
                      </div>
                      <div className="text-purple-400 text-xs">Energy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {day.avgMood.toFixed(1)}
                      </div>
                      <div className="text-purple-400 text-xs">Mood</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {day.avgStress.toFixed(1)}
                      </div>
                      <div className="text-purple-400 text-xs">Stress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {day.avgSleep.toFixed(1)}
                      </div>
                      <div className="text-purple-400 text-xs">Sleep</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {day.avgExercise.toFixed(0)}
                      </div>
                      <div className="text-purple-400 text-xs">Exercise</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedPattern === "correlations" && (
        <div className="space-y-6">
          {patterns.correlations.length > 0 ? (
            <>
              {/* Correlation Strength Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Factor Correlations
                </h4>
                <div className="space-y-4">
                  {patterns.correlations.map((corr, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">
                          {corr.factors[0]} ↔ {corr.factors[1]}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            corr.relationship === "positive"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {corr.relationship === "positive" ? "+" : ""}
                          {(corr.strength * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            corr.relationship === "positive"
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : "bg-gradient-to-r from-red-500 to-red-400"
                          }`}
                          style={{ width: `${Math.abs(corr.strength) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-purple-300 mt-1">
                        {corr.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scatter Plot Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patterns.correlations.slice(0, 2).map((corr, index) => {
                  const factor1 = corr.factors[0]
                    .toLowerCase()
                    .replace(" ", "_");
                  const factor2 = corr.factors[1]
                    .toLowerCase()
                    .replace(" ", "_");

                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                    >
                      <h5 className="text-lg font-semibold text-white mb-4">
                        {corr.factors[0]} vs {corr.factors[1]}
                      </h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.1)"
                          />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name={corr.factors[0]}
                            stroke="rgba(255,255,255,0.5)"
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name={corr.factors[1]}
                            stroke="rgba(255,255,255,0.5)"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(17, 24, 39, 0.9)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "8px",
                            }}
                          />
                          <Scatter
                            name="Data Points"
                            data={wellnessData.map((d) => ({
                              x: d[factor1] || 0,
                              y: d[factor2] || 0,
                            }))}
                            fill={colors.purple}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-200">
                Not enough data to identify correlations yet.
              </p>
              <p className="text-purple-300 text-sm mt-2">
                Keep tracking to discover patterns!
              </p>
            </div>
          )}
        </div>
      )}

      {selectedPattern === "triggers" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positive Triggers */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Positive Triggers
            </h4>
            <div className="space-y-3">
              {patterns.triggers.positive.length > 0 ? (
                patterns.triggers.positive.map((trigger, index) => {
                  const Icon = trigger.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                    >
                      <Icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">
                          {trigger.factor}
                        </h5>
                        <p className="text-sm text-purple-200">
                          {trigger.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          trigger.impact === "high"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {trigger.impact} impact
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-purple-300 text-center py-4">
                  Keep tracking to identify positive triggers
                </p>
              )}
            </div>
          </div>

          {/* Negative Triggers */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Negative Triggers
            </h4>
            <div className="space-y-3">
              {patterns.triggers.negative.length > 0 ? (
                patterns.triggers.negative.map((trigger, index) => {
                  const Icon = trigger.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                    >
                      <Icon className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">
                          {trigger.factor}
                        </h5>
                        <p className="text-sm text-purple-200">
                          {trigger.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          trigger.impact === "high"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {trigger.impact} impact
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-purple-300 text-center py-4">
                  No negative triggers identified yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPattern === "optimal" && patterns.optimal && (
        <div className="space-y-6">
          {/* Optimal Conditions Summary */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Your Optimal Wellness Formula
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {patterns.optimal.sleep && (
                <div className="bg-white/10 rounded-lg p-4">
                  <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                  <h5 className="font-medium text-white mb-1">
                    Sleep Sweet Spot
                  </h5>
                  <p className="text-2xl font-bold text-white">
                    {patterns.optimal.sleep.optimal.toFixed(1)}h
                  </p>
                  <p className="text-sm text-purple-300">
                    Range: {patterns.optimal.sleep.range.min.toFixed(1)}-
                    {patterns.optimal.sleep.range.max.toFixed(1)}h
                  </p>
                </div>
              )}

              {patterns.optimal.exercise && (
                <div className="bg-white/10 rounded-lg p-4">
                  <Activity className="w-5 h-5 text-emerald-400 mb-2" />
                  <h5 className="font-medium text-white mb-1">
                    Exercise Target
                  </h5>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(patterns.optimal.exercise.optimal)}m
                  </p>
                  <p className="text-sm text-purple-300">
                    {(patterns.optimal.exercise.frequency * 100).toFixed(0)}% of
                    best days
                  </p>
                </div>
              )}

              {patterns.optimal.hydration && (
                <div className="bg-white/10 rounded-lg p-4">
                  <Droplets className="w-5 h-5 text-cyan-400 mb-2" />
                  <h5 className="font-medium text-white mb-1">
                    Hydration Goal
                  </h5>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(patterns.optimal.hydration.optimal)}
                  </p>
                  <p className="text-sm text-purple-300">
                    Min: {patterns.optimal.hydration.minimum} glasses
                  </p>
                </div>
              )}

              {patterns.optimal.stress && (
                <div className="bg-white/10 rounded-lg p-4">
                  <Brain className="w-5 h-5 text-purple-400 mb-2" />
                  <h5 className="font-medium text-white mb-1">Stress Level</h5>
                  <p className="text-2xl font-bold text-white">
                    &lt;{patterns.optimal.stress.optimal.toFixed(1)}
                  </p>
                  <p className="text-sm text-purple-300">
                    Max: {patterns.optimal.stress.maximum.toFixed(1)}/10
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Activities */}
          {patterns.optimal.activities &&
            patterns.optimal.activities.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Activities on Your Best Days
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {patterns.optimal.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-purple-600/20 rounded-lg p-3 text-center border border-purple-500/30"
                    >
                      <p className="text-white font-medium capitalize">
                        {activity.activity}
                      </p>
                      <p className="text-purple-300 text-sm">
                        {activity.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Recommendations */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Personalized Recommendations
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-purple-400 mt-0.5" />
                <p className="text-purple-200">
                  Aim for{" "}
                  <strong className="text-white">
                    {patterns.optimal.sleep?.optimal.toFixed(1)} hours
                  </strong>{" "}
                  of sleep to maximize next-day energy and mood
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-purple-400 mt-0.5" />
                <p className="text-purple-200">
                  Schedule important tasks during your{" "}
                  <strong className="text-white">peak energy window</strong>
                  {patterns.daily.peakEnergyTime &&
                    ` around ${patterns.daily.peakEnergyTime.time}`}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-purple-400 mt-0.5" />
                <p className="text-purple-200">
                  Focus wellness efforts on{" "}
                  <strong className="text-white">
                    {patterns.weekly.worstDay?.day}s
                  </strong>
                  , your most challenging day
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessPatternsTab;
