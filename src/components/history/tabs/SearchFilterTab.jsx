// src/components/history/tabs/SearchFilterTab.jsx
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  Star,
  Pin,
  FolderOpen,
  Calendar,
  Heart,
  Brain,
  Target,
  Clock,
  Eye,
  Play,
  Download,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from "lucide-react";

const SearchFilterTab = ({
  entries,
  folders,
  goals,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  colors,
}) => {
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter and search logic
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.decryptedContent?.toLowerCase().includes(query) ||
          entry.decryptedPrompt?.toLowerCase().includes(query) ||
          entry.decryptedFollowUps?.some(
            (fu) =>
              fu.decryptedQuestion?.toLowerCase().includes(query) ||
              fu.decryptedResponse?.toLowerCase().includes(query)
          )
      );
    }

    // Apply filters
    if (filters.mood) {
      filtered = filtered.filter((entry) => entry.mood === filters.mood);
    }
    if (filters.theme) {
      filtered = filtered.filter((entry) => entry.theme === filters.theme);
    }
    if (filters.tone) {
      filtered = filtered.filter((entry) => entry.tone === filters.tone);
    }
    if (filters.folder) {
      filtered = filtered.filter((entry) => entry.folder_id === filters.folder);
    }
    if (filters.goal) {
      // This would check if the entry mentions the goal
      filtered = filtered.filter((entry) =>
        entry.decryptedContent
          ?.toLowerCase()
          .includes(
            goals
              .find((g) => g.id === filters.goal)
              ?.decryptedTitle?.toLowerCase() || ""
          )
      );
    }
    if (filters.starred) {
      filtered = filtered.filter((entry) => entry.starred);
    }
    if (filters.pinned) {
      filtered = filtered.filter((entry) => entry.pinned);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "wordCount":
          aValue = a.decryptedContent?.split(" ").length || 0;
          bValue = b.decryptedContent?.split(" ").length || 0;
          break;
        case "mood":
          aValue = a.mood || "";
          bValue = b.mood || "";
          break;
        case "theme":
          aValue = a.theme || "";
          bValue = b.theme || "";
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [entries, searchQuery, filters, sortBy, sortOrder, goals]);

  // Get unique values for filter dropdowns
  const uniqueMoods = [...new Set(entries.map((e) => e.mood).filter(Boolean))];
  const uniqueThemes = [
    ...new Set(entries.map((e) => e.theme).filter(Boolean)),
  ];
  const uniqueTones = [...new Set(entries.map((e) => e.tone).filter(Boolean))];

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      mood: "",
      theme: "",
      tone: "",
      folder: "",
      goal: "",
      starred: false,
      pinned: false,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.mood) count++;
    if (filters.theme) count++;
    if (filters.tone) count++;
    if (filters.folder) count++;
    if (filters.goal) count++;
    if (filters.starred) count++;
    if (filters.pinned) count++;
    return count;
  };

  const EntryCard = ({ entry, isGrid = false }) => (
    <div
      className={`
        bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 
        transition cursor-pointer
        ${isGrid ? "h-full" : ""}
      `}
      onClick={() => setSelectedEntry(entry)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">
          {new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-2">
          {entry.starred && <Star className="h-4 w-4 text-yellow-500" />}
          {entry.pinned && <Pin className="h-4 w-4 text-blue-500" />}
          {entry.folder_id && (
            <FolderOpen className="h-4 w-4 text-purple-500" />
          )}
        </div>
      </div>

      {/* Prompt */}
      {entry.decryptedPrompt && (
        <div className="mb-2">
          <p className="text-xs text-purple-600 italic line-clamp-2">
            {entry.decryptedPrompt}
          </p>
        </div>
      )}

      {/* Content preview */}
      <div className={`mb-3 ${isGrid ? "line-clamp-4" : "line-clamp-3"}`}>
        <p className="text-sm text-gray-700">{entry.decryptedContent}</p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && (
            <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
              {entry.mood}
            </span>
          )}
          {entry.theme && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {entry.theme}
            </span>
          )}
          {entry.tone && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              {entry.tone}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {entry.decryptedContent?.split(" ").length || 0} words
        </span>
      </div>

      {/* Follow-ups indicator */}
      {entry.decryptedFollowUps && entry.decryptedFollowUps.length > 0 && (
        <div className="mt-2 text-xs text-purple-600">
          +{entry.decryptedFollowUps.length} follow-up
          {entry.decryptedFollowUps.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        {/* Main search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your journal entries, prompts, and follow-ups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, starred: !prev.starred }))
            }
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
              filters.starred
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Star className="h-4 w-4" />
            Starred
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, pinned: !prev.pinned }))
            }
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
              filters.pinned
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Pin className="h-4 w-4" />
            Pinned
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
              showAdvancedFilters
                ? "bg-purple-50 border-purple-200 text-purple-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Mood filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <select
                value={filters.mood}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, mood: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All moods</option>
                {uniqueMoods.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                value={filters.theme}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, theme: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All themes</option>
                {uniqueThemes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={filters.tone}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, tone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All tones</option>
                {uniqueTones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            {/* Folder filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <select
                value={filters.folder}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, folder: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.decryptedName}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related to Goal
              </label>
              <select
                value={filters.goal}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, goal: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All goals</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.decryptedTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results header and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredEntries.length} entries found
          </h3>

          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filters active:</span>
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">Sort by Date</option>
            <option value="wordCount">Sort by Length</option>
            <option value="mood">Sort by Mood</option>
            <option value="theme">Sort by Theme</option>
          </select>

          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>

          {/* View mode toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No entries found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isGrid={viewMode === "grid"}
            />
          ))}
        </div>
      )}

      {/* Entry details modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Journal Entry
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Entry content - similar to calendar modal */}
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {new Date(selectedEntry.created_at).toLocaleString()}
                </div>

                {selectedEntry.decryptedPrompt && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-1">
                      Prompt:
                    </p>
                    <p className="text-sm text-purple-700 italic">
                      {selectedEntry.decryptedPrompt}
                    </p>
                  </div>
                )}

                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedEntry.html_content ||
                        `<p>${selectedEntry.decryptedContent}</p>`,
                    }}
                  />
                </div>

                {selectedEntry.decryptedFollowUps &&
                  selectedEntry.decryptedFollowUps.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        Follow-up Reflections
                      </h4>
                      {selectedEntry.decryptedFollowUps.map(
                        (followUp, index) => (
                          <div
                            key={followUp.id || index}
                            className="border-l-4 border-purple-200 pl-4"
                          >
                            <p className="text-sm font-medium text-purple-700 mb-1">
                              {followUp.decryptedQuestion}
                            </p>
                            <p className="text-sm text-gray-700">
                              {followUp.decryptedResponse}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterTab;
