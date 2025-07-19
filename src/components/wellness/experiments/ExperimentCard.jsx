// frontend/src/components/wellness/experiments/ExperimentCard.jsx
import React from "react";
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
  Share2,
  Lock,
  Unlock,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { EXPERIMENT_ICONS } from "../../utils/experimentConstants";
import { getDifficultyColor } from "../../utils/experimentHelpers";

const ExperimentCard = ({
  experiment,
  colors,
  view,
  onChatOpen,
  onComplete,
  onViewDetails,
  onStart,
  onDecline,
  onRepeat,
}) => {
  const Icon =
    experiment.icon ||
    EXPERIMENT_ICONS[experiment.category] ||
    EXPERIMENT_ICONS.custom;
  const isAI = experiment.experiment_type === "ai_generated";

  const renderActiveView = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-lg bg-purple-600/20">
            <Icon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
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
            {experiment.ai_metadata?.reasoning && (
              <p className="text-purple-300 text-xs mt-1 italic">
                Based on your {experiment.ai_metadata.reasoning}
              </p>
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
            Day {experiment.progress.daysElapsed} of {experiment.duration}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
            style={{ width: `${experiment.progress.percentComplete}%` }}
          />
        </div>
        <p className="text-xs text-purple-400 mt-1">
          {experiment.progress.daysRemaining} days remaining
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Duration</div>
          <div className="text-sm font-medium text-white">
            {experiment.duration} days
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Metrics</div>
          <div className="text-sm font-medium text-white">
            {experiment.metrics.length}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Expected</div>
          <div className="text-sm font-medium text-white">
            +{experiment.expectedImprovement || 15}%
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-purple-300">Ends</div>
          <div className="text-sm font-medium text-white">
            {format(experiment.endDate, "MMM d")}
          </div>
        </div>
      </div>

      {/* Protocol Preview */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-sm text-purple-300 mb-2">Today's Protocol:</p>
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
      </div>
    </div>
  );

  const renderSuggestedView = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${experiment.color || colors.purple}20` }}
        >
          <Icon
            className="w-6 h-6"
            style={{ color: experiment.color || colors.purple }}
          />
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
              {experiment.ai_metadata?.reasoning && (
                <p className="text-purple-300 text-xs italic mb-3">
                  {experiment.ai_metadata.reasoning}
                </p>
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
            </div>
          </div>

          {/* Expected Impact */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-300">
                Expected Improvement
              </span>
              <span className="text-lg font-bold text-white">
                +{experiment.expectedImprovement}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${experiment.expectedImprovement}%` }}
              />
            </div>
          </div>

          {/* Protocol */}
          <div className="mb-4">
            <p className="text-sm font-medium text-purple-300 mb-2">
              Protocol:
            </p>
            <ol className="space-y-1">
              {experiment.protocol.map((step, index) => (
                <li
                  key={index}
                  className="text-sm text-purple-200 flex items-start gap-2"
                >
                  <span className="text-purple-400">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Metrics */}
          <div className="mb-4">
            <p className="text-sm font-medium text-purple-300 mb-2">
              Tracking:
            </p>
            <div className="flex flex-wrap gap-2">
              {experiment.metrics.map((metric, index) => (
                <span
                  key={index}
                  className="text-xs bg-white/10 text-purple-300 px-2 py-1 rounded"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          {experiment.tips && (
            <div className="mb-4 p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
              <p className="text-sm font-medium text-purple-300 mb-1">
                Pro Tips:
              </p>
              <ul className="space-y-1">
                {experiment.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="text-xs text-purple-200 flex items-start gap-1"
                  >
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
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
              Start This Experiment
            </button>
            {isAI && (
              <button
                onClick={() => {
                  const reason = prompt(
                    "Why are you declining this experiment?"
                  );
                  if (reason) {
                    onDecline(experiment, reason);
                  }
                }}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedView = () => {
    const success = experiment.results?.success;
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
                  new Date(experiment.completed_at || experiment.endDate),
                  "MMM d, yyyy"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(experiment)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-purple-300 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            {experiment.is_public ? (
              <Unlock className="w-4 h-4 text-purple-400" />
            ) : (
              <Lock className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {experiment.results?.improvement &&
            Object.entries(experiment.results.improvement)
              .slice(0, 3)
              .map(([metric, data]) => (
                <div key={metric} className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-purple-400 capitalize mb-1">
                    {metric.replace("_", " ")}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">
                      {data.final.toFixed(1)}
                    </span>
                    <span
                      className={`text-sm ${
                        data.change > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {data.change > 0 ? "+" : ""}
                      {data.change.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-purple-300">
                    from {data.baseline.toFixed(1)}
                  </div>
                </div>
              ))}
        </div>

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

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onRepeat(experiment)}
            className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Repeat Experiment
          </button>
          {success && !experiment.is_public && (
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-purple-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Results
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCommunityView = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${experiment.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: experiment.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white text-lg mb-1">
                {experiment.title}
              </h4>
              <p className="text-purple-300 text-sm mb-1">
                by {experiment.author} • {experiment.category}
              </p>
              <p className="text-purple-200 text-sm">{experiment.hypothesis}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(experiment.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-500"
                    }`}
                  />
                ))}
                <span className="text-xs text-purple-300 ml-1">
                  ({experiment.reviews})
                </span>
              </div>
              <span
                className={`text-xs font-medium ${getDifficultyColor(
                  experiment.difficulty
                )}`}
              >
                {experiment.difficulty} • {experiment.duration} days
              </span>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-400">Success Rate</div>
              <div className="text-lg font-bold text-white">
                {experiment.successRate}%
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-400">Participants</div>
              <div className="text-lg font-bold text-white">
                {experiment.participantCount}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-400">Avg Improvement</div>
              <div className="text-lg font-bold text-emerald-400">
                +{experiment.avgImprovement}%
              </div>
            </div>
          </div>

          {/* Protocol Preview */}
          <div className="mb-4">
            <p className="text-sm font-medium text-purple-300 mb-2">
              Protocol:
            </p>
            <ol className="space-y-1">
              {experiment.protocol.slice(0, 2).map((step, index) => (
                <li
                  key={index}
                  className="text-sm text-purple-200 flex items-start gap-2"
                >
                  <span className="text-purple-400">{index + 1}.</span>
                  {step}
                </li>
              ))}
              {experiment.protocol.length > 2 && (
                <li className="text-sm text-purple-400">
                  +{experiment.protocol.length - 2} more steps...
                </li>
              )}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const adapted = {
                  ...experiment,
                  id: `adapted-${experiment.id}`,
                  isFromCommunity: true,
                };
                onStart(adapted);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              Try This Experiment
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-300 rounded-lg font-medium transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  switch (view) {
    case "active":
      return renderActiveView();
    case "suggested":
      return renderSuggestedView();
    case "completed":
      return renderCompletedView();
    case "community":
      return renderCommunityView();
    default:
      return null;
  }
};

export default ExperimentCard;
