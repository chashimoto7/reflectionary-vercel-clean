// src/services/WomensHealthService.js
import { supabase } from "../lib/supabase";

class WomensHealthService {
  constructor() {
    this.tableName = "womens_health_data";
    this.cycleTableName = "cycle_patterns";
    this.insightsTableName = "health_insights";
    this.correlationsTableName = "health_journal_correlations";
    this.educationalTableName = "educational_content";
    this.progressTableName = "user_educational_progress";
    this.symptomsTableName = "symptom_definitions";
  }

  // =============================================
  // DAILY HEALTH DATA OPERATIONS
  // =============================================

  /**
   * Save daily health data entry
   */
  async saveHealthData(userId, healthData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(
          {
            user_id: userId,
            date: healthData.date,
            is_period_start: healthData.isPeriodStart || false,
            is_period_end: healthData.isPeriodEnd || false,
            period_flow: healthData.periodFlow || null,
            cycle_phase: healthData.cyclePhase || null,
            cycle_day: healthData.cycleDay || null,
            life_stage: healthData.lifeStage || "menstrual",
            physical_symptoms: healthData.physicalSymptoms || {},
            emotional_symptoms: healthData.emotionalSymptoms || {},
            energy_level: healthData.energyLevel || null,
            sleep_quality: healthData.sleepQuality || null,
            sleep_hours: healthData.sleepHours || null,
            mood_rating: healthData.moodRating || null,
            basal_body_temperature: healthData.basalBodyTemperature || null,
            notes: healthData.notes || null,
          },
          { onConflict: "user_id,date" }
        )
        .select();

      if (error) throw error;

      // After saving new data, trigger pattern analysis
      await this.updateCyclePatterns(userId);

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error saving health data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get health data for a date range
   */
  async getHealthData(userId, startDate, endDate = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .order("date", { ascending: false });

      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching health data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get health data for a specific date
   */
  async getHealthDataForDate(userId, date) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found

      return { success: true, data: data || null };
    } catch (error) {
      console.error("Error fetching health data for date:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // CYCLE PATTERN ANALYSIS
  // =============================================

  /**
   * Update cycle patterns and predictions for a user
   */
  async updateCyclePatterns(userId) {
    try {
      // Get recent health data for analysis
      const { data: healthData } = await this.getHealthData(
        userId,
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0] // Last year
      );

      if (!healthData || healthData.length === 0) {
        return { success: true, message: "No data to analyze" };
      }

      // Analyze cycle patterns
      const patterns = this.analyzeCyclePatterns(healthData);
      const predictions = this.generatePredictions(healthData, patterns);

      // Save/update cycle patterns
      const { data, error } = await supabase
        .from(this.cycleTableName)
        .upsert(
          {
            user_id: userId,
            average_cycle_length: patterns.averageCycleLength,
            average_period_length: patterns.averagePeriodLength,
            cycle_regularity_score: patterns.regularityScore,
            last_period_start: patterns.lastPeriodStart,
            last_period_end: patterns.lastPeriodEnd,
            next_period_prediction: predictions.nextPeriod,
            next_ovulation_prediction: predictions.nextOvulation,
            fertile_window_start: predictions.fertileWindowStart,
            fertile_window_end: predictions.fertileWindowEnd,
            prediction_confidence: predictions.confidence,
            symptom_patterns: patterns.symptomPatterns,
            mood_patterns: patterns.moodPatterns,
            energy_patterns: patterns.energyPatterns,
            perimenopause_indicators: patterns.perimenopauseIndicators,
            menopause_indicators: patterns.menopauseIndicators,
          },
          { onConflict: "user_id" }
        )
        .select();

      if (error) throw error;

      // Generate insights based on new patterns
      await this.generateHealthInsights(userId, healthData, patterns);

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error updating cycle patterns:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cycle patterns for a user
   */
  async getCyclePatterns(userId) {
    try {
      const { data, error } = await supabase
        .from(this.cycleTableName)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return { success: true, data: data || null };
    } catch (error) {
      console.error("Error fetching cycle patterns:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // PATTERN ANALYSIS ALGORITHMS
  // =============================================

  /**
   * Analyze cycle patterns from health data
   */
  analyzeCyclePatterns(healthData) {
    const periodStarts = healthData
      .filter((d) => d.is_period_start)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const periodEnds = healthData
      .filter((d) => d.is_period_end)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate cycle lengths
    const cycleLengths = [];
    for (let i = 1; i < periodStarts.length; i++) {
      const daysBetween = Math.floor(
        (new Date(periodStarts[i].date) - new Date(periodStarts[i - 1].date)) /
          (1000 * 60 * 60 * 24)
      );
      if (daysBetween > 0 && daysBetween <= 45) {
        // Reasonable cycle length
        cycleLengths.push(daysBetween);
      }
    }

    // Calculate period lengths
    const periodLengths = [];
    periodStarts.forEach((start) => {
      const correspondingEnd = periodEnds.find(
        (end) =>
          new Date(end.date) >= new Date(start.date) &&
          Math.floor(
            (new Date(end.date) - new Date(start.date)) / (1000 * 60 * 60 * 24)
          ) <= 10
      );
      if (correspondingEnd) {
        const length =
          Math.floor(
            (new Date(correspondingEnd.date) - new Date(start.date)) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        periodLengths.push(length);
      }
    });

    // Calculate averages
    const averageCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((sum, len) => sum + len, 0) /
              cycleLengths.length
          )
        : null;

    const averagePeriodLength =
      periodLengths.length > 0
        ? Math.round(
            periodLengths.reduce((sum, len) => sum + len, 0) /
              periodLengths.length
          )
        : null;

    // Calculate regularity score (based on cycle length consistency)
    let regularityScore = null;
    if (cycleLengths.length >= 3) {
      const variance = this.calculateVariance(cycleLengths);
      const standardDeviation = Math.sqrt(variance);
      // Lower standard deviation = higher regularity
      regularityScore = Math.max(
        0,
        Math.min(100, Math.round(100 - standardDeviation * 10))
      );
    }

    // Analyze symptom patterns by cycle phase
    const symptomPatterns = this.analyzeSymptomPatterns(healthData);
    const moodPatterns = this.analyzeMoodPatterns(healthData);
    const energyPatterns = this.analyzeEnergyPatterns(healthData);

    // Detect life stage indicators
    const perimenopauseIndicators = this.detectPerimenopauseIndicators(
      healthData,
      cycleLengths
    );
    const menopauseIndicators = this.detectMenopauseIndicators(
      healthData,
      periodStarts
    );

    return {
      averageCycleLength,
      averagePeriodLength,
      regularityScore,
      lastPeriodStart:
        periodStarts.length > 0
          ? periodStarts[periodStarts.length - 1].date
          : null,
      lastPeriodEnd:
        periodEnds.length > 0 ? periodEnds[periodEnds.length - 1].date : null,
      symptomPatterns,
      moodPatterns,
      energyPatterns,
      perimenopauseIndicators,
      menopauseIndicators,
    };
  }

  /**
   * Generate predictions based on patterns
   */
  generatePredictions(healthData, patterns) {
    if (!patterns.lastPeriodStart || !patterns.averageCycleLength) {
      return {
        nextPeriod: null,
        nextOvulation: null,
        fertileWindowStart: null,
        fertileWindowEnd: null,
        confidence: 0,
      };
    }

    const lastPeriodDate = new Date(patterns.lastPeriodStart);
    const cycleLength = patterns.averageCycleLength;

    // Predict next period
    const nextPeriodDate = new Date(
      lastPeriodDate.getTime() + cycleLength * 24 * 60 * 60 * 1000
    );

    // Predict ovulation (typically 14 days before next period)
    const nextOvulationDate = new Date(
      nextPeriodDate.getTime() - 14 * 24 * 60 * 60 * 1000
    );

    // Fertile window (5 days before ovulation to 1 day after)
    const fertileWindowStart = new Date(
      nextOvulationDate.getTime() - 5 * 24 * 60 * 60 * 1000
    );
    const fertileWindowEnd = new Date(
      nextOvulationDate.getTime() + 1 * 24 * 60 * 60 * 1000
    );

    // Calculate confidence based on regularity
    const confidence = patterns.regularityScore || 50;

    return {
      nextPeriod: nextPeriodDate.toISOString().split("T")[0],
      nextOvulation: nextOvulationDate.toISOString().split("T")[0],
      fertileWindowStart: fertileWindowStart.toISOString().split("T")[0],
      fertileWindowEnd: fertileWindowEnd.toISOString().split("T")[0],
      confidence,
    };
  }

  // =============================================
  // SYMPTOM & PATTERN ANALYSIS
  // =============================================

  /**
   * Analyze symptom patterns by cycle phase
   */
  analyzeSymptomPatterns(healthData) {
    const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
    const patterns = {};

    phases.forEach((phase) => {
      const phaseData = healthData.filter((d) => d.cycle_phase === phase);
      if (phaseData.length === 0) return;

      // Aggregate physical symptoms
      const allPhysicalSymptoms = {};
      phaseData.forEach((entry) => {
        if (entry.physical_symptoms) {
          Object.entries(entry.physical_symptoms).forEach(
            ([symptom, severity]) => {
              if (!allPhysicalSymptoms[symptom])
                allPhysicalSymptoms[symptom] = [];
              allPhysicalSymptoms[symptom].push(severity);
            }
          );
        }
      });

      // Calculate average severity for each symptom
      const avgPhysicalSymptoms = {};
      Object.entries(allPhysicalSymptoms).forEach(([symptom, severities]) => {
        avgPhysicalSymptoms[symptom] =
          severities.reduce((sum, s) => sum + s, 0) / severities.length;
      });

      patterns[phase] = {
        physical: avgPhysicalSymptoms,
        sampleSize: phaseData.length,
      };
    });

    return patterns;
  }

  /**
   * Analyze mood patterns by cycle phase
   */
  analyzeMoodPatterns(healthData) {
    const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
    const patterns = {};

    phases.forEach((phase) => {
      const phaseData = healthData.filter(
        (d) => d.cycle_phase === phase && d.mood_rating !== null
      );
      if (phaseData.length === 0) return;

      const avgMood =
        phaseData.reduce((sum, d) => sum + d.mood_rating, 0) / phaseData.length;
      patterns[phase] = {
        averageMood: Math.round(avgMood * 10) / 10,
        sampleSize: phaseData.length,
      };
    });

    return patterns;
  }

  /**
   * Analyze energy patterns by cycle phase
   */
  analyzeEnergyPatterns(healthData) {
    const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
    const patterns = {};

    phases.forEach((phase) => {
      const phaseData = healthData.filter(
        (d) => d.cycle_phase === phase && d.energy_level !== null
      );
      if (phaseData.length === 0) return;

      const avgEnergy =
        phaseData.reduce((sum, d) => sum + d.energy_level, 0) /
        phaseData.length;
      patterns[phase] = {
        averageEnergy: Math.round(avgEnergy * 10) / 10,
        sampleSize: phaseData.length,
      };
    });

    return patterns;
  }

  /**
   * Detect perimenopause indicators
   */
  detectPerimenopauseIndicators(healthData, cycleLengths) {
    const indicators = {
      irregularCycles: false,
      missedPeriods: false,
      hotFlashes: false,
      sleepIssues: false,
      moodChanges: false,
      score: 0,
    };

    // Check for irregular cycles
    if (cycleLengths.length >= 3) {
      const variance = this.calculateVariance(cycleLengths);
      if (variance > 49) {
        // High variance indicates irregularity
        indicators.irregularCycles = true;
        indicators.score += 20;
      }
    }

    // Check for missed periods (gaps > 45 days)
    const recentData = healthData.slice(0, 90); // Last 3 months
    const periodStarts = recentData.filter((d) => d.is_period_start);
    if (periodStarts.length < 2) {
      indicators.missedPeriods = true;
      indicators.score += 25;
    }

    // Check for hot flashes in symptoms
    const hasHotFlashes = healthData.some(
      (d) => d.physical_symptoms && d.physical_symptoms.hot_flashes > 0
    );
    if (hasHotFlashes) {
      indicators.hotFlashes = true;
      indicators.score += 20;
    }

    // Check for sleep issues
    const avgSleepQuality = healthData
      .filter((d) => d.sleep_quality !== null)
      .reduce((sum, d, _, arr) => sum + d.sleep_quality / arr.length, 0);
    if (avgSleepQuality < 6) {
      indicators.sleepIssues = true;
      indicators.score += 15;
    }

    // Check for mood changes
    const recentMoodVariance = this.calculateMoodVariance(
      healthData.slice(0, 30)
    );
    if (recentMoodVariance > 4) {
      indicators.moodChanges = true;
      indicators.score += 20;
    }

    return indicators;
  }

  /**
   * Detect menopause indicators
   */
  detectMenopauseIndicators(healthData, periodStarts) {
    const indicators = {
      noPeriods12Months: false,
      noPeriods6Months: false,
      persistentSymptoms: false,
      score: 0,
    };

    // Check for no periods in 12 months
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const recentPeriods = periodStarts.filter(
      (p) => new Date(p.date) > twelveMonthsAgo
    );

    if (recentPeriods.length === 0) {
      indicators.noPeriods12Months = true;
      indicators.score += 50;
    } else {
      // Check for 6 months
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const recentSixMonthPeriods = periodStarts.filter(
        (p) => new Date(p.date) > sixMonthsAgo
      );
      if (recentSixMonthPeriods.length === 0) {
        indicators.noPeriods6Months = true;
        indicators.score += 25;
      }
    }

    // Check for persistent menopausal symptoms
    const recentData = healthData.slice(0, 90);
    const hotFlashFrequency = recentData.filter(
      (d) => d.physical_symptoms && d.physical_symptoms.hot_flashes > 3
    ).length;

    if (hotFlashFrequency > 30) {
      // More than 1/3 of days
      indicators.persistentSymptoms = true;
      indicators.score += 25;
    }

    return indicators;
  }

  // =============================================
  // HEALTH INSIGHTS GENERATION
  // =============================================

  /**
   * Generate AI insights based on health patterns
   */
  async generateHealthInsights(userId, healthData, patterns) {
    try {
      const insights = [];

      // Cycle pattern insights
      if (patterns.regularityScore !== null) {
        if (patterns.regularityScore < 60) {
          insights.push({
            insight_type: "cycle_pattern",
            title: "Irregular Cycle Pattern Detected",
            description: `Your cycle regularity score is ${patterns.regularityScore}%. Consider tracking for a few more months to identify patterns.`,
            severity: "low",
            recommendations: [
              "Continue daily tracking for better insights",
              "Note any lifestyle changes or stress factors",
              "Consider consulting with a healthcare provider if irregularity persists",
            ],
            confidence_score: 80,
          });
        } else if (patterns.regularityScore > 85) {
          insights.push({
            insight_type: "cycle_pattern",
            title: "Very Regular Cycle Pattern",
            description: `Excellent! Your cycle regularity score is ${patterns.regularityScore}%. This indicates healthy hormonal balance.`,
            severity: "info",
            recommendations: [
              "Keep up your current healthy habits",
              "Continue tracking to maintain awareness",
            ],
            confidence_score: 90,
          });
        }
      }

      // Symptom correlation insights
      const symptomInsights = this.generateSymptomInsights(
        healthData,
        patterns
      );
      insights.push(...symptomInsights);

      // Life stage transition insights
      const transitionInsights = this.generateTransitionInsights(patterns);
      insights.push(...transitionInsights);

      // Energy and mood insights
      const wellnessInsights = this.generateWellnessInsights(
        healthData,
        patterns
      );
      insights.push(...wellnessInsights);

      // Save insights to database
      for (const insight of insights) {
        await supabase.from(this.insightsTableName).insert({
          user_id: userId,
          ...insight,
        });
      }

      return { success: true, insights };
    } catch (error) {
      console.error("Error generating health insights:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate symptom-specific insights
   */
  generateSymptomInsights(healthData, patterns) {
    const insights = [];

    // Check for severe symptom patterns
    Object.entries(patterns.symptomPatterns || {}).forEach(([phase, data]) => {
      Object.entries(data.physical || {}).forEach(([symptom, avgSeverity]) => {
        if (avgSeverity > 7) {
          insights.push({
            insight_type: "symptom_correlation",
            title: `High ${symptom} During ${phase} Phase`,
            description: `You experience severe ${symptom} (average ${avgSeverity.toFixed(
              1
            )}/10) during your ${phase} phase.`,
            severity: "medium",
            recommendations: [
              `Track ${symptom} daily to identify triggers`,
              "Consider lifestyle modifications during this phase",
              "Discuss with healthcare provider if symptoms are severe",
            ],
            confidence_score: 75,
          });
        }
      });
    });

    return insights;
  }

  /**
   * Generate life stage transition insights
   */
  generateTransitionInsights(patterns) {
    const insights = [];

    // Perimenopause insights
    if (
      patterns.perimenopauseIndicators &&
      patterns.perimenopauseIndicators.score > 40
    ) {
      insights.push({
        insight_type: "life_stage_transition",
        title: "Possible Perimenopause Transition",
        description: `Based on your patterns, you may be entering perimenopause. This is a natural transition that can last several years.`,
        severity: "medium",
        recommendations: [
          "Continue tracking symptoms and cycle patterns",
          "Consider discussing with a healthcare provider",
          "Focus on stress management and healthy lifestyle habits",
          "Learn about perimenopause to understand what to expect",
        ],
        confidence_score: patterns.perimenopauseIndicators.score,
      });
    }

    // Menopause insights
    if (
      patterns.menopauseIndicators &&
      patterns.menopauseIndicators.score > 50
    ) {
      insights.push({
        insight_type: "life_stage_transition",
        title: "Menopause Transition Detected",
        description: `Your patterns suggest you may be in menopause. This marks the end of your reproductive years and beginning of a new life chapter.`,
        severity: "info",
        recommendations: [
          "Celebrate this natural life transition",
          "Focus on bone health and cardiovascular wellness",
          "Consider hormone therapy if symptoms are bothersome",
          "Maintain regular healthcare checkups",
        ],
        confidence_score: patterns.menopauseIndicators.score,
      });
    }

    return insights;
  }

  /**
   * Generate wellness and mood insights
   */
  generateWellnessInsights(healthData, patterns) {
    const insights = [];

    // Energy pattern insights
    if (patterns.energyPatterns) {
      const phases = Object.keys(patterns.energyPatterns);
      const energyValues = phases.map(
        (phase) => patterns.energyPatterns[phase].averageEnergy
      );

      if (energyValues.length > 0) {
        const maxEnergy = Math.max(...energyValues);
        const minEnergy = Math.min(...energyValues);

        if (maxEnergy - minEnergy > 3) {
          const highPhase = phases[energyValues.indexOf(maxEnergy)];
          const lowPhase = phases[energyValues.indexOf(minEnergy)];

          insights.push({
            insight_type: "energy_pattern",
            title: "Significant Energy Fluctuations",
            description: `Your energy varies significantly throughout your cycle, peaking during ${highPhase} phase and lowest during ${lowPhase} phase.`,
            severity: "info",
            recommendations: [
              `Schedule important tasks during your ${highPhase} phase`,
              `Plan rest and self-care during your ${lowPhase} phase`,
              "Adapt your exercise routine to match your energy cycles",
            ],
            confidence_score: 70,
          });
        }
      }
    }

    return insights;
  }

  // =============================================
  // CORRELATION WITH JOURNAL DATA
  // =============================================

  /**
   * Analyze correlations between health data and journal entries
   */
  async analyzeJournalCorrelations(userId) {
    try {
      // Get health data
      const { data: healthData } = await this.getHealthData(
        userId,
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0] // Last 6 months
      );

      // Get journal data
      const { data: journalData, error: journalError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .gte(
          "created_at",
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: false });

      if (journalError) throw journalError;

      if (
        !healthData ||
        !journalData ||
        healthData.length === 0 ||
        journalData.length === 0
      ) {
        return {
          success: true,
          message: "Insufficient data for correlation analysis",
        };
      }

      // Perform correlation analysis
      const correlations = [];

      // Mood-Cycle Correlation
      const moodCycleCorr = this.calculateMoodCycleCorrelation(
        healthData,
        journalData
      );
      if (moodCycleCorr) correlations.push(moodCycleCorr);

      // Energy-Cycle Correlation
      const energyCycleCorr = this.calculateEnergyCycleCorrelation(
        healthData,
        journalData
      );
      if (energyCycleCorr) correlations.push(energyCycleCorr);

      // Sleep-Cycle Correlation
      const sleepCycleCorr = this.calculateSleepCycleCorrelation(
        healthData,
        journalData
      );
      if (sleepCycleCorr) correlations.push(sleepCycleCorr);

      // Save correlations
      for (const correlation of correlations) {
        await supabase.from(this.correlationsTableName).insert({
          user_id: userId,
          ...correlation,
        });
      }

      return { success: true, correlations };
    } catch (error) {
      console.error("Error analyzing journal correlations:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate mood-cycle correlation
   */
  calculateMoodCycleCorrelation(healthData, journalData) {
    // Group journal entries by date
    const journalByDate = {};
    journalData.forEach((entry) => {
      const date = entry.created_at.split("T")[0];
      if (!journalByDate[date]) journalByDate[date] = [];
      journalByDate[date].push(entry);
    });

    // Match health data with journal data
    const matchedData = [];
    healthData.forEach((health) => {
      if (
        health.cycle_phase &&
        health.mood_rating &&
        journalByDate[health.date]
      ) {
        const avgJournalMood =
          journalByDate[health.date].reduce(
            (sum, j) => sum + (j.mood || 5),
            0
          ) / journalByDate[health.date].length;
        matchedData.push({
          cyclePhase: health.cycle_phase,
          healthMood: health.mood_rating,
          journalMood: avgJournalMood,
          date: health.date,
        });
      }
    });

    if (matchedData.length < 10) return null; // Need sufficient data

    // Calculate correlation coefficient
    const healthMoods = matchedData.map((d) => d.healthMood);
    const journalMoods = matchedData.map((d) => d.journalMood);
    const correlation = this.calculateCorrelationCoefficient(
      healthMoods,
      journalMoods
    );

    return {
      correlation_type: "mood_cycle",
      correlation_coefficient: correlation,
      sample_size: matchedData.length,
      analysis_start_date: matchedData[matchedData.length - 1].date,
      analysis_end_date: matchedData[0].date,
      analysis_results: {
        averageHealthMood:
          healthMoods.reduce((sum, m) => sum + m, 0) / healthMoods.length,
        averageJournalMood:
          journalMoods.reduce((sum, m) => sum + m, 0) / journalMoods.length,
        phaseBreakdown: this.groupByPhase(matchedData),
      },
      key_insights: this.generateCorrelationInsights(correlation, "mood"),
    };
  }

  /**
   * Calculate energy-cycle correlation
   */
  calculateEnergyCycleCorrelation(healthData, journalData) {
    // Similar to mood correlation but for energy
    const journalByDate = {};
    journalData.forEach((entry) => {
      const date = entry.created_at.split("T")[0];
      if (!journalByDate[date]) journalByDate[date] = [];
      journalByDate[date].push(entry);
    });

    const matchedData = [];
    healthData.forEach((health) => {
      if (
        health.cycle_phase &&
        health.energy_level &&
        journalByDate[health.date]
      ) {
        const avgJournalEnergy =
          journalByDate[health.date].reduce(
            (sum, j) => sum + (j.energy || 5),
            0
          ) / journalByDate[health.date].length;
        matchedData.push({
          cyclePhase: health.cycle_phase,
          healthEnergy: health.energy_level,
          journalEnergy: avgJournalEnergy,
          date: health.date,
        });
      }
    });

    if (matchedData.length < 10) return null;

    const healthEnergy = matchedData.map((d) => d.healthEnergy);
    const journalEnergy = matchedData.map((d) => d.journalEnergy);
    const correlation = this.calculateCorrelationCoefficient(
      healthEnergy,
      journalEnergy
    );

    return {
      correlation_type: "energy_cycle",
      correlation_coefficient: correlation,
      sample_size: matchedData.length,
      analysis_start_date: matchedData[matchedData.length - 1].date,
      analysis_end_date: matchedData[0].date,
      analysis_results: {
        averageHealthEnergy:
          healthEnergy.reduce((sum, e) => sum + e, 0) / healthEnergy.length,
        averageJournalEnergy:
          journalEnergy.reduce((sum, e) => sum + e, 0) / journalEnergy.length,
        phaseBreakdown: this.groupByPhase(matchedData),
      },
      key_insights: this.generateCorrelationInsights(correlation, "energy"),
    };
  }

  /**
   * Calculate sleep-cycle correlation
   */
  calculateSleepCycleCorrelation(healthData, journalData) {
    // Focus on sleep quality from health data vs journal mentions of sleep
    const matchedData = [];

    healthData.forEach((health) => {
      if (health.cycle_phase && health.sleep_quality) {
        matchedData.push({
          cyclePhase: health.cycle_phase,
          sleepQuality: health.sleep_quality,
          date: health.date,
        });
      }
    });

    if (matchedData.length < 10) return null;

    // Analyze sleep quality by cycle phase
    const phaseGroups = this.groupByPhase(matchedData);
    const phaseAverages = {};
    Object.entries(phaseGroups).forEach(([phase, data]) => {
      phaseAverages[phase] =
        data.reduce((sum, d) => sum + d.sleepQuality, 0) / data.length;
    });

    return {
      correlation_type: "sleep_cycle",
      correlation_coefficient: this.calculatePhaseVariation(phaseAverages),
      sample_size: matchedData.length,
      analysis_start_date: matchedData[matchedData.length - 1].date,
      analysis_end_date: matchedData[0].date,
      analysis_results: {
        phaseAverages,
        overallAverage:
          matchedData.reduce((sum, d) => sum + d.sleepQuality, 0) /
          matchedData.length,
      },
      key_insights: this.generateSleepInsights(phaseAverages),
    };
  }

  // =============================================
  // SYMPTOM DEFINITIONS
  // =============================================

  /**
   * Get all symptom definitions
   */
  async getSymptomDefinitions(lifeStage = null) {
    try {
      let query = supabase
        .from(this.symptomsTableName)
        .select("*")
        .eq("is_active", true);

      if (lifeStage) {
        query = query.contains("life_stage_applicable", [lifeStage]);
      }

      const { data, error } = await query.order("category", {
        ascending: true,
      });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching symptom definitions:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // EDUCATIONAL CONTENT
  // =============================================

  /**
   * Get educational content for a life stage
   */
  async getEducationalContent(lifeStage, contentType = null) {
    try {
      let query = supabase
        .from(this.educationalTableName)
        .select("*")
        .eq("is_published", true)
        .contains("life_stage", [lifeStage]);

      if (contentType) {
        query = query.eq("content_type", contentType);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching educational content:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track educational content progress
   */
  async updateEducationalProgress(userId, contentId, progressData) {
    try {
      const { data, error } = await supabase
        .from(this.progressTableName)
        .upsert({
          user_id: userId,
          content_id: contentId,
          is_read: progressData.isRead || false,
          reading_progress: progressData.readingProgress || 0,
          time_spent_minutes: progressData.timeSpentMinutes || 0,
          is_helpful: progressData.isHelpful || null,
          user_rating: progressData.userRating || null,
          notes: progressData.notes || null,
          last_accessed_at: new Date().toISOString(),
          ...(progressData.isRead && {
            completed_at: new Date().toISOString(),
          }),
        })
        .select();

      if (error) throw error;

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error updating educational progress:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  /**
   * Calculate variance for an array of numbers
   */
  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Calculate mood variance for recent data
   */
  calculateMoodVariance(recentData) {
    const moods = recentData
      .filter((d) => d.mood_rating !== null)
      .map((d) => d.mood_rating);
    return this.calculateVariance(moods);
  }

  /**
   * Calculate correlation coefficient between two arrays
   */
  calculateCorrelationCoefficient(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Group data by cycle phase
   */
  groupByPhase(data) {
    return data.reduce((groups, item) => {
      const phase = item.cyclePhase;
      if (!groups[phase]) groups[phase] = [];
      groups[phase].push(item);
      return groups;
    }, {});
  }

  /**
   * Calculate phase variation (for sleep correlation)
   */
  calculatePhaseVariation(phaseAverages) {
    const values = Object.values(phaseAverages);
    if (values.length === 0) return 0;

    const max = Math.max(...values);
    const min = Math.min(...values);
    return (max - min) / 10; // Normalize to correlation-like scale
  }

  /**
   * Generate correlation insights
   */
  generateCorrelationInsights(correlation, type) {
    const insights = [];

    if (Math.abs(correlation) > 0.7) {
      insights.push(
        `Strong ${
          correlation > 0 ? "positive" : "negative"
        } correlation between cycle and ${type}`
      );
    } else if (Math.abs(correlation) > 0.4) {
      insights.push(
        `Moderate ${
          correlation > 0 ? "positive" : "negative"
        } correlation between cycle and ${type}`
      );
    } else {
      insights.push(
        `Weak correlation between cycle and ${type} - individual variation may be high`
      );
    }

    return insights;
  }

  /**
   * Generate sleep insights
   */
  generateSleepInsights(phaseAverages) {
    const insights = [];
    const phases = Object.keys(phaseAverages);

    if (phases.length > 1) {
      const values = Object.values(phaseAverages);
      const maxPhase = phases[values.indexOf(Math.max(...values))];
      const minPhase = phases[values.indexOf(Math.min(...values))];

      insights.push(
        `Sleep quality is highest during ${maxPhase} phase and lowest during ${minPhase} phase`
      );
    }

    return insights;
  }
}

export default WomensHealthService;
