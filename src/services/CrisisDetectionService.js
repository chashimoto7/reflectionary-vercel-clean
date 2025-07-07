// frontend/ src/services/CrisisDetectionService.js
// Intelligent crisis pattern detection with balanced sensitivity

export class CrisisDetectionService {
  constructor() {
    // Crisis detection patterns organized by severity level
    this.patterns = {
      // LEVEL 1: IMMEDIATE CRISIS - Direct intervention needed
      immediate: {
        weight: 10,
        keywords: [
          // Direct suicide ideation
          "kill myself",
          "end my life",
          "take my own life",
          "suicide",
          "better off dead",
          "want to die",
          "wish I was dead",
          "end it all",
          "not worth living",
          "done with life",

          // Self-harm references
          "hurt myself",
          "harm myself",
          "cut myself",
          "self harm",
          "self-harm",
          "make the pain stop",
          "punish myself",

          // Finality language
          "goodbye world",
          "final goodbye",
          "last time",
          "won't be around",
          "burden on everyone",
          "everyone would be better without me",
          "can't go on",
          "no way out",
          "no escape",

          // Method references
          "pills to end",
          "jump off",
          "overdose",
          "hanging myself",
        ],

        phrases: [
          "I want to kill myself",
          "I can't take this anymore",
          "there's no point in living",
          "everyone would be better off without me",
          "I'm going to end it",
          "I don't want to be alive",
          "I wish I could just disappear forever",
          "I'm planning to hurt myself",
          "I can't see any way out of this",
        ],

        // Contextual patterns that amplify concern
        contextualFlags: [
          "made my mind up",
          "have a plan",
          "written letters",
          "said goodbye",
          "giving things away",
          "putting affairs in order",
        ],
      },

      // LEVEL 2: ESCALATING CONCERN - Pattern-based detection
      escalating: {
        weight: 7,
        keywords: [
          // Hopelessness without direct ideation
          "hopeless",
          "pointless",
          "meaningless",
          "worthless",
          "useless",
          "failure",
          "disappointment",
          "waste of space",
          "nobody cares",
          "all alone",
          "completely isolated",

          // Overwhelming emotions
          "can't cope",
          "falling apart",
          "breaking down",
          "drowning",
          "suffocating",
          "trapped",
          "stuck forever",
          "nothing helps",
          "nothing works",
          "tried everything",

          // Future negation
          "no future",
          "no hope",
          "never going to change",
          "always going to be like this",
          "permanent",
          "forever broken",
          "can't be fixed",
        ],

        phrases: [
          "I'm completely broken",
          "nothing will ever get better",
          "I'm a total failure",
          "I can't handle this anymore",
          "I feel completely alone",
          "there's no hope for me",
          "I'm too damaged to be helped",
          "I'll never be happy",
          "everything is falling apart",
        ],

        // Patterns that indicate escalation
        escalationPatterns: [
          "getting worse every day",
          "spiraling out of control",
          "can't stop the thoughts",
          "losing my mind",
          "breaking point",
        ],
      },

      // LEVEL 3: MENTAL HEALTH CONCERNS - Supportive check-in needed
      concerning: {
        weight: 4,
        keywords: [
          // Depression indicators
          "depressed",
          "sad all the time",
          "empty inside",
          "numb",
          "exhausted",
          "drained",
          "no energy",
          "can't get out of bed",
          "sleeping all day",

          // Anxiety indicators
          "panic attacks",
          "constant anxiety",
          "can't breathe",
          "heart racing",
          "overthinking everything",
          "catastrophizing",
          "worst case scenario",

          // Isolation
          "avoiding everyone",
          "don't want to see people",
          "hiding from the world",
          "pushing people away",
          "too much effort to socialize",
        ],

        phrases: [
          "I'm really struggling",
          "having a hard time",
          "feeling overwhelmed",
          "can't seem to cope",
          "everything feels too much",
          "I'm not doing well",
          "really difficult period",
          "barely hanging on",
        ],
      },
    };

    // Protective factors that reduce crisis concern
    this.protectiveFactors = {
      copingMentions: [
        "talked to my therapist",
        "called my friend",
        "reached out",
        "using coping skills",
        "trying to cope",
        "working through this",
        "therapy helped",
        "medication helping",
        "support group",
        "family is supportive",
        "have people who care",
      ],

      futurePlanning: [
        "tomorrow I will",
        "next week",
        "planning to",
        "looking forward",
        "goals for",
        "working towards",
        "hoping to",
        "excited about",
        "making plans",
        "scheduling",
        "appointment next",
      ],

      problemSolving: [
        "trying to figure out",
        "working on solutions",
        "brainstorming",
        "talking through options",
        "making a plan",
        "taking steps",
        "seeking help",
        "researching",
        "considering options",
      ],

      temporaryLanguage: [
        "this week",
        "lately",
        "recently",
        "right now",
        "at the moment",
        "temporary",
        "hoping it passes",
        "rough patch",
        "difficult time",
        "going through a phase",
      ],

      selfCareActions: [
        "took a walk",
        "called a friend",
        "practiced breathing",
        "took medication",
        "ate something",
        "showered",
        "exercised",
        "meditated",
        "journaled",
        "listened to music",
      ],
    };

    // Pattern analysis settings
    this.analysisSettings = {
      immediateThreshold: 8, // Score 8+ = immediate intervention
      escalatingThreshold: 6, // Score 6+ = escalating concern
      concerningThreshold: 4, // Score 4+ = supportive check-in
      minimumEntryLength: 50, // Don't analyze very short entries

      // Historical pattern analysis
      historyDaysBack: 14, // Look back 2 weeks for patterns
      minimumEntriesForPattern: 3, // Need 3+ entries to establish pattern
      moodThresholdDays: 7, // 7+ days of low mood = pattern
      moodThresholdScore: 3, // Mood scores under 3 = concerning

      // Escalation detection
      escalationWindow: 7, // Look for escalation over 7 days
      escalationThreshold: 2, // Score increase of 2+ = escalating

      // Protective factor influence
      protectiveFactorWeight: -2, // Reduces crisis score by 2 per factor
      maxProtectiveReduction: -4, // Max reduction from protective factors
    };

    // Detection state
    this.lastAnalysis = null;
    this.recentAlerts = new Map(); // Track recent alerts to avoid spam
    this.alertCooldown = 24 * 60 * 60 * 1000; // 24 hours between same-level alerts
  }

