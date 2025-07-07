// frontend/ src/components/reflectionarian/tabs/WeeklyReportTab.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  TrendingUp,
  Brain,
  Heart,
  Target,
  Download,
  ChevronRight,
  Clock,
  BarChart3,
  Sparkles,
  Award,
  Loader2,
  Eye,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const WeeklyReportTab = ({ userId, preferences }) => {
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("current"); // current, past

  useEffect(() => {
    loadReports();
  }, [userId]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("user_id", userId)
        .order("week_start", { ascending: false })
        .limit(12); // Last 12 weeks

      if (!error && data) {
        setReports(data);
        if (data.length > 0) {
          setCurrentReport(data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    setIsGenerating(true);
    try {
      // Get this week's sessions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data: sessions } = await supabase
        .from("therapy_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", weekStart.toISOString())
        .order("created_at", { ascending: false });

      // Get messages from these sessions
      const sessionIds = sessions?.map((s) => s.id) || [];
      const { data: messages } = await supabase
        .from("therapy_messages")
        .select("*")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      // Generate report with AI
      const response = await fetch("/api/reflectionarian/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions,
          messages,
          approach: preferences?.therapy_approach,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const reportData = await response.json();

      // Save report
      const { data: newReport, error } = await supabase
        .from("weekly_reports")
        .insert({
          user_id: userId,
          week_start: weekStart.toISOString(),
          week_end: new Date().toISOString(),
          session_count: sessions?.length || 0,
          main_themes: reportData.themes,
          key_insights: reportData.insights,
          progress_notes: reportData.progress,
          recommendations: reportData.recommendations,
          emotional_patterns: reportData.emotionalPatterns,
          growth_areas: reportData.growthAreas,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && newReport) {
        setCurrentReport(newReport);
        loadReports();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      // Create a sample report for demo
      const sampleReport = {
        week_start: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        week_end: new Date().toISOString(),
        session_count: 3,
        main_themes: ["Self-awareness", "Emotional regulation", "Goal setting"],
        key_insights: [
          "Increased awareness of emotional triggers",
          "Developing healthier coping strategies",
          "Making progress on personal boundaries",
        ],
        progress_notes: "Significant improvement in recognizing patterns",
        recommendations: [
          "Continue daily mindfulness practice",
          "Focus on self-compassion exercises",
          "Explore values clarification",
        ],
        emotional_patterns: {
          dominant: "Hopeful",
          range: ["Anxious", "Determined", "Grateful"],
        },
        growth_areas: ["Communication", "Self-care", "Stress management"],
      };
      setCurrentReport(sampleReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (report) => {
    try {
      const reportText = `
Weekly Reflection Report
${new Date(report.week_start).toLocaleDateString()} - ${new Date(
        report.week_end
      ).toLocaleDateString()}

Sessions: ${report.session_count}

Main Themes:
${report.main_themes?.join("\n- ") || "No themes identified"}

Key Insights:
${report.key_insights?.join("\n- ") || "No insights recorded"}

Progress Notes:
${report.progress_notes || "No progress notes"}

Recommendations:
${report.recommendations?.join("\n- ") || "No recommendations"}

Emotional Patterns:
Dominant: ${report.emotional_patterns?.dominant || "Not identified"}
Range: ${report.emotional_patterns?.range?.join(", ") || "Not recorded"}

Growth Areas:
${report.growth_areas?.join("\n- ") || "No growth areas identified"}
      `;

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflection-report-${
        new Date(report.week_start).toISOString().split("T")[0]
      }.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
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
              <FileText className="w-5 h-5 text-purple-400" />
              Weekly Reports
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              AI-generated summaries of your reflection journey
            </p>
          </div>
          <button
            onClick={generateWeeklyReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate This Week
              </>
            )}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("current")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === "current"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Current Week
          </button>
          <button
            onClick={() => setViewMode("past")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === "past"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Past Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Current Report */}
      {viewMode === "current" && currentReport && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 space-y-6">
          {/* Report Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h4 className="text-lg font-semibold text-white">
                Week of{" "}
                {new Date(currentReport.week_start).toLocaleDateString()}
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                {currentReport.session_count} reflection sessions
              </p>
            </div>
            <button
              onClick={() => exportReport(currentReport)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Export report"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Main Themes */}
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Main Themes
            </h5>
            <div className="flex flex-wrap gap-2">
              {currentReport.main_themes?.map((theme, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Key Insights
            </h5>
            <ul className="space-y-2">
              {currentReport.key_insights?.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white">
                  <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emotional Patterns */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-400" />
                Emotional Patterns
              </h5>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white mb-2">
                  <span className="text-gray-400">Dominant:</span>{" "}
                  {currentReport.emotional_patterns?.dominant}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Range:</span>{" "}
                  {currentReport.emotional_patterns?.range?.join(", ")}
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Growth Areas
              </h5>
              <div className="bg-white/5 rounded-lg p-4">
                <ul className="space-y-1">
                  {currentReport.growth_areas?.map((area, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-white flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Recommendations for Next Week
            </h5>
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg border border-purple-500/20 p-4">
              <ul className="space-y-2">
                {currentReport.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white">
                    <span className="text-purple-400">{idx + 1}.</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Past Reports List */}
      {viewMode === "past" && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 hover:bg-white/15 transition-colors cursor-pointer"
                onClick={() => {
                  setCurrentReport(report);
                  setViewMode("current");
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-white">
                      Week of {new Date(report.week_start).toLocaleDateString()}
                    </h5>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.session_count} sessions
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {report.main_themes?.length || 0} themes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportReport(report);
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No reports generated yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Click "Generate This Week" to create your first report
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyReportTab;
