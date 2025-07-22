// src/components/reflectionarian/MoodTracker.jsx
import React, { useState } from "react";
import { X, Smile, Zap } from "lucide-react";

const MoodTracker = ({ onSubmit, onSkip }) => {
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({ mood_score: moodScore, energy_level: energyLevel });
    setIsSubmitting(false);
  };

  const getMoodEmoji = (score) => {
    if (score <= 2) return "😔";
    if (score <= 4) return "😐";
    if (score <= 6) return "🙂";
    if (score <= 8) return "😊";
    return "😄";
  };

  const getEnergyEmoji = (score) => {
    if (score <= 2) return "🔋";
    if (score <= 4) return "🔌";
    if (score <= 6) return "⚡";
    if (score <= 8) return "💪";
    return "🚀";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              How are you feeling today?
            </h2>
            <p className="text-white/70 text-sm">
              This helps me understand how to best support you
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mood Tracker */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Smile className="w-5 h-5 text-purple-300" />
            <label className="text-white font-medium">
              Mood
              <span className="ml-3 text-2xl">{getMoodEmoji(moodScore)}</span>
            </label>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                  (moodScore - 1) * 11.11
                }%, rgba(255,255,255,0.2) ${
                  (moodScore - 1) * 11.11
                }%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>Low</span>
              <span>Neutral</span>
              <span>High</span>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-lg font-medium text-white">
              {moodScore}/10
            </span>
          </div>
        </div>

        {/* Energy Level Tracker */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <label className="text-white font-medium">
              Energy Level
              <span className="ml-3 text-2xl">
                {getEnergyEmoji(energyLevel)}
              </span>
            </label>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FBBF24 0%, #FBBF24 ${
                  (energyLevel - 1) * 11.11
                }%, rgba(255,255,255,0.2) ${
                  (energyLevel - 1) * 11.11
                }%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>Exhausted</span>
              <span>Moderate</span>
              <span>Energized</span>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-lg font-medium text-white">
              {energyLevel}/10
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Start Session"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MoodTracker;
