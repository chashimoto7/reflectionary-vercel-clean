import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
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

  // Crisis detection integration
  const {
    showModal: showCrisisModal,
    analysisResult: crisisAnalysisResult,
    showCrisisModal: triggerCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  } = useCrisisIntegration();

  // Auto-focus on the editor when component mounts
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.focus();
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
    if (!content.trim() && !title.trim()) {
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title.trim() || `Entry from ${new Date().toLocaleDateString()}`,
        content: content,
        created_at: new Date().toISOString(),
        word_count: content
          .replace(/<[^>]*>/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
      });

      if (error) {
        console.error("Error saving entry:", error);
        setSaveStatus("error");
      } else {
        setSaveStatus("success");
        // Clear the form after successful save
        setContent("");
        setTitle("");

        // Run crisis detection on the saved content
        const plainTextContent = content.replace(/<[^>]*>/g, "");
        await triggerCrisisModal(plainTextContent);

        // Focus back on the editor
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.focus();
        }
      }
    } catch (error) {
      console.error("Unexpected error saving entry:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  // Quill editor configuration - keeping it simple
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const formats = ["header", "bold", "italic", "underline", "list", "bullet"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Basic Journaling
          </h1>
          <p className="text-gray-600">
            Capture your thoughts and experiences in your personal journal.
          </p>
        </div>

        {/* Journaling Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Title Input */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Entry Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Quill Editor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Journal Entry
            </label>
            <div className="border border-gray-300 rounded-md">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Start writing your journal entry..."
                style={{ minHeight: "300px" }}
              />
            </div>
          </div>

          {/* Save Button and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {saveStatus === "success" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm">Entry saved successfully!</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm">
                    Error saving entry. Please try again.
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || (!content.trim() && !title.trim())}
              className={`
                px-6 py-2 rounded-md font-medium flex items-center space-x-2
                ${
                  isSaving || (!content.trim() && !title.trim())
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                }
                transition-colors duration-200
              `}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Entry"}</span>
            </button>
          </div>
        </div>

        {/* Basic Instructions */}
        <div className="mt-8 bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Getting Started
          </h3>
          <ul className="text-purple-800 space-y-1">
            <li>• Write freely about your day, thoughts, or feelings</li>
            <li>• Use the formatting tools to organize your thoughts</li>
            <li>
              • Your entries are automatically saved when you click "Save Entry"
            </li>
            <li>• All entries are private and securely stored</li>
            <li>• Crisis detection is always available for your safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicJournaling;
