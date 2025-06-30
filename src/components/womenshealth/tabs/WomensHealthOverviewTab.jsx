// src/components/womenshealth/tabs/WomensHealthOverviewTab.jsx
import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Brain,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  Droplets,
  Moon,
  Sun,
  Flower2,
  Thermometer,
  Zap,
  Users,
  BookOpen,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const WomensHealthOverviewTab = ({ colors, user, lifeStage, onOpenEntry }) => {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(78);
  const [recentData, setRecentData] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [symptoms, setSymptoms] = useState({
    today: [],
    trending: [],
  });
  const [cycleInfo, setCycleInfo] = useState({
    day: 14,
    phase: "ovulation",
    nextPeriod: 14,
    cycleLength: 28,
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      loadDashboardData();
      setLoading(false);
    }, 1000);
  }, [lifeStage]);

  const loadDashboardData = () => {
    // Simulated data - will be replaced with actual database calls
    setRecentData(generateMockRecentData());
    setPredictions(generateMockPredictions());
    setSymptoms({
      today: ["mild cramps", "fatigue", "mood swings"],
      trending: [
        { name: "fatigue", trend: "up", severity: 3 },
        { name: "hot flashes", trend: "down", severity: 2 },
        { name: "mood swings", trend: "stable", severity: 2 },
      ],
    });
  };

  const generateMockRecentData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      data.push({
        date: format(addDays(new Date(), -i), "MMM d"),
        healthScore: Math.floor(Math.random() * 20) + 70,
        symptoms: Math.floor(Math.random() * 5),
        mood: Math.floor(Math.random() * 3) + 3,
      });
    }
    return data;
  };

  const generateMockPredictions = () => {
    switch (lifeStage) {
      case "menstrual":
        return {
          nextPeriod: { days: 14, confidence: 85 },
          fertileWindow: { start: 3, end: 7, confidence: 75 },
          pmsStart: { days: 10, confidence: 80 },
        };
      case "perimenopause":
        return {
          nextPeriod: { days: "18-25", confidence: 60 },
          symptomPeak: { days: 5, type: "hot flashes", confidence: 70 },
          cycleVariability: "high",
        };
      case "menopause":
        return {
          symptomPattern: "decreasing",
          nextFlareUp: { days: 3, confidence: 65 },
          wellnessTrend: "improving",
        };
      default:
        return {};
    }
  };

  const getCyclePhaseInfo = () => {
    if (lifeStage === "menopause") return null;

    const phases = {
      menstrual: {
        name: "Menstruation",
        icon: Droplets,
        color: "text-red-400",
      },
      follicular: { name: "Follicular", icon: Flower2, color: "text-pink-400" },
      ovulation: { name: "Ovulation", icon: Sun, color: "text-yellow-400" },
      luteal: { name: "Luteal", icon: Moon, color: "text-purple-400" },
    };

    return phases[cycleInfo.phase] || phases.follicular;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-red-400" />;
      case "down":
        return <ArrowDown className="w-4 h-4 text-green-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading your health overview...</p>
      </div>
    );
  }

  const phaseInfo = getCyclePhaseInfo();

  return (
    <div className="p-6 space-y-6">
      {/* Health Score & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Health Score</h3>
            <Heart className="w-6 h-6 text-pink-300" />
          </div>

          <div className="relative h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[{ value: healthScore, fill: colors.primary }]}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={colors.primary}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {healthScore}
              </span>
              <span className="text-sm text-purple-200">out of 100</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">Yesterday</span>
              <span className="text-white">75</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">7-day avg</span>
              <span className="text-white">73</span>
            </div>
          </div>
        </div>

        {/* Cycle/Stage Info Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {lifeStage === "menopause" ? "Stage Info" : "Cycle Status"}
            </h3>
            {lifeStage === "menopause" ? (
              <Flower2 className="w-6 h-6 text-pink-300" />
            ) : (
              phaseInfo && (
                <phaseInfo.icon className={`w-6 h-6 ${phaseInfo.color}`} />
              )
            )}
          </div>

          {lifeStage === "menopause" ? (
            <div className="space-y-4">
              <div>
                <p className="text-purple-200 text-sm mb-1">
                  Time in Menopause
                </p>
                <p className="text-2xl font-bold text-white">18 months</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Symptom Trend</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  Improving
                  <ArrowDown className="w-5 h-5 text-green-400" />
                </p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Last Flare-up</p>
                <p className="text-lg text-white">5 days ago</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-purple-200 text-sm mb-1">Current Phase</p>
                <p className="text-2xl font-bold text-white">
                  {phaseInfo?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Cycle Day</p>
                  <p className="text-lg font-semibold text-white">
                    {cycleInfo.day}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Cycle Length</p>
                  <p className="text-lg font-semibold text-white">
                    {cycleInfo.cycleLength} days
                  </p>
                </div>
              </div>
              {lifeStage === "perimenopause" && (
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-xs text-purple-200 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Cycle variability: High
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Predictions Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Predictions</h3>
            <Brain className="w-6 h-6 text-pink-300" />
          </div>

          <div className="space-y-3">
            {lifeStage === "menstrual" && (
              <>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">Next Period</span>
                    <span className="text-xs text-purple-300">
                      {predictions.nextPeriod.confidence}% sure
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    In {predictions.nextPeriod.days} days
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">
                      Fertile Window
                    </span>
                    <span className="text-xs text-purple-300">
                      {predictions.fertileWindow.confidence}% sure
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    Days {predictions.fertileWindow.start}-
                    {predictions.fertileWindow.end}
                  </p>
                </div>
              </>
            )}

            {lifeStage === "perimenopause" && (
              <>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">Next Period</span>
                    <span className="text-xs text-purple-300">
                      {predictions.nextPeriod.confidence}% sure
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    In {predictions.nextPeriod.days} days
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">
                      Symptom Peak
                    </span>
                    <span className="text-xs text-purple-300">
                      {predictions.symptomPeak.confidence}% sure
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {predictions.symptomPeak.type} in{" "}
                    {predictions.symptomPeak.days} days
                  </p>
                </div>
              </>
            )}

            {lifeStage === "menopause" && (
              <>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">
                      Symptom Pattern
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white capitalize">
                    {predictions.symptomPattern}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-purple-200">
                      Wellness Trend
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                    {predictions.wellnessTrend}
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Trends</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-purple-200">Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
              <span className="text-purple-200">Symptoms</span>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
              <YAxis stroke="#fff" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(139, 92, 246, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="healthScore"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="symptoms"
                stroke={colors.secondary}
                strokeWidth={3}
                dot={{ fill: colors.secondary, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptoms & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Symptoms */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Today's Symptoms
            </h3>
            <Activity className="w-5 h-5 text-pink-300" />
          </div>

          {symptoms.today.length > 0 ? (
            <div className="space-y-2">
              {symptoms.today.map((symptom, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg px-4 py-2 text-white capitalize"
                >
                  {symptom}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-purple-200 mb-4">No symptoms tracked today</p>
              <button
                onClick={onOpenEntry}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Track Symptoms
              </button>
            </div>
          )}
        </div>

        {/* Trending Symptoms */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Symptom Trends</h3>
            <TrendingUp className="w-5 h-5 text-pink-300" />
          </div>

          <div className="space-y-3">
            {symptoms.trending.map((symptom, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white capitalize">{symptom.name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < symptom.severity ? "bg-pink-400" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {getTrendIcon(symptom.trend)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onOpenEntry}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <span className="font-medium">Track Today</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-xl hover:bg-white/20 transition-all flex items-center justify-between group border border-white/20">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <span className="font-medium">Health Library</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-xl hover:bg-white/20 transition-all flex items-center justify-between group border border-white/20">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <span className="font-medium">Community</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Educational Tip */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600/30 rounded-full p-3">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">
              Did You Know?
            </h4>
            <p className="text-purple-200">
              {lifeStage === "menstrual" &&
                "During ovulation, your body temperature rises slightly due to increased progesterone. Tracking this can help predict your fertile window more accurately."}
              {lifeStage === "perimenopause" &&
                "Perimenopause can last anywhere from a few months to 10 years. Tracking your symptoms helps identify patterns and manage this transition more effectively."}
              {lifeStage === "menopause" &&
                "Regular exercise has been shown to reduce the frequency and severity of hot flashes by up to 50%. Even light activities like walking can make a difference."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensHealthOverviewTab;
