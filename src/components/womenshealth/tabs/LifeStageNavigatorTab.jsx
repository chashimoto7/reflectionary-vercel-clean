// src/components/womenshealth/tabs/LifeStageNavigatorTab.jsx
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
} from "lucide-react";
import {
  format,
  differenceInYears,
  differenceInMonths,
  addMonths,
  subYears,
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

const LifeStageNavigatorTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(lifeStage);
  const [showTransitionGuide, setShowTransitionGuide] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Life stage data
  const [stageData, setStageData] = useState({
    currentStage: lifeStage,
    timeInStage: null,
    transitionProgress: 0,
    symptoms: [],
    milestones: [],
    education: {},
  });

  // Stage definitions
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
        "Transition period with fluctuating hormones and irregular cycles",
      ageRange: "40s to early 50s",
      duration: "4-10 years",
      keyFeatures: [
        "Irregular periods",
        "Hot flashes begin",
        "Mood fluctuations",
        "Sleep disruptions",
      ],
      transitions: {
        next: "menopause",
        signs: [
          "12 months without a period",
          "Consistent hot flashes",
          "No more cycle variation",
          "Hormone levels stabilized low",
        ],
      },
    },
    menopause: {
      name: "Menopause & Beyond",
      icon: Flower2,
      color: colors.secondary,
      description: "Post-menopausal phase with new health considerations",
      ageRange: "50s and beyond",
      duration: "Rest of life",
      keyFeatures: [
        "No menstrual periods",
        "Potential hot flashes",
        "Bone health focus",
        "Heart health priority",
      ],
      transitions: {
        next: null,
        signs: [],
      },
    },
  };

  // Milestones for each stage
  const stageMilestones = {
    menstrual: [
      {
        id: 1,
        name: "First tracked cycle",
        completed: true,
        date: "2020-01-15",
      },
      {
        id: 2,
        name: "Identified cycle pattern",
        completed: true,
        date: "2020-03-20",
      },
      { id: 3, name: "100 days tracked", completed: true, date: "2020-05-01" },
      { id: 4, name: "Fertility awareness mastery", completed: false },
      { id: 5, name: "PMS management plan", completed: false },
    ],
    perimenopause: [
      {
        id: 1,
        name: "Recognized first signs",
        completed: true,
        date: "2023-06-15",
      },
      {
        id: 2,
        name: "Symptom tracking started",
        completed: true,
        date: "2023-07-01",
      },
      { id: 3, name: "Hot flash pattern identified", completed: false },
      { id: 4, name: "Sleep strategy implemented", completed: false },
      { id: 5, name: "Healthcare provider consultation", completed: false },
    ],
    menopause: [
      {
        id: 1,
        name: "12 months period-free",
        completed: true,
        date: "2024-01-15",
      },
      { id: 2, name: "Bone density check", completed: false },
      { id: 3, name: "Heart health assessment", completed: false },
      { id: 4, name: "Symptom management plan", completed: false },
      { id: 5, name: "Wellness routine established", completed: false },
    ],
  };

  useEffect(() => {
    loadStageData();
    setTimeout(() => setLoading(false), 1000);
  }, [lifeStage]);

  const loadStageData = () => {
    // Mock data - will be replaced with database calls
    const timeInStage = calculateTimeInStage();
    setStageData({
      currentStage: lifeStage,
      timeInStage: timeInStage,
      transitionProgress: calculateTransitionProgress(),
      symptoms: generateSymptomComparison(),
      milestones: stageMilestones[lifeStage] || [],
      education: generateEducationalContent(),
    });
  };

  const calculateTimeInStage = () => {
    // Mock calculation - will use actual user data
    const stageStartDates = {
      menstrual: subYears(new Date(), 10),
      perimenopause: subYears(new Date(), 2),
      menopause: subYears(new Date(), 1),
    };

    const startDate = stageStartDates[lifeStage];
    const years = differenceInYears(new Date(), startDate);
    const months = differenceInMonths(new Date(), startDate) % 12;

    return { years, months };
  };

  const calculateTransitionProgress = () => {
    // Mock calculation based on symptoms and time
    if (lifeStage === "menstrual") return 15;
    if (lifeStage === "perimenopause") return 65;
    return 100;
  };

  const generateSymptomComparison = () => {
    return [
      {
        symptom: "Hot Flashes",
        menstrual: 5,
        perimenopause: 75,
        menopause: 85,
      },
      {
        symptom: "Irregular Periods",
        menstrual: 10,
        perimenopause: 90,
        menopause: 0,
      },
      {
        symptom: "Mood Changes",
        menstrual: 40,
        perimenopause: 70,
        menopause: 50,
      },
      {
        symptom: "Sleep Issues",
        menstrual: 20,
        perimenopause: 60,
        menopause: 65,
      },
      { symptom: "Fatigue", menstrual: 30, perimenopause: 65, menopause: 55 },
      {
        symptom: "Weight Changes",
        menstrual: 15,
        perimenopause: 45,
        menopause: 60,
      },
    ];
  };

  const generateEducationalContent = () => {
    return {
      articles: [
        "Understanding Your Life Stage",
        "Nutrition for Your Stage",
        "Exercise Recommendations",
        "Managing Symptoms Naturally",
      ],
      videos: [
        "Life Stage Transitions Explained",
        "Hormone Changes Through Life",
        "Wellness Strategies by Stage",
      ],
    };
  };

  const getTransitionIndicators = () => {
    const indicators = stageDefinitions[lifeStage].transitions.signs;
    // Mock completion status
    return indicators.map((sign, index) => ({
      sign,
      present: index < 2, // Mock: first 2 signs present
    }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading life stage information...</p>
      </div>
    );
  }

  const currentStageInfo = stageDefinitions[selectedStage];
  const CurrentStageIcon = currentStageInfo.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Stage Overview */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-4">
              <CurrentStageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentStageInfo.name}
              </h2>
              <p className="text-purple-200 mb-4">
                {currentStageInfo.description}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-purple-300">Typical Age:</span>
                  <span className="text-white ml-2 font-medium">
                    {currentStageInfo.ageRange}
                  </span>
                </div>
                <div>
                  <span className="text-purple-300">Duration:</span>
                  <span className="text-white ml-2 font-medium">
                    {currentStageInfo.duration}
                  </span>
                </div>
                {stageData.timeInStage && (
                  <div>
                    <span className="text-purple-300">Your Time in Stage:</span>
                    <span className="text-white ml-2 font-medium">
                      {stageData.timeInStage.years} years,{" "}
                      {stageData.timeInStage.months} months
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowTransitionGuide(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Transition Guide
          </button>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Life Stage Journey
        </h3>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 -translate-y-1/2 transition-all"
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
                        isActive || isPast ? "text-white" : "text-purple-300"
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
                  {isCurrent && (
                    <span className="absolute -top-6 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Features & Transition Signs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Features */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Key Features of {currentStageInfo.name}
          </h3>

          <div className="space-y-3">
            {currentStageInfo.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-purple-200">{feature}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Self-Care Focus
            </h4>
            <p className="text-sm text-purple-200">
              {selectedStage === "menstrual" &&
                "Focus on cycle tracking, nutrition, and understanding your patterns."}
              {selectedStage === "perimenopause" &&
                "Prioritize stress management, sleep quality, and symptom tracking."}
              {selectedStage === "menopause" &&
                "Emphasize bone health, heart health, and maintaining an active lifestyle."}
            </p>
          </div>
        </div>

        {/* Transition Indicators */}
        {currentStageInfo.transitions.next && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Transition to{" "}
              {stageDefinitions[currentStageInfo.transitions.next].name}
            </h3>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200">Transition Progress</span>
                <span className="text-white font-medium">
                  {stageData.transitionProgress}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                  style={{ width: `${stageData.transitionProgress}%` }}
                />
              </div>
            </div>

            <h4 className="text-white font-medium mb-3">Signs to Watch For:</h4>
            <div className="space-y-2">
              {getTransitionIndicators().map((indicator, index) => (
                <div key={index} className="flex items-start gap-3">
                  {indicator.present ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      indicator.present ? "text-white" : "text-purple-300"
                    }`}
                  >
                    {indicator.sign}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Symptom Comparison Across Stages */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Symptom Patterns Across Life Stages
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={stageData.symptoms}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis
                dataKey="symptom"
                stroke="#fff"
                tick={{ fill: "#fff", fontSize: 12 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                stroke="#fff"
                tick={{ fill: "#fff" }}
              />
              <Radar
                name="Menstrual"
                dataKey="menstrual"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
              <Radar
                name="Perimenopause"
                dataKey="perimenopause"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.3}
              />
              <Radar
                name="Menopause"
                dataKey="menopause"
                stroke="#EC4899"
                fill="#EC4899"
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

        <div className="flex items-center justify-center gap-6 mt-4">
          {Object.entries(stageDefinitions).map(([key, stage]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              ></div>
              <span className="text-sm text-purple-200">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones & Achievements */}
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
                  <span
                    className={`${
                      milestone.completed ? "text-white" : "text-purple-200"
                    }`}
                  >
                    {milestone.name}
                  </span>
                </div>
                {milestone.completed && milestone.date && (
                  <span className="text-sm text-purple-300">
                    {format(new Date(milestone.date), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full bg-purple-600/20 hover:bg-purple-600/30 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Target className="w-5 h-5" />
          Set New Milestone
        </button>
      </div>

      {/* Educational Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-300" />
            Recommended Reading
          </h3>

          <div className="space-y-3">
            {stageData.education.articles.map((article, index) => (
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
              <span className="text-sm text-purple-300">2.5k members</span>
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
                You've been in the{" "}
                <span className="text-white font-medium">
                  {currentStageInfo.name}
                </span>{" "}
                stage for{" "}
                <span className="text-white font-medium">
                  {stageData.timeInStage?.years} years and{" "}
                  {stageData.timeInStage?.months} months
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
                personalized insights and better understand your unique journey
                through each life stage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeStageNavigatorTab;
