// Enhanced AnalyticsService.js - Comprehensive journaling analytics
export class AnalyticsService {
  constructor() {
    // Sentiment analysis lexicons
    this.positiveWords = new Set([
      "happy",
      "joy",
      "excited",
      "grateful",
      "love",
      "amazing",
      "wonderful",
      "fantastic",
      "great",
      "good",
      "better",
      "best",
      "awesome",
      "brilliant",
      "beautiful",
      "peaceful",
      "calm",
      "relaxed",
      "confident",
      "proud",
      "accomplished",
      "successful",
      "motivated",
      "inspired",
      "hopeful",
      "optimistic",
      "content",
      "satisfied",
      "pleased",
      "delighted",
      "thrilled",
      "ecstatic",
      "blissful",
      "serene",
      "tranquil",
    ]);

    this.negativeWords = new Set([
      "sad",
      "angry",
      "frustrated",
      "worried",
      "anxious",
      "stressed",
      "tired",
      "exhausted",
      "depressed",
      "upset",
      "disappointed",
      "hurt",
      "pain",
      "difficult",
      "hard",
      "struggle",
      "problem",
      "issue",
      "terrible",
      "awful",
      "horrible",
      "bad",
      "worse",
      "worst",
      "hate",
      "angry",
      "furious",
      "irritated",
      "annoyed",
      "overwhelmed",
      "confused",
      "lost",
      "helpless",
      "hopeless",
      "discouraged",
      "defeated",
    ]);

    // Energy level indicators
    this.highEnergyWords = new Set([
      "energetic",
      "active",
      "motivated",
      "productive",
      "dynamic",
      "vigorous",
      "lively",
      "enthusiastic",
      "pumped",
      "charged",
      "invigorated",
      "alert",
      "focused",
      "sharp",
      "clear",
      "ready",
      "go",
      "action",
      "movement",
      "exercise",
      "workout",
      "run",
      "walk",
      "dance",
      "play",
    ]);

    this.lowEnergyWords = new Set([
      "tired",
      "exhausted",
      "drained",
      "sluggish",
      "lethargic",
      "weary",
      "fatigued",
      "sleepy",
      "drowsy",
      "lazy",
      "slow",
      "heavy",
      "empty",
      "depleted",
      "worn",
      "spent",
      "burned",
      "rest",
      "sleep",
      "nap",
      "bed",
      "couch",
      "lie",
      "sit",
      "still",
      "quiet",
    ]);

    // Emotional themes
    this.emotionalThemes = {
      anxiety: [
        "worried",
        "anxious",
        "nervous",
        "panic",
        "fear",
        "scared",
        "stress",
        "tension",
      ],
      love: [
        "love",
        "romance",
        "relationship",
        "partner",
        "boyfriend",
        "girlfriend",
        "husband",
        "wife",
      ],
      family: [
        "family",
        "mom",
        "dad",
        "mother",
        "father",
        "sister",
        "brother",
        "parent",
        "child",
      ],
      work: [
        "work",
        "job",
        "career",
        "boss",
        "colleague",
        "office",
        "meeting",
        "project",
        "deadline",
      ],
      health: [
        "health",
        "sick",
        "doctor",
        "medicine",
        "hospital",
        "pain",
        "exercise",
        "diet",
      ],
      friendship: [
        "friend",
        "friendship",
        "buddy",
        "pal",
        "social",
        "party",
        "hangout",
      ],
      growth: [
        "learn",
        "grow",
        "develop",
        "improve",
        "progress",
        "achieve",
        "goal",
        "success",
      ],
      creativity: [
        "create",
        "art",
        "music",
        "write",
        "paint",
        "design",
        "imagination",
        "inspiration",
      ],
      spirituality: [
        "spiritual",
        "meditation",
        "pray",
        "faith",
        "belief",
        "soul",
        "purpose",
        "meaning",
      ],
      adventure: [
        "travel",
        "adventure",
        "explore",
        "journey",
        "trip",
        "vacation",
        "new",
        "experience",
      ],
    };

    // Cognitive patterns
    this.cognitivePatterns = {
      catastrophizing: [
        "disaster",
        "terrible",
        "awful",
        "worst",
        "end of world",
        "horrible",
      ],
      allOrNothing: [
        "always",
        "never",
        "completely",
        "totally",
        "everything",
        "nothing",
        "all",
        "none",
      ],
      shouldStatements: [
        "should",
        "must",
        "have to",
        "ought to",
        "supposed to",
      ],
      mentalFilter: ["only", "just", "but", "however", "except"],
      personalization: [
        "my fault",
        "because of me",
        "i caused",
        "i made",
        "blame myself",
      ],
      futureOriented: [
        "will",
        "going to",
        "plan",
        "future",
        "tomorrow",
        "next",
        "later",
        "eventually",
      ],
      pastOriented: [
        "was",
        "were",
        "had",
        "did",
        "yesterday",
        "before",
        "used to",
        "remember",
      ],
    };

    // Self-care activities
    this.selfCareActivities = {
      physical: [
        "exercise",
        "workout",
        "run",
        "walk",
        "yoga",
        "stretch",
        "sleep",
        "rest",
        "bath",
        "shower",
      ],
      emotional: [
        "journal",
        "meditate",
        "breathe",
        "therapy",
        "talk",
        "cry",
        "laugh",
        "hug",
      ],
      mental: [
        "read",
        "learn",
        "study",
        "think",
        "reflect",
        "plan",
        "organize",
        "create",
      ],
      social: [
        "friends",
        "family",
        "talk",
        "call",
        "visit",
        "party",
        "dinner",
        "coffee",
      ],
      spiritual: [
        "pray",
        "meditate",
        "nature",
        "gratitude",
        "purpose",
        "meaning",
        "peace",
      ],
    };

    // Stress indicators
    this.stressIndicators = [
      "overwhelmed",
      "pressure",
      "deadline",
      "rush",
      "hurry",
      "chaos",
      "crazy",
      "hectic",
      "busy",
      "swamped",
      "buried",
      "drowning",
      "panic",
      "frantic",
    ];
  }

