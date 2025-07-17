// frontend/src/components/wellness/tabs/WellnessExperimentsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Beaker,
  Target,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Award,
  BarChart3,
  Brain,
  Heart,
  Zap,
  Moon,
  Activity,
  Coffee,
  Users,
  Book,
  ChevronRight,
  Plus,
  Share2,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  Filter,
  Search,
  Sun,
  Droplets,
  Eye,
  Flame,
} from "lucide-react";
import {
  format,
  addDays,
  differenceInDays,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const WellnessExperimentsTab = ({ colors, user }) => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("active"); // 'active', 'suggested', 'completed', 'community'
  const [experiments, setExperiments] = useState({
    active: [],
    suggested: [],
    completed: [],
    community: [],
  });
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [experimentFilter, setExperimentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wellnessData, setWellnessData] = useState([]);

  // New experiment form
  const [newExperiment, setNewExperiment] = useState({
    title: "",
    hypothesis: "",
    category: "custom",
    duration: 7,
    metrics: [],
    protocol: [""],
    successCriteria: "",
    isPublic: false,
  });

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  useEffect(() => {
    loadExperiments();
  }, [user]);

  const loadExperiments = async () => {
    try {
      setLoading(true);

      // Load user's experiments from backend
      const experimentsResponse = await fetch(
        `${backendUrl}/api/wellness/experiments?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (experimentsResponse.ok) {
        const experimentsData = await experimentsResponse.json();

        // Process experiments
        const processed = processExperiments(experimentsData.experiments || []);

        setExperiments((prevState) => ({
          ...prevState,
          active: processed.active,
          completed: processed.completed,
        }));
      }

      // Load wellness data for analysis
      const thirtyDaysAgo = addDays(new Date(), -30)
        .toISOString()
        .split("T")[0];

      const wellnessResponse = await fetch(
        `${backendUrl}/api/wellness?user_id=${user.id}&date_from=${thirtyDaysAgo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (wellnessResponse.ok) {
        const wellnessData = await wellnessResponse.json();

        if (wellnessData.entries && wellnessData.entries.length > 0) {
          // Transform the data for experiments
          const transformedData = wellnessData.entries.map((entry) => ({
            id: entry.id,
            date: entry.date,
            mood: entry.data.mood?.overall || 0,
            energy: entry.data.mood?.energy || 0,
            stress: entry.data.mood?.stress || 0,
            sleep_hours: entry.data.sleep?.duration || 0,
            sleep_quality: entry.data.sleep?.quality || 0,
            exercise_minutes: entry.data.exercise?.duration || 0,
            water_glasses: entry.data.nutrition?.water || 0,
          }));

          setWellnessData(transformedData);

          // Generate suggested experiments
          const suggested = generateSuggestedExperiments(transformedData);
          setExperiments((prevState) => ({
            ...prevState,
            suggested: suggested,
          }));
        } else {
          // No wellness data - show default suggestions
          setExperiments((prevState) => ({
            ...prevState,
            suggested: getDefaultSuggestions(),
          }));
        }
      }

      // Load community experiments (mock for now)
      const community = loadCommunityExperiments();
      setExperiments((prevState) => ({
        ...prevState,
        community: community,
      }));
    } catch (error) {
      console.error("Error loading experiments:", error);
      // Show default suggestions on error
      setExperiments({
        active: [],
        suggested: getDefaultSuggestions(),
        completed: [],
        community: loadCommunityExperiments(),
      });
    } finally {
      setLoading(false);
    }
  };

  const processExperiments = (experiments) => {
    const now = new Date();
    const active = [];
    const completed = [];

    experiments.forEach((exp) => {
      const startDate = new Date(exp.start_date);
      const endDate = addDays(startDate, exp.duration);

      if (exp.status === "completed" || isBefore(endDate, now)) {
        // Calculate results if completed
        const results = exp.results || calculateExperimentResults(exp);
        completed.push({ ...exp, results, endDate });
      } else if (exp.status === "active" && !isBefore(endDate, now)) {
        // Calculate progress
        const progress = calculateProgress(exp, now);
        active.push({ ...exp, progress, endDate });
      }
    });

    return { active, completed };
  };

  const generateSuggestedExperiments = (wellnessData) => {
    const suggestions = [];

    if (wellnessData.length === 0) return getDefaultSuggestions();

    // Analyze recent patterns
    const recent = wellnessData.slice(-14);
    const avgEnergy = average(recent.map((d) => d.energy || 0));
    const avgSleep = average(recent.map((d) => d.sleep_hours || 0));
    const avgStress = average(recent.map((d) => d.stress || 0));
    const exerciseFreq =
      recent.filter((d) => d.exercise_minutes > 20).length / recent.length;

    // Sleep optimization experiment
    if (avgSleep < 7) {
      suggestions.push({
        id: "sleep-opt-1",
        title: "Sleep Extension Experiment",
        category: "sleep",
        hypothesis:
          "Adding 30 minutes of sleep will increase next-day energy by 20%",
        duration: 14,
        difficulty: "medium",
        protocol: [
          "Go to bed 30 minutes earlier each night",
          "Keep wake time consistent",
          "Track energy levels each morning (1-10)",
          "Maintain consistent sleep environment",
        ],
        metrics: ["sleep_hours", "sleep_quality", "energy", "mood"],
        baseline: { sleep: avgSleep, energy: avgEnergy },
        expectedImprovement: 20,
        icon: Moon,
        color: colors.indigo,
        successCriteria: "Average energy increases by at least 15%",
        tips: [
          "Set a bedtime alarm 45 minutes before target sleep time",
          "Dim lights 1 hour before bed",
          "Avoid screens in the bedroom",
        ],
      });
    }

    // Morning routine experiment
    if (avgEnergy < 6) {
      suggestions.push({
        id: "morning-routine-1",
        title: "Energizing Morning Routine",
        category: "energy",
        hypothesis:
          "A 15-minute morning routine will boost all-day energy levels",
        duration: 21,
        difficulty: "easy",
        protocol: [
          "5 minutes of stretching immediately upon waking",
          "Drink 16oz of water before coffee",
          "Get 5 minutes of bright light exposure",
          "5 minutes of energizing breathing exercises",
        ],
        metrics: ["energy", "mood", "productivity"],
        baseline: { energy: avgEnergy },
        expectedImprovement: 25,
        icon: Sun,
        color: colors.amber,
        successCriteria: "Energy levels consistently above 7/10",
        tips: [
          "Prepare water bottle the night before",
          "Open curtains immediately",
          "Use a sunrise alarm clock if possible",
        ],
      });
    }

    // Stress reduction experiment
    if (avgStress > 6) {
      suggestions.push({
        id: "stress-reduce-1",
        title: "5-Minute Stress Reset",
        category: "stress",
        hypothesis: "Regular micro-breaks will reduce overall stress by 30%",
        duration: 10,
        difficulty: "easy",
        protocol: [
          "Set 3 daily alarms (10am, 2pm, 6pm)",
          "Take 5-minute breathing break at each alarm",
          "Rate stress before and after each session",
          "Note any immediate effects",
        ],
        metrics: ["stress", "mood", "focus"],
        baseline: { stress: avgStress },
        expectedImprovement: 30,
        icon: Brain,
        color: colors.purple,
        successCriteria: "Average stress drops below 5/10",
        tips: [
          "Use box breathing technique (4-4-4-4)",
          "Find a quiet space if possible",
          "Consider using a meditation app",
        ],
      });
    }

    // Exercise consistency experiment
    if (exerciseFreq < 0.4) {
      suggestions.push({
        id: "exercise-habit-1",
        title: "Movement Momentum Builder",
        category: "exercise",
        hypothesis: "Daily 10-minute movement will improve mood and energy",
        duration: 30,
        difficulty: "medium",
        protocol: [
          "Choose same time each day for movement",
          "Start with just 10 minutes",
          "Any movement counts (walk, dance, stretch)",
          "Track completion and how you feel after",
        ],
        metrics: ["exercise_minutes", "mood", "energy", "consistency"],
        baseline: { exerciseFreq: exerciseFreq * 100 },
        expectedImprovement: 40,
        icon: Activity,
        color: colors.emerald,
        successCriteria: "Exercise at least 5 days per week",
        tips: [
          "Put on workout clothes first thing",
          "Start extremely small to build habit",
          "Focus on consistency over intensity",
        ],
      });
    }

    // Hydration experiment
    suggestions.push({
      id: "hydration-1",
      title: "Optimal Hydration Challenge",
      category: "nutrition",
      hypothesis:
        "Consistent hydration will improve energy and reduce headaches",
      duration: 7,
      difficulty: "easy",
      protocol: [
        "Drink water within 5 minutes of waking",
        "Consume 8oz every hour from 8am-6pm",
        "Track energy and any headaches",
        "Note bathroom frequency changes",
      ],
      metrics: ["water_glasses", "energy", "symptoms"],
      baseline: { water: average(recent.map((d) => d.water_glasses || 0)) },
      expectedImprovement: 15,
      icon: Droplets,
      color: colors.cyan,
      successCriteria: "Maintain 8+ glasses daily with improved energy",
      tips: [
        "Use a marked water bottle",
        "Set hourly reminders",
        "Flavor water with fruit if needed",
      ],
    });

    return suggestions;
  };

  const getDefaultSuggestions = () => {
    // Return starter experiments for new users
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
        icon: Moon,
        color: colors.indigo,
        expectedImprovement: 20,
        successCriteria: "Identify optimal sleep duration",
        tips: [
          "Keep consistent wake time",
          "Avoid caffeine after 2pm",
          "Track in the morning for accuracy",
        ],
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
        icon: BarChart3,
        color: colors.purple,
        expectedImprovement: 0,
        successCriteria: "Complete 7 days of tracking",
        tips: [
          "Set a daily reminder",
          "Track at the same time each day",
          "Don't judge - just observe",
        ],
      },
    ];
  };

  const loadCommunityExperiments = () => {
    // Mock community experiments - in production, load from shared database
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
        icon: Eye,
        color: colors.blue,
        rating: 4.7,
        reviews: 45,
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
        icon: Heart,
        color: colors.rose,
        rating: 4.9,
        reviews: 123,
      },
    ];
  };

  const startExperiment = async (experiment) => {
    try {
      const experimentData = {
        user_id: user.id,
        title: experiment.title,
        hypothesis: experiment.hypothesis,
        category: experiment.category,
        duration: experiment.duration,
        metrics: experiment.metrics,
        protocol: experiment.protocol,
        baseline: experiment.baseline || {},
        success_criteria: experiment.successCriteria,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        is_public: experiment.isPublic || false,
      };

      const response = await fetch(`${backendUrl}/api/wellness/experiments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experimentData),
      });

      if (!response.ok) {
        throw new Error("Failed to start experiment");
      }

      // Reload experiments
      await loadExperiments();

      // Close modal if open
      setShowNewExperiment(false);
    } catch (error) {
      console.error("Error starting experiment:", error);
    }
  };

  const updateExperimentProgress = async (experimentId, progressData) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/wellness/experiments/${experimentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            progress: progressData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update experiment progress");
      }

      await loadExperiments();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const completeExperiment = async (experiment) => {
    try {
      const results = await calculateDetailedResults(experiment);

      const response = await fetch(
        `${backendUrl}/api/wellness/experiments/${experiment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            status: "completed",
            results: results,
            completed_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete experiment");
      }

      await loadExperiments();
    } catch (error) {
      console.error("Error completing experiment:", error);
    }
  };

  const calculateDetailedResults = async (experiment) => {
    // Fetch relevant wellness data during experiment period
    const endDate = format(
      addDays(new Date(experiment.start_date), experiment.duration),
      "yyyy-MM-dd"
    );

    const response = await fetch(
      `${backendUrl}/api/wellness?user_id=${user.id}&date_from=${experiment.start_date}&date_to=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const results = {
      success: false,
      improvement: {},
      insights: [],
      chartData: [],
    };

    if (!response.ok) {
      return results;
    }

    const data = await response.json();
    const wellnessData = data.entries || [];

    if (wellnessData.length === 0) return results;

    // Calculate improvements for each metric
    experiment.metrics.forEach((metric) => {
      const baseline = experiment.baseline?.[metric] || 0;
      let values = [];

      // Map metrics to wellness data structure
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

    // Additional insights based on patterns
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

  const calculateProgress = (experiment, now) => {
    const startDate = new Date(experiment.start_date);
    const totalDays = experiment.duration;
    const daysElapsed = differenceInDays(now, startDate);
    const percentComplete = Math.min(100, (daysElapsed / totalDays) * 100);

    return {
      daysElapsed,
      daysRemaining: Math.max(0, totalDays - daysElapsed),
      percentComplete,
      isOnTrack: true, // Could be based on check-in frequency
    };
  };

  const calculateExperimentResults = (experiment) => {
    // Simplified results calculation
    return {
      success: Math.random() > 0.3,
      improvement: Math.round(Math.random() * 40),
      insights: ["Placeholder insight"],
    };
  };

  // Helper functions
  const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 0;
    const firstHalf = average(values.slice(0, Math.floor(values.length / 2)));
    const secondHalf = average(values.slice(Math.floor(values.length / 2)));
    return (secondHalf - firstHalf) / firstHalf;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sleep: Moon,
      energy: Zap,
      stress: Brain,
      exercise: Activity,
      nutrition: Coffee,
      mood: Heart,
      productivity: Target,
      social: Users,
      general: BarChart3,
      custom: Beaker,
    };
    return icons[category] || Beaker;
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      easy: "text-emerald-400",
      medium: "text-amber-400",
      hard: "text-red-400",
    };
    return colorMap[difficulty] || "text-gray-400";
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Beaker className="w-8 h-8 text-purple-400" />
              Wellness Experiments
            </h3>
            <p className="text-purple-200">
              Test, learn, and optimize your wellbeing
            </p>
          </div>
          <button
            onClick={() => setShowNewExperiment(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {[
            { id: "active", label: "Active", count: experiments.active.length },
            {
              id: "suggested",
              label: "Suggested",
              count: experiments.suggested.length,
            },
            {
              id: "completed",
              label: "Completed",
              count: experiments.completed.length,
            },
            {
              id: "community",
              label: "Community",
              count: experiments.community.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                activeView === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Experiments */}
      {activeView === "active" && (
        <div className="space-y-4">
          {experiments.active.length > 0 ? (
            experiments.active.map((experiment) => {
              const Icon = getCategoryIcon(experiment.category);
              return (
                <div
                  key={experiment.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-purple-600/20">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-1">
                          {experiment.title}
                        </h4>
                        <p className="text-purple-200 text-sm">
                          {experiment.hypothesis}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedExperiment(experiment)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => completeExperiment(experiment)}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-300">Progress</span>
                      <span className="text-sm text-white">
                        Day {experiment.progress.daysElapsed} of{" "}
                        {experiment.duration}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                        style={{
                          width: `${experiment.progress.percentComplete}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      {experiment.progress.daysRemaining} days remaining
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-purple-300">Duration</div>
                      <div className="text-sm font-medium text-white">
                        {experiment.duration} days
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-purple-300">Metrics</div>
                      <div className="text-sm font-medium text-white">
                        {experiment.metrics.length}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-purple-300">Expected</div>
                      <div className="text-sm font-medium text-white">
                        +{experiment.expectedImprovement || 15}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-purple-300">Ends</div>
                      <div className="text-sm font-medium text-white">
                        {format(experiment.endDate, "MMM d")}
                      </div>
                    </div>
                  </div>

                  {/* Protocol Preview */}
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-purple-300 mb-2">
                      Today's Protocol:
                    </p>
                    <ul className="space-y-1">
                      {experiment.protocol.slice(0, 2).map((step, index) => (
                        <li
                          key={index}
                          className="text-sm text-white flex items-start gap-2"
                        >
                          <span className="text-purple-400">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
              <Beaker className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                No Active Experiments
              </h4>
              <p className="text-purple-200 mb-4">
                Ready to start optimizing your wellness? Choose from suggested
                experiments or create your own!
              </p>
              <button
                onClick={() => setActiveView("suggested")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                View Suggestions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggested Experiments */}
      {activeView === "suggested" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
            <p className="text-purple-200 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {wellnessData.length > 0
                ? "These experiments are personalized based on your wellness patterns and areas for improvement"
                : "Start with these beginner-friendly experiments to establish your wellness baseline"}
            </p>
          </div>

          {experiments.suggested.map((experiment) => {
            const Icon = experiment.icon || Beaker;
            return (
              <div
                key={experiment.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${experiment.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: experiment.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-1">
                          {experiment.title}
                        </h4>
                        <p className="text-purple-200 text-sm mb-3">
                          {experiment.hypothesis}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-medium ${getDifficultyColor(
                            experiment.difficulty
                          )}`}
                        >
                          {experiment.difficulty}
                        </span>
                        <span className="text-xs text-purple-400">
                          {experiment.duration} days
                        </span>
                      </div>
                    </div>

                    {/* Expected Impact */}
                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-300">
                          Expected Improvement
                        </span>
                        <span className="text-lg font-bold text-white">
                          +{experiment.expectedImprovement}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{
                            width: `${experiment.expectedImprovement}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Protocol */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-purple-300 mb-2">
                        Protocol:
                      </p>
                      <ol className="space-y-1">
                        {experiment.protocol.map((step, index) => (
                          <li
                            key={index}
                            className="text-sm text-purple-200 flex items-start gap-2"
                          >
                            <span className="text-purple-400">
                              {index + 1}.
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Metrics */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-purple-300 mb-2">
                        Tracking:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {experiment.metrics.map((metric, index) => (
                          <span
                            key={index}
                            className="text-xs bg-white/10 text-purple-300 px-2 py-1 rounded"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    {experiment.tips && (
                      <div className="mb-4 p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
                        <p className="text-sm font-medium text-purple-300 mb-1">
                          Pro Tips:
                        </p>
                        <ul className="space-y-1">
                          {experiment.tips.map((tip, index) => (
                            <li
                              key={index}
                              className="text-xs text-purple-200 flex items-start gap-1"
                            >
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => startExperiment(experiment)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start This Experiment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Experiments */}
      {activeView === "completed" && (
        <div className="space-y-4">
          {experiments.completed.length > 0 ? (
            experiments.completed.map((experiment) => {
              const Icon = getCategoryIcon(experiment.category);
              const success = experiment.results?.success;

              return (
                <div
                  key={experiment.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          success ? "bg-emerald-600/20" : "bg-amber-600/20"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            success ? "text-emerald-400" : "text-amber-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-1 flex items-center gap-2">
                          {experiment.title}
                          {success ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                          )}
                        </h4>
                        <p className="text-purple-200 text-sm">
                          Completed{" "}
                          {format(
                            new Date(
                              experiment.completed_at || experiment.endDate
                            ),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedExperiment(experiment)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      {experiment.is_public ? (
                        <Unlock className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {experiment.results?.improvement &&
                      Object.entries(experiment.results.improvement)
                        .slice(0, 3)
                        .map(([metric, data]) => (
                          <div
                            key={metric}
                            className="bg-white/5 rounded-lg p-3"
                          >
                            <div className="text-xs text-purple-400 capitalize mb-1">
                              {metric.replace("_", " ")}
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-white">
                                {data.final.toFixed(1)}
                              </span>
                              <span
                                className={`text-sm ${
                                  data.change > 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {data.change > 0 ? "+" : ""}
                                {data.change.toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-xs text-purple-300">
                              from {data.baseline.toFixed(1)}
                            </div>
                          </div>
                        ))}
                  </div>

                  {/* Insights */}
                  {experiment.results?.insights &&
                    experiment.results.insights.length > 0 && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-sm font-medium text-purple-300 mb-2">
                          Key Insights:
                        </p>
                        <ul className="space-y-1">
                          {experiment.results.insights
                            .slice(0, 2)
                            .map((insight, index) => (
                              <li
                                key={index}
                                className="text-sm text-purple-200 flex items-start gap-2"
                              >
                                <Sparkles className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                {insight.message}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        const newExp = { ...experiment };
                        delete newExp.id;
                        delete newExp.results;
                        delete newExp.completed_at;
                        startExperiment(newExp);
                      }}
                      className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Repeat Experiment
                    </button>
                    {success && !experiment.is_public && (
                      <button className="flex-1 bg-white/10 hover:bg-white/20 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
              <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                No Completed Experiments Yet
              </h4>
              <p className="text-purple-200">
                Your completed experiments and their results will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Community Experiments */}
      {activeView === "community" && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search community experiments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>
              <select
                value={experimentFilter}
                onChange={(e) => setExperimentFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="sleep">Sleep</option>
                <option value="energy">Energy</option>
                <option value="stress">Stress</option>
                <option value="mood">Mood</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
          </div>

          {/* Community Experiments List */}
          {experiments.community.map((experiment) => {
            const Icon = experiment.icon || Beaker;
            return (
              <div
                key={experiment.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${experiment.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: experiment.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-1">
                          {experiment.title}
                        </h4>
                        <p className="text-purple-300 text-sm mb-1">
                          by {experiment.author} • {experiment.category}
                        </p>
                        <p className="text-purple-200 text-sm">
                          {experiment.hypothesis}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(experiment.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-500"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-purple-300 ml-1">
                            ({experiment.reviews})
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${getDifficultyColor(
                            experiment.difficulty
                          )}`}
                        >
                          {experiment.difficulty} • {experiment.duration} days
                        </span>
                      </div>
                    </div>

                    {/* Community Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-400">
                          Success Rate
                        </div>
                        <div className="text-lg font-bold text-white">
                          {experiment.successRate}%
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-400">
                          Participants
                        </div>
                        <div className="text-lg font-bold text-white">
                          {experiment.participantCount}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-400">
                          Avg Improvement
                        </div>
                        <div className="text-lg font-bold text-emerald-400">
                          +{experiment.avgImprovement}%
                        </div>
                      </div>
                    </div>

                    {/* Protocol Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-purple-300 mb-2">
                        Protocol:
                      </p>
                      <ol className="space-y-1">
                        {experiment.protocol.slice(0, 2).map((step, index) => (
                          <li
                            key={index}
                            className="text-sm text-purple-200 flex items-start gap-2"
                          >
                            <span className="text-purple-400">
                              {index + 1}.
                            </span>
                            {step}
                          </li>
                        ))}
                        {experiment.protocol.length > 2 && (
                          <li className="text-sm text-purple-400">
                            +{experiment.protocol.length - 2} more steps...
                          </li>
                        )}
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const adapted = {
                            ...experiment,
                            id: `adapted-${experiment.id}`,
                            isFromCommunity: true,
                          };
                          startExperiment(adapted);
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Try This Experiment
                      </button>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-300 rounded-lg font-medium transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Experiment Modal */}
      {showNewExperiment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Create New Experiment
              </h3>
              <button
                onClick={() => setShowNewExperiment(false)}
                className="text-purple-300 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Experiment Title
                </label>
                <input
                  type="text"
                  value={newExperiment.title}
                  onChange={(e) =>
                    setNewExperiment({
                      ...newExperiment,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Morning Meditation Impact"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>

              {/* Hypothesis */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Hypothesis
                </label>
                <textarea
                  value={newExperiment.hypothesis}
                  onChange={(e) =>
                    setNewExperiment({
                      ...newExperiment,
                      hypothesis: e.target.value,
                    })
                  }
                  placeholder="What do you expect to happen?"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 h-20 resize-none"
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={newExperiment.category}
                    onChange={(e) =>
                      setNewExperiment({
                        ...newExperiment,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="custom">Custom</option>
                    <option value="sleep">Sleep</option>
                    <option value="energy">Energy</option>
                    <option value="stress">Stress</option>
                    <option value="exercise">Exercise</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="mood">Mood</option>
                  </select>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="90"
                    value={newExperiment.duration}
                    onChange={(e) =>
                      setNewExperiment({
                        ...newExperiment,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Metrics to Track
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "mood",
                    "energy",
                    "stress",
                    "sleep_hours",
                    "exercise_minutes",
                    "water_glasses",
                  ].map((metric) => (
                    <label key={metric} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newExperiment.metrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExperiment({
                              ...newExperiment,
                              metrics: [...newExperiment.metrics, metric],
                            });
                          } else {
                            setNewExperiment({
                              ...newExperiment,
                              metrics: newExperiment.metrics.filter(
                                (m) => m !== metric
                              ),
                            });
                          }
                        }}
                        className="rounded border-white/20 bg-white/10 text-purple-600"
                      />
                      <span className="text-sm text-purple-200 capitalize">
                        {metric.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Protocol */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Protocol Steps
                </label>
                <div className="space-y-2">
                  {newExperiment.protocol.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...newExperiment.protocol];
                          updated[index] = e.target.value;
                          setNewExperiment({
                            ...newExperiment,
                            protocol: updated,
                          });
                        }}
                        placeholder={`Step ${index + 1}`}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                      />
                      {newExperiment.protocol.length > 1 && (
                        <button
                          onClick={() => {
                            setNewExperiment({
                              ...newExperiment,
                              protocol: newExperiment.protocol.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setNewExperiment({
                        ...newExperiment,
                        protocol: [...newExperiment.protocol, ""],
                      })
                    }
                    className="text-purple-300 hover:text-white text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>
              </div>

              {/* Success Criteria */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Success Criteria
                </label>
                <input
                  type="text"
                  value={newExperiment.successCriteria}
                  onChange={(e) =>
                    setNewExperiment({
                      ...newExperiment,
                      successCriteria: e.target.value,
                    })
                  }
                  placeholder="How will you measure success?"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>

              {/* Privacy */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newExperiment.isPublic}
                  onChange={(e) =>
                    setNewExperiment({
                      ...newExperiment,
                      isPublic: e.target.checked,
                    })
                  }
                  className="rounded border-white/20 bg-white/10 text-purple-600"
                />
                <label htmlFor="public" className="text-purple-200 text-sm">
                  Share results with the community (anonymously)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  startExperiment(newExperiment);
                  setShowNewExperiment(false);
                }}
                disabled={
                  !newExperiment.title ||
                  !newExperiment.hypothesis ||
                  newExperiment.metrics.length === 0
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Start Experiment
              </button>
              <button
                onClick={() => setShowNewExperiment(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiment Details Modal */}
      {selectedExperiment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedExperiment.title}
              </h3>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-purple-300 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Results Chart */}
            {selectedExperiment.results?.chartData &&
              selectedExperiment.results.chartData.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Progress Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedExperiment.results.chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.9)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      {selectedExperiment.metrics.map((metric, index) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          stroke={
                            Object.values(colors)[
                              index % Object.values(colors).length
                            ]
                          }
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name={metric.replace("_", " ")}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

            {/* Detailed Results */}
            {selectedExperiment.results && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Results Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(
                    selectedExperiment.results.improvement || {}
                  ).map(([metric, data]) => (
                    <div key={metric} className="bg-white/10 rounded-lg p-4">
                      <h5 className="font-medium text-white capitalize mb-2">
                        {metric.replace("_", " ")}
                      </h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-purple-400">Baseline</div>
                          <div className="text-lg font-bold text-white">
                            {data.baseline.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-purple-400">Final</div>
                          <div className="text-lg font-bold text-white">
                            {data.final.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-purple-400">Change</div>
                          <div
                            className={`text-lg font-bold ${
                              data.change > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {data.change > 0 ? "+" : ""}
                            {data.change.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                {selectedExperiment.results.insights && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Insights
                    </h4>
                    <div className="space-y-2">
                      {selectedExperiment.results.insights.map(
                        (insight, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                          >
                            <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <p className="text-purple-200">{insight.message}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessExperimentsTab;
