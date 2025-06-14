// src/components/analytics/tabs/SentimentEmotionsTab.jsx
import React, { useState } from "react";
import {
  AreaChart,
  Area,
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
  ComposedChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Heart,
  BarChart3,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";

const SentimentEmotionsTab = ({ data, colors }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [showEmotionDetails, setShowEmotionDetails] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Sentiment & Emotional Intelligence
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly Aggregation</option>
            <option value="monthly">Monthly Trends</option>
          </select>
          <button
            onClick={() => setShowEmotionDetails(!showEmotionDetails)}
            className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
          >
            {showEmotionDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            {showEmotionDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {/* Emotional Intelligence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">8.4</div>
              <div className="text-sm opacity-90">out of 10</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Emotional Intelligence</h3>
          <p className="text-sm opacity-90">Above average self-awareness</p>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm opacity-90">accuracy</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Pattern Recognition</h3>
          <p className="text-sm opacity-90">Strong emotional patterns</p>
          <div className="mt-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="text-sm">Expert level</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">76%</div>
              <div className="text-sm opacity-90">positive</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Overall Sentiment</h3>
          <p className="text-sm opacity-90">Predominantly positive outlook</p>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Improving trend</span>
          </div>
        </div>
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sentiment Evolution Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} />
            Sentiment Evolution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
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
                <Area
                  type="monotone"
                  dataKey="positive"
                  stackId="1"
                  stroke={colors.accent}
                  fill={colors.accent}
                  fillOpacity={0.8}
                  name="Positive"
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.8}
                  name="Neutral"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stackId="1"
                  stroke={colors.danger}
                  fill={colors.danger}
                  fillOpacity={0.8}
                  name="Negative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Insight:</strong> Your sentiment has been trending more
              positive over the past month, with notable improvements in
              emotional regulation.
            </p>
          </div>
        </div>

        {/* Emotional Landscape */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="text-pink-600" size={20} />
            Emotional Landscape
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.emotions || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="emotion"
                  label={({ emotion, percent }) =>
                    `${emotion} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(data?.emotions || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors.gradient[index % colors.gradient.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} mentions`, "Frequency"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Pattern:</strong> Gratitude and joy are your most
              frequent emotions, indicating strong emotional well-being.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Emotional Analysis */}
      {showEmotionDetails && (
        <div className="space-y-6 mb-8">
          {/* Emotion Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emotion Intensity Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="positive"
                    fill={colors.accent}
                    name="Positive Intensity"
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke={colors.danger}
                    strokeWidth={3}
                    name="Negative Intensity"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotional Volatility Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={18} />
                Emotional Stability Score
              </h4>
              <div className="text-3xl font-bold text-blue-800 mb-2">
                7.8/10
              </div>
              <p className="text-blue-700 text-sm mb-3">
                Your emotions show good stability with manageable fluctuations.
              </p>
              <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={18} />
                Emotional Growth Rate
              </h4>
              <div className="text-3xl font-bold text-purple-800 mb-2">
                +15%
              </div>
              <p className="text-purple-700 text-sm mb-3">
                Your emotional intelligence is growing at an above-average rate.
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Accelerating growth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Emotional Patterns */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-green-600" size={20} />
          Weekly Emotional Patterns
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.weekly || []}>
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
              <Bar dataKey="positive" fill={colors.accent} name="Positive" />
              <Bar dataKey="neutral" fill={colors.warning} name="Neutral" />
              <Bar dataKey="negative" fill={colors.danger} name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800">Best Day</div>
            <div className="text-green-600">Fridays</div>
            <div className="text-xs text-green-600">85% positive sentiment</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="font-semibold text-yellow-800">Most Balanced</div>
            <div className="text-yellow-600">Wednesdays</div>
            <div className="text-xs text-yellow-600">
              Even emotional distribution
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-800">Challenging Day</div>
            <div className="text-red-600">Mondays</div>
            <div className="text-xs text-red-600">Consider extra self-care</div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Lightbulb className="text-purple-600" size={20} />
          AI-Powered Emotional Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">
                  Emotional Peak Times
                </h4>
                <p className="text-purple-700 text-sm">
                  Your most positive emotions occur between 2-4 PM and on
                  weekend mornings. Consider scheduling important conversations
                  during these windows.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Growth Pattern
                </h4>
                <p className="text-blue-700 text-sm">
                  You're developing stronger emotional vocabulary and
                  self-awareness. This indicates growing emotional intelligence
                  and resilience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentEmotionsTab;