  // Main analysis method - analyze current entry for crisis indicators
  async analyzeEntry(entryText, entryMetadata = {}) {
    try {
      console.log("🔍 Analyzing entry for crisis patterns...");

      const {
        mood = null,
        energy = null,
        userId = null,
        entryDate = new Date(),
      } = entryMetadata;

      // Skip very short entries
      if (entryText.length < this.analysisSettings.minimumEntryLength) {
        console.log("⏭️ Entry too short for crisis analysis");
        return { level: "none", score: 0, reason: "entry_too_short" };
      }

      // Analyze current entry
      const currentAnalysis = this.analyzeEntryContent(entryText);

      // Get historical context if userId provided
      let historicalContext = null;
      if (userId) {
        historicalContext = await this.getHistoricalContext(userId);
      }

      // Combine current + historical analysis
      const combinedAnalysis = this.combineAnalyses(
        currentAnalysis,
        historicalContext,
        { mood, energy }
      );

      // Determine intervention level
      const interventionLevel =
        this.determineInterventionLevel(combinedAnalysis);

      // Check alert cooldown
      const shouldAlert = this.shouldTriggerAlert(userId, interventionLevel);

      const result = {
        level: interventionLevel.level,
        score: combinedAnalysis.totalScore,
        confidence: interventionLevel.confidence,
        shouldAlert,
        triggers: combinedAnalysis.triggers,
        protectiveFactors: combinedAnalysis.protectiveFactors,
        historicalPattern: historicalContext?.pattern || null,
        recommendations: this.getRecommendations(interventionLevel),
        timestamp: entryDate.toISOString(),
      };

      // Update alert tracking
      if (shouldAlert) {
        this.recordAlert(userId, interventionLevel.level);
      }

      this.lastAnalysis = result;
      console.log("✅ Crisis analysis complete:", {
        level: result.level,
        score: result.score,
      });

      return result;
    } catch (error) {
      console.error("❌ Crisis analysis error:", error);
      return {
        level: "error",
        score: 0,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Analyze text content for crisis indicators
  analyzeEntryContent(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    let totalScore = 0;
    const triggers = [];
    const detectedProtectiveFactors = [];

    // Check immediate crisis patterns
    const immediateMatches = this.findPatternMatches(
      lowerText,
      this.patterns.immediate
    );
    if (immediateMatches.length > 0) {
      const immediateScore =
        immediateMatches.length * this.patterns.immediate.weight;
      totalScore += immediateScore;
      triggers.push({
        level: "immediate",
        matches: immediateMatches,
        score: immediateScore,
        description: "Direct crisis language detected",
      });
    }

    // Check escalating concern patterns
    const escalatingMatches = this.findPatternMatches(
      lowerText,
      this.patterns.escalating
    );
    if (escalatingMatches.length > 0) {
      const escalatingScore =
        escalatingMatches.length * this.patterns.escalating.weight;
      totalScore += escalatingScore;
      triggers.push({
        level: "escalating",
        matches: escalatingMatches,
        score: escalatingScore,
        description: "Escalating distress patterns detected",
      });
    }

    // Check concerning patterns
    const concerningMatches = this.findPatternMatches(
      lowerText,
      this.patterns.concerning
    );
    if (concerningMatches.length > 0) {
      const concerningScore =
        concerningMatches.length * this.patterns.concerning.weight;
      totalScore += concerningScore;
      triggers.push({
        level: "concerning",
        matches: concerningMatches,
        score: concerningScore,
        description: "Mental health concerns detected",
      });
    }

    // Check for protective factors
    Object.entries(this.protectiveFactors).forEach(([category, factors]) => {
      const matches = this.findKeywordMatches(lowerText, factors);
      if (matches.length > 0) {
        detectedProtectiveFactors.push({
          category,
          matches,
          description: this.getProtectiveFactorDescription(category),
        });
      }
    });

    // Apply protective factor reduction
    const protectiveReduction = Math.min(
      detectedProtectiveFactors.length *
        this.analysisSettings.protectiveFactorWeight,
      this.analysisSettings.maxProtectiveReduction
    );
    totalScore += protectiveReduction;

    // Ensure score doesn't go negative
    totalScore = Math.max(0, totalScore);

    return {
      totalScore,
      triggers,
      protectiveFactors: detectedProtectiveFactors,
      textStats: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        characterCount: text.length,
      },
    };
  }

  // Find pattern matches in text
  findPatternMatches(text, patternObj) {
    const matches = [];

    // Check keywords
    if (patternObj.keywords) {
      matches.push(...this.findKeywordMatches(text, patternObj.keywords));
    }

    // Check phrases
    if (patternObj.phrases) {
      matches.push(...this.findPhraseMatches(text, patternObj.phrases));
    }

    // Check contextual flags
    if (patternObj.contextualFlags) {
      matches.push(
        ...this.findKeywordMatches(text, patternObj.contextualFlags)
      );
    }

    // Check escalation patterns
    if (patternObj.escalationPatterns) {
      matches.push(
        ...this.findPhraseMatches(text, patternObj.escalationPatterns)
      );
    }

    return [...new Set(matches)]; // Remove duplicates
  }

  // Find keyword matches
  findKeywordMatches(text, keywords) {
    return keywords.filter((keyword) => text.includes(keyword));
  }

  // Find phrase matches (more precise than keywords)
  findPhraseMatches(text, phrases) {
    return phrases.filter((phrase) => text.includes(phrase.toLowerCase()));
  }

  // Get historical context for pattern analysis
  async getHistoricalContext(userId) {
    try {
      // This would integrate with your analytics service
      // For now, return placeholder structure
      console.log("📊 Getting historical context for user:", userId);

      // TODO: Implement actual historical analysis
      // - Get recent mood scores
      // - Analyze recent entries for patterns
      // - Track crisis score trends

      return {
        pattern: "stable",
        averageMood: 6.5,
        recentTrend: "declining",
        daysAnalyzed: 14,
        entriesAnalyzed: 8,
      };
    } catch (error) {
      console.warn("⚠️ Could not get historical context:", error);
      return null;
    }
  }

  // Combine current analysis with historical context
  combineAnalyses(currentAnalysis, historicalContext, metadata) {
    let combinedScore = currentAnalysis.totalScore;
    const combinedTriggers = [...currentAnalysis.triggers];

    // Factor in mood score if provided
    if (
      metadata.mood !== null &&
      metadata.mood < this.analysisSettings.moodThresholdScore
    ) {
      const moodScore =
        (this.analysisSettings.moodThresholdScore - metadata.mood) * 1.5;
      combinedScore += moodScore;
      combinedTriggers.push({
        level: "concerning",
        score: moodScore,
        description: `Low mood score: ${metadata.mood}/10`,
      });
    }

    // Factor in historical patterns
    if (historicalContext) {
      if (historicalContext.recentTrend === "declining") {
        combinedScore += 2;
        combinedTriggers.push({
          level: "escalating",
          score: 2,
          description: "Declining pattern over recent entries",
        });
      }

      if (
        historicalContext.averageMood < this.analysisSettings.moodThresholdScore
      ) {
        combinedScore += 3;
        combinedTriggers.push({
          level: "escalating",
          score: 3,
          description: "Consistently low mood over time",
        });
      }
    }

    return {
      totalScore: combinedScore,
      triggers: combinedTriggers,
      protectiveFactors: currentAnalysis.protectiveFactors,
      historicalInfluence: historicalContext ? "included" : "not_available",
    };
  }

  // Determine appropriate intervention level
  determineInterventionLevel(analysis) {
    const { totalScore, triggers } = analysis;

    // Immediate intervention needed
    if (
      totalScore >= this.analysisSettings.immediateThreshold ||
      triggers.some((t) => t.level === "immediate")
    ) {
      return {
        level: "immediate",
        confidence: "high",
        urgency: "critical",
        description: "Immediate crisis intervention recommended",
      };
    }

    // Escalating concern
    if (totalScore >= this.analysisSettings.escalatingThreshold) {
      return {
        level: "escalating",
        confidence: "medium",
        urgency: "high",
        description: "Escalating mental health concerns detected",
      };
    }

    // General concern
    if (totalScore >= this.analysisSettings.concerningThreshold) {
      return {
        level: "concerning",
        confidence: "medium",
        urgency: "moderate",
        description: "Mental health support may be beneficial",
      };
    }

    // No significant concerns
    return {
      level: "none",
      confidence: "low",
      urgency: "none",
      description: "No significant crisis indicators detected",
    };
  }

  // Check if we should trigger an alert (avoid spam)
  shouldTriggerAlert(userId, interventionLevel) {
    if (!userId || interventionLevel.level === "none") return false;

    const alertKey = `${userId}_${interventionLevel.level}`;
    const lastAlert = this.recentAlerts.get(alertKey);

    // Always alert for immediate crisis
    if (interventionLevel.level === "immediate") return true;

    // Check cooldown for other levels
    if (lastAlert && Date.now() - lastAlert < this.alertCooldown) {
      console.log("🔕 Alert suppressed due to cooldown");
      return false;
    }

    return true;
  }

  // Record alert for cooldown tracking
  recordAlert(userId, level) {
    if (!userId) return;

    const alertKey = `${userId}_${level}`;
    this.recentAlerts.set(alertKey, Date.now());

    // Clean up old alerts (older than 48 hours)
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    for (const [key, timestamp] of this.recentAlerts.entries()) {
      if (timestamp < cutoff) {
        this.recentAlerts.delete(key);
      }
    }
  }

  // Get recommendations based on intervention level
  getRecommendations(interventionLevel) {
    switch (interventionLevel.level) {
      case "immediate":
        return {
          primary: "immediate_crisis_resources",
          secondary: "emergency_contacts",
          selfCare: "grounding_techniques",
          message:
            "If you're having thoughts of suicide or self-harm, please reach out for help immediately. You're not alone.",
        };

      case "escalating":
        return {
          primary: "crisis_support_resources",
          secondary: "mental_health_professionals",
          selfCare: "coping_strategies",
          message:
            "It sounds like you're going through a really difficult time. Professional support could be helpful.",
        };

      case "concerning":
        return {
          primary: "mental_health_resources",
          secondary: "self_care_suggestions",
          selfCare: "wellness_activities",
          message:
            "Taking care of your mental health is important. Consider reaching out for support if you need it.",
        };

      default:
        return null;
    }
  }

  // Get description for protective factor category
  getProtectiveFactorDescription(category) {
    const descriptions = {
      copingMentions: "Using healthy coping strategies",
      futurePlanning: "Making plans for the future",
      problemSolving: "Actively working on solutions",
      temporaryLanguage: "Recognizing current challenges as temporary",
      selfCareActions: "Engaging in self-care activities",
    };

    return descriptions[category] || "Positive coping indicator";
  }

  // Quick analysis for real-time typing (lighter version)
  analyzeRealTime(text) {
    if (text.length < 20) return { level: "none", score: 0 };

    const lowerText = text.toLowerCase();
    let quickScore = 0;

    // Check only immediate crisis keywords
    const immediateMatches = this.findKeywordMatches(
      lowerText,
      this.patterns.immediate.keywords
    );
    quickScore += immediateMatches.length * 5;

    // Check immediate crisis phrases
    const phraseMatches = this.findPhraseMatches(
      lowerText,
      this.patterns.immediate.phrases
    );
    quickScore += phraseMatches.length * 8;

    return {
      level:
        quickScore >= 8 ? "immediate" : quickScore >= 4 ? "concerning" : "none",
      score: quickScore,
      matches: [...immediateMatches, ...phraseMatches],
    };
  }

  // Clear alert history (privacy control)
  clearAlertHistory() {
    this.recentAlerts.clear();
    console.log("🗑️ Crisis alert history cleared");
  }

  // Get analysis statistics for dashboard
  getAnalysisStats() {
    return {
      lastAnalysis: this.lastAnalysis,
      activeAlerts: this.recentAlerts.size,
      settings: this.analysisSettings,
    };
  }
}

// Export singleton instance
export const crisisDetectionService = new CrisisDetectionService();
export default CrisisDetectionService;
