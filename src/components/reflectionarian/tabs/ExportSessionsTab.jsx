// frontend/ src/components/reflectionarian/tabs/ExportSessionsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  Clock,
  Filter,
  Check,
  ChevronRight,
  Package,
  Search,
  Loader2,
  Archive,
  Share2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import encryptionService from "../../../services/encryptionService";

const ExportSessionsTab = ({ userId, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, week, month, 3months
  const [exportFormat, setExportFormat] = useState("txt"); // txt, json, pdf

  useEffect(() => {
    loadSessions();
  }, [userId, dateFilter]);

  const loadSessions = async () => {
    try {
      let query = supabase
        .from("therapy_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("conversation_type", "premium_therapy")
        .order("created_at", { ascending: false });

      // Apply date filter
      if (dateFilter !== "all") {
        const startDate = new Date();
        switch (dateFilter) {
          case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "3months":
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        }
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (!error && data) {
        setSessions(data);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from("therapy_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        // Decrypt messages
        const decrypted = await Promise.all(
          data.map(async (msg) => {
            try {
              const decryptedContent = await encryptionService.decryptData(
                msg.encrypted_content
              );
              return {
                ...msg,
                content: decryptedContent,
              };
            } catch (err) {
              console.error("Error decrypting message:", err);
              return null;
            }
          })
        );
        return decrypted.filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const selectAllSessions = () => {
    const filteredSessions = getFilteredSessions();
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map((s) => s.id));
    }
  };

  const getFilteredSessions = () => {
    return sessions.filter((session) =>
      session.session_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const exportSessions = async () => {
    if (selectedSessions.length === 0) {
      alert("Please select at least one session to export");
      return;
    }

    setExporting(true);
    try {
      // Load messages for each selected session
      const sessionData = await Promise.all(
        selectedSessions.map(async (sessionId) => {
          const session = sessions.find((s) => s.id === sessionId);
          const messages = await loadSessionMessages(sessionId);

          return {
            session,
            messages,
          };
        })
      );

      // Format the export based on selected format
      let exportContent;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case "json":
          exportContent = JSON.stringify(sessionData, null, 2);
          filename = `reflectionarian-sessions-${
            new Date().toISOString().split("T")[0]
          }.json`;
          mimeType = "application/json";
          break;

        case "txt":
        default:
          exportContent = sessionData
            .map((data) => {
              const session = data.session;
              const messages = data.messages;

              return `
========================================
SESSION: ${session.session_title}
Date: ${new Date(session.created_at).toLocaleString()}
Approach: ${session.approach_used}
========================================

${messages
  .map(
    (msg) =>
      `[${new Date(msg.created_at).toLocaleTimeString()}] ${
        msg.role === "user" ? "You" : "Reflectionarian"
      }: ${msg.content}`
  )
  .join("\n\n")}

========================================
`;
            })
            .join("\n\n");

          filename = `reflectionarian-sessions-${
            new Date().toISOString().split("T")[0]
          }.txt`;
          mimeType = "text/plain";
          break;
      }

      // Create and download the file
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Save export record for User Settings page
      await supabase.from("exported_data").insert({
        user_id: userId,
        export_type: "reflectionarian_sessions",
        session_count: selectedSessions.length,
        format: exportFormat,
        exported_at: new Date().toISOString(),
      });

      alert(
        `Successfully exported ${selectedSessions.length} sessions. You can access this export from your User Settings page.`
      );
      setSelectedSessions([]);
    } catch (error) {
      console.error("Error exporting sessions:", error);
      alert("Failed to export sessions. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-400" />
              Export Sessions
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Download your reflection sessions for personal records
            </p>
          </div>

          {selectedSessions.length > 0 && (
            <button
              onClick={exportSessions}
              disabled={exporting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {selectedSessions.length} Sessions
                </>
              )}
            </button>
          )}
        </div>

        {/* Filters and Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all">All Sessions</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>

          {/* Export Format */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="txt">Text (.txt)</option>
            <option value="json">JSON (.json)</option>
          </select>
        </div>

        {/* Select All */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={selectAllSessions}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            <div
              className={`w-4 h-4 rounded border ${
                selectedSessions.length === filteredSessions.length
                  ? "bg-purple-600 border-purple-600"
                  : "border-white/30"
              } flex items-center justify-center`}
            >
              {selectedSessions.length === filteredSessions.length && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            Select All ({filteredSessions.length})
          </button>

          <div className="text-sm text-gray-400">
            {sessions.length} total sessions
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            const isSelected = selectedSessions.includes(session.id);
            const isCurrent = session.id === currentSessionId;

            return (
              <div
                key={session.id}
                className={`bg-white/10 backdrop-blur-md rounded-lg border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-purple-500 bg-purple-600/10"
                    : "border-white/20 hover:bg-white/15"
                }`}
                onClick={() => toggleSessionSelection(session.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 ${
                      isSelected
                        ? "bg-purple-600 border-purple-600"
                        : "border-white/30"
                    } flex items-center justify-center`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-white">
                        {session.session_title}
                      </h5>
                      {isCurrent && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.created_at).toLocaleTimeString()}
                      </span>
                      {session.approach_used && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {session.approach_used}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No sessions found</p>
            <p className="text-sm text-gray-500 mt-1">
              Start a reflection session to see it here
            </p>
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-md rounded-lg border border-purple-500/20 p-4">
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">
              About Session Exports
            </h4>
            <p className="text-sm text-gray-300">
              Your exported sessions are encrypted and stored securely. You can
              access all your exports from the User Settings page, where you can
              also manage and re-download previous exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSessionsTab;
