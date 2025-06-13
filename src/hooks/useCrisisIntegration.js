// src/hooks/useCrisisIntegration.js
// Simple crisis integration that works with your existing backend

import { useState } from "react";

export const useCrisisIntegration = () => {
  const [crisisState, setCrisisState] = useState({
    showModal: false,
    analysisResult: null,
    userLocation: null,
  });

  // Show crisis modal with analysis results
  const showCrisisModal = (analysisResult) => {
    setCrisisState({
      showModal: true,
      analysisResult,
      userLocation: null, // Will be determined by modal component
    });
  };

  // Close crisis modal
  const closeCrisisModal = () => {
    setCrisisState({
      showModal: false,
      analysisResult: null,
      userLocation: null,
    });
  };

  // Manual access to crisis resources
  const showCrisisResources = () => {
    showCrisisModal({
      level: "user_requested",
      score: 0,
      confidence: "high",
      should_alert: true,
    });
  };

  return {
    showModal: crisisState.showModal,
    analysisResult: crisisState.analysisResult,
    userLocation: crisisState.userLocation,
    showCrisisModal,
    closeCrisisModal,
    showCrisisResources,
  };
};

export default useCrisisIntegration;
