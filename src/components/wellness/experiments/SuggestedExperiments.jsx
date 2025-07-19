// frontend/src/components/wellness/experiments/SuggestedExperiments.jsx
import React from "react";
import { Sparkles } from "lucide-react";
import ExperimentCard from "./ExperimentCard";

const SuggestedExperiments = ({
  experiments,
  colors,
  wellnessData,
  onStart,
  onChatOpen,
  onDecline,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
        <p className="text-purple-200 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          {experiments.some((exp) => exp.experiment_type === "ai_generated")
            ? "AI experiments are personalized based on your wellness patterns and goals"
            : wellnessData.length > 0
            ? "These experiments are personalized based on your wellness patterns and areas for improvement"
            : "Start with these beginner-friendly experiments to establish your wellness baseline"}
        </p>
      </div>

      {experiments.map((experiment) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          colors={colors}
          view="suggested"
          onStart={onStart}
          onChatOpen={onChatOpen}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
};

export default SuggestedExperiments;
