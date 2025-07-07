// frontend/ src/components/reflectionarian/tabs/GrowthTimelineTab.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Star,
  Flag,
  Award,
  Heart,
  Brain,
  Sparkles,
  ChevronRight,
  Clock,
  Target,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const GrowthTimelineTab = ({ userId, preferences }) => {
  const [milestones, setMilestones] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("3months"); // 1month, 3months, 6months, 1year
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    loadTimelineData();
  }, [userId, timeRange]);

  const loadTimelineData = async () => {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "1month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Load milestones
      const { data: milestonesData } = await supabase
        .from("growth_milestones")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Load session summaries for pattern analysis
      const { data: sessions } = await supabase
        .from("therapy_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (milestonesData) {
        setMilestones(milestonesData);
      }

      // Analyze patterns
      if (sessions) {
        analyzeGrowthPatterns(sessions);
      }
    } catch (error) {
      console.error("Error loading timeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGrowthPatterns = (sessions) => {
    // Mock pattern analysis - in real app, this would use AI
    const mockPatterns = [
      {
        type: "emotional_awareness",
        trend: "improving",
        description: "Increased ability to identify and articulate emotions",
        startValue: 3,
        currentValue: 8,
      },
      {
        type: "self_compassion",
        trend: "stable",
        description: "Consistent practice of self-kindness",
        startValue: 6,
        currentValue: 7,
      },
      {
        type: "boundary_setting",
        trend: "improving",
        description: "Growing confidence in establishing personal boundaries",
        startValue: 4,
        currentValue: 7,
      },
    ];
    setPatterns(mockPatterns);
  };

  const createMilestone = async (type, title, description) => {
    try {
      const { error } = await supabase.from("growth_milestones").insert({
        user_id: userId,
        type,
        title,
        description,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        loadTimelineData();
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
    }
  };

  const getMilestoneIcon = (type) => {
    const icons = {
      breakthrough: Star,
      achievement: Award,
      insight: Brain,
      emotional: Heart,
      behavioral: Target,
      default: Flag,
    };
    return icons[type] || icons.default;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case "declining":
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Growth Timeline
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Track your personal development journey over time
            </p>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Growth Patterns Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.map((pattern, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-white capitalize">
                  {pattern.type.replace(/_/g, " ")}
                </h5>
                {getTrendIcon(pattern.trend)}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Start</span>
                  <span>Current</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(pattern.currentValue / 10) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>{pattern.startValue}/10</span>
                  <span>{pattern.currentValue}/10</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">{pattern.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <h4 className="text-lg font-medium text-white mb-6">
          Your Growth Journey
        </h4>

        {/* Timeline Line */}
        <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-purple-600/30" />

        {/* Milestones */}
        <div className="space-y-6">
          {milestones.length > 0 ? (
            milestones.map((milestone, idx) => {
              const Icon = getMilestoneIcon(milestone.type);
              return (
                <div
                  key={milestone.id}
                  className="relative flex items-start gap-4 group"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 hover:bg-white/15 transition-colors cursor-pointer"
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-white">
                        {milestone.title}
                      </h5>
                      <span className="text-xs text-gray-400">
                        {new Date(milestone.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(milestone.created_at).toLocaleTimeString()}
                      </span>
                      <span className="px-2 py-1 bg-white/10 rounded">
                        {milestone.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No milestones recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your growth milestones will appear here as you progress
              </p>
            </div>
          )}
        </div>

        {/* Add Milestone Button */}
        <button
          onClick={() => {
            // In a real app, this would open a modal
            createMilestone(
              "insight",
              "New Insight Discovered",
              "Realized an important pattern in my behavior"
            );
          }}
          className="mt-8 w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Flag className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const Icon = getMilestoneIcon(selectedMilestone.type);
                return (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedMilestone.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedMilestone.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-4">
              {selectedMilestone.description}
            </p>

            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">
                This milestone represents an important moment in your growth
                journey. Reflecting on these achievements helps reinforce
                positive changes.
              </p>
            </div>

            <button
              onClick={() => setSelectedMilestone(null)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthTimelineTab;
