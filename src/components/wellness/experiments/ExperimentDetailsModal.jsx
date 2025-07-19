// frontend/src/components/wellness/experiments/ExperimentDetailsModal.jsx
import React from "react";
import { XCircle, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ExperimentDetailsModal = ({ experiment, colors, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{experiment.title}</h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Results Chart */}
        {experiment.results?.chartData &&
          experiment.results.chartData.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Progress Over Time
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={experiment.results.chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {experiment.metrics.map((metric, index) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={
                        Object.values(colors)[
                          index % Object.values(colors).length
                        ]
                      }
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={metric.replace("_", " ")}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Detailed Results */}
        {experiment.results && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Results Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(experiment.results.improvement || {}).map(
                ([metric, data]) => (
                  <div key={metric} className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium text-white capitalize mb-2">
                      {metric.replace("_", " ")}
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-purple-400">Baseline</div>
                        <div className="text-lg font-bold text-white">
                          {data.baseline.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-400">Final</div>
                        <div className="text-lg font-bold text-white">
                          {data.final.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-400">Change</div>
                        <div
                          className={`text-lg font-bold ${
                            data.change > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {data.change > 0 ? "+" : ""}
                          {data.change.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Insights */}
            {experiment.results.insights && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Insights
                </h4>
                <div className="space-y-2">
                  {experiment.results.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <p className="text-purple-200">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Protocol Details */}
        {!experiment.results && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Protocol</h4>
            <ol className="space-y-2">
              {experiment.protocol.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <span className="text-purple-400 font-bold">
                    {index + 1}.
                  </span>
                  <p className="text-purple-200">{step}</p>
                </li>
              ))}
            </ol>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">
                Success Criteria
              </h4>
              <p className="text-purple-200 p-3 bg-white/5 rounded-lg">
                {experiment.success_criteria || experiment.successCriteria}
              </p>
            </div>

            {experiment.tips && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Tips for Success
                </h4>
                <ul className="space-y-2">
                  {experiment.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-purple-200"
                    >
                      <span className="text-purple-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDetailsModal;
