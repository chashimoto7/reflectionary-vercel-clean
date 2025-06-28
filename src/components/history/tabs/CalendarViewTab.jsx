// src/components/history/tabs/CalendarViewTab.jsx
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
  Calendar as CalendarIcon,
  X,
  Eye,
  Edit3,
  Activity,
  TrendingUp,
} from "lucide-react";

const CalendarViewTab = ({ entries, colors, onEntrySelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
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
      setSelectedEntry(day.entries[0]);
      setShowEntryModal(true);
      onEntrySelect && onEntrySelect(day.entries[0]);
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
    if (!selectedEntry) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowEntryModal(false)}
      >
        <div
          className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
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
            {selectedEntry.decryptedPrompt && (
              <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-300 mb-1">Prompt</p>
                <p className="text-white">{selectedEntry.decryptedPrompt}</p>
              </div>
            )}

            <div className="p-4 bg-white/10 rounded-lg">
              <p className="text-white whitespace-pre-wrap">
                {selectedEntry.decryptedContent}
              </p>
            </div>

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
            <CalendarIcon className="h-8 w-8 text-purple-400" />
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
    </div>
  );
};
{
  audioEntry && (
    <AudioPlayer
      entry={audioEntry}
      onClose={() => setAudioEntry(null)}
      position="bottom-right"
    />
  );
}
export default CalendarViewTab;
