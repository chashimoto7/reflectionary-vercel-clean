//src/pages/Basic Analytics
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { BookOpen, Calendar, Clock, TrendingUp, Hash } from "lucide-react";

const BasicAnalytics = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalEntries: 0,
    totalWords: 0,
    averageWordsPerEntry: 0,
    daysJournaling: 0,
    weeklyData: [],
    monthlyData: [],
    themes: [],
  });

  useEffect(() => {
    if (user) {
      fetchEntriesAndAnalyze();
    }
  }, [user]);

  const fetchEntriesAndAnalyze = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, title, content, created_at, word_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching entries:", error);
        return;
      }

      setEntries(data || []);
      analyzeData(data || []);
    } catch (error) {
      console.error("Unexpected error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (entries) => {
    if (!entries.length) {
      setAnalytics({
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        daysJournaling: 0,
        weeklyData: [],
        monthlyData: [],
        themes: [],
      });
      return;
    }

    // Basic stats
    const totalEntries = entries.length;
    const totalWords = entries.reduce(
      (sum, entry) => sum + (entry.word_count || 0),
      0
    );
    const averageWordsPerEntry = Math.round(totalWords / totalEntries);

    // Calculate days journaling
    const firstEntry = new Date(entries[0].created_at);
    const lastEntry = new Date(entries[entries.length - 1].created_at);
    const daysJournaling =
      Math.ceil((lastEntry - firstEntry) / (1000 * 60 * 60 * 24)) + 1;

    // Weekly data for the last 8 weeks
    const weeklyData = generateWeeklyData(entries);

    // Monthly data for the last 6 months
    const monthlyData = generateMonthlyData(entries);

    // Basic theme extraction
    const themes = extractThemes(entries);

    setAnalytics({
      totalEntries,
      totalWords,
      averageWordsPerEntry,
      daysJournaling,
      weeklyData,
      monthlyData,
      themes,
    });
  };

  const generateWeeklyData = (entries) => {
    const weeks = [];
    const now = new Date();

    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      weeks.push({
        week: `Week ${8 - i}`,
        entries: weekEntries.length,
        words: weekEntries.reduce(
          (sum, entry) => sum + (entry.word_count || 0),
          0
        ),
      });
    }

    return weeks;
  };

  const generateMonthlyData = (entries) => {
    const months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });

      months.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        entries: monthEntries.length,
        words: monthEntries.reduce(
          (sum, entry) => sum + (entry.word_count || 0),
          0
        ),
      });
    }

    return months;
  };

  const extractThemes = (entries) => {
    // Simple keyword extraction - looking for common themes
    const commonThemes = [
      "work",
      "family",
      "friends",
      "health",
      "exercise",
      "stress",
      "happy",
      "sad",
      "anxious",
      "grateful",
      "tired",
      "excited",
      "worried",
      "love",
      "relationship",
      "career",
      "money",
      "travel",
      "home",
      "goals",
      "dreams",
      "fear",
      "anger",
      "peace",
      "meditation",
      "sleep",
      "food",
      "hobby",
      "learning",
      "growth",
    ];

    const themeCount = {};

    entries.forEach((entry) => {
      const content = (entry.content + " " + (entry.title || "")).toLowerCase();
      const words = content.replace(/<[^>]*>/g, "").split(/\s+/);

      commonThemes.forEach((theme) => {
        const matches = words.filter(
          (word) =>
            word.includes(theme) || theme.includes(word.replace(/[^a-z]/g, ""))
        ).length;

        if (matches > 0) {
          themeCount[theme] = (themeCount[theme] || 0) + matches;
        }
      });
    });

    // Return top 10 themes
    return Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Basic Analytics
          </h1>
          <p className="text-gray-600">
            Track your journaling habits and discover patterns in your writing.
          </p>
        </div>

        {analytics.totalEntries === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No data to analyze yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start journaling to see your analytics and patterns.
            </p>
            <button
              onClick={() => (window.location.href = "/journal")}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Start Journaling
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Entries
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalEntries}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hash className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Words
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalWords.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Words/Entry
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.averageWordsPerEntry}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Days Journaling
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.daysJournaling}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Weekly Entries Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Weekly Entries
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Word Count Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly Word Count
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="words"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Common Themes */}
            {analytics.themes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Common Themes
                </h3>
                <p className="text-gray-600 mb-4">
                  Most frequently mentioned topics in your journal entries:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.themes.map((theme, index) => (
                    <div
                      key={theme.theme}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900 capitalize">
                        {theme.theme}
                      </span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {theme.count} mentions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BasicAnalytics;
