// frontend/ src/services/AnalyticsIntegrationService.js - Integrates analytics with journal system
import { supabase } from "../lib/supabase";
import { AnalyticsService } from "./AnalyticsService";

export class AnalyticsIntegrationService {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Process a journal entry and store analytics
   * This should be called whenever a user saves a journal entry
   */
  async processJournalEntry(
    userId,
    entryText,
    entryId = null,
    entryDate = new Date()
  ) {
    try {
      // Analyze the journal entry
      const analysis = await this.analyticsService.analyzeEntry(
        entryText,
        entryDate
      );

      // Store the analytics data
      const analyticsRecord = await this.storeAnalytics(
        userId,
        analysis,
        entryId
      );

      // Update monthly summary (this happens automatically via database trigger)
      // But we can also manually trigger it for immediate updates
      await this.updateMonthlySummary(userId, entryDate);

      // Check for insights and patterns
      await this.generateInsights(userId);

      return analyticsRecord;
    } catch (error) {
      console.error("Error processing journal entry analytics:", error);
      throw error;
    }
  }

  /**
   * Store analytics data in Supabase
   */
  async storeAnalytics(userId, analysis, entryId = null) {
    const analyticsData = {
      user_id: userId,
      entry_id: entryId,
      analysis_date: analysis.analysisDate,

      // Basic metrics
      word_count: analysis.wordCount,
      sentence_count: analysis.sentenceCount,
      entry_length: analysis.entryLength,

      // Sentiment analysis
      sentiment_positive: analysis.sentiment.positive,
      sentiment_negative: analysis.sentiment.negative,
      sentiment_neutral: analysis.sentiment.neutral,

      // Mood and energy
      mood_score: analysis.moodScore,
      energy_level: analysis.energyLevel,

      // JSON fields
      emotional_themes: analysis.emotionalThemes,
      cognitive_patterns: analysis.cognitivePatterns,
      activities: analysis.activities,
      relationships: analysis.relationships,
      self_care_activities: analysis.selfCareActivities,
      sleep_mentions: analysis.sleepMentions,
      time_orientation: analysis.timeOrientation,
      growth_language: analysis.growthLanguage,
      problem_solving: analysis.problemSolving,

      // Wellness indicators
      stress_level: analysis.stressLevel,
    };

    const { data, error } = await supabase
      .from("user_analytics")
      .insert(analyticsData)
      .select()
      .single();

    if (error) {
      console.error("Error storing analytics:", error);
      throw error;
    }

    return data;
  }

  /**
   * Manually update monthly summary for immediate dashboard updates
   */
  async updateMonthlySummary(userId, date) {
    try {
      const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format

      // Call the database function to generate monthly summary
      const { error } = await supabase.rpc("generate_monthly_summary", {
        user_uuid: userId,
        target_month: monthYear,
      });

      if (error) {
        console.error("Error updating monthly summary:", error);
      }
    } catch (error) {
      console.error("Error in updateMonthlySummary:", error);
    }
  }

