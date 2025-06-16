// src/components/history/tabs/StarredPinnedTab.jsx
import React, { useState, useMemo } from "react";
import {
  Star,
  Pin,
  X,
  Calendar,
  Eye,
  Play,
  Edit3,
  Share2,
  Download,
  Heart,
  Brain,
  MessageCircle,
  Clock,
  FolderOpen,
  Target,
  Sparkles,
  BookOpen,
  Zap,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const StarredPinnedTab = ({ entries, colors, onRefresh }) => {
  const [activeView, setActiveView] = useState("starred"); // "starred" or "pinned"
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter entries based on active view
  const displayedEntries = useMemo(() => {
    return entries
      .filter((entry) =>
        activeView === "starred" ? entry.starred : entry.pinned
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [entries, activeView]);

  // Get statistics
  const stats = useMemo(() => {
    const starredEntries = entries.filter((e) => e.starred);
    const pinnedEntries = entries.filter((e) => e.pinned);
    const bothStarredAndPinned = entries.filter((e) => e.starred && e.pinned);

    return {
      starredCount: starredEntries.length,
      pinnedCount: pinnedEntries.length,
      bothCount: bothStarredAndPinned.length,
      starredWordCount: starredEntries.reduce(
        (total, entry) =>
          total + (entry.decryptedContent?.split(" ").length || 0),
        0
      ),
      pinnedWordCount: pinnedEntries.reduce(
        (total, entry) =>
          total + (entry.decryptedContent?.split(" ").length || 0),
        0
      ),
    };
  }, [entries]);

  // Toggle star status
  const toggleStar = async (entryId, currentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({ starred: !currentStatus })
        .eq("id", entryId);

      if (error) throw error;
      onRefresh && onRefresh();
    } catch (error) {
      console.error("Error updating star status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle pin status
  const togglePin = async (entryId, currentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({ pinned: !currentStatus })
        .eq("id", entryId);

      if (error) throw error;
      onRefresh && onRefresh();
    } catch (error) {
      console.error("Error updating pin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const EntryCard = ({ entry }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            {entry.starred && entry.pinned && (
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-100 to-blue-100 text-gray-700 rounded">
                Starred & Pinned
              </span>
            )}
            {entry.folder_id && (
              <FolderOpen className="h-4 w-4 text-purple-500" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStar(entry.id, entry.starred)}
            disabled={loading}
            className={`p-2 rounded-lg transition ${
              entry.starred
                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
            }`}
          >
            <Star
              className={`h-4 w-4 ${entry.starred ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={() => togglePin(entry.id, entry.pinned)}
            disabled={loading}
            className={`p-2 rounded-lg transition ${
              entry.pinned
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            <Pin className={`h-4 w-4 ${entry.pinned ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Prompt */}
      {entry.decryptedPrompt && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700 italic">
            "{entry.decryptedPrompt}"
          </p>
        </div>
      )}

      {/* Content preview */}
      <div className="mb-4">
        <p className="text-gray-700 line-clamp-4">{entry.decryptedContent}</p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && (
            <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
              <Heart className="h-3 w-3 inline mr-1" />
              {entry.mood}
            </span>
          )}
          {entry.theme && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              <Brain className="h-3 w-3 inline mr-1" />
              {entry.theme}
            </span>
          )}
          {entry.tone && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              <Zap className="h-3 w-3 inline mr-1" />
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
        <div className="mb-4 flex items-center gap-2 text-sm text-purple-600">
          <MessageCircle className="h-4 w-4" />
          <span>
            {entry.decryptedFollowUps.length} follow-up reflection
            {entry.decryptedFollowUps.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedEntry(entry);
              setShowEntryModal(true);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
          >
            <Eye className="h-4 w-4" />
            View Full
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition">
            <Play className="h-4 w-4" />
            Audio
          </button>
          {entry.pinned && (
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition">
              <Edit3 className="h-4 w-4" />
              Continue Thread
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded transition">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded transition">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      {activeView === "starred" ? (
        <>
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Starred Entries Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Star your favorite entries to create a collection of meaningful
            moments and insights.
          </p>
        </>
      ) : (
        <>
          <Pin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pinned Entries Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Pin entries to continue journaling threads and revisit important
            thoughts later.
          </p>
        </>
      )}
      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
        Start Journaling
      </button>
    </div>
  );

  const EntryModal = () => {
    if (!selectedEntry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedEntry.starred && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                  {selectedEntry.pinned && (
                    <Pin className="h-5 w-5 text-blue-500 fill-current" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Journal Entry
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedEntry.created_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Why it's special */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">
                  Why This Entry is Special
                </h4>
              </div>
              <div className="text-sm text-gray-700">
                {selectedEntry.starred && selectedEntry.pinned
                  ? "This entry is both starred for its significance and pinned for continuation."
                  : selectedEntry.starred
                  ? "You've marked this entry as significant and worth remembering."
                  : "You've pinned this entry to continue the journaling thread later."}
              </div>
            </div>

            {/* Entry content */}
            {selectedEntry.decryptedPrompt && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800 mb-1">
                  Prompt:
                </p>
                <p className="text-sm text-purple-700 italic">
                  {selectedEntry.decryptedPrompt}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedEntry.html_content ||
                      `<p>${selectedEntry.decryptedContent}</p>`,
                  }}
                />
              </div>
            </div>

            {/* Follow-ups */}
            {selectedEntry.decryptedFollowUps &&
              selectedEntry.decryptedFollowUps.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Follow-up Reflections
                  </h4>
                  {selectedEntry.decryptedFollowUps.map((followUp, index) => (
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
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(followUp.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    toggleStar(selectedEntry.id, selectedEntry.starred)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedEntry.starred
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      selectedEntry.starred ? "fill-current" : ""
                    }`}
                  />
                  {selectedEntry.starred ? "Unstar" : "Star"}
                </button>
                <button
                  onClick={() =>
                    togglePin(selectedEntry.id, selectedEntry.pinned)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedEntry.pinned
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Pin
                    className={`h-4 w-4 ${
                      selectedEntry.pinned ? "fill-current" : ""
                    }`}
                  />
                  {selectedEntry.pinned ? "Unpin" : "Pin"}
                </button>
                {selectedEntry.pinned && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition">
                    <Edit3 className="h-4 w-4" />
                    Continue Thread
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {selectedEntry.decryptedContent?.split(" ").length || 0} words
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Starred Entries</p>
              <p className="text-3xl font-bold">{stats.starredCount}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-200 fill-current" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-yellow-200">
              {stats.starredWordCount.toLocaleString()} words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pinned Entries</p>
              <p className="text-3xl font-bold">{stats.pinnedCount}</p>
            </div>
            <Pin className="h-8 w-8 text-blue-200 fill-current" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-blue-200">
              {stats.pinnedWordCount.toLocaleString()} words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Both Star & Pin</p>
              <p className="text-3xl font-bold">{stats.bothCount}</p>
            </div>
            <Sparkles className="h-8 w-8 text-purple-200" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-purple-200">Extra special entries</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Avg Words</p>
              <p className="text-3xl font-bold">
                {displayedEntries.length > 0
                  ? Math.round(
                      (activeView === "starred"
                        ? stats.starredWordCount
                        : stats.pinnedWordCount) / displayedEntries.length
                    )
                  : 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-emerald-200" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-emerald-200">Per {activeView} entry</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveView("starred")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeView === "starred"
              ? "bg-white text-yellow-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Star
            className={`h-4 w-4 ${
              activeView === "starred" ? "fill-current" : ""
            }`}
          />
          Starred Entries ({stats.starredCount})
        </button>
        <button
          onClick={() => setActiveView("pinned")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeView === "pinned"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Pin
            className={`h-4 w-4 ${
              activeView === "pinned" ? "fill-current" : ""
            }`}
          />
          Pinned Entries ({stats.pinnedCount})
        </button>
      </div>

      {/* Entries list */}
      {displayedEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {displayedEntries.length} {activeView}{" "}
              {displayedEntries.length === 1 ? "entry" : "entries"}
            </h3>
            <div className="text-sm text-gray-500">Sorted by most recent</div>
          </div>

          <div className="space-y-6">
            {displayedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Entry modal */}
      {showEntryModal && <EntryModal />}
    </div>
  );
};

export default StarredPinnedTab;
