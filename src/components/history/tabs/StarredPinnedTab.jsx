// frontend/src/components/history/tabs/StarredPinnedTab.jsx
import React, { useState, useMemo } from "react";
import AudioButton from "../../AudioButton";
import AudioPlayer from "../../AudioPlayer";
import {
  Star,
  Pin,
  X,
  Calendar,
  Eye,
  Edit3,
  Share2,
  Download,
  Clock,
  FolderOpen,
  Target,
  Sparkles,
  BookOpen,
  Activity,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const StarredPinnedTab = ({ entries = [], colors = {}, onRefresh }) => {
  const [audioEntry, setAudioEntry] = useState(null);
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

  const followUps =
    selectedEntry.follow_ups || selectedEntry.decryptedFollowUps || [];

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
      recentStarred: starredEntries[0],
      recentPinned: pinnedEntries[0],
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
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(entry.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStar(entry.id, entry.starred)}
            disabled={loading}
            className={`p-1.5 rounded hover:bg-white/10 transition ${
              entry.starred ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <Star
              className="h-4 w-4"
              fill={entry.starred ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={() => togglePin(entry.id, entry.pinned)}
            disabled={loading}
            className={`p-1.5 rounded hover:bg-white/10 transition ${
              entry.pinned ? "text-blue-400" : "text-gray-400"
            }`}
          >
            <Pin
              className="h-4 w-4"
              fill={entry.pinned ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Prompt */}
      {(selectedEntry.decryptedPrompt || selectedEntry.prompt) && (
        <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
          <p className="text-sm text-purple-300 mb-1 font-medium">Prompt</p>
          <p className="text-white">
            {parseContent(
              selectedEntry.decryptedPrompt || selectedEntry.prompt
            )}
          </p>
        </div>
      )}

      {/* Content Preview */}
      <p className="text-gray-300 mb-4 line-clamp-3">
        {entry.decryptedContent}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{entry.decryptedContent?.split(" ").length || 0} words</span>
          {entry.folder_id && (
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              In folder
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AudioButton onClick={() => setAudioEntry(entry)} size="small" />
          <button
            onClick={() => {
              setSelectedEntry(entry);
              setShowEntryModal(true);
            }}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Full
          </button>
        </div>
      </div>
    </div>
  );

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
                {parseContent(
                  selectedEntry.decryptedContent || selectedEntry.content
                )}
              </p>
            </div>

            {/* Follow-ups */}
            {followUps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Follow-up Questions
                </h4>
                {followUps.map((followUp, index) => (
                  <div
                    key={followUp.id || index}
                    className="space-y-2 pl-4 border-l-2 border-purple-500/30"
                  >
                    {/* Follow-up Prompt */}
                    {followUp.prompt && (
                      <div className="p-3 bg-purple-600/10 rounded-lg">
                        <p className="text-sm text-purple-300 mb-1">
                          Follow-up Question {index + 1}
                        </p>
                        <p className="text-white">
                          {parseContent(followUp.prompt)}
                        </p>
                      </div>
                    )}
                    {/* Follow-up Response */}
                    {followUp.content && (
                      <div className="p-3 bg-slate-700/30 rounded-lg ml-4">
                        <p className="text-sm text-gray-400 mb-1">Response</p>
                        <p className="text-white whitespace-pre-wrap">
                          {parseContent(followUp.content)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm text-gray-400">
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    toggleStar(selectedEntry.id, selectedEntry.starred)
                  }
                  className={`p-2 rounded hover:bg-white/10 transition ${
                    selectedEntry.starred ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  <Star
                    className="h-5 w-5"
                    fill={selectedEntry.starred ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() =>
                    togglePin(selectedEntry.id, selectedEntry.pinned)
                  }
                  className={`p-2 rounded hover:bg-white/10 transition ${
                    selectedEntry.pinned ? "text-blue-400" : "text-gray-400"
                  }`}
                >
                  <Pin
                    className="h-5 w-5"
                    fill={selectedEntry.pinned ? "currentColor" : "none"}
                  />
                </button>
              </div>
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
          <h2 className="text-2xl font-bold text-white">Starred & Pinned</h2>
          <p className="text-gray-400 mt-1">
            Your most important entries in one place
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setActiveView("starred")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded transition ${
              activeView === "starred"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Star className="h-4 w-4" />
            Starred ({stats.starredCount})
          </button>
          <button
            onClick={() => setActiveView("pinned")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded transition ${
              activeView === "pinned"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Pin className="h-4 w-4" />
            Pinned ({stats.pinnedCount})
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm">Starred Entries</p>
              <p className="text-3xl font-bold text-white">
                {stats.starredCount}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-yellow-200">
              {stats.starredWordCount.toLocaleString()} total words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Pinned Entries</p>
              <p className="text-3xl font-bold text-white">
                {stats.pinnedCount}
              </p>
            </div>
            <Pin className="h-8 w-8 text-blue-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-blue-200">
              {stats.pinnedWordCount.toLocaleString()} total words
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Both Starred & Pinned</p>
              <p className="text-3xl font-bold text-white">{stats.bothCount}</p>
            </div>
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-purple-200">
              Your most important entries
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm">Last Updated</p>
              <p className="text-lg font-bold text-white">
                {activeView === "starred" && stats.recentStarred
                  ? new Date(
                      stats.recentStarred.created_at
                    ).toLocaleDateString()
                  : activeView === "pinned" && stats.recentPinned
                  ? new Date(stats.recentPinned.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <Clock className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {displayedEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Empty State */}
      {displayedEntries.length === 0 && (
        <div className="text-center py-12">
          {activeView === "starred" ? (
            <>
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No starred entries yet
              </h3>
              <p className="text-gray-500">
                Star your favorite entries to see them here
              </p>
            </>
          ) : (
            <>
              <Pin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No pinned entries yet
              </h3>
              <p className="text-gray-500">
                Pin important entries for quick access
              </p>
            </>
          )}
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

export default StarredPinnedTab;
