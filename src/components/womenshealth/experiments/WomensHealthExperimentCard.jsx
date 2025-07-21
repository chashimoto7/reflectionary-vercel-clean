// frontend/src/components/womenshealth/experiments/WomensHealthExperimentCard.jsx
import React, { useState } from "react";
import {
  Bot,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Play,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Moon,
  Sun,
  Flower2,
  Droplets,
  Thermometer,
  Brain,
  Heart,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { WOMENS_HEALTH_EXPERIMENT_ICONS } from "../../../utils/womensHealthConstants";

const WomensHealthExperimentCard = ({
  experiment,
  colors,
  view,
  cycleInfo,
  onChatOpen,
  onComplete,
  onViewDetails,
  onStart,
  onDecline,
  onRepeat,
}) => {
  const [showPhaseModifications, setShowPhaseModifications] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const Icon =
    WOMENS_HEALTH_EXPERIMENT_ICONS[experiment.category] ||
    WOMENS_HEALTH_EXPERIMENT_ICONS.general;
  const isAI = experiment.experiment_type === "ai_generated";

  // Get phase-specific modifications if applicable
  const getPhaseModification = () => {
    if (!experiment.phase_modifications || !cycleInfo?.phase) return null;
    return experiment.phase_modifications[cycleInfo.phase];
  };

  // Calculate progress for active experiments
  const calculateProgress = () => {
    if (view !== "active") return null;

    const startDate = new Date(experiment.start_date);
    const endDate = addDays(startDate, experiment.duration);
    const today = new Date();
    const daysElapsed = differenceInDays(today, startDate);
    const daysRemaining = Math.max(0, differenceInDays(endDate, today));
    const percentComplete = Math.min(
      100,
      (daysElapsed / experiment.duration) * 100
    );

    return {
      daysElapsed,
      daysRemaining,
      percentComplete,
      endDate,
    };
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      easy: "text-emerald-400",
      medium: "text-amber-400",
      hard: "text-red-400",
    };
    return colorMap[difficulty] || "text-gray-400";
  };

  const getSymptomIcon = (symptom) => {
    const iconMap = {
      hot_flashes: Thermometer,
      mood_swings: Brain,
      cramps: Heart,
      fatigue: Moon,
      night_sweats: Droplets,
    };
    return iconMap[symptom] || Heart;
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      onDecline(declineReason);
      setShowDeclineReason(false);
      setDeclineReason("");
    }
  };

  const progress = calculateProgress();
  const phaseModification = getPhaseModification();

  const renderActiveView = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-lg bg-purple-600/20">
            <Icon className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg mb-1 flex items-center gap-2">
              {experiment.title}
              {isAI && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 text-xs rounded-full">
                  <Bot className="w-3 h-3" />
                  AI
                </span>
              )}
            </h4>
            <p className="text-purple-200 text-sm">{experiment.hypothesis}</p>

            {/* Symptom targets */}
            {experiment.symptom_targets?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {experiment.symptom_targets.map((symptom) => {
                  const SymptomIcon = getSymptomIcon(symptom);
                  return (
                    <span
                      key={symptom}
                      className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs text-purple-300"
                    >
                      <SymptomIcon className="w-3 h-3" />
                      {symptom.replace(/_/g, " ")}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {experiment.canChat && (
            <button
              onClick={() => onChatOpen(experiment)}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 transition-colors"
              title="Chat with AI about this experiment"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onViewDetails(experiment)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onComplete(experiment)}
            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-300">Progress</span>
          <span className="text-sm text-white">
            Day {progress.daysElapsed} of {experiment.duration}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
        <p className="text-xs text-purple-400 mt-1">
          {progress.daysRemaining} days remaining • Ends{" "}
          {format(progress.endDate, "MMM d")}
        </p>
      </div>

      {/* Phase Modification Alert */}
      {phaseModification && experiment.cycle_aware && (
        <div className="mb-4 p-3 bg-purple-600/20 rounded-lg border border-purple-600/30">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowPhaseModifications(!showPhaseModifications)}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">
                Protocol adjusted for {cycleInfo.phase} phase
              </span>
            </div>
            {showPhaseModifications ? (
              <ChevronUp className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            )}
          </div>

          {showPhaseModifications && (
            <div className="mt-3 space-y-2">
              {phaseModification.map((mod, index) => (
                <p key={index} className="text-xs text-purple-300 pl-6">
                  • {mod}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today's Focus */}
      <div className="bg-white/5 rounded-lg p-3">
        <p className="text-sm font-medium text-purple-300 mb-2">
          Today's Protocol:
        </p>
        <ul className="space-y-1">
          {experiment.protocol.slice(0, 2).map((step, index) => (
            <li
              key={index}
              className="text-sm text-white flex items-start gap-2"
            >
              <span className="text-purple-400">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
        {experiment.protocol.length > 2 && (
          <p className="text-xs text-purple-400 mt-1">
            +{experiment.protocol.length - 2} more steps
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Duration</div>
          <div className="text-sm font-medium text-white">
            {experiment.duration}d
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Expected</div>
          <div className="text-sm font-medium text-white">
            +{experiment.expected_improvement}%
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <span
            className={`text-xs font-medium ${getDifficultyColor(
              experiment.difficulty
            )}`}
          >
            {experiment.difficulty}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSuggestedView = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white text-lg mb-1 flex items-center gap-2">
                {experiment.title}
                {isAI && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 text-xs rounded-full">
                    <Bot className="w-3 h-3" />
                    AI Generated
                  </span>
                )}
              </h4>
              <p className="text-purple-200 text-sm mb-3">
                {experiment.hypothesis}
              </p>

              {/* AI Reasoning */}
              {experiment.ai_metadata?.reasoning && (
                <p className="text-purple-300 text-xs italic mb-3 flex items-start gap-1">
                  <Sparkles className="w-3 h-3 mt-0.5" />
                  {experiment.ai_metadata.reasoning}
                </p>
              )}

              {/* Symptom Targets */}
              {experiment.symptom_targets?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {experiment.symptom_targets.map((symptom) => {
                    const SymptomIcon = getSymptomIcon(symptom);
                    return (
                      <span
                        key={symptom}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-full text-xs text-purple-300"
                      >
                        <SymptomIcon className="w-3 h-3" />
                        {symptom.replace(/_/g, " ")}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-medium ${getDifficultyColor(
                  experiment.difficulty
                )}`}
              >
                {experiment.difficulty}
              </span>
              <span className="text-xs text-purple-400">
                {experiment.duration} days
              </span>
              {experiment.min_cycles > 1 && (
                <span className="text-xs text-purple-400">
                  {experiment.min_cycles} cycles
                </span>
              )}
            </div>
          </div>

          {/* Expected Impact */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-300">
                Expected Improvement
              </span>
              <span className="text-lg font-bold text-white">
                +{experiment.expected_improvement}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{
                  width: `${Math.min(experiment.expected_improvement, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Protocol */}
          <div className="mb-4">
            <p className="text-sm font-medium text-purple-300 mb-2">
              Protocol:
            </p>
            <ol className="space-y-1">
              {experiment.protocol.slice(0, 3).map((step, index) => (
                <li
                  key={index}
                  className="text-sm text-purple-200 flex items-start gap-2"
                >
                  <span className="text-purple-400">{index + 1}.</span>
                  {step}
                </li>
              ))}
              {experiment.protocol.length > 3 && (
                <li className="text-sm text-purple-400">
                  +{experiment.protocol.length - 3} more steps...
                </li>
              )}
            </ol>
          </div>

          {/* Life Stage Badge */}
          {experiment.life_stage_specific && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 rounded-full text-xs text-purple-300">
                <Shield className="w-3 h-3" />
                Designed for{" "}
                {experiment.ai_metadata?.life_stage || "your life stage"}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAI && (
              <button
                onClick={() => onChatOpen(experiment)}
                className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Customize with AI
              </button>
            )}
            <button
              onClick={() => onStart(experiment)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Experiment
            </button>
            {isAI && (
              <button
                onClick={() => setShowDeclineReason(!showDeclineReason)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Decline Reason Input */}
          {showDeclineReason && (
            <div className="mt-3 p-3 bg-red-600/10 rounded-lg border border-red-600/30">
              <p className="text-sm text-red-300 mb-2">
                Help us improve - why isn't this right for you?
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Too long, wrong symptoms, bad timing..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-red-300 text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleDecline}
                  disabled={!declineReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-1 rounded text-sm"
                >
                  Submit & Decline
                </button>
                <button
                  onClick={() => {
                    setShowDeclineReason(false);
                    setDeclineReason("");
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompletedView = () => {
    const success = experiment.results?.success;
    const improvements = experiment.symptom_improvements || {};

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-lg ${
                success ? "bg-emerald-600/20" : "bg-amber-600/20"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  success ? "text-emerald-400" : "text-amber-400"
                }`}
              />
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg mb-1 flex items-center gap-2">
                {experiment.title}
                {success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                {isAI && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 text-xs rounded-full">
                    <Bot className="w-3 h-3" />
                    AI
                  </span>
                )}
              </h4>
              <p className="text-purple-200 text-sm">
                Completed{" "}
                {format(
                  new Date(experiment.completed_at || Date.now()),
                  "MMM d, yyyy"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewDetails(experiment)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Results Summary */}
        <div className="space-y-4 mb-4">
          {/* Overall Improvement */}
          {experiment.results?.improvement !== undefined && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">
                  Overall Improvement
                </span>
                <span
                  className={`text-lg font-bold ${
                    experiment.results.improvement > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {experiment.results.improvement > 0 ? "+" : ""}
                  {experiment.results.improvement.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    experiment.results.improvement > 0
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.abs(experiment.results.improvement),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Symptom Improvements */}
          {Object.keys(improvements).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(improvements)
                .slice(0, 4)
                .map(([symptom, data]) => (
                  <div key={symptom} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-purple-400 capitalize mb-1">
                      {symptom.replace(/_/g, " ")}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-white">
                        {data.after.toFixed(1)}
                      </span>
                      <span
                        className={`text-xs ${
                          data.improvement > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {data.improvement > 0 ? "↓" : "↑"}{" "}
                        {Math.abs(data.improvement).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-purple-300">
                      from {data.before.toFixed(1)}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Insights */}
          {experiment.results?.insights &&
            experiment.results.insights.length > 0 && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm font-medium text-purple-300 mb-2">
                  Key Insights:
                </p>
                <ul className="space-y-1">
                  {experiment.results.insights
                    .slice(0, 2)
                    .map((insight, index) => (
                      <li
                        key={index}
                        className="text-sm text-purple-200 flex items-start gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {insight.message}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onRepeat(experiment)}
            className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Repeat Experiment
          </button>
        </div>
      </div>
    );
  };

  switch (view) {
    case "active":
      return renderActiveView();
    case "suggested":
      return renderSuggestedView();
    case "completed":
      return renderCompletedView();
    default:
      return null;
  }
};

export default WomensHealthExperimentCard;
