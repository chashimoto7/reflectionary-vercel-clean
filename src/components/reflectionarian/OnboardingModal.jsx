// src/components/reflectionarian/OnboardingModal.jsx
import React, { useState } from "react";
import {
  Brain,
  Heart,
  MessageCircle,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const OnboardingModal = ({ isOpen, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    therapy_approach: "",
    communication_style: "",
    primary_focus: "",
    session_structure: "",
    experience_level: "",
    privacy_comfort: "",
  });

  const steps = [
    {
      title: "Welcome to Premium Reflectionarian",
      subtitle: "Let's personalize your experience",
      component: WelcomeStep,
    },
    {
      title: "Your Reflection Style",
      subtitle: "How do you prefer to explore your thoughts?",
      component: TherapyApproachStep,
    },
    {
      title: "Communication Preferences",
      subtitle: "What tone feels most comfortable for you?",
      component: CommunicationStep,
    },
    {
      title: "Focus Areas",
      subtitle: "What would you like to work on most?",
      component: FocusStep,
    },
    {
      title: "Session Structure",
      subtitle: "How do you prefer your conversations?",
      component: StructureStep,
    },
    {
      title: "Experience Level",
      subtitle: "How familiar are you with self-reflection practices?",
      component: ExperienceStep,
    },
    {
      title: "You're All Set!",
      subtitle: "Your Reflectionarian is ready to support your journey",
      component: CompletionStep,
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const preferences = {
      ...responses,
      tier: "premium",
      voice_enabled: true,
      weekly_reports: true,
      onboarding_completed: true,
      completed_at: new Date().toISOString(),
    };
    onComplete(preferences);
  };

  const updateResponse = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-300" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-purple-200 text-sm">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-white/60 hover:text-white/80 text-sm underline"
            >
              Skip setup
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto">
          <StepComponent
            responses={responses}
            updateResponse={updateResponse}
            currentStep={currentStep}
          />
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-white/50 text-sm">
            {currentStep + 1} of {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all"
          >
            {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep = () => (
  <div className="text-center py-8">
    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Sparkles className="w-12 h-12 text-white" />
    </div>
    <div className="space-y-4 text-white/90">
      <p className="text-lg">
        Welcome to your Premium Reflectionarian experience!
      </p>
      <p>
        In the next few minutes, we'll personalize your AI companion to match
        your unique needs and preferences.
      </p>
      <div className="bg-purple-600/20 rounded-lg p-4 mt-6">
        <p className="text-sm text-purple-200">
          🔒 <strong>Your Privacy:</strong> All responses are encrypted and
          stored securely. Only you can access your personalized settings.
        </p>
      </div>
    </div>
  </div>
);

const TherapyApproachStep = ({ responses, updateResponse }) => {
  const approaches = [
    {
      id: "cognitive_behavioral",
      name: "Cognitive Behavioral",
      description: "Focus on thoughts, feelings, and behaviors",
    },
    {
      id: "person_centered",
      name: "Person-Centered",
      description: "Warm, accepting, and non-judgmental approach",
    },
    {
      id: "mindfulness_based",
      name: "Mindfulness-Based",
      description: "Present-moment awareness and acceptance",
    },
    {
      id: "integrative",
      name: "Integrative",
      description: "Combines multiple approaches as needed",
    },
  ];

  return (
    <div className="space-y-4">
      {approaches.map((approach) => (
        <button
          key={approach.id}
          onClick={() => updateResponse("therapy_approach", approach.name)}
          className={`w-full p-4 rounded-lg text-left transition-all ${
            responses.therapy_approach === approach.name
              ? "bg-purple-600 text-white border border-purple-400"
              : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
          }`}
        >
          <div className="font-medium mb-1">{approach.name}</div>
          <div className="text-sm opacity-80">{approach.description}</div>
        </button>
      ))}
    </div>
  );
};

const CommunicationStep = ({ responses, updateResponse }) => {
  const styles = [
    {
      id: "warm_gentle",
      name: "Warm and Gentle",
      description: "Soft, nurturing, and encouraging",
    },
    {
      id: "direct_honest",
      name: "Direct and Honest",
      description: "Straightforward and clear communication",
    },
    {
      id: "warm_insightful",
      name: "Warm and Insightful",
      description: "Caring yet thought-provoking",
    },
    {
      id: "adaptive",
      name: "Adaptive",
      description: "Adjusts to your mood and needs in the moment",
    },
  ];

  return (
    <div className="space-y-4">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => updateResponse("communication_style", style.name)}
          className={`w-full p-4 rounded-lg text-left transition-all ${
            responses.communication_style === style.name
              ? "bg-purple-600 text-white border border-purple-400"
              : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
          }`}
        >
          <div className="font-medium mb-1">{style.name}</div>
          <div className="text-sm opacity-80">{style.description}</div>
        </button>
      ))}
    </div>
  );
};

