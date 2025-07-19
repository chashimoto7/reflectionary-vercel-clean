// frontend/src/components/wellness/experiments/CompletedExperiments.jsx
import React from "react";
import { Award } from "lucide-react";
import ExperimentCard from "./ExperimentCard";

const CompletedExperiments = ({
  experiments,
  colors,
  onViewDetails,
  onRepeat,
}) => {
  if (experiments.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-white mb-2">
          No Completed Experiments Yet
        </h4>
        <p className="text-purple-200">
          Your completed experiments and their results will appear here
        </p>
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
          view="completed"
          onViewDetails={onViewDetails}
          onRepeat={(exp) => {
            const newExp = { ...exp };
            delete newExp.id;
            delete newExp.results;
            delete newExp.completed_at;
            onRepeat(newExp);
          }}
        />
      ))}
    </div>
  );
};

export default CompletedExperiments;
