// frontned/ src/components/womenshealth/tabs/SymptomAnalyticsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Brain,
  Heart,
  Thermometer,
  Droplets,
  Moon,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Plus,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  Zap,
  Wind,
  Coffee,
  Pizza,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Legend,
} from "recharts";

const SymptomAnalyticsTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Symptom data
  const [symptomData, setSymptomData] = useState({
    recent: [],
    frequency: {},
    severity: {},
    patterns: {},
    correlations: {},
    triggers: [],
  });

  // Symptom categories with icons
  const symptomCategories = {
    physical: {
      name: "Physical",
      icon: Activity,
      color: colors.primary,
      symptoms: [
        "Cramps",
        "Headache",
        "Back pain",
        "Breast tenderness",
        "Bloating",
        "Nausea",
        "Dizziness",
        "Joint pain",
        "Muscle aches",
        "Fatigue",
      ],
    },
    hormonal: {
      name: "Hormonal",
      icon: Thermometer,
      color: colors.secondary,
      symptoms: [
        "Hot flashes",
        "Night sweats",
        "Mood swings",
        "Irritability",
        "Anxiety",
        "Depression",
        "Low libido",
        "Vaginal dryness",
        "Weight gain",
        "Hair changes",
      ],
    },
    cognitive: {
      name: "Cognitive",
      icon: Brain,
      color: colors.accent,
      symptoms: [
        "Brain fog",
        "Memory issues",
        "Concentration difficulty",
        "Confusion",
        "Word finding issues",
        "Mental fatigue",
      ],
    },
    sleep: {
      name: "Sleep",
      icon: Moon,
      color: colors.warning,
      symptoms: [
        "Insomnia",
        "Frequent waking",
        "Early waking",
        "Restless sleep",
        "Vivid dreams",
        "Sleep apnea",
        "Restless legs",
      ],
    },
    digestive: {
      name: "Digestive",
      icon: Coffee,
      color: colors.emerald,
      symptoms: [
        "Constipation",
        "Diarrhea",
        "Gas",
        "Stomach pain",
        "Acid reflux",
        "Food sensitivity",
        "Appetite changes",
      ],
    },
  };

  useEffect(() => {
    loadSymptomData();
    setTimeout(() => setLoading(false), 1000);
  }, [selectedTimeRange, lifeStage]);

  const loadSymptomData = () => {
    // Mock data - will be replaced with database calls
    setSymptomData({
      recent: generateRecentSymptoms(),
      frequency: generateFrequencyData(),
      severity: generateSeverityData(),
      patterns: generatePatternData(),
      correlations: generateCorrelationData(),
      triggers: generateTriggerData(),
    });
  };

  const generateRecentSymptoms = () => {
    const symptoms = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      symptoms.push({
        date: date,
        symptoms: [
          {
            name: "Hot flashes",
            severity: Math.floor(Math.random() * 5) + 1,
            count: Math.floor(Math.random() * 8) + 1,
          },
          {
            name: "Mood swings",
            severity: Math.floor(Math.random() * 5) + 1,
          },
          {
            name: "Fatigue",
            severity: Math.floor(Math.random() * 5) + 1,
          },
        ],
      });
    }
    return symptoms;
  };

  const generateFrequencyData = () => {
    const topSymptoms =
      lifeStage === "menopause"
        ? [
            "Hot flashes",
            "Night sweats",
            "Mood swings",
            "Joint pain",
            "Fatigue",
          ]
        : ["Cramps", "Mood swings", "Bloating", "Headache", "Fatigue"];

    return topSymptoms.map((symptom) => ({
      symptom,
      count: Math.floor(Math.random() * 20) + 5,
      trend: Math.random() > 0.5 ? "up" : "down",
    }));
  };

  const generateSeverityData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      data.push({
        date: format(subDays(new Date(), i), "MMM d"),
        mild: Math.floor(Math.random() * 3) + 1,
        moderate: Math.floor(Math.random() * 3) + 1,
        severe: Math.floor(Math.random() * 2),
      });
    }
    return data;
  };

  const generatePatternData = () => {
    return {
      timeOfDay: [
        { time: "Morning", frequency: 30 },
        { time: "Afternoon", frequency: 45 },
        { time: "Evening", frequency: 60 },
        { time: "Night", frequency: 80 },
      ],
      cyclePhase:
        lifeStage !== "menopause"
          ? [
              { phase: "Menstrual", frequency: 70 },
              { phase: "Follicular", frequency: 30 },
              { phase: "Ovulation", frequency: 40 },
              { phase: "Luteal", frequency: 85 },
            ]
          : null,
    };
  };

  const generateCorrelationData = () => {
    return [
      { factor: "Stress", impact: 85 },
      { factor: "Sleep", impact: 75 },
      { factor: "Exercise", impact: -60 },
      { factor: "Diet", impact: 50 },
      { factor: "Hydration", impact: -40 },
      { factor: "Weather", impact: 30 },
    ];
  };

  const generateTriggerData = () => {
    return [
      { trigger: "Caffeine", occurrences: 15, severity: 3.5 },
      { trigger: "Alcohol", occurrences: 12, severity: 4.2 },
      { trigger: "Spicy food", occurrences: 8, severity: 3.0 },
      { trigger: "Stress", occurrences: 20, severity: 4.5 },
      { trigger: "Poor sleep", occurrences: 18, severity: 4.0 },
    ];
  };

  const getFilteredSymptoms = () => {
    if (selectedCategory === "all") {
      return Object.values(symptomCategories).flatMap((cat) => cat.symptoms);
    }
    return symptomCategories[selectedCategory]?.symptoms || [];
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return <ArrowUp className="w-4 h-4 text-red-400" />;
    if (trend === "down")
      return <ArrowDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Analyzing your symptoms...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-white">
            Symptom Analytics
          </h3>
          <div className="flex gap-2">
            {["week", "month", "3months", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTimeRange === range
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                {range === "3months"
                  ? "3 Months"
                  : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>
          <button
            onClick={() => setShowAddSymptom(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Symptom
          </button>
        </div>
      </div>

      {/* Top Symptoms Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Most Frequent Symptoms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {symptomData.frequency.map((item, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-200">{item.symptom}</span>
                {getTrendIcon(item.trend)}
              </div>
              <div className="text-2xl font-bold text-white">{item.count}x</div>
              <div className="text-xs text-purple-300">
                this {selectedTimeRange}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Severity Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={symptomData.severity}>
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
                <Area
                  type="monotone"
                  dataKey="severe"
                  stackId="1"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="moderate"
                  stackId="1"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="mild"
                  stackId="1"
                  stroke={colors.emerald}
                  fill={colors.emerald}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-purple-200">Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-purple-200">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-purple-200">Severe</span>
            </div>
          </div>
        </div>

        {/* Time Pattern Analysis */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Time Patterns
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData.patterns.timeOfDay}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="time" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(139, 92, 246, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="frequency" radius={[8, 8, 0, 0]}>
                  {symptomData.patterns.timeOfDay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 3 ? colors.danger : colors.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm text-purple-200">
              <Info className="w-4 h-4 inline mr-1" />
              Most symptoms occur in the{" "}
              <span className="text-white font-medium">evening and night</span>
            </p>
          </div>
        </div>
      </div>

      {/* Symptom Categories */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Symptoms by Category
        </h3>

        <div className="space-y-3">
          {Object.entries(symptomCategories).map(([key, category]) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategory === key;

            return (
              <div key={key} className="bg-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-5 h-5 text-purple-300" />
                    <span className="text-white font-medium">
                      {category.name}
                    </span>
                    <span className="text-sm text-purple-300">
                      ({category.symptoms.length} symptoms)
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-purple-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-300" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {category.symptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-lg px-3 py-2 text-sm text-purple-200 hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        {symptom}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlations & Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Correlations */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Impact Factors
          </h3>

          <div className="space-y-3">
            {symptomData.correlations.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">{factor.factor}</span>
                  <span
                    className={`text-sm font-medium ${
                      factor.impact > 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {Math.abs(factor.impact)}%{" "}
                    {factor.impact > 0 ? "increase" : "decrease"}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      factor.impact > 0 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.abs(factor.impact)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-xs text-purple-200">
              <Info className="w-3 h-3 inline mr-1" />
              Based on your tracking data from the last {selectedTimeRange}
            </p>
          </div>
        </div>

        {/* Common Triggers */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Common Triggers
          </h3>

          <div className="space-y-3">
            {symptomData.triggers.map((trigger, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {trigger.trigger}
                  </span>
                  <span className="text-sm text-purple-300">
                    {trigger.occurrences}x
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-200">Avg severity:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < Math.floor(trigger.severity)
                            ? "bg-pink-400"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Symptom Heatmap Calendar */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Symptom Intensity Calendar
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm text-purple-300 font-medium py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days with heatmap */}
          {eachDayOfInterval({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date()),
          }).map((date, index) => {
            const intensity = Math.random() * 5; // Mock data
            const opacity = intensity / 5;

            return (
              <div
                key={date}
                className={`
                  relative p-3 rounded-lg border border-white/20 cursor-pointer
                  hover:border-white/40 transition-all
                `}
                style={{
                  backgroundColor: `rgba(236, 72, 153, ${opacity * 0.6})`,
                }}
              >
                <span className="text-sm text-white">{format(date, "d")}</span>
                {intensity > 3 && (
                  <AlertCircle className="w-3 h-3 text-red-400 absolute bottom-1 right-1" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-purple-200">Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500/10 rounded"></div>
            <span className="text-purple-300">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500/60 rounded"></div>
            <span className="text-purple-300">High</span>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600/30 rounded-full p-3">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">
              AI Insights
            </h4>
            <div className="space-y-3 text-purple-200">
              <p>
                • Your symptoms tend to peak during the{" "}
                <span className="text-white font-medium">evening hours</span>,
                particularly between 6-10 PM.
              </p>
              <p>
                • <span className="text-white font-medium">Stress</span> appears
                to be your strongest trigger, increasing symptom severity by an
                average of 85%.
              </p>
              <p>
                • Regular{" "}
                <span className="text-white font-medium">exercise</span> shows a
                60% reduction in symptom frequency when done at least 3x per
                week.
              </p>
              {lifeStage === "perimenopause" && (
                <p>
                  • Your hot flash frequency has{" "}
                  <span className="text-white font-medium">
                    increased by 30%
                  </span>{" "}
                  over the past month, which is common during perimenopause
                  transitions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomAnalyticsTab;
