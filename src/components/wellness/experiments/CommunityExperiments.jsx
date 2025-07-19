// frontend/src/components/wellness/experiments/CommunityExperiments.jsx
import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import ExperimentCard from "./ExperimentCard";

const CommunityExperiments = ({ experiments, colors, onStart }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [experimentFilter, setExperimentFilter] = useState("all");

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.hypothesis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      experimentFilter === "all" || exp.category === experimentFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search community experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
            />
          </div>
          <select
            value={experimentFilter}
            onChange={(e) => setExperimentFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all">All Categories</option>
            <option value="sleep">Sleep</option>
            <option value="energy">Energy</option>
            <option value="stress">Stress</option>
            <option value="mood">Mood</option>
            <option value="exercise">Exercise</option>
            <option value="nutrition">Nutrition</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>
      </div>

      {/* Community Experiments List */}
      {filteredExperiments.map((experiment) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          colors={colors}
          view="community"
          onStart={onStart}
        />
      ))}

      {filteredExperiments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-purple-300">
            No experiments found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityExperiments;
