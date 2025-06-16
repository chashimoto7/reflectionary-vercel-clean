// src/components/history/tabs/CalendarViewTab.jsx
import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Star,
  Pin,
  FolderOpen,
  Heart,
  Brain,
  Zap,
  Calendar as CalendarIcon,
  X,
  Eye,
  Play,
} from "lucide-react";

const CalendarViewTab = ({ entries, colors, onEntrySelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);

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
        primaryMood: getMostFrequentMood(dayEntries),
        primaryTheme: getMostFrequentTheme(dayEntries),
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

  const getMoodColor = (mood) => {
    const moodColors = {
      happy: "#10B981",
      excited: "#F59E0B",
      calm: "#06B6D4",
      neutral: "#6B7280",
      sad: "#3B82F6",
      anxious: "#EF4444",
      frustrated: "#F97316",
      hopeful: "#8B5CF6",
      grateful: "#EC4899",
      stressed: "#DC2626",
    };
    return moodColors[mood] || colors.secondary;
  };

  const getThemeColor = (theme) => {
    const themeColors = {
      "personal growth": "#8B5CF6",
      relationships: "#EC4899",
      work: "#06B6D4",
      health: "#10B981",
      family: "#F59E0B",
      goals: "#6366F1",
      creativity: "#F97316",
      spirituality: "#8B5CF6",
    };
    return themeColors[theme] || colors.accent;
  };

  const handleDayClick = (day) => {
    if (day.hasEntries) {
      setSelectedEntry(day.entries[0]); // For now, show first entry
      setShowEntryModal(true);
      onEntrySelect && onEntrySelect(day.entries[0]);
    }
  };

  const EntryModal = () => {
    if (!selectedEntry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
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

            {/* Entry metadata */}
            <div className="flex items-center gap-2 mb-4">
              {selectedEntry.starred && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                  <Star className="h-3 w-3" />
                  Starred
                </span>
              )}
              {selectedEntry.pinned && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
              )}
              {selectedEntry.folder_id && (
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  <FolderOpen className="h-3 w-3" />
                  Folder
                </span>
              )}
              {selectedEntry.mood && (
                <span
                  className="px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: getMoodColor(selectedEntry.mood) }}
                >
                  {selectedEntry.mood}
                </span>
              )}
              {selectedEntry.theme && (
                <span
                  className="px-2 py-1 rounded text-xs text-white"
                  style={{
                    backgroundColor: getThemeColor(selectedEntry.theme),
                  }}
                >
                  {selectedEntry.theme}
                </span>
              )}
            </div>

            {/* Prompt */}
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

            {/* Content */}
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
                <div className="space-y-4">
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition">
                  <Eye className="h-4 w-4" />
                  View Full
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition">
                  <Play className="h-4 w-4" />
                  Audio Playback
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {selectedEntry.decryptedContent.split(" ").length} words
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Has Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>Starred</span>
          </div>
          <div className="flex items-center gap-2">
            <Pin className="h-3 w-3 text-blue-500" />
            <span>Pinned</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-gray-700"
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
                relative h-24 border-r border-b border-gray-100 p-2 transition-colors
                ${
                  day.isCurrentMonth
                    ? day.hasEntries
                      ? "bg-white hover:bg-purple-50 cursor-pointer"
                      : "bg-white hover:bg-gray-50"
                    : "bg-gray-50"
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
                    ${day.hasEntries ? "text-gray-900" : "text-gray-600"}
                  `}
                  >
                    {day.dayNumber}
                  </div>

                  {/* Entry indicators */}
                  {day.hasEntries && (
                    <div className="space-y-1">
                      {/* Entry count and mood */}
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getMoodColor(day.primaryMood),
                          }}
                        />
                        <span className="text-xs text-gray-600">
                          {day.entryCount}
                        </span>
                      </div>

                      {/* Theme indicator */}
                      {day.primaryTheme && (
                        <div
                          className="text-xs px-1 py-0.5 rounded text-white truncate"
                          style={{
                            backgroundColor: getThemeColor(day.primaryTheme),
                          }}
                        >
                          {day.primaryTheme.length > 8
                            ? day.primaryTheme.substring(0, 8) + "..."
                            : day.primaryTheme}
                        </div>
                      )}

                      {/* Icons for starred/pinned */}
                      <div className="flex items-center gap-1">
                        {day.hasStarred && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                        {day.hasPinned && (
                          <Pin className="h-3 w-3 text-blue-500" />
                        )}
                        {day.hasFolder && (
                          <FolderOpen className="h-3 w-3 text-purple-500" />
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

      {/* Calendar insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-pink-600" />
            <h3 className="font-medium text-gray-900">This Month</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {calendarData.filter((day) => day.hasEntries).length}
          </div>
          <div className="text-sm text-gray-600">Days with entries</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Most Active</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {getMostActiveDay(calendarData)}
          </div>
          <div className="text-sm text-gray-600">Day of week</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            <h3 className="font-medium text-gray-900">Avg Entries</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(
              (calendarData.filter((day) => day.hasEntries).length /
                calendarData.filter((day) => day.isCurrentMonth).length) *
              7
            ).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Per week</div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && <EntryModal />}
    </div>
  );
};

// Helper functions
function getMostFrequentMood(entries) {
  if (entries.length === 0) return null;
  const moodCounts = {};
  entries.forEach((entry) => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  return topMood ? topMood[0] : null;
}

function getMostFrequentTheme(entries) {
  if (entries.length === 0) return null;
  const themeCounts = {};
  entries.forEach((entry) => {
    if (entry.theme) {
      themeCounts[entry.theme] = (themeCounts[entry.theme] || 0) + 1;
    }
  });
  const topTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0];
  return topTheme ? topTheme[0] : null;
}

function getMostActiveDay(calendarData) {
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun through Sat
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  calendarData.forEach((day) => {
    if (day.hasEntries && day.isCurrentMonth) {
      const dayOfWeek = day.date.getDay();
      dayOfWeekCounts[dayOfWeek] += day.entryCount;
    }
  });

  const maxIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  return dayNames[maxIndex];
}

export default CalendarViewTab;
