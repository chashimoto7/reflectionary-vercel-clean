// frontend/src/utils/experimentHelpers.js
import { addDays, differenceInDays, isBefore, format } from "date-fns";
import { EXPERIMENT_ICONS, COLORS } from "./experimentConstants";

export const processExperiments = (experiments) => {
  const now = new Date();
  const active = [];
  const completed = [];
  const suggested = [];

  experiments.forEach((exp) => {
    // Handle draft AI experiments as suggested
    if (exp.status === "draft" && exp.experiment_type === "ai_generated") {
      suggested.push({
        ...exp,
        isAI: true,
        canChat: true,
      });
      return;
    }

    const startDate = new Date(exp.start_date);
    const endDate = addDays(startDate, exp.duration);

    if (exp.status === "completed" || isBefore(endDate, now)) {
      const results = exp.results || calculateExperimentResults(exp);
      completed.push({
        ...exp,
        results,
        endDate,
        isAI: exp.experiment_type === "ai_generated",
        canChat: exp.experiment_type === "ai_generated",
      });
    } else if (exp.status === "active" && !isBefore(endDate, now)) {
      const progress = calculateProgress(exp, now);
      active.push({
        ...exp,
        progress,
        endDate,
        isAI: exp.experiment_type === "ai_generated",
        canChat: exp.experiment_type === "ai_generated",
      });
    }
  });

  return { active, completed, suggested };
};

export const calculateProgress = (experiment, now) => {
  const startDate = new Date(experiment.start_date);
  const totalDays = experiment.duration;
  const daysElapsed = differenceInDays(now, startDate);
  const percentComplete = Math.min(100, (daysElapsed / totalDays) * 100);

  return {
    daysElapsed,
    daysRemaining: Math.max(0, totalDays - daysElapsed),
    percentComplete,
    isOnTrack: true,
  };
};

export const calculateExperimentResults = (experiment) => {
  return {
    success: Math.random() > 0.3,
    improvement: Math.round(Math.random() * 40),
    insights: ["Placeholder insight"],
  };
};

