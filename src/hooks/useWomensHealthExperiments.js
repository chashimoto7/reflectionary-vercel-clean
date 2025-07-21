// frontend/src/hooks/useWomensHealthExperiments.js
import { useState, useCallback } from "react";
import { addDays } from "date-fns";

export const useWomensHealthExperiments = (user, lifeStage) => {
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState({
    active: [],
    suggested: [],
    completed: [],
  });
  const [aiExperimentsLimit, setAiExperimentsLimit] = useState(0);
  const [requestingAI, setRequestingAI] = useState(false);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "https://backend.reflectionary.ca";

  // Load all experiments
  const loadExperiments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${backendUrl}/api/womens-health/experiments?user_id=${user.id}&life_stage=${lifeStage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Process experiments into categories
        const active = [];
        const suggested = [];
        const completed = [];

        data.experiments.forEach((exp) => {
          if (exp.status === "completed") {
            completed.push(exp);
          } else if (
            exp.status === "draft" &&
            exp.experiment_type === "ai_generated"
          ) {
            suggested.push(exp);
          } else if (exp.status === "active") {
            active.push(exp);
          }
        });

        // Add any additional suggested experiments from the API
        if (data.suggested) {
          suggested.push(...data.suggested);
        }

        // Count active AI experiments for limit checking
        const activeAICount = active.filter(
          (exp) => exp.experiment_type === "ai_generated"
        ).length;
        setAiExperimentsLimit(activeAICount);

        setExperiments({ active, suggested, completed });
      }
    } catch (error) {
      console.error("Error loading women's health experiments:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, lifeStage, backendUrl]);

  // Start an experiment
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
        symptom_targets: experiment.symptom_targets || [],
        life_stage: lifeStage,
        cycle_aware: experiment.cycle_aware || lifeStage === "menstrual",
        min_cycles: experiment.min_cycles || 1,
        success_criteria: experiment.success_criteria,
        expected_improvement: experiment.expected_improvement,
        difficulty: experiment.difficulty,
        tips: experiment.tips || [],
        safety_notes: experiment.safety_notes || [],
        phase_modifications: experiment.phase_modifications || {},
        start_date: new Date().toISOString().split("T")[0],
        experiment_type: experiment.experiment_type || "manual",
        ai_metadata: experiment.ai_metadata || null,
      };

      // If it's an existing AI experiment being activated
      if (experiment.id && experiment.experiment_type === "ai_generated") {
        const response = await fetch(
          `${backendUrl}/api/womens-health/experiments/${experiment.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              user_id: user.id,
              status: "active",
              start_date: new Date().toISOString().split("T")[0],
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to activate experiment");
      } else {
        // Create new experiment
        const response = await fetch(
          `${backendUrl}/api/womens-health/experiments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(experimentData),
          }
        );

        if (!response.ok) throw new Error("Failed to start experiment");
      }

      await loadExperiments();
      return true;
    } catch (error) {
      console.error("Error starting experiment:", error);
      return false;
    }
  };

  // Complete an experiment
  const completeExperiment = async (experiment) => {
    try {
      // Calculate results based on tracked data
      const results = await calculateExperimentResults(experiment);

      const response = await fetch(
        `${backendUrl}/api/womens-health/experiments/${experiment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            status: "completed",
            results: results.overall,
            phase_results: results.byPhase,
            symptom_improvements: results.symptomImprovements,
            completed_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete experiment");

      await loadExperiments();
      return true;
    } catch (error) {
      console.error("Error completing experiment:", error);
      return false;
    }
  };

  // Decline an AI experiment
  const declineExperiment = async (experiment, reason) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/womens-health/experiments/${experiment.id}/decline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            reason: reason,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to decline experiment");

      const data = await response.json();

      // Show alternatives if provided
      if (data.alternatives) {
        // You could show these in a modal or notification
        console.log("Alternative suggestions:", data.alternatives);
      }

      await loadExperiments();
      return true;
    } catch (error) {
      console.error("Error declining experiment:", error);
      return false;
    }
  };

  // Request a new AI experiment
  const requestAIExperiment = async (request) => {
    if (!request.trim()) return false;

    try {
      setRequestingAI(true);

      const response = await fetch(
        `${backendUrl}/api/womens-health/experiments/generate-on-demand`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            request: request,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.urgent) {
          // Show urgent care message
          alert(data.message + "\n\nResources:\n" + data.resources.join("\n"));
          return false;
        }
        throw new Error(data.error || "Failed to generate experiment");
      }

      if (data.success) {
        await loadExperiments();
        return true;
      } else {
        // Show message about needing more data
        alert(data.message);
        return false;
      }
    } catch (error) {
      console.error("Error requesting AI experiment:", error);
      alert("Failed to generate experiment. Please try again.");
      return false;
    } finally {
      setRequestingAI(false);
    }
  };

  // Update an experiment (from chat modifications)
  const updateExperiment = async (updatedExperiment) => {
    try {
      // Update local state immediately for better UX
      setExperiments((prev) => ({
        ...prev,
        active: prev.active.map((exp) =>
          exp.id === updatedExperiment.id ? updatedExperiment : exp
        ),
        suggested: prev.suggested.map((exp) =>
          exp.id === updatedExperiment.id ? updatedExperiment : exp
        ),
      }));

      // Reload to ensure consistency
      await loadExperiments();
    } catch (error) {
      console.error("Error updating experiment:", error);
    }
  };

  // Calculate experiment results
  const calculateExperimentResults = async (experiment) => {
    try {
      // Fetch health data for the experiment period
      const endDate = format(
        addDays(new Date(experiment.start_date), experiment.duration),
        "yyyy-MM-dd"
      );

      const response = await fetch(
        `${backendUrl}/api/womens-health/entries?user_id=${user.id}&start_date=${experiment.start_date}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        return {
          overall: { success: false, message: "Unable to calculate results" },
          byPhase: {},
          symptomImprovements: {},
        };
      }

      const healthData = await response.json();

      // Calculate overall results
      const overall = calculateOverallResults(experiment, healthData.entries);

      // Calculate phase-specific results if applicable
      const byPhase =
        lifeStage === "menstrual"
          ? calculatePhaseResults(experiment, healthData.entries)
          : {};

      // Calculate symptom improvements
      const symptomImprovements = calculateSymptomImprovements(
        experiment.symptom_targets,
        healthData.entries
      );

      return { overall, byPhase, symptomImprovements };
    } catch (error) {
      console.error("Error calculating results:", error);
      return {
        overall: { success: false, message: "Error calculating results" },
        byPhase: {},
        symptomImprovements: {},
      };
    }
  };

  // Helper functions for result calculations
  const calculateOverallResults = (experiment, entries) => {
    if (!entries || entries.length === 0) {
      return { success: false, improvement: 0, insights: [] };
    }

    // Group entries by before/after midpoint
    const midpoint = Math.floor(experiment.duration / 2);
    const midDate = addDays(new Date(experiment.start_date), midpoint);

    const beforeEntries = entries.filter(
      (e) => new Date(e.entry_date) < midDate
    );
    const afterEntries = entries.filter(
      (e) => new Date(e.entry_date) >= midDate
    );

    // Calculate average metrics for each period
    const beforeAvg = calculateAverageMetrics(
      beforeEntries,
      experiment.metrics
    );
    const afterAvg = calculateAverageMetrics(afterEntries, experiment.metrics);

    // Calculate improvement
    const improvements = {};
    let totalImprovement = 0;

    experiment.metrics.forEach((metric) => {
      if (beforeAvg[metric] && afterAvg[metric]) {
        const improvement =
          ((afterAvg[metric] - beforeAvg[metric]) / beforeAvg[metric]) * 100;
        improvements[metric] = improvement;
        totalImprovement += improvement;
      }
    });

    const avgImprovement = totalImprovement / experiment.metrics.length;
    const success = avgImprovement >= (experiment.expected_improvement || 10);

    return {
      success,
      improvement: avgImprovement,
      improvements,
      insights: generateInsights(improvements, experiment),
    };
  };

  const calculatePhaseResults = (experiment, entries) => {
    const phaseGroups = {
      menstrual: [],
      follicular: [],
      ovulation: [],
      luteal: [],
    };

    entries.forEach((entry) => {
      if (entry.cycle_phase) {
        phaseGroups[entry.cycle_phase]?.push(entry);
      }
    });

    const results = {};
    Object.entries(phaseGroups).forEach(([phase, phaseEntries]) => {
      if (phaseEntries.length > 0) {
        results[phase] = calculateAverageMetrics(
          phaseEntries,
          experiment.metrics
        );
      }
    });

    return results;
  };

  const calculateSymptomImprovements = (targetSymptoms, entries) => {
    if (!targetSymptoms || targetSymptoms.length === 0) return {};

    const improvements = {};

    targetSymptoms.forEach((symptom) => {
      const symptomEntries = entries.map((entry) => {
        const symptomEntry = entry.symptom_entries?.find(
          (s) => s.symptom_name === symptom
        );
        return symptomEntry ? symptomEntry.severity : 0;
      });

      if (symptomEntries.length > 0) {
        const firstHalf = symptomEntries.slice(
          0,
          Math.floor(symptomEntries.length / 2)
        );
        const secondHalf = symptomEntries.slice(
          Math.floor(symptomEntries.length / 2)
        );

        const firstAvg =
          firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        improvements[symptom] = {
          before: firstAvg,
          after: secondAvg,
          improvement: ((firstAvg - secondAvg) / firstAvg) * 100,
        };
      }
    });

    return improvements;
  };

  const calculateAverageMetrics = (entries, metrics) => {
    const averages = {};

    metrics.forEach((metric) => {
      const values = entries
        .map((entry) => {
          switch (metric) {
            case "mood":
              return entry.mood_score || 0;
            case "energy":
              return entry.energy_level || 0;
            case "stress":
              return entry.stress_level || 0;
            case "sleep_hours":
              return entry.sleep_hours || 0;
            case "sleep_quality":
              return entry.sleep_quality || 0;
            case "hot_flash_count":
              return entry.hot_flash_count || 0;
            case "cramp_severity":
              return (
                entry.symptom_entries?.find((s) => s.symptom_name === "cramps")
                  ?.severity || 0
              );
            default:
              return 0;
          }
        })
        .filter((v) => v > 0);

      if (values.length > 0) {
        averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    return averages;
  };

  const generateInsights = (improvements, experiment) => {
    const insights = [];

    // Success insight
    const primaryMetric = experiment.metrics[0];
    const primaryImprovement = improvements[primaryMetric];

    if (primaryImprovement > experiment.expected_improvement) {
      insights.push({
        type: "success",
        message: `Excellent! Your ${primaryMetric} improved by ${Math.round(
          primaryImprovement
        )}%, exceeding expectations.`,
      });
    } else if (primaryImprovement > 0) {
      insights.push({
        type: "progress",
        message: `Good progress! Your ${primaryMetric} improved by ${Math.round(
          primaryImprovement
        )}%.`,
      });
    }

    // Symptom insights
    if (experiment.symptom_targets?.length > 0) {
      const improvedSymptoms = experiment.symptom_targets.filter(
        (symptom) => improvements[`${symptom}_severity`] < -10
      );

      if (improvedSymptoms.length > 0) {
        insights.push({
          type: "symptom",
          message: `Significant improvement in: ${improvedSymptoms.join(", ")}`,
        });
      }
    }

    // Life stage specific insights
    if (lifeStage === "perimenopause" && improvements.hot_flash_count < -20) {
      insights.push({
        type: "hormonal",
        message:
          "Notable reduction in hot flash frequency. This protocol works well for you!",
      });
    }

    return insights;
  };

  return {
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
  };
};
