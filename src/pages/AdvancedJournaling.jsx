//src/pages/AdvancedJournaling.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Sparkles,
  Edit3,
  Hash,
  FileText,
  RefreshCw,
  ChevronRight,
  Save,
  Clock,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";

const AdvancedJournaling = () => {
  const { user } = useAuth();
  const [entry, setEntry] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [promptType, setPromptType] = useState("random");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [followUpPrompt, setFollowUpPrompt] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [crisisKeywords, setCrisisKeywords] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);

  // Subjects for AI-powered prompts
  const subjects = [
    "Relationships",
    "Career",
    "Personal Growth",
    "Health & Wellness",
    "Creativity",
    "Family",
    "Goals & Dreams",
    "Challenges",
    "Gratitude",
    "Self-Reflection",
  ];

  // Predefined random prompts (no AI)
  const randomPrompts = [
    "What moment from today would you like to relive?",
    "What's been occupying your thoughts lately?",
    "Describe a recent challenge and how you're handling it.",
    "What are you most grateful for right now?",
    "What would you tell your younger self?",
    "What's one thing you'd like to change about your current situation?",
    "Describe your ideal day from start to finish.",
    "What fear would you like to overcome?",
    "What's bringing you joy in this season of life?",
    "If you could master one skill instantly, what would it be and why?",
    "What does happiness mean to you right now?",
    "What tradition would you like to start?",
    "Describe a place where you feel completely at peace.",
    "What would you do if you knew you couldn't fail?",
    "How do you want to be remembered?",
    "What's a belief you've changed your mind about?",
    "What are you learning about yourself lately?",
    "Describe a moment when you felt truly alive.",
    "What would your perfect Sunday look like?",
    "What advice would you give to a friend in your situation?",
  ];

  // Templates
  const templates = [
    {
      id: "daily-reflection",
      name: "Daily Reflection",
      content:
        "Today I am grateful for:\n\n\nChallenges I faced:\n\n\nWhat I learned:\n\n\nTomorrow I will:",
    },
    {
      id: "goal-check-in",
      name: "Goal Check-In",
      content:
        "Goal I'm focusing on:\n\n\nProgress made:\n\n\nObstacles encountered:\n\n\nNext steps:",
    },
    {
      id: "emotional-processing",
      name: "Emotional Processing",
      content:
        "What I'm feeling:\n\n\nWhat triggered these emotions:\n\n\nWhat I need right now:\n\n\nHow I can support myself:",
    },
    {
      id: "weekly-review",
      name: "Weekly Review",
      content:
        "Wins this week:\n\n\nChallenges faced:\n\n\nLessons learned:\n\n\nPriorities for next week:",
    },
    {
      id: "morning-pages",
      name: "Morning Pages",
      content: "Stream of consciousness - write whatever comes to mind:\n\n",
    },
    {
      id: "problem-solving",
      name: "Problem Solving",
      content:
        "The problem:\n\n\nPossible solutions:\n1.\n2.\n3.\n\nPros and cons:\n\n\nNext action:",
    },
  ];

  // Format time helper function
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (user) {
      loadRecentEntries();
    }
  }, [user]);

  useEffect(() => {
    // Generate initial prompt when component mounts or type changes
    generatePrompt();
  }, [promptType, selectedSubject, recentEntries]);

  useEffect(() => {
    // Update word count
    const words = entry
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(words);

    // Check for crisis keywords
    const keywords = [
      "suicide",
      "kill myself",
      "end it all",
      "want to die",
      "no point",
      "hopeless",
    ];
    const detected = keywords.filter((keyword) =>
      entry.toLowerCase().includes(keyword)
    );
    setCrisisKeywords(detected);
    if (detected.length > 0) {
      setShowCrisisResources(true);
    }
  }, [entry]);

  const loadRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error) {
      console.error("Error loading recent entries:", error);
    }
  };

  const generatePrompt = async () => {
    if (promptType === "random") {
      // Use predefined random prompt (no AI)
      const randomIndex = Math.floor(Math.random() * randomPrompts.length);
      setCurrentPrompt(randomPrompts[randomIndex]);
    } else if (promptType === "subject" && selectedSubject) {
      // Use AI for subject-specific prompts
      setLoadingPrompt(true);
      try {
        const response = await fetch("/api/generate-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.id}`,
          },
          body: JSON.stringify({
            type: "subject",
            subject: selectedSubject,
            recentEntries: recentEntries.map((e) => e.content).join("\n\n"),
            instructions: `Generate a thoughtful journaling prompt about ${selectedSubject}. 
              Consider the user's recent journal entries to make it relevant and personal.
              The prompt should encourage deep reflection and self-discovery.
              Keep it open-ended and thought-provoking.`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentPrompt(data.prompt);
        } else {
          // Fallback to a generic subject prompt
          setCurrentPrompt(
            `Reflect on your relationship with ${selectedSubject.toLowerCase()} and how it's evolving.`
          );
        }
      } catch (error) {
        console.error("Error generating AI prompt:", error);
        setCurrentPrompt(
          `What role does ${selectedSubject.toLowerCase()} play in your life right now?`
        );
      } finally {
        setLoadingPrompt(false);
      }
    }
  };

  const generateFollowUp = async () => {
    if (!entry.trim()) return;

    setLoadingFollowUp(true);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          type: "followup",
          currentEntry: entry,
          originalPrompt: currentPrompt,
          instructions: `Based on what the user just wrote, generate a compassionate follow-up question 
            that helps them dive deeper into their thoughts and feelings. 
            The question should be supportive and encourage further self-exploration.
            Keep it concise and relevant to what they shared.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowUpPrompt(data.prompt);
      } else {
        // Fallback follow-up
        setFollowUpPrompt(
          "What insights are emerging for you as you reflect on this?"
        );
      }
    } catch (error) {
      console.error("Error generating follow-up:", error);
      setFollowUpPrompt("How does reflecting on this make you feel?");
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const handleSave = async () => {
    if (!entry.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        content: entry,
        prompt_type: promptType,
        prompt_text: currentPrompt,
        subject: selectedSubject || null,
        tags: tags.length > 0 ? tags : null,
        metadata: {
          word_count: wordCount,
          template_used: selectedTemplate?.id || null,
          follow_up_prompt: followUpPrompt,
        },
      });

      if (error) throw error;

      // Reset form
      setEntry("");
      setTags([]);
      setFollowUpPrompt(null);
      setSelectedTemplate(null);
      setLastSaved(new Date());

      // Generate new prompt
      generatePrompt();

      // Reload recent entries for future AI prompts
      loadRecentEntries();
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const applyTemplate = (template) => {
    setEntry(template.content);
    setSelectedTemplate(template);
    setPromptType("template");
    setCurrentPrompt(`Using template: ${template.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Journaling
          </h1>
          <p className="text-gray-600">
            AI-powered prompts, templates, and intelligent follow-ups
          </p>
        </div>

        {/* Prompt Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose Your Prompt Type
            </h2>
            <button
              onClick={generatePrompt}
              disabled={loadingPrompt}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingPrompt ? "animate-spin" : ""}`}
              />
              New Prompt
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setPromptType("random")}
              className={`p-3 rounded-lg border-2 transition-all ${
                promptType === "random"
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Sparkles className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Random</span>
            </button>
            <button
              onClick={() => setPromptType("subject")}
              className={`p-3 rounded-lg border-2 transition-all ${
                promptType === "subject"
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Edit3 className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">By Subject</span>
            </button>
            <button
              onClick={() => setPromptType("template")}
              className={`p-3 rounded-lg border-2 transition-all ${
                promptType === "template"
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <FileText className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Templates</span>
            </button>
          </div>

          {/* Subject Selection */}
          {promptType === "subject" && (
            <div className="mb-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Template Selection */}
          {promptType === "template" && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {template.content.split("\n")[0].substring(0, 30)}...
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Current Prompt */}
          {currentPrompt && (
            <div className="bg-purple-50 rounded-lg p-4">
              {loadingPrompt ? (
                <div className="flex items-center gap-2 text-purple-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating personalized prompt...</span>
                </div>
              ) : (
                <p className="text-purple-800 font-medium">{currentPrompt}</p>
              )}
            </div>
          )}
        </div>

        {/* Journal Entry */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-600">{wordCount} words</span>
            {entry.length > 100 && !followUpPrompt && (
              <button
                onClick={generateFollowUp}
                disabled={loadingFollowUp}
                className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
              >
                {loadingFollowUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating follow-up...
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Get follow-up prompt
                  </>
                )}
              </button>
            )}
          </div>

          {/* Follow-up Prompt */}
          {followUpPrompt && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium text-sm">
                Follow-up question:
              </p>
              <p className="text-blue-700 mt-1">{followUpPrompt}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Add tags and press Enter..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last saved {formatTime(lastSaved)}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !entry.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>

        {/* Crisis Detection */}
        {showCrisisResources && (
          <CrisisDetection
            keywords={crisisKeywords}
            onClose={() => setShowCrisisResources(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedJournaling;
