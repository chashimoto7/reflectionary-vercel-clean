// src/pages/PremiumHistory.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import {
  Calendar,
  Search,
  Filter,
  Star,
  Pin,
  FolderOpen,
  Clock,
  TrendingUp,
  Heart,
  Brain,
  Zap,
  Download,
  Eye,
  Play,
  FileText,
  BookOpen,
  Lightbulb,
  BarChart3,
  Info,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Edit3,
  Hash,
  Feather,
  Activity,
} from "lucide-react";

// Import separate tab components
import OverviewTab from "../components/history/tabs/OverviewTab";
import CalendarViewTab from "../components/history/tabs/CalendarViewTab";
import SearchFilterTab from "../components/history/tabs/SearchFilterTab";
import FoldersTab from "../components/history/tabs/FoldersTab";
import StarredPinnedTab from "../components/history/tabs/StarredPinnedTab";
import WritingPatternsTab from "../components/history/tabs/WritingPatternsTab";
import ContentAnalysisTab from "../components/history/tabs/ContentAnalysisTab";
import GoalConnectionsTab from "../components/history/tabs/GoalConnectionsTab";
import WritingStyleEvolutionTab from "../components/history/tabs/WritingStyleEvolutionTab";
import JournalHealthMetricsTab from "../components/history/tabs/JournalHealthMetricsTab";

