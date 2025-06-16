// src/components/wellness/tabs/WellnessCorrelationsTab.jsx
import React, { useState } from "react";
import {
  Activity,
  Heart,
  Moon,
  Dumbbell,
  TrendingUp,
  Brain,
  Zap,
  AlertTriangle,
  Target,
  BookOpen,
  BarChart3,
  Info,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from "recharts";

const WellnessCorrelationsTab = () => {
  const [selectedCorrelation, setSelectedCorrelation] = useState("sleep-mood");
  const [timeRange, setTimeRange] = useState("30d");

  // Generate correlation data
  const generateCorrelationData = () => {
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate correlated data
      const sleep = 6 + Math.random() * 3;
      const exercise = Math.random() > 0.3 ? 20 + Math.random() * 60 : 0;

      // Mood correlates with sleep and exercise
      const mood = Math.min(
        10,
        Math.max(
          1,
          3 +
            (sleep - 6) * 0.8 +
            (exercise > 0 ? 1.5 : 0) +
            (Math.random() - 0.5) * 2
        )
      );

      // Energy correlates with sleep, exercise, and mood
      const energy = Math.min(
        10,
        Math.max(
          1,
          2 +
            (sleep - 6) * 1.0 +
            (exercise > 0 ? 2 : 0) +
            mood * 0.3 +
            (Math.random() - 0.5) * 1.5
        )
      );

      // Stress inversely correlates with sleep and exercise
      const stress = Math.min(
        10,
        Math.max(
          1,
          8 -
            (sleep - 6) * 0.6 -
            (exercise > 0 ? 1.5 : 0) +
            (Math.random() - 0.5) * 2
        )
      );

      // Hydration affects energy and mood slightly
      const hydration = 4 + Math.random() * 6;

      // Journal sentiment (mock analysis from journal entries)
      const journalSentiment = Math.min(
        10,
        Math.max(1, mood + (Math.random() - 0.5) * 2)
      );

      data.push({
        date: date.toLocaleDateString(),
        sleep: parseFloat(sleep.toFixed(1)),
        mood: parseFloat(mood.toFixed(1)),
        energy: parseFloat(energy.toFixed(1)),
        stress: parseFloat(stress.toFixed(1)),
        exercise: Math.round(exercise),
        hydration: Math.round(hydration),
        journalSentiment: parseFloat(journalSentiment.toFixed(1)),
      });
    }
    return data;
  };

  const correlationData = generateCorrelationData();

  // Calculate correlation coefficients
  const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const correlation =
      (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return isNaN(correlation) ? 0 : correlation;
  };

  // Generate correlation matrix
  const correlationMatrix = [
    {
      factor1: "Sleep",
      factor2: "Mood",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.sleep),
        correlationData.map((d) => d.mood)
      ),
      strength: "Strong Positive",
      description: "Better sleep significantly improves mood",
    },
    {
      factor1: "Exercise",
      factor2: "Energy",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.exercise),
        correlationData.map((d) => d.energy)
      ),
      strength: "Strong Positive",
      description: "Physical activity boosts energy levels",
    },
    {
      factor1: "Sleep",
      factor2: "Stress",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.sleep),
        correlationData.map((d) => d.stress)
      ),
      strength: "Moderate Negative",
      description: "Poor sleep increases stress levels",
    },
    {
      factor1: "Mood",
      factor2: "Journal Sentiment",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.mood),
        correlationData.map((d) => d.journalSentiment)
      ),
      strength: "Very Strong Positive",
      description: "Journal tone reflects daily mood patterns",
    },
    {
      factor1: "Exercise",
      factor2: "Mood",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.exercise),
        correlationData.map((d) => d.mood)
      ),
      strength: "Moderate Positive",
      description: "Exercise days show improved mood",
    },
    {
      factor1: "Stress",
      factor2: "Energy",
      correlation: calculateCorrelation(
        correlationData.map((d) => d.stress),
        correlationData.map((d) => d.energy)
      ),
      strength: "Moderate Negative",
      description: "High stress drains energy reserves",
    },
  ];

  // Activity impact analysis
  const activityImpacts = [
    {
      activity: "Morning Exercise",
      moodImpact: 8.2,
      energyImpact: 8.5,
      stressImpact: -3.5,
      frequency: 12,
      color: "#10b981",
    },
    {
      activity: "Meditation/Mindfulness",
      moodImpact: 7.8,
      energyImpact: 6.5,
      stressImpact: -4.8,
      frequency: 15,
      color: "#8b5cf6",
    },
    {
      activity: "Quality Sleep (7+ hrs)",
      moodImpact: 8.0,
      energyImpact: 8.8,
      stressImpact: -4.0,
      frequency: 18,
      color: "#6366f1",
    },
    {
      activity: "Social Connection",
      moodImpact: 8.8,
      energyImpact: 7.2,
      stressImpact: -3.2,
      frequency: 8,
      color: "#ec4899",
    },
    {
      activity: "Nature/Outdoor Time",
      moodImpact: 8.0,
      energyImpact: 7.5,
      stressImpact: -3.8,
      frequency: 6,
      color: "#059669",
    },
    {
      activity: "Creative Activities",
      moodImpact: 7.5,
      energyImpact: 6.8,
      stressImpact: -2.5,
      frequency: 4,
      color: "#f59e0b",
    },
  ];

  // Environmental factor correlations
  const environmentalFactors = [
    {
      factor: "Weather (Sunny)",
      correlation: 0.35,
      impact: "Mood +12%, Energy +8%",
    },
    {
      factor: "Workday vs Weekend",
      correlation: -0.42,
      impact: "Stress +25% weekdays",
    },
    {
      factor: "Social Interactions",
      correlation: 0.58,
      impact: "Mood +18% on social days",
    },
    {
      factor: "Screen Time",
      correlation: -0.28,
      impact: "Sleep quality -15% high screen days",
    },
    {
      factor: "Caffeine Intake",
      correlation: 0.22,
      impact: "Energy +10%, Sleep quality -8%",
    },
    {
      factor: "Meal Timing",
      correlation: 0.31,
      impact: "Energy stability +20%",
    },
  ];

  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return "Very Strong";
    if (abs >= 0.6) return "Strong";
    if (abs >= 0.4) return "Moderate";
    if (abs >= 0.2) return "Weak";
    return "Very Weak";
  };

  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? "#10b981" : "#ef4444";
    if (abs >= 0.4) return correlation > 0 ? "#84cc16" : "#f59e0b";
    return "#6b7280";
  };

  const selectedData = correlationData.map((d) => {
    switch (selectedCorrelation) {
      case "sleep-mood":
        return { x: d.sleep, y: d.mood, date: d.date };
      case "exercise-energy":
        return { x: d.exercise, y: d.energy, date: d.date };
      case "mood-journal":
        return { x: d.mood, y: d.journalSentiment, date: d.date };
      case "sleep-stress":
        return { x: d.sleep, y: d.stress, date: d.date };
      default:
        return { x: d.sleep, y: d.mood, date: d.date };
    }
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correlation Focus
              </label>
              <select
                value={selectedCorrelation}
                onChange={(e) => setSelectedCorrelation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="sleep-mood">Sleep vs Mood</option>
                <option value="exercise-energy">Exercise vs Energy</option>
                <option value="mood-journal">Mood vs Journal Sentiment</option>
                <option value="sleep-stress">Sleep vs Stress</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="180d">Last 6 months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Correlation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Scatter Plot */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Correlation Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(value) => `Date: ${selectedData[value]?.date}`}
              />
              <Scatter
                dataKey="y"
                fill="#8b5cf6"
                name={selectedCorrelation
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" vs ")}
              />
            </ScatterChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                Correlation Strength:{" "}
                {getCorrelationStrength(
                  correlationMatrix.find(
                    (c) =>
                      c.factor1.toLowerCase() +
                        "-" +
                        c.factor2.toLowerCase() ===
                      selectedCorrelation
                  )?.correlation || 0
                )}
              </span>
              <span
                className="text-lg font-bold"
                style={{
                  color: getCorrelationColor(
                    correlationMatrix.find(
                      (c) =>
                        c.factor1.toLowerCase() +
                          "-" +
                          c.factor2.toLowerCase() ===
                        selectedCorrelation
                    )?.correlation || 0
                  ),
                }}
              >
                r ={" "}
                {(
                  correlationMatrix.find(
                    (c) =>
                      c.factor1.toLowerCase() +
                        "-" +
                        c.factor2.toLowerCase() ===
                      selectedCorrelation
                  )?.correlation || 0
                ).toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Correlation Matrix
          </h3>
          <div className="space-y-3">
            {correlationMatrix.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {item.factor1} ↔ {item.factor2}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        Math.abs(item.correlation) >= 0.6
                          ? "bg-green-100 text-green-800"
                          : Math.abs(item.correlation) >= 0.4
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.strength}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                <div className="text-right">
                  <div
                    className="text-lg font-bold"
                    style={{ color: getCorrelationColor(item.correlation) }}
                  >
                    {item.correlation.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Impact Analysis */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Activity Impact on Wellness
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityImpacts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="activity"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="moodImpact" fill="#ec4899" name="Mood Impact" />
            <Bar dataKey="energyImpact" fill="#f59e0b" name="Energy Impact" />
            <Bar
              dataKey="stressImpact"
              fill="#ef4444"
              name="Stress Reduction"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activityImpacts.slice(0, 3).map((activity, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {activity.activity}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Mood: +{activity.moodImpact.toFixed(1)}/10</div>
                <div>Energy: +{activity.energyImpact.toFixed(1)}/10</div>
                <div>Stress: {activity.stressImpact.toFixed(1)}/10</div>
                <div className="text-xs text-gray-500 mt-2">
                  Frequency: {activity.frequency} times this month
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental & Lifestyle Factors */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Environmental & Lifestyle Factors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environmentalFactors.map((factor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{factor.factor}</h4>
                <p className="text-sm text-gray-600 mt-1">{factor.impact}</p>
              </div>
              <div className="text-right">
                <div
                  className="text-lg font-bold"
                  style={{ color: getCorrelationColor(factor.correlation) }}
                >
                  {factor.correlation > 0 ? "+" : ""}
                  {factor.correlation.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {getCorrelationStrength(factor.correlation)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Integration Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Journal-Wellness Integration Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Sentiment-Wellness Alignment
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your journal sentiment strongly correlates (r=0.82) with
                    reported mood, validating the accuracy of your
                    self-awareness.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">
                    Wellness Goal Tracking
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Journal entries mentioning exercise correlate with 23%
                    higher energy levels and improved mood the following day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">
                    Early Warning Patterns
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Journal entries with stress-related keywords precede
                    wellness score drops by an average of 1.8 days, enabling
                    early intervention.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">
                    Holistic Wellness View
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Combining journal insights with wellness tracking provides
                    34% more accurate predictions of your overall well-being
                    trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCorrelationsTab;
