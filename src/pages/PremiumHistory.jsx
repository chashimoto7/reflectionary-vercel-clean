// src/pages/PremiumHistory.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";
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

      // Load journal entries (parent entries only, then load follow-ups separately)
      const { data: entriesData, error: entriesError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .is("parent_entry_id", null) // Only get parent entries (not follow-ups)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;

      // Get the master key using the same pattern as other components
      const masterKey = await encryptionService.getStaticMasterKey();

      // Decrypt entries and load their follow-ups
      const decryptedEntries = await Promise.all(
        (entriesData || []).map(async (entry) => {
          try {
            // Decrypt the data key first
            const dataKey = await encryptionService.decryptKey(
              {
                encryptedData: entry.encrypted_data_key,
                iv: entry.data_key_iv,
              },
              masterKey
            );

            // Decrypt content using the data key
            const decryptedContent = await encryptionService.decryptText(
              entry.encrypted_content,
              entry.content_iv,
              dataKey
            );

            // Decrypt prompt if it exists
            let decryptedPrompt = null;
            if (entry.encrypted_prompt && entry.prompt_iv) {
              decryptedPrompt = await encryptionService.decryptText(
                entry.encrypted_prompt,
                entry.prompt_iv,
                dataKey
              );
            }

            // Load follow-ups for this entry
            const { data: followUpData } = await supabase
              .from("journal_entries")
              .select("*")
              .eq("parent_entry_id", entry.id)
              .order("created_at", { ascending: true });

            // Decrypt follow-ups using the same pattern
            const decryptedFollowUps = await Promise.all(
              (followUpData || []).map(async (followUp) => {
                try {
                  // Decrypt follow-up data key
                  const followUpDataKey = await encryptionService.decryptKey(
                    {
                      encryptedData: followUp.encrypted_data_key,
                      iv: followUp.data_key_iv,
                    },
                    masterKey
                  );

                  // Decrypt follow-up content
                  const decryptedResponse = await encryptionService.decryptText(
                    followUp.encrypted_content,
                    followUp.content_iv,
                    followUpDataKey
                  );

                  // Decrypt follow-up prompt if it exists
                  let decryptedQuestion = "Follow-up reflection";
                  if (followUp.encrypted_prompt && followUp.prompt_iv) {
                    decryptedQuestion = await encryptionService.decryptText(
                      followUp.encrypted_prompt,
                      followUp.prompt_iv,
                      followUpDataKey
                    );
                  }

                  return {
                    ...followUp,
                    decryptedQuestion,
                    decryptedResponse,
                  };
                } catch (error) {
                  console.error("Error decrypting follow-up:", error);
                  return null;
                }
              })
            );

            return {
              ...entry,
              decryptedContent,
              decryptedPrompt,
              decryptedFollowUps: decryptedFollowUps.filter(Boolean),
              // Mock AI analysis data - in production this would come from batch jobs
              mood:
                entry.mood ||
                ["neutral", "calm", "hopeful"][Math.floor(Math.random() * 3)],
              theme:
                entry.theme ||
                ["personal growth", "relationships", "work", "health"][
                  Math.floor(Math.random() * 4)
                ],
              tone:
                entry.tone ||
                ["reflective", "optimistic", "analytical"][
                  Math.floor(Math.random() * 3)
                ],
              starred: entry.starred || false,
              pinned: entry.pinned || false,
              folder_id: entry.folder_id || null,
            };
          } catch (decryptError) {
            console.error("Error decrypting entry:", decryptError);
            return {
              ...entry,
              decryptedContent: "Error decrypting content",
              decryptedPrompt: null,
              decryptedFollowUps: [],
              // Add mock data even for failed decryption
              mood: "neutral",
              theme: "general",
              tone: "reflective",
              starred: false,
              pinned: false,
              folder_id: null,
            };
          }
        })
      );

      setEntries(decryptedEntries);

      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from("journal_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (foldersError) throw foldersError;

      let decryptedFolders = [];
      if (foldersData && foldersData.length > 0) {
        decryptedFolders = await Promise.all(
          foldersData.map(async (folder) => {
            try {
              // Decrypt folder name using the same approach as other components
              const decryptedName = await encryptionService.decrypt(
                folder.name
              );

              // Decrypt folder description if it exists
              let decryptedDescription = null;
              if (folder.description) {
                decryptedDescription = await encryptionService.decrypt(
                  folder.description
                );
              }

              return {
                ...folder,
                decryptedName,
                decryptedDescription,
              };
            } catch (error) {
              console.error("Error decrypting folder:", error);
              return {
                ...folder,
                decryptedName: "Error decrypting folder name",
                decryptedDescription: null,
              };
            }
          })
        );
      }

      setFolders(decryptedFolders);

      // Load goals for connections - using the correct table name
      const { data: goalsData, error: goalsError } = await supabase
        .from("user_goals") // Fixed: using user_goals instead of goals
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsError) throw goalsError;

      let decryptedGoals = [];
      if (goalsData && goalsData.length > 0) {
        decryptedGoals = await Promise.all(
          goalsData.map(async (goal) => {
            try {
              // Decrypt goal data key
              const dataKey = await encryptionService.decryptKey(
                {
                  encryptedData: goal.encrypted_data_key,
                  iv: goal.data_key_iv,
                },
                masterKey
              );

              // Decrypt goal title
              const decryptedTitle = await encryptionService.decryptText(
                goal.encrypted_goal,
                goal.goal_iv,
                dataKey
              );

              // Decrypt goal description if it exists
              let decryptedDescription = null;
              if (goal.encrypted_description && goal.description_iv) {
                decryptedDescription = await encryptionService.decryptText(
                  goal.encrypted_description,
                  goal.description_iv,
                  dataKey
                );
              }

              return {
                ...goal,
                decryptedTitle,
                decryptedDescription,
              };
            } catch (error) {
              console.error("Error decrypting goal:", error);
              return {
                ...goal,
                decryptedTitle: "Error decrypting goal",
                decryptedDescription: null,
              };
            }
          })
        );
      }

      setGoals(decryptedGoals);

      // Calculate analytics
      calculateAnalytics(decryptedEntries);
    } catch (error) {
      console.error("Error loading history data:", error);
      setError("Failed to load your journal history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (entriesData) => {
    // Calculate mood distribution
    const moodCounts = {};
    entriesData.forEach((entry) => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    const moodDistribution = Object.entries(moodCounts).map(
      ([mood, count]) => ({
        mood,
        count,
        percentage: ((count / entriesData.length) * 100).toFixed(1),
      })
    );

    // Calculate theme frequency
    const themeCounts = {};
    entriesData.forEach((entry) => {
      if (entry.theme) {
        themeCounts[entry.theme] = (themeCounts[entry.theme] || 0) + 1;
      }
    });

    const themeFrequency = Object.entries(themeCounts).map(
      ([theme, count]) => ({
        theme,
        count,
        percentage: ((count / entriesData.length) * 100).toFixed(1),
      })
    );

    // Calculate entry trends (entries per week)
    const entryTrends = calculateEntryTrends(entriesData);

    setAnalytics({
      totalEntries: entriesData.length,
      moodDistribution,
      themeFrequency,
      entryTrends,
      starredCount: entriesData.filter((e) => e.starred).length,
      pinnedCount: entriesData.filter((e) => e.pinned).length,
      foldersUsed: new Set(entriesData.map((e) => e.folder_id).filter(Boolean))
        .size,
      // These would be populated by batch AI analysis in production
      writingPatterns: null,
      contentAnalysis: null,
      styleEvolution: null,
      journalHealth: null,
    });
  };

  const calculateEntryTrends = (entriesData) => {
    // Group entries by week
    const weeklyData = {};
    entriesData.forEach((entry) => {
      const date = new Date(entry.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    return Object.entries(weeklyData)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-12); // Last 12 weeks
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
            {/* Advanced Tab Navigation - Two Row Layout */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
                {/* First Row - 5 tabs */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {advancedTabs.slice(0, 5).map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                          activeTab === tab.id
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Second Row - 5 tabs */}
                <div className="flex flex-wrap gap-2">
                  {advancedTabs.slice(5, 10).map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 ${
                          activeTab === tab.id
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
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
                  onRefresh={loadHistoryData}
                />
              )}
              {activeTab === "starred-pinned" && (
                <StarredPinnedTab
                  entries={entries}
                  colors={colors}
                  onRefresh={loadHistoryData}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedHistory;
