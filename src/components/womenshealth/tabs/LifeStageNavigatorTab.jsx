// frontend/src/components/womenshealth/tabs/LifeStageNavigatorTab.jsx
import React, { useState, useEffect } from "react";
import {
  Flower2,
  Moon,
  Sun,
  Calendar,
  Info,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Clock,
  BookOpen,
  Heart,
  Brain,
  Activity,
  Shield,
  Sparkles,
  ArrowRight,
  Award,
  Target,
  Zap,
  MessageSquare,
  FileText,
  Download,
  User,
  Users,
  Database,
} from "lucide-react";
import {
  format,
  differenceInYears,
  differenceInMonths,
  addMonths,
  subYears,
  parseISO,
} from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const LifeStageNavigatorTab = ({
  colors,
  user,
  lifeStage,
  healthData = [],
  profile = null,
  insights = null,
  onRefreshData,
}) => {
  const [selectedStage, setSelectedStage] = useState(lifeStage);
  const [showTransitionGuide, setShowTransitionGuide] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Process health data for life stage insights
  const stageData = processLifeStageData(healthData, lifeStage, profile);
  const hasData = healthData && healthData.length > 0;
  const hasMinimumData = healthData && healthData.length >= 30; // Need at least a month of data

  // Stage definitions (keeping these hardcoded as educational content)
  const stageDefinitions = {
    menstrual: {
      name: "Menstrual Years",
      icon: Moon,
      color: colors.primary,
      description:
        "Regular or irregular menstrual cycles with predictable patterns",
      ageRange: "Teens to 40s",
      duration: "~30-40 years",
      keyFeatures: [
        "Monthly menstrual cycles",
        "Predictable hormone patterns",
        "Fertility awareness",
        "PMS symptoms",
      ],
      transitions: {
        next: "perimenopause",
        signs: [
          "Cycles becoming irregular",
          "Changes in flow",
          "New or worsening PMS",
          "Age approaching 40-45",
        ],
      },
    },
    perimenopause: {
      name: "Perimenopause",
      icon: Sun,
      color: colors.warning,
      description:
        "The transition period before menopause with fluctuating hormones",
      ageRange: "40s to early 50s",
      duration: "4-10 years",
      keyFeatures: [
        "Irregular periods",
        "Hot flashes",
        "Sleep disturbances",
        "Mood changes",
      ],
      transitions: {
        next: "menopause",
        signs: [
          "12 months without a period",
          "Consistent hot flashes",
          "Vaginal dryness",
          "Age typically 45-55",
        ],
      },
    },
    menopause: {
      name: "Menopause & Beyond",
      icon: Flower2,
      color: colors.secondary,
      description: "Life after periods have stopped for 12 consecutive months",
      ageRange: "50s and beyond",
      duration: "Rest of life",
      keyFeatures: [
        "No menstrual periods",
        "Stable hormone levels",
        "Focus on long-term health",
        "Bone & heart health priority",
      ],
      transitions: {
        next: null,
        signs: [],
      },
    },
  };

  // Process health data to extract life stage insights
  function processLifeStageData(entries, currentStage, userProfile) {
    const data = {
      currentStage,
      timeInStage: calculateTimeInStage(userProfile, currentStage),
      transitionProgress: 0,
      symptoms: [],
      milestones: [],
      averageSymptoms: {},
    };

    if (!entries || entries.length === 0) {
      return data;
    }

    // Calculate symptoms frequency
    const symptomCounts = {};
    let totalEntries = 0;

    entries.forEach((entry) => {
      if (!entry.data) return;
      totalEntries++;

      // Track transition symptoms based on life stage
      if (currentStage === "menstrual") {
        // Look for perimenopause transition signs
        if (
          entry.data.cycleLength &&
          Math.abs(entry.data.cycleLength - 28) > 7
        ) {
          symptomCounts.irregularCycles =
            (symptomCounts.irregularCycles || 0) + 1;
        }
        if (entry.data.periodFlow === "heavy" || entry.data.flooding) {
          symptomCounts.heavyFlow = (symptomCounts.heavyFlow || 0) + 1;
        }
        if (entry.data.moodSwings) {
          symptomCounts.moodSwings = (symptomCounts.moodSwings || 0) + 1;
        }
      } else if (currentStage === "perimenopause") {
        // Track menopause transition signs
        if (entry.data.hotFlashCount > 0) {
          symptomCounts.hotFlashes = (symptomCounts.hotFlashes || 0) + 1;
        }
        if (entry.data.nightSweatSeverity > 0) {
          symptomCounts.nightSweats = (symptomCounts.nightSweats || 0) + 1;
        }
        if (entry.data.vaginalDryness > 0) {
          symptomCounts.vaginalDryness =
            (symptomCounts.vaginalDryness || 0) + 1;
        }
        if (entry.data.skippedPeriod) {
          symptomCounts.skippedPeriods =
            (symptomCounts.skippedPeriods || 0) + 1;
        }
      }

      // Track general symptoms
      if (entry.data.mood < 3) {
        symptomCounts.lowMood = (symptomCounts.lowMood || 0) + 1;
      }
      if (entry.data.energy < 3) {
        symptomCounts.lowEnergy = (symptomCounts.lowEnergy || 0) + 1;
      }
      if (entry.data.sleepQuality < 3) {
        symptomCounts.poorSleep = (symptomCounts.poorSleep || 0) + 1;
      }
    });

    // Convert counts to percentages
    data.symptoms = Object.entries(symptomCounts).map(([symptom, count]) => ({
      name: symptom.replace(/([A-Z])/g, " $1").trim(),
      frequency: Math.round((count / totalEntries) * 100),
      severity: calculateAverageSeverity(entries, symptom),
    }));

    // Calculate transition progress
    data.transitionProgress = calculateTransitionProgress(
      currentStage,
      data.symptoms,
      userProfile
    );

    // Generate milestones based on actual data
    data.milestones = generateMilestones(currentStage, entries, userProfile);

    return data;
  }

  // Calculate time in current stage
  function calculateTimeInStage(userProfile, currentStage) {
    if (!userProfile || !userProfile.stage_started_date) {
      return { years: 0, months: 0 };
    }

    const startDate = new Date(userProfile.stage_started_date);
    const now = new Date();

    const years = differenceInYears(now, startDate);
    const months = differenceInMonths(now, startDate) % 12;

    return { years, months };
  }

  // Calculate average severity for symptoms
  function calculateAverageSeverity(entries, symptomType) {
    let total = 0;
    let count = 0;

    entries.forEach((entry) => {
      if (!entry.data) return;

      switch (symptomType) {
        case "hotFlashes":
          if (entry.data.hotFlashSeverity?.length > 0) {
            total +=
              entry.data.hotFlashSeverity.reduce((a, b) => a + b, 0) /
              entry.data.hotFlashSeverity.length;
            count++;
          }
          break;
        case "nightSweats":
          if (entry.data.nightSweatSeverity > 0) {
            total += entry.data.nightSweatSeverity;
            count++;
          }
          break;
        case "lowMood":
          if (entry.data.mood) {
            total += 5 - entry.data.mood;
            count++;
          }
          break;
        default:
          // For other symptoms, use a default severity
          if (entry.data[symptomType]) {
            total += 3;
            count++;
          }
      }
    });

    return count > 0 ? Math.round(total / count) : 0;
  }

  // Calculate transition progress based on symptoms and age
  function calculateTransitionProgress(currentStage, symptoms, userProfile) {
    if (currentStage === "menopause") return 100; // Already transitioned

    let progress = 0;
    const age = userProfile?.age || 0;

    if (currentStage === "menstrual") {
      // Progress to perimenopause
      if (age >= 40) progress += 20;
      if (age >= 45) progress += 20;

      // Symptom-based progress
      const irregularCycles =
        symptoms.find((s) => s.name.includes("irregular"))?.frequency || 0;
      if (irregularCycles > 20) progress += 20;

      const moodSwings =
        symptoms.find((s) => s.name.includes("mood"))?.frequency || 0;
      if (moodSwings > 30) progress += 10;

      const heavyFlow =
        symptoms.find((s) => s.name.includes("heavy"))?.frequency || 0;
      if (heavyFlow > 20) progress += 10;
    } else if (currentStage === "perimenopause") {
      // Progress to menopause
      if (age >= 50) progress += 30;
      if (age >= 52) progress += 20;

      // Symptom-based progress
      const skippedPeriods =
        symptoms.find((s) => s.name.includes("skipped"))?.frequency || 0;
      if (skippedPeriods > 50) progress += 30;

      const hotFlashes =
        symptoms.find((s) => s.name.includes("hot"))?.frequency || 0;
      if (hotFlashes > 60) progress += 20;
    }

    return Math.min(progress, 90); // Cap at 90% - full transition requires medical confirmation
  }

  // Generate milestones based on actual tracked data
  function generateMilestones(currentStage, entries, userProfile) {
    const milestones = [];

    if (currentStage === "menstrual") {
      milestones.push({
        id: 1,
        title: "Track 3 Complete Cycles",
        description: "Build a baseline understanding of your cycle",
        completed:
          entries.filter((e) => e.data?.periodFlow === "medium").length >= 3,
      });
      milestones.push({
        id: 2,
        title: "Identify Your Patterns",
        description: "Recognize your unique PMS symptoms",
        completed: entries.length >= 60, // ~2 months of tracking
      });
      milestones.push({
        id: 3,
        title: "Optimize Your Lifestyle",
        description: "Find what works for your symptoms",
        completed: entries.filter((e) => e.data?.exercise).length >= 20,
      });
    } else if (currentStage === "perimenopause") {
      milestones.push({
        id: 1,
        title: "Track Irregular Cycles",
        description: "Document changing patterns",
        completed: entries.filter((e) => e.data?.skippedPeriod).length >= 1,
      });
      milestones.push({
        id: 2,
        title: "Manage Hot Flashes",
        description: "Find your triggers and solutions",
        completed:
          entries.filter((e) => e.data?.hotFlashCount > 0).length >= 10,
      });
      milestones.push({
        id: 3,
        title: "Prioritize Self-Care",
        description: "Establish supportive routines",
        completed: entries.filter((e) => e.data?.selfCare).length >= 15,
      });
    } else if (currentStage === "menopause") {
      milestones.push({
        id: 1,
        title: "Establish New Baseline",
        description: "Understand your post-menopausal normal",
        completed: entries.length >= 30,
      });
      milestones.push({
        id: 2,
        title: "Focus on Bone Health",
        description: "Track calcium and exercise",
        completed:
          entries.filter((e) => e.data?.calciumIntake || e.data?.weightBearing)
            .length >= 20,
      });
      milestones.push({
        id: 3,
        title: "Heart Health Monitoring",
        description: "Regular cardiovascular care",
        completed: entries.filter((e) => e.data?.bloodPressure).length >= 10,
      });
    }

    return milestones;
  }

  // Empty state component
  const EmptyState = ({ minDataRequired = false }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Database className="w-16 h-16 text-purple-300 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        {minDataRequired ? "More Tracking Needed" : "Start Your Journey"}
      </h3>
      <p className="text-purple-200 max-w-md mb-6">
        {minDataRequired
          ? "Track your symptoms for at least 30 days to see personalized life stage insights and transition progress."
          : "Begin tracking your health to understand your life stage journey and get personalized guidance."}
      </p>
      <div className="bg-purple-600/20 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-purple-100">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Your life stage navigator will show transition signs, milestones, and
          personalized guidance based on your tracking.
        </p>
      </div>
    </div>
  );

  const currentStageInfo = stageDefinitions[lifeStage];

  // Prepare symptom data for radar chart
  const radarData = stageData.symptoms.slice(0, 6).map((symptom) => ({
    symptom: symptom.name,
    frequency: symptom.frequency,
    severity: symptom.severity * 20, // Scale to 0-100
  }));

  return (
    <div className="space-y-6">
      {/* Life Stage Journey Progress */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">
          Your Life Stage Journey
        </h3>

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Journey Timeline */}
            <div className="relative mb-8">
              {/* Progress Line */}
              <div className="absolute top-8 left-8 right-8 h-1 bg-white/20 rounded-full"></div>
              <div
                className="absolute top-8 left-8 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    lifeStage === "menstrual"
                      ? "16%"
                      : lifeStage === "perimenopause"
                      ? "50%"
                      : "83%"
                  }`,
                }}
              ></div>

              {/* Stage Nodes */}
              <div className="relative flex justify-between">
                {Object.entries(stageDefinitions).map(([key, stage], index) => {
                  const StageIcon = stage.icon;
                  const isActive = key === selectedStage;
                  const isCurrent = key === lifeStage;
                  const isPast =
                    (lifeStage === "perimenopause" && key === "menstrual") ||
                    (lifeStage === "menopause" && key !== "menopause");

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStage(key)}
                      className="relative z-10 flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 scale-110"
                            : isPast
                            ? "bg-purple-800"
                            : "bg-white/20"
                        }
                        ${isCurrent ? "ring-4 ring-white/40" : ""}
                        group-hover:scale-105
                      `}
                      >
                        <StageIcon
                          className={`w-8 h-8 ${
                            isActive || isPast
                              ? "text-white"
                              : "text-purple-300"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-white" : "text-purple-200"
                        }`}
                      >
                        {stage.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time in Stage */}
            {stageData.timeInStage && (
              <div className="bg-purple-600/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-300" />
                    <span className="text-purple-100">
                      Time in {currentStageInfo.name}:
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {stageData.timeInStage.years} years,{" "}
                    {stageData.timeInStage.months} months
                  </span>
                </div>
              </div>
            )}

            {/* Transition Progress */}
            {lifeStage !== "menopause" && hasMinimumData && (
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200">Transition Progress</span>
                  <span className="text-white font-medium">
                    {stageData.transitionProgress}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stageData.transitionProgress}%` }}
                  />
                </div>
                <p className="text-xs text-purple-300 mt-2">
                  Based on your age, symptoms, and tracking patterns
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Stage Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <currentStageInfo.icon className="w-6 h-6 text-purple-300" />
            <h3 className="text-lg font-semibold text-white">
              {stageDefinitions[selectedStage].name}
            </h3>
          </div>

          <p className="text-purple-200 mb-4">
            {stageDefinitions[selectedStage].description}
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="text-white font-medium mb-1">Age Range</h4>
              <p className="text-purple-200">
                {stageDefinitions[selectedStage].ageRange}
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Typical Duration</h4>
              <p className="text-purple-200">
                {stageDefinitions[selectedStage].duration}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Key Features</h4>
            <ul className="space-y-1">
              {stageDefinitions[selectedStage].keyFeatures.map(
                (feature, index) => (
                  <li
                    key={index}
                    className="text-purple-200 text-sm flex items-start gap-2"
                  >
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                )
              )}
            </ul>
          </div>

          {stageDefinitions[selectedStage].transitions.next && (
            <button
              onClick={() => setShowTransitionGuide(true)}
              className="mt-4 w-full bg-purple-600/30 hover:bg-purple-600/40 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              View Transition Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Symptom Patterns */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Your Symptom Patterns
          </h3>

          {!hasMinimumData ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-200">
                Track symptoms for 30 days to see your patterns
              </p>
            </div>
          ) : radarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis
                    dataKey="symptom"
                    stroke="#fff"
                    opacity={0.6}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="#fff"
                    opacity={0.6}
                  />
                  <Radar
                    name="Frequency"
                    dataKey="frequency"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Severity"
                    dataKey="severity"
                    stroke={colors.secondary}
                    fill={colors.secondary}
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(139, 92, 246, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-200">
                Great job tracking! Your patterns will appear as you log more
                symptoms.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Milestones & Achievements */}
      {hasData && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Your {currentStageInfo.name} Milestones
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-purple-200">
                {stageData.milestones.filter((m) => m.completed).length} of{" "}
                {stageData.milestones.length} completed
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {stageData.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`
                  p-4 rounded-lg border transition-all cursor-pointer
                  ${
                    milestone.completed
                      ? "bg-purple-600/20 border-purple-400"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  }
                `}
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-purple-400" />
                    )}
                    <div>
                      <h4
                        className={`font-medium ${
                          milestone.completed ? "text-white" : "text-purple-100"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-purple-300 mt-1">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Reading */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-300" />
            Recommended Resources
          </h3>

          <div className="space-y-3">
            {[
              `Understanding ${currentStageInfo.name}`,
              "Hormonal changes and what to expect",
              "Nutrition for your life stage",
              "Exercise and movement guidelines",
              "Managing symptoms naturally",
            ].map((article, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span className="text-purple-200">{article}</span>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        {/* Support & Community */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-300" />
            Support & Community
          </h3>

          <div className="space-y-4">
            <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-white p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Join Stage-Specific Forum</span>
              </div>
              <span className="text-sm text-purple-300">
                Connect with others
              </span>
            </button>

            <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-white p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span>Find a Health Coach</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Insights Summary */}
      {hasMinimumData && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="bg-purple-600/30 rounded-full p-3">
              <Sparkles className="w-6 h-6 text-purple-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">
                Your Life Stage Insights
              </h4>
              <div className="space-y-2 text-purple-200">
                <p>
                  You've been tracking in the{" "}
                  <span className="text-white font-medium">
                    {currentStageInfo.name}
                  </span>{" "}
                  stage for{" "}
                  <span className="text-white font-medium">
                    {healthData.length} days
                  </span>
                  .
                </p>
                {lifeStage !== "menopause" && (
                  <p>
                    Based on your tracked symptoms, you're showing{" "}
                    <span className="text-white font-medium">
                      {stageData.transitionProgress}%
                    </span>{" "}
                    of typical transition signs to the next stage.
                  </p>
                )}
                <p>
                  Continue tracking your symptoms and milestones to get
                  personalized insights and better understand your unique
                  journey through each life stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transition Guide Modal */}
      {showTransitionGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  Transition to{" "}
                  {stageDefinitions[lifeStage].transitions.next
                    ? stageDefinitions[
                        stageDefinitions[lifeStage].transitions.next
                      ].name
                    : "Next Stage"}
                </h3>
                <button
                  onClick={() => setShowTransitionGuide(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Common Signs</h4>
                  <ul className="space-y-2">
                    {stageDefinitions[lifeStage].transitions.signs.map(
                      (sign, index) => (
                        <li
                          key={index}
                          className="text-purple-200 flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {sign}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="bg-purple-600/20 rounded-lg p-4">
                  <p className="text-sm text-purple-200">
                    <Info className="w-4 h-4 inline mr-1" />
                    Remember: Every woman's journey is unique. These are general
                    guidelines, and your experience may differ. Always consult
                    with your healthcare provider about significant changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing X icon
const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default LifeStageNavigatorTab;