export const calculateDetailedResults = async (
  experiment,
  userId,
  backendUrl
) => {
  const endDate = format(
    addDays(new Date(experiment.start_date), experiment.duration),
    "yyyy-MM-dd"
  );

  const response = await fetch(
    `${backendUrl}/api/wellness?user_id=${userId}&date_from=${experiment.start_date}&date_to=${endDate}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  const results = {
    success: false,
    improvement: {},
    insights: [],
    chartData: [],
  };

  if (!response.ok) return results;

  const data = await response.json();
  const wellnessData = data.entries || [];

  if (wellnessData.length === 0) return results;

  // Calculate improvements
  experiment.metrics.forEach((metric) => {
    const baseline = experiment.baseline?.[metric] || 0;
    let values = [];

    wellnessData.forEach((entry) => {
      switch (metric) {
        case "mood":
          values.push(entry.data.mood?.overall || 0);
          break;
        case "energy":
          values.push(entry.data.mood?.energy || 0);
          break;
        case "stress":
          values.push(entry.data.mood?.stress || 0);
          break;
        case "sleep_hours":
          values.push(entry.data.sleep?.duration || 0);
          break;
        case "sleep_quality":
          values.push(entry.data.sleep?.quality || 0);
          break;
        case "exercise_minutes":
          values.push(entry.data.exercise?.duration || 0);
          break;
        case "water_glasses":
          values.push(entry.data.nutrition?.water || 0);
          break;
      }
    });

    values = values.filter((v) => v > 0);

    if (values.length > 0) {
      const avgValue = average(values);
      const improvement =
        baseline > 0 ? ((avgValue - baseline) / baseline) * 100 : 0;

      results.improvement[metric] = {
        baseline,
        final: avgValue,
        change: improvement,
        trend: calculateTrend(values),
      };
    }
  });

  // Generate chart data
  results.chartData = wellnessData.map((entry) => {
    const dataPoint = { date: format(new Date(entry.date), "MMM d") };
    experiment.metrics.forEach((metric) => {
      switch (metric) {
        case "mood":
          dataPoint[metric] = entry.data.mood?.overall || 0;
          break;
        case "energy":
          dataPoint[metric] = entry.data.mood?.energy || 0;
          break;
        case "stress":
          dataPoint[metric] = entry.data.mood?.stress || 0;
          break;
        case "sleep_hours":
          dataPoint[metric] = entry.data.sleep?.duration || 0;
          break;
        case "sleep_quality":
          dataPoint[metric] = entry.data.sleep?.quality || 0;
          break;
        case "exercise_minutes":
          dataPoint[metric] = entry.data.exercise?.duration || 0;
          break;
        case "water_glasses":
          dataPoint[metric] = entry.data.nutrition?.water || 0;
          break;
      }
    });
    return dataPoint;
  });

  // Determine success
  const primaryMetric = experiment.metrics[0];
  const primaryImprovement = results.improvement[primaryMetric]?.change || 0;
  results.success =
    primaryImprovement >= (experiment.expectedImprovement || 10);

  // Generate insights
  if (results.success) {
    results.insights.push({
      type: "success",
      message: `Congratulations! Your ${primaryMetric} improved by ${Math.round(
        primaryImprovement
      )}%`,
    });
  } else {
    results.insights.push({
      type: "learning",
      message: `While the primary goal wasn't met, you've gathered valuable data about what works for you`,
    });
  }

  Object.entries(results.improvement).forEach(([metric, data]) => {
    if (data.trend > 0.5) {
      results.insights.push({
        type: "trend",
        message: `Strong positive trend observed in ${metric}`,
      });
    }
  });

  return results;
};

export const average = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const calculateTrend = (values) => {
  if (values.length < 2) return 0;
  const firstHalf = average(values.slice(0, Math.floor(values.length / 2)));
  const secondHalf = average(values.slice(Math.floor(values.length / 2)));
  return (secondHalf - firstHalf) / firstHalf;
};

export const getDefaultSuggestions = () => {
  return [
    {
      id: "starter-sleep",
      title: "Find Your Optimal Sleep Duration",
      category: "sleep",
      hypothesis:
        "Discovering your ideal sleep duration will maximize daily energy",
      duration: 14,
      difficulty: "easy",
      protocol: [
        "Week 1: Sleep 7 hours consistently",
        "Week 2: Sleep 8 hours consistently",
        "Track energy and mood each day",
        "Compare weekly averages",
      ],
      metrics: ["sleep_hours", "energy", "mood"],
      icon: EXPERIMENT_ICONS.sleep,
      color: COLORS.indigo,
      expectedImprovement: 20,
      successCriteria: "Identify optimal sleep duration",
      tips: [
        "Keep consistent wake time",
        "Avoid caffeine after 2pm",
        "Track in the morning for accuracy",
      ],
      experiment_type: "suggested",
    },
    {
      id: "starter-baseline",
      title: "Establish Your Wellness Baseline",
      category: "general",
      hypothesis: "Consistent tracking for 7 days will reveal your patterns",
      duration: 7,
      difficulty: "easy",
      protocol: [
        "Track all basic metrics daily",
        "Note any unusual events",
        "Be honest with ratings",
        "Review patterns at end",
      ],
      metrics: ["mood", "energy", "stress", "sleep_hours"],
      icon: EXPERIMENT_ICONS.general,
      color: COLORS.purple,
      expectedImprovement: 0,
      successCriteria: "Complete 7 days of tracking",
      tips: [
        "Set a daily reminder",
        "Track at the same time each day",
        "Don't judge - just observe",
      ],
      experiment_type: "suggested",
    },
  ];
};

export const loadCommunityExperiments = () => {
  return [
    {
      id: "comm-1",
      title: "The 20-20-20 Eye Strain Buster",
      author: "Sarah M.",
      category: "productivity",
      hypothesis: "Regular eye breaks will reduce fatigue and improve focus",
      duration: 7,
      difficulty: "easy",
      successRate: 87,
      participantCount: 234,
      avgImprovement: 22,
      protocol: [
        "Every 20 minutes, look away from screen",
        "Focus on something 20 feet away",
        "Hold for 20 seconds",
        "Track eye strain and focus levels",
      ],
      metrics: ["focus", "symptoms"],
      icon: EXPERIMENT_ICONS.productivity,
      color: COLORS.blue,
      rating: 4.7,
      reviews: 45,
      experiment_type: "community",
    },
    {
      id: "comm-2",
      title: "Gratitude Power Hour",
      author: "Marcus T.",
      category: "mood",
      hypothesis: "Morning gratitude practice improves all-day mood",
      duration: 21,
      difficulty: "easy",
      successRate: 92,
      participantCount: 567,
      avgImprovement: 35,
      protocol: [
        "Write 3 things you're grateful for each morning",
        "Spend 1 minute on each item",
        "Be specific and detailed",
        "Rate mood before and after",
      ],
      metrics: ["mood", "positivity"],
      icon: EXPERIMENT_ICONS.mood,
      color: COLORS.rose,
      rating: 4.9,
      reviews: 123,
      experiment_type: "community",
    },
  ];
};

export const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: "text-emerald-400",
    medium: "text-amber-400",
    hard: "text-red-400",
  };
  return colorMap[difficulty] || "text-gray-400";
};

export const getExperimentTypeColor = (type) => {
  const colorMap = {
    manual: "bg-blue-600/20 text-blue-400",
    suggested: "bg-purple-600/20 text-purple-400",
    ai_generated:
      "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400",
    community: "bg-emerald-600/20 text-emerald-400",
  };
  return colorMap[type] || "bg-gray-600/20 text-gray-400";
};
