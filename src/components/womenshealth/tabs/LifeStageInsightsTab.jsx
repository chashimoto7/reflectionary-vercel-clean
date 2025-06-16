// src/components/womenshealth/tabs/LifeStageInsightsTab.jsx
import React, { useState } from "react";
import {
  Sparkles,
  Moon,
  Sun,
  Thermometer,
  TrendingUp,
  Heart,
  Brain,
  Calendar,
  Clock,
  Target,
  Activity,
  Zap,
  Shield,
  Award,
  Info,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Lightbulb,
  Crown,
  Share2,
  MessageCircle,
  Star,
  Gift,
  Coffee,
  Flower2,
  Sunrise,
  Sunset,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const LifeStageInsightsTab = ({ data, lifeStage, colors }) => {
  const [selectedInsight, setSelectedInsight] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months");
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Process life stage insights data
  const lifeStageData = data || {
    currentStage: "menstrual",
    transitions: { transitions: [] },
    stageSpecificInsights: { insights: [] },
  };

  // Life stage configurations
  const stageConfigs = {
    menstrual: {
      title: "Reproductive Years",
      subtitle: "Optimal cycle health and fertility awareness",
      icon: Moon,
      color: colors.primary,
      phase: "Active Cycling",
      keyFocus: [
        "Cycle optimization",
        "Fertility awareness",
        "Hormone balance",
        "Symptom management",
      ],
      milestones: [
        {
          name: "Regular cycles established",
          status: "complete",
          confidence: 95,
        },
        { name: "Optimal hormone balance", status: "active", confidence: 88 },
        { name: "Fertility window tracking", status: "active", confidence: 92 },
        {
          name: "Symptom pattern recognition",
          status: "active",
          confidence: 85,
        },
      ],
      celebration: "Fertility Awareness Mastery",
    },
    perimenopause: {
      title: "Transition Years",
      subtitle: "Navigating hormonal changes with wisdom",
      icon: Thermometer,
      color: colors.warning,
      phase: "Active Transition",
      keyFocus: [
        "Managing irregularity",
        "Symptom adaptation",
        "Identity shifts",
        "Health preparation",
      ],
      milestones: [
        {
          name: "Cycle changes recognized",
          status: "complete",
          confidence: 90,
        },
        {
          name: "Symptom management strategies",
          status: "active",
          confidence: 75,
        },
        { name: "Life stage acceptance", status: "developing", confidence: 68 },
        {
          name: "Future health planning",
          status: "developing",
          confidence: 72,
        },
      ],
      celebration: "Transition Wisdom Embrace",
    },
    menopause: {
      title: "Wisdom Years",
      subtitle: "Embracing freedom and new possibilities",
      icon: Sun,
      color: colors.secondary,
      phase: "Post-Reproductive",
      keyFocus: [
        "Health maintenance",
        "New identity",
        "Freedom exploration",
        "Wisdom sharing",
      ],
      milestones: [
        { name: "Menopause completion", status: "complete", confidence: 100 },
        { name: "Symptom stabilization", status: "active", confidence: 80 },
        { name: "Identity reimagined", status: "developing", confidence: 70 },
        { name: "New chapter planning", status: "developing", confidence: 65 },
      ],
      celebration: "Wisdom Years Liberation",
    },
  };

  const currentStage = stageConfigs[lifeStage] || stageConfigs.menstrual;

  // Mock transition timeline data
  const transitionData = [
    { month: "Jan", symptoms: 2.1, adaptation: 65, confidence: 68 },
    { month: "Feb", symptoms: 2.8, adaptation: 70, confidence: 72 },
    { month: "Mar", symptoms: 3.2, adaptation: 68, confidence: 70 },
    { month: "Apr", symptoms: 2.9, adaptation: 75, confidence: 78 },
    { month: "May", symptoms: 2.6, adaptation: 80, confidence: 82 },
    { month: "Jun", symptoms: 2.4, adaptation: 85, confidence: 85 },
  ];

  // Life stage radar data
  const stageRadarData = [
    {
      category: "Physical Health",
      menstrual: 85,
      perimenopause: 70,
      menopause: 82,
    },
    {
      category: "Emotional Wellbeing",
      menstrual: 78,
      perimenopause: 65,
      menopause: 88,
    },
    {
      category: "Identity Clarity",
      menstrual: 75,
      perimenopause: 55,
      menopause: 92,
    },
    {
      category: "Life Satisfaction",
      menstrual: 82,
      perimenopause: 68,
      menopause: 89,
    },
    {
      category: "Future Confidence",
      menstrual: 80,
      perimenopause: 60,
      menopause: 85,
    },
  ];

  // Stage-specific insights
  const stageInsights = {
    menstrual: [
      {
        type: "optimization",
        title: "Cycle Sync Opportunities",
        description:
          "Align your life with your natural rhythms for maximum energy and productivity.",
        icon: Target,
        priority: "high",
        actions: [
          "Schedule important meetings during ovulation",
          "Plan rest during menstruation",
          "Track energy patterns",
        ],
      },
      {
        type: "awareness",
        title: "Fertility Window Mastery",
        description:
          "Your tracking shows 94% accuracy in predicting fertile windows.",
        icon: Calendar,
        priority: "medium",
        actions: [
          "Continue consistent tracking",
          "Note cervical mucus changes",
          "Monitor temperature patterns",
        ],
      },
    ],
    perimenopause: [
      {
        type: "adaptation",
        title: "Embracing Unpredictability",
        description:
          "Your body is writing a new chapter. Flexibility becomes your superpower.",
        icon: Sparkles,
        priority: "high",
        actions: [
          "Build flexible routines",
          "Practice self-compassion",
          "Explore new coping strategies",
        ],
      },
      {
        type: "growth",
        title: "Identity Evolution",
        description:
          "This transition offers profound opportunities for personal growth and self-discovery.",
        icon: Brain,
        priority: "high",
        actions: [
          "Reflect on life values",
          "Explore new interests",
          "Connect with other women in transition",
        ],
      },
      {
        type: "preparation",
        title: "Future Health Foundation",
        description:
          "Decisions made now significantly impact your post-menopausal health and vitality.",
        icon: Shield,
        priority: "medium",
        actions: [
          "Strengthen bones with weight training",
          "Optimize cardiovascular health",
          "Maintain social connections",
        ],
      },
    ],
    menopause: [
      {
        type: "celebration",
        title: "Freedom and Wisdom",
        description:
          "You've earned this chapter of liberation from monthly cycles and new self-discovery.",
        icon: Award,
        priority: "high",
        actions: [
          "Celebrate your journey",
          "Share your wisdom",
          "Embrace new adventures",
        ],
      },
      {
        type: "vitality",
        title: "Optimal Aging Strategy",
        description:
          "Your health data shows excellent adaptation to post-menopausal life.",
        icon: Heart,
        priority: "medium",
        actions: [
          "Maintain active lifestyle",
          "Regular health screenings",
          "Mental stimulation activities",
        ],
      },
    ],
  };

  const currentInsights = stageInsights[lifeStage] || stageInsights.menstrual;

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "text-green-600 bg-green-50 border-green-200";
      case "active":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "developing":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Life Stage Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <currentStage.icon
              className="w-8 h-8"
              style={{ color: currentStage.color }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStage.title}
              </h2>
              <p className="text-gray-600">{currentStage.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: currentStage.color }}
            >
              {currentStage.phase}
            </div>
            <div className="text-sm text-gray-600">Current Phase</div>
          </div>
        </div>

        {/* Key Focus Areas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentStage.keyFocus.map((focus, index) => (
            <div key={index} className="bg-white/70 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-900">{focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Selector */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: "overview", label: "Life Stage Overview", icon: Sparkles },
          { id: "milestones", label: "Milestones", icon: Award },
          { id: "insights", label: "Personalized Insights", icon: Lightbulb },
          { id: "growth", label: "Growth Opportunities", icon: TrendingUp },
          { id: "community", label: "Community Connect", icon: Users },
          { id: "celebration", label: "Celebrate Journey", icon: Gift },
        ].map((view) => {
          const IconComponent = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedInsight(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedInsight === view.id
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {selectedInsight === "overview" && (
        <div className="space-y-6">
          {/* Life Stage Comparison */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Growth Journey Timeline
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-16 bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-gray-900">
                    Foundation Building
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Establishing self-awareness and understanding of your life
                    stage patterns
                  </div>
                  <div className="text-xs text-green-600 mt-2">✓ Completed</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-16 bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-gray-900">
                    Active Integration
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Applying insights to daily life and building sustainable
                    practices
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    🔄 In Progress
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
                  <div className="w-0.5 h-16 bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-gray-900">
                    Mastery Development
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Refining approaches and developing expertise in life stage
                    navigation
                  </div>
                  <div className="text-xs text-amber-600 mt-2">
                    ⏳ Next Phase
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Wisdom Sharing
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Supporting others through your experiences and accumulated
                    wisdom
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    🌟 Future Goal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Life Stage Wellness Profile */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Life Stage Wellness Profile
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={stageRadarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis
                    angle={18}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                  />
                  <Radar
                    name="Current Stage"
                    dataKey={lifeStage}
                    stroke={currentStage.color}
                    fill={currentStage.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Your Wellness Strengths
                </h4>
                {stageRadarData
                  .sort((a, b) => b[lifeStage] - a[lifeStage])
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-green-900">
                        {item.category}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {item[lifeStage]}%
                      </span>
                    </div>
                  ))}

                <h4 className="font-medium text-gray-900 mt-6">Growth Areas</h4>
                {stageRadarData
                  .sort((a, b) => a[lifeStage] - b[lifeStage])
                  .slice(0, 2)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-amber-900">
                        {item.category}
                      </span>
                      <span className="text-sm text-amber-600 font-medium">
                        {item[lifeStage]}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Transition Progress (for perimenopause) */}
          {lifeStage === "perimenopause" && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Transition Journey Progress
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transitionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="adaptation"
                    stackId="1"
                    stroke={colors.accent}
                    fill={colors.accent}
                    fillOpacity={0.3}
                    name="Adaptation Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stackId="2"
                    stroke={colors.secondary}
                    fill={colors.secondary}
                    fillOpacity={0.3}
                    name="Confidence Level"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">85%</div>
                  <div className="text-xs text-green-700">
                    Current Adaptation
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">85%</div>
                  <div className="text-xs text-blue-700">Confidence Level</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">6 mo</div>
                  <div className="text-xs text-purple-700">
                    Journey Duration
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specific Growth Recommendations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Personalized Growth Recommendations
            </h3>

            <div className="space-y-4">
              {lifeStage === "menstrual" && (
                <>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-purple-900 mb-1">
                        Cyclical Leadership Development
                      </div>
                      <div className="text-sm text-purple-700">
                        Your strong cycle awareness positions you to become a
                        leader in cyclical living. Consider sharing your
                        insights with other women or exploring cycle-synced
                        productivity methods.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Heart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-900 mb-1">
                        Relationship Optimization
                      </div>
                      <div className="text-sm text-green-700">
                        Use your cycle awareness to deepen intimate
                        relationships. Share your patterns with your partner to
                        create more understanding and supportive interactions.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {lifeStage === "perimenopause" && (
                <>
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Brain className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-orange-900 mb-1">
                        Identity Exploration Workshop
                      </div>
                      <div className="text-sm text-orange-700">
                        This transition offers a unique opportunity to
                        rediscover who you are beyond your reproductive years.
                        Consider working with a coach or therapist who
                        specializes in midlife transitions.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1">
                        Sisterhood Connection
                      </div>
                      <div className="text-sm text-blue-700">
                        Connect with other women going through perimenopause.
                        Shared experiences provide validation, support, and
                        practical wisdom that's invaluable during this
                        transition.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-purple-900 mb-1">
                        Creative Renaissance
                      </div>
                      <div className="text-sm text-purple-700">
                        Many women experience increased creativity during
                        perimenopause. Explore new artistic pursuits, writing,
                        or other creative outlets that call to you.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {lifeStage === "menopause" && (
                <>
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Award className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">
                        Wisdom Mentorship
                      </div>
                      <div className="text-sm text-amber-700">
                        Your journey has given you valuable wisdom. Consider
                        mentoring younger women, writing about your experiences,
                        or becoming a voice for women's health advocacy.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-900 mb-1">
                        Energy Redirection Project
                      </div>
                      <div className="text-sm text-green-700">
                        With freedom from monthly cycles, you can channel your
                        energy toward long-term projects, travel, learning new
                        skills, or causes that matter deeply to you.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <BookOpen className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-purple-900 mb-1">
                        Legacy Building
                      </div>
                      <div className="text-sm text-purple-700">
                        Consider what legacy you want to leave. This might
                        involve family history documentation, community
                        involvement, or creating something that will outlast
                        your lifetime.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {selectedInsight === "milestones" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Life Stage Milestones
            </h3>

            <div className="space-y-4">
              {currentStage.milestones.map((milestone, index) => {
                const statusClass = getStatusColor(milestone.status);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${statusClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{milestone.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {milestone.confidence}%
                        </span>
                        <span className="text-xs uppercase tracking-wide">
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${milestone.confidence}%`,
                          backgroundColor:
                            milestone.status === "complete"
                              ? colors.accent
                              : milestone.status === "active"
                              ? colors.primary
                              : colors.warning,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Tracking */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Growth Tracking Dashboard
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(
                    currentStage.milestones.reduce(
                      (sum, m) => sum + m.confidence,
                      0
                    ) / currentStage.milestones.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        currentStage.milestones.reduce(
                          (sum, m) => sum + m.confidence,
                          0
                        ) / currentStage.milestones.length
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {
                    currentStage.milestones.filter((m) => m.status === "active")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Active Goals</div>
                <div className="text-xs text-blue-600 mt-1">Areas of focus</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {
                    currentStage.milestones.filter(
                      (m) => m.status === "complete"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">
                  Completed Milestones
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Achievements unlocked
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Insights */}
      {selectedInsight === "insights" && (
        <div className="space-y-6">
          {currentInsights.map((insight, index) => {
            const IconComponent = insight.icon;
            const priorityClass = getPriorityColor(insight.priority);

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${priorityClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {insight.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${priorityClass}`}
                      >
                        {insight.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{insight.description}</p>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Recommended Actions:
                      </h5>
                      <div className="space-y-2">
                        {insight.actions.map((action, actionIndex) => (
                          <div
                            key={actionIndex}
                            className="flex items-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Growth Opportunities */}
      {selectedInsight === "growth" && (
        <div className="space-y-6">
          {/* Growth Potential Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Growth Potential Areas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Personal Development
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Self-Awareness</span>
                    <span className="text-sm text-purple-600 font-medium">
                      High Potential
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Emotional Intelligence
                    </span>
                    <span className="text-sm text-blue-600 font-medium">
                      Growing
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Resilience</span>
                    <span className="text-sm text-green-600 font-medium">
                      Strengthening
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Life Integration
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Work-Life Balance
                    </span>
                    <span className="text-sm text-amber-600 font-medium">
                      Optimizing
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Relationship Depth
                    </span>
                    <span className="text-sm text-pink-600 font-medium">
                      Evolving
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm font-medium">Purpose Clarity</span>
                    <span className="text-sm text-indigo-600 font-medium">
                      Emerging
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Life Stage Community */}
      {selectedInsight === "community" && (
        <div className="space-y-6">
          {/* Community Overview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Connect with Your Community
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-pink-600" />
                  <h4 className="font-medium text-gray-900">
                    Women in Similar Stages
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Connect with other women experiencing similar life stage
                    transitions for support, shared experiences, and mutual
                    encouragement.
                  </p>
                </p>
                <button
                  onClick={() => setShowCommunityModal(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                >
                  Find Your Community
                </button>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h4 className="font-medium text-gray-900">
                    Expert Resources
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Access curated content from women's health experts, life
                  coaches, and specialists who understand your unique life stage
                  challenges.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Browse Resources
                </button>
              </div>
            </div>
          </div>

          {/* Community Features */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Community Features
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <MessageCircle className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Discussion Groups
                </h4>
                <p className="text-sm text-gray-600">
                  Join themed discussions about your life stage challenges and
                  victories
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <Coffee className="w-8 h-8 text-amber-600 mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Virtual Meetups
                </h4>
                <p className="text-sm text-gray-600">
                  Attend live sessions with other women and health experts
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <Share2 className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Story Sharing
                </h4>
                <p className="text-sm text-gray-600">
                  Share your journey and learn from others' experiences
                </p>
              </div>
            </div>
          </div>

          {/* Peer Support */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Peer Support Network
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <Heart className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Find Your Support Circle
                  </div>
                  <div className="text-sm text-green-700">
                    Connect with women who understand your journey. Our matching
                    system pairs you with others at similar life stages for
                    ongoing support and friendship.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-900 mb-1">
                    Wisdom Exchange
                  </div>
                  <div className="text-sm text-blue-700">
                    Share practical tips, coping strategies, and life hacks that
                    have worked for you. Learn from the collective wisdom of
                    thousands of women.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Star className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-purple-900 mb-1">
                    Mentorship Opportunities
                  </div>
                  <div className="text-sm text-purple-700">
                    Whether you're seeking guidance or ready to mentor others,
                    our platform connects women across different life stages for
                    mutual learning.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration & Recognition */}
      {selectedInsight === "celebration" && (
        <div className="space-y-6">
          {/* Celebration Overview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Celebrate Your Journey
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <Award className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-amber-900 mb-1">
                    Acknowledge Your Growth
                  </div>
                  <div className="text-sm text-amber-700">
                    Take time to recognize how far you've come in understanding
                    and working with your body's natural rhythms. Every insight
                    gained and pattern recognized is an achievement worth
                    celebrating.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Heart className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900 mb-1">
                    Honor Your Body's Wisdom
                  </div>
                  <div className="text-sm text-green-700">
                    Your body holds incredible wisdom about health, healing, and
                    natural cycles. Trust the insights you're gaining and honor
                    the journey your body is taking you on.
                  </div>
                </div>
              </div>

              {lifeStage === "menopause" && (
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                  <Crown className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-purple-900 mb-1">
                      {currentStage.celebration}
                    </div>
                    <div className="text-sm text-purple-700">
                      You've reached a remarkable milestone - freedom from
                      monthly cycles opens up new possibilities. This is your
                      time to explore, create, and live fully without the
                      constraints of reproductive years.
                    </div>
                    <button
                      onClick={() => setShowCelebrationModal(true)}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Celebrate This Milestone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Your Achievement Badges
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-b from-gold-50 to-amber-50 rounded-lg border border-amber-200">
                <Flower2 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-amber-900">
                  Cycle Awareness
                </div>
                <div className="text-xs text-amber-700">Master</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-900">
                  Pattern Recognition
                </div>
                <div className="text-xs text-green-700">Expert</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-sky-50 rounded-lg border border-blue-200">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-blue-900">
                  Self-Awareness
                </div>
                <div className="text-xs text-blue-700">Advanced</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-purple-900">
                  Life Stage Pioneer
                </div>
                <div className="text-xs text-purple-700">Growing</div>
              </div>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Milestone Timeline
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-green-900">
                    Tracking Consistency Achieved
                  </div>
                  <div className="text-sm text-green-700">
                    30 days of consistent health tracking
                  </div>
                </div>
                <div className="text-xs text-green-600">Completed</div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-blue-900">
                    Pattern Recognition
                  </div>
                  <div className="text-sm text-blue-700">
                    Identified key personal health patterns
                  </div>
                </div>
                <div className="text-xs text-blue-600">In Progress</div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Target className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-amber-900">
                    Life Stage Mastery
                  </div>
                  <div className="text-sm text-amber-700">
                    Complete understanding of your life stage
                  </div>
                </div>
                <div className="text-xs text-amber-600">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Modal */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Join Your Community
              </h3>
              <button
                onClick={() => setShowCommunityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Connect with women in the {currentStage.title.toLowerCase()}{" "}
                  stage and build supportive relationships
                </p>
              </div>

              <div className="space-y-3">
                <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Join Discussion Groups
                </button>
                <button className="w-full p-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  Find a Support Partner
                </button>
                <button className="w-full p-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  Browse Expert Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Celebrate Your Journey!
              </h3>
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-center">
              <Crown className="w-16 h-16 text-purple-600 mx-auto" />
              <h4 className="text-xl font-bold text-purple-900">
                {currentStage.celebration}
              </h4>
              <p className="text-gray-600">
                You've reached an incredible milestone in your health journey.
                This achievement deserves recognition!
              </p>

              <div className="space-y-3">
                <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Share Your Achievement
                </button>
                <button className="w-full p-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  Save to Memory Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeStageInsightsTab;
