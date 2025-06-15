// src/components/goals/tabs/DataExportTab.jsx
import React from "react";
import { Download } from "lucide-react";

const DataExportTab = ({ goals, analyticsData, colors }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Export & Reports
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Export Options */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Export Options</h4>
        <div className="space-y-3">
          {[
            {
              title: "Goal Progress Report",
              description: "Comprehensive progress analysis with charts",
            },
            {
              title: "Mood Correlation Data",
              description: "CSV export of mood-goal correlations",
            },
            {
              title: "Achievement Timeline",
              description: "PDF timeline of all achievements",
            },
            {
              title: "Custom Analytics Report",
              description: "Customizable data export",
            },
          ].map((option, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900">{option.title}</h5>
              <p className="text-sm text-gray-600 mt-1 mb-3">
                {option.description}
              </p>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Report Preview</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h5 className="font-medium text-gray-900 mb-3">
            Monthly Goal Intelligence Report
          </h5>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Total Goals: {goals.length}</p>
            <p>
              • Average Progress:{" "}
              {analyticsData?.overview?.averageProgress || 0}%
            </p>
            <p>• Top Performing Goal: Exercise</p>
            <p>• Mood Correlation: +0.73</p>
            <p>• Growth Indicators: 5 detected</p>
            <p>• Recommendations: 3 actionable insights</p>
          </div>
          <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DataExportTab;