const AdvancedHistory = () => {
  const { user } = useAuth();
  const { hasAccess, tier, loading: membershipLoading } = useMembership();
  const [entries, setEntries] = useState([]);
  const [folders, setFolders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("3months");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    mood: "",
    theme: "",
    tone: "",
    folder: "",
    goal: "",
    starred: false,
    pinned: false,
  });
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalEntries: 0,
    moodDistribution: [],
    themeFrequency: [],
    entryTrends: [],
    // Add new analytics properties for the new tabs
    writingPatterns: null,
    contentAnalysis: null,
    styleEvolution: null,
    journalHealth: null,
  });

  // Advanced color palette matching other Advanced pages
  const colors = {
    primary: "#8B5CF6", // Purple
    secondary: "#06B6D4", // Cyan
    accent: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    danger: "#EF4444", // Red
    pink: "#EC4899", // Pink
    indigo: "#6366F1", // Indigo
    lime: "#84CC16", // Lime
    gradient: [
      "#8B5CF6",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#6366F1",
      "#84CC16",
    ],
  };

  // Updated tabs structure - 10 tabs in two rows matching your exact requirements
  const advancedTabs = [
    {
      id: "overview",
      label: "Intelligence Overview",
      icon: TrendingUp,
      component: OverviewTab,
    },
    {
      id: "calendar",
      label: "Calendar View",
      icon: Calendar,
      component: CalendarViewTab,
    },
    {
      id: "search-filter",
      label: "Advanced Search",
      icon: Search,
      component: SearchFilterTab,
    },
    {
      id: "folders",
      label: "Folders & Organization",
      icon: FolderOpen,
      component: FoldersTab,
    },
    {
      id: "starred-pinned",
      label: "Starred & Pinned",
      icon: Star,
      component: StarredPinnedTab,
    },
    {
      id: "writing-patterns",
      label: "Writing Patterns",
      icon: Edit3,
      component: WritingPatternsTab,
    },
    {
      id: "content-analysis",
      label: "Content Analysis",
      icon: Hash,
      component: ContentAnalysisTab,
    },
    {
      id: "goal-connections",
      label: "Goal Progress Tracking",
      icon: Target,
      component: GoalConnectionsTab,
    },
    {
      id: "style-evolution",
      label: "Writing Style Evolution",
      icon: Feather,
      component: WritingStyleEvolutionTab,
    },
    {
      id: "health-metrics",
      label: "Journal Health Metrics",
      icon: Heart,
      component: JournalHealthMetricsTab,
    },
  ];

  // Check access control
  useEffect(() => {
    if (!user || membershipLoading) {
      return;
    }

    const userHasAccess = hasAccess("advanced_history");

    if (userHasAccess) {
      loadHistoryData();
    } else {
      setLoading(false);
    }
  }, [user, dateRange, tier, membershipLoading]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
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
        default:
          startDate.setMonth(startDate.getMonth() - 3);
      }

      // Use backend API to get decrypted entries with analytics
      const historyResponse = await fetch(
        `/api/history?user_id=${
          user.id
        }&date_from=${startDate.toISOString()}&date_to=${endDate.toISOString()}&include_analytics=true&include_followups=true`
      );

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch history");
      }

      const historyData = await historyResponse.json();

      setEntries(historyData.entries || []);

      // Set analytics if provided by backend
      if (historyData.analytics) {
        setAnalytics((prevAnalytics) => ({
          ...prevAnalytics,
          ...historyData.analytics,
        }));
      }

      // Load folders using backend API
      const foldersResponse = await fetch(
        `/api/folders?user_id=${user.id}&include_entry_count=true`
      );

      if (!foldersResponse.ok) {
        throw new Error("Failed to fetch folders");
      }

      const foldersData = await foldersResponse.json();
      setFolders(foldersData.folders || []);

      // Load goals using backend API
      const goalsResponse = await fetch(`/api/goals?user_id=${user.id}`);

      if (!goalsResponse.ok) {
        throw new Error("Failed to fetch goals");
      }

      const goalsData = await goalsResponse.json();
      setGoals(goalsData.goals || []);

      // Calculate additional analytics if not provided by backend
      if (!historyData.analytics) {
        calculateAnalytics(historyData.entries || []);
      }
    } catch (error) {
      console.error("Error loading history data:", error);
      setError("Failed to load your journal history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (entriesData) => {
    if (!entriesData || entriesData.length === 0) return;

    // Basic analytics calculations
    const totalEntries = entriesData.length;

    // Mood distribution
    const moodCounts = {};
    entriesData.forEach((entry) => {
      const mood = entry.mood || "neutral";
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const moodDistribution = Object.entries(moodCounts).map(
      ([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / totalEntries) * 100),
      })
    );

    // Theme frequency
    const themeCounts = {};
    entriesData.forEach((entry) => {
      const theme = entry.theme || "general";
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });

    const themeFrequency = Object.entries(themeCounts)
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: Math.round((count / totalEntries) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Entry trends (weekly)
    const entryTrends = calculateWeeklyTrends(entriesData);

    setAnalytics((prev) => ({
      ...prev,
      totalEntries,
      moodDistribution,
      themeFrequency,
      entryTrends,
    }));
  };

  const calculateWeeklyTrends = (entriesData) => {
    const weeklyData = {};

    entriesData.forEach((entry) => {
      const date = new Date(entry.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { count: 0, moods: [] };
      }

      weeklyData[weekKey].count++;
      if (entry.mood) {
        weeklyData[weekKey].moods.push(entry.mood);
      }
    });

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: data.count,
        avgMood:
          data.moods.length > 0
            ? Math.round(
                data.moods.reduce((sum, mood) => {
                  const moodValues = {
                    very_negative: 1,
                    negative: 2,
                    neutral: 3,
                    positive: 4,
                    very_positive: 5,
                  };
                  return sum + (moodValues[mood] || 3);
                }, 0) / data.moods.length
              )
            : 3,
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-12); // Last 12 weeks
  };

  // Search functionality using backend
  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadHistoryData(); // Reload all data
      return;
    }

    try {
      setLoading(true);
      const searchResponse = await fetch("/api/search-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          query: query,
          date_from: dateRange
            ? new Date(
                new Date().setMonth(new Date().getMonth() - parseInt(dateRange))
              ).toISOString()
            : undefined,
          filters: filters,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("Search failed");
      }

      const searchData = await searchResponse.json();
      setEntries(searchData.entries || []);
      calculateAnalytics(searchData.entries || []);
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Access control check
  if (!user || membershipLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal history...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess("advanced_history")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Advanced History Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Premium to unlock the Advanced Journal History with
            advanced search, mood analysis, calendar views, and more.
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your journal history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={loadHistoryData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const EmptyHistoryState = () => (
    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No Journal Entries Found
      </h3>
      <p className="text-gray-300 mb-6">
        Start journaling to see your entries, insights, and patterns here.
      </p>
      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
        Write Your First Entry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Advanced Journal History
              </h1>
              <p className="text-gray-400">
                Explore patterns, insights, and connections in your journaling
                journey
              </p>
            </div>

            {/* Privacy Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition bg-white/10 rounded-lg"
              >
                <Shield className="h-4 w-4" />
                Privacy Info
                <Info className="h-4 w-4" />
              </button>

              {showPrivacyInfo && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-white/20 rounded-lg shadow-lg p-4 z-10">
                  <p className="text-sm text-gray-300">
                    All analysis is performed on your encrypted data locally.
                    Your journal content remains end-to-end encrypted. This data
                    is visible only to you and never shared.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date Range & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-300">
                Analysis Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              AI History Analysis Active
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <>
            {/* Advanced Tabs - 2x5 Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-5 gap-2">
                {advancedTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const rowClass = index < 5 ? "row-start-1" : "row-start-2";

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        ${rowClass}
                        flex flex-col items-center justify-center p-4 rounded-lg transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                            : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium text-center">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
              {activeTab === "overview" && (
                <OverviewTab
                  entries={entries}
                  analytics={analytics}
                  colors={colors}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarViewTab entries={entries} colors={colors} />
              )}
              {activeTab === "search-filter" && (
                <SearchFilterTab
                  entries={entries}
                  setEntries={setEntries}
                  filters={filters}
                  setFilters={setFilters}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={handleSearch}
                  colors={colors}
                />
              )}
              {activeTab === "folders" && (
                <FoldersTab
                  entries={entries}
                  folders={folders}
                  colors={colors}
                />
              )}
              {activeTab === "starred-pinned" && (
                <StarredPinnedTab entries={entries} colors={colors} />
              )}
              {activeTab === "writing-patterns" && (
                <WritingPatternsTab
                  entries={entries}
                  analytics={analytics}
                  colors={colors}
                />
              )}
              {activeTab === "content-analysis" && (
                <ContentAnalysisTab
                  entries={entries}
                  analytics={analytics}
                  colors={colors}
                />
              )}
              {activeTab === "goal-connections" && (
                <GoalConnectionsTab
                  entries={entries}
                  goals={goals}
                  colors={colors}
                />
              )}
              {activeTab === "style-evolution" && (
                <WritingStyleEvolutionTab
                  entries={entries}
                  analytics={analytics}
                  colors={colors}
                />
              )}
              {activeTab === "health-metrics" && (
                <JournalHealthMetricsTab
                  entries={entries}
                  analytics={analytics}
                  colors={colors}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedHistory;
