// frontend/src/pages/PremiumHistory.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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

const PremiumHistory = () => {
  const { user } = useAuth();
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
  const [databaseEnvironment, setDatabaseEnvironment] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalEntries: 0,
    moodDistribution: [],
    themeFrequency: [],
    entryTrends: [],
    averageWordCount: 0,
    topTopics: [],
    topEmotions: [],
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

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

  // Updated tabs structure - 11 tabs including data export
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
    if (!user) {
      return;
    }

    console.log("🎯 PremiumHistory: User authenticated, loading data...");
    loadHistoryData();
  }, [user, dateRange]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading history data for user:", user.id);

      // Load entries with the new API
      const historyResponse = await fetch(
        `${API_BASE}/api/history?user_id=${user.id}&page=1&limit=100&date_range=${dateRange}&include_analytics=true`
      );

      console.log("📡 History response status:", historyResponse.status);

      if (!historyResponse.ok) {
        const errorText = await historyResponse.text();
        console.error("❌ History API error response:", errorText);
        throw new Error(
          `API returned ${historyResponse.status}: ${errorText.substring(
            0,
            100
          )}`
        );
      }

      const historyData = await historyResponse.json();
      console.log("📊 Raw history data received:", historyData);

      // Track which database is being used
      if (historyData.database) {
        setDatabaseEnvironment(historyData.database);
        console.log(`🗄️ Using ${historyData.database} database`);
      }

      // Process entries to ensure they have the expected structure
      const processedEntries = processEntries(historyData.entries || []);
      console.log("✅ Processed entries:", processedEntries.length);
      setEntries(processedEntries);

      // Handle analytics
      if (historyData.analytics && typeof historyData.analytics === "object") {
        console.log("📈 Analytics data found:", historyData.analytics);
        setAnalytics((prevAnalytics) => ({
          ...prevAnalytics,
          ...historyData.analytics,
        }));
      } else {
        console.log("📈 No analytics from backend, calculating locally...");
        calculateAnalytics(processedEntries);
      }

      // Load folders separately
      try {
        console.log("📁 Loading folders...");
        const foldersResponse = await fetch(
          `${API_BASE}/api/folders?user_id=${user.id}`
        );

        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          const processedFolders = processFolders(foldersData.folders || []);
          setFolders(processedFolders);
          console.log("✅ Folders loaded:", processedFolders.length);
        } else {
          console.warn("⚠️ Folders API failed:", foldersResponse.status);
          setFolders([]);
        }
      } catch (folderError) {
        console.warn("⚠️ Failed to load folders:", folderError.message);
        setFolders([]);
      }

      // Load goals separately
      try {
        console.log("🎯 Loading goals...");
        const goalsResponse = await fetch(
          `${API_BASE}/api/goals?user_id=${user.id}`
        );

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          const processedGoals = processGoals(goalsData.goals || []);
          setGoals(processedGoals);
          console.log("✅ Goals loaded:", processedGoals.length);
        } else {
          console.warn("⚠️ Goals API failed:", goalsResponse.status);
          setGoals([]);
        }
      } catch (goalError) {
        console.warn("⚠️ Failed to load goals:", goalError.message);
        setGoals([]);
      }
    } catch (error) {
      console.error("❌ Error loading history data:", error);
      setError(`Failed to load journal history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process entries to ensure they have the expected decrypted fields
  const processEntries = (rawEntries) => {
    return rawEntries.map((entry) => {
      // Ensure the entry has all expected fields for the tab components
      return {
        ...entry,
        // Map decrypted fields from backend response
        decryptedContent: entry.content || entry.decryptedContent || "",
        decryptedPrompt: entry.prompt || entry.decryptedPrompt || "",
        decryptedFollowUps: processFollowUps(
          entry.followUps || entry.follow_ups || []
        ),
        // Ensure other expected fields exist
        created_at: entry.created_at || entry.createdAt,
        updated_at: entry.updated_at || entry.updatedAt,
        starred: entry.starred || false,
        pinned: entry.pinned || false,
        folder_id: entry.folder_id || entry.folderId || null,
        mood: entry.mood || "neutral",
        theme: entry.theme || "",
        tone: entry.tone || "",
        topics: entry.topics || [],
        emotions: entry.emotions || [],
      };
    });
  };

  // Process follow-ups to ensure they have the expected structure
  const processFollowUps = (followUps) => {
    if (!Array.isArray(followUps)) return [];

    return followUps.map((fu) => ({
      ...fu,
      decryptedQuestion: fu.question || fu.decryptedQuestion || "",
      decryptedResponse: fu.response || fu.decryptedResponse || "",
      created_at: fu.created_at || fu.createdAt,
    }));
  };

  // Process folders to ensure they have decrypted names
  const processFolders = (rawFolders) => {
    return rawFolders.map((folder) => ({
      ...folder,
      decryptedName: folder.name || folder.decryptedName || "Untitled Folder",
      decryptedDescription:
        folder.description || folder.decryptedDescription || "",
    }));
  };

  // Process goals to ensure they have decrypted titles
  const processGoals = (rawGoals) => {
    return rawGoals.map((goal) => ({
      ...goal,
      decryptedTitle: goal.title || goal.decryptedTitle || "Untitled Goal",
      decryptedDescription: goal.description || goal.decryptedDescription || "",
    }));
  };

  const calculateAnalytics = (entriesData) => {
    try {
      console.log(
        "📊 Calculating analytics for",
        entriesData?.length || 0,
        "entries"
      );

      if (!Array.isArray(entriesData) || entriesData.length === 0) {
        console.log("📊 No entries to analyze");
        return;
      }

      // Basic analytics calculations with safe property access
      const totalEntries = entriesData.length;

      // Calculate average word count
      const totalWords = entriesData.reduce((sum, entry) => {
        const content = entry.decryptedContent || "";
        return (
          sum + content.split(/\s+/).filter((word) => word.length > 0).length
        );
      }, 0);
      const averageWordCount = Math.round(totalWords / totalEntries);

      // Mood distribution with safe access
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

      // Theme frequency with safe access
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

      // Top topics
      const topicCounts = {};
      entriesData.forEach((entry) => {
        (entry.topics || []).forEach((topic) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      });

      const topTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top emotions
      const emotionCounts = {};
      entriesData.forEach((entry) => {
        (entry.emotions || []).forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });

      const topEmotions = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Entry trends (weekly) with safe access
      const entryTrends = calculateWeeklyTrends(entriesData);

      const calculatedAnalytics = {
        totalEntries,
        averageWordCount,
        moodDistribution,
        themeFrequency,
        topTopics,
        topEmotions,
        entryTrends,
      };

      console.log("📈 Analytics calculated:", calculatedAnalytics);

      setAnalytics((prev) => ({
        ...prev,
        ...calculatedAnalytics,
      }));
    } catch (analyticsError) {
      console.error("❌ Error calculating analytics:", analyticsError);
    }
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

  // Handler for refreshing data (used by tabs)
  const handleRefresh = () => {
    loadHistoryData();
  };

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
      <button
        onClick={() => (window.location.href = "/journal")}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
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
                Premium Journal History
              </h1>
              <p className="text-gray-400">
                Explore patterns, insights, and connections in your journaling
                journey
                {databaseEnvironment && (
                  <span className="ml-2 text-xs text-purple-400">
                    ({databaseEnvironment} data)
                  </span>
                )}
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
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span>{analytics.totalEntries} entries</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                AI History Analysis Active
              </div>
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <>
            {/* Premium Tabs Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {advancedTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
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
                  folders={folders}
                  goals={goals}
                  colors={colors}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarViewTab
                  entries={entries}
                  colors={colors}
                  onEntrySelect={(entry) =>
                    console.log("Selected entry:", entry)
                  }
                />
              )}
              {activeTab === "search-filter" && (
                <SearchFilterTab
                  entries={entries}
                  folders={folders}
                  goals={goals}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filters={filters}
                  setFilters={setFilters}
                  colors={colors}
                />
              )}
              {activeTab === "folders" && (
                <FoldersTab
                  entries={entries}
                  folders={folders}
                  colors={colors}
                  onRefresh={handleRefresh}
                />
              )}
              {activeTab === "starred-pinned" && (
                <StarredPinnedTab
                  entries={entries}
                  colors={colors}
                  onRefresh={handleRefresh}
                />
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
              {activeTab === "data-export" && (
                <DataExportTab
                  entries={entries}
                  analytics={analytics}
                  folders={folders}
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

export default PremiumHistory;
