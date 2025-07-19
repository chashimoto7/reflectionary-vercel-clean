// frontend/src/hooks/useExperiments.js
import { useState } from "react";
import { addDays, differenceInDays } from "date-fns";
import {
  processExperiments,
  calculateDetailedResults,
  getDefaultSuggestions,
  loadCommunityExperiments,
} from "../utils/experimentHelpers";

export const useExperiments = (user) => {
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState({
    active: [],
    suggested: [],
    completed: [],
    community: [],
  });
  const [wellnessData, setWellnessData] = useState([]);
  const [aiExperimentsLimit, setAiExperimentsLimit] = useState(0);
  const [requestingAI, setRequestingAI] = useState(false);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  const loadExperiments = async () => {
    try {
      setLoading(true);

      // Load user's experiments
      const experimentsResponse = await fetch(
        `${backendUrl}/api/wellness/experiments?user_id=${user.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (experimentsResponse.ok) {
        const experimentsData = await experimentsResponse.json();
        const processed = processExperiments(experimentsData.experiments || []);

        // Count active AI experiments
        const activeAICount = processed.active.filter(
          (exp) => exp.experiment_type === "ai_generated"
        ).length;
        setAiExperimentsLimit(activeAICount);

        setExperiments((prevState) => ({
          ...prevState,
          active: processed.active,
          completed: processed.completed,
          suggested: processed.suggested,
        }));
      }

      // Load wellness data
      const thirtyDaysAgo = addDays(new Date(), -30)
        .toISOString()
        .split("T")[0];
      const wellnessResponse = await fetch(
        `${backendUrl}/api/wellness?user_id=${user.id}&date_from=${thirtyDaysAgo}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (wellnessResponse.ok) {
        const wellnessData = await wellnessResponse.json();
        if (wellnessData.entries && wellnessData.entries.length > 0) {
          const transformedData = wellnessData.entries.map((entry) => ({
            id: entry.id,
            date: entry.date,
            mood: entry.data.mood?.overall || 0,
            energy: entry.data.mood?.energy || 0,
            stress: entry.data.mood?.stress || 0,
            sleep_hours: entry.data.sleep?.duration || 0,
            sleep_quality: entry.data.sleep?.quality || 0,
            exercise_minutes: entry.data.exercise?.duration || 0,
            water_glasses: entry.data.nutrition?.water || 0,
          }));
          setWellnessData(transformedData);
        } else {
          setExperiments((prevState) => ({
            ...prevState,
            suggested: getDefaultSuggestions(),
          }));
        }
      }

      // Load community experiments
      const community = loadCommunityExperiments();
      setExperiments((prevState) => ({
        ...prevState,
        community: community,
      }));
    } catch (error) {
      console.error("Error loading experiments:", error);
      setExperiments({
        active: [],
        suggested: getDefaultSuggestions(),
        completed: [],
        community: loadCommunityExperiments(),
      });
    } finally {
      setLoading(false);
    }
  };

  const startExperiment = async (experiment) => {
    try {
      const experimentData = {
        user_id: user.id,
        title: experiment.title,
        hypothesis: experiment.hypothesis,
        category: experiment.category,
        duration: experiment.duration,
        metrics: experiment.metrics,
        protocol: experiment.protocol,
        baseline: experiment.baseline || {},
        success_criteria:
          experiment.successCriteria || experiment.success_criteria,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        is_public: experiment.isPublic || false,
        experiment_type: experiment.experiment_type || "manual",
        parent_experiment_id: experiment.isFromCommunity ? experiment.id : null,
        ai_metadata: experiment.ai_metadata || null,
      };

      if (experiment.id && experiment.experiment_type === "ai_generated") {
        const response = await fetch(
          `${backendUrl}/api/wellness/experiments/${experiment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              status: "active",
              start_date: new Date().toISOString().split("T")[0],
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to activate experiment");
      } else {
        const response = await fetch(`${backendUrl}/api/wellness/experiments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(experimentData),
        });
        if (!response.ok) throw new Error("Failed to start experiment");
      }

      await loadExperiments();
      return true;
    } catch (error) {
      console.error("Error starting experiment:", error);
      return false;
    }
  };

  const completeExperiment = async (experiment) => {
    try {
      const results = await calculateDetailedResults(
        experiment,
        user.id,
        backendUrl
      );

      const response = await fetch(
        `${backendUrl}/api/wellness/experiments/${experiment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            status: "completed",
            results: results,
            completed_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete experiment");
      await loadExperiments();
    } catch (error) {
      console.error("Error completing experiment:", error);
    }
  };

  const declineExperiment = async (experiment, reason) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/wellness/experiments/${experiment.id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            reason: reason,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to decline experiment");
      await loadExperiments();
    } catch (error) {
      console.error("Error declining experiment:", error);
    }
  };

  const requestAIExperiment = async (request) => {
    if (!request.trim()) return false;

    try {
      setRequestingAI(true);
      const response = await fetch(
        `${backendUrl}/api/wellness/experiments/generate-on-demand`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            request: request,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate AI experiment");

      await loadExperiments();
      return true;
    } catch (error) {
      console.error("Error requesting AI experiment:", error);
      return false;
    } finally {
      setRequestingAI(false);
    }
  };

  const handleExperimentUpdate = async (updatedExperiment) => {
    await loadExperiments();
  };

  return {
    experiments,
    loading,
    aiExperimentsLimit,
    wellnessData,
    requestingAI,
    loadExperiments,
    startExperiment,
    completeExperiment,
    declineExperiment,
    requestAIExperiment,
    handleExperimentUpdate,
  };
};
