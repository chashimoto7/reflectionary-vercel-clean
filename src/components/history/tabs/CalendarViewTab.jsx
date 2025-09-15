// frontend/src/components/history/tabs/CalendarViewTab.jsx
import React, { useState, useMemo } from "react";
import AudioButton from "../../AudioButton";
import AudioPlayer from "../../AudioPlayer";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Star,
  Pin,
  FolderOpen,
  Calendar,
  X,
  Eye,
  Edit3,
  Activity,
  TrendingUp,
  FolderPlus,
  Check,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

const CalendarViewTab = ({ entries = [], colors = {}, onEntrySelect, folders = [], onRefresh }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [audioEntry, setAudioEntry] = useState(null);

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Create calendar grid
    const calendar = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const date = new Date(year, month, dayNumber);
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

      // Find entries for this day
      const dayEntries = isCurrentMonth
        ? entries.filter((entry) => {
            const entryDate = new Date(entry.created_at);
            return (
              entryDate.getDate() === dayNumber &&
              entryDate.getMonth() === month &&
              entryDate.getFullYear() === year
            );
          })
        : [];

      calendar.push({
        date,
        dayNumber: isCurrentMonth ? dayNumber : null,
        isCurrentMonth,
        entries: dayEntries,
        hasEntries: dayEntries.length > 0,
        entryCount: dayEntries.length,
        totalWords: dayEntries.reduce(
          (sum, e) => sum + (e.decryptedContent?.split(" ").length || 0),
          0
        ),
        hasStarred: dayEntries.some((e) => e.starred),
        hasPinned: dayEntries.some((e) => e.pinned),
        hasFolder: dayEntries.some((e) => e.folder_id),
      });
    }

    return calendar;
  }, [currentDate, entries]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDayClick = (day) => {
    if (day.hasEntries) {
      // Sort entries by time (earliest first)
      const sortedEntries = [...day.entries].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setSelectedDayEntries(sortedEntries);
      setSelectedEntry(sortedEntries[0]);
      setCurrentEntryIndex(0);
      setShowEntryModal(true);
      onEntrySelect && onEntrySelect(sortedEntries[0]);
    }
  };

  // Calculate month statistics
  const monthStats = useMemo(() => {
    const daysWithEntries = calendarData.filter(
      (day) => day.isCurrentMonth && day.hasEntries
    ).length;
    const totalEntries = calendarData.reduce(
      (sum, day) => (day.isCurrentMonth ? sum + day.entryCount : sum),
      0
    );
    const totalWords = calendarData.reduce(
      (sum, day) => (day.isCurrentMonth ? sum + day.totalWords : sum),
      0
    );

    return {
      daysWithEntries,
      totalEntries,
      totalWords,
      consistency: Math.round(
        (daysWithEntries /
          calendarData.filter((d) => d.isCurrentMonth).length) *
          100
      ),
    };
  }, [calendarData]);

  const EntryModal = () => {
    const [selectedFolderId, setSelectedFolderId] = useState(selectedEntry?.folder_id || "");
    const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);

    if (!selectedEntry) return null;

    const API_BASE = import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

    // Handle folder update
    const handleFolderUpdate = async () => {
      if (!user || selectedFolderId === selectedEntry.folder_id) return;

      setIsUpdatingFolder(true);
      try {
        const response = await fetch(`${API_BASE}/api/update-entry-folder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entry_id: selectedEntry.id,
            user_id: user.id,
            folder_id: selectedFolderId || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update entry folder");
        }

        // Call the callback to refresh entries
        if (onRefresh) {
          onRefresh();
        }

        // Close modal after successful update
        setShowEntryModal(false);
      } catch (error) {
        console.error("Error updating entry folder:", error);
        // Reset selection on error
        setSelectedFolderId(selectedEntry.folder_id || "");
      } finally {
        setIsUpdatingFolder(false);
      }
    };

    const handlePreviousEntry = () => {
      if (currentEntryIndex > 0) {
        const newIndex = currentEntryIndex - 1;
        setCurrentEntryIndex(newIndex);
        setSelectedEntry(selectedDayEntries[newIndex]);
        onEntrySelect && onEntrySelect(selectedDayEntries[newIndex]);
      }
    };

    const handleNextEntry = () => {
      if (currentEntryIndex < selectedDayEntries.length - 1) {
        const newIndex = currentEntryIndex + 1;
        setCurrentEntryIndex(newIndex);
        setSelectedEntry(selectedDayEntries[newIndex]);
        onEntrySelect && onEntrySelect(selectedDayEntries[newIndex]);
      }
    };

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

    // Get follow-ups from the correct property
    const followUps =
      selectedEntry.follow_ups || selectedEntry.decryptedFollowUps || [];

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
            <div>
              <h3 className="text-xl font-semibold text-white">
                {new Date(selectedEntry.created_at).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(selectedEntry.created_at).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Entry navigation */}
              {selectedDayEntries.length > 1 && (
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={handlePreviousEntry}
                    disabled={currentEntryIndex === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-400">
                    {currentEntryIndex + 1} of {selectedDayEntries.length}
                  </span>
                  <button
                    onClick={handleNextEntry}
                    disabled={
                      currentEntryIndex === selectedDayEntries.length - 1
                    }
                    className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowEntryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Prompt */}
            {(selectedEntry.decryptedPrompt || selectedEntry.prompt) && (
              <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-300 mb-1 font-medium">
                  Prompt
                </p>
                <p className="text-white">
                  {parseContent(
                    selectedEntry.decryptedPrompt || selectedEntry.prompt
                  )}
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

            {/* Folder Selection */}
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Add to Folder</span>
                </div>
                {selectedFolderId !== selectedEntry.folder_id && (
                  <button
                    onClick={handleFolderUpdate}
                    disabled={isUpdatingFolder}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdatingFolder ? (
                      <>
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        Update
                      </>
                    )}
                  </button>
                )}
              </div>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No Folder (Unorganized)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              {selectedEntry.folder_id && (
                <p className="text-xs text-gray-400 mt-2">
                  Currently in: {folders.find(f => f.id === selectedEntry.folder_id)?.name || "Unknown Folder"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
              <span>
                {(
                  selectedEntry.decryptedContent || selectedEntry.content
                )?.split(" ").length || 0}{" "}
                words
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
              {selectedEntry.is_private && (
                <span className="flex items-center gap-1" title="AI crisis detection skipped for privacy protection">
                  <FileKey className="h-4 w-4 text-amber-400" />
                  Private (AI crisis detection skipped for privacy protection)
                </span>
              )}
              <AudioButton
                onClick={() => {
                  setAudioEntry(selectedEntry);
                  setShowEntryModal(false); // Close modal when playing audio
                }}
                size="medium"
                className="ml-auto"
              />
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
          <h2 className="text-2xl font-bold text-white">Calendar View</h2>
          <p className="text-gray-400 mt-1">
            Track your journaling consistency and patterns
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Days Written</p>
              <p className="text-2xl font-bold text-white">
                {monthStats.daysWithEntries}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Entries</p>
              <p className="text-2xl font-bold text-white">
                {monthStats.totalEntries}
              </p>
            </div>
            <Edit3 className="h-8 w-8 text-pink-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Words Written</p>
              <p className="text-2xl font-bold text-white">
                {monthStats.totalWords.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Consistency</p>
              <p className="text-2xl font-bold text-white">
                {monthStats.consistency}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-purple-600/20">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-purple-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`
                relative h-24 border-r border-b border-white/10 p-2 transition-colors
                ${
                  day.isCurrentMonth
                    ? day.hasEntries
                      ? "bg-white/5 hover:bg-purple-600/20 cursor-pointer"
                      : "bg-transparent hover:bg-white/5"
                    : "bg-black/20"
                }
              `}
              onClick={() => handleDayClick(day)}
            >
              {day.isCurrentMonth && (
                <>
                  {/* Day number */}
                  <div
                    className={`
                    text-sm font-medium mb-1
                    ${day.hasEntries ? "text-white" : "text-gray-500"}
                  `}
                  >
                    {day.dayNumber}
                  </div>

                  {/* Entry indicators */}
                  {day.hasEntries && (
                    <div className="space-y-1">
                      {/* Entry count */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-xs text-gray-300">
                          {day.entryCount}{" "}
                          {day.entryCount === 1 ? "entry" : "entries"}
                        </span>
                      </div>

                      {/* Word count */}
                      <div className="text-xs text-gray-400">
                        {day.totalWords} words
                      </div>

                      {/* Icons for starred/pinned */}
                      <div className="flex items-center gap-1">
                        {day.hasStarred && (
                          <Star className="h-3 w-3 text-yellow-400" />
                        )}
                        {day.hasPinned && (
                          <Pin className="h-3 w-3 text-blue-400" />
                        )}
                        {day.hasFolder && (
                          <FolderOpen className="h-3 w-3 text-purple-400" />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
          <span className="text-gray-300">Has Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 text-yellow-400" />
          <span className="text-gray-300">Starred</span>
        </div>
        <div className="flex items-center gap-2">
          <Pin className="h-3 w-3 text-blue-400" />
          <span className="text-gray-300">Pinned</span>
        </div>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-3 w-3 text-purple-400" />
          <span className="text-gray-300">In Folder</span>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && <EntryModal />}

      {/* Audio Player - Should be at the root level of the component */}
      {audioEntry && (
        <AudioPlayer
          entry={audioEntry}
          onClose={() => setAudioEntry(null)}
          position="center"
        />
      )}
    </div>
  );
};

export default CalendarViewTab;
