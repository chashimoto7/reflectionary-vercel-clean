// frontend/ src/components/AnalyticsDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterPlot,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Heart,
  Zap,
  Brain,
  Target,
  Info,
} from "lucide-react";

// Enhanced Sentiment Tab Component
export const SentimentTab = ({ data, colors }) => {
  const [viewType, setViewType] = useState("trends"); // 'trends', 'distribution', 'patterns'

  if (!data) return <div className="p-6">Loading sentiment data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["trends", "distribution", "patterns"].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                viewType === type
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {viewType === "trends" && (
        <div className="space-y-8">
          {/* Daily Sentiment Trends */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Daily Sentiment Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${(value * 100).toFixed(1)}%`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                    labelFormatter={(value) =>
                      `Date: ${new Date(value).toLocaleDateString()}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    stroke={colors[2]}
                    strokeWidth={3}
                    name="Positive"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke={colors[4]}
                    strokeWidth={3}
                    name="Negative"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutral"
                    stroke={colors[1]}
                    strokeWidth={3}
                    name="Neutral"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Sentiment Summary */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Weekly Sentiment Summary
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${(value * 100).toFixed(1)}%`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="positive"
                    stackId="a"
                    fill={colors[2]}
                    name="Positive"
                  />
                  <Bar
                    dataKey="neutral"
                    stackId="a"
                    fill={colors[1]}
                    name="Neutral"
                  />
                  <Bar
                    dataKey="negative"
                    stackId="a"
                    fill={colors[4]}
                    name="Negative"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewType === "distribution" && (
        <div className="space-y-8">
          {/* Emotion Distribution Pie Chart */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Emotion Distribution
            </h3>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.emotions}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ emotion, percent }) =>
                        `${emotion} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.emotions.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Emotion Details */}
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Emotion Details
                </h4>
                <div className="space-y-3">
                  {data.emotions.slice(0, 6).map((emotion, index) => (
                    <div
                      key={emotion.emotion}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="font-medium capitalize">
                          {emotion.emotion}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {emotion.count}
                        </div>
                        <div className="text-sm text-gray-500">mentions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === "patterns" && (
        <div className="space-y-8">
          {/* Sentiment Patterns Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-green-900">
                  Positive Trends
                </h4>
              </div>
              <p className="text-green-700 mb-2">
                {data.positiveInsights ||
                  "Your positive sentiment has been steady with occasional peaks during weekend entries."}
              </p>
              <div className="text-sm text-green-600">
                Average:{" "}
                {(
                  (data.daily.reduce(
                    (sum, day) => sum + parseFloat(day.positive),
                    0
                  ) /
                    data.daily.length) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Minus className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-yellow-900">
                  Neutral Patterns
                </h4>
              </div>
              <p className="text-yellow-700 mb-2">
                {data.neutralInsights ||
                  "Neutral sentiment often appears during reflective, analytical entries."}
              </p>
              <div className="text-sm text-yellow-600">
                Average:{" "}
                {(
                  (data.daily.reduce(
                    (sum, day) => sum + parseFloat(day.neutral),
                    0
                  ) /
                    data.daily.length) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-red-900">
                  Areas for Growth
                </h4>
              </div>
              <p className="text-red-700 mb-2">
                {data.negativeInsights ||
                  "Negative sentiment appears most commonly on weekday mornings."}
              </p>
              <div className="text-sm text-red-600">
                Average:{" "}
                {(
                  (data.daily.reduce(
                    (sum, day) => sum + parseFloat(day.negative),
                    0
                  ) /
                    data.daily.length) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>

          {/* Sentiment Stability Indicator */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Emotional Stability Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Variability Analysis
                </h5>
                <p className="text-gray-600 text-sm">
                  Your sentiment shows {data.variability || "moderate"}{" "}
                  variability, suggesting a balanced emotional range in your
                  journaling.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Peak Patterns
                </h5>
                <p className="text-gray-600 text-sm">
                  Highest positive sentiment typically occurs on{" "}
                  {data.peakDay || "weekends"}, while challenging emotions
                  surface more on {data.lowDay || "Mondays"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Mood & Energy Tab Component
export const MoodEnergyTab = ({ data, colors, cycleTracking }) => {
  const [viewType, setViewType] = useState("trends"); // 'trends', 'correlations', 'patterns', 'cycles'
  const [correlationView, setCorrelationView] = useState("combined"); // 'combined', 'mood', 'energy'

  if (!data) return <div className="p-6">Loading mood and energy data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mood & Energy Patterns
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            "trends",
            "correlations",
            "patterns",
            ...(cycleTracking ? ["cycles"] : []),
          ].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                viewType === type
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {viewType === "trends" && (
        <div className="space-y-8">
          {/* Mood and Energy Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Average Mood</h3>
                  <p className="text-3xl font-bold">
                    {(
                      data.mood.daily.reduce(
                        (sum, day) => sum + parseFloat(day.mood),
                        0
                      ) / data.mood.daily.length
                    ).toFixed(1)}
                  </p>
                  <p className="text-purple-100 text-sm">out of 10</p>
                </div>
                <Heart className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Average Energy</h3>
                  <p className="text-3xl font-bold">
                    {(
                      data.energy.daily.reduce(
                        (sum, day) => sum + parseFloat(day.energy),
                        0
                      ) / data.energy.daily.length
                    ).toFixed(1)}
                  </p>
                  <p className="text-green-100 text-sm">out of 10</p>
                </div>
                <Zap className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Mood Trend</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-2xl font-bold">+0.3</span>
                  </div>
                  <p className="text-blue-100 text-sm">this month</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Energy Trend</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-2xl font-bold">+0.1</span>
                  </div>
                  <p className="text-orange-100 text-sm">this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Mood and Energy Chart */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Daily Mood & Energy Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(value) =>
                      `Date: ${new Date(value).toLocaleDateString()}`
                    }
                  />
                  <Legend />
                  <Line
                    data={data.mood.daily}
                    type="monotone"
                    dataKey="mood"
                    stroke={colors[0]}
                    strokeWidth={3}
                    name="Mood"
                    dot={{ r: 4 }}
                  />
                  <Line
                    data={data.energy.daily}
                    type="monotone"
                    dataKey="energy"
                    stroke={colors[2]}
                    strokeWidth={3}
                    name="Energy"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Separate Mood and Energy Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mood Chart */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Mood Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.mood.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value}/10`, "Mood"]}
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke={colors[0]}
                      fill={colors[0]}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy Chart */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Energy Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.energy.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value}/10`, "Energy"]}
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke={colors[2]}
                      fill={colors[2]}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === "correlations" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Mood & Energy Correlations
            </h3>
            <select
              value={correlationView}
              onChange={(e) => setCorrelationView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="combined">Combined View</option>
              <option value="mood">Mood Focus</option>
              <option value="energy">Energy Focus</option>
            </select>
          </div>

          {/* Mood-Energy Correlation Scatter Plot */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Mood vs Energy Correlation
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterPlot>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="mood"
                    domain={[0, 10]}
                    name="Mood"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="energy"
                    domain={[0, 10]}
                    name="Energy"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter
                    data={data.mood.daily.map((moodDay, index) => ({
                      mood: parseFloat(moodDay.mood),
                      energy: parseFloat(data.energy.daily[index]?.energy || 0),
                      date: moodDay.date,
                    }))}
                    fill={colors[0]}
                  />
                </ScatterPlot>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Correlation Insight:</strong>{" "}
                {data.correlationInsight ||
                  "Your mood and energy levels show a moderate positive correlation. Higher mood days tend to coincide with higher energy levels."}
              </p>
            </div>
          </div>

          {/* Weekly Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Weekly Mood Patterns
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.mood.weeklyPattern || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value}/10`, "Average Mood"]}
                    />
                    <Bar dataKey="average" fill={colors[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Weekly Energy Patterns
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.energy.weeklyPattern || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value}/10`, "Average Energy"]}
                    />
                    <Bar dataKey="average" fill={colors[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === "patterns" && (
        <div className="space-y-8">
          {/* Pattern Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-900">
                  Best Days
                </h4>
              </div>
              <p className="text-blue-700 mb-2">
                Your highest mood and energy typically occur on:
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <div>• {data.patterns?.bestMoodDay || "Saturdays"} (Mood)</div>
                <div>
                  • {data.patterns?.bestEnergyDay || "Fridays"} (Energy)
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-orange-600" />
                <h4 className="text-lg font-semibold text-orange-900">
                  Challenge Days
                </h4>
              </div>
              <p className="text-orange-700 mb-2">
                Lower mood and energy often appear on:
              </p>
              <div className="text-sm text-orange-600 space-y-1">
                <div>• {data.patterns?.lowestMoodDay || "Mondays"} (Mood)</div>
                <div>
                  • {data.patterns?.lowestEnergyDay || "Wednesdays"} (Energy)
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-semibold text-green-900">
                  Stability
                </h4>
              </div>
              <p className="text-green-700 mb-2">
                Your emotional consistency score:
              </p>
              <div className="text-2xl font-bold text-green-600">
                {data.patterns?.stabilityScore || "7.2"}/10
              </div>
            </div>
          </div>

          {/* Mood Variability Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Variability Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Mood Consistency
                </h5>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{
                      width: `${
                        (data.patterns?.moodConsistency || 0.7) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {((data.patterns?.moodConsistency || 0.7) * 100).toFixed(0)}%
                  consistent
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Energy Consistency
                </h5>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{
                      width: `${
                        (data.patterns?.energyConsistency || 0.6) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {((data.patterns?.energyConsistency || 0.6) * 100).toFixed(0)}
                  % consistent
                </p>
              </div>
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h4 className="text-lg font-semibold text-purple-900">
                AI Insights
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-purple-700">
                  {data.insights?.moodPattern ||
                    "Your mood shows a slight upward trend over the past month, with the most significant improvements occurring after weekend entries."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-purple-700">
                  {data.insights?.energyPattern ||
                    "Energy levels peak mid-week but dip on Sundays, suggesting the weekend-to-weekday transition might benefit from more structured planning."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-purple-700">
                  {data.insights?.recommendation ||
                    "Consider incorporating energizing activities on your lower-energy days and mood-boosting practices during challenging periods."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === "cycles" && cycleTracking && (
        <div className="space-y-8">
          <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
            <h3 className="text-xl font-semibold text-pink-900 mb-4">
              Menstrual Cycle Correlations
            </h3>
            <p className="text-pink-700 mb-6">
              Understanding how your natural hormonal cycles affect your mood
              and energy can provide valuable insights into your patterns and
              help you plan accordingly.
            </p>

            {/* Cycle Phase Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {["Menstrual", "Follicular", "Ovulatory", "Luteal"].map(
                (phase, index) => (
                  <div
                    key={phase}
                    className="bg-white p-4 rounded-lg border border-pink-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {phase} Phase
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Mood:</span>
                        <span className="font-medium">
                          {(6.5 + index * 0.3).toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Energy:</span>
                        <span className="font-medium">
                          {(5.8 + index * 0.4).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Cycle Tracking Chart */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Mood & Energy by Cycle Day
              </h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateCycleData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="cycleDay"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Cycle Day",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [`${value}/10`, name]}
                      labelFormatter={(value) => `Cycle Day: ${value}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke={colors[0]}
                      strokeWidth={3}
                      name="Mood"
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke={colors[2]}
                      strokeWidth={3}
                      name="Energy"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cycle Insights */}
            <div className="bg-white p-6 rounded-lg border border-pink-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Cycle Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Mood Patterns
                  </h5>
                  <p className="text-gray-600 text-sm">
                    Your mood tends to be highest during the follicular phase
                    (days 7-13) and may dip slightly during the luteal phase
                    (days 15-28).
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Energy Patterns
                  </h5>
                  <p className="text-gray-600 text-sm">
                    Energy peaks around ovulation (days 12-16) and typically
                    decreases in the week before menstruation.
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

// Helper function to generate sample cycle data
const generateCycleData = () => {
  const cycleData = [];
  for (let day = 1; day <= 28; day++) {
    // Simulate realistic cycle patterns
    let mood = 6;
    let energy = 6;

    if (day <= 5) {
      // Menstrual phase
      mood = 5.5 + Math.random();
      energy = 4.5 + Math.random();
    } else if (day <= 13) {
      // Follicular phase
      mood = 6.5 + Math.random();
      energy = 6 + Math.random();
    } else if (day <= 16) {
      // Ovulatory phase
      mood = 7.5 + Math.random() * 0.5;
      energy = 7.5 + Math.random() * 0.5;
    } else {
      // Luteal phase
      mood = 6 - (day - 16) * 0.1 + Math.random();
      energy = 6.5 - (day - 16) * 0.08 + Math.random();
    }

    cycleData.push({
      cycleDay: day,
      mood: Math.max(1, Math.min(10, mood)),
      energy: Math.max(1, Math.min(10, energy)),
    });
  }
  return cycleData;
};

// Themes Tab Component
export const ThemesTab = ({ data, colors }) => {
  const [viewType, setViewType] = useState("current"); // 'current', 'evolution', 'emerging'

  if (!data) return <div className="p-6">Loading themes data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Themes & Topics</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["current", "evolution", "emerging"].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                viewType === type
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {viewType === "current" && (
        <div className="space-y-8">
          {/* Top Themes Chart */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Most Common Themes
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topThemes || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="theme" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, "Mentions"]} />
                  <Bar dataKey="count" fill={colors[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Theme Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.topThemes || []).slice(0, 6).map((theme, index) => (
              <div key={theme.theme} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                    {theme.theme}
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mentions:</span>
                    <span className="font-medium">{theme.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <span className="text-green-600">↗ +12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sentiment:</span>
                    <span className="text-blue-600">Positive</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewType === "evolution" && (
        <div className="space-y-8">
          <div className="text-center text-gray-500 py-8">
            Theme evolution visualizations will be implemented here. This will
            show how themes change and develop over time.
          </div>
        </div>
      )}

      {viewType === "emerging" && (
        <div className="space-y-8">
          <div className="text-center text-gray-500 py-8">
            Emerging themes analysis will be implemented here. This will
            identify new themes appearing in recent entries.
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder components for remaining tabs
export const BehavioralTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Behavioral Insights
    </h2>
    <div className="text-center text-gray-500 py-8">
      Behavioral analysis visualizations will be implemented here. This will
      include journaling habits, activity patterns, and social dynamics.
    </div>
  </div>
);

export const CognitiveTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Cognitive Patterns
    </h2>
    <div className="text-center text-gray-500 py-8">
      Cognitive analysis visualizations will be implemented here. This will
      include thinking patterns, problem-solving approaches, and growth
      indicators.
    </div>
  </div>
);

export const WellnessTab = ({ data, colors }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Wellness Metrics</h2>
    <div className="text-center text-gray-500 py-8">
      Wellness analysis visualizations will be implemented here. This will
      include self-care patterns, stress indicators, and sleep analysis.
    </div>
  </div>
);
