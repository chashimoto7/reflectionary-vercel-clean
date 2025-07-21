// frontend/src/components/womenshealth/tabs/WomensHealthExperimentsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Beaker,
  Plus,
  Bot,
  Calendar,
  Heart,
  Activity,
  Brain,
  Thermometer,
  Moon,
  Sun,
  Flower2,
  Droplets,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Shield,
  Info,
  Filter,
  Search,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useWomensHealthExperiments } from "../../../hooks/useWomensHealthExperiments";
import WomensHealthExperimentCard from "../experiments/WomensHealthExperimentCard";
import WomensHealthAIRequestModal from "../experiments/WomensHealthAIRequestModal";
import WomensHealthExperimentDetailsModal from "../experiments/WomensHealthExperimentDetailsModal";
import WomensHealthExperimentChatInterface from "../experiments/WomensHealthExperimentChatInterface";
import CycleAwareExperimentModal from "../experiments/CycleAwareExperimentModal";
import { WOMENS_HEALTH_EXPERIMENT_ICONS } from "../../../utils/womensHealthConstants";

const WomensHealthExperimentsTab = ({
  colors,
  user,
  lifeStage,
  analytics,
  cycleInfo,
}) => {
  const {
    experiments,
    loading,
    aiExperimentsLimit,
    requestingAI,
    loadExperiments,
    startExperiment,
    completeExperiment,
    declineExperiment,
    requestAIExperiment,
    updateExperiment,
  } = useWomensHealthExperiments(user, lifeStage);

  const [activeView, setActiveView] = useState("active");
  const [showAIRequest, setShowAIRequest] = useState(false);
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filterSymptom, setFilterSymptom] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadExperiments();
  }, [user?.id, lifeStage]);

  // Get phase-specific recommendations
  const getPhaseRecommendations = () => {
    if (lifeStage !== "menstrual" || !cycleInfo?.phase) return null;

    const recommendations = {
      menstrual: {
        icon: Droplets,
        color: "text-red-400",
        message: "Gentle experiments recommended during menstruation",
        focus: "Rest, recovery, and symptom management",
      },
      follicular: {
        icon: Flower2,
        color: "text-pink-400",
        message: "Rising energy - great time for new challenges",
        focus: "Building habits and trying new protocols",
      },
      ovulation: {
        icon: Sun,
        color: "text-yellow-400",
        message: "Peak energy phase - maximize your experiments",
        focus: "High-intensity protocols and social activities",
      },
      luteal: {
        icon: Moon,
        color: "text-purple-400",
        message: "Prepare for PMS - focus on consistency",
        focus: "Stress management and symptom prevention",
      },
    };

    return recommendations[cycleInfo.phase] || recommendations.follicular;
  };

  // Filter experiments based on search and symptom
  const filterExperiments = (experimentsList) => {
    return experimentsList.filter((exp) => {
      const matchesSearch =
        searchQuery === "" ||
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.hypothesis.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSymptom =
        filterSymptom === "all" || exp.symptom_targets?.includes(filterSymptom);

      return matchesSearch && matchesSymptom;
    });
  };

  // Get unique symptoms from all experiments
  const getAllSymptoms = () => {
    const symptoms = new Set();
    [
      ...experiments.active,
      ...experiments.suggested,
      ...experiments.completed,
    ].forEach((exp) => {
      exp.symptom_targets?.forEach((symptom) => symptoms.add(symptom));
    });
    return Array.from(symptoms).sort();
  };

  const phaseRec = getPhaseRecommendations();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading your health experiments...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Phase Awareness */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Beaker className="w-7 h-7 text-purple-400" />
              Health Experiments
            </h2>
            <p className="text-purple-200">
              Personalized experiments designed for your {lifeStage} journey
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewExperiment(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/20"
            >
              <Plus className="w-4 h-4" />
              Create Manual
            </button>
            <button
              onClick={() => setShowAIRequest(true)}
              disabled={aiExperimentsLimit >= 3}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              AI Generate
            </button>
          </div>
        </div>

        {/* Phase Recommendation */}
        {phaseRec && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-center gap-3">
            <phaseRec.icon className={`w-5 h-5 ${phaseRec.color}`} />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                {phaseRec.message}
              </p>
              <p className="text-purple-200 text-xs">{phaseRec.focus}</p>
            </div>
          </div>
        )}

        {/* AI Limit Warning */}
        {aiExperimentsLimit >= 3 && (
          <div className="mt-3 p-3 bg-amber-600/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <p className="text-amber-100 text-sm">
              You have 3 active AI experiments. Complete one to generate more.
            </p>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterSymptom}
          onChange={(e) => setFilterSymptom(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Symptoms</option>
          {getAllSymptoms().map((symptom) => (
            <option key={symptom} value={symptom}>
              {symptom.replace(/_/g, " ").charAt(0).toUpperCase() +
                symptom.slice(1).replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* View Tabs */}
      <div className="flex bg-white/10 rounded-lg p-1">
        {[
          { id: "active", label: "Active", count: experiments.active.length },
          {
            id: "suggested",
            label: "AI Suggested",
            count: experiments.suggested.length,
          },
          {
            id: "completed",
            label: "Completed",
            count: experiments.completed.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === tab.id
                ? "bg-purple-600 text-white"
                : "text-purple-200 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeView === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-purple-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Experiments Content */}
      <div className="space-y-4">
        {activeView === "active" && (
          <>
            {filterExperiments(experiments.active).length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No Active Experiments
                </h4>
                <p className="text-purple-200 mb-4">
                  Start your wellness journey with an AI-powered experiment
                  tailored to your needs
                </p>
                <button
                  onClick={() => setActiveView("suggested")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View Suggestions
                </button>
              </div>
            ) : (
              filterExperiments(experiments.active).map((experiment) => (
                <WomensHealthExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  colors={colors}
                  view="active"
                  cycleInfo={cycleInfo}
                  onChatOpen={() => {
                    setSelectedExperiment(experiment);
                    setShowChat(true);
                  }}
                  onComplete={() => completeExperiment(experiment)}
                  onViewDetails={() => {
                    setSelectedExperiment(experiment);
                    setShowDetails(true);
                  }}
                />
              ))
            )}
          </>
        )}

        {activeView === "suggested" && (
          <>
            {filterExperiments(experiments.suggested).length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No Suggestions Yet
                </h4>
                <p className="text-purple-200 mb-4">
                  Track your symptoms for a week to receive personalized AI
                  suggestions
                </p>
                <button
                  onClick={() => setShowAIRequest(true)}
                  disabled={aiExperimentsLimit >= 3}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Request AI Experiment
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
                  <p className="text-purple-200 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    AI experiments are personalized based on your {
                      lifeStage
                    }{" "}
                    patterns and symptoms
                  </p>
                </div>
                {filterExperiments(experiments.suggested).map((experiment) => (
                  <WomensHealthExperimentCard
                    key={experiment.id}
                    experiment={experiment}
                    colors={colors}
                    view="suggested"
                    cycleInfo={cycleInfo}
                    onStart={() => startExperiment(experiment)}
                    onChatOpen={() => {
                      setSelectedExperiment(experiment);
                      setShowChat(true);
                    }}
                    onDecline={(reason) =>
                      declineExperiment(experiment, reason)
                    }
                  />
                ))}
              </>
            )}
          </>
        )}

        {activeView === "completed" && (
          <>
            {filterExperiments(experiments.completed).length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No Completed Experiments Yet
                </h4>
                <p className="text-purple-200">
                  Your completed experiments and results will appear here
                </p>
              </div>
            ) : (
              filterExperiments(experiments.completed).map((experiment) => (
                <WomensHealthExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  colors={colors}
                  view="completed"
                  onViewDetails={() => {
                    setSelectedExperiment(experiment);
                    setShowDetails(true);
                  }}
                  onRepeat={(exp) => {
                    const newExp = { ...exp };
                    delete newExp.id;
                    delete newExp.results;
                    delete newExp.completed_at;
                    startExperiment(newExp);
                  }}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          Tips for Success
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">
                Track Consistently
              </p>
              <p className="text-purple-200 text-xs">
                Daily tracking helps AI learn your patterns
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Use AI Chat</p>
              <p className="text-purple-200 text-xs">
                Modify experiments as you learn what works
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">
                Listen to Your Body
              </p>
              <p className="text-purple-200 text-xs">
                Adjust intensity based on how you feel
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Be Patient</p>
              <p className="text-purple-200 text-xs">
                Hormonal changes take time to balance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAIRequest && (
        <WomensHealthAIRequestModal
          onClose={() => setShowAIRequest(false)}
          onRequest={requestAIExperiment}
          requesting={requestingAI}
          lifeStage={lifeStage}
          currentSymptoms={analytics?.symptom_summary?.most_common || []}
        />
      )}

      {showNewExperiment && (
        <CycleAwareExperimentModal
          onClose={() => setShowNewExperiment(false)}
          onStart={startExperiment}
          lifeStage={lifeStage}
          cycleInfo={cycleInfo}
          colors={colors}
        />
      )}

      {showChat && selectedExperiment && (
        <WomensHealthExperimentChatInterface
          experiment={selectedExperiment}
          onClose={() => {
            setShowChat(false);
            setSelectedExperiment(null);
          }}
          onExperimentUpdate={(updated) => {
            updateExperiment(updated);
            setSelectedExperiment(updated);
          }}
          userId={user.id}
          colors={colors}
          lifeStage={lifeStage}
          cycleInfo={cycleInfo}
        />
      )}

      {showDetails && selectedExperiment && (
        <WomensHealthExperimentDetailsModal
          experiment={selectedExperiment}
          colors={colors}
          onClose={() => {
            setShowDetails(false);
            setSelectedExperiment(null);
          }}
          lifeStage={lifeStage}
        />
      )}
    </div>
  );
};

export default WomensHealthExperimentsTab;