  /**
   * Generate insights based on recent analytics data
   */
  async generateInsights(userId) {
    try {
      // Get recent analytics data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentAnalytics, error } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", userId)
        .gte("analysis_date", thirtyDaysAgo.toISOString())
        .order("analysis_date", { ascending: true });

      if (error || !recentAnalytics || recentAnalytics.length < 5) {
        return; // Need at least 5 entries to generate meaningful insights
      }

      // Identify patterns using the analytics service
      const patterns = this.analyticsService.identifyPatterns(recentAnalytics);

      // Generate insights based on patterns
      const insights = await this.createInsights(
        userId,
        patterns,
        recentAnalytics
      );

      // Store insights in the database
      for (const insight of insights) {
        await this.storeInsight(userId, insight);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    }
  }

  /**
   * Create insights based on identified patterns
   */
  async createInsights(userId, patterns, recentAnalytics) {
    const insights = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Mood trend insight
    if (patterns.moodTrend) {
      if (patterns.moodTrend > 0.1) {
        insights.push({
          insight_type: "trend",
          insight_category: "mood",
          title: "Positive Mood Trend",
          description: `Your mood has been trending upward over the past month with an improvement rate of ${(
            patterns.moodTrend * 100
          ).toFixed(
            1
          )}% per entry. This suggests your journaling practice is having a positive impact on your emotional well-being.`,
          confidence_score: 0.8,
          insight_data: { trend: patterns.moodTrend, type: "positive" },
          relevant_from: now,
          relevant_to: thirtyDaysFromNow,
        });
      } else if (patterns.moodTrend < -0.1) {
        insights.push({
          insight_type: "pattern",
          insight_category: "mood",
          title: "Mood Attention Needed",
          description: `Your mood has been declining over the past month. Consider incorporating more self-care activities or speaking with a mental health professional if this trend continues.`,
          confidence_score: 0.7,
          insight_data: { trend: patterns.moodTrend, type: "declining" },
          relevant_from: now,
          relevant_to: thirtyDaysFromNow,
        });
      }
    }

    // Weekly pattern insights
    if (patterns.weeklyMoodPattern && patterns.weeklyMoodPattern.length === 7) {
      const bestDay = patterns.weeklyMoodPattern.reduce((best, current) =>
        current.average > best.average ? current : best
      );
      const worstDay = patterns.weeklyMoodPattern.reduce((worst, current) =>
        current.average < worst.average ? current : worst
      );

      insights.push({
        insight_type: "pattern",
        insight_category: "mood",
        title: "Weekly Mood Patterns",
        description: `Your mood tends to be highest on ${
          bestDay.day
        }s (${bestDay.average.toFixed(1)}/10) and lowest on ${
          worstDay.day
        }s (${worstDay.average.toFixed(
          1
        )}/10). Consider planning mood-boosting activities for ${
          worstDay.day
        }s.`,
        confidence_score: 0.75,
        insight_data: {
          bestDay,
          worstDay,
          pattern: patterns.weeklyMoodPattern,
        },
        relevant_from: now,
        relevant_to: thirtyDaysFromNow,
      });
    }

    // Energy pattern insights
    if (patterns.energyTrend) {
      if (patterns.energyTrend > 0.1) {
        insights.push({
          insight_type: "trend",
          insight_category: "energy",
          title: "Rising Energy Levels",
          description: `Your energy levels have been increasing over the past month. This positive trend suggests your current lifestyle choices are supporting your vitality.`,
          confidence_score: 0.8,
          insight_data: { trend: patterns.energyTrend, type: "increasing" },
          relevant_from: now,
          relevant_to: thirtyDaysFromNow,
        });
      }
    }

    // Emotional variability insights
    if (patterns.moodVariability !== undefined) {
      if (patterns.moodVariability > 2.5) {
        insights.push({
          insight_type: "pattern",
          insight_category: "mood",
          title: "High Emotional Variability",
          description: `Your mood shows high variability (${patterns.moodVariability.toFixed(
            1
          )}), which might indicate you're experiencing significant life changes or stress. Consider developing consistent coping strategies.`,
          confidence_score: 0.7,
          insight_data: { variability: patterns.moodVariability, type: "high" },
          relevant_from: now,
          relevant_to: thirtyDaysFromNow,
        });
      } else if (patterns.moodVariability < 1.0) {
        insights.push({
          insight_type: "pattern",
          insight_category: "mood",
          title: "Stable Emotional Pattern",
          description: `Your mood shows good stability (variability: ${patterns.moodVariability.toFixed(
            1
          )}), indicating emotional resilience and effective self-regulation.`,
          confidence_score: 0.8,
          insight_data: {
            variability: patterns.moodVariability,
            type: "stable",
          },
          relevant_from: now,
          relevant_to: thirtyDaysFromNow,
        });
      }
    }

    // Growth trend insights
    if (patterns.growthTrend > 0.05) {
      insights.push({
        insight_type: "trend",
        insight_category: "cognitive",
        title: "Personal Growth Trend",
        description: `You're increasingly using growth-oriented language in your entries, suggesting active personal development and learning mindset.`,
        confidence_score: 0.75,
        insight_data: { trend: patterns.growthTrend, type: "growth" },
        relevant_from: now,
        relevant_to: thirtyDaysFromNow,
      });
    }

    return insights;
  }

  /**
   * Store an insight in the database
   */
  async storeInsight(userId, insight) {
    try {
      // Check if similar insight already exists
      const { data: existingInsights } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("user_id", userId)
        .eq("insight_category", insight.insight_category)
        .eq("title", insight.title)
        .eq("is_active", true);

      // Don't create duplicate insights
      if (existingInsights && existingInsights.length > 0) {
        return existingInsights[0];
      }

      const { data, error } = await supabase
        .from("analytics_insights")
        .insert({
          user_id: userId,
          ...insight,
        })
        .select()
        .single();

      if (error) {
        console.error("Error storing insight:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in storeInsight:", error);
      return null;
    }
  }

  /**
   * Get analytics data for dashboard display with wellness tracking integration
   */
  async getAnalyticsForDashboard(userId, dateRange = "3months") {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "1month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Get analytics data
      const { data: analyticsData, error } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", userId)
        .gte("analysis_date", startDate.toISOString())
        .lte("analysis_date", endDate.toISOString())
        .order("analysis_date", { ascending: true });

      if (error) {
        console.error("Error fetching analytics data:", error);
        throw error;
      }

      // NEW: Get wellness tracking data from journal entries
      const { data: wellnessData, error: wellnessError } = await supabase
        .from("journal_entries")
        .select("created_at, mood, energy, wellness_tracking")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .not("wellness_tracking", "is", null)
        .order("created_at", { ascending: true });

      if (wellnessError) {
        console.error("Error fetching wellness data:", wellnessError);
      }

      if (!analyticsData || analyticsData.length === 0) {
        return this.getEmptyDashboardData();
      }

      // Process the data for dashboard consumption
      return this.processDashboardData(analyticsData, wellnessData);
    } catch (error) {
      console.error("Error in getAnalyticsForDashboard:", error);
      throw error;
    }
  }

  /**
   * Process raw analytics data into dashboard-friendly format
   */
  processDashboardData(analyticsData, wellnessData = []) {
    return {
      overview: this.processOverviewData(analyticsData),
      sentiment: this.processSentimentData(analyticsData),
      mood: this.processMoodData(analyticsData),
      energy: this.processEnergyData(analyticsData),
      themes: this.processThemesData(analyticsData),
      behavioral: this.processBehavioralData(analyticsData, wellnessData),
      cognitive: this.processCognitiveData(analyticsData),
      wellness: this.processWellnessData(analyticsData, wellnessData),
    };
  }

  // ... (keeping all existing process functions unchanged until behavioral and wellness) ...

  processOverviewData(data) {
    if (data.length === 0) return this.getEmptyOverview();

    const totalEntries = data.length;
    const totalWords = data.reduce(
      (sum, entry) => sum + (entry.word_count || 0),
      0
    );
    const avgWordsPerEntry = Math.round(totalWords / totalEntries);

    const avgMood =
      data.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) /
      totalEntries;
    const avgEnergy =
      data.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) /
      totalEntries;

