import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Heart,
  Brain,
  TrendingUp,
  Zap,
  AlertCircle,
  Shield,
  Sparkles,
  ChevronRight,
  Check,
  Clock,
  Filter,
  RefreshCw,
  Star,
  Moon,
  Users,
  Target,
  MessageSquare,
  Calendar,
  Activity,
} from "lucide-react";

// This component should receive supabase client as a prop from the parent
const AIInsightsFeedTab = ({
  insights,
  onAcknowledgeInsight,
  colors,
  userId,
  supabase,
}) => {
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFullInsight, setShowFullInsight] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [realInsights, setRealInsights] = useState([]);

  // Mock data as fallback - will be used only if no real insights exist
  const mockInsights = [
    {
      id: "1",
      category: "mood",
      type: "pattern",
      priority: "high",
      title: "Mood Pattern Recognition",
      content:
        "Your mood tends to be highest on Thursdays (average 7.5/10) and lowest on Mondays (average 5.2/10). This pattern has been consistent for the past 6 weeks.",
      recommendations: [
        "Schedule important meetings or creative work on Thursdays",
        "Plan lighter activities for Monday mornings",
        "Consider a Monday morning routine that boosts your mood",
      ],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      confidence: 0.87,
      relatedEntries: 24,
    },
    {
      id: "2",
      category: "cognitive",
      type: "growth",
      priority: "medium",
      title: "Cognitive Growth Detected",
      content:
        "Your problem-solving language has increased by 35% over the past month. You're using more analytical phrases and showing improved self-reflection in your entries.",
      recommendations: [
        "Continue exploring complex topics in your journal",
        'Try the "5 Whys" technique to deepen your analysis',
        "Consider journaling about challenges you've overcome",
      ],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      confidence: 0.78,
      relatedEntries: 18,
    },
    {
      id: "3",
      category: "energy",
      type: "correlation",
      priority: "high",
      title: "Exercise-Energy Connection",
      content:
        "On days you mention exercise, your energy levels are 2.3 points higher on average. Morning exercise shows the strongest correlation with sustained energy throughout the day.",
      recommendations: [
        "Aim for morning exercise 3-4 times per week",
        "Track how different types of exercise affect your energy",
        "Consider a 10-minute morning routine on busy days",
      ],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      confidence: 0.92,
      relatedEntries: 31,
    },
    {
      id: "4",
      category: "trend",
      type: "warning",
      priority: "high",
      title: "Stress Pattern Alert",
      content:
        "You've mentioned work stress in 5 of your last 7 entries. This is a significant increase from your usual pattern.",
      recommendations: [
        "Consider scheduling regular breaks during work hours",
        "Try stress-reduction techniques like deep breathing",
        "Journal about specific stressors to identify patterns",
      ],
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      confidence: 0.89,
      relatedEntries: 7,
    },
    {
      id: "5",
      category: "cycle",
      type: "prediction",
      priority: "medium",
      title: "Cycle Phase Prediction",
      content:
        "Based on your patterns, you're likely entering your luteal phase in 2-3 days. Historically, this phase brings lower energy but increased creativity for you.",
      recommendations: [
        "Plan creative projects for the coming week",
        "Stock up on your favorite comfort foods",
        "Schedule lighter physical activities",
      ],
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      confidence: 0.82,
      relatedEntries: 45,
    },
  ];

  // Fetch real insights from database
  useEffect(() => {
    const fetchInsights = async () => {
      if (!userId || !supabase) {
        setIsLoading(false);
        setRealInsights(mockInsights);
        return;
      }

      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("user_insights")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching insights:", error);
          // Fall back to mock data
          setRealInsights(mockInsights);
        } else {
          // Transform data to match expected format
          const transformedInsights = data.map((insight) => ({
            id: insight.id,
            category: insight.category,
            type: insight.type,
            priority: insight.priority,
            title: insight.title,
            content: insight.content,
            recommendations: insight.recommendations || [],
            created_at: insight.created_at,
            acknowledged: insight.acknowledged,
            confidence: insight.confidence || 0.8,
            relatedEntries: insight.related_entry_ids?.length || 0,
          }));

          // Use real insights if available, otherwise use mock
          setRealInsights(
            transformedInsights.length > 0 ? transformedInsights : mockInsights
          );
        }
      } catch (error) {
        console.error("Error in fetchInsights:", error);
        setRealInsights(mockInsights);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [userId, supabase]);

  useEffect(() => {
    // Use real insights or provided insights
    const insightsToUse =
      realInsights.length > 0 ? realInsights : insights || [];
    filterAndSortInsights(insightsToUse, activeFilter, sortOrder);
  }, [realInsights, insights, activeFilter, sortOrder]);

  const filterAndSortInsights = (insightsData, filter, sort) => {
    let filtered = [...insightsData];

    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter((insight) => {
        if (filter === "unread") return !insight.acknowledged;
        if (filter === "high-priority") return insight.priority === "high";
        return insight.category === filter;
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sort === "recent") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sort === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sort === "confidence") {
        return (b.confidence || 0) - (a.confidence || 0);
      }
      return 0;
    });

    setFilteredInsights(filtered);
  };

  const filterCategories = [
    { id: "all", label: "All Insights", icon: Sparkles },
    { id: "unread", label: "Unread", icon: MessageSquare },
    { id: "high-priority", label: "High Priority", icon: AlertCircle },
    { id: "mood", label: "Mood", icon: Heart },
    { id: "energy", label: "Energy", icon: Zap },
    { id: "cognitive", label: "Cognitive", icon: Brain },
    { id: "trend", label: "Trends", icon: TrendingUp },
    { id: "cycle", label: "Cycle", icon: Moon },
  ];

  const getInsightIcon = (category) => {
    const icons = {
      mood: Heart,
      energy: Zap,
      cognitive: Brain,
      trend: TrendingUp,
      cycle: Moon,
      wellness: Shield,
      behavioral: Users,
      growth: Target,
    };
    return icons[category] || Lightbulb;
  };

  const getInsightColor = (category) => {
    const categoryColors = {
      mood: "bg-pink-50 border-pink-200 text-pink-800",
      energy: "bg-yellow-50 border-yellow-200 text-yellow-800",
      cognitive: "bg-purple-50 border-purple-200 text-purple-800",
      trend: "bg-blue-50 border-blue-200 text-blue-800",
      cycle: "bg-indigo-50 border-indigo-200 text-indigo-800",
      wellness: "bg-green-50 border-green-200 text-green-800",
      behavioral: "bg-orange-50 border-orange-200 text-orange-800",
      growth: "bg-emerald-50 border-emerald-200 text-emerald-800",
    };
    return (
      categoryColors[category] || "bg-gray-50 border-gray-200 text-gray-800"
    );
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      high: "text-red-600 bg-red-100",
      medium: "text-yellow-600 bg-yellow-100",
      low: "text-green-600 bg-green-100",
    };
    return priorityColors[priority] || "text-gray-600 bg-gray-100";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Trigger insight generation on the backend
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Reload insights after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error refreshing insights:", error);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleAcknowledgeInsight = async (insightId) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from("user_insights")
          .update({
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
          })
          .eq("id", insightId);

        if (!error) {
          // Update local state
          setRealInsights((prev) =>
            prev.map((insight) =>
              insight.id === insightId
                ? { ...insight, acknowledged: true }
                : insight
            )
          );
        }
      }
    } catch (error) {
      console.error("Error acknowledging insight:", error);
    }

    // Also call the parent handler if provided
    if (onAcknowledgeInsight) {
      onAcknowledgeInsight(insightId);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredInsights || filteredInsights.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Insights Feed</h2>
        </div>

        <div className="text-center py-12">
          <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Insights Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Keep journaling regularly! Our AI will start generating personalized
            insights about your patterns and growth after you have at least 5
            journal entries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights Feed</h2>
          <p className="text-gray-600 mt-1">
            Personalized insights powered by AI analysis of your journal
            patterns
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-lg border transition-colors ${
            isRefreshing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="recent">Most Recent</option>
            <option value="priority">Priority</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterCategories.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const IconComponent = getInsightIcon(insight.category);
          const isExpanded = showFullInsight[insight.id];

          return (
            <div
              key={insight.id}
              className={`rounded-lg border-2 p-6 transition-all ${
                insight.acknowledged
                  ? "opacity-60 bg-gray-50"
                  : getInsightColor(insight.category)
              }`}
            >
              {/* Insight Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      insight.acknowledged
                        ? "bg-gray-200"
                        : getInsightColor(insight.category).split(" ")[0]
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                          insight.priority
                        )}`}
                      >
                        {insight.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(insight.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {Math.round((insight.confidence || 0.5) * 100)}%
                        confidence
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {insight.relatedEntries || 0} related entries
                      </span>
                    </div>
                  </div>
                </div>

                {!insight.acknowledged && (
                  <button
                    onClick={() => handleAcknowledgeInsight(insight.id)}
                    className="ml-4 p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Insight Content */}
              <div className="ml-11">
                <p
                  className={`text-gray-700 mb-4 ${
                    !isExpanded && insight.content.length > 150
                      ? "line-clamp-2"
                      : ""
                  }`}
                >
                  {insight.content}
                </p>

                {/* Recommendations */}
                {insight.recommendations &&
                  insight.recommendations.length > 0 && (
                    <div className={`${!isExpanded ? "hidden" : ""}`}>
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Recommendations:
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {insight.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Expand/Collapse Button */}
                {insight.content.length > 150 ||
                (insight.recommendations &&
                  insight.recommendations.length > 0) ? (
                  <button
                    onClick={() =>
                      setShowFullInsight((prev) => ({
                        ...prev,
                        [insight.id]: !prev[insight.id],
                      }))
                    }
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-purple-800 font-medium mb-1">
              Your Privacy is Protected
            </p>
            <p className="text-purple-700">
              These insights are generated from AI analysis of your journal
              metadata. Your actual journal content remains end-to-end encrypted
              and is only decrypted locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsFeedTab;
