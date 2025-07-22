// frontend/src/components/wellness/tabs/WellnessInsightsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  Star,
  Award,
  Zap,
  Heart,
  Shield,
  Clock,
  Calendar,
  Activity,
  Moon,
  Coffee,
  Users,
  Droplets,
  Wind,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  CheckCircle,
  XCircle,
  X,
  Sun,
  Flame,
  TrendingDown,
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const WellnessInsightsTab = ({ colors, user }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState({
    summary: null,
    keyInsights: [],
    recommendations: [],
    alerts: [],
    achievements: [],
    predictions: [],
    experiments: [],
    reflectionPrompts: [],
  });
  const [wellnessData, setWellnessData] = useState([]);
  const [insightView, setInsightView] = useState("overview");
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [hasData, setHasData] = useState(false);

  // Get backend URL from environment
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  useEffect(() => {
    if (user) {
      loadInsightsData();
    }
  }, [user]);

  const loadInsightsData = async () => {
    try {
      setLoading(true);

      // Load wellness data from backend API
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split("T")[0];

      const response = await fetch(
        `${backendUrl}/api/wellness?user_id=${user.id}&date_from=${thirtyDaysAgo}&include_stats=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wellness data");
      }

      const data = await response.json();

      if (data.entries && data.entries.length > 0) {
        // Transform the data to match the expected format
        const transformedData = data.entries.map((entry) => ({
          id: entry.id,
          date: entry.date,
          mood: entry.data.mood?.overall || 0,
          energy: entry.data.mood?.energy || 0,
          stress: entry.data.mood?.stress || 0,
          sleep_hours: entry.data.sleep?.duration || 0,
          sleep_quality: entry.data.sleep?.quality || 0,
          exercise_minutes: entry.data.exercise?.duration || 0,
          water_glasses: entry.data.nutrition?.water || 0,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
        }));

        setWellnessData(transformedData);
        setHasData(true);

        // Generate insights from the data
        await generateInsights(transformedData);
      } else {
        setWellnessData([]);
        setHasData(false);
        setInsights({
          summary: null,
          keyInsights: [],
          recommendations: [],
          alerts: [],
          achievements: [],
          predictions: [],
          experiments: [],
          reflectionPrompts: [],
        });
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      setWellnessData([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (data) => {
    setGenerating(true);
    try {
      // For now, use client-side analysis
      // In production, this could call an AI API endpoint
      const insights = performAIAnalysis(data);
      setInsights(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Sophisticated AI-style analysis (mock implementation)
  const performAIAnalysis = (data) => {
    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);

    // Calculate trends and patterns
    const trends = analyzeTrends(data);
    const patterns = findPatterns(data);
    const correlations = calculateCorrelations(data);

    // Generate comprehensive insights
    const summary = generateSummary(data, trends);
    const keyInsights = generateKeyInsights(
      data,
      trends,
      patterns,
      correlations
    );
    const recommendations = generateRecommendations(data, trends, patterns);
    const alerts = generateAlerts(data, trends);
    const achievements = findAchievements(data);
    const predictions = generatePredictions(data, trends);
    const experiments = suggestExperiments(data, patterns);
    const reflectionPrompts = generateReflectionPrompts(data, patterns);

    return {
      summary,
      keyInsights,
      recommendations,
      alerts,
      achievements,
      predictions,
      experiments,
      reflectionPrompts,
    };
  };

  // Analysis helper functions
  const analyzeTrends = (data) => {
    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);

    return {
      energy: calculateTrendDirection(recent.map((d) => d.energy || 0)),
      mood: calculateTrendDirection(recent.map((d) => d.mood || 0)),
      stress: calculateTrendDirection(recent.map((d) => d.stress || 0)),
      sleep: calculateTrendDirection(recent.map((d) => d.sleep_hours || 0)),
      overall: calculateOverallTrend(recent, previous),
    };
  };

  const calculateTrendDirection = (values) => {
    if (values.length < 2) return "stable";
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    const firstAvg = average(first);
    const secondAvg = average(second);

    if (secondAvg > firstAvg * 1.1) return "improving";
    if (secondAvg < firstAvg * 0.9) return "declining";
    return "stable";
  };

  const calculateOverallTrend = (recent, previous) => {
    const recentScore = average(recent.map((d) => calculateWellnessScore(d)));
    const previousScore = average(
      previous.map((d) => calculateWellnessScore(d))
    );
    const change =
      previousScore > 0
        ? ((recentScore - previousScore) / previousScore) * 100
        : 0;

    return {
      direction: change > 5 ? "up" : change < -5 ? "down" : "stable",
      percentage: Math.abs(change),
      score: recentScore,
    };
  };

  const findPatterns = (data) => {
    const patterns = [];

    // Day of week patterns
    const dayScores = {};
    data.forEach((entry) => {
      const day = new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(calculateWellnessScore(entry));
    });

    const bestDay = Object.entries(dayScores).reduce(
      (best, [day, scores]) =>
        average(scores) > average(best[1] || [0]) ? [day, scores] : best,
      ["", []]
    );

    if (bestDay[0]) {
      patterns.push({
        type: "weekly",
        insight: `${bestDay[0]}s are consistently your best days`,
        confidence: "high",
      });
    }

    // Sleep impact pattern
    const goodSleepDays = data.filter(
      (d) => d.sleep_hours >= 7 && d.sleep_hours <= 9
    );
    const poorSleepDays = data.filter((d) => d.sleep_hours < 6);

    if (goodSleepDays.length > 5 && poorSleepDays.length > 3) {
      const goodSleepEnergy = average(goodSleepDays.map((d) => d.energy || 0));
      const poorSleepEnergy = average(poorSleepDays.map((d) => d.energy || 0));

      if (goodSleepEnergy > poorSleepEnergy * 1.3) {
        patterns.push({
          type: "sleep-energy",
          insight: `Good sleep (7-9h) increases your energy by ${Math.round(
            ((goodSleepEnergy - poorSleepEnergy) / poorSleepEnergy) * 100
          )}%`,
          confidence: "high",
        });
      }
    }

    // Exercise frequency pattern
    const exerciseDays = data.filter((d) => d.exercise_minutes > 20).length;
    const exerciseRate = exerciseDays / data.length;

    if (exerciseRate < 0.3) {
      patterns.push({
        type: "exercise",
        insight:
          "Increasing exercise frequency could significantly boost your wellness",
        confidence: "medium",
      });
    }

    return patterns;
  };

  const calculateCorrelations = (data) => {
    const correlations = [];

    // Exercise → Mood correlation
    const exerciseData = data.map((d) => d.exercise_minutes || 0);
    const moodData = data.map((d) => d.mood || 0);
    const exerciseMoodCorr = pearsonCorrelation(exerciseData, moodData);

    if (Math.abs(exerciseMoodCorr) > 0.4) {
      correlations.push({
        factors: ["Exercise", "Mood"],
        strength: exerciseMoodCorr,
        impact: exerciseMoodCorr > 0 ? "positive" : "negative",
      });
    }

    // Stress → Sleep correlation
    const stressData = data.map((d) => d.stress || 0);
    const sleepQualityData = data.map((d) => d.sleep_quality || 0);
    const stressSleepCorr = pearsonCorrelation(stressData, sleepQualityData);

    if (Math.abs(stressSleepCorr) > 0.4) {
      correlations.push({
        factors: ["Stress", "Sleep Quality"],
        strength: stressSleepCorr,
        impact: stressSleepCorr < 0 ? "negative" : "complex",
      });
    }

    return correlations;
  };

  const generateSummary = (data, trends) => {
    const recentScore = average(
      data.slice(-7).map((d) => calculateWellnessScore(d))
    );
    const overallMood = average(data.map((d) => d.mood || 0));
    const consistency = (data.length / 30) * 100;

    return {
      score: Math.round(recentScore),
      trend: trends.overall.direction,
      trendPercentage: trends.overall.percentage,
      highlights: [
        `Overall wellness score: ${Math.round(recentScore)}/100`,
        `Tracking consistency: ${Math.round(consistency)}%`,
        `Average mood: ${overallMood.toFixed(1)}/10`,
        `Primary trend: ${
          trends.overall.direction === "up"
            ? "Improving"
            : trends.overall.direction === "down"
            ? "Declining"
            : "Stable"
        }`,
      ],
    };
  };

  const generateKeyInsights = (data, trends, patterns, correlations) => {
    const insights = [];

    // Trend-based insights
    if (trends.energy === "improving") {
      insights.push({
        id: "energy-trend",
        category: "trend",
        title: "Energy Levels Rising",
        description:
          "Your energy has been consistently improving over the past week",
        impact: "positive",
        icon: Zap,
        color: colors.emerald,
        details:
          "This positive trend suggests your current wellness routine is working well.",
      });
    }

    if (trends.stress === "declining") {
      insights.push({
        id: "stress-trend",
        category: "trend",
        title: "Stress Management Success",
        description: "Your stress levels are decreasing - great job!",
        impact: "positive",
        icon: Shield,
        color: colors.cyan,
        details:
          "Lower stress correlates with better sleep and higher energy in your data.",
      });
    }

    // Pattern-based insights
    patterns.forEach((pattern, index) => {
      if (pattern.confidence === "high") {
        insights.push({
          id: `pattern-${index}`,
          category: "pattern",
          title:
            pattern.type === "weekly"
              ? "Weekly Pattern Detected"
              : "Behavioral Pattern Found",
          description: pattern.insight,
          impact: "informative",
          icon: Calendar,
          color: colors.purple,
          details: `Confidence level: ${pattern.confidence}`,
        });
      }
    });

    // Correlation-based insights
    correlations.forEach((corr, index) => {
      if (Math.abs(corr.strength) > 0.5) {
        insights.push({
          id: `correlation-${index}`,
          category: "correlation",
          title: `Strong ${corr.impact} Correlation`,
          description: `${
            corr.factors[0]
          } significantly affects your ${corr.factors[1].toLowerCase()}`,
          impact: corr.impact,
          icon: TrendingUp,
          color: corr.impact === "positive" ? colors.emerald : colors.amber,
          details: `Correlation strength: ${Math.round(
            Math.abs(corr.strength) * 100
          )}%`,
        });
      }
    });

    // Achievement insights
    const streaks = calculateStreaks(data);
    if (streaks.tracking >= 7) {
      insights.push({
        id: "tracking-streak",
        category: "achievement",
        title: `${streaks.tracking} Day Tracking Streak!`,
        description: "Consistent tracking leads to better insights",
        impact: "positive",
        icon: Flame,
        color: colors.amber,
        details:
          "Keep it up! Regular tracking is key to understanding your patterns.",
      });
    }

    return insights.slice(0, 6); // Return top 6 insights
  };

  const generateRecommendations = (data, trends, patterns) => {
    const recommendations = [];
    const recent = data.slice(-7);

    // Sleep optimization
    const avgSleep = average(recent.map((d) => d.sleep_hours || 0));
    if (avgSleep < 7) {
      recommendations.push({
        id: "sleep-increase",
        priority: "high",
        category: "sleep",
        title: "Prioritize Sleep",
        action: `Aim for 7-8 hours of sleep (currently averaging ${avgSleep.toFixed(
          1
        )}h)`,
        reasoning:
          "Your data shows energy and mood improve significantly with better sleep",
        icon: Moon,
        color: colors.indigo,
        steps: [
          "Set a consistent bedtime 30 minutes earlier",
          "Create a wind-down routine starting at 10 PM",
          "Limit screen time 1 hour before bed",
        ],
      });
    }

    // Exercise recommendations
    const exerciseDays = recent.filter((d) => d.exercise_minutes > 20).length;
    if (exerciseDays < 3) {
      recommendations.push({
        id: "exercise-frequency",
        priority: "medium",
        category: "exercise",
        title: "Increase Movement",
        action: "Add 2-3 more active days per week",
        reasoning:
          "Exercise shows strong positive correlation with your mood and energy",
        icon: Activity,
        color: colors.emerald,
        steps: [
          "Start with 20-minute walks",
          "Schedule exercise at your peak energy time",
          "Track how you feel after each session",
        ],
      });
    }

    // Stress management
    const avgStress = average(recent.map((d) => d.stress || 0));
    if (avgStress > 6) {
      recommendations.push({
        id: "stress-reduction",
        priority: "high",
        category: "stress",
        title: "Manage Stress Levels",
        action: "Implement daily stress reduction techniques",
        reasoning:
          "High stress is impacting your sleep quality and energy levels",
        icon: Brain,
        color: colors.purple,
        steps: [
          "Try 5-minute breathing exercises",
          "Schedule regular breaks during work",
          "Consider meditation or yoga",
        ],
      });
    }

    // Hydration
    const avgWater = average(recent.map((d) => d.water_glasses || 0));
    if (avgWater < 6) {
      recommendations.push({
        id: "hydration-boost",
        priority: "medium",
        category: "hydration",
        title: "Increase Hydration",
        action: `Aim for 8 glasses of water daily (currently ${Math.round(
          avgWater
        )})`,
        reasoning:
          "Better hydration correlates with improved energy in your patterns",
        icon: Droplets,
        color: colors.cyan,
        steps: [
          "Keep a water bottle at your desk",
          "Drink a glass upon waking",
          "Set hourly hydration reminders",
        ],
      });
    }

    return recommendations;
  };

  const generateAlerts = (data, trends) => {
    const alerts = [];
    const recent = data.slice(-7);

    // Declining wellness alert
    if (trends.overall.direction === "down" && trends.overall.percentage > 10) {
      alerts.push({
        id: "wellness-decline",
        severity: "warning",
        title: "Wellness Score Declining",
        message: `Your overall wellness has decreased by ${Math.round(
          trends.overall.percentage
        )}% this week`,
        action:
          "Review recent changes and consider reverting to previous routines",
        icon: TrendingDown,
      });
    }

    // Sleep deprivation alert
    const sleepDeprived = recent.filter((d) => d.sleep_hours < 6).length;
    if (sleepDeprived >= 3) {
      alerts.push({
        id: "sleep-deprivation",
        severity: "high",
        title: "Chronic Sleep Deprivation",
        message: `${sleepDeprived} nights with less than 6 hours of sleep`,
        action: "Prioritize sleep immediately to prevent health impacts",
        icon: AlertCircle,
      });
    }

    // High stress alert
    const highStressDays = recent.filter((d) => d.stress > 7).length;
    if (highStressDays >= 4) {
      alerts.push({
        id: "chronic-stress",
        severity: "high",
        title: "Persistent High Stress",
        message: "Stress levels have been elevated for most of the week",
        action: "Consider stress management techniques or professional support",
        icon: AlertCircle,
      });
    }

    // Inactivity alert
    const inactiveDays = recent.filter(
      (d) => !d.exercise_minutes || d.exercise_minutes < 10
    ).length;
    if (inactiveDays >= 5) {
      alerts.push({
        id: "inactivity",
        severity: "medium",
        title: "Low Physical Activity",
        message: "Minimal exercise detected in the past week",
        action: "Even 15 minutes of daily movement can improve wellness",
        icon: Activity,
      });
    }

    return alerts;
  };

  const findAchievements = (data) => {
    const achievements = [];

    // Check various achievements
    const trackingDays = data.length;
    if (trackingDays >= 30) {
      achievements.push({
        id: "month-tracking",
        title: "30 Day Tracker",
        description: "Tracked wellness for a full month!",
        icon: Award,
        color: colors.amber,
        date: new Date().toISOString(),
      });
    }

    // Perfect week
    const lastWeek = data.slice(-7);
    const perfectWeek =
      lastWeek.length === 7 &&
      lastWeek.every(
        (d) =>
          d.sleep_hours >= 7 && d.exercise_minutes > 20 && d.water_glasses >= 8
      );

    if (perfectWeek) {
      achievements.push({
        id: "perfect-week",
        title: "Perfect Week",
        description: "Hit all wellness goals for 7 days straight!",
        icon: Star,
        color: colors.purple,
        date: new Date().toISOString(),
      });
    }

    // Improvement milestone
    if (data.length >= 14) {
      const firstWeekScore = average(
        data.slice(0, 7).map((d) => calculateWellnessScore(d))
      );
      const lastWeekScore = average(
        lastWeek.map((d) => calculateWellnessScore(d))
      );

      if (lastWeekScore > firstWeekScore * 1.2) {
        achievements.push({
          id: "major-improvement",
          title: "Major Progress",
          description: `Wellness score improved by ${Math.round(
            ((lastWeekScore - firstWeekScore) / firstWeekScore) * 100
          )}%`,
          icon: TrendingUp,
          color: colors.emerald,
          date: new Date().toISOString(),
        });
      }
    }

    return achievements;
  };

  const generatePredictions = (data, trends) => {
    const predictions = [];

    // Next day energy prediction
    const recentEnergy = data.slice(-7).map((d) => d.energy || 0);
    const energyTrend = calculateTrendDirection(recentEnergy);
    const avgEnergy = average(recentEnergy);

    predictions.push({
      id: "tomorrow-energy",
      metric: "Energy",
      prediction:
        energyTrend === "improving"
          ? avgEnergy * 1.1
          : energyTrend === "declining"
          ? avgEnergy * 0.9
          : avgEnergy,
      confidence: recentEnergy.length >= 5 ? "high" : "medium",
      factors: ["Recent sleep quality", "Exercise patterns", "Current trend"],
      icon: Zap,
      trend: energyTrend,
    });

    // Weekly wellness forecast
    const weeklyScores = [];
    for (let i = 0; i < data.length; i += 7) {
      const week = data.slice(i, i + 7);
      if (week.length >= 3) {
        weeklyScores.push(average(week.map((d) => calculateWellnessScore(d))));
      }
    }

    const weeklyTrend = calculateTrendDirection(weeklyScores);
    predictions.push({
      id: "weekly-wellness",
      metric: "Weekly Wellness",
      prediction:
        weeklyTrend === "improving"
          ? "Continued improvement expected"
          : weeklyTrend === "declining"
          ? "Intervention recommended"
          : "Stable trajectory",
      confidence: weeklyScores.length >= 3 ? "high" : "low",
      factors: ["Sleep consistency", "Stress management", "Activity levels"],
      icon: Calendar,
      trend: weeklyTrend,
    });

    // Stress prediction based on patterns
    const dayOfWeek = new Date().getDay();
    const sameDayStress = data
      .filter((d) => new Date(d.date).getDay() === dayOfWeek)
      .map((d) => d.stress || 0);

    if (sameDayStress.length >= 2) {
      predictions.push({
        id: "stress-pattern",
        metric: "Stress Level",
        prediction: average(sameDayStress),
        confidence: sameDayStress.length >= 4 ? "high" : "medium",
        factors: ["Day of week pattern", "Recent stress levels"],
        icon: Brain,
        trend: "pattern-based",
      });
    }

    return predictions;
  };

  const suggestExperiments = (data, patterns) => {
    const experiments = [];

    // Sleep experiment
    const avgSleep = average(data.map((d) => d.sleep_hours || 0));
    if (avgSleep < 7.5) {
      experiments.push({
        id: "sleep-optimization",
        title: "7-Day Sleep Challenge",
        hypothesis: "Increasing sleep by 30 minutes will improve energy by 20%",
        protocol: [
          "Go to bed 30 minutes earlier each night",
          "Track energy levels each morning",
          "Keep other factors constant",
        ],
        duration: 7,
        metrics: ["sleep_hours", "energy", "mood"],
        baseline: {
          sleep: avgSleep,
          energy: average(data.map((d) => d.energy || 0)),
        },
        icon: Moon,
        difficulty: "easy",
      });
    }

    // Morning routine experiment
    experiments.push({
      id: "morning-routine",
      title: "Energizing Morning Routine",
      hypothesis:
        "A consistent morning routine will increase daily energy and mood",
      protocol: [
        "10 minutes of stretching upon waking",
        "Glass of water before coffee",
        "5 minutes of gratitude journaling",
      ],
      duration: 14,
      metrics: ["energy", "mood", "stress"],
      baseline: { energy: average(data.map((d) => d.energy || 0)) },
      icon: Sun,
      difficulty: "medium",
    });

    // Stress reduction experiment
    const avgStress = average(data.map((d) => d.stress || 0));
    if (avgStress > 5) {
      experiments.push({
        id: "stress-reduction",
        title: "Midday Stress Reset",
        hypothesis:
          "5-minute breathing exercises will reduce afternoon stress by 30%",
        protocol: [
          "Set 2 PM daily reminder",
          "5 minutes of box breathing",
          "Rate stress before and after",
        ],
        duration: 10,
        metrics: ["stress", "energy", "mood"],
        baseline: { stress: avgStress },
        icon: Wind,
        difficulty: "easy",
      });
    }

    return experiments;
  };

  const generateReflectionPrompts = (data, patterns) => {
    const prompts = [];
    const recent = data.slice(-7);

    // Energy-based prompt
    const highEnergyDays = recent.filter((d) => d.energy >= 8);
    if (highEnergyDays.length > 0) {
      prompts.push({
        id: "high-energy-reflection",
        prompt:
          "What was different about the days when your energy was highest? What patterns do you notice?",
        category: "energy",
        context: `You had ${highEnergyDays.length} high-energy days this week`,
        followUp: "How can you recreate these conditions more often?",
      });
    }

    // Stress reflection
    const stressVariation =
      Math.max(...recent.map((d) => d.stress || 0)) -
      Math.min(...recent.map((d) => d.stress || 0));
    if (stressVariation > 4) {
      prompts.push({
        id: "stress-variation",
        prompt:
          "Your stress levels varied significantly this week. What triggered the highs and lows?",
        category: "stress",
        context: `Stress ranged from ${Math.min(
          ...recent.map((d) => d.stress || 0)
        )} to ${Math.max(...recent.map((d) => d.stress || 0))}`,
        followUp: "What stress management technique worked best for you?",
      });
    }

    // Pattern-based prompt
    patterns.forEach((pattern) => {
      if (pattern.type === "weekly") {
        prompts.push({
          id: "weekly-pattern",
          prompt: `${pattern.insight}. What makes these days special for you?`,
          category: "patterns",
          context:
            "Understanding your weekly rhythm can help optimize your schedule",
          followUp: "How can you protect and enhance your best days?",
        });
      }
    });

    // Growth prompt
    prompts.push({
      id: "growth-reflection",
      prompt:
        "Looking at your wellness journey this month, what has been your biggest insight about yourself?",
      category: "growth",
      context: "Self-awareness is the foundation of positive change",
      followUp:
        "What one small change could have the biggest impact on your wellbeing?",
    });

    return prompts;
  };

  // Helper functions
  const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const calculateWellnessScore = (entry) => {
    let score = 50;
    if (entry.mood) score += (entry.mood - 5) * 3;
    if (entry.energy) score += (entry.energy - 5) * 2;
    if (entry.stress) score += (5 - entry.stress) * 2;
    if (entry.sleep_hours >= 7 && entry.sleep_hours <= 9) score += 10;
    if (entry.exercise_minutes > 20) score += 10;
    if (entry.water_glasses >= 8) score += 5;
    return Math.min(100, Math.max(0, score));
  };

  const pearsonCorrelation = (x, y) => {
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

  const calculateStreaks = (data) => {
    let trackingStreak = 0;
    let lastDate = null;

    // Sort data by date
    const sorted = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sorted.forEach((entry) => {
      const currentDate = new Date(entry.date);
      if (!lastDate || differenceInDays(currentDate, lastDate) === 1) {
        trackingStreak++;
      } else if (differenceInDays(currentDate, lastDate) > 1) {
        trackingStreak = 1;
      }
      lastDate = currentDate;
    });

    return { tracking: trackingStreak };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300"></div>
      </div>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">
            No Data for AI Insights Yet
          </h3>
          <p className="text-purple-200 mb-6">
            Your AI-powered insights will appear here once you start tracking
            your wellness.
          </p>
          <p className="text-purple-300 text-sm">
            Track for at least 3 days to receive personalized insights and
            recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-400" />
              AI-Powered Insights
            </h3>
            <p className="text-purple-200">
              Personalized analysis of your wellness journey
            </p>
          </div>
          <button
            onClick={() => generateInsights(wellnessData)}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            {generating ? "Analyzing..." : "Refresh Insights"}
          </button>
        </div>

        {/* Insight Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "insights", label: "Key Insights", icon: Lightbulb },
            { id: "recommendations", label: "Recommendations", icon: Target },
            { id: "predictions", label: "Predictions", icon: TrendingUp },
            { id: "experiments", label: "Experiments", icon: Sparkles },
            { id: "reflection", label: "Reflection", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setInsightView(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                  insightView === tab.id
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

      {/* Alerts Section */}
      {insights.alerts && insights.alerts.length > 0 && (
        <div className="space-y-3">
          {insights.alerts.map((alert) => {
            const Icon = alert.icon || AlertCircle;
            return (
              <div
                key={alert.id}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border ${
                  alert.severity === "high"
                    ? "border-red-500/50"
                    : alert.severity === "warning"
                    ? "border-amber-500/50"
                    : "border-yellow-500/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 ${
                      alert.severity === "high"
                        ? "text-red-400"
                        : alert.severity === "warning"
                        ? "text-amber-400"
                        : "text-yellow-400"
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-purple-200 text-sm mb-2">
                      {alert.message}
                    </p>
                    <p className="text-purple-300 text-sm flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {alert.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overview Content */}
      {insightView === "overview" && insights.summary && (
        <div className="space-y-6">
          {/* Wellness Score Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="text-6xl font-bold text-white">
                    {insights.summary.score}
                  </div>
                  <div className="text-purple-200">Wellness Score</div>
                  {insights.summary.trend === "up" && (
                    <ArrowUp className="absolute -right-8 top-0 w-6 h-6 text-emerald-400" />
                  )}
                  {insights.summary.trend === "down" && (
                    <ArrowDown className="absolute -right-8 top-0 w-6 h-6 text-red-400" />
                  )}
                  {insights.summary.trend === "stable" && (
                    <Minus className="absolute -right-8 top-0 w-6 h-6 text-amber-400" />
                  )}
                </div>
                <p className="text-sm text-purple-300 mt-2">
                  {insights.summary.trend === "up"
                    ? "Improving"
                    : insights.summary.trend === "down"
                    ? "Declining"
                    : "Stable"}
                  {insights.summary.trendPercentage > 0 &&
                    ` (${insights.summary.trendPercentage.toFixed(1)}%)`}
                </p>
              </div>

              <div className="col-span-2">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Week at a Glance
                </h4>
                <div className="space-y-2">
                  {insights.summary.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {insights.achievements && insights.achievements.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <Award className="w-8 h-8 text-amber-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {insights.achievements.length}
                </div>
                <div className="text-sm text-purple-200">Achievements</div>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Brain className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {insights.keyInsights.length}
              </div>
              <div className="text-sm text-purple-200">Key Insights</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Target className="w-8 h-8 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {insights.recommendations.length}
              </div>
              <div className="text-sm text-purple-200">Recommendations</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Sparkles className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {insights.experiments.length}
              </div>
              <div className="text-sm text-purple-200">Experiments</div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Wellness Trend
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={wellnessData.map((d) => ({
                  date: format(new Date(d.date), "MMM d"),
                  score: calculateWellnessScore(d),
                }))}
              >
                <defs>
                  <linearGradient
                    id="wellnessGradient"
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
                  fill="url(#wellnessGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Insights Content */}
      {insightView === "insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.keyInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: insight.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-purple-200 text-sm mb-2">
                      {insight.description}
                    </p>
                    <p className="text-purple-300 text-xs">{insight.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations Content */}
      {insightView === "recommendations" && (
        <div className="space-y-4">
          {insights.recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${rec.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: rec.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-lg">
                        {rec.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === "high"
                            ? "bg-red-500/20 text-red-300"
                            : rec.priority === "medium"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-purple-200 mb-3">{rec.action}</p>
                    <p className="text-purple-300 text-sm mb-4 italic">
                      {rec.reasoning}
                    </p>

                    <div className="space-y-2">
                      <p className="text-purple-400 text-sm font-medium">
                        Action Steps:
                      </p>
                      {rec.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-white">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-purple-200 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Predictions Content */}
      {insightView === "predictions" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Wellness Predictions
            </h4>
            <div className="space-y-4">
              {insights.predictions.map((prediction) => {
                const Icon = prediction.icon;
                return (
                  <div
                    key={prediction.id}
                    className="border-b border-white/10 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-purple-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">
                            {prediction.metric}
                          </h5>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              prediction.confidence === "high"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : prediction.confidence === "medium"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {prediction.confidence} confidence
                          </span>
                        </div>
                        <p className="text-purple-200 mb-2">
                          {typeof prediction.prediction === "number"
                            ? `Predicted: ${prediction.prediction.toFixed(
                                1
                              )}/10`
                            : prediction.prediction}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {prediction.factors.map((factor, index) => (
                            <span
                              key={index}
                              className="text-xs bg-white/10 text-purple-300 px-2 py-1 rounded"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-2">
              About Predictions
            </h4>
            <p className="text-purple-200 text-sm">
              These predictions are based on your historical patterns and
              trends. They're meant to help you anticipate and prepare, not to
              limit your potential. Your choices today shape tomorrow's
              outcomes!
            </p>
          </div>
        </div>
      )}

      {/* Experiments Content */}
      {insightView === "experiments" && (
        <div className="space-y-4">
          {insights.experiments.map((experiment) => {
            const Icon = experiment.icon;
            return (
              <div
                key={experiment.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-600/20 flex-shrink-0">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-lg">
                        {experiment.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-purple-300">
                          {experiment.duration} days
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            experiment.difficulty === "easy"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : experiment.difficulty === "medium"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {experiment.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-purple-400 text-sm mb-1">
                        Hypothesis:
                      </p>
                      <p className="text-purple-200">{experiment.hypothesis}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-purple-400 text-sm mb-2">Protocol:</p>
                      <ol className="space-y-1">
                        {experiment.protocol.map((step, index) => (
                          <li
                            key={index}
                            className="text-purple-200 text-sm flex items-start gap-2"
                          >
                            <span className="text-purple-400">
                              {index + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {experiment.metrics.map((metric, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                      <button className="text-purple-300 hover:text-white text-sm flex items-center gap-1 transition-colors">
                        Start Experiment
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reflection Content */}
      {insightView === "reflection" && (
        <div className="space-y-4">
          {insights.reflectionPrompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-600/20 flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-3 text-lg">
                    {prompt.prompt}
                  </h4>
                  {prompt.context && (
                    <p className="text-purple-300 text-sm mb-3 italic">
                      {prompt.context}
                    </p>
                  )}
                  {prompt.followUp && (
                    <div className="mt-4 p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
                      <p className="text-purple-200 text-sm">
                        <strong>Follow-up:</strong> {prompt.followUp}
                      </p>
                    </div>
                  )}
                  <button className="mt-4 text-purple-300 hover:text-white text-sm flex items-center gap-1 transition-colors">
                    Open in Reflectionarian
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              About Reflection Prompts
            </h4>
            <p className="text-purple-200 text-sm">
              These prompts are generated based on your unique patterns and
              data. Take time to journal about them or discuss with the
              Reflectionarian for deeper insights into your wellness journey.
            </p>
          </div>
        </div>
      )}

      {/* Selected Insight Modal */}
      {selectedInsight && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInsight(null)}
        >
          <div
            className="bg-purple-900 rounded-xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedInsight.title}
              </h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-purple-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-purple-200 mb-4">
              {selectedInsight.description}
            </p>
            <p className="text-purple-300 text-sm">{selectedInsight.details}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessInsightsTab;