    // Calculate journaling streak (consecutive days)
    const dates = data.map((entry) =>
      new Date(entry.analysis_date).toDateString()
    );
    const uniqueDates = [...new Set(dates)].sort(
      (a, b) => new Date(b) - new Date(a)
    );

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    // Extract top themes
    const themeCount = {};
    data.forEach((entry) => {
      if (entry.emotional_themes && Array.isArray(entry.emotional_themes)) {
        entry.emotional_themes.forEach((themeObj) => {
          const themeName =
            typeof themeObj === "string" ? themeObj : themeObj.theme;
          themeCount[themeName] = (themeCount[themeName] || 0) + 1;
        });
      }
    });

    const mostCommonThemes = Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    return {
      totalEntries,
      totalWords,
      avgWordsPerEntry,
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      journalingStreak: streak,
      mostCommonThemes,
    };
  }

  processSentimentData(data) {
    // Daily sentiment aggregation
    const dailyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { positive: 0, negative: 0, neutral: 0, count: 0 };
      }
      dailyData[date].positive += entry.sentiment_positive || 0;
      dailyData[date].negative += entry.sentiment_negative || 0;
      dailyData[date].neutral += entry.sentiment_neutral || 0;
      dailyData[date].count++;
    });

    const daily = Object.entries(dailyData).map(([date, sentiment]) => ({
      date,
      positive: (sentiment.positive / sentiment.count).toFixed(3),
      negative: (sentiment.negative / sentiment.count).toFixed(3),
      neutral: (sentiment.neutral / sentiment.count).toFixed(3),
    }));

    // Weekly sentiment aggregation
    const weeklyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date);
      const weekStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay()
      );
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          count: 0,
        };
      }
      weeklyData[weekKey].positive += entry.sentiment_positive || 0;
      weeklyData[weekKey].negative += entry.sentiment_negative || 0;
      weeklyData[weekKey].neutral += entry.sentiment_neutral || 0;
      weeklyData[weekKey].count++;
    });

    const weekly = Object.entries(weeklyData).map(([week, sentiment]) => ({
      week,
      positive: (sentiment.positive / sentiment.count).toFixed(3),
      negative: (sentiment.negative / sentiment.count).toFixed(3),
      neutral: (sentiment.neutral / sentiment.count).toFixed(3),
    }));

    // Emotion distribution
    const emotionCount = {};
    data.forEach((entry) => {
      if (entry.emotional_themes && Array.isArray(entry.emotional_themes)) {
        entry.emotional_themes.forEach((themeObj) => {
          const emotion =
            typeof themeObj === "string" ? themeObj : themeObj.theme;
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
      }
    });

    const emotions = Object.entries(emotionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([emotion, count]) => ({ emotion, count }));

    return { daily, weekly, emotions };
  }

  processMoodData(data) {
    // Daily mood aggregation
    const dailyMood = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toISOString().split("T")[0];
      if (!dailyMood[date]) {
        dailyMood[date] = { mood: 0, count: 0 };
      }
      dailyMood[date].mood += entry.mood_score || 0;
      dailyMood[date].count++;
    });

    const daily = Object.entries(dailyMood).map(([date, mood]) => ({
      date,
      mood: (mood.mood / mood.count).toFixed(1),
    }));

    // Weekly pattern analysis
    const weeklyPattern = Array(7)
      .fill(0)
      .map(() => ({ sum: 0, count: 0 }));
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date);
      const dayOfWeek = date.getDay();
      weeklyPattern[dayOfWeek].sum += entry.mood_score || 0;
      weeklyPattern[dayOfWeek].count++;
    });

    const weeklyMoodPattern = weeklyPattern.map((day, index) => ({
      day: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][index],
      average: day.count > 0 ? (day.sum / day.count).toFixed(1) : 0,
    }));

    return {
      daily,
      weeklyPattern: weeklyMoodPattern,
      patterns: {
        bestMoodDay: weeklyMoodPattern.reduce((best, current) =>
          parseFloat(current.average) > parseFloat(best.average)
            ? current
            : best
        ).day,
        lowestMoodDay: weeklyMoodPattern.reduce((worst, current) =>
          parseFloat(current.average) < parseFloat(worst.average)
            ? current
            : worst
        ).day,
        stabilityScore: this.calculateStabilityScore(
          data.map((d) => d.mood_score || 0)
        ),
        moodConsistency: this.calculateConsistency(
          data.map((d) => d.mood_score || 0)
        ),
      },
    };
  }

  processEnergyData(data) {
    // Daily energy aggregation
    const dailyEnergy = {};
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date).toISOString().split("T")[0];
      if (!dailyEnergy[date]) {
        dailyEnergy[date] = { energy: 0, count: 0 };
      }
      dailyEnergy[date].energy += entry.energy_level || 0;
      dailyEnergy[date].count++;
    });

    const daily = Object.entries(dailyEnergy).map(([date, energy]) => ({
      date,
      energy: (energy.energy / energy.count).toFixed(1),
    }));

    // Weekly pattern analysis
    const weeklyPattern = Array(7)
      .fill(0)
      .map(() => ({ sum: 0, count: 0 }));
    data.forEach((entry) => {
      const date = new Date(entry.analysis_date);
      const dayOfWeek = date.getDay();
      weeklyPattern[dayOfWeek].sum += entry.energy_level || 0;
      weeklyPattern[dayOfWeek].count++;
    });

    const weeklyEnergyPattern = weeklyPattern.map((day, index) => ({
      day: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][index],
      average: day.count > 0 ? (day.sum / day.count).toFixed(1) : 0,
    }));

    return {
      daily,
      weeklyPattern: weeklyEnergyPattern,
      patterns: {
        bestEnergyDay: weeklyEnergyPattern.reduce((best, current) =>
          parseFloat(current.average) > parseFloat(best.average)
            ? current
            : best
        ).day,
        lowestEnergyDay: weeklyEnergyPattern.reduce((worst, current) =>
          parseFloat(current.average) < parseFloat(worst.average)
            ? current
            : worst
        ).day,
        energyConsistency: this.calculateConsistency(
          data.map((d) => d.energy_level || 0)
        ),
      },
    };
  }

  processThemesData(data) {
    const themeCount = {};
    data.forEach((entry) => {
      if (entry.emotional_themes && Array.isArray(entry.emotional_themes)) {
        entry.emotional_themes.forEach((themeObj) => {
          const theme =
            typeof themeObj === "string" ? themeObj : themeObj.theme;
          themeCount[theme] = (themeCount[theme] || 0) + 1;
        });
      }
    });

    const topThemes = Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    return {
      topThemes,
      themeEvolution: [], // To be implemented
      emergingThemes: [], // To be implemented
    };
  }

  processBehavioralData(data, wellnessData) {
    // Analyze journaling habits
    const journalingFrequency = this.calculateJournalingFrequency(data);
    const activityPatterns = this.extractActivityPatterns(data);

    // NEW: Extract exercise patterns from wellness tracking
    const exercisePatterns = this.extractExercisePatterns(wellnessData);

    return {
      journalingHabits: {
        frequency: journalingFrequency,
        bestTimes: [], // To be implemented
        consistency: 0, // To be implemented
      },
      activityPatterns,
      exercisePatterns, // NEW
      socialDynamics: this.extractSocialDynamics(data),
    };
  }

  // NEW: Extract exercise patterns from wellness tracking
  extractExercisePatterns(wellnessData) {
    const exerciseStats = {};
    let totalExerciseDays = 0;
    let totalDuration = 0;

    wellnessData.forEach((entry) => {
      if (entry.wellness_tracking?.exercise_type) {
        const type = entry.wellness_tracking.exercise_type;
        const duration = entry.wellness_tracking.exercise_duration || 0;

        if (!exerciseStats[type]) {
          exerciseStats[type] = {
            count: 0,
            totalDuration: 0,
            avgMood: 0,
            moodSum: 0,
          };
        }

        exerciseStats[type].count++;
        exerciseStats[type].totalDuration += duration;
        exerciseStats[type].moodSum += entry.mood || 0;

        totalExerciseDays++;
        totalDuration += duration;
      }
    });

    // Calculate averages
    Object.keys(exerciseStats).forEach((type) => {
      exerciseStats[type].avgDuration =
        exerciseStats[type].totalDuration / exerciseStats[type].count;
      exerciseStats[type].avgMood =
        exerciseStats[type].moodSum / exerciseStats[type].count;
    });

    return {
      exerciseTypes: exerciseStats,
      totalExerciseDays,
      totalDuration,
      avgSessionDuration:
        totalExerciseDays > 0 ? totalDuration / totalExerciseDays : 0,
      exerciseFrequency: totalExerciseDays / Math.max(1, wellnessData.length),
    };
  }

  processCognitiveData(data) {
    const cognitivePatterns = {};
    data.forEach((entry) => {
      if (entry.cognitive_patterns && Array.isArray(entry.cognitive_patterns)) {
        entry.cognitive_patterns.forEach((patternObj) => {
          const pattern =
            typeof patternObj === "string" ? patternObj : patternObj.pattern;
          cognitivePatterns[pattern] = (cognitivePatterns[pattern] || 0) + 1;
        });
      }
    });

    return {
      thinkingPatterns: Object.entries(cognitivePatterns).map(
        ([pattern, count]) => ({ pattern, count })
      ),
      problemSolving: this.extractProblemSolvingData(data),
      growthIndicators: this.extractGrowthIndicators(data),
    };
  }

  processWellnessData(data, wellnessData) {
    const selfCareFrequency = {};
    let totalStress = 0;
    let stressCount = 0;

    // Process AI-detected wellness patterns
    data.forEach((entry) => {
      if (entry.self_care_activities) {
        Object.entries(entry.self_care_activities).forEach(
          ([category, activities]) => {
            selfCareFrequency[category] =
              (selfCareFrequency[category] || 0) + activities.length;
          }
        );
      }

      if (entry.stress_level) {
        totalStress += entry.stress_level;
        stressCount++;
      }
    });

    // NEW: Process user-tracked wellness data
    const userWellnessStats = this.processUserWellnessData(wellnessData);

    return {
      selfCarePatterns: selfCareFrequency,
      averageStressLevel:
        stressCount > 0 ? (totalStress / stressCount).toFixed(1) : 0,
      stressIndicators: [], // To be implemented
      sleepPatterns: this.extractSleepPatterns(data),
      // NEW: User-tracked wellness data
      userTrackedWellness: userWellnessStats,
    };
  }

  // NEW: Process user-tracked wellness data
  processUserWellnessData(wellnessData) {
    let sleepStats = {
      totalNights: 0,
      totalHours: 0,
      avgQuality: 0,
      qualitySum: 0,
    };

    let hydrationStats = {
      totalDays: 0,
      totalGlasses: 0,
      avgGlasses: 0,
    };

    let wellnessActivityStats = {};

    wellnessData.forEach((entry) => {
      const tracking = entry.wellness_tracking;
      if (!tracking) return;

      // Sleep data
      if (tracking.sleep_hours) {
        sleepStats.totalNights++;
        sleepStats.totalHours += tracking.sleep_hours;
        sleepStats.qualitySum += tracking.sleep_quality || 5;
      }

      // Hydration data
      if (tracking.hydration_glasses) {
        hydrationStats.totalDays++;
        hydrationStats.totalGlasses += tracking.hydration_glasses;
      }

      // Wellness activities
      if (
        tracking.wellness_activities &&
        Array.isArray(tracking.wellness_activities)
      ) {
        tracking.wellness_activities.forEach((activity) => {
          if (!wellnessActivityStats[activity]) {
            wellnessActivityStats[activity] = {
              count: 0,
              avgMood: 0,
              moodSum: 0,
            };
          }
          wellnessActivityStats[activity].count++;
          wellnessActivityStats[activity].moodSum += entry.mood || 0;
        });
      }
    });

    // Calculate averages
    if (sleepStats.totalNights > 0) {
      sleepStats.avgHours = sleepStats.totalHours / sleepStats.totalNights;
      sleepStats.avgQuality = sleepStats.qualitySum / sleepStats.totalNights;
    }

    if (hydrationStats.totalDays > 0) {
      hydrationStats.avgGlasses =
        hydrationStats.totalGlasses / hydrationStats.totalDays;
    }

    Object.keys(wellnessActivityStats).forEach((activity) => {
      wellnessActivityStats[activity].avgMood =
        wellnessActivityStats[activity].moodSum /
        wellnessActivityStats[activity].count;
    });

    return {
      sleep: sleepStats,
      hydration: hydrationStats,
      wellnessActivities: wellnessActivityStats,
    };
  }

  // Helper functions
  calculateStabilityScore(values) {
    if (values.length < 2) return 10;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;
    const stability = Math.max(0, 10 - Math.sqrt(variance));
    return stability.toFixed(1);
  }

  calculateConsistency(values) {
    if (values.length < 2) return 1;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, 1 - standardDeviation / 10);
    return consistency;
  }

  calculateJournalingFrequency(data) {
    const dates = data.map((entry) =>
      new Date(entry.analysis_date).toDateString()
    );
    const uniqueDates = [...new Set(dates)];
    const totalDays = Math.ceil(
      (new Date() - new Date(data[0].analysis_date)) / (1000 * 60 * 60 * 24)
    );
    return uniqueDates.length / Math.max(1, totalDays);
  }

  extractActivityPatterns(data) {
    const activities = {};
    data.forEach((entry) => {
      if (entry.activities && Array.isArray(entry.activities)) {
        entry.activities.forEach((activity) => {
          activities[activity] = (activities[activity] || 0) + 1;
        });
      }
    });
    return Object.entries(activities).map(([activity, count]) => ({
      activity,
      count,
    }));
  }

  extractSocialDynamics(data) {
    const relationships = {};
    data.forEach((entry) => {
      if (entry.relationships && Array.isArray(entry.relationships)) {
        entry.relationships.forEach((relObj) => {
          const relType = typeof relObj === "string" ? relObj : relObj.type;
          relationships[relType] = (relationships[relType] || 0) + 1;
        });
      }
    });
    return { relationships, sentiment: {} };
  }

  extractProblemSolvingData(data) {
    let problemSolvingCount = 0;
    data.forEach((entry) => {
      if (
        entry.problem_solving &&
        entry.problem_solving.approach === "problem-solving"
      ) {
        problemSolvingCount++;
      }
    });
    return { approaches: [], effectiveness: problemSolvingCount / data.length };
  }

  extractGrowthIndicators(data) {
    const growthMentions = data.filter(
      (entry) =>
        entry.growth_language && entry.growth_language.hasGrowthLanguage
    ).length;
    return { indicators: [], trends: growthMentions / data.length };
  }

  extractSleepPatterns(data) {
    const sleepMentions = data.filter(
      (entry) => entry.sleep_mentions && entry.sleep_mentions.hasReferences
    ).length;
    const goodSleep = data.filter(
      (entry) => entry.sleep_mentions && entry.sleep_mentions.quality === "good"
    ).length;

    return {
      quality: goodSleep / Math.max(1, sleepMentions),
      patterns: [],
    };
  }

  getEmptyDashboardData() {
    return {
      overview: this.getEmptyOverview(),
      sentiment: { daily: [], weekly: [], emotions: [] },
      mood: { daily: [], weeklyPattern: [], patterns: {} },
      energy: { daily: [], weeklyPattern: [], patterns: {} },
      themes: { topThemes: [], themeEvolution: [], emergingThemes: [] },
      behavioral: {
        journalingHabits: {},
        activityPatterns: [],
        exercisePatterns: {},
        socialDynamics: {},
      },
      cognitive: {
        thinkingPatterns: [],
        problemSolving: {},
        growthIndicators: {},
      },
      wellness: {
        selfCarePatterns: {},
        averageStressLevel: 0,
        stressIndicators: [],
        sleepPatterns: {},
        userTrackedWellness: {},
      },
    };
  }

  getEmptyOverview() {
    return {
      totalEntries: 0,
      totalWords: 0,
      avgWordsPerEntry: 0,
      avgMood: "0.0",
      avgEnergy: "0.0",
      journalingStreak: 0,
      mostCommonThemes: [],
    };
  }

  /**
   * Get user insights for display
   */
  async getUserInsights(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching insights:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserInsights:", error);
      return [];
    }
  }

  /**
   * Mark an insight as acknowledged by the user
   */
  async acknowledgeInsight(userId, insightId) {
    try {
      const { error } = await supabase
        .from("analytics_insights")
        .update({ user_acknowledged: true })
        .eq("id", insightId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error acknowledging insight:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in acknowledgeInsight:", error);
      return false;
    }
  }
}

export default AnalyticsIntegrationService;
