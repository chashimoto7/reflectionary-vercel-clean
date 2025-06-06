import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import supabase from "../supabaseClient";
import encryptionService from "../services/encryptionService";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import UpgradePrompt from "../components/UpgradePrompt";

export default function NewEntry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked, masterKey } = useSecurity();
  const { hasAccess, tier } = useMembership();

  // Add feature access management
  const {
    checkFeatureAccess,
    showUpgradePrompt,
    requestedFeature,
    handleUpgrade,
    closeUpgradePrompt,
    getUpgradeMessage,
  } = useFeatureAccess(tier);

  // State declarations
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

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Redirect to login if not authenticated
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

  // Initialize Quill editor when component mounts and encryption is ready
  useEffect(() => {
    const initEditor = () => {
      if (editorRef.current && !quillRef.current && !isLocked) {
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
            setEditorContent(content);
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
  }, [isLocked]);

  // Function to encrypt journal entry using the new system
  const encryptJournalEntry = async (entryData) => {
    if (!masterKey) {
      throw new Error("No master key available for encryption");
    }

    // Generate a new data key for this entry
    const dataKey = await encryptionService.generateDataKey();

    // Encrypt the content with the data key
    const encryptedContent = await encryptionService.encryptText(
      entryData.content,
      dataKey
    );

    // Encrypt the prompt if it exists
    let encryptedPrompt = { encryptedData: "", iv: "" };
    if (entryData.prompt) {
      encryptedPrompt = await encryptionService.encryptText(
        entryData.prompt,
        dataKey
      );
    }

    // Encrypt the data key with master key
    const encryptedDataKey = await encryptionService.encryptKey(
      dataKey,
      masterKey
    );

    return {
      encrypted_content: encryptedContent.encryptedData,
      content_iv: encryptedContent.iv,
      encrypted_prompt: encryptedPrompt.encryptedData,
      prompt_iv: encryptedPrompt.iv,
      encrypted_data_key: encryptedDataKey.encryptedData,
      data_key_iv: encryptedDataKey.iv,
    };
  };

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
    if (isLocked) {
      console.log("App is locked, cannot get prompt");
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
    if (isLocked) {
      console.log("App is locked, cannot get custom prompt");
      return;
    }

    // For free users, basic journaling is allowed
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
            pastEntries: [],
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

      console.log("🔐 Encrypting entry data on frontend...");
      const encryptedData = await encryptJournalEntry({
        content: htmlContent,
        prompt: prompt || null,
      });

      console.log("✅ Entry encrypted successfully");

      const entryData = {
        ...encryptedData,
        user_id: userId,
        is_follow_up: promptType === "followUp",
        parent_entry_id: currentThreadId,
        thread_id: currentThreadId,
      };

      console.log("📦 Sending encrypted entry data to backend");

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
      setLastSavedEntry(newEntry);
      window.currentConversationChain = updatedChain;
      window.currentThreadId = currentThreadId || result.entry_id;

      clearEditor();
      setPrompt("");
      setShowPromptButton(true);

      // Show success bar and reset label
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
      setSaveLabel("Save Entry");

      // Trigger follow-up modal
      setShowFollowUpModal(true);
    } catch (err) {
      console.error("❌ Error saving entry:", err);
      alert(`Failed to save entry: ${err.message}`);
      setSaveLabel("Save Entry");
    }
  };

  const handleFollowUpFromChain = async () => {
    console.log("🤔 Generating followUp for entry ID:", lastSavedEntry?.id);

    // Check if user has access to follow-up prompts
    const hasFollowUpAccess = checkFeatureAccess("follow_up_prompts", () => {
      // This callback runs if the user has access
      proceedWithFollowUp();
    });

    // If no access, the upgrade prompt will show automatically
    // No need to do anything else here
  };

  const proceedWithFollowUp = async () => {
    if (!lastSavedEntry?.id) {
      console.error("❌ No saved entry ID available for followUp");
      alert("No previous entries found. Please write a journal entry first.");
      return;
    }

    try {
      setIsLoading(true);
      setShowFollowUpModal(false);
      setPrompt("Thinking...");

      console.log("Sending follow-up request for entry ID:", lastSavedEntry.id);
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/follow-up",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            entry_id: lastSavedEntry.id,
          }),
        }
      );

      const data = await response.json();
      console.log("🎯 FollowUp response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch follow-up");
      }

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("followUp");
        setSaveLabel("Save Follow-Up Answer");
        setShowPromptButton(false);
        setShowFollowUpButtons(true);
      } else {
        throw new Error("No follow-up prompt returned");
      }
    } catch (error) {
      console.error("❌ FollowUp error:", error);
      setPrompt("Sorry, I couldn't generate a follow-up question this time.");
      alert(`Failed to generate follow-up question: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndFollowUps = () => {
    console.log("✋ User ending follow-up session");

    // Reset for NEW conversation thread
    setEntryChain([]);
    setLastSavedEntry(null);
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEditorContent("");
    setShowPromptButton(true);
    setShowFollowUpButtons(false);
    setShowFollowUpModal(false);
    setCurrentThreadId(null);

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
    setLastSavedEntry(null);
    setShowModal(false);
    setShowFollowUpModal(false);
    setShowPromptButton(true);
    setCurrentThreadId(null);
    clearEditor();
  };

  // Show loading while encryption is being set up
  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Journal is locked. Please unlock to continue.
          </p>
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
                  disabled={isLoading}
                >
                  {isLoading ? "Thinking..." : "Yes, please"}
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={handleEndFollowUps}
                  disabled={isLoading}
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature={requestedFeature}
          onClose={closeUpgradePrompt}
          onUpgrade={handleUpgrade}
          message={getUpgradeMessage()}
        />
      )}
    </>
  );
}
