import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEncryption } from "../contexts/EncryptionContext";
import EncryptionUnlockModal from "../components/EncryptionUnLockModal";
import supabase from "../supabaseClient";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function NewEntry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isUnlocked, encryptJournalEntry } = useEncryption();

  // 🔐 Redirect to login if not authenticated
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("initial");
  const [showPromptButton, setShowPromptButton] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Entry");
  const [editorContent, setEditorContent] = useState("");
  const [entryChain, setEntryChain] = useState([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [showFollowUpButtons, setShowFollowUpButtons] = useState(false);
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Check if encryption needs to be unlocked
  useEffect(() => {
    if (user && !isUnlocked) {
      setShowUnlockModal(true);
    }
  }, [user, isUnlocked]);

  // Initialize Quill editor when component mounts and encryption is ready
  useEffect(() => {
    const initEditor = () => {
      if (editorRef.current && !quillRef.current && isUnlocked) {
        try {
          console.log("Initializing Quill editor...");

          const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: "Start writing your journal entry here...",
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                ["link"],
                ["clean"],
              ],
            },
          });

          quillRef.current = quill;

          // Listen for content changes
          quill.on("text-change", () => {
            const content = quill.getText().trim();
            const htmlContent = quill.root.innerHTML;
            setEditorContent(content); // Store plain text for checking if content exists
            console.log("Editor content changed, length:", content.length);
          });

          // Set editor height with scroll
          const qlEditor = editorRef.current.querySelector(".ql-editor");
          if (qlEditor) {
            qlEditor.style.height = "300px";
            qlEditor.style.maxHeight = "300px";
            qlEditor.style.overflowY = "auto";
            qlEditor.style.fontSize = "16px";
            qlEditor.style.lineHeight = "1.6";
          }

          setIsEditorReady(true);
          console.log("Quill editor initialized successfully");
        } catch (error) {
          console.error("Error initializing Quill:", error);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initEditor, 100);

    return () => {
      clearTimeout(timer);
      if (quillRef.current) {
        console.log("Cleaning up Quill editor");
        quillRef.current = null;
      }
    };
  }, [isUnlocked]); // Re-initialize when encryption is unlocked

  const clearEditor = () => {
    if (quillRef.current && isEditorReady) {
      try {
        quillRef.current.setText("");
        setEditorContent("");
        console.log("Editor cleared");
      } catch (error) {
        console.error("Error clearing editor:", error);
      }
    }
  };

  const getPrompt = async () => {
    if (!isUnlocked) {
      setShowUnlockModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        "https://reflectionary-api.vercel.app/api/generatePrompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await res.json();
      const generatedPrompt =
        data?.prompt || "Write about a recent moment that impacted you.";
      setPrompt(generatedPrompt);
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } catch (err) {
      console.error("Prompt fetch failed:", err);
      setPrompt("Write about a recent moment that impacted you.");
      setPromptType("initial");
      setSaveLabel("Save Entry");
      setShowPromptButton(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectPrompt = async () => {
    if (!isUnlocked) {
      setShowUnlockModal(true);
      return;
    }

    if (!subject.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/generate-subject-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            user_id: user.id,
            pastEntries: [], // We'll enhance this later with decrypted summaries
          }),
        }
      );

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setShowPromptButton(false);
        setSubject("");
      } else {
        alert("No prompt returned. Try again.");
      }
    } catch (err) {
      console.error("Failed to fetch subject prompt:", err);
      alert("Something went wrong while generating the prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async () => {
    console.log("🔄 Save entry function called");

    try {
      const journalContent = quillRef.current?.getText().trim();

      if (!journalContent) {
        alert("Please write something before saving.");
        return;
      }

      const htmlContent = quillRef.current?.root.innerHTML;
      const userId = user?.id;

      if (!userId) {
        alert("Something went wrong. Please log in again.");
        return;
      }

      setSaveLabel("Saving...");

      const entryData = {
        content: htmlContent,
        prompt: prompt || null,
        user_id: userId,
        is_follow_up: promptType === "followUp",
        parent_entry_id: currentThreadId, // Maintain parent-child relationship
        thread_id: currentThreadId,
      };

      console.log("📦 Sending entry data:", entryData);

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/save-entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setSaveLabel("Save Entry");
        throw new Error(result.error || "Failed to save entry");
      }

      console.log("✅ Entry saved with ID:", result.entry_id);

      const newEntry = {
        id: result.entry_id,
        prompt: prompt || null,
        response: journalContent,
        htmlContent: htmlContent,
        created_at: new Date().toISOString(),
        is_follow_up: promptType === "followUp",
        parent_id: currentThreadId,
      };

      let updatedChain;
      if (promptType === "initial") {
        console.log("📝 Starting new conversation thread");
        updatedChain = [newEntry];
        setCurrentThreadId(result.entry_id);
      } else {
        console.log("➕ Adding followUp to thread:", currentThreadId);
        updatedChain = [...entryChain, newEntry];
      }

      setEntryChain(updatedChain);
      window.currentConversationChain = updatedChain;
      window.currentThreadId = currentThreadId || result.entry_id;

      clearEditor();
      setPrompt("");
      setShowPromptButton(true);

      // ✅ Show success bar and reset label
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
      setSaveLabel("Save Entry");

      // ✅ Trigger followUp modal
      setShowFollowUpModal(true);
    } catch (err) {
      console.error("❌ Error saving entry:", err);
      alert(`Failed to save entry: ${err.message}`);
    }
  };

  const handleFollowUp = async () => {
    if (!isUnlocked) {
      setShowUnlockModal(true);
      return;
    }

    console.log("🤔 Generating followUp with chain:", entryChain);

    // Check if we have entries to work with
    if (!entryChain || entryChain.length === 0) {
      console.error("❌ No entry chain available for followUp");
      alert("No previous entries found. Please write a journal entry first.");
      return;
    }

    try {
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/follow-up",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: entryChain }),
        }
      );

      const data = await response.json();
      console.log("🎯 FollowUp response:", data);

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("followUp");
        setSaveLabel("Save Follow-Up Answer");
        setShowPromptButton(false);
        setShowFollowUpButtons(true);
        // Don't clear editor here - let user start typing
      } else {
        console.error("❌ No followUp prompt returned");
        alert("No follow-up prompt returned. Please try again.");
      }
    } catch (err) {
      console.error("❌ FollowUp error:", err);
      alert("Failed to generate follow-up question. Please try again.");
    }
  };

  const handleFollowUpFromChain = async () => {
    setShowFollowUpModal(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user_id = session?.user?.id;

      if (!user_id) {
        throw new Error("User ID missing from session");
      }

      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/follow-up",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user?.id, entryChain }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch follow-up");
      }

      setPrompt(data.prompt);
      setPromptType("follow-up");
    } catch (error) {
      console.error("Backend error:", error);
    }
  };

  const handleEndFollowUps = () => {
    console.log("✋ User ending follow-up session");

    // Reset for NEW conversation thread
    setEntryChain([]);
    setPrompt("");
    setPromptType("initial"); // 🔑 Next save will start new thread
    setSaveLabel("Save Entry");
    setEditorContent("");
    setShowPromptButton(true);
    setShowFollowUpButtons(false);
    setShowFollowUpModal(false);
    setCurrentThreadId(null); // 🔑 Clear thread ID

    // Clear stored data
    window.currentConversationChain = [];
    window.currentThreadId = null;

    clearEditor();
    console.log("🎉 Ready for new conversation thread");
  };

  const handleNoThanks = () => {
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEntryChain([]);
    setShowModal(false);
    setShowPromptButton(true);
    setCurrentThreadId(null);
    clearEditor();
  };

  // Show unlock modal if encryption is not unlocked
  if (showUnlockModal && !isUnlocked) {
    return (
      <EncryptionUnlockModal
        onClose={() => {
          if (isUnlocked) {
            setShowUnlockModal(false);
          }
        }}
      />
    );
  }

  // Show loading while encryption is being set up
  if (!isUnlocked) {
    return (
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up encryption...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            New Journal Entry
          </h2>
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Encryption Active
          </div>
        </div>

        {saveConfirmation && (
          <div className="bg-green-100 text-green-800 text-sm px-4 py-2 mb-4 rounded shadow">
            Entry saved successfully and encrypted!
          </div>
        )}

        {/* Prompt Generation Section */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <input
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to write about?"
              disabled={isLoading}
            />
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              onClick={handleSubjectPrompt}
              disabled={isLoading || !subject.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Thinking...
                </div>
              ) : (
                "Get Custom Prompt"
              )}
            </button>
          </div>

          {showPromptButton && (
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              onClick={getPrompt}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Thinking...
                </div>
              ) : (
                "Generate Random Prompt"
              )}
            </button>
          )}
        </div>

        {/* Prompt Display */}
        {prompt && (
          <div className={`bg-green-100 px-4 py-3 rounded mb-6 shadow`}>
            <p
              className={`text-lg font-bold ${
                promptType === "followUp" ? "text-purple-700" : "text-green-800"
              }`}
            >
              {promptType === "followUp"
                ? "Here's your follow-up prompt:"
                : "Here's your journaling prompt:"}
            </p>
            <p className="text-green-900 mt-1 font-normal">{prompt}</p>
          </div>
        )}

        {/* Quill Editor */}
        <div className="mb-6">
          <div
            ref={editorRef}
            className="border border-gray-300 rounded-lg"
            style={{ height: "350px" }}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isEditorReady ? (
              <span>✓ Editor ready</span>
            ) : (
              <span>Setting up editor...</span>
            )}
          </div>

          <button
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            onClick={saveEntry}
            disabled={
              !isEditorReady ||
              !editorContent.trim() ||
              saveLabel === "Saving..."
            }
          >
            {saveLabel === "Saving..." && (
              <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            )}
            {saveLabel}
          </button>
        </div>

        {/* Follow-up Modals */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-4 text-lg font-medium">
                Your journal entry has been saved securely.
              </p>
              <p className="mb-4">
                Would you like me to generate a follow-up question to help you
                reflect further?
              </p>
              <div className="space-x-2">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                  onClick={handleFollowUpFromChain}
                >
                  Yes, ask me
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleNoThanks}
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-2 text-lg font-semibold text-gray-800">
                Would you like to explore this a little deeper?
              </p>
              <p className="mb-4 text-sm text-gray-700">
                I can provide a follow-up question based on what you've shared
                so far.
              </p>
              <div className="space-x-2">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  onClick={handleFollowUpFromChain}
                >
                  Yes, please
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={handleEndFollowUps}
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
