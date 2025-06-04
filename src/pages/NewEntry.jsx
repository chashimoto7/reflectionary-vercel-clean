import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import supabase from "../supabaseClient";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function NewEntry() {
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
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [showFollowUpButtons, setShowFollowUpButtons] = useState(false);
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    const initEditor = () => {
      if (editorRef.current && !quillRef.current) {
        try {
          const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: "Start writing your journal entry here...",
            modules: {
              toolbar: [
                ["bold", "italic", "underline"],
                ["link"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["clean"],
              ],
            },
          });

          quillRef.current = quill;

          quill.on("text-change", () => {
            setEditorContent(quill.root.innerHTML);
          });

          const qlEditor = editorRef.current.querySelector(".ql-editor");
          if (qlEditor) {
            qlEditor.style.height = "300px";
            qlEditor.style.overflowY = "auto";
          }

          setIsEditorReady(true);
        } catch (error) {
          console.error("Error initializing Quill:", error);
        }
      }
    };

    const timer = setTimeout(initEditor, 100);
    return () => {
      clearTimeout(timer);
      quillRef.current = null;
    };
  }, []);

  const clearEditor = () => {
    if (quillRef.current && isEditorReady) {
      try {
        quillRef.current.setText("");
        setEditorContent("");
      } catch (error) {
        console.error("Error clearing editor:", error);
      }
    }
  };

  const getPrompt = async () => {
    try {
      const res = await fetch(
        "https://reflectory-api.onrender.com/api/generate-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: "anonymous" }),
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
    }
  };

  const handleSubjectPrompt = async () => {
    if (!subject.trim()) return;
    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      const userEmail = user?.data?.user?.email || "anonymous";

      const { data: entries } = await supabase
        .from("journal_entries")
        .select("content")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(5);

      const response = await fetch(
        "https://reflectory-api.onrender.com/api/generate-subject-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, pastEntries: entries || [] }),
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
    const userId = "anonymous"; // Replace with real user ID if auth is added
    const journalContent = editorRef.current?.getEditor().getText().trim();

    if (!journalContent) {
      alert("Please write something before saving.");
      return;
    }

    try {
      // 🔍 Step 1: Fetch the user's saved goals
      const { data: goalData, error: goalError } = await supabase
        .from("user_goals")
        .select("goals")
        .eq("user_id", userId)
        .single();

      if (goalError) {
        console.error("❌ Error fetching user goals:", goalError);
        return;
      }

      const userGoals = goalData?.goals || [];

      // 🧠 Step 2: Match mentioned goals (literal string match)
      const mentionedGoals = userGoals.filter((goal) =>
        journalContent.toLowerCase().includes(goal.toLowerCase())
      );

      console.log("Journal content:", journalContent);
      console.log("User goals:", userGoals);

      // 💾 Step 3: Save journal entry including goals
      const { error: saveError } = await supabase
        .from("journal_entries")
        .insert([
          {
            user_id: userId,
            content: journalContent,
            goals: mentionedGoals,
            created_at: new Date().toISOString(),
          },
        ]);

      if (saveError) {
        console.error("❌ Error saving entry:", saveError);
        return;
      }

      setEditorContent(""); // Clear the editor
      setShowFollowUpModal(true); // Trigger follow-up prompt

      console.log("✅ Journal entry saved successfully");
    } catch (err) {
      console.error("Unexpected error saving journal entry:", err);
    }
  };

  const handleFollowUp = async () => {
    try {
      const response = await fetch(
        "https://reflectory-api.onrender.com/api/generate-followup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: entryChain }),
        }
      );
      const data = await response.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptType("followup");
        setSaveLabel("Save Follow-Up Answer");
        setShowFollowUpButtons(true);
        clearEditor();
      } else {
        alert("No follow-up prompt returned.");
      }
    } catch (err) {
      console.error("Follow-up error:", err);
    }
  };

  const handleFollowUpFromChain = async () => {
    await handleFollowUp();
    setShowModal(false);
    setShowFollowUpModal(false);
  };

  const handleEndFollowUps = () => {
    setEntryChain([]);
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEditorContent("");
    setShowPromptButton(true);
    setShowFollowUpButtons(false);
    setShowFollowUpModal(false);
  };

  const handleNoThanks = () => {
    setPrompt("");
    setPromptType("initial");
    setSaveLabel("Save Entry");
    setEntryChain([]);
    setShowModal(false);
    setShowPromptButton(true);
    clearEditor();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          New Journal Entry
        </h2>

        {saveConfirmation && (
          <div className="bg-green-100 text-green-800 text-sm px-4 py-2 mb-4 rounded shadow">
            Entry saved successfully!
          </div>
        )}

        <div className="mb-4">
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What would you like to write about?"
            disabled={isLoading}
          />
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubjectPrompt}
            disabled={isLoading || !subject.trim()}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? "Thinking..." : "Get Custom Prompt"}
          </button>
        </div>

        {showPromptButton && (
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mb-4"
            onClick={getPrompt}
          >
            Generate Random Prompt
          </button>
        )}

        {prompt && (
          <div className={`bg-green-100 px-4 py-3 rounded mb-4 shadow`}>
            <p
              className={`text-lg font-bold ${
                promptType === "followup" ? "text-purple-700" : "text-green-800"
              }`}
            >
              {promptType === "followup"
                ? "Here's your follow-up prompt:"
                : "Here's your journaling prompt:"}
            </p>
            <p className="text-green-900 mt-1 font-normal">{prompt}</p>
          </div>
        )}

        <div ref={editorRef} className="mb-4 border border-gray-300 rounded" />

        {isEditorReady && (
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-6"
            onClick={saveEntry}
            disabled={!editorContent.trim()}
          >
            {saveLabel}
          </button>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-4 text-lg font-medium">
                Your journal entry has been saved.
              </p>
              <p className="mb-4">
                Would you like me to generate a follow-up question to help you
                reflect further?
              </p>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleFollowUpFromChain}
              >
                Yes, ask me
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded"
                onClick={handleNoThanks}
              >
                No, thank you
              </button>
            </div>
          </div>
        )}

        {showFollowUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
              <p className="mb-4 text-lg font-medium">
                Continue with another follow-up question?
              </p>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleFollowUpFromChain}
              >
                Continue
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded"
                onClick={handleEndFollowUps}
              >
                No, I'm done
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
