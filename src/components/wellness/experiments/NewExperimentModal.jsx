// frontend/src/components/wellness/experiments/NewExperimentModal.jsx
import React, { useState } from "react";
import { XCircle, Plus, Trash2 } from "lucide-react";

const NewExperimentModal = ({ onClose, onStart }) => {
  const [newExperiment, setNewExperiment] = useState({
    title: "",
    hypothesis: "",
    category: "custom",
    duration: 7,
    metrics: [],
    protocol: [""],
    successCriteria: "",
    isPublic: false,
  });

  const handleStart = () => {
    onStart({
      ...newExperiment,
      experiment_type: "manual",
    });
  };

  const isValid =
    newExperiment.title &&
    newExperiment.hypothesis &&
    newExperiment.metrics.length > 0 &&
    newExperiment.protocol.some((p) => p.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            Create New Experiment
          </h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Experiment Title
            </label>
            <input
              type="text"
              value={newExperiment.title}
              onChange={(e) =>
                setNewExperiment({
                  ...newExperiment,
                  title: e.target.value,
                })
              }
              placeholder="e.g., Morning Meditation Impact"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
            />
          </div>

          {/* Hypothesis */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Hypothesis
            </label>
            <textarea
              value={newExperiment.hypothesis}
              onChange={(e) =>
                setNewExperiment({
                  ...newExperiment,
                  hypothesis: e.target.value,
                })
              }
              placeholder="What do you expect to happen?"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 h-20 resize-none"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={newExperiment.category}
                onChange={(e) =>
                  setNewExperiment({
                    ...newExperiment,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="custom">Custom</option>
                <option value="sleep">Sleep</option>
                <option value="energy">Energy</option>
                <option value="stress">Stress</option>
                <option value="exercise">Exercise</option>
                <option value="nutrition">Nutrition</option>
                <option value="mood">Mood</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                min="3"
                max="90"
                value={newExperiment.duration}
                onChange={(e) =>
                  setNewExperiment({
                    ...newExperiment,
                    duration: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Metrics */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Metrics to Track
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                "mood",
                "energy",
                "stress",
                "sleep_hours",
                "exercise_minutes",
                "water_glasses",
              ].map((metric) => (
                <label key={metric} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newExperiment.metrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewExperiment({
                          ...newExperiment,
                          metrics: [...newExperiment.metrics, metric],
                        });
                      } else {
                        setNewExperiment({
                          ...newExperiment,
                          metrics: newExperiment.metrics.filter(
                            (m) => m !== metric
                          ),
                        });
                      }
                    }}
                    className="rounded border-white/20 bg-white/10 text-purple-600"
                  />
                  <span className="text-sm text-purple-200 capitalize">
                    {metric.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Protocol */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Protocol Steps
            </label>
            <div className="space-y-2">
              {newExperiment.protocol.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const updated = [...newExperiment.protocol];
                      updated[index] = e.target.value;
                      setNewExperiment({
                        ...newExperiment,
                        protocol: updated,
                      });
                    }}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                  />
                  {newExperiment.protocol.length > 1 && (
                    <button
                      onClick={() => {
                        setNewExperiment({
                          ...newExperiment,
                          protocol: newExperiment.protocol.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setNewExperiment({
                    ...newExperiment,
                    protocol: [...newExperiment.protocol, ""],
                  })
                }
                className="text-purple-300 hover:text-white text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Success Criteria
            </label>
            <input
              type="text"
              value={newExperiment.successCriteria}
              onChange={(e) =>
                setNewExperiment({
                  ...newExperiment,
                  successCriteria: e.target.value,
                })
              }
              placeholder="How will you measure success?"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
            />
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="public"
              checked={newExperiment.isPublic}
              onChange={(e) =>
                setNewExperiment({
                  ...newExperiment,
                  isPublic: e.target.checked,
                })
              }
              className="rounded border-white/20 bg-white/10 text-purple-600"
            />
            <label htmlFor="public" className="text-purple-200 text-sm">
              Share results with the community (anonymously)
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Start Experiment
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
  );
};

export default NewExperimentModal;
