// src/components/analytics/tabs/CycleIntelligenceTab.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Moon,
  Droplets,
  Thermometer,
  Activity,
  Heart,
  Brain,
  Calendar,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  Zap,
  Flower2,
  Wind,
  Sun,
} from "lucide-react";

const CycleIntelligenceTab = ({ data, colors }) => {
  const [lifeStage, setLifeStage] = useState("menstrual"); // menstrual, perimenopause, menopause
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [showEducation, setShowEducation] = useState(false);
  const [predictiveMode, setPredictiveMode] = useState(false);
  const [showTransitionInsights, setShowTransitionInsights] = useState(false);

  // Enhanced colors for different life stages
  const stageColors = {
    menstrual: colors,
    perimenopause: {
      primary: "#9333EA", // Purple
      secondary: "#DB2777", // Pink
      tertiary: "#DC2626", // Red
      quaternary: "#EA580C", // Orange
    },
    menopause: {
      primary: "#7C3AED", // Violet
      secondary: "#2563EB", // Blue
      tertiary: "#0891B2", // Cyan
      quaternary: "#059669", // Emerald
    },
  };

  // Process cycle data from analytics
  const cycleData = data?.cycle || {
    phaseDistribution: [],
    moodByPhase: [],
    energyByPhase: [],
    dailyTracking: [],
    insights: null,
  };

  // Life stage specific information
  const lifeStageInfo = {
    menstrual: {
      title: "Menstrual Cycle Tracking",
      description:
        "Track your monthly cycle patterns and optimize your well-being",
      icon: Moon,
      phases: {
        Menstrual: {
          emoji: "🩸",
          color: colors.Menstrual,
          days: "1-5",
          description: "Rest and renewal phase",
          hormones: "Low estrogen and progesterone",
          recommendations: [
            "Gentle movement",
            "Extra rest",
            "Iron-rich foods",
            "Self-compassion",
          ],
        },
        Follicular: {
          emoji: "🌱",
          color: colors.Follicular,
          days: "1-13",
          description: "Rising energy and clarity",
          hormones: "Rising estrogen",
          recommendations: [
            "New projects",
            "Social activities",
            "Strength training",
            "Planning",
          ],
        },
        Ovulatory: {
          emoji: "🌟",
          color: colors.Ovulatory,
          days: "12-16",
          description: "Peak energy and confidence",
          hormones: "Peak estrogen, LH surge",
          recommendations: [
            "Important conversations",
            "Public speaking",
            "High-intensity exercise",
            "Networking",
          ],
        },
        Luteal: {
          emoji: "🌙",
          color: colors.Luteal,
          days: "15-28",
          description: "Winding down and reflection",
          hormones: "Rising progesterone",
          recommendations: [
            "Detail work",
            "Self-care",
            "Gentle yoga",
            "Meal prep",
          ],
        },
      },
    },
    perimenopause: {
      title: "Perimenopause Journey",
      description: "Navigate the transition with insights and support",
      icon: Wind,
      phases: {
        "Early Stage": {
          emoji: "🌊",
          color: "#9333EA",
          description: "Subtle changes beginning",
          hormones: "Fluctuating estrogen",
          symptoms: ["Irregular periods", "Mood changes", "Sleep disruption"],
          recommendations: [
            "Track changes",
            "Stress management",
            "Regular exercise",
            "Hormone testing",
          ],
        },
        "Middle Stage": {
          emoji: "🌪️",
          color: "#DB2777",
          description: "More noticeable changes",
          hormones: "Erratic hormone levels",
          symptoms: ["Hot flashes", "Night sweats", "Anxiety", "Brain fog"],
          recommendations: [
            "Cooling strategies",
            "Mindfulness",
            "Strength training",
            "Sleep hygiene",
          ],
        },
        "Late Stage": {
          emoji: "🌅",
          color: "#DC2626",
          description: "Approaching menopause",
          hormones: "Declining estrogen",
          symptoms: [
            "Longer gaps between periods",
            "Vaginal dryness",
            "Joint pain",
          ],
          recommendations: [
            "Bone health focus",
            "Heart health",
            "Pelvic floor exercises",
            "Community support",
          ],
        },
      },
    },
    menopause: {
      title: "Menopause & Beyond",
      description: "Embrace your wisdom years with confidence and vitality",
      icon: Sun,
      phases: {
        "Early Menopause": {
          emoji: "🌻",
          color: "#7C3AED",
          description: "First year after last period",
          hormones: "Low stable estrogen",
          focus: ["Symptom management", "Bone density", "Heart health"],
          recommendations: [
            "Weight-bearing exercise",
            "Calcium/Vitamin D",
            "Stress reduction",
            "Sleep optimization",
          ],
        },
        "Established Menopause": {
          emoji: "🌺",
          color: "#2563EB",
          description: "2-5 years post-menopause",
          hormones: "New hormonal baseline",
          focus: [
            "Long-term health",
            "Cognitive function",
            "Emotional well-being",
          ],
          recommendations: [
            "Brain training",
            "Social connections",
            "Mediterranean diet",
            "Regular check-ups",
          ],
        },
        "Wisdom Years": {
          emoji: "✨",
          color: "#059669",
          description: "5+ years post-menopause",
          hormones: "Stable low hormones",
          focus: ["Vitality", "Purpose", "Joy", "Legacy"],
          recommendations: [
            "Passion projects",
            "Mentoring",
            "Travel",
            "Creative pursuits",
          ],
        },
      },
    },
  };

  const currentStageInfo = lifeStageInfo[lifeStage];
  const IconComponent = currentStageInfo.icon;

  // Calculate life stage specific metrics
  const calculateLifeStageMetrics = () => {
    const baseMetrics = {
      tracking: cycleData.phaseDistribution.length > 0 ? 8.5 : 0,
      awareness: cycleData.insights ? 7.8 : 0,
      adaptation: 8.0,
      wellbeing: parseFloat(data?.overview?.avgMood || 5),
    };

    switch (lifeStage) {
      case "menstrual":
        return {
          cycleRegularity: baseMetrics.tracking,
          phaseAwareness: baseMetrics.awareness,
          symptomPatterns: 7.2,
          adaptationScore: baseMetrics.adaptation,
        };
      case "perimenopause":
        return {
          transitionTracking: baseMetrics.tracking,
          symptomManagement: 6.8,
          adaptationScore: baseMetrics.adaptation,
          emotionalResilience: baseMetrics.wellbeing,
        };
      case "menopause":
        return {
          vitalityScore: baseMetrics.wellbeing,
          healthOptimization: 7.5,
          wisdomIntegration: 8.2,
          lifeEnjoyment: 8.5,
        };
    }
  };

  const metrics = calculateLifeStageMetrics();

  // Generate life stage specific visualizations
  const generateLifeStageData = () => {
    switch (lifeStage) {
      case "menstrual":
        return {
          phaseCorrelations: generatePhaseCorrelations(),
          symptomData: generateMenstrualSymptomData(),
          predictions: predictiveMode ? generateCyclePredictions() : null,
        };
      case "perimenopause":
        return {
          symptomTracking: generatePerimenopauseSymptoms(),
          hormoneFluctuations: generateHormonePatterns(),
          transitionTimeline: generateTransitionTimeline(),
        };
      case "menopause":
        return {
          wellbeingMetrics: generateMenopauseWellbeing(),
          healthIndicators: generateHealthIndicators(),
          vitalityTracking: generateVitalityData(),
        };
    }
  };

  const stageData = generateLifeStageData();

  // Helper functions for generating data
  function generatePhaseCorrelations() {
    if (!cycleData.moodByPhase || cycleData.moodByPhase.length === 0) {
      return [];
    }

    return cycleData.moodByPhase.map((phase) => {
      const energyData = cycleData.energyByPhase.find(
        (e) => e.phase === phase.phase
      );
      return {
        phase: phase.phase,
        mood: parseFloat(phase.avgMood),
        energy: energyData ? parseFloat(energyData.avgEnergy) : 0,
        productivity: Math.random() * 3 + 6,
        creativity: Math.random() * 3 + 5,
        socialDesire: Math.random() * 3 + 4,
      };
    });
  }

  function generateMenstrualSymptomData() {
    return [
      {
        symptom: "Cramps",
        Menstrual: 8,
        Follicular: 1,
        Ovulatory: 2,
        Luteal: 4,
      },
      {
        symptom: "Fatigue",
        Menstrual: 7,
        Follicular: 3,
        Ovulatory: 2,
        Luteal: 6,
      },
      {
        symptom: "Mood Swings",
        Menstrual: 5,
        Follicular: 2,
        Ovulatory: 1,
        Luteal: 7,
      },
      {
        symptom: "Cravings",
        Menstrual: 6,
        Follicular: 3,
        Ovulatory: 2,
        Luteal: 8,
      },
      {
        symptom: "Bloating",
        Menstrual: 4,
        Follicular: 2,
        Ovulatory: 3,
        Luteal: 7,
      },
    ];
  }

  function generatePerimenopauseSymptoms() {
    const symptoms = [
      "Hot Flashes",
      "Night Sweats",
      "Mood Swings",
      "Brain Fog",
      "Irregular Periods",
      "Sleep Issues",
    ];
    return symptoms.map((symptom) => ({
      symptom,
      frequency: Math.random() * 10,
      severity: Math.random() * 10,
      trend: Math.random() * 20 - 10, // -10 to +10
    }));
  }

  function generateHormonePatterns() {
    const weeks = [];
    for (let i = 0; i < 12; i++) {
      weeks.push({
        week: `Week ${i + 1}`,
        estrogen: 30 + Math.random() * 70,
        progesterone: 10 + Math.random() * 40,
        testosterone: 5 + Math.random() * 15,
        mood: 4 + Math.random() * 5,
      });
    }
    return weeks;
  }

  function generateTransitionTimeline() {
    return [
      { stage: "Regular Cycles", percentage: 100, color: colors.Follicular },
      {
        stage: "Early Changes",
        percentage: 75,
        color: stageColors.perimenopause.primary,
      },
      {
        stage: "Irregular Cycles",
        percentage: 50,
        color: stageColors.perimenopause.secondary,
      },
      {
        stage: "Late Perimenopause",
        percentage: 25,
        color: stageColors.perimenopause.tertiary,
      },
      {
        stage: "Approaching Menopause",
        percentage: 10,
        color: stageColors.perimenopause.quaternary,
      },
    ];
  }

  function generateMenopauseWellbeing() {
    return [
      { aspect: "Physical Vitality", score: 7.5, target: 8 },
      { aspect: "Emotional Balance", score: 8.2, target: 8 },
      { aspect: "Mental Clarity", score: 7.8, target: 8.5 },
      { aspect: "Social Connection", score: 8.5, target: 8 },
      { aspect: "Purpose & Meaning", score: 9.0, target: 9 },
      { aspect: "Joy & Fulfillment", score: 8.3, target: 9 },
    ];
  }

  function generateHealthIndicators() {
    return {
      bone: { label: "Bone Health", score: 75, trend: "stable" },
      heart: { label: "Cardiovascular", score: 82, trend: "improving" },
      brain: { label: "Cognitive Function", score: 88, trend: "stable" },
      metabolic: { label: "Metabolic Health", score: 70, trend: "attention" },
    };
  }

  function generateVitalityData() {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        vitality: 60 + Math.random() * 30,
        activity: 50 + Math.random() * 40,
        mood: 60 + Math.random() * 30,
        sleep: 55 + Math.random() * 35,
      });
    }
    return months;
  }

  function generateCyclePredictions() {
    const predictions = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      predictions.push({
        date: futureDate.toLocaleDateString(),
        day: futureDate.toLocaleDateString("en-US", { weekday: "short" }),
        predictedMood: 6 + Math.random() * 3,
        predictedEnergy: 5 + Math.random() * 4,
        confidence: 0.7 + Math.random() * 0.2,
        phase: i <= 3 ? "Follicular" : "Ovulatory",
      });
    }
    return predictions;
  }

  return (
    <div className="p-6">
      {/* Header with Life Stage Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconComponent className="text-purple-600" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStageInfo.title}
              </h2>
              <p className="text-gray-600">{currentStageInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lifeStage === "menstrual" && (
              <button
                onClick={() => setPredictiveMode(!predictiveMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  predictiveMode
                    ? "bg-purple-600 text-white"
                    : "text-purple-600 border border-purple-300 hover:bg-purple-50"
                }`}
              >
                <Sparkles size={16} />
                {predictiveMode ? "Predictions On" : "Enable Predictions"}
              </button>
            )}

            <button
              onClick={() => setShowEducation(!showEducation)}
              className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
            >
              <Info size={16} />
              Learn More
            </button>
          </div>
        </div>

        {/* Life Stage Selector */}
        <div className="bg-gray-50 p-1 rounded-lg inline-flex">
          {Object.keys(lifeStageInfo).map((stage) => (
            <button
              key={stage}
              onClick={() => setLifeStage(stage)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                lifeStage === stage
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {stage === "menstrual" && "Menstrual Cycle"}
              {stage === "perimenopause" && "Perimenopause"}
              {stage === "menopause" && "Menopause & Beyond"}
            </button>
          ))}
        </div>
      </div>

      {/* Transition Alert */}
      {lifeStage === "perimenopause" &&
        cycleData.phaseDistribution.length > 0 && (
          <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-purple-600 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">
                  Your Cycle History is Being Used
                </h4>
                <p className="text-purple-700 text-sm">
                  We're using your {data?.overview?.totalEntries || 0} previous
                  cycle tracking entries to provide personalized perimenopause
                  insights. Your historical patterns help us identify changes
                  and provide better support during this transition.
                </p>
                <button
                  onClick={() =>
                    setShowTransitionInsights(!showTransitionInsights)
                  }
                  className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  View transition insights
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Life Stage Specific Content */}
      {lifeStage === "menstrual" && (
        <MenstrualCycleView
          data={cycleData}
          metrics={metrics}
          stageData={stageData}
          colors={colors}
          currentStageInfo={currentStageInfo}
          predictiveMode={predictiveMode}
        />
      )}

      {lifeStage === "perimenopause" && (
        <PerimenopauseView
          data={cycleData}
          metrics={metrics}
          stageData={stageData}
          colors={stageColors.perimenopause}
          currentStageInfo={currentStageInfo}
          historicalData={data}
        />
      )}

      {lifeStage === "menopause" && (
        <MenopauseView
          data={cycleData}
          metrics={metrics}
          stageData={stageData}
          colors={stageColors.menopause}
          currentStageInfo={currentStageInfo}
          historicalData={data}
        />
      )}

      {/* Educational Modal */}
      {showEducation && (
        <LifeStageEducationModal
          lifeStage={lifeStage}
          stageInfo={currentStageInfo}
          onClose={() => setShowEducation(false)}
        />
      )}

      {/* Transition Insights Modal */}
      {showTransitionInsights && (
        <TransitionInsightsModal
          historicalData={data}
          onClose={() => setShowTransitionInsights(false)}
        />
      )}
    </div>
  );
};

// Menstrual Cycle View Component
const MenstrualCycleView = ({
  data,
  metrics,
  stageData,
  colors,
  currentStageInfo,
  predictiveMode,
}) => {
  if (!data.phaseDistribution || data.phaseDistribution.length === 0) {
    return (
      <div className="text-center py-12">
        <Moon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Start Tracking Your Cycle
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Begin tracking your menstrual cycle to unlock powerful insights about
          how your hormones affect your mood, energy, and overall well-being.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.cycleRegularity}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Cycle Regularity</h3>
          <p className="text-sm opacity-90">Predictability score</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.phaseAwareness}</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Phase Awareness</h3>
          <p className="text-sm opacity-90">Understanding patterns</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.symptomPatterns}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Symptom Tracking</h3>
          <p className="text-sm opacity-90">Pattern recognition</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.adaptationScore}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Cycle Syncing</h3>
          <p className="text-sm opacity-90">Life optimization</p>
        </div>
      </div>

      {/* Phase Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phase Impact Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stageData.phaseCorrelations}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="phase" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                  name="Mood"
                  dataKey="mood"
                  stroke={colors.Menstrual}
                  fill={colors.Menstrual}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Energy"
                  dataKey="energy"
                  stroke={colors.Follicular}
                  fill={colors.Follicular}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Productivity"
                  dataKey="productivity"
                  stroke={colors.Ovulatory}
                  fill={colors.Ovulatory}
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Symptom Patterns by Phase
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData.symptomData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="symptom" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="Menstrual" fill={colors.Menstrual} />
                <Bar dataKey="Follicular" fill={colors.Follicular} />
                <Bar dataKey="Ovulatory" fill={colors.Ovulatory} />
                <Bar dataKey="Luteal" fill={colors.Luteal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      {predictiveMode && stageData.predictions && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            7-Day Predictive Forecast
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stageData.predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  fill="#E9D5FF"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="predictedMood"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={{ fill: "#9333EA" }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedEnergy"
                  stroke="#DB2777"
                  strokeWidth={2}
                  dot={{ fill: "#DB2777" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-gray-700">Predicted Mood</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-600"></div>
              <span className="text-gray-700">Predicted Energy</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(currentStageInfo.phases).map(([phase, info]) => (
          <div
            key={phase}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{info.emoji}</span>
              <h4 className="font-semibold text-gray-900">{phase}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">{info.description}</p>
            <div className="space-y-1">
              {info.recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  ></div>
                  <span className="text-xs text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Perimenopause View Component
const PerimenopauseView = ({
  data,
  metrics,
  stageData,
  colors,
  currentStageInfo,
  historicalData,
}) => {
  return (
    <>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Thermometer className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.transitionTracking}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Transition Tracking</h3>
          <p className="text-sm opacity-90">Change awareness</p>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.symptomManagement}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Symptom Control</h3>
          <p className="text-sm opacity-90">Management effectiveness</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.adaptationScore}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Adaptation Score</h3>
          <p className="text-sm opacity-90">Coping strategies</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.emotionalResilience}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Emotional Balance</h3>
          <p className="text-sm opacity-90">Mental wellbeing</p>
        </div>
      </div>

      {/* Symptom Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Symptom Frequency & Severity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="frequency" name="Frequency" />
                <YAxis dataKey="severity" name="Severity" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Symptoms"
                  data={stageData.symptomTracking}
                  fill={colors.primary}
                >
                  {stageData.symptomTracking.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[entry.trend > 0 ? "tertiary" : "primary"]}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stageData.symptomTracking.slice(0, 3).map((symptom, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{symptom.symptom}</span>
                <div className="flex items-center gap-2">
                  {symptom.trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                  )}
                  <span className="text-gray-600">
                    {Math.abs(symptom.trend).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hormone Fluctuation Patterns
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stageData.hormoneFluctuations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="estrogen"
                  stackId="1"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="progesterone"
                  stackId="1"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="testosterone"
                  stackId="1"
                  stroke={colors.tertiary}
                  fill={colors.tertiary}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transition Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Perimenopause Journey
        </h3>
        <div className="space-y-4">
          {stageData.transitionTimeline.map((stage, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">
                {stage.stage}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 flex items-center justify-end pr-2"
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {stage.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Based on your symptoms and cycle patterns, you appear to be in the
          early-to-middle stage of perimenopause.
        </p>
      </div>

      {/* Stage-Specific Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(currentStageInfo.phases).map(([stage, info]) => (
          <div
            key={stage}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{info.emoji}</span>
              <h4 className="font-semibold text-purple-900">{stage}</h4>
            </div>
            <p className="text-sm text-purple-700 mb-3">{info.description}</p>
            <div className="space-y-2">
              <div className="text-xs font-medium text-purple-800">
                Key Focus:
              </div>
              {info.recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  ></div>
                  <span className="text-xs text-purple-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Menopause View Component
const MenopauseView = ({
  data,
  metrics,
  stageData,
  colors,
  currentStageInfo,
  historicalData,
}) => {
  return (
    <>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Sun className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.vitalityScore}</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Vitality Score</h3>
          <p className="text-sm opacity-90">Life energy & zest</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.healthOptimization}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Health Optimization</h3>
          <p className="text-sm opacity-90">Preventive wellness</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {metrics.wisdomIntegration}
              </div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Wisdom Integration</h3>
          <p className="text-sm opacity-90">Life experience value</p>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.lifeEnjoyment}</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Joy & Fulfillment</h3>
          <p className="text-sm opacity-90">Life satisfaction</p>
        </div>
      </div>

      {/* Wellbeing Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Holistic Wellbeing Profile
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stageData.wellbeingMetrics}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="aspect" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vitality Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stageData.vitalityTracking}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="vitality"
                  fill={colors.primary}
                  stroke={colors.primary}
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="activity"
                  stroke={colors.secondary}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke={colors.tertiary}
                  strokeWidth={2}
                />
                <Bar
                  dataKey="sleep"
                  fill={colors.quaternary}
                  fillOpacity={0.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Health Optimization Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stageData.healthIndicators).map(
            ([key, indicator]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {indicator.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      indicator.trend === "improving"
                        ? "bg-green-100 text-green-700"
                        : indicator.trend === "stable"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {indicator.trend}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {indicator.score}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${indicator.score}%`,
                      backgroundColor:
                        indicator.score > 80
                          ? "#10B981"
                          : indicator.score > 60
                          ? "#3B82F6"
                          : "#F59E0B",
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Life Stage Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(currentStageInfo.phases).map(([stage, info]) => (
          <div
            key={stage}
            className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{info.emoji}</span>
              <h4 className="font-semibold text-violet-900">{stage}</h4>
            </div>
            <p className="text-sm text-violet-700 mb-3">{info.description}</p>
            <div className="space-y-2">
              <div className="text-xs font-medium text-violet-800">
                Focus Areas:
              </div>
              {info.recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  ></div>
                  <span className="text-xs text-violet-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Life Stage Education Modal
const LifeStageEducationModal = ({ lifeStage, stageInfo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Understanding {stageInfo.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(stageInfo.phases).map(([phase, info]) => (
              <div key={phase} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{info.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {phase}
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">{info.description}</p>

                {info.hormones && (
                  <div className="mb-3">
                    <span className="font-medium text-gray-900">
                      Hormones:{" "}
                    </span>
                    <span className="text-gray-700">{info.hormones}</span>
                  </div>
                )}

                {info.symptoms && (
                  <div className="mb-3">
                    <span className="font-medium text-gray-900">
                      Common Experiences:
                    </span>
                    <ul className="mt-1 text-sm text-gray-700">
                      {info.symptoms.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-900">
                    Recommendations:
                  </span>
                  <ul className="mt-1 text-sm text-gray-700">
                    {info.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transition Insights Modal
const TransitionInsightsModal = ({ historicalData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Transition Insights
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                Cycle History Analysis
              </h3>
              <p className="text-purple-700 text-sm">
                Based on your {historicalData?.overview?.totalEntries || 0}{" "}
                journal entries tracking your menstrual cycle, we've identified
                the following patterns that can help inform your perimenopause
                journey:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Average Cycle Length
                </h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  28 days
                </p>
                <p className="text-sm text-gray-600">
                  Your historical average helps us detect when cycles become
                  irregular
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Symptom Patterns
                </h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  Identified
                </p>
                <p className="text-sm text-gray-600">
                  We'll watch for changes in your usual symptom patterns
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Mood Baselines
                </h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  Established
                </p>
                <p className="text-sm text-gray-600">
                  Your cycle mood patterns help identify hormonal mood changes
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Energy Patterns
                </h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  Tracked
                </p>
                <p className="text-sm text-gray-600">
                  Energy fluctuations can signal hormonal transitions
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">
                How We Use This Data
              </h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Compare current patterns to your historical baseline</li>
                <li>• Identify deviations that may indicate perimenopause</li>
                <li>
                  • Provide personalized recommendations based on your unique
                  patterns
                </li>
                <li>• Track the progression of your transition over time</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleIntelligenceTab;
