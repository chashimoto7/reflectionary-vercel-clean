// frontend/src/components/wellness/tabs/WellnessExperimentsTab.jsx
import React, { useState, useEffect } from "react";
import { Beaker, Plus, Wand2 } from "lucide-react";
import { addDays } from "date-fns";

// Sub-components
import ActiveExperiments from "../experiments/ActiveExperiments";
import SuggestedExperiments from "../experiments/SuggestedExperiments";
import CompletedExperiments from "../experiments/CompletedExperiments";
import CommunityExperiments from "../experiments/CommunityExperiments";
import NewExperimentModal from "../experiments/NewExperimentModal";
import AIRequestModal from "../experiments/AIRequestModal";
import ExperimentDetailsModal from "../experiments/ExperimentDetailsModal";
import ExperimentChatInterface from "../wellness/ExperimentChatInterface";

// Hooks and utilities
import { useExperiments } from "../../hooks/useExperiments";

const WellnessExperimentsTab = ({ colors, user }) => {
  const [activeView, setActiveView] = useState("active");
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [chatExperiment, setChatExperiment] = useState(null);
  const [aiRequestModal, setAiRequestModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const {
    experiments,
    loading,
    aiExperimentsLimit,
    wellnessData,
    loadExperiments,
    startExperiment,
    completeExperiment,
    declineExperiment,
    requestAIExperiment,
    handleExperimentUpdate,
  } = useExperiments(user);

  useEffect(() => {
    loadExperiments();
  }, [user]);

  const openChatForExperiment = (experiment) => {
    setChatExperiment(experiment);
    setShowChatInterface(true);
  };

  const handleStartExperiment = async (experiment) => {
    await startExperiment(experiment);
    setShowNewExperiment(false);
  };

  const handleAIRequest = async (request) => {
    const success = await requestAIExperiment(request);
    if (success) {
      setAiRequestModal(false);
      setActiveView("suggested");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-300"></div>
      </div>
    );
  }

  const viewTabs = [
    { id: "active", label: "Active", count: experiments.active.length },
    {
      id: "suggested",
      label: "Suggested",
      count: experiments.suggested.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: experiments.completed.length,
    },
    {
      id: "community",
      label: "Community",
      count: experiments.community.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Beaker className="w-8 h-8 text-purple-400" />
              Wellness Experiments
            </h3>
            <p className="text-purple-200">
              Test, learn, and optimize your wellbeing
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAiRequestModal(true)}
              disabled={aiExperimentsLimit >= 2}
              className={`px-4 py-2 ${
                aiExperimentsLimit >= 2
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              } text-white rounded-lg font-medium flex items-center gap-2 transition-colors`}
              title={
                aiExperimentsLimit >= 2
                  ? "Maximum 2 active AI experiments"
                  : "Request a personalized AI experiment"
              }
            >
              <Wand2 className="w-4 h-4" />
              Request AI Experiment
            </button>
            <button
              onClick={() => setShowNewExperiment(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Experiment
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                activeView === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Views */}
      {activeView === "active" && (
        <ActiveExperiments
          experiments={experiments.active}
          colors={colors}
          onChatOpen={openChatForExperiment}
          onComplete={completeExperiment}
          onViewDetails={setSelectedExperiment}
          onSwitchToSuggested={() => setActiveView("suggested")}
        />
      )}

      {activeView === "suggested" && (
        <SuggestedExperiments
          experiments={experiments.suggested}
          colors={colors}
          wellnessData={wellnessData}
          onStart={startExperiment}
          onChatOpen={openChatForExperiment}
          onDecline={declineExperiment}
        />
      )}

      {activeView === "completed" && (
        <CompletedExperiments
          experiments={experiments.completed}
          colors={colors}
          onViewDetails={setSelectedExperiment}
          onRepeat={handleStartExperiment}
        />
      )}

      {activeView === "community" && (
        <CommunityExperiments
          experiments={experiments.community}
          colors={colors}
          onStart={handleStartExperiment}
        />
      )}

      {/* Modals */}
      {showNewExperiment && (
        <NewExperimentModal
          onClose={() => setShowNewExperiment(false)}
          onStart={handleStartExperiment}
        />
      )}

      {aiRequestModal && (
        <AIRequestModal
          onClose={() => setAiRequestModal(false)}
          onRequest={handleAIRequest}
        />
      )}

      {selectedExperiment && (
        <ExperimentDetailsModal
          experiment={selectedExperiment}
          colors={colors}
          onClose={() => setSelectedExperiment(null)}
        />
      )}

      {/* Chat Interface */}
      {showChatInterface && chatExperiment && (
        <ExperimentChatInterface
          experiment={chatExperiment}
          onClose={() => {
            setShowChatInterface(false);
            setChatExperiment(null);
          }}
          onExperimentUpdate={handleExperimentUpdate}
          userId={user.id}
          colors={colors}
        />
      )}
    </div>
  );
};

export default WellnessExperimentsTab;
