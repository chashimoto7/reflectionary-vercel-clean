// frontend/src/components/history/tabs/SearchFilterTab.jsx
import React, { useState, useMemo } from "react";
import AudioButton from "../../AudioButton";
import AudioPlayer from "../../AudioPlayer";
import {
  Search,
  Filter,
  X,
  Star,
  Pin,
  FolderOpen,
  Calendar,
  Target,
  Clock,
  Eye,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ChevronDown,
  Edit3,
} from "lucide-react";

const SearchFilterTab = ({
  entries = [],
  folders = [],
  goals = [],
  searchQuery = "",
  setSearchQuery,
  filters = {},
  setFilters,
  colors = {},
}) => {
  const [audioEntry, setAudioEntry] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Filter and search logic
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.decryptedContent?.toLowerCase().includes(query) ||
          entry.decryptedPrompt?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.folder) {
      filtered = filtered.filter((entry) => entry.folder_id === filters.folder);
    }
    if (filters.goal) {
      filtered = filtered.filter((entry) => {
        const goalTitle = goals
          .find((g) => g.id === filters.goal)
          ?.decryptedTitle?.toLowerCase();
        return (
          goalTitle && entry.decryptedContent?.toLowerCase().includes(goalTitle)
        );
      });
    }
    if (filters.starred) {
      filtered = filtered.filter((entry) => entry.starred);
    }
    if (filters.pinned) {
      filtered = filtered.filter((entry) => entry.pinned);
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(b.created_at) - new Date(a.created_at);
          break;
        case "words":
          const aWords = a.decryptedContent?.split(" ").length || 0;
          const bWords = b.decryptedContent?.split(" ").length || 0;
          comparison = bWords - aWords;
          break;
        case "alphabetical":
          comparison = (a.decryptedContent || "").localeCompare(
            b.decryptedContent || ""
          );
          break;
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });

    return filtered;
  }, [entries, searchQuery, filters, folders, goals, sortBy, sortOrder]);

  const clearFilters = () => {
    setFilters({
      folder: "",
      goal: "",
      starred: false,
      pinned: false,
    });
    setSearchQuery("");
  };

  const EntryCard = ({ entry }) => {
    const wordCount = entry.decryptedContent?.split(" ").length || 0;
    const preview = entry.decryptedContent?.substring(0, 150) + "...";

    return (
      <div
        className={`
          p-4 rounded-lg border transition-all cursor-pointer
          ${viewMode === "grid" ? "h-full" : ""}
          bg-white/10 border-white/20 hover:bg-purple-600/20 hover:border-purple-500/50
        `}
        onClick={() => {
          setSelectedEntry(entry);
          setShowEntryModal(true);
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              {new Date(entry.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {entry.starred && <Star className="h-4 w-4 text-yellow-400" />}
            {entry.pinned && <Pin className="h-4 w-4 text-blue-400" />}
            {entry.folder_id && (
              <FolderOpen className="h-4 w-4 text-purple-400" />
            )}
          </div>
        </div>

        {/* Content preview */}
        <p className="text-sm text-gray-300 mb-3 line-clamp-3">{preview}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{wordCount} words</span>
          <div className="flex items-center gap-2">
            <AudioButton
              onClick={(e) => {
                e.stopPropagation();
                setAudioEntry(entry);
              }}
              size="small"
            />
            <button
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntry(entry);
                setShowEntryModal(true);
              }}
            >
              <Eye className="h-3 w-3" />
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EntryModal = () => {
    if (!selectedEntry) return null;

    // Function to parse HTML content
    const parseContent = (content) => {
      if (!content) return "";
      // Remove HTML tags and decode entities
      return content
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "\n\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\n\n+/g, "\n\n") // Remove extra line breaks
        .trim();
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowEntryModal(false)}
      >
        <div
          className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {new Date(selectedEntry.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <button
              onClick={() => setShowEntryModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Prompt */}
            {selectedEntry.decryptedPrompt && (
              <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-300 mb-1 font-medium">
                  Prompt
                </p>
                <p className="text-white">
                  {parseContent(selectedEntry.decryptedPrompt)}
                </p>
              </div>
            )}

            {/* Main Entry Content */}
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-white whitespace-pre-wrap">
                {parseContent(selectedEntry.decryptedContent)}
              </p>
            </div>

            {/* Follow-ups */}
            {selectedEntry.decryptedFollowUps &&
              selectedEntry.decryptedFollowUps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">
                    Follow-up Questions
                  </h4>
                  {selectedEntry.decryptedFollowUps.map((followUp, index) => (
                    <div
                      key={index}
                      className="space-y-2 pl-4 border-l-2 border-purple-500/30"
                    >
                      <div className="p-3 bg-purple-600/10 rounded-lg">
                        <p className="text-sm text-purple-300 mb-1">
                          Question {index + 1}
                        </p>
                        <p className="text-white">
                          {parseContent(followUp.decryptedQuestion)}
                        </p>
                      </div>
                      {followUp.decryptedResponse && (
                        <div className="p-3 bg-slate-700/30 rounded-lg ml-4">
                          <p className="text-sm text-gray-400 mb-1">Response</p>
                          <p className="text-white whitespace-pre-wrap">
                            {parseContent(followUp.decryptedResponse)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* Footer */}
            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
              <span>
                {selectedEntry.decryptedContent?.split(" ").length || 0} words
              </span>
              {selectedEntry.starred && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  Starred
                </span>
              )}
              {selectedEntry.pinned && (
                <span className="flex items-center gap-1">
                  <Pin className="h-4 w-4 text-blue-400" />
                  Pinned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
          <p className="text-gray-400 mt-1">
            Find specific entries with powerful search and filters
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showAdvancedFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Controls */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Date</option>
              <option value="words">Word Count</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-white/10 rounded hover:bg-white/20 transition"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            {/* Folder Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Folder</label>
              <select
                value={filters.folder}
                onChange={(e) =>
                  setFilters({ ...filters, folder: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.decryptedName}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Related Goal
              </label>
              <select
                value={filters.goal}
                onChange={(e) =>
                  setFilters({ ...filters, goal: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Goals</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.decryptedTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Starred Filter */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.starred}
                  onChange={(e) =>
                    setFilters({ ...filters, starred: e.target.checked })
                  }
                  className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Starred Only</span>
              </label>
            </div>

            {/* Pinned Filter */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pinned}
                  onChange={(e) =>
                    setFilters({ ...filters, pinned: e.target.checked })
                  }
                  className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Pinned Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchQuery ||
          filters.folder ||
          filters.goal ||
          filters.starred ||
          filters.pinned) && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-400">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                  Search: "{searchQuery}"
                </span>
              )}
              {filters.folder && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                  Folder:{" "}
                  {folders.find((f) => f.id === filters.folder)?.decryptedName}
                </span>
              )}
              {filters.goal && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                  Goal:{" "}
                  {goals.find((g) => g.id === filters.goal)?.decryptedTitle}
                </span>
              )}
              {filters.starred && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                  Starred
                </span>
              )}
              {filters.pinned && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                  Pinned
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Found {filteredEntries.length} entries
        </p>
      </div>

      {/* Results Grid/List */}
      <div
        className={`
          ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        `}
      >
        {filteredEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            No entries found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && <EntryModal />}

      {audioEntry && (
        <AudioPlayer
          entry={audioEntry}
          onClose={() => setAudioEntry(null)}
          position="bottom-right"
        />
      )}
    </div>
  );
};

export default SearchFilterTab;
