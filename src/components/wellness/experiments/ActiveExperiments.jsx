// frontend/src/components/wellness/experiments/ActiveExperiments.jsx
import React from "react";
import { Beaker } from "lucide-react";
import ExperimentCard from "./ExperimentCard";

const ActiveExperiments = ({
  experiments,
  colors,
  onChatOpen,
  onComplete,
  onViewDetails,
  onSwitchToSuggested,
}) => {
  if (experiments.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <Beaker className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-white mb-2">
          No Active Experiments
        </h4>
        <p className="text-purple-200 mb-4">
          Ready to start optimizing your wellness? Choose from suggested
          experiments or create your own!
        </p>
        <button
          onClick={onSwitchToSuggested}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          View Suggestions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experiments.map((experiment) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          colors={colors}
          view="active"
          onChatOpen={onChatOpen}
          onComplete={onComplete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default ActiveExperiments;
