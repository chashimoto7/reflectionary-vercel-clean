import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Settings,
  Brain,
  Heart,
  Lightbulb,
  Target,
  ChevronRight,
  Sparkles,
  BookOpen,
  Save,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle,
  PlusCircle,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react";

// Mock user and membership data for demo
const mockUser = {
  id: "demo-user-123",
  email: "demo@example.com",
};

const mockMembershipData = {
  hasProReflectionarian: true,
  tier: "premium",
};

const ProReflectionarian = () => {
  // Use mock data for demo - replace with real auth/membership hooks when integrating
  const user = mockUser;
  const membershipData = mockMembershipData;

  // Onboarding & Preferences State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Session & Features State
  const [sessionPrompts, setSessionPrompts] = useState([]);
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const [currentGoalSuggestion, setCurrentGoalSuggestion] = useState(null);

  // Pro Features State
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showGrowthTimeline, setShowGrowthTimeline] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [activeProTab, setActiveProTab] = useState("chat");
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // ====================================================================
  // ONBOARDING QUESTIONS & THERAPY MATCHING (PRO TIER)
  // ====================================================================

  const onboardingQuestions = [
    {
      id: "session_goals",
      question: "What do you hope to get out of your sessions?",
      icon: Target,
      options: [
        {
          value: "calm_control",
          label: "Feel more calm and in control",
          color: "bg-blue-100 text-blue-800",
        },
        {
          value: "self_understanding",
          label: "Understand myself better",
          color: "bg-purple-100 text-purple-800",
        },
        {
          value: "challenge_thoughts",
          label: "Challenge unhelpful thoughts",
          color: "bg-yellow-100 text-yellow-800",
        },
        {
          value: "heal_wounds",
          label: "Heal inner wounds",
          color: "bg-green-100 text-green-800",
        },
        {
          value: "structure_focus",
          label: "Create structure and focus",
          color: "bg-red-100 text-red-800",
        },
      ],
    },
    {
      id: "preferred_tone",
      question: "What tone do you respond best to?",
      icon: Heart,
      options: [
        {
          value: "gentle",
          label: "Gentle and supportive",
          color: "bg-pink-100 text-pink-800",
        },
        {
          value: "direct",
          label: "Direct and honest",
          color: "bg-orange-100 text-orange-800",
        },
        {
          value: "curious",
          label: "Curious and insightful",
          color: "bg-indigo-100 text-indigo-800",
        },
        {
          value: "playful",
          label: "Playful and light",
          color: "bg-yellow-100 text-yellow-800",
        },
        {
          value: "philosophical",
          label: "Philosophical and deep",
          color: "bg-purple-100 text-purple-800",
        },
      ],
    },
    {
      id: "tips_vs_reflection",
      question: "Do you prefer practical tips or deeper reflection?",
      icon: Lightbulb,
      options: [
        {
          value: "tips",
          label: "Tips & tools",
          color: "bg-green-100 text-green-800",
        },
        {
          value: "reflection",
          label: "Reflection & meaning",
          color: "bg-blue-100 text-blue-800",
        },
        {
          value: "mixed",
          label: "A mix of both",
          color: "bg-purple-100 text-purple-800",
        },
      ],
    },
    {
      id: "struggle_support",
      question: "When you're struggling, you want someone to...",
      icon: Brain,
      options: [
        {
          value: "calm",
          label: "Calm me down",
          color: "bg-blue-100 text-blue-800",
        },
        {
          value: "analyze",
          label: "Help me analyze it",
          color: "bg-yellow-100 text-yellow-800",
        },
        {
          value: "reframe",
          label: "Reframe my thoughts",
          color: "bg-green-100 text-green-800",
        },
        {
          value: "listen",
          label: "Hear me without fixing it",
          color: "bg-pink-100 text-pink-800",
        },
        {
          value: "connect",
          label: "Help me connect the dots",
          color: "bg-purple-100 text-purple-800",
        },
      ],
    },
  ];

  const therapyStyleMapping = {
    // CBT mapping
    "challenge_thoughts-direct-tips-analyze": "CBT",
    "challenge_thoughts-direct-tips-reframe": "CBT",
    "structure_focus-direct-tips-analyze": "CBT",

    // Mindfulness/DBT mapping
    "calm_control-gentle-mixed-calm": "Mindfulness/DBT",
    "calm_control-curious-reflection-calm": "Mindfulness/DBT",

    // ACT/Positive Psychology mapping
    "self_understanding-curious-mixed-connect": "ACT/Positive Psychology",
    "structure_focus-curious-mixed-connect": "ACT/Positive Psychology",

    // Narrative/Humanistic mapping (default for most combinations)
    "heal_wounds-gentle-reflection-listen": "Narrative/Humanistic",
    "self_understanding-gentle-reflection-listen": "Narrative/Humanistic",
    "heal_wounds-philosophical-reflection-listen": "Narrative/Humanistic",
  };

  const getTherapyApproach = (responses) => {
    const key = `${responses.session_goals}-${responses.preferred_tone}-${responses.tips_vs_reflection}-${responses.struggle_support}`;
    return therapyStyleMapping[key] || "Narrative/Humanistic"; // Default to humanistic
  };

  // ====================================================================
  // PREFERENCE MANAGEMENT
  // ====================================================================

  // Mock Supabase functions - replace with real API calls when integrating
  const mockSupabaseCall = (table, operation, data = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (table === "reflectionarian_preferences") {
          if (operation === "select") {
            // Return null first time to trigger onboarding
            resolve({ data: null, error: null });
          } else if (operation === "upsert") {
            resolve({
              data: {
                id: "pref-123",
                user_id: user.id,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            });
          }
        }
        resolve({ data: [], error: null });
      }, 500);
    });
  };

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    setIsLoadingPreferences(true);
    try {
      const { data, error } = await mockSupabaseCall(
        "reflectionarian_preferences",
        "select"
      );

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error);
        return;
      }

      if (data) {
        setPreferences(data);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setShowOnboarding(true);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const savePreferences = async (responses) => {
    if (!user?.id) return;

    const therapyApproach = getTherapyApproach(responses);

    const preferenceData = {
      user_id: user.id,
      therapy_approach: therapyApproach,
      preferred_tone: responses.preferred_tone,
      session_goals: [responses.session_goals],
      tips_vs_reflection: responses.tips_vs_reflection,
      struggle_support: responses.struggle_support,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await mockSupabaseCall(
        "reflectionarian_preferences",
        "upsert",
        preferenceData
      );

      if (error) throw error;

      setPreferences(data);
      setShowOnboarding(false);

      // Welcome message based on therapy approach
      const welcomeMessage = getWelcomeMessage(
        therapyApproach,
        responses.preferred_tone
      );
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };

  const getWelcomeMessage = (approach, tone) => {
    const messages = {
      CBT: {
        direct:
          "Great! I'm here to help you examine your thoughts and build practical strategies. What's on your mind today?",
        gentle:
          "I'm excited to work with you on identifying patterns and building helpful tools. How are you feeling right now?",
        default:
          "Let's work together to understand your thought patterns and develop practical approaches. What would you like to explore?",
      },
      "Mindfulness/DBT": {
        gentle:
          "Welcome! Let's create a space for mindful awareness and emotional balance. What are you noticing right now?",
        curious:
          "I'm here to help you explore present-moment awareness. What's alive for you in this moment?",
        default:
          "Let's focus on grounding and emotional regulation together. How are you feeling in this moment?",
      },
      "ACT/Positive Psychology": {
        curious:
          "I'm excited to explore your values and help you move toward meaningful action. What matters most to you right now?",
        playful:
          "Let's discover what brings you alive and helps you flourish! What's sparking joy in your life lately?",
        default:
          "Together we'll explore your values and build resilience. What would make today meaningful for you?",
      },
      "Narrative/Humanistic": {
        gentle:
          "I'm here to listen deeply and help you explore your story. What would you like to share with me today?",
        philosophical:
          "Let's explore the deeper meanings and patterns in your experience. What's been on your heart lately?",
        default:
          "I'm here to truly hear you and help you make meaning of your experiences. What feels important to share right now?",
      },
    };

    return (
      messages[approach]?.[tone] ||
      messages[approach]?.default ||
      messages["Narrative/Humanistic"].default
    );
  };

  // ====================================================================
  // PRO FEATURES: WEEKLY REPORTS, GROWTH TIMELINE, EXPORT
  // ====================================================================

  const generateWeeklyReport = async () => {
    // Mock weekly report generation
    return {
      weekOf: new Date().toLocaleDateString(),
      totalSessions: 7,
      mainThemes: ["Self-compassion", "Work stress", "Relationships"],
      insights: [
        "You've shown increased awareness of your inner dialogue this week",
        "Your approach to work challenges has become more strategic",
        "You're developing stronger boundaries in relationships",
      ],
      recommendedActions: [
        "Continue practicing the mindfulness techniques we discussed",
        "Consider scheduling regular check-ins with yourself",
        "Explore the connection between your values and daily choices",
      ],
    };
  };

  const generateGrowthTimeline = async () => {
    // Mock growth timeline data
    return [
      {
        date: "2025-06-01",
        milestone: "Started Pro Reflectionarian",
        insight: "Began exploring CBT-style approaches to thought patterns",
      },
      {
        date: "2025-06-08",
        milestone: "Self-Compassion Breakthrough",
        insight:
          "Recognized tendency toward self-criticism and developed counter-strategies",
      },
      {
        date: "2025-06-15",
        milestone: "Values Clarification",
        insight:
          "Identified core values and began aligning daily actions with them",
      },
    ];
  };

  const exportSessionLogs = async (format = "json") => {
    // Mock export functionality
    const exportData = {
      user_id: user.id,
      export_date: new Date().toISOString(),
      total_sessions: sessionHistory.length,
      sessions: sessionHistory,
      preferences: preferences,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionarian-sessions-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ====================================================================
  // ONBOARDING COMPONENT
  // ====================================================================

  const OnboardingFlow = () => {
    const [responses, setResponses] = useState({});
    const currentQ = onboardingQuestions[onboardingStep];
    const Icon = currentQ?.icon;

    const handleOptionSelect = (value) => {
      const newResponses = { ...responses, [currentQ.id]: value };
      setResponses(newResponses);

      if (onboardingStep < onboardingQuestions.length - 1) {
        setTimeout(() => setOnboardingStep(onboardingStep + 1), 300);
      } else {
        setTimeout(() => savePreferences(newResponses), 300);
      }
    };

    const goBack = () => {
      if (onboardingStep > 0) {
        setOnboardingStep(onboardingStep - 1);
      }
    };

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Personalizing Your Pro Experience</span>
            <span>
              {onboardingStep + 1} of {onboardingQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((onboardingStep + 1) / onboardingQuestions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQ?.question}
            </h2>
            <p className="text-gray-600">
              Choose the option that resonates most with you
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ?.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                  responses[currentQ.id] === option.value
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${option.color}`}
                  >
                    {option.value.replace("_", " ")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              disabled={onboardingStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500">
              {responses[currentQ?.id]
                ? "Great choice! Moving on..."
                : "Select an option to continue"}
            </div>
          </div>
        </div>

        {/* Therapy Approach Preview */}
        {Object.keys(responses).length === onboardingQuestions.length && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              Your Personalized Approach: {getTherapyApproach(responses)}
            </h3>
            <p className="opacity-90">
              Initializing your Pro Reflectionarian experience...
            </p>
          </div>
        )}
      </div>
    );
  };

  // ====================================================================
  // CHAT INTERFACE
  // ====================================================================

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Real API call to Pro Reflectionarian endpoint
      const response = await fetch("/api/openai/chat-pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          message: currentMessage.trim(),
          sessionId: sessionId,
          preferences: preferences,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.response || "Failed to get response");
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        sessionPrompts: data.sessionPrompts || [],
        goalSuggestion: data.goalSuggestion || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle session prompts
      if (data.sessionPrompts && data.sessionPrompts.length > 0) {
        setSessionPrompts(data.sessionPrompts);
      }

      // Handle goal suggestions
      if (data.goalSuggestion) {
        setCurrentGoalSuggestion(data.goalSuggestion);
        setShowGoalSuggestions(true);
      }

      // Set session ID from response
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I'm having trouble responding right now. Please try again in a moment! 🔧",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ====================================================================
  // SESSION PROMPTS & GOAL SUGGESTIONS
  // ====================================================================

  const savePromptToJournal = async (prompt) => {
    try {
      // This will integrate with Advanced Journaling
      console.log("Saving prompt to Advanced Journaling:", prompt);
      alert("Prompt saved to Advanced Journaling! (Integration coming soon)");
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  const handleGoalSuggestion = async (action, goalText = null) => {
    try {
      // This will integrate with Advanced Goals
      console.log("Goal suggestion action:", action, goalText);

      if (action === "accept") {
        alert("Goal added to Advanced Goals! (Integration coming soon)");
      }

      setCurrentGoalSuggestion(null);
      setShowGoalSuggestions(false);
    } catch (error) {
      console.error("Error handling goal suggestion:", error);
    }
  };

  // ====================================================================
  // PRO FEATURES COMPONENTS
  // ====================================================================

  const WeeklyReportView = ({ report }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Weekly Reflection Report
        </h3>
        <span className="text-sm text-gray-500">Week of {report.weekOf}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">Sessions</h4>
          <p className="text-2xl font-bold text-purple-600">
            {report.totalSessions}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">Main Themes</h4>
          <p className="text-sm text-blue-600">
            {report.mainThemes.join(", ")}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">Growth Areas</h4>
          <p className="text-sm text-green-600">
            {report.insights.length} insights
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
          <ul className="space-y-2">
            {report.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {report.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const GrowthTimelineView = ({ timeline }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Growth Timeline</h3>
      <div className="space-y-6">
        {timeline.map((milestone, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {milestone.milestone}
                </h4>
                <span className="text-sm text-gray-500">{milestone.date}</span>
              </div>
              <p className="text-gray-700 mt-1">{milestone.insight}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ====================================================================
  // EFFECTS
  // ====================================================================

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ====================================================================
  // LOADING & ACCESS CONTROL
  // ====================================================================

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">
            Loading your personalized Pro experience...
          </p>
        </div>
      </div>
    );
  }

  if (!membershipData?.hasProReflectionarian) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pro Reflectionarian
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Unlock the most sophisticated AI companion with therapy-style
          structured sessions, weekly reports, growth timeline reviews, and
          exportable session logs.
        </p>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome to Pro Reflectionarian
            </h1>
            <p className="text-xl text-gray-600">
              Let's personalize your AI companion for the deepest growth and
              insight
            </p>
          </div>
          <OnboardingFlow />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Pro Reflectionarian
              </h1>
              <p className="text-sm text-gray-600">
                {preferences?.therapy_approach} approach •{" "}
                {preferences?.preferred_tone} tone
              </p>
            </div>
          </div>

          {/* Pro Feature Tabs */}
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveProTab("chat")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeProTab === "chat"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Chat
              </button>
              <button
                onClick={() => setActiveProTab("reports")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeProTab === "reports"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Reports
              </button>
              <button
                onClick={() => setActiveProTab("timeline")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeProTab === "timeline"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Timeline
              </button>
              <button
                onClick={() => setActiveProTab("export")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeProTab === "export"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
            </nav>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeProTab === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl px-6 py-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : message.isError
                          ? "bg-red-50 border border-red-200 text-red-800"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {/* Session Prompts */}
                      {message.sessionPrompts?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            ✨ Journal prompts for deeper reflection:
                          </p>
                          <div className="space-y-2">
                            {message.sessionPrompts.map((prompt, idx) => (
                              <button
                                key={idx}
                                onClick={() => savePromptToJournal(prompt)}
                                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-800 transition-colors flex items-center justify-between"
                              >
                                <span>"{prompt}"</span>
                                <BookOpen className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goal Suggestion */}
                      {message.goalSuggestion && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            🎯 Goal suggestion:
                          </p>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 mb-3">
                              "{message.goalSuggestion}"
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleGoalSuggestion(
                                    "accept",
                                    message.goalSuggestion
                                  )
                                }
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Add to Goals
                              </button>
                              <button
                                onClick={() => handleGoalSuggestion("dismiss")}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                              >
                                Not now
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-gray-600">
                          Reflecting deeply...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-4">
                  <textarea
                    ref={messageInputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind for deep exploration..."
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeProTab === "reports" && (
            <div className="flex-1 overflow-y-auto p-6">
              <WeeklyReportView
                report={{
                  weekOf: new Date().toLocaleDateString(),
                  totalSessions: 7,
                  mainThemes: [
                    "Self-compassion",
                    "Work stress",
                    "Relationships",
                  ],
                  insights: [
                    "You've shown increased awareness of your inner dialogue this week",
                    "Your approach to work challenges has become more strategic",
                    "You're developing stronger boundaries in relationships",
                  ],
                  recommendedActions: [
                    "Continue practicing the mindfulness techniques we discussed",
                    "Consider scheduling regular check-ins with yourself",
                    "Explore the connection between your values and daily choices",
                  ],
                }}
              />
            </div>
          )}

          {activeProTab === "timeline" && (
            <div className="flex-1 overflow-y-auto p-6">
              <GrowthTimelineView
                timeline={[
                  {
                    date: "2025-06-01",
                    milestone: "Started Pro Reflectionarian",
                    insight:
                      "Began exploring CBT-style approaches to thought patterns",
                  },
                  {
                    date: "2025-06-08",
                    milestone: "Self-Compassion Breakthrough",
                    insight:
                      "Recognized tendency toward self-criticism and developed counter-strategies",
                  },
                  {
                    date: "2025-06-15",
                    milestone: "Values Clarification",
                    insight:
                      "Identified core values and began aligning daily actions with them",
                  },
                ]}
              />
            </div>
          )}

          {activeProTab === "export" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Export Session Logs
                </h3>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Export your complete Reflectionarian conversation history
                    and insights for personal records or sharing with your
                    healthcare provider.
                  </p>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Export Includes:
                    </h4>
                    <ul className="space-y-1 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Complete conversation history</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Session summaries and insights</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Therapy approach preferences</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Goal suggestions and actions taken</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Weekly reports and growth timeline</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => exportSessionLogs("json")}
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as JSON</span>
                    </button>
                    <button
                      onClick={() => exportSessionLogs("csv")}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as CSV</span>
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Privacy Note:</strong> Exported data contains your
                      personal conversations. Please handle with care and store
                      securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Pro Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Therapy Approach:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {preferences?.therapy_approach}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Preferred Tone:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {preferences?.preferred_tone}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Focus:</span>
                    <span className="ml-2 text-gray-600">
                      {preferences?.tips_vs_reflection}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Support Style:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {preferences?.struggle_support}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowOnboarding(true)}
                className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Update Preferences
              </button>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Pro Features</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Therapy-style structured sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Weekly reflection reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Growth timeline review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Exportable session logs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Full preference management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProReflectionarian;
