// frontend/src/components/womenshealth/experiments/WomensHealthExperimentDetailsModal.jsx
import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Target,
  Activity,
  Brain,
  Heart,
  AlertCircle,
  CheckCircle,
  Star,
  Beaker,
  TrendingUp,
  BookOpen,
  Shield,
  Sparkles,
  ChevronRight,
  Copy,
  Share2,
  Download,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Info,
} from "lucide-react";
import { format } from "date-fns";

const WomensHealthExperimentDetailsModal = ({
  experiment,
  colors,
  onClose,
  lifeStage,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Get experiment icon
  const getExperimentIcon = () => {
    const iconMap = {
      nutrition: Heart,
      movement: Activity,
      stress: Brain,
      sleep: Clock,
      supplements: Beaker,
      mindfulness: Brain,
    };
    return iconMap[experiment.category] || Beaker;
  };

  const Icon = getExperimentIcon();

  // Get status color
  const getStatusColor = () => {
    const statusColors = {
      draft: "text-gray-400",
      active: "text-blue-400",
      completed: "text-green-400",
      paused: "text-yellow-400",
      declined: "text-red-400",
    };
    return statusColors[experiment.status] || "text-gray-400";
  };

  // Get difficulty badge
  const getDifficultyBadge = () => {
    const difficultyColors = {
      easy: "bg-green-500/20 text-green-300",
      moderate: "bg-yellow-500/20 text-yellow-300",
      challenging: "bg-red-500/20 text-red-300",
    };
    return (
      difficultyColors[experiment.difficulty_level] || difficultyColors.moderate
    );
  };

  // Copy experiment details
  const copyToClipboard = () => {
    const experimentText = `
${experiment.title}

Description: ${experiment.description}

Hypothesis: ${experiment.hypothesis}

Duration: ${experiment.duration_days} days
Frequency: ${experiment.frequency}
Timing: ${experiment.timing}

Materials Needed:
${experiment.materials_needed?.map((item) => `- ${item}`).join("\n") || "None"}

Expected Outcomes:
${
  experiment.expected_outcomes?.map((outcome) => `- ${outcome}`).join("\n") ||
  "None specified"
}

Metrics to Track:
${
  experiment.metrics_to_track?.map((metric) => `- ${metric}`).join("\n") ||
  "None specified"
}
    `;

    navigator.clipboard.writeText(experimentText);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  // Render tabs
  const renderTabs = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: Info },
      { id: "details", label: "Details", icon: Beaker },
      { id: "science", label: "Science", icon: BookOpen },
      { id: "results", label: "Results", icon: BarChart3 },
    ];

    return (
      <div className="flex gap-1 p-1 bg-white/10 rounded-lg mb-6">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  };

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Hypothesis */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Hypothesis
        </h4>
        <p className="text-white">{experiment.hypothesis}</p>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Duration</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {experiment.duration_days} days
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Frequency</span>
          </div>
          <p className="text-lg font-semibold text-white capitalize">
            {experiment.frequency}
          </p>
        </div>
      </div>

      {/* Target Symptoms */}
      {experiment.symptom_targets && experiment.symptom_targets.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Target Symptoms
          </h4>
          <div className="flex flex-wrap gap-2">
            {experiment.symptom_targets.map((symptom, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                {symptom.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expected Outcomes */}
      {experiment.expected_outcomes &&
        experiment.expected_outcomes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Expected Outcomes
            </h4>
            <ul className="space-y-2">
              {experiment.expected_outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Life Stage Specific Badge */}
      {experiment.life_stage_specific && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-white">
              Optimized for {lifeStage}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Render details tab
  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Materials Needed */}
      {experiment.materials_needed &&
        experiment.materials_needed.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Materials Needed
            </h4>
            <ul className="space-y-2">
              {experiment.materials_needed.map((material, index) => (
                <li key={index} className="flex items-center gap-2 text-white">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{material}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Timing & Schedule */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timing & Schedule
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-200">Best Time</span>
            <span className="text-white font-medium capitalize">
              {experiment.timing || "Anytime"}
            </span>
          </div>
          {experiment.phase_timing && experiment.phase_timing !== "any" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-200">Cycle Phase</span>
              <span className="text-white font-medium capitalize">
                {experiment.phase_timing}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics to Track */}
      {experiment.metrics_to_track &&
        experiment.metrics_to_track.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Metrics to Track
            </h4>
            <div className="space-y-2">
              {experiment.metrics_to_track.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white p-2 bg-white/5 rounded-lg"
                >
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Precautions */}
      {experiment.precautions && experiment.precautions.length > 0 && (
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
          <h4 className="text-sm font-medium text-red-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Precautions
          </h4>
          <ul className="space-y-2">
            {experiment.precautions.map((precaution, index) => (
              <li key={index} className="flex items-start gap-2 text-white">
                <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{precaution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modifications */}
      {experiment.modifications_allowed && (
        <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white">
              This experiment can be modified to suit your needs and preferences
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Render science tab
  const renderScienceTab = () => (
    <div className="space-y-6">
      {/* Scientific Backing */}
      {experiment.scientific_backing && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Scientific Backing
          </h4>
          <p className="text-white text-sm leading-relaxed">
            {experiment.scientific_backing}
          </p>
        </div>
      )}

      {/* AI Rationale */}
      {experiment.ai_rationale && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Why This Experiment?
          </h4>
          <p className="text-white text-sm leading-relaxed">
            {experiment.ai_rationale}
          </p>
        </div>
      )}

      {/* Personalization Factors */}
      {experiment.personalization_factors &&
        experiment.personalization_factors.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Personalized For You
            </h4>
            <div className="space-y-2">
              {experiment.personalization_factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );

  // Render results tab
  const renderResultsTab = () => {
    if (experiment.status !== "completed" || !experiment.results) {
      return (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-purple-200">
            Complete this experiment to see your results
          </p>
        </div>
      );
    }

    const results = experiment.results;

    return (
      <div className="space-y-6">
        {/* Effectiveness Score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-sm font-medium text-purple-300 mb-4 text-center">
            Effectiveness Score
          </h4>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {results.effectiveness}/10
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(10)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < results.effectiveness
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Symptom Improvements */}
        {results.symptom_improvements && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Symptom Improvements
            </h4>
            <div className="space-y-3">
              {Object.entries(results.symptom_improvements).map(
                ([symptom, improvement]) => (
                  <div key={symptom}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white capitalize">
                        {symptom.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-green-400">
                        {improvement > 0 ? "+" : ""}
                        {improvement}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${Math.abs(improvement)}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* User Notes */}
        {results.notes && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Your Notes
            </h4>
            <p className="text-white text-sm">{results.notes}</p>
          </div>
        )}

        {/* Side Effects */}
        {results.side_effects && results.side_effects.length > 0 && (
          <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <h4 className="text-sm font-medium text-yellow-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Side Effects Noted
            </h4>
            <ul className="space-y-1">
              {results.side_effects.map((effect, index) => (
                <li key={index} className="text-sm text-white">
                  • {effect}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {experiment.title}
                </h3>
                <p className="text-purple-200 text-sm">
                  {experiment.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-purple-200" />
            </button>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBadge()}`}
            >
              {experiment.difficulty_level}
            </span>
            <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-medium">
              {experiment.category}
            </span>
            <span
              className={`px-3 py-1 bg-white/10 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor()}`}
            >
              <Circle className="w-3 h-3 fill-current" />
              {experiment.status}
            </span>
            {experiment.experiment_source === "ai_generated" && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-300 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabs()}

          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "details" && renderDetailsTab()}
          {activeTab === "science" && renderScienceTab()}
          {activeTab === "results" && renderResultsTab()}
        </div>

        {/* Footer Actions */}
        <div className="bg-black/20 backdrop-blur-sm p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                title="Copy experiment details"
              >
                {copiedToClipboard ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                title="Share experiment"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
                title="Download as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for status icon
const Circle = ({ className }) => (
  <svg className={className} viewBox="0 0 12 12">
    <circle cx="6" cy="6" r="6" />
  </svg>
);

export default WomensHealthExperimentDetailsModal;
