// frontend/ src/pages/PersonalJournaling.jsx
import React, { useState, useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import {
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  FileText,
  Edit3,
  History,
} from "lucide-react";

const PersonalJournaling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab state - check URL parameter for initial tab
  const initialTab = searchParams.get("tab") === "history" ? "history" : "write";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Writing tab state
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // History tab state
  const [entries, setEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const entriesPerPage = 10;

  // Crisis detection integration
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Tabs configuration
  const tabs = [
    {
      id: "write",
      label: "Write Entry",
      icon: Edit3,
    },
    {
      id: "history",
      label: "History",
      icon: History,
    },
  ];

  // Initialize Quill editor when Write tab is active
  useEffect(() => {
    if (activeTab === "write" && editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "What's on your mind today?",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      // Track content changes
      quillRef.current.on("text-change", () => {
        setContent(quillRef.current.root.innerHTML);
      });

      // Auto-focus
      quillRef.current.focus();
    }
  }, [activeTab]);

  // Load history when History tab is active
  useEffect(() => {
    if (activeTab === "history" && user) {
      fetchEntries();
    }
  }, [activeTab, user, currentPage]);

  // Clear save status after 3 seconds
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus("error");
      return;
    }

    // Don't save empty entries
    const plainText = quillRef.current?.getText()?.trim();
    if (!plainText) {
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);

    try {
      // Get the HTML content from Quill
      const htmlContent = quillRef.current.root.innerHTML;

      // Send plaintext to backend API for encryption and saving
      const response = await fetch("/api/save-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          content: htmlContent, // Send HTML content - backend will encrypt
          title:
            title.trim() || `Entry from ${new Date().toLocaleDateString()}`,
          // Personal tier metadata
          is_follow_up: false,
          parent_entry_id: null,
          thread_id: null,
          prompt_used: "user-initiated", // Personal tier doesn't use prompts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Run crisis detection if enabled and we got analysis back
      if (result.crisis_analysis) {
        await triggerCrisisModal(plainText, result.crisis_analysis);
      }

      // Clear the editor on successful save
      quillRef.current.setText("");
      setTitle("");
      setSaveStatus("success");

      // Refresh history if it's loaded
      if (activeTab === "history" || entries.length > 0) {
        fetchEntries();
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchEntries = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);

      // Use the backend API to get decrypted entries
      const response = await fetch(
        `/api/get-entries?user_id=${user.id}&limit=${entriesPerPage}&offset=${
          (currentPage - 1) * entriesPerPage
        }&parent_only=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const data = await response.json();

      setEntries(data.entries || []);
      setTotalEntries(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / entriesPerPage));
    } catch (error) {
      console.error("Error fetching entries:", error);
      setHistoryError("Failed to load your journal history. Please try again.");
    } finally {
      setHistoryLoading(false);
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

  // Render Write Tab Content
  const renderWriteTab = () => (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <input
          type="text"
          placeholder="Entry Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition shadow-xl"
        />
      </div>

      {/* Editor Container */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <div ref={editorRef} className="min-h-[400px]" />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !user}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isSaving
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        }`}
      >
        <Save className="h-5 w-5" />
        {isSaving ? "Saving..." : "Save Entry"}
      </button>

      {/* Save Status */}
      {saveStatus && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            saveStatus === "success"
              ? "bg-green-500/20 border border-green-500/40 text-green-200"
              : "bg-red-500/20 border border-red-500/40 text-red-200"
          }`}
        >
          {saveStatus === "success" ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Entry saved successfully!
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5" />
              Failed to save entry. Please try again.
            </>
          )}
        </div>
      )}

      {/* Info for Personal Users */}
      <div className="p-4 backdrop-blur-xl bg-purple-500/10 rounded-xl shadow-xl border border-purple-400/30">
        <p className="text-sm text-purple-200">
          <strong>Personal Tier:</strong> You can write and save journal entries.
          Upgrade to Growth or higher for AI-powered prompts, wellness
          tracking, and advanced features.
        </p>
      </div>
    </div>
  );

  // Render History Tab Content
  const renderHistoryTab = () => {
    if (historyLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading your journal history...</p>
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{historyError}</p>
          <button
            onClick={fetchEntries}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Entry List */}
        {entries.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20">
            <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <p className="text-xl text-purple-200 mb-4">No journal entries yet</p>
            <p className="text-purple-300 mb-6">
              Start your journaling journey today!
            </p>
            <button
              onClick={() => setActiveTab("write")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:border-purple-400/50 transition"
              >
                {/* Entry Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(entry.created_at)}</span>
                        </div>
                      </div>

                      {/* Entry Preview */}
                      <p className="text-gray-100">
                        {entry.prompt && (
                          <span className="text-purple-400 italic mr-2">
                            Prompt: "{entry.prompt}"
                          </span>
                        )}
                        {getPreview(entry.content)}
                      </p>

                      {/* Basic Stats */}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {entry.word_count && (
                          <span className="text-gray-400">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {entry.word_count} words
                          </span>
                        )}
                        {entry.follow_ups && entry.follow_ups.length > 0 && (
                          <span className="text-purple-400">
                            {entry.follow_ups.length} follow-up
                            {entry.follow_ups.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="ml-4 mt-1">
                      {expandedEntries.has(entry.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEntries.has(entry.id) && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    {/* Full Content */}
                    <div
                      className="mt-4 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />

                    {/* Follow-ups */}
                    {entry.follow_ups && entry.follow_ups.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-semibold text-purple-300">
                          Follow-up Reflections
                        </h4>
                        {entry.follow_ups.map((followUp, index) => (
                          <div
                            key={followUp.id}
                            className="ml-4 pl-4 border-l-2 border-purple-600/30"
                          >
                            {followUp.prompt && (
                              <p className="text-sm text-purple-400 italic mb-2">
                                {followUp.prompt}
                              </p>
                            )}
                            <div
                              className="text-sm text-gray-300 prose prose-sm prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: followUp.content,
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(followUp.created_at)} at{" "}
                              {formatTime(followUp.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upgrade Prompt for Personal Users */}
                    <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-200">
                        <strong>Upgrade to Growth</strong> to see mood
                        tracking, emotions, and AI-powered insights for your
                        entries.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg backdrop-blur-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm text-purple-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg backdrop-blur-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 border border-white/20"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Personal Tier Info */}
        <div className="text-center text-sm text-purple-300">
          <p>
            Personal tier members can view their journal entries and follow-ups.
            <br />
            Upgrade for advanced analytics, mood tracking, and AI insights.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Personal Journaling
          </h1>
          <p className="text-purple-300">
            Write entries and view your journal history
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all font-medium
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "backdrop-blur-xl bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white border border-white/20"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10 p-6">
          {activeTab === "write" && renderWriteTab()}
          {activeTab === "history" && renderHistoryTab()}
        </div>
      </div>

      {/* Crisis Resource Modal */}
      {showCrisisModal && (
        <CrisisResourceModal
          isOpen={showCrisisModal}
          onClose={closeCrisisModal}
          analysisResult={crisisAnalysisResult}
          showResources={showCrisisResources}
        />
      )}
    </div>
  );
};

export default PersonalJournaling;