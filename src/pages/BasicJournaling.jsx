// BasicJournaling.jsx - Fixed to use backend encryption
import React, { useState, useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useAuth } from "../contexts/AuthContext";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import { Save, AlertCircle, CheckCircle } from "lucide-react";

const BasicJournaling = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Crisis detection integration
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
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
  }, []);

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
          // Basic tier metadata
          is_follow_up: false,
          parent_entry_id: null,
          thread_id: null,
          prompt_used: "user-initiated", // Basic tier doesn't use prompts
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
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Today's Journal Entry
        </h1>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Entry Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
          />
        </div>

        {/* Editor Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden mb-6">
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
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
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

        {/* Info for Basic Users */}
        <div className="mt-8 p-4 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-200">
            <strong>Basic Tier:</strong> You can write and save journal entries.
            Upgrade to Standard or higher for AI-powered prompts, wellness
            tracking, and advanced features.
          </p>
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

export default BasicJournaling;
