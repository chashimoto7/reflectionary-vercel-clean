//frontend/ src/pages/GrowthJournaling.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Calendar,
  Download,
  Search,
  TrendingUp,
  History,
  FileKey,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCrisisIntegration } from "../hooks/useCrisisIntegration";
import CrisisResourceModal from "../components/CrisisResourceModal";
import { generatePDF, generateWord } from "../utils/exportUtils";

const GrowthJournaling = () => {
  const { user } = useAuth();
  
  // Tab state - simplified to just writing
  const [activeTab, setActiveTab] = useState("write");
  const [entry, setEntry] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [promptType, setPromptType] = useState("random");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
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

  // Navigation
  const navigate = useNavigate();

  // Tabs configuration - History tab now navigates to Knowledge Garden
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
      isNavigation: true, // This tab navigates instead of showing content
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
        is_private: isPrivate,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Growth Journaling
          </h1>
          <p className="text-purple-300">
            AI-powered prompts, templates, and intelligent history analytics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              if (tab.isNavigation) {
                // History tab - navigate to Knowledge Garden
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate('/knowledge-garden/history')}
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border-2 border-transparent hover:border-green-400/30"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "write" && (
          <div className="space-y-6">

        {/* Prompt Selection */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Choose Your Prompt Type
            </h2>
            <button
              onClick={generatePrompt}
              disabled={loadingPrompt}
              className="text-purple-300 hover:text-white flex items-center gap-1 text-sm"
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
                  ? "border-purple-400 bg-purple-400/20 text-white"
                  : "border-white/20 hover:border-white/40 text-purple-300"
              }`}
            >
              <Sparkles className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Random</span>
            </button>
            <button
              onClick={() => setPromptType("subject")}
              className={`p-3 rounded-lg border-2 transition-all ${
                promptType === "subject"
                  ? "border-purple-400 bg-purple-400/20 text-white"
                  : "border-white/20 hover:border-white/40 text-purple-300"
              }`}
            >
              <Edit3 className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">By Subject</span>
            </button>
            <button
              onClick={() => setPromptType("template")}
              className={`p-3 rounded-lg border-2 transition-all ${
                promptType === "template"
                  ? "border-purple-400 bg-purple-400/20 text-white"
                  : "border-white/20 hover:border-white/40 text-purple-300"
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
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
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
                      ? "border-purple-400 bg-purple-400/20"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="font-medium text-sm text-white">{template.name}</div>
                  <div className="text-xs text-purple-300 mt-1">
                    {template.content.split("\n")[0].substring(0, 30)}...
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Current Prompt */}
          {currentPrompt && (
            <div className="bg-purple-600/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
              {loadingPrompt ? (
                <div className="flex items-center gap-2 text-purple-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating personalized prompt...</span>
                </div>
              ) : (
                <p className="text-purple-100 font-medium">{currentPrompt}</p>
              )}
            </div>
          )}
        </div>

        {/* Journal Entry */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="w-full h-64 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-purple-300">{wordCount} words</span>
            {entry.length > 100 && !followUpPrompt && (
              <button
                onClick={generateFollowUp}
                disabled={loadingFollowUp}
                className="text-purple-300 hover:text-white text-sm flex items-center gap-1"
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
            <div className="mt-4 p-4 bg-blue-600/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
              <p className="text-blue-300 font-medium text-sm">
                Follow-up question:
              </p>
              <p className="text-blue-100 mt-1">{followUpPrompt}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-600/30 text-purple-100 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400"
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
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-purple-300">
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last saved {formatTime(lastSaved)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`px-4 py-3 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                isPrivate
                  ? "bg-amber-600 border-amber-500 text-white"
                  : "bg-transparent border-gray-600 text-gray-300 hover:border-amber-500"
              }`}
            >
              <FileKey className="h-4 w-4" />
              {isPrivate ? "Private" : "Mark Private"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !entry.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>

            {/* Crisis Detection */}
            {showCrisisResources && (
              <CrisisResourceModal
                isOpen={showCrisisResources}
                onClose={() => setShowCrisisResources(false)}
                analysisResult={{
                  level: "concerning",
                  score: crisisKeywords.length,
                  keywords: crisisKeywords
                }}
                isPrivateEntry={isPrivate}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default GrowthJournaling;
