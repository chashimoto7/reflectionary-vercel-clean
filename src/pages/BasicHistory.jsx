//src/pages/BasicHistory
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const BasicHistory = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, title, content, created_at, word_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries:", error);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getPreview = (content, maxLength = 150) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Journal History
          </h1>
          <p className="text-gray-600">
            Browse through all your journal entries, starting with the most
            recent.
          </p>
        </div>

        {/* Stats Overview */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {entries.length}
                </p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {entries.length > 0
                    ? Math.ceil(
                        (new Date() -
                          new Date(entries[entries.length - 1].created_at)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </p>
                <p className="text-sm text-gray-600">Days Journaling</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {entries.reduce(
                    (total, entry) => total + (entry.word_count || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-gray-600">Total Words</p>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No entries yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your journaling journey by creating your first entry.
            </p>
            <button
              onClick={() => (window.location.href = "/journal")}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const isExpanded = expandedEntries.has(entry.id);
              const content = stripHtml(entry.content);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    {/* Entry Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {entry.title ||
                            `Entry from ${formatDate(entry.created_at)}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(entry.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(entry.created_at)}
                          </div>
                          {entry.word_count && (
                            <div>{entry.word_count} words</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEntryExpansion(entry.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Entry Content */}
                    <div className="text-gray-700">
                      {isExpanded ? (
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />
                      ) : (
                        <p className="leading-relaxed">
                          {getPreview(entry.content)}
                        </p>
                      )}
                    </div>

                    {/* Show More/Less Button */}
                    {content.length > 150 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleEntryExpansion(entry.id)}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm focus:outline-none focus:underline"
                        >
                          {isExpanded ? "Show Less" : "Read More"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicHistory;