  // Main analysis function - processes a journal entry
  async analyzeEntry(entryText, entryDate = new Date()) {
    const words = this.tokenizeText(entryText);
    const sentences = this.splitIntoSentences(entryText);

    return {
      // Basic metrics
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: words.length / sentences.length,

      // Sentiment analysis
      sentiment: this.analyzeSentiment(words),

      // Mood and energy
      moodScore: this.calculateMoodScore(words),
      energyLevel: this.calculateEnergyLevel(words),

      // Emotional themes
      emotionalThemes: this.identifyEmotionalThemes(words),

      // Cognitive patterns
      cognitivePatterns: this.analyzeCognitivePatterns(entryText),

      // Behavioral insights
      activities: this.identifyActivities(words),
      relationships: this.identifyRelationships(words),

      // Wellness indicators
      selfCareActivities: this.identifySelfCare(words),
      stressLevel: this.calculateStressLevel(words),
      sleepMentions: this.analyzeSleepMentions(entryText),

      // Temporal aspects
      timeOrientation: this.analyzeTimeOrientation(words),

      // Growth indicators
      growthLanguage: this.identifyGrowthLanguage(words),
      problemSolving: this.analyzeProblemSolving(entryText),

      // Meta information
      analysisDate: entryDate.toISOString(),
      entryLength: entryText.length,
    };
  }

