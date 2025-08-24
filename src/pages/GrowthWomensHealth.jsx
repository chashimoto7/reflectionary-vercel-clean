//frontend/ src/pages/GrowthWomensHealth.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Heart,
  Moon,
  Activity,
  TrendingUp,
  Calendar,
  BookOpen,
  ChevronRight,
  Info,
  Circle,
  CheckCircle,
  Thermometer,
  Shield,
  Brain,
  Sparkles,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GrowthWomensHealth = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cycle");
  const [lifeStage, setLifeStage] = useState("menstrual");
  const [cycleData, setCycleData] = useState({});
  const [symptoms, setSymptoms] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showLifeStageModal, setShowLifeStageModal] = useState(false);

  const colors = {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#06B6D4",
    warning: "#F59E0B",
    success: "#10B981",
  };

  // Date utility functions
  const formatDate = (date, formatStr) => {
    const d = new Date(date);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    switch (formatStr) {
      case "MMM d":
        return `${months[d.getMonth()]} ${d.getDate()}`;
      default:
        return d.toISOString();
    }
  };

  const subDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const differenceInDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const endOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  // Life stage information
  const lifeStages = {
    menstrual: {
      label: "Menstrual Years",
      description: "Regular menstrual cycles",
      ageRange: "Typically 12-45 years",
      keyFeatures: ["Cycle tracking", "Fertility awareness", "PMS management"],
    },
    perimenopause: {
      label: "Perimenopause",
      description: "Transition to menopause",
      ageRange: "Typically 40-50 years",
      keyFeatures: ["Irregular cycles", "Symptom tracking", "Hormone changes"],
    },
    menopause: {
      label: "Menopause & Beyond",
      description: "Post-menopausal years",
      ageRange: "Typically 50+ years",
      keyFeatures: ["Symptom management", "Bone health", "Heart health"],
    },
  };

  // Educational topics
  const educationalTopics = {
    menstrual: [
      {
        id: "cycle-basics",
        title: "Understanding Your Cycle",
        content: "Learn about the four phases of your menstrual cycle...",
      },
      {
        id: "nutrition",
        title: "Nutrition for Each Phase",
        content: "Optimize your diet throughout your cycle...",
      },
      {
        id: "exercise",
        title: "Exercise & Your Cycle",
        content: "How to adapt your workouts to your cycle...",
      },
      {
        id: "hormones",
        title: "Hormones 101",
        content: "Understanding estrogen, progesterone, and more...",
      },
    ],
    perimenopause: [
      {
        id: "what-is-peri",
        title: "What is Perimenopause?",
        content: "Understanding the transition years...",
      },
      {
        id: "symptoms",
        title: "Common Symptoms",
        content: "What to expect during perimenopause...",
      },
      {
        id: "management",
        title: "Symptom Management",
        content: "Natural and medical approaches...",
      },
      {
        id: "self-care",
        title: "Self-Care Strategies",
        content: "Supporting yourself through the transition...",
      },
    ],
    menopause: [
      {
        id: "menopause-basics",
        title: "Menopause Explained",
        content: "What happens during and after menopause...",
      },
      {
        id: "bone-health",
        title: "Protecting Bone Health",
        content: "Preventing osteoporosis naturally...",
      },
      {
        id: "heart-health",
        title: "Heart Health After 50",
        content: "Cardiovascular care in menopause...",
      },
      {
        id: "staying-active",
        title: "Staying Active",
        content: "Exercise for strength and vitality...",
      },
    ],
  };

  // Common symptoms by life stage
  const symptomOptions = {
    menstrual: [
      "Cramps",
      "Bloating",
      "Mood swings",
      "Headache",
      "Fatigue",
      "Breast tenderness",
      "Acne",
      "Food cravings",
      "Back pain",
    ],
    perimenopause: [
      "Hot flashes",
      "Night sweats",
      "Irregular periods",
      "Mood changes",
      "Sleep issues",
      "Brain fog",
      "Weight changes",
      "Anxiety",
      "Fatigue",
    ],
    menopause: [
      "Hot flashes",
      "Night sweats",
      "Mood changes",
      "Sleep issues",
      "Joint pain",
      "Dry skin",
      "Memory issues",
      "Weight changes",
      "Fatigue",
    ],
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, lifeStage]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user's life stage preference
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("life_stage")
        .eq("user_id", user.id)
        .single();

      if (profile?.life_stage) {
        setLifeStage(profile.life_stage);
      }

      // Load cycle/health data
      await loadHealthData();
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthData = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 90); // Last 3 months

      const { data, error } = await supabase
        .from("womens_health_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString())
        .order("date", { ascending: true });

      if (error) throw error;

      processCycleData(data || []);
    } catch (error) {
      console.error("Error loading health data:", error);
    }
  };

  const processCycleData = (logs) => {
    const processed = {
      currentCycle: null,
      averageCycleLength: 28,
      phases: [],
      symptoms: {},
      trends: [],
    };

    // Process logs based on life stage
    if (lifeStage === "menstrual") {
      // Calculate current cycle day and phases
      const periodStarts = logs.filter(
        (log) => log.flow_type === "heavy" || log.flow_type === "medium"
      );
      if (periodStarts.length > 0) {
        const lastPeriod = new Date(periodStarts[periodStarts.length - 1].date);
        const daysSinceLastPeriod = differenceInDays(new Date(), lastPeriod);
        processed.currentCycle = {
          day: daysSinceLastPeriod + 1,
          phase: getCyclePhase(daysSinceLastPeriod + 1),
        };
      }

      // Calculate average cycle length
      if (periodStarts.length > 1) {
        const cycleLengths = [];
        for (let i = 1; i < periodStarts.length; i++) {
          const length = differenceInDays(
            new Date(periodStarts[i].date),
            new Date(periodStarts[i - 1].date)
          );
          cycleLengths.push(length);
        }
        processed.averageCycleLength = Math.round(
          cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
        );
      }
    }

    // Process symptoms
    logs.forEach((log) => {
      if (log.symptoms) {
        log.symptoms.forEach((symptom) => {
          if (!processed.symptoms[symptom]) {
            processed.symptoms[symptom] = 0;
          }
          processed.symptoms[symptom]++;
        });
      }
    });

    // Create trend data
    processed.trends = logs.map((log) => ({
      date: formatDate(new Date(log.date), "MMM d"),
      mood: log.mood || 0,
      energy: log.energy || 0,
      symptoms: log.symptoms?.length || 0,
    }));

    setCycleData(processed);
  };

  const getCyclePhase = (cycleDay) => {
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 17) return "Ovulation";
    return "Luteal";
  };

  const updateLifeStage = async (newStage) => {
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        life_stage: newStage,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setLifeStage(newStage);
      setShowLifeStageModal(false);
      loadHealthData(); // Reload data for new life stage
    } catch (error) {
      console.error("Error updating life stage:", error);
    }
  };

  const logHealthData = async (data) => {
    try {
      const { error } = await supabase.from("womens_health_logs").insert({
        user_id: user.id,
        date: new Date().toISOString(),
        ...data,
      });

      if (error) throw error;
      loadHealthData(); // Reload to show new data
    } catch (error) {
      console.error("Error logging health data:", error);
    }
  };

  const CycleTrackingTab = () => (
    <div className="space-y-6">
      {/* Current Status */}
      {lifeStage === "menstrual" && cycleData.currentCycle && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Day {cycleData.currentCycle.day} -{" "}
                {cycleData.currentCycle.phase} Phase
              </h3>
              <p className="opacity-90">
                Average cycle length: {cycleData.averageCycleLength} days
              </p>
            </div>
            <div className="text-right">
              <Circle className="h-12 w-12 mb-2" />
              <p className="text-sm opacity-90">Cycle tracking</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Log */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Log</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => logHealthData({ flow_type: "heavy" })}
            className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300"
          >
            <div className="text-red-500 font-bold mb-1">●●●</div>
            <span className="text-sm">Heavy Flow</span>
          </button>
          <button
            onClick={() => logHealthData({ flow_type: "medium" })}
            className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300"
          >
            <div className="text-red-400 font-bold mb-1">●●</div>
            <span className="text-sm">Medium Flow</span>
          </button>
          <button
            onClick={() => logHealthData({ flow_type: "light" })}
            className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300"
          >
            <div className="text-red-300 font-bold mb-1">●</div>
            <span className="text-sm">Light Flow</span>
          </button>
          <button
            onClick={() => logHealthData({ flow_type: "spotting" })}
            className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300"
          >
            <div className="text-pink-300 font-bold mb-1">·</div>
            <span className="text-sm">Spotting</span>
          </button>
        </div>
      </div>

      {/* Symptom Tracking */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Track Symptoms</h3>
        <div className="flex flex-wrap gap-2">
          {symptomOptions[lifeStage].map((symptom) => (
            <button
              key={symptom}
              onClick={() => {
                const newSymptoms = symptoms.includes(symptom)
                  ? symptoms.filter((s) => s !== symptom)
                  : [...symptoms, symptom];
                setSymptoms(newSymptoms);
                logHealthData({ symptoms: newSymptoms });
              }}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                symptoms.includes(symptom)
                  ? "bg-purple-600 text-white"
                  : "bg-white/20 text-purple-300 hover:bg-white/30"
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Insights */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Your Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(cycleData.symptoms || {}).length}
            </div>
            <p className="text-sm text-purple-300 mt-1">Symptoms tracked</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-3xl font-bold text-pink-600">
              {cycleData.trends?.length || 0}
            </div>
            <p className="text-sm text-purple-300 mt-1">Days logged</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(((cycleData.trends?.length || 0) / 90) * 100)}%
            </div>
            <p className="text-sm text-purple-300 mt-1">Consistency</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-6">
      {/* Mood & Energy Trends */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Mood & Energy Patterns</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cycleData.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={colors.secondary}
                name="Mood"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke={colors.warning}
                name="Energy"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptom Frequency */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Common Symptoms</h3>
        {Object.keys(cycleData.symptoms || {}).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(cycleData.symptoms)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([symptom, count]) => (
                <div
                  key={symptom}
                  className="flex items-center justify-between"
                >
                  <span className="text-white">{symptom}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (count /
                              Math.max(...Object.values(cycleData.symptoms))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-purple-300 w-8">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-purple-400 text-center py-8">
            Start tracking symptoms to see patterns
          </p>
        )}
      </div>

      {/* Life Stage Insights */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {lifeStages[lifeStage].label} Insights
        </h3>
        <div className="space-y-3">
          {lifeStage === "menstrual" && (
            <>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  Track your cycle consistently to understand your unique
                  patterns
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-800">
                  Notice how symptoms vary throughout your cycle phases
                </p>
              </div>
            </>
          )}
          {lifeStage === "perimenopause" && (
            <>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  Irregular cycles are normal during perimenopause
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Track new symptoms to discuss with your healthcare provider
                </p>
              </div>
            </>
          )}
          {lifeStage === "menopause" && (
            <>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Focus on symptom management and overall wellness
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  Regular tracking helps monitor health changes
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const EducationTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">
          Educational Resources - {lifeStages[lifeStage].label}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationalTopics[lifeStage].map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-purple-300">
                    {topic.content.substring(0, 50)}...
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-purple-400 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Life Stage Guide */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Your Life Stage Guide</h3>
        <div className="space-y-3">
          <p className="text-purple-100">{lifeStages[lifeStage].description}</p>
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Clock className="h-4 w-4" />
            <span>{lifeStages[lifeStage].ageRange}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-purple-200 mb-2">
              Key features for this stage:
            </p>
            <ul className="space-y-1">
              {lifeStages[lifeStage].keyFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-purple-300"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Learn More</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-between group">
            <span className="text-purple-700">
              Understanding hormonal changes
            </span>
            <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full text-left p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors flex items-center justify-between group">
            <span className="text-pink-700">Nutrition for women's health</span>
            <ArrowRight className="h-4 w-4 text-pink-600 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between group">
            <span className="text-blue-700">Exercise through life stages</span>
            <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  // Life Stage Modal
  const LifeStageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Choose Your Life Stage</h3>
          <button
            onClick={() => setShowLifeStageModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(lifeStages).map(([key, stage]) => (
            <button
              key={key}
              onClick={() => updateLifeStage(key)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                lifeStage === key
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h4 className="font-medium text-white mb-1">{stage.label}</h4>
              <p className="text-sm text-purple-300 mb-2">{stage.description}</p>
              <p className="text-xs text-purple-400">{stage.ageRange}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <Info className="h-4 w-4 inline mr-1" />
            You can change your life stage anytime as your needs evolve
          </p>
        </div>
      </div>
    </div>
  );

  // Topic Detail Modal
  const TopicDetailModal = () => {
    if (!selectedTopic) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{selectedTopic.title}</h3>
            <button
              onClick={() => setSelectedTopic(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="prose max-w-none">
            <p className="text-purple-100">{selectedTopic.content}</p>
            {/* This would be expanded with full educational content */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                This is a preview. Full educational content would include
                detailed information, scientific backing, and practical tips for
                this topic.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedTopic(null)}
            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                Growth Women's Health
              </h1>
              <p className="text-purple-300">
                Track, understand, and optimize your health
              </p>
            </div>
            <button
              onClick={() => setShowLifeStageModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              {lifeStages[lifeStage].label}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-1 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("cycle")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === "cycle"
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-white/10"
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Cycle Tracking
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === "trends"
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-white/10"
              }`}
            >
              <TrendingUp className="h-5 w-5 inline mr-2" />
              Trends
            </button>
            <button
              onClick={() => setActiveTab("education")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === "education"
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-white/10"
              }`}
            >
              <BookOpen className="h-5 w-5 inline mr-2" />
              Education
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "cycle" && <CycleTrackingTab />}
        {activeTab === "trends" && <TrendsTab />}
        {activeTab === "education" && <EducationTab />}

        {/* Modals */}
        {showLifeStageModal && <LifeStageModal />}
        {selectedTopic && <TopicDetailModal />}
      </div>
    </div>
  );
};

export default GrowthWomensHealth;
