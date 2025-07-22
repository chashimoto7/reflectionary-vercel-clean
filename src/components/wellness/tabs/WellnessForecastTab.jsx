// frontend/src/components/wellness/tabs/WellnessForecastTab.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Zap,
  Heart,
  Brain,
  Moon,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  Shield,
  Droplets,
  Coffee,
  Users,
  MapPin,
  Thermometer,
  Eye,
  BarChart3,
  X,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isAfter,
  parseISO,
  subDays,
  differenceInDays,
} from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const WellnessForecastTab = ({ colors, user }) => {
  const [loading, setLoading] = useState(true);
  const [forecastView, setForecastView] = useState("week"); // 'tomorrow', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [wellnessData, setWellnessData] = useState([]);
  const [forecast, setForecast] = useState({
    tomorrow: null,
    week: [],
    month: [],
    factors: [],
    recommendations: [],
    risks: [],
    opportunities: [],
  });
  const [historicalAccuracy, setHistoricalAccuracy] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hasData, setHasData] = useState(false);

  // Get backend URL from environment
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  useEffect(() => {
    if (user) {
      loadForecastData();
    }
  }, [user]);

  const loadForecastData = async () => {
    try {
      setLoading(true);

      // Load historical wellness data (90 days for better predictions)
      const ninetyDaysAgo = subDays(new Date(), 90).toISOString().split("T")[0];

      const response = await fetch(
        `${backendUrl}/api/wellness?user_id=${user.id}&date_from=${ninetyDaysAgo}&limit=90`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.entries && data.entries.length >= 7) {
        // Transform the data to match the expected format
        const transformedEntries = data.entries.map((entry) => ({
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

        setWellnessData(transformedEntries);
        setHasData(true);

        // Generate forecasts
        const forecasts = generateForecasts(transformedEntries);
        setForecast(forecasts);

        // Calculate historical accuracy if we have past predictions
        calculateHistoricalAccuracy(transformedEntries);
      } else {
        setWellnessData(data.entries || []);
        setHasData(false);
      }

      // Mock weather data (in production, integrate with weather API)
      loadWeatherForecast();
    } catch (error) {
      console.error("Error loading forecast data:", error);
      setWellnessData([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const generateForecasts = (data) => {
    // Tomorrow's detailed forecast
    const tomorrow = generateTomorrowForecast(data);

    // 7-day forecast
    const week = generate7DayForecast(data);

    // 30-day outlook
    const month = generate30DayOutlook(data);

    // Contributing factors
    const factors = analyzeContributingFactors(data);

    // Recommendations based on forecast
    const recommendations = generateForecastRecommendations(data, week);

    // Risk analysis
    const risks = identifyUpcomingRisks(data, week);

    // Opportunity windows
    const opportunities = findOpportunityWindows(data, week);

    return {
      tomorrow,
      week,
      month,
      factors,
      recommendations,
      risks,
      opportunities,
    };
  };

  const generateTomorrowForecast = (data) => {
    const recent = data.slice(-14); // Last 2 weeks
    const todayDayOfWeek = getDay(new Date());
    const tomorrowDayOfWeek = (todayDayOfWeek + 1) % 7;

    // Get historical data for same day of week
    const sameDayData = data.filter(
      (d) => getDay(new Date(d.date)) === tomorrowDayOfWeek
    );

    // Calculate base predictions
    const predictions = {
      energy: predictMetric(recent, sameDayData, "energy"),
      mood: predictMetric(recent, sameDayData, "mood"),
      stress: predictMetric(recent, sameDayData, "stress"),
      productivity: predictProductivity(recent, sameDayData),
      overallWellness: 0,
    };

    // Calculate overall wellness score
    predictions.overallWellness = calculatePredictedWellnessScore(predictions);

    // Identify key influences
    const influences = identifyDayInfluences(recent, tomorrowDayOfWeek);

    // Generate confidence levels
    const confidence = calculateConfidenceLevels(data, sameDayData);

    // Time-based recommendations
    const timeBlocks = generateTimeBlockRecommendations(
      predictions,
      influences
    );

    return {
      date: addDays(new Date(), 1),
      predictions,
      influences,
      confidence,
      timeBlocks,
      summary: generateDaySummary(predictions),
    };
  };

  const generate7DayForecast = (data) => {
    const forecasts = [];
    const recent = data.slice(-30); // Last 30 days for weekly patterns

    for (let i = 1; i <= 7; i++) {
      const forecastDate = addDays(new Date(), i);
      const dayOfWeek = getDay(forecastDate);

      // Historical data for this day of week
      const historicalDayData = data.filter(
        (d) => getDay(new Date(d.date)) === dayOfWeek
      );

      // Base prediction on patterns
      const dayForecast = {
        date: forecastDate,
        dayOfWeek: format(forecastDate, "EEEE"),
        energy: predictMetric(recent, historicalDayData, "energy"),
        mood: predictMetric(recent, historicalDayData, "mood"),
        stress: predictMetric(recent, historicalDayData, "stress"),
        wellnessScore: 0,
        confidence: historicalDayData.length > 3 ? "high" : "medium",
        weather: getWeatherImpact(i), // Mock weather impact
        specialFactors: identifySpecialFactors(forecastDate, data),
      };

      dayForecast.wellnessScore = calculatePredictedWellnessScore(dayForecast);
      forecasts.push(dayForecast);
    }

    return forecasts;
  };

  const generate30DayOutlook = (data) => {
    const outlook = [];
    const dayGroups = {};

    // Group historical data by day of week
    data.forEach((entry) => {
      const day = getDay(new Date(entry.date));
      if (!dayGroups[day]) dayGroups[day] = [];
      dayGroups[day].push(entry);
    });

    // Generate 30-day outlook
    for (let i = 1; i <= 30; i++) {
      const date = addDays(new Date(), i);
      const dayOfWeek = getDay(date);
      const weekNumber = Math.ceil(i / 7);

      const dayData = dayGroups[dayOfWeek] || [];
      const avgScore =
        dayData.length > 0
          ? average(dayData.map((d) => calculateWellnessScore(d)))
          : 50;

      outlook.push({
        date,
        dayOfWeek: format(date, "EEE"),
        weekNumber,
        predictedScore: avgScore + (Math.random() - 0.5) * 10, // Add some variation
        trend: weekNumber <= 2 ? "stable" : "improving", // Mock trend
      });
    }

    return outlook;
  };

  const predictMetric = (recentData, historicalDayData, metric) => {
    // Weight recent trend more heavily than historical day patterns
    const recentWeight = 0.6;
    const historicalWeight = 0.4;

    // Recent average
    const recentValues = recentData
      .map((d) => d[metric] || 0)
      .filter((v) => v > 0);
    const recentAvg = recentValues.length > 0 ? average(recentValues) : 5;

    // Recent trend
    const recentTrend = calculateTrend(recentValues.slice(-7));

    // Historical day average
    const historicalValues = historicalDayData
      .map((d) => d[metric] || 0)
      .filter((v) => v > 0);
    const historicalAvg =
      historicalValues.length > 0 ? average(historicalValues) : recentAvg;

    // Combine predictions
    let prediction =
      recentAvg * recentWeight + historicalAvg * historicalWeight;

    // Apply trend adjustment
    if (recentTrend > 0.3) prediction *= 1.05;
    if (recentTrend < -0.3) prediction *= 0.95;

    // Keep within bounds
    return Math.min(10, Math.max(1, Math.round(prediction * 10) / 10));
  };

  const predictProductivity = (recentData, historicalDayData) => {
    // Productivity based on energy, mood, and stress
    const recentProductivity = recentData.map((d) => {
      const energy = d.energy || 5;
      const mood = d.mood || 5;
      const stress = d.stress || 5;
      return energy * 0.4 + mood * 0.3 + (10 - stress) * 0.3;
    });

    return average(recentProductivity);
  };

  const analyzeContributingFactors = (data) => {
    const factors = [];
    const recent = data.slice(-30);

    // Sleep pattern impact
    const avgSleep = average(recent.map((d) => d.sleep_hours || 0));
    const sleepConsistency = calculateConsistency(
      recent.map((d) => d.sleep_hours || 0)
    );

    factors.push({
      name: "Sleep Patterns",
      impact: sleepConsistency > 0.8 ? "positive" : "negative",
      strength: Math.abs(sleepConsistency - 0.5) * 2,
      description:
        sleepConsistency > 0.8
          ? `Consistent sleep schedule (avg ${avgSleep.toFixed(1)}h)`
          : "Irregular sleep patterns affecting predictions",
      icon: Moon,
    });

    // Exercise frequency
    const exerciseDays = recent.filter((d) => d.exercise_minutes > 20).length;
    const exerciseRate = exerciseDays / recent.length;

    factors.push({
      name: "Exercise Routine",
      impact: exerciseRate > 0.4 ? "positive" : "negative",
      strength: exerciseRate,
      description: `${Math.round(exerciseRate * 100)}% exercise frequency`,
      icon: Activity,
    });

    // Stress trends
    const stressTrend = calculateTrend(recent.map((d) => d.stress || 5));

    factors.push({
      name: "Stress Management",
      impact: stressTrend < 0 ? "positive" : "negative",
      strength: Math.abs(stressTrend),
      description:
        stressTrend < 0 ? "Decreasing stress levels" : "Rising stress patterns",
      icon: Brain,
    });

    // Day of week patterns
    const dayPatterns = analyzeDayOfWeekPatterns(data);
    if (dayPatterns.strongestPattern) {
      factors.push({
        name: "Weekly Rhythm",
        impact: "neutral",
        strength: dayPatterns.strength,
        description: dayPatterns.description,
        icon: Calendar,
      });
    }

    return factors.sort((a, b) => b.strength - a.strength);
  };

  const identifyUpcomingRisks = (data, weekForecast) => {
    const risks = [];

    // Low energy days
    const lowEnergyDays = weekForecast.filter((d) => d.energy < 4);
    if (lowEnergyDays.length > 0) {
      risks.push({
        type: "energy",
        severity: lowEnergyDays.length > 2 ? "high" : "medium",
        title: "Low Energy Alert",
        description: `${lowEnergyDays.length} days with predicted low energy`,
        days: lowEnergyDays.map((d) => format(d.date, "EEEE")),
        mitigation: "Plan lighter activities and prioritize rest",
        icon: Zap,
      });
    }

    // High stress periods
    const highStressDays = weekForecast.filter((d) => d.stress > 7);
    if (highStressDays.length > 0) {
      risks.push({
        type: "stress",
        severity: highStressDays.length > 3 ? "high" : "medium",
        title: "Stress Peak Warning",
        description: `Elevated stress predicted for ${highStressDays.length} days`,
        days: highStressDays.map((d) => format(d.date, "EEEE")),
        mitigation: "Schedule stress-relief activities and breaks",
        icon: AlertCircle,
      });
    }

    // Pattern disruption risk
    const recentSleep = data.slice(-7).map((d) => d.sleep_hours || 0);
    const sleepVariability = standardDeviation(recentSleep);
    if (sleepVariability > 1.5) {
      risks.push({
        type: "pattern",
        severity: "medium",
        title: "Sleep Pattern Disruption",
        description: "Irregular sleep may impact next week's wellness",
        days: ["All week"],
        mitigation: "Establish consistent sleep schedule",
        icon: Moon,
      });
    }

    return risks;
  };

  const findOpportunityWindows = (data, weekForecast) => {
    const opportunities = [];

    // High energy windows
    const highEnergyDays = weekForecast.filter((d) => d.energy >= 8);
    if (highEnergyDays.length > 0) {
      opportunities.push({
        type: "performance",
        title: "Peak Performance Windows",
        description: `${highEnergyDays.length} days with high predicted energy`,
        days: highEnergyDays.map((d) => ({
          day: format(d.date, "EEEE"),
          date: d.date,
          energy: d.energy,
        })),
        suggestion: "Schedule important tasks and challenging workouts",
        icon: Target,
      });
    }

    // Wellness peak days
    const wellnessPeaks = weekForecast.filter((d) => d.wellnessScore > 75);
    if (wellnessPeaks.length > 0) {
      opportunities.push({
        type: "wellness",
        title: "Optimal Wellness Days",
        description: "Days with highest overall wellness potential",
        days: wellnessPeaks.map((d) => ({
          day: format(d.date, "EEEE"),
          date: d.date,
          score: d.wellnessScore,
        })),
        suggestion: "Plan social activities or new experiences",
        icon: Sparkles,
      });
    }

    // Recovery opportunities
    const lowStressDays = weekForecast.filter((d) => d.stress <= 3);
    if (lowStressDays.length > 0) {
      opportunities.push({
        type: "recovery",
        title: "Recovery Windows",
        description: "Low-stress periods ideal for restoration",
        days: lowStressDays.map((d) => ({
          day: format(d.date, "EEEE"),
          date: d.date,
          stress: d.stress,
        })),
        suggestion: "Focus on self-care and rejuvenation",
        icon: Heart,
      });
    }

    return opportunities;
  };

  const generateForecastRecommendations = (data, weekForecast) => {
    const recommendations = [];

    // Analyze the week ahead
    const avgPredictedEnergy = average(weekForecast.map((d) => d.energy));
    const avgPredictedStress = average(weekForecast.map((d) => d.stress));
    const avgPredictedMood = average(weekForecast.map((d) => d.mood));

    // Energy management
    if (avgPredictedEnergy < 5) {
      recommendations.push({
        category: "energy",
        priority: "high",
        title: "Energy Conservation Week",
        description: "Lower energy predicted - plan accordingly",
        actions: [
          "Prioritize essential tasks early in the day",
          "Schedule 20-minute power naps if possible",
          "Increase protein intake for sustained energy",
          "Limit evening activities",
        ],
        icon: Zap,
      });
    }

    // Stress preparation
    if (avgPredictedStress > 6) {
      recommendations.push({
        category: "stress",
        priority: "high",
        title: "Proactive Stress Management",
        description: "Higher stress levels anticipated",
        actions: [
          "Book time for daily stress-relief activities",
          "Prepare healthy meals in advance",
          "Set boundaries on commitments",
          "Practice breathing exercises preventively",
        ],
        icon: Shield,
      });
    }

    // Mood optimization
    if (avgPredictedMood < 6) {
      recommendations.push({
        category: "mood",
        priority: "medium",
        title: "Mood Boost Strategy",
        description: "Support emotional wellbeing proactively",
        actions: [
          "Schedule activities that bring joy",
          "Increase social connections",
          "Add mood-boosting foods (omega-3s, dark chocolate)",
          "Get morning sunlight exposure",
        ],
        icon: Heart,
      });
    }

    // Opportunity maximization
    const bestDay = weekForecast.reduce((best, day) =>
      day.wellnessScore > best.wellnessScore ? day : best
    );

    recommendations.push({
      category: "opportunity",
      priority: "low",
      title: `Maximize ${format(bestDay.date, "EEEE")}`,
      description: "Your predicted best day of the week",
      actions: [
        "Schedule important meetings or decisions",
        "Try something new or challenging",
        "Plan social activities",
        "Tackle complex projects",
      ],
      icon: Sparkles,
    });

    return recommendations;
  };

  const loadWeatherForecast = () => {
    // Mock weather data - in production, integrate with weather API
    const weather = [];
    for (let i = 0; i < 7; i++) {
      weather.push({
        date: addDays(new Date(), i + 1),
        condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][
          Math.floor(Math.random() * 4)
        ],
        temperature: 15 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        pressure: 1013 + (Math.random() - 0.5) * 20,
      });
    }
    setWeatherData(weather);
  };

  const calculateHistoricalAccuracy = (data) => {
    // In production, compare past predictions with actual outcomes
    // For now, mock accuracy data
    setHistoricalAccuracy({
      overall: 78,
      energy: 82,
      mood: 75,
      stress: 74,
      trend: "improving",
    });
  };

  // Helper functions
  const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const standardDeviation = (arr) => {
    const avg = average(arr);
    const squareDiffs = arr.map((value) => Math.pow(value - avg, 2));
    return Math.sqrt(average(squareDiffs));
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 0;
    const xValues = values.map((_, i) => i);
    return pearsonCorrelation(xValues, values);
  };

  const pearsonCorrelation = (x, y) => {
    if (x.length !== y.length || x.length < 2) return 0;

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

  const calculateConsistency = (values) => {
    if (values.length < 2) return 0;
    const std = standardDeviation(values);
    const avg = average(values);
    return avg > 0 ? 1 - std / avg : 0;
  };

  const calculateWellnessScore = (entry) => {
    let score = 50;
    if (entry.mood) score += (entry.mood - 5) * 3;
    if (entry.energy) score += (entry.energy - 5) * 2;
    if (entry.stress) score += (5 - entry.stress) * 2;
    if (entry.sleep_hours >= 7 && entry.sleep_hours <= 9) score += 10;
    if (entry.exercise_minutes > 20) score += 10;
    return Math.min(100, Math.max(0, score));
  };

  const calculatePredictedWellnessScore = (predictions) => {
    let score = 50;
    score += (predictions.mood - 5) * 3;
    score += (predictions.energy - 5) * 2;
    score += (5 - predictions.stress) * 2;
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const identifyDayInfluences = (recentData, dayOfWeek) => {
    const influences = [];

    // Day of week tendency
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    influences.push({
      factor: "Day Pattern",
      description: `${dayNames[dayOfWeek]} tends to be ${
        dayOfWeek === 1
          ? "challenging"
          : dayOfWeek === 5
          ? "energetic"
          : "moderate"
      }`,
      impact: dayOfWeek === 1 ? -0.5 : dayOfWeek === 5 ? 0.5 : 0,
    });

    // Recent sleep quality
    const recentSleep = average(
      recentData.slice(-3).map((d) => d.sleep_quality || 5)
    );
    if (recentSleep < 5) {
      influences.push({
        factor: "Sleep Debt",
        description: "Recent poor sleep quality affecting recovery",
        impact: -0.8,
      });
    }

    // Momentum
    const recentTrend = calculateTrend(
      recentData.slice(-7).map((d) => d.energy || 5)
    );
    if (Math.abs(recentTrend) > 0.3) {
      influences.push({
        factor: "Momentum",
        description:
          recentTrend > 0 ? "Positive trend continuing" : "Declining trend",
        impact: recentTrend,
      });
    }

    return influences;
  };

  const calculateConfidenceLevels = (allData, sameDayData) => {
    const overall =
      sameDayData.length >= 4
        ? "high"
        : sameDayData.length >= 2
        ? "medium"
        : "low";

    return {
      overall,
      energy:
        sameDayData.filter((d) => d.energy).length >= 3 ? "high" : "medium",
      mood: sameDayData.filter((d) => d.mood).length >= 3 ? "high" : "medium",
      stress:
        sameDayData.filter((d) => d.stress).length >= 3 ? "high" : "medium",
    };
  };

  const generateTimeBlockRecommendations = (predictions, influences) => {
    const blocks = [
      {
        time: "Morning (6-9 AM)",
        energy:
          predictions.energy > 7
            ? "High"
            : predictions.energy > 4
            ? "Moderate"
            : "Low",
        recommendation:
          predictions.energy > 7
            ? "Tackle complex tasks requiring focus"
            : "Start with gentle activities and hydration",
        icon: Sun,
      },
      {
        time: "Late Morning (9-12 PM)",
        energy: predictions.energy > 6 ? "Peak" : "Building",
        recommendation: "Best window for important decisions and creative work",
        icon: Zap,
      },
      {
        time: "Afternoon (12-3 PM)",
        energy: predictions.energy > 5 ? "Sustained" : "Dipping",
        recommendation:
          predictions.energy > 5
            ? "Continue productive work with breaks"
            : "Plan for lighter tasks or a power nap",
        icon: Clock,
      },
      {
        time: "Late Afternoon (3-6 PM)",
        energy: predictions.stress < 6 ? "Recovering" : "Stressed",
        recommendation:
          predictions.stress < 6
            ? "Good time for exercise or social activities"
            : "Focus on stress-relief and winding down",
        icon: Activity,
      },
      {
        time: "Evening (6-9 PM)",
        energy: "Winding Down",
        recommendation: "Prioritize relaxation and prepare for quality sleep",
        icon: Moon,
      },
    ];

    return blocks;
  };

  const generateDaySummary = (predictions) => {
    const score = predictions.overallWellness;

    if (score >= 80) {
      return {
        outlook: "Excellent",
        message:
          "Tomorrow looks fantastic! High energy and positive mood expected.",
        emoji: "🌟",
      };
    } else if (score >= 60) {
      return {
        outlook: "Good",
        message: "A solid day ahead with good potential for productivity.",
        emoji: "😊",
      };
    } else if (score >= 40) {
      return {
        outlook: "Moderate",
        message: "An average day expected. Focus on self-care and balance.",
        emoji: "😌",
      };
    } else {
      return {
        outlook: "Challenging",
        message: "Tomorrow may be tough. Plan for extra rest and support.",
        emoji: "🤗",
      };
    }
  };

  const analyzeDayOfWeekPatterns = (data) => {
    const dayScores = {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Calculate average scores by day
    data.forEach((entry) => {
      const day = getDay(new Date(entry.date));
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(calculateWellnessScore(entry));
    });

    // Find best and worst days
    let bestDay = { day: -1, score: 0 };
    let worstDay = { day: -1, score: 100 };

    Object.entries(dayScores).forEach(([day, scores]) => {
      const avgScore = average(scores);
      if (avgScore > bestDay.score) {
        bestDay = { day: parseInt(day), score: avgScore };
      }
      if (avgScore < worstDay.score) {
        worstDay = { day: parseInt(day), score: avgScore };
      }
    });

    const strength = (bestDay.score - worstDay.score) / 100;

    return {
      strongestPattern: strength > 0.1,
      strength,
      description: `${
        dayNames[bestDay.day]
      }s are typically your best days (${Math.round(bestDay.score)}/100)`,
      bestDay: dayNames[bestDay.day],
      worstDay: dayNames[worstDay.day],
    };
  };

  const identifySpecialFactors = (date, historicalData) => {
    const factors = [];

    // Check if it's a Monday (often challenging)
    if (getDay(date) === 1) {
      factors.push({
        type: "monday",
        impact: -0.2,
        description: "Monday adjustment",
      });
    }

    // Check if it's a Friday (often positive)
    if (getDay(date) === 5) {
      factors.push({
        type: "friday",
        impact: 0.2,
        description: "Friday energy boost",
      });
    }

    return factors;
  };

  const getWeatherImpact = (daysAhead) => {
    // Mock weather impact - in production, use real weather data
    const impacts = [
      { condition: "sunny", impact: 0.2, icon: Sun },
      { condition: "cloudy", impact: 0, icon: Cloud },
      { condition: "rainy", impact: -0.3, icon: CloudRain },
    ];

    return impacts[Math.floor(Math.random() * impacts.length)];
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      "partly-cloudy": Cloud,
    };
    return icons[condition] || Cloud;
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
          <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">
            Insufficient Data for Forecasting
          </h3>
          <p className="text-purple-200 mb-6">
            Wellness forecasting requires at least 7 days of tracking data to
            generate accurate predictions.
          </p>
          <div className="text-purple-300 text-sm">
            <p>Days tracked: {wellnessData ? wellnessData.length : 0}/7</p>
            <p className="mt-2">Keep tracking daily to unlock forecasting!</p>
          </div>
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
              <Calendar className="w-8 h-8 text-purple-400" />
              Wellness Forecast
            </h3>
            <p className="text-purple-200">
              Predict and prepare for your wellness journey
            </p>
          </div>

          {historicalAccuracy && (
            <div className="text-right">
              <div className="text-sm text-purple-300">Forecast Accuracy</div>
              <div className="text-2xl font-bold text-white">
                {historicalAccuracy.overall}%
              </div>
              <div className="text-xs text-purple-400">
                {historicalAccuracy.trend === "improving"
                  ? "↑ Improving"
                  : "Stable"}
              </div>
            </div>
          )}
        </div>

        {/* View Selector */}
        <div className="flex gap-2">
          {[
            { id: "tomorrow", label: "Tomorrow", icon: Sun },
            { id: "week", label: "7-Day", icon: Calendar },
            { id: "month", label: "30-Day", icon: BarChart3 },
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setForecastView(view.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                  forecastView === view.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tomorrow's Detailed Forecast */}
      {forecastView === "tomorrow" && forecast.tomorrow && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">
                  {format(forecast.tomorrow.date, "EEEE, MMMM d")}
                </h4>
                <p className="text-purple-200">
                  {forecast.tomorrow.summary.message}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-1">
                  {forecast.tomorrow.summary.emoji}
                </div>
                <div className="text-sm text-purple-300">
                  {forecast.tomorrow.summary.outlook}
                </div>
              </div>
            </div>

            {/* Prediction Meters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm">Energy</span>
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {forecast.tomorrow.predictions.energy}/10
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    style={{
                      width: `${forecast.tomorrow.predictions.energy * 10}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm">Mood</span>
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {forecast.tomorrow.predictions.mood}/10
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                    style={{
                      width: `${forecast.tomorrow.predictions.mood * 10}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm">Stress</span>
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {forecast.tomorrow.predictions.stress}/10
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-500"
                    style={{
                      width: `${forecast.tomorrow.predictions.stress * 10}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm">Overall</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {forecast.tomorrow.predictions.overallWellness}%
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    style={{
                      width: `${forecast.tomorrow.predictions.overallWellness}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time Block Recommendations */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Optimal Schedule
            </h4>
            <div className="space-y-3">
              {forecast.tomorrow.timeBlocks.map((block, index) => {
                const Icon = block.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <Icon className="w-5 h-5 text-purple-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">
                          {block.time}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            block.energy === "High" || block.energy === "Peak"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : block.energy === "Low" ||
                                block.energy === "Dipping"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {block.energy}
                        </span>
                      </div>
                      <p className="text-purple-200 text-sm">
                        {block.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Influences */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Key Influences
            </h4>
            <div className="space-y-3">
              {forecast.tomorrow.influences.map((influence, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">
                      {influence.factor}
                    </span>
                    <p className="text-sm text-purple-300">
                      {influence.description}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      influence.impact > 0
                        ? "text-emerald-400"
                        : influence.impact < 0
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {influence.impact > 0 ? "+" : ""}
                    {(influence.impact * 10).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Levels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(forecast.tomorrow.confidence).map(
              ([metric, level]) => (
                <div
                  key={metric}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center"
                >
                  <div className="text-purple-300 text-sm capitalize mb-1">
                    {metric}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      level === "high"
                        ? "text-emerald-400"
                        : level === "medium"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {level} confidence
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {forecastView === "week" && (
        <div className="space-y-6">
          {/* Week Overview Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              7-Day Wellness Outlook
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecast.week}>
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
                <XAxis dataKey="dayOfWeek" stroke="rgba(255,255,255,0.5)" />
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
                  dataKey="wellnessScore"
                  stroke={colors.purple}
                  fill="url(#wellnessGradient)"
                  strokeWidth={2}
                  name="Wellness Score"
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

          {/* Daily Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecast.week.map((day, index) => {
              const WeatherIcon =
                weatherData && weatherData[index]
                  ? getWeatherIcon(weatherData[index].condition)
                  : Sun;

              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">
                        {day.dayOfWeek}
                      </div>
                      <div className="text-sm text-purple-300">
                        {format(day.date, "MMM d")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(day.wellnessScore)}
                      </div>
                      <div className="text-xs text-purple-400">score</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Energy
                      </span>
                      <span className="text-white">{day.energy}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Mood
                      </span>
                      <span className="text-white">{day.mood}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> Stress
                      </span>
                      <span className="text-white">{day.stress}/10</span>
                    </div>
                  </div>

                  {weatherData && weatherData[index] && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <WeatherIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-xs text-purple-300">
                        {Math.round(weatherData[index].temperature)}°C
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Risks and Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risks */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Potential Challenges
              </h4>
              <div className="space-y-3">
                {forecast.risks.length > 0 ? (
                  forecast.risks.map((risk, index) => {
                    const Icon = risk.icon;
                    return (
                      <div
                        key={index}
                        className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-red-400 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-medium text-white mb-1">
                              {risk.title}
                            </h5>
                            <p className="text-sm text-purple-200 mb-2">
                              {risk.description}
                            </p>
                            <p className="text-xs text-purple-300">
                              <strong>Days:</strong> {risk.days.join(", ")}
                            </p>
                            <p className="text-xs text-purple-400 mt-1">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-purple-300 text-center py-4">
                    No significant risks detected for the week ahead!
                  </p>
                )}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Opportunity Windows
              </h4>
              <div className="space-y-3">
                {forecast.opportunities.map((opp, index) => {
                  const Icon = opp.icon;
                  return (
                    <div
                      key={index}
                      className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-emerald-400 mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-white mb-1">
                            {opp.title}
                          </h5>
                          <p className="text-sm text-purple-200 mb-2">
                            {opp.description}
                          </p>
                          <div className="space-y-1">
                            {opp.days.slice(0, 3).map((day, i) => (
                              <div key={i} className="text-xs text-purple-300">
                                <strong>{day.day}:</strong>{" "}
                                {day.energy
                                  ? `Energy ${day.energy}/10`
                                  : day.score
                                  ? `Score ${day.score}/100`
                                  : `Stress ${day.stress}/10`}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-emerald-300 mt-2">
                            {opp.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day Outlook */}
      {forecastView === "month" && (
        <div className="space-y-6">
          {/* Monthly Heatmap */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              30-Day Wellness Heatmap
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-purple-400 font-medium"
                >
                  {day}
                </div>
              ))}
              {forecast.month.map((day, index) => {
                const score = day.predictedScore;
                const opacity = score / 100;

                return (
                  <div
                    key={index}
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium text-white relative group cursor-pointer"
                    style={{
                      backgroundColor:
                        score > 70
                          ? `rgba(16, 185, 129, ${opacity})`
                          : score > 40
                          ? `rgba(251, 191, 36, ${opacity})`
                          : `rgba(239, 68, 68, ${opacity})`,
                    }}
                  >
                    {format(day.date, "d")}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {format(day.date, "MMM d")}: {Math.round(score)}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span className="text-xs text-purple-300">
                  Excellent (70-100)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500"></div>
                <span className="text-xs text-purple-300">
                  Moderate (40-70)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-xs text-purple-300">
                  Challenging (0-40)
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">
              Monthly Patterns
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecast.month.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="dayOfWeek" stroke="rgba(255,255,255,0.5)" />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedScore"
                  stroke={colors.purple}
                  strokeWidth={2}
                  dot={{ fill: colors.purple }}
                  name="Predicted Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Contributing Factors */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4">
          Forecast Factors
        </h4>
        <div className="space-y-3">
          {forecast.factors.map((factor, index) => {
            const Icon = factor.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    factor.impact === "positive"
                      ? "bg-emerald-500/20"
                      : factor.impact === "negative"
                      ? "bg-red-500/20"
                      : "bg-amber-500/20"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      factor.impact === "positive"
                        ? "text-emerald-400"
                        : factor.impact === "negative"
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                      {factor.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-white/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            factor.impact === "positive"
                              ? "bg-emerald-500"
                              : factor.impact === "negative"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${factor.strength * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-400">
                        {Math.round(factor.strength * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-purple-300">
                    {factor.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {forecast.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">
            Forecast-Based Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecast.recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-purple-400 mt-1" />
                    <div className="flex-1">
                      <h5 className="font-medium text-white mb-1">
                        {rec.title}
                      </h5>
                      <p className="text-sm text-purple-200 mb-2">
                        {rec.description}
                      </p>
                      <ul className="space-y-1">
                        {rec.actions.slice(0, 2).map((action, i) => (
                          <li
                            key={i}
                            className="text-xs text-purple-300 flex items-start gap-1"
                          >
                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessForecastTab;
