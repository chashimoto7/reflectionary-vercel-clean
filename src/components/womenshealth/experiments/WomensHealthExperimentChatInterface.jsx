// frontend/src/components/womenshealth/experiments/WomensHealthExperimentChatInterface.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  X,
  Loader,
  AlertCircle,
  Check,
  Edit3,
  Info,
  ChevronDown,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Flower2,
  Droplets,
  Shield,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { CYCLE_PHASE_INFO } from "../../../utils/womensHealthConstants";

const WomensHealthExperimentChatInterface = ({
  experiment,
  onClose,
  onExperimentUpdate,
  userId,
  colors,
  lifeStage,
  cycleInfo,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModificationSummary, setShowModificationSummary] = useState(false);
  const [modifications, setModifications] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  useEffect(() => {
    initializeChat();
  }, [experiment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    // Get phase info if applicable
    const phaseInfo = cycleInfo?.phase
      ? CYCLE_PHASE_INFO[cycleInfo.phase]
      : null;

    // Create personalized initial message
    let greeting = `Hi! I'm here to help you optimize your "${experiment.title}" experiment for your ${lifeStage} journey.`;

    if (phaseInfo && lifeStage === "menstrual") {
      greeting += `\n\nI see you're in your ${phaseInfo.name} phase (Day ${cycleInfo.cycle_day}). ${phaseInfo.focus} is the focus during this time.`;
    }

    greeting += `\n\nYou can ask me:
• Why this experiment was designed for you
• How to modify it for your current symptoms
• Questions about the protocol
• For easier alternatives
• How to adapt it to your schedule

What would you like to know?`;

    const initialMessage = {
      id: Date.now(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([initialMessage]);

    // Load any previous modifications
    if (experiment.chat_modifications?.modifications) {
      setModifications(experiment.chat_modifications.modifications);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${backendUrl}/api/womens-health/experiments/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: userId,
            experiment_id: experiment.id,
            message: inputMessage,
            experiment_data: experiment,
            current_cycle_info: cycleInfo,
            modifications: modifications,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        modifications: data.modifications,
        health_tips: data.health_tips,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle any modifications
      if (data.modifications && data.modifications.length > 0) {
        handleModifications(data.modifications);
      }

      // Handle health tips
      if (data.health_tips && data.health_tips.length > 0) {
        setHealthTips(data.health_tips);
      }

      // Handle experiment updates
      if (data.updated_experiment) {
        onExperimentUpdate(data.updated_experiment);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifications = (newModifications) => {
    setModifications((prev) => [...prev, ...newModifications]);
    setShowModificationSummary(true);

    // Auto-hide summary after 5 seconds
    setTimeout(() => {
      setShowModificationSummary(false);
    }, 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatModification = (mod) => {
    const fieldLabels = {
      duration: "Duration",
      protocol: "Protocol Steps",
      metrics: "Tracking Metrics",
      success_criteria: "Success Criteria",
      title: "Title",
      hypothesis: "Hypothesis",
      phase_modifications: "Phase Adjustments",
    };

    return {
      label: fieldLabels[mod.field] || mod.field,
      oldValue: mod.old_value,
      newValue: mod.new_value,
      reason: mod.reason,
      phase_specific: mod.phase_specific,
    };
  };

  const getQuickQuestions = () => {
    const baseQuestions = [
      `Why is this good for ${lifeStage}?`,
      "Can we make this easier?",
      "What if I miss a few days?",
    ];

    if (lifeStage === "menstrual") {
      baseQuestions.push("How should I adjust this during my period?");
    } else if (lifeStage === "perimenopause") {
      baseQuestions.push("What if my symptoms are unpredictable?");
    } else if (lifeStage === "menopause") {
      baseQuestions.push("Is this safe for bone health?");
    }

    if (experiment.symptom_targets?.includes("hot_flashes")) {
      baseQuestions.push("What are the best times to do this?");
    }

    return baseQuestions;
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      menstrual: Droplets,
      follicular: Flower2,
      ovulation: Sun,
      luteal: Moon,
    };
    return icons[phase] || Heart;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Women's Health AI Assistant
                </h3>
                <p className="text-sm text-purple-300">
                  Personalizing your {experiment.title} experiment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Current Phase Indicator */}
          {cycleInfo?.phase && lifeStage === "menstrual" && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200">Current Phase:</span>
              {(() => {
                const PhaseIcon = getPhaseIcon(cycleInfo.phase);
                const phaseInfo = CYCLE_PHASE_INFO[cycleInfo.phase];
                return (
                  <span
                    className={`flex items-center gap-1 ${phaseInfo.color}`}
                  >
                    <PhaseIcon className="w-4 h-4" />
                    {phaseInfo.name} (Day {cycleInfo.cycle_day})
                  </span>
                );
              })()}
            </div>
          )}

          {/* Modification Summary */}
          {showModificationSummary && modifications.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-600/20 rounded-lg border border-emerald-600/30">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Experiment Updated ({modifications.length} changes)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.role === "user" ? "order-2" : "order-1"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-purple-600 order-2"
                        : "bg-purple-600/20 order-1"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div
                    className={`${
                      message.role === "user" ? "order-1" : "order-2"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : message.isError
                          ? "bg-red-600/20 text-red-300 border border-red-600/30"
                          : "bg-white/10 text-purple-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {/* Show modifications if any */}
                      {message.modifications &&
                        message.modifications.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              Changes made:
                            </p>
                            <ul className="space-y-1">
                              {message.modifications.map((mod, index) => {
                                const formatted = formatModification(mod);
                                return (
                                  <li
                                    key={index}
                                    className="text-sm opacity-90"
                                  >
                                    • {formatted.label} updated
                                    {formatted.phase_specific && (
                                      <span className="text-xs ml-1">
                                        (for {cycleInfo.phase} phase)
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                      {/* Show health tips if any */}
                      {message.health_tips &&
                        message.health_tips.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              Health Tips:
                            </p>
                            <ul className="space-y-1">
                              {message.health_tips.map((tip, index) => (
                                <li
                                  key={index}
                                  className="text-sm opacity-90 flex items-start gap-1"
                                >
                                  <Shield className="w-3 h-3 mt-0.5 text-green-400" />
                                  <span>{tip.tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      {format(message.timestamp, "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-lg p-4 flex items-center gap-2">
                <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-purple-300">
                  AI is thinking about your {lifeStage} needs...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Health Tips Display */}
        {healthTips.length > 0 && (
          <div className="mx-6 mb-3 p-3 bg-green-600/20 rounded-lg border border-green-600/30">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-300 mb-1">
                  Phase-Specific Tips:
                </p>
                <p className="text-xs text-green-200">{healthTips[0].tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-purple-400 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {getQuickQuestions().map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-purple-300 px-3 py-1.5 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about symptoms, modifications, or get personalized advice..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>

          {/* Modifications Summary */}
          {modifications.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() =>
                  setShowModificationSummary(!showModificationSummary)
                }
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                {modifications.length} modification
                {modifications.length > 1 ? "s" : ""} made
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    showModificationSummary ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showModificationSummary && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg space-y-2">
                  {modifications.map((mod, index) => {
                    const formatted = formatModification(mod);
                    return (
                      <div key={index} className="text-xs">
                        <div className="flex items-center gap-2 text-purple-300">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="font-medium">{formatted.label}</span>
                          {formatted.phase_specific && (
                            <span className="text-purple-400">
                              (Phase-specific)
                            </span>
                          )}
                        </div>
                        {formatted.reason && (
                          <p className="text-purple-400 ml-5">
                            {formatted.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WomensHealthExperimentChatInterface;
