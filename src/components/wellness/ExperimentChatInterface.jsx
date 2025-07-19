// frontend/src/components/wellness/ExperimentChatInterface.jsx
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
} from "lucide-react";
import { format } from "date-fns";

const ExperimentChatInterface = ({
  experiment,
  onClose,
  onExperimentUpdate,
  userId,
  colors,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModificationSummary, setShowModificationSummary] = useState(false);
  const [modifications, setModifications] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  useEffect(() => {
    // Initialize chat with experiment context
    initializeChat();
  }, [experiment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    // Add initial AI message
    const initialMessage = {
      id: Date.now(),
      role: "assistant",
      content: `Hi! I'm here to help you understand and customize your "${experiment.title}" experiment. 

You can ask me:
• Why I suggested this experiment
• Questions about the protocol
• To modify the duration, steps, or metrics
• For tips on making it easier
• Anything else about optimizing this for you!

What would you like to know?`,
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
        `${backendUrl}/api/wellness/experiments/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            experiment_id: experiment.id,
            message: inputMessage,
            experiment_data: experiment,
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
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle any modifications
      if (data.modifications && data.modifications.length > 0) {
        handleModifications(data.modifications);
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
    };

    return {
      label: fieldLabels[mod.field] || mod.field,
      oldValue: mod.old_value,
      newValue: mod.new_value,
      reason: mod.reason,
    };
  };

  const getQuickQuestions = () => {
    return [
      "Why did you suggest this experiment?",
      "Can we make this easier to follow?",
      "What if I can only do this 3 times a week?",
      "How will this help with my specific patterns?",
      "Can we shorten the duration?",
    ];
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
                  AI Assistant for: {experiment.title}
                </h3>
                <p className="text-sm text-purple-300">
                  Ask questions or request modifications
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
                                  </li>
                                );
                              })}
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
                <span className="text-purple-300">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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
              placeholder="Ask about this experiment or request changes..."
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

export default ExperimentChatInterface;
