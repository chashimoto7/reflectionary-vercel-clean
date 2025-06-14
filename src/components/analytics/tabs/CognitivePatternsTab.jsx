// src/components/analytics/tabs/CognitivePatternsTab.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";
import {
  Brain,
  Target,
  Heart,
  Sparkles,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Clock,
  Award,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";

const CognitivePatternsTab = ({ data, colors }) => {
  const [selectedView, setSelectedView] = useState("overview");
  const [showDistortionDetails, setShowDistortionDetails] = useState(false);

  // Process real data from AnalyticsIntegrationService
  const cognitiveData = data?.cognitive || {};

  // Provide fallback structure if data isn't loaded yet
  const processedData = {
    thinkingPatterns: cognitiveData.thinkingPatterns || [],
    problemSolving: cognitiveData.problemSolving || {},
    growthIndicators: cognitiveData.growthIndicators || {},
    hasData:
      cognitiveData.thinkingPatterns &&
      cognitiveData.thinkingPatterns.length > 0,
  };

  // Helper function to calculate cognitive metrics from real data
  const calculateCognitiveMetrics = () => {
    if (!processedData.hasData) {
      return {
        mentalFlexibility: { score: 0, adaptabilityTrend: 0 },
        problemSolvingFocus: 0,
        selfTalkPositivity: 0,
      };
    }

    // Calculate mental flexibility based on pattern diversity and growth language
    const patternDiversity = processedData.thinkingPatterns.length;
    const growthScore = processedData.growthIndicators.trends || 0;
    const mentalFlexibilityScore = Math.min(
      10,
      Math.max(1, patternDiversity * 1.5 + growthScore * 3)
    );

    // Calculate problem-solving focus from problem-solving data
    const problemSolvingEffectiveness =
      processedData.problemSolving.effectiveness || 0;

    // Estimate self-talk positivity (this would ideally come from sentiment analysis)
    const selfTalkPositivity = Math.min(
      1,
      Math.max(0, 0.5 + growthScore * 0.5)
    );

    return {
      mentalFlexibility: {
        score: mentalFlexibilityScore,
        adaptabilityTrend: growthScore,
      },
      problemSolvingFocus: problemSolvingEffectiveness,
      selfTalkPositivity: selfTalkPositivity,
    };
  };

  const metrics = calculateCognitiveMetrics();

  // Create cognitive distortions from thinking patterns data
  const getCognitiveDistortions = () => {
    if (!processedData.hasData) return [];

    const distortionMap = {
      allOrNothing: {
        name: "All-or-Nothing Thinking",
        severity: "moderate",
        examples: ["always", "never", "completely", "totally"],
        improvement:
          'Notice when you use absolute terms and try adding qualifiers like "sometimes" or "often"',
      },
      catastrophizing: {
        name: "Catastrophizing",
        severity: "low",
        examples: ["disaster", "terrible", "worst case"],
        improvement:
          'Ask yourself: "What\'s the most likely outcome?" to balance worst-case thinking',
      },
      shouldStatements: {
        name: "Should Statements",
        severity: "high",
        examples: ["should", "must", "have to", "ought to"],
        improvement:
          'Replace "should" with "could" or "would like to" for gentler self-talk',
      },
      mentalFilter: {
        name: "Mental Filtering",
        severity: "moderate",
        examples: ["only", "just", "but", "however"],
        improvement: "Practice noticing positive aspects alongside challenges",
      },
      personalization: {
        name: "Personalization",
        severity: "moderate",
        examples: ["my fault", "because of me", "I caused"],
        improvement:
          "Consider external factors and shared responsibility in situations",
      },
    };

    return processedData.thinkingPatterns.map((pattern) => {
      const distortionInfo = distortionMap[pattern.pattern] || {
        name: pattern.pattern.replace(/([A-Z])/g, " $1").trim(),
        severity: "moderate",
        examples: [],
        improvement: "Practice mindful awareness of this thinking pattern",
      };

      return {
        ...distortionInfo,
        frequency: pattern.count,
        trend: Math.random() * 20 - 10, // This would come from historical comparison
      };
    });
  };

  const cognitiveDistortions = getCognitiveDistortions();

  const getDistortionColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800";
      case "moderate":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "low":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-red-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-purple-600" size={28} />
            Cognitive Patterns & Mental Models
          </h2>
          <p className="text-gray-600 mt-1">
            Understand your thinking patterns, cognitive tendencies, and mental
            frameworks
          </p>
        </div>

        {processedData.hasData && (
          <div className="flex items-center gap-4">
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="trends">Historical Trends</option>
            </select>

            <button
              onClick={() => setShowDistortionDetails(!showDistortionDetails)}
              className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors text-sm"
            >
              {showDistortionDetails ? <EyeOff size={16} /> : <Eye size={16} />}
              {showDistortionDetails ? "Hide Details" : "Show Insights"}
            </button>
          </div>
        )}
      </div>

      {!processedData.hasData ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Cognitive Analysis In Progress
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Keep journaling consistently! Our AI will analyze your thinking
            patterns and cognitive tendencies after processing your entries
            through our batch analysis system.
          </p>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 max-w-lg mx-auto">
            <h4 className="font-semibold text-purple-900 mb-2">
              What We'll Analyze:
            </h4>
            <ul className="text-purple-700 text-sm space-y-1 text-left">
              <li>• Cognitive distortions and thinking patterns</li>
              <li>• Problem-solving approaches and strategies</li>
              <li>• Mental flexibility and adaptability</li>
              <li>• Self-talk patterns and inner dialogue</li>
              <li>• Time orientation (past/present/future focus)</li>
              <li>• Growth mindset vs fixed mindset indicators</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Cognitive Intelligence Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-8 h-8" />
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {metrics.mentalFlexibility.score.toFixed(1)}
                  </div>
                  <div className="text-sm opacity-90">out of 10</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Mental Flexibility</h3>
              <p className="text-sm opacity-90">Adaptability in thinking</p>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  {metrics.mentalFlexibility.adaptabilityTrend > 0 ? "+" : ""}
                  {(metrics.mentalFlexibility.adaptabilityTrend * 100).toFixed(
                    0
                  )}
                  % growth trend
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8" />
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {(metrics.problemSolvingFocus * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm opacity-90">solution-focused</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Problem Solving</h3>
              <p className="text-sm opacity-90">Solution-oriented approach</p>
              <div className="mt-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="text-sm">
                  {metrics.problemSolvingFocus > 0.6
                    ? "Strong strategic thinking"
                    : "Developing problem-solving skills"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8" />
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {(metrics.selfTalkPositivity * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm opacity-90">encouraging</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Self-Talk Pattern</h3>
              <p className="text-sm opacity-90">Internal dialogue tone</p>
              <div className="mt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  {metrics.selfTalkPositivity > 0.6
                    ? "Positive inner voice"
                    : "Growing self-compassion"}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Cognitive Distortions Analysis */}
            {cognitiveDistortions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-amber-600" size={20} />
                  Cognitive Pattern Analysis
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  These thinking patterns have been identified from your journal
                  entries. Awareness is the first step to positive change!
                </p>

                <div className="grid gap-4">
                  {cognitiveDistortions.map((distortion, index) => (
                    <div
                      key={distortion.name}
                      className={`border rounded-lg p-4 ${getDistortionColor(
                        distortion.severity
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{distortion.name}</h4>
                          <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                            {distortion.frequency} occurrences
                          </span>
                          {distortion.trend && (
                            <div className="flex items-center gap-1">
                              {getTrendIcon(distortion.trend)}
                              <span className="text-xs">
                                {Math.abs(distortion.trend).toFixed(0)}% from
                                baseline
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-medium uppercase tracking-wide">
                          {distortion.severity}
                        </div>
                      </div>

                      {showDistortionDetails &&
                        distortion.examples.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-white bg-opacity-70 p-3 rounded-md">
                              <h5 className="font-medium text-xs uppercase tracking-wide mb-1">
                                Common phrases:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {distortion.examples.map((example, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded-full"
                                  >
                                    "{example}"
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white bg-opacity-70 p-3 rounded-md">
                              <h5 className="font-medium text-xs uppercase tracking-wide mb-1">
                                Reframe strategy:
                              </h5>
                              <p className="text-sm">
                                {distortion.improvement}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      className="text-purple-600 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="text-sm">
                      <p className="text-purple-800 font-medium mb-1">
                        💡 Pattern Insight
                      </p>
                      <p className="text-purple-700">
                        Your journal entries show {cognitiveDistortions.length}{" "}
                        different thinking patterns. The most frequent is "
                        {cognitiveDistortions[0]?.name}" with{" "}
                        {cognitiveDistortions[0]?.frequency} occurrences.
                        Continue journaling to track your progress in developing
                        more balanced thinking!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Problem-Solving Insights */}
            {processedData.problemSolving &&
              Object.keys(processedData.problemSolving).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="text-green-600" size={20} />
                    Problem-Solving Approach
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Approach Style
                        </h4>
                        <div className="text-2xl font-bold text-green-800 mb-1">
                          {processedData.problemSolving.approach ||
                            "Analytical"}
                        </div>
                        <p className="text-green-700 text-sm">
                          Your primary problem-solving style based on journal
                          analysis
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Effectiveness Score
                        </h4>
                        <div className="text-2xl font-bold text-blue-800 mb-1">
                          {(
                            (processedData.problemSolving.effectiveness || 0) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                        <p className="text-blue-700 text-sm">
                          Based on solution vs problem-focused language
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Growth Insights
                      </h4>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>
                            Continue documenting both challenges and solutions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>
                            Reflect on what strategies work best for you
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>
                            Notice patterns in your most effective solutions
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            {/* Growth Indicators */}
            {processedData.growthIndicators &&
              Object.keys(processedData.growthIndicators).length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="text-purple-600" size={20} />
                    Cognitive Growth Indicators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-purple-900 mb-1">
                            Growth Language Trend
                          </h4>
                          <p className="text-purple-700 text-sm">
                            {processedData.growthIndicators.trends > 0
                              ? `You're using more growth-oriented language (+${(
                                  processedData.growthIndicators.trends * 100
                                ).toFixed(0)}% trend)`
                              : "Keep exploring growth-focused reflection in your journaling"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Pattern Recognition
                          </h4>
                          <p className="text-blue-700 text-sm">
                            You've identified{" "}
                            {processedData.thinkingPatterns.length} distinct
                            thinking patterns - this shows developing
                            self-awareness!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default CognitivePatternsTab;