  // Text preprocessing
  tokenizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  splitIntoSentences(text) {
    return text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);
  }

  // Sentiment analysis
  analyzeSentiment(words) {
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (this.positiveWords.has(word)) positiveCount++;
      if (this.negativeWords.has(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;

    if (total === 0) {
      return { positive: 0.5, negative: 0.5, neutral: 1.0 };
    }

    return {
      positive: positiveCount / words.length,
      negative: negativeCount / words.length,
      neutral: Math.max(0, 1 - (positiveCount + negativeCount) / words.length),
    };
  }

  // Mood scoring (1-10 scale)
  calculateMoodScore(words) {
    let score = 5; // neutral baseline
    let wordCount = 0;

    words.forEach((word) => {
      if (this.positiveWords.has(word)) {
        score += 0.5;
        wordCount++;
      } else if (this.negativeWords.has(word)) {
        score -= 0.5;
        wordCount++;
      }
    });

    // Normalize to 1-10 scale
    return Math.max(1, Math.min(10, score));
  }

  // Energy level calculation (1-10 scale)
  calculateEnergyLevel(words) {
    let energyScore = 5; // neutral baseline
    let wordCount = 0;

    words.forEach((word) => {
      if (this.highEnergyWords.has(word)) {
        energyScore += 0.4;
        wordCount++;
      } else if (this.lowEnergyWords.has(word)) {
        energyScore -= 0.4;
        wordCount++;
      }
    });

    return Math.max(1, Math.min(10, energyScore));
  }

  // Emotional theme identification
  identifyEmotionalThemes(words) {
    const themes = [];

    Object.entries(this.emotionalThemes).forEach(([theme, keywords]) => {
      const matches = keywords.filter((keyword) => words.includes(keyword));
      if (matches.length > 0) {
        themes.push({
          theme,
          strength: matches.length / keywords.length,
          matchedWords: matches,
        });
      }
    });

    return themes.sort((a, b) => b.strength - a.strength);
  }

  // Cognitive pattern analysis
  analyzeCognitivePatterns(text) {
    const patterns = [];
    const lowerText = text.toLowerCase();

    Object.entries(this.cognitivePatterns).forEach(([pattern, indicators]) => {
      const matches = indicators.filter((indicator) =>
        lowerText.includes(indicator)
      );
      if (matches.length > 0) {
        patterns.push({
          pattern,
          frequency: matches.length,
          indicators: matches,
        });
      }
    });

    return patterns;
  }

  // Activity identification
  identifyActivities(words) {
    const activities = [];
    const activityWords = [
      "work",
      "exercise",
      "read",
      "cook",
      "clean",
      "shop",
      "drive",
      "walk",
      "run",
      "swim",
      "dance",
      "sing",
      "play",
      "watch",
      "listen",
      "write",
      "draw",
      "paint",
      "travel",
      "visit",
      "meet",
      "call",
      "text",
      "email",
    ];

    activityWords.forEach((activity) => {
      if (words.includes(activity)) {
        activities.push(activity);
      }
    });

    return activities;
  }

  // Relationship analysis
  identifyRelationships(words) {
    const relationships = [];
    const relationshipWords = {
      family: [
        "mom",
        "dad",
        "mother",
        "father",
        "sister",
        "brother",
        "parent",
        "child",
        "family",
      ],
      romantic: [
        "boyfriend",
        "girlfriend",
        "husband",
        "wife",
        "partner",
        "date",
        "love",
      ],
      friends: ["friend", "buddy", "pal", "mate"],
      professional: [
        "boss",
        "colleague",
        "coworker",
        "client",
        "customer",
        "team",
      ],
    };

    Object.entries(relationshipWords).forEach(([type, keywords]) => {
      const matches = keywords.filter((keyword) => words.includes(keyword));
      if (matches.length > 0) {
        relationships.push({
          type,
          mentions: matches.length,
          keywords: matches,
        });
      }
    });

    return relationships;
  }

  // Self-care activity identification
  identifySelfCare(words) {
    const selfCareFound = {};

    Object.entries(this.selfCareActivities).forEach(
      ([category, activities]) => {
        const matches = activities.filter((activity) =>
          words.includes(activity)
        );
        if (matches.length > 0) {
          selfCareFound[category] = matches;
        }
      }
    );

    return selfCareFound;
  }

  // Stress level calculation
  calculateStressLevel(words) {
    const stressCount = this.stressIndicators.filter((indicator) =>
      words.includes(indicator)
    ).length;

    // Scale 1-10 based on stress indicator frequency
    return Math.min(10, Math.max(1, 3 + stressCount * 2));
  }

  // Sleep pattern analysis
  analyzeSleepMentions(text) {
    const sleepWords = [
      "sleep",
      "slept",
      "tired",
      "exhausted",
      "bed",
      "dream",
      "nap",
      "rest",
    ];
    const qualityWords = {
      good: ["well", "good", "great", "peaceful", "restful"],
      poor: ["bad", "poor", "terrible", "restless", "tossed", "turned"],
    };

    const lowerText = text.toLowerCase();
    const mentions = sleepWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    let quality = "neutral";
    if (qualityWords.good.some((word) => lowerText.includes(word))) {
      quality = "good";
    } else if (qualityWords.poor.some((word) => lowerText.includes(word))) {
      quality = "poor";
    }

    return {
      mentions,
      quality,
      hasReferences: mentions > 0,
    };
  }

  // Time orientation analysis
  analyzeTimeOrientation(words) {
    const futureWords = this.cognitivePatterns.futureOriented;
    const pastWords = this.cognitivePatterns.pastOriented;

    const futureCount = futureWords.filter((word) =>
      words.includes(word)
    ).length;
    const pastCount = pastWords.filter((word) => words.includes(word)).length;

    let orientation = "present";
    if (futureCount > pastCount && futureCount > 2) {
      orientation = "future";
    } else if (pastCount > futureCount && pastCount > 2) {
      orientation = "past";
    }

    return {
      orientation,
      futureScore: futureCount,
      pastScore: pastCount,
    };
  }

  // Growth language identification
  identifyGrowthLanguage(words) {
    const growthWords = [
      "learn",
      "grow",
      "improve",
      "better",
      "progress",
      "develop",
      "change",
      "evolve",
      "transform",
      "breakthrough",
      "insight",
      "realize",
      "understand",
    ];

    const growthMentions = growthWords.filter((word) => words.includes(word));

    return {
      count: growthMentions.length,
      words: growthMentions,
      hasGrowthLanguage: growthMentions.length > 0,
    };
  }

  // Problem-solving analysis
  analyzeProblemSolving(text) {
    const problemWords = [
      "problem",
      "issue",
      "challenge",
      "difficulty",
      "struggle",
    ];
    const solutionWords = [
      "solution",
      "solve",
      "fix",
      "resolve",
      "overcome",
      "handle",
      "deal",
    ];

    const lowerText = text.toLowerCase();
    const hasProblems = problemWords.some((word) => lowerText.includes(word));
    const hasSolutions = solutionWords.some((word) => lowerText.includes(word));

    let approach = "none";
    if (hasProblems && hasSolutions) {
      approach = "problem-solving";
    } else if (hasProblems) {
      approach = "problem-focused";
    } else if (hasSolutions) {
      approach = "solution-focused";
    }

    return {
      approach,
      hasProblems,
      hasSolutions,
      problemSolvingRatio: hasSolutions && hasProblems ? 1 : 0,
    };
  }

  // Aggregate multiple entries for dashboard insights
  aggregateAnalytics(analyticsArray) {
    if (!analyticsArray || analyticsArray.length === 0) {
      return null;
    }

    return {
      // Basic statistics
      totalEntries: analyticsArray.length,
      averageWordCount: this.average(analyticsArray.map((a) => a.wordCount)),
      averageSentenceCount: this.average(
        analyticsArray.map((a) => a.sentenceCount)
      ),

      // Sentiment trends
      sentimentTrend: {
        positive: this.average(analyticsArray.map((a) => a.sentiment.positive)),
        negative: this.average(analyticsArray.map((a) => a.sentiment.negative)),
        neutral: this.average(analyticsArray.map((a) => a.sentiment.neutral)),
      },

      // Mood and energy
      averageMood: this.average(analyticsArray.map((a) => a.moodScore)),
      averageEnergy: this.average(analyticsArray.map((a) => a.energyLevel)),

      // Most common themes
      topThemes: this.aggregateThemes(analyticsArray),

      // Behavioral patterns
      commonActivities: this.aggregateActivities(analyticsArray),
      relationshipMentions: this.aggregateRelationships(analyticsArray),

      // Wellness patterns
      selfCareFrequency: this.aggregateSelfCare(analyticsArray),
      averageStressLevel: this.average(
        analyticsArray.map((a) => a.stressLevel)
      ),

      // Growth indicators
      growthTrend: this.aggregateGrowthLanguage(analyticsArray),
      problemSolvingTrend: this.aggregateProblemSolving(analyticsArray),
    };
  }

  // Helper functions for aggregation
  average(numbers) {
    return numbers.length > 0
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length
      : 0;
  }

  aggregateThemes(analyticsArray) {
    const themeCount = {};
    analyticsArray.forEach((analysis) => {
      analysis.emotionalThemes.forEach((theme) => {
        themeCount[theme.theme] = (themeCount[theme.theme] || 0) + 1;
      });
    });

    return Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));
  }

  aggregateActivities(analyticsArray) {
    const activityCount = {};
    analyticsArray.forEach((analysis) => {
      analysis.activities.forEach((activity) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
    });

    return Object.entries(activityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([activity, count]) => ({ activity, count }));
  }

  aggregateRelationships(analyticsArray) {
    const relationshipCount = {};
    analyticsArray.forEach((analysis) => {
      analysis.relationships.forEach((rel) => {
        relationshipCount[rel.type] =
          (relationshipCount[rel.type] || 0) + rel.mentions;
      });
    });

    return relationshipCount;
  }

  aggregateSelfCare(analyticsArray) {
    const selfCareCount = {};
    analyticsArray.forEach((analysis) => {
      Object.entries(analysis.selfCareActivities).forEach(
        ([category, activities]) => {
          selfCareCount[category] =
            (selfCareCount[category] || 0) + activities.length;
        }
      );
    });

    return selfCareCount;
  }

  aggregateGrowthLanguage(analyticsArray) {
    return analyticsArray.map((analysis, index) => ({
      index,
      growthScore: analysis.growthLanguage.count,
      date: analysis.analysisDate,
    }));
  }

  aggregateProblemSolving(analyticsArray) {
    return analyticsArray.map((analysis, index) => ({
      index,
      approach: analysis.problemSolving.approach,
      ratio: analysis.problemSolving.problemSolvingRatio,
      date: analysis.analysisDate,
    }));
  }

  // Identify patterns and insights
  identifyPatterns(analyticsArray) {
    if (analyticsArray.length < 7) {
      return { insufficient_data: true };
    }

    return {
      // Mood patterns
      moodTrend: this.calculateTrend(analyticsArray.map((a) => a.moodScore)),
      energyTrend: this.calculateTrend(
        analyticsArray.map((a) => a.energyLevel)
      ),

      // Weekly patterns
      weeklyMoodPattern: this.analyzeWeeklyPattern(analyticsArray, "moodScore"),
      weeklyEnergyPattern: this.analyzeWeeklyPattern(
        analyticsArray,
        "energyLevel"
      ),

      // Emotional stability
      moodVariability: this.calculateVariability(
        analyticsArray.map((a) => a.moodScore)
      ),
      energyVariability: this.calculateVariability(
        analyticsArray.map((a) => a.energyLevel)
      ),

      // Growth indicators
      growthTrend: this.calculateTrend(
        analyticsArray.map((a) => a.growthLanguage.count)
      ),
      stressTrend: this.calculateTrend(
        analyticsArray.map((a) => a.stressLevel)
      ),
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  analyzeWeeklyPattern(analyticsArray, metric) {
    const weeklyData = Array(7)
      .fill(0)
      .map(() => ({ sum: 0, count: 0 }));

    analyticsArray.forEach((analysis) => {
      const date = new Date(analysis.analysisDate);
      const dayOfWeek = date.getDay();
      weeklyData[dayOfWeek].sum += analysis[metric];
      weeklyData[dayOfWeek].count++;
    });

    return weeklyData.map((day, index) => ({
      day: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][index],
      average: day.count > 0 ? day.sum / day.count : 0,
    }));
  }

  calculateVariability(values) {
    if (values.length < 2) return 0;

    const mean = this.average(values);
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }
}

export default AnalyticsService;
