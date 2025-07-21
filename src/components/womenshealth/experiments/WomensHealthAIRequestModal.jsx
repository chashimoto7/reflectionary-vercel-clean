// frontend/src/components/womenshealth/experiments/WomensHealthAIRequestModal.jsx
import React, { useState } from "react";
import {
  X,
  Bot,
  Wand2,
  Heart,
  Brain,
  Thermometer,
  Moon,
  Activity,
  AlertCircle,
  Info,
  Sparkles,
  Shield,
  ChevronRight,
} from "lucide-react";

const WomensHealthAIRequestModal = ({
  onClose,
  onRequest,
  requesting,
  lifeStage,
  currentSymptoms,
}) => {
  const [aiRequest, setAiRequest] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");

  // Life stage specific prompt suggestions
  const getPromptSuggestions = () => {
    const basePrompts = {
      menstrual: [
        {
          icon: Heart,
          text: "Help me manage my PMS symptoms naturally",
          value:
            "I experience mood swings, bloating, and irritability before my period. I'd like a natural approach to manage these PMS symptoms.",
        },
        {
          icon: Activity,
          text: "Create a cycle-synced exercise routine",
          value:
            "I want to optimize my workouts based on my menstrual cycle phases for better energy and results.",
        },
        {
          icon: Brain,
          text: "Reduce menstrual migraines",
          value:
            "I get severe headaches around my period. Help me find ways to prevent and manage menstrual migraines.",
        },
        {
          icon: Moon,
          text: "Improve my luteal phase sleep",
          value:
            "My sleep quality drops significantly before my period. I need strategies to sleep better during my luteal phase.",
        },
      ],
      perimenopause: [
        {
          icon: Thermometer,
          text: "Identify and manage hot flash triggers",
          value:
            "I'm experiencing frequent hot flashes and want to identify my triggers and find effective management strategies.",
        },
        {
          icon: Moon,
          text: "Combat perimenopausal insomnia",
          value:
            "Night sweats and hormonal changes are disrupting my sleep. I need help establishing better sleep during perimenopause.",
        },
        {
          icon: Brain,
          text: "Clear the brain fog",
          value:
            "I'm struggling with memory issues and mental clarity. Help me improve cognitive function during perimenopause.",
        },
        {
          icon: Heart,
          text: "Stabilize mood swings",
          value:
            "My emotions are all over the place with perimenopause. I need strategies to manage mood volatility.",
        },
      ],
      menopause: [
        {
          icon: Activity,
          text: "Build bone-protecting exercise routine",
          value:
            "I want to create an exercise program that protects my bones and maintains muscle mass post-menopause.",
        },
        {
          icon: Brain,
          text: "Boost mental clarity and memory",
          value:
            "Help me maintain cognitive sharpness and overcome menopause-related brain fog.",
        },
        {
          icon: Heart,
          text: "Enhance energy and vitality",
          value:
            "I feel constantly tired since menopause. I need strategies to boost my energy and feel vibrant again.",
        },
        {
          icon: Thermometer,
          text: "Manage persistent symptoms",
          value:
            "I still have hot flashes and other symptoms years after menopause. Help me find long-term management strategies.",
        },
      ],
    };

    return basePrompts[lifeStage] || basePrompts.menstrual;
  };

  // Symptom-based suggestions
  const getSymptomPrompts = () => {
    if (!currentSymptoms || currentSymptoms.length === 0) return [];

    const symptomPrompts = [];

    if (currentSymptoms.some((s) => s.symptom === "hot_flashes")) {
      symptomPrompts.push({
        icon: Thermometer,
        text: "Reduce hot flash frequency",
        value:
          "My hot flashes are disrupting my daily life. Create an experiment to reduce their frequency and severity.",
      });
    }

    if (currentSymptoms.some((s) => s.symptom === "mood_swings")) {
      symptomPrompts.push({
        icon: Brain,
        text: "Stabilize hormonal mood changes",
        value:
          "Help me manage the emotional ups and downs caused by hormonal changes.",
      });
    }

    if (currentSymptoms.some((s) => s.symptom === "fatigue")) {
      symptomPrompts.push({
        icon: Moon,
        text: "Combat hormonal fatigue",
        value:
          "I'm exhausted all the time. Design an experiment to boost my energy naturally.",
      });
    }

    return symptomPrompts.slice(0, 2);
  };

  const handleRequest = () => {
    const requestText = aiRequest || selectedPrompt;
    if (requestText.trim()) {
      onRequest(requestText);
    }
  };

  const prompts = getPromptSuggestions();
  const symptomPrompts = getSymptomPrompts();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-400" />
              AI Experiment Generator
            </h3>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-200 text-sm mt-2">
            Tell me what you'd like to work on, and I'll create a personalized{" "}
            {lifeStage} experiment
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Suggestions */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Popular requests for {lifeStage}:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPrompt(prompt.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPrompt === prompt.value
                      ? "bg-purple-600/30 border-purple-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <prompt.icon className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-sm text-white">{prompt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Symptom-based Suggestions */}
          {symptomPrompts.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Based on your symptoms:
              </h4>
              <div className="space-y-3">
                {symptomPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPrompt(prompt.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPrompt === prompt.value
                        ? "bg-green-600/30 border-green-500"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <prompt.icon className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-white">{prompt.text}</span>
                      <ChevronRight className="w-4 h-4 text-green-400 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Request */}
          <div>
            <h4 className="text-white font-medium mb-3">
              Or describe your specific needs:
            </h4>
            <textarea
              value={aiRequest}
              onChange={(e) => {
                setAiRequest(e.target.value);
                setSelectedPrompt(""); // Clear selection when typing
              }}
              placeholder={`Example: "I'm in ${lifeStage} and struggling with ${
                currentSymptoms[0]?.symptom || "fatigue"
              }. I'd like to try natural approaches that fit my busy schedule..."`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
          </div>

          {/* Tips */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tips for best results:
            </h4>
            <ul className="space-y-1 text-sm text-purple-200">
              <li>• Be specific about your symptoms and when they occur</li>
              <li>• Mention any time constraints or preferences</li>
              <li>• Include what you've already tried</li>
              <li>• Share your main goal (relief, prevention, optimization)</li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-600/10 rounded-lg p-3 border border-amber-600/30">
            <p className="text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              AI experiments are for wellness tracking only. For medical
              concerns, consult your healthcare provider.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={handleRequest}
              disabled={(!aiRequest.trim() && !selectedPrompt) || requesting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {requesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating your experiment...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Generate Experiment
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensHealthAIRequestModal;