const FocusStep = ({ responses, updateResponse }) => {
  const focuses = [
    {
      id: "emotional_wellbeing",
      name: "Emotional Wellbeing",
      description: "Processing feelings and emotional health",
    },
    {
      id: "personal_growth",
      name: "Personal Growth",
      description: "Self-improvement and development",
    },
    {
      id: "relationship_insights",
      name: "Relationship Insights",
      description: "Understanding connections with others",
    },
    {
      id: "stress_management",
      name: "Stress Management",
      description: "Coping with life's challenges",
    },
    {
      id: "holistic_growth",
      name: "Holistic Growth",
      description: "Overall life balance and fulfillment",
    },
  ];

  return (
    <div className="space-y-4">
      {focuses.map((focus) => (
        <button
          key={focus.id}
          onClick={() => updateResponse("primary_focus", focus.name)}
          className={`w-full p-4 rounded-lg text-left transition-all ${
            responses.primary_focus === focus.name
              ? "bg-purple-600 text-white border border-purple-400"
              : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
          }`}
        >
          <div className="font-medium mb-1">{focus.name}</div>
          <div className="text-sm opacity-80">{focus.description}</div>
        </button>
      ))}
    </div>
  );
};

const StructureStep = ({ responses, updateResponse }) => {
  const structures = [
    {
      id: "structured",
      name: "Structured",
      description: "Guided conversations with clear direction",
    },
    {
      id: "flexible",
      name: "Flexible",
      description: "Open-ended, follow your natural flow",
    },
    {
      id: "balanced",
      name: "Balanced",
      description: "Mix of structure and flexibility",
    },
  ];

  return (
    <div className="space-y-4">
      {structures.map((structure) => (
        <button
          key={structure.id}
          onClick={() => updateResponse("session_structure", structure.name)}
          className={`w-full p-4 rounded-lg text-left transition-all ${
            responses.session_structure === structure.name
              ? "bg-purple-600 text-white border border-purple-400"
              : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
          }`}
        >
          <div className="font-medium mb-1">{structure.name}</div>
          <div className="text-sm opacity-80">{structure.description}</div>
        </button>
      ))}
    </div>
  );
};

const ExperienceStep = ({ responses, updateResponse }) => {
  const levels = [
    {
      id: "beginner",
      name: "New to this",
      description: "Just starting my self-reflection journey",
    },
    {
      id: "some_experience",
      name: "Some experience",
      description: "I've done some reflection or therapy before",
    },
    {
      id: "experienced",
      name: "Experienced",
      description: "I regularly practice self-reflection",
    },
  ];

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => updateResponse("experience_level", level.name)}
          className={`w-full p-4 rounded-lg text-left transition-all ${
            responses.experience_level === level.name
              ? "bg-purple-600 text-white border border-purple-400"
              : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
          }`}
        >
          <div className="font-medium mb-1">{level.name}</div>
          <div className="text-sm opacity-80">{level.description}</div>
        </button>
      ))}
    </div>
  );
};

const CompletionStep = ({ responses }) => (
  <div className="text-center py-8">
    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Heart className="w-12 h-12 text-white" />
    </div>
    <div className="space-y-4 text-white/90">
      <p className="text-lg font-medium">
        Perfect! Your Reflectionarian is now personalized for you.
      </p>
      <div className="bg-white/10 rounded-lg p-4 text-left space-y-2">
        <p>
          <strong>Approach:</strong> {responses.therapy_approach}
        </p>
        <p>
          <strong>Style:</strong> {responses.communication_style}
        </p>
        <p>
          <strong>Focus:</strong> {responses.primary_focus}
        </p>
        <p>
          <strong>Structure:</strong> {responses.session_structure}
        </p>
      </div>
      <p className="text-sm text-purple-200">
        You can always update these preferences later in your settings.
      </p>
    </div>
  </div>
);

export default OnboardingModal;
