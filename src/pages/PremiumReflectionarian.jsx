// src/pages/PremiumReflectionarian.jsx
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
  Shield,
  CheckCircle,
  PlusCircle,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  Mic,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import ReflectionarianAudioService from "../services/ReflectionarianAudioService";
import encryptionService from "../services/encryptionService";

const PremiumReflectionarian = () => {
  const { user } = useAuth();
  const { hasAccess, tier } = useMembership();

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

  // Audio State
  const [audioService] = useState(() => ReflectionarianAudioService);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Settings & Privacy State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // ====================================================================
  // ONBOARDING QUESTIONS & THERAPY MATCHING (PRO TIER)
  // ====================================================================

  const onboardingQuestions = [
    {
      id: "session_goals",
      question: "What do you hope to get out of your sessions?",
      options: [
        {
          value: "self_understanding",
          label: "Better understand myself and my patterns",
        },
        { value: "calm_control", label: "Feel calmer and more in control" },
        { value: "heal_wounds", label: "Heal from difficult experiences" },
        {
          value: "structure_focus",
          label: "Create structure and clear next steps",
        },
      ],
    },
    {
      id: "preferred_tone",
      question: "What tone resonates most with you?",
      options: [
        { value: "gentle", label: "Gentle and nurturing" },
        { value: "direct", label: "Direct and practical" },
        { value: "curious", label: "Curious and exploratory" },
        { value: "philosophical", label: "Philosophical and deep" },
      ],
    },
    {
      id: "tips_vs_reflection",
      question: "Do you prefer tips or reflection?",
      options: [
        { value: "tips", label: "Give me strategies and techniques" },
        { value: "reflection", label: "Help me explore and understand" },
        { value: "mixed", label: "A balance of both" },
      ],
    },
    {
      id: "struggle_support",
      question: "How do you want support when struggling?",
      options: [
        { value: "listen", label: "Just listen and validate" },
        { value: "reframe", label: "Help me see things differently" },
        { value: "plan", label: "Help me make an action plan" },
        { value: "calm", label: "Ground me in the present moment" },
        { value: "connect", label: "Remind me of my values and strengths" },
      ],
    },
  ];

  // Therapy style mapping based on responses
  const therapyStyleMapping = {
    "calm_control-direct-tips-reframe": "CBT/Solution-Focused",
    "self_understanding-direct-tips-plan": "CBT/Solution-Focused",
    "structure_focus-direct-mixed-plan": "CBT/Solution-Focused",
    "calm_control-gentle-mixed-calm": "Mindfulness/DBT",
    "calm_control-curious-reflection-calm": "Mindfulness/DBT",
    "self_understanding-curious-mixed-connect": "ACT/Positive Psychology",
    "structure_focus-curious-mixed-connect": "ACT/Positive Psychology",
    "heal_wounds-gentle-reflection-listen": "Narrative/Humanistic",
    "self_understanding-gentle-reflection-listen": "Narrative/Humanistic",
    "heal_wounds-philosophical-reflection-listen": "Narrative/Humanistic",
  };

  const getTherapyApproach = (responses) => {
    const key = `${responses.session_goals}-${responses.preferred_tone}-${responses.tips_vs_reflection}-${responses.struggle_support}`;
    return therapyStyleMapping[key] || "Narrative/Humanistic";
  };

  // ====================================================================
  // PREFERENCE MANAGEMENT
  // ====================================================================

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    setIsLoadingPreferences(true);
    try {
      const { data, error } = await supabase
        .from("reflectionarian_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error);
        return;
      }

      if (data && data.onboarding_completed) {
        setPreferences(data);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error in loadUserPreferences:", error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const saveUserPreferences = async (responses) => {
    if (!user?.id) return;

    const therapyApproach = getTherapyApproach(responses);
    const preferenceData = {
      user_id: user.id,
      onboarding_completed: true,
      session_goals: responses.session_goals,
      preferred_tone: responses.preferred_tone,
      tips_vs_reflection: responses.tips_vs_reflection,
      struggle_support: responses.struggle_support,
      therapy_approach: therapyApproach,
      voice_preference: "nova", // Default voice
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("reflectionarian_preferences")
        .upsert(preferenceData, { onConflict: "user_id" });

      if (error) throw error;

      setPreferences(preferenceData);
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const exportCurrentSession = async () => {
    if (!sessionId || messages.length === 0) {
      alert("No session to export");
      return;
    }

    try {
      // Format the session data
      const sessionData = {
        sessionId,
        date: new Date().toISOString(),
        therapyApproach: preferences?.therapy_approach,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      };

      // Save to database for later access in User Settings
      const { error } = await supabase.from("exported_sessions").insert({
        user_id: user.id,
        session_id: sessionId,
        session_data: sessionData,
        exported_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert(
        "Session exported successfully! You can download it from your User Settings page."
      );
    } catch (error) {
      console.error("Error exporting session:", error);
      alert("Failed to export session. Please try again.");
    }
  };

  // Fetch relevant journal entries for context
  const fetchRelevantJournalEntries = async (theme, mood) => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .or(`theme.ilike.%${theme}%,mood.eq.${mood}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Decrypt entries
      const decryptedEntries = await Promise.all(
        data.map(async (entry) => {
          const decrypted = await encryptionService.decryptEntry(entry);
          return {
            date: entry.created_at,
            theme: decrypted.theme,
            mood: decrypted.mood,
            content: decrypted.content.substring(0, 200) + "...", // Preview only
          };
        })
      );

      return decryptedEntries;
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      return [];
    }
  };

  // Generate session-end suggestions
  const generateSessionSuggestions = async () => {
    if (messages.length < 3) return null;

    try {
      // Get conversation summary
      const conversationText = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await fetch("/api/reflectionarian/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: conversationText,
          therapyApproach: preferences.therapy_approach,
        }),
      });

      const data = await response.json();

      return {
        journalPrompts: data.journalPrompts || [],
        goalSuggestions: data.goalSuggestions || [],
        nextSessionFocus: data.nextSessionFocus || "",
      };
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return null;
    }
  };

  // Save journal prompt to Premium Journaling
  const saveJournalPrompt = async (prompt) => {
    try {
      const { error } = await supabase.from("custom_prompts").insert({
        user_id: user.id,
        prompt_text: prompt,
        source: "reflectionarian",
        category: "reflection",
        created_at: new Date().toISOString(),
      });

      if (!error) {
        alert("Prompt saved to your journaling prompts!");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  // Save goal suggestion to Premium Goals
  const saveGoalSuggestion = async (goal) => {
    try {
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description,
        category: goal.category || "personal_growth",
        source: "reflectionarian",
        status: "not_started",
        created_at: new Date().toISOString(),
      });

      if (!error) {
        alert("Goal saved to your goals page!");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  // ====================================================================
  // SESSION MANAGEMENT
  // ====================================================================

  const startNewSession = async () => {
    if (!user?.id || !preferences) return;

    try {
      const sessionData = {
        user_id: user.id,
        session_title: `Session - ${new Date().toLocaleDateString()}`,
        approach_used: preferences.therapy_approach,
        conversation_type: "premium_therapy",
        session_start: new Date().toISOString(),
        status: "active",
      };

      const { data, error } = await supabase
        .from("therapy_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setMessages([]);

      // Add welcome message based on therapy approach
      const welcomeMessage = {
        id: Date.now(),
        role: "assistant",
        content: getWelcomeMessage(
          preferences.therapy_approach,
          preferences.preferred_tone
        ),
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error starting new session:", error);
    }
  };

  const getWelcomeMessage = (approach, tone) => {
    const messages = {
      "CBT/Solution-Focused": {
        direct:
          "Let's focus on what's happening right now and work together on practical solutions. What specific challenge would you like to address today?",
        gentle:
          "I'm here to help you work through challenges with practical strategies. What's on your mind today?",
        default:
          "I'm here to help you identify patterns and develop practical solutions. What would you like to work on today?",
      },
      "Mindfulness/DBT": {
        gentle:
          "Welcome. Let's take a moment to ground ourselves in the present. How are you feeling in this moment?",
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
  // MESSAGE HANDLING
  // ====================================================================

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setIsProcessingResponse(true);

    try {
      // Play transitional response if audio is enabled
      let transitionalText = null;
      if (audioEnabled) {
        const category = audioService.analyzeResponseCategory(
          userMessage.content
        );
        transitionalText = await audioService.playTransitionalResponse(
          category
        );
      }

      // Call your API for the actual response

      const relevantEntries = await fetchRelevantJournalEntries(
        currentMessage, // Use message as theme search
        "neutral" // Or extract mood from conversation
      );
      const response = await fetch("/api/reflectionarian/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          userId: user.id,
          therapyApproach: preferences.therapy_approach,
          journalContext: relevantEntries,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add the AI response
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Play the full response audio if enabled
      if (audioEnabled && data.response) {
        // Stop any transitional audio
        audioService.stopAudio();

        // Stream the actual response
        await audioService.streamAudioResponse(
          data.response,
          preferences.voice_preference
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Stop any playing audio
      if (audioEnabled) {
        audioService.stopAudio();
      }
    } finally {
      setIsLoading(false);
      setIsProcessingResponse(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!audioEnabled) return;

    if (isListening) {
      // Stop listening
      audioService.stopListening();
      setIsListening(false);

      // Send the message if we have a transcript
      if (currentTranscript.trim()) {
        setCurrentMessage(currentTranscript);
        sendMessage();
        setCurrentTranscript("");
      }
    } else {
      // Start listening
      setIsListening(true);
      audioService.startListening(
        (result) => {
          setCurrentTranscript(result.transcript);
          if (!result.isFinal) {
            // Update the input field with interim results
            setCurrentMessage(result.transcript);
          }
        },
        (error) => {
          console.error("Speech recognition error:", error);
          setIsListening(false);
          alert("Voice input error. Please try again or type your message.");
        }
      );
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);

    if (!audioEnabled) {
      // If turning on, preload responses
      audioService.preloadCommonResponses();
    } else {
      // If turning off, stop any playing audio
      audioService.stopAudio();
      if (isListening) {
        audioService.stopListening();
        setIsListening(false);
      }
    }
  };

  // ====================================================================
  // EFFECTS
  // ====================================================================

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  useEffect(() => {
    if (preferences && !sessionId && !showOnboarding) {
      startNewSession();
    }
  }, [preferences, sessionId, showOnboarding]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (preferences && audioEnabled) {
      // Set voice preferences
      audioService.setVoicePreferences(
        preferences.voice_preference || "nova",
        1.0, // playback speed
        1.0 // volume
      );

      // Cleanup audio on unmount
      useEffect(() => {
        return () => {
          if (audioService) {
            audioService.stopAudio();
            audioService.stopListening();
            audioService.clearCache();
          }
        };
      }, [audioService]);

      // Preload common responses
      audioService.preloadCommonResponses();
    }
  }, [preferences, audioEnabled, audioService]);

  // ====================================================================
  // LOADING & ACCESS CONTROL
  // ====================================================================

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">
            Loading your personalized experience...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess("reflectionarian") || tier !== "premium") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 max-w-md">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Premium Reflectionarian
          </h2>
          <p className="text-gray-300 mb-8">
            Unlock the most sophisticated AI companion with therapy-style
            structured sessions, voice interactions, and personalized growth
            tracking.
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // ====================================================================
  // ONBOARDING COMPONENT
  // ====================================================================

  if (showOnboarding) {
    const currentQuestion = onboardingQuestions[onboardingStep];
    const responses = {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Personalize Your Experience
                </h2>
                <span className="text-sm text-gray-300">
                  {onboardingStep + 1} of {onboardingQuestions.length}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((onboardingStep + 1) / onboardingQuestions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                {currentQuestion.question}
              </h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      responses[currentQuestion.id] = option.value;

                      if (onboardingStep < onboardingQuestions.length - 1) {
                        setOnboardingStep(onboardingStep + 1);
                      } else {
                        // Save preferences and complete onboarding
                        onboardingQuestions.forEach((q, idx) => {
                          if (idx < onboardingStep) {
                            responses[q.id] = q.options[0].value; // Default values for previous
                          }
                        });
                        saveUserPreferences(responses);
                      }
                    }}
                    className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-white group-hover:text-purple-300 transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skip Button */}
            {onboardingStep > 0 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // MAIN CHAT INTERFACE
  // ====================================================================

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Premium Reflectionarian
              </h1>
              <p className="text-sm text-gray-300">
                {preferences?.therapy_approach || "Your AI Therapy Companion"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Premium Badge */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
              Premium
            </div>

            {/* Privacy Info Icon */}
            <button
              onClick={() => setShowPrivacyInfo(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Privacy Information"
            >
              <Shield className="w-5 h-5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={audioEnabled ? "Disable voice" : "Enable voice"}
            >
              {audioEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* New Session */}
            <button
              onClick={startNewSession}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>
        </div>

        {/* Pro Features Tabs */}
        <div className="flex gap-2 mt-4 pb-2 overflow-x-auto">
          {[
            { id: "chat", label: "Conversation", icon: MessageCircle },
            { id: "prompts", label: "Session Prompts", icon: Lightbulb },
            { id: "goals", label: "Goal Tracking", icon: Target },
            { id: "report", label: "Weekly Report", icon: FileText },
            { id: "timeline", label: "Growth Timeline", icon: TrendingUp },
            { id: "export", label: "Export Sessions", icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeProTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        {activeProTab === "chat" ? (
          <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Welcome to Your Therapy Session
                  </h3>
                  <p className="text-gray-300">
                    Share what's on your mind. This is your safe space.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                        : "bg-white/10 backdrop-blur-md text-white border border-white/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/5 backdrop-blur-md border-t border-white/20">
              <div className="flex gap-3">
                {/* Voice Input Button */}
                {audioEnabled && (
                  <button
                    onClick={handleVoiceInput}
                    disabled={isProcessingResponse}
                    className={`p-3 rounded-lg transition-all ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700 animate-pulse"
                        : "bg-white/10 hover:bg-white/20"
                    } text-white disabled:opacity-50`}
                    title={isListening ? "Stop recording" : "Start recording"}
                  >
                    <Mic
                      className={`w-5 h-5 ${
                        isListening ? "animate-pulse" : ""
                      }`}
                    />
                  </button>
                )}

                {/* Show current transcript while speaking */}
                {isListening && currentTranscript && (
                  <div className="absolute -top-12 left-0 right-0 bg-purple-600/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-white">
                    {currentTranscript}
                  </div>
                )}

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Share what's on your mind..."
                    className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400 transition-colors"
                    rows="3"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Session Prompts (if any) */}
              {sessionPrompts.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400">Suggested:</span>
                  {sessionPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMessage(prompt)}
                      className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Other tabs content (placeholder for now)
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeProTab === "prompts" && "Session Prompts"}
                {activeProTab === "goals" && "Goal Tracking"}
                {activeProTab === "report" && "Weekly Reports"}
                {activeProTab === "timeline" && "Growth Timeline"}
                {activeProTab === "export" && "Export Sessions"}
              </h3>
              <p className="text-gray-300">This feature is coming soon...</p>
            </div>
          </div>
        )}
      </div>
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Reflectionarian Settings
            </h3>

            <div className="space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Voice
                </label>
                <select
                  value={preferences?.voice_preference || "nova"}
                  onChange={(e) => {
                    // Update voice preference
                    audioService.setVoicePreferences(e.target.value);
                    // You'd also save this to the database
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="alloy">Alloy - Neutral</option>
                  <option value="echo">Echo - Smooth</option>
                  <option value="fable">Fable - Expressive</option>
                  <option value="onyx">Onyx - Deep</option>
                  <option value="nova">Nova - Warm</option>
                  <option value="shimmer">Shimmer - Soft</option>
                </select>
              </div>

              {/* Session Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Reminders
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2 rounded"
                    defaultChecked
                  />
                  Send weekly session summaries
                </label>
              </div>

              {/* Export Current Session */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Export Options
                </label>
                <button
                  onClick={() => {
                    // Export current session logic
                    alert(
                      "Current session will be available in your User Settings for download"
                    );
                  }}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Export Current Session
                </button>
              </div>

              {/* Therapy Approach */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Current Approach:</span>
                  <br />
                  {preferences?.therapy_approach || "Not set"}
                </p>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowOnboarding(true);
                    setOnboardingStep(0);
                  }}
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Retake questionnaire →
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-6 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-bold text-white">
                Your Privacy Matters
              </h3>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
                Your Reflectionarian sessions are protected with the highest
                level of privacy:
              </p>

              <ul className="space-y-2 list-disc list-inside">
                <li>All conversations are end-to-end encrypted</li>
                <li>Only you can read your session content</li>
                <li>No personal identifiers are sent to AI services</li>
                <li>Voice data is processed locally when possible</li>
                <li>Audio is never stored - only text transcripts</li>
                <li>You can delete any session at any time</li>
              </ul>

              <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/30">
                <p className="text-sm">
                  <strong className="text-purple-300">Note:</strong> While AI
                  responses are generated using OpenAI's API, we only send
                  anonymized session IDs and your messages - never your personal
                  information or account details.
                </p>
              </div>

              <p className="text-sm">
                This is your private space for self-reflection and growth. Not
                even our team can access your conversations.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(false)}
              className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumReflectionarian;
